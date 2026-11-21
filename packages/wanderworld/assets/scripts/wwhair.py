"""What the hair styles share (make_hair.py): the hair texture, the heads they're fitted to, growing
strands over a head, turning strands into hair cards, the scalp cap, skin weights, shading and export.

Hair here is game hair made of cards: strips laid in layers over the head, each showing a clump of
strands from one greyscale texture whose alpha cuts the strands out (glTF alpha mode MASK), over a thin
cap on the scalp whose hairline fades out (alpha BLEND, drawn last, under the cards). The game tints
both through the base colour factor (material parts `hair` and `hair_cap`).

Positions are Blender's: metres, +Z up, the body facing -Y, feet at 0.
"""

import math
import os

import bpy
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree

HERE = os.path.dirname(os.path.abspath(__file__))
MODELS = os.path.join(os.path.dirname(HERE), "models")

SIZE = 1024
BROWN = 0x6B4A32  # the base colour factor the styles are exported with (the game sets its own)
CUTOFF = 0.5  # the cards' alpha test
MIN_OFF = 0.003  # how close a card comes to the skin (the cap lies at 0.002)

# The texture's regions, in pixels from the top left: (x, y, width, height). Card columns have the
# strands' roots at the top and their tips at the bottom.
REGIONS = {
    "dense": (0, 0, 128, 1024),
    "dense2": (128, 0, 128, 1024),
    "medium": (256, 0, 128, 1024),
    "wispy": (384, 0, 128, 1024),
    "curly": (512, 0, 128, 512),
    "solid": (640, 0, 128, 448),
    "band": (640, 448, 128, 64),
    "cap": (768, 0, 256, 512),
    "stubble": (512, 512, 512, 512),
}

# Head landmarks per body (see docs/AVATAR.md): eye level, chin, top of the scalp, the skull's front and
# back above the eyes, and where the neck meets the shoulders.
HEADS = {
    "male": dict(eye=1.680, chin=1.569, top=1.780, front=-0.149, back=0.041, shoulder=1.49, neck_back=0.040),
    "female": dict(eye=1.581, chin=1.481, top=1.679, front=-0.125, back=0.045, shoulder=1.395, neck_back=0.035),
}

# The hairline, as height above (or below) eye level by the angle round the head from the front (0) to
# the back (180): the forehead, the temples, the sideburns, over the ears, behind them, the nape.
HAIRLINE = {
    "male": [(0, 0.074), (20, 0.072), (32, 0.066), (42, 0.056), (50, 0.040), (58, 0.020), (66, 0.000),
             (74, -0.020), (82, -0.028), (88, -0.010), (92, 0.012), (100, 0.020), (110, 0.016), (118, -0.004),
             (126, -0.046), (136, -0.066), (150, -0.078), (165, -0.084), (180, -0.086)],
    "female": [(0, 0.072), (20, 0.071), (32, 0.068), (42, 0.060), (50, 0.046), (58, 0.028), (66, 0.008),
               (74, -0.010), (82, -0.016), (88, 0.000), (92, 0.018), (100, 0.026), (110, 0.022), (118, 0.002),
               (126, -0.040), (136, -0.060), (150, -0.072), (165, -0.078), (180, -0.080)],
}


def smoothstep(e0, e1, x):
    t = min(1.0, max(0.0, (x - e0) / (e1 - e0)))
    return t * t * (3 - 2 * t)


def lerp(a, b, t):
    return a + (b - a) * t


def hex_linear(h):
    def lin(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

    return [lin(((h >> s) & 255) / 255) for s in (16, 8, 0)]


# ── The texture ──


def _blur(a, r):
    """A box blur of radius r, twice (near Gaussian), wrapping round."""
    for _ in range(2):
        for axis in (0, 1):
            a = sum(np.roll(a, k, axis=axis) for k in range(-r, r + 1)) / (2 * r + 1)
    return a


class Painter:
    """Strands drawn into one region: premultiplied grey and alpha, composited front over back."""

    def __init__(self, w, h, wrap=False):
        self.w, self.h, self.wrap = w, h, wrap
        self.p = np.zeros((h, w))
        self.a = np.zeros((h, w))

    def under(self, alpha, grey):
        """A layer under everything drawn so far."""
        self.p = self.p + grey * alpha * (1 - self.a)
        self.a = self.a + alpha * (1 - self.a)

    def strand(self, ys, xs, width, alpha, grey):
        """A strand through (xs[i], ys[i]) per row, each a value or an array per row."""
        ys = np.asarray(ys, dtype=int)
        keep = (ys >= 0) & (ys < self.h)
        ys, xs = ys[keep], np.asarray(xs, dtype=float)[keep]
        width = np.broadcast_to(width, keep.shape)[keep] if np.ndim(width) else width
        alpha = np.broadcast_to(alpha, keep.shape)[keep] if np.ndim(alpha) else alpha
        grey = np.broadcast_to(grey, keep.shape)[keep] if np.ndim(grey) else grey
        xi = np.floor(xs).astype(int)
        for dx in range(-2, 3):
            xx = xi + dx
            d = (xx + 0.5 - xs) / width
            cov = alpha * np.exp(-2.2 * d * d)
            if self.wrap:
                xx = xx % self.w
                ok = np.ones_like(xx, dtype=bool)
            else:
                ok = (xx >= 0) & (xx < self.w)
            y, x, c = ys[ok], xx[ok], cov[ok]
            g = grey[ok] if np.ndim(grey) else grey
            self.p[y, x] = self.p[y, x] * (1 - c) + g * c
            self.a[y, x] = self.a[y, x] * (1 - c) + c

    def result(self):
        grey = np.where(self.a > 1e-4, self.p / np.maximum(self.a, 1e-4), 0)
        # Grey bled into the see-through texels, so filtering doesn't darken the strands' edges.
        pb, ab = _blur(self.p, 4), _blur(self.a, 4)
        fill = np.where(ab > 1e-4, pb / np.maximum(ab, 1e-4), 0.6)
        grey = np.where(self.a > 0.02, grey, fill)
        return np.clip(grey, 0, 1), np.clip(self.a, 0, 1)


def _card_column(rng, w, h, n, clumps, clump_k, tip_lo, tip_hi, width, bright, waves, drift, edge, alpha=0.95, root_spread=0.15):
    """A clump of strands: roots across the top, tips ragged towards the bottom, gathered into
    `clumps` sub-clumps towards their tips (by `clump_k`), denser in the middle."""
    pt = Painter(w, h)
    centres = rng.uniform(0.12, 0.88, clumps) * w
    shades = rng.uniform(0.84, 1.03, clumps)  # each lock a little lighter or darker
    order = []
    for _ in range(n):
        # Across: denser in the middle, thinning to the edges.
        u = rng.beta(edge, edge)
        x0 = 2 + u * (w - 4)
        y0 = rng.uniform(-0.02, root_spread) * h
        y1 = rng.uniform(tip_lo, tip_hi) ** 0.6 * h
        g = rng.uniform(*bright)
        order.append((g, x0, y0, y1))
    order.sort()  # darker strands first: they sit behind the brighter ones
    for g, x0, y0, y1 in order:
        ys = np.arange(int(y0), int(y1))
        if len(ys) < 4:
            continue
        t = (ys - y0) / max(1.0, y1 - y0)
        ci = np.argmin(np.abs(centres - x0))
        c = centres[ci] + rng.normal(0, 1.5)
        g = g * shades[ci]
        k = clump_k * rng.uniform(0.5, 1.0)
        lam = rng.uniform(*waves[1]) * h
        amp = rng.uniform(*waves[0])
        xs = (x0 + rng.uniform(-drift, drift) * t) * (1 - k * t * t) + c * k * t * t
        xs = xs + amp * np.sin(2 * math.pi * ys / lam + rng.uniform(0, 6.3))
        tip = np.clip((t - 0.78) / 0.22, 0, 1)
        wd = rng.uniform(*width) * (1 - 0.55 * tip)
        a = alpha * (1 - tip**1.6) * np.clip((ys - y0) / 60.0, 0, 1)  # (fading in at the root: no hard ends)
        # Along a strand: darker at the root (it's covered there), a little light and dark along it.
        gg = g * (1 + 0.06 * np.sin(ys / rng.uniform(15, 40) + rng.uniform(0, 6)))
        pt.strand(ys, xs, wd, a, gg)
    return pt.result()


def _curly_column(rng, w, h):
    """Coiled strands: each a tight wave about its own line, in a few clumps."""
    pt = Painter(w, h)
    for _ in range(170):
        x0 = 6 + rng.beta(1.8, 1.8) * (w - 12)
        y0 = rng.uniform(-0.02, 0.05) * h
        y1 = rng.uniform(0.7, 1.0) * h
        ys = np.arange(int(y0), int(y1))
        t = (ys - y0) / max(1.0, y1 - y0)
        lam = rng.uniform(55, 85)
        amp = rng.uniform(5, 11) * (1 - 0.3 * t)
        ph = rng.uniform(0, 6.3)
        xs = x0 + amp * np.sin(2 * math.pi * ys / lam + ph)
        # Where a coil turns (the wave's peaks) it faces the light: brighter.
        turn = np.abs(np.sin(2 * math.pi * ys / lam + ph))
        tip = np.clip((t - 0.8) / 0.2, 0, 1)
        g = rng.uniform(0.35, 0.85) * (0.75 + 0.25 * turn) * (0.65 + 0.35 * np.clip(ys / h / 0.15, 0, 1))
        pt.strand(ys, xs, rng.uniform(1.0, 1.6) * (1 - 0.5 * tip), 0.95 * (1 - tip**1.5), g)
    return pt.result()


def _solid(rng, w, h):
    """Strands with no gaps (for braids, buns and the ponytail's core): an opaque dark under-layer."""
    pt = Painter(w, h, wrap=True)
    for _ in range(700):
        x0 = rng.uniform(0, w)
        ys = np.arange(0, h)
        xs = x0 + rng.uniform(-6, 6) * ys / h + rng.uniform(0.3, 1.2) * np.sin(ys / rng.uniform(40, 120) + rng.uniform(0, 6))
        g = rng.uniform(0.45, 1.0) * (1 + 0.07 * np.sin(ys / rng.uniform(10, 30)))
        pt.strand(ys, xs, rng.uniform(0.9, 1.5), 0.9, g)
    pt.under(np.ones((h, w)), 0.32)
    return pt.result()


def _band(rng, w, h):
    """A hair tie: dark, with a soft sheen across and fine wraps."""
    y = np.linspace(-1, 1, h)[:, None]
    x = np.arange(w)[None, :]
    grey = 0.10 + 0.10 * (1 - y**2) + 0.03 * np.sin(x / 2.5)
    return np.broadcast_to(grey, (h, w)).copy(), np.ones((h, w))


def _cap(rng, w, h):
    """The scalp cap: dark, dense hair seen between the cards (no strong direction of its own, so
    it suits any parting), turning to fine strands that fade out over the last fifth towards the
    hairline (the bottom) so the hairline is soft (alpha BLEND). Wraps across."""
    v = (np.arange(h) / h)[:, None]
    fine = rng.random((h, w))
    streak = sum(np.roll(fine, k, axis=0) for k in range(-4, 5)) / 9
    streak = (streak - streak.mean()) / streak.std()
    patch = _blur(rng.random((h, w)), 5)
    patch = (patch - patch.mean()) / patch.std()
    grey = np.clip(0.36 + 0.05 * patch + 0.07 * streak * np.clip((v - 0.6) / 0.2, 0, 1), 0, 1)
    edge = np.clip((0.97 - v) / 0.13, 0, 1)
    a = np.clip(edge + 0.25 * streak * edge * (1 - edge), 0, 1)
    return grey, a


def _stubble(rng, w, h):
    """A buzz cut: fine short streaks running from the crown (top) towards the hairline (bottom),
    dense enough to read as a shadow of hair over the skin, fading out at the hairline. Wraps
    across. Alpha BLEND."""
    fine = rng.random((h, w))
    streak = sum(np.roll(fine, k, axis=0) for k in range(-2, 3)) / 5  # short streaks along the growth
    streak = (streak - streak.mean()) / streak.std()
    patch = _blur(rng.random((h, w)), 6)
    patch = (patch - patch.mean()) / patch.std()
    a = np.clip(0.84 + 0.07 * streak + 0.02 * patch, 0, 0.95)
    grey = np.clip(0.32 + 0.06 * streak, 0, 1)
    v = (np.arange(h) / h)[:, None]
    fade = np.clip((1.0 - v) / 0.16, 0, 1) ** 1.2
    fade = np.clip(fade + 0.12 * streak * fade * (1 - fade), 0, 1)
    return grey, a * fade


def texture(seed=7):
    """The hair texture: a SIZE x SIZE RGBA float array, the top row first."""
    rng = np.random.default_rng(seed)
    grey = np.full((SIZE, SIZE), 0.6)
    alpha = np.zeros((SIZE, SIZE))
    makers = {
        "dense": lambda w, h: _card_column(rng, w, h, 760, 9, 0.2, 0.8, 1.0, (0.7, 1.2), (0.4, 0.92), ((0.3, 1.2), (0.3, 0.9)), 4, 1.2),
        "dense2": lambda w, h: _card_column(rng, w, h, 700, 9, 0.3, 0.72, 1.0, (0.7, 1.3), (0.4, 0.92), ((0.3, 1.5), (0.25, 0.8)), 5, 1.3),
        "medium": lambda w, h: _card_column(rng, w, h, 420, 7, 0.45, 0.6, 1.0, (0.7, 1.2), (0.42, 0.94), ((0.3, 1.8), (0.25, 0.7)), 6, 1.5),
        "wispy": lambda w, h: _card_column(rng, w, h, 120, 7, 0.75, 0.35, 1.0, (0.7, 1.1), (0.5, 0.9), ((0.5, 2.5), (0.2, 0.6)), 10, 1.5, 0.9, 0.3),
        "curly": lambda w, h: _curly_column(rng, w, h),
        "solid": lambda w, h: _solid(rng, w, h),
        "band": lambda w, h: _band(rng, w, h),
        "cap": lambda w, h: _cap(rng, w, h),
        "stubble": lambda w, h: _stubble(rng, w, h),
    }
    for name, (x, y, w, h) in REGIONS.items():
        g, a = makers[name](w, h)
        grey[y : y + h, x : x + w] = g
        alpha[y : y + h, x : x + w] = a
    return np.stack([grey, grey, grey, alpha], axis=2)


def texture_image(rgba, name="hair"):
    _MATERIALS.clear()  # (a new scene: the old materials are gone)
    image = bpy.data.images.new(name, SIZE, SIZE, alpha=True)
    image.pixels.foreach_set(rgba[::-1].astype(np.float32).ravel())
    image.pack()
    return image


def region_uv(name, inset=2):
    """A region's UV rectangle: (u0, u1, v_top, v_bottom), inset a little against bleeding."""
    x, y, w, h = REGIONS[name]
    return ((x + inset) / SIZE, (x + w - inset) / SIZE, 1 - (y + inset) / SIZE, 1 - (y + h - inset) / SIZE)


# ── The head ──


class Head:
    """One body's head, from its GLB: where the scalp is, the hairline, and surfaces to keep hair
    off (the body as it is and with each shape key that moves the head, neck or shoulders)."""

    KEYS = ("ears_pointed", "jaw", "cheeks", "heavy", "muscle", "shoulders", "neck", "chest", "bust")

    def __init__(self, sex):
        self.sex = sex
        self.m = HEADS[sex]
        self.female = sex == "female"
        before = set(bpy.data.objects)
        bpy.ops.import_scene.gltf(filepath=os.path.join(MODELS, f"avatar-{sex}.glb"), bone_heuristic="BLENDER")
        new = set(bpy.data.objects) - before
        self.rig = next(o for o in new if o.type == "ARMATURE")
        body = next(o for o in new if o.type == "MESH" and o.name.startswith("avatar"))
        me = body.data
        kb = me.shape_keys.key_blocks

        def co(name):
            a = np.zeros(len(me.vertices) * 3)
            kb[name].data.foreach_get("co", a)
            return a.reshape(-1, 3)

        basis = co("Basis")
        mats = [m.name.split(".")[0] for m in me.materials]
        solid = {mats.index(n) for n in ("skin", "underwear", "lips", "eye_white") if n in mats}
        zmin = self.m["shoulder"] - 0.35
        polys = [list(p.vertices) for p in me.polygons if p.material_index in solid and basis[p.vertices[0], 2] > zmin]
        skull = [p for p, mi in zip(me.polygons, range(len(me.polygons))) if p.material_index == mats.index("skin")]
        skull = [list(p.vertices) for p in skull if basis[p.vertices[0], 2] > self.m["chin"] - 0.05]
        self.skull = BVHTree.FromPolygons([Vector(v) for v in basis], skull)
        self.base = BVHTree.FromPolygons([Vector(v) for v in basis], polys)
        self.polys = polys
        self.shape = {"body": basis}
        self.colliders = [self.base]
        self.margin = [0.0]  # more room round some shapes: pointed ear tips are thin and poke between cards
        self.keyed = {}
        for k in self.KEYS:
            if k in kb:
                kc = co(k)
                self.shape[k] = kc
                self.keyed[k] = BVHTree.FromPolygons([Vector(v) for v in kc], polys)
                self.colliders.append(self.keyed[k])
                self.margin.append(0.0)
        for o in new:
            if o is not self.rig:
                bpy.data.objects.remove(o)
        self.rig.animation_data_clear()
        self.rig.name = f"avatar-{sex}-rig"
        m = self.m
        self.C = Vector((0.0, (m["front"] + m["back"]) / 2, m["eye"] + 0.012))
        self._hairline_table()

    # Directions round the head: az in degrees (0 the front, +90 the body's left, +X), el up from level.
    @staticmethod
    def direction(az, el):
        a, e = math.radians(az), math.radians(el)
        return Vector((math.sin(a) * math.cos(e), -math.cos(a) * math.cos(e), math.sin(e)))

    def angles(self, p):
        d = (Vector(p) - self.C).normalized()
        return math.degrees(math.atan2(d.x, -d.y)), math.degrees(math.asin(max(-1, min(1, d.z))))

    def scalp(self, az, el):
        """The point on the skin in a direction from the head's centre, and its normal."""
        d = self.direction(az, el)
        loc, nor, _, _ = self.skull.ray_cast(self.C, d, 0.5)
        if loc is None:
            loc, nor, _, _ = self.base.ray_cast(self.C, d, 0.5)
        if nor.dot(d) < 0:
            nor = -nor
        return loc, nor

    def _hairline_table(self):
        table = HAIRLINE[self.sex]
        self.hl = {}
        for az in range(0, 181, 2):
            dz = np.interp(az, [t[0] for t in table], [t[1] for t in table])
            target = self.m["eye"] + dz
            lo, hi = -70.0, 80.0
            for _ in range(28):
                mid = (lo + hi) / 2
                if self.scalp(az, mid)[0].z < target:
                    lo = mid
                else:
                    hi = mid
            self.hl[az] = (lo + hi) / 2

    def hairline(self, az):
        """The hairline's elevation at an angle round the head."""
        a = min(180.0, abs(((az + 180) % 360) - 180))
        i = int(a // 2) * 2
        j = min(180, i + 2)
        return lerp(self.hl[i], self.hl[j], (a - i) / 2)

    def hairline_z(self, az):
        """The hairline's height at an angle round the head."""
        a = min(180.0, abs(((az + 180) % 360) - 180))
        if not hasattr(self, "_hz"):
            self._hz = {i: self.scalp(i, self.hl[i])[0].z for i in self.hl}
        i = int(a // 2) * 2
        j = min(180, i + 2)
        return lerp(self._hz[i], self._hz[j], (a - i) / 2)

    def nearest(self, p, bvh=None):
        loc, nor, _, d = (bvh or self.base).find_nearest(p, 1.0)
        return loc, nor, d

    def collide(self, p, off, rounds=2):
        """p pushed out until it's at least `off` above every collider's surface."""
        p = Vector(p)
        for _ in range(rounds):
            for bvh, extra in zip(self.colliders, self.margin):
                loc, nor, _, _ = bvh.find_nearest(p, 0.3)
                if loc is None:
                    continue
                s = (p - loc).dot(nor)
                want = off + extra if extra and off >= 0.002 else off
                if s < want:
                    p = p + nor * (want - s)
        return p

    def outward(self, p):
        """Away from the body at p: from the nearest point on the skin, or the head's centre close by."""
        loc, nor, d = self.nearest(p)
        if loc is None:
            return (p - self.C).normalized()
        v = p - loc
        return (v.normalized() if v.length > 1e-4 else nor).lerp(nor, 0.5).normalized()


# ── Strands and cards ──


class Groom:
    """A hair style being built on one head: cards, the cap, and solid pieces, in one mesh."""

    def __init__(self, head, seed=1):
        self.h = head
        self.rng = np.random.default_rng(seed)
        self.verts, self.norms, self.uvs, self.faces, self.mat = [], [], [], [], []
        self.face_card = []
        self.card_count = 0
        self.lock_head = []  # per vertex: True when it must follow the head whatever its height

    # Strands

    def tangent(self, v, n):
        t = v - n * v.dot(n)
        return t.normalized() if t.length > 1e-6 else v.normalized()

    def grow(self, p0, comb, length, segs, off0=0.003, off1=0.008, lift=0.0, stiff=0.35, grav=0.0, grav_from=0.0, comb_fn=None, stop=None, hug=True, cling=0.0, hug_below=-1.0):
        """A strand from a root on the scalp: combed along `comb` over the head (or `comb_fn(p, s)`),
        `off0`..`off1` off the body, falling with `grav` past `grav_from` of its length. Over the scalp
        it lies at that height (`hug`); past the hairline it's only kept from going inside."""
        h = self.h
        p0 = Vector(p0)
        _, n0, _ = h.nearest(p0)
        n0 = (p0 - h.C).normalized().lerp(n0, 0.7).normalized()
        d = (self.tangent(Vector(comb), n0) + n0 * lift).normalized()
        seg = length / segs
        pts = [p0 + n0 * off0 * 0.4]
        p = pts[0]
        for k in range(segs):
            s = (k + 1) / segs
            off = lerp(off0, off1, s)
            _, n, dn = h.nearest(p)
            want = Vector(comb_fn(p, s)) if comb_fn else Vector(comb)
            # Along the surface when on it; hanging free, just the way it's combed.
            t = self.tangent(want, n) if dn is not None and dn < off + 0.012 else want.normalized()
            g = grav * smoothstep(grav_from, 1.0, s) if grav else 0.0
            d = (d * stiff + t * (1 - stiff) + Vector((0, 0, -g))).normalized()
            q = p + d * seg
            if hug:
                az, el = h.angles(q)
                if el > h.hairline(az) - 4 and q.z > hug_below:
                    loc, nor, dist = h.nearest(q, h.skull)
                    if loc is not None and dist < off + 0.025:
                        # Lifted at the root (`lift`), settling onto the layer further out.
                        want_off = off + lift * seg * max(0.0, 1.5 - k)
                        q = loc + (q - loc).normalized() * max(dist if dist < want_off else want_off, 1e-4)
                elif cling:
                    # Off the scalp, drawn back towards the body (over the ears, under the jaw).
                    loc, nor, dist = h.nearest(q)
                    if loc is not None and off < dist < off + 0.05:
                        q = q.lerp(loc + (q - loc).normalized() * off, cling)
            q = h.collide(q, off)
            q = p + (q - p).normalized() * seg
            q = h.collide(q, off * 0.9, rounds=1)
            if stop and stop(q):
                break
            d = (q - p).normalized()
            pts.append(q)
            p = q
        return pts

    @staticmethod
    def smooth(pts, rounds=2, keep=1):
        pts = [Vector(p) for p in pts]
        for _ in range(rounds):
            new = pts[:]
            for i in range(keep, len(pts) - 1):
                new[i] = pts[i] * 0.5 + (pts[i - 1] + pts[i + 1]) * 0.25
            pts = new
        return pts

    @staticmethod
    def simplify(pts, max_len, max_turn=0.32):
        """Fewer points along a strand: one where it bends by more than `max_turn` radians since the
        last kept point, or every `max_len` along it where it runs straight."""
        out = [pts[0]]
        run = 0.0
        last_dir = (pts[1] - pts[0]).normalized()
        for i in range(1, len(pts) - 1):
            run += (pts[i] - pts[i - 1]).length
            d = (pts[i + 1] - pts[i]).normalized()
            if run >= max_len or last_dir.angle(d, 0.0) > max_turn:
                out.append(pts[i])
                run = 0.0
                last_dir = (pts[i + 1] - pts[i]).normalized()
        out.append(pts[-1])
        return out

    @staticmethod
    def resample(pts, n):
        """The polyline as n + 1 points evenly along it."""
        pts = [Vector(p) for p in pts]
        L = [0.0]
        for a, b in zip(pts, pts[1:]):
            L.append(L[-1] + (b - a).length)
        total = L[-1]
        out = []
        j = 0
        for i in range(n + 1):
            s = total * i / n
            while j < len(L) - 2 and L[j + 1] < s:
                j += 1
            f = (s - L[j]) / max(1e-9, L[j + 1] - L[j])
            out.append(pts[j].lerp(pts[j + 1], min(1.0, max(0.0, f))))
        return out

    # Geometry

    def _add(self, verts, norms, uvs, faces, mat, card=True, lock=None):
        base = len(self.verts)
        self.verts += verts
        self.norms += norms
        self.uvs += uvs
        self.lock_head += lock if lock is not None else [False] * len(verts)
        cid = self.card_count if card else -1
        for f in faces:
            self.faces.append([i + base for i in f])
            self.mat.append(mat)
            self.face_card.append(cid)
        self.card_count += 1

    def card(self, pts, width, column="dense", tip_width=None, cols=3, bend=0.18, segs=None, twist=0.0, v0=None, normals=None, side=None, shade_round=0.12, lock=False):
        """A hair card along a strand: `width` across at the root narrowing to `tip_width`, the
        strip bent down at its edges (so they tuck under), facing away from the body."""
        if segs:
            pts = self.resample(pts, segs)
        n = len(pts)
        if n < 2:
            return
        tip_width = width * 0.55 if tip_width is None else tip_width
        u0, u1, vt, vb = region_uv(column)
        if v0 is None:
            v0 = self.rng.uniform(0.0, 0.08)
        if self.rng.random() < 0.5:
            u0, u1 = u1, u0  # mirrored: more variety from the same columns
        L = [0.0]
        for a, b in zip(pts, pts[1:]):
            L.append(L[-1] + (b - a).length)
        verts, norms, uvs = [], [], []
        out = normals or [self.h.outward(p) for p in pts]
        out = self.smooth(out, 2, keep=0) if not normals else out
        for i, p in enumerate(pts):
            t = (pts[min(i + 1, n - 1)] - pts[max(i - 1, 0)]).normalized()
            N = out[i]
            N = (N - t * N.dot(t)).normalized()
            S = side[i] if side else t.cross(N).normalized()
            if twist:
                a = twist * L[i] / max(L[-1], 1e-6)
                S, N = (S * math.cos(a) + N * math.sin(a)), (N * math.cos(a) - S * math.sin(a))
            s = L[i] / max(L[-1], 1e-6)
            w = lerp(width, tip_width, s**1.3)
            v = lerp(vt - (vt - vb) * v0, vb, s)
            for j in range(cols):
                f = j / (cols - 1) * 2 - 1
                dip = f * f * w * bend if cols > 2 else 0.0
                # (Never inside the body or under the cap.)
                verts.append(self.h.collide(p + S * (f * w / 2) - N * dip, MIN_OFF, rounds=1))
                norms.append((N + S * (f * shade_round)).normalized())
                uvs.append((lerp(u0, u1, (f + 1) / 2), v))
        faces = []
        for i in range(n - 1):
            for j in range(cols - 1):
                a, b = i * cols + j, (i + 1) * cols + j
                faces.append([a, a + 1, b + 1, b])
        self._add(verts, norms, uvs, faces, 0, lock=[lock] * len(verts))

    def tube(self, pts, radii, sides=8, column="solid", flat=1.0, up=None, u_turns=1.0, v_scale=1.0, mat=0, cap_end=False):
        """A solid piece round a curve (a braid's strand, a bun's coil, a tie): `radii` per point,
        `flat` squashing it across `up`. The texture runs along it."""
        n = len(pts)
        u0, u1, vt, vb = region_uv(column)
        L = [0.0]
        for a, b in zip(pts, pts[1:]):
            L.append(L[-1] + (b - a).length)
        verts, norms, uvs = [], [], []
        prev_side = None
        for i, p in enumerate(pts):
            t = (pts[min(i + 1, n - 1)] - pts[max(i - 1, 0)]).normalized()
            ref = up[i] if up else (prev_side if prev_side is not None else Vector((0, 0, 1)))
            a = (ref - t * ref.dot(t))
            if a.length < 1e-5:
                a = Vector((1, 0, 0)) - t * t.x
            a.normalize()
            b = t.cross(a).normalized()
            prev_side = a
            r = radii[i] if hasattr(radii, "__len__") else radii
            for j in range(sides + 1):
                ang = 2 * math.pi * j / sides
                off = a * math.cos(ang) * r * flat + b * math.sin(ang) * r
                verts.append(p + off)
                norms.append((a * math.cos(ang) / max(flat, 0.2) + b * math.sin(ang)).normalized())
                # Along the length the texture repeats every few cm (mirrored, so it has no seam).
                vv = (L[i] * v_scale) % 2.0
                vv = vv if vv <= 1 else 2 - vv
                uvs.append((lerp(u0, u1, j / sides), lerp(vt, vb, vv)))
        faces = []
        for i in range(n - 1):
            for j in range(sides):
                a0, b0 = i * (sides + 1) + j, (i + 1) * (sides + 1) + j
                faces.append([a0, b0, b0 + 1, a0 + 1])
        self._add(verts, norms, uvs, faces, mat, card=True, lock=None)

    def cap(self, rings=16, segments=48, offset=0.002, region="cap", fade=1.5, keep=None, mat=1):
        """The scalp cap from the crown to the hairline: `rings` rings down to `fade` degrees inside
        the hairline, then one more as far outside it, where the texture fades out (a soft edge)."""
        h = self.h
        u0, u1, vt, vb = region_uv(region, inset=3)
        verts, norms, uvs, faces = [], [], [], []
        top, tn = h.scalp(0, 89.5)
        idx = {}
        for i in range(1, rings + 2):
            for j in range(segments + 1):
                az = -180 + 360 * j / segments
                if i <= rings:
                    t = i / rings
                    el = lerp(90.0, h.hairline(az) + fade, t**0.85)
                    v = 0.86 * t
                else:
                    el = h.hairline(az) - fade
                    v = 1.0
                p, nrm = h.scalp(az, el)
                q = h.collide(p + nrm * offset, offset)
                idx[(i, j)] = len(verts)
                verts.append(q)
                norms.append(nrm)
                uvs.append((lerp(u0, u1, j / segments), lerp(vt, vb, v)))
        rings += 1
        centre = len(verts)
        verts.append(h.collide(top + tn * offset, offset))
        norms.append(tn)
        uvs.append(((u0 + u1) / 2, vt))
        for j in range(segments):
            faces.append([centre, idx[(1, j)], idx[(1, j + 1)]])
        for i in range(1, rings):
            for j in range(segments):
                faces.append([idx[(i, j)], idx[(i + 1, j)], idx[(i + 1, j + 1)], idx[(i, j + 1)]])
        # Facing out: the crown's fan decides the winding.
        a, b, c = (verts[k] for k in faces[0])
        if (b - a).cross(c - a).dot(tn) < 0:
            faces = [f[::-1] for f in faces]
        if keep:
            faces = [f for f in faces if keep(sum((verts[k] for k in f), Vector()) / len(f))]
        self._add(verts, norms, uvs, faces, mat, card=False, lock=[True] * len(verts))

    # Roots

    def roots(self, spacing, where, n=6000, margin=1.0, el_range=(-60, 90)):
        """Points on the scalp about `spacing` apart, where `where(az, el)` holds, inside the
        hairline by `margin` degrees. Returns [(point, az, el)]."""
        h = self.h
        out = []
        pts = np.zeros((0, 3))
        lo, hi = math.sin(math.radians(el_range[0])), math.sin(math.radians(el_range[1]))
        for _ in range(n):
            az = self.rng.uniform(-180, 180)
            el = math.degrees(math.asin(self.rng.uniform(lo, hi)))
            if el < h.hairline(az) + margin or not where(az, el):
                continue
            p, _ = h.scalp(az, el)
            if len(pts) and np.min(np.sum((pts - np.array(p)) ** 2, axis=1)) < spacing * spacing:
                continue
            pts = np.vstack([pts, np.array(p)])
            out.append((p, az, el))
        return out

    def past_hairline(self, overshoot=0.005):
        """A `stop` for grow(): true once a strand is `overshoot` metres below the hairline."""
        h = self.h

        def stop(q):
            az, _ = h.angles(q)
            return q.z < h.hairline_z(az) - overshoot

        return stop

    def hairline_roots(self, az_from, az_to, step, inset=1.0):
        h = self.h
        out = []
        az = az_from
        while az <= az_to + 1e-6:
            a = az + self.rng.uniform(-step * 0.3, step * 0.3)
            el = h.hairline(a) + inset
            p, _ = h.scalp(a, el)
            out.append((p, a, el))
            az += step
        return out

    def flow(self, field, where, width, off0, off1, length, segs_per_m=60, spacing=0.006, upstream=0.025, column=("dense", "dense2"),
             stop=None, first=None, order=None, grav=0.0, grav_from=0.5, cols=3, cover=0.42, tip_width=None, lift=0.0, max_cards=400,
             cling=0.0, first_width=None, hug_below=-1.0):
        """Cards that cover the scalp where `where(az, el)` holds, each flowing along `field(p)` (a
        direction at a point) until `stop` or `length`. Seeds from `first` ([(point, ...)]) go first;
        then each spot still bare (the highest first, or by `order(az, el)`) gets a card rooted a little
        upstream of it, so its root tucks under the hair above and its tip ends at the hairline."""
        h = self.h
        cands = self.roots(spacing, where, n=40000, margin=0.5)
        P = np.array([tuple(c[0]) for c in cands])
        rank = np.array([order(c[1], c[2]) if order else c[2] for c in cands])
        bare = np.ones(len(P), dtype=bool)
        made = 0

        def lay(root, comb_root, width=width):
            nonlocal made
            # (Grown in steps of about a centimetre, so it follows the head; fewer points for the card.)
            pts = self.grow(root, comb_root, length, max(4, int(length / 0.01)), off0, off1, comb_fn=lambda p, s: field(p),
                            stop=stop, grav=grav, grav_from=grav_from, lift=lift, cling=cling, hug_below=hug_below)
            if len(pts) < 3:
                return False
            # (A strand that has sprung away from the head is a stray: left out.)
            for q in pts:
                if q.z > h.m["eye"]:
                    _, _, dq = h.nearest(q)
                    if dq is not None and dq > off1 + 0.035:
                        return False
            pts = self.smooth(pts, 2)
            L = sum((b - a).length for a, b in zip(pts, pts[1:]))
            self.card(self.simplify(pts, 1.0 / segs_per_m), width * self.rng.uniform(0.9, 1.1), self.rng.choice(column), cols=cols,
                      tip_width=tip_width)
            Q = np.array([tuple(q) for q in self.resample(pts, max(4, int(L / 0.004)))])
            d = np.min(np.linalg.norm(P[:, None, :] - Q[None, :, :], axis=2), axis=1)
            bare[d < width * cover] = False
            made += 1
            return True

        for seed in first or []:
            lay(Vector(seed[0]), field(Vector(seed[0])), first_width or width)
        tries = 0
        while bare.any() and made < max_cards and tries < 4 * max_cards:
            tries += 1
            i = int(np.argmax(np.where(bare, rank, -1e9)))
            p = Vector(P[i])
            root = p
            if upstream > 0:
                f0 = field(p).normalized()

                def inside(q):
                    # Not past the hairline, nor over a part (where the combing turns round).
                    az_q, el_q = h.angles(q)
                    return el_q < h.hairline(az_q) + 0.5 or field(q).normalized().dot(f0) < 0.4

                back = self.grow(p, -field(p), upstream, 3, 0.0, 0.0, comb_fn=lambda q, s: -field(q), stop=inside)
                root = back[-1] if len(back) > 1 else p
                _, az_r, el_r = None, *h.angles(root)
                if el_r < h.hairline(az_r) + 0.5:
                    root = back[max(0, len(back) - 2)]
                loc, _, _ = h.nearest(root, h.skull)
                root = loc if loc is not None else root
            lay(root, field(root))
            if bare[i] and root is not p:
                lay(p, field(p))  # (the card from upstream went another way: one from the spot itself)
            bare[i] = False
        print(f"  flow: {made} cards", flush=True)
        return made

    # Finishing

    def weights(self):
        """Per vertex {bone: weight}: the head, then down the neck to the upper back for hair that
        hangs below the chin."""
        m = self.h.m
        out = []
        for p, lock in zip(self.verts, self.lock_head):
            if lock:
                out.append({"Head": 1.0})
                continue
            z = p.z
            head = smoothstep(m["chin"] - 0.15, m["chin"] + 0.02, z)
            # Close to the skull it moves with the head however low it is (sideburns, the nape).
            _, _, d = self.h.nearest(p, self.h.skull)
            if d is not None and d < 0.03 and z > m["chin"] - 0.03:
                head = max(head, 1 - smoothstep(0.02, 0.03, d))
            spine = 1 - smoothstep(m["shoulder"] - 0.14, m["shoulder"] + 0.01, z)
            spine = min(spine, 1 - head)
            neck = max(0.0, 1 - head - spine)
            w = {k: v for k, v in (("Head", head), ("neck_01", neck), ("spine_03", spine)) if v > 0.01}
            total = sum(w.values())
            out.append({k: v / total for k, v in w.items()})
        return out

    def occlusion(self, rays=24, reach=0.04, strength=0.7):
        """Per vertex light (0-1): darker where other hair or the body is close over it."""
        hair = BVHTree.FromPolygons(self.verts, self.faces)
        rng = np.random.default_rng(3)
        dirs = rng.normal(size=(rays, 3))
        dirs /= np.linalg.norm(dirs, axis=1)[:, None]
        # Which card each vertex belongs to, so a card doesn't shade itself.
        vcard = [-2] * len(self.verts)
        for f, c in zip(self.faces, self.face_card):
            for i in f:
                vcard[i] = c
        out = []
        for i, (p, n) in enumerate(zip(self.verts, self.norms)):
            hits, total = 0.0, 0.0
            for d in dirs:
                d = Vector(d)
                c = d.dot(n)
                if c < 0.25:
                    d = -d
                    c = -c
                if c < 0.25:
                    continue
                total += c
                o = p + d * 0.0015
                loc, _, fi, dist = hair.ray_cast(o, d, reach)
                if loc is not None and (self.face_card[fi] != vcard[i] or vcard[i] < 0):
                    hits += c * (0.55 + 0.45 * (1 - dist / reach))
                    continue
                loc, _, _, dist = self.h.base.ray_cast(o, d, reach)
                if loc is not None:
                    hits += c * 0.8
            occ = hits / total if total else 0
            floor = 0.72 if vcard[i] < 0 else 0.3  # (the cap shows at the hairline: not too dark)
            out.append(max(floor, 1 - strength * occ))
        # Smoothed over each card, so it shades as one lock rather than in patches.
        nbrs = [set() for _ in self.verts]
        for f in self.faces:
            for i in f:
                nbrs[i].update(f)
        out = np.array(out)
        for _ in range(4):
            out = np.array([0.5 * out[i] + 0.5 * out[list(nb)].mean() for i, nb in enumerate(nbrs)])
        return list(out)

    def resolve_targets(self):
        out = {"body": self.h.base}
        for k in ("ears_pointed", "jaw", "cheeks"):
            if k in self.h.keyed:
                out[k] = self.h.keyed[k]
        return out

    def overlaps(self):
        idx = [i for i, m in enumerate(self.mat) if m == 0]
        cards = BVHTree.FromPolygons(self.verts, [self.faces[i] for i in idx])
        return {k: len(cards.overlap(b)) for k, b in self.resolve_targets().items()}

    def resolve(self, rounds=40, step=0.0015):
        """Cards whose faces cut through the head (a pointed ear's tip poking between a card's
        corners, the jaw), nudged out until none do."""
        idx = [i for i, m in enumerate(self.mat) if m == 0]
        for _ in range(rounds):
            cards = BVHTree.FromPolygons(self.verts, [self.faces[i] for i in idx])
            moved = {}
            for key, bvh in self.resolve_targets().items():
                co = self.h.shape[key]
                for fi, fj in cards.overlap(bvh):
                    # Away from the face of skin it cuts.
                    poly = self.h.polys[fj]
                    a, b, c = (Vector(co[poly[0]]), Vector(co[poly[1]]), Vector(co[poly[2]]))
                    nor = (b - a).cross(c - a)
                    if nor.length < 1e-12:
                        continue
                    nor.normalize()  # (the body's faces wind outwards)
                    for v in self.faces[idx[fi]]:
                        moved[v] = moved.get(v, Vector()) + nor
            if not moved:
                return
            for v, nor in moved.items():
                self.verts[v] = self.verts[v] + nor.normalized() * step

    def build(self, name, image):
        """The mesh object: UVs, normals, vertex shading, materials, skin weights on the head's rig."""
        self.resolve()
        me = bpy.data.meshes.new(name)
        me.from_pydata([tuple(v) for v in self.verts], [], self.faces)
        me.polygons.foreach_set("material_index", self.mat)
        me.polygons.foreach_set("use_smooth", [True] * len(self.faces))
        uv = me.uv_layers.new(name="UVMap")
        loop_uv = []
        for poly in me.polygons:
            for li in poly.loop_indices:
                loop_uv += self.uvs[me.loops[li].vertex_index]
        uv.data.foreach_set("uv", loop_uv)
        light = self.occlusion()
        col = me.color_attributes.new("Color", "FLOAT_COLOR", "POINT")
        col.data.foreach_set("color", [c for l in light for c in (l, l, l, 1.0)])
        me.validate()
        me.normals_split_custom_set_from_vertices([tuple(n) for n in self.norms])
        hits = self.overlaps()
        print(f"  {name}: card faces still through the skin {hits}", flush=True)
        for m in materials(image):
            me.materials.append(m)
        obj = bpy.data.objects.new(name, me)
        bpy.context.scene.collection.objects.link(obj)
        rig = self.h.rig
        groups = {b: obj.vertex_groups.new(name=b) for b in ("Head", "neck_01", "spine_03")}
        for i, w in enumerate(self.weights()):
            for b, v in w.items():
                groups[b].add([i], v, "REPLACE")
        obj.parent = rig
        obj.modifiers.new("Armature", "ARMATURE").object = rig
        return obj


_MATERIALS = {}


def materials(image):
    """`hair` (the cards, alpha test: glTF MASK) and `hair_cap` (the cap, alpha BLEND), both the
    texture's grey times the vertex shading times the base colour (mid brown, for the game to set)."""
    if image.name in _MATERIALS:
        return _MATERIALS[image.name]
    out = []
    for name in ("hair", "hair_cap"):
        m = bpy.data.materials.new(name)
        m.use_nodes = True
        m.use_backface_culling = False
        nodes, links = m.node_tree.nodes, m.node_tree.links
        bsdf = nodes.get("Principled BSDF")
        bsdf.inputs["Roughness"].default_value = 0.8
        tex = nodes.new("ShaderNodeTexImage")
        tex.image = image
        vc = nodes.new("ShaderNodeVertexColor")
        vc.layer_name = "Color"
        shade = nodes.new("ShaderNodeMix")
        shade.data_type = "RGBA"
        shade.blend_type = "MULTIPLY"
        shade.inputs["Factor"].default_value = 1.0
        links.new(tex.outputs["Color"], shade.inputs["A"])
        links.new(vc.outputs["Color"], shade.inputs["B"])
        tint = nodes.new("ShaderNodeMix")
        tint.data_type = "RGBA"
        tint.blend_type = "MULTIPLY"
        tint.inputs["Factor"].default_value = 1.0
        links.new(shade.outputs["Result"], tint.inputs["A"])
        tint.inputs["B"].default_value = (*hex_linear(BROWN), 1.0)
        links.new(tint.outputs["Result"], bsdf.inputs["Base Color"])
        if name == "hair":
            # alpha >= CUTOFF: exported as glTF alpha mode MASK with this cutoff
            less = nodes.new("ShaderNodeMath")
            less.operation = "LESS_THAN"
            less.inputs[1].default_value = CUTOFF
            links.new(tex.outputs["Alpha"], less.inputs[0])
            inv = nodes.new("ShaderNodeMath")
            inv.operation = "SUBTRACT"
            inv.inputs[0].default_value = 1.0
            links.new(less.outputs[0], inv.inputs[1])
            links.new(inv.outputs[0], bsdf.inputs["Alpha"])
            m.surface_render_method = "DITHERED"
        else:
            links.new(tex.outputs["Alpha"], bsdf.inputs["Alpha"])
            m.surface_render_method = "BLENDED"
        out.append(m)
    _MATERIALS[image.name] = out
    return out


def export(path, objects, rigs):
    bpy.ops.object.select_all(action="DESELECT")
    for o in list(objects) + list(rigs):
        o.select_set(True)
    bpy.context.view_layer.objects.active = rigs[0]
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        use_selection=True,
        export_animations=False,
        export_skins=True,
        export_morph=False,
        export_yup=True,
        export_normals=True,
        export_texcoords=True,
        export_materials="EXPORT",
        export_vertex_color="MATERIAL",
        export_image_format="AUTO",
    )

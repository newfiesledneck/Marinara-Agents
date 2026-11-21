"""Hair styles for the base avatar (avatar-male.glb and avatar-female.glb): one GLB per style,
assets/models/avatar-hair-<style>.glb, holding two meshes, `male` and `female`, each fitted to that
body's head and skinned to its skeleton (the people's bones). Run (BLENDER: your Blender executable;
add `-- short long` for some of them):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_hair.py

Game hair made of cards (`wwhair.py`): layered strips showing clumps of strands from one greyscale
1024 px texture, cut out by its alpha (glTF alpha mode MASK, cutoff 0.5), over a thin scalp cap whose
hairline fades out (alpha BLEND). Material parts `hair` and `hair_cap`, both mid brown for the game to
tint. A vertex colour darkens hair under other hair. Hair on the head is weighted wholly to `Head`;
hair that hangs below the chin blends to `neck_01` and then `spine_03`.

Made by ThatOneCan, fitted to the avatar bodies (MakeHuman's CC0 base mesh).
"""

import math
import os
import sys
import zlib

import bpy
import numpy as np
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import wwhair as wh  # noqa: E402


def V(x, y, z):
    return Vector((x, y, z))


def mix(a, b, t):
    return a.lerp(b, max(0.0, min(1.0, t)))


# ── Styles: each fills a Groom on one head ──


def short(g):
    """A neat short cut: short at the back and sides, a few centimetres on top combed back and a
    little to the side, lifting at the front."""
    h, r = g.h, g.rng
    g.cap()
    sweep = 0.3  # towards +X
    stop = g.past_hairline(0.006)

    def field(p):
        az, el = h.angles(p)
        top = wh.smoothstep(18, 50, el)
        return mix(V(0, 0.4, -1), V(sweep, 1.0, 0.05), top)

    front = g.hairline_roots(-52, 52, 4.5, inset=1.0)
    # The base, covering the scalp close to it: tips only at the hairline.
    g.flow(field, lambda az, el: True, 0.026, 0.0022, 0.0045, 0.16, first=front, stop=stop, segs_per_m=45)
    # The top, fuller, lifting at the front and overhanging the sides a little.
    g.flow(field, lambda az, el: el > 20, 0.028, 0.008, 0.014, 0.15, first=front[1::2], stop=stop, cover=0.5,
           column=("dense2", "medium"), lift=0.6, segs_per_m=45)
    g.flow(field, lambda az, el: el > 32, 0.024, 0.013, 0.019, 0.12, first=front[2::3], stop=stop, cover=0.6,
           column=("medium",), lift=0.8, max_cards=16, segs_per_m=45)
    # A few loose strands on top.
    for p, az, el in g.roots(0.035, lambda az, el: el > 30, margin=4):
        pts = g.grow(p, field(p), 0.06, 5, 0.012, 0.016, comb_fn=lambda q, s: field(q), stop=stop)
        if len(pts) >= 3:
            g.card(g.smooth(pts), 0.016, "wispy", cols=2)
    # The hairline: short wisps all round it, softening the edge.
    for p, az, el in g.hairline_roots(-180, 180, 6.5, inset=-0.6):
        L = 0.035 if abs(az) < 55 else 0.022
        pts = g.grow(p, field(p), L, 3, 0.0024, 0.004, comb_fn=lambda q, s: field(q), stop=g.past_hairline(0.004))
        if len(pts) >= 2:
            g.card(pts, 0.014, "wispy", cols=2, v0=0.0)


def cut(g, table, overshoot=0.0):
    """A `stop` for strands: below the height `table` gives for the angle round the head,
    [(angle, height)], heights measured from eye level."""
    h = g.h
    eye = h.m["eye"]

    def stop(q):
        az, _ = h.angles(q)
        a = abs(az)
        z = eye + float(np.interp(a, [t[0] for t in table], [t[1] for t in table]))
        return q.z < z - overshoot

    return stop


def parted(g):
    """A side part, medium length: swept across the top from a part on the left, over the tops of
    the ears and down to the nape, a soft sweep at the front."""
    h, r = g.h, g.rng
    m = h.m
    g.cap()
    xp = 0.032  # the part, towards the body's left (+X)
    nape = h.hairline_z(180) - m["eye"]
    stop = cut(g, [(0, 0.03), (35, 0.02), (60, -0.02), (80, -0.04), (110, -0.05), (150, nape - 0.012), (180, nape - 0.02)])

    def field(p):
        az, el = h.angles(p)
        side = -1.0 if p.x < xp else 1.0
        down = wh.smoothstep(45, 5, el) if side < 0 else wh.smoothstep(60, 25, el)
        front = wh.smoothstep(-70, -20, -abs(az)) * (side < 0)
        across = V(side, 0.15 - 0.45 * front, 0)
        return mix(across, V(0, 0.2, -1), down)

    part = [h.scalp(*h.angles(V(xp + dx, y, h.C.z + 0.2)))[0] for y in np.linspace(h.m["front"] + 0.03, h.C.y + 0.02, 8) for dx in (-0.007, 0.006)]
    seeds = [(p,) for p in part]
    g.flow(field, lambda az, el: True, 0.028, 0.0022, 0.006, 0.26, first=seeds, stop=stop, segs_per_m=40, lift=0.3, cling=0.5)
    g.flow(field, lambda az, el: el > 5, 0.03, 0.008, 0.015, 0.24, first=seeds[::2], stop=stop, cover=0.55,
           column=("dense2", "medium"), segs_per_m=40, lift=0.5, cling=0.4)
    g.flow(field, lambda az, el: el > 25, 0.026, 0.013, 0.02, 0.2, first=seeds[1::2], stop=stop, cover=0.7,
           column=("medium",), segs_per_m=40, lift=0.6, max_cards=18, cling=0.3)
    for p, az, el in g.hairline_roots(-180, 180, 7.0, inset=-0.6):
        if 62 < abs(az) < 135:
            continue  # (round the ears the longer hair covers the hairline)
        pts = g.grow(p, field(p), 0.03, 3, 0.0024, 0.004, comb_fn=lambda q, s: field(q), stop=stop, cling=0.5)
        if len(pts) >= 2:
            g.card(pts, 0.014, "wispy", cols=2, v0=0.0)


def long(g):
    """Long hair past the shoulders, parted in the middle, falling behind the shoulders with a few
    locks in front framing the face."""
    h, r = g.h, g.rng
    m = h.m
    g.cap()
    sh = m["shoulder"] - m["eye"]
    crown = h.scalp(180, 62)[0]
    low = cut(g, [(0, sh - 0.10), (40, sh - 0.12), (90, sh - 0.14), (140, sh - 0.17), (180, sh - 0.18)])
    face_y = m["front"] + 0.04

    def in_face(q):
        return q.y < m["front"] + 0.065 and abs(q.x) < 0.07 and q.z < m["eye"] + 0.035

    def stop(q):
        return low(q) or in_face(q) or abs(q.x) > 0.15  # (nor out along the shoulders)

    def field(p):
        az, el = h.angles(p)
        side = 1.0 if p.x >= 0 else -1.0
        top = wh.smoothstep(25, 60, el)
        _, _, dist = h.nearest(p, h.skull)
        on_head = el > h.hairline(az) - 2 and p.z > m["eye"] - 0.06 and dist is not None and dist < 0.03
        forward = wh.smoothstep(-70, -40, -abs(az))  # locks falling in front of the shoulders
        if not on_head:
            # Straight down, drawn in a little towards the body, never across the face.
            d = V(0, 0.1 - 0.3 * forward, -1)
            if p.z < m["shoulder"] + 0.04 and abs(p.x) > 0.07:
                d += V(-side * 0.25, 0.5 if p.y > -0.02 else -0.5, 0)
            if p.y < face_y + 0.02 and abs(p.x) < 0.08:
                d += V(side * 0.6, 0.2, 0)
            return d
        back = wh.smoothstep(105, 140, abs(az))  # behind the crown the part ends: away from the crown, then down
        away = p - crown
        away.z = min(away.z, 0) - 0.03
        over = mix(V(side, 0.15, -0.1), V(side * 0.2, 0.2, -1), 1 - top)
        return mix(over, away.normalized(), back)

    part = [h.scalp(*h.angles(V(x, y, h.C.z + 0.2)))[0] for y in np.linspace(h.m["front"] + 0.012, h.C.y + 0.07, 9) for x in (-0.006, 0.006)]
    seeds = [(p,) for p in part]
    kw = dict(stop=stop, segs_per_m=12, grav=0.5, grav_from=0.25, hug_below=m["eye"] - 0.02)
    g.flow(field, lambda az, el: True, 0.038, 0.0022, 0.011, 0.6, first=seeds, tip_width=0.05, cover=0.3, **kw)
    g.flow(field, lambda az, el: el > 0, 0.042, 0.008, 0.019, 0.6, first=seeds[::2], cover=0.55, column=("dense2", "medium"),
           tip_width=0.05, **kw)
    g.flow(field, lambda az, el: el > 30, 0.032, 0.013, 0.025, 0.55, first=seeds[1::2], cover=0.8, column=("medium", "wispy"),
           max_cards=10, **kw)


def bob(g):
    """A chin-length bob with a full fringe, the ends turning in a little."""
    h, r = g.h, g.rng
    m = h.m
    g.cap()
    crown = h.scalp(180, 62)[0]
    chin = m["chin"] - m["eye"]
    fringe_cut = cut(g, [(0, 0.036), (30, 0.034), (50, 0.02), (60, -0.01), (70, chin + 0.01)])
    low = cut(g, [(0, chin - 0.005), (60, chin), (120, chin + 0.012), (180, chin + 0.016)])
    face_y = m["front"] + 0.035

    def stop(q):
        return low(q) or (q.y < face_y and abs(q.x) < 0.058 and q.z < m["eye"] + 0.045)
    axis = V(0, h.C.y + 0.01, 0)

    def in_fringe(az, el):
        return abs(az) < 50 and el > h.hairline(az) and el < 62

    def field(p):
        az, el = h.angles(p)
        if in_fringe(az, el) or (abs(az) < 50 and p.z > m["eye"] and p.y < m["front"] + 0.04):
            return V(0.15 * np.sign(p.x), -1, -0.35)
        away = p - crown
        away.z = min(away.z, 0) - 0.04
        if abs(az) < 70:  # the front of the head: to the sides, never over the face
            away = V(np.sign(p.x) * 1.0, 0.1, -0.6)
        d = away.normalized()
        # Near the ends, curving in under the jaw and the back of the head.
        end = wh.smoothstep(m["chin"] + 0.06, m["chin"] + 0.01, p.z)
        inward = -(V(p.x, p.y - axis.y, 0)).normalized()
        return d + inward * 0.6 * end

    fseeds = [(h.scalp(az, 64)[0],) for az in np.linspace(-45, 45, 9)]
    g.flow(field, in_fringe, 0.024, 0.003, 0.009, 0.14, first=fseeds, stop=fringe_cut, segs_per_m=45, upstream=0.0,
           order=lambda az, el: el)
    rest = lambda az, el: not in_fringe(az, el)  # noqa: E731
    kw = dict(stop=stop, segs_per_m=34, grav=0.25, grav_from=0.3, cling=0.25)
    g.flow(field, rest, 0.032, 0.003, 0.012, 0.3, tip_width=0.04, cover=0.35, **kw)
    g.flow(field, lambda az, el: rest(az, el) and el > 10, 0.034, 0.010, 0.019, 0.3, cover=0.55, column=("dense2", "medium"),
           tip_width=0.04, **kw)
    g.flow(field, in_fringe, 0.022, 0.009, 0.013, 0.14, first=fseeds[1::2], stop=fringe_cut, cover=0.7, segs_per_m=45,
           column=("dense2", "medium"), upstream=0.0)


def frames(pts, up=None):
    """A frame along a curve: per point (tangent, a, b), a and b across it, carried along without
    twisting (starting from `up`)."""
    out = []
    a = None
    for i, p in enumerate(pts):
        t = (pts[min(i + 1, len(pts) - 1)] - pts[max(i - 1, 0)]).normalized()
        if a is None:
            ref = up if up is not None else V(0, 0, 1)
            a = ref - t * ref.dot(t)
            if a.length < 1e-5:
                a = V(1, 0, 0) - t * t.x
        else:
            a = a - t * a.dot(t)
        a.normalize()
        out.append((t, a, t.cross(a).normalized()))
    return out


def pulled(g, target, near, width=0.03, extra_layer=True):
    """The scalp's hair combed tight towards `target` (a ponytail's tie, a bun, a braid's top),
    stopping `near` it, from the hairline all round."""
    h = g.h
    g.cap()

    eye = h.m["eye"]

    def field(p):
        d = (target - p).normalized()
        # Up and over the ears (pointed ones too) rather than through them.
        if abs(p.x) > 0.05 and p.z < eye + 0.05 and -0.075 < p.y < 0.035:
            d += V(0, 0.2, 0.9) * wh.smoothstep(0.05, 0.065, abs(p.x))
        return d

    def stop(q):
        return (q - target).length < near

    def order(az, el):
        return -((h.scalp(az, el)[0] - target).length)

    seeds = g.hairline_roots(-180, 180, 4.5, inset=-0.7)
    g.flow(field, lambda az, el: True, width, 0.0022, 0.0035, 0.3, first=seeds, stop=stop, segs_per_m=40, upstream=0.0, order=order,
           first_width=0.015)
    if extra_layer:
        g.flow(field, lambda az, el: True, width + 0.004, 0.0045, 0.006, 0.3, first=seeds[::2], stop=stop, segs_per_m=40,
               upstream=0.0, cover=0.75, column=("dense2", "medium"), order=order)
    # A few fine strands at the hairline, pulled back too.
    for p, az, el in g.hairline_roots(-180, 180, 9.0, inset=-0.5):
        pts = g.grow(p, field(p), 0.03, 3, 0.0024, 0.0035, comb_fn=lambda q, s: field(q), stop=stop)
        if len(pts) >= 2:
            g.card(pts, 0.012, "wispy", cols=2, v0=0.0)


def tie_point(h, az, el, out=0.012):
    p, n = h.scalp(az, el)
    return p + n * out, n


def bundle(g, centre, radius, n_around=6, crossing=2, column=("dense", "dense2"), tip=0.25):
    """A gathered lock of hair round a curve (a ponytail, a braid's tuft): cards round its surface
    facing out, and a couple crossing through the middle. `radius(s)` for s 0..1 along it."""
    fr = frames(centre)
    L = [0.0]
    for a, b in zip(centre, centre[1:]):
        L.append(L[-1] + (b - a).length)
    total = L[-1]
    r = g.rng
    for k in range(n_around):
        th = 2 * math.pi * (k + r.uniform(-0.2, 0.2)) / n_around
        pts, norms, sides = [], [], []
        for (t, a, b), p, l in zip(fr, centre, L):
            rad = radius(l / total)
            d = a * math.cos(th) + b * math.sin(th)
            pts.append(p + d * rad * 0.55)
            norms.append(d)
            sides.append(t.cross(d).normalized())
        w = radius(0.3) * 2 * math.pi / n_around * 1.5
        g.card(pts, w, r.choice(column), tip_width=w * tip, normals=norms, side=sides, bend=0.22, shade_round=0.25)
    for k in range(crossing):
        th = math.pi * k / max(1, crossing) + 0.4
        pts, norms, sides = [], [], []
        for (t, a, b), p in zip(fr, centre):
            d = a * math.cos(th) + b * math.sin(th)
            pts.append(Vector(p))
            sides.append(d)
            norms.append(t.cross(d).normalized())
        w = radius(0.3) * 2.2
        g.card(pts, w, r.choice(column), tip_width=w * tip, normals=norms, side=sides, bend=0.0, cols=3)


def band(g, centre, axis, radius, length=0.012):
    """A hair tie: a short dark tube round `axis` at `centre`."""
    pts = [centre - axis * (length / 2), centre, centre + axis * (length / 2)]
    g.tube(pts, [radius * 0.92, radius, radius * 0.92], sides=12, column="band", v_scale=0)


def ponytail(g):
    """A ponytail tied high at the back of the head, falling to between the shoulder blades."""
    h = g.h
    T, n = tie_point(h, 180, 16, 0.010)
    pulled(g, T, 0.016)
    axis = (n + V(0, 0, -0.5)).normalized()
    band(g, T, axis, 0.0155)
    start = T + axis * 0.008
    # Out of the tie, then falling against the back of the neck and the upper back.
    centre = g.grow(start, axis, 0.34, 17, 0.024, 0.028, stiff=0.6, hug=False,
                    comb_fn=lambda p, s: axis if s < 0.1 else V(0, -0.45, -1))
    centre = g.smooth(centre, 3)

    def radius(s):
        return 0.026 + 0.022 * math.sin(math.pi * min(1.0, s / 0.45)) * (1 - s) ** 0.3 - 0.016 * s**2

    bundle(g, centre, radius, n_around=8, crossing=3, tip=0.45)


def buns(g):
    """A twisted bun high at the back of the head."""
    h, r = g.h, g.rng
    B, n = tie_point(h, 180, 44, -0.002)
    pulled(g, B, 0.024)
    e1 = (V(1, 0, 0) - n * n.x).normalized()
    e2 = n.cross(e1).normalized()
    Rb = 0.031
    centre = B + n * (Rb * 0.72)
    # The core: a ball of hair, its strands running round it.
    rings, segs = 7, 12
    u0, u1, vt, vb = wh.region_uv("solid")
    verts, norms, uvs, faces = [], [], [], []
    for i in range(rings + 1):
        ph = math.pi * i / rings
        for j in range(segs + 1):
            th = 2 * math.pi * j / segs
            d = n * math.cos(ph) + (e1 * math.cos(th) + e2 * math.sin(th)) * math.sin(ph)
            verts.append(centre + d * Rb * 0.92)
            norms.append(d)
            uvs.append((wh.lerp(u0, u1, i / rings), wh.lerp(vt, vb, j / segs)))
    for i in range(rings):
        for j in range(segs):
            a0, b0 = i * (segs + 1) + j, (i + 1) * (segs + 1) + j
            faces.append([a0, a0 + 1, b0 + 1, b0])
    g._add(verts, norms, uvs, faces, 0)
    # Wound over it: ribbons of hair round the ball at different tilts, a bit loose.
    for k in range(9):
        tilt = r.uniform(0.2, 1.2)
        spin = 2 * math.pi * k / 9 + r.uniform(-0.3, 0.3)
        axis = (n * math.cos(tilt) + (e1 * math.cos(spin) + e2 * math.sin(spin)) * math.sin(tilt)).normalized()
        a_ = axis.cross(n if abs(axis.dot(n)) < 0.95 else e1).normalized()
        b_ = axis.cross(a_)
        start = r.uniform(0, 6.28)
        sweep = r.uniform(3.6, 5.2)
        pts, nrm = [], []
        for i in range(13):
            th = start + sweep * i / 12
            d = a_ * math.cos(th) + b_ * math.sin(th)
            pts.append(centre + d * Rb * (1.02 + 0.03 * math.sin(i)))
            nrm.append(d)
        g.card(pts, r.uniform(0.022, 0.03), r.choice(("dense", "dense2")), tip_width=0.012, normals=nrm, bend=0.15, cols=3)
    band(g, B + n * 0.004, n, 0.017, 0.01)


def braid(g):
    """One long braid down the back, the hair pulled back to it at the nape."""
    h = g.h
    T, n = tie_point(h, 180, -2, 0.012)
    pulled(g, T, 0.02)
    axis = (n * 0.6 + V(0, 0, -1)).normalized()
    centre = g.grow(T, axis, 0.42, 30, 0.017, 0.015, stiff=0.6, hug=False, comb_fn=lambda p, s: V(0, -0.45, -1))
    centre = g.resample(g.smooth(centre, 3), 50)
    L = [0.0]
    for a, b in zip(centre, centre[1:]):
        L.append(L[-1] + (b - a).length)
    total = L[-1]
    outs = [h.outward(p) for p in centre]
    lam = 0.062
    for k in range(3):
        pts, ups, radii = [], [], []
        for i, p in enumerate(centre):
            s = L[i] / total
            t = (centre[min(i + 1, len(centre) - 1)] - centre[max(i - 1, 0)]).normalized()
            out = (outs[i] - t * outs[i].dot(t)).normalized()
            side = t.cross(out).normalized()
            ph = 2 * math.pi * L[i] / lam + 2 * math.pi * k / 3
            a = (0.0125 - 0.006 * s) * min(1.0, 0.45 + s * 6)
            pts.append(p + side * a * math.sin(ph) + out * 0.0055 * (1 - 0.5 * s) * math.sin(2 * ph))
            ups.append(out)
            radii.append((0.0092 - 0.0042 * s) * min(1.0, 0.6 + s * 5))
        g.tube(pts, radii, sides=6, flat=0.7, up=ups, v_scale=9.0)
    end = centre[-1]
    t_end = (centre[-1] - centre[-2]).normalized()
    band(g, end, t_end, 0.0068, 0.008)
    tuft = g.grow(end + t_end * 0.004, t_end, 0.07, 5, 0.01, 0.01, hug=False, grav=0.5)
    bundle(g, tuft, lambda s: 0.007 + 0.006 * math.sin(math.pi * min(1, s * 1.4)), n_around=4, crossing=2, tip=0.2)


def curly(g):
    """Short curls: a curly under-layer close to the head and springy ringlets over it, close
    enough together to read as one curly mass."""
    h, r = g.h, g.rng
    g.cap()
    crown = h.scalp(170, 70)[0]

    def field(p):
        away = p - crown
        away.z = min(away.z, 0) - 0.03
        return away.normalized()

    stop = g.past_hairline(0.004)
    g.flow(field, lambda az, el: True, 0.032, 0.003, 0.009, 0.06, stop=stop, segs_per_m=40, column=("curly",), cover=0.5, cols=2)
    for p, az, el in g.roots(0.0135, lambda az, el: True, margin=0.5):
        _, nrm = h.scalp(az, el)
        down = wh.smoothstep(40, -10, el)
        A = (nrm * (0.35 - 0.15 * down) + field(p) * (1.0 + 0.4 * down)).normalized()
        e1 = (A.cross(V(0, 0, 1)) if abs(A.z) < 0.9 else A.cross(V(1, 0, 0))).normalized()
        e2 = A.cross(e1)
        R = r.uniform(0.0045, 0.0055)
        L = r.uniform(0.02, 0.026) * wh.lerp(0.75, 1.0, wh.smoothstep(-20, 30, el))
        turns = r.uniform(1.4, 1.7)
        th0 = r.uniform(0, 6.28)
        pts, norms, sides = [], [], []
        n = 8
        base = p + nrm * 0.006
        for i in range(n):
            u = i / (n - 1)
            th = th0 + 2 * math.pi * turns * u
            rad = e1 * math.cos(th) + e2 * math.sin(th)
            pts.append(base + A * (L * u) + rad * R * (0.4 + 0.6 * min(1, u * 3)))
            norms.append((rad + A * 0.3).normalized())
            sides.append(A)
        g.card(pts, r.uniform(0.012, 0.015), "curly", tip_width=0.009, normals=norms, side=sides, cols=2, bend=0.0, shade_round=0.0)


def shaved(g):
    """A buzz cut: only a fine stubble on a thin cap, the scalp showing through."""
    g.cap(rings=14, segments=64, region="stubble", fade=2.0)


def mohawk(g):
    """A mohawk: the sides shaved to stubble and a crest down the middle, swept back."""
    h, r = g.h, g.rng
    g.cap(rings=14, segments=64, region="stubble", fade=2.0)
    stations = 26
    for i in range(stations + 1):
        t = i / stations
        el = wh.lerp(h.hairline(0) + 2, 150, t)  # over the top: past 90 it's the back
        a, e = (0, el) if el <= 90 else (180, 180 - el)
        for xo in (-0.014, -0.004, 0.006, 0.016):
            xo += r.uniform(-0.003, 0.003)
            p0, _ = h.scalp(a, e)
            loc, nrm, _ = h.nearest(p0 + V(xo, 0, 0), h.skull)
            nrm = (loc - h.C).normalized().lerp(nrm, 0.5).normalized()
            back = (V(0, 1, 0) - nrm * nrm.y).normalized()  # along the head towards the back
            height = 0.035 + 0.065 * math.sin(math.pi * min(1.0, t / 0.8)) ** 0.8
            if t > 0.8:
                height *= wh.smoothstep(1.05, 0.8, t)
            height *= r.uniform(0.85, 1.1)
            lean = V(math.copysign(0.18, xo) if abs(xo) > 0.008 else 0, 0, 0)
            pts = []
            for k in range(6):
                u = k / 5
                d = (nrm * (1 - 0.55 * u) + back * (0.35 + 0.9 * u) + lean).normalized()
                pts.append(loc + nrm * 0.002 + d * height * u)
            sides = [back] * len(pts)
            norms = [V(math.copysign(1, xo + 1e-6), 0, 0)] * len(pts)
            g.card(pts, 0.032, r.choice(("dense", "dense2", "medium")), tip_width=0.012, side=sides, normals=norms,
                   cols=3, bend=0.12, shade_round=0.2, twist=r.uniform(-0.4, 0.4))


# (Short, long, ponytail, braid, curly and bob come from MakeHuman's pack now: make_mh_hair.py. These are
# only the styles it hasn't got.)
STYLES = {
    "parted": parted,
    "buns": buns,
    "shaved": shaved,
    "mohawk": mohawk,
}


def make(style):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    image = wh.texture_image(wh.texture())
    objects, rigs = [], []
    for sex in ("male", "female"):
        head = wh.Head(sex)
        g = wh.Groom(head, seed=zlib.crc32(f"{style}-{sex}".encode()))
        STYLES[style](g)
        obj = g.build(sex, image)
        objects.append(obj)
        rigs.append(head.rig)
        print(f"{style} {sex}: {len(obj.data.vertices)} vertices, {len(obj.data.polygons)} faces", flush=True)
    path = os.path.join(wh.MODELS, f"avatar-hair-{style}.glb")
    wh.export(path, objects, rigs)
    print(f"wrote {path} ({os.path.getsize(path) / 1e6:.2f} MB)", flush=True)


if __name__ == "__main__":
    which = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else list(STYLES)
    for s in which:
        make(s)

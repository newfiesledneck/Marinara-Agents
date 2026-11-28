"""Strand hair grown from a recipe, for the Realistic body (make_realistic.py runs this inside Blender).

A style is thousands of strands, each a line of points from a root on the scalp. Here they are grown instead
of read from the character's files: a root is picked on the scalp, the strand leaves it the way the recipe
combs it, turns to hang as it gets longer, and is kept off the head and body it meets (so it lies on them).
Then it is waved or curled, drawn into locks with its neighbours, and roughened a little. A recipe can also
gather the hair to a point behind the head and let it go on from there as a tail, a braid or a bun.

Everything is in the character's own space: metres, +Z up, -Y the way it faces, +X its left.
Made by ThatOneCan for this package; CC0.
"""

import math

import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from mathutils.kdtree import KDTree

DOWN = np.array([0.0, 0.0, -1.0])
FACE_HALF = 0.066  # metres from the face's middle line that hair hanging in front of it is moved aside to
RAW = 24  # points a grown strand has before it is made a ribbon, unless a call says


def unit(v):
    return v / (np.linalg.norm(v, axis=-1, keepdims=True) + 1e-12)


class Head:
    """The scalp to grow from and the body to keep off: `shape` (every vertex), `faces` (the skin's),
    `scalp` (for every vertex, how much of it is scalp, 0…1), `normals` (every vertex's) and `eyes` (the
    height of the eyes: hair is kept from falling across the face under the brows)."""

    def __init__(self, shape, faces, scalp, normals, eyes):
        self.brows = eyes + 0.024
        self.shape = shape
        self.faces = faces
        self.normals = normals
        self.patches = {}  # a patch's name → (its marks, evened; its triangles; their areas)
        self.tree = BVHTree.FromPolygons([Vector(p) for p in shape], [list(face) for face in faces])
        self.patch("scalp", scalp)
        scalp = self.patches["scalp"][0]
        own = shape[scalp > 0.5]
        # (The middle of the skull: between the scalp's sides and ends, a hand under its top.)
        self.centre = np.array([0.0, (own[:, 1].min() + own[:, 1].max()) / 2, own[:, 2].max() - 0.1])
        self.top = own[:, 2].max()
        self.crown = np.array([0.0, self.centre[1] + 0.045, self.top - 0.012])
        self.scalp = scalp

    def patch(self, name, marks):
        """A patch of skin hair may grow on, by `name`: `marks` says for every vertex how much it is of it, 0…1.
        (The character's masks are painted roughly at their edges, a point here and there in or out: evened out
        over each point's neighbours, so the edge they give is a line.) Kept with its triangles, to pick roots
        on by area and by how much each is of the patch."""
        marks = np.asarray(marks, dtype=np.float64).copy()
        beside = {}
        for face in self.faces:
            if max(marks[i] for i in face) > 0:
                for a, b in zip(face, face[1:] + face[:1]):
                    beside.setdefault(a, set()).add(b)
                    beside.setdefault(b, set()).add(a)
        for _ in range(4):
            evened = marks.copy()
            for point, others in beside.items():
                evened[point] = 0.4 * marks[point] + 0.6 * sum(marks[other] for other in others) / len(others)
            marks = evened
        corners = []
        for face in self.faces:
            if max(marks[i] for i in face) <= 0.02:
                continue
            for k in range(1, len(face) - 1):
                corners.append((face[0], face[k], face[k + 1]))
        corners = np.array(corners)
        a, b, c = (self.shape[corners[:, k]] for k in range(3))
        self.patches[name] = (marks, corners, np.linalg.norm(np.cross(b - a, c - a), axis=1) / 2)

    def clear_of_face(self, point):
        """`point` moved aside, to the side it is on, if it lies in front of the face under the brows."""
        if point[2] > self.brows or point[1] > self.centre[1] - 0.075 or abs(point[0]) > FACE_HALF:
            return point
        return np.array([FACE_HALF if point[0] >= 0 else -FACE_HALF, point[1], point[2]])

    def roots(self, count, seed, keep=None, edge=(0.3, 0.1), on="scalp"):
        """`count` roots on a patch (`on`, the scalp unless said): (points, normals). A root is kept where its
        place is of the patch, and where `keep(points)` says. `edge`: the least it must be of it, over the
        forehead and elsewhere (the character marks the sides and nape of its scalp faintly, and its forehead's
        edge firmly), or one number for both, with a narrow band over that where the hair thins to its edge."""
        rng = np.random.default_rng(seed)
        marks, corners, areas = self.patches[on]
        points = np.zeros((0, 3))
        normals = np.zeros((0, 3))
        for _ in range(200):
            if len(points) >= count:
                break
            pick = rng.choice(len(corners), size=count * 2, p=areas / areas.sum())
            u, v = rng.random(len(pick)), rng.random(len(pick))
            over = u + v > 1
            u[over], v[over] = 1 - u[over], 1 - v[over]
            w = np.stack([1 - u - v, u, v], axis=1)
            tri = corners[pick]
            at = sum(self.shape[tri[:, k]] * w[:, k : k + 1] for k in range(3))
            n = unit(sum(self.normals[tri[:, k]] * w[:, k : k + 1] for k in range(3)))
            much = sum(marks[tri[:, k]] * w[:, k] for k in range(3))
            if np.isscalar(edge):
                least = np.full(len(pick), float(edge))
            else:
                least = np.where(at[:, 1] < self.centre[1] - 0.045, edge[0], edge[1])
            ok = (much > least) & (rng.random(len(pick)) < np.clip((much - least) / 0.03, 0.4, 1))
            if keep is not None:
                ok &= keep(at)
            points = np.vstack([points, at[ok]])
            normals = np.vstack([normals, n[ok]])
        return points[:count], normals[:count]

    def off(self, point, clear):
        """`point` kept `clear` off the skin: where it is, or pushed out along the skin; and the skin's normal there."""
        location, normal, _index, _distance = self.tree.find_nearest(Vector(point))
        if location is None:
            return point, None
        normal = np.array(normal)
        over = float((point - np.array(location)) @ normal)
        if over >= clear:
            return point, normal if over < 0.03 else None
        return point + (clear - over) * normal, normal


# ── Ways to comb: which way a strand lies as it leaves the head, for a point on it ──


def comb_down():
    return lambda p, head: DOWN


def comb_back(drop=0.35):
    return lambda p, head: unit(np.array([0.0, 1.0, -drop]))


def comb_forward(drop=0.5):
    return lambda p, head: unit(np.array([0.0, -1.0, -drop]))


def comb_crown(drop=0.25):
    """Out from the crown every way, as short hair grows."""
    return lambda p, head: unit(unit(p - head.crown) * np.array([1, 1, 0.4]) + np.array([0.0, 0.0, -drop]))


def comb_part(x=0.0, back=0.25, drop=0.55):
    """To either side of a parting `x` metres from the middle. Behind the crown the hair goes less and less
    aside and more down the back, so the parting ends there and the back of the head is covered."""

    def comb(p, head):
        aside = float(np.clip(1 - (p[1] - head.crown[1] + 0.01) / 0.05, 0.12, 1))
        return unit(np.array([(1.0 if p[0] > x else -1.0) * aside, back + (1 - aside) * 0.8, -drop]))

    return comb


def comb_side(to=1.0, back=0.1, drop=0.3):
    """All of it to one side (`to`: 1 the character's left, -1 its right)."""
    return lambda p, head: unit(np.array([to, back, -drop]))


def comb_beard(mouth):
    """How beard hair lies (`mouth`: its half width, `top` and `bottom` heights, and the `chin`'s, metres): on
    the upper lip down and out from the middle; under the jaw forward, so it runs down the neck; on the cheeks
    and jaw down and a little forward, towards the chin."""

    def comb(p, head):
        side = 1.0 if p[0] >= 0 else -1.0
        if p[2] > mouth["top"] - 0.003 and abs(p[0]) < mouth["wide"] + 0.014:
            # (Out from the middle by how far from it a hair grows: the two halves meet under the nose.)
            return unit(np.array([side * 0.6 * min(1.0, abs(p[0]) / 0.02), -0.3, -1.0]))
        if p[2] < mouth["chin"] and p[1] > mouth["front"] + 0.03:
            return unit(np.array([0.0, -0.8, -0.6]))
        return unit(np.array([-side * 0.12, -0.3, -1.0]))

    return comb


def comb_up():
    return lambda p, head: unit(p - head.centre)


def comb_mix(first, second, where):
    """`first` where `where(p, head)` is 0, `second` where it is 1, a mix between."""

    def comb(p, head):
        t = float(np.clip(where(p, head), 0, 1))
        return unit(first(p, head) * (1 - t) + second(p, head) * t)

    return comb


def fringe(depth=0.045):
    """How much a root is fringe: 1 at the front hairline, 0 `depth` behind it and further."""
    return lambda p, head: 1 - (p[1] - (head.centre[1] - 0.085)) / depth


# ── Growing ──


def grow(head, roots, normals, recipe, seed, raw=RAW):
    """A strand for each root: (count, RAW, 3). `recipe`: `length` (metres, or a function of a root and the
    head), `comb`, `lift` (how much a strand stands off the head as it leaves, 0 flat to 1 straight out),
    `fall` (metres of its length over which it turns to hang; a big number never hangs), `layers` (metres:
    strands are kept this much further off the skin, each its own share, which gives the hair its body)."""
    rng = np.random.default_rng(seed)
    length = recipe["length"]
    comb = recipe.get("comb", comb_down())
    lift, fall, layers = recipe.get("lift", 0.2), recipe.get("fall", 0.05), recipe.get("layers", 0.004)
    stray = recipe.get("stray", 0.12)
    over_face = recipe.get("over_face", False)  # (a fringe is cut above the brows; anything else is kept off the face)
    out = np.zeros((len(roots), raw, 3))
    for i, (root, normal) in enumerate(zip(roots, normals)):
        whole = (length(root, head) if callable(length) else length) * rng.uniform(0.88, 1.0)
        step = whole / (raw - 1)
        clear = 0.0012 + rng.uniform(0, layers)
        bend = unit(rng.normal(size=3)) * stray
        point = root.copy()
        heading = unit(normal * lift + comb(root, head) * (1 - lift) + bend * 0.5)
        out[i, 0] = point
        along = 0.0
        for k in range(1, raw):
            hang = 1 - math.exp(-along / fall)
            wish = unit(comb(point, head) * (1 - hang) + DOWN * hang + bend * (1 - hang))
            heading = unit(heading * 0.55 + wish * 0.45)
            reach = min(1.0, k / 3)  # (the first steps rise from the scalp to the strand's own layer)
            ahead, skin = head.off(point + heading * step, clear * reach)
            if skin is not None:
                # (On or near the skin a strand runs along it: what of its heading goes into the skin is taken out.)
                into = float(heading @ skin)
                if into < 0:
                    heading = unit(heading - into * skin)
                gone = ahead - point
                far = np.linalg.norm(gone)
                if far > step * 0.3:
                    ahead, _ = head.off(point + gone / far * step, clear * reach)
            if not over_face:
                aside = head.clear_of_face(ahead)
                if aside is not ahead:
                    ahead, _ = head.off(aside, clear * reach)
            point = ahead
            along += step
            out[i, k] = point
    return out


def styled(head, strands, recipe, seed):
    """Grown strands waved or curled, drawn into locks and roughened, as the recipe says: `locks` (how many
    locks, how far a strand is drawn to its lock's middle by its tip, 0…1), `wave` (how far a wave swings,
    its length, both metres), `curl` (a curl's radius, how far along the strand one turn takes), `frizz`
    (metres a point strays)."""
    rng = np.random.default_rng(seed + 1)
    count, raw = strands.shape[:2]
    t = np.linspace(0, 1, raw)[None, :, None]
    lock_of = np.arange(count)
    if recipe.get("locks"):
        many, pull = recipe["locks"]
        guides = rng.choice(count, size=min(many, count), replace=False)
        # (A strand joins the lock that lies nearest it part-way along, not the one rooted nearest: across a
        # parting two roots a finger apart lie on opposite sides of the head.)
        part_way = raw * 3 // 5
        tree = KDTree(len(guides))
        for at, guide in enumerate(guides):
            tree.insert(Vector(strands[guide, part_way] + strands[guide, 0]), at)
        tree.balance()
        lock_of = np.array([guides[tree.find(Vector(strand[part_way] + strand[0]))[1]] for strand in strands])
        middle = strands[lock_of]
        strands = middle + (strands - middle) * (1 - pull * t**1.5)
    steps = np.linalg.norm(np.diff(strands, axis=1), axis=2)
    along = np.concatenate([np.zeros((count, 1)), np.cumsum(steps, axis=1)], axis=1)
    heading = unit(np.gradient(strands, axis=1))
    aside = unit(np.cross(heading, unit(strands - head.centre)))
    outward = np.cross(aside, heading)
    phase = rng.uniform(0, 2 * math.pi, size=count)[lock_of] + rng.normal(0, 0.35, size=count)
    # (Nothing in the first centimetres, or `still` metres: the root stays put.)
    grown = np.clip(along / recipe.get("still", 0.03), 0, 1)[:, :, None]
    if recipe.get("wave"):
        swing, span = recipe["wave"]
        turn = 2 * math.pi * along / span + phase[:, None]
        strands = strands + grown * swing * (np.sin(turn)[:, :, None] * aside + 0.3 * np.cos(turn)[:, :, None] * outward)
    if recipe.get("curl"):
        radius, span = recipe["curl"]
        turn = 2 * math.pi * along / span + phase[:, None]
        strands = strands + grown * radius * (np.cos(turn)[:, :, None] * aside + np.sin(turn)[:, :, None] * outward)
    if recipe.get("frizz"):
        strands = strands + grown * rng.normal(0, recipe["frizz"], size=strands.shape)
    # (Whatever that put under the skin is brought back out.)
    for strand in strands:
        for k in range(1, raw):
            strand[k], _ = head.off(strand[k], 0.001)
            if not recipe.get("over_face", False):
                strand[k] = head.clear_of_face(strand[k])
    return strands


# ── Gathered hair: drawn to a point, and what goes on from there ──


def gathered(head, roots, tie, seed, lift=0.004):
    """The hair of `roots` drawn over the head to `tie`: (count, RAW, 3), each lying on the head on its way."""
    rng = np.random.default_rng(seed + 2)
    out = np.zeros((len(roots), RAW, 3))
    centre = head.centre
    end = unit(tie - centre)
    for i, root in enumerate(roots):
        start = unit(root - centre)
        # (Led over the head, not the short way round it: from a temple to the nape the short way is across the
        # ear and cheek. The way bends through a point up and back from between the two.)
        over = unit(start + end + np.array([0.0, 0.3, 1.2]) * float(np.linalg.norm(start - end)))
        clear = 0.0012 + rng.uniform(0, lift)
        for k, u in enumerate(np.linspace(0, 1, RAW)):
            way = unit((1 - u) ** 2 * start + 2 * u * (1 - u) * over + u * u * end)
            far = (1 - u**1.5) * np.linalg.norm(root - centre) + u**1.5 * np.linalg.norm(tie - centre)
            point = centre + way * far
            if 0 < k < RAW - 1:
                point, _ = head.off(point, clear)
            out[i, k] = point
        out[i, -1] = tie + rng.normal(0, 0.003, size=3)
    return out


def middle_line(head, start, heading, length, fall, clear, points=40):
    """A line from `start`, leaving along `heading` and turning to hang over `fall` metres, kept `clear` off the body."""
    line = [np.array(start, dtype=float)]
    heading = unit(np.array(heading, dtype=float))
    step = length / (points - 1)
    for k in range(1, points):
        hang = 1 - math.exp(-(k * step) / fall)
        heading = unit(heading * 0.6 + unit(heading * (1 - hang) + DOWN * hang) * 0.4)
        ahead, skin = head.off(line[-1] + heading * step, clear)
        if skin is not None and float(heading @ skin) < 0:
            heading = unit(heading - float(heading @ skin) * skin)
        line.append(ahead)
    return np.array(line)


def along_line(line, shares):
    """Points on a line at `shares` of its length (0…1), and the line's heading at each."""
    steps = np.linalg.norm(np.diff(line, axis=0), axis=1)
    far = np.concatenate([[0], np.cumsum(steps)])
    at = np.clip(np.asarray(shares), 0, 1) * far[-1]
    points = np.stack([np.interp(at, far, line[:, c]) for c in range(3)], axis=-1)
    ahead = np.stack([np.interp(np.clip(at + far[-1] * 0.02, 0, far[-1]), far, line[:, c]) for c in range(3)], axis=-1)
    behind = np.stack([np.interp(np.clip(at - far[-1] * 0.02, 0, far[-1]), far, line[:, c]) for c in range(3)], axis=-1)
    return points, unit(ahead - behind)


def tail(head, line, count, radius, seed, wave=None, curl=None, braid=None, raw=RAW):
    """Hair that goes on from where it was gathered, about a middle `line`: (count, RAW, 3). `radius`: how
    thick the tail is (it starts thin at the tie, fills out, and ends in a point). `braid` (how far its three
    plaits swing, a plait's length): plaited to near its end, which is left loose."""
    rng = np.random.default_rng(seed + 3)
    out = np.zeros((count, raw, 3))
    whole = np.linalg.norm(np.diff(line, axis=0), axis=1).sum()
    for i in range(count):
        reach = rng.uniform(0.82, 1.0)
        shares = np.linspace(0, reach, raw)
        points, heading = along_line(line, shares)
        aside = unit(np.cross(heading, np.array([0.0, 1.0, 0.0])))
        outward = np.cross(aside, heading)
        # (Thin at the tie, full a little way down, drawn to a point at the end.)
        thick = radius * (0.3 + 0.7 * np.clip(shares / 0.12, 0, 1)) * np.clip((reach - shares) / (reach * 0.3) + 0.12, 0, 1)
        angle = rng.uniform(0, 2 * math.pi)
        spread = math.sqrt(rng.random())
        far = shares * whole
        if braid:
            swing, span = braid
            plait = i % 3
            loose = np.clip((shares - (reach - 0.12)) / 0.1, 0, 1)  # (the end, below its band, is loose)
            turn = 2 * math.pi * far / span + plait * 2 * math.pi / 3
            plaited = (1 - loose) * np.clip(shares / 0.06, 0, 1)
            points = points + (swing * np.sin(turn) * plaited)[:, None] * aside + (swing * 0.55 * np.sin(2 * turn) * plaited)[:, None] * outward
            thick = thick * (0.42 + 0.58 * loose)
        points = points + (thick * spread * math.cos(angle))[:, None] * aside + (thick * spread * math.sin(angle))[:, None] * outward
        phase = rng.uniform(0, 2 * math.pi) if not braid else 0.0
        if wave:
            turn = 2 * math.pi * far / wave[1] + phase * 0.3
            points = points + (wave[0] * np.sin(turn) * np.clip(shares / 0.1, 0, 1))[:, None] * aside
        if curl:
            turn = 2 * math.pi * far / curl[1] + phase
            grown = np.clip(shares / 0.1, 0, 1)
            points = points + (curl[0] * np.cos(turn) * grown)[:, None] * aside + (curl[0] * np.sin(turn) * grown)[:, None] * outward
        for k in range(1, raw):
            points[k], _ = head.off(points[k], 0.002)
        out[i] = points
    return out


def bun(head, tie, count, radius, seed):
    """Hair wound into a ball at `tie`: (count, RAW, 3), each strand a turn or so round it."""
    rng = np.random.default_rng(seed + 4)
    out = np.zeros((count, RAW, 3))
    away = unit(tie - head.centre)
    middle = tie + away * radius * 0.55
    for i in range(count):
        # (Wound round an axis that mostly points away from the head, so the turns show from behind.)
        axis = unit(away + rng.normal(0, 0.55, size=3))
        first = unit(np.cross(axis, rng.normal(size=3)))
        second = np.cross(axis, first)
        size = radius * rng.uniform(0.72, 1.0)
        rise = rng.uniform(-0.5, 0.5) * size
        turns = rng.uniform(0.7, 1.3) * 2 * math.pi
        begin = rng.uniform(0, 2 * math.pi)
        for k, u in enumerate(np.linspace(0, 1, RAW)):
            angle = begin + turns * u
            ring = math.sqrt(max(1e-6, size * size - (rise * (1 - 2 * u * 0.3)) ** 2))
            point = middle + axis * rise * (1 - 0.6 * u) + ring * (math.cos(angle) * first + math.sin(angle) * second)
            out[i, k], _ = head.off(point, 0.002)
    return out

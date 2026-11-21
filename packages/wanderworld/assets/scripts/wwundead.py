"""Helpers for Wanderworld's undead (make_skeleton.py, make_zombie.py, make_ghost.py, make_specter.py), on
top of wwblend's Model: all four stand on the people's skeleton, so the game moves them with the people's
clips.

- `Undead`: a Model whose metaball skins can be roughened after meshing (`shapes[group]`: (co, normal) ->
  offset) and whose faces can be repainted by where they are (`paint`: (point, colour) -> colour), for
  rot, grime and stains instead of smooth clean blobs.
- `Undead.piece()`: a small metaball shape meshed on its own and held wholly by one bone (a skull, a
  thigh bone, a pelvis): bones of a skeleton are rigid, so each is a hard part.
- `Undead.sweep()`: one tube along a path with its own radius at each point and a flattened section (a rib,
  a finger, a strand of hair, a wisp).
- `Undead.sheet()`: a thin two-sided cloth through rows of points (a rag, a torn robe, a shroud).
- `stooped()`: the people's skeleton bent over, as make_ghoul.py and make_troll.py bend it.
- `reweight()` and `lift()`: after `finish()`, change the skin's weights by where each vertex is (a ghost's
  tail mostly on the pelvis) and add moves to its actions (hovering), then write the .glb and .blend again.
"""

import math
import os

import bmesh
import bpy
from mathutils import Quaternion, Vector, noise

import wwblend
from wwblend import STIFF, SURFACE, THRESHOLD, Model, at, humanoid_body, humanoid_joints


def fbm(p, scale, octaves=3):
    """Fractal noise at p (about -1 to 1), features about 1/`scale` metres across."""
    return noise.fractal(Vector(p) * scale, 0.6, 2.0, octaves, noise_basis="PERLIN_ORIGINAL")


def pick(p, colours, scale=30.0, seed=0.0):
    """One of `colours` by noise at p: a blotchy choice, the first most often in the middle of the range."""
    n = noise.noise(Vector(p) * scale + Vector((seed, seed * 1.7, seed * 0.3)))
    k = int((max(-0.6, min(0.6, n)) + 0.6) / 1.2 * len(colours) - 1e-6)
    return colours[max(0, min(len(colours) - 1, k))]


class Undead(Model):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.shapes = {}
        self.paint = None
        self._pieces = 0

    # ── Rougher skins than metaballs give ──

    def _meta_mesh(self, group):
        settings = self.groups[group]
        faces = settings["faces"]
        settings["faces"] = 10**9  # (thinned below, after the skin is shaped)
        body = super()._meta_mesh(group)
        settings["faces"] = faces
        shape = self.shapes.get(group)
        if shape is not None:
            mesh = body.data
            for v in mesh.vertices:
                v.co += shape(v.co.copy(), v.normal.copy())
            mesh.update()
        _thin(body, faces)
        return body

    def _face_colour(self, p, group):
        colour = super()._face_colour(p, group)
        return colour if self.paint is None else self.paint(p, colour)

    def _add(self, verts, faces, colours, bone, smooth=True):
        if self.paint is not None:
            colours = [self.paint(sum((verts[i] for i in f), Vector()) / len(f), c) for f, c in zip(faces, colours)]
        self.parts.append((verts, faces, colours, bone, smooth))

    # ── A rigid shape of metaballs on one bone ──

    def piece(self, elements, bone, resolution=0.005, faces=600, shape=None, smooth=True):
        """Meshes `elements` on their own and adds them as a hard part on `bone`. An element is
        ("ball", centre, r, colour), ("cap", a, b, r, colour) or ("ell", centre, radii, colour, rotation),
        in Blender's space (radii along the rotated x, y, z), with "-" before the kind to carve instead.
        `shape` (co, normal) -> offset roughens it before it's thinned to `faces`."""
        self._pieces += 1
        meta = bpy.data.metaballs.new(f"undeadpiece{self._pieces}")
        meta.resolution = resolution
        meta.threshold = THRESHOLD
        holder = bpy.data.objects.new(f"undeadpiece{self._pieces}", meta)
        bpy.context.scene.collection.objects.link(holder)
        parsed = []
        for el in elements:
            kind, negative = (el[0][1:], True) if el[0].startswith("-") else (el[0], False)
            if kind == "ball":
                _k, c, r, colour = el[:4]
                parsed.append(("ball", (Vector(c), r, None), colour, negative))
            elif kind == "cap":
                _k, a, b, r, colour = el[:5]
                parsed.append(("cap", (Vector(a), Vector(b), r), colour, negative))
            else:
                _k, c, radii, colour = el[:4]
                rotation = el[4] if len(el) > 4 and el[4] is not None else Quaternion()
                parsed.append(("ell", (Vector(c), Vector(radii), rotation), colour, negative))
        for kind, data, _colour, negative in parsed:
            e = meta.elements.new(type={"ball": "BALL", "cap": "CAPSULE", "ell": "ELLIPSOID"}[kind])
            e.stiffness = STIFF
            e.use_negative = negative
            if kind == "ball":
                e.co, e.radius = data[0], data[1] / SURFACE
            elif kind == "cap":
                a, b, r = data
                e.co, e.radius = (a + b) / 2, r / SURFACE
                e.size_x = max(1e-4, (b - a).length / 2)
                e.rotation = Vector((1, 0, 0)).rotation_difference((b - a).normalized())
            else:
                c, radii, rotation = data
                e.co, e.radius = c, 1 / SURFACE
                e.size_x, e.size_y, e.size_z = radii
                e.rotation = rotation
        depsgraph = bpy.context.evaluated_depsgraph_get()
        mesh = bpy.data.meshes.new_from_object(holder.evaluated_get(depsgraph))
        bpy.data.objects.remove(holder)
        bpy.data.metaballs.remove(meta)
        obj = bpy.data.objects.new(f"undeadpiece{self._pieces}-mesh", mesh)
        bpy.context.scene.collection.objects.link(obj)
        if shape is not None:
            for v in mesh.vertices:
                v.co += shape(v.co.copy(), v.normal.copy())
            mesh.update()
        _thin(obj, faces)
        mesh = obj.data
        verts = [v.co.copy() for v in mesh.vertices]
        polys = [list(poly.vertices) for poly in mesh.polygons]
        colours = [_colour_at(Vector(poly.center), parsed) for poly in mesh.polygons]
        bpy.data.objects.remove(obj)
        if verts:
            self._add(verts, polys, colours, bone, smooth)

    # ── Tubes and cloth ──

    def sweep(self, points, radii, colour, bone, segments=6, flat=1.0, up=None, tip=True, smooth=True):
        """One tube along `points` (Blender's space), radius `radii[i]` at each (or (r0, r1) from end to end),
        its section squashed to `flat` along `up` (a direction roughly across the path; the flat side
        faces it). Closed at the start; drawn to a point past the end if `tip`, else closed flat.
        `colour` is one colour or a function (point along it 0-1, ring position 0-1) -> colour."""
        points = [Vector(p) for p in points]
        n = len(points)
        if len(radii) != n:
            radii = [radii[0] + (radii[1] - radii[0]) * i / (n - 1) for i in range(n)]
        tangent = (points[1] - points[0]).normalized()
        normal = Vector(up) if up is not None else tangent.orthogonal()
        normal = (normal - tangent * normal.dot(tangent)).normalized()
        verts, faces, colours, rings = [], [], [], []
        for i, p in enumerate(points):
            new = (points[min(i + 1, n - 1)] - points[max(i - 1, 0)]).normalized()
            normal = (normal - new * normal.dot(new)).normalized()
            tangent = new
            binormal = tangent.cross(normal)
            ring = []
            for k in range(segments):
                a = 2 * math.pi * k / segments
                ring.append(len(verts))
                verts.append(p + (normal * math.cos(a) * flat + binormal * math.sin(a)) * radii[i])
            rings.append(ring)

        def col(u, v):
            return colour(u, v) if callable(colour) else colour

        faces.append(list(reversed(rings[0])))
        colours.append(col(0, 0))
        for i, (a, b) in enumerate(zip(rings, rings[1:])):
            for k in range(segments):
                faces.append([a[k], a[(k + 1) % segments], b[(k + 1) % segments], b[k]])
                colours.append(col((i + 0.5) / (n - 1), (k + 0.5) / segments))
        if tip:
            verts.append(points[-1] + tangent * radii[-1] * 1.4)
            for k in range(segments):
                faces.append([rings[-1][k], rings[-1][(k + 1) % segments], len(verts) - 1])
                colours.append(col(1, (k + 0.5) / segments))
        else:
            faces.append(list(rings[-1]))
            colours.append(col(1, 0))
        self._add(verts, faces, colours, bone, smooth)

    def sheet(self, columns, colour, bone, thick=0.004, closed=False, smooth=True):
        """A thin cloth through `columns` (lists of points, all the same length, each from the cloth's top
        down; side by side), `thick` through, closed round if `closed`. `colour` is one colour or a function
        (column 0-1, row 0-1) -> colour."""
        grid = [[Vector(p) for p in c] for c in columns]
        nc, nr = len(grid), len(grid[0])
        normals = []
        for i in range(nc):
            column = []
            for j in range(nr):
                if closed:
                    across = grid[(i + 1) % nc][j] - grid[(i - 1) % nc][j]
                else:
                    across = grid[min(i + 1, nc - 1)][j] - grid[max(i - 1, 0)][j]
                down = grid[i][min(j + 1, nr - 1)] - grid[i][max(j - 1, 0)]
                nrm = across.cross(down)
                column.append(nrm.normalized() if nrm.length > 1e-9 else Vector((0, 0, 1)))
            normals.append(column)
        bm = bmesh.new()
        front = [[bm.verts.new(grid[i][j] + normals[i][j] * thick / 2) for j in range(nr)] for i in range(nc)]
        back = [[bm.verts.new(grid[i][j] - normals[i][j] * thick / 2) for j in range(nr)] for i in range(nc)]

        def col(u, v):
            return colour(u, v) if callable(colour) else colour

        colours = []
        last = nc if closed else nc - 1
        for i in range(last):
            i2 = (i + 1) % nc
            for j in range(nr - 1):
                c = col((i + 0.5) / nc, (j + 0.5) / (nr - 1))
                for face in ((front[i][j], front[i2][j], front[i2][j + 1], front[i][j + 1]), (back[i][j + 1], back[i2][j + 1], back[i2][j], back[i][j])):
                    try:
                        bm.faces.new(face)
                        colours.append(c)
                    except ValueError:
                        pass
        # The edges: top and bottom rows, and the two sides of an open cloth.
        rims = []
        for i in range(last):
            i2 = (i + 1) % nc
            rims.append(((front[i][0], back[i][0], back[i2][0], front[i2][0]), (i + 0.5) / nc, 0))
            rims.append(((front[i2][-1], back[i2][-1], back[i][-1], front[i][-1]), (i + 0.5) / nc, 1))
        if not closed:
            for i in (0, nc - 1):
                for j in range(nr - 1):
                    rims.append(((front[i][j], front[i][j + 1], back[i][j + 1], back[i][j]), i / max(1, nc - 1), (j + 0.5) / (nr - 1)))
        for face, u, v in rims:
            try:
                bm.faces.new(face)
                colours.append(col(u, v))
            except ValueError:
                pass
        # (Faces kept in order with their colours: normals made consistent, facing out.)
        bm.faces.ensure_lookup_table()
        order = list(bm.faces)
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
        bm.verts.index_update()
        verts = [v.co.copy() for v in bm.verts]
        faces = [[v.index for v in f.verts] for f in order]
        bm.free()
        self._add(verts, faces, colours, bone, smooth)


def _thin(obj, faces):
    mesh = obj.data
    if len(mesh.polygons) > faces:
        decimate = obj.modifiers.new("Decimate", "DECIMATE")
        decimate.ratio = faces / len(mesh.polygons)
        depsgraph = bpy.context.evaluated_depsgraph_get()
        reduced = bpy.data.meshes.new_from_object(obj.evaluated_get(depsgraph))
        obj.modifiers.clear()
        obj.data = reduced
        bpy.data.meshes.remove(mesh)


def _field(p, kind, data):
    if kind == "ball":
        c, r, _ = data
        x = (p - c).length / (r / SURFACE)
    elif kind == "cap":
        a, b, r = data
        x = wwblend._segment_distance(p, a, b) / (r / SURFACE)
    else:
        c, radii, rotation = data
        d = rotation.inverted() @ (p - c)
        x = math.sqrt(sum((d[i] / (radii[i] / SURFACE)) ** 2 for i in range(3)))
    return 0.0 if x >= 1 else (1 - x * x) ** 3


def _colour_at(p, parsed):
    best, colour = 0.0, parsed[0][2]
    for kind, data, c, negative in parsed:
        f = _field(p, kind, data)
        if negative:
            if f > 0.35:
                return c
            continue
        if f > best:
            best, colour = f, c
    return colour


def stooped(m, p, spine, shoulder, colours, keep=lambda centre: False):
    """The people's skeleton laid out bent over (as make_ghoul.py does it): `spine` gives spine_01,
    spine_02, spine_03, neck_01 and Head as (x, up, forward), the arms hang from `shoulder` (up, forward),
    and humanoid_body's limbs are built on it, its own upright torso and neck left out unless `keep`
    (centre) says otherwise. Returns humanoid_body's measures."""
    joints = humanoid_joints(p)
    s = p["leg"] / 0.9
    for name, q in zip(("spine_01", "spine_02", "spine_03", "neck_01", "Head"), spine):
        joints[name] = at(*q)
    joints["Head.tail"] = joints["Head"] + Vector((0, 0, 0.2 * s))
    arm_y = p["leg"] + p["torso"] * 0.88
    shift = at(0, shoulder[0] - arm_y, shoulder[1])
    for side, sign in (("l", 1), ("r", -1)):
        for name in (f"upperarm_{side}", f"lowerarm_{side}", f"hand_{side}", f"hand_{side}.tail"):
            joints[name] = joints[name] + shift
        joints[f"clavicle_{side}"] = at(sign * 0.03 * s, shoulder[0] - 0.01 * s, spine[2][2])
    m.rig(joints)
    n0, p0 = len(m.elements), len(m.parts)
    b = humanoid_body(m, p, colours)
    kept = m.elements[:n0]
    for kind, data, colour, negative, group in m.elements[n0:]:
        centre = (data[0] + data[1]) / 2 if kind == "CAPSULE" else data[0]
        if abs(centre.x) < 1e-6 and not keep(centre):
            continue
        if abs(centre.x) > b["sx"] * 0.75 and abs(centre.z - arm_y) < 0.15 * s:
            data = (data[0] + shift, data[1] + shift, data[2]) if kind == "CAPSULE" else (data[0] + shift, data[1])
        kept.append((kind, data, colour, negative, group))
    m.elements[:] = kept
    for i in range(p0, len(m.parts)):
        verts, faces, colour, bone, smooth = m.parts[i]
        if bone.startswith("hand_"):
            m.parts[i] = ([v + shift for v in verts], faces, colour, bone, smooth)
    b["shift"] = shift
    return b


# ── After finish() ──


def _skin(m):
    return next(o for o in bpy.data.objects if o.type == "MESH" and o.parent == m.armature)


def reweight(m, change):
    """Changes each vertex's weights: `change` (co, {bone: weight}) -> {bone: weight} or None to keep."""
    obj = _skin(m)
    names = {g.index: g.name for g in obj.vertex_groups}
    for v in obj.data.vertices:
        here = {names[g.group]: g.weight for g in v.groups if g.weight > 0}
        new = change(v.co.copy(), here)
        if new is None:
            continue
        total = sum(new.values()) or 1.0
        for name in here:
            obj.vertex_groups[name].remove([v.index])
        for name, w in new.items():
            if w > 0.001:
                obj.vertex_groups[name].add([v.index], w / total, "REPLACE")


def lift(m, moves):
    """Adds moves of the pelvis to the actions: `moves` {action: [(frame, (x, y, z))]} in the pelvis bone's
    own resting axes (for the people's pelvis, which stands upright: y is up)."""
    from wwcreature import _fcurves

    rig = m.armature
    pb = rig.pose.bones["pelvis"]
    for track in rig.animation_data.nla_tracks:
        if track.name not in moves:
            continue
        action = track.strips[0].action
        rig.animation_data.action = action
        for frame, offset in moves[track.name]:
            pb.location = offset
            pb.keyframe_insert("location", frame=frame, group="pelvis")
        for curve in _fcurves(action):
            if curve.data_path.endswith("location"):
                curve.update()
        rig.animation_data.action = None
    pb.location = (0, 0, 0)


def write(m):
    """Writes the .glb and the .blend again, as finish() does."""
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(
        filepath=os.path.join(wwblend.MODELS, f"{m.name}.glb"),
        export_format="GLB",
        export_animations=True,
        export_animation_mode="NLA_TRACKS",
        export_skins=True,
        export_yup=True,
        export_normals=True,
        export_texcoords=True,
        export_materials="EXPORT",
    )
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(wwblend.BUILD, f"{m.name}.blend"), compress=True)

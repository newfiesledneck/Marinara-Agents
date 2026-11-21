"""Renders pictures of a model made by a make_*.py script, to look at while shaping it: the front, three
quarters, the side and the head close up, into assets/build/<name>-<view>.png (not committed). Run:

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/preview.py -- goblin
"""

import math
import os
import sys

import bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.dirname(HERE)
name = sys.argv[sys.argv.index("--") + 1]

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.join(ASSETS, "models", f"{name}.glb"))
scene = bpy.context.scene
# (The largest mesh: an import can bring stray ones along.)
mesh = max((o for o in scene.objects if o.type == "MESH"), key=lambda o: len(o.data.vertices))
corners = [mesh.matrix_world @ Vector(c) for c in mesh.bound_box]
low = Vector((min(c.x for c in corners), min(c.y for c in corners), min(c.z for c in corners)))
high = Vector((max(c.x for c in corners), max(c.y for c in corners), max(c.z for c in corners)))
height = high.z - low.z
centre = (low + high) / 2

scene.render.engine = "BLENDER_WORKBENCH"
scene.display.shading.light = "STUDIO"
scene.display.shading.color_type = "TEXTURE"
scene.display.shading.show_cavity = True
scene.render.resolution_x = scene.render.resolution_y = 640
scene.render.film_transparent = False
if scene.world is None:
    scene.world = bpy.data.worlds.new("World")
scene.world.color = (0.55, 0.62, 0.7)
camera_data = bpy.data.cameras.new("camera")
camera_data.lens = 50
camera = bpy.data.objects.new("camera", camera_data)
scene.collection.objects.link(camera)
scene.camera = camera

out = os.path.join(ASSETS, "build")
os.makedirs(out, exist_ok=True)
# (The model faces -Y in Blender: the front view looks along +Y.)
views = {
    "front": (0, centre.z, height * 1.9, centre.z),
    "three-quarter": (-35, centre.z, height * 1.9, centre.z),
    "side": (-90, centre.z, height * 1.9, centre.z),
    "head": (-20, high.z - height * 0.12, height * 0.9, high.z - height * 0.14),
}
for view, (angle, eye_z, distance, look_z) in views.items():
    a = math.radians(angle)
    camera.location = Vector((centre.x + math.sin(a) * distance, centre.y - math.cos(a) * distance, eye_z))
    target = Vector((centre.x, centre.y, look_z))
    camera.rotation_euler = (target - camera.location).to_track_quat("-Z", "Y").to_euler()
    scene.render.filepath = os.path.join(out, f"{name}-{view}.png")
    bpy.ops.render.render(write_still=True)
    print("wrote", scene.render.filepath, flush=True)

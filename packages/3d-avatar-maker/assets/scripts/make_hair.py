"""Hair styles for the base avatar (avatar-male.glb and avatar-female.glb) that MakeHuman's CC0 pack hasn't
got, cut from its styles' cards and pictures: one GLB per style, assets/models/avatar-hair-<style>.glb, with
two meshes, `male` and `female`, each fitted to that body's head and skinned to its skeleton, with every
shape key of the body (so they follow the face, ears, neck and age sliders). Run (BLENDER: your Blender
executable; add `-- shaved buns` for some of them):

    "$BLENDER" --background --factory-startup --python packages/wanderworld/assets/scripts/make_hair.py

- parted: bob02 (a side-parted bob) cut shorter, over the ears to about their middle at the sides and to
  the nape at the back, its fringe lifted off the eyes.
- buns: ponytail01's hair pulled back to the crown of the back of the head, its tail made into two buns
  there side by side over a knot where it's tied: balls of hair with its own locks wound round them.
- shaved: short02's hair laid flat on the scalp, its picture made stubble (only the finest strand marks,
  thinning out at the hairline).
- mohawk: the shaved cap, with a crest of ponytail01's locks standing up along the middle, swept back.

The fitting's second half (lifting it off the skin with each key, weights, normals, the file) is
make_mh_hair.py's `finish()`; the cutting and the cards are wwhair.py's. Material `hair`, alpha MASK at 0.5,
a near-white picture the game tints, as the pack's styles have.

Hair from MakeHuman (makehumancommunity.org, CC0), cut, restyled and fitted in Blender by ThatOneCan.
"""

import os
import sys

import bpy
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import make_mh_hair as mh  # noqa: E402
import wwhair as wh  # noqa: E402
import wwmhclo as mc  # noqa: E402

SIZE = mh.SIZE


def parted():
    proxy = mc.Proxy("hair", "bob02")
    image = mh.save_texture("parted", mh.grey(mc.load_rgba(proxy.texture(), SIZE)))

    def fit(body, sex):
        f = mc.Fitted(proxy, body)
        # (Over the ears to about their middle, a little longer behind them, to the nape at the back.)
        f = wh.shorten(f, body, 0.02, lambda az: np.interp(az, [0, 60, 100, 140, 180], [-0.03, -0.035, -0.045, -0.07, -0.085]))
        return mh.lift_fringe(f, body, inner=0.035, outer=0.02)

    return fit, image


def buns():
    proxy = mc.Proxy("hair", "ponytail01")
    image = mh.save_texture("buns", mh.grey(mc.load_rgba(proxy.texture(), SIZE)))

    def fit(body, sex):
        f = mc.Fitted(proxy, body)
        isl = f.islands()
        # The tail: the islands hanging behind and below the back of the head.
        tail = [k for k in isl if f.co[[v for i in k for v in f.faces[i]], 2].min() < body.J["Head"][2] - 0.05 and f.co[[v for i in k for v in f.faces[i]], 1].min() > 0.04]
        tail_ids = {i for k in tail for i in k}
        top = sorted({v for i in tail_ids for v in f.faces[i]})
        tie = f.co[top][f.co[top, 2] > f.co[top, 2].max() - 0.015].mean(0)
        # (And the funnel the cap narrows into at the tie, standing off the head: the buns sit over it.)
        bvh, _ = body.bvh({})
        _, _, d = mc.nearest(bvh, f.co)
        funnel = {i for i, face in enumerate(f.faces) if d[face].min() > 0.012 and np.linalg.norm(f.co[face].mean(0) - tie) < 0.06}
        cap = f.subset([i for i in range(len(f.faces)) if i not in tail_ids | funnel])
        centre, _, _ = wh.head_frame(body)
        scalp, _ = wh.on_scalp(body, centre, tie - centre)
        rng = mh.rng_for("buns", sex)
        # (A knot of hair where the cap gathers, between and under the buns, over the tie.)
        tie_axis = mc.unit(scalp - centre)
        parts = [cap, wh.ball(body, cap, scalp + tie_axis * 0.006, 0.019, (0.08, 0.6, 0.38, 0.85))]
        for side in (-1, 1):
            axis = mc.unit(scalp + np.array([0.024 * side, 0, 0.008]) - centre)
            c, _ = wh.on_scalp(body, centre, axis)
            parts.append(wh.bun(body, cap, c + axis * 0.022, axis, 0.027, (0.08, 0.6, 0.38, 0.85), wh.LOCKS, rng))
        return mc.merge(parts)

    return fit, image


def stubble_cap(name, locks=False):
    """short02 laid flat as stubble; with `locks`, its picture squeezed into the left 60% and ponytail01's
    locks beside it (for the mohawk's crest)."""
    proxy = mc.Proxy("hair", "short02")
    g = wh.stubble(mh.grey(mc.load_rgba(proxy.texture(), SIZE)))
    rects = None
    if locks:
        squeezed = np.zeros_like(g)
        cols = np.linspace(0, SIZE - 1, int(SIZE * 0.6)).astype(int)
        squeezed[:, : len(cols)] = g[:, cols]
        tails = mh.grey(mc.load_rgba(mc.Proxy("hair", "ponytail01").texture(), SIZE))
        rects = wh.copy_locks(tails, squeezed, 0.61)
        g = squeezed
    image = mh.save_texture(name, g)

    def cap(body):
        f = wh.flatten(mc.Fitted(proxy, body), body)
        if locks:
            mc.remap_uv(f, (0, 0, 1, 1), (0, 0, 0.6, 1))
        return f

    return cap, image, rects


def shaved():
    cap, image, _ = stubble_cap("shaved")
    return (lambda body, sex: cap(body)), image


def mohawk():
    cap, image, rects = stubble_cap("mohawk", locks=True)

    def fit(body, sex):
        f = cap(body)
        return mc.merge([f, wh.crest(body, f, sex, rects, mh.rng_for("mohawk", sex))])

    return fit, image


STYLES = {"parted": parted, "buns": buns, "shaved": shaved, "mohawk": mohawk}


def make(style):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    fit, image = STYLES[style]()
    return mh.finish(style, fit, image)


if __name__ == "__main__":
    which = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else list(STYLES)
    for s in which:
        make(s)

import cv2
import numpy as np

# Screen size: 1920 x 1080
W, H = 1920, 1080
bg_color = [90, 87, 0] # BGR for #00575a

canvas = np.full((H, W, 3), bg_color, dtype=np.uint8)

# Load center frame
img = cv2.imread('public/frames/center.webp')
nh, nw, _ = img.shape

# Reduce scale by 25% from previous:
# Previous scale was: (H / nh) * 1.02 = 1.53
# Now 25% smaller: 1.53 * 0.75 = 1.1475 (which is H * 0.765 / nh)
scale = (H / nh) * 0.765
rw = int(nw * scale)
rh = int(nh * scale)
resized = cv2.resize(img, (rw, rh), interpolation=cv2.INTER_LANCZOS4)

# Target face X: center-right (~63% of width)
target_x = W * 0.63
face_x = 624.3 * scale
ox = int(target_x - face_x)

# Bottom anchored to viewport bottom so torso seamlessly ends at bottom of screen
oy = H - rh

print(f"Reduced by 25%: size={rw}x{rh}, ox={ox}, oy={oy}")
print(f"Top headroom: {oy}px ({oy/H*100:.1f}%), Face Y: {oy + 325.8*scale:.1f}px ({(oy + 325.8*scale)/H*100:.1f}%)")

# Blend with soft ramps on left, right, and top edges
patch = resized.copy()
# Left fade ramp
fade_left = 180
# Top fade ramp
fade_top = 80
# Right fade ramp
fade_right = 180

mask = np.ones((rh, rw), dtype=np.float32)

# Left fade
if ox > 0 and rw > fade_left:
    mask[:, :fade_left] = np.minimum(mask[:, :fade_left], np.linspace(0.0, 1.0, fade_left))

# Right fade
if ox + rw < W and rw > fade_right:
    mask[:, -fade_right:] = np.minimum(mask[:, -fade_right:], np.linspace(1.0, 0.0, fade_right))

# Top fade
if oy > 0 and rh > fade_top:
    top_ramp = np.linspace(0.0, 1.0, fade_top)[:, np.newaxis]
    mask[:fade_top, :] = np.minimum(mask[:fade_top, :], top_ramp)

mask_3c = np.dstack([mask, mask, mask])

# Place onto canvas
dst_x1 = max(0, ox)
dst_y1 = max(0, oy)
dst_x2 = min(W, ox + rw)
dst_y2 = min(H, oy + rh)

src_x1 = dst_x1 - ox
src_y1 = dst_y1 - oy
src_x2 = src_x1 + (dst_x2 - dst_x1)
src_y2 = src_y1 + (dst_y2 - dst_y1)

char_patch = patch[src_y1:src_y2, src_x1:src_x2].astype(np.float32)
char_mask = mask_3c[src_y1:src_y2, src_x1:src_x2]
bg_patch = canvas[dst_y1:dst_y2, dst_x1:dst_x2].astype(np.float32)

blended = (char_patch * char_mask + bg_patch * (1.0 - char_mask)).astype(np.uint8)
canvas[dst_y1:dst_y2, dst_x1:dst_x2] = blended

cv2.imwrite('public/test_25_reduction.jpg', canvas)
print("Saved public/test_25_reduction.jpg successfully.")

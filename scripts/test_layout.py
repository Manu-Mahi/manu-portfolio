import cv2
import numpy as np

# Screen size: 1920 x 1080
W, H = 1920, 1080
bg_color = [90, 87, 0] # BGR for #00575a

canvas = np.full((H, W, 3), bg_color, dtype=np.uint8)

# Load center frame
img = cv2.imread('public/frames/center.webp')
nh, nw, _ = img.shape

# Scale to fit nicely with head and shoulders visible without excessive zoom
# Say scale = H / nh * 1.05
scale = (H / nh) * 1.02
rw = int(nw * scale)
rh = int(nh * scale)
resized = cv2.resize(img, (rw, rh), interpolation=cv2.INTER_LANCZOS4)

# Place face at ~65% screen width
face_x = 624.3 * scale
face_y = 325.8 * scale
target_x = W * 0.64
target_y = H * 0.44

ox = int(target_x - face_x)
oy = int(target_y - face_y)

print(f"Rendered size: {rw}x{rh}, Offset: ({ox}, {oy})")

# Blend resized image into canvas
# Clip to canvas bounds
src_x1 = max(0, -ox)
src_y1 = max(0, -oy)
src_x2 = min(rw, W - ox)
src_y2 = min(rh, H - oy)

dst_x1 = max(0, ox)
dst_y1 = max(0, oy)
dst_x2 = dst_x1 + (src_x2 - src_x1)
dst_y2 = dst_y1 + (src_y2 - src_y1)

char_patch = resized[src_y1:src_y2, src_x1:src_x2]

# Create soft horizontal fade on left edge of character (150px wide)
fade_w = 220
mask = np.ones((char_patch.shape[0], char_patch.shape[1]), dtype=np.float32)
if ox > 0 and char_patch.shape[1] > fade_w:
    ramp = np.linspace(0.0, 1.0, fade_w)
    mask[:, :fade_w] = ramp

mask_3c = np.dstack([mask, mask, mask])
bg_patch = canvas[dst_y1:dst_y2, dst_x1:dst_x2].astype(np.float32)
blended = (char_patch.astype(np.float32) * mask_3c + bg_patch * (1.0 - mask_3c)).astype(np.uint8)
canvas[dst_y1:dst_y2, dst_x1:dst_x2] = blended

# Also check top/bottom if any
cv2.imwrite('public/test_composition.jpg', canvas)
print("Saved public/test_composition.jpg")

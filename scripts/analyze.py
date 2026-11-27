import json
import math
import numpy as np

with open('face_tracking.json') as f:
    data = json.load(f)

print('--- Last 25 frames (Neutral Pose Check) ---')
for d in data[165:]:
    print(f"Frame {d['frame']:3d}: nose=({d['nose_x']:6.1f}, {d['nose_y']:6.1f}), center=({d['center_x']:6.1f}, {d['center_y']:6.1f}), dx={d['dx']:6.1f}, dy={d['dy']:6.1f}")

# Neutral reference
# Let's see the neutral nose position around frame 180-189
neutral_frame = 185
ref_nose_x = data[neutral_frame]['nose_x']
ref_nose_y = data[neutral_frame]['nose_y']
print(f"\nUsing Frame {neutral_frame} as neutral reference nose: ({ref_nose_x}, {ref_nose_y})")

print("\n--- Rotation analysis relative to neutral nose center ---")
# For each frame, calculate vector from neutral nose to frame nose:
for d in data[:170]:
    vx = d['nose_x'] - ref_nose_x
    vy = d['nose_y'] - ref_nose_y
    dist = math.hypot(vx, vy)
    ang = math.degrees(math.atan2(vy, vx)) % 360
    d['offset_x'] = vx
    d['offset_y'] = vy
    d['offset_dist'] = dist
    d['offset_ang'] = ang

# Let's inspect where the rotation starts and ends
for d in data[0:170:5]:
    print(f"Frame {d['frame']:3d}: vx={d['offset_x']:6.1f}, vy={d['offset_y']:6.1f}, dist={d['offset_dist']:5.1f}, angle={d['offset_ang']:5.1f}°")

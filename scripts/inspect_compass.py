import cv2
import json
import math
import numpy as np

# Load face tracking
with open('face_tracking.json') as f:
    data = json.load(f)

# The neutral center pose is around frame 180-185
center_frame = 182
neutral_nose_x = data[center_frame]['nose_x']
neutral_nose_y = data[center_frame]['nose_y']
print(f"Neutral face center (Frame {center_frame}): ({neutral_nose_x}, {neutral_nose_y})")

# Let's inspect vector from neutral nose (dx, dy) for all frames
frames_info = []
for d in data:
    f_num = d['frame']
    dx = d['nose_x'] - neutral_nose_x
    dy = d['nose_y'] - neutral_nose_y # dy > 0 is down, dy < 0 is up
    dist = math.hypot(dx, dy)
    # atan2(dy, dx) in degrees:
    # Right: 0 deg
    # Down-Right: 45 deg
    # Down: 90 deg
    # Down-Left: 135 deg
    # Left: 180 deg
    # Up-Left: 225 deg (-135 deg)
    # Up: 270 deg (-90 deg)
    # Up-Right: 315 deg (-45 deg)
    ang_deg = math.degrees(math.atan2(dy, dx)) % 360
    frames_info.append({
        'frame': f_num,
        'dx': dx,
        'dy': dy,
        'dist': dist,
        'angle': ang_deg
    })

# Print every 5 frames
print(f"{'Frame':>5} | {'dx':>7} | {'dy':>7} | {'Dist':>6} | {'Angle':>7} | {'Compass'}")
print("-" * 55)

def get_compass_label(deg):
    dirs = ["RIGHT", "DOWN-RIGHT", "DOWN", "DOWN-LEFT", "LEFT", "UP-LEFT", "UP", "UP-RIGHT"]
    idx = int(round(deg / 45.0)) % 8
    return dirs[idx]

for item in frames_info:
    f = item['frame']
    if f % 4 == 0 or f >= 160:
        c = get_compass_label(item['angle']) if item['dist'] > 15 else "CENTER"
        print(f"{f:5d} | {item['dx']:7.1f} | {item['dy']:7.1f} | {item['dist']:6.1f} | {item['angle']:7.1f}° | {c}")

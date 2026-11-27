import json
import math

with open('face_tracking.json') as f:
    data = json.load(f)

# Neutral nose
neutral_x = 624.26
neutral_y = 325.84

print(f"{'Frame':>5} | {'Nose X':>7} | {'Nose Y':>7} | {'dx':>7} | {'dy':>7} | {'Dist':>6} | {'Angle':>7} | Direction")
print("-" * 65)

for d in data:
    f = d['frame']
    nx = d['nose_x']
    ny = d['nose_y']
    dx = nx - neutral_x
    dy = ny - neutral_y
    dist = math.hypot(dx, dy)
    ang = math.degrees(math.atan2(dy, dx)) % 360
    
    # 8 compass directions
    dirs = ["RIGHT", "DOWN-RIGHT", "DOWN", "DOWN-LEFT", "LEFT", "UP-LEFT", "UP", "UP-RIGHT"]
    dir_name = dirs[int(round(ang / 45.0)) % 8] if dist > 15 else "CENTER"
    
    if f % 3 == 0 or f >= 170:
        print(f"{f:5d} | {nx:7.1f} | {ny:7.1f} | {dx:+7.1f} | {dy:+7.1f} | {dist:6.1f} | {ang:7.1f}° | {dir_name}")

import json
import math

with open('new_trajectory.json') as f:
    traj = json.load(f)

# Let's inspect the entire sequence
# For each compass direction (0, 45, 90, 135, 180, 225, 270, 315)
# Let's see which frames best match:
# RIGHT: 0°
# DOWN-RIGHT: 45°
# DOWN: 90°
# DOWN-LEFT: 135°
# LEFT: 180°
# UP-LEFT: 225°
# UP: 270°
# UP-RIGHT: 315°

directions = [
    ("RIGHT", 0),
    ("DOWN-RIGHT", 45),
    ("DOWN", 90),
    ("DOWN-LEFT", 135),
    ("LEFT", 180),
    ("UP-LEFT", 225),
    ("UP", 270),
    ("UP-RIGHT", 315),
]

def ang_diff(a, b):
    d = abs(a - b) % 360
    return d if d <= 180 else 360 - d

print("Compass direction search:")
for name, target in directions:
    # Filter frames with significant deflection
    candidates = [t for t in traj if t['dist'] > 8 and t['f'] < 184]
    if candidates:
        best = min(candidates, key=lambda t: ang_diff(t['ang'], target))
        print(f"{name:12s} ({target:3d}°): Frame {best['f']:3d} | measured angle = {best['ang']:5.1f}° | error = {ang_diff(best['ang'], target):4.1f}° | dist = {best['dist']:4.1f}px (dx={best['dx']:+5.1f}, dy={best['dy']:+5.1f})")

# Let's also print all frames where dy < -5 (looking UP)
print("\nFrames with negative dy (looking UP):")
for t in traj:
    if t['dy'] < -4:
        print(f"F{t['f']:03d}: dx={t['dx']:+5.1f}, dy={t['dy']:+5.1f}, dist={t['dist']:4.1f}, ang={t['ang']:5.1f}°")

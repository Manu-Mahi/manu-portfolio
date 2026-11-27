import cv2
import mediapipe as mp
import numpy as np
import math

mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=False, max_num_faces=1, refine_landmarks=True)

cap = cv2.VideoCapture('public/character.mp4')
w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

frames = []
for f in range(total_frames):
    ret, frame = cap.read()
    if not ret: break
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    res = face_mesh.process(rgb)
    if res.multi_face_landmarks:
        l = res.multi_face_landmarks[0].landmark
        nx, ny = l[1].x * w, l[1].y * h
        lx, rx = l[33].x * w, l[263].x * w
        ly, ry = l[33].y * h, l[263].y * h
        mx = (lx + rx) / 2
        my = (ly + ry) / 2
        frames.append({
            'f': f,
            'nx': nx, 'ny': ny,
            'mx': mx, 'my': my,
            'gaze_x': nx - mx,
            'gaze_y': ny - my
        })
    else:
        frames.append(None)
cap.release()

# Neutral frame is around 182-185
neutral_frame = 182
f_neut = frames[neutral_frame]
c_nx, c_ny = f_neut['nx'], f_neut['ny']
print(f"CENTER neutral frame: {neutral_frame} (nose at {c_nx:.1f}, {c_ny:.1f})")

# Let's inspect the entire trajectory from f=0 to f=170
# Calculate angle relative to center:
# In screen space:
# RIGHT: 0°
# DOWN-RIGHT: 45°
# DOWN: 90°
# DOWN-LEFT: 135°
# LEFT: 180°
# UP-LEFT: 225°
# UP: 270°
# UP-RIGHT: 315°
trajectory = []
for f in range(175):
    item = frames[f]
    if item is None: continue
    dx = item['nx'] - c_nx
    dy = item['ny'] - c_ny
    dist = math.hypot(dx, dy)
    ang = math.degrees(math.atan2(dy, dx)) % 360
    trajectory.append({
        'f': f,
        'dx': dx,
        'dy': dy,
        'dist': dist,
        'ang': ang
    })

# Let's find best candidate for each of the 8 directions
directions = [
    ("RIGHT", 0),
    ("DOWN-RIGHT", 45),
    ("DOWN", 90),
    ("DOWN-LEFT", 135),
    ("LEFT", 180),
    ("UP-LEFT", 225),
    ("UP", 270),
    ("UP-RIGHT", 315)
]

def ang_dist(a, b):
    d = abs(a - b) % 360
    return d if d <= 180 else 360 - d

print("\n--- 8 Compass Direction Candidate Search ---")
for name, target in directions:
    # Filter candidates with reasonable deflection
    candidates = [p for p in trajectory if p['dist'] > 20]
    best = min(candidates, key=lambda p: ang_dist(p['ang'], target))
    print(f"{name:12s} ({target:3d}°): Frame {best['f']:3d} | actual angle = {best['ang']:5.1f}° | error = {ang_dist(best['ang'], target):4.1f}° | dist = {best['dist']:4.1f}px")

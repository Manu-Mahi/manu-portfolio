import cv2
import mediapipe as mp
import numpy as np
import math

mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=False, max_num_faces=1, refine_landmarks=True)

cap = cv2.VideoCapture('public/character.mp4')
w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

# Let's inspect all 190 frames
frames_data = []
for f in range(190):
    ret, frame = cap.read()
    if not ret: break
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    res = face_mesh.process(rgb)
    if res.multi_face_landmarks:
        lms = res.multi_face_landmarks[0].landmark
        nose = np.array([lms[1].x * w, lms[1].y * h, lms[1].z * w])
        chin = np.array([lms[152].x * w, lms[152].y * h, lms[152].z * w])
        forehead = np.array([lms[10].x * w, lms[10].y * h, lms[10].z * w])
        l_eye = np.array([lms[33].x * w, lms[33].y * h, lms[33].z * w])
        r_eye = np.array([lms[263].x * w, lms[263].y * h, lms[263].z * w])
        center = (l_eye + r_eye) / 2
        
        # Horizontal turn: vector from eye center to nose (X component)
        # Vertical tilt: vector from eye center to nose (Y component relative to face height)
        face_len = np.linalg.norm(chin[:2] - forehead[:2])
        eye_len = np.linalg.norm(r_eye[:2] - l_eye[:2])
        
        yaw = (nose[0] - center[0]) / eye_len
        pitch = (nose[1] - center[1]) / face_len
        
        frames_data.append({
            'frame': f,
            'nose': (nose[0], nose[1]),
            'center': (center[0], center[1]),
            'yaw': yaw,
            'pitch': pitch
        })
    else:
        frames_data.append(None)
cap.release()

# Frame 182 as center reference
neutral = frames_data[182]
nyaw = neutral['yaw']
npitch = neutral['pitch']
print(f"Neutral reference at frame 182: yaw={nyaw:.4f}, pitch={npitch:.4f}")

# For each frame, compute delta yaw and delta pitch
# delta_yaw > 0: looking right (cursor right: dx > 0)
# delta_pitch > 0: looking down (cursor down: dy > 0)
# delta_pitch < 0: looking up (cursor up: dy < 0)
for fd in frames_data:
    if fd is None: continue
    dyaw = fd['yaw'] - nyaw
    dpitch = fd['pitch'] - npitch
    ang_rad = math.atan2(dpitch, dyaw) # dy, dx
    ang_deg = math.degrees(ang_rad) % 360
    dist = math.hypot(dyaw, dpitch)
    fd['dyaw'] = dyaw
    fd['dpitch'] = dpitch
    fd['angle'] = ang_deg
    fd['dist'] = dist

# Let's search for the 8 compass directions:
# RIGHT: ~0° (or 360°)
# DOWN-RIGHT: ~45°
# DOWN: ~90°
# DOWN-LEFT: ~135°
# LEFT: ~180°
# UP-LEFT: ~225°
# UP: ~270°
# UP-RIGHT: ~315°
compass_targets = {
    'RIGHT': 0,
    'DOWN-RIGHT': 45,
    'DOWN': 90,
    'DOWN-LEFT': 135,
    'LEFT': 180,
    'UP-LEFT': 225,
    'UP': 270,
    'UP-RIGHT': 315
}

print("\nClosest frames for each compass direction:")
for name, target_ang in compass_targets.items():
    # Only consider frames with significant deflection (dist > 0.05)
    valid = [f for f in frames_data if f and f['dist'] > 0.05 and f['frame'] < 175]
    if valid:
        def ang_diff(a, b):
            d = abs(a - b) % 360
            return d if d <= 180 else 360 - d
        best = min(valid, key=lambda x: ang_diff(x['angle'], target_ang))
        print(f"{name:12s} (target {target_ang:3d}°): Frame {best['frame']:3d} | measured {best['angle']:5.1f}° | dist={best['dist']:.3f} | dyaw={best['dyaw']:+.3f}, dpitch={best['dpitch']:+.3f}")

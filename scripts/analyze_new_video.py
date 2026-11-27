import cv2
import json
import math
import numpy as np
import mediapipe as mp

mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=False, max_num_faces=1, refine_landmarks=True)

cap = cv2.VideoCapture('public/character.mp4')
w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
print(f"Analyzing {total_frames} frames ({w}x{h})...")

frames_data = []
for f in range(total_frames):
    ret, frame = cap.read()
    if not ret: break
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    res = face_mesh.process(rgb)
    if res.multi_face_landmarks:
        l = res.multi_face_landmarks[0].landmark
        nx, ny, nz = l[1].x * w, l[1].y * h, l[1].z * w
        lx, ly = l[33].x * w, l[33].y * h
        rx, ry = l[263].x * w, l[263].y * h
        cx, cy = l[152].x * w, l[152].y * h
        fx, fy = l[10].x * w, l[10].y * h
        
        mx = (lx + rx) / 2
        my = (ly + ry) / 2
        
        eye_dist = math.hypot(rx - lx, ry - ly)
        face_len = math.hypot(cx - fx, cy - fy)
        
        # Horizontal turn (yaw proxy): nose offset from eye midpoint
        yaw = (nx - mx) / eye_dist
        # Vertical tilt (pitch proxy): nose offset from eye midpoint
        pitch = (ny - my) / face_len
        
        # Symmetry check (eye depth difference)
        eye_depth_diff = l[33].z - l[263].z
        
        frames_data.append({
            'f': f,
            'nx': nx, 'ny': ny,
            'mx': mx, 'my': my,
            'yaw': yaw,
            'pitch': pitch,
            'eye_depth_diff': eye_depth_diff,
            'eye_dist': eye_dist,
            'face_len': face_len
        })
    else:
        frames_data.append(None)

cap.release()

# 1. Find Neutral Pose at the end of the video
# The user said: "with a neutral pose looking directly at the camera at the end."
# In the last 30 frames, find the frame with eye_depth_diff closest to 0 and yaw closest to 0
end_frames = [fd for fd in frames_data[-35:] if fd is not None]
neutral_frame_obj = min(end_frames, key=lambda d: abs(d['yaw']) + abs(d['eye_depth_diff']) * 2)
neutral_frame_idx = neutral_frame_obj['f']
print(f"\n--- NEUTRAL POSE (CENTER) ---")
print(f"Neutral Frame: {neutral_frame_idx}")
print(f"Nose Coordinates: ({neutral_frame_obj['nx']:.2f}, {neutral_frame_obj['ny']:.2f})")
print(f"Face Midpoint: ({neutral_frame_obj['mx']:.2f}, {neutral_frame_obj['my']:.2f})")
print(f"Yaw: {neutral_frame_obj['yaw']:+.4f}, Pitch: {neutral_frame_obj['pitch']:+.4f}, Eye Depth Diff: {neutral_frame_obj['eye_depth_diff']:+.4f}")

ref_nx = neutral_frame_obj['nx']
ref_ny = neutral_frame_obj['ny']
ref_yaw = neutral_frame_obj['yaw']
ref_pitch = neutral_frame_obj['pitch']

# 2. Analyze the trajectory relative to neutral pose
trajectory = []
for fd in frames_data:
    if fd is None: continue
    dx = fd['nx'] - ref_nx
    dy = fd['ny'] - ref_ny
    dyaw = fd['yaw'] - ref_yaw
    dpitch = fd['pitch'] - ref_pitch
    
    # In screen coordinates:
    # dx > 0 is right, dy > 0 is down
    ang_rad = math.atan2(dy, dx)
    ang_deg = math.degrees(ang_rad) % 360
    dist = math.hypot(dx, dy)
    
    # Gaze angle using dyaw and dpitch:
    gaze_ang_deg = math.degrees(math.atan2(dpitch, dyaw)) % 360
    gaze_dist = math.hypot(dyaw, dpitch)
    
    trajectory.append({
        'f': fd['f'],
        'nx': fd['nx'], 'ny': fd['ny'],
        'dx': dx, 'dy': dy,
        'dist': dist,
        'ang': ang_deg,
        'dyaw': dyaw,
        'dpitch': dpitch,
        'gaze_ang': gaze_ang_deg,
        'gaze_dist': gaze_dist
    })

# Print trajectory every 6 frames
print("\n--- TIMELINE SAMPLE ---")
print(f"{'Frame':>5} | {'Nose (X, Y)':>16} | {'dx':>6} | {'dy':>6} | {'Dist':>5} | {'Angle':>7} | {'dyaw':>7} | {'dpitch':>7}")
print("-" * 75)
for t in trajectory[::6]:
    print(f"{t['f']:5d} | ({t['nx']:6.1f}, {t['ny']:6.1f}) | {t['dx']:+6.1f} | {t['dy']:+6.1f} | {t['dist']:5.1f} | {t['ang']:6.1f}° | {t['dyaw']:+7.3f} | {t['dpitch']:+7.3f}")

# Save trajectory to json for detailed analysis
with open('new_trajectory.json', 'w') as f:
    json.dump(trajectory, f, indent=2)

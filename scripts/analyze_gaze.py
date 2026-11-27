import cv2
import mediapipe as mp
import numpy as np
import math

mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=False, max_num_faces=1, refine_landmarks=True)

cap = cv2.VideoCapture('public/character.mp4')
w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

# Neutral reference at frame 182
cap.set(cv2.CAP_PROP_POS_FRAMES, 182)
_, f182 = cap.read()
res182 = face_mesh.process(cv2.cvtColor(f182, cv2.COLOR_BGR2RGB))
l182 = res182.multi_face_landmarks[0].landmark
ref_nose = np.array([l182[1].x * w, l182[1].y * h, l182[1].z * w])
ref_eyes = np.array([(l182[33].x + l182[263].x)/2 * w, (l182[33].y + l182[263].y)/2 * h, (l182[33].z + l182[263].z)/2 * w])

cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
angles = []
for f in range(190):
    ret, frame = cap.read()
    if not ret: break
    res = face_mesh.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    if res.multi_face_landmarks:
        l = res.multi_face_landmarks[0].landmark
        nose = np.array([l[1].x * w, l[1].y * h, l[1].z * w])
        eyes = np.array([(l[33].x + l[263].x)/2 * w, (l[33].y + l[263].y)/2 * h, (l[33].z + l[263].z)/2 * w])
        
        # Look direction relative to eye center
        # vx: gaze left/right (positive = character looking viewer's right)
        # vy: gaze up/down (positive = character looking down)
        # vz: gaze forward/backward
        vec = nose - eyes
        ref_vec = ref_nose - ref_eyes
        
        # Difference in gaze direction from neutral:
        diff_x = vec[0] - ref_vec[0]
        diff_y = vec[1] - ref_vec[1]
        
        # Also let's check nose movement directly
        nose_dx = nose[0] - ref_nose[0]
        nose_dy = nose[1] - ref_nose[1]
        
        # Let's compute angle in screen space:
        # Cursor angle: atan2(cursor_y - face_y, cursor_x - face_x)
        # 0 rad (0 deg) = Right
        # pi/2 (90 deg) = Down
        # pi (180 deg) = Left
        # -pi/2 (-90 or 270 deg) = Up
        ang_rad = math.atan2(nose_dy, nose_dx)
        ang_deg = math.degrees(ang_rad) % 360
        
        dist = math.hypot(nose_dx, nose_dy)
        angles.append((f, ang_deg, dist, nose_dx, nose_dy, diff_x, diff_y))

cap.release()

print("Frame-by-frame gaze analysis:")
print(f"{'F':>4} | {'Angle':>7} | {'Dist':>6} | {'nose_dx':>8} | {'nose_dy':>8} | {'diff_x':>8} | {'diff_y':>8}")
for a in angles[::5]:
    print(f"{a[0]:4d} | {a[1]:7.1f}° | {a[2]:6.1f} | {a[3]:+8.2f} | {a[4]:+8.2f} | {a[5]:+8.2f} | {a[6]:+8.2f}")

import cv2
import mediapipe as mp
import numpy as np
import math

mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=False, max_num_faces=1, refine_landmarks=True)

cap = cv2.VideoCapture('public/character.mp4')
w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

# Let's read frame 182 as center reference
neutral_f = 182
cap.set(cv2.CAP_PROP_POS_FRAMES, neutral_f)
_, f182 = cap.read()
res182 = face_mesh.process(cv2.cvtColor(f182, cv2.COLOR_BGR2RGB))
l182 = res182.multi_face_landmarks[0].landmark
ref_nx = l182[1].x * w
ref_ny = l182[1].y * h
ref_gx = (l182[33].x + l182[263].x)/2 * w
ref_gy = (l182[33].y + l182[263].y)/2 * h
ref_gaze_x = ref_nx - ref_gx
ref_gaze_y = ref_ny - ref_gy

cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
results = []
for f in range(190):
    ret, frame = cap.read()
    if not ret: break
    res = face_mesh.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    if res.multi_face_landmarks:
        l = res.multi_face_landmarks[0].landmark
        nx = l[1].x * w
        ny = l[1].y * h
        gx = (l[33].x + l[263].x)/2 * w
        gy = (l[33].y + l[263].y)/2 * h
        gaze_x = (nx - gx) - ref_gaze_x
        gaze_y = (ny - gy) - ref_gaze_y
        
        # In screen coordinates:
        # X: positive = right, negative = left
        # Y: positive = down, negative = up
        # Cursor angle: atan2(cursor_y - face_y, cursor_x - face_x)
        # So when cursor is right, angle = 0
        # When cursor is down, angle = 90 deg (pi/2)
        # When cursor is left, angle = 180 deg (pi)
        # When cursor is up, angle = 270 deg (or -90 deg)
        ang_rad = math.atan2(gaze_y, gaze_x)
        ang_deg = math.degrees(ang_rad) % 360
        dist = math.hypot(gaze_x, gaze_y)
        results.append((f, ang_deg, dist, gaze_x, gaze_y))
    else:
        results.append((f, None, None, None, None))
cap.release()

print("Timeline angles:")
for r in results:
    if r[1] is not None:
        f, ang, dist, gx, gy = r
        if f % 3 == 0 or f >= 165:
            bar = "#" * int(dist)
            print(f"F{f:03d}: ang={ang:5.1f}°, dist={dist:4.1f}, gx={gx:+5.1f}, gy={gy:+5.1f} | {bar}")

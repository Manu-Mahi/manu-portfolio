import cv2
import mediapipe as mp
import numpy as np

# Let's inspect the yaw and pitch from solvePnP or face mesh for all frames 0 to 189
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=False, max_num_faces=1, refine_landmarks=True)

cap = cv2.VideoCapture('public/character.mp4')
w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

neutral_idx = 182
cap.set(cv2.CAP_PROP_POS_FRAMES, neutral_idx)
_, f182 = cap.read()
res182 = face_mesh.process(cv2.cvtColor(f182, cv2.COLOR_BGR2RGB))
l182 = res182.multi_face_landmarks[0].landmark
nx_ref = l182[1].x * w
ny_ref = l182[1].y * h

cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
f_info = []
for i in range(190):
    ret, fr = cap.read()
    if not ret: break
    res = face_mesh.process(cv2.cvtColor(fr, cv2.COLOR_BGR2RGB))
    if res.multi_face_landmarks:
        l = res.multi_face_landmarks[0].landmark
        nx = l[1].x * w
        ny = l[1].y * h
        # also eye centers
        lx = l[33].x * w
        rx = l[263].x * w
        mx = (lx + rx) / 2
        my = (l[33].y + l[263].y) / 2 * h
        f_info.append({
            'f': i,
            'nx': nx, 'ny': ny,
            'dx': nx - nx_ref,
            'dy': ny - ny_ref,
            'gaze_x': nx - mx,
            'gaze_y': ny - my
        })
    else:
        f_info.append({'f': i, 'dx': None})
cap.release()

# Let's output every 10 frames
for item in f_info[::10]:
    if item.get('dx') is not None:
        print(f"F{item['f']:03d}: dx={item['dx']:+6.1f}, dy={item['dy']:+6.1f}, gaze_x={item['gaze_x']:+6.1f}, gaze_y={item['gaze_y']:+6.1f}")

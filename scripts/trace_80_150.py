import cv2
import mediapipe as mp
import numpy as np
import math

mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=False, max_num_faces=1)

cap = cv2.VideoCapture('public/character.mp4')
w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

# Frame 182 as center
cap.set(cv2.CAP_PROP_POS_FRAMES, 182)
_, f182 = cap.read()
res182 = face_mesh.process(cv2.cvtColor(f182, cv2.COLOR_BGR2RGB))
l182 = res182.multi_face_landmarks[0].landmark
cnx, cny = l182[1].x * w, l182[1].y * h

cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
all_frames = []
for i in range(190):
    ret, fr = cap.read()
    if not ret: break
    res = face_mesh.process(cv2.cvtColor(fr, cv2.COLOR_BGR2RGB))
    if res.multi_face_landmarks:
        l = res.multi_face_landmarks[0].landmark
        nx, ny = l[1].x * w, l[1].y * h
        dx, dy = nx - cnx, ny - cny
        ang = math.degrees(math.atan2(dy, dx)) % 360
        dist = math.hypot(dx, dy)
        all_frames.append({'f': i, 'dx': dx, 'dy': dy, 'ang': ang, 'dist': dist, 'nx': nx, 'ny': ny})
    else:
        all_frames.append(None)
cap.release()

print("Frame 80 to 150 detailed trajectory:")
print(f"{'F':>4} | {'dx':>7} | {'dy':>7} | {'ang':>6} | {'dist':>5}")
for i in range(80, 151, 2):
    item = all_frames[i]
    if item:
        print(f"{item['f']:4d} | {item['dx']:+7.1f} | {item['dy']:+7.1f} | {item['ang']:5.1f}° | {item['dist']:5.1f}")

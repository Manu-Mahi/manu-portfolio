import cv2
import mediapipe as mp
import numpy as np

mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=False, max_num_faces=1, refine_landmarks=True)

cap = cv2.VideoCapture('public/character.mp4')
w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

records = []
for f in range(190):
    ret, frame = cap.read()
    if not ret: break
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    res = face_mesh.process(rgb)
    if res.multi_face_landmarks:
        l = res.multi_face_landmarks[0].landmark
        nx, ny, nz = l[1].x, l[1].y, l[1].z
        lx, ly, lz = l[33].x, l[33].y, l[33].z
        rx, ry, rz = l[263].x, l[263].y, l[263].z
        cx, cy, cz = l[152].x, l[152].y, l[152].z
        fx, fy, fz = l[10].x, l[10].y, l[10].z
        
        hx = (lx + rx) / 2
        hy = (ly + ry) / 2
        
        dx = nx - hx
        dy = ny - hy
        
        records.append({
            'frame': f,
            'dx': dx,
            'dy': dy,
            'nz': nz,
            'lz_rz': lz - rz
        })
    else:
        records.append({'frame': f, 'dx': None})

cap.release()

print("Frame |   dx (L/R) |   dy (U/D) |  lz - rz   | Pose")
print("-" * 50)
for r in records:
    f = r['frame']
    if f % 4 == 0 or f >= 170:
        if r['dx'] is not None:
            dx, dy = r['dx'], r['dy']
            lr = 'RIGHT' if dx > 0.015 else ('LEFT' if dx < -0.015 else 'MID')
            ud = 'DOWN' if dy > 0.155 else ('UP' if dy < 0.135 else 'MID')
            print(f"{f:5d} | {dx:+10.4f} | {dy:10.4f} | {r['lz_rz']:+10.4f} | {ud}-{lr}")

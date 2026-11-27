import cv2
import numpy as np

compass_frames = {
    'RIGHT': 85,
    'DOWN-RIGHT': 115,
    'DOWN': 128,
    'DOWN-LEFT': 139,
    'LEFT': 148,
    'UP-LEFT': 33,
    'UP': 37,
    'UP-RIGHT': 60,
    'CENTER': 182
}

cap = cv2.VideoCapture('public/character.mp4')
crops = {}
for name, f_num in compass_frames.items():
    cap.set(cv2.CAP_PROP_POS_FRAMES, f_num)
    ret, frame = cap.read()
    if ret:
        crop = frame[100:520, 420:840]
        crop = cv2.resize(crop, (200, 200))
        cv2.putText(crop, f"{name} (F{f_num})", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
        crops[name] = crop
cap.release()

# Arrange in 3x3 compass layout:
# UP-LEFT    UP       UP-RIGHT
# LEFT       CENTER   RIGHT
# DOWN-LEFT  DOWN     DOWN-RIGHT
row1 = np.hstack([crops['UP-LEFT'], crops['UP'], crops['UP-RIGHT']])
row2 = np.hstack([crops['LEFT'], crops['CENTER'], crops['RIGHT']])
row3 = np.hstack([crops['DOWN-LEFT'], crops['DOWN'], crops['DOWN-RIGHT']])
grid = np.vstack([row1, row2, row3])

cv2.imwrite('temp_inspect/compass_3x3_grid.jpg', grid)
print("Compass 3x3 grid saved: temp_inspect/compass_3x3_grid.jpg")

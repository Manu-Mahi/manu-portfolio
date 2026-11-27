import cv2
import mediapipe as mp
import numpy as np

# Let's inspect frames 70 to 125
cap = cv2.VideoCapture('public/character.mp4')
for f in range(70, 125, 5):
    cap.set(cv2.CAP_PROP_POS_FRAMES, f)
    ret, fr = cap.read()
    # draw a small crop of face
    crop = fr[120:500, 440:820]
    cv2.putText(crop, f"F{f}", (15, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
    cv2.imwrite(f"temp_inspect/right_turn_{f:03d}.jpg", crop)
cap.release()
print("Saved right_turn_*.jpg")

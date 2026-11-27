import cv2
import numpy as np

cap = cv2.VideoCapture('public/character.mp4')
colors = []
for f in range(0, 190, 10):
    cap.set(cv2.CAP_PROP_POS_FRAMES, f)
    ret, frame = cap.read()
    if ret:
        # Sample top-left corner 20x20
        tl = frame[5:25, 5:25]
        # Sample top-right corner 20x20
        tr = frame[5:25, -25:-5]
        # Sample bottom-left corner 20x20
        bl = frame[-25:-5, 5:25]
        # Sample bottom-right corner 20x20
        br = frame[-25:-5, -25:-5]
        
        avg_bgr = np.mean([tl, tr, bl, br], axis=(0, 1, 2))
        colors.append(avg_bgr)
cap.release()

mean_bgr = np.mean(colors, axis=0)
mean_rgb = mean_bgr[::-1].astype(int)
hex_color = "#{:02x}{:02x}{:02x}".format(mean_rgb[0], mean_rgb[1], mean_rgb[2])
print(f"Detected Background BGR: {mean_bgr}")
print(f"Detected Background RGB: {mean_rgb}")
print(f"Detected Background Hex: {hex_color}")

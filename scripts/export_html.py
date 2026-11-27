import cv2
import json

# Let's write an HTML file to visually view all 190 frames in browser or inspect them
html = ["<!DOCTYPE html><html><head><style>",
        "body { background: #111; color: #fff; font-family: sans-serif; display: flex; flex-wrap: wrap; gap: 4px; }",
        ".f { width: 120px; font-size: 11px; text-align: center; }",
        "img { width: 100%; border: 1px solid #333; }",
        "</style></head><body>"]

cap = cv2.VideoCapture('public/character.mp4')
for f in range(0, 190, 2):
    cap.set(cv2.CAP_PROP_POS_FRAMES, f)
    ret, frame = cap.read()
    if ret:
        crop = frame[120:500, 440:820]
        crop = cv2.resize(crop, (120, 120))
        cv2.imwrite(f'temp_inspect/f_{f:03d}.jpg', crop)
        html.append(f"<div class='f'><img src='f_{f:03d}.jpg'/>F{f}</div>")
cap.release()
html.append("</body></html>")

with open('temp_inspect/view_frames.html', 'w') as f:
    f.write("\n".join(html))

print("Created temp_inspect/view_frames.html with frames every 2 steps.")

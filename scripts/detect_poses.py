import cv2
import numpy as np

# Let's compute frame-to-frame difference (motion energy)
cap = cv2.VideoCapture('public/character.mp4')
prev = None
diffs = []
frames = []
idx = 0
while True:
    ret, frame = cap.read()
    if not ret: break
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    # Face crop
    face_crop = gray[120:500, 440:820]
    if prev is not None:
        d = np.mean(np.abs(face_crop.astype(float) - prev.astype(float)))
        diffs.append((idx, d))
    prev = face_crop
    frames.append(frame)
    idx += 1
cap.release()

# Let's print moving average of diffs to see when motion happens and when it pauses (local minima of motion = held poses)
window = 5
smoothed = []
for i in range(len(diffs)):
    sub = [d[1] for d in diffs[max(0, i-window):min(len(diffs), i+window+1)]]
    smoothed.append((diffs[i][0], np.mean(sub)))

print("Low motion (held poses) frames:")
# find local minima where motion drops
minima = []
for i in range(1, len(smoothed)-1):
    if smoothed[i][1] < smoothed[i-1][1] and smoothed[i][1] < smoothed[i+1][1] and smoothed[i][1] < 3.0:
        minima.append(smoothed[i])

for m in minima:
    print(f"Frame {m[0]}: motion = {m[1]:.2f}")

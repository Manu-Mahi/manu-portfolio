import cv2

cap = cv2.VideoCapture('public/character.mp4')
total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
print("Total frames in character.mp4:", total)

# Let's inspect where in the video the rotation happens.
# Let's find the start and end of the circular rotation.
# In timeline_angles.py:
# Around frame 0..30: Left / Up-Left
# Frame 40..45: Up
# Frame 50..65: Up-Right
# Frame 75..95: Right
# Frame 115..140: Down-Right / Down / Down-Left / Left?
# Let's check frames 70 to 170 in steps of 2!
cap.release()

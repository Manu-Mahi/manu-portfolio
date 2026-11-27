import cv2
import os
import numpy as np

def extract_all():
    video_path = 'public/character.mp4'
    frames_dir = 'public/frames'
    os.makedirs(frames_dir, exist_ok=True)
    
    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    print(f"Loaded {video_path}: {total_frames} total frames.")
    
    # Anchors for 8 compass directions
    # k = 0: 0° (RIGHT) -> Frame 78
    # k = 8: 45° (DOWN-RIGHT) -> Frame 116
    # k = 16: 90° (DOWN) -> Frame 121
    # k = 24: 135° (DOWN-LEFT) -> Frame 124
    # k = 32: 180° (LEFT) -> Frame 152
    # k = 40: 225° (UP-LEFT) -> Frame 168
    # k = 48: 270° (UP) -> Frame 24
    # k = 56: 315° (UP-RIGHT) -> Frame 40
    # k = 64: 360° (RIGHT) -> Frame 78
    
    anchors = [
        (0, 78.0),    # RIGHT (0°)
        (8, 116.0),   # DOWN-RIGHT (45°)
        (16, 121.0),  # DOWN (90°)
        (24, 124.0),  # DOWN-LEFT (135°)
        (32, 152.0),  # LEFT (180°)
        (40, 168.0),  # UP-LEFT (225°)
        (48, 24.0),   # UP (270°)
        (56, 40.0),   # UP-RIGHT (315°)
        (64, 78.0)    # RIGHT (360°)
    ]
    
    frame_indices = []
    for k in range(64):
        for s in range(len(anchors) - 1):
            k_start, f_start = anchors[s]
            k_end, f_end = anchors[s + 1]
            if k_start <= k < k_end:
                t = (k - k_start) / (k_end - k_start)
                if k_start == 40 and k_end == 48:
                    # Transition from UP-LEFT (Frame 168-175) wrapping through Frame 0-10 to Frame 24
                    # Frame 168 to 176 is ~8 frames, then 0 to 24 is 24 frames -> total ~32 frames wrap
                    if t < 0.35:
                        f_val = 168.0 + (t / 0.35) * (176.0 - 168.0)
                    else:
                        sub_t = (t - 0.35) / 0.65
                        f_val = 0.0 + sub_t * 24.0
                else:
                    f_val = f_start + t * (f_end - f_start)
                frame_indices.append(round(f_val) % total_frames)
                break
    
    print(f"Computed frame mappings for 64 circular slices: {frame_indices}")
    
    webp_params = [cv2.IMWRITE_WEBP_QUALITY, 95]
    
    extracted_frames = []
    for k, f_num in enumerate(frame_indices):
        cap.set(cv2.CAP_PROP_POS_FRAMES, f_num)
        ret, frame = cap.read()
        if not ret:
            print(f"Error reading frame {f_num}")
            continue
        
        # Save both frame_k.webp and k.webp
        out_path1 = os.path.join(frames_dir, f"frame_{k}.webp")
        out_path2 = os.path.join(frames_dir, f"{k}.webp")
        cv2.imwrite(out_path1, frame, webp_params)
        cv2.imwrite(out_path2, frame, webp_params)
        extracted_frames.append(out_path1)
    
    # Extract CENTER neutral frame (Frame 186)
    center_frame_num = 186
    cap.set(cv2.CAP_PROP_POS_FRAMES, center_frame_num)
    ret, center_frame = cap.read()
    if ret:
        cv2.imwrite(os.path.join(frames_dir, "center.webp"), center_frame, webp_params)
        cv2.imwrite("public/center.webp", center_frame, webp_params)
        print("Saved center.webp successfully (Frame 186).")
    
    cap.release()
    print(f"Successfully extracted {len(extracted_frames)} WebP frames into {frames_dir}/")

if __name__ == '__main__':
    extract_all()

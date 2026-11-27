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
    
    # Define 8 compass anchors (target_index 0..64, source_video_frame)
    # k = 0 is 0° (RIGHT)
    # k = 8 is 45° (DOWN-RIGHT)
    # k = 16 is 90° (DOWN)
    # k = 24 is 135° (DOWN-LEFT)
    # k = 32 is 180° (LEFT)
    # k = 40 is 225° (UP-LEFT)
    # k = 48 is 270° (UP)
    # k = 56 is 315° (UP-RIGHT)
    # k = 64 is 360° (= 0°)
    
    anchors = [
        (0, 85.0),    # RIGHT (0°)
        (8, 110.0),   # DOWN-RIGHT (45°)
        (16, 128.0),  # DOWN (90°)
        (24, 139.0),  # DOWN-LEFT (135°)
        (32, 148.0),  # LEFT (180°)
        (40, 28.0),   # UP-LEFT (225°) -> transition through 20-33
        (48, 37.0),   # UP (270°)
        (56, 60.0),   # UP-RIGHT (315°)
        (64, 85.0)    # RIGHT (360°)
    ]
    
    # Note: between k=32 (180°) and k=40 (225°):
    # In the video, Frame 148 is LEFT (~180°), and Frame 12-24 is also LEFT (~180°).
    # Moving from Frame 16 to Frame 33 smoothly transitions from LEFT (180°) to UP-LEFT (225°).
    # So for k in [32, 40], we can interpolate from Frame 16 to Frame 33!
    
    # Calculate mapping for each of the 64 frames (0 to 63)
    frame_indices = []
    for k in range(64):
        # Find which segment k falls into
        for s in range(len(anchors) - 1):
            k_start, f_start = anchors[s]
            k_end, f_end = anchors[s + 1]
            if k_start <= k < k_end:
                t = (k - k_start) / (k_end - k_start)
                if k_start == 32 and k_end == 40:
                    # Special smooth transition from LEFT (Frame 16) to UP-LEFT (Frame 33)
                    f_val = 16.0 + t * (33.0 - 16.0)
                else:
                    f_val = f_start + t * (f_end - f_start)
                frame_indices.append(round(f_val))
                break
    
    print(f"Computed frame mappings for 64 circular slices: {frame_indices}")
    
    # Pre-extract the 64 frames as high-quality WebP
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
    
    # Extract CENTER neutral frame (Frame 182)
    center_frame_num = 182
    cap.set(cv2.CAP_PROP_POS_FRAMES, center_frame_num)
    ret, center_frame = cap.read()
    if ret:
        cv2.imwrite(os.path.join(frames_dir, "center.webp"), center_frame, webp_params)
        cv2.imwrite("public/center.webp", center_frame, webp_params)
        print("Saved center.webp successfully.")
    
    cap.release()
    print(f"Successfully extracted {len(extracted_frames)} WebP frames into {frames_dir}/")

if __name__ == '__main__':
    extract_all()

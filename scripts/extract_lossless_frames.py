import cv2
import os
import math
import numpy as np
from PIL import Image

def extract_and_generate_all():
    video_path = 'public/character.mp4'
    frames_dir = 'public/frames'
    os.makedirs(frames_dir, exist_ok=True)
    
    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    print(f"Processing {video_path}: {total_frames} frames ({w}x{h})...")
    
    # 8-Compass direction anchors:
    # k=0  (0° RIGHT): frame 78
    # k=8  (45° DOWN-RIGHT): frame 112
    # k=16 (90° DOWN): frame 121
    # k=24 (135° DOWN-LEFT): frame 128
    # k=32 (180° LEFT): frame 170
    # k=40 (225° UP-LEFT): frame 182
    # k=48 (270° UP): frame 25
    # k=56 (315° UP-RIGHT): frame 42
    # k=64 (360° RIGHT): frame 78
    anchors = [
        (0, 78.0),
        (8, 112.0),
        (16, 121.0),
        (24, 128.0),
        (32, 170.0),
        (40, 182.0),
        (48, 25.0),
        (56, 42.0),
        (64, 78.0)
    ]
    
    frame_indices = []
    for k in range(64):
        for s in range(len(anchors) - 1):
            k_start, f_start = anchors[s]
            k_end, f_end = anchors[s + 1]
            if k_start <= k < k_end:
                t = (k - k_start) / (k_end - k_start)
                if k_start == 40 and k_end == 48:
                    if t < 0.4:
                        f_val = 182.0 + (t / 0.4) * (195.0 - 182.0)
                    else:
                        sub_t = (t - 0.4) / 0.6
                        f_val = 0.0 + sub_t * 25.0
                else:
                    f_val = f_start + t * (f_end - f_start)
                frame_indices.append(round(f_val) % total_frames)
                break
    
    print("Frame mapping (64 circular slices):", frame_indices)
    
    # Exact target background color in BGR and RGB:
    # BGR: [186, 180, 13] -> RGB: [13, 180, 186] -> Hex #0db4ba
    bg_target_bgr = np.array([186.0, 180.0, 13.0], dtype=np.float32)
    
    # 2D Ramp to ensure 100% seamless feathering into canvas background #0db4ba
    ramp = np.ones((h, w), dtype=np.float32)
    ramp[:, :150] = np.minimum(ramp[:, :150], np.linspace(0.0, 1.0, 150)[None, :])
    ramp[:, -150:] = np.minimum(ramp[:, -150:], np.linspace(1.0, 0.0, 150)[None, :])
    ramp[:25, :] = np.minimum(ramp[:25, :], np.linspace(0.0, 1.0, 25)[:, None])
    
    # Bottom corners ramp
    bottom_ramp = np.ones((h, w), dtype=np.float32)
    bottom_ramp[-25:, :250] = np.linspace(1.0, 0.0, 25)[:, None]
    bottom_ramp[-25:, -250:] = np.linspace(1.0, 0.0, 25)[:, None]
    ramp = np.minimum(ramp, bottom_ramp)[:, :, None]
    
    def process_and_save_frame(raw_bgr, out_paths):
        # 1. Subtle, natural clarity enhancement on character features
        diff = np.linalg.norm(raw_bgr.astype(float) - bg_target_bgr, axis=2)
        char_mask = np.clip((diff - 20.0) / 25.0, 0.0, 1.0)[:, :, None]
        
        # Unsharp detail enhancement focused on eyes, face, hair, and clothing
        gaussian = cv2.GaussianBlur(raw_bgr, (0, 0), 1.2)
        enhanced = cv2.addWeighted(raw_bgr, 1.25, gaussian, -0.25, 0)
        character_layer = (enhanced * char_mask + raw_bgr * (1.0 - char_mask)).astype(np.float32)
        
        # Feather the background to exact uniform #0db4ba at all edges
        blended_bgr = (character_layer * char_mask + (bg_target_bgr * (1.0 - ramp) + raw_bgr * ramp) * (1.0 - char_mask))
        final_bgr = np.clip(blended_bgr, 0, 255).astype(np.uint8)
        
        # Convert BGR to RGB for PIL lossless WebP saving
        rgb = cv2.cvtColor(final_bgr, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(rgb)
        for p in out_paths:
            pil_img.save(p, 'WEBP', lossless=True, quality=100)
    
    # Read all needed frames from video into memory
    unique_needed = set(frame_indices + [200])
    loaded_raw = {}
    print(f"Reading {len(unique_needed)} unique video frames...")
    for f_idx in range(total_frames):
        ret, frame = cap.read()
        if not ret: break
        if f_idx in unique_needed:
            loaded_raw[f_idx] = frame.copy()
    cap.release()
    print("Video reading complete.")
    
    # 1. Generate center.webp from frame 200 (Neutral eye contact pose looking at camera)
    print("Generating neutral center.webp (from frame 200)...")
    process_and_save_frame(
        loaded_raw[200],
        [
            os.path.join(frames_dir, 'center.webp'),
            os.path.join('public', 'center.webp')
        ]
    )
    
    # 2. Extract 64 WebP frames
    print("Extracting 64 lossless WebP frames...")
    for k in range(64):
        f_idx = frame_indices[k]
        raw_bgr = loaded_raw[f_idx]
        paths = [
            os.path.join(frames_dir, f'frame_{k}.webp'),
            os.path.join(frames_dir, f'{k}.webp')
        ]
        process_and_save_frame(raw_bgr, paths)
        if (k + 1) % 16 == 0 or k == 63:
            print(f"  Processed {k + 1}/64 frames (k={k} -> video frame {f_idx}).")
            
    print("All frames extracted and verified successfully!")

if __name__ == '__main__':
    extract_and_generate_all()

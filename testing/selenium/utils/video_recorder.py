# ==============================================================================
# VIDEO RECORDER — Quay màn hình Selenium bằng cách chụp frame liên tục
# ==============================================================================
# Cơ chế: Thread nền liên tục chụp screenshot từ driver → ghép thành video MP4
# Thư viện: OpenCV (cv2) + threading
# ==============================================================================

import os
import cv2
import time
import threading
import numpy as np
from io import BytesIO
from PIL import Image


class SeleniumVideoRecorder:
    """
    Quay màn hình Selenium bằng cách capture screenshot liên tục và ghép thành video MP4.
    
    Usage:
        recorder = SeleniumVideoRecorder(driver, "screenshots/test_login.mp4")
        recorder.start()
        # ... thực hiện test ...
        recorder.stop()
    """

    def __init__(self, driver, output_path: str, fps: int = 5):
        """
        Args:
            driver: Selenium WebDriver
            output_path: Đường dẫn lưu file video (.mp4 hoặc .avi)
            fps: Số frame mỗi giây (5 fps là đủ cho test recording)
        """
        self.driver = driver
        self.output_path = output_path
        self.fps = fps
        self._frames = []
        self._recording = False
        self._thread = None
        self._lock = threading.Lock()

    def start(self):
        """Bắt đầu quay màn hình (chạy ở thread nền)."""
        self._recording = True
        self._frames = []
        self._thread = threading.Thread(target=self._capture_loop, daemon=True)
        self._thread.start()

    def _capture_loop(self):
        """Vòng lặp chụp screenshot liên tục cho đến khi stop()."""
        interval = 1.0 / self.fps
        while self._recording:
            try:
                png_bytes = self.driver.get_screenshot_as_png()
                img = Image.open(BytesIO(png_bytes)).convert("RGB")
                frame = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
                with self._lock:
                    self._frames.append(frame)
            except Exception:
                pass  # Driver có thể đang đóng
            time.sleep(interval)

    def stop(self):
        """Dừng quay và lưu video ra file."""
        self._recording = False
        if self._thread:
            self._thread.join(timeout=3)

        with self._lock:
            frames = list(self._frames)

        if not frames:
            print(f"⚠️  Không có frame nào để tạo video: {self.output_path}")
            return

        os.makedirs(os.path.dirname(self.output_path) if os.path.dirname(self.output_path) else ".", exist_ok=True)

        height, width, _ = frames[0].shape
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        writer = cv2.VideoWriter(self.output_path, fourcc, self.fps, (width, height))

        for frame in frames:
            writer.write(frame)
        writer.release()

        print(f"🎬 Video saved: {self.output_path} ({len(frames)} frames, {len(frames)/self.fps:.1f}s)")

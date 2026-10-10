import os
import math
import random
from PIL import Image, ImageDraw

def create_samples(out_dir: str):
    os.makedirs(out_dir, exist_ok=True)
    width, height = 512, 384

    # 1. Ghost Net
    img1 = Image.new("RGB", (width, height), (8, 14, 22))
    draw1 = ImageDraw.Draw(img1)
    # Add subtle seabed ripple texture
    for y in range(height):
        for x in range(0, width, 4):
            v = int(22 + 10 * math.sin(x * 0.04 + y * 0.02) + random.randint(0, 15))
            draw1.point((x, y), fill=(v // 2, v, v + 5))
    # Draw acoustic shadow
    draw1.rectangle([210, 150, 340, 240], fill=(3, 5, 8))
    # Draw high-reflectivity tangled net highlight
    for _ in range(80):
        x1 = random.randint(150, 230)
        y1 = random.randint(120, 210)
        x2 = x1 + random.randint(-25, 25)
        y2 = y1 + random.randint(-25, 25)
        bright = random.randint(190, 255)
        draw1.line([(x1, y1), (x2, y2)], fill=(bright, bright, int(bright * 0.8)), width=random.randint(1, 3))
    img1.save(os.path.join(out_dir, "ghost_net.png"))

    # 2. Sunken Pipe
    img2 = Image.new("RGB", (width, height), (8, 14, 22))
    draw2 = ImageDraw.Draw(img2)
    for y in range(height):
        for x in range(0, width, 4):
            v = int(24 + 8 * math.sin(y * 0.05) + random.randint(0, 14))
            draw2.point((x, y), fill=(v // 2, v, v + 5))
    # Sharp linear acoustic shadow behind pipe
    draw2.polygon([(180, 155), (350, 215), (345, 250), (175, 190)], fill=(2, 4, 6))
    # Strong specular linear highlight
    draw2.line([(160, 140), (330, 200)], fill=(255, 255, 210), width=6)
    draw2.line([(162, 142), (332, 202)], fill=(220, 235, 255), width=2)
    img2.save(os.path.join(out_dir, "sunken_pipe.png"))

    # 3. Natural Seafloor
    img3 = Image.new("RGB", (width, height), (8, 14, 22))
    draw3 = ImageDraw.Draw(img3)
    for y in range(height):
        for x in range(width):
            wave = math.sin(x * 0.06 + y * 0.03) * 14 + math.sin(x * 0.02) * 8
            v = max(10, min(80, int(35 + wave + random.randint(-6, 6))))
            draw3.point((x, y), fill=(v // 3, v, int(v * 1.1)))
    img3.save(os.path.join(out_dir, "seafloor.png"))
    print("Samples generated successfully.")

if __name__ == "__main__":
    target = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "samples"))
    create_samples(target)

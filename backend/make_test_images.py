from PIL import Image, ImageDraw
import os
dst = os.path.join(os.path.dirname(__file__), "test_images")
os.makedirs(dst, exist_ok=True)

for i, color in enumerate([(220,220,220),(200,220,240),(240,200,200)], start=1):
    im = Image.new("RGB", (400, 300), color)
    d  = ImageDraw.Draw(im)
    d.rectangle((60, 60, 340, 240), outline=(0,0,0), width=6)
    d.text((70, 70), f"dummy {i}", fill=(0,0,0))
    im.save(os.path.join(dst, f"nail{i}.jpg"), "JPEG")
print("Wrote test_images/nail1.jpg, nail2.jpg, nail3.jpg")

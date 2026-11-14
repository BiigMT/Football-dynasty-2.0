from pathlib import Path
import cairosvg
from PIL import Image
import io

root = Path("android/app/src/main/res")
svg = Path("assets/football-dynasty-icon.svg").read_bytes()
for density, size in [("mdpi",48),("hdpi",72),("xhdpi",96),("xxhdpi",144),("xxxhdpi",192)]:
    folder = root / f"mipmap-{density}"
    folder.mkdir(parents=True, exist_ok=True)
    png = cairosvg.svg2png(bytestring=svg, output_width=size, output_height=size)
    (folder / "ic_launcher.png").write_bytes(png)
    (folder / "ic_launcher_round.png").write_bytes(png)
# Adaptive launcher icon for Android 8+
folder = root / "mipmap-anydpi-v26"
folder.mkdir(parents=True, exist_ok=True)
(folder / "ic_launcher.xml").write_text('''<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>''')
(folder / "ic_launcher_round.xml").write_text('''<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>''')
# Keep the foreground artwork inside the adaptive icon safe area.
foreground = cairosvg.svg2png(bytestring=svg, output_width=432, output_height=432)
im = Image.open(io.BytesIO(foreground)).convert("RGBA")
canvas = Image.new("RGBA", (432,432), (0,0,0,0))
im.thumbnail((340,340), Image.Resampling.LANCZOS)
canvas.alpha_composite(im, ((432-im.width)//2, (432-im.height)//2))
fg = root / "mipmap-xxxhdpi"
fg.mkdir(parents=True, exist_ok=True)
# Android adaptive icon foreground is a density-independent drawable.
(root / "drawable").mkdir(parents=True, exist_ok=True)
(root / "drawable" / "ic_launcher_foreground.png").write_bytes(cairosvg.svg2png(bytestring=svg, output_width=432, output_height=432))
(root / "values").mkdir(parents=True, exist_ok=True)
(root / "values" / "ic_launcher_background.xml").write_text('''<?xml version="1.0" encoding="utf-8"?>
<resources><color name="ic_launcher_background">#03060c</color></resources>''')
# The foreground resource is placed in drawable-nodpi so Android does not scale it by density.
(root / "drawable-nodpi").mkdir(parents=True, exist_ok=True)
(root / "drawable-nodpi" / "ic_launcher_foreground.png").write_bytes(canvas.convert("RGBA").tobytes() if False else cairosvg.svg2png(bytestring=svg, output_width=432, output_height=432))

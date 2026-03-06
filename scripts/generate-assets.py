#!/usr/bin/env python3
"""Generate all CobroYa app assets using Pillow."""

from PIL import Image, ImageDraw, ImageFont
import os

ASSETS_DIR = os.path.join(os.path.dirname(__file__), "..", "assets")
STORE_DIR = os.path.join(os.path.dirname(__file__), "..", "store-assets")
os.makedirs(STORE_DIR, exist_ok=True)

# Brand colors
BG = "#0a0a0a"
GREEN = "#00D68F"
GREEN_DARK = "#00B377"
WHITE = "#FFFFFF"
TEXT_SEC = "#8B8B8B"

def get_font(size):
    """Try to get a bold system font, fallback to default."""
    paths = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ]
    for p in paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except:
                continue
    return ImageFont.load_default()


def draw_rounded_rect(draw, xy, radius, fill):
    """Draw a rounded rectangle."""
    x0, y0, x1, y1 = xy
    draw.rounded_rectangle(xy, radius=radius, fill=fill)


def draw_dollar_symbol(draw, cx, cy, size, color):
    """Draw a stylized $ symbol."""
    font = get_font(size)
    draw.text((cx, cy), "$", fill=color, font=font, anchor="mm")


def create_icon(size, output_path, padding_pct=0.15):
    """Create the app icon - green $ on dark background."""
    img = Image.new("RGBA", (size, size), BG)
    draw = ImageDraw.Draw(img)

    # Green circle
    padding = int(size * padding_pct)
    circle_bbox = [padding, padding, size - padding, size - padding]
    draw.ellipse(circle_bbox, fill=GREEN)

    # $ symbol in dark color
    center = size // 2
    font_size = int(size * 0.45)
    font = get_font(font_size)
    draw.text((center, center), "$", fill=BG, font=font, anchor="mm")

    img.save(output_path, "PNG")
    print(f"  Created {output_path} ({size}x{size})")
    return img


def create_adaptive_icon_foreground(size, output_path):
    """Android adaptive icon foreground (needs extra padding for safe zone)."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Safe zone is 66% of the icon, so circle should be within that
    safe_padding = int(size * 0.20)
    circle_bbox = [safe_padding, safe_padding, size - safe_padding, size - safe_padding]
    draw.ellipse(circle_bbox, fill=GREEN)

    center = size // 2
    font_size = int(size * 0.32)
    font = get_font(font_size)
    draw.text((center, center), "$", fill=BG, font=font, anchor="mm")

    img.save(output_path, "PNG")
    print(f"  Created {output_path} (adaptive foreground)")


def create_adaptive_icon_background(size, output_path):
    """Android adaptive icon background."""
    img = Image.new("RGBA", (size, size), BG)
    img.save(output_path, "PNG")
    print(f"  Created {output_path} (adaptive background)")


def create_adaptive_icon_monochrome(size, output_path):
    """Android monochrome icon (white on transparent)."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    safe_padding = int(size * 0.20)
    circle_bbox = [safe_padding, safe_padding, size - safe_padding, size - safe_padding]
    draw.ellipse(circle_bbox, fill=WHITE)

    center = size // 2
    font_size = int(size * 0.32)
    font = get_font(font_size)
    draw.text((center, center), "$", fill=(0, 0, 0, 0), font=font, anchor="mm")

    img.save(output_path, "PNG")
    print(f"  Created {output_path} (monochrome)")


def create_splash(output_path):
    """Splash screen icon - just the logo centered."""
    size = 200
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Green circle
    padding = 10
    draw.ellipse([padding, padding, size - padding, size - padding], fill=GREEN)

    center = size // 2
    font = get_font(80)
    draw.text((center, center), "$", fill=BG, font=font, anchor="mm")

    img.save(output_path, "PNG")
    print(f"  Created {output_path} (splash icon)")


def create_favicon(output_path):
    """Small favicon."""
    create_icon(48, output_path, padding_pct=0.1)


def create_feature_graphic(output_path):
    """Google Play feature graphic (1024x500)."""
    w, h = 1024, 500
    img = Image.new("RGB", (w, h), BG)
    draw = ImageDraw.Draw(img)

    # Green accent circle (large, partially off-screen right)
    draw.ellipse([w - 400, -100, w + 200, h + 100], fill="#0D2E20")

    # App name
    title_font = get_font(72)
    draw.text((80, h // 2 - 60), "CobroYa", fill=WHITE, font=title_font)

    # Tagline
    sub_font = get_font(28)
    draw.text((80, h // 2 + 30), "Cobra con MercadoPago desde tu celular", fill=TEXT_SEC, font=sub_font)

    # $ icon
    icon_size = 180
    icon_x = w - 280
    icon_y = h // 2 - icon_size // 2
    draw.ellipse([icon_x, icon_y, icon_x + icon_size, icon_y + icon_size], fill=GREEN)
    icon_font = get_font(90)
    draw.text((icon_x + icon_size // 2, icon_y + icon_size // 2), "$", fill=BG, font=icon_font, anchor="mm")

    img.save(output_path, "PNG")
    print(f"  Created {output_path} (feature graphic)")


def create_screenshot_template(title, subtitle, screen_color, output_path):
    """Create a store screenshot placeholder (1080x1920)."""
    w, h = 1080, 1920
    img = Image.new("RGB", (w, h), BG)
    draw = ImageDraw.Draw(img)

    # Status bar area
    draw.rectangle([0, 0, w, 80], fill="#111111")

    # Title
    title_font = get_font(52)
    draw.text((w // 2, 200), title, fill=WHITE, font=title_font, anchor="mm")

    # Subtitle
    sub_font = get_font(28)
    draw.text((w // 2, 270), subtitle, fill=TEXT_SEC, font=sub_font, anchor="mm")

    # Mock phone screen area
    margin = 60
    screen_top = 350
    screen_bottom = h - 100
    draw_rounded_rect(draw, [margin, screen_top, w - margin, screen_bottom], 24, screen_color)

    # Green accent bar at top of screen
    draw.rectangle([margin, screen_top, w - margin, screen_top + 6], fill=GREEN)

    img.save(output_path, "PNG")
    print(f"  Created {output_path}")


if __name__ == "__main__":
    print("Generating CobroYa assets...\n")

    print("[App Icons]")
    create_icon(1024, os.path.join(ASSETS_DIR, "icon.png"))
    create_adaptive_icon_foreground(1024, os.path.join(ASSETS_DIR, "android-icon-foreground.png"))
    create_adaptive_icon_background(1024, os.path.join(ASSETS_DIR, "android-icon-background.png"))
    create_adaptive_icon_monochrome(1024, os.path.join(ASSETS_DIR, "android-icon-monochrome.png"))
    create_splash(os.path.join(ASSETS_DIR, "splash-icon.png"))
    create_favicon(os.path.join(ASSETS_DIR, "favicon.png"))

    print("\n[Store Assets]")
    create_feature_graphic(os.path.join(STORE_DIR, "feature-graphic.png"))
    create_icon(512, os.path.join(STORE_DIR, "store-icon-512.png"), padding_pct=0.12)

    print("\n[Screenshots]")
    screenshots = [
        ("Dashboard", "Visualiza tus ventas en tiempo real", "#111111"),
        ("Cobro Rapido", "Genera QR de pago en segundos", "#0D1117"),
        ("Plantillas", "Cobra montos frecuentes con un tap", "#111116"),
        ("Equipo", "Comparte acceso sin dar tu password", "#0D1117"),
        ("Pagos", "Historial completo de transacciones", "#111111"),
    ]
    for i, (title, sub, color) in enumerate(screenshots, 1):
        create_screenshot_template(title, sub, color, os.path.join(STORE_DIR, f"screenshot-{i}.png"))

    print(f"\nDone! Assets in:\n  {ASSETS_DIR}\n  {STORE_DIR}")

import json
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright


PROJECT_ROOT = Path(__file__).resolve().parents[3]
SCREENSHOT_PATH = PROJECT_ROOT / ".stitch/buyer-detail/implementation-buyer-390.png"
MODAL_SCREENSHOT_PATH = PROJECT_ROOT / ".stitch/buyer-detail/implementation-sale-modal-390.png"
REFERENCE_PATH = PROJECT_ROOT / ".stitch/buyer-detail/stitch-screen-original.png"
COMPARISON_PATH = PROJECT_ROOT / ".stitch/buyer-detail/buyer-detail-comparison.png"
URL = "http://127.0.0.1:8081/buyer/b1"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True, executable_path=CHROME)
    context = browser.new_context(
        viewport={"width": 390, "height": 1806},
        device_scale_factor=2,
        color_scheme="light",
        reduced_motion="reduce",
        locale="vi-VN",
    )
    page = context.new_page()
    console_errors = []
    page_errors = []
    page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
    page.on("pageerror", lambda error: page_errors.append(str(error)))

    page.goto(URL, wait_until="networkidle")
    buyer_name = page.get_by_text("Đại lý Toàn Thắng", exact=True).first
    buyer_name.wait_for(state="visible")
    page.evaluate("document.fonts.ready")

    top_geometry = {
        "brand": page.get_by_text("NôngSản Pro", exact=True).first.bounding_box(),
        "back": page.get_by_role("button", name="Quay lại danh bạ").bounding_box(),
        "buyerName": buyer_name.bounding_box(),
    }

    create_sale = page.get_by_role("button", name="Tạo phiếu bán cho đại lý này")
    create_sale.scroll_into_view_if_needed()
    create_sale.click()
    page.get_by_text("Tạo phiếu chốt giá", exact=True).wait_for(state="visible")

    page.get_by_role("tab", name="Tiêu Đen").click()
    weight_input = page.get_by_role("textbox", name="Khối lượng bán")
    weight_input.fill("1000")
    page.get_by_text("148,500,000 ₫", exact=True).wait_for(state="visible")
    modal_state = {
        "pepperSelected": page.get_by_role("tab", name="Tiêu Đen").get_attribute("aria-selected"),
        "weight": weight_input.input_value(),
        "estimateVisible": page.get_by_text("148,500,000 ₫", exact=True).is_visible(),
    }
    page.screenshot(path=str(MODAL_SCREENSHOT_PATH), full_page=True)
    page.get_by_role("button", name="Hủy tạo phiếu").click()
    page.get_by_text("Tạo phiếu chốt giá", exact=True).wait_for(state="hidden")

    page.evaluate("window.scrollTo(0, 0)")
    metrics = page.evaluate(
        """
        () => ({
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          scrollWidth: document.documentElement.scrollWidth,
          scrollHeight: document.documentElement.scrollHeight,
          bodyBackground: getComputedStyle(document.body).backgroundColor,
          fontStatus: document.fonts.status,
        })
        """
    )
    page.screenshot(path=str(SCREENSHOT_PATH), full_page=True)

    with Image.open(REFERENCE_PATH).convert("RGB") as reference, Image.open(SCREENSHOT_PATH).convert("RGB") as implementation:
        comparison = Image.new("RGB", (reference.width + implementation.width, reference.height), "white")
        comparison.paste(reference, (0, 0))
        comparison.paste(implementation, (reference.width, 0))
        comparison.save(COMPARISON_PATH)

    page.set_viewport_size({"width": 360, "height": 844})
    page.reload(wait_until="networkidle")
    page.get_by_text("Đại lý Toàn Thắng", exact=True).first.wait_for(state="visible")
    compact_metrics = page.evaluate(
        """
        () => ({
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          scrollWidth: document.documentElement.scrollWidth,
          scrollHeight: document.documentElement.scrollHeight,
        })
        """
    )

    page.get_by_role("button", name="Thị trường").click()
    page.wait_for_url("**/market")
    market_url = page.url
    page.goto(URL, wait_until="networkidle")
    page.get_by_role("button", name="Thông báo").click()
    page.wait_for_url("**/alerts")
    alerts_url = page.url
    page.goto(URL, wait_until="networkidle")
    page.get_by_role("button", name="Mở trang cá nhân").click()
    page.wait_for_url("**/account")
    account_url = page.url
    page.goto("http://127.0.0.1:8081/buyer/missing", wait_until="networkidle")
    invalid_state_visible = page.get_by_text("Không tìm thấy đầu mối này.", exact=True).is_visible()

    result = {
        "url": page.url,
        "screenshot": str(SCREENSHOT_PATH),
        "comparison": str(COMPARISON_PATH),
        "modalScreenshot": str(MODAL_SCREENSHOT_PATH),
        "metrics": metrics,
        "compactMetrics": compact_metrics,
        "topGeometry": top_geometry,
        "modal": modal_state,
        "navigation": {"market": market_url, "alerts": alerts_url, "account": account_url},
        "invalidStateVisible": invalid_state_visible,
        "consoleErrors": console_errors,
        "pageErrors": page_errors,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))

    if top_geometry["buyerName"]["y"] > 190:
        raise SystemExit("Buyer card still has excessive top whitespace")
    if metrics["scrollWidth"] > metrics["viewportWidth"]:
        raise SystemExit("Horizontal overflow detected")
    if compact_metrics["scrollWidth"] > compact_metrics["viewportWidth"]:
        raise SystemExit("Horizontal overflow detected at compact mobile width")
    if modal_state != {"pepperSelected": "true", "weight": "1000", "estimateVisible": True}:
        raise SystemExit("Create-sale interaction failed")
    if not (market_url.endswith("/market") and alerts_url.endswith("/alerts") and account_url.endswith("/account")):
        raise SystemExit("Screen navigation failed")
    if not invalid_state_visible:
        raise SystemExit("Invalid buyer state failed")
    if console_errors or page_errors:
        raise SystemExit("Browser errors were detected")

    browser.close()

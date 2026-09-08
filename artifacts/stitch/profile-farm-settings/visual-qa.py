import json
from pathlib import Path

from playwright.sync_api import sync_playwright


PROJECT_ROOT = Path(__file__).resolve().parents[3]
SCREENSHOT_PATH = PROJECT_ROOT / ".stitch/profile-farm-settings/implementation-account-390.png"
URL = "http://127.0.0.1:8081/account"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"


def dismiss_dialog(dialog):
    dialog.dismiss()


def switch_visual_state(switch):
    return switch.evaluate(
        """
        (element) => {
          const track = element.firstElementChild;
          const thumb = track?.firstElementChild;
          return {
            ariaChecked: element.getAttribute('aria-checked'),
            trackBackground: track ? getComputedStyle(track).backgroundColor : null,
            thumbX: thumb ? thumb.getBoundingClientRect().x : null,
            markup: element.outerHTML,
          };
        }
        """
    )


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True, executable_path=CHROME)
    context = browser.new_context(
        viewport={"width": 390, "height": 1638},
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
    page.get_by_text("Nguyễn Văn Năm", exact=True).wait_for(state="visible")
    page.evaluate("document.fonts.ready")

    switch = page.get_by_role("switch", name="Báo biến động Zalo và SMS")
    initial_switch = switch_visual_state(switch)
    switch.click()
    switched_off = switch_visual_state(switch)
    switch.click()
    restored_switch = switch_visual_state(switch)

    page.once("dialog", dismiss_dialog)
    page.get_by_role("button", name="Chọn khu vực tham chiếu, hiện tại Đắk Lắk").click()

    page.once("dialog", dismiss_dialog)
    page.get_by_role("button", name="Đăng xuất tài khoản").click()

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

    result = {
        "url": page.url,
        "screenshot": str(SCREENSHOT_PATH),
        "metrics": metrics,
        "switch": {
            "initial": initial_switch,
            "afterFirstClick": switched_off,
            "afterSecondClick": restored_switch,
        },
        "consoleErrors": console_errors,
        "pageErrors": page_errors,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))

    if (
        initial_switch["trackBackground"] == switched_off["trackBackground"]
        or initial_switch["thumbX"] == switched_off["thumbX"]
        or initial_switch["trackBackground"] != restored_switch["trackBackground"]
        or initial_switch["thumbX"] != restored_switch["thumbX"]
    ):
        raise SystemExit("Switch interaction did not preserve the expected state transitions")
    if console_errors or page_errors:
        raise SystemExit("Browser errors were detected")

    browser.close()

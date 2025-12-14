import re
from pathlib import Path

TARGET = Path(__file__).resolve().parents[1] / "docs/solar/agrivoltaics/app.js"


def main():
    content = TARGET.read_text(encoding="utf-8")

    header_idx = content.find('React.createElement("header"')
    if header_idx == -1:
        raise AssertionError("header element not found in app.js")

    action_idx = content.find('className: "agri-action-bar', header_idx)
    if action_idx == -1:
        raise AssertionError("agri-action-bar section not found after header")

    main_idx = content.find('className: "agri-main', action_idx)
    if main_idx == -1:
        raise AssertionError("agri-main not found after action bar")

    header_segment = content[header_idx:action_idx]
    if 'agri-main' in header_segment:
        raise AssertionError("agri-main appears inside header; layout regression suspected")

    closing_sequence = re.search(
        r'React\.createElement\("header"[\s\S]*?\)\s*,\s*/\*#__PURE__\*/React\.createElement\("section",\s*\{\s*\n\s*className: "agri-action-bar',
        content,
    )
    if not closing_sequence:
        raise AssertionError("action bar should be a sibling following the header")

    print("Structure guard PASSED")


if __name__ == "__main__":
    main()

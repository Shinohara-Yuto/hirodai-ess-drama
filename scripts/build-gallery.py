#!/usr/bin/env python3
"""写真フォルダから gallery 画像と gallery.json を同期します。"""
from __future__ import annotations

import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PHOTO_SRC = ROOT / "写真"
GALLERY_DST = ROOT / "website" / "assets" / "gallery"
JSON_OUT = ROOT / "website" / "data" / "gallery.json"

# (ソースファイル名, 保存ファイル名)
COPY_MAP: list[tuple[str, str]] = [
    ("2026\u3000春公演.jpg", "spring2026.jpg"),
    ("LINE_ALBUM_リメコン🌹2025🌹_260614_1.jpg", "remecon-1.jpg"),
    ("LINE_ALBUM_リメコン🌹2025🌹_260614_2.jpg", "remecon-2.jpg"),
    ("LINE_ALBUM_リメコン🌹2025🌹_260614_3.jpg", "remecon-3.jpg"),
    ("LINE_ALBUM_リメコン🌹2025🌹_260614_4.jpg", "remecon-4.jpg"),
    ("LINE_ALBUM_本公演ホール練_260614_1.jpg", "honkouen-1.jpg"),
    ("LINE_ALBUM_本公演ホール練_260614_2.jpg", "honkouen-2.jpg"),
    ("LINE_ALBUM_本公演ホール練_260614_3.jpg", "honkouen-3.jpg"),
    ("LINE_ALBUM_本公演ホール練_260614_4.jpg", "honkouen-4.jpg"),
    ("LINE_ALBUM_本公演ホール練_260614_5.jpg", "honkouen-5.jpg"),
    ("LINE_ALBUM_本公演ホール練_260614_6.jpg", "honkouen-6.jpg"),
    ("LINE_ALBUM_本公演ホール練_260614_7.jpg", "honkouen-7.jpg"),
    ("LINE_ALBUM_本公演ホール練_260614_8.jpg", "honkouen-8.jpg"),
    ("LINE_ALBUM_本公演練習期間！！_260614_1.jpg", "main-rehearsal-1.jpg"),
    ("LINE_ALBUM_本公演練習期間！！_260614_2.jpg", "main-rehearsal-2.jpg"),
    ("LINE_ALBUM_本公演練習期間！！_260614_3.jpg", "main-rehearsal-3.jpg"),
    ("LINE_ALBUM_大学祭_260614_1.jpg", "festival-1.jpg"),
    ("LINE_ALBUM_大学祭_260614_2.jpg", "festival-2.jpg"),
    ("LINE_ALBUM_ハロパ2025_260614_1.jpg", "halloween-2025.jpg"),
    ("LINE_ALBUM_2026ドラりょ1日目_260614_1.jpg", "dramaryo-d1-1.jpg"),
    ("LINE_ALBUM_2026ドラりょ1日目_260614_2.jpg", "dramaryo-d1-2.jpg"),
    ("LINE_ALBUM_2026ドラりょ1日目_260614_3.jpg", "dramaryo-d1-3.jpg"),
    ("LINE_ALBUM_2026ドラりょ1日目_260614_4.jpg", "dramaryo-d1-4.jpg"),
    ("LINE_ALBUM_2026 ドラりょ 2日目_260614_1.jpg", "dramaryo-d2-1.jpg"),
    ("LINE_ALBUM_2026 ドラりょ 2日目_260614_2.jpg", "dramaryo-d2-2.jpg"),
]

GALLERY_ITEMS = [
    {"file": "spring2026.jpg", "category": "performance", "label": "2026 春公演", "caption": "Tangled（塔の上のラプンツェル）の舞台", "size": "hero"},
    {"file": "remecon-1.jpg", "category": "performance", "label": "2025 リメコン", "caption": "1年生の初舞台、リメコン公演", "size": "wide"},
    {"file": "remecon-2.jpg", "category": "performance", "label": "2025 リメコン", "caption": "新入生だけで作り上げる初めての舞台", "size": "normal"},
    {"file": "remecon-3.jpg", "category": "performance", "label": "2025 リメコン", "caption": "リメコン公演の一幕", "size": "normal"},
    {"file": "remecon-4.jpg", "category": "performance", "label": "2025 リメコン", "caption": "カーテンコールの感動", "size": "wide"},
    {"file": "honkouen-1.jpg", "category": "rehearsal", "label": "本公演ホール練", "caption": "アザレアホールでの本番さばき", "size": "wide"},
    {"file": "honkouen-2.jpg", "category": "rehearsal", "label": "本公演ホール練", "caption": "本番会場での総仕上げ", "size": "normal"},
    {"file": "honkouen-3.jpg", "category": "rehearsal", "label": "本公演ホール練", "caption": "ホール練習の様子", "size": "normal"},
    {"file": "honkouen-4.jpg", "category": "rehearsal", "label": "本公演ホール練", "caption": "一年間の集大成に向けて", "size": "normal"},
    {"file": "honkouen-5.jpg", "category": "rehearsal", "label": "本公演ホール練", "caption": "舞台装置の確認", "size": "normal"},
    {"file": "honkouen-6.jpg", "category": "rehearsal", "label": "本公演ホール練", "caption": "本番直前のリハーサル", "size": "wide"},
    {"file": "main-rehearsal-1.jpg", "category": "rehearsal", "label": "本公演練習", "caption": "本公演に向けた日々の稽古", "size": "normal"},
    {"file": "main-rehearsal-2.jpg", "category": "rehearsal", "label": "本公演練習", "caption": "歌・ダンス・演技の総合練習", "size": "normal"},
    {"file": "main-rehearsal-3.jpg", "category": "rehearsal", "label": "本公演練習", "caption": "全員で作り上げる本番前の舞台", "size": "normal"},
    {"file": "festival-1.jpg", "category": "event", "label": "大学祭", "caption": "大学祭でのESSドラマの出店・公演", "size": "wide"},
    {"file": "festival-2.jpg", "category": "event", "label": "大学祭", "caption": "キャンパスに演劇の熱気を", "size": "normal"},
    {"file": "halloween-2025.jpg", "category": "event", "label": "ハロウィンパーティー", "caption": "2025年ハロウィン、仮装で大盛り上がり", "size": "normal"},
    {"file": "dramaryo-d1-1.jpg", "category": "event", "label": "2026 ドラマ旅行", "caption": "ドラマ旅行1日目の思い出", "size": "wide"},
    {"file": "dramaryo-d1-2.jpg", "category": "event", "label": "2026 ドラマ旅行", "caption": "仲間と過ごす特別な時間", "size": "normal"},
    {"file": "dramaryo-d1-3.jpg", "category": "event", "label": "2026 ドラマ旅行", "caption": "オフも全力で楽しむESS", "size": "normal"},
    {"file": "dramaryo-d2-1.jpg", "category": "event", "label": "2026 ドラマ旅行", "caption": "ドラマ旅行2日目", "size": "normal"},
    {"file": "dramaryo-d2-2.jpg", "category": "event", "label": "2026 ドラマ旅行", "caption": "旅行の余韻と仲間の絆", "size": "normal"},
]


def copy_photos() -> int:
    GALLERY_DST.mkdir(parents=True, exist_ok=True)
    allowed = {dst for _, dst in COPY_MAP}
    for path in GALLERY_DST.iterdir():
        if path.is_file() and path.name not in allowed:
            path.unlink()

    copied = 0
    for src_name, dst_name in COPY_MAP:
        src = PHOTO_SRC / src_name
        if not src.exists():
            print(f"警告: 見つかりません: {src_name}")
            continue
        try:
            src.resolve().relative_to(PHOTO_SRC.resolve())
        except (OSError, ValueError):
            print(f"警告: フォルダ外を指しているためスキップしました: {src_name}")
            continue
        if not src.resolve().is_file():
            continue
        shutil.copy2(src, GALLERY_DST / dst_name)
        copied += 1
    return copied


def main() -> None:
    count = copy_photos()
    payload = {"source": str(PHOTO_SRC.name), "items": GALLERY_ITEMS}
    JSON_OUT.parent.mkdir(parents=True, exist_ok=True)
    JSON_OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"ギャラリー同期完了: {count} 枚 → {GALLERY_DST}")
    print(f"JSON: {JSON_OUT} ({len(GALLERY_ITEMS)} 件)")


if __name__ == "__main__":
    main()

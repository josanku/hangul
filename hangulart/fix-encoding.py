#!/usr/bin/env python3
"""
mojibake (latin-1 → utf-8 double encoded) 를 원본 UTF-8 한글로 복원.
"""
import os, sys

def fix(text):
    try:
        return text.encode('latin-1').decode('utf-8')
    except Exception:
        return text

def process(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    fixed = fix(content)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(fixed)
    print(f"fixed: {path}")

if __name__ == "__main__":
    for p in sys.argv[1:]:
        if os.path.isfile(p):
            process(p)

# 한글정음 — 마스터 작업본

훈민정음 해례본의 한글 번역 정제 작업 마스터.

## 디렉토리 구조

```
hangul/
├── HangulJeongeum-20260325plus.pdf  # 원본 통합 PDF (388쪽, 1.5GB)
├── chapters/                         # 챕터별 PDF (이미지 포함)
├── text/                             # 챕터별 텍스트 추출본
└── master/                           # 마스터 작업본 (마크다운, 정제용) ← 여기
    ├── README.md                     # 이 파일
    └── 00-...md ~ 16-...md           # 챕터별 작업 파일
```

## 챕터 목록

| # | 작업 파일 | 챕터 | 원본 쪽 |
|---|-----------|------|---------|
| 00 | [00-cover-intro.md](00-cover-intro.md) | 표지·머리말 | 1–12 |
| 01 | [01-hunminjeongeum-sejong.md](01-hunminjeongeum-sejong.md) | 훈민정음 본문 — 세종대왕 | 13–40 |
| 02 | [02-toc-and-intro.md](02-toc-and-intro.md) | 차례 · 머리 | 41–52 |
| 03 | [03-1-changje-wonri.md](03-1-changje-wonri.md) | **정음 풀이 1. 창제원리** ⭐ | 53–147 |
| 04 | [04-2-cheotsori-puri.md](04-2-cheotsori-puri.md) | 2. 첫소리글자 풀이 | 149–153 |
| 05 | [05-3-gaundetsori-puri.md](05-3-gaundetsori-puri.md) | 3. 가운뎃소리글자 풀이 | 155–165 |
| 06 | [06-4-kkeutsori-puri.md](06-4-kkeutsori-puri.md) | 4. 끝소리글자 풀이 | 167–178 |
| 07 | [07-5-cheotgakkeut-irum.md](07-5-cheotgakkeut-irum.md) | 5. 첫가끝 이룸 풀이 | 179–194 |
| 08 | [08-6-natgeulja-sayong.md](08-6-natgeulja-sayong.md) | 6. 낱글자 사용 보기 | 195–211 |
| 09 | [09-matumal-jeong-inji.md](09-matumal-jeong-inji.md) | 맺음말 — 정인지 | 213–226 |
| 10 | [10-botaem-illeoddugi.md](10-botaem-illeoddugi.md) | 보탬 — 일러두기 | 227–242 |
| 11 | [11-botaem-deotpuri.md](11-botaem-deotpuri.md) | 보탬 — 덧풀이 | 243–276 |
| 12 | [12-botaem-deobogi.md](12-botaem-deobogi.md) | 보탬 — 더보기 | 277–312 |
| 13 | [13-botaem-hangul-wonhyeong.md](13-botaem-hangul-wonhyeong.md) | 보탬 — 한글의 원형 | 313–326 |
| 14 | [14-botaem-hangul-art.md](14-botaem-hangul-art.md) | 보탬 — 한글아트 | 327–354 |
| 15 | [15-botaem-sime-seuseuro.md](15-botaem-sime-seuseuro.md) | 보탬 — 시므 스스로 한글 | 355–368 |
| 16 | [16-botaem-yeonhyeok-closing.md](16-botaem-yeonhyeok-closing.md) | 보탬 — 연혁/참고/엮은이 | 369–388 |

## 작업 파일 구조

각 챕터 마크다운은 세 블록:

1. **한글 번역본 (현재)** — PDF에서 추출한 원본, 편집 금지(스냅샷)
2. **정제 노트** — 검토 의견·수정 제안
3. **영문 번역 초안** — English version of HANGUL, The Cosmic Philosophy

## 정제 우선순위

1. ⭐ **03** 창제원리 — 핵심 우주철학
2. **09** 정인지 맺음말
3. **04–08** 5개 해(解) 본문
4. **10** 일러두기 (용어 표준)

// 한글정음 — 한글 이름 → 한글아트 생성기
// p5.js 기반. openProcessing @u266973/1983528 의 시각 컨셉을 참고하여
// 유니코드 기반으로 클린 재구현.
//
// 입력: 한글/영문 문자열 (window.HANGUL_ART_TEXT)
// 출력: 초성·중성·종성을 기하학적으로 분해해 그라디언트로 그린 한글아트

// ──────────────── 자모 테이블 (표준 유니코드) ────────────────
const CHO_LIST = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const JUNG_LIST = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
const JONG_LIST = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

// 자모 → 정음 우주철학 분류: 하늘(ㅇ) / 사람(ㅅ) / 땅(ㅁ·ㄴ·ㄱ 계열)
const HEAVEN = ['ㅇ','ㅎ'];
const HUMAN = ['ㅅ','ㅈ','ㅊ'];
// 그 외는 모두 땅 계열

// 모음 분류: 수직 (ㅣ축 결합), 수평 (ㅡ축 결합), 점만
const VERT_VOWEL = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅣ'];
const HORIZ_VOWEL = ['ㅗ','ㅛ','ㅜ','ㅠ','ㅡ'];
const COMBO_VOWEL = ['ㅘ','ㅙ','ㅚ','ㅝ','ㅞ','ㅟ','ㅢ'];

// ──────────────── 팔레트 ────────────────
const PALETTES = [
  { name: 'obang',     colors: ['#004785','#A83535','#F7E565','#148c44','#4783c4','#cc1a6a','#eefa4d','#801341'] },
  { name: 'cosmic',    colors: ['#1e40d4','#2ea043','#d12c2c','#ffd54f','#f5f5f0','#0b0d12'] },
  { name: 'sunset',    colors: ['#f72585','#b5179e','#7209b7','#560bad','#3f37c9','#4895ef','#4cc9f0'] },
  { name: 'forest',    colors: ['#d8f3dc','#95d5b2','#52b788','#2d6a4f','#1b4332','#081c15'] },
  { name: 'autumn',    colors: ['#fb8500','#ffb703','#fd9e02','#fb5607','#e63946','#264653'] },
  { name: 'ocean',     colors: ['#03045e','#0077b6','#00b4d8','#90e0ef','#caf0f8'] },
  { name: 'sakura',    colors: ['#ffd6ff','#e7c6ff','#c8b6ff','#b8c0ff','#bbd0ff','#ffafcc','#ff8b94'] },
  { name: 'mono',      colors: ['#000000','#3d3d3d','#7a7a7a','#b8b8b8','#e5e5e5','#ffffff'] },
  { name: 'royal',     colors: ['#10002b','#240046','#3c096c','#5a189a','#7b2cbf','#9d4edd','#c77dff','#e0aaff'] },
  { name: 'fire',      colors: ['#03071e','#370617','#6a040f','#9d0208','#d00000','#dc2f02','#e85d04','#f48c06','#faa307','#ffba08'] },
  { name: 'pastel',    colors: ['#ffadad','#ffd6a5','#fdffb6','#caffbf','#9bf6ff','#a0c4ff','#bdb2ff','#ffc6ff'] },
  { name: 'earth',     colors: ['#606c38','#283618','#fefae0','#dda15e','#bc6c25'] }
];

// ──────────────── 전역 상태 ────────────────
let currentText = '';
let currentPalette;
let bgColor;
let inkColor;
let strokeWeightVal;
let lineMode = 0; // 0=fill 1=line

function setup() {
  const container = document.getElementById('artCanvasContainer');
  const w = container ? container.clientWidth : 800;
  const h = container ? container.clientHeight : 800;
  const c = createCanvas(w, h);
  if (container) c.parent('artCanvasContainer');
  colorMode(RGB, 255);
  angleMode(DEGREES);
  noLoop();
  pickPalette();
  redrawArt();
}

function windowResized() {
  const container = document.getElementById('artCanvasContainer');
  if (container) {
    resizeCanvas(container.clientWidth, container.clientHeight);
    redrawArt();
  }
}

function pickPalette(name) {
  if (name) {
    currentPalette = PALETTES.find(p => p.name === name) || PALETTES[0];
  } else {
    currentPalette = random(PALETTES);
  }
  bgColor = random(currentPalette.colors);
  // ink color = contrasting
  inkColor = currentPalette.colors.find(c => c !== bgColor) || '#000';
}

// 외부에서 호출 가능한 갱신 함수
function setText(txt) {
  currentText = (txt || '').replace(/\s+/g, '');
  redrawArt();
}

function setLineMode(m) { lineMode = m ? 1 : 0; redrawArt(); }

function newPalette() { pickPalette(); redrawArt(); }

function saveArt() {
  const stamp = `${year()}${nf(month(),2)}${nf(day(),2)}_${nf(hour(),2)}${nf(minute(),2)}${nf(second(),2)}`;
  const name = currentText ? currentText : 'hangulart';
  saveCanvas(`${name}_${stamp}`, 'png');
}

// ──────────────── 한글 자모 분해 ────────────────
function decompose(ch) {
  const code = ch.charCodeAt(0);
  // 완성형 한글
  if (code >= 0xAC00 && code <= 0xD7A3) {
    const idx = code - 0xAC00;
    return {
      cho: CHO_LIST[Math.floor(idx / 588)],
      jung: JUNG_LIST[Math.floor((idx % 588) / 28)],
      jong: JONG_LIST[idx % 28]
    };
  }
  // 자모 단독
  if (CHO_LIST.includes(ch))  return { cho: ch, jung: '', jong: '' };
  if (JUNG_LIST.includes(ch)) return { cho: '', jung: ch, jong: '' };
  if (JONG_LIST.includes(ch)) return { cho: '', jung: '', jong: ch };
  // 영문/기타
  return { ascii: ch };
}

// ──────────────── 메인 그리기 ────────────────
function redrawArt() {
  background(bgColor);
  if (!currentText) {
    showPlaceholder();
    return;
  }

  const chars = [...currentText];
  const n = chars.length;
  const margin = min(width, height) * 0.05;
  const usableW = width - margin * 2;
  const usableH = height - margin * 2;

  // 격자 자동 산정 (대략 정사각형)
  const cols = Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);
  const cellW = usableW / cols;
  const cellH = usableH / rows;
  const sz = min(cellW, cellH);
  const gap = sz * 0.06;
  const cellSz = sz - gap;

  const totalW = cols * sz - gap;
  const totalH = rows * sz - gap;
  const startX = (width - totalW) / 2;
  const startY = (height - totalH) / 2;

  strokeWeightVal = cellSz / 28;

  for (let i = 0; i < n; i++) {
    const r = Math.floor(i / cols);
    const cc = i % cols;
    const x = startX + cc * sz;
    const y = startY + r * sz;
    drawChar(chars[i], x, y, cellSz, cellSz);
  }

  // 워터마크
  push();
  noStroke();
  fill(0, 0, 0, 90);
  textAlign(RIGHT, BOTTOM);
  textSize(min(width, height) / 80);
  text('한글정음 · ○△□ · hangul.kr', width - 14, height - 10);
  pop();
}

function showPlaceholder() {
  push();
  noStroke();
  fill(0, 0, 0, 50);
  textAlign(CENTER, CENTER);
  textSize(min(width, height) / 30);
  text('이름을 입력하고 만들기를 눌러보세요', width / 2, height / 2);
  pop();
}

function drawChar(ch, x, y, w, h) {
  const parts = decompose(ch);
  push();
  translate(x, y);

  if (parts.ascii) {
    drawAscii(parts.ascii, 0, 0, w, h);
    pop();
    return;
  }

  // 레이아웃: 중성이 수직형이면 가로 분할, 수평형이면 세로 분할
  const { cho, jung, jong } = parts;

  if (!cho && !jung && !jong) { pop(); return; }

  const hasJong = jong && jong !== '';

  if (!jung) {
    // 자모만 단독 → 셀 전체에 그리기
    drawJamoBlock(cho || jong, 0, 0, w, h);
    pop();
    return;
  }

  if (VERT_VOWEL.includes(jung)) {
    // 가로 분할: [초성 | 중성] 위, 종성 아래
    const topH = hasJong ? h * 0.66 : h;
    const choW = w * 0.55;
    drawJamoBlock(cho, 0, 0, choW, topH);
    drawVowel(jung, choW, 0, w - choW, topH);
    if (hasJong) drawJamoBlock(jong, 0, topH, w, h - topH);
  } else if (HORIZ_VOWEL.includes(jung)) {
    // 세로 분할: 초성 위, 중성 중간, 종성 아래
    const choH = hasJong ? h * 0.4 : h * 0.5;
    const jungH = hasJong ? h * 0.3 : h * 0.5;
    drawJamoBlock(cho, 0, 0, w, choH);
    drawVowel(jung, 0, choH, w, jungH);
    if (hasJong) drawJamoBlock(jong, 0, choH + jungH, w, h - choH - jungH);
  } else {
    // 콤보 모음 (ㅘ ㅙ 등) — L자 구조
    const topH = hasJong ? h * 0.45 : h * 0.55;
    const midH = hasJong ? h * 0.25 : h * 0.45;
    const choW = w * 0.55;
    drawJamoBlock(cho, 0, 0, choW, topH);
    drawVowel(jung.split('')[1] || jung, choW, 0, w - choW, topH);
    drawVowel(jung.split('')[0] || jung, 0, topH, w, midH);
    if (hasJong) drawJamoBlock(jong, 0, topH + midH, w, h - topH - midH);
  }

  pop();
}

// ──────────────── 자음 블록 ────────────────
function drawJamoBlock(jamo, x, y, w, h) {
  if (!jamo) return;
  push();
  translate(x, y);
  const bg = fillColor();
  const fg = strokeColor();

  if (lineMode === 1) {
    noFill();
    stroke(fg);
    strokeWeight(strokeWeightVal);
    drawJamoStrokes(jamo, w, h);
  } else {
    noStroke();
    drawJamoFill(jamo, w, h, bg, fg);
  }
  pop();
}

function fillColor() {
  // 배경 외 다른 색
  let c = random(currentPalette.colors);
  let tries = 0;
  while (c === bgColor && tries < 4) {
    c = random(currentPalette.colors);
    tries++;
  }
  return c;
}
function strokeColor() {
  return fillColor();
}

function drawJamoFill(jamo, w, h, baseColor, accentColor) {
  // 자모를 베이스 색상 사각형 + 액센트 패턴으로 표현
  setGradient(0, 0, w, h, color(baseColor), color(shade(baseColor, 0.7)));
  rect(0, 0, w, h);
  fill(bgColor);

  switch (jamo) {
    case 'ㄱ': case 'ㅋ': case 'ㄲ':
      // 위쪽 가로 + 오른쪽 세로 → 음각: 왼쪽 아래
      rect(0, h * 0.5, w * 0.45, h * 0.5);
      if (jamo === 'ㅋ') rect(0, h * 0.3, w * 0.45, h * 0.1);
      if (jamo === 'ㄲ') rect(w * 0.55, h * 0.5, w * 0.45, h * 0.5);
      break;
    case 'ㄴ':
      rect(w * 0.3, 0, w * 0.7, h * 0.7);
      break;
    case 'ㄷ': case 'ㅌ': case 'ㄸ':
      rect(w * 0.3, h * 0.2, w * 0.7, h * 0.25);
      rect(w * 0.3, h * 0.55, w * 0.7, h * 0.25);
      if (jamo === 'ㅌ') rect(w * 0.3, h * 0.85, w * 0.7, h * 0.15);
      if (jamo === 'ㄸ') {
        rect(w * 0.0, h * 0.2, w * 0.2, h * 0.25);
        rect(w * 0.0, h * 0.55, w * 0.2, h * 0.25);
      }
      break;
    case 'ㄹ':
      rect(0, h * 0.2, w * 0.55, h * 0.15);
      rect(w * 0.45, h * 0.35, w * 0.55, h * 0.15);
      rect(0, h * 0.5, w * 0.55, h * 0.15);
      rect(w * 0.45, h * 0.65, w * 0.55, h * 0.15);
      break;
    case 'ㅁ':
      rect(w * 0.18, h * 0.2, w * 0.64, h * 0.6);
      setGradient(w * 0.18, h * 0.2, w * 0.64, h * 0.6, color(accentColor), color(shade(accentColor, 0.7)));
      rect(w * 0.18, h * 0.2, w * 0.64, h * 0.6);
      break;
    case 'ㅂ': case 'ㅍ': case 'ㅃ':
      rect(w * 0.18, h * 0.3, w * 0.18, h * 0.5);
      rect(w * 0.65, h * 0.3, w * 0.18, h * 0.5);
      rect(w * 0.18, h * 0.55, w * 0.65, h * 0.1);
      if (jamo === 'ㅍ') {
        rect(0, h * 0.2, w, h * 0.1);
        rect(0, h * 0.85, w, h * 0.1);
      }
      if (jamo === 'ㅃ') {
        rect(w * 0.36, h * 0.3, w * 0.06, h * 0.5);
        rect(w * 0.58, h * 0.3, w * 0.06, h * 0.5);
      }
      break;
    case 'ㅅ': case 'ㅆ':
      fill(baseColor);
      noStroke();
      triangle(w / 2, h * 0.1, w * 0.05, h * 0.9, w * 0.95, h * 0.9);
      if (jamo === 'ㅆ') {
        fill(accentColor);
        triangle(w * 0.65, h * 0.4, w * 0.45, h * 0.9, w * 0.85, h * 0.9);
      }
      break;
    case 'ㅈ': case 'ㅉ':
      rect(0, h * 0.2, w, h * 0.12);
      fill(baseColor);
      triangle(w / 2, h * 0.35, w * 0.1, h * 0.95, w * 0.9, h * 0.95);
      break;
    case 'ㅊ':
      rect(w * 0.4, h * 0.05, w * 0.2, h * 0.1);
      rect(0, h * 0.2, w, h * 0.1);
      fill(baseColor);
      triangle(w / 2, h * 0.35, w * 0.1, h * 0.95, w * 0.9, h * 0.95);
      break;
    case 'ㅇ': case 'ㅎ':
      const dia = min(w, h) * 0.7;
      if (jamo === 'ㅎ') {
        rect(w * 0.4, 0, w * 0.2, h * 0.1);
        rect(w * 0.2, h * 0.15, w * 0.6, h * 0.08);
      }
      circle(w / 2, h - dia / 2 - h * 0.05, dia);
      fill(bgColor);
      circle(w / 2, h - dia / 2 - h * 0.05, dia * 0.35);
      break;
    // 받침 자음 클러스터: 단순 사각형으로
    case 'ㄳ': case 'ㄵ': case 'ㄶ': case 'ㄺ': case 'ㄻ':
    case 'ㄼ': case 'ㄽ': case 'ㄾ': case 'ㄿ': case 'ㅀ': case 'ㅄ': {
      const half = w / 2;
      drawJamoFill(jamo.charAt(0), half, h, baseColor, accentColor);
      push();
      translate(half, 0);
      drawJamoFill(jamo.charAt(1), half, h, accentColor, baseColor);
      pop();
      break;
    }
    default:
      // 알 수 없는 자모
      fill(accentColor);
      rect(w * 0.2, h * 0.2, w * 0.6, h * 0.6);
  }
}

function drawJamoStrokes(jamo, w, h) {
  const s = strokeWeightVal;
  switch (jamo) {
    case 'ㄱ': case 'ㅋ':
      line(s, s, w - s, s); line(w - s, s, w - s, h - s);
      if (jamo === 'ㅋ') line(s, h * 0.5, w - s, h * 0.5);
      break;
    case 'ㄲ':
      line(s, s, w * 0.45, s); line(w * 0.45, s, w * 0.45, h - s);
      line(w * 0.55, s, w - s, s); line(w - s, s, w - s, h - s);
      break;
    case 'ㄴ':
      line(s, s, s, h - s); line(s, h - s, w - s, h - s);
      break;
    case 'ㄷ':
      line(s, s, w - s, s); line(s, s, s, h - s); line(s, h - s, w - s, h - s);
      break;
    case 'ㄸ':
      line(s, s, w * 0.45, s); line(s, s, s, h - s); line(s, h - s, w * 0.45, h - s);
      line(w * 0.55, s, w - s, s); line(w * 0.55, s, w * 0.55, h - s); line(w * 0.55, h - s, w - s, h - s);
      break;
    case 'ㅌ':
      line(s, s, w - s, s); line(s, s, s, h - s); line(s, h - s, w - s, h - s);
      line(s, h / 2, w - s, h / 2);
      break;
    case 'ㄹ':
      line(s, s, w - s, s); line(w - s, s, w - s, h * 0.5);
      line(s, h * 0.5, w - s, h * 0.5); line(s, h * 0.5, s, h - s);
      line(s, h - s, w - s, h - s);
      break;
    case 'ㅁ':
      noFill(); rect(s, s, w - 2 * s, h - 2 * s);
      break;
    case 'ㅂ':
      line(s, s, s, h - s); line(w - s, s, w - s, h - s);
      line(s, h * 0.5, w - s, h * 0.5); line(s, h - s, w - s, h - s);
      break;
    case 'ㅃ':
      line(s, s, s, h - s); line(w * 0.45, s, w * 0.45, h - s);
      line(s, h * 0.5, w * 0.45, h * 0.5); line(s, h - s, w * 0.45, h - s);
      line(w * 0.55, s, w * 0.55, h - s); line(w - s, s, w - s, h - s);
      line(w * 0.55, h * 0.5, w - s, h * 0.5); line(w * 0.55, h - s, w - s, h - s);
      break;
    case 'ㅍ':
      line(s, s, w - s, s); line(s, h - s, w - s, h - s);
      line(w * 0.3, s, w * 0.3, h - s); line(w * 0.7, s, w * 0.7, h - s);
      break;
    case 'ㅅ':
      line(w / 2, s, s, h - s); line(w / 2, s, w - s, h - s);
      break;
    case 'ㅆ':
      line(w * 0.3, s, s, h - s); line(w * 0.3, s, w * 0.6, h - s);
      line(w * 0.7, s, w * 0.4, h - s); line(w * 0.7, s, w - s, h - s);
      break;
    case 'ㅈ':
      line(s, s, w - s, s); line(w / 2, s, s, h - s); line(w / 2, s, w - s, h - s);
      break;
    case 'ㅊ':
      line(w * 0.4, s, w * 0.6, s);
      line(s, h * 0.2, w - s, h * 0.2); line(w / 2, h * 0.2, s, h - s); line(w / 2, h * 0.2, w - s, h - s);
      break;
    case 'ㅇ':
      noFill(); circle(w / 2, h / 2, min(w, h) - 2 * s);
      break;
    case 'ㅎ':
      line(w * 0.4, s, w * 0.6, s);
      line(s, h * 0.25, w - s, h * 0.25);
      noFill(); circle(w / 2, h * 0.65, min(w, h) * 0.6);
      break;
    default:
      noFill(); rect(s, s, w - 2 * s, h - 2 * s);
  }
}

// ──────────────── 모음 ────────────────
function drawVowel(vowel, x, y, w, h) {
  push();
  translate(x, y);
  const c = fillColor();
  if (lineMode === 1) {
    stroke(c); strokeWeight(strokeWeightVal); noFill();
  } else {
    noStroke(); fill(c);
  }
  const s = strokeWeightVal;

  switch (vowel) {
    case 'ㅏ':
      if (lineMode) { line(w * 0.4, s, w * 0.4, h - s); line(w * 0.4, h / 2, w - s, h / 2); }
      else { rect(w * 0.35, 0, w * 0.15, h); rect(w * 0.5, h * 0.4, w * 0.5, h * 0.2); }
      break;
    case 'ㅓ':
      if (lineMode) { line(w * 0.6, s, w * 0.6, h - s); line(s, h / 2, w * 0.6, h / 2); }
      else { rect(w * 0.5, 0, w * 0.15, h); rect(0, h * 0.4, w * 0.5, h * 0.2); }
      break;
    case 'ㅑ':
      if (lineMode) { line(w * 0.4, s, w * 0.4, h - s); line(w * 0.4, h * 0.33, w - s, h * 0.33); line(w * 0.4, h * 0.66, w - s, h * 0.66); }
      else { rect(w * 0.35, 0, w * 0.15, h); rect(w * 0.5, h * 0.25, w * 0.5, h * 0.15); rect(w * 0.5, h * 0.6, w * 0.5, h * 0.15); }
      break;
    case 'ㅕ':
      if (lineMode) { line(w * 0.6, s, w * 0.6, h - s); line(s, h * 0.33, w * 0.6, h * 0.33); line(s, h * 0.66, w * 0.6, h * 0.66); }
      else { rect(w * 0.5, 0, w * 0.15, h); rect(0, h * 0.25, w * 0.5, h * 0.15); rect(0, h * 0.6, w * 0.5, h * 0.15); }
      break;
    case 'ㅐ': case 'ㅒ':
      drawVowel('ㅏ', 0, 0, w * 0.6, h);
      if (lineMode) { line(w - s, s, w - s, h - s); }
      else { rect(w * 0.85, 0, w * 0.15, h); }
      break;
    case 'ㅔ': case 'ㅖ':
      drawVowel('ㅓ', w * 0.2, 0, w * 0.6, h);
      if (lineMode) { line(w - s, s, w - s, h - s); }
      else { rect(w * 0.85, 0, w * 0.15, h); }
      break;
    case 'ㅗ':
      if (lineMode) { line(s, h * 0.6, w - s, h * 0.6); line(w / 2, h * 0.6, w / 2, h - s); }
      else { rect(0, h * 0.6, w, h * 0.15); rect(w * 0.42, h * 0.2, w * 0.16, h * 0.4); }
      break;
    case 'ㅛ':
      if (lineMode) { line(s, h * 0.6, w - s, h * 0.6); line(w * 0.33, h * 0.2, w * 0.33, h * 0.6); line(w * 0.66, h * 0.2, w * 0.66, h * 0.6); }
      else { rect(0, h * 0.6, w, h * 0.15); rect(w * 0.27, h * 0.2, w * 0.12, h * 0.4); rect(w * 0.61, h * 0.2, w * 0.12, h * 0.4); }
      break;
    case 'ㅜ':
      if (lineMode) { line(s, h * 0.4, w - s, h * 0.4); line(w / 2, h * 0.4, w / 2, h - s); }
      else { rect(0, h * 0.35, w, h * 0.15); rect(w * 0.42, h * 0.5, w * 0.16, h * 0.45); }
      break;
    case 'ㅠ':
      if (lineMode) { line(s, h * 0.4, w - s, h * 0.4); line(w * 0.33, h * 0.4, w * 0.33, h * 0.9); line(w * 0.66, h * 0.4, w * 0.66, h * 0.9); }
      else { rect(0, h * 0.35, w, h * 0.15); rect(w * 0.27, h * 0.5, w * 0.12, h * 0.45); rect(w * 0.61, h * 0.5, w * 0.12, h * 0.45); }
      break;
    case 'ㅡ':
      if (lineMode) { line(s, h / 2, w - s, h / 2); }
      else { rect(0, h * 0.42, w, h * 0.16); }
      break;
    case 'ㅣ':
      if (lineMode) { line(w / 2, s, w / 2, h - s); }
      else { rect(w * 0.42, 0, w * 0.16, h); }
      break;
    case 'ㅢ':
      drawVowel('ㅡ', 0, 0, w * 0.6, h);
      drawVowel('ㅣ', w * 0.6, 0, w * 0.4, h);
      break;
    default:
      if (lineMode) { line(w / 2, s, w / 2, h - s); }
      else { rect(w * 0.42, 0, w * 0.16, h); }
  }
  pop();
}

// ──────────────── 영문 ────────────────
function drawAscii(ch, x, y, w, h) {
  push();
  translate(x, y);
  const c = fillColor();
  noStroke();
  setGradient(0, 0, w, h, color(c), color(shade(c, 0.7)));
  rect(0, 0, w, h);
  fill(bgColor);
  textAlign(CENTER, CENTER);
  textSize(h * 0.7);
  textStyle(BOLD);
  text(ch, w / 2, h / 2);
  pop();
}

// ──────────────── 헬퍼 ────────────────
function setGradient(x, y, w, h, c1, c2) {
  const ctx = drawingContext;
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, c1.toString());
  g.addColorStop(1, c2.toString());
  ctx.fillStyle = g;
  noStroke();
  rect(x, y, w, h);
}

function shade(hex, factor) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.floor(r * factor)},${Math.floor(g * factor)},${Math.floor(b * factor)})`;
}

// 외부 노출
window.hangulArt = {
  setText,
  newPalette,
  setLineMode,
  saveArt,
  palettes: () => PALETTES.map(p => p.name)
};

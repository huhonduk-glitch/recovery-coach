/**
 * 전문가 검수용 출력물을 만든다.
 *   npm run review:packet
 *
 * 만드는 것
 *   docs/REVIEW_PACKET.md    저장소용 (자동 생성, 버전 관리)
 *   docs/review-packet.html  인쇄용 (브라우저에서 열어 PDF 로 저장)
 *
 * 앱의 실제 데이터에서 뽑아내므로, 코드가 바뀌면 다시 실행해서 맞춘다.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const EXERCISE_DIR = join(ROOT, 'src', 'data', 'exercises');
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

const CATEGORY_LABEL = {
  posture: '체형교정',
  dynamicWarmup: '동적웜업',
  functional: '기능성 운동',
  shoulderRecovery: '어깨 회복운동',
  backRecovery: '허리 회복운동',
  kneeRecovery: '무릎 회복운동',
  ankleRecovery: '발목 회복운동',
  neckUpperBackRecovery: '목·등 상부 회복운동',
};

const EQUIP_LABEL = {
  bodyweight: '맨몸', band: '밴드', dumbbell: '덤벨', foamRoller: '폼롤러', mat: '매트',
};

// ---------- 데이터 읽기 ----------
function strField(block, name) {
  return block.match(new RegExp(`${name}: '((?:[^'\\\\]|\\\\.)*)'`))?.[1] ?? '';
}
function arrField(block, name) {
  const m = block.match(new RegExp(`${name}: \\[([\\s\\S]*?)\\],`));
  if (!m) return [];
  return [...m[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((x) => x[1].replace(/\\'/g, "'"));
}
function numField(block, name) {
  const m = block.match(new RegExp(`${name}: (\\d+)`));
  return m ? Number(m[1]) : null;
}

const exercises = [];
for (const file of readdirSync(EXERCISE_DIR).sort()) {
  if (!file.endsWith('.ts') || file === 'helpers.ts' || file === 'index.ts') continue;
  const source = readFileSync(join(EXERCISE_DIR, file), 'utf8');
  for (const block of source.split('defineExercise({').slice(1)) {
    const id = strField(block, 'id');
    if (!id) continue;
    const phaseMatch = block.match(/phase: (\d|null)/);
    exercises.push({
      id,
      name: strField(block, 'name'),
      category: strField(block, 'category'),
      phase: phaseMatch?.[1] === 'null' ? null : Number(phaseMatch?.[1]),
      level: strField(block, 'level'),
      purpose: strField(block, 'purpose'),
      description: arrField(block, 'description'),
      cues: arrField(block, 'cues'),
      precautions: arrField(block, 'precautions'),
      regressions: arrField(block, 'regressions'),
      equipment: arrField(block, 'equipment'),
      sets: numField(block, 'sets'),
      reps: numField(block, 'reps'),
      durationSeconds: numField(block, 'durationSeconds'),
    });
  }
}

// 위험 신호 문항
const questionSource = read('src/features/assessment/assessmentQuestions.ts');
const redFlagBlock = questionSource.split('RED_FLAG_QUESTIONS: readonly RedFlagQuestion[] = [')[1].split('\n];')[0];
const redFlags = [...redFlagBlock.matchAll(/id: '([^']+)',\s*\n?\s*label:\s*\n?\s*'([^']+)',\s*\n?\s*hint:\s*\n?\s*'([^']+)'/g)]
  .map((m) => ({ id: m[1], label: m[2], hint: m[3] }));

// 영양 플랜
const mealSource = read('src/data/mealTemplates.ts');
const plans = [];
for (const block of mealSource.split('    id: ').slice(1)) {
  const title = strField(block, 'title');
  const targetUser = strField(block, 'targetUser');
  const macro = block.match(/macroRatio: \{ carbMin: (\d+), carbMax: (\d+), proteinMin: (\d+), proteinMax: (\d+), fatMin: (\d+), fatMax: (\d+) \}/);
  if (!title) continue;
  plans.push({
    title, targetUser,
    macro: macro ? { c: [macro[1], macro[2]], p: [macro[3], macro[4]], f: [macro[5], macro[6]] } : null,
    principles: arrField(block, 'mainPrinciples'),
    cautions: arrField(block, 'cautionMessages'),
    studentGuide: arrField(block, 'studentSafeGuide'),
  });
}

// 엔진 기준값
const engineSource = read('src/features/assessment/assessmentEngine.ts');
const threshold = (name) => engineSource.match(new RegExp(`export const ${name} = (\\d+)`))?.[1] ?? '?';

// ---------- 문서 ----------
const today = new Date().toISOString().slice(0, 10);
const L = [];
const p = (s = '') => L.push(s);

p('# 리커버핏 Coach — 전문가 검수 요청서');
p('');
p(`> 생성일: ${today} · \`npm run review:packet\` 로 자동 생성`);
p('');
p('---');
p('');
p('## 0. 검수를 부탁드리는 이유');
p('');
p('이 앱은 사용자가 설문에 답하면 **운동 루틴과 영양 가이드를 추천**합니다.');
p('진단·치료·처방은 하지 않으며, 위험 신호가 있으면 운동을 제공하지 않고 상담을 안내합니다.');
p('');
p('**문제는 아래 기준들이 아직 임상 근거로 검증된 값이 아니라는 점입니다.**');
p('기획 단계에서 정한 값이며, 이대로 학생에게 쓰면 위험할 수 있습니다.');
p('');
p('그래서 다음을 봐 주시기를 부탁드립니다.');
p('');
p('| # | 검수 항목 | 이 문서의 위치 |');
p('|---|---|---|');
p('| 1 | 위험 신호 12개 문항이 충분하고 적절한가 | §1 |');
p('| 2 | 위험도 분류(4단계) 기준이 타당한가 | §2 |');
p('| 3 | 통증 점수별 단계 배정 기준이 타당한가 | §3 |');
p('| 4 | 운동 중 통증 대응 기준이 타당한가 | §4 |');
p(`| 5 | 운동 ${exercises.length}개의 선택·단계 배치·주의사항이 적절한가 | §5 |`);
p('| 6 | 영양 4트랙과 탄단지 비율이 적절한가 | §6 |');
p('| 7 | 학생(성장기) 보호 규칙이 충분한가 | §7 |');
p('');
p('**표시 방법** — 각 항목 옆 빈칸에 아래처럼 표시해 주세요.');
p('');
p('| 표시 | 뜻 |');
p('|---|---|');
p('| O | 이대로 괜찮음 |');
p('| △ | 수정 필요 (수정안을 적어 주세요) |');
p('| X | 빼야 함 / 위험함 |');
p('');
p('---');
p('');

// §1 위험 신호
p('## 1. 위험 신호 문항 (12개)');
p('');
p('**동작 규칙**: 아래 12개 중 **하나라도 해당하면** 운동 루틴을 제공하지 않고');
p('전문가 상담 안내 화면으로 보냅니다. 점수화하지 않으며, 대체 운동도 제공하지 않습니다.');
p('');
p('**여쭙고 싶은 것**');
p('');
p('- 빠진 항목이 있습니까?');
p('- 빼도 되는 항목이 있습니까? (과도한 차단은 사용자 이탈로 이어집니다)');
p('- 문구가 일반인에게 오해 없이 전달됩니까?');
p('');
p('| 판정 | # | 문항 | 보조 설명 | 수정 의견 |');
p('|---|---|---|---|---|');
redFlags.forEach((f, i) => {
  p(`|  | ${i + 1} | ${f.label} | ${f.hint} |  |`);
});
p('');
p('**추가로 넣어야 할 항목이 있다면 적어 주세요.**');
p('');
p('```');
p('');
p('');
p('```');
p('');
p('---');
p('');

// §2 위험도
p('## 2. 위험도 분류 (4단계)');
p('');
p('| 판정 | 분류 | 조건 | 앱의 반응 |');
p('|---|---|---|---|');
p('|  | **Red** | 위험 신호 1개 이상 **또는** 통증 7점 이상 | 운동 제공 중단, 상담 안내 |');
p('|  | **Yellow** | 통증 4~6점, 또는 붓기·당일 발생·상시 통증 | 저강도 회복운동 (Phase 1) |');
p('|  | **Green** | 통증 0~3점, 위험 신호 없음 | 회복·교정 운동 |');
p('|  | **Performance** | 통증 0점 + 주 3회 이상 운동 + 수행능력/근력 목표 | 기능성 운동 |');
p('');
p('**여쭙고 싶은 것** — Yellow 로 보내는 "급성 신호"(붓기 있음 / 오늘 발생 / 항상 아픔)의');
p('조합이 적절합니까? 이 중 Red 로 올려야 할 것이 있습니까?');
p('');
p('---');
p('');

// §3 통증 배정
p('## 3. 통증 점수별 단계 배정');
p('');
p('통증 척도는 0~10 이며, 화면에는 숫자와 함께 아래 라벨을 같이 보여 줍니다.');
p('');
p('| 점수 | 화면 라벨 |');
p('|---|---|');
p('| 0 | 통증 없음 |');
p('| 1~3 | 신경 쓰이지만 생활은 가능 |');
p('| 4~6 | 움직일 때 꽤 아픔 |');
p('| 7~8 | 많이 아픔, 생활이 어려움 |');
p('| 9~10 | 참기 어려움 |');
p('');
p('| 판정 | 최고 통증 점수 | 앱의 반응 | 현재 기준값 |');
p('|---|---|---|---|');
p(`|  | ${threshold('PAIN_STOP_THRESHOLD')}점 이상 | 운동 제공 안 함, 상담 안내 | \`PAIN_STOP_THRESHOLD = ${threshold('PAIN_STOP_THRESHOLD')}\` |`);
p(`|  | ${threshold('PAIN_PHASE1_THRESHOLD')}~${Number(threshold('PAIN_STOP_THRESHOLD')) - 1}점 | Phase 1 (통증 완화/가동성) | \`PAIN_PHASE1_THRESHOLD = ${threshold('PAIN_PHASE1_THRESHOLD')}\` |`);
p(`|  | ${threshold('PAIN_PHASE2_THRESHOLD')}~${Number(threshold('PAIN_PHASE1_THRESHOLD')) - 1}점 | Phase 2 (안정화/활성화) | \`PAIN_PHASE2_THRESHOLD = ${threshold('PAIN_PHASE2_THRESHOLD')}\` |`);
p('|  | 0점 | 회복운동 대상 아님, 목표별 루틴 | — |');
p('');
p('**여쭙고 싶은 것**');
p('');
p('- 차단 기준을 7점으로 두는 것이 타당합니까? 더 낮춰야 합니까?');
p('- 통증 4~6점 사용자에게 Phase 1 을 제공하는 것이 적절합니까?');
p('- 3개월 이상 지속되는 통증은 점수와 무관하게 차단해야 합니까?');
p('  (현재는 통증 점수만 봅니다)');
p('');
p('---');
p('');

// §4 운동 중 대응
p('## 4. 운동 중 통증 대응');
p('');
p('운동 중 언제든 "통증 체크" 를 누를 수 있고, 응답에 따라 아래처럼 반응합니다.');
p('');
p('| 판정 | 통증 점수 | 앱의 반응 |');
p('|---|---|---|');
p(`|  | 0~${Number(threshold('IN_WORKOUT_REDUCE_THRESHOLD')) - 1}점 | 현재 루틴 유지 |`);
p(`|  | ${threshold('IN_WORKOUT_REDUCE_THRESHOLD')}~${Number(threshold('IN_WORKOUT_STOP_THRESHOLD')) - 1}점 | 횟수 절반, 가동범위 축소, 쉬운 동작으로 변경 |`);
p(`|  | ${threshold('IN_WORKOUT_STOP_THRESHOLD')}점 이상 | 해당 운동 중단, 기록 저장, 상담 안내 |`);
p('');
p('**운동 후**: 통증이 운동 전보다 높으면 다음 루틴 강도를 낮춥니다.');
p('');
p('**여쭙고 싶은 것** — 중단 기준 6점이 적절합니까? 운동 후 통증 증가가 반복될 때');
p('몇 회에서 상담으로 보내야 합니까? (현재는 다음 루틴 강도 하향만 합니다)');
p('');
p('---');
p('');

// §5 운동
p(`## 5. 운동 목록 (${exercises.length}개)`);
p('');
p('**여쭙고 싶은 것**');
p('');
p('- 해당 단계(Phase)에 맞지 않는 동작이 있습니까?');
p('- 주의사항이 빠졌거나 부족한 동작이 있습니까?');
p('- 이 앱에서 빼야 할 동작이 있습니까?');
p('');
p('각 동작 왼쪽 `[  ]` 에 O / △ / X 를 적어 주세요.');
p('');

const byCategory = new Map();
for (const e of exercises) {
  if (!byCategory.has(e.category)) byCategory.set(e.category, []);
  byCategory.get(e.category).push(e);
}

for (const [category, list] of byCategory) {
  p(`### ${CATEGORY_LABEL[category] ?? category} (${list.length}개)`);
  p('');
  let phase;
  for (const e of list) {
    if (e.phase !== phase) {
      phase = e.phase;
      if (phase !== null) {
        p(`#### Phase ${phase}`);
        p('');
      }
    }
    const volume = [
      e.sets ? `${e.sets}세트` : null,
      e.reps ? `${e.reps}회` : null,
      e.durationSeconds ? `${e.durationSeconds}초` : null,
    ].filter(Boolean).join(' · ');

    p(`**[  ] ${e.name}**  \`${e.id}\` · ${e.level === 'beginner' ? '초급' : '중급'} · ${volume} · ${e.equipment.map((k) => EQUIP_LABEL[k] ?? k).join(', ')}`);
    p('');
    p(`- 목적: ${e.purpose}`);
    p(`- 방법: ${e.description.join(' → ')}`);
    p(`- 핵심 포인트: ${e.cues.join(' / ')}`);
    p(`- 주의사항: ${e.precautions.join(' / ')}`);
    p(`- 쉬운 버전: ${e.regressions.join(' / ')}`);
    p('- 의견: ');
    p('');
  }
}

p('---');
p('');

// §6 영양
p('## 6. 영양 가이드 (4트랙)');
p('');
p('**여쭙고 싶은 것**');
p('');
p('- 탄단지 비율이 적절합니까? 최신 한국인 영양소 섭취기준과 맞습니까?');
p('- 성장기 청소년에게 그대로 적용해도 됩니까?');
p('- 빠진 주의사항이 있습니까?');
p('');
for (const plan of plans) {
  p(`### [  ] ${plan.title}`);
  p('');
  p(`- 대상: ${plan.targetUser}`);
  if (plan.macro) {
    p(`- 탄수화물 ${plan.macro.c[0]}~${plan.macro.c[1]}% · 단백질 ${plan.macro.p[0]}~${plan.macro.p[1]}% · 지방 ${plan.macro.f[0]}~${plan.macro.f[1]}%`);
  }
  p(`- 핵심 원칙: ${plan.principles.join(' / ')}`);
  p(`- 학생 안내: ${plan.studentGuide.join(' / ')}`);
  p(`- 주의 문구: ${plan.cautions.join(' / ')}`);
  p('- 의견: ');
  p('');
}
p('---');
p('');

// §7 학생 보호
p('## 7. 학생(성장기) 보호 규칙');
p('');
p('만 18세 미만이거나 사용자 유형을 "학생" 으로 고른 경우 아래가 적용됩니다.');
p('');
p('| 판정 | 규칙 |');
p('|---|---|');
p('|  | 목표 체중·감량 기한·칼로리 목표·체지방률 목표 기능을 **만들지 않음** |');
p('|  | 탄단지 비율 숫자를 **엔진 단계에서 생성하지 않음** (화면에서 숨기는 방식이 아님) |');
p('|  | 결과 화면에 "칼로리", "감량" 단어를 노출하지 않음 |');
p('|  | 섭취량은 손바닥·주먹·엄지 기준으로만 안내 |');
p('|  | 식습관 위험 응답(무리한 다이어트 / 잦은 결식 / 폭식·구토 / 생리불순)이 하나라도 있으면 체중 조절 플랜 대신 균형식 + 전문가 상담으로 대체 |');
p('|  | 체중 변화 그래프, 다른 사용자와의 비교·랭킹 기능 없음 |');
p('');
p('**여쭙고 싶은 것** — 추가로 막아야 할 것이 있습니까?');
p('');
p('```');
p('');
p('');
p('```');
p('');
p('---');
p('');

// 서명
p('## 8. 검수 확인');
p('');
p('| 항목 | 내용 |');
p('|---|---|');
p('| 검수자 성함 |  |');
p('| 자격 / 소속 |  |');
p('| 검수일 |  |');
p('| 연락처 (선택) |  |');
p('');
p('### 종합 의견');
p('');
p('```');
p('');
p('');
p('');
p('```');
p('');
p('### 이 앱을 학생에게 사용해도 되겠습니까?');
p('');
p('- [ ] 이대로 사용 가능');
p('- [ ] 위 수정사항 반영 후 사용 가능');
p('- [ ] 현재 상태로는 사용 권하지 않음');
p('');
p('---');
p('');
p('검수해 주셔서 감사합니다. 지적해 주신 내용은 앱에 반영하고,');
p('반영 결과를 다시 확인받겠습니다.');
p('');

const markdown = L.join('\n');
writeFileSync(join(ROOT, 'docs', 'REVIEW_PACKET.md'), markdown);

// ---------- 인쇄용 HTML ----------
function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** 아주 단순한 마크다운 → HTML (이 문서가 쓰는 문법만 처리) */
function toHtml(md) {
  const out = [];
  let inTable = false;
  let inCode = false;

  for (const raw of md.split('\n')) {
    const line = raw;

    if (line.trim() === '```') {
      out.push(inCode ? '</pre>' : '<pre class="write">');
      inCode = !inCode;
      continue;
    }
    if (inCode) { out.push(esc(line)); continue; }

    if (line.startsWith('|')) {
      const cells = line.split('|').slice(1, -1);
      if (/^[\s|:-]+$/.test(line)) continue;
      if (!inTable) { out.push('<table>'); inTable = true; }
      const tag = out[out.length - 1] === '<table>' ? 'th' : 'td';
      out.push('<tr>' + cells.map((c) => `<${tag}>${inline(c.trim())}</${tag}>`).join('') + '</tr>');
      continue;
    }
    if (inTable) { out.push('</table>'); inTable = false; }

    if (line.startsWith('#### ')) out.push(`<h4>${inline(line.slice(5))}</h4>`);
    else if (line.startsWith('### ')) out.push(`<h3>${inline(line.slice(4))}</h3>`);
    else if (line.startsWith('## ')) out.push(`<h2>${inline(line.slice(3))}</h2>`);
    else if (line.startsWith('# ')) out.push(`<h1>${inline(line.slice(2))}</h1>`);
    else if (line.startsWith('> ')) out.push(`<blockquote>${inline(line.slice(2))}</blockquote>`);
    else if (line.startsWith('- [ ] ')) out.push(`<p class="check">☐ ${inline(line.slice(6))}</p>`);
    else if (line.startsWith('- ')) out.push(`<li>${inline(line.slice(2))}</li>`);
    else if (line.trim() === '---') out.push('<hr>');
    else if (line.trim() === '') out.push('');
    else out.push(`<p>${inline(line)}</p>`);
  }
  if (inTable) out.push('</table>');
  return out.join('\n');
}

function inline(s) {
  return esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>리커버핏 Coach 전문가 검수 요청서</title>
<style>
  @page { size: A4; margin: 18mm 15mm; }
  body { font-family: -apple-system, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
         line-height: 1.7; color: #0F172A; max-width: 820px; margin: 0 auto; padding: 24px; }
  h1 { font-size: 24px; border-bottom: 3px solid #2563EB; padding-bottom: 10px; }
  h2 { font-size: 19px; margin-top: 32px; border-left: 5px solid #2563EB; padding-left: 10px;
       page-break-after: avoid; }
  h3 { font-size: 16px; margin-top: 22px; color: #1D4ED8; page-break-after: avoid; }
  h4 { font-size: 15px; margin-top: 16px; color: #475569; page-break-after: avoid; }
  table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 13px;
          page-break-inside: avoid; }
  th, td { border: 1px solid #CBD5E1; padding: 7px 9px; text-align: left; vertical-align: top; }
  th { background: #EFF6FF; font-weight: 600; }
  td:first-child { text-align: center; min-width: 42px; }
  blockquote { border-left: 4px solid #F59E0B; background: #FEF3C7; margin: 12px 0;
               padding: 10px 14px; font-size: 14px; }
  code { background: #F1F5F9; padding: 1px 5px; border-radius: 4px; font-size: 12px; }
  pre.write { border: 1px solid #CBD5E1; border-radius: 6px; min-height: 70px;
              background: #fff; margin: 10px 0; }
  li { margin-left: 20px; font-size: 14px; }
  p { font-size: 14px; }
  p.check { font-size: 15px; }
  hr { border: none; border-top: 1px solid #E2E8F0; margin: 26px 0; }
  strong { color: #0F172A; }
  @media print { body { padding: 0; } h2 { page-break-before: auto; } }
</style>
</head>
<body>
${toHtml(markdown)}
</body>
</html>`;

writeFileSync(join(ROOT, 'docs', 'review-packet.html'), html);

console.log(`[review:packet] 위험신호 ${redFlags.length}개 · 운동 ${exercises.length}개 · 영양 ${plans.length}트랙`);
console.log('  docs/REVIEW_PACKET.md');
console.log('  docs/review-packet.html  ← 브라우저에서 열어 인쇄 > PDF로 저장');

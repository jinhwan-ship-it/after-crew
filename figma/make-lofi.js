// Lo-fi · use_figma 호출 코드 생성 (Figma 파일 9eNEAWAgW4rhZ4C1QPz0Hz · 페이지 "Lo-fi r6")
//   node figma/lofi-convert.js                 → figma/lofi/<id>.json
//   TERSER=<terser> node figma/make-lofi.js      → figma/calls/lofi-_builder.js + lofi-<n>.js (화면 여러 장씩 묶음)
const fs = require('fs'), path = require('path');
const { minify } = require(process.env.TERSER || 'terser');
const PAGE = '149:571';
// 섹션 · 배치 (x = 80 + 열 × 470, 본 줄 y = 160, 갈래 줄 y = 1204)
const SEC = { S1: '149:572', S2: '149:573', S3: '149:574', S4: '149:575' };
const X = c => 80 + c * 470, Y0 = 160, Y1 = 1204;
const LAYOUT = [
  ['S1', 'A-find', 0, Y0], ['S1', 'B-session-walk', 1, Y0], ['S1', 'B1-apply-sheet', 2, Y0], ['S1', 'B-session-applied-today', 3, Y0],
  ['S1', 'H-chat', 4, Y0], ['S1', 'C-today-before', 5, Y0], ['S1', 'C-today-going', 6, Y0], ['S1', 'C-today-done', 7, Y0], ['S1', 'D-map', 8, Y0],
  ['S1', 'B-session-bike', 1, Y1], ['S1', 'H-msg-sheet', 4, Y1], ['S1', 'F-report-msg', 5, Y1], ['S1', 'D1-course-sheet', 8, Y1],
  ['S2', 'A-find-empty', 0, Y0], ['S2', 'A1-gu-sheet', 1, Y0], ['S2', 'K-search', 2, Y0], ['S2', 'K-search-results', 3, Y0], ['S2', 'J-notifications', 4, Y0], ['S2', 'I-chats', 5, Y0],
  ['S3', 'E0-verify', 0, Y0], ['S3', 'E1-activity', 1, Y0], ['S3', 'E2-course', 2, Y0], ['S3', 'E3-when', 3, Y0], ['S3', 'E4-preview', 4, Y0], ['S3', 'E5-created', 5, Y0],
  ['S3', 'A-find-host-pinned', 6, Y0], ['S3', 'Cp-host-checked', 7, Y0], ['S3', 'Cp-host-ended', 8, Y0], ['S3', 'H-chat-closed', 9, Y0],
  ['S4', 'G-me', 0, Y0], ['S4', 'G1-edit', 1, Y0], ['S4', 'G2-settings', 2, Y0]
];
module.exports = { PAGE, SEC, LAYOUT, X, Y0, Y1 };
if (require.main !== module) return;
(async () => {
  const out = path.join(__dirname, 'calls');
  fs.mkdirSync(out, { recursive: true });
  const body = fs.readFileSync(path.join(__dirname, 'lofi-builder.js'), 'utf8');
  const m = await minify(`globalThis.__B=async function M(J,POS,PARENT,PAGE){\n${body}\n};`, { compress: { passes: 2 }, mangle: { reserved: ['M', 'figma'] } });
  const src = '(' + m.code.replace(/^globalThis\.__B=/, '').replace(/;$/, '') + ')';
  fs.writeFileSync(path.join(out, 'lofi-_builder.js'), `const page=await figma.getNodeByIdAsync('${PAGE}');\npage.setSharedPluginData('aftercrew','lofi',${JSON.stringify(src)});\nreturn {stored:page.getSharedPluginData('aftercrew','lofi').length};`);
  console.log('builder', src.length);
  // 묶음: 호출 코드 45KB 이하
  const LS = String.fromCharCode(0x2028);
  let batch = [], size = 0, n = 0;
  const flush = () => {
    if (!batch.length) return;
    const code = `const L=[${batch.join(',')}];\nconst page=await figma.getNodeByIdAsync('${PAGE}');\nconst M=(0,eval)(page.getSharedPluginData('aftercrew','lofi'));\nconst out=[];for(const [J,x,y,sec] of L){const r=await M(J,[x,y],sec,'${PAGE}');out.push([r.name,r.id,r.nodes,r.off.length?r.off:0]);}\nreturn out;`;
    fs.writeFileSync(path.join(out, `lofi-${++n}.js`), code);
    console.log(`lofi-${n}.js`, code.length, batch.length);
    batch = []; size = 0;
  };
  for (const [s, id, col, y] of LAYOUT) {
    const J = fs.readFileSync(path.join(__dirname, 'lofi', id + '.json'), 'utf8').split(LS).join('\\u2028');
    const item = `[${J},${X(col)},${y},'${SEC[s]}']`;
    if (size + item.length > 23000) flush();
    batch.push(item); size += item.length;
  }
  flush();
})();

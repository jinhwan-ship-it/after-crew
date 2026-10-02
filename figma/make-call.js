// M5 호출 코드 생성
//   node figma/make-call.js --builder                 → figma/calls/_builder.js (빌더를 페이지 shared plugin data에 한 번 저장)
//   node figma/make-call.js <화면id> <x> <y> <섹션id>  → figma/calls/<id>.js (JSON + 저장된 빌더 실행)
const fs = require('fs'), path = require('path');
const { minify } = require(process.env.TERSER || 'terser');
(async () => {
  const a = process.argv.slice(2);
  fs.mkdirSync(path.join(__dirname, 'calls'), { recursive: true });
  if (a[0] === '--builder') {
    const body = fs.readFileSync(path.join(__dirname, 'builder.js'), 'utf8');
    const m = await minify(`globalThis.__B=async function M(J,POS,PARENT){\n${body}\n};`, { compress: { passes: 2 }, mangle: { reserved: ['M', 'figma'] } });
    const src = '(' + m.code.replace(/^globalThis\.__B=/, '').replace(/;$/, '') + ')';
    const code = `const page=await figma.getNodeByIdAsync('50:571');\npage.setSharedPluginData('aftercrew','builder',${JSON.stringify(src)});\nreturn {stored:page.getSharedPluginData('aftercrew','builder').length};`;
    fs.writeFileSync(path.join(__dirname, 'calls', '_builder.js'), code);
    console.log('builder', src.length);
    return;
  }
  const [id, x, y, parent] = a;
  const J = fs.readFileSync(path.join(__dirname, 'export', id + '.json'), 'utf8');
  const code = `const J=${J};\nconst page=await figma.getNodeByIdAsync('50:571');\nconst M=(0,eval)(page.getSharedPluginData('aftercrew','builder'));\nreturn await M(J,[${+x || 0},${+y || 0}],${parent ? `'${parent}'` : 'null'});`;
  fs.writeFileSync(path.join(__dirname, 'calls', id + '.js'), code);
  console.log(id, code.length);
})();

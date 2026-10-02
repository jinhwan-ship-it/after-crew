// r6 · 상단 바만 바뀐 화면은 상단 바 하위 트리만 다시 만든다 (화면 전체 재생성보다 호출이 작다)
// 사용: node figma/make-topbar-patch.js <화면id> <섹션id>  → figma/calls/topbar-<화면id>.js
const fs = require('fs'), path = require('path');
const [id, sec] = process.argv.slice(2);
const J = JSON.parse(fs.readFileSync(path.join(__dirname, 'export', id + '.json'), 'utf8'));
let tb = null;
(function find(n) { if (tb || !n.k) return; for (const c of n.k) { if (/^topbar/.test(c.n || '') && c.t === 'F') { tb = c; return; } find(c); } })(J);
if (!tb) { console.error('topbar 없음'); process.exit(1); }
const sub = Object.assign({}, tb, { S: J.S });
const LS = String.fromCharCode(0x2028);
const code = `const J=${JSON.stringify(sub).split(LS).join('\\u2028')};
const page=await figma.getNodeByIdAsync('50:571');await figma.setCurrentPageAsync(page);
const sec=await figma.getNodeByIdAsync('${sec}');const scr=sec.children.find(c=>c.name==='${id}');
const inner=scr.findOne(x=>x.name==='screen'&&x.parent&&x.parent.name==='#view');
const old=inner.children.find(c=>/^topbar/.test(c.name));const idx=inner.children.indexOf(old);old.remove();
const M=(0,eval)(page.getSharedPluginData('aftercrew','builder'));
const r=await M(J,[0,0],inner.id);const nb=await figma.getNodeByIdAsync(r.id);
inner.insertChild(idx,nb);nb.layoutSizingHorizontal='FILL';nb.clipsContent=!!J.clip;
return Object.assign(r,{screen:scr.id,index:idx});`;
fs.writeFileSync(path.join(__dirname, 'calls', 'topbar-' + id + '.js'), code);
console.log(id, code.length);

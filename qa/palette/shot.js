const { chromium } = require('playwright'); const path=require('path');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage({viewport:{width:900,height:760},deviceScaleFactor:2});
 const FD=process.env.FONT_DIR; await p.goto('file://'+path.resolve(__dirname,'palette.html'));
 const ff=(fam,file,w)=>`@font-face{font-family:"${fam}";font-weight:${w};src:url("file://${FD}/${file}") format("woff2")}`;
 await p.addStyleTag({content:[ff('Noto Sans KR','@fontsource/noto-sans-kr/files/noto-sans-kr-korean-400-normal.woff2',400),ff('Noto Sans KR','@fontsource/noto-sans-kr/files/noto-sans-kr-korean-700-normal.woff2',700),ff('Archivo','@fontsource/archivo/files/archivo-latin-500-normal.woff2',400)].join('')});
 await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(300);
 await p.screenshot({path:path.resolve(__dirname,'palette-AB.png'),fullPage:true}); await b.close(); })();

import {rmSync,mkdirSync,readFileSync,writeFileSync,copyFileSync} from 'node:fs';
rmSync('dist',{recursive:true,force:true});const assets={};for(const [route,file,type] of [['/','index.html','text/html; charset=utf-8'],['/style.css','style.css','text/css; charset=utf-8'],['/game.js','game.js','text/javascript; charset=utf-8'],['/nickname.js','nickname.js','text/javascript; charset=utf-8'],['/sound.js','sound.js','text/javascript; charset=utf-8']])assets[route]=[type,readFileSync('public/'+file,'utf8')];
assets['/tier-emblems.png']=['image/png',readFileSync('public/tier-emblems.png').toString('base64'),true];
assets['/bgm.mp3']=['audio/mpeg',readFileSync('public/bgm.mp3').toString('base64'),true];
mkdirSync('dist/server',{recursive:true});mkdirSync('dist/.openai',{recursive:true});copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');
writeFileSync('dist/server/index.js','const ASSETS='+JSON.stringify(assets)+';\n'+readFileSync('public/nickname.js','utf8')+'\n'+readFileSync('worker.mjs','utf8'));console.log('Built Last Bell with shared survivor records.');

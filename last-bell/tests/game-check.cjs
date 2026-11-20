const fs=require('fs'),vm=require('vm'),assert=require('assert');
const elements=new Map();function element(){return {style:{},classList:{toggle(){},remove(){},add(){},contains(){return true}},children:[],value:'normal',textContent:'',innerHTML:'',replaceChildren(){this.children=[]},append(x){this.children.push(x)},prepend(x){this.children.unshift(x)},attributes:{},listeners:{},setAttribute(k,v){this.attributes[k]=v},getAttribute(k){return this.attributes[k]},focus(){},addEventListener(k,fn){this.listeners[k]=fn},getBoundingClientRect(){return{left:0,top:0,width:116}},setPointerCapture(){},firstElementChild:{style:{}}}}
const sandbox={document:{body:element(),getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id)},createElement:element,addEventListener(){}},innerWidth:1400,innerHeight:900,devicePixelRatio:1,matchMedia:()=>({matches:false}),addEventListener(){},requestAnimationFrame(){},setInterval(){},setTimeout(){},performance:{now:()=>1000},localStorage:{getItem(){return '0'},setItem(){}},console,Math,AbortSignal,fetch:async()=>({ok:true,json:async()=>({id:'11111111-1111-4111-8111-111111111111'})})};sandbox.window=sandbox;elements.set('game',{...element(),getContext:()=>({setTransform(){}})});vm.createContext(sandbox);vm.runInContext(fs.readFileSync('public/nickname.js','utf8'),sandbox);elements.set('nickname',{...element(),value:'초록고양이'});vm.runInContext(fs.readFileSync('public/sound.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('public/game.js','utf8'),sandbox);
elements.get('nickname').value='초록고양이';
const run=s=>vm.runInContext(s,sandbox);
run('audio.init=()=>{};audio.pause=()=>{};audio.correct=()=>{};audio.wrong=()=>{};audio.tone=()=>{};audio.hit=()=>{};audio.shot=()=>{};audio.reload=()=>{};audio.groan=()=>{}');
for(const hard of [false,true]){run(`hard=${hard}`);for(let i=0;i<5000;i++){const q=run('makeQuestion()');assert.equal(q.choices.length,3);assert.equal(new Set(q.choices).size,3);assert(q.choices.includes(q.answer));assert(q.choices.every(x=>x>0));const text=q.q.replace(/<[^>]+>/g,' '),n=[...text.matchAll(/\d+/g)].map(x=>+x[0]);let expected;if(q.label==='비례식')expected=n[0]*n[2]/n[1];else if(q.label==='비례배분')expected=n[0]*Math.max(n[1],n[2])/(n[1]+n[2]);else if(q.label==='비례식 활용')expected=n[2]*n[0]/n[1];else expected=n[0]*n[2]/(n[1]+n[2]+n[3]);assert(Math.abs(expected-q.answer)<1e-8,JSON.stringify(q))}}
run('start();player.hp=60;player.ammo=3;enemies=[{x:0,y:0,hp:3,stun:0}];answerQuestion(question.choices.indexOf(question.answer))');assert.equal(run('game.correct'),1);assert.equal(run('player.ammo'),24);assert.equal(run('player.hp'),66);assert(run('enemies[0].hp')<=0);
run('nextQuestion();answerQuestion(question.choices.findIndex(v=>v!==question.answer))');assert.equal(run('game.mistakes.length'),1);assert.equal(run('game.attempts'),2);assert(run('questionDelay')>0);
run('start();pause(true)');assert.equal(run('state'),'paused');run('pause(false)');assert.equal(run('state'),'playing');
run('player.ammo=1;reload();update(1.6)');assert.equal(run('player.ammo'),24);
run('start();game.elapsed=179.99;update(.02)');assert.equal(run('state'),'ended');assert.equal(elements.get('endlabel').textContent,'RESCUE COMPLETE');
run('start();player.hp=0;update(.01)');assert.equal(run('state'),'ended');assert.equal(elements.get('endlabel').textContent,'SIGNAL LOST');
run('start();for(let i=0;i<3000&&state==="playing";i++){player.inv=2;update(.04)}');assert(run('game.elapsed')>119);assert(run('enemies.length')>0);
console.log('PASS: 10,000 ratio questions; correct/wrong rewards; pause/resume; reload; victory/defeat; 120-second combat simulation.');

run('start();pause(true);goLobby()');assert.equal(run('state'),'intro');assert.equal(run('player'),null);assert.equal(run('enemies.length'),0);
run('start();firePointer=8;firing=true;stickId=9;stickEnd({pointerId:9})');assert.equal(run('firing'),true);run('releaseFire({pointerId:8})');assert.equal(run('firing'),false);
run('start();firePointer=8;firing=true;releaseFire({pointerId:9})');assert.equal(run('firing'),true);run('pause(true)');assert.equal(run('firing'),false);
run('rankingData=Array.from({length:200},(_,i)=>({rank:i+1,nickname:"초록고양이"+i,win:i%2,elapsed:150,score:200-i,kills:10,correct:2,difficulty:"normal"}));rankingPage=0;renderRanking()');assert.equal(elements.get('rankingRows').children.length,50);assert.equal(elements.get('rankingRows').children.filter(r=>r.className==='top-ranker').length,5);run('rankingPage=3;renderRanking()');assert.equal(elements.get('rankingRows').children[0].children[0].textContent,'151위');assert.equal(elements.get('rankingRows').children[49].children[0].textContent,'200위');console.log('PASS: lobby reset, independent multitouch, 4 ranking pages and top-five badges.');

// Drive the actual two-pointer handlers: the aiming stick must beat nearby enemies.
run('start();coarse=true;game.spawn=999;enemies=[{x:-300,y:0,hp:99,maxhp:99,r:5,speed:0,walk:0,stun:0}];');
const event=(pointerId,clientX=58,clientY=58)=>({pointerId,clientX,clientY,preventDefault(){}});
elements.get('stick').onpointerdown(event(11,116,58));elements.get('fire').listeners.pointerdown(event(22));run('update(.01)');assert(run('bullets[0].vx')>850);assert(Math.abs(run('bullets[0].vy'))<40);
elements.get('stick').onpointermove(event(11,0,58));run('player.cool=0;update(.01)');assert(run('bullets[1].vx')< -850);
elements.get('stick').onpointermove(event(11,58,0));run('player.cool=0;update(.01)');assert(run('bullets[2].vy')< -850);
elements.get('stick').onpointerup(event(11));assert.equal(run('firing'),true);run('player.cool=0;update(.01)');assert(run('bullets[3].vy')< -850);assert.equal(run('joy.x'),0);assert.equal(run('joy.y'),0);
elements.get('fire').listeners.pointerup(event(22));assert.equal(run('firing'),false);
run('setQuizCollapsed(false)');assert.equal(elements.get('toggleQuiz').getAttribute('aria-expanded'),'true');elements.get('toggleQuiz').onclick();assert.equal(elements.get('toggleQuiz').getAttribute('aria-expanded'),'false');assert.equal(elements.get('toggleQuiz').textContent,'문제 보기');elements.get('toggleQuiz').onclick();assert.equal(elements.get('toggleQuiz').getAttribute('aria-expanded'),'true');
console.log('PASS: real two-pointer direction changes and bullets, last direction after release, quiz collapse/expand.');
for(const [rank,name] of [[1,'그랜드마스터'],[5,'그랜드마스터'],[6,'베테랑'],[20,'베테랑'],[21,'다이아'],[50,'다이아'],[51,'골드'],[100,'골드'],[101,'실버'],[150,'실버'],[151,'브론즈'],[200,'브론즈']])assert.equal(run(`rankTier(${rank}).name`),name);
for(const rank of [0,201,1.5])assert.equal(run(`rankTier(${rank})`),null);
for(let page=0;page<4;page++){run(`rankingPage=${page};renderRanking()`);for(const tr of elements.get('rankingRows').children){const rank=Number(tr.children[0].textContent.replace('위',''));assert.equal(tr.children[1].children[0].textContent,run(`rankTier(${rank}).name`))}}
console.log('PASS: all 200 rendered rank badges and every tier boundary.');

for(let page=0;page<4;page++){run(`rankingPage=${page};renderRanking()`);for(const tr of elements.get('rankingRows').children){const rank=Number(tr.children[0].textContent.replace('위','')),icon=tr.children[1].children[0].children[0];assert.equal(icon.className,'tier-icon icon-'+run(`rankTier(${rank}).key`));assert.equal(icon.getAttribute('aria-hidden'),'true')}}
console.log('PASS: all 200 ranks render the correct emblem alongside their tier title.');

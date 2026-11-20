// MP3 media playback for iOS Safari and Android; Web Audio remains for effects.
class Sound {
 constructor(){this.fanfareNodes=[];this.sirenNodes=[];
  this.ctx=null;this.volume=.65;this.music=document.getElementById('bgm');this.playAttempt=0;this.blocked=false;
  for(const event of ['playing','pause','error','volumechange'])this.music.addEventListener(event,()=>this.updateStatus());
 }
 init(){
  try{
   if(!this.ctx||this.ctx.state==='closed'){
    const Context=window.AudioContext||window.webkitAudioContext;if(!Context)return;
    this.ctx=new Context();this.master=this.ctx.createGain();this.master.gain.value=muted?0:this.volume*.6;
    const comp=this.ctx.createDynamicsCompressor();comp.threshold.value=-20;comp.ratio.value=5;this.master.connect(comp);comp.connect(this.ctx.destination);
    this.noiseBuffer=this.ctx.createBuffer(1,this.ctx.sampleRate*2,this.ctx.sampleRate);const data=this.noiseBuffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
   }
   this.resumeEffects();
  }catch{this.ctx=null}
 }
 resumeEffects(){
  if(!this.ctx)return;
  try{
   if(this.ctx.state!=='running')Promise.resolve(this.ctx.resume()).catch(()=>{});
   // A silent buffer, started inside the user's tap, unlocks older WebKit contexts.
   const source=this.ctx.createBufferSource();source.buffer=this.ctx.createBuffer(1,1,this.ctx.sampleRate);source.connect(this.master);source.start(0);
  }catch{}
 }
 setVolume(value){this.volume=Math.max(0,Math.min(1,value));this.music.volume=this.volume*.75;this.music.muted=muted;if(this.master&&this.ctx)this.master.gain.setTargetAtTime(muted?0:this.volume*.6,this.ctx.currentTime,.05);this.updateStatus()}
 playMusic(){
  this.setVolume(this.volume);if(muted||this.volume===0)return;
  const attempt=++this.playAttempt;this.blocked=false;
  try{
   // Do not await a network request or AudioContext.resume() before this play().
   const result=this.music.play();
   Promise.resolve(result).then(()=>{if(attempt===this.playAttempt){this.blocked=false;this.updateStatus()}},()=>{if(attempt===this.playAttempt){this.blocked=true;this.updateStatus()}});
  }catch{this.blocked=true;this.updateStatus()}
 }
 updateStatus(){
  const button=document.getElementById('sound');if(!button)return;
  const off=muted||this.volume===0,needsTap=!off&&state==='playing'&&(this.blocked||this.music.paused);
  button.textContent=off?'♪ SOUND OFF':needsTap?'♪ 소리 켜기':'♪ SOUND ON';
  button.setAttribute('aria-label',off?'소리 켜기':needsTap?'BGM 재생 다시 시도':'소리 끄기');
  button.setAttribute('title',needsTap?'눌러서 BGM을 재생하세요':'BGM과 효과음');
 }
 pause(on){
  if(on){this.stopSiren();this.stopFanfare();++this.playAttempt;this.music.pause();if(this.ctx)try{Promise.resolve(this.ctx.suspend()).catch(()=>{})}catch{};this.updateStatus()}
  else{
   try{if(window.navigator?.audioSession)window.navigator.audioSession.type='playback'}catch{}
   this.init();this.playMusic();
  }
 }
tone(f,d,v=.1,type='sine',at=0,end){if(!this.ctx)return;let t=at||this.ctx.currentTime,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(end)o.frequency.exponentialRampToValueAtTime(end,t+d);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.001,v),t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+d+.02);return o}noise(d,v,f,at=0){if(!this.ctx)return;let t=at||this.ctx.currentTime,s=this.ctx.createBufferSource(),g=this.ctx.createGain(),filter=this.ctx.createBiquadFilter();s.buffer=this.noiseBuffer;filter.type='lowpass';filter.frequency.value=f;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(filter);filter.connect(g);g.connect(this.master);s.start(t,Math.random());s.stop(t+d)}
shot(){this.noise(.09,.28,3000);this.tone(170,.07,.16,'sawtooth',0,45)}hit(){this.noise(.1,.18,700);this.tone(90,.12,.12,'triangle',0,30)}correct(){if(!this.ctx)return;[329.63,440,659.25,880].forEach((f,i)=>this.tone(f,.4,.12,'triangle',this.ctx.currentTime+i*.07));this.noise(.8,.24,4800)}wrong(){if(!this.ctx)return;this.tone(160,.25,.14,'square');this.tone(119,.4,.1,'triangle',this.ctx.currentTime+.12)}groan(){this.tone(rnd(55,75),.7,.035,'sawtooth',0,35)}reload(){this.noise(.06,.14,3000);setTimeout(()=>{if(state==='playing')this.noise(.08,.15,2200)},300)}
stopFanfare(){for(const node of this.fanfareNodes||[])try{node.stop()}catch{}this.fanfareNodes=[]}
fanfare(){
 this.stopFanfare();if(muted||this.volume===0)return;this.init();if(!this.ctx)return;
 const at=this.ctx.currentTime+.05;
 const notes=[[392,0,.18],[523.25,.18,.18],[659.25,.36,.2],[783.99,.58,.3],[1046.5,.92,.35]];
 const play=(f,start,d,volume,type)=>{const node=this.tone(f,d,volume,type,at+start);if(node)this.fanfareNodes.push(node)};
 for(const [f,start,d] of notes){play(f,start,d,.2,'triangle');play(f/2,start,d,.055,'sawtooth')}
 for(const f of [261.63,329.63,392,523.25])play(f,1.28,1.35,.085,'triangle');
}
stopSiren(){for(const node of this.sirenNodes||[])try{node.stop()}catch{}this.sirenNodes=[]}
siren(){
 this.stopSiren();if(muted||this.volume===0)return;this.init();if(!this.ctx)return;
 const at=this.ctx.currentTime+.05;
 // Two bounded up/down sweeps; all nodes are scheduled on the audio clock.
 for(let cycle=0;cycle<2;cycle++){
  const start=at+cycle*1.2;
  const rising=this.tone(440,.6,.18,'triangle',start,880);
  const falling=this.tone(880,.6,.18,'triangle',start+.6,440);
  if(rising)this.sirenNodes.push(rising);if(falling)this.sirenNodes.push(falling);
 }
}
bossVictory(){
 if(muted||this.volume===0)return;this.init();if(!this.ctx)return;
 const at=this.ctx.currentTime+.025;
 // A compact electric discharge/chord, separate from the grandmaster fanfare.
 this.tone(180,.3,.16,'sawtooth',at,65);
 this.tone(523.25,.28,.12,'triangle',at+.15);
 this.tone(783.99,.45,.1,'triangle',at+.32);
 this.tone(1046.5,.55,.08,'sine',at+.43);
}
}

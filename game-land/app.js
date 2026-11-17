"use strict";
/*
 * 우리 반 게임랜드 / Game Land
 * 새 게임 등록: 아래 GAMES 배열에 한 항목을 추가합니다.
 * url: 실제 실행 주소가 알려진 경우만 입력. 모르면 null.
 * source: GitHub 프로젝트 주소가 있으면 입력.
 * 이 페이지는 게임을 실행하거나 순위 데이터를 보관하지 않습니다.
 */
const GAMES = [
  {id:"market",title:"뚱냥이의 시장경제 퀴즈",short:"고양이와 배우는 시장경제",subject:"사회",genre:"학습 퀴즈",emoji:"🌏",word:"CAT QUIZ",colors:["#32497d","#9f83f5"],url:"https://market-quiz-cat.reiner5427.chatgpt.site/",source:"https://github.com/reiner5427-eng/market-quiz-cat",description:"시장경제와 국가 간 거래 문제에 도전하세요. 정답을 맞힐수록 고양이가 간식을 먹고 몸무게가 늘어나요. 최고 기록을 세우고 명예의 전당에도 이름을 남겨 보세요.",features:["초등 사회 6학년 경제 단원 퀴즈","정답마다 고양이 몸무게와 점수 증가","온라인 명예의 전당으로 기록 경쟁"],featured:true},
  {id:"ratio",title:"비와 비율 냥퀴즈",short:"문제를 풀고 냥이 성장시키기",subject:"수학",genre:"학습 퀴즈",emoji:"🐱",word:"MATH CAT",colors:["#8b5373","#f2a8bd"],url:"https://ratio-quiz-cat.reiner5427.chatgpt.site/",source:null,description:"비와 비율을 연습하는 고양이 퀴즈 게임입니다. 수학 문제에 도전하고 친구들과 실력을 겨뤄 보세요.",features:["비와 비율 관련 문제 풀이","고양이와 함께하는 퀴즈 형식","닉네임을 이용한 기록 경쟁"]},
  {id:"crossy",title:"냥냥! 국어 길건너기",short:"길을 건너며 체크포인트 퀴즈",subject:"국어",genre:"학습 액션",emoji:"🚦",word:"CROSSY",colors:["#317768","#8ed7a3"],url:"https://reiner5427-eng.github.io/first/",source:"https://github.com/reiner5427-eng/first",description:"차량과 기차, 강을 피해 길을 건너고, 체크포인트에서 국어 퀴즈를 풀어요. 언어와 소통을 모험처럼 익히는 게임입니다.",features:["15칸마다 국어 4지선다 체크포인트","차량·기차·강·통나무 장애물 회피","목숨 3개와 기록 경쟁"]},
  {id:"stackcat",title:"쌓냥이 만들기",short:"공간 감각을 키우는 쌓기나무 게임",subject:"수학",genre:"학습 퀴즈",emoji:"🧱",word:"STACK UP",colors:["#886544","#e3b16d"],url:"https://ssatnyang-cube-lab.reiner5427.chatgpt.site/",source:null,description:"앞·옆·위에서 본 모습을 살펴 입체 블록을 완성하는 공간 감각 게임입니다. 문제를 맞힐수록 점수와 고양이 몸무게가 늘어납니다.",features:["정면·옆면·윗면을 보고 블록 쌓기","정답마다 점수와 몸무게 증가","명예의 전당 1~200위 기획"]},
  {id:"fattencat",title:"뚱냥이 만들기",short:"나눗셈을 풀고 간식 주기",subject:"수학",genre:"학습 퀴즈",emoji:"🍣",word:"FEED CAT",colors:["#986c53","#f3bd94"],url:"https://ddungnyangi-mandeulgi.reiner5427.chatgpt.site/",source:null,description:"나눗셈의 몫과 나머지를 구해 고양이에게 간식을 주세요. 시간 안에 고양이를 얼마나 성장시킬 수 있을까요?",features:["자연수 나눗셈의 몫·나머지 문제","시간 제한 안에 많이 먹이기","몸무게 기록과 명예의 전당"]},
  {id:"blocks3d",title:"차곡차곡 · 쌓기나무 3D",short:"돌려 보고 직접 쌓는 수학 놀이터",subject:"도구",genre:"3D 시뮬레이터",emoji:"🧊",word:"3D BLOCKS",colors:["#367b82","#82d8c9"],url:"https://reiner5427-eng.github.io/stacking-blocks-3d/",source:"https://github.com/reiner5427-eng/stacking-blocks-3d",description:"원하는 위치에 블록을 쌓고 다양한 방향에서 관찰하는 3D 시뮬레이터입니다. 쌓기나무의 구조를 직접 만들고 돌려 보세요.",features:["7×7 바닥 위에 블록 자유롭게 쌓기","정면·옆면·위 시점 전환","마우스·터치 회전과 확대·축소"]}
];
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const el = (tag,cls,txt) => {const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n};
const state={filter:"all",query:"",sort:"default",selected:null,previousFocus:null};
const storageKey="game-land-favorites-v1";
let favorites=new Set();
try{const v=JSON.parse(localStorage.getItem(storageKey)||"[]");if(Array.isArray(v)) favorites=new Set(v.filter(x=>GAMES.some(g=>g.id===x)))}catch(_){}
let toastTimer;
function notify(msg){const t=$("#toast");t.textContent=msg;t.classList.add("visible");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("visible"),2400)}
function saveFavorites(){try{localStorage.setItem(storageKey,JSON.stringify([...favorites]))}catch(_){}
  $("#favoriteCount").textContent=favorites.size}
function toggleFavorite(id){if(favorites.has(id)){favorites.delete(id);notify("찜 목록에서 뺐어요.")}else{favorites.add(id);notify("나의 찜 목록에 저장했어요 ♡")}saveFavorites();render();if(state.selected?.id===id) updateDetailFavorite()}
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function ready(g){return !!g.url}
function filteredGames(){const q=state.query.toLocaleLowerCase("ko").trim();let arr=GAMES.filter(g=>{
  const category=state.filter==="all"|| (state.filter==="favorite"?favorites.has(g.id):g.subject===state.filter);
  const found=!q || [g.title,g.short,g.description,g.subject,g.genre].join(" ").toLocaleLowerCase("ko").includes(q);
  return category&&found;
});
if(state.sort==="name")arr.sort((a,b)=>a.title.localeCompare(b.title,"ko"));if(state.sort==="ready")arr.sort((a,b)=>Number(ready(b))-Number(ready(a)));return arr}
function render(){
 const grid=$("#gameGrid");grid.replaceChildren();const arr=filteredGames();const empty=$("#emptyState");empty.hidden=arr.length>0;
 $("#resultCount").textContent=arr.length+"개의 게임"+(state.filter==="favorite"?" · 찜한 게임":"")+"을 찾았어요";
 arr.forEach((g,i)=>{
  const card=el("article","game-card");card.style.setProperty("--c1",g.colors[0]);card.style.setProperty("--c2",g.colors[1]);card.style.animationDelay=Math.min(i*35,210)+"ms";
  card.innerHTML='<div class="card-art"><span class="art-emoji" aria-hidden="true">'+escapeHTML(g.emoji)+'</span><span class="art-word" aria-hidden="true">'+escapeHTML(g.word)+'</span><span class="art-sticker" aria-hidden="true">GAME / '+String(i+1).padStart(2,"0")+'</span></div><div class="card-body"><div class="card-overline">'+escapeHTML(g.subject)+" · "+escapeHTML(g.genre)+'</div><h3 class="card-title">'+escapeHTML(g.title)+'</h3><p class="card-subtitle">'+escapeHTML(g.short)+'</p><div class="card-footer"><span class="availability '+(ready(g)?"ready":"")+'">'+(ready(g)?"실행 링크 등록":"연결 준비 중")+'</span><span class="card-arrow" aria-hidden="true">↗</span></div></div>';
  const hit=el("button","card-hit");hit.type="button";hit.setAttribute("aria-label",g.title+" 상세 정보 보기");hit.addEventListener("click",()=>openDetail(g.id));card.appendChild(hit);
  const fav=el("button","card-favorite",favorites.has(g.id)?"♥":"♡");fav.type="button";fav.setAttribute("aria-label",g.title+(favorites.has(g.id)?" 찜 해제":" 찜하기"));fav.setAttribute("aria-pressed",String(favorites.has(g.id)));fav.addEventListener("click",()=>toggleFavorite(g.id));card.appendChild(fav);
  grid.appendChild(card);
 });
}
function updateDetailFavorite(){const g=state.selected;if(!g)return;const btn=$("#dialogFavorite");const liked=favorites.has(g.id);btn.textContent=liked?"♥ 찜 완료":"♡ 찜하기";btn.setAttribute("aria-pressed",String(liked))}
function openDetail(id){
 const g=GAMES.find(x=>x.id===id);if(!g)return;state.selected=g;state.previousFocus=document.activeElement;
 const backdrop=$("#dialogBackdrop"),art=$("#dialogArt"),play=$("#dialogPlay"),source=$("#dialogSource");
 art.style.setProperty("--c1",g.colors[0]);art.style.setProperty("--c2",g.colors[1]);
 $("#dialogEmoji").textContent=g.emoji;$("#dialogKicker").textContent=(g.subject+" / "+g.genre+" · GAME INFO").toUpperCase();
 $("#dialogTitle").textContent=g.title;$("#dialogDescription").textContent=g.description;
 const list=$("#dialogFeatures");list.replaceChildren();g.features.forEach(f=>list.appendChild(el("li","",f)));
 $("#dialogNotice").textContent=g.note|| (ready(g)?"외부 게임 페이지가 새 창에서 열립니다. 실행 사이트의 접속 상태는 별도로 확인해 주세요.":"게임 실행 주소가 아직 등록되지 않았습니다.");
 if(ready(g)){play.href=g.url;play.classList.remove("is-disabled");play.removeAttribute("aria-disabled");play.innerHTML='게임 바로 플레이 <span>↗</span>'}
 else{play.removeAttribute("href");play.classList.add("is-disabled");play.setAttribute("aria-disabled","true");play.textContent="실행 링크 준비 중"}
 if(g.source){source.hidden=false;source.href=g.source}else{source.hidden=true;source.removeAttribute("href")}
 updateDetailFavorite();backdrop.hidden=false;document.body.classList.add("dialog-open");$("#dialogClose").focus();
}
function closeDetail(){if($("#dialogBackdrop").hidden)return;$("#dialogBackdrop").hidden=true;document.body.classList.remove("dialog-open");state.selected=null;const p=state.previousFocus;if(p&&p.isConnected)p.focus();else $("#discoverHeading").setAttribute("tabindex","-1")}
function selectFilter(filter){state.filter=filter;$$(".tab").forEach(b=>{const selected=b.dataset.filter===filter;b.classList.toggle("active",selected);b.setAttribute("aria-pressed",String(selected))});render()}
$$(".tab").forEach(b=>b.addEventListener("click",()=>selectFilter(b.dataset.filter)));
$("#searchInput").addEventListener("input",e=>{state.query=e.target.value;render()});
$("#sortSelect").addEventListener("change",e=>{state.sort=e.target.value;render()});
$("#resetSearch").addEventListener("click",()=>{state.query="";$("#searchInput").value="";selectFilter("all")});
$("#favoriteJump").addEventListener("click",()=>{selectFilter("favorite");$("#discover").scrollIntoView({behavior:"smooth",block:"start"})});
$("#randomPick").addEventListener("click",()=>{const arr=GAMES.filter(ready);const g=arr[Math.floor(Math.random()*arr.length)];openDetail(g.id)});
$("#featuredButton").addEventListener("click",()=>openDetail("market"));
$("#dialogClose").addEventListener("click",closeDetail);
$("#dialogBackdrop").addEventListener("click",e=>{if(e.target===$("#dialogBackdrop"))closeDetail()});
$("#dialogFavorite").addEventListener("click",()=>{if(state.selected)toggleFavorite(state.selected.id)});
$("#dialogPlay").addEventListener("click",e=>{if(!state.selected?.url)e.preventDefault()});
document.addEventListener("keydown",e=>{
 if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();closeDetail();$("#searchInput").focus();$("#discover").scrollIntoView({block:"start"})}
 if(e.key==="Escape"&&!$("#dialogBackdrop").hidden)closeDetail();
 if(e.key==="Tab"&&!$("#dialogBackdrop").hidden){const focusables=[$("#dialogClose"),...$$(".detail-dialog a[href]:not([hidden]), .detail-dialog button:not([disabled]):not([hidden])")].filter(n=>n.offsetParent!==null);if(focusables.length){const first=focusables[0],last=focusables[focusables.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}}
});
$("#statTotal").textContent=GAMES.length;$("#statReady").textContent=GAMES.filter(ready).length;$("#allCount").textContent=GAMES.length;saveFavorites();render();
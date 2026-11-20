const RANKING_SEASON=1;
const RULES_VERSION='boss-v1';
const BOSS_BONUS=1500;
const json=(body,status=200)=>Response.json(body,{status,headers:{'cache-control':'no-store'}});
async function api(request,db,path){
 if(path==='/api/ranking'&&request.method==='GET'){
  const {results}=await db.prepare(`WITH best AS (SELECT nickname,score,kills,correct,elapsed,win,difficulty,started,id,ROW_NUMBER() OVER (PARTITION BY nickname ORDER BY score DESC,kills DESC,elapsed DESC,started,id) AS attempt FROM survivor_runs WHERE season=1 AND finished=1 AND score>0) SELECT nickname,score,kills,correct,elapsed,win,difficulty FROM best WHERE attempt=1 ORDER BY score DESC,kills DESC,elapsed DESC,started,id LIMIT 200`).all();
  return json(results.filter(row=>!validateNickname(row.nickname)).map((row,i)=>({...row,rank:i+1})));
 }
 if(request.method!=='POST')return json({error:'지원하지 않는 요청이에요.'},405);
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return json({error:'게임 화면에서 다시 시도해 주세요.'},403);
 let body;try{const raw=await request.text();if(raw.length>2048)throw Error();body=JSON.parse(raw);if(!body||typeof body!=='object')throw Error()}catch{return json({error:'요청을 읽을 수 없어요.'},400)}
 if(path==='/api/start'){
  if(body.rulesVersion!==RULES_VERSION)return json({error:'게임이 업데이트되었어요. 새로고침한 뒤 다시 시작해 주세요.'},400);
  const warning=validateNickname(body.nickname);if(warning)return json({error:warning},400);
  if(!['normal','hard'].includes(body.difficulty))return json({error:'난이도를 다시 선택해 주세요.'},400);
  const id=crypto.randomUUID();await db.prepare('INSERT INTO survivor_runs (id,nickname,difficulty,started,season) VALUES (?,?,?,?,?)').bind(id,body.nickname.normalize('NFKC').trim(),body.difficulty,Date.now(),RANKING_SEASON).run();return json({id});
 }
 if(path==='/api/finish'){
  if(typeof body.id!=='string'||!/^[a-f0-9-]{36}$/.test(body.id))return json({error:'게임 번호를 확인해 주세요.'},400);
  const round=await db.prepare('SELECT * FROM survivor_runs WHERE id=?').bind(body.id).first();if(!round)return json({error:'게임을 찾지 못했어요.'},404);
  if(round.finished)return json({saved:true,ranked:round.season===RANKING_SEASON&&round.score>0});
  const {score,kills,correct,attempts,elapsed,win}=body;
  const bossDefeated=body.bossDefeated===undefined?false:body.bossDefeated;
  if(typeof bossDefeated!=='boolean'||(bossDefeated&&(elapsed<160||correct<3||kills<1)))return json({error:'대왕좀비 처치 기록을 확인할 수 없어요.'},400);
  const bossBonus=bossDefeated?BOSS_BONUS:0;
  if(![score,kills,correct,attempts].every(Number.isInteger)||score<0||kills<0||kills>700||correct<0||correct>155||attempts<correct||attempts>155||!Number.isFinite(elapsed)||elapsed<0||elapsed>180||typeof win!=='boolean'||(win&&elapsed<180)||score>150*correct*(correct+1)/2+25*kills+bossBonus||score<25*kills+bossBonus||elapsed>(Date.now()-round.started)/1000+3)return json({error:'기록 값을 확인할 수 없어요.'},400);
  await db.prepare('UPDATE survivor_runs SET score=?,kills=?,correct=?,elapsed=?,win=?,boss_defeated=?,finished=1 WHERE id=? AND finished=0').bind(score,kills,correct,elapsed,Number(win),Number(bossDefeated),body.id).run();return json({saved:true,ranked:round.season===RANKING_SEASON&&score>0});
 }
 return json({error:'페이지가 없어요.'},404);
}
export default {async fetch(request,env){const path=new URL(request.url).pathname;if(path.startsWith('/api/')){try{return await api(request,env.DB,path)}catch(error){console.error('Survivor record request failed');return json({error:'기록 서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.'},503)}}const asset=ASSETS[path];if(!asset||!['GET','HEAD'].includes(request.method))return new Response('페이지가 없어요.',{status:404});return serveAsset(request,asset)}};

const binaryAssetCache=new Map();
function serveAsset(request,asset){
 const headers={'content-type':asset[0],'cache-control':'no-cache','x-content-type-options':'nosniff','referrer-policy':'no-referrer'};
 if(!asset[2])return new Response(request.method==='HEAD'?null:asset[1],{headers});
 let bytes=binaryAssetCache.get(asset);if(!bytes){const decoded=atob(asset[1]);bytes=new Uint8Array(decoded.length);for(let i=0;i<decoded.length;i++)bytes[i]=decoded.charCodeAt(i);binaryAssetCache.set(asset,bytes)}headers['accept-ranges']='bytes';headers['content-length']=String(bytes.length);
 const range=request.headers.get('range');
 if(range){
  const match=/^bytes=(\d*)-(\d*)$/.exec(range);let start=0,end=bytes.length-1;
  if(match&&(match[1]||match[2])){if(match[1]){start=Number(match[1]);if(match[2])end=Number(match[2])}else start=Math.max(0,bytes.length-Number(match[2]));end=Math.min(end,bytes.length-1)}
  if(!match||!(match[1]||match[2])||start>=bytes.length||start>end){headers['content-range']='bytes */'+bytes.length;headers['content-length']='0';return new Response(null,{status:416,headers})}
  headers['content-range']=`bytes ${start}-${end}/${bytes.length}`;headers['content-length']=String(end-start+1);return new Response(request.method==='HEAD'?null:bytes.slice(start,end+1),{status:206,headers});
 }
 return new Response(request.method==='HEAD'?null:bytes,{headers});
}

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import worker from '../dist/server/index.js';
test('current shared nickname rules run in browser and server before database writes',async()=>{
 const context=vm.createContext({});
 vm.runInContext(readFileSync('public/nickname.js','utf8'),context);
 const blocked=['놈','이놈','이 놈','이_놈','고추','고 추','보라','세무냥이','리트냥이','편입냥이','충주냥이','7급냥이','한전냥이','작수냥이','엠딧냥이','관세냥이','감평냥이','노안','예일리언','에일리언','야르','왜','잼민','응우엔','응우옌','응우','장애','게이','사랑해','죽','니거','니그로','돼지','섹시','울트라','씹','몸무게','바부','야','기분','좋','돼','당뇨','역류','불','주먹','스마트','안경','도둑','빡','김대중','엄','줴','바','부','멍','충','청','통','퉁','뚠','뜬','뚱','세기','새기','새끼','춘자','할머니','할아버지','아빠','삼촌','이모','외숙모','숙모','세','리트','세무','맹','토익','토플','발','중 국','태국','프랑스','고양이１','고양이¹','고양이١','ㅋㅋ','ㄱㄴㄷ','고양이ㅋ','Cat','고양이Ａ','고양이é','김민수 이서연'];
 blocked.push('이\u200b놈','고\u200b추');
 const db={prepare(){throw Error('Rejected names must not reach database');}};
 for(const nickname of blocked){
  const warning=vm.runInContext('validateNickname('+JSON.stringify(nickname)+')',context);
  assert.ok(warning,nickname);
  const response=await worker.fetch(new Request('https://game.test/api/start',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({rulesVersion:'boss-v1',nickname,difficulty:'normal'})}),{DB:db});
  assert.equal(response.status,400,nickname);
  assert.equal((await response.json()).error,warning,nickname);
 }
 for(const name of ['고양이','별빛고양이','초록토끼'])assert.equal(vm.runInContext('validateNickname('+JSON.stringify(name)+')',context),'',name);
 assert.equal(vm.runInContext('validateNickname("보석",{registration:false})',context),'');
});

(function(root){
 'use strict';
 function tokens(text){return text.toLowerCase().replace(/[’']/g,'').match(/[a-z0-9]+/g)||[];}
 // Require a phrase, limit forward jumps, and never rewind on repeated interim results.
 function advance(script,cursor,heard){
  const words=tokens(heard).slice(-8);if(words.length<3)return cursor;
  let best=cursor,score=-Infinity;
  for(let end=Math.max(3,cursor);end<=Math.min(script.length,cursor+45);end++){
   if(script[end-1]!==words[words.length-1])continue;
   const window=script.slice(Math.max(0,end-words.length-3),end);
   let row=new Array(window.length+1).fill(0);
   for(const word of words){const next=[0];for(let j=1;j<=window.length;j++)next[j]=word===window[j-1]?row[j-1]+1:Math.max(row[j],next[j-1]);row=next;}
   const matches=row[window.length];
   if(matches<3||matches/words.length<.7)continue;
   const candidate=matches*10-Math.abs(end-cursor)*.2;
   if(candidate>score){score=candidate;best=Math.max(cursor,end);}
  }
  return best;
 }
 root.GrovesVoiceMatch={tokens,advance};
 if(typeof module!=='undefined')module.exports={tokens,advance};
})(typeof window!=='undefined'?window:globalThis);

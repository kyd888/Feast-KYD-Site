'use strict';
const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
const voiceButton=$('voice-toggle'),voiceStatus=$('voice-status');
let voiceEnabled=false,recognition=null,activeRecognition=false,restartAt=0,restarts=0,voicePart='',voiceCursor=0,wordSpans=[],scriptTokens=[],oldAuto=false;
function indexSpeech(){
 for(const part of ['intro','outro'])for(const p of $(part+'-text').querySelectorAll('p')){
  const text=p.textContent;p.replaceChildren();
  for(const chunk of text.split(/(\s+)/)){if(!chunk)continue;if(/^\s+$/.test(chunk)){p.append(document.createTextNode(chunk));continue;}const span=document.createElement('span');span.textContent=chunk;span.className='voice-word';p.append(span);}
  p.addEventListener('click',()=>{if(!voiceEnabled)return;voicePart=part;mode=part;buildIndex(part);const first=p.querySelector('.voice-word');voiceCursor=Math.max(0,wordSpans.indexOf(first));markWord(voiceCursor);voiceStatus.textContent='Position set. Continue reading from this paragraph.';if(activeRecognition)recognition.abort();});
 }
 voicePart='';
}
function buildIndex(part){wordSpans=[];scriptTokens=[];for(const span of $(part+'-text').querySelectorAll('.voice-word'))for(const token of GrovesVoiceMatch.tokens(span.textContent)){scriptTokens.push(token);wordSpans.push(span);}}
function markWord(index){document.querySelectorAll('.voice-current').forEach(el=>el.classList.remove('voice-current'));const span=wordSpans[Math.min(index,wordSpans.length-1)];if(!span)return;span.classList.add('voice-current');const top=span.getBoundingClientRect().top-view.getBoundingClientRect().top;if(top>view.clientHeight*.42||top<20){view.scrollTop+=top-view.clientHeight*.25;position=view.scrollTop;}}
function stopVoice(message){voiceEnabled=false;voiceButton.textContent='Follow my voice';voiceButton.setAttribute('aria-pressed','false');$('autoscroll').disabled=false;$('autoscroll').checked=oldAuto;if(recognition&&activeRecognition)recognition.abort();voiceStatus.textContent=message||'Voice following is off.';document.querySelectorAll('.voice-current').forEach(el=>el.classList.remove('voice-current'));}
function wanted(){return voiceEnabled&&running&&!document.hidden&&!$('editor').open&&(mode==='intro'||mode==='outro');}
indexSpeech();
new MutationObserver(()=>{if(!voiceEnabled)voicePart='';}).observe($('intro-text'),{childList:true});
$('editor-form').addEventListener('submit',()=>{indexSpeech();});
$('reset').addEventListener('click',()=>{if(!started){voiceCursor=0;voicePart='';if(voiceEnabled)stopVoice('Reset. Enable voice following for another rehearsal.');}});
if(!Recognition){voiceButton.disabled=true;voiceStatus.textContent='Speech recognition is unavailable in this browser. Use auto-scroll or manual scrolling.';}
else{
 recognition=new Recognition();recognition.lang='en-US';recognition.continuous=true;recognition.interimResults=true;
 recognition.onstart=()=>{activeRecognition=true;voiceStatus.textContent='Listening — follow the script. Click any paragraph to move your position.';};
 recognition.onresult=e=>{
  if(!wanted())return;
  if(voicePart!==mode){voicePart=mode;voiceCursor=0;buildIndex(mode);}
  let heard='';for(let i=Math.max(0,e.resultIndex-1);i<e.results.length;i++)heard+=' '+e.results[i][0].transcript;
  const next=GrovesVoiceMatch.advance(scriptTokens,voiceCursor,heard);
  if(next>voiceCursor){voiceCursor=next;markWord(Math.max(0,next-1));restarts=0;voiceStatus.textContent='Following your voice. Pauses hold the text in place.';
   if(next>=scriptTokens.length){if(mode==='intro'){songCue();voiceStatus.textContent='Microphone paused for the song. Click Closing when finished.';}else{running=false;mode='done';update();stopVoice('Speech finished. Microphone off.');}}
  }else voiceStatus.textContent='Listening. If your wording changes, click the paragraph you are reading.';
 };
 recognition.onerror=e=>{if(e.error==='aborted')return;if(e.error==='no-speech'){voiceStatus.textContent='No words detected yet. Waiting for your voice.';return;}const messages={'not-allowed':'Microphone permission was denied. Allow it in browser settings, or use manual scrolling.','audio-capture':'No microphone is available. Check your laptop microphone.','network':'The speech service could not connect. Check your internet, or use manual scrolling.','service-not-allowed':'This browser does not allow its speech service here. Use manual scrolling.'};stopVoice(messages[e.error]||'Speech recognition stopped. Use manual scrolling or enable voice following again.');};
 recognition.onend=()=>{activeRecognition=false;restartAt=performance.now()+900;if(wanted()){restarts++;if(restarts>4)stopVoice('The speech service kept disconnecting. Use manual scrolling or try again.');}};
 voiceButton.addEventListener('click',()=>{
  if(voiceEnabled){stopVoice();return;}
  voiceEnabled=true;oldAuto=$('autoscroll').checked;$('autoscroll').checked=false;$('autoscroll').disabled=true;voiceButton.textContent='Stop listening';voiceButton.setAttribute('aria-pressed','true');restarts=0;restartAt=0;
  if(mode==='song'||mode==='done'){voiceStatus.textContent='Voice mode ready. Choose Closing or restart before speaking.';return;}
  if(!running)toggle();syncRecognition();
 });
 function syncRecognition(){
  if(!voiceEnabled)return;
  if(!wanted()){if(activeRecognition)recognition.abort();voiceStatus.textContent=mode==='song'?'Microphone paused for the song. Click Closing when finished.':'Microphone paused with the prompter.';return;}
  if(!activeRecognition&&performance.now()>=restartAt){try{activeRecognition=true;recognition.start();voiceStatus.textContent='Connecting to microphone…';}catch{activeRecognition=false;stopVoice('Could not start speech recognition. Try again or use manual scrolling.');}}
 }
 setInterval(syncRecognition,250);
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&activeRecognition)recognition.abort();});
 window.addEventListener('pagehide',()=>{voiceEnabled=false;if(activeRecognition)recognition.abort();});
}

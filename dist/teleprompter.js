'use strict';
const DEFAULT_INTRO = `Hi, I’m Keenan Jones, and I make music as KYD. My project is called GROVES: Signal Night.

Imagine walking into a room where a forest is projected around you. There are objects, recorded sounds, and written memories to explore. Then the music starts. The songs and the room tell a story together.

That’s what I want to create: a live concert inside a walk-through memory archive.

This idea is personal to me. The week of a previous event, a close friend went through a serious crisis. I was there with her, and I dedicated my performance to her.

Moving between being there for someone I cared about and getting onstage changed what that performance meant to me. I kept thinking about how much we carry into a room without anyone knowing.

With GROVES, I want to give some of those feelings a place to go. You could leave a memory of your own, or you could simply listen. You don’t have to explain yourself to belong in the room.

I wrote a song for my friend called “Poor Baby.” I’d like to share two minutes of it with you now.`;
const DEFAULT_OUTRO = `Thank you.

That song is one part of GROVES. Around the performance, I want to build a space where people can spend time with the memories behind the music and recognize something of their own lives.

FEAST funding would help pay for projection, lighting, and audio, along with printed memory cards and installation materials. It would also help with transportation and documenting the work.

I’m designing those elements to be portable, so I can bring the experience into more Oklahoma spaces. Each audience could add something new to the archive.

This grant would help me take the project from an idea and a set of songs into a public experience people can actually walk into.

If you’d like to help bring it to life, please vote for KYD / Keenan Jones: GROVES: Signal Night.

Thank you for listening, and for giving me the chance to share this with you.`;
const $ = id => document.getElementById(id);
const view = $('viewport');
const key = 'groves-prompter-v1';
let speech = {intro: DEFAULT_INTRO, outro: DEFAULT_OUTRO};
let running = false, started = false, elapsed = 0, lastFrame = 0, mode = 'intro', songStart = null, wakeLock = null, position = 0;
try {const saved = JSON.parse(localStorage.getItem(key)); if (saved && typeof saved.intro === 'string' && typeof saved.outro === 'string') speech = saved;} catch {}
function render(){for (const part of ['intro','outro']) {const target=$(part+'-text');target.replaceChildren();speech[part].split(/\n\s*\n/).filter(p=>p.trim()).forEach(p=>{const el=document.createElement('p');el.textContent=p.trim();target.append(el);});}}
render();
function time(ms){const seconds=Math.floor(Math.max(0,ms)/1000);return Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');}
function targetPosition(id){return Math.max(0,$(id).getBoundingClientRect().top-view.getBoundingClientRect().top+view.scrollTop-35);}
function moveTo(id){view.scrollTop=targetPosition(id);position=view.scrollTop;}
function update(){ $('clock').textContent=time(elapsed);$('clock').parentElement.classList.toggle('warn',elapsed>=270000&&elapsed<300000);$('clock').parentElement.classList.toggle('over',elapsed>=300000);$('toggle').textContent=running?'Pause':started?'Resume':'Start';$('phase').textContent=!started?'Ready':!running?'Paused':mode==='song'?'Perform':mode==='done'?'Finished':mode==='outro'?'Closing':'Opening';if(songStart!==null){const songElapsed=elapsed-songStart;$('song-clock').textContent=time(songElapsed)+' / 2:00';$('performance').classList.toggle('due',songElapsed>=120000);$('song-note').textContent=songElapsed>=120000?'Two minutes reached. Finish your phrase, then show the closing.':'Song timer running. Click “Song finished” when you are ready.';}}
async function keepAwake(){try{if('wakeLock' in navigator&&!wakeLock) {wakeLock=await navigator.wakeLock.request('screen');wakeLock.addEventListener('release',()=>{wakeLock=null;});}}catch{}}
function toggle(){running=!running;started=true;lastFrame=performance.now();if(running)keepAwake();update();}
function songCue(){mode='song';moveTo('performance');$('notice').textContent='Scrolling paused for the song. Start the song timer when you begin playing.';update();}
function closing(){mode='outro';moveTo('outro');if(!running){running=true;started=true;lastFrame=performance.now();keepAwake();}$('notice').textContent='Closing speech. The main timer includes the song.';update();}
$('toggle').addEventListener('click',toggle);
$('reset').addEventListener('click',()=>{if(started&&!confirm('Restart the clock and return to the opening?'))return;running=false;started=false;elapsed=0;songStart=null;mode='intro';view.scrollTop=0;position=0;$('song-clock').textContent='0:00 / 2:00';$('song-note').textContent='Scroll stops here. The five-minute clock keeps running.';$('performance').classList.remove('due');$('begin-song').disabled=false;$('notice').textContent='Ready for another run.';update();});
$('song').addEventListener('click',songCue);$('closing').addEventListener('click',closing);$('finish-song').addEventListener('click',closing);
$('begin-song').addEventListener('click',()=>{songStart=elapsed;mode='song';running=true;started=true;lastFrame=performance.now();$('begin-song').disabled=true;keepAwake();update();});
view.addEventListener('scroll',()=>{position=view.scrollTop;});
function frame(now){const delta=lastFrame?now-lastFrame:0;lastFrame=now;if(running){elapsed+=delta;if($('autoscroll').checked&&mode!=='song'&&mode!=='done'&&delta<1000){position+=Number($('speed').value)*delta/1000;const stop=mode==='intro'?targetPosition('performance'):view.scrollHeight-view.clientHeight;if(position>=stop){position=stop;view.scrollTop=position;if(mode==='intro')songCue();else{mode='done';running=false;$('notice').textContent='Speech finished. Restart to rehearse again.';}}else view.scrollTop=position;}update();}requestAnimationFrame(frame);}
requestAnimationFrame(frame);
$('font').addEventListener('input',()=>{document.documentElement.style.setProperty('--text-size',$('font').value+'px');$('font-value').textContent=$('font').value+'px';position=view.scrollTop;});
$('speed').addEventListener('input',()=>{$('speed-value').textContent=$('speed').value;});
if(matchMedia('(prefers-reduced-motion: reduce)').matches)$('autoscroll').checked=false;
$('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else $('notice').textContent='Use your browser’s full-screen command.';keepAwake();}catch{$('notice').textContent='Use your browser’s full-screen command.';}});
document.addEventListener('fullscreenchange',()=>{$('fullscreen').textContent=document.fullscreenElement?'Exit full screen':'Full screen';});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running){running=false;update();$('notice').textContent='Paused because you switched away. Press Resume when ready.';}else if(running)keepAwake();});
document.addEventListener('keydown',e=>{if($('editor').open||/INPUT|TEXTAREA|BUTTON|SELECT|A/.test(e.target.tagName))return;if(e.code==='Space'){e.preventDefault();toggle();}else if(e.key.toLowerCase()==='s'){e.preventDefault();songCue();}else if(e.key.toLowerCase()==='c'){e.preventDefault();closing();}else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();view.scrollTop+=e.key==='ArrowDown'?80:-80;}});
function wordCount(){const n=[$('intro-edit').value,$('outro-edit').value].join(' ').trim().split(/\s+/).filter(Boolean).length;$('word-count').textContent=n+' spoken words · about '+Math.ceil(n/130*60)+' seconds at 130 words/min + 120 seconds of music. Rehearse for your own pace.';}
$('edit').addEventListener('click',()=>{running=false;update();$('intro-edit').value=speech.intro;$('outro-edit').value=speech.outro;wordCount();$('editor').showModal();});
for(const id of ['intro-edit','outro-edit'])$(id).addEventListener('input',wordCount);
$('cancel-edit').addEventListener('click',()=>$('editor').close());
$('default-script').addEventListener('click',()=>{if(confirm('Replace the text in this editor with the original draft?')){$('intro-edit').value=DEFAULT_INTRO;$('outro-edit').value=DEFAULT_OUTRO;wordCount();}});
$('editor-form').addEventListener('submit',e=>{e.preventDefault();speech={intro:$('intro-edit').value.trim(),outro:$('outro-edit').value.trim()};render();try{localStorage.setItem(key,JSON.stringify(speech));$('notice').textContent='Speech saved in this browser. Press Restart for a fresh rehearsal.';}catch{$('notice').textContent='Speech updated for this session. Browser storage is unavailable.';}$('editor').close();position=view.scrollTop;});

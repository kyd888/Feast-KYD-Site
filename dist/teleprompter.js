'use strict';
const DEFAULT_INTRO = `Hi, I’m Keenan Jones, and I make music as KYD.

My project is called GROVES: Signal Night. It’s a live music experience where you can walk through a room filled with projected forests, sound, and pieces of people’s memories, then hear those feelings reflected in a performance.

I want to tell you why that matters to me.

The week of a previous event, a close friend of mine attempted suicide. I was there to help get her to the hospital, and I stayed with her.

When it was time for my performance, I left the hospital, performed, and went right back. I dedicated that event to her. Throughout the following week, I continued being there as she recovered.

It was a strange feeling, standing in front of an audience while someone I cared about was going through something so private and painful.

That experience stayed with me. It made me think about how much people carry into a room that nobody else can see, and what it means to make space for those feelings.

That’s what I want to build with GROVES.

Before and after the performance, visitors can explore a memory archive: short written stories, objects, and recorded sounds. They can leave an anonymous memory of their own, or simply listen. During the music, projections and lighting help bring the emotional world of the songs into the room.

My hope is that someone hears a song or reads a fragment of another person’s story and feels a little less alone in their own.

I wrote a song for my friend called “Poor Baby.” I’d like to share two minutes of it with you.`;
const DEFAULT_OUTRO = `Thank you.

A FEAST grant of up to $2,000 would help pay for the projection, lighting, and audio needed to present GROVES, along with printed memory cards, transportation, and documentation.

I’m designing the installation to travel, so we can bring this experience into more Oklahoma spaces and keep building the archive with each audience.

Your vote would help turn these songs into a place people can actually enter, contribute to, and share.

I’m KYD, and this is GROVES: Signal Night. Thank you.`;
const $ = id => document.getElementById(id);
const view = $('viewport');
const key = 'groves-prompter-exact-2026-10-13';
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
let prompterNativeFullscreen=false;
function restorePrompterControls(){document.body.classList.remove('prompter-fullscreen');$('fullscreen').textContent='Full screen';view.focus();}
async function exitPrompterFullscreen(){restorePrompterControls();try{if(document.fullscreenElement||document.webkitFullscreenElement){const exit=document.exitFullscreen||document.webkitExitFullscreen;if(exit)await exit.call(document);}}catch{}}
$('fullscreen').addEventListener('click',async()=>{document.body.classList.add('prompter-fullscreen');view.focus();try{const enter=document.documentElement.requestFullscreen||document.documentElement.webkitRequestFullscreen;if(!document.fullscreenElement&&!document.webkitFullscreenElement&&enter)await enter.call(document.documentElement);}catch{}keepAwake();});
function prompterFullscreenChanged(){if(document.fullscreenElement||document.webkitFullscreenElement){prompterNativeFullscreen=true;document.body.classList.add('prompter-fullscreen');}else if(prompterNativeFullscreen){prompterNativeFullscreen=false;restorePrompterControls();}}
document.addEventListener('fullscreenchange',prompterFullscreenChanged);document.addEventListener('webkitfullscreenchange',prompterFullscreenChanged);
view.addEventListener('dblclick',()=>{if(document.body.classList.contains('prompter-fullscreen'))exitPrompterFullscreen();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('prompter-fullscreen'))exitPrompterFullscreen();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running){running=false;update();$('notice').textContent='Paused because you switched away. Press Resume when ready.';}else if(running)keepAwake();});
document.addEventListener('keydown',e=>{if($('editor').open||/INPUT|TEXTAREA|BUTTON|SELECT|A/.test(e.target.tagName))return;if(e.code==='Space'){e.preventDefault();toggle();}else if(e.key.toLowerCase()==='s'){e.preventDefault();if(mode==='song')$('begin-song').click();else songCue();}else if(e.key.toLowerCase()==='c'){e.preventDefault();closing();}else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();view.scrollTop+=e.key==='ArrowDown'?80:-80;}});
function wordCount(){const n=[$('intro-edit').value,$('outro-edit').value].join(' ').trim().split(/\s+/).filter(Boolean).length;$('word-count').textContent=n+' spoken words · about '+Math.ceil(n/130*60)+' seconds at 130 words/min + 120 seconds of music. Rehearse for your own pace.';}
$('edit').addEventListener('click',()=>{running=false;update();$('intro-edit').value=speech.intro;$('outro-edit').value=speech.outro;wordCount();$('editor').showModal();});
for(const id of ['intro-edit','outro-edit'])$(id).addEventListener('input',wordCount);
$('cancel-edit').addEventListener('click',()=>$('editor').close());
$('default-script').addEventListener('click',()=>{if(confirm('Replace the text in this editor with the original draft?')){$('intro-edit').value=DEFAULT_INTRO;$('outro-edit').value=DEFAULT_OUTRO;wordCount();}});
$('editor-form').addEventListener('submit',e=>{e.preventDefault();speech={intro:$('intro-edit').value.trim(),outro:$('outro-edit').value.trim()};render();try{localStorage.setItem(key,JSON.stringify(speech));$('notice').textContent='Speech saved in this browser. Press Restart for a fresh rehearsal.';}catch{$('notice').textContent='Speech updated for this session. Browser storage is unavailable.';}$('editor').close();position=view.scrollTop;});

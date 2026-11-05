// Cinematic opening: replay on every page load, no cookies or session state.
(()=>{const intro=document.getElementById('showIntro');const skip=document.getElementById('introSkip');if(!intro)return;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let timer;let closed=false;function finish(){if(closed)return;closed=true;clearTimeout(timer);intro.classList.add('intro-exit');document.body.classList.remove('intro-locked');setTimeout(()=>{intro.remove()},reduced?0:650)}if(reduced){finish();return}document.body.classList.add('intro-locked');skip.addEventListener('click',finish);document.addEventListener('keydown',e=>{if(e.key==='Escape')finish()});timer=setTimeout(finish,5000)})();
const toggle=document.getElementById('menuToggle');const mobile=document.getElementById('mobileNav');function closeMenu(){mobile.hidden=true;toggle.setAttribute('aria-expanded','false');document.body.classList.remove('locked')}toggle.addEventListener('click',()=>{const opening=mobile.hidden;mobile.hidden=!opening;toggle.setAttribute('aria-expanded',String(opening));document.body.classList.toggle('locked',opening)});mobile.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
const revealItems=document.querySelectorAll('.reveal');if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.12,rootMargin:'0px 0px -30px 0px'});revealItems.forEach(el=>observer.observe(el))}else revealItems.forEach(el=>el.classList.add('visible'));
const progress=document.getElementById('progress');let ticking=false;function updateProgress(){const total=document.documentElement.scrollHeight-innerHeight;progress.style.width=(total>0?scrollY/total*100:0)+'%';ticking=false}addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(updateProgress);ticking=true}},{passive:true});updateProgress();document.getElementById('year').textContent=new Date().getFullYear();
const projects=[
{type:'01 / ЛИЧНЫЕ СОБЫТИЯ',kicker:'НЕ ПРОСТО ПОВОД.',title:'ВАША ИСТОРИЯ. НАША РЕЖИССУРА.',text:'События, в которых каждая деталь говорит о вас.',detail:'Никаких чужих сценариев и праздников «как у всех». Мы слушаем, чувствуем настроение, придумываем концепцию и создаём пространство для настоящих эмоций — от первого приглашения до последнего танца.',formats:['СВАДЬБЫ','ДНИ РОЖДЕНИЯ','ЮБИЛЕИ','ЧАСТНЫЕ ВЕЧЕРИНКИ']},
{type:'02 / КОРПОРАТИВНЫЕ МЕРОПРИЯТИЯ',kicker:'БОЛЬШЕ, ЧЕМ КОРПОРАТИВ.',title:'СОБЫТИЯ, КОТОРЫЕ ОБЪЕДИНЯЮТ.',text:'Создаём поводы почувствовать себя частью чего-то большего.',detail:'Корпоративное событие может стать сильной историей бренда. Соединяем идею, сценарий, сценографию, артистов и технический продакшен, чтобы команда не просто присутствовала, а прожила событие вместе.',formats:['КОРПОРАТИВНЫЕ ПРАЗДНИКИ','ЮБИЛЕИ КОМПАНИЙ','ЦЕРЕМОНИИ НАГРАЖДЕНИЯ','ТИМБИЛДИНГИ']},
{type:'03 / ФОРУМЫ И ДЕЛОВЫЕ ПРОГРАММЫ',kicker:'СМЫСЛ В КАЖДОЙ ДЕТАЛИ.',title:'СЕРЬЁЗНЫЙ СМЫСЛ. СИЛЬНАЯ ПОДАЧА.',text:'Когда важные идеи получают достойную сцену.',detail:'От логики программы и навигации участников до режиссуры выступлений и технического обеспечения. Помогаем сложному содержанию звучать понятно, убедительно и современно.',formats:['ФОРУМЫ','КОНФЕРЕНЦИИ','СТРАТЕГИЧЕСКИЕ СЕССИИ','ДЕЛОВЫЕ ПРЕЗЕНТАЦИИ']},
{type:'04 / ФЕСТИВАЛИ И МАСШТАБНЫЕ СОБЫТИЯ',kicker:'КОГДА ЭМОЦИИ — В МАСШТАБЕ.',title:'ЭМОЦИИ БЕЗ ОГРАНИЧЕНИЙ.',text:'Большая аудитория. Одна энергия. Тысячи впечатлений.',detail:'Собираем масштабные события как единый живой механизм: концепция, программа, сцена, звук, свет, логистика и работа с аудиторией. Чтобы каждый гость почувствовал себя частью происходящего.',formats:['ФЕСТИВАЛИ','ГОРОДСКИЕ ПРАЗДНИКИ','КОНЦЕРТЫ','МАСШТАБНЫЕ ШОУ']}
];
const dialog=document.getElementById('projectDialog');let lastCard=null;let previousHash='';
function openDirection(i,updateHash=true){const p=projects[i];if(!p)return;document.getElementById('dialogType').textContent=p.type;document.getElementById('dialogKicker').textContent=p.kicker;document.getElementById('dialogTitle').textContent=p.title;document.getElementById('dialogText').textContent=p.text;document.getElementById('dialogDetail').textContent=p.detail;document.getElementById('dialogHero').style.backgroundImage="none";document.getElementById('dialogFormats').replaceChildren(...p.formats.map((label,j)=>{const item=document.createElement('div');item.className='dm-format';const number=document.createElement('span');number.textContent=String(j+1).padStart(2,'0');const name=document.createElement('strong');name.textContent=label;item.append(number,name);return item}));if(!dialog.open)dialog.showModal();dialog.scrollTop=0;if(updateHash){previousHash=location.hash;history.replaceState(null,'',`#direction-${i+1}`)}}
function closeDirection(){if(dialog.open)dialog.close()}
document.querySelectorAll('[data-project]').forEach(card=>card.addEventListener('click',()=>{lastCard=card;openDirection(Number(card.dataset.project))}));
document.getElementById('dialogClose').addEventListener('click',closeDirection);
document.getElementById('dialogLink').addEventListener('click',()=>{closeDirection();history.replaceState(null,'','#contact')});
dialog.addEventListener('click',e=>{if(e.target===dialog)closeDirection()});
dialog.addEventListener('close',()=>{if(/^#direction-/.test(location.hash))history.replaceState(null,'',previousHash||location.pathname+location.search);if(lastCard)lastCard.focus({preventScroll:true})});
const deepLink=location.hash.match(/^#direction-([1-4])$/);if(deepLink){previousHash='#projects';openDirection(Number(deepLink[1])-1,false)}
addEventListener('hashchange',()=>{const m=location.hash.match(/^#direction-([1-4])$/);if(m)openDirection(Number(m[1])-1,false);else if(dialog.open)closeDirection()});
// DEMO ONLY: set a real receiving address and configure privacy documents before publication.
const CONTACT_EMAIL='';const form=document.getElementById('contactForm');form.addEventListener('submit',e=>{e.preventDefault();const status=document.getElementById('formStatus');if(!form.reportValidity())return;if(!CONTACT_EMAIL){status.textContent='Форма пока в демо-режиме. Для отправки укажите рабочий email агентства в script.js (CONTACT_EMAIL).';return}const data=new FormData(form);const subject='Запрос на мероприятие — DERZKO.';const body=`Имя: ${data.get('name')}\nКомпания: ${data.get('company')||'Не указана'}\nКонтакт: ${data.get('contact')}\n\nО событии:\n${data.get('message')}`;status.textContent='Открываем почтовое приложение. Письмо нужно отправить вручную.';location.href=`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`});

// Accessible expandable services, no external assets or tracking.
document.querySelectorAll('.service[role="button"]').forEach(service=>{function activate(){const expanded=service.getAttribute('aria-expanded')==='true';document.querySelectorAll('.service[role="button"]').forEach(s=>s.setAttribute('aria-expanded','false'));service.setAttribute('aria-expanded',String(!expanded))}service.addEventListener('click',activate);service.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate()}})});

// 4.2: Scroll-synced journey light line; respects reduced-motion preferences.
(()=>{const journey=document.querySelector('.journey');const bar=document.getElementById('journeyProgress');if(!journey||!bar)return;const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;if(reduce){bar.style.height='100%';return}let queued=false;function paint(){const rect=journey.getBoundingClientRect();const windowPoint=innerHeight*.67;const fraction=Math.max(0,Math.min(1,(windowPoint-rect.top)/Math.max(1,rect.height)));bar.style.height=(fraction*100)+'%';queued=false}addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(paint)}},{passive:true});addEventListener('resize',paint);paint()})();

// 13.1: Contact dialog, keyboard and backdrop support.
(()=>{const d=document.getElementById('contactDialog');const open=document.getElementById('openContact');const close=document.getElementById('closeContact');if(!d||!open||!close)return;open.addEventListener('click',()=>d.showModal());close.addEventListener('click',()=>d.close());d.addEventListener('click',e=>{if(e.target===d)d.close()})})();

/* DERZKO 14.1 — four-direction carousel; swipe, arrows and keyboard */
(()=>{
const stage=document.getElementById('dzCarouselStage');
if(!stage)return;
const cards=[...stage.querySelectorAll('[data-slide-project]')];
const count=document.getElementById('dzCarouselCount');
let active=0;
function paint(){
cards.forEach((card,i)=>{let d=(i-active+cards.length)%cards.length;if(d===cards.length-1)d=-1;card.dataset.offset=String(d);card.setAttribute('aria-label',(i===active?'Подробнее: ':'Показать: ')+card.querySelector('.direction-content strong').textContent.trim());card.setAttribute('aria-current',i===active?'true':'false')});
count.innerHTML=String(active+1).padStart(2,'0')+' <span>/ 04</span>';
}
function shift(delta){active=(active+delta+cards.length)%cards.length;paint()}
cards.forEach((card,i)=>card.addEventListener('click',()=>{if(stage.dataset.swiped)return;if(i!==active){active=i;paint()}else{lastCard=card;openDirection(i)}}));
document.getElementById('dzCarouselPrev').addEventListener('click',()=>shift(-1));
document.getElementById('dzCarouselNext').addEventListener('click',()=>shift(1));
document.getElementById('dzCarouselOpen').addEventListener('click',()=>{lastCard=cards[active];openDirection(active)});
let startX=0,startY=0;
stage.addEventListener('touchstart',e=>{startX=e.touches[0].clientX;startY=e.touches[0].clientY},{passive:true});
stage.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-startX,dy=e.changedTouches[0].clientY-startY;if(Math.abs(dx)>42&&Math.abs(dx)>Math.abs(dy)*1.3){shift(dx<0?1:-1);stage.dataset.swiped='1';setTimeout(()=>{delete stage.dataset.swiped},350)}},{passive:true});
stage.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();shift(1)}if(e.key==='ArrowLeft'){e.preventDefault();shift(-1)}});
paint();
})();

/* GoalPath: dependency-free, GitHub Pages-ready personal visual planner. */
const STORAGE_KEY = 'goalpath.data.v1';
const PREFS_KEY = 'goalpath.prefs.v1';
const PALETTE = ['#957bff', '#8de0a5', '#8cbcff', '#ffbd79', '#ff98be', '#7fd9d6'];
const STATUS = { todo:'To do', progress:'In progress', blocked:'Blocked', done:'Done' };
const PRIORITY = { low:'Low', medium:'Medium', high:'High', critical:'Critical' };
const $ = selector => document.querySelector(selector);
const glyphs = {
  plus:'<path d="M12 5v14M5 12h14"/>',
  arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
  left:'<path d="m15 18-6-6 6-6"/>',
  right:'<path d="m9 18 6-6-6-6"/>',
  chevron:'<path d="m9 18 6-6-6-6"/>',
  edit:'<path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L9 17l-4 1 1-4z"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>',
  tasks:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="m8 9 1.5 1.5L12 8m2 1h3m-9 7 1.5 1.5L12 15m2 1h3"/>',
  check:'<path d="M5 12.5 10 17l9-10"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  warning:'<path d="M10.3 3.9 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v5m0 3h.01"/>',
  download:'<path d="M12 3v12m-4-4 4 4 4-4M4 17v4h16v-4"/>',
  upload:'<path d="M12 16V4m-4 4 4-4 4 4M4 17v4h16v-4"/>',
  trash:'<path d="M3 6h18m-2 0-1 15H6L5 6m3-3h8l1 3M10 10v7m4-7v7"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>',
  circle:'<circle cx="12" cy="12" r="9"/>',
  focus:'<path d="M12 4v3m0 10v3M4 12h3m10 0h3"/><circle cx="12" cy="12" r="4"/>',
  sparkle:'<path d="m12 2 1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6zM19 17l.7 2.3L22 20l-2.3.7L19 23l-.7-2.3L16 20l2.3-.7z"/>',
  more:'<circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/>',
  up:'<path d="m6 15 6-6 6 6"/>',
  down:'<path d="m6 9 6 6 6-6"/>',
  moon:'<path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  external:'<path d="M14 4h6v6M20 4 10 14"/><path d="M20 14v6H4V4h6"/>',
  info:'<circle cx="12" cy="12" r="10"/><path d="M12 11v6m0-10h.01"/>',
  archive:'<rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v12h14V8M10 12h4"/>',
  repeat:'<path d="M20 7h-9a5 5 0 0 0-5 5v1M4 17h9a5 5 0 0 0 5-5v-1M16 3l4 4-4 4M8 13l-4 4 4 4"/>'
};
function ico(name) { return `<svg viewBox="0 0 24 24" aria-hidden="true">${glyphs[name] || glyphs.circle}</svg>`; }
function e(value) { return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
function id() { return (globalThis.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'g'+Date.now()+'_'+Math.random().toString(36).slice(2); }
const pad = value => String(value).padStart(2,'0');
function localDate(date = new Date()) { return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`; }
function addDays(dateString, n) { const d = parseLocalDate(dateString); d.setDate(d.getDate()+n); return localDate(d); }
function parseLocalDate(dateString) { const [y,m,d] = String(dateString).split('-').map(Number); return new Date(y || 2026, (m || 1)-1, d || 1); }
function dayDiff(dateString) {
  if (!dateString) return null;
  const target = parseLocalDate(dateString), now = new Date();
  const a = Date.UTC(target.getFullYear(),target.getMonth(),target.getDate());
  const b = Date.UTC(now.getFullYear(),now.getMonth(),now.getDate());
  return Math.round((a-b)/86400000);
}
function dateText(dateString, options={month:'short',day:'numeric',year:'numeric'}) { if(!dateString)return ''; return parseLocalDate(dateString).toLocaleDateString(undefined,options); }
function dateTimeText(dateTime) { if(!dateTime)return ''; const d=new Date(dateTime); return Number.isNaN(d.valueOf()) ? dateTime : d.toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}); }
function countdown(dateString) {
  const d = dayDiff(dateString);
  if (d === null) return {text:'No due date',type:'plain'};
  if (d < 0) return {text:`${Math.abs(d)} day${d===-1?'':'s'} overdue`,type:'red'};
  if (d === 0) return {text:'Due today',type:'orange'};
  if (d === 1) return {text:'Due tomorrow',type:'orange'};
  return {text:`Due in ${d} days`,type:d<=3?'orange':'violet'};
}
function clamp(n,min,max) { return Math.min(max,Math.max(min,n)); }
function demoDb() {
  const today = localDate();
  const g1={id:id(),name:'Develop machine concept',description:'From requirements through design review and release.',color:PALETTE[0],createdAt:new Date().toISOString()};
  const g2={id:id(),name:'Workshop improvements',description:'A second workstream to demonstrate the shared calendar.',color:PALETTE[1],createdAt:new Date().toISOString()};
  const makeTask=(goalId,title,order,dueOffset,status='todo',checks=[])=>({ id:id(),goalId,title,description:'',status,priority:'medium',dueDate:dueOffset===null?'':addDays(today,dueOffset),appointmentAt:'',duration:60,checklist:checks.map(text=>({id:id(),text,done:false})),order,createdAt:new Date().toISOString() });
  return {version:1,goals:[g1,g2],tasks:[
    {...makeTask(g1.id,'Define design requirements',0,-1,'done',['Review operating conditions','Agree design criteria']),description:'Document scope, constraints and acceptance criteria.',checklist:[{id:id(),text:'Review operating conditions',done:true},{id:id(),text:'Agree design criteria',done:true}]},
    {...makeTask(g1.id,'Develop concept layout',1,0,'progress',['Sketch arrangements','Check interfaces','Discuss with team']),description:'Explore layout alternatives and key interfaces.'},
    {...makeTask(g1.id,'Calculate loads and size drive',2,3,'todo',['Estimate inertia','Calculate duty cycle','Verify safety factors']),description:'Check mechanical loads and actuation requirements.'},
    {...makeTask(g1.id,'Complete design review',3,10),description:'Present the preferred solution and record actions.'},
    {...makeTask(g1.id,'Release drawings',4,null),description:'Produce and check the final drawing package.'},
    {...makeTask(g2.id,'List improvement opportunities',0,2,'progress'),description:'Walk through the workshop and note pain points.'},
    {...makeTask(g2.id,'Order required materials',1,7),description:'Confirm specifications and lead times.'},
    {...makeTask(g2.id,'Install and verify changes',2,15),description:'Validate the completed changes against expectations.'}
  ]};
}
function normalizeDb(raw) {
  if (!raw || !Array.isArray(raw.goals) || !Array.isArray(raw.tasks)) throw Error('Invalid GoalPath backup.');
  const goals=raw.goals.slice(0,500).filter(g=>g && g.id).map(g=>({id:String(g.id).slice(0,100),name:String(g.name||'Untitled goal').slice(0,200),description:String(g.description||'').slice(0,4000),color:PALETTE.includes(g.color)?g.color:PALETTE[0],createdAt:String(g.createdAt||new Date().toISOString())}));
  const valid = new Set(goals.map(g=>g.id));
  const tasks=raw.tasks.slice(0,20000).filter(t=>t && t.id && valid.has(String(t.goalId))).map(t=>({
    id:String(t.id).slice(0,100),goalId:String(t.goalId),title:String(t.title||'Untitled task').slice(0,300),description:String(t.description||'').slice(0,20000),
    status:STATUS[t.status]?t.status:'todo', priority:PRIORITY[t.priority]?t.priority:'medium',
    dueDate:/^\d{4}-\d{2}-\d{2}$/.test(t.dueDate||'')?t.dueDate:'',
    appointmentAt:/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(t.appointmentAt||'')?t.appointmentAt:'',
    duration:clamp(Number(t.duration)||60,15,480),order:Number.isFinite(Number(t.order))?Number(t.order):0,
    createdAt:String(t.createdAt||new Date().toISOString()),checklist:Array.isArray(t.checklist)?t.checklist.slice(0,500).map(x=>({id:String(x.id||id()),text:String(x.text||'').slice(0,1000),done:!!x.done})):[]
  }));
  return {version:1,goals,tasks};
}
function loadData() {
  try { const raw=localStorage.getItem(STORAGE_KEY); return raw ? normalizeDb(JSON.parse(raw)) : demoDb(); }
  catch(err) { console.warn('Could not load GoalPath data',err); return demoDb(); }
}
function loadPrefs() { try{return JSON.parse(localStorage.getItem(PREFS_KEY)||'{}')||{};}catch{return {}; } }
let db = loadData();
const prefs = loadPrefs();
if (!localStorage.getItem(STORAGE_KEY)) saveData();
let ui={screen:'goals',goalId:'',taskId:'',zoomByGoal:{},calendarMonth:localDate().slice(0,7),selectedDate:localDate(),filter:'all',modal:null,modalColor:PALETTE[0],prevScreen:'goals'};
let toastTimer;
function saveData() { try{localStorage.setItem(STORAGE_KEY,JSON.stringify(db));}catch(err){console.warn(err);toast('Storage unavailable. Export a backup.');} }
function savePrefs() { try{localStorage.setItem(PREFS_KEY,JSON.stringify(prefs));}catch{} }
function toast(message) {const el=$('#toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),2700);}
function goalOf(task) {return db.goals.find(g=>g.id===task.goalId);}
function goalTasks(goalId) {return db.tasks.filter(t=>t.goalId===goalId).sort((a,b)=>a.order-b.order||a.createdAt.localeCompare(b.createdAt));}
function taskById(taskId) {return db.tasks.find(t=>t.id===taskId);}
function taskProgress(task) {const total=task.checklist.length, done=task.checklist.filter(c=>c.done).length;return {done,total,percent:total?Math.round(done/total*100):0};}
function goalStats(goal) {const tasks=goalTasks(goal.id);const done=tasks.filter(t=>t.status==='done').length;return {total:tasks.length,done,open:tasks.length-done,percent:tasks.length?Math.round(done/tasks.length*100):0};}
function navigate(route) { if(location.hash===`#${route}`) onRoute();else location.hash=route; }
function onRoute() {
  const parts=(location.hash.replace(/^#\/?/,'')||'goals').split('/');
  ui.screen=['goals','today','calendar','settings','plan','task'].includes(parts[0])?parts[0]:'goals';
  ui.goalId=ui.screen==='plan'?decodeURIComponent(parts[1]||''):ui.goalId;
  ui.taskId=ui.screen==='task'?decodeURIComponent(parts[1]||''):ui.taskId;
  closeModal(false); render(); window.scrollTo(0,0);
}
function render() {
  document.body.dataset.theme=prefs.theme==='light'?'light':'dark';
  document.querySelector('meta[name="theme-color"]').content=prefs.theme==='light'?'#f3f5fb':'#0a1020';
  const active=['plan','task'].includes(ui.screen)?'goals':ui.screen;
  document.querySelectorAll('[data-nav]').forEach(el=>{el.classList.toggle('active',el.dataset.nav===active);el.setAttribute('aria-current',el.dataset.nav===active?'page':'false');});
  const main=$('#app-main');
  switch(ui.screen) {
    case 'plan': main.innerHTML=renderPlan(); requestAnimationFrame(applyPlanZoom);break;
    case 'task': main.innerHTML=renderTask();break;
    case 'today': main.innerHTML=renderToday();break;
    case 'calendar': main.innerHTML=renderCalendar();break;
    case 'settings': main.innerHTML=renderSettings();break;
    default: main.innerHTML=renderGoals();
  }
  document.title=`${{goals:'Goals',plan:'Plan',task:'Task',today:'Focus',calendar:'Calendar',settings:'Settings'}[ui.screen]} · GoalPath`;
}
function renderGoals() {
  const active=db.tasks.filter(t=>t.status!=='done');
  const dueWeek=active.filter(t=>t.dueDate && dayDiff(t.dueDate)>=0 && dayDiff(t.dueDate)<=7).length;
  const completed=db.tasks.length-active.length;
  const cards=db.goals.map(goal=>{
    const s=goalStats(goal);const next=goalTasks(goal.id).find(t=>t.status!=='done');
    return `<article class="goal-card" style="--goal-color:${goal.color}" data-action="open-goal" data-goal="${e(goal.id)}" tabindex="0" role="button" aria-label="Open plan for ${e(goal.name)}">
      <div class="goal-card-top"><div class="goal-symbol">${ico('target')}</div><span class="badge">${s.total} task${s.total===1?'':'s'}</span></div>
      <h3>${e(goal.name)}</h3><p>${e(goal.description||'Visualise the steps to achieve this goal.')}</p>
      <div class="goal-progress"><span>${s.done} of ${s.total} completed</span><strong>${s.percent}%</strong></div>
      <div class="progress-track"><div class="progress-fill" style="width:${s.percent}%"></div></div>
      ${next?`<div class="small muted" style="margin-top:12px">Next: ${e(next.title)}</div>`:''}
    </article>`;
  }).join('');
  return `<section class="page-heading"><div><div class="eyebrow">YOUR WORK, MAPPED OUT</div><h1>Make progress visible.</h1><p class="lead">Multiple goals. Clear task sequences. One connected plan.</p></div><button class="primary-btn" data-action="add-goal">${ico('plus')}<span>New goal</span></button></section>
    <section class="metric-grid">
      ${metric('target',db.goals.length,'Goals')}${metric('tasks',active.length,'Open tasks')}${metric('calendar',dueWeek,'Due in 7 days')}${metric('check',completed,'Completed')}
    </section>
    <section class="section-heading"><h2>Your goals</h2><span class="muted small">Select a goal to open its plan</span></section>
    ${db.goals.length?`<section class="goal-grid">${cards}</section>`:empty('🎯','No goals yet','Create your first goal, then add tasks along its visual path.','<button class="primary-btn" data-action="add-goal">Create a goal</button>')}
    <p class="note" style="margin-top:22px">Your plans are saved in this browser on this device. Use Settings to export a backup.</p>`;
}
function metric(icon,value,label){return `<div class="metric">${ico(icon)}<strong>${value}</strong><span>${label}</span></div>`;}
function empty(icon,title,body,button=''){return `<div class="empty-state"><div class="empty-state-icon">${icon}</div><h3>${e(title)}</h3><p>${e(body)}</p>${button}</div>`;}
function dueBadge(task) {if(task.status==='done')return `<span class="badge green">${ico('check')} Completed</span>`;const c=countdown(task.dueDate);return `<span class="badge ${c.type==='plain'?'':c.type}">${ico('clock')}${e(c.text)}</span>`;}
function statusBadge(task) {const color={todo:'',progress:'blue',blocked:'red',done:'green'}[task.status];return `<span class="badge ${color}">${e(STATUS[task.status])}</span>`;}
function renderPlan() {
  const goal=db.goals.find(g=>g.id===ui.goalId);
  if(!goal) return empty('🧭','Goal not found','Return to Goals and select a goal.','<button class="primary-btn" data-action="go-home">Goals</button>');
  const s=goalStats(goal),tasks=goalTasks(goal.id),zoom=ui.zoomByGoal[goal.id]??1;
  let steps=`<div class="plan-goal"><div class="plan-orbit goal-orbit">${ico('target')}</div><div class="plan-step-content"><div class="plan-step-main"><div class="mini-kicker">DESTINATION</div><h3>${e(goal.name)}</h3><span class="badge green">${s.percent}% complete</span></div></div></div>`;
  steps+=insertButton(goal.id,'', 'Add first task');
  tasks.forEach((task,index)=>{
    const progress=taskProgress(task),detail=task.description.trim().slice(0,90);
    steps+=`<button class="plan-step" data-action="open-task" data-task="${e(task.id)}" aria-label="Open task ${e(task.title)}">
      <div class="plan-orbit ${task.status==='done'?'done':task.status==='blocked'?'blocked':task.status==='progress'?'progress':''}">
        ${task.status==='done'?ico('check'):`<span class="ordinal">${pad(index+1)}</span><span class="orbit-caption">TASK</span>`}
      </div>
      <div class="plan-step-content"><div class="plan-step-main"><div class="mini-kicker">STEP ${pad(index+1)} · ${e(STATUS[task.status])}</div><h3>${e(task.title)}</h3>
        <div class="meta-pills">${dueBadge(task)}${progress.total?`<span class="badge">${progress.done}/${progress.total} checks</span>`:''}</div>
        ${detail?`<div class="step-detail">${e(detail)}</div>`:''}
      </div><span class="step-chevron">${ico('chevron')}</span></div>
    </button>${insertButton(goal.id,task.id,index===tasks.length-1?'Add next task':'Insert task here')}`;
  });
  return `<button class="back-link" data-action="go-home">${ico('left')} All goals</button>
    <section class="plan-hero"><div class="plan-title-row"><div><span class="eyebrow">GOAL PLAN</span><h1>${e(goal.name)}</h1><p class="lead">${e(goal.description||'Arrange tasks in the order you plan to tackle them.')}</p></div><button class="secondary-btn" data-action="edit-goal" data-goal="${e(goal.id)}">${ico('edit')}<span>Edit goal</span></button></div>
      <div class="plan-stats"><span><b>${s.total}</b> tasks</span><span><b>${s.done}</b> complete</span><span><b>${s.open}</b> remaining</span><span style="color:${goal.color}"><b>${s.percent}%</b> progress</span></div>
      <div class="progress-track" style="--goal-color:${goal.color};margin-top:13px"><div class="progress-fill" style="width:${s.percent}%"></div></div>
    </section>
    <div class="plan-toolbar"><div><h2>Task flow</h2><span class="small muted">Tap a node to open its task card</span></div>
    <div class="zoom-control" aria-label="Plan zoom controls"><button data-action="zoom-out" title="Zoom out" aria-label="Zoom out">${ico('minus')}</button><span id="zoom-level">${Math.round(zoom*100)}%</span><button data-action="zoom-in" title="Zoom in" aria-label="Zoom in">${ico('plus')}</button><button data-action="zoom-fit" title="Compact overview" aria-label="Compact overview">${ico('focus')}</button></div></div>
    <p class="zoom-help">Use the + controls on the connecting line to insert a task. Pinch with two fingers to zoom on iPhone. Reorder tasks from their cards.</p>
    <div class="plan-viewport"><div class="plan-track" style="--zoom:${zoom}" data-density="${density(zoom)}"><div class="plan-flow">${steps}</div></div></div>
    ${!tasks.length?`<p class="note">Start with your first action and grow the plan one step at a time.</p>`:''}`;
}
// Additional icon kept inline so the rest of the icon collection stays easy to edit.
glyphs.minus='<path d="M5 12h14"/>';
function density(zoom) {return zoom<.8?'overview':zoom>=1.13?'detailed':'normal';}
function insertButton(goalId,afterId,label){return `<button class="insert-point" data-action="insert-task" data-goal="${e(goalId)}" data-after="${e(afterId)}" title="${e(label)}"><span class="plus-orb">${ico('plus')}</span><span class="add-label">${e(label)}</span></button>`;}
function applyPlanZoom() {
  const content=$('.plan-track'), viewport=$('.plan-viewport'); if(!content||!viewport)return;
  const zoom=ui.zoomByGoal[ui.goalId]??1;
  content.style.setProperty('--zoom',zoom);content.dataset.density=density(zoom);
  const label=$('#zoom-level');if(label)label.textContent=`${Math.round(zoom*100)}%`;
  // ResizeObserver is unnecessary here: the timeline changes height only on render or zoom.
  viewport.style.height=`${Math.ceil(content.scrollHeight*zoom)+12}px`;
}
function changeZoom(delta,absolute=false) {
  const current=ui.zoomByGoal[ui.goalId]??1;
  ui.zoomByGoal[ui.goalId]=clamp(Math.round((absolute?delta:current+delta)*100)/100,.6,1.5);
  applyPlanZoom();
}
function renderTask() {
  const task=taskById(ui.taskId);
  if(!task)return empty('🗂️','Task not found','The task may have been deleted.','<button class="primary-btn" data-action="go-home">Goals</button>');
  const goal=goalOf(task),siblings=goalTasks(task.goalId),index=siblings.findIndex(t=>t.id===task.id),progress=taskProgress(task),due=countdown(task.dueDate);
  const checklist=task.checklist.map(item=>`<div class="check-item ${item.done?'completed':''}"><input type="checkbox" aria-label="Complete ${e(item.text)}" data-check="${e(item.id)}" ${item.done?'checked':''}/><span class="check-text">${e(item.text)}</span><button class="check-remove" data-action="remove-check" data-check="${e(item.id)}" aria-label="Remove checklist item" title="Remove">${ico('x')}</button></div>`).join('');
  return `<button class="back-link" data-action="back-to-plan" data-goal="${e(task.goalId)}">${ico('left')} ${e(goal?.name||'Goal plan')}</button>
   <div class="card-heading"><div><div class="eyebrow">TASK CARD · STEP ${pad(index+1)}</div><h1>Task details</h1><span class="muted small">${e(goal?.name||'')}</span></div>${statusBadge(task)}</div>
   <div class="task-layout"><div>
    <section class="panel"><h2>Task</h2>
      <label class="form-field"><span>Task name</span><input class="task-title-input" data-task-field="title" maxlength="300" value="${e(task.title)}" placeholder="What needs to be done?" /></label>
      <label class="form-field"><span>Description / notes</span><textarea data-task-field="description" placeholder="Capture the purpose, expected output, constraints, or decisions...">${e(task.description)}</textarea></label>
      <div class="form-grid"><label class="form-field"><span>Status</span><select data-task-field="status">${Object.entries(STATUS).map(([key,label])=>`<option value="${key}" ${task.status===key?'selected':''}>${label}</option>`).join('')}</select></label>
      <label class="form-field"><span>Priority</span><select data-task-field="priority">${Object.entries(PRIORITY).map(([key,label])=>`<option value="${key}" ${task.priority===key?'selected':''}>${label}</option>`).join('')}</select></label></div>
    </section>
    <section class="panel"><div class="section-heading" style="margin:0 0 10px"><h2>Checklist</h2><span class="badge ${progress.total&&progress.done===progress.total?'green':''}">${progress.done} / ${progress.total}</span></div>
      <p class="panel-intro">Break the task into smaller actions, just like a Jira issue.</p>
      <div class="check-progress"><span>${progress.percent}% checked off</span><span>${progress.total-progress.done} remaining</span></div><div class="progress-track" style="--goal-color:var(--green);margin:0 0 12px"><div class="progress-fill" style="width:${progress.percent}%"></div></div>
      ${checklist||'<p class="small muted">No checklist items yet.</p>'}
      <form data-form="add-check" class="check-add"><input name="text" maxlength="1000" autocomplete="off" required placeholder="Add a checklist item" aria-label="New checklist item"/><button type="submit" title="Add checklist item" aria-label="Add checklist item">${ico('plus')}</button></form>
    </section>
   </div><aside>
    <section class="panel"><h2>Timing</h2><label class="form-field"><span>Due date (optional)</span><input type="date" data-task-field="dueDate" value="${e(task.dueDate)}"/></label>
      <p class="small ${due.type==='red'?'': 'muted'}" style="color:${due.type==='red'?'var(--red)':due.type==='orange'?'var(--orange)':'var(--muted)'};margin-bottom:0">${ico('clock')} ${e(due.text)}${task.dueDate?` · ${e(dateText(task.dueDate))}`:''}</p>
    </section>
    <section class="panel"><h2>Calendar appointment</h2><p class="panel-intro">A due date is the deadline. An appointment is time reserved in your calendar to work on this task.</p>
       <label class="form-field"><span>Appointment start</span><input type="datetime-local" data-task-field="appointmentAt" value="${e(task.appointmentAt)}"/></label>
       <label class="form-field"><span>Duration</span><select data-task-field="duration">${[15,30,45,60,90,120,180,240].map(min=>`<option value="${min}" ${task.duration===min?'selected':''}>${min<60?min+' minutes':(min/60)+' hour'+(min===60?'':'s')}</option>`).join('')}</select></label>
       ${!task.appointmentAt && task.dueDate?`<button class="text-btn" data-action="schedule-due">${ico('calendar')} Use due date at 9:00 am</button>`:''}
       ${task.appointmentAt?`<div class="calendar-actions"><button class="secondary-btn" data-action="export-ics">${ico('download')} Apple / iPhone calendar (.ics)</button><button class="secondary-btn" data-action="open-outlook">${ico('external')} Create in Outlook calendar</button></div>`:
       `<div class="inline-warning">Set an appointment start to enable calendar export.</div>`}
       <p class="note" style="margin-top:12px;margin-bottom:0">You choose which calendars to add it to. Events are not automatically kept in sync if the task changes later.</p>
    </section>
    <section class="panel"><h2>Task order</h2><p class="panel-intro">Change the sequence on the visual plan.</p><div class="btn-row">
       <button class="secondary-btn" data-action="move-task-up" ${index===0?'disabled':''}>${ico('up')} Earlier</button>
       <button class="secondary-btn" data-action="move-task-down" ${index===siblings.length-1?'disabled':''}>${ico('down')} Later</button></div>
       <div style="margin-top:23px"><button class="danger-btn" data-action="delete-task">${ico('trash')} Delete task</button></div>
    </section>
   </aside></div>`;
}
function taskAgendaRow(task,kind='Due',when='') {
  const goal=goalOf(task),c=countdown(task.dueDate);
  return `<button class="agenda-row" data-action="open-task" data-task="${e(task.id)}" style="--item-color:${goal?.color||PALETTE[0]}">
    <span class="agenda-color"></span><span class="agenda-info"><strong>${e(task.title)}</strong><span>${e(goal?.name||'Unknown goal')} · ${e(kind)}${when?' · '+e(when):''}</span></span>
    <span class="agenda-side">${statusBadge(task)}${kind==='Due'&&task.dueDate?`<span class="small ${c.type==='red'?'':'muted'}">${e(c.text)}</span>`:''}</span>
    ${ico('chevron')}</button>`;
}
function renderToday() {
  const open=db.tasks.filter(t=>t.status!=='done');
  const overdue=open.filter(t=>t.dueDate&&dayDiff(t.dueDate)<0).sort((a,b)=>a.dueDate.localeCompare(b.dueDate));
  const today=open.filter(t=>(t.dueDate&&dayDiff(t.dueDate)===0)||(t.appointmentAt&&t.appointmentAt.slice(0,10)===localDate())).sort((a,b)=>a.title.localeCompare(b.title));
  const upcoming=open.filter(t=>t.dueDate&&dayDiff(t.dueDate)>0&&dayDiff(t.dueDate)<=7).sort((a,b)=>a.dueDate.localeCompare(b.dueDate));
  const undated=open.filter(t=>!t.dueDate&&!t.appointmentAt);
  const list=(title,items,emptyMessage,type)=>`<section class="focus-section"><div class="section-heading"><h2>${title}</h2><span class="badge">${items.length}</span></div><div class="task-list">${items.length?items.map(t=>taskAgendaRow(t,title==='Today'&&t.dueDate!==localDate()&&t.appointmentAt?.slice(0,10)===localDate()?'Appointment':type, t.dueDate?dateText(t.dueDate,{month:'short',day:'numeric'}):t.appointmentAt?dateTimeText(t.appointmentAt):'' )).join(''):`<p class="small muted">${emptyMessage}</p>`}</div></section>`;
  return `<section class="page-heading"><div><span class="eyebrow">YOUR FOCUS</span><h1>What matters next.</h1><p class="lead">A cross-goal view of deadlines and active tasks.</p></div></section>
   <div class="metric-grid">${metric('warning',overdue.length,'Overdue')}${metric('focus',today.length,'Today')}${metric('calendar',upcoming.length,'Next 7 days')}${metric('tasks',undated.length,'No due date')}</div>
   ${list('Needs attention',overdue,'Nothing overdue.','Due')}
   ${list('Today',today,'Nothing due or scheduled today.','Due')}
   ${list('Coming up this week',upcoming,'No upcoming deadlines this week.','Due')}
   ${list('Undated tasks',undated,'Every open task has a date.','Undated')}`;
}
function eventEntries() {
  const result=[];
  for(const task of db.tasks) {
    if(task.dueDate) result.push({task,date:task.dueDate,kind:'Due',time:''});
    if(task.appointmentAt) result.push({task,date:task.appointmentAt.slice(0,10),kind:'Appointment',time:task.appointmentAt.slice(11,16)});
  }
  return result.filter(event=>ui.filter==='all'||event.task.goalId===ui.filter);
}
function renderCalendar() {
  const [y,m]=ui.calendarMonth.split('-').map(Number);
  const first=new Date(y,m-1,1),monthLength=new Date(y,m,0).getDate(),start=(first.getDay()+6)%7,cellCount=Math.ceil((start+monthLength)/7)*7;
  const events=eventEntries();const byDate=new Map();
  events.forEach(ev=>{if(!byDate.has(ev.date))byDate.set(ev.date,[]);byDate.get(ev.date).push(ev);});
  const dayLabels=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day=>`<div class="calendar-dayname">${day}</div>`).join('');
  let days='';
  for(let i=0;i<cellCount;i++){
    const date=new Date(y,m-1,1-start+i),key=localDate(date),inMonth=date.getMonth()===(m-1);
    const items=byDate.get(key)||[],uniqueColors=[...new Set(items.map(item=>goalOf(item.task)?.color||PALETTE[0]))];
    days+=`<button class="calendar-cell ${!inMonth?'is-other':''} ${key===localDate()?'is-today':''} ${key===ui.selectedDate?'is-selected':''}" data-action="select-date" data-date="${key}" aria-label="${e(dateText(key))}, ${items.length} events"><span class="day-number">${date.getDate()}</span><span class="date-dots">${uniqueColors.slice(0,4).map(color=>`<i style="--dot-color:${color}"></i>`).join('')}</span></button>`;
  }
  const selected=(byDate.get(ui.selectedDate)||[]).sort((a,b)=>a.kind.localeCompare(b.kind)||a.time.localeCompare(b.time));
  const monthName=first.toLocaleDateString(undefined,{month:'long',year:'numeric'});
  return `<section class="page-heading"><div><span class="eyebrow">ALL WORKSTREAMS</span><h1>One calendar. Every goal.</h1><p class="lead">See every dated task and calendar appointment across your plans.</p></div></section>
    <div class="section-heading"><h2>Schedule</h2><select class="filter-select" id="calendar-filter" aria-label="Filter calendar by goal"><option value="all">All goals</option>${db.goals.map(g=>`<option value="${e(g.id)}" ${ui.filter===g.id?'selected':''}>${e(g.name)}</option>`).join('')}</select></div>
    <section class="calendar-shell"><div class="month-panel"><div class="month-header"><h2>${e(monthName)}</h2><div class="month-nav"><button data-action="calendar-prev" aria-label="Previous month">${ico('left')}</button><button data-action="calendar-today" aria-label="Jump to today">${ico('focus')}</button><button data-action="calendar-next" aria-label="Next month">${ico('right')}</button></div></div><div class="calendar-grid">${dayLabels}${days}</div><p class="small muted" style="margin:15px 0 0">Coloured dots indicate goals with dated tasks. Select any day.</p></div>
    <aside class="agenda-panel"><span class="eyebrow violet">SELECTED DAY</span><h3 style="margin-top:9px">${e(dateText(ui.selectedDate,{weekday:'long',day:'numeric',month:'long',year:'numeric'}))}</h3>
      <div class="task-list">${selected.length?selected.map(ev=>taskAgendaRow(ev.task,ev.kind,ev.time)).join(''):'<p class="small muted">No due tasks or appointments on this day.</p>'}</div>
      <p class="note" style="margin-top:17px;margin-bottom:0">The calendar includes due dates and scheduled appointments; these may appear as separate items for one task.</p>
    </aside></section>`;
}
function renderSettings() {
  return `<section class="page-heading"><div><span class="eyebrow">YOUR WORKSPACE</span><h1>Settings & backups.</h1><p class="lead">Personalise the view and keep control of your data.</p></div></section>
    <div class="settings-grid">
      <section class="setting-tile"><h2>Appearance</h2><p>Choose the palette that feels best for planning.</p><div class="btn-row"><button class="secondary-btn" data-action="theme-dark">${ico('moon')} Dark ${prefs.theme!=='light'?'✓':''}</button><button class="secondary-btn" data-action="theme-light">${ico('sun')} Light ${prefs.theme==='light'?'✓':''}</button></div></section>
      <section class="setting-tile"><h2>Backup & restore</h2><p>Your tasks are stored locally in this browser, not in your GitHub repository. Export a JSON file regularly, especially before changing phones.</p><div class="btn-row"><button class="primary-btn" data-action="export-json">${ico('download')} Export backup</button><button class="secondary-btn" data-action="import-json">${ico('upload')} Import backup</button></div></section>
      <section class="setting-tile"><h2>Install on iPhone</h2><p>Once published to GitHub Pages, open the site in Safari, tap <b>Share</b>, then <b>Add to Home Screen</b>. It will open like an app and works offline after initial loading.</p><p>For app installation, use the published HTTPS GitHub Pages address rather than opening index.html as a local file.</p></section>
      <section class="setting-tile"><h2>Calendar integration</h2><p>Each task card can generate an .ics invitation for Apple Calendar or open a pre-filled event editor in Outlook on the web. You control which calendars receive the event.</p><p>Editing a task later does not automatically update a previously imported event. Automatic two-way sync would require account sign-in and an online backend.</p></section>
      <section class="setting-tile"><h2>About GoalPath</h2><p>An intentionally visual planner: goals → sequenced tasks → checklists, with shared Focus and Calendar views.</p><p><strong>${db.goals.length} goals</strong> and <strong>${db.tasks.length} tasks</strong> stored on this device.</p></section>
      <section class="setting-tile"><h2>Start fresh</h2><p>Remove the example content or all current plans. This affects only this device and cannot be undone without a backup.</p><div class="btn-row"><button class="secondary-btn" data-action="load-demo">${ico('repeat')} Load example plans</button><button class="danger-btn" data-action="clear-all">${ico('trash')} Delete all data</button></div></section>
    </div>`;
}
function openGoalModal(goal=null) {
  ui.modal=goal?'edit-goal':'add-goal';ui.modalColor=goal?.color||PALETTE[db.goals.length%PALETTE.length];
  $('#modal-root').innerHTML=`<div class="modal-overlay" data-action="modal-backdrop"><div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="modal-heading">
    <div class="modal-head"><h2 id="modal-heading">${goal?'Edit goal':'Create a goal'}</h2><button class="icon-button" data-action="close-modal" aria-label="Close">${ico('x')}</button></div>
    <form data-form="goal"><input type="hidden" name="goalId" value="${e(goal?.id||'')}"/>
      <label class="modal-field"><span>Goal name</span><input name="name" placeholder="e.g. Commission prototype" maxlength="200" required value="${e(goal?.name||'')}"/></label>
      <label class="modal-field"><span>Description</span><textarea name="description" maxlength="4000" placeholder="What will success look like?">${e(goal?.description||'')}</textarea></label>
      <div class="modal-field"><span>Goal colour</span><div class="color-options">${PALETTE.map(color=>`<button type="button" class="color-swatch ${color===ui.modalColor?'selected':''}" data-action="choose-color" data-color="${color}" style="--color:${color}" aria-label="Choose colour ${color}"></button>`).join('')}</div></div>
      <div class="modal-actions"><button class="secondary-btn" type="button" data-action="close-modal">Cancel</button><button class="primary-btn" type="submit">${goal?'Save goal':'Create goal'}</button></div>
    </form>
    ${goal?`<div style="margin-top:20px;border-top:1px solid var(--line);padding-top:16px"><button class="danger-btn" data-action="delete-goal" data-goal="${e(goal.id)}">${ico('trash')} Delete goal and its tasks</button></div>`:''}
  </div></div>`;
  $('#modal-root input[name="name"]').focus();
}
function closeModal(remove=true){ui.modal=null;if(remove&&$('#modal-root'))$('#modal-root').innerHTML='';}
function addTask(goalId,afterId='') {
  const siblings=goalTasks(goalId);if(!db.goals.some(g=>g.id===goalId))return;
  let insertIndex=afterId?siblings.findIndex(t=>t.id===afterId)+1:0;
  if(insertIndex<0)insertIndex=siblings.length;
  const task={id:id(),goalId,title:'New task',description:'',status:'todo',priority:'medium',dueDate:'',appointmentAt:'',duration:60,checklist:[],order:insertIndex,createdAt:new Date().toISOString()};
  siblings.splice(insertIndex,0,task);siblings.forEach((t,index)=>t.order=index);
  db.tasks.push(task);saveData();navigate(`/task/${encodeURIComponent(task.id)}`);
  requestAnimationFrame(()=>{const el=$('[data-task-field="title"]');if(el){el.focus();el.select();}});
}
function moveTask(direction) {
  const task=taskById(ui.taskId);if(!task)return;
  const siblings=goalTasks(task.goalId);const index=siblings.findIndex(t=>t.id===task.id),to=index+direction;
  if(to<0||to>=siblings.length)return;
  [siblings[index],siblings[to]]=[siblings[to],siblings[index]];
  siblings.forEach((t,i)=>t.order=i);saveData();render();toast('Task order updated');
}
function deleteTask() {
  const task=taskById(ui.taskId);if(!task)return;
  if(!confirm(`Delete "${task.title}"? This cannot be undone without a backup.`))return;
  db.tasks=db.tasks.filter(t=>t.id!==task.id);saveData();navigate(`/plan/${encodeURIComponent(task.goalId)}`);toast('Task deleted');
}
function deleteGoal(goalId) {
  const goal=db.goals.find(g=>g.id===goalId);if(!goal)return;
  if(!confirm(`Delete "${goal.name}" and all ${goalTasks(goalId).length} of its tasks?`))return;
  db.goals=db.goals.filter(g=>g.id!==goalId);db.tasks=db.tasks.filter(t=>t.goalId!==goalId);saveData();closeModal();navigate('/goals');toast('Goal deleted');
}
function downloadBlob(blob,filename){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);}
function slug(value){return (value||'task').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,55)||'task';}
function eventDetails() {
  const task=taskById(ui.taskId);if(!task||!task.appointmentAt){toast('Set an appointment start first.');return null;}
  const start=new Date(task.appointmentAt);if(Number.isNaN(start.getTime())){toast('Invalid appointment start.');return null;}
  const end=new Date(start.getTime()+task.duration*60000);const goal=goalOf(task);
  const remaining=task.checklist.filter(c=>!c.done).map(c=>'• '+c.text).join('\n');
  const body=[`Goal: ${goal?.name||''}`,task.description||'',remaining?`Remaining checklist:\n${remaining}`:''].filter(Boolean).join('\n\n');
  return {task,start,end,body};
}
function icsEscape(value){return String(value).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');}
function icsDate(date){return date.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');}
function exportIcs(){const event=eventDetails();if(!event)return;const {task,start,end,body}=event;
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//GoalPath//Visual Task Planner//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT',`UID:${task.id}@goalpath.local`,`DTSTAMP:${icsDate(new Date())}`,`DTSTART:${icsDate(start)}`,`DTEND:${icsDate(end)}`,`SUMMARY:${icsEscape(task.title)}`,`DESCRIPTION:${icsEscape(body)}`,'END:VEVENT','END:VCALENDAR'];
  downloadBlob(new Blob([lines.join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'}),`${slug(task.title)}.ics`);
  toast('Calendar file generated');
}
function openOutlook(){const event=eventDetails();if(!event)return;const {task,start,end,body}=event;
  const p=new URLSearchParams({path:'/calendar/action/compose',rru:'addevent',subject:task.title,startdt:start.toISOString(),enddt:end.toISOString(),body:body.slice(0,7500)});
  window.open(`https://outlook.office.com/calendar/deeplink/compose?${p.toString()}`,'_blank','noopener,noreferrer');
}
function exportBackup(){const contents={...db,exportedAt:new Date().toISOString(),app:'GoalPath'};downloadBlob(new Blob([JSON.stringify(contents,null,2)],{type:'application/json'}),`goalpath-backup-${localDate()}.json`);toast('Backup downloaded');}
function shiftMonth(delta){const [y,m]=ui.calendarMonth.split('-').map(Number);const d=new Date(y,m-1+delta,1);ui.calendarMonth=`${d.getFullYear()}-${pad(d.getMonth()+1)}`;render();}
function handleAction(el) {
 const a=el.dataset.action;
 switch(a) {
  case 'go-home':navigate('/goals');break;
  case 'quick-add': if(ui.screen==='plan'&&db.goals.some(g=>g.id===ui.goalId))addTask(ui.goalId,goalTasks(ui.goalId).at(-1)?.id||'');else openGoalModal();break;
  case 'add-goal':openGoalModal();break;
  case 'edit-goal':openGoalModal(db.goals.find(g=>g.id===el.dataset.goal));break;
  case 'open-goal':navigate(`/plan/${encodeURIComponent(el.dataset.goal)}`);break;
  case 'open-task':navigate(`/task/${encodeURIComponent(el.dataset.task)}`);break;
  case 'back-to-plan':navigate(`/plan/${encodeURIComponent(el.dataset.goal)}`);break;
  case 'insert-task':addTask(el.dataset.goal,el.dataset.after);break;
  case 'zoom-in':changeZoom(.15);break;
  case 'zoom-out':changeZoom(-.15);break;
  case 'zoom-fit':changeZoom(.68,true);break;
  case 'move-task-up':moveTask(-1);break;
  case 'move-task-down':moveTask(1);break;
  case 'delete-task':deleteTask();break;
  case 'delete-goal':deleteGoal(el.dataset.goal);break;
  case 'remove-check': {const t=taskById(ui.taskId);if(!t)break;t.checklist=t.checklist.filter(c=>c.id!==el.dataset.check);saveData();render();break;}
  case 'schedule-due': {const t=taskById(ui.taskId);if(!t||!t.dueDate)break;t.appointmentAt=t.dueDate+'T09:00';saveData();render();toast('Appointment set for 9:00 am');break;}
  case 'export-ics':exportIcs();break;
  case 'open-outlook':openOutlook();break;
  case 'calendar-prev':shiftMonth(-1);break;
  case 'calendar-next':shiftMonth(1);break;
  case 'calendar-today':ui.calendarMonth=localDate().slice(0,7);ui.selectedDate=localDate();render();break;
  case 'select-date':ui.selectedDate=el.dataset.date;ui.calendarMonth=el.dataset.date.slice(0,7);render();break;
  case 'theme-dark':prefs.theme='dark';savePrefs();render();break;
  case 'theme-light':prefs.theme='light';savePrefs();render();break;
  case 'export-json':exportBackup();break;
  case 'import-json':$('#backup-input').click();break;
  case 'load-demo': if(confirm('Replace your current plans with example data? Export a backup first if needed.')){db=demoDb();saveData();render();toast('Example plans loaded');}break;
  case 'clear-all':if(confirm('Delete ALL goals and tasks saved on this device? This cannot be undone without a backup.')){db={version:1,goals:[],tasks:[]};saveData();navigate('/goals');toast('All plans cleared');}break;
  case 'choose-color':ui.modalColor=el.dataset.color;document.querySelectorAll('.color-swatch').forEach(s=>s.classList.toggle('selected',s.dataset.color===ui.modalColor));break;
  case 'close-modal':closeModal();break;
  case 'modal-backdrop':closeModal();break;
 }
}
document.addEventListener('click', event=>{
  const el=event.target.closest('[data-action]');if(!el)return;
  if(el.dataset.action==='modal-backdrop'&&event.target!==el)return;
  handleAction(el);
});
document.addEventListener('click', event=>{
  const link=event.target.closest('[data-nav]');if(link)navigate('/'+link.dataset.nav);
});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&ui.modal)closeModal();
  if((event.key==='Enter'||event.key===' ')&&event.target.matches('.goal-card[role="button"]')){event.preventDefault();navigate(`/plan/${encodeURIComponent(event.target.dataset.goal)}`);}
});
document.addEventListener('submit',event=>{
  const form=event.target.closest('[data-form]');if(!form)return;event.preventDefault();
  if(form.dataset.form==='goal'){
    const fd=new FormData(form),name=String(fd.get('name')||'').trim(),description=String(fd.get('description')||'').trim(),goalId=String(fd.get('goalId')||'');
    if(!name){toast('Enter a goal name');return;}
    let goal=db.goals.find(g=>g.id===goalId);
    if(goal){goal.name=name;goal.description=description;goal.color=ui.modalColor;}else{goal={id:id(),name,description,color:ui.modalColor,createdAt:new Date().toISOString()};db.goals.push(goal);}
    saveData();closeModal();navigate(`/plan/${encodeURIComponent(goal.id)}`);toast(goalId?'Goal updated':'Goal created');
  }
  if(form.dataset.form==='add-check'){
    const task=taskById(ui.taskId);if(!task)return;const value=String(new FormData(form).get('text')||'').trim();if(!value)return;
    task.checklist.push({id:id(),text:value,done:false});saveData();render();const input=$('form[data-form="add-check"] input');if(input)input.focus();
  }
});
const editTask=(target,value)=>{const task=taskById(ui.taskId);if(!task)return;
  const key=target.dataset.taskField;if(!['title','description','status','priority','dueDate','appointmentAt','duration'].includes(key))return;
  task[key]=key==='duration'?clamp(Number(value)||60,15,480):value;saveData();
};
document.addEventListener('input',event=>{
  if(event.target.matches('[data-task-field="title"],[data-task-field="description"]'))editTask(event.target,event.target.value);
});
document.addEventListener('change',event=>{
  const target=event.target;
  if(target.matches('[data-task-field]')){
    editTask(target,target.value);
    if(target.dataset.taskField!=='title'&&target.dataset.taskField!=='description')render();
  }
  if(target.matches('[data-check]')){
    const task=taskById(ui.taskId);const check=task?.checklist.find(c=>c.id===target.dataset.check);if(!check)return;
    check.done=target.checked;saveData();render();
  }
  if(target.matches('#calendar-filter')){ui.filter=target.value;render();}
});
$('#backup-input').addEventListener('change',async event=>{
  const file=event.target.files?.[0];if(!file)return;
  try{
    const raw=JSON.parse(await file.text());const incoming=normalizeDb(raw);
    if(confirm(`Import ${incoming.goals.length} goals and ${incoming.tasks.length} tasks? This replaces all plans on this device.`)){
      db=incoming;saveData();ui.filter='all';navigate('/goals');toast('Backup restored');
    }
  }catch(err){alert('Could not import this file. Choose a valid GoalPath JSON backup.');console.warn(err);}
  event.target.value='';
});
// Native two-finger pinch changes the semantic zoom on the plan, while one-finger scrolling remains native.
let pinch=null;
function touchDistance(touches){return Math.hypot(touches[0].clientX-touches[1].clientX,touches[0].clientY-touches[1].clientY);}
document.addEventListener('touchstart',event=>{
  if(ui.screen==='plan'&&event.touches.length===2&&event.target.closest('.plan-viewport')){
    pinch={distance:touchDistance(event.touches),initial:ui.zoomByGoal[ui.goalId]??1};
  }
},{passive:true});
document.addEventListener('touchmove',event=>{
  if(!pinch)return;if(event.touches.length!==2)return;
  event.preventDefault();const next=clamp(Math.round(pinch.initial*(touchDistance(event.touches)/Math.max(1,pinch.distance))*100)/100,.6,1.5);
  ui.zoomByGoal[ui.goalId]=next;applyPlanZoom();
},{passive:false});
document.addEventListener('touchend',event=>{if(event.touches.length<2)pinch=null;},{passive:true});
window.addEventListener('resize',()=>{if(ui.screen==='plan')requestAnimationFrame(applyPlanZoom);});
window.addEventListener('hashchange',onRoute);
onRoute();
if('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(err=>console.warn('PWA offline cache unavailable',err)));
}

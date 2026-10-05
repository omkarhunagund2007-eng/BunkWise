const STORE="bunkwise_subjects";
const $=id=>document.getElementById(id);
let subjects=JSON.parse(localStorage.getItem(STORE)||"[]");

function fmt(n){return Math.round(n*100)/100}
function pct(a,t){return t>0?(a/t)*100:0}
function stats(A,T,R){
  const current=pct(A,T);
  let bunk=0, need=0;
  if(current>=R){
    bunk=Math.max(0,Math.floor(A/(R/100)-T));
    while(A*100<R*(T+bunk)&&bunk>0)bunk--;
    while(A*100>=R*(T+bunk+1))bunk++;
  }else{
    need=R>=100?Infinity:Math.ceil((R*T-100*A)/(100-R));
  }
  return {current,bunk,need,missed:T-A,status:current<R?"danger":bunk<=2?"careful":"safe"};
}
function save(){localStorage.setItem(STORE,JSON.stringify(subjects))}
function cls(s){return s==="danger"?"danger-text":s}
function status(s){return s==="safe"?"Safe":s==="careful"?"Careful":"Danger"}

document.addEventListener("DOMContentLoaded",()=>{
  $("menuBtn")?.addEventListener("click",()=>$("nav").classList.toggle("open"));
  renderDashboard();
});

function renderDashboard(){
  const all=subjects.map(x=>stats(x.attended,x.total,x.required));
  const avg=all.length?all.reduce((a,s)=>a+s.current,0)/all.length:0;
  if($("heroAvg"))$("heroAvg").textContent=all.length?fmt(avg)+"%":"—";
  if($("heroBar"))$("heroBar").style.width=Math.min(100,avg)+"%";
  if($("heroStatus"))$("heroStatus").textContent=all.length?(avg>=75?"Overall position is healthy.":"Your overall attendance needs attention."):"Add subjects to begin";
  if($("dashSubjects"))$("dashSubjects").textContent=all.length;
  if($("dashAverage"))$("dashAverage").textContent=all.length?fmt(avg)+"%":"—";
  if($("dashBunks"))$("dashBunks").textContent=all.reduce((a,s)=>a+s.bunk,0);
  if($("dashRisk"))$("dashRisk").textContent=all.filter(s=>s.status==="danger").length;
  if($("dashSubjectList"))$("dashSubjectList").innerHTML=subjects.length?subjects.slice(0,6).map((x,i)=>{
    const s=stats(x.attended,x.total,x.required);
    return `<div class="subject-item"><div class="subject-line"><b>${escapeHtml(x.name)}</b><span class="status ${cls(s.status)}">${fmt(s.current)}%</span></div><div class="progress"><div style="width:${Math.min(100,s.current)}%;background:${s.status==="danger"?"var(--danger)":s.status==="careful"?"var(--warn)":"var(--safe)"}"></div></div><small>${s.status==="danger"?`${s.need} classes needed`:s.bunk+" safe bunk(s) remaining"}</small></div>`
  }).join(""):`<div class="empty">No subjects yet. Add subjects from the Subjects page.</div>`;
}

function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}

window.initCalculator=function(){
  $("calculateBtn").onclick=()=>{
    const T=+$("total").value,A=+$("attended").value,R=+$("required").value;
    if(!T||A<0||A>T||!R||R>100){$("calcError").textContent="Enter valid values. Attended cannot exceed total.";return}
    $("calcError").textContent="";const s=stats(A,T,R);
    $("calcStatus").textContent=status(s.status);$("calcStatus").className="pill "+s.status;
    $("calcBig").textContent=s.status==="danger"?fmt(s.current)+"%":s.bunk;
    $("calcLabel").textContent=s.status==="danger"?"Current attendance":"classes you can safely bunk";
    $("calcBar").style.width=Math.min(100,s.current)+"%";
    $("calcBar").style.background=s.status==="danger"?"var(--danger)":s.status==="careful"?"var(--warn)":"var(--safe)";
    $("calcBarText").textContent=`Current ${fmt(s.current)}% · Required ${fmt(R)}%`;
    $("calcRows").innerHTML=`<p><b>Classes attended:</b> ${A}</p><p><b>Classes missed:</b> ${T-A}</p><p><b>Required:</b> ${R}%</p>`;
    $("calcMessage").textContent=s.status==="danger"?`Attend the next ${s.need} class${s.need===1?"":"es"} continuously to reach ${R}%.`:`You can miss at most ${s.bunk} more class${s.bunk===1?"":"es"} while staying at or above ${R}%.`;
  };
  $("whatifBtn").onclick=()=>{
    const T=+$("total").value,A=+$("attended").value,R=+$("required").value,n=+$("whatif").value;
    if(!T||A<0||A>T||n<0){$("whatifResult").textContent="Enter valid calculator values first.";return}
    const after=pct(A,T+n);$("whatifResult").innerHTML=`After missing <b>${n}</b> class${n===1?"":"es"}: <b>${fmt(after)}%</b> — ${after>=R?"still above the requirement.":"below the requirement."}`;
  };
}

window.initSubjects=function(){
  renderSubjects();
  $("addSubject").onclick=()=>{
    const name=$("subName").value.trim(),T=+$("subTotal").value,A=+$("subAttended").value,R=+$("subRequired").value;
    if(!name||!T||A<0||A>T||R<=0||R>100){$("subError").textContent="Enter valid subject details.";return}
    subjects.push({name,total:T,attended:A,required:R});save();renderSubjects();
    ["subName","subTotal","subAttended"].forEach(id=>$(id).value="");$("subError").textContent="";
  };
  $("clearSubjects").onclick=()=>{if(confirm("Delete all saved subjects?")){subjects=[];save();renderSubjects()}};
}
function renderSubjects(){
  const body=$("subjectTable");if(!body)return;
  $("subjectCount").textContent=subjects.length+" subject"+(subjects.length===1?"":"s");
  body.innerHTML=subjects.length?subjects.map((x,i)=>{const s=stats(x.attended,x.total,x.required);return `<tr><td><b>${escapeHtml(x.name)}</b><br><small>${x.attended}/${x.total} attended</small></td><td>${fmt(s.current)}%</td><td>${x.required}%</td><td>${s.bunk}</td><td class="status ${cls(s.status)}">${status(s.status)}</td><td><button class="btn danger" onclick="removeSubject(${i})">Delete</button></td></tr>`}).join(""):`<tr><td colspan="6" class="empty">No subjects added yet.</td></tr>`;
}
window.removeSubject=i=>{subjects.splice(i,1);save();renderSubjects()};

window.initPlanner=function(){
  $("planBtn").onclick=()=>{
    const T=+$("pTotal").value,A=+$("pAttended").value,R=+$("pRequired").value,F=+$("pFuture").value,AF=+$("pAttendFuture").value;
    if(!T||A<0||A>T||R<=0||R>100||F<0||AF<0||AF>F){$("planError").textContent="Enter a valid scenario. Future attended cannot exceed future classes.";return}
    $("planError").textContent="";const finalA=A+AF,finalT=T+F,projected=pct(finalA,finalT);
    const st=projected<R?"danger":projected-R<=3?"careful":"safe";
    $("planStatus").textContent=status(st);$("planStatus").className="pill "+st;$("planBig").textContent=fmt(projected)+"%";
    $("planBar").style.width=Math.min(100,projected)+"%";$("planBar").style.background=st==="danger"?"var(--danger)":st==="careful"?"var(--warn)":"var(--safe)";
    $("planRows").innerHTML=`<p><b>Projected attended:</b> ${finalA}</p><p><b>Projected total:</b> ${finalT}</p><p><b>Future missed:</b> ${F-AF}</p>`;
    $("planMessage").textContent=projected>=R?`This scenario keeps you above the ${R}% requirement.`:`This scenario leaves you below the ${R}% requirement. Change your plan.`;
  };
}

window.initAnalytics=function(){
  const all=subjects.map(x=>({...x,s:stats(x.attended,x.total,x.required)}));
  const avg=all.length?all.reduce((a,x)=>a+x.s.current,0)/all.length:0;
  $("anAvg").textContent=all.length?fmt(avg)+"%":"—";$("anBunks").textContent=all.reduce((a,x)=>a+x.s.bunk,0);
  const best=all.slice().sort((a,b)=>b.s.current-a.s.current)[0],worst=all.slice().sort((a,b)=>a.s.current-b.s.current)[0];
  $("anBest").textContent=best?best.name:"—";$("anWorst").textContent=worst?worst.name:"—";
  $("analyticsBars").innerHTML=all.length?all.map(x=>`<div class="bar-row"><div class="bar-meta"><span>${escapeHtml(x.name)}</span><span>${fmt(x.s.current)}% / ${x.required}%</span></div><div class="bar-track"><div style="width:${Math.min(100,x.s.current)}%;background:${x.s.status==="danger"?"var(--danger)":x.s.status==="careful"?"var(--warn)":"var(--accent)"}"></div></div></div>`).join(""):`<div class="empty">Add subjects to see analytics.</div>`;
  $("riskList").innerHTML=all.length?all.sort((a,b)=>a.s.current-b.s.current).map(x=>`<p><b>${escapeHtml(x.name)}</b> — <span class="${cls(x.s.status)}">${x.s.status==="danger"?`${x.s.need} classes needed`:x.s.bunk+" safe bunks"}</span></p>`).join(""):`<p class="muted">No subject data yet.</p>`;
}

window.initReport=function(){
  const build=()=>{
    const now=new Date();$("reportDate").textContent=now.toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"});
    $("reportProfile").innerHTML=`<p><b>Student:</b> ${escapeHtml($("studentName").value||"—")} &nbsp; <b>College:</b> ${escapeHtml($("collegeName").value||"—")} &nbsp; <b>Course:</b> ${escapeHtml($("courseName").value||"—")}</p>`;
    const all=subjects.map(x=>({...x,s:stats(x.attended,x.total,x.required)})),avg=all.length?all.reduce((a,x)=>a+x.s.current,0)/all.length:0;
    $("reportSummary").innerHTML=`<div class="summary-box"><small>Subjects</small><strong>${all.length}</strong></div><div class="summary-box"><small>Average</small><strong>${all.length?fmt(avg)+"%":"—"}</strong></div><div class="summary-box"><small>At risk</small><strong>${all.filter(x=>x.s.status==="danger").length}</strong></div>`;
    $("reportTable").innerHTML=all.length?all.map(x=>`<tr><td>${escapeHtml(x.name)}</td><td>${fmt(x.s.current)}%</td><td>${x.required}%</td><td>${x.s.bunk}</td><td class="${cls(x.s.status)}">${status(x.s.status)}</td></tr>`).join(""):`<tr><td colspan="5">No subjects added.</td></tr>`;
  };
  $("generateReport").onclick=build; $("printReport").onclick=()=>{build();window.print()}; build();
}

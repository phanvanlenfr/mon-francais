(function(){
  const el=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;};
  const today=new Date().toISOString().slice(0,10),ready=MFStore.readiness(),summary=MFStore.scoreSummary();
  document.querySelector("#readinessText").textContent=`${ready.level}${ready.weakest!=="—"?` • Ưu tiên ${ready.weakest}`:""}`;
  document.querySelector("#readinessPercent").textContent=`${ready.percent}%`;
  document.querySelector("#readinessBar").style.width=`${ready.percent}%`;
  const errors=MFStore.list("errors").filter(x=>!x.resolved&&x.reviewDate&&x.reviewDate<=today);
  document.querySelector("#dueErrors").textContent=`${errors.length} lỗi đến hạn`;
  const errorRoot=document.querySelector("#recentErrors");
  errors.slice(0,5).forEach(x=>errorRoot.append(el("span","",`${x.skill} • ${x.type}`)));
  if(!errors.length)errorRoot.append(el("small","","Không có lỗi đến hạn."));
  const plans=MFStore.list("plans").filter(x=>x.date===today&&!x.done);
  document.querySelector("#todayPlanCount").textContent=`${plans.length} nhiệm vụ`;
  const planRoot=document.querySelector("#todayPlan");
  plans.slice(0,5).forEach(x=>planRoot.append(el("span","",`${x.skill} • ${x.title}`)));
  if(!plans.length)planRoot.append(el("small","","Chưa có nhiệm vụ hôm nay."));
  const skills=document.querySelector("#dashboardSkills");
  ["CO","CE","PE","PO"].forEach(skill=>{const row=el("div");row.append(el("b","",skill),el("span","",`${summary[skill].average}/25`));if(summary[skill].average&&summary[skill].average<10)row.classList.add("warning");skills.append(row);});
})();

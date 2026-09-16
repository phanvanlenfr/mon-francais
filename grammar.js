const GRAMMAR_KEY = "mf-grammar-v1";
const starterGrammar = [
  "Subjonctif|Cách dùng và các thì", "COD / COI / Y / EN|Đại từ bổ ngữ trong câu",
  "Discours rapporté|Lời nói trực tiếp và gián tiếp", "Conditionnel|Giả định và lời khuyên",
  "Voix passive|Câu bị động", "Plus-que-parfait|Một hành động xảy ra trước quá khứ",
  "Cause, conséquence, but et opposition|Các quan hệ logic", "Comparatif et superlatif|So sánh hơn và cao nhất"
].map((value, index) => { const [name, description] = value.split("|"); return { id:`grammar-${index+1}`, name, description, theory:"", formula:"", example:"", explanation:"", exercises:[], answers:[], links:{sheet:"",doc:"",other:""}, completed:[] }; });
let grammarItems = MF.read(GRAMMAR_KEY, starterGrammar);
let openGrammarId = "";
const grammarCards = document.querySelector("#grammarCards");
const detail = document.querySelector("#grammarDetail");
const dialog = document.querySelector("#grammarDialog");

function renderGrammar() {
  grammarCards.replaceChildren();
  grammarItems.forEach((item, index) => {
    const card = MF.el("article", "library-card");
    const count = item.exercises?.length || 0;
    const done = item.completed?.filter(Boolean).length || 0;
    const percent = count ? Math.round(done / count * 100) : 0;
    const badge = MF.el("span", "number-badge", String(index + 1).padStart(2, "0"));
    const title = MF.el("h3", "", item.name);
    const desc = MF.el("p", "", item.description || "Chưa có mô tả");
    const meta = MF.el("small", "", `${count} bài tập • ${percent}% hoàn thành`);
    const bar = MF.el("div", "mini"); const fill = MF.el("span"); fill.style.width = `${percent}%`; bar.append(fill);
    const actions = MF.el("div", "card-actions");
    [["Mở bài học","open"],["Sửa","edit"],["Xóa","delete"]].forEach(([label, action]) => { const b=MF.el("button","",label); b.dataset.action=action;b.dataset.id=item.id;actions.append(b); });
    card.append(badge,title,desc,meta,bar,actions); grammarCards.append(card);
  });
  const add = MF.el("button", "add-card", "＋\nThêm chủ điểm ngữ pháp");
  add.addEventListener("click", () => openForm()); grammarCards.append(add);
}

function showDetail(id) {
  const item = grammarItems.find(entry => entry.id === id); if (!item) return;
  openGrammarId = id; detail.hidden = false; detail.replaceChildren();
  const close = MF.el("button", "detail-close", "×"); close.setAttribute("aria-label","Đóng bài học"); close.onclick=()=>{detail.hidden=true;openGrammarId="";};
  const title=MF.el("h2","",item.name); const desc=MF.el("p","lead",item.description||"");
  const columns=MF.el("div","lesson-columns");
  [["Lý thuyết",item.theory],["Công thức",item.formula],["Ví dụ",item.example],["Giải thích",item.explanation]].forEach(([heading,text])=>{const box=MF.el("section","lesson-box");box.append(MF.el("h3","",heading),MF.el("p","preline",text||"Chưa có nội dung."));columns.append(box);});
  const exercises=MF.el("section","exercise-list");exercises.append(MF.el("h3","",`Bài tập (${item.exercises.length})`));
  exercises.append(MF.el("small","",`Dạng bài: ${item.type||"Tự luận"}`));
  if (!item.exercises.length) exercises.append(MF.el("p","empty-copy","Hãy bấm Sửa để thêm bài tập."));
  item.exercises.forEach((text,index)=>{const row=MF.el("label","exercise-row");const check=document.createElement("input");check.type="checkbox";check.checked=Boolean(item.completed[index]);check.onchange=()=>{item.completed[index]=check.checked;save();};const copy=MF.el("span","",`${index+1}. ${text}`);const answer=MF.el("small","",item.answers[index]?`Đáp án: ${item.answers[index]}`:"Chưa có đáp án");row.append(check,copy,answer);exercises.append(row);});
  const links=MF.el("div","resource-links");[["▦ Google Sheets",item.links?.sheet],["▤ Google Docs",item.links?.doc],["▶ Tài liệu khác",item.links?.other]].forEach(([label,url])=>{if(url){const b=MF.el("button","",label);b.onclick=()=>MF.openUrl(url);links.append(b);}});
  detail.append(close,title,desc,columns,exercises,links); detail.scrollIntoView({behavior:"smooth",block:"start"});
}

function openForm(item=null){document.querySelector("#grammarFormTitle").textContent=item?"Sửa chủ điểm":"Thêm chủ điểm";document.querySelector("#grammarId").value=item?.id||"";document.querySelector("#grammarName").value=item?.name||"";document.querySelector("#grammarDescription").value=item?.description||"";document.querySelector("#grammarTheory").value=item?.theory||"";document.querySelector("#grammarFormula").value=item?.formula||"";document.querySelector("#grammarExample").value=item?.example||"";document.querySelector("#grammarExplanation").value=item?.explanation||"";document.querySelector("#grammarType").value=item?.type||"Tự luận";document.querySelector("#grammarExercises").value=(item?.exercises||[]).join("\n");document.querySelector("#grammarAnswers").value=(item?.answers||[]).join("\n");document.querySelector("#grammarSheet").value=item?.links?.sheet||"";document.querySelector("#grammarDoc").value=item?.links?.doc||"";document.querySelector("#grammarOther").value=item?.links?.other||"";dialog.showModal();}
function lines(id){return document.querySelector(id).value.split("\n").map(v=>v.trim()).filter(Boolean);}
function save(){MF.write(GRAMMAR_KEY,grammarItems);if(window.MFStore)MFStore.set("grammarTopics",grammarItems);renderGrammar();if(openGrammarId)showDetail(openGrammarId);}
document.querySelector("#grammarForm").addEventListener("submit",event=>{event.preventDefault();const name=document.querySelector("#grammarName").value.trim();if(!name)return MF.toast("Hãy nhập tên chủ điểm");const id=document.querySelector("#grammarId").value||MF.uid("grammar");const old=grammarItems.find(x=>x.id===id);const item={id,name,description:document.querySelector("#grammarDescription").value.trim(),theory:document.querySelector("#grammarTheory").value.trim(),formula:document.querySelector("#grammarFormula").value.trim(),example:document.querySelector("#grammarExample").value.trim(),explanation:document.querySelector("#grammarExplanation").value.trim(),type:document.querySelector("#grammarType").value,exercises:lines("#grammarExercises"),answers:lines("#grammarAnswers"),links:{sheet:MF.validUrl(document.querySelector("#grammarSheet").value),doc:MF.validUrl(document.querySelector("#grammarDoc").value),other:MF.validUrl(document.querySelector("#grammarOther").value)},completed:old?.completed||[]};const index=grammarItems.findIndex(x=>x.id===id);if(index>=0)grammarItems[index]=item;else grammarItems.push(item);save();dialog.close();MF.toast("Đã lưu chủ điểm");});
grammarCards.addEventListener("click",event=>{const button=event.target.closest("button[data-action]");if(!button)return;const item=grammarItems.find(x=>x.id===button.dataset.id);if(button.dataset.action==="open")showDetail(item.id);if(button.dataset.action==="edit")openForm(item);if(button.dataset.action==="delete"&&confirm(`Xóa chủ điểm “${item.name}”?`)){grammarItems=grammarItems.filter(x=>x.id!==item.id);detail.hidden=true;save();}});
document.querySelector("#addGrammar").onclick=()=>openForm();document.querySelector("[data-close]").onclick=()=>dialog.close();document.querySelector("#exportGrammar").onclick=()=>MF.exportJson("mon-francais-grammar.json",grammarItems);document.querySelector("#importGrammar").onchange=e=>MF.importJson(e.target.files[0],data=>{if(!Array.isArray(data))return MF.toast("Dữ liệu không đúng cấu trúc");grammarItems=data;save();MF.toast("Đã nhập dữ liệu");});renderGrammar();

const STORAGE = "mon-francais-github-v2";
const SHEET_ID = "1YFaJsXJTqSx6uHM-JiE21w3QQ0O2eGNzHn74Jk4L0ME";
const DEFAULT_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`;
const defaults = {
  seconds: 0,
  timerMode: "up",
  countdownTotal: 1500,
  countdownLeft: 1500,
  sheetUrl: DEFAULT_SHEET_URL,
  words: [],
  tasks: [
    { id: 1, label: "Học 20 từ vựng mới", done: false },
    { id: 2, label: "Làm bài tập ngữ pháp Subjonctif", done: false },
    { id: 3, label: "Nghe podcast tiếng Pháp 15 phút", done: false },
    { id: 4, label: "Viết một đoạn văn ngắn 100 từ", done: false },
    { id: 5, label: "Luyện nói mô tả ngày của bạn 5 phút", done: false }
  ]
};

let state = { ...structuredClone(defaults), ...(JSON.parse(localStorage.getItem(STORAGE) || "null") || {}) };
let tick = null;
let selected = "";
const $ = selector => document.querySelector(selector);
const save = () => localStorage.setItem(STORAGE, JSON.stringify(state));

function toast(text) {
  const element = $("#toast");
  element.textContent = text;
  element.classList.add("show");
  setTimeout(() => element.classList.remove("show"), 2600);
}

function format(seconds) {
  return [Math.floor(seconds / 3600), Math.floor(seconds % 3600 / 60), seconds % 60]
    .map(value => String(value).padStart(2, "0")).join(":");
}

function renderTimer() {
  const isCountdown = state.timerMode === "down";
  const shown = isCountdown ? state.countdownLeft : state.seconds;
  const percent = isCountdown
    ? Math.max(0, Math.min(100, Math.round((1 - state.countdownLeft / Math.max(1, state.countdownTotal)) * 100)))
    : Math.min(100, Math.round(state.seconds / 7200 * 100));
  $("#timer").textContent = format(shown);
  $("#studyPercent").textContent = `${percent}%`;
  $("#studyBar").style.width = `${percent}%`;
  $("#countUpMode").classList.toggle("selected", !isCountdown);
  $("#countDownMode").classList.toggle("selected", isCountdown);
  $("#countdownSetting").hidden = !isCountdown;
}

function stopTimer() {
  clearInterval(tick);
  tick = null;
  save();
}

function startTimer() {
  if (tick) return;
  if (state.timerMode === "down" && state.countdownLeft <= 0) state.countdownLeft = state.countdownTotal;
  tick = setInterval(() => {
    if (state.timerMode === "up") {
      state.seconds += 1;
    } else {
      state.countdownLeft = Math.max(0, state.countdownLeft - 1);
      if (state.countdownLeft === 0) {
        stopTimer();
        toast("Hết thời gian học. Bravo !");
      }
    }
    renderTimer();
    save();
  }, 1000);
  toast(state.timerMode === "up" ? "Đã bắt đầu tính thời gian" : "Đã bắt đầu đếm ngược");
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[char]);
}

function renderWords(message = "") {
  const grid = $("#wordGrid");
  if (!state.words.length) {
    grid.innerHTML = `<div class="empty-state">${escapeHtml(message || "Chọn ngày để tải từ vựng từ Google Sheets.")}</div>`;
  } else {
    grid.innerHTML = state.words.map((word, index) => `
      <article class="word ${["violet", "orange", "blue", "green"][index % 4]}">
        <button class="audio" data-speak="${word.id}" aria-label="Phát âm">🔊</button>
        <h3>${escapeHtml(word.word)}</h3>
        <b>${escapeHtml(word.meaning)}</b><hr>
        <p><i>Exemple:</i> ${escapeHtml(word.example || "Chưa có ví dụ")}</p>
        <button class="learned ${word.learned ? "yes" : ""}" data-learn="${word.id}">${word.learned ? "✓" : "i"}</button>
      </article>`).join("");
  }
  $("#wordCount").textContent = `${state.words.filter(word => word.learned).length}/${state.words.length} từ đã thuộc`;
}

function gvizDateToIso(value) {
  if (!value) return "";
  const match = String(value).match(/^Date\((\d+),(\d+),(\d+)\)$/);
  if (match) return `${match[1]}-${String(Number(match[2]) + 1).padStart(2, "0")}-${match[3].padStart(2, "0")}`;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

async function loadWordsByDate() {
  const chosenDate = $("#vocabDate").value;
  if (!chosenDate) return toast("Hãy chọn ngày cần xem từ vựng");
  const month = Number(chosenDate.slice(5, 7));
  if (month < 6 || month > 12) {
    state.words = [];
    renderWords("Sheet hiện có các trang T6 đến T12. Hãy chọn ngày từ tháng 6 đến tháng 12.");
    return;
  }

  const button = $("#loadWords");
  button.disabled = true;
  button.textContent = "Đang tải…";
  try {
    const tab = `T${month}`;
    const endpoint = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(tab)}&headers=1&t=${Date.now()}`;
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error("Không đọc được Sheet");
    const text = await response.text();
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start < 0 || end < 0) throw new Error("Dữ liệu Sheet không hợp lệ");
    const data = JSON.parse(text.slice(start, end + 1));
    const previousLearned = new Set(state.words.filter(word => word.learned).map(word => `${word.word}|${word.date}`));
    state.words = (data.table.rows || []).map((row, index) => {
      const cells = row.c || [];
      const date = gvizDateToIso(cells[9]?.v);
      const word = cells[1]?.v == null ? "" : String(cells[1].v).trim();
      return {
        id: `${chosenDate}-${index}`,
        word,
        meaning: cells[3]?.v == null ? "" : String(cells[3].v).trim(),
        example: cells[4]?.v == null ? "" : String(cells[4].v).trim(),
        date,
        learned: previousLearned.has(`${word}|${date}`)
      };
    }).filter(item => item.word && item.date === chosenDate);
    save();
    renderWords(state.words.length ? "" : `Không có từ vựng nào ở cột J cho ngày ${chosenDate}.`);
    toast(state.words.length ? `Đã tải ${state.words.length} từ vựng` : "Ngày này chưa có từ vựng");
  } catch (error) {
    state.words = [];
    renderWords("Không thể tải Sheet. Hãy đặt quyền: Bất kỳ ai có liên kết đều có thể xem.");
    toast("Không thể đọc Google Sheets công khai");
  } finally {
    button.disabled = false;
    button.textContent = "Hiển thị từ vựng";
  }
}

function renderTasks() {
  const done = state.tasks.filter(task => task.done).length;
  $("#taskCount").textContent = `${done} / ${state.tasks.length} đã hoàn thành`;
  $("#taskBar").style.width = `${state.tasks.length ? done / state.tasks.length * 100 : 0}%`;
  $("#taskList").innerHTML = state.tasks.map(task => `
    <label><input type="checkbox" data-task="${task.id}" ${task.done ? "checked" : ""}>
    <span class="${task.done ? "done" : ""}">${escapeHtml(task.label)}</span></label>`).join("");
}

function speak(word) {
  if (!("speechSynthesis" in window)) return toast("Trình duyệt chưa hỗ trợ phát âm");
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(`${word.word}. ${word.example}`);
  utterance.lang = "fr-FR";
  utterance.rate = 0.88;
  speechSynthesis.speak(utterance);
}

const grammar = [
  ["Subjonctif", "Cách dùng và các thì"],
  ["COD / COI / Y / EN", "Đại từ bổ ngữ trong câu"],
  ["Discours rapporté", "Lời nói gián tiếp"]
];
const skills = [["CO", "Nghe"], ["CE", "Đọc"], ["PE", "Viết"], ["PO", "Nói"]];

function init() {
  const now = new Date();
  const hour = now.getHours();
  $("#greeting").textContent = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";
  $("#today").textContent = new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(now);
  $("#sheetUrl").value = state.sheetUrl || DEFAULT_SHEET_URL;
  $("#vocabDate").value = now.toISOString().slice(0, 10);
  $("#countdownMinutes").value = Math.round(state.countdownTotal / 60);
  $("#grammarGrid").innerHTML = grammar.map(item => `
    <article class="grammar"><div class="symbol">▤</div><div class="copy">
      <h3>${item[0]}</h3><p>${item[1]}</p><div class="mini"><span style="width:0%"></span></div>
      <small>0 / 0 bài</small></div><button data-quiz>Luyện tập ›</button></article>`).join("");
  $("#skills").innerHTML = skills.map(item => `
    <div class="skill"><div class="row"><b>${item[0]}</b><span>— ${item[1]}</span><strong>0%</strong></div>
    <div class="mini"><span style="width:0%"></span></div><small>0 / 0 bài</small></div>`).join("");
  renderTimer();
  renderWords();
  renderTasks();
}

$("#startBtn").onclick = startTimer;
$("#pauseBtn").onclick = () => { stopTimer(); toast("Đã tạm dừng"); };
$("#resetBtn").onclick = () => {
  if (!confirm("Đặt lại đồng hồ hiện tại?")) return;
  stopTimer();
  if (state.timerMode === "up") state.seconds = 0;
  else state.countdownLeft = state.countdownTotal;
  save();
  renderTimer();
};
$("#countUpMode").onclick = () => { stopTimer(); state.timerMode = "up"; save(); renderTimer(); };
$("#countDownMode").onclick = () => { stopTimer(); state.timerMode = "down"; save(); renderTimer(); };
$("#applyCountdown").onclick = () => {
  const minutes = Math.round(Number($("#countdownMinutes").value));
  if (!Number.isFinite(minutes) || minutes < 1 || minutes > 480) return toast("Nhập từ 1 đến 480 phút");
  stopTimer();
  state.countdownTotal = minutes * 60;
  state.countdownLeft = state.countdownTotal;
  save();
  renderTimer();
  toast(`Đã đặt đếm ngược ${minutes} phút`);
};
$("#loadWords").onclick = loadWordsByDate;
$("#sheetUrl").onchange = event => { state.sheetUrl = event.target.value.trim(); save(); toast("Đã lưu liên kết"); };
$("#sheetBtn").onclick = () => window.open(state.sheetUrl || DEFAULT_SHEET_URL, "_blank", "noopener");

document.addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.close) $("#" + button.dataset.close).close();
  if (button.dataset.speak) speak(state.words.find(word => word.id === button.dataset.speak));
  if (button.dataset.learn) {
    const word = state.words.find(item => item.id === button.dataset.learn);
    if (word) word.learned = !word.learned;
    save();
    renderWords();
  }
  if (button.hasAttribute("data-quiz")) {
    $("#quizModal").showModal();
    selected = "";
    $("#quizResult").textContent = "";
    document.querySelectorAll(".answers button").forEach(item => item.classList.remove("selected"));
  }
});

document.addEventListener("change", event => {
  if (!event.target.dataset.task) return;
  const task = state.tasks.find(item => item.id == event.target.dataset.task);
  if (task) task.done = event.target.checked;
  save();
  renderTasks();
});

document.querySelectorAll(".answers button").forEach(button => button.onclick = () => {
  selected = button.textContent;
  document.querySelectorAll(".answers button").forEach(item => item.classList.remove("selected"));
  button.classList.add("selected");
});
$("#checkAnswer").onclick = () => {
  const correct = selected === "fasses";
  $("#quizResult").textContent = correct ? "Chính xác !" : "Đáp án đúng là « fasses ».";
  $("#quizResult").className = correct ? "correct" : "wrong";
};
$("#menuBtn").onclick = () => $("#sidebar").classList.toggle("open");

init();

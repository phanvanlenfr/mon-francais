const MF = (() => {
  const SHEET_ID = "1YFaJsXJTqSx6uHM-JiE21w3QQ0O2eGNzHn74Jk4L0ME";
  const SHEET_TAB = "T6";

  function el(tag, className = "", text = "") {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== "") node.textContent = text;
    return node;
  }

  function toast(message) {
    let node = document.querySelector("#toast");
    if (!node) {
      node = el("div");
      node.id = "toast";
      node.setAttribute("role", "status");
      document.body.append(node);
    }
    node.textContent = message;
    node.classList.add("show");
    window.clearTimeout(node._timer);
    node._timer = window.setTimeout(() => node.classList.remove("show"), 2600);
  }

  function read(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value == null ? structuredClone(fallback) : value;
    } catch (_) {
      return structuredClone(fallback);
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function uid(prefix = "item") {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function validUrl(value) {
    if (!value) return "";
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch (_) { return ""; }
  }

  function openUrl(value) {
    const url = validUrl(value);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
    else toast("Liên kết chưa hợp lệ");
  }

  function exportJson(filename, payload) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function importJson(file, onData) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { onData(JSON.parse(reader.result)); }
      catch (_) { toast("Tệp JSON không hợp lệ"); }
    };
    reader.readAsText(file);
  }

  function setupShell() {
    const menu = document.querySelector("#menuBtn");
    const sidebar = document.querySelector("#sidebar");
    if (menu && sidebar) menu.addEventListener("click", () => sidebar.classList.toggle("open"));
    const date = document.querySelector("#pageDate");
    if (date) date.textContent = new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
  }

  function gvizDateToIso(value) {
    if (!value) return "";
    const match = String(value).match(/^Date\((\d+),(\d+),(\d+)\)$/);
    if (match) return `${match[1]}-${String(Number(match[2]) + 1).padStart(2, "0")}-${match[3].padStart(2, "0")}`;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  async function fetchVocabulary(date = "") {
    const endpoint = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_TAB)}&headers=1&t=${Date.now()}`;
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error("sheet");
    const raw = await response.text();
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start < 0 || end < 0) throw new Error("format");
    const data = JSON.parse(raw.slice(start, end + 1));
    return (data.table.rows || []).map((row, index) => {
      const cells = row.c || [];
      return {
        id: `sheet-${index}`,
        word: String(cells[1]?.v ?? "").trim(),
        partOfSpeech: String(cells[2]?.v ?? "").trim(),
        meaning: String(cells[3]?.v ?? "").trim(),
        example: String(cells[4]?.v ?? "").trim(),
        exampleTranslation: String(cells[5]?.v ?? "").trim(),
        date: gvizDateToIso(cells[9]?.v)
      };
    }).filter(item => item.word && (!date || item.date === date));
  }

  function speak(text) {
    if (!("speechSynthesis" in window)) return toast("Trình duyệt chưa hỗ trợ phát âm");
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.rate = 0.88;
    speechSynthesis.speak(utterance);
  }

  document.addEventListener("DOMContentLoaded", setupShell);
  return { el, toast, read, write, uid, validUrl, openUrl, exportJson, importJson, fetchVocabulary, speak };
})();

(() => {
  const KEY = "jobcontrol.jobs.v1";
  const $ = id => document.getElementById(id);
  let jobs = load();
  const fields = ["employer","address","salary","days","hours","interview","internship"];
  const labels = ["Работодатель","Адрес","Зарплата","Дней в неделю","Часов в смене","Собеседование","Стажировка"];
  function load(){ try { const value = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(value) ? value : []; } catch { return []; } }
  function save(){ localStorage.setItem(KEY, JSON.stringify(jobs)); }
  function safe(value){ return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function date(value){ if(!value) return "—"; const d = new Date(value); return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("ru-RU",{dateStyle:"short",timeStyle:"short"}); }
  function openForm(job){
    $("jobForm").reset(); $("jobId").value = job?.id || "";
    $("formTitle").textContent = job ? "Редактировать предложение" : "Новое предложение";
    fields.forEach(k => { if(job) $(k).value = job[k] ?? ""; });
    $("modal").hidden = false; $("employer").focus();
  }
  function closeForm(){ $("modal").hidden = true; }
  function renderList(){
    const root = $("jobsList");
    if(!jobs.length){ root.innerHTML = '<div class="empty">Пока нет предложений.<br>Добавьте первого работодателя.</div>'; return; }
    root.innerHTML = jobs.map(j => `<article class="job">
      <div><h3>${safe(j.employer)}</h3><div class="meta">${safe(j.salary)} · ${safe(j.days)} дн. × ${safe(j.hours)} ч.</div><div class="meta">${safe(j.address)}</div><div class="meta">Собеседование: ${safe(date(j.interview))} · Стажировка: ${safe(date(j.internship))}</div></div>
      <div class="job-actions"><button class="secondary" data-edit="${safe(j.id)}" aria-label="Редактировать">✎</button><button class="danger" data-delete="${safe(j.id)}" aria-label="Удалить">×</button></div>
    </article>`).join("");
    root.querySelectorAll("[data-edit]").forEach(b => b.addEventListener("click", () => openForm(jobs.find(j => j.id === b.dataset.edit))));
    root.querySelectorAll("[data-delete]").forEach(b => b.addEventListener("click", () => {
      const job = jobs.find(j => j.id === b.dataset.delete);
      if(job && confirm(`Удалить предложение «${job.employer}»?`)){ jobs = jobs.filter(j => j.id !== job.id); save(); render(); }
    }));
  }
  function renderCompare(){
    const root = $("comparison");
    if(!jobs.length){ root.innerHTML = '<div class="empty">Добавьте предложения, чтобы сравнить зарплату и график.</div>'; return; }
    const head = jobs.map(j => `<th>${safe(j.employer)}</th>`).join("");
    const row = (label, fn) => `<tr><td>${label}</td>${jobs.map(j => `<td>${safe(fn(j))}</td>`).join("")}</tr>`;
    root.innerHTML = `<div class="compare-wrap"><table><thead><tr><th>Показатель</th>${head}</tr></thead><tbody>
      ${row("Зарплата",j=>j.salary)}
      ${row("График",j=>`${j.days} дн. × ${j.hours} ч.`)}
    </tbody></table></div>`;
  }
  function render(){ renderList(); renderCompare(); }
  $("addBtn").addEventListener("click", () => openForm());
  $("cancelBtn").addEventListener("click", closeForm);
  $("modal").addEventListener("click", e => { if(e.target === $("modal")) closeForm(); });
  $("jobForm").addEventListener("submit", e => {
    e.preventDefault();
    const id = $("jobId").value || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()));
    const data = {id}; fields.forEach(k => data[k] = $(k).value.trim());
    const index = jobs.findIndex(j => j.id === id);
    if(index >= 0) jobs[index] = data; else jobs.push(data);
    save(); closeForm(); render();
  });
  document.querySelectorAll(".tab").forEach(tab => tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t === tab));
    $("listView").hidden = tab.dataset.view !== "list";
    $("compareView").hidden = tab.dataset.view !== "compare";
  }));
  render();
})();
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) { window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {})); }

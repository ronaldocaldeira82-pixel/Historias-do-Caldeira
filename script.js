const stories = [
  {
    id: "norris-1",
    series: "Texugo Norris",
    title: "Capítulo 1 — O início da aventura",
    description: "Uma primeira aventura do texugo mais tranquilo e sarcástico do mundo.",
    icon: "🦡",
    pages: [
      ["O DIA DE NORRIS", "Norris começa mais um dia em sua toca."],
      ["UM LANCHINHO", "Uma descoberta inesperada muda os planos."],
      ["E ASSIM TERMINA O DIA", "Por enquanto... porque amanhã tem mais."]
    ]
  },
  {
    id: "leo-1",
    series: "Jacaré Léo",
    title: "Capítulo 1 — À beira do rio",
    description: "Vida no rio, amigos e um passado que ainda aparece.",
    icon: "🐊",
    pages: [
      ["O RIO", "Léo observa o movimento da água."],
      ["UM ENCONTRO", "Uma visita inesperada aparece por perto."],
      ["AO ANOITECER", "O rio fica silencioso novamente."]
    ]
  },
  {
    id: "hive-1",
    series: "A Colmeia do Rio",
    title: "Capítulo 1 — A colmeia",
    description: "Pequenos seres, grandes histórias e muita movimentação.",
    icon: "🐝",
    pages: [
      ["A COLMEIA", "As abelhas trabalham sem parar."],
      ["O ALVOROÇO", "Algo se aproxima da colmeia."],
      ["DEFESA", "A colmeia inteira entra em ação."]
    ]
  },
  {
    id: "asteroid-1",
    series: "O Asteroide",
    title: "Capítulo 1 — O céu muda",
    description: "Um asteroide se aproxima sem ser percebido.",
    icon: "☄️",
    pages: [
      ["SEM AVISO", "Um asteroide vem para a Terra sem ser percebido."],
      ["A FUMAÇA", "Ele não traz apenas uma potencial destruição: sua fumaça tóxica se espalha pelo espaço."],
      ["A APROXIMAÇÃO", "Agora ele entra na atmosfera."]
    ]
  }
];

const STORAGE = "historias-caldeira-stats-v1";
let stats = JSON.parse(localStorage.getItem(STORAGE) || "null") || {
  siteViews: 0,
  sessions: 0,
  totalSeconds: 0,
  stories: Object.fromEntries(stories.map(s => [s.id, {views: 0, seconds: 0, sessions: 0}]))
};

let sessionStart = Date.now();
let activeStory = null;
let storyStart = null;
let currentPage = 0;

function saveStats() {
  localStorage.setItem(STORAGE, JSON.stringify(stats));
  renderStats();
}

function formatTime(seconds) {
  if (!seconds || seconds < 60) return `${Math.round(seconds || 0)} s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m} min ${String(s).padStart(2,"0")} s`;
}

function renderStats() {
  const visitors = Math.max(stats.sessions, 1);
  const avg = stats.sessions ? stats.totalSeconds / stats.sessions : 0;
  document.querySelector("#siteVisitors").textContent = visitors.toLocaleString("pt-BR");
  document.querySelector("#siteViews").textContent = stats.siteViews.toLocaleString("pt-BR");
  document.querySelector("#siteAvg").textContent = formatTime(avg);

  const rows = [
    `<div class="stats-row head"><span>História</span><span>Visualizações</span><span class="optional">Sessões</span><span class="optional">Tempo médio</span></div>`
  ];
  stories.forEach(s => {
    const x = stats.stories[s.id];
    const avgStory = x.sessions ? x.seconds / x.sessions : 0;
    rows.push(`<div class="stats-row"><span>${s.title}</span><span>${x.views}</span><span class="optional">${x.sessions}</span><span class="optional">${formatTime(avgStory)}</span></div>`);
  });
  document.querySelector("#statsTable").innerHTML = rows.join("");
}

function renderStories() {
  document.querySelector("#storyCards").innerHTML = stories.map(s => `
    <article class="card">
      <div class="card-cover">
        <h3>${s.series}<br><span>${s.title.split("—")[0].trim()}</span></h3>
        <span class="emoji">${s.icon}</span>
      </div>
      <div class="card-body">
        <p>${s.description}</p>
        <button class="button small read-story" data-id="${s.id}">Ler →</button>
      </div>
    </article>
  `).join("");

  document.querySelectorAll(".read-story").forEach(btn => {
    btn.addEventListener("click", () => openReader(btn.dataset.id));
  });
}

function openReader(id) {
  const story = stories.find(s => s.id === id);
  if (!story) return;
  activeStory = story;
  currentPage = 0;
  storyStart = Date.now();
  stats.siteViews++;
  stats.stories[id].views++;
  stats.stories[id].sessions++;
  saveStats();
  document.querySelector("#readerSeries").textContent = story.series;
  document.querySelector("#readerTitle").textContent = story.title;
  document.querySelector("#reader").classList.add("open");
  document.querySelector("#reader").setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
  renderPage();
}

function renderPage() {
  const page = activeStory.pages[currentPage];
  document.querySelector("#readerPages").innerHTML = `
    <article class="comic-page">
      <div class="panel">${page[0]}</div>
      <p class="caption">${page[1]}</p>
    </article>
  `;
  document.querySelector("#pageCounter").textContent = `${currentPage + 1} / ${activeStory.pages.length}`;
  document.querySelector("#prevPage").disabled = currentPage === 0;
  document.querySelector("#nextPage").disabled = currentPage === activeStory.pages.length - 1;
}

function closeReader() {
  if (activeStory && storyStart) {
    const seconds = Math.max(1, Math.round((Date.now() - storyStart) / 1000));
    stats.totalSeconds += seconds;
    stats.stories[activeStory.id].seconds += seconds;
    saveStats();
  }
  activeStory = null;
  storyStart = null;
  document.querySelector("#reader").classList.remove("open");
  document.querySelector("#reader").setAttribute("aria-hidden","true");
  document.body.style.overflow = "";
}

document.querySelector("#nextPage").addEventListener("click", () => {
  if (!activeStory || currentPage >= activeStory.pages.length - 1) return;
  currentPage++;
  renderPage();
});
document.querySelector("#prevPage").addEventListener("click", () => {
  if (!activeStory || currentPage <= 0) return;
  currentPage--;
  renderPage();
});
document.querySelector("#closeReader").addEventListener("click", closeReader);
document.querySelector("#reader").addEventListener("click", e => {
  if (e.target.id === "reader") closeReader();
});
document.addEventListener("keydown", e => {
  if (!activeStory) return;
  if (e.key === "Escape") closeReader();
  if (e.key === "ArrowRight") document.querySelector("#nextPage").click();
  if (e.key === "ArrowLeft") document.querySelector("#prevPage").click();
});

document.querySelector("#resetStats").addEventListener("click", () => {
  if (!confirm("Zerar as estatísticas desta cópia do site?")) return;
  localStorage.removeItem(STORAGE);
  location.reload();
});

document.querySelector("#menuButton").addEventListener("click", () => {
  document.querySelector("#mainNav").classList.toggle("open");
});
document.querySelectorAll(".nav a").forEach(a => a.addEventListener("click", () => document.querySelector("#mainNav").classList.remove("open")));

window.addEventListener("beforeunload", () => {
  const seconds = Math.max(0, Math.round((Date.now() - sessionStart) / 1000));
  stats.totalSeconds += seconds;
  saveStats();
});

if (!sessionStorage.getItem("caldeira-session")) {
  sessionStorage.setItem("caldeira-session", "1");
  stats.sessions++;
  saveStats();
} else {
  renderStats();
}

renderStories();
document.querySelector("#year").textContent = new Date().getFullYear();

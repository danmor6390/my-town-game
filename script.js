const WORDS = [
  { w: "shop", e: "🛍️" },
  { w: "police station", e: "🚓" },
  { w: "cinema", e: "🎬" },
  { w: "cafe", e: "☕" },
  { w: "hospital", e: "🏥" },
  { w: "town square", e: "⛲" },
  { w: "sports centre", e: "🏟️" },
  { w: "pharmacy", e: "💊" },
];

function speak(text) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-GB";
  u.rate = 0.85;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

const board = document.getElementById("board");
const modeBtns = document.querySelectorAll(".mode-btn");
let mode = "learn";

modeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    mode = btn.dataset.mode;
    modeBtns.forEach((b) => b.classList.toggle("active", b === btn));
    render();
  });
});

function render() {
  if (mode === "learn") renderLearn();
  else startQuiz(mode === "listen");
}

function renderLearn() {
  board.innerHTML = "";
  const grid = document.createElement("div");
  grid.className = "grid learn";
  WORDS.forEach((x) => {
    const card = document.createElement("button");
    card.className = "card-tile";
    card.innerHTML = `
      <span class="emoji">${x.e}</span>
      <span class="word">${x.w}</span>
      <span class="hint">🔊 tap</span>`;
    card.addEventListener("click", () => speak(x.w));
    grid.appendChild(card);
  });
  board.appendChild(grid);
}

function startQuiz(listen) {
  const state = {
    order: shuffle(WORDS),
    i: 0,
    score: 0,
    picked: null,
  };

  function renderQuestion() {
    const cur = state.order[state.i];
    board.innerHTML = "";

    if (!cur) {
      const trophy = state.score >= 7 ? "🏆" : state.score >= 5 ? "⭐" : "💪";
      const res = document.createElement("div");
      res.className = "result";
      res.innerHTML = `
        <p class="trophy">${trophy}</p>
        <p class="score">${state.score} / ${WORDS.length}</p>`;
      const again = document.createElement("button");
      again.className = "again-btn";
      again.textContent = "Play again";
      again.addEventListener("click", () => {
        state.order = shuffle(WORDS);
        state.i = 0;
        state.score = 0;
        state.picked = null;
        renderQuestion();
      });
      res.appendChild(again);
      board.appendChild(res);
      return;
    }

    const options = shuffle([
      cur,
      ...shuffle(WORDS.filter((x) => x.w !== cur.w)).slice(0, 3),
    ]);

    const quiz = document.createElement("div");
    quiz.className = "quiz";

    const progress = document.createElement("p");
    progress.className = "progress";
    progress.textContent = `${state.i + 1} / ${WORDS.length} · ⭐ ${state.score}`;
    quiz.appendChild(progress);

    if (listen) {
      const listenBtn = document.createElement("button");
      listenBtn.className = "listen-btn";
      listenBtn.textContent = "🔊 Listen";
      listenBtn.addEventListener("click", () => speak(cur.w));
      quiz.appendChild(listenBtn);

      const q = document.createElement("p");
      q.className = "question";
      q.textContent = "Where is it? Click the picture.";
      quiz.appendChild(q);
    } else {
      const big = document.createElement("p");
      big.className = "big-emoji";
      big.textContent = cur.e;
      quiz.appendChild(big);

      const q = document.createElement("p");
      q.className = "question";
      q.textContent = "What place is it?";
      quiz.appendChild(q);
    }

    const grid = document.createElement("div");
    grid.className = "grid options";

    const feedback = document.createElement("p");
    feedback.className = "feedback";

    function choose(w, card) {
      if (state.picked) return;
      state.picked = w;
      if (w === cur.w) state.score += 1;
      speak(cur.w);

      grid.querySelectorAll(".card-tile").forEach((c) => {
        if (c.dataset.word === cur.w) c.classList.add("ok");
        else if (c.dataset.word === w) c.classList.add("bad");
        if (listen) {
          const label = document.createElement("span");
          label.className = "word";
          label.textContent = c.dataset.word;
          c.appendChild(label);
        }
      });

      feedback.textContent =
        w === cur.w ? "✅ Well done!" : "❌ Try again next time!";

      setTimeout(() => {
        state.picked = null;
        state.i += 1;
        renderQuestion();
      }, 1300);
    }

    options.forEach((o) => {
      const card = document.createElement("button");
      card.className = "card-tile" + (listen ? "" : " word-only");
      card.dataset.word = o.w;
      card.innerHTML = listen
        ? `<span class="emoji">${o.e}</span>`
        : o.w;
      card.addEventListener("click", () => choose(o.w, card));
      grid.appendChild(card);
    });

    quiz.appendChild(grid);
    quiz.appendChild(feedback);
    board.appendChild(quiz);
  }

  renderQuestion();
}

render();

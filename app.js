const MODE_LABELS = {
  codefill: "程序填空",
  fill: "填空题",
  single: "单选题",
  judge: "判断题",
  program: "程序题",
};

const CHOICE_DISPLAY_LABELS = ["A", "B", "C", "D", "E", "F"];

const state = {
  data: null,
  currentMode: null,
  currentList: [],
  currentIndex: 0,
  revealState: false,
  wrongOnly: false,
  unfinishedOnly: false,
  singleChoiceOrders: {},
  questionOrders: {},
};

const storageKey = "quiz-web-progress-v2";

const homeView = document.getElementById("homeView");
const practiceView = document.getElementById("practiceView");
const modeTitle = document.getElementById("modeTitle");
const progressText = document.getElementById("progressText");
const questionTitle = document.getElementById("questionTitle");
const questionMeta = document.getElementById("questionMeta");
const questionBody = document.getElementById("questionBody");
const feedbackPanel = document.getElementById("feedbackPanel");
const programComposer = document.getElementById("programComposer");
const programAnswer = document.getElementById("programAnswer");
const programAnswerPanel = document.getElementById("programAnswerPanel");
const primaryAction = document.getElementById("primaryAction");
const prevAction = document.getElementById("prevAction");
const markQuestionButton = document.getElementById("markQuestionButton");
const wrongOnlyButton = document.getElementById("wrongOnlyButton");
const unfinishedOnlyButton = document.getElementById("unfinishedOnlyButton");
const allQuestionsButton = document.getElementById("allQuestionsButton");
const homeShortcut = document.getElementById("homeShortcut");
const programMarkWrong = document.getElementById("programMarkWrong");
const questionShuffleWrap = document.getElementById("questionShuffleWrap");
const shuffleQuestionOrderToggle = document.getElementById("shuffleQuestionOrderToggle");
const shuffleToggleWrap = document.getElementById("shuffleToggleWrap");
const shuffleOptionsToggle = document.getElementById("shuffleOptionsToggle");
const navigatorSummary = document.getElementById("navigatorSummary");
const questionNavigator = document.getElementById("questionNavigator");

const progressStore = ensureProgressDefaults(loadProgress());

init().catch((error) => {
  console.error(error);
  questionBody.innerHTML = "<p>加载题库失败，请刷新重试。</p>";
});

async function init() {
  const response = await fetch("./data/questions.json");
  state.data = await response.json();

  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => startMode(button.dataset.mode));
  });

  primaryAction.addEventListener("click", handlePrimaryAction);
  prevAction.addEventListener("click", () => navigateRelative(-1));
  markQuestionButton.addEventListener("click", toggleQuestionMarked);
  wrongOnlyButton.addEventListener("click", () => switchQuestionSet("wrong"));
  unfinishedOnlyButton.addEventListener("click", () => switchQuestionSet("unfinished"));
  allQuestionsButton.addEventListener("click", () => switchQuestionSet("all"));
  homeShortcut.addEventListener("click", goHome);
  programMarkWrong.addEventListener("click", toggleProgramWrong);
  programAnswer.addEventListener("input", handleProgramInput);

  shuffleQuestionOrderToggle.checked = !!progressStore.shuffleQuestionOrder;
  shuffleQuestionOrderToggle.addEventListener("change", toggleQuestionShuffle);

  shuffleOptionsToggle.checked = !!progressStore.shuffleChoiceOptions;
  shuffleOptionsToggle.addEventListener("change", toggleOptionShuffle);

  window.addEventListener("hashchange", applyRouteFromHash);
  applyRouteFromHash();
}

function startMode(mode) {
  saveCurrentQuestionState();
  state.currentMode = mode;
  state.wrongOnly = false;
  state.unfinishedOnly = false;
  state.currentIndex = 0;
  state.revealState = false;
  rebuildQuestionList();
  showPractice();
  if (location.hash !== `#${mode}`) {
    history.replaceState(null, "", `#${mode}`);
  }
  renderCurrentQuestion();
}

function rebuildQuestionList() {
  if (!state.data || !state.currentMode) return;
  let all = getQuestionsByMode(state.currentMode);
  if (progressStore.shuffleQuestionOrder) {
    all = applyQuestionOrder(state.currentMode, all);
  }
  if (state.wrongOnly) {
    const wrongSet = getWrongSet(state.currentMode);
    state.currentList = all.filter((question) => wrongSet.has(question.id));
    if (state.currentList.length === 0) {
      state.currentList = all;
      state.wrongOnly = false;
    }
  } else if (state.unfinishedOnly) {
    state.currentList = all.filter((question) => getQuestionStatus(state.currentMode, question).key === "pending");
  } else {
    state.currentList = all;
  }
  if (state.currentIndex >= state.currentList.length) {
    state.currentIndex = 0;
  }
}

function switchQuestionSet(filterMode) {
  saveCurrentQuestionState();
  state.wrongOnly = filterMode === "wrong";
  state.unfinishedOnly = filterMode === "unfinished";
  state.currentIndex = 0;
  state.revealState = false;
  rebuildQuestionList();
  renderCurrentQuestion();
}

function getQuestionsByMode(mode) {
  if (mode === "codefill") {
    return (state.data.fill_questions || []).filter((question) => isProgramFillQuestion(question));
  }
  if (mode === "fill") {
    return (state.data.fill_questions || []).filter((question) => !isProgramFillQuestion(question));
  }
  if (mode === "single") return state.data.single_choice_questions || [];
  if (mode === "judge") return state.data.judgment_questions || [];
  return state.data.program_questions || [];
}

function showPractice() {
  homeView.classList.remove("active");
  practiceView.classList.add("active");
  homeShortcut.classList.remove("hidden");
}

function goHome() {
  saveCurrentQuestionState();
  practiceView.classList.remove("active");
  homeView.classList.add("active");
  homeShortcut.classList.add("hidden");
  if (location.hash) {
    history.replaceState(null, "", location.pathname + location.search);
  }
}

function renderCurrentQuestion() {
  const question = state.currentList[state.currentIndex];
  if (!question) {
    modeTitle.textContent = MODE_LABELS[state.currentMode] || "刷题";
    updateProgressText();
    questionTitle.textContent = state.unfinishedOnly ? "未做题已经刷完了" : "没有题目";
    questionMeta.textContent = "";
    questionBody.innerHTML = `<p>${
      state.unfinishedOnly
        ? "当前没有未做题了，可以点“全部题目”继续复习。"
        : "当前没有可刷的题目。"
    }</p>`;
    feedbackPanel.classList.add("hidden");
    feedbackPanel.innerHTML = "";
    programComposer.classList.add("hidden");
    programAnswerPanel.classList.add("hidden");
    programAnswerPanel.innerHTML = "";
    primaryAction.disabled = true;
    prevAction.disabled = true;
    markQuestionButton.disabled = true;
    renderNavigator();
    updateToolbarButtons();
    return;
  }

  primaryAction.disabled = false;
  prevAction.disabled = state.currentList.length <= 1;
  markQuestionButton.disabled = false;
  feedbackPanel.classList.add("hidden");
  feedbackPanel.innerHTML = "";
  programComposer.classList.add("hidden");
  programAnswerPanel.classList.add("hidden");
  programAnswerPanel.innerHTML = "";
  state.revealState = false;

  modeTitle.textContent = MODE_LABELS[state.currentMode] || "刷题";
  updateProgressText();

  questionTitle.textContent = question.title;
  questionMeta.textContent = buildQuestionMetaText(question);

  if (isFillMode(state.currentMode)) {
    renderFillQuestion(question);
    primaryAction.textContent = "下一题";
  } else if (state.currentMode === "single") {
    renderSingleChoiceQuestion(question);
    primaryAction.textContent = "下一题";
  } else if (state.currentMode === "judge") {
    renderJudgeQuestion(question);
    primaryAction.textContent = "下一题";
  } else {
    renderProgramQuestion(question);
    primaryAction.textContent = "显示答案";
  }

  renderNavigator();
  updateToolbarButtons();
}

function buildQuestionMetaText(question) {
  const status = getQuestionStatus(state.currentMode, question);
  const parts = [];
  if (state.wrongOnly) {
    parts.push("错题模式");
  }
  if (state.unfinishedOnly) {
    parts.push("未做题模式");
  }
  parts.push(status.label);
  if (isQuestionMarked(state.currentMode, question.id)) {
    parts.push("已标记");
  }
  if (progressStore.shuffleQuestionOrder) {
    parts.push("题序已打乱");
  }
  if (state.currentMode === "single" && progressStore.shuffleChoiceOptions) {
    parts.push("选项已打乱");
  }
  return parts.join(" · ");
}

function renderFillQuestion(question) {
  questionBody.innerHTML = question.stem_html;
  questionBody.querySelectorAll(".blank-slot").forEach((slot) => {
    const index = Number(slot.dataset.blankIndex);
    const input = document.createElement("input");
    input.type = "text";
    input.className = "blank-input";
    input.placeholder = `填写${question.blank_labels[index]}`;
    input.dataset.blankIndex = String(index);
    slot.replaceWith(input);
  });
}

function renderSingleChoiceQuestion(question) {
  const orderedOptions = getOrderedSingleChoiceOptions(question);
  questionBody.innerHTML = `
    <div class="choice-stem">${question.stem_html}</div>
    <div class="choice-list">
      ${orderedOptions.map((option) => `
        <label class="choice-option" data-source-key="${option.sourceKey}" data-display-label="${option.displayLabel}">
          <input type="radio" name="singleChoice" value="${option.sourceKey}">
          <span class="choice-badge">${option.displayLabel}</span>
          <div class="choice-content">
            <div class="choice-text">${escapeHtml(option.text)}</div>
            <div class="choice-tags"></div>
          </div>
        </label>
      `).join("")}
    </div>
  `;
}

function renderJudgeQuestion(question) {
  questionBody.innerHTML = `
    <div class="choice-stem">${question.stem_html}</div>
    <div class="choice-list">
      ${question.options.map((option) => `
        <label class="choice-option" data-source-key="${option.key}" data-display-label="${option.text}">
          <input type="radio" name="judgeChoice" value="${option.key}">
          <span class="choice-badge">${escapeHtml(option.text)}</span>
          <div class="choice-content">
            <div class="choice-text">${escapeHtml(option.text)}</div>
            <div class="choice-tags"></div>
          </div>
        </label>
      `).join("")}
    </div>
  `;
}

function renderProgramQuestion(question) {
  programComposer.classList.remove("hidden");
  questionBody.innerHTML = question.prompt_html;
  programAnswer.value = progressStore.programAnswers?.[question.id] || "";
}

function handlePrimaryAction() {
  if (!state.currentList[state.currentIndex]) return;

  if (state.currentMode === "fill") {
    handleFillAction();
    return;
  }

  if (state.currentMode === "single") {
    handleSingleChoiceAction();
    return;
  }

  if (state.currentMode === "judge") {
    handleJudgeAction();
    return;
  }

  handleProgramAction();
}

function handleFillAction() {
  const question = state.currentList[state.currentIndex];
  if (!state.revealState) {
    const inputs = [...questionBody.querySelectorAll(".blank-input")];
    const feedback = [];
    let allCorrect = true;

    inputs.forEach((input, index) => {
      const userValue = input.value.trim();
      const variants = question.answers[index] || [];
      const correct = variants.some((answer) => normalizeAnswer(answer) === normalizeAnswer(userValue));
      input.classList.remove("correct", "wrong");
      input.classList.add(correct ? "correct" : "wrong");
      if (!correct) allCorrect = false;
      feedback.push({
        label: question.blank_labels[index] || `填空${index + 1}`,
        userValue,
        correct,
        answer: question.display_answers[index] || variants[0] || "",
      });
    });

    feedbackPanel.innerHTML = `
      <h3>${allCorrect ? "本题答对了" : "本题有错"}</h3>
      <div class="feedback-list">
        ${feedback.map((item) => `
          <div class="feedback-item ${item.correct ? "ok" : "bad"}">
            <div><strong>${item.label}</strong><span class="feedback-status ${item.correct ? "ok" : "bad"}">${item.correct ? "正确" : "不对"}</span></div>
            <div>你填写的是：<code>${escapeHtml(item.userValue || "（空）")}</code></div>
            <div>正确答案：<code>${escapeHtml(item.answer)}</code></div>
          </div>
        `).join("")}
      </div>
    `;
    feedbackPanel.classList.remove("hidden");
    markAutoGradedProgress("fill", question.id, allCorrect);
    state.revealState = true;
    primaryAction.textContent = "进入下一题";
    renderNavigator();
    updateToolbarButtons();
    return;
  }

  navigateRelative(1);
}

function handleSingleChoiceAction() {
  const question = state.currentList[state.currentIndex];
  const selectedInput = questionBody.querySelector('input[name="singleChoice"]:checked');

  if (!state.revealState) {
    if (!selectedInput) {
      feedbackPanel.innerHTML = "<h3>请先选择一个选项</h3>";
      feedbackPanel.classList.remove("hidden");
      return;
    }

    const selectedSourceKey = selectedInput.value;
    const correct = selectedSourceKey === question.answer_key;
    const selectedOption = question.options.find((item) => item.key === selectedSourceKey);
    const correctOption = question.options.find((item) => item.key === question.answer_key);
    const selectedDisplayLabel = getDisplayLabelBySourceKey(question, selectedSourceKey);
    const correctDisplayLabel = getDisplayLabelBySourceKey(question, question.answer_key);

    revealSingleChoiceAnswer(question, selectedSourceKey);
    feedbackPanel.innerHTML = `
      <h3>${correct ? "本题答对了" : "本题答错了"}</h3>
      <div class="feedback-list">
        <div class="feedback-item ${correct ? "ok" : "bad"}">
          <div><strong>你的选择</strong><span class="feedback-status ${correct ? "ok" : "bad"}">${correct ? "正确" : "不对"}</span></div>
          <div><code>${escapeHtml(selectedDisplayLabel)}. ${escapeHtml(selectedOption?.text || "")}</code></div>
        </div>
        <div class="feedback-item ok">
          <div><strong>正确答案</strong></div>
          <div><code>${escapeHtml(correctDisplayLabel)}. ${escapeHtml(correctOption?.text || "")}</code></div>
        </div>
      </div>
    `;
    feedbackPanel.classList.remove("hidden");
    markAutoGradedProgress("single", question.id, correct);
    state.revealState = true;
    primaryAction.textContent = "进入下一题";
    renderNavigator();
    updateToolbarButtons();
    return;
  }

  navigateRelative(1);
}

function handleJudgeAction() {
  const question = state.currentList[state.currentIndex];
  const selectedInput = questionBody.querySelector('input[name="judgeChoice"]:checked');

  if (!state.revealState) {
    if (!selectedInput) {
      feedbackPanel.innerHTML = "<h3>请先选择正确或错误</h3>";
      feedbackPanel.classList.remove("hidden");
      return;
    }

    const selectedSourceKey = selectedInput.value;
    const correct = selectedSourceKey === question.answer_key;
    const selectedOption = question.options.find((item) => item.key === selectedSourceKey);
    const correctOption = question.options.find((item) => item.key === question.answer_key);

    revealJudgeAnswer(question, selectedSourceKey);
    feedbackPanel.innerHTML = `
      <h3>${correct ? "本题答对了" : "本题答错了"}</h3>
      <div class="feedback-list">
        <div class="feedback-item ${correct ? "ok" : "bad"}">
          <div><strong>你的选择</strong><span class="feedback-status ${correct ? "ok" : "bad"}">${correct ? "正确" : "不对"}</span></div>
          <div><code>${escapeHtml(selectedOption?.text || "")}</code></div>
        </div>
        <div class="feedback-item ok">
          <div><strong>正确答案</strong></div>
          <div><code>${escapeHtml(correctOption?.text || "")}</code></div>
        </div>
      </div>
    `;
    feedbackPanel.classList.remove("hidden");
    markAutoGradedProgress("judge", question.id, correct);
    state.revealState = true;
    primaryAction.textContent = "进入下一题";
    renderNavigator();
    updateToolbarButtons();
    return;
  }

  navigateRelative(1);
}

function handleProgramAction() {
  const question = state.currentList[state.currentIndex];
  saveProgramDraft(question.id, programAnswer.value);

  if (!state.revealState) {
    programAnswerPanel.innerHTML = question.answer_html;
    programAnswerPanel.classList.remove("hidden");
    markProgramDone(question.id);
    state.revealState = true;
    primaryAction.textContent = "进入下一题";
    renderNavigator();
    updateToolbarButtons();
    return;
  }

  navigateRelative(1);
}

function handleProgramInput() {
  if (state.currentMode !== "program") return;
  const question = state.currentList[state.currentIndex];
  if (!question) return;
  saveProgramDraft(question.id, programAnswer.value);
  if (programAnswer.value.trim()) {
    markProgramDone(question.id);
  }
  renderNavigator();
  updateToolbarButtons();
}

function revealSingleChoiceAnswer(question, selectedSourceKey) {
  questionBody.querySelectorAll(".choice-option").forEach((optionEl) => {
    const sourceKey = optionEl.dataset.sourceKey;
    const radio = optionEl.querySelector('input[name="singleChoice"]');
    const tags = optionEl.querySelector(".choice-tags");

    optionEl.classList.add("locked");
    radio.disabled = true;

    if (sourceKey === question.answer_key) {
      optionEl.classList.add("correct");
    } else if (sourceKey === selectedSourceKey) {
      optionEl.classList.add("wrong");
    }

    const tagHtml = [];
    if (sourceKey === selectedSourceKey) {
      tagHtml.push('<span class="choice-tag selected">你的选择</span>');
    }
    if (sourceKey === question.answer_key) {
      tagHtml.push('<span class="choice-tag correct">正确答案</span>');
    }
    tags.innerHTML = tagHtml.join("");
  });
}

function revealJudgeAnswer(question, selectedSourceKey) {
  questionBody.querySelectorAll(".choice-option").forEach((optionEl) => {
    const sourceKey = optionEl.dataset.sourceKey;
    const radio = optionEl.querySelector('input[name="judgeChoice"]');
    const tags = optionEl.querySelector(".choice-tags");

    optionEl.classList.add("locked");
    radio.disabled = true;

    if (sourceKey === question.answer_key) {
      optionEl.classList.add("correct");
    } else if (sourceKey === selectedSourceKey) {
      optionEl.classList.add("wrong");
    }

    const tagHtml = [];
    if (sourceKey === selectedSourceKey) {
      tagHtml.push('<span class="choice-tag selected">你的选择</span>');
    }
    if (sourceKey === question.answer_key) {
      tagHtml.push('<span class="choice-tag correct">正确答案</span>');
    }
    tags.innerHTML = tagHtml.join("");
  });
}

function navigateRelative(delta) {
  if (state.currentList.length === 0) return;

  saveCurrentQuestionState();
  const previousQuestion = state.currentList[state.currentIndex];
  const previousIndex = state.currentIndex;

  if (!isSubsetMode()) {
    state.currentIndex = normalizeIndex(state.currentIndex + delta, state.currentList.length);
    renderCurrentQuestion();
    return;
  }

  rebuildQuestionList();
  if (state.currentList.length === 0) {
    renderCurrentQuestion();
    return;
  }

  const previousStillExists = state.currentList.findIndex((item) => item.id === previousQuestion.id);
  if (previousStillExists >= 0) {
    state.currentIndex = normalizeIndex(previousStillExists + delta, state.currentList.length);
  } else {
    const fallbackIndex = delta > 0 ? previousIndex : previousIndex - 1;
    state.currentIndex = normalizeIndex(fallbackIndex, state.currentList.length);
  }

  renderCurrentQuestion();
}

function jumpToQuestion(index) {
  if (index < 0 || index >= state.currentList.length) return;

  saveCurrentQuestionState();
  const targetId = state.currentList[index]?.id;

  if (!isSubsetMode()) {
    state.currentIndex = index;
    renderCurrentQuestion();
    return;
  }

  rebuildQuestionList();
  if (state.currentList.length === 0) {
    renderCurrentQuestion();
    return;
  }

  const nextIndex = state.currentList.findIndex((item) => item.id === targetId);
  state.currentIndex = nextIndex >= 0 ? nextIndex : Math.min(index, state.currentList.length - 1);
  renderCurrentQuestion();
}

function renderNavigator() {
  const list = state.currentList || [];
  if (!navigatorSummary || !questionNavigator) return;

  const summary = buildNavigatorSummary(list);
  navigatorSummary.textContent = summary;

  questionNavigator.innerHTML = list.map((question, index) => {
    const status = getQuestionStatus(state.currentMode, question);
    return `
      <button
        class="navigator-item ${index === state.currentIndex ? "current" : ""}"
        type="button"
        data-nav-index="${index}"
      >
        <span class="navigator-index">${index + 1}</span>
        <span class="navigator-body">
          <span class="navigator-title">${escapeHtml(question.title)}</span>
          <span class="navigator-status-row">
            <span class="navigator-status ${status.key}">${status.label}</span>
            ${isQuestionMarked(state.currentMode, question.id) ? '<span class="navigator-flag">已标记</span>' : ""}
          </span>
        </span>
      </button>
    `;
  }).join("");

  questionNavigator.querySelectorAll("[data-nav-index]").forEach((button) => {
    button.addEventListener("click", () => {
      jumpToQuestion(Number(button.dataset.navIndex));
    });
  });
}

function buildNavigatorSummary(list) {
  const allQuestions = getQuestionsByMode(state.currentMode);
  let pending = 0;
  let wrong = 0;
  let correct = 0;
  let done = 0;
  let marked = 0;

  allQuestions.forEach((question) => {
    const status = getQuestionStatus(state.currentMode, question);
    if (status.key === "pending") pending += 1;
    if (status.key === "wrong") wrong += 1;
    if (status.key === "correct") correct += 1;
    if (status.key === "done") done += 1;
    if (isQuestionMarked(state.currentMode, question.id)) marked += 1;
  });

  if (state.currentMode === "program") {
    return `未做 ${pending} · 已做 ${done} · 错题 ${wrong} · 标记 ${marked}`;
  }

  return `未做 ${pending} · 正确 ${correct} · 错题 ${wrong} · 标记 ${marked}`;
}

function getQuestionStatus(mode, question) {
  if (!question) {
    return { key: "pending", label: "未做" };
  }

  if (isFillMode(mode)) {
    const result = progressStore.fillResults?.[question.id];
    if (result === "correct") return { key: "correct", label: "正确" };
    if (result === "wrong" || progressStore.fillWrongIds.includes(question.id)) {
      return { key: "wrong", label: "错题" };
    }
    return { key: "pending", label: "未做" };
  }

  if (mode === "single") {
    const result = progressStore.singleResults?.[question.id];
    if (result === "correct") return { key: "correct", label: "正确" };
    if (result === "wrong" || progressStore.singleWrongIds.includes(question.id)) {
      return { key: "wrong", label: "错题" };
    }
    return { key: "pending", label: "未做" };
  }

  if (mode === "judge") {
    const result = progressStore.judgeResults?.[question.id];
    if (result === "correct") return { key: "correct", label: "正确" };
    if (result === "wrong" || progressStore.judgeWrongIds.includes(question.id)) {
      return { key: "wrong", label: "错题" };
    }
    return { key: "pending", label: "未做" };
  }

  if (progressStore.programWrongIds.includes(question.id)) {
    return { key: "wrong", label: "错题" };
  }

  const hasDraft = Boolean(progressStore.programAnswers?.[question.id]?.trim());
  const done = progressStore.programDoneIds.includes(question.id) || hasDraft;
  if (done) {
    return { key: "done", label: "已做" };
  }

  return { key: "pending", label: "未做" };
}

function toggleProgramWrong() {
  if (state.currentMode !== "program") return;
  const question = state.currentList[state.currentIndex];
  const wrongSet = getWrongSet("program");
  if (wrongSet.has(question.id)) {
    wrongSet.delete(question.id);
  } else {
    wrongSet.add(question.id);
    markProgramDone(question.id);
  }
  saveWrongSet("program", wrongSet);
  updateToolbarButtons();
  updateProgressText();
  renderNavigator();
}

function toggleQuestionMarked() {
  const question = state.currentList[state.currentIndex];
  if (!question || !state.currentMode) return;

  const markedSet = getMarkedSet(state.currentMode);
  if (markedSet.has(question.id)) {
    markedSet.delete(question.id);
  } else {
    markedSet.add(question.id);
  }
  saveMarkedSet(state.currentMode, markedSet);
  questionMeta.textContent = buildQuestionMetaText(question);
  updateProgressText();
  renderNavigator();
  updateToolbarButtons();
}

function toggleQuestionShuffle() {
  saveCurrentQuestionState();
  const currentQuestionId = state.currentList[state.currentIndex]?.id;
  progressStore.shuffleQuestionOrder = shuffleQuestionOrderToggle.checked;
  state.questionOrders = {};
  saveProgress();

  if (state.currentMode) {
    rebuildQuestionList();
    if (currentQuestionId) {
      const nextIndex = state.currentList.findIndex((item) => item.id === currentQuestionId);
      state.currentIndex = nextIndex >= 0 ? nextIndex : 0;
    } else {
      state.currentIndex = 0;
    }
    renderCurrentQuestion();
  } else {
    updateToolbarButtons();
  }
}

function toggleOptionShuffle() {
  progressStore.shuffleChoiceOptions = shuffleOptionsToggle.checked;
  state.singleChoiceOrders = {};
  saveProgress();

  if (state.currentMode === "single") {
    state.revealState = false;
    renderCurrentQuestion();
  } else {
    updateToolbarButtons();
  }
}

function updateToolbarButtons() {
  wrongOnlyButton.textContent = state.wrongOnly ? "当前：错题模式" : "错题再练";
  unfinishedOnlyButton.textContent = state.unfinishedOnly ? "当前：未做题模式" : "只看未做题";
  allQuestionsButton.classList.toggle("hidden", !state.wrongOnly && !state.unfinishedOnly);
  questionShuffleWrap.classList.toggle("hidden", !state.currentMode);
  shuffleToggleWrap.classList.toggle("hidden", state.currentMode !== "single");
  const question = state.currentList[state.currentIndex];
  const isMarked = question && state.currentMode ? isQuestionMarked(state.currentMode, question.id) : false;
  markQuestionButton.textContent = isMarked ? "取消标记" : "标记本题";
  markQuestionButton.classList.toggle("active", !!isMarked);

  if (state.currentMode === "program") {
    const isWrong = question ? getWrongSet("program").has(question.id) : false;
    programMarkWrong.textContent = isWrong ? "取消错题" : "记为错题";
  }
}

function updateProgressText() {
  if (!state.currentMode) return;
  const modeCount = getQuestionsByMode(state.currentMode).length;
  const pendingCount = getQuestionsByMode(state.currentMode)
    .filter((question) => getQuestionStatus(state.currentMode, question).key === "pending").length;
  const wrongCount = getWrongSet(state.currentMode).size;
  const markedCount = getMarkedSet(state.currentMode).size;
  const current = state.currentList.length === 0 ? 0 : state.currentIndex + 1;
  if (state.unfinishedOnly) {
    progressText.textContent = `第 ${current} / ${state.currentList.length} 题 · 全部 ${modeCount} 题 · 未做 ${pendingCount} 题 · 标记 ${markedCount} 题`;
    return;
  }
  progressText.textContent = `第 ${current} / ${state.currentList.length} 题 · 全部 ${modeCount} 题 · 错题 ${wrongCount} 题 · 标记 ${markedCount} 题`;
}

function getOrderedSingleChoiceOptions(question) {
  const optionMap = new Map(question.options.map((item) => [item.key, item]));
  let orderedKeys = question.options.map((item) => item.key);

  if (progressStore.shuffleChoiceOptions) {
    if (!state.singleChoiceOrders[question.id]) {
      state.singleChoiceOrders[question.id] = shuffleArray([...orderedKeys]);
    }
    orderedKeys = state.singleChoiceOrders[question.id];
  }

  return orderedKeys.map((sourceKey, index) => ({
    sourceKey,
    displayLabel: CHOICE_DISPLAY_LABELS[index] || String(index + 1),
    text: optionMap.get(sourceKey)?.text || "",
  }));
}

function applyQuestionOrder(mode, list) {
  if (!progressStore.shuffleQuestionOrder) {
    return list;
  }

  const fullList = getQuestionsByMode(mode);
  const order = getQuestionOrder(mode, fullList);
  const itemMap = new Map(list.map((item) => [item.id, item]));
  return order.map((id) => itemMap.get(id)).filter(Boolean);
}

function getQuestionOrder(mode, fullList) {
  const ids = fullList.map((item) => item.id);
  const existing = state.questionOrders[mode];

  if (
    existing
    && existing.length === ids.length
    && ids.every((id) => existing.includes(id))
  ) {
    return existing;
  }

  const nextOrder = shuffleArray([...ids]);
  state.questionOrders[mode] = nextOrder;
  return nextOrder;
}

function getDisplayLabelBySourceKey(question, sourceKey) {
  const orderedOptions = getOrderedSingleChoiceOptions(question);
  const match = orderedOptions.find((item) => item.sourceKey === sourceKey);
  return match?.displayLabel || sourceKey;
}

function markAutoGradedProgress(mode, id, allCorrect) {
  const wrongSet = getWrongSet(mode);
  if (allCorrect) {
    wrongSet.delete(id);
  } else {
    wrongSet.add(id);
  }
  saveWrongSet(mode, wrongSet);

  if (mode === "fill") {
    progressStore.fillResults[id] = allCorrect ? "correct" : "wrong";
  } else if (mode === "single") {
    progressStore.singleResults[id] = allCorrect ? "correct" : "wrong";
  } else if (mode === "judge") {
    progressStore.judgeResults[id] = allCorrect ? "correct" : "wrong";
  }

  saveProgress();
}

function markProgramDone(id) {
  if (!progressStore.programDoneIds.includes(id)) {
    progressStore.programDoneIds.push(id);
    saveProgress();
  }
}

function saveCurrentQuestionState() {
  const question = state.currentList[state.currentIndex];
  if (!question) return;

  if (state.currentMode === "program") {
    const draft = programAnswer.value || "";
    saveProgramDraft(question.id, draft);
    if (draft.trim()) {
      markProgramDone(question.id);
    }
  }
}

function isSubsetMode() {
  return state.wrongOnly || state.unfinishedOnly;
}

function shuffleArray(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function normalizeIndex(index, length) {
  return ((index % length) + length) % length;
}

function normalizeAnswer(value) {
  return String(value || "").replace(/\s+/g, "").trim();
}

function ensureProgressDefaults(raw) {
  return {
    fillWrongIds: Array.isArray(raw?.fillWrongIds) ? raw.fillWrongIds : [],
    singleWrongIds: Array.isArray(raw?.singleWrongIds) ? raw.singleWrongIds : [],
    judgeWrongIds: Array.isArray(raw?.judgeWrongIds) ? raw.judgeWrongIds : [],
    programWrongIds: Array.isArray(raw?.programWrongIds) ? raw.programWrongIds : [],
    fillMarkedIds: Array.isArray(raw?.fillMarkedIds) ? raw.fillMarkedIds : [],
    singleMarkedIds: Array.isArray(raw?.singleMarkedIds) ? raw.singleMarkedIds : [],
    judgeMarkedIds: Array.isArray(raw?.judgeMarkedIds) ? raw.judgeMarkedIds : [],
    programMarkedIds: Array.isArray(raw?.programMarkedIds) ? raw.programMarkedIds : [],
    fillResults: raw?.fillResults && typeof raw.fillResults === "object" ? raw.fillResults : {},
    singleResults: raw?.singleResults && typeof raw.singleResults === "object" ? raw.singleResults : {},
    judgeResults: raw?.judgeResults && typeof raw.judgeResults === "object" ? raw.judgeResults : {},
    programDoneIds: Array.isArray(raw?.programDoneIds) ? raw.programDoneIds : [],
    programAnswers: raw?.programAnswers && typeof raw.programAnswers === "object" ? raw.programAnswers : {},
    shuffleQuestionOrder: typeof raw?.shuffleQuestionOrder === "boolean" ? raw.shuffleQuestionOrder : false,
    shuffleChoiceOptions: typeof raw?.shuffleChoiceOptions === "boolean" ? raw.shuffleChoiceOptions : false,
  };
}

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || {};
  } catch {
    return {};
  }
}

function saveProgress() {
  localStorage.setItem(storageKey, JSON.stringify(progressStore));
}

function getWrongSet(mode) {
  if (isFillMode(mode)) return new Set(progressStore.fillWrongIds);
  if (mode === "single") return new Set(progressStore.singleWrongIds);
  if (mode === "judge") return new Set(progressStore.judgeWrongIds);
  return new Set(progressStore.programWrongIds);
}

function getMarkedSet(mode) {
  if (isFillMode(mode)) return new Set(progressStore.fillMarkedIds);
  if (mode === "single") return new Set(progressStore.singleMarkedIds);
  if (mode === "judge") return new Set(progressStore.judgeMarkedIds);
  return new Set(progressStore.programMarkedIds);
}

function saveWrongSet(mode, wrongSet) {
  if (isFillMode(mode)) {
    progressStore.fillWrongIds = [...wrongSet];
  } else if (mode === "single") {
    progressStore.singleWrongIds = [...wrongSet];
  } else if (mode === "judge") {
    progressStore.judgeWrongIds = [...wrongSet];
  } else {
    progressStore.programWrongIds = [...wrongSet];
  }
  saveProgress();
}

function saveMarkedSet(mode, markedSet) {
  if (isFillMode(mode)) {
    progressStore.fillMarkedIds = [...markedSet];
  } else if (mode === "single") {
    progressStore.singleMarkedIds = [...markedSet];
  } else if (mode === "judge") {
    progressStore.judgeMarkedIds = [...markedSet];
  } else {
    progressStore.programMarkedIds = [...markedSet];
  }
  saveProgress();
}

function isQuestionMarked(mode, id) {
  return getMarkedSet(mode).has(id);
}

function isFillMode(mode) {
  return mode === "fill" || mode === "codefill";
}

function isProgramFillQuestion(question) {
  return !String(question?.id || "").startsWith("docx-fill-");
}

function saveProgramDraft(id, value) {
  progressStore.programAnswers ||= {};
  progressStore.programAnswers[id] = value;
  saveProgress();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function applyRouteFromHash() {
  const mode = location.hash.replace("#", "");
  if (mode === "codefill" || mode === "fill" || mode === "single" || mode === "judge" || mode === "program") {
    if (!state.data) return;
    if (state.currentMode !== mode || !practiceView.classList.contains("active")) {
      startMode(mode);
    }
    return;
  }
  if (practiceView.classList.contains("active")) {
    goHome();
  }
}

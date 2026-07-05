const MODE_LABELS = {
  codefill: "程序填空",
  fill: "填空题",
  short: "简答题",
  calc: "计算题",
  single: "单选题",
  judge: "判断题",
  program: "程序题",
};

const CHOICE_DISPLAY_LABELS = ["A", "B", "C", "D", "E", "F"];

const AI_CONFIG = {
  enabled: true,
  baseUrl: "https://ergouzi.life/v1",
  apiKey: "sk-CJF1cKOLFS80ovxx0CO3TRvudI7ivRVHTgTVZ7a9xUVOzDGK",
  model: "gpt-5.4",
};

const AI_CORRECT_PRAISES = [
  "这波答得太漂亮了，关键点抓得又稳又准，像开了透视。",
  "答得真猛，核心意思基本全中，老师看了都想立刻给分。",
  "这题你拿捏得很到位，重点踩得很准，属于一眼就知道你懂了。",
  "回答相当扎实，信息密度很高，完全不是随便蒙出来的感觉。",
  "这题你是真的会，思路清楚、表达到位，狠狠加分。",
  "太顺了，这个回答已经很像标准卷上的高分答案了。",
  "你这答法很有感觉，核心内容压得准，读起来就很像对的。",
  "漂亮，关键点覆盖得很完整，这题你基本稳稳拿下。",
  "这一题答得很硬核，重点、逻辑、表达都在线。",
  "这不是答对一点点，是答得很像参考答案背后的那套理解。",
  "真不错，说明你不是在背字面，而是真的把意思吃进去了。",
  "这题你答得很争气，属于看到就想给你大写加分的水平。",
];

const AI_PARTIAL_PRAISES = [
  "方向是对的，已经摸到主干了，再补一两刀就更完整。",
  "这题你不是不会，是差一点封口，把漏掉的点补上就很强。",
  "核心意思你抓住了一部分，再把缺的点带上就更稳了。",
  "已经答出骨架了，剩下就是把细节补齐。",
];

const AI_WRONG_PRAISES = [
  "别慌，这题是还有偏差，但现在最值钱的是已经能定位问题了。",
  "这次没压准，不过问题不大，改对这一处就会顺很多。",
  "先别急，这题主要是方向偏了一点，拉回来就行。",
  "这题暂时没对上，但你现在最需要的是看清卡点，我来给你指出来。",
];

const AI_SHORT_SYSTEM_PROMPT = `
你是一个严格但鼓励感很强的中文考试阅卷老师，专门审核简答题。
你的任务不是比对字面，而是判断学生回答的意思是否到位。

判题规则：
1. 允许同义表达、换序表达、自己的话复述。
2. 不要求完全还原标准答案。
3. 只要关键意思基本覆盖、没有明显原则性错误，就可以判 correct。
4. 如果答到一部分关键点，但明显缺点、漏点较多，判 partial。
5. 如果核心意思偏了、漏得太多、或者出现明显错误，判 wrong。
6. 反馈必须短、准、直接，适合学生继续刷题。

你只能返回 JSON，不要输出任何多余文字。
JSON 结构必须是：
{
  "verdict": "correct" | "partial" | "wrong",
  "summary": "一句话总评",
  "good_points": ["答到的点1", "答到的点2"],
  "missing_points": ["缺失点1", "缺失点2"],
  "wrong_points": ["明显错误1"],
  "suggested_fix": "下一次怎么补到位"
}
`;

const AI_CALC_SYSTEM_PROMPT = `
你是一个严格但鼓励感很强的中文考试阅卷老师，专门审核计算题。
学生可能只写过程，不一定写最终结果。你需要理解过程是否正确。

判题规则：
1. 允许不同但等价的计算路径。
2. 如果学生没有写最终答案，但关键公式、思路、计算链条正确，可以判 correct。
3. 如果方法基本对，但有局部算错、漏一步、单位问题，判 partial。
4. 如果公式、口径、思路或关键计算明显错误，判 wrong。
5. 必须指出错在什么步骤，不要空泛。
6. 反馈必须短、准、直接，适合学生继续刷题。

你只能返回 JSON，不要输出任何多余文字。
JSON 结构必须是：
{
  "verdict": "correct" | "partial" | "wrong",
  "summary": "一句话总评",
  "good_points": ["正确步骤1", "正确步骤2"],
  "error_steps": ["错误步骤1", "错误步骤2"],
  "missing_points": ["缺失步骤1", "缺失步骤2"],
  "suggested_fix": "下一次怎么改"
}
`;

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
  aiLoading: false,
};

const storageKey = "quiz-web-progress-v3";

const homeView = document.getElementById("homeView");
const practiceView = document.getElementById("practiceView");
const modeTitle = document.getElementById("modeTitle");
const progressText = document.getElementById("progressText");
const questionTitle = document.getElementById("questionTitle");
const questionMeta = document.getElementById("questionMeta");
const questionBody = document.getElementById("questionBody");
const feedbackPanel = document.getElementById("feedbackPanel");
const programComposer = document.getElementById("programComposer");
const composerLabel = document.getElementById("composerLabel");
const programAnswer = document.getElementById("programAnswer");
const programAnswerPanel = document.getElementById("programAnswerPanel");
const manualReviewRow = document.getElementById("manualReviewRow");
const manualReviewHelper = document.getElementById("manualReviewHelper");
const aiAssistButton = document.getElementById("aiAssistButton");
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
const memorizeModeWrap = document.getElementById("memorizeModeWrap");
const memorizeModeToggle = document.getElementById("memorizeModeToggle");
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
  aiAssistButton.addEventListener("click", handleAiAssist);
  programAnswer.addEventListener("input", handleProgramInput);

  shuffleQuestionOrderToggle.checked = !!progressStore.shuffleQuestionOrder;
  shuffleQuestionOrderToggle.addEventListener("change", toggleQuestionShuffle);

  memorizeModeToggle.checked = !!progressStore.memorizeMode;
  memorizeModeToggle.addEventListener("change", toggleMemorizeMode);

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
  if (mode === "short") return state.data.short_answer_questions || [];
  if (mode === "calc") return state.data.calculation_questions || [];
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
    manualReviewRow.classList.add("hidden");
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
  programAnswerPanel.classList.remove("memory-answer-surface");
  programAnswerPanel.innerHTML = "";
  manualReviewRow.classList.add("hidden");
  state.aiLoading = false;
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
  } else if (state.currentMode === "program") {
    renderProgramQuestion(question);
    primaryAction.textContent = isMemorizeMode() ? "下一题" : "显示答案";
  } else {
    renderStudyQuestion(question);
    primaryAction.textContent = isMemorizeMode() ? "下一题" : "显示答案";
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
  if (isMemorizeMode()) {
    parts.push("背题模式");
  }
  if (state.currentMode === "single" && progressStore.shuffleChoiceOptions) {
    parts.push("选项已打乱");
  }
  return parts.join(" · ");
}

function configureManualReviewArea(mode) {
  const aiVisible = supportsAiCompanion(mode) && !isMemorizeMode() && AI_CONFIG.enabled;
  aiAssistButton.classList.toggle("hidden", !aiVisible);
  aiAssistButton.textContent = state.aiLoading ? "AI伴答中..." : "开始AI伴答";
  aiAssistButton.disabled = state.aiLoading;

  if (mode === "program") {
    composerLabel.textContent = "你的答案";
    programAnswer.placeholder = "在这里写你的 Python 程序";
    manualReviewHelper.textContent = "程序题不自动判分，自己看完答案后决定是否记错题。";
    return;
  }

  if (mode === "short") {
    composerLabel.textContent = "你的回答";
    programAnswer.placeholder = "先自己答一遍，再点“开始AI伴答”让 AI 看意思到不到位";
    manualReviewHelper.textContent = isMemorizeMode()
      ? "背题模式下直接看答案。"
      : "简答题按意思判，不要求和答案逐字一样。";
    return;
  }

  if (mode === "calc") {
    composerLabel.textContent = "你的过程";
    programAnswer.placeholder = "把计算过程写出来就行，不用特意补最终结果";
    manualReviewHelper.textContent = isMemorizeMode()
      ? "背题模式下直接看答案。"
      : "计算题主要看过程和口径，最终结果不一定非要单独写。";
  }
}

function renderFillQuestion(question) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = question.stem_html;

  wrapper.querySelectorAll(".blank-slot").forEach((slot) => {
    const index = Number(slot.dataset.blankIndex);
    if (isMemorizeMode()) {
      const answer = document.createElement("span");
      answer.className = "memory-answer-inline";
      answer.textContent = question.display_answers[index] || question.answers[index]?.[0] || "";
      slot.replaceWith(answer);
      return;
    }

    const input = document.createElement("input");
    input.type = "text";
    input.className = "blank-input";
    input.placeholder = `填写${question.blank_labels[index]}`;
    input.dataset.blankIndex = String(index);
    slot.replaceWith(input);
  });

  questionBody.innerHTML = "";
  questionBody.appendChild(wrapper);
}

function renderSingleChoiceQuestion(question) {
  const orderedOptions = getOrderedSingleChoiceOptions(question);
  questionBody.innerHTML = `
    <div class="choice-stem">${question.stem_html}</div>
    ${isMemorizeMode() ? buildMemoryAnswerBlockHtml("答案", `${escapeHtml(getDisplayLabelBySourceKey(question, question.answer_key))}. ${escapeHtml(question.options.find((item) => item.key === question.answer_key)?.text || "")}`) : ""}
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
  if (isMemorizeMode()) {
    revealSingleChoiceAnswer(question, null);
  }
}

function renderJudgeQuestion(question) {
  questionBody.innerHTML = `
    <div class="choice-stem">${question.stem_html}</div>
    ${isMemorizeMode() ? buildMemoryAnswerBlockHtml("答案", escapeHtml(question.options.find((item) => item.key === question.answer_key)?.text || "")) : ""}
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
  if (isMemorizeMode()) {
    revealJudgeAnswer(question, null);
  }
}

function renderProgramQuestion(question) {
  questionBody.innerHTML = question.prompt_html;
  manualReviewRow.classList.remove("hidden");
  configureManualReviewArea("program");
  if (isMemorizeMode()) {
    programAnswer.value = "";
    programAnswerPanel.classList.add("memory-answer-surface");
    programAnswerPanel.innerHTML = question.answer_html;
    programAnswerPanel.classList.remove("hidden");
    markManualReviewDone("program", question.id);
    questionMeta.textContent = buildQuestionMetaText(question);
    updateProgressText();
    return;
  }

  programComposer.classList.remove("hidden");
  programAnswer.value = progressStore.programAnswers?.[question.id] || "";
}

function renderStudyQuestion(question) {
  questionBody.innerHTML = question.prompt_html;
  manualReviewRow.classList.remove("hidden");
  programComposer.classList.remove("hidden");
  configureManualReviewArea(state.currentMode);
  programAnswer.value = "";
  if (isMemorizeMode()) {
    programComposer.classList.add("hidden");
    programAnswerPanel.classList.add("memory-answer-surface");
    programAnswerPanel.innerHTML = question.answer_html;
    programAnswerPanel.classList.remove("hidden");
    markManualReviewDone(state.currentMode, question.id);
    questionMeta.textContent = buildQuestionMetaText(question);
    updateProgressText();
  }
}

async function handleAiAssist() {
  const question = state.currentList[state.currentIndex];
  if (!question || !supportsAiCompanion(state.currentMode) || isMemorizeMode()) return;

  const userAnswer = programAnswer.value.trim();
  if (!userAnswer) {
    feedbackPanel.innerHTML = "<h3>先写一点答案或过程，再让 AI 来看。</h3>";
    feedbackPanel.classList.remove("hidden");
    return;
  }

  state.aiLoading = true;
  updateToolbarButtons();
  configureManualReviewArea(state.currentMode);
  feedbackPanel.innerHTML = "<h3>AI 正在看你的答案...</h3><p class=\"feedback-note\">马上回来，先别切题。</p>";
  feedbackPanel.classList.remove("hidden");

  try {
    const result = await requestAiReview(state.currentMode, question, userAnswer);
    applyAiReviewResult(state.currentMode, question.id, result.verdict);
    feedbackPanel.innerHTML = buildAiFeedbackHtml(state.currentMode, result);
    feedbackPanel.classList.remove("hidden");
    questionMeta.textContent = buildQuestionMetaText(question);
    updateProgressText();
    renderNavigator();
  } catch (error) {
    console.error(error);
    feedbackPanel.innerHTML = `
      <h3>AI伴答暂时没连上</h3>
      <div class="feedback-list">
        <div class="feedback-item bad">
          <div><strong>当前状态</strong><span class="feedback-status bad">稍后再试</span></div>
          <div>${escapeHtml(error.message || "这次请求没成功，等会再点一次。")}</div>
        </div>
      </div>
    `;
    feedbackPanel.classList.remove("hidden");
  } finally {
    state.aiLoading = false;
    updateToolbarButtons();
    configureManualReviewArea(state.currentMode);
  }
}

function handlePrimaryAction() {
  if (!state.currentList[state.currentIndex]) return;

  if (isMemorizeMode()) {
    navigateRelative(1);
    return;
  }

  if (isFillMode(state.currentMode)) {
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

  handleManualReviewAction();
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

function handleManualReviewAction() {
  const question = state.currentList[state.currentIndex];
  if (state.currentMode === "program") {
    saveProgramDraft(question.id, programAnswer.value);
  }

  if (!state.revealState) {
    programAnswerPanel.innerHTML = question.answer_html;
    programAnswerPanel.classList.remove("hidden");
    markManualReviewDone(state.currentMode, question.id);
    questionMeta.textContent = buildQuestionMetaText(question);
    updateProgressText();
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
  questionMeta.textContent = buildQuestionMetaText(question);
  updateProgressText();
  renderNavigator();
  updateToolbarButtons();
}

async function requestAiReview(mode, question, userAnswer) {
  const payload = {
    题型: mode === "short" ? "简答题" : "计算题",
    题目标题: question.title,
    题目内容: htmlToReadableText(question.prompt_html),
    参考答案: htmlToReadableText(question.answer_html).replace(/^参考答案\s*/u, "").trim(),
    学生作答: userAnswer,
  };

  const body = {
    model: AI_CONFIG.model,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: mode === "short" ? AI_SHORT_SYSTEM_PROMPT : AI_CALC_SYSTEM_PROMPT },
      { role: "user", content: JSON.stringify(payload, null, 2) },
    ],
  };

  let response = await postAiRequest(body);
  if (!response.ok) {
    const firstErrorText = await response.text();
    if (body.response_format) {
      const fallbackBody = { ...body };
      delete fallbackBody.response_format;
      response = await postAiRequest(fallbackBody);
      if (!response.ok) {
        const secondErrorText = await response.text();
        throw new Error(extractAiError(secondErrorText) || extractAiError(firstErrorText) || "AI伴答请求失败");
      }
    } else {
      throw new Error(extractAiError(firstErrorText) || "AI伴答请求失败");
    }
  }

  const data = await response.json();
  const rawContent = getAiMessageContent(data);
  const parsed = parseAiJson(rawContent);
  return normalizeAiReview(parsed, mode);
}

async function postAiRequest(body) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);
  try {
    return await fetch(`${AI_CONFIG.baseUrl.replace(/\/+$/u, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_CONFIG.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("AI伴答超时了，等会再点一次。");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function getAiMessageContent(data) {
  const message = data?.choices?.[0]?.message;
  const content = message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map((item) => item?.text || item?.content || "").join("\n");
  }
  throw new Error("AI 返回内容为空");
}

function parseAiJson(rawContent) {
  const clean = String(rawContent || "")
    .trim()
    .replace(/^```json\s*/iu, "")
    .replace(/^```\s*/u, "")
    .replace(/\s*```$/u, "");
  return JSON.parse(clean);
}

function normalizeAiReview(raw, mode) {
  const allowed = ["correct", "partial", "wrong"];
  const verdict = allowed.includes(raw?.verdict) ? raw.verdict : "partial";
  return {
    verdict,
    summary: String(raw?.summary || "").trim() || (verdict === "correct" ? "整体答得不错。" : "还有可补的地方。"),
    goodPoints: normalizeStringList(raw?.good_points),
    missingPoints: normalizeStringList(raw?.missing_points),
    wrongPoints: normalizeStringList(mode === "calc" ? raw?.error_steps : raw?.wrong_points),
    suggestedFix: String(raw?.suggested_fix || "").trim(),
  };
}

function normalizeStringList(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item || "").trim()).filter(Boolean);
}

function applyAiReviewResult(mode, id, verdict) {
  markManualReviewDone(mode, id);
  const wrongSet = getWrongSet(mode);
  if (verdict === "correct") {
    wrongSet.delete(id);
  } else {
    wrongSet.add(id);
  }
  saveWrongSet(mode, wrongSet);
}

function buildAiFeedbackHtml(mode, result) {
  const verdictLabel = {
    correct: "答得很到位",
    partial: "方向基本对，但还可以更完整",
    wrong: "这次没有答准",
  }[result.verdict];
  const statusClass = result.verdict === "correct" ? "ok" : result.verdict === "partial" ? "partial" : "bad";
  const cheerText = pickAiCheer(result.verdict, mode);
  const detailLabel = mode === "short" ? "漏掉的要点" : "需要补或改的步骤";
  const wrongLabel = mode === "short" ? "明显偏差" : "出错的位置";

  return `
    <h3>AI伴答：${escapeHtml(verdictLabel)}</h3>
    <div class="feedback-list">
      <div class="feedback-item ${statusClass}">
        <div><strong>AI判断</strong><span class="feedback-status ${statusClass}">${escapeHtml(verdictLabel)}</span></div>
        <div>${escapeHtml(cheerText)}</div>
        <div>${escapeHtml(result.summary)}</div>
      </div>
      ${renderAiListBlock("你答到的点", result.goodPoints, "ok")}
      ${renderAiListBlock(detailLabel, result.missingPoints, "partial")}
      ${renderAiListBlock(wrongLabel, result.wrongPoints, "bad")}
      ${result.suggestedFix ? `
        <div class="feedback-item">
          <div><strong>下次怎么补</strong></div>
          <div>${escapeHtml(result.suggestedFix)}</div>
        </div>
      ` : ""}
    </div>
  `;
}

function renderAiListBlock(title, items, statusClass) {
  if (!items.length) return "";
  return `
    <div class="feedback-item ${statusClass}">
      <div><strong>${escapeHtml(title)}</strong></div>
      <ul class="feedback-bullets">
        ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </div>
  `;
}

function pickAiCheer(verdict, mode) {
  let pool = AI_CORRECT_PRAISES;
  let key = "correct";
  if (verdict === "partial") {
    pool = AI_PARTIAL_PRAISES;
    key = "partial";
  } else if (verdict === "wrong") {
    pool = AI_WRONG_PRAISES;
    key = "wrong";
  }
  const lastKey = progressStore.lastAiPraise?.[mode]?.[key] ?? -1;
  let nextIndex = Math.floor(Math.random() * pool.length);
  if (pool.length > 1 && nextIndex === lastKey) {
    nextIndex = (nextIndex + 1) % pool.length;
  }
  progressStore.lastAiPraise ||= {};
  progressStore.lastAiPraise[mode] ||= {};
  progressStore.lastAiPraise[mode][key] = nextIndex;
  saveProgress();
  return pool[nextIndex];
}

function extractAiError(errorText) {
  try {
    const parsed = JSON.parse(errorText);
    return parsed?.error?.message || parsed?.message || "";
  } catch {
    return String(errorText || "").trim();
  }
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

  if (isManualReviewMode(state.currentMode)) {
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

  if (isManualReviewMode(mode)) {
    if (getWrongSet(mode).has(question.id)) {
      return { key: "wrong", label: "错题" };
    }

    const hasDraft = mode === "program" && Boolean(progressStore.programAnswers?.[question.id]?.trim());
    const doneSet = getDoneSet(mode);
    const done = doneSet.has(question.id) || hasDraft;
    if (done) {
      return { key: "done", label: "已做" };
    }
  }

  return { key: "pending", label: "未做" };
}

function toggleProgramWrong() {
  if (!isManualReviewMode(state.currentMode)) return;
  const question = state.currentList[state.currentIndex];
  const wrongSet = getWrongSet(state.currentMode);
  if (wrongSet.has(question.id)) {
    wrongSet.delete(question.id);
  } else {
    wrongSet.add(question.id);
    markManualReviewDone(state.currentMode, question.id);
  }
  saveWrongSet(state.currentMode, wrongSet);
  questionMeta.textContent = buildQuestionMetaText(question);
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

function toggleMemorizeMode() {
  saveCurrentQuestionState();
  progressStore.memorizeMode = memorizeModeToggle.checked;
  saveProgress();

  if (state.currentMode) {
    state.revealState = false;
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
  memorizeModeWrap.classList.toggle("hidden", !state.currentMode);
  shuffleToggleWrap.classList.toggle("hidden", state.currentMode !== "single");
  primaryAction.disabled = state.aiLoading || !state.currentList[state.currentIndex];
  prevAction.disabled = state.aiLoading || state.currentList.length <= 1;
  markQuestionButton.disabled = state.aiLoading || !state.currentList[state.currentIndex];
  const question = state.currentList[state.currentIndex];
  const isMarked = question && state.currentMode ? isQuestionMarked(state.currentMode, question.id) : false;
  markQuestionButton.textContent = isMarked ? "取消标记" : "标记本题";
  markQuestionButton.classList.toggle("active", !!isMarked);

  if (isManualReviewMode(state.currentMode)) {
    const isWrong = question ? getWrongSet(state.currentMode).has(question.id) : false;
    programMarkWrong.textContent = isWrong ? "取消错题" : "记为错题";
    programMarkWrong.disabled = state.aiLoading;
  } else {
    programMarkWrong.disabled = false;
  }

  if (supportsAiCompanion(state.currentMode)) {
    aiAssistButton.disabled = state.aiLoading;
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
  const memorizeLabel = isMemorizeMode() ? " · 背题模式" : "";
  if (state.unfinishedOnly) {
    progressText.textContent = `第 ${current} / ${state.currentList.length} 题 · 全部 ${modeCount} 题 · 未做 ${pendingCount} 题 · 标记 ${markedCount} 题${memorizeLabel}`;
    return;
  }
  progressText.textContent = `第 ${current} / ${state.currentList.length} 题 · 全部 ${modeCount} 题 · 错题 ${wrongCount} 题 · 标记 ${markedCount} 题${memorizeLabel}`;
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

function markManualReviewDone(mode, id) {
  if (mode === "program") {
    markProgramDone(id);
    return;
  }

  const key = mode === "short" ? "shortDoneIds" : "calcDoneIds";
  if (!progressStore[key].includes(id)) {
    progressStore[key].push(id);
    saveProgress();
  }
}

function saveCurrentQuestionState() {
  const question = state.currentList[state.currentIndex];
  if (!question) return;

  if (state.currentMode === "program" && !isMemorizeMode()) {
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
    shortWrongIds: Array.isArray(raw?.shortWrongIds) ? raw.shortWrongIds : [],
    calcWrongIds: Array.isArray(raw?.calcWrongIds) ? raw.calcWrongIds : [],
    singleWrongIds: Array.isArray(raw?.singleWrongIds) ? raw.singleWrongIds : [],
    judgeWrongIds: Array.isArray(raw?.judgeWrongIds) ? raw.judgeWrongIds : [],
    programWrongIds: Array.isArray(raw?.programWrongIds) ? raw.programWrongIds : [],
    fillMarkedIds: Array.isArray(raw?.fillMarkedIds) ? raw.fillMarkedIds : [],
    shortMarkedIds: Array.isArray(raw?.shortMarkedIds) ? raw.shortMarkedIds : [],
    calcMarkedIds: Array.isArray(raw?.calcMarkedIds) ? raw.calcMarkedIds : [],
    singleMarkedIds: Array.isArray(raw?.singleMarkedIds) ? raw.singleMarkedIds : [],
    judgeMarkedIds: Array.isArray(raw?.judgeMarkedIds) ? raw.judgeMarkedIds : [],
    programMarkedIds: Array.isArray(raw?.programMarkedIds) ? raw.programMarkedIds : [],
    fillResults: raw?.fillResults && typeof raw.fillResults === "object" ? raw.fillResults : {},
    singleResults: raw?.singleResults && typeof raw.singleResults === "object" ? raw.singleResults : {},
    judgeResults: raw?.judgeResults && typeof raw.judgeResults === "object" ? raw.judgeResults : {},
    shortDoneIds: Array.isArray(raw?.shortDoneIds) ? raw.shortDoneIds : [],
    calcDoneIds: Array.isArray(raw?.calcDoneIds) ? raw.calcDoneIds : [],
    programDoneIds: Array.isArray(raw?.programDoneIds) ? raw.programDoneIds : [],
    programAnswers: raw?.programAnswers && typeof raw.programAnswers === "object" ? raw.programAnswers : {},
    shuffleQuestionOrder: typeof raw?.shuffleQuestionOrder === "boolean" ? raw.shuffleQuestionOrder : false,
    shuffleChoiceOptions: typeof raw?.shuffleChoiceOptions === "boolean" ? raw.shuffleChoiceOptions : false,
    memorizeMode: typeof raw?.memorizeMode === "boolean" ? raw.memorizeMode : false,
    lastAiPraise: raw?.lastAiPraise && typeof raw.lastAiPraise === "object" ? raw.lastAiPraise : {},
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
  if (mode === "short") return new Set(progressStore.shortWrongIds);
  if (mode === "calc") return new Set(progressStore.calcWrongIds);
  if (mode === "single") return new Set(progressStore.singleWrongIds);
  if (mode === "judge") return new Set(progressStore.judgeWrongIds);
  return new Set(progressStore.programWrongIds);
}

function getMarkedSet(mode) {
  if (isFillMode(mode)) return new Set(progressStore.fillMarkedIds);
  if (mode === "short") return new Set(progressStore.shortMarkedIds);
  if (mode === "calc") return new Set(progressStore.calcMarkedIds);
  if (mode === "single") return new Set(progressStore.singleMarkedIds);
  if (mode === "judge") return new Set(progressStore.judgeMarkedIds);
  return new Set(progressStore.programMarkedIds);
}

function getDoneSet(mode) {
  if (mode === "short") return new Set(progressStore.shortDoneIds);
  if (mode === "calc") return new Set(progressStore.calcDoneIds);
  if (mode === "program") return new Set(progressStore.programDoneIds);
  return new Set();
}

function saveWrongSet(mode, wrongSet) {
  if (isFillMode(mode)) {
    progressStore.fillWrongIds = [...wrongSet];
  } else if (mode === "short") {
    progressStore.shortWrongIds = [...wrongSet];
  } else if (mode === "calc") {
    progressStore.calcWrongIds = [...wrongSet];
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
  } else if (mode === "short") {
    progressStore.shortMarkedIds = [...markedSet];
  } else if (mode === "calc") {
    progressStore.calcMarkedIds = [...markedSet];
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

function isManualReviewMode(mode) {
  return mode === "program" || mode === "short" || mode === "calc";
}

function supportsAiCompanion(mode) {
  return mode === "short" || mode === "calc";
}

function isMemorizeMode() {
  return !!progressStore.memorizeMode;
}

function isProgramFillQuestion(question) {
  return !String(question?.id || "").startsWith("docx-fill-");
}

function buildMemoryAnswerBlockHtml(title, content) {
  return `
    <div class="memory-answer-block">
      <div class="memory-answer-title">${escapeHtml(title)}</div>
      <div class="memory-answer-text">${content}</div>
    </div>
  `;
}

function saveProgramDraft(id, value) {
  progressStore.programAnswers ||= {};
  progressStore.programAnswers[id] = value;
  saveProgress();
}

function htmlToReadableText(html) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  const lines = [];

  wrapper.querySelectorAll("table").forEach((table) => {
    const rows = [...table.querySelectorAll("tr")].map((row) => [...row.children].map((cell) => cell.textContent.trim()).join(" | "));
    table.replaceWith(document.createTextNode(rows.join("\n")));
  });

  [...wrapper.childNodes].forEach((node) => {
    const text = node.textContent?.trim();
    if (text) {
      lines.push(text);
    }
  });

  return lines.join("\n").replace(/\n{3,}/gu, "\n\n").trim();
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
  if (mode === "codefill" || mode === "fill" || mode === "short" || mode === "calc" || mode === "single" || mode === "judge" || mode === "program") {
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

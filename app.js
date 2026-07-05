const MODE_LABELS = {
  financeExam: "模拟考试",
  codefill: "程序填空",
  fill: "填空题",
  short: "简答题",
  calc: "计算题",
  single: "单选题",
  judge: "判断题",
  program: "程序题",
};

const QUESTION_KIND_LABELS = {
  codefill: "程序填空",
  fill: "填空题",
  short: "简答题",
  calc: "计算题",
  single: "单项选择题",
  multi: "多项选择题",
  judge: "判断题",
  program: "程序题",
  business: "业务核算题",
};

const COURSE_LABELS = {
  financeExam: "中级财务",
  codefill: "Python",
  fill: "Python",
  single: "Python",
  judge: "Python",
  program: "Python",
  short: "中级财务",
  calc: "中级财务",
};

const MODE_KEYS = ["codefill", "fill", "single", "judge", "program", "short", "calc"];
const ROUTABLE_MODES = [...MODE_KEYS, "financeExam"];
const COURSE_MODE_GROUPS = {
  finance: ["short", "calc"],
  python: ["codefill", "fill", "single", "judge", "program"],
};

const CHOICE_DISPLAY_LABELS = ["A", "B", "C", "D", "E", "F"];
const AI_MODEL_DISPLAY = "ChatGPT 5.4";
const LEGACY_PROGRESS_STORAGE_KEY = "quiz-web-progress-v3";
const USER_CENTER_STORAGE_KEY = "quiz-web-user-center-v1";

const AI_CONFIG = {
  enabled: true,
  baseUrl: "https://ergouzi.life/v1",
  apiKeys: [
    "sk-CJF1cKOLFS80ovxx0CO3TRvudI7ivRVHTgTVZ7a9xUVOzDGK",
    "sk-jDxNNUh4iznrZpZPHhNvSqWuGU7PTU7qA2VxaFtG2saiaNrB",
  ],
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

const AI_WRONG_REVIEW_SYSTEM_PROMPT = `
你是一个中文错题复盘教练，任务是把学生已经做错的题讲明白，让学生下次更容易做对。

复盘要求：
1. 先说清这题真正考什么。
2. 客观题、填空题、程序填空题：解释正确答案或正确填空为什么对，容易混淆在哪里。
3. 程序题、简答题、计算题、业务核算题：提炼关键得分点、常见失分点、下次作答框架。
4. 如果没有学生原作答记录，也照样基于题目和参考答案完成复盘。
5. 用中文，短、准、能直接拿去复习。

你只能返回 JSON，不要输出任何多余文字。
JSON 结构必须是：
{
  "focus": "一句话说明这题考什么",
  "answer_takeaways": ["关键点1", "关键点2", "关键点3"],
  "pitfalls": ["易错点1", "易错点2"],
  "next_action": "下次怎么判断或怎么作答",
  "memory_hook": "一句短记忆点"
}
`;

const AI_WRONG_PLAN_SYSTEM_PROMPT = `
你是一个中文复习规划教练，要根据学生当前的错题清单生成一轮高效的错题复习方案。

要求：
1. 直接给优先级，不要空话。
2. 先指出最该先刷的板块，再说原因。
3. 给一个今天就能执行的复习顺序。
4. 提醒最危险、最容易反复错的点。
5. 用中文，短、实用、可执行。

你只能返回 JSON，不要输出任何多余文字。
JSON 结构必须是：
{
  "priority_mode": "最该先复习的板块",
  "why_priority": "为什么它优先",
  "today_plan": ["步骤1", "步骤2", "步骤3"],
  "danger_points": ["危险点1", "危险点2"],
  "finish_signal": "做到什么程度算这一轮过关"
}
`;

const state = {
  data: null,
  knowledgeBase: { meta: {}, items: [] },
  currentMode: null,
  currentList: [],
  currentIndex: 0,
  revealState: false,
  wrongOnly: false,
  unfinishedOnly: false,
  singleChoiceOrders: {},
  questionOrders: {},
  aiLoading: false,
  homeChatLoading: false,
  wrongReviewPlanLoading: false,
  wrongReviewItemLoadingKey: "",
  wrongReviewPlanHtml: "",
  wrongReviewItemReviews: {},
};

const homeView = document.getElementById("homeView");
const reviewView = document.getElementById("reviewView");
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
const nextAction = document.getElementById("nextAction");
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
const newExamSessionButton = document.getElementById("newExamSessionButton");
const headerHomeLink = document.getElementById("headerHomeLink");
const headerFinanceExamLink = document.getElementById("headerFinanceExamLink");
const headerWrongReviewLink = document.getElementById("headerWrongReviewLink");
const heroDoneCount = document.getElementById("heroDoneCount");
const heroDoneMeta = document.getElementById("heroDoneMeta");
const heroWrongCount = document.getElementById("heroWrongCount");
const heroWrongMeta = document.getElementById("heroWrongMeta");
const heroCourseMeta = document.getElementById("heroCourseMeta");
const heroCompletionRate = document.getElementById("heroCompletionRate");
const heroSuggestion = document.getElementById("heroSuggestion");
const courseFinanceProgress = document.getElementById("courseFinanceProgress");
const coursePythonProgress = document.getElementById("coursePythonProgress");
const aiModelDisplay = document.getElementById("aiModelDisplay");
const activeProfileName = document.getElementById("activeProfileName");
const activeProfileMeta = document.getElementById("activeProfileMeta");
const continueProfileButton = document.getElementById("continueProfileButton");
const newProfileQuickButton = document.getElementById("newProfileQuickButton");
const profileNameInput = document.getElementById("profileNameInput");
const createProfileButton = document.getElementById("createProfileButton");
const profileList = document.getElementById("profileList");
const chatProfileName = document.getElementById("chatProfileName");
const chatSuggestButton = document.getElementById("chatSuggestButton");
const chatClearButton = document.getElementById("chatClearButton");
const homeChatMessages = document.getElementById("homeChatMessages");
const homeChatInput = document.getElementById("homeChatInput");
const homeChatSendButton = document.getElementById("homeChatSendButton");
const homeChatStatus = document.getElementById("homeChatStatus");
const chatKnowledgeToggle = document.getElementById("chatKnowledgeToggle");
const chatWebSearchToggle = document.getElementById("chatWebSearchToggle");
const chatUrlReadToggle = document.getElementById("chatUrlReadToggle");
const wrongReviewPlanButton = document.getElementById("wrongReviewPlanButton");
const wrongReviewPlanHint = document.getElementById("wrongReviewPlanHint");
const wrongReviewPlanPanel = document.getElementById("wrongReviewPlanPanel");
const wrongReviewTotalCount = document.getElementById("wrongReviewTotalCount");
const wrongReviewTotalMeta = document.getElementById("wrongReviewTotalMeta");
const wrongReviewFocusMode = document.getElementById("wrongReviewFocusMode");
const wrongReviewFocusMeta = document.getElementById("wrongReviewFocusMeta");
const wrongReviewModeCount = document.getElementById("wrongReviewModeCount");
const wrongReviewModeMeta = document.getElementById("wrongReviewModeMeta");
const wrongReviewProfileName = document.getElementById("wrongReviewProfileName");
const wrongReviewProfileMeta = document.getElementById("wrongReviewProfileMeta");
const wrongReviewModeCaption = document.getElementById("wrongReviewModeCaption");
const wrongReviewModeGrid = document.getElementById("wrongReviewModeGrid");
const wrongReviewListMeta = document.getElementById("wrongReviewListMeta");
const wrongReviewList = document.getElementById("wrongReviewList");
const practiceCourseBadge = document.getElementById("practiceCourseBadge");
const practiceModeBadge = document.getElementById("practiceModeBadge");
const practiceSessionInfo = document.getElementById("practiceSessionInfo");
const practiceQuestionTypeChip = document.getElementById("practiceQuestionTypeChip");
const practiceQuestionIndexChip = document.getElementById("practiceQuestionIndexChip");

let userCenterStore = ensureUserCenterDefaults(loadUserCenterStore(), loadLegacyProgress());
let progressStore = getActiveProfile().progress;

init().catch((error) => {
  console.error(error);
  questionBody.innerHTML = "<p>加载题库失败，请刷新重试。</p>";
});

async function loadKnowledgeBase() {
  try {
    const response = await fetch("./data/knowledge_base.json");
    if (!response.ok) {
      throw new Error(`knowledge-base-${response.status}`);
    }
    const raw = await response.json();
    return prepareKnowledgeBase(raw);
  } catch (error) {
    console.warn("knowledge base unavailable", error);
    return { meta: { unavailable: true }, items: [] };
  }
}

async function init() {
  const [questionResponse, knowledgeBase] = await Promise.all([
    fetch("./data/questions.json"),
    loadKnowledgeBase(),
  ]);
  state.data = await questionResponse.json();
  state.knowledgeBase = knowledgeBase;
  if (aiModelDisplay) {
    aiModelDisplay.textContent = AI_MODEL_DISPLAY;
  }
  syncProgressToggles();
  renderHomeDashboard();
  renderUserCenter();
  renderHomeChatMessages();
  updateHomeChatStatus();

  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => startMode(button.dataset.mode));
  });

  primaryAction.addEventListener("click", handlePrimaryAction);
  prevAction.addEventListener("click", () => navigateRelative(-1));
  nextAction?.addEventListener("click", () => navigateRelative(1));
  markQuestionButton.addEventListener("click", toggleQuestionMarked);
  wrongOnlyButton.addEventListener("click", () => switchQuestionSet("wrong"));
  unfinishedOnlyButton.addEventListener("click", () => switchQuestionSet("unfinished"));
  allQuestionsButton.addEventListener("click", () => switchQuestionSet("all"));
  homeShortcut.addEventListener("click", goHome);
  programMarkWrong.addEventListener("click", toggleProgramWrong);
  aiAssistButton.addEventListener("click", handleAiAssist);
  programAnswer.addEventListener("input", handleProgramInput);
  continueProfileButton?.addEventListener("click", () => continueWithProfile());
  newProfileQuickButton?.addEventListener("click", () => createProfileFromInput(true));
  createProfileButton?.addEventListener("click", () => createProfileFromInput(false));
  profileNameInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      createProfileFromInput(false);
    }
  });
  homeChatSendButton?.addEventListener("click", () => submitHomeChat());
  chatSuggestButton?.addEventListener("click", () => submitProgressSuggestionRequest());
  chatClearButton?.addEventListener("click", clearHomeChatHistory);
  chatKnowledgeToggle?.addEventListener("change", (event) => handleHomeChatSettingToggle("chatKnowledgeEnabled", event.target.checked));
  chatWebSearchToggle?.addEventListener("change", (event) => handleHomeChatSettingToggle("chatWebSearchEnabled", event.target.checked));
  chatUrlReadToggle?.addEventListener("change", (event) => handleHomeChatSettingToggle("chatUrlReadEnabled", event.target.checked));
  homeChatInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitHomeChat();
    }
  });
  newExamSessionButton?.addEventListener("click", () => startMode("financeExam", { forceNewSession: true }));
  headerHomeLink?.addEventListener("click", goHome);
  headerFinanceExamLink?.addEventListener("click", () => startMode("financeExam"));
  headerWrongReviewLink?.addEventListener("click", showWrongReviewCenter);
  wrongReviewPlanButton?.addEventListener("click", handleWrongReviewPlanRequest);

  shuffleQuestionOrderToggle.addEventListener("change", toggleQuestionShuffle);
  memorizeModeToggle.addEventListener("change", toggleMemorizeMode);
  shuffleOptionsToggle.addEventListener("change", toggleOptionShuffle);

  window.addEventListener("hashchange", applyRouteFromHash);
  applyRouteFromHash();
}

function startMode(mode, options = {}) {
  if (options.sessionId && mode === "financeExam") {
    setActiveFinanceExamSession(options.sessionId);
  }
  if (mode === "financeExam") {
    ensureFinanceExamSession(options.forceNewSession === true);
  }
  saveCurrentQuestionState();
  state.currentMode = mode;
  progressStore.lastMode = mode;
  saveProgress();
  state.wrongOnly = options.wrongOnly === true;
  state.unfinishedOnly = options.unfinishedOnly === true;
  state.currentIndex = 0;
  state.revealState = false;
  rebuildQuestionList();
  showPractice();
  if (location.hash !== `#${mode}`) {
    history.replaceState(null, "", `#${mode}`);
  }
  renderCurrentQuestion();
}

function ensureFinanceExamSession(forceNewSession = false) {
  const currentSession = getActiveFinanceExamSession();
  if (!forceNewSession && currentSession?.questions?.length) {
    return currentSession;
  }

  const newSession = buildFinanceExamSession();
  progressStore.financeExamSessions ||= [];
  progressStore.financeExamSessions.unshift(newSession);
  progressStore.financeExamSessions = progressStore.financeExamSessions.slice(0, 3);
  progressStore.financeExamCurrentSessionId = newSession.id;
  saveProgress();
  return newSession;
}

function buildFinanceExamSession() {
  const paper = state.data?.finance_exam?.paper || {
    single_count: 20,
    multiple_count: 5,
    judgment_count: 10,
    short_count: 2,
    calc_count: 2,
    business_count: 4,
    total_score: 100,
  };
  const sessionId = `finance-exam-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const createdAt = new Date().toISOString();
  const questions = [];

  const singleBank = sampleQuestions(state.data?.finance_exam?.single_choice_bank || [], paper.single_count);
  singleBank.forEach((source, index) => {
    questions.push({
      id: `${sessionId}-single-${String(index + 1).padStart(2, "0")}`,
      examType: "single",
      score: 1,
      title: `单项选择题 ${String(index + 1).padStart(2, "0")}`,
      sourceId: source.id,
      sourceTitle: source.title,
      stem_text: source.stem_text,
      stem_html: source.stem_html,
      options: source.options,
      answer_key: source.answer_key,
      answer_text: source.answer_text,
    });
  });

  const multiBank = sampleQuestions(state.data?.finance_exam?.multiple_choice_bank || [], paper.multiple_count);
  multiBank.forEach((source, index) => {
    questions.push({
      id: `${sessionId}-multi-${String(index + 1).padStart(2, "0")}`,
      examType: "multi",
      score: 2,
      title: `多项选择题 ${String(index + 1).padStart(2, "0")}`,
      sourceId: source.id,
      sourceTitle: source.title,
      stem_text: source.stem_text,
      stem_html: source.stem_html,
      options: source.options,
      answer_keys: source.answer_keys,
      answer_texts: source.answer_texts,
    });
  });

  const judgeBank = sampleQuestions(state.data?.finance_exam?.judgment_bank || [], paper.judgment_count);
  judgeBank.forEach((source, index) => {
    questions.push({
      id: `${sessionId}-judge-${String(index + 1).padStart(2, "0")}`,
      examType: "judge",
      score: 1,
      title: `判断题 ${String(index + 1).padStart(2, "0")}`,
      sourceId: source.id,
      sourceTitle: source.title,
      stem_text: source.stem_text,
      stem_html: source.stem_html,
      options: source.options,
      answer_key: source.answer_key,
      answer_text: source.answer_text,
    });
  });

  const shortBank = sampleQuestions(state.data?.short_answer_questions || [], paper.short_count);
  shortBank.forEach((source, index) => {
    questions.push({
      id: `${sessionId}-short-${String(index + 1).padStart(2, "0")}`,
      examType: "short",
      score: 5,
      title: `简答题 ${String(index + 1).padStart(2, "0")} · ${simplifyExamSourceTitle(source.title)}`,
      sourceId: source.id,
      sourceTitle: source.title,
      prompt_html: source.prompt_html,
      answer_html: source.answer_html,
    });
  });

  const calcBank = sampleQuestions(state.data?.calculation_questions || [], paper.calc_count);
  calcBank.forEach((source, index) => {
    questions.push({
      id: `${sessionId}-calc-${String(index + 1).padStart(2, "0")}`,
      examType: "calc",
      score: 5,
      title: `计算题 ${String(index + 1).padStart(2, "0")} · ${simplifyExamSourceTitle(source.title)}`,
      sourceId: source.id,
      sourceTitle: source.title,
      prompt_html: source.prompt_html,
      answer_html: source.answer_html,
    });
  });

  const businessBank = sampleQuestions(state.data?.business_case_questions || [], paper.business_count);
  businessBank.forEach((source, index) => {
    questions.push({
      id: `${sessionId}-business-${String(index + 1).padStart(2, "0")}`,
      examType: "business",
      score: 10,
      title: `业务核算题 ${String(index + 1).padStart(2, "0")} · ${simplifyExamSourceTitle(source.title)}`,
      sourceId: source.id,
      sourceTitle: source.title,
      prompt_html: source.prompt_html,
      answer_html: source.answer_html,
    });
  });

  return {
    id: sessionId,
    title: `中财模拟卷 · ${formatFinanceExamTime(createdAt)}`,
    createdAt,
    updatedAt: createdAt,
    paper,
    questions,
  };
}

function sampleQuestions(list, count) {
  if (!Array.isArray(list) || list.length === 0 || count <= 0) return [];
  return shuffleArray(list).slice(0, Math.min(count, list.length));
}

function simplifyExamSourceTitle(title) {
  const text = String(title || "").trim();
  return text.replace(/^[^-]+-/u, "").trim() || text;
}

function formatFinanceExamTime(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "最新一套";
  return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function getActiveFinanceExamSession(progressData = progressStore) {
  const sessions = Array.isArray(progressData?.financeExamSessions) ? progressData.financeExamSessions : [];
  if (!sessions.length) return null;
  const matched = sessions.find((session) => session.id === progressData?.financeExamCurrentSessionId);
  return matched || sessions[0];
}

function setActiveFinanceExamSession(sessionId) {
  if (!sessionId) return;
  const sessions = Array.isArray(progressStore?.financeExamSessions) ? progressStore.financeExamSessions : [];
  if (!sessions.some((session) => session.id === sessionId)) return;
  progressStore.financeExamCurrentSessionId = sessionId;
  saveProgress();
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
  if (mode === "financeExam") {
    return getActiveFinanceExamSession()?.questions || [];
  }
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

function getQuestionKind(mode, question) {
  if (mode === "financeExam") {
    return question?.examType || "financeExam";
  }
  return mode;
}

function getQuestionTypeLabel(mode, question) {
  const kind = getQuestionKind(mode, question);
  return QUESTION_KIND_LABELS[kind] || MODE_LABELS[mode] || "题目";
}

function isObjectiveKind(kind) {
  return kind === "single" || kind === "multi" || kind === "judge";
}

function showPractice() {
  setActiveView("practice");
  updatePracticeHeader();
}

function goHome() {
  saveCurrentQuestionState();
  setActiveView("home");
  renderHomeDashboard();
  renderUserCenter();
  renderHomeChatMessages();
  updateHomeChatStatus();
  updateDocumentTitle(null);
  if (location.hash) {
    history.replaceState(null, "", location.pathname + location.search);
  }
}

function showWrongReviewCenter() {
  saveCurrentQuestionState();
  renderWrongReviewCenter();
  setActiveView("review");
  document.title = `错题复盘｜1302学习中心`;
  if (location.hash !== "#wrong-review") {
    history.replaceState(null, "", "#wrong-review");
  }
}

function setActiveView(viewKey) {
  homeView?.classList.toggle("active", viewKey === "home");
  reviewView?.classList.toggle("active", viewKey === "review");
  practiceView?.classList.toggle("active", viewKey === "practice");
  homeShortcut?.classList.toggle("hidden", viewKey === "home");

  const homeShouldBeActive = viewKey === "home" || (viewKey === "practice" && state.currentMode !== "financeExam");
  headerHomeLink?.classList.toggle("active", homeShouldBeActive);
  headerFinanceExamLink?.classList.toggle("active", viewKey === "practice" && state.currentMode === "financeExam");
  headerWrongReviewLink?.classList.toggle("active", viewKey === "review");
}

function renderCurrentQuestion() {
  const question = state.currentList[state.currentIndex];
  updateDocumentTitle(state.currentMode);
  updatePracticeHeader();
  if (!question) {
    modeTitle.textContent = getModeHeading(state.currentMode);
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
    nextAction.disabled = true;
    markQuestionButton.disabled = true;
    renderNavigator();
    updateToolbarButtons();
    return;
  }

  primaryAction.disabled = false;
  prevAction.disabled = state.currentList.length <= 1;
  nextAction.disabled = state.currentList.length <= 1;
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

  modeTitle.textContent = getModeHeading(state.currentMode);
  updateProgressText();

  questionTitle.textContent = getQuestionDisplayTitle(question);
  questionMeta.textContent = buildQuestionMetaText(question);
  const currentKind = getQuestionKind(state.currentMode, question);
  if (practiceQuestionTypeChip) {
    practiceQuestionTypeChip.textContent = state.currentMode === "financeExam"
      ? `${getQuestionTypeLabel(state.currentMode, question)} · ${question.score || 0}分`
      : getQuestionTypeLabel(state.currentMode, question);
  }
  if (practiceQuestionIndexChip) {
    practiceQuestionIndexChip.textContent = `第 ${state.currentIndex + 1} 题`;
  }

  if (isFillMode(currentKind)) {
    renderFillQuestion(question);
    primaryAction.textContent = isMemorizeMode() ? "下一题" : "提交本题";
  } else if (currentKind === "single") {
    renderSingleChoiceQuestion(question);
    primaryAction.textContent = "提交本题";
  } else if (currentKind === "multi") {
    renderMultipleChoiceQuestion(question);
    primaryAction.textContent = "提交本题";
  } else if (currentKind === "judge") {
    renderJudgeQuestion(question);
    primaryAction.textContent = "提交本题";
  } else if (currentKind === "program") {
    renderProgramQuestion(question);
    primaryAction.textContent = isMemorizeMode() ? "下一题" : "显示答案";
  } else {
    renderStudyQuestion(question, currentKind);
    primaryAction.textContent = isMemorizeMode() ? "下一题" : "显示答案";
  }

  renderNavigator();
  updateToolbarButtons();
}

function buildQuestionMetaText(question) {
  const status = getQuestionStatus(state.currentMode, question);
  const kind = getQuestionKind(state.currentMode, question);
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
  if (state.currentMode === "financeExam" && question?.score) {
    parts.push(`${question.score}分`);
  }
  if (state.currentMode !== "financeExam" && progressStore.shuffleQuestionOrder) {
    parts.push("题序已打乱");
  }
  if (isMemorizeMode()) {
    parts.push("背题模式");
  }
  if (state.currentMode !== "financeExam" && kind === "single" && progressStore.shuffleChoiceOptions) {
    parts.push("选项已打乱");
  }
  return parts.join(" · ");
}

function getModeHeading(mode) {
  const modeLabel = MODE_LABELS[mode] || "刷题";
  const courseLabel = COURSE_LABELS[mode];
  return courseLabel ? `${courseLabel} · ${modeLabel}` : modeLabel;
}

function getQuestionDisplayTitle(question, fallbackIndex = state.currentIndex) {
  const title = question?.title?.trim();
  if (title) {
    return title;
  }
  const modeLabel = MODE_LABELS[state.currentMode] || "题目";
  const suffix = Number.isInteger(fallbackIndex) ? ` ${String(fallbackIndex + 1).padStart(3, "0")}` : "";
  return `${modeLabel}${suffix}`;
}

function updateDocumentTitle(mode) {
  document.title = mode ? `${getModeHeading(mode)}｜1302学习中心` : "1302学习中心";
}

function updatePracticeHeader() {
  if (!state.currentMode) return;
  const question = state.currentList[state.currentIndex];
  if (practiceCourseBadge) {
    practiceCourseBadge.textContent = COURSE_LABELS[state.currentMode] || "课程";
  }
  if (practiceModeBadge) {
    practiceModeBadge.textContent = MODE_LABELS[state.currentMode] || "题型";
  }
  if (practiceSessionInfo) {
    const current = state.currentList.length === 0 ? 0 : state.currentIndex + 1;
    if (state.currentMode === "financeExam") {
      const session = getActiveFinanceExamSession();
      practiceSessionInfo.textContent = `${session?.title || "中财模拟卷"} · ${current}/${state.currentList.length || 0}`;
    } else {
      practiceSessionInfo.textContent = `当前进度 ${current}/${state.currentList.length || 0}`;
    }
  }
  if (practiceQuestionTypeChip) {
    practiceQuestionTypeChip.textContent = question
      ? (state.currentMode === "financeExam"
        ? `${getQuestionTypeLabel(state.currentMode, question)} · ${question.score || 0}分`
        : getQuestionTypeLabel(state.currentMode, question))
      : (MODE_LABELS[state.currentMode] || "题型");
  }
  if (practiceQuestionIndexChip) {
    practiceQuestionIndexChip.textContent = `第 ${state.currentList.length === 0 ? 0 : state.currentIndex + 1} 题`;
  }
}

function renderHomeDashboard() {
  if (!state.data) return;

  let totalQuestions = 0;
  let totalDone = 0;
  let totalWrong = 0;

  MODE_KEYS.forEach((mode) => {
    const stats = getModeDashboardStats(mode, progressStore);
    totalQuestions += stats.total;
    totalDone += stats.done;
    totalWrong += stats.wrong;

    const statusNode = document.querySelector(`[data-mode-status="${mode}"]`);
    const textNode = document.querySelector(`[data-mode-progress-text="${mode}"]`);
    const rateNode = document.querySelector(`[data-mode-progress-rate="${mode}"]`);
    const barNode = document.querySelector(`[data-mode-progress-bar="${mode}"]`);
    const actionNode = document.querySelector(`[data-mode-action="${mode}"]`);

    if (statusNode) statusNode.textContent = stats.statusText;
    if (textNode) textNode.textContent = `${stats.done} / ${stats.total || 0}`;
    if (rateNode) rateNode.textContent = `${stats.percent}%`;
    if (barNode) barNode.style.width = `${stats.percent}%`;
    if (actionNode) actionNode.textContent = stats.actionText;
  });

  const financeExamStats = getFinanceExamDashboardStats(progressStore);
  const financeExamStatusNode = document.querySelector('[data-mode-status="financeExam"]');
  const financeExamTextNode = document.querySelector('[data-mode-progress-text="financeExam"]');
  const financeExamRateNode = document.querySelector('[data-mode-progress-rate="financeExam"]');
  const financeExamBarNode = document.querySelector('[data-mode-progress-bar="financeExam"]');
  const financeExamActionNode = document.querySelector('[data-mode-action="financeExam"]');
  if (financeExamStatusNode) financeExamStatusNode.textContent = financeExamStats.statusText;
  if (financeExamTextNode) financeExamTextNode.textContent = `${financeExamStats.done} / ${financeExamStats.total || 0}`;
  if (financeExamRateNode) financeExamRateNode.textContent = `${financeExamStats.percent}%`;
  if (financeExamBarNode) financeExamBarNode.style.width = `${financeExamStats.percent}%`;
  if (financeExamActionNode) financeExamActionNode.textContent = financeExamStats.actionText;

  const financeStats = getCourseDashboardStats("finance", progressStore);
  const pythonStats = getCourseDashboardStats("python", progressStore);
  const financeCombinedDone = financeStats.done + financeExamStats.done;
  const financeCombinedTotal = financeStats.total + financeExamStats.total;

  if (courseFinanceProgress) {
    courseFinanceProgress.textContent = `${financeCombinedDone} / ${financeCombinedTotal || financeStats.total}`;
  }
  if (coursePythonProgress) {
    coursePythonProgress.textContent = `${pythonStats.done} / ${pythonStats.total}`;
  }

  const completionRate = totalQuestions ? Math.round((totalDone / totalQuestions) * 100) : 0;
  const hardestMode = MODE_KEYS
    .map((mode) => ({ mode, wrong: getModeDashboardStats(mode, progressStore).wrong }))
    .sort((a, b) => b.wrong - a.wrong)[0];
  const mostPendingMode = MODE_KEYS
    .map((mode) => ({ mode, pending: getModeDashboardStats(mode, progressStore).pending }))
    .sort((a, b) => b.pending - a.pending)[0];

  if (heroDoneCount) heroDoneCount.textContent = String(totalDone);
  if (heroDoneMeta) heroDoneMeta.textContent = `全部 ${totalQuestions} 题里，已完成 ${totalDone} 题`;
  if (heroWrongCount) heroWrongCount.textContent = String(totalWrong);
  if (heroWrongMeta) {
    heroWrongMeta.textContent = totalWrong > 0 && hardestMode?.wrong
      ? `${MODE_LABELS[hardestMode.mode]} 当前错题最多，建议优先复习`
      : "当前没有沉淀下来的错题";
  }
  if (heroCourseMeta) {
    heroCourseMeta.textContent = `中财 ${financeCombinedDone}/${financeCombinedTotal || financeStats.total} · Python ${pythonStats.done}/${pythonStats.total}`;
  }
  if (heroCompletionRate) heroCompletionRate.textContent = `${completionRate}%`;
  if (heroSuggestion) {
    if (totalDone === 0) {
      heroSuggestion.textContent = "从任意板块直接开始";
    } else if (totalWrong > 0 && hardestMode?.wrong) {
      heroSuggestion.textContent = `优先回刷 ${MODE_LABELS[hardestMode.mode]}`;
    } else if (mostPendingMode?.pending > 0) {
      heroSuggestion.textContent = `继续推进 ${MODE_LABELS[mostPendingMode.mode]}`;
    } else {
      heroSuggestion.textContent = "全部刷过一轮了，适合开背题模式";
    }
  }
}

function getFinanceExamDashboardStats(progressData = progressStore) {
  const session = getActiveFinanceExamSession(progressData);
  if (!session?.questions?.length) {
    return { total: 0, done: 0, percent: 0, statusText: "待开始", actionText: "开始模拟" };
  }

  const stats = getFinanceExamSessionStats(session, progressData);

  let statusText = "待开始";
  if (stats.done >= stats.total) {
    statusText = "已完成";
  } else if (stats.done > 0) {
    statusText = "进行中";
  }

  const actionText = stats.done === 0 ? "开始模拟" : stats.done >= stats.total ? "继续复盘" : "继续答卷";
  return { total: stats.total, done: stats.done, percent: stats.percent, statusText, actionText };
}

function getFinanceExamSessionStats(session, progressData = progressStore) {
  const questions = Array.isArray(session?.questions) ? session.questions : [];
  const markedSet = getMarkedSet("financeExam", progressData);
  const total = questions.length;
  let done = 0;
  let wrong = 0;
  let marked = 0;
  let objectiveScore = 0;
  let objectiveTotal = 0;
  let subjectiveDone = 0;
  let subjectiveTotal = 0;

  questions.forEach((question) => {
    const status = getQuestionStatus("financeExam", question, progressData);
    const kind = getQuestionKind("financeExam", question);
    if (status.key !== "pending") done += 1;
    if (status.key === "wrong") wrong += 1;
    if (markedSet.has(question.id)) marked += 1;
    if (isObjectiveKind(kind)) {
      objectiveTotal += question.score || 0;
      if (status.key === "correct") {
        objectiveScore += question.score || 0;
      }
    } else {
      subjectiveTotal += 1;
      if (status.key !== "pending") {
        subjectiveDone += 1;
      }
    }
  });

  const percent = total ? Math.round((done / total) * 100) : 0;
  return { total, done, wrong, marked, percent, objectiveScore, objectiveTotal, subjectiveDone, subjectiveTotal };
}

function renderFinanceExamCompletionSummary() {
  const session = getActiveFinanceExamSession();
  const stats = getFinanceExamSessionStats(session);
  feedbackPanel.innerHTML = `
    <h3>这套中财模拟卷已经做到最后一题</h3>
    <div class="feedback-list">
      <div class="feedback-item ok">
        <div><strong>当前客观分</strong><span class="feedback-status ok">${stats.objectiveScore}/${stats.objectiveTotal}</span></div>
        <div>单选、多选、判断已经自动统计完成。</div>
      </div>
      <div class="feedback-item partial">
        <div><strong>主观题进度</strong></div>
        <div>简答 / 计算 / 业务核算已做 ${stats.subjectiveDone}/${stats.subjectiveTotal} 题，右侧答题卡可以随时跳转复查。</div>
      </div>
      <div class="feedback-item">
        <div><strong>接下来可以做什么</strong></div>
        <div>你可以继续点右侧题目回看答案，也可以点上方“重新抽一套”再生成新卷。</div>
      </div>
    </div>
  `;
  feedbackPanel.classList.remove("hidden");
  primaryAction.textContent = "本套已完成";
  primaryAction.disabled = true;
}

function getModeDashboardStats(mode, progressData = progressStore) {
  const questions = getQuestionsByMode(mode);
  const total = questions.length;
  const wrong = questions.filter((question) => getQuestionStatus(mode, question, progressData).key === "wrong").length;
  const done = questions.filter((question) => getQuestionStatus(mode, question, progressData).key !== "pending").length;
  const pending = Math.max(total - done, 0);
  const percent = total ? Math.round((done / total) * 100) : 0;

  let statusText = "待开始";
  if (wrong > 0) {
    statusText = `错题 ${wrong}`;
  } else if (done === 0) {
    statusText = "待开始";
  } else if (done >= total && total > 0) {
    statusText = "已完成";
  } else {
    statusText = "进行中";
  }

  let actionText = "开始练习";
  if (wrong > 0) {
    actionText = "继续复习";
  } else if (done > 0) {
    actionText = done >= total ? "继续巩固" : "继续练习";
  }

  return { total, done, pending, wrong, percent, statusText, actionText };
}

function getCourseDashboardStats(courseKey, progressData = progressStore) {
  const modes = COURSE_MODE_GROUPS[courseKey] || [];
  return modes.reduce((acc, mode) => {
    const stats = getModeDashboardStats(mode, progressData);
    acc.total += stats.total;
    acc.done += stats.done;
    acc.wrong += stats.wrong;
    return acc;
  }, { total: 0, done: 0, wrong: 0 });
}

function renderUserCenter() {
  const activeProfile = getActiveProfile();
  if (!activeProfile) return;

  if (activeProfileName) {
    activeProfileName.textContent = activeProfile.name;
  }
  if (activeProfileMeta) {
    const stats = getProgressOverview(activeProfile.progress);
    const lastModeText = activeProfile.progress.lastMode ? ` · 上次刷到 ${MODE_LABELS[activeProfile.progress.lastMode]}` : "";
    activeProfileMeta.textContent = `${stats.done} / ${stats.total} 已完成 · ${stats.wrong} 道错题${lastModeText}`;
  }
  if (chatProfileName) {
    chatProfileName.textContent = activeProfile.name;
  }

  if (!profileList) return;

  profileList.innerHTML = userCenterStore.profiles.map((profile) => {
    const stats = getProgressOverview(profile.progress);
    const isActive = profile.id === userCenterStore.activeProfileId;
    const updatedText = formatProfileTime(profile.updatedAt);
    return `
      <article class="profile-item ${isActive ? "active" : ""}">
        <div class="profile-item-main">
          <div class="profile-item-title-row">
            <strong>${escapeHtml(profile.name)}</strong>
            <span class="profile-item-tag">${isActive ? "当前使用中" : "历史存档"}</span>
          </div>
          <p>${stats.done}/${stats.total} 已完成 · 错题 ${stats.wrong} · 标记 ${stats.marked}</p>
          <span class="profile-item-time">最近更新：${escapeHtml(updatedText)}</span>
        </div>
        <div class="profile-item-actions">
          <button class="ghost-button" type="button" data-profile-action="continue" data-profile-id="${profile.id}">${isActive ? "继续当前" : "切换并继续"}</button>
          <button class="ghost-button" type="button" data-profile-action="rename" data-profile-id="${profile.id}">重命名</button>
          <button class="ghost-button" type="button" data-profile-action="delete" data-profile-id="${profile.id}">删除</button>
        </div>
      </article>
    `;
  }).join("");

  profileList.querySelectorAll("[data-profile-action]").forEach((button) => {
    button.addEventListener("click", () => handleProfileAction(button.dataset.profileAction, button.dataset.profileId));
  });
}

function getProgressOverview(progressData = progressStore) {
  const total = MODE_KEYS.reduce((sum, mode) => sum + getModeDashboardStats(mode, progressData).total, 0);
  const done = MODE_KEYS.reduce((sum, mode) => sum + getModeDashboardStats(mode, progressData).done, 0);
  const wrong = MODE_KEYS.reduce((sum, mode) => sum + getModeDashboardStats(mode, progressData).wrong, 0);
  const marked = MODE_KEYS.reduce((sum, mode) => sum + getMarkedSet(mode, progressData).size, 0);
  const pending = Math.max(total - done, 0);
  return { total, done, wrong, marked, pending };
}

function buildChatWelcomeMessage(progressData = progressStore) {
  const overview = getProgressOverview(progressData);
  const suggestedMode = pickRecommendedMode(progressData);
  const suggestedLabel = MODE_LABELS[suggestedMode] || "简答题";
  const abilityLine = "你可以直接问我进度建议、贴网页链接让我读，也可以让我先查资料库再回答。";
  if (overview.done === 0) {
    return `你好，我是 ${AI_MODEL_DISPLAY}。你现在还没开始刷题，可以先从 ${suggestedLabel} 开始。${abilityLine}`;
  }
  if (overview.wrong > 0) {
    return `你好，我是 ${AI_MODEL_DISPLAY}。你当前已完成 ${overview.done} 题，累计错题 ${overview.wrong} 题，现在最适合优先回刷 ${suggestedLabel}。${abilityLine}`;
  }
  return `你好，我是 ${AI_MODEL_DISPLAY}。你当前已完成 ${overview.done} 题，整体状态不错。${abilityLine}`;
}

function renderHomeChatMessages() {
  if (!homeChatMessages) return;
  const history = Array.isArray(progressStore.homeChatHistory) ? progressStore.homeChatHistory : [];
  const displayMessages = history.length
    ? history
    : [{
      role: "assistant",
      content: buildChatWelcomeMessage(progressStore),
      capabilities: buildEnabledChatFeatureLabels(),
      sources: [],
    }];

  homeChatMessages.innerHTML = displayMessages.map((message) => {
    const roleLabel = message.role === "user" ? "你" : AI_MODEL_DISPLAY;
    const metaHtml = renderHomeChatMessageMetaHtml(message);
    const sourceHtml = renderHomeChatSourceListHtml(message.sources);
    return `
      <div class="home-chat-message ${message.role === "user" ? "user" : "assistant"}">
        <div class="home-chat-message-role">${roleLabel}</div>
        <div class="home-chat-message-body">${formatChatMessageHtml(message.content)}</div>
        ${metaHtml}
        ${sourceHtml}
      </div>
    `;
  }).join("");
  homeChatMessages.scrollTop = homeChatMessages.scrollHeight;
}

function renderHomeChatMessageMetaHtml(message) {
  const capabilityLabels = normalizeStringList(message?.capabilities);
  const timeText = message?.createdAt ? formatProfileTime(message.createdAt) : "";
  if (!timeText && !capabilityLabels.length) return "";
  return `
    <div class="home-chat-message-meta">
      ${timeText ? `<span class="home-chat-message-time">${escapeHtml(timeText)}</span>` : ""}
      ${capabilityLabels.map((label) => `<span class="home-chat-capability">${escapeHtml(label)}</span>`).join("")}
    </div>
  `;
}

function renderHomeChatSourceListHtml(sources) {
  const normalizedSources = normalizeHomeChatSources(sources);
  if (!normalizedSources.length) return "";
  return `
    <div class="home-chat-source-list">
      <div class="home-chat-source-title">本次参考</div>
      ${normalizedSources.map((source) => source.url
        ? `<a class="home-chat-source-item" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.label)}</a>`
        : `<div class="home-chat-source-item">${escapeHtml(source.label)}</div>`).join("")}
    </div>
  `;
}

function formatChatMessageHtml(value) {
  const raw = String(value || "").trim();
  const escaped = escapeHtml(raw);
  return escaped
    .replace(/(https?:\/\/[^\s<]+)/gu, (url) => `<a href="${url}" target="_blank" rel="noreferrer">${url}</a>`)
    .replace(/\n/gu, "<br>");
}

function updateHomeChatStatus(text) {
  if (!homeChatStatus) return;
  homeChatStatus.textContent = text || buildHomeChatStatusText();
}

function buildHomeChatStatusText() {
  if (state.homeChatLoading) {
    return `${AI_MODEL_DISPLAY} 正在思考...`;
  }
  const labels = buildEnabledChatFeatureLabels();
  return labels.length ? `已连接 ${AI_MODEL_DISPLAY} · ${labels.join(" / ")}` : `已连接 ${AI_MODEL_DISPLAY} · 仅进度建议`;
}

function buildEnabledChatFeatureLabels(progressData = progressStore) {
  const labels = [];
  if (isKnowledgeChatEnabled(progressData)) {
    labels.push("资料库检索");
  }
  if (progressData?.chatWebSearchEnabled !== false) {
    labels.push("联网搜索");
  }
  if (progressData?.chatUrlReadEnabled !== false) {
    labels.push("网页阅读");
  }
  return labels;
}

function isKnowledgeBaseAvailable() {
  return Array.isArray(state.knowledgeBase?.items) && state.knowledgeBase.items.length > 0;
}

function isKnowledgeChatEnabled(progressData = progressStore) {
  return progressData?.chatKnowledgeEnabled !== false && isKnowledgeBaseAvailable();
}

function syncProgressToggles() {
  if (shuffleQuestionOrderToggle) {
    shuffleQuestionOrderToggle.checked = !!progressStore.shuffleQuestionOrder;
  }
  if (memorizeModeToggle) {
    memorizeModeToggle.checked = !!progressStore.memorizeMode;
  }
  if (shuffleOptionsToggle) {
    shuffleOptionsToggle.checked = !!progressStore.shuffleChoiceOptions;
  }
  if (chatKnowledgeToggle) {
    chatKnowledgeToggle.disabled = !isKnowledgeBaseAvailable();
    chatKnowledgeToggle.checked = isKnowledgeChatEnabled();
  }
  if (chatWebSearchToggle) {
    chatWebSearchToggle.checked = progressStore.chatWebSearchEnabled !== false;
  }
  if (chatUrlReadToggle) {
    chatUrlReadToggle.checked = progressStore.chatUrlReadEnabled !== false;
  }
}

function handleHomeChatSettingToggle(key, checked) {
  progressStore[key] = !!checked;
  saveProgress();
  renderHomeChatMessages();
  updateHomeChatStatus("聊天能力已更新");
}

function handleProfileAction(action, profileId) {
  if (action === "continue") {
    continueWithProfile(profileId);
    return;
  }
  if (action === "rename") {
    renameProfile(profileId);
    return;
  }
  if (action === "delete") {
    deleteProfile(profileId);
  }
}

function createProfileFromInput(forceQuickName = false) {
  const typedName = profileNameInput?.value?.trim();
  const name = typedName || (forceQuickName ? `新练习 ${userCenterStore.profiles.length + 1}` : "");
  if (!name) {
    profileNameInput?.focus();
    updateHomeChatStatus("先给新存档起个名字");
    return;
  }

  const profile = createProfileRecord(name);
  userCenterStore.profiles.unshift(profile);
  userCenterStore.activeProfileId = profile.id;
  progressStore = profile.progress;
  resetWrongReviewState();
  profileNameInput.value = "";
  saveProgress();
  renderUserCenter();
  renderHomeChatMessages();
  updateHomeChatStatus(`已切换到新存档：${profile.name}`);
}

function renameProfile(profileId) {
  const profile = userCenterStore.profiles.find((item) => item.id === profileId);
  if (!profile) return;
  const nextName = window.prompt("给这个练习存档改个名字：", profile.name);
  if (!nextName) return;
  profile.name = nextName.trim() || profile.name;
  profile.updatedAt = new Date().toISOString();
  saveUserCenterStore();
  renderUserCenter();
  renderHomeChatMessages();
  updateHomeChatStatus(`已重命名为：${profile.name}`);
}

function deleteProfile(profileId) {
  const profile = userCenterStore.profiles.find((item) => item.id === profileId);
  if (!profile) return;
  const ok = window.confirm(`确定删除存档「${profile.name}」吗？这个存档里的做题进度和聊天记录会一起删掉。`);
  if (!ok) return;
  const deletingActive = userCenterStore.activeProfileId === profileId;

  userCenterStore.profiles = userCenterStore.profiles.filter((item) => item.id !== profileId);
  if (!userCenterStore.profiles.length) {
    const freshProfile = createProfileRecord("默认练习");
    userCenterStore.profiles = [freshProfile];
    userCenterStore.activeProfileId = freshProfile.id;
  } else if (userCenterStore.activeProfileId === profileId) {
    userCenterStore.activeProfileId = userCenterStore.profiles[0].id;
  }

  progressStore = getActiveProfile().progress;
  resetWrongReviewState();
  syncProgressToggles();
  saveUserCenterStore();
  renderHomeDashboard();
  renderUserCenter();
  renderHomeChatMessages();
  updateHomeChatStatus("存档已删除");
  if (practiceView.classList.contains("active") && deletingActive) {
    goHome();
  }
}

function continueWithProfile(profileId = userCenterStore.activeProfileId) {
  const nextProfile = userCenterStore.profiles.find((item) => item.id === profileId);
  if (!nextProfile) return;

  if (userCenterStore.activeProfileId !== profileId) {
    saveCurrentQuestionState();
    userCenterStore.activeProfileId = profileId;
    progressStore = nextProfile.progress;
    resetWrongReviewState();
    syncProgressToggles();
    saveUserCenterStore();
    renderHomeDashboard();
    renderUserCenter();
    renderHomeChatMessages();
    updateHomeChatStatus(`已切换到存档：${nextProfile.name}`);
  }

  const targetMode = progressStore.lastMode || pickRecommendedMode(progressStore);
  if (targetMode) {
    startMode(targetMode);
  }
}

function pickRecommendedMode(progressData = progressStore) {
  const ranked = MODE_KEYS.map((mode) => {
    const stats = getModeDashboardStats(mode, progressData);
    return { mode, wrong: stats.wrong, pending: stats.pending, total: stats.total };
  }).filter((item) => item.total > 0);

  const byWrong = [...ranked].sort((a, b) => b.wrong - a.wrong)[0];
  if (byWrong?.wrong > 0) return byWrong.mode;
  const byPending = [...ranked].sort((a, b) => b.pending - a.pending)[0];
  return byPending?.mode || "short";
}

async function submitProgressSuggestionRequest() {
  await submitHomeChat("请根据我当前这个存档的学习进度，给我一个直接能照着执行的复习建议，最好告诉我先刷什么、为什么、怎么安排下一轮。");
}

async function submitHomeChat(forcedMessage) {
  if (state.homeChatLoading) return;
  const message = String(forcedMessage || homeChatInput?.value || "").trim();
  if (!message) {
    homeChatInput?.focus();
    return;
  }

  appendHomeChatMessage("user", message);
  if (!forcedMessage && homeChatInput) {
    homeChatInput.value = "";
  }

  state.homeChatLoading = true;
  updateHomeChatStatus();
  homeChatSendButton && (homeChatSendButton.disabled = true);
  chatSuggestButton && (chatSuggestButton.disabled = true);
  chatClearButton && (chatClearButton.disabled = true);

  try {
    const reply = await requestHomeChatReply(message);
    appendHomeChatMessage("assistant", reply.content, reply);
    updateHomeChatStatus("建议已生成");
  } catch (error) {
    appendHomeChatMessage("assistant", `这次没连上，我先本地给你一句建议：${buildChatWelcomeMessage(progressStore)}\n\n错误信息：${error.message || "请求失败"}`);
    updateHomeChatStatus("这次连接失败，稍后再试");
  } finally {
    state.homeChatLoading = false;
    homeChatSendButton && (homeChatSendButton.disabled = false);
    chatSuggestButton && (chatSuggestButton.disabled = false);
    chatClearButton && (chatClearButton.disabled = false);
    updateHomeChatStatus();
  }
}

async function requestHomeChatReply(userMessage) {
  const context = buildStudyContextForChat(getActiveProfile());
  const history = (progressStore.homeChatHistory || []).slice(-10).map((item) => ({
    role: item.role,
    content: item.content,
  }));

  const urls = extractUrlsFromText(userMessage);
  const knowledgeMatches = isKnowledgeChatEnabled() ? findKnowledgeBaseMatches(userMessage, 5) : [];
  const allowUrlRead = progressStore.chatUrlReadEnabled !== false && urls.length > 0;
  const allowWebSearch = progressStore.chatWebSearchEnabled !== false || allowUrlRead;
  const systemPrompt = [
    `你是 ${AI_MODEL_DISPLAY}，也是一个中文学习搭子。`,
    "先结合用户当前存档进度回答。",
    "如果我提供了本地资料库片段，优先结合这些片段回答。",
    "只有在用户明确要求最新资料、联网搜索、官网、新闻、网页链接，或问题本身需要联网核实时，才调用 web_search。",
    "如果用户消息里带了网页链接并且允许网页阅读，先打开页面再回答。",
    "回答风格：中文，直接、清楚、少空话，必要时用短列表。",
  ].join("\n");

  const input = [
    {
      role: "system",
      content: [{ type: "input_text", text: systemPrompt }],
    },
    {
      role: "system",
      content: [{ type: "input_text", text: `当前存档与学习进度：\n${context}` }],
    },
  ];

  if (knowledgeMatches.length) {
    input.push({
      role: "system",
      content: [{ type: "input_text", text: buildKnowledgeContext(knowledgeMatches) }],
    });
  }

  history.forEach((item) => {
    input.push({
      role: item.role,
      content: [{ type: "input_text", text: item.content }],
    });
  });

  input.push({
    role: "user",
    content: [{
      type: "input_text",
      text: buildEnhancedHomeChatPrompt(userMessage, {
        urls,
        knowledgeMatches,
        allowWebSearch,
        allowUrlRead,
      }),
    }],
  });

  const body = {
    model: AI_CONFIG.model,
    temperature: 0.45,
    text: { verbosity: "low" },
    input,
  };

  if (allowWebSearch) {
    body.tools = [{ type: "web_search" }];
  }

  const response = await postAiResponsesRequest(body);
  if (!response.ok) {
    throw new Error(extractAiError(await response.text()) || "聊天请求失败");
  }
  const data = await response.json();
  const webInfo = extractResponseWebActions(data);
  const content = extractResponseText(data).trim() || "我已经看完你的进度了，建议先从错题最多的板块开始回刷。";
  const capabilities = dedupeStringList([
    ...(knowledgeMatches.length ? ["资料库检索"] : []),
    ...webInfo.capabilities,
  ]);
  const sources = dedupeHomeChatSources([
    ...knowledgeMatches.map((item) => buildKnowledgeSourceEntry(item)),
    ...webInfo.sources,
  ]);
  return { content, capabilities, sources };
}

function buildStudyContextForChat(profile) {
  const progressData = profile?.progress || progressStore;
  const overview = getProgressOverview(progressData);
  const modeLines = MODE_KEYS.map((mode) => {
    const stats = getModeDashboardStats(mode, progressData);
    return `${COURSE_LABELS[mode]} - ${MODE_LABELS[mode]}：总题 ${stats.total}，已做 ${stats.done}，未做 ${stats.pending}，错题 ${stats.wrong}`;
  });
  return [
    `存档名称：${profile?.name || "默认练习"}`,
    `总完成：${overview.done}/${overview.total}`,
    `当前错题：${overview.wrong}`,
    `当前标记：${overview.marked}`,
    `推荐优先板块：${MODE_LABELS[pickRecommendedMode(progressData)] || "简答题"}`,
    ...modeLines,
  ].join("\n");
}

function buildEnhancedHomeChatPrompt(userMessage, options = {}) {
  const notes = ["请先结合当前学习进度回答。"];
  if (options.knowledgeMatches?.length) {
    notes.push("已附上本地资料库相关片段，优先参考这些内容。资料库片段已经够用时，不要为了凑来源去联网。");
  } else {
    notes.push("当前没有命中明显相关的本地资料片段，可以直接结合进度回答；如果用户明确要最新资料，再考虑联网。");
  }
  if (options.urls?.length) {
    if (options.allowUrlRead) {
      notes.push(`用户消息中包含网址：${options.urls.join(" ，")}。请先打开相关网页阅读，再回答。`);
    } else {
      notes.push(`用户消息中包含网址，但当前没有开启网页阅读：${options.urls.join(" ，")}。`);
    }
  }
  if (options.allowWebSearch) {
    notes.push("本次允许联网搜索，但只在确实需要最新信息、官网说明、网页内容或用户明确要求搜索时再使用。");
  } else {
    notes.push("本次不要联网，只能基于存档进度和本地资料库回答。");
  }
  return `${notes.join("\n\n")}\n\n用户问题：\n${userMessage}`;
}

function prepareKnowledgeBase(raw) {
  const items = Array.isArray(raw?.items)
    ? raw.items.map((item, index) => ({
      id: String(item?.id || `kb-${index + 1}`),
      course: String(item?.course || "未分类"),
      source_type: String(item?.source_type || "doc"),
      source_title: String(item?.source_title || "资料库"),
      section_title: String(item?.section_title || "资料片段"),
      page: Number.isFinite(Number(item?.page)) ? Number(item.page) : null,
      text: String(item?.text || "").trim(),
      search_text: String(item?.search_text || "").trim(),
      _searchBlob: normalizeSearchText(item?.search_text || [item?.course, item?.source_title, item?.section_title, item?.text].filter(Boolean).join(" ")),
    })).filter((item) => item.text)
    : [];
  return {
    meta: raw?.meta && typeof raw.meta === "object" ? raw.meta : {},
    items,
  };
}

function normalizeSearchText(value) {
  return String(value || "").toLowerCase().replace(/\s+/gu, "");
}

function extractUrlsFromText(text) {
  return Array.from(new Set((String(text || "").match(/https?:\/\/[^\s)\]}>]+/gu) || []).map((item) => item.trim())));
}

function buildSearchTerms(query) {
  const source = String(query || "").toLowerCase().replace(/https?:\/\/[^\s]+/gu, " ");
  const terms = new Set();
  const stopTerms = new Set(["什么", "怎么", "一下", "这个", "那个", "现在", "就是", "一个", "一些", "有没有", "以及", "然后", "还是"]);

  (source.match(/[a-z0-9_+.\-/#:]{2,}/gu) || []).forEach((token) => {
    const clean = token.trim();
    if (clean.length >= 2) {
      terms.add(clean);
    }
  });

  (source.match(/[\u4e00-\u9fff]{2,}/gu) || []).forEach((segment) => {
    if (segment.length <= 8 && !stopTerms.has(segment)) {
      terms.add(segment);
    }
    const maxGram = Math.min(5, segment.length);
    for (let size = maxGram; size >= 2; size -= 1) {
      for (let index = 0; index <= segment.length - size; index += 1) {
        const gram = segment.slice(index, index + size);
        if (!stopTerms.has(gram)) {
          terms.add(gram);
        }
      }
    }
  });

  return Array.from(terms).filter((term) => term.length >= 2).slice(0, 80);
}

function findKnowledgeBaseMatches(query, limit = 5) {
  if (!isKnowledgeBaseAvailable()) return [];
  const normalizedQuery = normalizeSearchText(String(query || "").replace(/https?:\/\/[^\s]+/gu, " "));
  const terms = buildSearchTerms(query);
  const hints = normalizeSearchText(query);
  const scored = [];

  state.knowledgeBase.items.forEach((item) => {
    const blob = item._searchBlob || "";
    if (!blob) return;
    let score = 0;

    if (normalizedQuery && normalizedQuery.length >= 4 && blob.includes(normalizedQuery)) {
      score += 120;
    }

    terms.forEach((term) => {
      if (!blob.includes(term)) return;
      const isChinese = /[\u4e00-\u9fff]/u.test(term);
      score += isChinese ? Math.min(28, 6 + term.length * 3) : Math.min(24, 4 + term.length * 2);
    });

    if ((hints.includes("python") || hints.includes("程序") || hints.includes("字符串") || hints.includes("循环") || hints.includes("字典") || hints.includes("函数")) && item.course === "Python") {
      score += 12;
    }
    if ((hints.includes("中财") || hints.includes("财务") || hints.includes("收入") || hints.includes("折扣") || hints.includes("合同") || hints.includes("无形资产")) && item.course === "中级财务") {
      score += 12;
    }

    if (score > 0) {
      scored.push({ ...item, _score: score });
    }
  });

  scored.sort((a, b) => b._score - a._score || a.text.length - b.text.length);
  return scored.slice(0, limit);
}

function buildKnowledgeContext(matches) {
  const lines = ["本地资料库命中（按相关度排序）："];
  matches.forEach((item, index) => {
    lines.push(`[${index + 1}] ${buildKnowledgeSourceLabel(item)}`);
    lines.push(item.text);
  });
  return lines.join("\n\n");
}

function buildKnowledgeSourceLabel(item) {
  const bits = [item.course, item.source_title];
  if (item.page) {
    bits.push(`第${item.page}页`);
  }
  if (item.section_title) {
    bits.push(item.section_title);
  }
  return bits.filter(Boolean).join(" · ");
}

function buildKnowledgeSourceEntry(item) {
  return {
    type: "knowledge",
    label: `资料库：${buildKnowledgeSourceLabel(item)}`,
    url: "",
  };
}

function normalizeHomeChatSources(value) {
  if (!Array.isArray(value)) return [];
  return value.map((source) => ({
    type: String(source?.type || "note"),
    label: String(source?.label || "").trim(),
    url: String(source?.url || "").trim(),
  })).filter((source) => source.label);
}

function dedupeHomeChatSources(value) {
  const sourceMap = new Map();
  normalizeHomeChatSources(value).forEach((source) => {
    const key = `${source.type}::${source.label}::${source.url}`;
    if (!sourceMap.has(key)) {
      sourceMap.set(key, source);
    }
  });
  return Array.from(sourceMap.values()).slice(0, 8);
}

function dedupeStringList(value) {
  return Array.from(new Set(normalizeStringList(value))).slice(0, 8);
}

function resetWrongReviewState() {
  state.wrongReviewPlanLoading = false;
  state.wrongReviewItemLoadingKey = "";
  state.wrongReviewPlanHtml = "";
  state.wrongReviewItemReviews = {};
}

function renderWrongReviewCenter() {
  if (!wrongReviewList || !wrongReviewModeGrid) return;

  const profile = getActiveProfile();
  const overview = getProgressOverview(progressStore);
  const items = buildWrongReviewItems(progressStore);
  const modeSummaries = buildWrongReviewModeSummaries(items);
  const focusSummary = modeSummaries[0] || null;

  if (wrongReviewProfileName) {
    wrongReviewProfileName.textContent = profile?.name || "默认练习";
  }
  if (wrongReviewProfileMeta) {
    wrongReviewProfileMeta.textContent = `${overview.done}/${overview.total} 已完成 · 错题复盘跟随当前存档单独保存`;
  }
  if (wrongReviewTotalCount) {
    wrongReviewTotalCount.textContent = String(items.length);
  }
  if (wrongReviewTotalMeta) {
    wrongReviewTotalMeta.textContent = items.length
      ? `当前累计 ${items.length} 道错题，覆盖 ${modeSummaries.length} 个板块`
      : "当前还没有错题，先去任意板块刷题";
  }
  if (wrongReviewFocusMode) {
    wrongReviewFocusMode.textContent = focusSummary ? focusSummary.label : "暂无";
  }
  if (wrongReviewFocusMeta) {
    wrongReviewFocusMeta.textContent = focusSummary
      ? `${focusSummary.count} 道错题，建议优先清掉这一块`
      : "等你做出错题后，这里会自动给出优先级";
  }
  if (wrongReviewModeCount) {
    wrongReviewModeCount.textContent = String(modeSummaries.length);
  }
  if (wrongReviewModeMeta) {
    wrongReviewModeMeta.textContent = items.length
      ? buildWrongReviewCourseMeta(items)
      : "按板块回刷会更高效";
  }
  if (wrongReviewModeCaption) {
    wrongReviewModeCaption.textContent = focusSummary
      ? `先刷 ${focusSummary.label}，再按错题数量从高到低逐个清掉。`
      : "先去做题，错题会自动沉淀到这里。";
  }
  if (wrongReviewListMeta) {
    wrongReviewListMeta.textContent = items.length
      ? `共 ${items.length} 道错题。每题都能直接回原题，也能交给 ${AI_MODEL_DISPLAY} 单独复盘。`
      : "当前没有错题清单。";
  }
  if (wrongReviewPlanButton) {
    wrongReviewPlanButton.disabled = state.wrongReviewPlanLoading || items.length === 0;
    wrongReviewPlanButton.textContent = state.wrongReviewPlanLoading ? "正在生成复习方案..." : "生成本轮复习方案";
  }
  if (wrongReviewPlanHint) {
    wrongReviewPlanHint.textContent = items.length === 0
      ? "先去刷题，错题出来后这里会自动生成复习方案。"
      : (state.wrongReviewPlanLoading
        ? `${AI_MODEL_DISPLAY} 正在分析你的错题分布...`
        : `当前使用 ${AI_MODEL_DISPLAY}，根据你的错题生成优先复习顺序。`);
  }

  if (state.wrongReviewPlanHtml) {
    wrongReviewPlanPanel.innerHTML = state.wrongReviewPlanHtml;
    wrongReviewPlanPanel.classList.remove("hidden");
  } else {
    wrongReviewPlanPanel.classList.add("hidden");
    wrongReviewPlanPanel.innerHTML = "";
  }

  if (!items.length) {
    wrongReviewModeGrid.innerHTML = `
      <div class="wrong-review-empty">
        <strong>还没有错题</strong>
        <p>你先去刷题，做错的题会自动进入这里。</p>
      </div>
    `;
    wrongReviewList.innerHTML = `
      <div class="wrong-review-empty">
        <strong>当前没有需要复盘的题</strong>
        <p>等你做出错题后，可以在这里集中回看答案、回原题继续刷，或者直接让 GPT 帮你拆解。</p>
      </div>
    `;
    return;
  }

  wrongReviewModeGrid.innerHTML = modeSummaries.map((summary) => `
    <article class="wrong-review-mode-card">
      <div class="wrong-review-mode-head">
        <div>
          <span class="academy-summary-label">${escapeHtml(summary.course)}</span>
          <h4>${escapeHtml(summary.label)}</h4>
          <p>${escapeHtml(buildWrongReviewModeSummaryText(summary))}</p>
        </div>
        <strong>${summary.count}</strong>
      </div>
      <button
        class="ghost-button"
        type="button"
        data-review-mode="${summary.mode}"
        data-review-session-id="${summary.sessionId || ""}"
      >${summary.mode === "financeExam" ? "进入这套模拟卷错题" : "只刷这类错题"}</button>
    </article>
  `).join("");

  wrongReviewList.innerHTML = items.map((item) => renderWrongReviewItemCard(item)).join("");

  wrongReviewModeGrid.querySelectorAll("[data-review-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      openWrongModeReview(button.dataset.reviewMode, button.dataset.reviewSessionId || "");
    });
  });

  wrongReviewList.querySelectorAll("[data-review-open]").forEach((button) => {
    button.addEventListener("click", () => {
      openWrongQuestionFromReview(
        button.dataset.reviewMode,
        button.dataset.reviewQuestionId,
        { sessionId: button.dataset.reviewSessionId || "" },
      );
    });
  });

  wrongReviewList.querySelectorAll("[data-review-ai]").forEach((button) => {
    button.addEventListener("click", () => {
      handleWrongReviewItemRequest(
        button.dataset.reviewMode,
        button.dataset.reviewQuestionId,
        button.dataset.reviewSessionId || "",
      );
    });
  });
}

function buildWrongReviewItems(progressData = progressStore) {
  if (!state.data) return [];
  const items = [];

  MODE_KEYS.forEach((mode) => {
    const wrongSet = getWrongSet(mode, progressData);
    if (!wrongSet.size) return;

    getQuestionsByMode(mode).forEach((question, index) => {
      if (!wrongSet.has(question.id)) return;
      items.push({
        reviewKey: getWrongReviewItemKey({ mode, questionId: question.id }),
        mode,
        questionId: question.id,
        question,
        course: COURSE_LABELS[mode] || "综合",
        kind: getQuestionKind(mode, question),
        kindLabel: getQuestionTypeLabel(mode, question),
        title: question?.title?.trim() || `${MODE_LABELS[mode] || "题目"} ${String(index + 1).padStart(3, "0")}`,
        promptText: buildWrongReviewPromptText(mode, question),
        answerText: buildWrongReviewAnswerText(mode, question),
        draftText: getWrongReviewDraftText(mode, question, progressData),
        sessionId: "",
        sessionTitle: "",
      });
    });
  });

  const financeWrongSet = new Set(progressData.financeExamWrongIds || []);
  if (financeWrongSet.size) {
    getAllFinanceExamQuestions(progressData).forEach(({ session, question, index }) => {
      if (!financeWrongSet.has(question.id)) return;
      items.push({
        reviewKey: getWrongReviewItemKey({ mode: "financeExam", questionId: question.id, sessionId: session.id }),
        mode: "financeExam",
        questionId: question.id,
        question,
        course: COURSE_LABELS.financeExam,
        kind: getQuestionKind("financeExam", question),
        kindLabel: getQuestionTypeLabel("financeExam", question),
        title: question?.title?.trim() || `模拟题 ${String(index + 1).padStart(3, "0")}`,
        promptText: buildWrongReviewPromptText("financeExam", question),
        answerText: buildWrongReviewAnswerText("financeExam", question),
        draftText: getWrongReviewDraftText("financeExam", question, progressData),
        sessionId: session.id,
        sessionTitle: session.title || `模拟卷 ${formatFinanceExamTime(session.createdAt)}`,
      });
    });
  }

  const modeRank = {
    financeExam: -1,
    short: 0,
    calc: 1,
    codefill: 2,
    fill: 3,
    single: 4,
    judge: 5,
    program: 6,
  };

  return items.sort((a, b) => {
    const rankDiff = (modeRank[a.mode] ?? 99) - (modeRank[b.mode] ?? 99);
    if (rankDiff !== 0) return rankDiff;
    if (a.sessionTitle !== b.sessionTitle) {
      return String(a.sessionTitle || "").localeCompare(String(b.sessionTitle || ""), "zh-CN");
    }
    return a.title.localeCompare(b.title, "zh-CN");
  });
}

function buildWrongReviewModeSummaries(items) {
  const summaryMap = new Map();

  items.forEach((item) => {
    if (!summaryMap.has(item.mode)) {
      summaryMap.set(item.mode, {
        mode: item.mode,
        label: MODE_LABELS[item.mode] || item.kindLabel,
        course: item.course,
        count: 0,
        firstItem: item,
        kindLabels: new Set(),
        sessionCounts: new Map(),
      });
    }

    const summary = summaryMap.get(item.mode);
    summary.count += 1;
    summary.kindLabels.add(item.kindLabel);

    if (item.mode === "financeExam" && item.sessionId) {
      const previous = summary.sessionCounts.get(item.sessionId) || { count: 0, title: item.sessionTitle };
      previous.count += 1;
      previous.title = item.sessionTitle;
      summary.sessionCounts.set(item.sessionId, previous);
    }
  });

  return [...summaryMap.values()].map((summary) => {
    const sessionEntry = [...summary.sessionCounts.entries()]
      .sort((a, b) => b[1].count - a[1].count)[0];
    return {
      mode: summary.mode,
      label: summary.label,
      course: summary.course,
      count: summary.count,
      kindLabels: [...summary.kindLabels],
      sessionId: sessionEntry?.[0] || summary.firstItem?.sessionId || "",
      sessionTitle: sessionEntry?.[1]?.title || summary.firstItem?.sessionTitle || "",
    };
  }).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "zh-CN"));
}

function buildWrongReviewCourseMeta(items) {
  const financeCount = items.filter((item) => item.course === "中级财务").length;
  const pythonCount = items.filter((item) => item.course === "Python").length;
  return `中级财务 ${financeCount} 道 · Python ${pythonCount} 道`;
}

function buildWrongReviewModeSummaryText(summary) {
  if (summary.mode === "financeExam") {
    return summary.sessionTitle
      ? `优先回到 ${summary.sessionTitle} 清错`
      : "模拟卷里的错题会集中在这里";
  }
  const kindText = summary.kindLabels.slice(0, 3).join(" / ");
  return kindText
    ? `${summary.course} · ${kindText}`
    : `${summary.course} · 错题 ${summary.count} 道`;
}

function renderWrongReviewItemCard(item) {
  const review = state.wrongReviewItemReviews[item.reviewKey];
  const loading = state.wrongReviewItemLoadingKey === item.reviewKey;
  return `
    <article class="wrong-review-item">
      <div class="wrong-review-item-head">
        <div class="wrong-review-item-tags">
          <span class="practice-course-badge">${escapeHtml(item.course)}</span>
          <span class="practice-mode-badge">${escapeHtml(MODE_LABELS[item.mode] || item.kindLabel)}</span>
          <span class="practice-question-type-chip">${escapeHtml(item.kindLabel)}</span>
          ${item.sessionTitle ? `<span class="practice-question-index-chip">${escapeHtml(item.sessionTitle)}</span>` : ""}
        </div>
        <div class="wrong-review-actions">
          <button
            class="ghost-button"
            type="button"
            data-review-open="1"
            data-review-mode="${item.mode}"
            data-review-question-id="${item.questionId}"
            data-review-session-id="${item.sessionId || ""}"
          >去原题</button>
          <button
            class="primary-button"
            type="button"
            data-review-ai="1"
            data-review-mode="${item.mode}"
            data-review-question-id="${item.questionId}"
            data-review-session-id="${item.sessionId || ""}"
            ${loading ? "disabled" : ""}
          >${loading ? "GPT复盘中..." : "GPT复盘这题"}</button>
        </div>
      </div>

      <h4 class="wrong-review-item-title">${escapeHtml(item.title)}</h4>

      <div class="wrong-review-copy-grid">
        <section class="wrong-review-copy-block">
          <span class="wrong-review-copy-label">题目速看</span>
          <div class="wrong-review-copy-text">${formatPlainTextHtml(item.promptText || "未识别到题干")}</div>
        </section>
        <section class="wrong-review-copy-block answer">
          <span class="wrong-review-copy-label">参考答案</span>
          <div class="wrong-review-copy-text">${formatPlainTextHtml(item.answerText || "去原题查看完整答案")}</div>
        </section>
        ${item.draftText ? `
          <section class="wrong-review-copy-block draft">
            <span class="wrong-review-copy-label">你上次写的</span>
            <div class="wrong-review-copy-text">${formatPlainTextHtml(item.draftText)}</div>
          </section>
        ` : ""}
      </div>

      ${review ? `
        <div class="wrong-review-ai-result">
          ${buildWrongReviewAiHtml(item, review)}
        </div>
      ` : ""}
    </article>
  `;
}

function getAllFinanceExamQuestions(progressData = progressStore) {
  const sessions = Array.isArray(progressData?.financeExamSessions) ? progressData.financeExamSessions : [];
  return sessions.flatMap((session) => (session.questions || []).map((question, index) => ({
    session,
    question,
    index,
  })));
}

function getWrongReviewItemKey(item) {
  return `${item.mode}::${item.sessionId || "default"}::${item.questionId}`;
}

function buildWrongReviewPromptText(mode, question) {
  const kind = getQuestionKind(mode, question);
  if (isFillMode(mode)) {
    return buildFillReadableStem(question);
  }
  if (kind === "single" || kind === "multi" || kind === "judge") {
    const optionsText = (question.options || [])
      .map((option, index) => `${CHOICE_DISPLAY_LABELS[index] || option.key}. ${option.text}`)
      .join("\n");
    return `${htmlToReadableText(question.stem_html || "")}\n${optionsText}`.trim();
  }
  return htmlToReadableText(question.prompt_html || "");
}

function buildWrongReviewAnswerText(mode, question) {
  const kind = getQuestionKind(mode, question);
  if (isFillMode(mode)) {
    return buildFillAnswerText(question);
  }
  if (kind === "single") {
    const option = (question.options || []).find((item) => item.key === question.answer_key);
    const label = getStaticChoiceLabel(question, question.answer_key);
    return `${label}. ${option?.text || question.answer_text || ""}`.trim();
  }
  if (kind === "multi") {
    return buildMultipleAnswerText(question) || (question.answer_texts || []).join("；");
  }
  if (kind === "judge") {
    const option = (question.options || []).find((item) => item.key === question.answer_key);
    return option?.text || question.answer_text || "";
  }
  return htmlToReadableText(question.answer_html || "");
}

function buildFillReadableStem(question) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = question.stem_html || "";
  wrapper.querySelectorAll(".blank-slot").forEach((slot, index) => {
    const label = question.blank_labels?.[index] || `填空${index + 1}`;
    slot.replaceWith(document.createTextNode(`【${label}】`));
  });
  return htmlToReadableText(wrapper.innerHTML);
}

function buildFillAnswerText(question) {
  const answerCount = Math.max(
    Array.isArray(question.display_answers) ? question.display_answers.length : 0,
    Array.isArray(question.answers) ? question.answers.length : 0,
  );
  return Array.from({ length: answerCount }, (_, index) => {
    const label = question.blank_labels?.[index] || `填空${index + 1}`;
    const display = question.display_answers?.[index] || "";
    const fallback = question.answers?.[index]?.[0] || "";
    return `${label}：${display || fallback}`;
  }).join("；");
}

function getWrongReviewDraftText(mode, question, progressData = progressStore) {
  if (mode === "program") {
    return String(progressData.programAnswers?.[question.id] || "").trim();
  }
  if (mode === "financeExam" && ["short", "calc", "business"].includes(getQuestionKind(mode, question))) {
    return String(progressData.financeExamAnswerDrafts?.[question.id] || "").trim();
  }
  return "";
}

function openWrongModeReview(mode, sessionId = "") {
  if (mode === "financeExam") {
    startMode("financeExam", { sessionId, wrongOnly: true });
    return;
  }
  startMode(mode, { wrongOnly: true });
}

function openWrongQuestionFromReview(mode, questionId, options = {}) {
  startMode(mode, { sessionId: options.sessionId || "" });
  const targetIndex = state.currentList.findIndex((item) => item.id === questionId);
  if (targetIndex >= 0) {
    state.currentIndex = targetIndex;
    renderCurrentQuestion();
  }
}

async function handleWrongReviewPlanRequest() {
  const items = buildWrongReviewItems(progressStore);
  if (!items.length || state.wrongReviewPlanLoading) return;

  state.wrongReviewPlanLoading = true;
  renderWrongReviewCenter();

  try {
    const plan = await requestWrongReviewPlan(items);
    state.wrongReviewPlanHtml = buildWrongReviewPlanHtml(plan);
  } catch (error) {
    state.wrongReviewPlanHtml = `
      <h3>${AI_MODEL_DISPLAY} · 错题复习方案暂时没生成出来</h3>
      <div class="feedback-list">
        <div class="feedback-item bad">
          <div><strong>当前状态</strong><span class="feedback-status bad">稍后再试</span></div>
          <div>${escapeHtml(error.message || "这次请求失败了。")}</div>
        </div>
      </div>
    `;
  } finally {
    state.wrongReviewPlanLoading = false;
    renderWrongReviewCenter();
  }
}

async function handleWrongReviewItemRequest(mode, questionId, sessionId = "") {
  const item = buildWrongReviewItems(progressStore)
    .find((entry) => entry.mode === mode && entry.questionId === questionId && (entry.sessionId || "") === sessionId);
  if (!item || state.wrongReviewItemLoadingKey) return;

  state.wrongReviewItemLoadingKey = item.reviewKey;
  renderWrongReviewCenter();

  try {
    state.wrongReviewItemReviews[item.reviewKey] = await requestWrongQuestionReview(item);
  } catch (error) {
    state.wrongReviewItemReviews[item.reviewKey] = {
      error: String(error.message || "这次请求失败了。"),
    };
  } finally {
    state.wrongReviewItemLoadingKey = "";
    renderWrongReviewCenter();
  }
}

async function requestWrongQuestionReview(item) {
  const payload = {
    课程: item.course,
    板块: MODE_LABELS[item.mode] || item.mode,
    题型: item.kindLabel,
    题目标题: item.title,
    题目内容: item.promptText,
    参考答案: item.answerText,
    学生原作答: item.draftText || "未记录",
    模拟卷来源: item.sessionTitle || "无",
  };

  const body = {
    model: AI_CONFIG.model,
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: AI_WRONG_REVIEW_SYSTEM_PROMPT },
      { role: "user", content: JSON.stringify(payload, null, 2) },
    ],
  };

  let response = await postAiRequest(body);
  if (!response.ok) {
    const firstErrorText = await response.text();
    const fallbackBody = { ...body };
    delete fallbackBody.response_format;
    response = await postAiRequest(fallbackBody);
    if (!response.ok) {
      const secondErrorText = await response.text();
      throw new Error(extractAiError(secondErrorText) || extractAiError(firstErrorText) || "错题复盘请求失败");
    }
  }

  const data = await response.json();
  const rawContent = getAiMessageContent(data);
  return normalizeWrongReviewResult(parseAiJson(rawContent));
}

async function requestWrongReviewPlan(items) {
  const modeSummaries = buildWrongReviewModeSummaries(items).map((summary) => ({
    板块: summary.label,
    课程: summary.course,
    错题数量: summary.count,
    覆盖题型: summary.kindLabels.join(" / "),
    优先会话: summary.sessionTitle || "",
  }));

  const itemSamples = items.slice(0, 24).map((item) => ({
    课程: item.course,
    板块: MODE_LABELS[item.mode] || item.mode,
    题型: item.kindLabel,
    标题: item.title,
    题干摘要: truncateText(item.promptText, 90),
  }));

  const payload = {
    当前存档: getActiveProfile()?.name || "默认练习",
    总错题数: items.length,
    板块分布: modeSummaries,
    错题样本: itemSamples,
  };

  const body = {
    model: AI_CONFIG.model,
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: AI_WRONG_PLAN_SYSTEM_PROMPT },
      { role: "user", content: JSON.stringify(payload, null, 2) },
    ],
  };

  let response = await postAiRequest(body);
  if (!response.ok) {
    const firstErrorText = await response.text();
    const fallbackBody = { ...body };
    delete fallbackBody.response_format;
    response = await postAiRequest(fallbackBody);
    if (!response.ok) {
      const secondErrorText = await response.text();
      throw new Error(extractAiError(secondErrorText) || extractAiError(firstErrorText) || "复习方案请求失败");
    }
  }

  const data = await response.json();
  const rawContent = getAiMessageContent(data);
  return normalizeWrongReviewPlan(parseAiJson(rawContent));
}

function normalizeWrongReviewResult(raw) {
  if (raw?.error) {
    return { error: String(raw.error).trim() };
  }
  return {
    focus: String(raw?.focus || "").trim() || "这题主要在考关键概念和判断口径。",
    answerTakeaways: normalizeStringList(raw?.answer_takeaways),
    pitfalls: normalizeStringList(raw?.pitfalls),
    nextAction: String(raw?.next_action || "").trim() || "再做一遍原题，把关键点按顺序复述出来。",
    memoryHook: String(raw?.memory_hook || "").trim(),
  };
}

function normalizeWrongReviewPlan(raw) {
  return {
    priorityMode: String(raw?.priority_mode || "").trim() || "先清错题最多的板块",
    whyPriority: String(raw?.why_priority || "").trim() || "这个板块当前最容易反复丢分。",
    todayPlan: normalizeStringList(raw?.today_plan),
    dangerPoints: normalizeStringList(raw?.danger_points),
    finishSignal: String(raw?.finish_signal || "").trim() || "做到同类题能独立说出关键点，就算这一轮过关。",
  };
}

function buildWrongReviewAiHtml(item, review) {
  if (review?.error) {
    return `
      <h3>${AI_MODEL_DISPLAY} · 错题复盘暂时失败</h3>
      <div class="feedback-list">
        <div class="feedback-item bad">
          <div><strong>当前状态</strong><span class="feedback-status bad">稍后再试</span></div>
          <div>${escapeHtml(review.error)}</div>
        </div>
      </div>
    `;
  }

  return `
    <h3>${AI_MODEL_DISPLAY} · ${escapeHtml(item.title)} 复盘</h3>
    <div class="feedback-list">
      <div class="feedback-item">
        <div><strong>这题在考</strong></div>
        <div>${escapeHtml(review.focus)}</div>
      </div>
      ${renderAiListBlock("这题要抓住", review.answerTakeaways, "ok")}
      ${renderAiListBlock("最容易错在", review.pitfalls, "bad")}
      <div class="feedback-item partial">
        <div><strong>下次怎么做</strong></div>
        <div>${escapeHtml(review.nextAction)}</div>
      </div>
      ${review.memoryHook ? `
        <div class="feedback-item ok">
          <div><strong>一句记忆点</strong></div>
          <div>${escapeHtml(review.memoryHook)}</div>
        </div>
      ` : ""}
    </div>
  `;
}

function buildWrongReviewPlanHtml(plan) {
  return `
    <h3>${AI_MODEL_DISPLAY} · 本轮错题复习方案</h3>
    <div class="feedback-list">
      <div class="feedback-item ok">
        <div><strong>最该先刷</strong><span class="feedback-status ok">${escapeHtml(plan.priorityMode)}</span></div>
        <div>${escapeHtml(plan.whyPriority)}</div>
      </div>
      ${renderAiListBlock("今天直接这样刷", plan.todayPlan, "partial")}
      ${renderAiListBlock("最危险的地方", plan.dangerPoints, "bad")}
      <div class="feedback-item">
        <div><strong>这一轮做到什么程度算过关</strong></div>
        <div>${escapeHtml(plan.finishSignal)}</div>
      </div>
    </div>
  `;
}

function appendHomeChatMessage(role, content, extras = {}) {
  progressStore.homeChatHistory ||= [];
  progressStore.homeChatHistory.push({
    role,
    content: String(content || "").trim(),
    createdAt: new Date().toISOString(),
    sources: dedupeHomeChatSources(extras.sources),
    capabilities: dedupeStringList(extras.capabilities),
  });
  progressStore.homeChatHistory = progressStore.homeChatHistory.slice(-24);
  saveProgress();
  renderHomeChatMessages();
}

function clearHomeChatHistory() {
  progressStore.homeChatHistory = [];
  saveProgress();
  renderHomeChatMessages();
  updateHomeChatStatus("聊天已清空");
}

function formatProfileTime(isoString) {
  if (!isoString) return "刚刚";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "刚刚";
  return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function configureManualReviewArea(kind) {
  const aiVisible = supportsAiCompanion(state.currentMode, state.currentList[state.currentIndex]) && !isMemorizeMode() && AI_CONFIG.enabled;
  aiAssistButton.classList.toggle("hidden", !aiVisible);
  aiAssistButton.textContent = state.aiLoading ? "AI伴答中..." : "开始AI伴答";
  aiAssistButton.disabled = state.aiLoading;

  if (kind === "program") {
    composerLabel.textContent = "你的答案";
    programAnswer.placeholder = "在这里写你的 Python 程序";
    manualReviewHelper.textContent = "程序题不自动判分，自己看完答案后决定是否记错题。";
    return;
  }

  if (kind === "short") {
    composerLabel.textContent = "你的回答";
    programAnswer.placeholder = "先自己答一遍，再点“开始AI伴答”让 AI 看意思到不到位";
    manualReviewHelper.textContent = isMemorizeMode()
      ? "背题模式下直接看答案。"
      : `简答题按意思判，不要求和答案逐字一样。当前使用 ${AI_MODEL_DISPLAY}。`;
    return;
  }

  if (kind === "calc") {
    composerLabel.textContent = "你的过程";
    programAnswer.placeholder = "把计算过程写出来就行，不用特意补最终结果";
    manualReviewHelper.textContent = isMemorizeMode()
      ? "背题模式下直接看答案。"
      : `计算题主要看过程和口径，最终结果不一定非要单独写。当前使用 ${AI_MODEL_DISPLAY}。`;
    return;
  }

  composerLabel.textContent = "你的作答";
  programAnswer.placeholder = "把分录、步骤或关键结论写在这里，再对照参考答案";
  manualReviewHelper.textContent = "业务核算题先自己做，再看参考答案核对分录和步骤。";
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

function renderMultipleChoiceQuestion(question) {
  questionBody.innerHTML = `
    <div class="choice-stem">${question.stem_html}</div>
    ${isMemorizeMode() ? buildMemoryAnswerBlockHtml("答案", buildMultipleAnswerText(question)) : ""}
    <div class="choice-list">
      ${question.options.map((option, index) => `
        <label class="choice-option" data-source-key="${option.key}" data-display-label="${CHOICE_DISPLAY_LABELS[index] || option.key}">
          <input type="checkbox" name="multiChoice" value="${option.key}">
          <span class="choice-badge">${CHOICE_DISPLAY_LABELS[index] || option.key}</span>
          <div class="choice-content">
            <div class="choice-text">${escapeHtml(option.text)}</div>
            <div class="choice-tags"></div>
          </div>
        </label>
      `).join("")}
    </div>
  `;
  if (isMemorizeMode()) {
    revealMultipleChoiceAnswer(question, []);
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

function renderStudyQuestion(question, kind = getQuestionKind(state.currentMode, question)) {
  questionBody.innerHTML = question.prompt_html;
  manualReviewRow.classList.remove("hidden");
  programComposer.classList.remove("hidden");
  configureManualReviewArea(kind);
  programAnswer.value = getManualDraftValue(question, kind);
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
  const kind = getQuestionKind(state.currentMode, question);
  if (!question || !supportsAiCompanion(state.currentMode, question) || isMemorizeMode()) return;

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
    const result = await requestAiReview(kind, question, userAnswer);
    applyAiReviewResult(state.currentMode, question.id, result.verdict);
    feedbackPanel.innerHTML = buildAiFeedbackHtml(kind, result);
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
    configureManualReviewArea(kind);
  }
}

function handlePrimaryAction() {
  const question = state.currentList[state.currentIndex];
  if (!question) return;
  const kind = getQuestionKind(state.currentMode, question);

  if (isMemorizeMode()) {
    navigateRelative(1);
    return;
  }

  if (isFillMode(kind)) {
    handleFillAction();
    return;
  }

  if (kind === "single") {
    handleSingleChoiceAction();
    return;
  }

  if (kind === "multi") {
    handleMultipleChoiceAction();
    return;
  }

  if (kind === "judge") {
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

function handleSingleChoiceAction() {
  const question = state.currentList[state.currentIndex];
  const selectedInput = questionBody.querySelector('input[name="singleChoice"]:checked');
  const gradingMode = state.currentMode === "financeExam" ? "financeExam" : "single";

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
    markAutoGradedProgress(gradingMode, question.id, correct);
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

function handleMultipleChoiceAction() {
  const question = state.currentList[state.currentIndex];
  const selectedInputs = [...questionBody.querySelectorAll('input[name="multiChoice"]:checked')];

  if (!state.revealState) {
    if (!selectedInputs.length) {
      feedbackPanel.innerHTML = "<h3>请先选择至少一个选项</h3>";
      feedbackPanel.classList.remove("hidden");
      return;
    }

    const selectedKeys = selectedInputs.map((input) => input.value).sort();
    const answerKeys = [...(question.answer_keys || [])].sort();
    const correct = selectedKeys.length === answerKeys.length && selectedKeys.every((key, index) => key === answerKeys[index]);

    revealMultipleChoiceAnswer(question, selectedKeys);
    feedbackPanel.innerHTML = `
      <h3>${correct ? "本题答对了" : "本题答错了"}</h3>
      <div class="feedback-list">
        <div class="feedback-item ${correct ? "ok" : "bad"}">
          <div><strong>你的选择</strong><span class="feedback-status ${correct ? "ok" : "bad"}">${correct ? "正确" : "不对"}</span></div>
          <div><code>${escapeHtml(buildSelectedMultiChoiceText(question, selectedKeys) || "（空）")}</code></div>
        </div>
        <div class="feedback-item ok">
          <div><strong>正确答案</strong></div>
          <div><code>${escapeHtml(buildMultipleAnswerText(question))}</code></div>
        </div>
      </div>
    `;
    feedbackPanel.classList.remove("hidden");
    markAutoGradedProgress(state.currentMode, question.id, correct);
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

function handleJudgeAction() {
  const question = state.currentList[state.currentIndex];
  const selectedInput = questionBody.querySelector('input[name="judgeChoice"]:checked');
  const gradingMode = state.currentMode === "financeExam" ? "financeExam" : "judge";

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
    markAutoGradedProgress(gradingMode, question.id, correct);
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

function handleManualReviewAction() {
  const question = state.currentList[state.currentIndex];
  const kind = getQuestionKind(state.currentMode, question);
  if (kind === "program") {
    saveProgramDraft(question.id, programAnswer.value);
  } else if (state.currentMode === "financeExam") {
    saveFinanceExamDraft(question.id, programAnswer.value);
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
  const question = state.currentList[state.currentIndex];
  if (!question) return;
  const kind = getQuestionKind(state.currentMode, question);
  if (kind === "program") {
    saveProgramDraft(question.id, programAnswer.value);
    if (programAnswer.value.trim()) {
      markProgramDone(question.id);
    }
    questionMeta.textContent = buildQuestionMetaText(question);
    updateProgressText();
    renderNavigator();
    updateToolbarButtons();
    return;
  }
  if (state.currentMode === "financeExam") {
    saveFinanceExamDraft(question.id, programAnswer.value);
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

async function postAiApiRequest(endpointPath, body, timeoutMs = 45000, timeoutText = "AI伴答超时了，等会再点一次。") {
  const errors = [];
  const keys = AI_CONFIG.apiKeys.filter(Boolean);

  for (let index = 0; index < keys.length; index += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`${AI_CONFIG.baseUrl.replace(/\/+$/u, "")}${endpointPath}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${keys[index]}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        errors.push(extractAiError(errorText) || `key-${index + 1} 请求失败`);
        if (index < keys.length - 1 && shouldSwitchAiKey(response.status, errorText)) {
          continue;
        }
        return new Response(errorText, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      }

      return response;
    } catch (error) {
      if (error.name === "AbortError") {
        errors.push(`key-${index + 1} 超时`);
      } else {
        errors.push(error.message || `key-${index + 1} 连接失败`);
      }
      if (index === keys.length - 1) {
        if (error.name === "AbortError") {
          throw new Error(timeoutText);
        }
        throw new Error(errors.filter(Boolean).join("；") || "AI 请求失败");
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new Error(errors.filter(Boolean).join("；") || "AI 请求失败");
}

async function postAiRequest(body) {
  return postAiApiRequest("/chat/completions", body, 45000, "AI伴答超时了，等会再点一次。");
}

async function postAiResponsesRequest(body) {
  return postAiApiRequest("/responses", body, 65000, "学习搭子超时了，等会再试一次。");
}

function shouldSwitchAiKey(status, errorText) {
  if ([401, 402, 403, 408, 409, 429, 500, 502, 503, 504].includes(status)) return true;
  const text = String(errorText || "").toLowerCase();
  return ["quota", "余额", "insufficient", "rate limit", "exceeded", "disabled", "expired"].some((item) => text.includes(item));
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

function extractResponseText(data) {
  const texts = [];
  (data?.output || []).forEach((item) => {
    if (item?.type !== "message") return;
    (item.content || []).forEach((contentItem) => {
      if (typeof contentItem?.text === "string") {
        texts.push(contentItem.text);
      }
    });
  });
  return texts.join("\n");
}

function extractResponseWebActions(data) {
  const capabilities = [];
  const sources = [];

  (data?.output || []).forEach((item) => {
    if (item?.type === "web_search_call") {
      const action = item.action || {};
      if (action.type === "search") {
        capabilities.push("联网搜索");
        const queries = Array.isArray(action.queries) ? action.queries : [action.query].filter(Boolean);
        queries.forEach((query) => {
          sources.push({
            type: "web_search",
            label: `联网搜索：${String(query).trim()}`,
            url: "",
          });
        });
      }
      if (action.type === "open_page" && action.url) {
        capabilities.push("网页阅读");
        sources.push({
          type: "url_open",
          label: `已阅读网页：${action.url}`,
          url: action.url,
        });
      }
    }

    if (item?.type === "message") {
      (item.content || []).forEach((contentItem) => {
        (contentItem?.annotations || []).forEach((annotation) => {
          const url = String(annotation?.url || annotation?.target_url || "").trim();
          if (!url) return;
          sources.push({
            type: "url_reference",
            label: `网页引用：${url}`,
            url,
          });
        });
      });
    }
  });

  return {
    capabilities: dedupeStringList(capabilities),
    sources: dedupeHomeChatSources(sources),
  };
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
    <h3>${AI_MODEL_DISPLAY} · AI伴答：${escapeHtml(verdictLabel)}</h3>
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

function revealMultipleChoiceAnswer(question, selectedKeys) {
  const selectedSet = new Set(selectedKeys);
  const answerSet = new Set(question.answer_keys || []);

  questionBody.querySelectorAll(".choice-option").forEach((optionEl) => {
    const sourceKey = optionEl.dataset.sourceKey;
    const input = optionEl.querySelector('input[name="multiChoice"]');
    const tags = optionEl.querySelector(".choice-tags");

    optionEl.classList.add("locked");
    input.disabled = true;

    if (answerSet.has(sourceKey)) {
      optionEl.classList.add("correct");
    } else if (selectedSet.has(sourceKey)) {
      optionEl.classList.add("wrong");
    }

    const tagHtml = [];
    if (selectedSet.has(sourceKey)) {
      tagHtml.push('<span class="choice-tag selected">你的选择</span>');
    }
    if (answerSet.has(sourceKey)) {
      tagHtml.push('<span class="choice-tag correct">正确答案</span>');
    }
    tags.innerHTML = tagHtml.join("");
  });
}

function getStaticChoiceLabel(question, sourceKey) {
  const index = (question.options || []).findIndex((item) => item.key === sourceKey);
  return CHOICE_DISPLAY_LABELS[index] || sourceKey;
}

function buildMultipleAnswerText(question) {
  return (question.answer_keys || []).map((key) => {
    const option = (question.options || []).find((item) => item.key === key);
    return `${getStaticChoiceLabel(question, key)}. ${option?.text || ""}`;
  }).join("；");
}

function buildSelectedMultiChoiceText(question, selectedKeys) {
  return selectedKeys.map((key) => {
    const option = (question.options || []).find((item) => item.key === key);
    return `${getStaticChoiceLabel(question, key)}. ${option?.text || ""}`;
  }).join("；");
}

function navigateRelative(delta) {
  if (state.currentList.length === 0) return;

  saveCurrentQuestionState();
  const previousQuestion = state.currentList[state.currentIndex];
  const previousIndex = state.currentIndex;

  if (!isSubsetMode()) {
    if (state.currentMode === "financeExam") {
      if (delta > 0 && state.currentIndex >= state.currentList.length - 1) {
        renderFinanceExamCompletionSummary();
        return;
      }
      state.currentIndex = Math.max(0, Math.min(state.currentIndex + delta, state.currentList.length - 1));
      renderCurrentQuestion();
      return;
    }
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
          <span class="navigator-title">${escapeHtml(getQuestionDisplayTitle(question, index))}</span>
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
  if (state.currentMode === "financeExam") {
    const session = getActiveFinanceExamSession();
    const stats = getFinanceExamSessionStats(session);
    return `客观 ${stats.objectiveScore}/${stats.objectiveTotal} · 主观已做 ${stats.subjectiveDone}/${stats.subjectiveTotal} · 标记 ${stats.marked}`;
  }

  const allQuestions = getQuestionsByMode(state.currentMode);
  const doneLabel = getDoneDisplayLabel(state.currentMode);
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
    return `未做 ${pending} · ${doneLabel} ${done} · 错题 ${wrong} · 标记 ${marked}`;
  }

  if (done > 0) {
    return `未做 ${pending} · ${doneLabel} ${done} · 正确 ${correct} · 错题 ${wrong} · 标记 ${marked}`;
  }

  return `未做 ${pending} · 正确 ${correct} · 错题 ${wrong} · 标记 ${marked}`;
}

function getDoneDisplayLabel(mode, progressData = progressStore) {
  return shouldUseMemorizeDoneLabel(mode, progressData) ? "已背" : "已做";
}

function shouldUseMemorizeDoneLabel(mode, progressData = progressStore) {
  return mode !== "financeExam" && !!progressData?.memorizeMode;
}

function getQuestionStatus(mode, question, progressData = progressStore) {
  if (!question) {
    return { key: "pending", label: "未做" };
  }

  if (mode === "financeExam") {
    const result = progressData.financeExamResults?.[question.id];
    if (result === "correct") return { key: "correct", label: "正确" };
    if (result === "wrong" || progressData.financeExamWrongIds.includes(question.id)) {
      return { key: "wrong", label: "错题" };
    }
    if (progressData.financeExamDoneIds.includes(question.id)) {
      return { key: "done", label: "已做" };
    }
    return { key: "pending", label: "未做" };
  }

  if (isFillMode(mode)) {
    const result = progressData.fillResults?.[question.id];
    if (result === "correct") return { key: "correct", label: "正确" };
    if (result === "wrong" || progressData.fillWrongIds.includes(question.id)) {
      return { key: "wrong", label: "错题" };
    }
    if (progressData.fillDoneIds.includes(question.id)) {
      return { key: "done", label: getDoneDisplayLabel(mode, progressData) };
    }
    return { key: "pending", label: "未做" };
  }

  if (mode === "single") {
    const result = progressData.singleResults?.[question.id];
    if (result === "correct") return { key: "correct", label: "正确" };
    if (result === "wrong" || progressData.singleWrongIds.includes(question.id)) {
      return { key: "wrong", label: "错题" };
    }
    if (progressData.singleDoneIds.includes(question.id)) {
      return { key: "done", label: getDoneDisplayLabel(mode, progressData) };
    }
    return { key: "pending", label: "未做" };
  }

  if (mode === "judge") {
    const result = progressData.judgeResults?.[question.id];
    if (result === "correct") return { key: "correct", label: "正确" };
    if (result === "wrong" || progressData.judgeWrongIds.includes(question.id)) {
      return { key: "wrong", label: "错题" };
    }
    if (progressData.judgeDoneIds.includes(question.id)) {
      return { key: "done", label: getDoneDisplayLabel(mode, progressData) };
    }
    return { key: "pending", label: "未做" };
  }

  if (isManualReviewMode(mode)) {
    if (getWrongSet(mode, progressData).has(question.id)) {
      return { key: "wrong", label: "错题" };
    }

    const hasDraft = mode === "program" && Boolean(progressData.programAnswers?.[question.id]?.trim());
    const doneSet = getDoneSet(mode, progressData);
    const done = doneSet.has(question.id) || hasDraft;
    if (done) {
      return { key: "done", label: getDoneDisplayLabel(mode, progressData) };
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
  const inFinanceExam = state.currentMode === "financeExam";
  const hasQuestion = !!state.currentList[state.currentIndex];
  wrongOnlyButton.textContent = state.wrongOnly ? "当前：错题模式" : "错题再练";
  unfinishedOnlyButton.textContent = state.unfinishedOnly ? "当前：未做题模式" : "只看未做题";
  wrongOnlyButton.classList.toggle("hidden", inFinanceExam || !state.currentMode);
  unfinishedOnlyButton.classList.toggle("hidden", inFinanceExam || !state.currentMode);
  allQuestionsButton.classList.toggle("hidden", inFinanceExam || (!state.wrongOnly && !state.unfinishedOnly));
  questionShuffleWrap.classList.toggle("hidden", !state.currentMode || inFinanceExam);
  memorizeModeWrap.classList.toggle("hidden", !state.currentMode || inFinanceExam);
  shuffleToggleWrap.classList.toggle("hidden", state.currentMode !== "single" || inFinanceExam);
  nextAction.classList.toggle("hidden", !state.currentMode || isMemorizeMode());
  newExamSessionButton?.classList.toggle("hidden", !inFinanceExam);
  primaryAction.disabled = state.aiLoading || !hasQuestion;
  prevAction.disabled = state.aiLoading || state.currentList.length <= 1 || (inFinanceExam && state.currentIndex === 0);
  nextAction.disabled = state.aiLoading || !hasQuestion || (!inFinanceExam && state.currentList.length <= 1);
  markQuestionButton.disabled = state.aiLoading || !hasQuestion;
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
  if (state.currentMode === "financeExam") {
    const session = getActiveFinanceExamSession();
    const stats = getFinanceExamSessionStats(session);
    const current = state.currentList.length === 0 ? 0 : state.currentIndex + 1;
    progressText.textContent = `第 ${current} / ${stats.total} 题 · 客观得分 ${stats.objectiveScore}/${stats.objectiveTotal} · 主观已做 ${stats.subjectiveDone}/${stats.subjectiveTotal} · 标记 ${stats.marked}`;
    return;
  }
  const modeQuestions = getQuestionsByMode(state.currentMode);
  const modeCount = modeQuestions.length;
  const pendingCount = modeQuestions
    .filter((question) => getQuestionStatus(state.currentMode, question).key === "pending").length;
  const wrongCount = modeQuestions
    .filter((question) => getQuestionStatus(state.currentMode, question).key === "wrong").length;
  const doneCount = modeQuestions
    .filter((question) => getQuestionStatus(state.currentMode, question).key === "done").length;
  const markedCount = getMarkedSet(state.currentMode).size;
  const current = state.currentList.length === 0 ? 0 : state.currentIndex + 1;
  const memorizeLabel = isMemorizeMode() ? " · 背题模式" : "";
  const doneLabel = getDoneDisplayLabel(state.currentMode);
  if (state.unfinishedOnly) {
    progressText.textContent = `第 ${current} / ${state.currentList.length} 题 · 全部 ${modeCount} 题 · 未做 ${pendingCount} 题 · 标记 ${markedCount} 题${memorizeLabel}`;
    return;
  }
  const doneSegment = doneCount > 0 ? ` · ${doneLabel} ${doneCount} 题` : "";
  progressText.textContent = `第 ${current} / ${state.currentList.length} 题 · 全部 ${modeCount} 题${doneSegment} · 错题 ${wrongCount} 题 · 标记 ${markedCount} 题${memorizeLabel}`;
}

function getOrderedSingleChoiceOptions(question) {
  const optionMap = new Map(question.options.map((item) => [item.key, item]));
  let orderedKeys = question.options.map((item) => item.key);

  if (state.currentMode !== "financeExam" && progressStore.shuffleChoiceOptions) {
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
  if (mode === "financeExam") {
    return list;
  }
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

  if (mode === "financeExam") {
    progressStore.financeExamResults[id] = allCorrect ? "correct" : "wrong";
    if (!progressStore.financeExamDoneIds.includes(id)) {
      progressStore.financeExamDoneIds.push(id);
    }
  } else if (mode === "fill") {
    progressStore.fillResults[id] = allCorrect ? "correct" : "wrong";
  } else if (mode === "single") {
    progressStore.singleResults[id] = allCorrect ? "correct" : "wrong";
  } else if (mode === "judge") {
    progressStore.judgeResults[id] = allCorrect ? "correct" : "wrong";
  }

  saveProgress();
}

function markProgramDone(id) {
  markQuestionDone("program", id);
}

function markManualReviewDone(mode, id) {
  markQuestionDone(mode, id);
}

function getDoneStorageKey(mode) {
  if (mode === "financeExam") return "financeExamDoneIds";
  if (isFillMode(mode)) return "fillDoneIds";
  if (mode === "single") return "singleDoneIds";
  if (mode === "judge") return "judgeDoneIds";
  if (mode === "program") return "programDoneIds";
  if (mode === "short") return "shortDoneIds";
  if (mode === "calc") return "calcDoneIds";
  return "";
}

function markQuestionDone(mode, id) {
  const key = getDoneStorageKey(mode);
  if (!key || !id) return;
  progressStore[key] ||= [];
  if (!progressStore[key].includes(id)) {
    progressStore[key].push(id);
    saveProgress();
  }
}

function saveCurrentQuestionState() {
  const question = state.currentList[state.currentIndex];
  if (!question) return;
  const kind = getQuestionKind(state.currentMode, question);

  if (isMemorizeMode()) {
    markQuestionDone(state.currentMode, question.id);
  }

  if (kind === "program" && !isMemorizeMode()) {
    const draft = programAnswer.value || "";
    saveProgramDraft(question.id, draft);
    if (draft.trim()) {
      markProgramDone(question.id);
    }
    return;
  }

  if (state.currentMode === "financeExam" && ["short", "calc", "business"].includes(kind)) {
    saveFinanceExamDraft(question.id, programAnswer.value || "");
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
    financeExamWrongIds: Array.isArray(raw?.financeExamWrongIds) ? raw.financeExamWrongIds : [],
    financeExamMarkedIds: Array.isArray(raw?.financeExamMarkedIds) ? raw.financeExamMarkedIds : [],
    fillDoneIds: Array.isArray(raw?.fillDoneIds) ? raw.fillDoneIds : [],
    fillResults: raw?.fillResults && typeof raw.fillResults === "object" ? raw.fillResults : {},
    singleDoneIds: Array.isArray(raw?.singleDoneIds) ? raw.singleDoneIds : [],
    singleResults: raw?.singleResults && typeof raw.singleResults === "object" ? raw.singleResults : {},
    judgeDoneIds: Array.isArray(raw?.judgeDoneIds) ? raw.judgeDoneIds : [],
    judgeResults: raw?.judgeResults && typeof raw.judgeResults === "object" ? raw.judgeResults : {},
    financeExamResults: raw?.financeExamResults && typeof raw.financeExamResults === "object" ? raw.financeExamResults : {},
    shortDoneIds: Array.isArray(raw?.shortDoneIds) ? raw.shortDoneIds : [],
    calcDoneIds: Array.isArray(raw?.calcDoneIds) ? raw.calcDoneIds : [],
    programDoneIds: Array.isArray(raw?.programDoneIds) ? raw.programDoneIds : [],
    financeExamDoneIds: Array.isArray(raw?.financeExamDoneIds) ? raw.financeExamDoneIds : [],
    programAnswers: raw?.programAnswers && typeof raw.programAnswers === "object" ? raw.programAnswers : {},
    financeExamAnswerDrafts: raw?.financeExamAnswerDrafts && typeof raw.financeExamAnswerDrafts === "object" ? raw.financeExamAnswerDrafts : {},
    financeExamSessions: Array.isArray(raw?.financeExamSessions)
      ? raw.financeExamSessions
        .filter((item) => item?.id && Array.isArray(item?.questions))
        .slice(0, 3)
      : [],
    financeExamCurrentSessionId: String(raw?.financeExamCurrentSessionId || ""),
    shuffleQuestionOrder: typeof raw?.shuffleQuestionOrder === "boolean" ? raw.shuffleQuestionOrder : false,
    shuffleChoiceOptions: typeof raw?.shuffleChoiceOptions === "boolean" ? raw.shuffleChoiceOptions : false,
    memorizeMode: typeof raw?.memorizeMode === "boolean" ? raw.memorizeMode : false,
    chatKnowledgeEnabled: typeof raw?.chatKnowledgeEnabled === "boolean" ? raw.chatKnowledgeEnabled : true,
    chatWebSearchEnabled: typeof raw?.chatWebSearchEnabled === "boolean" ? raw.chatWebSearchEnabled : true,
    chatUrlReadEnabled: typeof raw?.chatUrlReadEnabled === "boolean" ? raw.chatUrlReadEnabled : true,
    lastAiPraise: raw?.lastAiPraise && typeof raw.lastAiPraise === "object" ? raw.lastAiPraise : {},
    homeChatHistory: Array.isArray(raw?.homeChatHistory)
      ? raw.homeChatHistory
        .map((item) => ({
          role: item?.role === "user" ? "user" : "assistant",
          content: String(item?.content || "").trim(),
          createdAt: item?.createdAt || "",
          sources: normalizeHomeChatSources(item?.sources),
          capabilities: normalizeStringList(item?.capabilities),
        }))
        .filter((item) => item.content)
      : [],
    lastMode: ROUTABLE_MODES.includes(raw?.lastMode) ? raw.lastMode : "",
  };
}

function loadLegacyProgress() {
  try {
    return JSON.parse(localStorage.getItem(LEGACY_PROGRESS_STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function loadUserCenterStore() {
  try {
    return JSON.parse(localStorage.getItem(USER_CENTER_STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function ensureUserCenterDefaults(raw, legacyRaw) {
  if (Array.isArray(raw?.profiles) && raw.profiles.length) {
    const profiles = raw.profiles.map((profile, index) => ({
      id: String(profile?.id || `profile-${index + 1}`),
      name: String(profile?.name || `练习存档 ${index + 1}`).trim(),
      createdAt: profile?.createdAt || new Date().toISOString(),
      updatedAt: profile?.updatedAt || profile?.createdAt || new Date().toISOString(),
      progress: ensureProgressDefaults(profile?.progress || {}),
    }));
    const activeProfileId = profiles.some((item) => item.id === raw?.activeProfileId)
      ? raw.activeProfileId
      : profiles[0].id;
    return { activeProfileId, profiles };
  }

  const migratedProgress = ensureProgressDefaults(legacyRaw || {});
  const firstProfile = createProfileRecord("默认练习", migratedProgress);
  return {
    activeProfileId: firstProfile.id,
    profiles: [firstProfile],
  };
}

function createProfileRecord(name, seedProgress = {}) {
  const now = new Date().toISOString();
  return {
    id: `profile-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: String(name || "默认练习").trim() || "默认练习",
    createdAt: now,
    updatedAt: now,
    progress: ensureProgressDefaults(seedProgress),
  };
}

function getActiveProfile() {
  const matched = userCenterStore.profiles.find((profile) => profile.id === userCenterStore.activeProfileId);
  return matched || userCenterStore.profiles[0];
}

function saveUserCenterStore() {
  localStorage.setItem(USER_CENTER_STORAGE_KEY, JSON.stringify(userCenterStore));
}

function saveProgress() {
  const activeProfile = getActiveProfile();
  if (activeProfile) {
    activeProfile.progress = progressStore;
    activeProfile.updatedAt = new Date().toISOString();
  }
  saveUserCenterStore();
  if (state.data) {
    renderHomeDashboard();
    renderUserCenter();
    if (homeView.classList.contains("active")) {
      renderHomeChatMessages();
    }
    if (reviewView?.classList.contains("active")) {
      renderWrongReviewCenter();
    }
  }
}

function getWrongSet(mode, progressData = progressStore) {
  if (mode === "financeExam") return new Set(progressData.financeExamWrongIds);
  if (isFillMode(mode)) return new Set(progressData.fillWrongIds);
  if (mode === "short") return new Set(progressData.shortWrongIds);
  if (mode === "calc") return new Set(progressData.calcWrongIds);
  if (mode === "single") return new Set(progressData.singleWrongIds);
  if (mode === "judge") return new Set(progressData.judgeWrongIds);
  return new Set(progressData.programWrongIds);
}

function getMarkedSet(mode, progressData = progressStore) {
  if (mode === "financeExam") return new Set(progressData.financeExamMarkedIds);
  if (isFillMode(mode)) return new Set(progressData.fillMarkedIds);
  if (mode === "short") return new Set(progressData.shortMarkedIds);
  if (mode === "calc") return new Set(progressData.calcMarkedIds);
  if (mode === "single") return new Set(progressData.singleMarkedIds);
  if (mode === "judge") return new Set(progressData.judgeMarkedIds);
  return new Set(progressData.programMarkedIds);
}

function getDoneSet(mode, progressData = progressStore) {
  const key = getDoneStorageKey(mode);
  if (key) return new Set(progressData[key] || []);
  return new Set();
}

function saveWrongSet(mode, wrongSet) {
  if (mode === "financeExam") {
    progressStore.financeExamWrongIds = [...wrongSet];
  } else if (isFillMode(mode)) {
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
  if (mode === "financeExam") {
    progressStore.financeExamMarkedIds = [...markedSet];
  } else if (isFillMode(mode)) {
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

function isManualReviewMode(mode, question = state.currentList[state.currentIndex]) {
  const kind = getQuestionKind(mode, question);
  return kind === "program" || kind === "short" || kind === "calc" || kind === "business";
}

function supportsAiCompanion(mode, question = state.currentList[state.currentIndex]) {
  const kind = getQuestionKind(mode, question);
  return kind === "short" || kind === "calc";
}

function isMemorizeMode() {
  if (state.currentMode === "financeExam") return false;
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

function saveFinanceExamDraft(id, value) {
  progressStore.financeExamAnswerDrafts ||= {};
  progressStore.financeExamAnswerDrafts[id] = value;
  saveProgress();
}

function getManualDraftValue(question, kind) {
  if (kind === "program") {
    return progressStore.programAnswers?.[question.id] || "";
  }
  if (state.currentMode === "financeExam") {
    return progressStore.financeExamAnswerDrafts?.[question.id] || "";
  }
  return "";
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

function formatPlainTextHtml(value) {
  return escapeHtml(String(value || "").trim() || "暂无内容").replace(/\n/gu, "<br>");
}

function truncateText(value, maxLength = 120) {
  const text = String(value || "").replace(/\s+/gu, " ").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(1, maxLength - 1)).trim()}…`;
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
  const rawMode = location.hash.replace("#", "");
  if (["review", "wrong-review", "wrongReview"].includes(rawMode)) {
    if (!state.data) return;
    if (!reviewView?.classList.contains("active")) {
      showWrongReviewCenter();
    } else {
      renderWrongReviewCenter();
    }
    return;
  }
  const mode = rawMode === "finance-exam" ? "financeExam" : rawMode;
  if (ROUTABLE_MODES.includes(mode)) {
    if (!state.data) return;
    if (state.currentMode !== mode || !practiceView.classList.contains("active")) {
      startMode(mode);
    }
    return;
  }
  if (practiceView.classList.contains("active")) {
    goHome();
  }
  if (reviewView?.classList.contains("active")) {
    goHome();
  }
}

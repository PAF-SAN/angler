"use strict";

// ANGLERの保存キーです。ブラウザのLocalStorage内で他アプリと衝突しにくい名前にします。
const STORAGE_KEY = "angler_app_data_v1";

// PEラインの換算表です。デニールは使わない方針のため保存していません。
const PE_LINE_DATABASE = [
  { size: "0.1号", kg: 1.814, lb: 4, diameter_mm: 0.054 },
  { size: "0.15号", kg: 2.043, lb: 4.5, diameter_mm: 0.066 },
  { size: "0.2号", kg: 2.270, lb: 5, diameter_mm: 0.076 },
  { size: "0.3号", kg: 2.722, lb: 6, diameter_mm: 0.094 },
  { size: "0.4号", kg: 3.629, lb: 8, diameter_mm: 0.108 },
  { size: "0.5号", kg: 4.536, lb: 10, diameter_mm: 0.121 },
  { size: "0.6号", kg: 5.443, lb: 12, diameter_mm: 0.132 },
  { size: "0.8号", kg: 7.257, lb: 16, diameter_mm: 0.153 },
  { size: "1号", kg: 9.072, lb: 20, diameter_mm: 0.171 },
  { size: "1.2号", kg: 10.896, lb: 24, diameter_mm: 0.191 },
  { size: "1.5号", kg: 13.620, lb: 30, diameter_mm: 0.209 },
  { size: "1.7号", kg: 15.436, lb: 34, diameter_mm: 0.219 },
  { size: "2号", kg: 18.160, lb: 40, diameter_mm: 0.242 },
  { size: "2.5号", kg: 22.700, lb: 50, diameter_mm: 0.270 },
  { size: "3号", kg: 24.970, lb: 55, diameter_mm: 0.296 },
  { size: "4号", kg: 27.240, lb: 60, diameter_mm: 0.342 },
  { size: "5号", kg: 36.320, lb: 80, diameter_mm: 0.382 },
  { size: "6号", kg: 40.860, lb: 90, diameter_mm: 0.418 },
  { size: "8号", kg: 45.400, lb: 100, diameter_mm: 0.483 },
  { size: "10号", kg: 59.020, lb: 130, diameter_mm: 0.540 }
];

// ナイロン、フロロ、エステルで共通利用する換算表です。
const MONO_LINE_DATABASE = [
  { size: "0.25号", kg: 0.454, lb: 1, diameter_mm: 0.083 },
  { size: "0.3号", kg: 0.544, lb: 1.2, diameter_mm: 0.090 },
  { size: "0.4号", kg: 0.726, lb: 1.6, diameter_mm: 0.104 },
  { size: "0.6号", kg: 1.089, lb: 2.4, diameter_mm: 0.128 },
  { size: "0.8号", kg: 1.361, lb: 3, diameter_mm: 0.148 },
  { size: "1号", kg: 1.814, lb: 4, diameter_mm: 0.165 },
  { size: "1.2号", kg: 2.177, lb: 4.8, diameter_mm: 0.185 },
  { size: "1.5号", kg: 2.722, lb: 6, diameter_mm: 0.205 },
  { size: "1.75号", kg: 3.175, lb: 7, diameter_mm: 0.220 },
  { size: "2号", kg: 3.629, lb: 8, diameter_mm: 0.235 },
  { size: "2.25号", kg: 4.082, lb: 9, diameter_mm: 0.248 },
  { size: "2.5号", kg: 4.536, lb: 10, diameter_mm: 0.260 },
  { size: "2.75号", kg: 4.990, lb: 11, diameter_mm: 0.274 },
  { size: "3号", kg: 5.443, lb: 12, diameter_mm: 0.285 },
  { size: "3.5号", kg: 6.350, lb: 14, diameter_mm: 0.310 },
  { size: "4号", kg: 7.257, lb: 16, diameter_mm: 0.330 },
  { size: "5号", kg: 9.072, lb: 20, diameter_mm: 0.370 },
  { size: "6号", kg: 9.979, lb: 22, diameter_mm: 0.405 },
  { size: "7号", kg: 11.340, lb: 25, diameter_mm: 0.435 },
  { size: "8号", kg: 12.701, lb: 28, diameter_mm: 0.470 },
  { size: "10号", kg: 15.876, lb: 35, diameter_mm: 0.520 },
  { size: "12号", kg: 18.144, lb: 40, diameter_mm: 0.570 },
  { size: "14号", kg: 20.412, lb: 45, diameter_mm: 0.620 },
  { size: "16号", kg: 22.680, lb: 50, diameter_mm: 0.660 },
  { size: "18号", kg: 24.948, lb: 55, diameter_mm: 0.700 },
  { size: "20号", kg: 27.216, lb: 60, diameter_mm: 0.740 }
];

// カタログ糸巻き量でよく使うm数です。スプール登録ではこの中から選択します。
const CAPACITY_LENGTH_OPTIONS = [
  50,
  60,
  70,
  75,
  80,
  90,
  100,
  110,
  120,
  130,
  135,
  140,
  150,
  160,
  170,
  180,
  190,
  200,
  250,
  300
];

// アプリの現在状態です。保存対象の配列と選択状態をまとめます。
let state = {
  reels: [],
  spools: [],
  lines: [],
  setups: [],
  histories: [],
  selectedReelId: "",
  selectedSpoolId: "",
  lastCalculation: null,
  editingReelId: "",
  editingSpoolId: ""
};

// よく使うDOM要素をまとめて参照します。
const elements = {
  saveStatus: document.getElementById("saveStatus"),
  refreshAppButton: document.getElementById("refreshAppButton"),
  tabButtons: document.querySelectorAll(".tab-button"),
  tabPanels: document.querySelectorAll(".tab-panel"),
  reelForm: document.getElementById("reelForm"),
  spoolForm: document.getElementById("spoolForm"),
  reelSubmitButton: document.querySelector("#reelForm button[type='submit']"),
  spoolSubmitButton: document.querySelector("#spoolForm button[type='submit']"),
  cancelReelEditButton: document.getElementById("cancelReelEditButton"),
  cancelSpoolEditButton: document.getElementById("cancelSpoolEditButton"),
  lineForm: document.getElementById("lineForm"),
  calculateForm: document.getElementById("calculateForm"),
  historyForm: document.getElementById("historyForm"),
  reelList: document.getElementById("reelList"),
  historyList: document.getElementById("historyList"),
  spoolReelSelect: document.getElementById("spoolReelSelect"),
  calcReelSelect: document.getElementById("calcReelSelect"),
  calcSpoolSelect: document.getElementById("calcSpoolSelect"),
  mainLineType: document.getElementById("mainLineType"),
  mainLineSize: document.getElementById("mainLineSize"),
  backingLineType: document.getElementById("backingLineType"),
  backingLineSize: document.getElementById("backingLineSize"),
  calculationResult: document.getElementById("calculationResult"),
  lineType: document.getElementById("lineType"),
  linePreset: document.getElementById("linePreset"),
  databaseType: document.getElementById("databaseType"),
  databaseTable: document.getElementById("databaseTable"),
  capacityLineType: document.getElementById("capacityLineType"),
  capacityLineSize: document.getElementById("capacityLineSize"),
  capacityLengthSelect: document.getElementById("capacityLengthSelect"),
  exportBackupButton: document.getElementById("exportBackupButton"),
  importBackupInput: document.getElementById("importBackupInput")
};

// 初期化処理です。保存データ読込、イベント登録、画面描画を順番に行います。
function initializeApp() {
  registerServiceWorker();
  loadState();
  setDefaultDate();
  bindEvents();
  fillLinePresetOptions();
  fillCapacityLineSizeOptions();
  fillCapacityLengthOptions();
  fillCalculationLineSizeOptions("main");
  fillCalculationLineSizeOptions("backing");
  renderAll();
}

// HTTPS公開時にService Workerを登録し、外出先でもアプリ本体を安定して読み込めるようにします。
function registerServiceWorker() {
  const canRegisterServiceWorker = "serviceWorker" in navigator;
  const isSupportedProtocol = window.location.protocol === "https:" || window.location.hostname === "localhost";

  if (!canRegisterServiceWorker || !isSupportedProtocol) {
    return;
  }

  navigator.serviceWorker.register("sw.js").catch((error) => {
    console.error(error);
  });
}

// LocalStorageから保存済みデータを読み込みます。壊れたデータの場合は初期状態で開始します。
function loadState() {
  const savedText = localStorage.getItem(STORAGE_KEY);

  if (!savedText) {
    updateSaveStatus("未保存");
    return;
  }

  try {
    const savedData = JSON.parse(savedText);
    state = {
      reels: Array.isArray(savedData.reels) ? savedData.reels : [],
      spools: Array.isArray(savedData.spools) ? savedData.spools : [],
      lines: Array.isArray(savedData.lines) ? savedData.lines : [],
      setups: Array.isArray(savedData.setups) ? savedData.setups : [],
      histories: Array.isArray(savedData.histories) ? savedData.histories : [],
      selectedReelId: savedData.selectedReelId || "",
      selectedSpoolId: savedData.selectedSpoolId || "",
      lastCalculation: null,
      editingReelId: "",
      editingSpoolId: ""
    };
    updateSaveStatus("読込済み");
  } catch (error) {
    console.error(error);
    updateSaveStatus("読込失敗");
  }
}

// 現在の状態をLocalStorageに保存します。
function saveState() {
  const saveData = {
    reels: state.reels,
    spools: state.spools,
    lines: state.lines,
    setups: state.setups,
    histories: state.histories,
    selectedReelId: state.selectedReelId,
    selectedSpoolId: state.selectedSpoolId,
    savedAt: new Date().toISOString()
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
  updateSaveStatus("保存済み");
}

// 保存状態の短いメッセージを画面右上に表示します。
function updateSaveStatus(text) {
  elements.saveStatus.textContent = text;
}

// 履歴保存日の初期値を今日にします。
function setDefaultDate() {
  document.getElementById("woundDate").value = new Date().toISOString().slice(0, 10);
}

// アプリで使うイベントをまとめて登録します。
function bindEvents() {
  elements.tabButtons.forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
  });

  elements.refreshAppButton.addEventListener("click", refreshApplication);
  elements.reelForm.addEventListener("submit", handleReelSubmit);
  elements.spoolForm.addEventListener("submit", handleSpoolSubmit);
  elements.cancelReelEditButton.addEventListener("click", cancelReelEdit);
  elements.cancelSpoolEditButton.addEventListener("click", cancelSpoolEdit);
  elements.lineForm.addEventListener("submit", handleLineSubmit);
  elements.calculateForm.addEventListener("submit", handleCalculateSubmit);
  elements.historyForm.addEventListener("submit", handleHistorySubmit);
  elements.lineType.addEventListener("change", fillLinePresetOptions);
  elements.linePreset.addEventListener("change", applySelectedLinePreset);
  elements.capacityLineType.addEventListener("change", fillCapacityLineSizeOptions);
  elements.mainLineType.addEventListener("change", () => fillCalculationLineSizeOptions("main"));
  elements.backingLineType.addEventListener("change", () => fillCalculationLineSizeOptions("backing"));
  elements.databaseType.addEventListener("change", renderDatabaseTable);
  elements.calcReelSelect.addEventListener("change", handleCalcReelChange);
  elements.exportBackupButton.addEventListener("click", exportBackup);
  elements.importBackupInput.addEventListener("change", importBackup);
}

// 仕様変更後に古いCSSやJavaScriptが残る場合に備え、キャッシュ回避用の再読み込みを行います。
function refreshApplication() {
  const url = new URL(window.location.href);
  url.searchParams.set("refresh", Date.now().toString());
  window.location.href = url.toString();
}

// タブの表示状態を切り替えます。
function switchTab(tabName) {
  elements.tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabName);
  });

  elements.tabPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === `${tabName}Panel`);
  });
}

// リール登録フォームの内容を保存します。
function handleReelSubmit(event) {
  event.preventDefault();

  const reel = {
    id: state.editingReelId || createId("reel"),
    maker: "",
    name: getInputValue("reelName"),
    model: getInputValue("reelModel"),
    gearRatio: getNumberValue("reelGearRatio"),
    maxRetrieveCm: getNumberValue("reelMaxRetrieve"),
    purpose: "",
    memo: getInputValue("reelMemo"),
    createdAt: state.editingReelId ? getExistingCreatedAt(state.reels, state.editingReelId) : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (state.editingReelId) {
    state.reels = state.reels.map((item) => item.id === state.editingReelId ? reel : item);
  } else {
    state.reels.push(reel);
  }

  state.selectedReelId = reel.id;
  elements.reelForm.reset();
  state.editingReelId = "";
  updateEditModeButtons();
  saveState();
  renderAll();
}

// スプール登録フォームの内容を保存します。
function handleSpoolSubmit(event) {
  event.preventDefault();

  const selectedPreset = getCapacityPreset();
  const spool = {
    id: state.editingSpoolId || createId("spool"),
    reelId: elements.spoolReelSelect.value,
    name: getInputValue("spoolName"),
    purpose: "",
    emptyDiameterMm: getNumberValue("spoolEmptyDiameter"),
    capacityLineType: elements.capacityLineType.value,
    capacityLineSize: selectedPreset.size,
    capacityLineLb: selectedPreset.lb,
    capacityLineDiameterMm: selectedPreset.diameter_mm,
    capacityLengthM: getCapacityLengthValue(),
    memo: getInputValue("spoolMemo"),
    createdAt: state.editingSpoolId ? getExistingCreatedAt(state.spools, state.editingSpoolId) : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (state.editingSpoolId) {
    state.spools = state.spools.map((item) => item.id === state.editingSpoolId ? spool : item);
  } else {
    state.spools.push(spool);
  }

  state.selectedReelId = spool.reelId;
  state.selectedSpoolId = spool.id;
  elements.spoolForm.reset();
  fillCapacityLineSizeOptions();
  fillCapacityLengthOptions();
  state.editingSpoolId = "";
  updateEditModeButtons();
  saveState();
  renderAll();
}

// ライン登録フォームの内容を保存します。
function handleLineSubmit(event) {
  event.preventDefault();

  const line = {
    id: createId("line"),
    type: elements.lineType.value,
    sizeLabel: getInputValue("lineSizeLabel"),
    kg: getNumberValue("lineKg"),
    lb: getNumberValue("lineLb"),
    diameterMm: getNumberValue("lineDiameter"),
    brand: "",
    memo: getInputValue("lineMemo"),
    createdAt: new Date().toISOString()
  };

  state.lines.push(line);
  elements.lineForm.reset();
  fillLinePresetOptions();
  saveState();
  renderAll();
}

// 計算フォームから下巻き量と回転数を算出します。
function handleCalculateSubmit(event) {
  event.preventDefault();

  const reel = findById(state.reels, elements.calcReelSelect.value);
  const spool = findById(state.spools, elements.calcSpoolSelect.value);
  const mainLine = getCalculationLine("main");
  const backingLine = getCalculationLine("backing");
  const mainLengthM = getNumberValue("mainLength");

  if (!reel || !spool || !mainLine || !backingLine) {
    showResultMessage("計算に必要なリール、スプール、ライン条件を選択してください。");
    return;
  }

  if (!mainLine.diameterMm || !backingLine.diameterMm || !spool.capacityLineDiameterMm) {
    showResultMessage("ライン径またはカタログ基準ライン径が不足しています。");
    return;
  }

  const calculation = calculateBacking(reel, spool, mainLine, backingLine, mainLengthM);
  state.lastCalculation = calculation;
  renderCalculationResult(calculation);
}

// 計算結果と実作業結果を現在設定、履歴の両方に保存します。
function handleHistorySubmit(event) {
  event.preventDefault();

  if (!state.lastCalculation) {
    showResultMessage("先に下巻き計算を実行してください。");
    return;
  }

  const calculation = state.lastCalculation;
  const history = {
    id: createId("history"),
    spoolId: calculation.spool.id,
    reelId: calculation.reel.id,
    mainLineId: calculation.mainLine.id,
    backingLineId: calculation.backingLine.id,
    mainLineSnapshot: calculation.mainLine,
    backingLineSnapshot: calculation.backingLine,
    mainLengthM: calculation.mainLengthM,
    backingLengthM: calculation.backingLengthM,
    calculatedTurns: calculation.handleTurns,
    actualTurns: getNumberValue("actualTurns"),
    woundDate: getInputValue("woundDate"),
    rating: getInputValue("rating"),
    memo: getInputValue("historyMemo"),
    createdAt: new Date().toISOString()
  };

  const setup = {
    id: createId("setup"),
    spoolId: history.spoolId,
    historyId: history.id,
    mainLineId: history.mainLineId,
    backingLineId: history.backingLineId,
    mainLineSnapshot: history.mainLineSnapshot,
    backingLineSnapshot: history.backingLineSnapshot,
    mainLengthM: history.mainLengthM,
    backingLengthM: history.backingLengthM,
    calculatedTurns: history.calculatedTurns,
    actualTurns: history.actualTurns,
    woundDate: history.woundDate,
    rating: history.rating,
    memo: history.memo
  };

  state.histories.push(history);
  state.setups = state.setups.filter((item) => item.spoolId !== history.spoolId);
  state.setups.push(setup);
  elements.historyForm.reset();
  setDefaultDate();
  saveState();
  renderAll();
  renderCalculationResult(calculation);
}

// 下巻き量とハンドル回転数を計算します。
function calculateBacking(reel, spool, mainLine, backingLine, mainLengthM) {
  const spoolCapacity = spool.capacityLengthM * Math.pow(spool.capacityLineDiameterMm, 2);
  const mainCapacity = mainLengthM * Math.pow(mainLine.diameterMm, 2);
  const remainingCapacity = Math.max(spoolCapacity - mainCapacity, 0);
  const backingLengthM = remainingCapacity / Math.pow(backingLine.diameterMm, 2);

  const fullSpoolDiameterMm = calculateFullSpoolDiameter(reel);
  const emptySpoolDiameterMm = getEffectiveEmptySpoolDiameter(reel, spool);
  const isEmptySpoolDiameterEstimated = !spool.emptyDiameterMm;
  const estimatedInputDiameter = getNumberValue("estimatedBackingDiameter");
  const estimatedBackingDiameter = estimatedInputDiameter || estimateBackingEndDiameter(reel, spool, remainingCapacity, spoolCapacity);
  const averageSpoolDiameterMm = (emptySpoolDiameterMm + estimatedBackingDiameter) / 2;
  const retrievePerTurnM = (averageSpoolDiameterMm * Math.PI * reel.gearRatio) / 1000;
  const handleTurns = retrievePerTurnM > 0 ? backingLengthM / retrievePerTurnM : 0;

  return {
    reel,
    spool,
    mainLine,
    backingLine,
    mainLengthM,
    spoolCapacity,
    mainCapacity,
    remainingCapacity,
    backingLengthM,
    fullSpoolDiameterMm,
    emptySpoolDiameterMm,
    isEmptySpoolDiameterEstimated,
    estimatedBackingDiameter,
    averageSpoolDiameterMm,
    retrievePerTurnM,
    handleTurns
  };
}

// 最大巻取り長とギア比から、満巻き時の有効スプール径を逆算します。
function calculateFullSpoolDiameter(reel) {
  if (!reel.maxRetrieveCm || !reel.gearRatio) {
    return 0;
  }

  return (reel.maxRetrieveCm * 10) / Math.PI / reel.gearRatio;
}

// 空スプール径が未入力の場合は、満巻き推定径から仮の空スプール径を推定します。
function getEffectiveEmptySpoolDiameter(reel, spool) {
  if (spool.emptyDiameterMm) {
    return spool.emptyDiameterMm;
  }

  const fullSpoolDiameterMm = calculateFullSpoolDiameter(reel);

  if (!fullSpoolDiameterMm) {
    return 0;
  }

  return 22;
}

// 下巻き終了時の直径を簡易推定します。満巻き時径はリールの最大巻取り長から逆算します。
function estimateBackingEndDiameter(reel, spool, remainingCapacity, spoolCapacity) {
  const fullSpoolDiameterMm = calculateFullSpoolDiameter(reel);
  const emptySpoolDiameterMm = getEffectiveEmptySpoolDiameter(reel, spool);

  if (!fullSpoolDiameterMm || !spoolCapacity) {
    return emptySpoolDiameterMm;
  }

  const backingRatio = Math.min(Math.max(remainingCapacity / spoolCapacity, 0), 1);
  const safeFullDiameterMm = Math.max(fullSpoolDiameterMm, emptySpoolDiameterMm);
  const diameterRange = safeFullDiameterMm - emptySpoolDiameterMm;
  return emptySpoolDiameterMm + diameterRange * backingRatio;
}

// 計算結果を画面に表示します。
function renderCalculationResult(calculation) {
  elements.calculationResult.innerHTML = `
    <div class="result-grid">
      <div class="result-item">
        <span class="result-label">必要な下巻き量</span>
        <span class="result-value">${formatNumber(calculation.backingLengthM, 1)}m</span>
      </div>
      <div class="result-item">
        <span class="result-label">ハンドル回転数</span>
        <span class="result-value">約${Math.round(calculation.handleTurns)}回転</span>
      </div>
      <div class="result-item">
        <span class="result-label">空スプール径</span>
        <span class="result-value">${formatNumber(calculation.emptySpoolDiameterMm, 1)}mm</span>
      </div>
      <div class="result-item">
        <span class="result-label">平均スプール径</span>
        <span class="result-value">${formatNumber(calculation.averageSpoolDiameterMm, 1)}mm</span>
      </div>
      <div class="result-item">
        <span class="result-label">満巻き推定径</span>
        <span class="result-value">${formatNumber(calculation.fullSpoolDiameterMm, 1)}mm</span>
      </div>
      <div class="result-item">
        <span class="result-label">推定1回転巻取り長</span>
        <span class="result-value">${formatNumber(calculation.retrievePerTurnM * 100, 1)}cm</span>
      </div>
    </div>
    <p class="hint-text">${calculation.isEmptySpoolDiameterEstimated ? "空スプール径は未入力のため、22mmとして計算しています。測定値を入力すると回転数の精度が上がります。" : "空スプール径は入力値を使っています。"} 計算は目安です。巻きテンション、ライン実径、スプール形状で差が出るため、実際の回転数と評価を保存してください。</p>
  `;
}

// 計算結果エリアにメッセージを表示します。
function showResultMessage(message) {
  elements.calculationResult.innerHTML = `<p>${escapeHtml(message)}</p>`;
}

// 計算対象リールが変わった時に、スプール候補を更新します。
function handleCalcReelChange() {
  state.selectedReelId = elements.calcReelSelect.value;
  const firstSpool = state.spools.find((spool) => spool.reelId === state.selectedReelId);
  state.selectedSpoolId = firstSpool ? firstSpool.id : "";
  saveState();
  renderSelectors();
  renderHistoryList();
}

// ライン種類に応じた換算表を取得します。
function getLineDatabaseByType(type) {
  return type === "PE" ? PE_LINE_DATABASE : MONO_LINE_DATABASE;
}

// ライン登録フォームの規格選択肢を更新します。
function fillLinePresetOptions() {
  const database = getLineDatabaseByType(elements.lineType.value);
  elements.linePreset.innerHTML = database.map((item) => {
    return `<option value="${item.size}">${item.size} / ${item.lb}lb / ${item.diameter_mm}mm</option>`;
  }).join("");
  applySelectedLinePreset();
}

// 選択したライン規格をフォームに反映します。
function applySelectedLinePreset() {
  const database = getLineDatabaseByType(elements.lineType.value);
  const preset = database.find((item) => item.size === elements.linePreset.value) || database[0];

  if (!preset) {
    return;
  }

  document.getElementById("lineSizeLabel").value = `${elements.lineType.value}${preset.size} / ${formatNumber(preset.lb, 1)}lb`;
  document.getElementById("lineKg").value = preset.kg;
  document.getElementById("lineLb").value = preset.lb;
  document.getElementById("lineDiameter").value = preset.diameter_mm;
}

// カタログ基準ラインの選択肢を更新します。
function fillCapacityLineSizeOptions() {
  const database = getLineDatabaseByType(elements.capacityLineType.value);
  elements.capacityLineSize.innerHTML = database.map((item) => {
    return `<option value="${item.size}">${item.size} / ${formatNumber(item.lb, 1)}lb / ${item.diameter_mm}mm</option>`;
  }).join("");
}

// 計算画面のメインライン、下巻きラインの号数/lb選択肢を更新します。
function fillCalculationLineSizeOptions(target) {
  const lineTypeElement = target === "main" ? elements.mainLineType : elements.backingLineType;
  const lineSizeElement = target === "main" ? elements.mainLineSize : elements.backingLineSize;
  const database = getLineDatabaseByType(lineTypeElement.value);
  const currentValue = lineSizeElement.value;

  lineSizeElement.innerHTML = database.map((item) => {
    return `<option value="${item.size}">${item.size} / ${formatNumber(item.lb, 1)}lb / ${item.diameter_mm}mm</option>`;
  }).join("");

  if (database.some((item) => item.size === currentValue)) {
    lineSizeElement.value = currentValue;
  } else if (lineTypeElement.value === "フロロ" && database.some((item) => item.size === "4号")) {
    lineSizeElement.value = "4号";
  }
}

// 計算画面で選ばれたライン条件を、計算で扱いやすいラインデータに変換します。
function getCalculationLine(target) {
  const lineTypeElement = target === "main" ? elements.mainLineType : elements.backingLineType;
  const lineSizeElement = target === "main" ? elements.mainLineSize : elements.backingLineSize;
  const database = getLineDatabaseByType(lineTypeElement.value);
  const preset = database.find((item) => item.size === lineSizeElement.value);

  if (!preset) {
    return null;
  }

  return {
    id: `${target}_${lineTypeElement.value}_${preset.size}`,
    type: lineTypeElement.value,
    sizeLabel: `${preset.size} / ${formatNumber(preset.lb, 1)}lb`,
    kg: preset.kg,
    lb: preset.lb,
    diameterMm: preset.diameter_mm,
    brand: "",
    memo: ""
  };
}

// リールラインキャパのm数を選択肢として設定します。
function fillCapacityLengthOptions() {
  const lengthOptions = CAPACITY_LENGTH_OPTIONS.map((lengthM) => {
    const selectedText = lengthM === 150 ? " selected" : "";
    return `<option value="${lengthM}"${selectedText}>${lengthM}m</option>`;
  }).join("");

  elements.capacityLengthSelect.innerHTML = lengthOptions;
}

// 選択式のリールラインキャパから、計算に使うm数を取得します。
function getCapacityLengthValue() {
  const selectedLength = Number(elements.capacityLengthSelect.value);
  return Number.isFinite(selectedLength) ? selectedLength : 0;
}

// カタログ基準ラインとして選ばれている換算表データを返します。
function getCapacityPreset() {
  const database = getLineDatabaseByType(elements.capacityLineType.value);
  return database.find((item) => item.size === elements.capacityLineSize.value) || database[0];
}

// すべての表示を現在状態に合わせて更新します。
function renderAll() {
  renderSelectors();
  renderReelList();
  renderHistoryList();
  renderDatabaseTable();
  updateEditModeButtons();
}

// リール、スプール、ラインの選択肢を更新します。
function renderSelectors() {
  const reelOptions = state.reels.map((reel) => {
    return `<option value="${reel.id}">${escapeHtml(getReelName(reel))}</option>`;
  }).join("");

  elements.spoolReelSelect.innerHTML = reelOptions || `<option value="">先にリールを登録してください</option>`;
  elements.calcReelSelect.innerHTML = reelOptions || `<option value="">先にリールを登録してください</option>`;

  if (state.selectedReelId && state.reels.some((reel) => reel.id === state.selectedReelId)) {
    elements.spoolReelSelect.value = state.selectedReelId;
    elements.calcReelSelect.value = state.selectedReelId;
  }

  const currentReelId = elements.calcReelSelect.value || state.selectedReelId;
  const spoolOptions = state.spools
    .filter((spool) => spool.reelId === currentReelId)
    .map((spool) => `<option value="${spool.id}">${escapeHtml(spool.name)}</option>`)
    .join("");

  elements.calcSpoolSelect.innerHTML = spoolOptions || `<option value="">先にスプールを登録してください</option>`;

  if (state.selectedSpoolId && state.spools.some((spool) => spool.id === state.selectedSpoolId)) {
    elements.calcSpoolSelect.value = state.selectedSpoolId;
  }

  fillCalculationLineSizeOptions("main");
  fillCalculationLineSizeOptions("backing");
}

// 登録済みリールと紐づくスプールを一覧表示します。
function renderReelList() {
  if (state.reels.length === 0) {
    elements.reelList.innerHTML = `<p class="empty-text">まだリールが登録されていません。</p>`;
    return;
  }

  elements.reelList.innerHTML = state.reels.map((reel) => {
    const spools = state.spools.filter((spool) => spool.reelId === reel.id);
    const spoolHtml = spools.map((spool) => renderSpoolSummary(spool)).join("");

    return `
      <article class="item-card">
        <h3>${escapeHtml(getReelName(reel))}</h3>
        <p class="meta-line">ギア比：${formatNumber(reel.gearRatio, 1)} / 最大巻取り長：${formatNumber(reel.maxRetrieveCm, 1)}cm / スプール：${spools.length}個</p>
        <p class="meta-line">${escapeHtml(reel.memo || "")}</p>
        <div class="card-actions">
          <button class="small-button" type="button" onclick="selectReel('${reel.id}')">計算対象にする</button>
          <button class="small-button" type="button" onclick="editReel('${reel.id}')">編集</button>
          <button class="danger-button" type="button" onclick="deleteReel('${reel.id}')">削除</button>
        </div>
        <div class="list-stack">${spoolHtml || `<p class="empty-text">スプール未登録</p>`}</div>
      </article>
    `;
  }).join("");
}

// スプールの現在設定をリール一覧内に表示します。
function renderSpoolSummary(spool) {
  const setup = state.setups.find((item) => item.spoolId === spool.id);
  const mainLine = setup ? getStoredLine(setup, "main") : null;
  const backingLine = setup ? getStoredLine(setup, "backing") : null;
  const emptyDiameterText = spool.emptyDiameterMm ? `${formatNumber(spool.emptyDiameterMm, 1)}mm` : "未入力";

  return `
    <article class="item-card">
      <h3>${escapeHtml(spool.name)}</h3>
      <p class="meta-line">空径：${emptyDiameterText} / 満巻推定径：${formatNumber(getEstimatedFullDiameterForSpool(spool), 1)}mm / 基準：${escapeHtml(getCapacityLineName(spool))} ${formatNumber(spool.capacityLengthM, 1)}m</p>
      <p class="meta-line">メインライン：${setup && mainLine ? `${escapeHtml(getLineName(mainLine))} ${formatNumber(setup.mainLengthM, 1)}m` : "未設定"}</p>
      <p class="meta-line">下巻き：${setup && backingLine ? `${escapeHtml(getLineName(backingLine))} ${formatNumber(setup.backingLengthM, 1)}m` : "未設定"}</p>
      <div class="card-actions">
        <button class="small-button" type="button" onclick="selectSpool('${spool.reelId}', '${spool.id}')">このスプールで計算</button>
        <button class="small-button" type="button" onclick="editSpool('${spool.id}')">編集</button>
        <button class="danger-button" type="button" onclick="deleteSpool('${spool.id}')">削除</button>
      </div>
    </article>
  `;
}

// 履歴や現在設定に保存されたラインを取得します。新形式はスナップショット、旧形式は登録済みラインIDを使います。
function getStoredLine(record, target) {
  if (target === "main" && record.mainLineSnapshot) {
    return record.mainLineSnapshot;
  }

  if (target === "backing" && record.backingLineSnapshot) {
    return record.backingLineSnapshot;
  }

  const lineId = target === "main" ? record.mainLineId : record.backingLineId;
  return findById(state.lines, lineId);
}

// スプール一覧表示用に、紐づくリールから満巻き推定径を計算します。
function getEstimatedFullDiameterForSpool(spool) {
  const reel = findById(state.reels, spool.reelId);

  if (!reel) {
    return 0;
  }

  return calculateFullSpoolDiameter(reel);
}

// カタログ基準ラインの表示名を、号数とlbの両方が分かる形で作ります。
function getCapacityLineName(spool) {
  const capacityLineLb = spool.capacityLineLb || findLineDatabaseLb(spool.capacityLineType, spool.capacityLineSize);
  const lbText = capacityLineLb ? ` / ${formatNumber(capacityLineLb, 1)}lb` : "";

  return `${spool.capacityLineType} ${spool.capacityLineSize}${lbText}`;
}

// 古い保存データにlbがない場合でも、ライン径DBからlbを探して補完表示します。
function findLineDatabaseLb(lineType, lineSize) {
  const database = getLineDatabaseByType(lineType);
  const foundItem = database.find((item) => item.size === lineSize);

  return foundItem ? foundItem.lb : 0;
}

// 巻き替え履歴を新しい順で表示します。
function renderHistoryList() {
  const selectedSpoolId = elements.calcSpoolSelect.value || state.selectedSpoolId;
  const histories = state.histories
    .filter((history) => !selectedSpoolId || history.spoolId === selectedSpoolId)
    .slice()
    .sort((a, b) => String(b.woundDate).localeCompare(String(a.woundDate)));

  if (histories.length === 0) {
    elements.historyList.innerHTML = `<p class="empty-text">まだ履歴がありません。</p>`;
    return;
  }

  elements.historyList.innerHTML = histories.map((history) => {
    const reel = findById(state.reels, history.reelId);
    const spool = findById(state.spools, history.spoolId);
    const mainLine = getStoredLine(history, "main");
    const backingLine = getStoredLine(history, "backing");

    return `
      <article class="item-card">
        <h3>${escapeHtml(history.woundDate || "日付未設定")} ${escapeHtml(spool ? spool.name : "スプール不明")}</h3>
        <p class="meta-line">${escapeHtml(reel ? getReelName(reel) : "リール不明")}</p>
        <p class="meta-line">メインライン：${escapeHtml(mainLine ? getLineName(mainLine) : "不明")} ${formatNumber(history.mainLengthM, 1)}m</p>
        <p class="meta-line">下巻き：${escapeHtml(backingLine ? getLineName(backingLine) : "不明")} ${formatNumber(history.backingLengthM, 1)}m / 計算：約${Math.round(history.calculatedTurns)}回転 / 実際：${formatNumber(history.actualTurns, 0)}回転</p>
        <p class="meta-line">評価：${escapeHtml(history.rating || "未設定")} / メモ：${escapeHtml(history.memo || "")}</p>
      </article>
    `;
  }).join("");
}

// ライン径DBの表を表示します。
function renderDatabaseTable() {
  const database = getLineDatabaseByType(elements.databaseType.value);
  elements.databaseTable.innerHTML = database.map((item) => {
    return `
      <tr>
        <td>${escapeHtml(item.size)}</td>
        <td>${formatNumber(item.kg, 3)}</td>
        <td>${formatNumber(item.lb, 1)}</td>
        <td>${formatNumber(item.diameter_mm, 3)}</td>
      </tr>
    `;
  }).join("");
}

// 選択したリールを計算対象にします。
function selectReel(reelId) {
  state.selectedReelId = reelId;
  const firstSpool = state.spools.find((spool) => spool.reelId === reelId);
  state.selectedSpoolId = firstSpool ? firstSpool.id : "";
  saveState();
  renderAll();
  switchTab("calculator");
}

// 選択したスプールを計算対象にします。
function selectSpool(reelId, spoolId) {
  state.selectedReelId = reelId;
  state.selectedSpoolId = spoolId;
  saveState();
  renderAll();
  switchTab("calculator");
}

// リールの編集を開始し、登録フォームに現在値を読み込みます。
function editReel(reelId) {
  const reel = findById(state.reels, reelId);

  if (!reel) {
    return;
  }

  state.editingReelId = reelId;
  document.getElementById("reelName").value = reel.name || "";
  document.getElementById("reelModel").value = reel.model || "";
  document.getElementById("reelGearRatio").value = reel.gearRatio || "";
  document.getElementById("reelMaxRetrieve").value = reel.maxRetrieveCm || "";
  document.getElementById("reelMemo").value = reel.memo || "";
  updateEditModeButtons();
  switchTab("manage");
  elements.reelForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

// スプールの編集を開始し、登録フォームに現在値を読み込みます。
function editSpool(spoolId) {
  const spool = findById(state.spools, spoolId);

  if (!spool) {
    return;
  }

  state.editingSpoolId = spoolId;
  elements.spoolReelSelect.value = spool.reelId || "";
  document.getElementById("spoolName").value = spool.name || "";
  document.getElementById("spoolEmptyDiameter").value = spool.emptyDiameterMm || "";
  elements.capacityLineType.value = spool.capacityLineType || "PE";
  fillCapacityLineSizeOptions();
  elements.capacityLineSize.value = spool.capacityLineSize || elements.capacityLineSize.value;
  setCapacityLengthSelectValue(spool.capacityLengthM);
  document.getElementById("spoolMemo").value = spool.memo || "";
  updateEditModeButtons();
  switchTab("manage");
  elements.spoolForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

// リール編集を取り消して、追加モードに戻します。
function cancelReelEdit() {
  state.editingReelId = "";
  elements.reelForm.reset();
  updateEditModeButtons();
}

// スプール編集を取り消して、追加モードに戻します。
function cancelSpoolEdit() {
  state.editingSpoolId = "";
  elements.spoolForm.reset();
  fillCapacityLineSizeOptions();
  fillCapacityLengthOptions();
  updateEditModeButtons();
}

// 編集中かどうかに応じて、送信ボタンとキャンセルボタンの表示を変えます。
function updateEditModeButtons() {
  elements.reelSubmitButton.textContent = state.editingReelId ? "リールを更新" : "リールを追加";
  elements.spoolSubmitButton.textContent = state.editingSpoolId ? "スプールを更新" : "スプールを追加";
  elements.cancelReelEditButton.hidden = !state.editingReelId;
  elements.cancelSpoolEditButton.hidden = !state.editingSpoolId;
}

// 作成日時を維持するため、既存データからcreatedAtを取り出します。
function getExistingCreatedAt(items, id) {
  const item = findById(items, id);
  return item && item.createdAt ? item.createdAt : new Date().toISOString();
}

// 保存済みのリールラインキャパを選択肢に反映します。
function setCapacityLengthSelectValue(lengthM) {
  const formattedLength = formatNumber(lengthM, 1);
  const hasOption = Array.from(elements.capacityLengthSelect.options).some((option) => option.value === String(lengthM));

  if (!hasOption && lengthM) {
    const option = document.createElement("option");
    option.value = String(lengthM);
    option.textContent = `${formattedLength}m`;
    elements.capacityLengthSelect.appendChild(option);
  }

  if (lengthM) {
    elements.capacityLengthSelect.value = String(lengthM);
  }
}

// リールと関連データを削除します。誤操作を防ぐため確認します。
function deleteReel(reelId) {
  if (!confirm("このリールと紐づくスプール、履歴を削除します。よろしいですか？")) {
    return;
  }

  const spoolIds = state.spools.filter((spool) => spool.reelId === reelId).map((spool) => spool.id);
  state.reels = state.reels.filter((reel) => reel.id !== reelId);
  state.spools = state.spools.filter((spool) => spool.reelId !== reelId);
  state.setups = state.setups.filter((setup) => !spoolIds.includes(setup.spoolId));
  state.histories = state.histories.filter((history) => !spoolIds.includes(history.spoolId));
  state.selectedReelId = "";
  state.selectedSpoolId = "";
  state.editingReelId = state.editingReelId === reelId ? "" : state.editingReelId;
  state.editingSpoolId = spoolIds.includes(state.editingSpoolId) ? "" : state.editingSpoolId;
  updateEditModeButtons();
  saveState();
  renderAll();
}

// スプールと関連する現在設定、履歴を削除します。誤操作を防ぐため確認します。
function deleteSpool(spoolId) {
  if (!confirm("このスプールと履歴を削除します。よろしいですか？")) {
    return;
  }

  state.spools = state.spools.filter((spool) => spool.id !== spoolId);
  state.setups = state.setups.filter((setup) => setup.spoolId !== spoolId);
  state.histories = state.histories.filter((history) => history.spoolId !== spoolId);
  state.selectedSpoolId = "";
  state.editingSpoolId = state.editingSpoolId === spoolId ? "" : state.editingSpoolId;
  updateEditModeButtons();
  saveState();
  renderAll();
}

// 登録データをJSONファイルとして出力します。
function exportBackup() {
  const backupData = {
    appName: "ANGLER",
    version: "1.0",
    exportedAt: new Date().toISOString(),
    reels: state.reels,
    spools: state.spools,
    lines: state.lines,
    setups: state.setups,
    histories: state.histories
  };

  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `angler_backup_${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

// JSONバックアップを読み込み、現在のブラウザ内データを置き換えます。
function importBackup(event) {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  if (!confirm("現在のブラウザ内データを、選択したバックアップで置き換えます。よろしいですか？")) {
    event.target.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const importedData = JSON.parse(reader.result);
      state.reels = Array.isArray(importedData.reels) ? importedData.reels : [];
      state.spools = Array.isArray(importedData.spools) ? importedData.spools : [];
      state.lines = Array.isArray(importedData.lines) ? importedData.lines : [];
      state.setups = Array.isArray(importedData.setups) ? importedData.setups : [];
      state.histories = Array.isArray(importedData.histories) ? importedData.histories : [];
      state.selectedReelId = "";
      state.selectedSpoolId = "";
      state.lastCalculation = null;
      saveState();
      renderAll();
      alert("バックアップを読み込みました。");
    } catch (error) {
      console.error(error);
      alert("JSONファイルを読み込めませんでした。");
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

// 入力欄の文字列を取得します。
function getInputValue(id) {
  return document.getElementById(id).value.trim();
}

// 入力欄の数値を取得します。未入力や不正値は0として扱います。
function getNumberValue(id) {
  const value = Number(document.getElementById(id).value);
  return Number.isFinite(value) ? value : 0;
}

// ID付き配列から対象データを探します。
function findById(items, id) {
  return items.find((item) => item.id === id);
}

// ブラウザ内だけで使う簡易IDを作ります。
function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// リールの表示名を作ります。
function getReelName(reel) {
  return `${reel.name} ${reel.model}`.trim();
}

// ラインの表示名を作ります。
function getLineName(line) {
  const brandText = line.brand ? ` ${line.brand}` : "";
  const typeText = line.sizeLabel && line.sizeLabel.startsWith(line.type) ? "" : `${line.type} `;
  return `${typeText}${line.sizeLabel}${brandText} ${formatNumber(line.diameterMm, 3)}mm`;
}

// 数値表示の桁を整えます。
function formatNumber(value, digits) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toFixed(digits).replace(/\.?0+$/, "");
}

// HTMLに埋め込む文字を安全な形にします。
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// HTML読み込み完了後にアプリを開始します。
document.addEventListener("DOMContentLoaded", initializeApp);

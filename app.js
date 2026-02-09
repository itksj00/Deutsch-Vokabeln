// ========== 전역 변수 ==========
let currentPriority = null;    // 현재 중요도 (1, 2, 3)
let currentLevel = null;        // 현재 레벨 (1~N)
let currentMode = null;         // 현재 모드 ('mc' 또는 'tp')
let currentQuestions = [];      // 현재 문제 배열
let currentQuestionIndex = 0;   // 현재 문제 인덱스
let score = 0;                  // 현재 점수
let answered = false;           // 현재 문제 답변 완료 여부

// ========== 앱 초기화 ==========
function initializeApp() {
    loadProgressFromStorage();
    loadStatsFromStorage();
    renderPrioritySelection();
}

// ========== 페이지 로드 시 앱 시작 ==========
window.addEventListener('DOMContentLoaded', initializeApp);

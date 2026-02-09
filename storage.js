// ========== 로컬스토리지 관리 ==========

const STORAGE_KEY = 'germanVocabProgress';
const STATS_KEY = 'germanVocabStats';

// ========== 진행 상황 관리 ==========

function loadProgressFromStorage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
        initializeProgress();
        return;
    }
    window.progress = JSON.parse(saved);
}

function initializeProgress() {
    window.progress = { levels: {} };
    
    // 모든 레벨 초기화
    for (let priority = 1; priority <= 3; priority++) {
        const levelCount = priorityInfo[priority.toString()].levelCount;
        for (let level = 1; level <= levelCount; level++) {
            const key = `${priority}_${level}`;
            window.progress.levels[key] = {
                mcPassed: false,
                tpPassed: false,
                mcScore: 0,
                tpScore: 0,
                mcTotal: 0,
                tpTotal: 0
            };
        }
    }
    
    saveProgressToStorage();
}

function saveProgressToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(window.progress));
}

// ========== 통계 관리 ==========

function loadStatsFromStorage() {
    const saved = localStorage.getItem(STATS_KEY);
    if (!saved) {
        window.stats = {
            totalAttempts: 0,
            totalCorrect: 0,
            learnedWords: {},
            mistakes: {}
        };
        saveStatsToStorage();
        return;
    }
    window.stats = JSON.parse(saved);
    
    if (!window.stats.learnedWords) {
        window.stats.learnedWords = {};
        saveStatsToStorage();
    }
}

function saveStatsToStorage() {
    localStorage.setItem(STATS_KEY, JSON.stringify(window.stats));
}

function recordAnswer(questionId, german, korean, isCorrect) {
    window.stats.totalAttempts++;
    
    const key = `${german}|${korean}`;
    if (!window.stats.learnedWords[key]) {
        window.stats.learnedWords[key] = {
            german: german,
            korean: korean,
            firstSeen: Date.now()
        };
    }
    
    if (isCorrect) {
        window.stats.totalCorrect++;
    } else {
        if (!window.stats.mistakes[key]) {
            window.stats.mistakes[key] = {
                german: german,
                korean: korean,
                count: 0
            };
        }
        window.stats.mistakes[key].count++;
    }
    
    saveStatsToStorage();
}

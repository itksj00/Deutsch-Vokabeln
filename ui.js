// ========== UI 렌더링 ==========

// 중요도 선택 화면 렌더링
function renderPrioritySelection() {
    // 통계 업데이트
    for (let priority = 1; priority <= 3; priority++) {
        const info = priorityInfo[priority.toString()];
        const statsDiv = document.getElementById(`priority${priority}Stats`);
        
        // 완료한 레벨 수 계산
        let completedLevels = 0;
        for (let level = 1; level <= info.levelCount; level++) {
            const key = `${priority}_${level}`;
            const levelInfo = window.progress.levels[key];
            if (levelInfo && levelInfo.mcPassed && levelInfo.tpPassed) {
                completedLevels++;
            }
        }
        
        statsDiv.innerHTML = `
            <div>${info.totalWords}개 단어</div>
            <div>${info.levelCount}개 레벨</div>
            <div class="completed-badge">${completedLevels}/${info.levelCount} 완료</div>
        `;
    }
    
    document.getElementById('prioritySelection').style.display = 'block';
    document.getElementById('levelSelection').style.display = 'none';
    document.getElementById('learningMode').classList.remove('active');
}

// 중요도 선택
function selectPriority(priority) {
    currentPriority = priority;
    renderLevelSelection(priority);
}

// 레벨 선택 화면 렌더링
function renderLevelSelection(priority) {
    const info = priorityInfo[priority];
    document.getElementById('levelSelectionTitle').textContent = `중요도 ${priority} - 레벨 선택`;
    
    const levelGrid = document.getElementById('levelGrid');
    levelGrid.innerHTML = '';
    
    for (let level = 1; level <= info.levelCount; level++) {
        const key = `${priority}_${level}`;
        const levelInfo = window.progress.levels[key];
        const words = levelData[key];
        const wordCount = words ? words.length : 0;
        
        // 이전 레벨을 모두 완료했는지 확인
        let isUnlocked = level === 1;
        if (level > 1) {
            const prevKey = `${priority}_${level - 1}`;
            const prevInfo = window.progress.levels[prevKey];
            isUnlocked = prevInfo && prevInfo.mcPassed && prevInfo.tpPassed;
        }
        
        const card = document.createElement('div');
        card.className = 'level-card' + (isUnlocked ? '' : ' disabled');
        
        // 완료 배지
        let statusHTML = '';
        if (levelInfo && levelInfo.mcPassed && levelInfo.tpPassed) {
            statusHTML = '<div class="status-badge">✓ 완료</div>';
        }
        
        // 점수 표시
        let scoreHTML = '';
        if (levelInfo && (levelInfo.mcTotal > 0 || levelInfo.tpTotal > 0)) {
            scoreHTML = '<div class="score-display">';
            if (levelInfo.mcTotal > 0) {
                scoreHTML += `<span class="mc-score">MC: ${levelInfo.mcScore}/${levelInfo.mcTotal}</span>`;
            }
            if (levelInfo.tpTotal > 0) {
                scoreHTML += `<span class="tp-score">TP: ${levelInfo.tpScore}/${levelInfo.tpTotal}</span>`;
            }
            scoreHTML += '</div>';
        }
        
        card.innerHTML = `
            <div class="level-number">Level ${level}</div>
            <div class="level-words">${wordCount}개 단어</div>
            <div class="mode-buttons">
                <button class="mode-btn mc" ${isUnlocked ? '' : 'disabled'} onclick="startMode(${priority}, ${level}, 'mc')">Multiple Choice</button>
                <button class="mode-btn tp" ${isUnlocked ? '' : 'disabled'} onclick="startMode(${priority}, ${level}, 'tp')">Typing Practice</button>
            </div>
            ${scoreHTML}
            ${statusHTML}
        `;
        
        levelGrid.appendChild(card);
    }
    
    document.getElementById('prioritySelection').style.display = 'none';
    document.getElementById('levelSelection').style.display = 'block';
}

// 중요도 선택으로 돌아가기
function backToPriority() {
    renderPrioritySelection();
}

// 레벨 선택으로 돌아가기
function backToLevelSelection() {
    document.getElementById('resultModal').classList.remove('show');
    document.getElementById('learningMode').classList.remove('active');
    renderLevelSelection(currentPriority);
}

// 진행률 업데이트
function updateProgress() {
    const total = currentQuestions.length;
    const current = currentQuestionIndex + 1;
    document.getElementById('questionCounter').textContent = `${current} / ${total}`;
    const percentage = (current / total) * 100;
    document.getElementById('progressFill').style.width = percentage + '%';
}

// 결과 모달 표시
function showResultModal() {
    const totalQuestions = currentQuestions.length;
    const passScore = Math.ceil(totalQuestions * 0.9);
    const isPassed = score >= passScore;
    const percentage = Math.round((score / totalQuestions) * 100);
    
    let resultTitle = '';
    if (isPassed) {
        resultTitle = currentMode === 'mc' ? 'Sehr gut! 🎉' : 'Ausgezeichnet! 🎊';
    } else {
        resultTitle = '다시 시도해주세요 📚';
    }
    
    document.getElementById('resultTitle').textContent = resultTitle;
    document.getElementById('resultScore').textContent = `${score} / ${totalQuestions}`;
    document.getElementById('resultMessage').textContent = 
        `정답률: ${percentage}% ${isPassed ? '통과했습니다!' : '통과하지 못했습니다.'}`;
    
    // 진행 상황 업데이트
    const key = `${currentPriority}_${currentLevel}`;
    if (currentMode === 'mc') {
        window.progress.levels[key].mcScore = score;
        window.progress.levels[key].mcTotal = totalQuestions;
        if (isPassed) {
            window.progress.levels[key].mcPassed = true;
        }
    } else {
        window.progress.levels[key].tpScore = score;
        window.progress.levels[key].tpTotal = totalQuestions;
        if (isPassed) {
            window.progress.levels[key].tpPassed = true;
        }
    }
    saveProgressToStorage();
    
    document.getElementById('resultModal').classList.add('show');
}

// 재시도
function retryMode() {
    document.getElementById('resultModal').classList.remove('show');
    startMode(currentPriority, currentLevel, currentMode);
}

// ========== 통계 모달 ==========

function showStatsModal() {
    updateStatsDisplay();
    document.getElementById('statsModal').classList.add('show');
}

function closeStatsModal() {
    document.getElementById('statsModal').classList.remove('show');
}

function updateStatsDisplay() {
    const totalWords = window.stats.learnedWords ? Object.keys(window.stats.learnedWords).length : 0;
    const totalCorrect = window.stats.totalCorrect;
    const totalAttempts = window.stats.totalAttempts;
    const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
    
    // 완료한 레벨 수 계산
    let completedLevels = 0;
    for (let key in window.progress.levels) {
        const levelInfo = window.progress.levels[key];
        if (levelInfo.mcPassed && levelInfo.tpPassed) {
            completedLevels++;
        }
    }
    
    document.getElementById('totalWords').textContent = totalWords + '개';
    document.getElementById('totalCorrect').textContent = totalCorrect + '개';
    document.getElementById('totalAccuracy').textContent = accuracy + '%';
    document.getElementById('completedLevels').textContent = completedLevels + '개';
    
    // 자주 틀리는 단어 TOP 10
    const mistakeList = document.getElementById('mistakeList');
    const mistakes = Object.values(window.stats.mistakes)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    
    if (mistakes.length === 0) {
        mistakeList.innerHTML = '<p style="text-align: center; color: #999;">아직 데이터가 없습니다.</p>';
    } else {
        mistakeList.innerHTML = mistakes.map(mistake => 
            `<div class="mistake-item">
                <div class="mistake-word">${mistake.german} → ${mistake.korean}</div>
                <div class="mistake-count">틀린 횟수: ${mistake.count}회</div>
            </div>`
        ).join('');
    }
}

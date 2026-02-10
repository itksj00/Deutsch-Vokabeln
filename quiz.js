// ========== 퀴즈 로직 ==========

// 모드 시작
function startMode(priority, level, mode) {
    currentPriority = priority;
    currentLevel = level;
    currentMode = mode;
    currentQuestionIndex = 0;
    score = 0;
    answered = false;
    
    // 문제 섞기
    const key = `${priority}_${level}`;
    currentQuestions = levelData[key].slice().sort(() => Math.random() - 0.5);
    
    // 화면 전환
    document.getElementById('levelSelection').style.display = 'none';
    document.getElementById('learningMode').classList.add('active');
    
    document.getElementById('mcMode').style.display = mode === 'mc' ? 'block' : 'none';
    document.getElementById('tpMode').style.display = mode === 'tp' ? 'block' : 'none';
    
    const modeTitle = mode === 'mc' 
        ? `중요도 ${priority} - Level ${level} - Multiple Choice` 
        : `중요도 ${priority} - Level ${level} - Typing Practice`;
    document.getElementById('modeTitle').textContent = modeTitle;
    
    if (mode === 'mc') {
        displayMCQuestion();
    } else {
        displayTPQuestion();
    }
}

// ========== Multiple Choice 모드 ==========

function displayMCQuestion() {
    if (currentQuestionIndex >= currentQuestions.length) {
        showResultModal();
        return;
    }
    
    answered = false;
    document.getElementById('mcFeedback').classList.remove('show', 'correct', 'incorrect');
    document.getElementById('mcNextBtn').disabled = true;
    
    const question = currentQuestions[currentQuestionIndex];
    
    document.getElementById('mcPosLabel').textContent = `(${getPosLabel(question.pos)})`;
    document.getElementById('koreanWord').textContent = question.korean;
    
    // 선택지 생성 (같은 품사 우선)
    const answers = [question.german];
    const samePosList = currentQuestions.filter(q => 
        q.id !== question.id && q.pos === question.pos
    );
    
    // 같은 품사에서 3개 선택, 부족하면 다른 품사
    const candidates = samePosList.length >= 3 
        ? samePosList 
        : currentQuestions.filter(q => q.id !== question.id);
    
    const shuffled = candidates.slice().sort(() => Math.random() - 0.5);
    for (let i = 0; i < shuffled.length && answers.length < 4; i++) {
        if (answers.indexOf(shuffled[i].german) === -1) {
            answers.push(shuffled[i].german);
        }
    }
    
    // 선택지 섞기
    answers.sort(() => Math.random() - 0.5);
    
    // 선택지 버튼 생성
    const choicesDiv = document.getElementById('choices');
    choicesDiv.innerHTML = '';
    answers.forEach((answer, idx) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = answer;
        btn.onclick = () => selectMCAnswer(answer, question.german, idx);
        choicesDiv.appendChild(btn);
    });
    
    updateProgress();
}

function selectMCAnswer(selected, correct, idx) {
    if (answered) return;
    
    const question = currentQuestions[currentQuestionIndex];
    const isCorrect = selected === correct;
    answered = true;
    
    if (isCorrect) {
        score++;
        recordAnswer(question.id, question.german, question.korean, true);
    } else {
        recordAnswer(question.id, question.german, question.korean, false);
    }
    
    // 버튼 상태 업데이트
    const choiceBtns = document.querySelectorAll('.choice-btn');
    choiceBtns.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === correct) {
            btn.classList.add('selected', 'correct');
        }
    });
    
    if (!isCorrect) {
        choiceBtns[idx].classList.add('selected', 'incorrect');
    }
    
    // 피드백 표시 (예문 포함)
    const feedback = document.getElementById('mcFeedback');
    const exampleSentences = getExampleSentences(correct, question.korean);
    
    if (isCorrect) {
        feedback.innerHTML = `
            <div class="feedback-title">✓ 정답입니다!</div>
            <div class="feedback-word">${correct} - ${question.korean}</div>
            <div class="example-sentences">
                ${exampleSentences.map(ex => `<div class="example-item">${ex}</div>`).join('')}
            </div>
        `;
        feedback.classList.add('show', 'correct');
    } else {
        feedback.innerHTML = `
            <div class="feedback-title">✗ 오답입니다</div>
            <div class="feedback-word">정답: ${correct} - ${question.korean}</div>
            <div class="example-sentences">
                ${exampleSentences.map(ex => `<div class="example-item">${ex}</div>`).join('')}
            </div>
        `;
        feedback.classList.add('show', 'incorrect');
    }
    
    document.getElementById('mcNextBtn').disabled = false;
}

function nextMCQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex >= currentQuestions.length) {
        showResultModal();
    } else {
        displayMCQuestion();
    }
}

// ========== Typing Practice 모드 ==========

function displayTPQuestion() {
    if (currentQuestionIndex >= currentQuestions.length) {
        showResultModal();
        return;
    }
    
    answered = false;
    document.getElementById('tpFeedback').classList.remove('show', 'correct', 'incorrect');
    document.getElementById('tpSubmitBtn').style.display = 'inline-block';
    document.getElementById('tpSubmitBtn').disabled = false;
    
    const tpNextBtn = document.getElementById('tpNextBtn');
    if (tpNextBtn) {
        tpNextBtn.style.display = 'none';
    }
    
    const question = currentQuestions[currentQuestionIndex];
    document.getElementById('posLabel').textContent = `(${getPosLabel(question.pos)})`;
    document.getElementById('germanMeaning').textContent = question.korean;
    
    const typingInput = document.getElementById('typingInput');
    typingInput.value = '';
    typingInput.disabled = false;
    typingInput.focus();
    
    // 스타일 초기화
    typingInput.style.background = '';
    typingInput.style.color = '';
    typingInput.style.borderColor = '';
    
    // Enter 키로 제출
    typingInput.onkeydown = (e) => {
        if (e.key === 'Enter' && !answered) {
            submitTypingPractice();
        }
    };
    
    updateProgress();
}

function submitTypingPractice() {
    if (answered) return;
    answered = true;
    
    const question = currentQuestions[currentQuestionIndex];
    const typingInput = document.getElementById('typingInput');
    const userAnswer = typingInput.value.trim();
    const correctAnswer = question.german.trim();
    
    const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
    
    if (isCorrect) score++;
    
    recordAnswer(question.id, question.german, question.korean, isCorrect);
    
    // 입력 박스 상태
    typingInput.disabled = true;
    if (isCorrect) {
        typingInput.style.background = '#2ecc71';
        typingInput.style.color = 'white';
        typingInput.style.borderColor = '#27ae60';
    } else {
        typingInput.style.background = '#e74c3c';
        typingInput.style.color = 'white';
        typingInput.style.borderColor = '#c0392b';
    }
    
    // 피드백 표시 (정답과 예문 포함)
    const feedback = document.getElementById('tpFeedback');
    const exampleSentences = getExampleSentences(question.german, question.korean);
    
    if (isCorrect) {
        feedback.innerHTML = `
            <div class="feedback-title">✓ 정답입니다!</div>
            <div class="feedback-word">${correctAnswer} - ${question.korean}</div>
            <div class="example-sentences">
                ${exampleSentences.map(ex => `<div class="example-item">${ex}</div>`).join('')}
            </div>
        `;
        feedback.classList.add('show', 'correct');
    } else {
        feedback.innerHTML = `
            <div class="feedback-title">✗ 오답입니다</div>
            <div class="feedback-word">정답: ${correctAnswer} - ${question.korean}</div>
            <div class="example-sentences">
                ${exampleSentences.map(ex => `<div class="example-item">${ex}</div>`).join('')}
            </div>
        `;
        feedback.classList.add('show', 'incorrect');
    }
    
    // 버튼 상태 변경
    const tpSubmitBtn = document.getElementById('tpSubmitBtn');
    const tpNextBtn = document.getElementById('tpNextBtn');
    if (tpSubmitBtn) {
        tpSubmitBtn.style.display = 'none';
    }
    if (tpNextBtn) {
        tpNextBtn.style.display = 'inline-block';
        tpNextBtn.focus();
    }
}

function nextTPQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex >= currentQuestions.length) {
        showResultModal();
    } else {
        displayTPQuestion();
    }
}

// ========== 유틸리티 ==========

function getPosLabel(pos) {
    const labels = {
        'noun': '명사',
        'verb': '동사',
        'adjective': '형용사',
        'adverb': '부사',
        'other': '기타'
    };
    return labels[pos] || pos;
}

// 예문 생성 함수
function getExampleSentences(german, korean) {
    // 품사에 따른 예문 템플릿
    const templates = [
        `${german}은(는) "${korean}"을(를) 의미합니다.`,
        `일상에서 ${german}을(를) 자주 사용합니다.`
    ];
    
    // 명사인 경우 (정관사 포함)
    if (german.startsWith('der ') || german.startsWith('die ') || german.startsWith('das ')) {
        const parts = german.split(' ');
        const article = parts[0];
        const noun = parts.slice(1).join(' ');
        
        return [
            `Ich habe ${german} gesehen. (나는 ${korean}을(를) 보았습니다.)`,
            `${article.charAt(0).toUpperCase() + article.slice(1)} ${noun} ist wichtig. (${korean}은(는) 중요합니다.)`
        ];
    }
    
    // 동사인 경우
    if (german.endsWith('en') || german.endsWith('eln') || german.endsWith('ern')) {
        return [
            `Ich möchte ${german}. (나는 ${korean}하고 싶습니다.)`,
            `Wir müssen ${german}. (우리는 ${korean}해야 합니다.)`
        ];
    }
    
    // 형용사/기타
    return templates;
}
// State
let currentSlide = 0;
let isAnimating = false;
let touchStartX = 0;
let touchEndX = 0;
let currentLang = 'ko';

// Cache DOM elements
const slidesRoot = document.getElementById('slides');
const allSlides = () => document.querySelectorAll('.slide'); // function to get fresh NodeList
const totalSlides = () => allSlides().length;
const dotsContainer = document.getElementById('dotsContainer');
const languageSelect = document.getElementById('languageSelect');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// Translations (inline to match your original structure)
const translations = {
    en: {
        'connect-title': 'Connect',
        'connect-desc': 'Let\'s connect! Find me on various platforms and stay in touch.',
        'linkedin': 'LinkedIn',
        'github': 'GitHub',
        'twitter': 'Twitter',
        'email': 'Email',

        'resume-title': 'Resume',
        'resume-desc': 'Explore my professional background, experience, and skills.',
        'view-resume': 'View Resume',
        'experience': 'Experience',
        'skills': 'Skills',
        'download-cv': 'Download CV',

        'portfolio-title': 'Portfolio',
        'portfolio-desc': 'Check out my projects and creative work.',
        'portfolio': 'Portfolio',
        'project1': 'Project 1',
        'project2': 'Project 2',
        'website': 'Website',

        'personal-title': 'Personal',
        'personal-desc': 'Beyond work, here\'s what makes me tick. Interests, hobbies, and stories.',
        'hobbies': 'Hobbies',
        'my-story': 'My Story',
        'adventures': 'Adventures',
        'photography': 'Photography',

        'quote': 'The highest of all studies is to know yourself.',
        'quote-author': '— Plato'
    },
    ko: {
        'connect-title': '소셜 링크 / 소개',
        'connect-desc': '다음 링크에서 제 활동을 확인하실 수 있습니다.',
        'linkedin': '링크드인',
        'github': '깃허브',
        'twitter': '트위터',
        'email': '이메일',

        'resume-title': '이력서 / 경력 소개',
        'resume-desc': '제 경력과 걸어온 길에 대해 소개드립니다.',
        'view-resume': '이력서 보기',
        'experience': '경력',
        'skills': '스킬',
        'download-cv': 'CV 다운로드',

        'portfolio-title': '포트폴리오 / 프로젝트',
        'portfolio-desc': '제가 진행한 프로젝트와 작업물을 모아두었습니다.\n추가로 아이디어를 실현한 다양한 프로젝트들도 존재합니다.',
        'portfolio': '포트폴리오',
        'project1': '프로젝트 1',
        'project2': '프로젝트 2',
        'website': '웹사이트',

        'personal-title': '취미 / 개인 이야기',
        'personal-desc': '일상 속 작은 즐거움과 저의 이야기를 담았습니다.\n취미와 경험을 통해 저를 더 소개합니다.',
        'hobbies': '취미',
        'my-story': '나의 이야기',
        'adventures': '모험',
        'photography': '사진',

        'quote': '모든 학문 중 가장 높은 것은 자기 자신을 아는 것이다.',
        'quote-author': '— 플라톤'
    },
    de: {
        'connect-title': 'Verbinden',
        'connect-desc': 'Lassen Sie uns verbinden! Finden Sie mich auf verschiedenen Plattformen.',
        'linkedin': 'LinkedIn',
        'github': 'GitHub',
        'twitter': 'Twitter',
        'email': 'E-Mail',

        'resume-title': 'Lebenslauf',
        'resume-desc': 'Erkunden Sie meinen beruflichen Hintergrund, Erfahrung und Fähigkeiten.',
        'view-resume': 'Lebenslauf ansehen',
        'experience': 'Erfahrung',
        'skills': 'Fähigkeiten',
        'download-cv': 'CV herunterladen',

        'portfolio-title': 'Portfolio',
        'portfolio-desc': 'Schauen Sie sich meine Projekte und kreativen Arbeiten an.',
        'portfolio': 'Portfolio',
        'project1': 'Projekt 1',
        'project2': 'Projekt 2',
        'website': 'Webseite',

        'personal-title': 'Persönlich',
        'personal-desc': 'Jenseits der Arbeit, hier ist was mich antreibt. Interessen, Hobbys und Geschichten.',
        'hobbies': 'Hobbys',
        'my-story': 'Meine Geschichte',
        'adventures': 'Abenteuer',
        'photography': 'Fotografie',

        'quote': 'Das höchste aller Studien ist, sich selbst zu kennen.',
        'quote-author': '— Platon'
    }
};

// Translation
function translatePage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
    loadQuotes(lang);
}

// Quotes loading from quotesConfig (provided by quotes.js)
function loadQuotes(lang) {
    document.querySelectorAll('[data-quote]').forEach(el => {
        const key = el.getAttribute('data-quote');
        const [page, type] = key.split('-'); // e.g., page1-text
        if (window.quotesConfig && quotesConfig[page] && quotesConfig[page][lang]) {
            if (type === 'text') {
                el.textContent = quotesConfig[page][lang].text;
            } else if (type === 'author') {
                el.textContent = quotesConfig[page][lang].author;
            }
        }
    });
}

// Links loading from linkConfig (provided by config.js)
function loadLinksFromConfig() {
    if (!window.linkConfig) return;
    document.querySelectorAll('[data-link]').forEach(link => {
        const path = link.getAttribute('data-link').split('.');
        const section = path[0];
        const key = path[1];
        if (linkConfig[section] && linkConfig[section][key]) {
            link.href = linkConfig[section][key];
        }
    });
}

// Dots
function createDots() {
    dotsContainer.innerHTML = '';
    const count = totalSlides();
    for (let i = 0; i < count; i++) {
        const dot = document.createElement('button');
        dot.className = 'dot';
        dot.type = 'button';
        dot.setAttribute('aria-label', `슬라이드 ${i + 1}로 이동`);
        dot.onclick = () => goToSlide(i);
        if (i === currentSlide) dot.classList.add('active');
        dotsContainer.appendChild(dot);
    }
}

// Update slides with animation
function updateSlides(direction = 'forward') {
    if (isAnimating) return;
    isAnimating = true;

    const slides = allSlides();

    // Remove animations
    slides.forEach(slide => {
        slide.classList.remove('flipping-out', 'flipping-in', 'flipping-out-reverse', 'flipping-in-reverse');
    });

    // Show only current slide
    slides.forEach((slide, index) => {
        slide.style.display = index === currentSlide ? 'flex' : 'none';
    });

    // Add flip animation for current slide
    if (direction === 'forward') {
        slides[currentSlide].classList.add('flipping-in');
    } else {
        slides[currentSlide].classList.add('flipping-in-reverse');
    }

    // Update dots
    document.querySelectorAll('.dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });

    // End animation
    setTimeout(() => {
        isAnimating = false;
        slides.forEach(slide => {
            slide.classList.remove('flipping-out', 'flipping-in', 'flipping-out-reverse', 'flipping-in-reverse');
        });
    }, 800);
}

// Navigation
function nextSlide() {
    if (isAnimating) return;
    const previous = currentSlide;
    currentSlide = (currentSlide + 1) % totalSlides();
    const slides = allSlides();
    slides[previous].classList.add('flipping-out');
    setTimeout(() => updateSlides('forward'), 50);
}
function previousSlide() {
    if (isAnimating) return;
    const previous = currentSlide;
    currentSlide = (currentSlide - 1 + totalSlides()) % totalSlides();
    const slides = allSlides();
    slides[previous].classList.add('flipping-out-reverse');
    setTimeout(() => updateSlides('backward'), 50);
}
function goToSlide(index) {
    if (isAnimating || index === currentSlide) return;
    const direction = index > currentSlide ? 'forward' : 'backward';
    const previous = currentSlide;
    currentSlide = index;

    const slides = allSlides();
    if (direction === 'forward') {
        slides[previous].classList.add('flipping-out');
    } else {
        slides[previous].classList.add('flipping-out-reverse');
    }
    setTimeout(() => updateSlides(direction), 50);
}

// Touch/swipe
function handleSwipe() {
    if (touchStartX - touchEndX > 50) nextSlide();
    if (touchEndX - touchStartX > 50) previousSlide();
}

// Init
window.addEventListener('DOMContentLoaded', () => {
    // Initial display
    createDots();
    loadLinksFromConfig();
    translatePage(currentLang); // also loads quotes
    updateSlides('forward');

    // Events
    slidesRoot.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });
    slidesRoot.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') previousSlide();
        else if (e.key === 'ArrowRight') nextSlide();
    });

    prevBtn.addEventListener('click', previousSlide);
    nextBtn.addEventListener('click', nextSlide);

    languageSelect.addEventListener('change', (e) => {
        translatePage(e.target.value);
    });
});

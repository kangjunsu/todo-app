// Supabase 클라이언트 초기화
const SUPABASE_URL = 'https://gakynwqgyqnljcipchrb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdha3lud3FneXFubGpjaXBjaHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2NjcyMjYsImV4cCI6MjA5NzI0MzIyNn0.5n96o1YYVwDcV5eOe9EDAKD1KUA0QMORrR3oClVsAEc';

if (!window.supabase) {
    alert('Supabase 라이브러리 로드 실패. 페이지를 새로고침해주세요.');
    throw new Error('Supabase not loaded');
}

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 인증 관리 객체
const AuthManager = {
    currentUser: null,

    // 세션 확인
    async init() {
        const { data: { session } } = await db.auth.getSession();
        if (session) {
            this.currentUser = session.user;
            return true;
        }
        return false;
    },

    // 회원가입
    async signUp(email, password) {
        const { data, error } = await db.auth.signUp({
            email,
            password,
        });
        if (error) throw error;
        this.currentUser = data.user;
        return data;
    },

    // 로그인
    async signIn(email, password) {
        const { data, error } = await db.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        this.currentUser = data.user;
        return data;
    },

    // 로그아웃
    async signOut() {
        const { error } = await db.auth.signOut();
        if (error) throw error;
        this.currentUser = null;
    },

    // 현재 사용자 가져오기
    getUser() {
        return this.currentUser;
    },

    // 인증 상태 확인
    isAuthenticated() {
        return this.currentUser !== null;
    }
};

// 에러 메시지 한글화
function getErrorMessage(error) {
    const errorMessages = {
        'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
        'Email not confirmed': '이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.',
        'User already registered': '이미 등록된 이메일입니다.',
        'Password should be at least 6 characters': '비밀번호는 최소 6자 이상이어야 합니다.',
    };

    const message = error?.message || '';

    // 부분 매칭
    for (const [key, value] of Object.entries(errorMessages)) {
        if (message.includes(key)) {
            return value;
        }
    }

    return error?.message || '오류가 발생했습니다. 다시 시도해주세요.';
}

// 에러 표시
function showError(message) {
    const errorDiv = document.getElementById('auth-error');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');

    setTimeout(() => {
        errorDiv.classList.add('hidden');
    }, 5000);
}

// 로딩 상태 설정
function setLoading(button, isLoading) {
    const originalText = button.dataset.originalText || button.textContent;

    if (isLoading) {
        button.dataset.originalText = originalText;
        button.textContent = '처리 중...';
        button.disabled = true;
    } else {
        button.textContent = originalText;
        button.disabled = false;
    }
}

// 탭 전환
function setupTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 모든 탭 비활성화
            tabs.forEach(t => t.classList.remove('active'));
            // 클릭한 탭 활성화
            tab.classList.add('active');

            // 폼 전환
            const tabType = tab.dataset.tab;
            if (tabType === 'login') {
                loginForm.classList.add('active');
                signupForm.classList.remove('active');
            } else {
                signupForm.classList.add('active');
                loginForm.classList.remove('active');
            }

            // 에러 메시지 숨기기
            document.getElementById('auth-error').classList.add('hidden');
        });
    });
}

// 로그인 처리
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const loginBtn = document.getElementById('login-btn');

    if (!email || !password) {
        showError('이메일과 비밀번호를 입력해주세요.');
        return;
    }

    setLoading(loginBtn, true);

    try {
        await AuthManager.signIn(email, password);
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Login error:', error);
        showError(getErrorMessage(error));
    } finally {
        setLoading(loginBtn, false);
    }
}

// 회원가입 처리
async function handleSignup(e) {
    e.preventDefault();

    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const passwordConfirm = document.getElementById('signup-password-confirm').value;
    const signupBtn = document.getElementById('signup-btn');

    // 유효성 검사
    if (!email || !password || !passwordConfirm) {
        showError('모든 필드를 입력해주세요.');
        return;
    }

    if (password.length < 6) {
        showError('비밀번호는 최소 6자 이상이어야 합니다.');
        return;
    }

    if (password !== passwordConfirm) {
        showError('비밀번호가 일치하지 않습니다.');
        return;
    }

    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('올바른 이메일 형식을 입력해주세요.');
        return;
    }

    setLoading(signupBtn, true);

    try {
        const result = await AuthManager.signUp(email, password);
        console.log('Signup result:', result);

        // Supabase 응답 확인
        // 이메일 확인이 비활성화된 경우: result.session이 존재
        // 이메일 확인이 활성화된 경우: result.user만 존재, session은 null
        if (result && result.session) {
            // 즉시 로그인됨
            window.location.href = 'index.html';
        } else if (result && result.user && !result.session) {
            // 이메일 확인 필요
            showError('회원가입이 완료되었습니다. 이메일을 확인해주세요.');
        } else {
            // 기본 동작: 로그인 페이지로 이동
            showError('회원가입이 완료되었습니다. 로그인해주세요.');
            setTimeout(() => {
                document.querySelector('[data-tab="login"]').click();
            }, 2000);
        }
    } catch (error) {
        console.error('Signup error:', error);
        showError(getErrorMessage(error));
    } finally {
        setLoading(signupBtn, false);
    }
}

// 페이지 초기화
(async function initAuthPage() {
    // 이미 로그인된 경우 리디렉션
    const isAuth = await AuthManager.init();
    if (isAuth) {
        window.location.href = 'index.html';
        return;
    }

    // 탭 설정
    setupTabs();

    // 로그인 폼 이벤트
    document.getElementById('login-btn').addEventListener('click', handleLogin);
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        handleLogin(e);
    });

    // 회원가입 폼 이벤트
    document.getElementById('signup-btn').addEventListener('click', handleSignup);
    document.getElementById('signup-form').addEventListener('submit', (e) => {
        e.preventDefault();
        handleSignup(e);
    });

    // Enter 키 처리
    document.getElementById('login-password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin(e);
    });
    document.getElementById('signup-password-confirm').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSignup(e);
    });
})();

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
    },

    // 소셜 로그인 (OAuth)
    async signInWithOAuth(provider) {
        const { data, error} = await db.auth.signInWithOAuth({
            provider: provider, // 'google' or 'github'
            options: {
                redirectTo: window.location.origin + window.location.pathname,
                scopes: provider === 'github' ? 'user:email' : undefined
            }
        });
        if (error) throw error;
        return data;
    }
};

// 에러 메시지 한글화
function getErrorMessage(error) {
    const errorMessages = {
        'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
        'Email not confirmed': '이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.',
        'User already registered': '이미 등록된 이메일입니다.',
        'Password should be at least 6 characters': '비밀번호는 최소 6자 이상이어야 합니다.',
        'OAuth provider not enabled': 'OAuth 로그인이 활성화되지 않았습니다.',
        'Invalid OAuth callback': '인증 콜백 처리 중 오류가 발생했습니다.',
        'User cancelled OAuth': '로그인이 취소되었습니다.',
        'Email already registered with another provider': '이메일이 다른 방법으로 이미 가입되어 있습니다.',
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

// Google 로그인
async function handleGoogleLogin(e) {
    e.preventDefault();
    setLoading(e.target, true);

    try {
        await AuthManager.signInWithOAuth('google');
        // OAuth 플로우가 시작되면 자동으로 Google 페이지로 리디렉션됨
        // 인증 후 auth.html로 돌아옴
    } catch (error) {
        console.error('Google login error:', error);
        showError('Google 로그인에 실패했습니다.');
        setLoading(e.target, false);
    }
}

// GitHub 로그인
async function handleGithubLogin(e) {
    e.preventDefault();
    setLoading(e.target, true);

    try {
        await AuthManager.signInWithOAuth('github');
        // OAuth 플로우가 시작되면 자동으로 GitHub 페이지로 리디렉션됨
    } catch (error) {
        console.error('GitHub login error:', error);
        showError('GitHub 로그인에 실패했습니다.');
        setLoading(e.target, false);
    }
}

// 페이지 초기화
(async function initAuthPage() {
    // OAuth 리디렉션 후 돌아왔는지 확인
    const hashParams = new URLSearchParams(window.location.hash.substring(1));

    if (hashParams.get('access_token')) {
        // OAuth 인증 성공 - 세션이 자동으로 설정됨
        console.log('OAuth login successful, waiting for session...');

        // Supabase가 세션을 설정할 때까지 잠시 대기
        await new Promise(resolve => setTimeout(resolve, 100));

        // 세션 확인
        const { data: { session } } = await db.auth.getSession();
        if (session) {
            console.log('Session confirmed, redirecting to index.html');
            window.location.href = 'index.html';
        } else {
            console.error('Session not created after OAuth');
            showError('로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
        return;
    }

    if (hashParams.get('error')) {
        // OAuth 에러 처리
        const errorDesc = hashParams.get('error_description') || 'OAuth 인증에 실패했습니다.';
        showError(decodeURIComponent(errorDesc));
        // 해시 제거
        history.replaceState(null, '', window.location.pathname);
    }

    // 이미 로그인된 경우 리디렉션
    const isAuth = await AuthManager.init();
    if (isAuth) {
        window.location.href = 'index.html';
        return;
    }

    // 탭 설정
    setupTabs();

    // 이메일 로그인 폼 이벤트
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

    // 소셜 로그인 버튼 이벤트
    document.getElementById('google-login-btn')?.addEventListener('click', handleGoogleLogin);
    document.getElementById('github-login-btn')?.addEventListener('click', handleGithubLogin);
    document.getElementById('google-signup-btn')?.addEventListener('click', handleGoogleLogin);
    document.getElementById('github-signup-btn')?.addEventListener('click', handleGithubLogin);

    // Enter 키 처리
    document.getElementById('login-password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin(e);
    });
    document.getElementById('signup-password-confirm').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSignup(e);
    });
})();

# Google & GitHub OAuth 설정 가이드

이 문서는 TODO 앱에 Google과 GitHub 소셜 로그인을 활성화하기 위한 설정 가이드입니다.

## 📋 체크리스트

- [ ] Google OAuth 앱 생성
- [ ] Google Credentials를 Supabase에 입력
- [ ] GitHub OAuth 앱 생성
- [ ] GitHub Credentials를 Supabase에 입력
- [ ] Supabase Redirect URLs 설정
- [ ] 로컬에서 Google 로그인 테스트
- [ ] 로컬에서 GitHub 로그인 테스트
- [ ] GitHub Pages에 배포
- [ ] 프로덕션 환경 테스트

---

## 1. Google OAuth 설정

### 1.1 Google Cloud Console 접속

1. https://console.cloud.google.com 접속
2. 구글 계정으로 로그인

### 1.2 프로젝트 생성

1. 상단의 프로젝트 선택 드롭다운 클릭
2. **"새 프로젝트"** 클릭
3. 프로젝트 정보 입력:
   - **프로젝트 이름**: "TODO App" (또는 원하는 이름)
   - **위치**: 조직 없음
4. **"만들기"** 클릭
5. 프로젝트 생성 완료 후 해당 프로젝트 선택

### 1.3 OAuth 동의 화면 구성

1. 좌측 메뉴 → **"APIs & Services"** → **"OAuth consent screen"** 클릭
2. User Type 선택:
   - **"External"** 선택 (테스트 사용자를 추가할 수 있음)
   - **"만들기"** 클릭

3. **OAuth 동의 화면 정보 입력:**

   **앱 정보:**
   - 앱 이름: `오늘 할 일` 또는 `TODO App`
   - 사용자 지원 이메일: 본인 Gmail 주소 선택
   - 앱 로고: (선택사항) 건너뛰기

   **앱 도메인:**
   - 애플리케이션 홈페이지: `https://kangjunsu.github.io/todo-app/`
   - 개인정보처리방침: (선택사항) 건너뛰기
   - 서비스 약관: (선택사항) 건너뛰기

   **승인된 도메인:**
   - (선택사항) 건너뛰기

   **개발자 연락처 정보:**
   - 이메일 주소: 본인 Gmail 주소 입력

4. **"저장 후 계속"** 클릭

5. **범위 (Scopes):**
   - **"범위 추가 또는 삭제"** 클릭
   - 기본 범위 선택:
     - `userinfo.email`
     - `userinfo.profile`
     - `openid`
   - **"업데이트"** 클릭
   - **"저장 후 계속"** 클릭

6. **테스트 사용자 (Test users):**
   - **"ADD USERS"** 클릭
   - 본인 Gmail 주소 입력 (테스트용)
   - **"추가"** 클릭
   - **"저장 후 계속"** 클릭

7. **요약 검토 후 "대시보드로 돌아가기"** 클릭

### 1.4 OAuth 2.0 Client ID 생성

1. 좌측 메뉴 → **"APIs & Services"** → **"Credentials"** 클릭
2. 상단의 **"+ CREATE CREDENTIALS"** 클릭
3. **"OAuth client ID"** 선택

4. **OAuth 클라이언트 ID 만들기:**
   - 애플리케이션 유형: **"웹 애플리케이션"** 선택
   - 이름: `TODO App Web Client`

5. **승인된 리디렉션 URI 추가:**
   - **"+ URI 추가"** 클릭
   - 다음 URL 입력:
     ```
     https://gakynwqgyqnljcipchrb.supabase.co/auth/v1/callback
     ```
   - 💡 **중요**: 이 URL은 Supabase 프로젝트의 콜백 URL입니다. 정확히 입력해야 합니다.

6. **"만들기"** 클릭

7. **생성된 Credentials 복사:**
   - 팝업 창에 **Client ID**와 **Client Secret**이 표시됩니다
   - 🔑 **Client ID 복사** (예: `123456789-abc...apps.googleusercontent.com`)
   - 🔐 **Client Secret 복사** (예: `GOCSPX-abc123...`)
   - ⚠️ **이 정보를 메모장에 저장하세요** (다음 단계에서 사용)

### 1.5 Supabase에 Google Credentials 입력

1. Supabase Dashboard 접속: https://supabase.com/dashboard
2. 본인의 프로젝트 선택
3. 좌측 메뉴 → **"Authentication"** → **"Providers"** 클릭
4. **"Google"** 찾아서 클릭하여 확장
5. 설정:
   - **Enabled** 토글을 **ON**으로 설정
   - **Client ID**: 복사한 Google Client ID 붙여넣기
   - **Client Secret**: 복사한 Google Client Secret 붙여넣기
6. **"Save"** 클릭

---

## 2. GitHub OAuth 설정

### 2.1 GitHub Developer Settings 접속

1. https://github.com/settings/developers 접속
2. GitHub 계정으로 로그인

### 2.2 OAuth App 생성

1. 좌측 메뉴에서 **"OAuth Apps"** 클릭
2. **"New OAuth App"** 버튼 클릭 (또는 **"Register a new application"**)

### 2.3 OAuth App 정보 입력

다음 정보를 입력:

- **Application name**: `오늘 할 일` 또는 `TODO App`
- **Homepage URL**: 
  ```
  https://kangjunsu.github.io/todo-app/
  ```
- **Application description**: (선택사항)
  ```
  할 일 관리 웹 애플리케이션
  ```
- **Authorization callback URL**: 
  ```
  https://gakynwqgyqnljcipchrb.supabase.co/auth/v1/callback
  ```
  💡 **중요**: Supabase 콜백 URL을 정확히 입력해야 합니다

### 2.4 OAuth App 등록

1. **"Register application"** 클릭
2. OAuth App이 생성되었습니다!

### 2.5 Client Secret 생성

1. OAuth App 설정 페이지에서:
   - **Client ID**가 표시됩니다 → 🔑 **복사**
2. **"Generate a new client secret"** 버튼 클릭
3. **Client Secret**이 생성됩니다 → 🔐 **복사**
   - ⚠️ **주의**: Client Secret은 한 번만 표시되므로 즉시 복사하세요!
   - 잃어버린 경우 삭제 후 재생성해야 합니다

### 2.6 Supabase에 GitHub Credentials 입력

1. Supabase Dashboard 접속: https://supabase.com/dashboard
2. 본인의 프로젝트 선택
3. 좌측 메뉴 → **"Authentication"** → **"Providers"** 클릭
4. **"GitHub"** 찾아서 클릭하여 확장
5. 설정:
   - **Enabled** 토글을 **ON**으로 설정
   - **Client ID**: 복사한 GitHub Client ID 붙여넣기
   - **Client Secret**: 복사한 GitHub Client Secret 붙여넣기
6. **"Save"** 클릭

---

## 3. Supabase Redirect URLs 설정

### 3.1 Site URL 및 Redirect URLs 추가

1. Supabase Dashboard → **"Authentication"** → **"URL Configuration"** 클릭

2. **Site URL 설정:**
   - 개발 환경: `http://localhost:8888`
   - 프로덕션 환경: `https://kangjunsu.github.io/todo-app`
   
   💡 로컬 테스트 시에는 localhost로 설정하고, 배포 후에는 GitHub Pages URL로 변경하세요.

3. **Redirect URLs 추가:**
   
   **"Add a new URL"** 버튼을 클릭하여 다음 URL들을 추가:
   
   ```
   http://localhost:8888/auth.html
   ```
   
   ```
   http://localhost:3000/auth.html
   ```
   
   ```
   https://kangjunsu.github.io/todo-app/auth.html
   ```

4. **"Save"** 클릭

### 3.2 Email Auth 설정 확인

1. **"Authentication"** → **"Providers"** → **"Email"** 클릭
2. **"Confirm email"** 토글이 **OFF**인지 확인 (개발 편의성)
3. 프로덕션 배포 시에는 **ON**으로 변경 권장

---

## 4. 로컬 테스트

### 4.1 서버 실행

터미널에서 TODO 디렉토리로 이동 후:

```bash
cd /home/ubuntu/work/kosa-vibecoding-2026-3rd/src/exercise/kangjunsu/day02/todo
python3 -m http.server 8888
```

### 4.2 브라우저에서 테스트

1. 브라우저에서 http://localhost:8888/auth.html 접속
2. 개발자 도구(F12) → Console 탭 열기

### 4.3 Google 로그인 테스트

1. **"Google로 로그인"** 버튼 클릭
2. Google 계정 선택 화면으로 리디렉션 확인
3. 테스트 사용자로 추가한 계정 선택
4. 권한 승인 화면에서 **"계속"** 클릭
5. auth.html로 리디렉션 확인
6. 자동으로 index.html로 이동 확인
7. 상단에 이메일 주소 표시 확인
8. TODO 추가/삭제 테스트

**예상되는 흐름:**
```
auth.html → Google 로그인 화면 → 권한 승인 
→ auth.html (with token) → index.html → TODO 앱
```

### 4.4 GitHub 로그인 테스트

1. 로그아웃 버튼 클릭
2. **"GitHub로 로그인"** 버튼 클릭
3. GitHub 계정 로그인 화면으로 리디렉션
4. **"Authorize [앱 이름]"** 클릭
5. auth.html로 리디렉션 확인
6. 자동으로 index.html로 이동 확인
7. TODO 기능 테스트

### 4.5 다중 계정 테스트

1. Google로 로그인 → TODO 3개 추가
2. 로그아웃
3. GitHub로 로그인
4. 빈 목록 확인 (데이터 분리 확인)
5. TODO 2개 추가
6. 로그아웃 후 Google 계정으로 재로그인
7. 처음에 추가한 3개 TODO만 표시되는지 확인

---

## 5. 문제 해결

### Google 로그인 문제

#### 문제: "redirect_uri_mismatch" 에러
**원인**: Redirect URI가 Google Cloud Console에 등록되지 않음

**해결:**
1. Google Cloud Console → Credentials 확인
2. OAuth 2.0 Client ID 편집
3. 승인된 리디렉션 URI 확인:
   ```
   https://gakynwqgyqnljcipchrb.supabase.co/auth/v1/callback
   ```
4. 정확히 입력되었는지 확인 (끝에 슬래시 없음)

#### 문제: "Access blocked: This app's request is invalid"
**원인**: OAuth 동의 화면 설정 미완료

**해결:**
1. OAuth consent screen 설정 완료
2. 테스트 사용자에 본인 이메일 추가
3. 범위(Scopes)에 기본 프로필 정보 추가

#### 문제: 로그인 후 아무 반응 없음
**원인**: Supabase에 Client ID/Secret 미입력

**해결:**
1. Supabase → Authentication → Providers → Google
2. Client ID와 Secret 재확인
3. Enabled 토글 ON 확인

### GitHub 로그인 문제

#### 문제: "The redirect_uri MUST match the registered callback URL"
**원인**: GitHub OAuth App의 Callback URL 불일치

**해결:**
1. GitHub → Settings → Developer settings → OAuth Apps
2. 해당 앱 클릭 → 편집
3. Authorization callback URL 확인:
   ```
   https://gakynwqgyqnljcipchrb.supabase.co/auth/v1/callback
   ```

#### 문제: Client Secret 분실
**해결:**
1. GitHub OAuth App 설정 페이지
2. 기존 Secret 삭제
3. **"Generate a new client secret"** 클릭
4. 새 Secret을 Supabase에 재입력

### Supabase 관련 문제

#### 문제: "OAuth provider not enabled"
**해결:**
1. Supabase → Authentication → Providers
2. Google/GitHub Enabled 토글 확인
3. Save 버튼 클릭 확인

#### 문제: CORS 에러
**해결:**
1. Supabase → Authentication → URL Configuration
2. Site URL이 현재 접속 URL과 일치하는지 확인
3. Redirect URLs에 auth.html URL이 추가되었는지 확인

---

## 6. GitHub Pages 배포

### 6.1 코드 Push 확인

```bash
# 이미 완료되었는지 확인
git log --oneline -5
# "Add Google and GitHub social login" 커밋 확인
```

### 6.2 Supabase Site URL 변경

1. Supabase → Authentication → URL Configuration
2. **Site URL**을 프로덕션 URL로 변경:
   ```
   https://kangjunsu.github.io/todo-app
   ```
3. Redirect URLs에 프로덕션 URL 추가 확인:
   ```
   https://kangjunsu.github.io/todo-app/auth.html
   ```
4. **"Save"** 클릭

### 6.3 GitHub Pages 접속 테스트

1. 브라우저에서 접속:
   ```
   https://kangjunsu.github.io/todo-app/auth.html
   ```

2. Google/GitHub 로그인 테스트
3. 모바일 환경에서도 테스트 (개발자 도구 → 모바일 뷰)

---

## 7. 보안 체크리스트

### OAuth 설정 보안

- [ ] Client Secret이 코드에 노출되지 않았는지 확인 (Supabase에만 저장)
- [ ] OAuth Redirect URLs가 정확히 설정되었는지 확인
- [ ] 프로덕션 환경에서 HTTPS 사용 확인
- [ ] Google OAuth 동의 화면이 적절히 설정되었는지 확인

### 앱 보안

- [ ] Supabase RLS 정책이 활성화되었는지 확인
- [ ] 사용자별 데이터 분리가 작동하는지 확인
- [ ] 로그아웃 기능이 정상 작동하는지 확인
- [ ] 세션이 localStorage에 안전하게 저장되는지 확인

---

## 8. 추가 설정 (선택사항)

### Google OAuth: 프로덕션 배포

현재는 **"Testing"** 상태이므로 테스트 사용자만 로그인 가능합니다.

**모든 사용자가 로그인 가능하도록 하려면:**

1. Google Cloud Console → OAuth consent screen
2. **"PUBLISH APP"** 클릭
3. 검토 절차 진행 (보통 1-2주 소요)

**또는:**

- Testing 상태 유지하고 필요한 사용자를 "Test users"에 추가

### GitHub OAuth: Organization 계정 접근

개인 계정이 아닌 Organization 계정으로도 로그인하려면:

1. GitHub OAuth App 설정
2. **"Request organization access"** 활성화

---

## 9. 참고 자료

### 공식 문서

- **Supabase Auth**: https://supabase.com/docs/guides/auth/social-login
- **Google OAuth**: https://developers.google.com/identity/protocols/oauth2
- **GitHub OAuth**: https://docs.github.com/en/developers/apps/building-oauth-apps

### Supabase 프로젝트 정보

- **Project URL**: `https://gakynwqgyqnljcipchrb.supabase.co`
- **Anon Key**: 코드에서 확인 (auth.js 파일)
- **OAuth Callback URL**: `https://gakynwqgyqnljcipchrb.supabase.co/auth/v1/callback`

---

## 문제가 있나요?

1. 브라우저 개발자 도구(F12) → Console 탭에서 에러 메시지 확인
2. Supabase Dashboard → Logs 탭에서 인증 로그 확인
3. 위의 "문제 해결" 섹션 참고
4. 그래도 안 되면 설정을 처음부터 다시 확인

---

**마지막 업데이트**: 2026-06-17  
**작성자**: Claude Sonnet 4.5

# GitHub Pages 배포 가이드

이 TODO 앱을 GitHub Pages로 배포하는 방법입니다.

## 배포 전 체크리스트

- [x] HTML/CSS/JavaScript 파일 준비 완료
- [x] Supabase 테이블 생성 및 RLS 정책 설정 완료
- [x] 로컬에서 정상 동작 확인 (http://localhost:3000)
- [ ] GitHub 계정 생성 (없는 경우)

## 방법 1: 새로운 저장소 생성 (추천)

### 1단계: GitHub에서 저장소 생성

1. [GitHub](https://github.com) 로그인
2. 우측 상단 **+** 클릭 → **New repository**
3. 저장소 설정:
   - **Repository name**: `todo-app` (또는 원하는 이름)
   - **Public** 선택 (GitHub Pages는 Public 저장소 필요, Free 계정)
   - **Initialize this repository with a README** 체크 해제
4. **Create repository** 클릭

### 2단계: 프로젝트 파일 준비

현재 디렉토리에서 필요한 파일만 복사:

```bash
# 임시 디렉토리 생성
mkdir -p ~/todo-deploy
cd ~/todo-deploy

# 필요한 파일만 복사
cp ~/work/kosa-vibecoding-2026-3rd/src/exercise/kangjunsu/day02/todo/index.html .
cp ~/work/kosa-vibecoding-2026-3rd/src/exercise/kangjunsu/day02/todo/script.js .
cp ~/work/kosa-vibecoding-2026-3rd/src/exercise/kangjunsu/day02/todo/style.css .

# README 파일 생성 (선택사항)
echo "# TODO App with Supabase" > README.md
```

### 3단계: Git 초기화 및 푸시

```bash
# Git 초기화
cd ~/todo-deploy
git init
git add .
git commit -m "Initial commit: TODO app with Supabase"

# GitHub 저장소와 연결 (YOUR_USERNAME를 본인 계정으로 변경!)
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/todo-app.git
git push -u origin main
```

### 4단계: GitHub Pages 활성화

1. GitHub 저장소 페이지로 이동
2. 상단 메뉴에서 **Settings** 클릭
3. 좌측 메뉴에서 **Pages** 클릭
4. **Source** 섹션에서:
   - **Branch**: `main` 선택
   - **Folder**: `/ (root)` 선택
5. **Save** 클릭

### 5단계: 배포 확인

약 1-2분 후:
- GitHub Pages 섹션 상단에 배포 URL 표시
- 형식: `https://YOUR_USERNAME.github.io/todo-app/`
- **Visit site** 버튼 클릭하여 확인

## 방법 2: 기존 저장소에 서브디렉토리로 배포

이미 `kosa-vibecoding-2026-3rd` 저장소가 있다면:

### 1단계: GitHub Pages 활성화

1. GitHub의 `kosa-vibecoding-2026-3rd` 저장소로 이동
2. **Settings** → **Pages**
3. **Branch**: `main` 선택, **Folder**: `/ (root)` 선택
4. **Save** 클릭

### 2단계: 배포 URL

- 형식: `https://YOUR_USERNAME.github.io/kosa-vibecoding-2026-3rd/src/exercise/kangjunsu/day02/todo/`
- 경로가 길지만 작동합니다

### 3단계: script.js 버전 파라미터 제거 (선택사항)

배포 전에 캐시 파라미터를 제거하면 깔끔합니다:

`index.html`:
```html
<script src="script.js"></script>
```

## 방법 3: GitHub Desktop 사용 (GUI)

코드가 어려운 경우 GitHub Desktop 사용:

1. [GitHub Desktop](https://desktop.github.com/) 다운로드 및 설치
2. **File** → **New Repository** 클릭
3. 이름, 경로 설정 후 **Create Repository**
4. 파일 복사 후 **Commit to main** → **Publish repository**
5. GitHub 웹에서 Pages 활성화 (방법 1의 4단계 참고)

## 배포 후 업데이트 방법

파일을 수정한 후:

```bash
cd ~/todo-deploy  # 또는 저장소 경로
git add .
git commit -m "Update: 수정 내용 설명"
git push origin main
```

약 1-2분 후 자동으로 배포됩니다.

## 보안 고려사항

### API 키 노출

현재 `script.js`에 Supabase API 키가 포함되어 있습니다:
```javascript
const SUPABASE_ANON_KEY = 'eyJhbGc...';
```

**중요**: 
- `anon` (public) 키는 프론트엔드에 노출되어도 **괜찮습니다**
- Supabase의 RLS(Row Level Security) 정책이 실제 보안을 담당
- **절대로** `service_role` 키는 프론트엔드에 넣으면 안 됩니다!

### RLS 정책 재확인

배포 후 Supabase 대시보드에서 RLS 정책이 올바르게 설정되었는지 확인:

```sql
-- 현재 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'todos';
```

- 모든 사용자가 읽기/쓰기 가능한 공개 TODO 앱이므로 현재 정책이 적합
- 나중에 사용자 인증을 추가하면 정책 수정 필요

## 문제 해결

### 404 에러가 발생하는 경우

1. GitHub Pages URL이 정확한지 확인
2. `index.html` 파일이 루트 또는 지정한 디렉토리에 있는지 확인
3. 대소문자 구분 (Linux는 대소문자를 구분하지만 Windows는 아닐 수 있음)

### 스타일이 깨지는 경우

상대 경로 확인:
```html
<!-- 같은 디렉토리 -->
<link rel="stylesheet" href="style.css">
<script src="script.js"></script>

<!-- 절대 경로 (서브디렉토리 배포 시) -->
<link rel="stylesheet" href="/kosa-vibecoding-2026-3rd/src/exercise/kangjunsu/day02/todo/style.css">
```

### Supabase 연결이 안 되는 경우

1. 브라우저 개발자 도구(F12) → Console 탭 확인
2. CORS 에러: Supabase는 기본적으로 모든 origin 허용
3. API 키 확인: `SUPABASE_URL`과 `SUPABASE_ANON_KEY`가 정확한지 확인
4. 네트워크 탭에서 요청이 제대로 전송되는지 확인

### 캐시 문제

배포 후 업데이트가 반영되지 않으면:
- 브라우저 강력 새로고침: `Ctrl + Shift + R` (Windows/Linux) 또는 `Cmd + Shift + R` (Mac)
- 시크릿 모드로 접속해서 확인

## 커스텀 도메인 설정 (선택사항)

### 본인 도메인이 있는 경우

1. GitHub Pages 설정에서 **Custom domain** 입력
2. 도메인 제공업체(예: GoDaddy, Namecheap)에서 DNS 설정:
   - A 레코드 추가:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
   - 또는 CNAME 레코드: `YOUR_USERNAME.github.io`
3. **Enforce HTTPS** 체크 (권장)

자세한 내용: [GitHub Pages 공식 문서](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)

## 대안: 다른 호스팅 서비스

GitHub Pages 외 다른 선택지:

### Netlify (추천)
- 더 빠른 배포 (30초 이내)
- 자동 HTTPS
- 무료 티어 넉넉함

**배포 방법:**
1. [Netlify](https://www.netlify.com) 가입 (GitHub 계정 연동)
2. **Add new site** → **Import an existing project**
3. GitHub 저장소 선택
4. **Deploy site** 클릭
5. 자동으로 URL 생성: `random-name.netlify.app`

### Vercel
- Next.js 제작사, 정적 사이트도 지원
- GitHub 연동 자동 배포
- 무료 티어

### Cloudflare Pages
- 빠른 CDN
- 무제한 bandwidth (무료)
- GitHub 연동

## 배포 완료 체크리스트

배포 후 확인사항:

- [ ] 웹사이트가 정상적으로 로드됨
- [ ] 할 일 추가 기능 작동
- [ ] 할 일 삭제 기능 작동
- [ ] 완료 체크박스 작동
- [ ] 우선순위 변경 작동
- [ ] 드래그앤드롭 작동
- [ ] 새로고침 후 데이터 유지 (Supabase 연동 확인)
- [ ] 모바일에서 반응형 디자인 확인
- [ ] 다른 브라우저에서도 테스트 (Chrome, Firefox, Safari)

## 다음 단계

배포 완료 후:

1. **실시간 동기화 추가** (선택사항)
   - Supabase Realtime으로 여러 탭/기기 간 동기화
   - `SUPABASE.md` 참고

2. **사용자 인증 추가** (선택사항)
   - 개인별 TODO 관리
   - Supabase Auth 사용

3. **PWA 변환** (선택사항)
   - 오프라인 지원
   - 홈 화면 추가 기능
   - Service Worker 추가

4. **성능 최적화**
   - 이미지 최적화 (현재는 없음)
   - 코드 압축 (minify)
   - 캐싱 전략

## 참고 자료

- [GitHub Pages 공식 문서](https://docs.github.com/en/pages)
- [Supabase 공식 문서](https://supabase.com/docs)
- [Git 기초 가이드](https://git-scm.com/book/ko/v2)
- [MDN 웹 문서](https://developer.mozilla.org/ko/)

## 도움이 필요한 경우

- GitHub Issues 탭 활용
- Stack Overflow에 질문 올리기
- Supabase Discord 커뮤니티 참여

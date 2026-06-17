# Supabase 설정 가이드

이 문서는 TODO 앱을 localStorage에서 Supabase로 마이그레이션하기 위한 설정 가이드입니다.

## 1. Supabase 프로젝트 생성

### 1.1 회원가입 및 프로젝트 생성
1. [Supabase](https://supabase.com) 접속
2. "Start your project" 클릭하여 회원가입 (GitHub 계정 연동 권장)
3. 대시보드에서 "New Project" 클릭
4. 프로젝트 정보 입력:
   - **Name**: `todo-app` (또는 원하는 이름)
   - **Database Password**: 강력한 비밀번호 설정 (저장 필수!)
   - **Region**: `Northeast Asia (Seoul)` 또는 `Northeast Asia (Tokyo)` 선택
   - **Pricing Plan**: Free tier 선택
5. "Create new project" 클릭 (약 2분 소요)

### 1.2 API 키 확인
프로젝트 생성 후:
1. 좌측 메뉴에서 **Settings** > **API** 클릭
2. 다음 정보 복사:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (공개 키, 프론트엔드에서 사용)

## 2. 데이터베이스 테이블 생성

### 2.1 SQL Editor로 테이블 생성
1. 좌측 메뉴에서 **SQL Editor** 클릭
2. "New query" 클릭
3. 아래 SQL 실행:

```sql
-- todos 테이블 생성
CREATE TABLE todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  completed BOOLEAN DEFAULT false NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- updated_at 자동 업데이트를 위한 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_todos_updated_at 
  BEFORE UPDATE ON todos 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_todos_priority ON todos(priority);
CREATE INDEX idx_todos_order ON todos("order");
CREATE INDEX idx_todos_created_at ON todos(created_at DESC);
```

### 2.2 Row Level Security (RLS) 설정
기본적으로 모든 사용자가 TODO를 공유하는 구조입니다.

```sql
-- RLS 활성화
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기/쓰기 가능하도록 정책 생성
CREATE POLICY "Allow public read access" 
  ON todos FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert access" 
  ON todos FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update access" 
  ON todos FOR UPDATE 
  USING (true);

CREATE POLICY "Allow public delete access" 
  ON todos FOR DELETE 
  USING (true);
```

## 3. 테이블 구조 설명

### todos 테이블

| 컬럼명 | 타입 | 설명 | 제약조건 |
|--------|------|------|----------|
| `id` | UUID | 고유 식별자 | PRIMARY KEY, 자동 생성 |
| `text` | TEXT | 할 일 내용 | NOT NULL |
| `priority` | TEXT | 우선순위 | NOT NULL, CHECK (high/medium/low) |
| `completed` | BOOLEAN | 완료 여부 | NOT NULL, DEFAULT false |
| `order` | INTEGER | 정렬 순서 (드래그앤드롭용) | NOT NULL |
| `created_at` | TIMESTAMP | 생성 시각 | NOT NULL, 자동 생성 |
| `updated_at` | TIMESTAMP | 수정 시각 | NOT NULL, 자동 업데이트 |

### 인덱스
- `idx_todos_priority`: 우선순위별 필터링 최적화
- `idx_todos_order`: 정렬 성능 최적화
- `idx_todos_created_at`: 최신순 조회 최적화

## 4. 환경 변수 설정

프로젝트에 `.env` 파일 생성 (또는 직접 코드에 넣기):

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

> **주의**: `.env` 파일은 `.gitignore`에 추가하여 GitHub에 업로드하지 않도록 주의!

## 5. Supabase 클라이언트 설정

### 5.1 CDN 방식 (현재 프로젝트에 권장)
`index.html`의 `<head>` 태그에 추가:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### 5.2 NPM 방식 (선택사항)
빌드 도구를 사용하는 경우:

```bash
npm install @supabase/supabase-js
```

## 6. 향후 확장 가능한 구조

### 6.1 사용자 인증 추가 시 (선택사항)
나중에 개인별 TODO 관리를 원할 경우:

```sql
-- user_id 컬럼 추가
ALTER TABLE todos ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- 기존 정책 삭제 후 사용자별 정책으로 변경
DROP POLICY "Allow public read access" ON todos;
DROP POLICY "Allow public insert access" ON todos;
DROP POLICY "Allow public update access" ON todos;
DROP POLICY "Allow public delete access" ON todos;

-- 사용자별 접근 정책
CREATE POLICY "Users can view own todos" 
  ON todos FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own todos" 
  ON todos FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own todos" 
  ON todos FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own todos" 
  ON todos FOR DELETE 
  USING (auth.uid() = user_id);
```

### 6.2 실시간 동기화 (선택사항)
여러 탭/기기 간 실시간 동기화를 원할 경우 Supabase Realtime 기능 사용 가능:

```javascript
// Realtime 구독 예제
supabase
  .channel('todos-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'todos' },
    (payload) => {
      console.log('Change received!', payload);
      loadTodos(); // 변경 감지 시 다시 로드
    }
  )
  .subscribe();
```

## 7. 마이그레이션 체크리스트

- [ ] Supabase 프로젝트 생성
- [ ] API URL 및 anon key 확인
- [ ] SQL Editor에서 테이블 생성 SQL 실행
- [ ] RLS 정책 설정 SQL 실행
- [ ] 테이블이 정상적으로 생성되었는지 Table Editor에서 확인
- [ ] `index.html`에 Supabase CDN 추가
- [ ] `script.js`에 Supabase 클라이언트 초기화 코드 추가
- [ ] localStorage 함수들을 Supabase API 호출로 변경
- [ ] 브라우저에서 테스트 (추가/수정/삭제/드래그앤드롭)
- [ ] 브라우저 콘솔에서 에러 확인

## 8. Supabase 대시보드 주요 메뉴

- **Table Editor**: 데이터를 직접 확인/수정 (엑셀처럼 사용 가능)
- **SQL Editor**: SQL 쿼리 실행
- **Authentication**: 사용자 인증 설정 (나중에 필요 시)
- **Database > Policies**: RLS 정책 관리
- **API Docs**: 자동 생성된 API 문서 확인

## 9. 문제 해결

### CORS 에러가 발생하는 경우
Supabase는 기본적으로 모든 origin을 허용하므로 CORS 문제는 없어야 합니다. 
만약 발생한다면 **Settings > API > CORS** 설정을 확인하세요.

### RLS로 인해 데이터가 안 보이는 경우
```sql
-- RLS 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'todos';

-- 필요시 모든 정책 삭제 후 재생성
DROP POLICY IF EXISTS "Allow public read access" ON todos;
-- ... (위의 정책 다시 생성)
```

### API 요청이 실패하는 경우
- API URL과 anon key가 정확한지 확인
- 브라우저 콘솔에서 에러 메시지 확인
- Supabase 대시보드의 Logs에서 요청 로그 확인

## 10. 다음 단계

이 가이드대로 Supabase 설정을 완료한 후:
1. `script.js` 파일에서 localStorage 코드를 Supabase API 호출로 변경
2. 기존 localStorage 데이터를 Supabase로 마이그레이션 (선택사항)
3. 실시간 동기화 기능 추가 (선택사항)
4. 사용자 인증 기능 추가 (선택사항)

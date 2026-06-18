# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a vanilla JavaScript TODO list application with priority management, drag-and-drop functionality, and user authentication. The application uses Supabase for data persistence and authentication, featuring a responsive design styled after Baemin (배달의민족).

## File Structure

- `index.html` - Main TODO app (authenticated users only)
- `auth.html` - Login/signup page
- `script.js` - TODO app logic with authentication integration
- `auth.js` - Authentication logic and Supabase auth management
- `style.css` - Styling including responsive breakpoints, priority-based themes, and auth UI
- `SUPABASE.md` - Supabase setup guide

## Development

### Running the Application

Use a local HTTP server (required for Supabase authentication):

```bash
# Use Python HTTP server
python3 -m http.server 8000

# Then open browser to:
# http://localhost:8000/auth.html
```

**Authentication Flow:**
1. Start at `auth.html` (login/signup page)
2. Create account or login with existing credentials
3. Automatically redirected to `index.html` (TODO app)
4. Session persists across page reloads
5. Logout returns to `auth.html`

### Testing

Manual testing only. Test in browser:

**Authentication:**
- Signup with new email/password
- Login with existing credentials
- Session persistence (refresh page)
- Logout functionality
- Multi-user data isolation (create 2 accounts, verify separate TODOs)

**TODO Features:**
- Add/delete/complete todos
- Change priorities via dropdown
- Drag-and-drop within same priority groups
- Test responsive layouts at different screen sizes (360px, 480px, 768px breakpoints)

**Security:**
- Each user sees only their own TODOs
- RLS policies enforce data isolation at database level

## Architecture

### Data Model

Todo items are stored in Supabase PostgreSQL database with:
- `id`: UUID - unique identifier (auto-generated)
- `text`: string - todo description
- `priority`: 'high' | 'medium' | 'low'
- `completed`: boolean
- `order`: number - for drag-and-drop ordering within priority groups
- `user_id`: UUID - references auth.users(id), for data isolation
- `created_at`: timestamp - creation time
- `updated_at`: timestamp - last modified time

**Database Schema:**
```sql
CREATE TABLE todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  completed BOOLEAN DEFAULT false NOT NULL,
  "order" INTEGER NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### Key Implementation Details

**Priority-based sorting**: Todos are always displayed in priority order (high → medium → low) via `renderTodos()`. Within each priority group, the `order` property maintains custom ordering.

**Drag-and-drop constraints**: Items can only be reordered within the same priority level. The drag handlers check `data-priority` attributes to enforce this. When dropped, the `order` properties are swapped between dragged and target items.

**Supabase persistence**: Each TODO operation (add/delete/toggle/priority change/reorder) makes a direct Supabase API call. On page load, `loadTodos()` fetches user-specific data filtered by `user_id`.

**Authentication integration**: 
- `script.js` checks authentication on page load via `checkAuth()`
- `loadTodos()` and `addTodo()` include user_id filtering/insertion
- `onAuthStateChange` listener handles logout events
- Session managed automatically by Supabase (localStorage + JWT tokens)

**Row Level Security (RLS)**: PostgreSQL policies enforce that users can only access their own TODOs:
```sql
CREATE POLICY "Users can view own todos" ON todos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own todos" ON todos FOR INSERT WITH CHECK (auth.uid() = user_id);
```

**Rendering pattern**: All DOM updates go through `renderTodos()`, which rebuilds the list from scratch. This ensures priority sorting and drag-and-drop attributes stay in sync with the data model.

## Git Workflow

**IMPORTANT**: When committing changes in this directory, use `git merge` instead of `git rebase`.

When using git commands:
- Only stage and commit files within this directory (`/home/ubuntu/work/kosa-vibecoding-2026-3rd/src/exercise/kangjunsu/day02/todo/`)
- Do NOT read or modify files outside this directory
- Use `git add <specific-files>` instead of `git add .` to avoid accidentally staging unrelated files

Example commit workflow:
```bash
git add index.html script.js style.css
git commit -m "Update todo feature"
# Use merge, not rebase
git merge main
```

## Design System

Colors follow Baemin's brand palette:
- Primary: `#2AC1BC` (mint green)
- High priority: `#FF6B6B` (red background/badge)
- Medium priority: `#FFD93D` (yellow background/badge)
- Low priority: `#6BCBFF` (blue background/badge)

Responsive breakpoints:
- Mobile small: ≤360px
- Mobile: ≤480px
- Tablet: ≤768px
- Desktop: >768px

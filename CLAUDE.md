# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a vanilla JavaScript TODO list application with priority management and drag-and-drop functionality. The application uses localStorage for data persistence and features a responsive design styled after Baemin (배달의민족).

## File Structure

- `index.html` - Main HTML structure
- `script.js` - All application logic and event handlers
- `style.css` - Styling including responsive breakpoints and priority-based themes

## Development

### Running the Application

Simply open `index.html` in a web browser. No build process or dependencies required.

```bash
# Open in default browser (Linux)
xdg-open index.html

# Or use a simple HTTP server
python3 -m http.server 8000
```

### Testing

Manual testing only. Test in browser:
- Add/delete/complete todos
- Change priorities via dropdown
- Drag-and-drop within same priority groups
- Test responsive layouts at different screen sizes (360px, 480px, 768px breakpoints)

## Architecture

### Data Model

Todo items are stored as objects with:
- `text`: string - todo description
- `priority`: 'high' | 'medium' | 'low'
- `completed`: boolean
- `order`: number - for drag-and-drop ordering within priority groups

### Key Implementation Details

**Priority-based sorting**: Todos are always displayed in priority order (high → medium → low) via `renderTodos()`. Within each priority group, the `order` property maintains custom ordering.

**Drag-and-drop constraints**: Items can only be reordered within the same priority level. The drag handlers check `data-priority` attributes to enforce this. When dropped, the `order` properties are swapped between dragged and target items.

**LocalStorage persistence**: The entire `todos` array is serialized to localStorage on every change (add/delete/toggle/priority change/reorder). On page load, `loadTodos()` hydrates the state.

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

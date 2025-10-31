# Markdown Todo List

A modern React application that transforms markdown content into an interactive, hierarchical todo list.

## Features

- 📝 **Markdown Input**: Paste your markdown content with headers and bullet points
- ✅ **Interactive Checkboxes**: Toggle tasks completion status
- 🔄 **Hierarchical Structure**: Maintains proper indentation and nested tasks
- ✏️ **Inline Editing**: Click on any task to edit its text
- ➕ **Add Subtasks**: Add new subtasks under any existing task
- 🗑️ **Delete Tasks**: Remove tasks you don't need
- 🎨 **Beautiful UI**: Modern, clean design with smooth animations
- 📊 **Progress Tracking**: See completed vs total tasks at a glance
- 🔽 **Minimizable Input**: Collapse the markdown input area after transformation

## Technologies

- **React 19** - Latest version with best practices
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **styled-components** - CSS-in-JS styling solution
- **pnpm** - Fast, disk space efficient package manager

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Usage

1. **Paste Markdown**: Paste your markdown content in the text area. The parser supports:
   - Headers (###, ####, etc.) - converted to section tasks
   - Bullet points (*, -, +) with nested indentation (2 spaces per level)

2. **Transform**: Click "Transform to Todo List" button

3. **Manage Tasks**:
   - Click checkbox to mark complete/incomplete
   - Click task text to edit inline
   - Click "+ Sub" to add a subtask
   - Click "Delete" to remove a task
   - Click "+ Add Task" to add a new root-level task

4. **Minimize Input**: After transformation, use the ▲/▼ button to collapse/expand the markdown input area

## Example Markdown

```markdown
### 1. Daily Tasks

#### 1.1 Kitchen

* Wipe counters and table
  * Use disinfectant spray
  * Dry with a clean microfiber cloth
* Clean sink and faucet
  * Scrub with baking soda paste

#### 1.2 Living Room

* Tidy and organize items
  * Fold blankets
  * Arrange cushions neatly
```

## Project Structure

```
src/
├── components/
│   ├── MarkdownInput.tsx    # Markdown input and transform button
│   ├── TodoItem.tsx          # Individual task item with actions
│   └── TodoList.tsx          # List container with stats
├── types/
│   └── Task.ts               # Task interface definition
├── utils/
│   └── markdownParser.ts     # Markdown parsing logic
├── App.tsx                   # Main app component
├── main.tsx                  # App entry point
└── index.css                 # Global styles
```

## Notes

- Tasks are **not persisted** - they will reset on page refresh (as per requirements)
- Supports full editing capabilities including add, edit, and delete operations
- Hierarchical structure is preserved from markdown indentation

## License

MIT

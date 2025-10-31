# 📝 Markdown Todo List

<div align="center">

**A modern, feature-rich React application that transforms markdown into interactive, hierarchical todo lists**

![React](https://img.shields.io/badge/React-19.1-61dafb?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=flat&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.1-646cff?style=flat&logo=vite)
![Styled Components](https://img.shields.io/badge/Styled%20Components-6.1-db7093?style=flat&logo=styled-components)

</div>

---

## ✨ Features

### 📋 Core Functionality
- **🔄 Multi-List Management**: Create, manage, and switch between multiple todo lists with ease
- **📝 Markdown-to-Tasks Conversion**: Paste markdown content with headers and bullet points that automatically transforms into an interactive todo list
- **💾 Persistent Storage**: All your lists and tasks are automatically saved to localStorage with debounced saves for optimal performance
- **🔍 Search**: Quickly find tasks across your entire list with real-time search filtering
- **📊 Progress Tracking**: See completed vs total tasks at a glance for each list

### ✅ Task Management
- **Interactive Checkboxes**: Toggle task completion status with visual feedback
- **🔽 Hierarchical Structure**: Maintains proper indentation and nested tasks with collapsible sections
- **✏️ Inline Editing**: Click on any task text to edit it inline with Enter/Escape shortcuts
- **➕ Add Tasks**: Add subtasks under any existing task or add new root-level tasks
- **🗑️ Delete Tasks**: Remove tasks you don't need with confirmation dialogs for lists
- **🎯 Section Headers**: Create organizational headers (converted from markdown headers)
- **👁️ Hide Completed**: Toggle visibility of completed tasks to focus on what's left

### 🎨 Advanced Features
- **Drag & Drop**: Reorder tasks by dragging them to new positions with visual drop indicators
  - Drop **before** or **after** sibling tasks
  - Drop **inside** to create subtasks
  - Automatically adjusts task hierarchy and levels
- **⏮️ Undo System**: Undo drag-and-drop operations (up to 20 actions)
- **📤 Export Options**:
  - Copy markdown to clipboard
  - Download as `.md` file
- **🔽 Minimizable Input**: Collapse the markdown input area after transformation to focus on your tasks
- **📱 Responsive Design**: Beautiful, modern UI that works seamlessly on desktop and mobile devices
- **🌲 Aesthetic Background**: Gorgeous forest road background with overlay for better readability

### ⚡ User Experience
- **Smooth Animations**: Polished transitions and micro-interactions throughout
- **Keyboard Shortcuts**: Enter to save, Escape to cancel while editing
- **Real-time Sync**: Markdown and task list stay synchronized bidirectionally
- **Auto-save**: Changes are automatically saved with smart debouncing
- **Smart Collapse**: Sections with children can be collapsed/expanded for better organization

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **pnpm** (recommended) or npm/yarn - [Install pnpm](https://pnpm.io/installation)

### Installation

1. **Clone the repository** (if applicable):
```bash
git clone <repository-url>
cd todo-list
```

2. **Install dependencies**:
```bash
pnpm install
```

3. **Start the development server**:
```bash
pnpm dev
```

The application will open at `http://localhost:5173` (or another port if 5173 is busy).

### Available Scripts

| Command        | Description                                               |
| -------------- | --------------------------------------------------------- |
| `pnpm dev`     | Starts the development server with hot module replacement |
| `pnpm build`   | Builds the app for production to the `dist` folder        |
| `pnpm preview` | Preview the production build locally                      |
| `pnpm lint`    | Runs ESLint to check code quality                         |

---

## 📖 How to Use

### 1️⃣ Create Your First List

When you first open the app, a default list is automatically created. You can:
- Create new lists using the **"+ New List"** button in the sidebar
- Switch between lists by clicking on them in the sidebar
- Delete lists by clicking the **×** button (with confirmation)

### 2️⃣ Input Markdown

Paste your markdown content in the text area. The parser supports:

#### Headers
- Use `###`, `####`, `#####`, etc. for section headers
- Headers become organizational sections (non-checkable)
- They can contain child tasks

#### Bullet Points
- Use `*`, `-`, or `+` for tasks
- Indent with **2 spaces per level** for nested tasks
- Add checkboxes: `[ ]` for uncompleted, `[x]` for completed

### 3️⃣ Transform to Tasks

The transformation happens **automatically** as you type (with 300ms debounce). The markdown input minimizes automatically when tasks are generated.

### 4️⃣ Manage Your Tasks

| Action                  | How To                                                         |
| ----------------------- | -------------------------------------------------------------- |
| **Complete/Uncomplete** | Click the checkbox (also marks all children)                   |
| **Edit Text**           | Click on the task text, edit, then press Enter or click away   |
| **Add Subtask**         | Click **"+ Sub"** button (or **"+ Add Task"** for headers)     |
| **Delete Task**         | Click **"Delete"** button                                      |
| **Add Root Task**       | Click **"+ Add Task"** button at the bottom                    |
| **Add Section**         | Click **"+ Add Section"** button at the bottom                 |
| **Reorder Tasks**       | Drag the **⋮⋮** handle to move tasks                           |
| **Collapse Section**    | Click **▼**/**▶** button on headers with children              |
| **Hide Completed**      | Toggle the **"Hide Completed"** checkbox                       |
| **Search Tasks**        | Type in the search box to filter tasks                         |
| **Export Markdown**     | Click **"📋 Copy"** to copy or **"💾 Download"** to save as file |

### 5️⃣ Keyboard Shortcuts

- **Enter**: Save changes when editing a task
- **Escape**: Cancel editing and revert changes

---

## 📐 Example Markdown

Here's a comprehensive example showing all supported markdown syntax:

```markdown
### 🏠 Home Maintenance

#### Daily Tasks

* [x] Kitchen cleanup
  * [x] Wipe counters and table
    * Use disinfectant spray
    * Dry with clean cloth
  * [ ] Clean sink and faucet
    * Scrub with baking soda paste
    * Polish chrome fixtures
* [ ] Living room tidying
  * [ ] Fold blankets
  * [ ] Arrange cushions neatly
  * [ ] Vacuum floor

#### Weekly Tasks

* [ ] Deep clean bathrooms
  * [ ] Scrub toilet, tub, and shower
  * [ ] Mop floors
  * [ ] Restock supplies
* [ ] Change bed linens
  * [ ] Strip beds
  * [ ] Wash and dry
  * [ ] Make beds with fresh sheets

### 💼 Work Projects

#### Project Alpha

* [x] Requirements gathering
  * [x] Stakeholder interviews
  * [x] Documentation review
* [ ] Design phase
  * [ ] Create wireframes
  * [ ] UI mockups
  * [ ] Prototype
* [ ] Development
  * [ ] Backend API
  * [ ] Frontend implementation
  * [ ] Testing
```

This markdown will create:
- 2 main sections (Home Maintenance, Work Projects)
- Multiple subsections (Daily Tasks, Weekly Tasks, etc.)
- Hierarchical tasks with up to 4 levels of nesting
- Mix of completed and incomplete tasks

---

## 🏗️ Project Structure

```
todo-list/
├── public/
│   ├── forest-road.jpg          # Background image
│   └── vite.svg                  # Vite logo
│
├── src/
│   ├── components/
│   │   ├── MarkdownInput.tsx    # Markdown input textarea with minimize button
│   │   ├── Sidebar.tsx          # Multi-list sidebar navigation
│   │   ├── TodoItem.tsx         # Individual task with drag-drop and actions
│   │   └── TodoList.tsx         # Task list container with toolbar
│   │
│   ├── types/
│   │   ├── Task.ts              # Task interface with hierarchy support
│   │   └── TodoList.ts          # TodoList and StorageData interfaces
│   │
│   ├── utils/
│   │   ├── exportMarkdown.ts    # Tasks → Markdown conversion
│   │   ├── markdownParser.ts    # Markdown → Tasks parsing logic
│   │   └── storage.ts           # localStorage operations
│   │
│   ├── App.tsx                  # Main app component with state management
│   ├── main.tsx                 # Application entry point
│   └── index.css                # Global styles and CSS resets
│
├── eslint.config.js             # ESLint configuration
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite build configuration
├── package.json                 # Dependencies and scripts
└── README.md                    # This file!
```

---

## 🛠️ Technologies & Architecture

### Core Stack
- **[React 19.1](https://react.dev/)** - Latest version with improved performance and developer experience
- **[TypeScript 5.9](https://www.typescriptlang.org/)** - Type-safe development with full IntelliSense support
- **[Vite 7.1](https://vite.dev/)** - Lightning-fast build tool with HMR (Hot Module Replacement)
- **[styled-components 6.1](https://styled-components.com/)** - CSS-in-JS with component-level styling
- **[pnpm](https://pnpm.io/)** - Fast, disk space efficient package manager

### Architecture Highlights

#### State Management
- **Local State**: Uses React's `useState` and `useRef` for component state
- **Persistent State**: localStorage integration with automatic saves
- **Bidirectional Sync**: Markdown ↔ Tasks synchronization with guard flags to prevent infinite loops

#### Performance Optimizations
- **Debounced Saves**: 300ms debounce on localStorage writes to reduce I/O
- **Debounced Parsing**: 300ms debounce on markdown parsing to avoid excessive re-renders
- **Memoization**: Prevents unnecessary re-computation of filtered tasks

#### Design Patterns
- **Recursive Rendering**: Task hierarchy is rendered recursively for arbitrary nesting depth
- **Guard Flags**: `isUpdatingFromMarkdown` and `isUpdatingFromTasks` prevent circular updates
- **Immutable Updates**: All state updates follow React's immutability principles

---

## 🎯 Use Cases

### Personal Productivity
- Daily task management
- Weekly planning
- Project tracking
- Goal setting with milestones

### Professional
- Sprint planning in Agile workflows
- Meeting notes with action items
- Project breakdown structures
- Client deliverables tracking

### Creative
- Story outlines with scene breakdowns
- Recipe organization with ingredient lists
- Travel planning with packing lists
- Event planning with checklists

### Education
- Study schedules with topics
- Assignment tracking
- Research organization
- Lecture notes with subtopics

---

## 🎨 Customization

### Changing the Background Image
Replace `/public/forest-road.jpg` with your own image. Supported formats: JPG, PNG, WebP.

### Styling
The app uses styled-components. To customize:
1. Find the component you want to style in `src/components/`
2. Modify the styled component definitions
3. Colors, spacing, and animations are inline for easy tweaking

### Storage Key
To change the localStorage key, modify the `STORAGE_KEY` constant in `src/utils/storage.ts`.

---

## ⚙️ Configuration

### TypeScript Configuration
- **`tsconfig.json`**: Base TypeScript configuration
- **`tsconfig.app.json`**: App-specific compiler options
- **`tsconfig.node.json`**: Node/build tools configuration

### ESLint Configuration
The project uses ESLint v9 with flat config format:
- React hooks linting
- React refresh plugin
- TypeScript ESLint rules

---

## 🧪 Technical Details

### Markdown Parsing Rules
1. **Headers**: `#` characters (1-6) followed by space and text
   - Becomes a section header (non-checkable)
   - Level = number of `#` minus 3 (### = level 0)
2. **Bullets**: `*`, `-`, or `+` followed by space and text
   - Each 2 spaces of indentation = 1 level deeper
   - Bullets under headers inherit header level + indentation
3. **Checkboxes**: `[ ]` or `[x]` immediately after bullet marker
   - Parsed as completed/uncompleted state

### Storage Schema
```typescript
{
  lists: {
    [listId]: {
      id: string;
      name: string;
      tasks: Task[];
      markdown: string;
      isMinimized: boolean;
      createdAt: number;
      updatedAt: number;
    }
  };
  currentListId: string | null;
}
```

### Drag & Drop Implementation
- Uses HTML5 Drag and Drop API
- Visual feedback with drop indicators
- Three drop zones: before, after, inside
- Automatically adjusts task levels and hierarchy
- Undo functionality for mistakes

---

## 🐛 Known Limitations

1. **No Backend**: All data is stored in localStorage (browser-specific, ~5-10MB limit)
2. **No Sync**: Lists don't sync across devices or browsers
3. **No Export History**: Can only export current markdown state
4. **Limited Undo**: Only drag-drop operations support undo (max 20 actions)
5. **No Markdown Rendering**: Task text is plain text (no bold, italics, links)

---

## 🚀 Building for Production

### Build the App
```bash
pnpm build
```

This creates an optimized production build in the `dist/` folder with:
- Minified JavaScript
- Optimized CSS
- Asset hashing for cache busting
- Source maps for debugging

### Preview Production Build
```bash
pnpm preview
```

Serves the production build locally at `http://localhost:4173` for testing.

### Deployment

The built app is a static site. Deploy to any static hosting service:

#### Vercel
```bash
npm i -g vercel
vercel --prod
```

#### Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

#### GitHub Pages
```bash
# Add to package.json scripts:
"deploy": "pnpm build && gh-pages -d dist"

pnpm run deploy
```

#### Other Options
- AWS S3 + CloudFront
- Firebase Hosting
- Cloudflare Pages
- Render
- Railway

---

## 🤝 Contributing

Contributions are welcome! Here are some ideas:

### Feature Ideas
- [ ] Backend sync (Firebase, Supabase, etc.)
- [ ] Collaborative editing
- [ ] Markdown rendering in tasks (bold, italic, links)
- [ ] Tags and filters
- [ ] Due dates and reminders
- [ ] Import from .md files
- [ ] Dark mode
- [ ] Keyboard shortcuts (Ctrl+Enter, Ctrl+Z, etc.)
- [ ] Task templates
- [ ] Priority levels
- [ ] Recurring tasks
- [ ] Time tracking

### Development Process
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run linting: `pnpm lint`
5. Test thoroughly
6. Commit with descriptive message
7. Push and create a Pull Request

---

## 📄 License

MIT License - feel free to use this project for any purpose.

---

## 🙏 Acknowledgments

- Background image: Photo by [John Towner](https://unsplash.com/@heytowner) on [Unsplash](https://unsplash.com/photos/a-dirt-road-surrounded-by-trees-and-fog-p-rN-n6Miag)
- Icons: Unicode emoji characters
- Inspiration: Notion, Todoist, and other modern task management apps

---

## 📞 Support

If you encounter any issues or have questions:
1. Check this README for documentation
2. Review the code comments in the source files
3. Open an issue on the repository (if applicable)

---

<div align="center">

**Built with ❤️ using React, TypeScript, and Vite**

⭐ Star this project if you find it useful!

</div>

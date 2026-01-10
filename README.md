# 📝 MD Tasks - Markdown Todo List

<div align="center">

**A modern, feature-rich React application that transforms markdown into interactive, hierarchical todo lists with productivity tracking**

![React](https://img.shields.io/badge/React-19.1-61dafb?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=flat&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.1-646cff?style=flat&logo=vite)
![Styled Components](https://img.shields.io/badge/Styled%20Components-6.1-db7093?style=flat&logo=styled-components)

🌐 **Live Demo**: [todo.commandboard.online](https://todo.commandboard.online)

</div>

---

## ✨ Features

### 📋 Core Functionality
- **🔄 Multi-List Management**: Create, manage, and switch between multiple todo lists with ease
- **📝 Markdown-to-Tasks Conversion**: Paste markdown content with headers and bullet points that automatically transforms into an interactive todo list
- **💾 Persistent Storage**: All your lists and tasks are automatically saved to localStorage with debounced saves for optimal performance
- **🔍 Search**: Quickly find tasks across your entire list with real-time search filtering
- **📊 Progress Tracking**: See completed vs total tasks at a glance for each list
- **⚡ Quick Add**: Rapidly add tasks with the quick add input field

### ✅ Task Management
- **Interactive Checkboxes**: Toggle task completion status with visual feedback
- **🔽 Hierarchical Structure**: Maintains proper indentation and nested tasks with collapsible sections
- **✏️ Inline Editing**: Click on any task text to edit it inline with Enter/Escape shortcuts
- **➕ Add Tasks**: Add subtasks under any existing task or add new root-level tasks
- **🗑️ Delete Tasks**: Remove tasks you don't need with confirmation dialogs for lists
- **🎯 Section Headers**: Create organizational headers (converted from markdown headers)
- **👁️ Hide Completed**: Toggle visibility of completed tasks to focus on what's left

### 📅 Due Dates
- **Due Date Picker**: Set due dates for any task with a convenient dropdown
- **Quick Options**: Today, Tomorrow, Next Week shortcuts
- **Visual Status**: Color-coded indicators for overdue (red), today (orange), and upcoming (blue) tasks
- **Smart Sections**: Automatically group tasks by due date status (Overdue, Today, Upcoming)
- **Summary Bar**: Clickable chips showing counts of overdue, today, and upcoming tasks
- **Filter by Status**: Click summary chips to filter tasks by due date status
- **📅 Add to Calendar**: Export tasks to your calendar
  - **Google Calendar**: Opens Google Calendar with task pre-filled
  - **ICS Download**: Download .ics file for any calendar app (Apple, Outlook, etc.)

### 🎯 Focus Mode
- **Distraction-Free View**: Full-screen focus on a single task
- **Large Task Display**: Task text prominently displayed for clarity
- **Quick Complete**: Large checkbox for easy task completion
- **Escape to Exit**: Press Escape or click Exit to return to the main view

### 🍅 Pomodoro Timer
- **Integrated Timer**: Built into Focus Mode for timed work sessions
- **Configurable Durations**: Customize work (5-60 min), short break (1-15 min), and long break (5-30 min)
- **Visual Progress Ring**: Circular SVG progress indicator with color-coded states
- **Session Tracking**: Track completed pomodoro sessions with visual dots
- **Auto-Transition**: Automatically switches between work and break periods
- **Sound Notifications**: Audio chime when timer completes (Web Audio API)
- **Controls**: Play, Pause, Reset, and Skip buttons

### 📈 Productivity Dashboard
- **Quick Stats**: View tasks completed today, this week, and current streak
- **Streak Tracking**: Track consecutive days of task completion with fire icon
- **Completion Chart**: Visual bar chart showing completion trends (7 or 30 days)
- **Per-List Rates**: See completion percentage for each todo list
- **Historical Data**: 90-day rolling window of productivity statistics
- **Longest Streak**: Track your best productivity streak

### 📋 Kanban Board
- **Three-Column Layout**: Organize tasks into To Do, In Progress, and Done columns
- **Drag & Drop**: Move tasks between columns with smooth drag and drop (powered by @dnd-kit)
- **Task Cards**: Each card shows task text, due date badge, and subtask progress
- **Due Date Indicators**: Color-coded borders for overdue (red) and due today (orange) tasks
- **Subtask Progress**: Visual progress bar showing completion of child tasks
- **List Selector**: Switch between different todo lists in the Kanban view
- **Task Counts**: Header shows count of tasks in each column
- **Synced Data**: Changes sync back to the main todo list automatically
- **Responsive Design**: Collapses to single column on mobile devices

### 📁 Markdown Visualizer
- **Dual-Pane Interface**: Input on left, live preview on right
- **File Upload**: Drag-and-drop or click to browse for .md files
- **Live Preview**: See formatted markdown as you type
- **Task Detection**: Automatically counts tasks found in markdown
- **GitHub-Style HTML**: Supports HTML tags like GitHub does
  - `<details>` / `<summary>` - Collapsible sections
  - `<kbd>` - Keyboard key styling
  - `<mark>` - Highlighted text
  - `<abbr>` - Abbreviations with tooltips
  - `<sub>` / `<sup>` - Subscript and superscript
  - `<ins>` - Inserted text highlighting
  - `<figure>` / `<figcaption>` - Images with captions
  - `<video>` / `<audio>` - Media elements
- **Security**: HTML is sanitized to prevent XSS attacks

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

3. **Configure environment variables** (optional):
```bash
# Create .env.local file
cp .env.example .env.local

# Or manually create .env.local with:
echo "VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX" > .env.local
```

4. **Start the development server**:
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
│   ├── favicon.svg              # App favicon
│   └── manifest.json            # PWA manifest
│
├── src/
│   ├── components/
│   │   ├── AddTasksModal.tsx    # Modal for bulk adding tasks
│   │   ├── AddToCalendar.tsx    # Calendar export dropdown
│   │   ├── CompletionChart.tsx  # Bar chart for completion trends
│   │   ├── DueDatePicker.tsx    # Due date selection dropdown
│   │   ├── DueDateSummary.tsx   # Summary bar for due date statuses
│   │   ├── FocusMode.tsx        # Full-screen focus view
│   │   ├── KanbanBoard.tsx      # Kanban board with drag-drop columns
│   │   ├── KanbanCard.tsx       # Individual Kanban task card
│   │   ├── KanbanColumn.tsx     # Kanban column (To Do, In Progress, Done)
│   │   ├── ListCompletionRates.tsx  # Per-list completion stats
│   │   ├── MarkdownInput.tsx    # Markdown input textarea
│   │   ├── MarkdownPreview.tsx  # Markdown preview with HTML support
│   │   ├── NotificationSettings.tsx  # Notification preferences
│   │   ├── PomodoroSettings.tsx # Timer settings modal
│   │   ├── PomodoroTimer.tsx    # Pomodoro timer component
│   │   ├── ProductivityDashboard.tsx  # Stats dashboard modal
│   │   ├── QuickStats.tsx       # Quick stat cards
│   │   ├── SEO.tsx              # SEO meta tags component
│   │   ├── Sidebar.tsx          # Multi-list sidebar navigation
│   │   ├── TodoItem.tsx         # Individual task with drag-drop
│   │   └── TodoList.tsx         # Task list container with toolbar
│   │
│   ├── hooks/
│   │   ├── useAnalytics.ts      # Analytics hook
│   │   ├── useMarkdownFile.ts   # Markdown file upload handling
│   │   ├── usePomodoroTimer.ts  # Pomodoro timer state management
│   │   ├── useProductivityStats.ts  # Productivity stats hook
│   │   └── useTaskNotifications.ts  # Task notification management
│   │
│   ├── pages/
│   │   ├── KanbanBoardPage.tsx  # Kanban board view page
│   │   └── MarkdownVisualizerPage.tsx  # Markdown file preview page
│   │
│   ├── types/
│   │   ├── NotificationSettings.ts  # Notification configuration types
│   │   ├── Statistics.ts        # Productivity statistics types
│   │   ├── Task.ts              # Task interface with hierarchy
│   │   └── TodoList.ts          # TodoList and StorageData interfaces
│   │
│   ├── utils/
│   │   ├── analytics.ts         # Google Analytics tracking
│   │   ├── calendar.ts          # Calendar export (Google Calendar, ICS)
│   │   ├── exportMarkdown.ts    # Tasks → Markdown conversion
│   │   ├── linkify.tsx          # URL detection and linkification
│   │   ├── markdownParser.ts    # Markdown → Tasks parsing
│   │   ├── notificationStorage.ts  # Notification settings persistence
│   │   ├── statisticsStorage.ts # Productivity stats persistence
│   │   ├── storage.ts           # localStorage operations
│   │   └── taskNotifications.ts # Notification scheduling and sending
│   │
│   ├── App.tsx                  # Main app with routing
│   ├── main.tsx                 # Application entry point
│   └── index.css                # Global styles and CSS resets
│
├── Dockerfile                   # Container configuration
├── cloudbuild.yaml              # Google Cloud Build config
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

### Environment Variables

The app supports optional environment variables for configuration:

#### Google Analytics (Optional)

To enable Google Analytics tracking:

1. **Development**: Create `.env.local` in the project root:
```bash
# .env.local (gitignored)
VITE_GA_MEASUREMENT_ID=G-99W9E25V3C
```

2. **Production**: Set environment variables in your hosting platform:

**Vercel**:
```bash
vercel env add VITE_GA_MEASUREMENT_ID
# Enter: G-99W9E25V3C
```

Or via Vercel dashboard:
- Go to Project Settings → Environment Variables
- Add `VITE_GA_MEASUREMENT_ID` with value `G-99W9E25V3C`
- Set for Production, Preview, and Development

**Netlify**:
```bash
netlify env:set VITE_GA_MEASUREMENT_ID G-99W9E25V3C
```

Or via Netlify dashboard:
- Go to Site Settings → Environment Variables
- Add `VITE_GA_MEASUREMENT_ID` with value `G-99W9E25V3C`

**GitHub Pages / Other Platforms**:
- Add the variable during build: `VITE_GA_MEASUREMENT_ID=G-99W9E25V3C npm run build`
- Or use your platform's environment variable settings

#### Tracked Events

When Google Analytics is enabled, the app automatically tracks:
- Task operations (create, complete, update, delete)
- List management (create, switch, rename, delete)
- Data operations (export, download, import, undo)
- UI interactions (search, hide completed, toggle editor)

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

**Tasks Storage** (`markdown-todo-app-state`):
```typescript
{
  lists: {
    [listId]: {
      id: string;
      name: string;
      tasks: Task[];        // Each task has: id, text, completed, level, children?, dueDate?, completedAt?
      markdown: string;
      isMinimized: boolean;
      createdAt: number;
      updatedAt: number;
    }
  };
  currentListId: string | null;
}
```

**Productivity Statistics** (`markdown-todo-app-stats`):
```typescript
{
  dailyHistory: DailyStats[];   // Last 90 days: { date, completedCount, taskIds }
  listStats: { [listId]: ListStats };
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}
```

**Pomodoro Settings** (`pomodoro-settings`):
```typescript
{
  workDuration: number;           // minutes (default: 25)
  shortBreakDuration: number;     // minutes (default: 5)
  longBreakDuration: number;      // minutes (default: 15)
  sessionsBeforeLongBreak: number; // default: 4
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
5. **Plain Task Text**: Task text in the main view is plain text (use Markdown Visualizer for rich preview)

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

#### Google Cloud Run (Containerized)

This project includes a Dockerfile for containerized deployment.

**📖 See [CLOUD_RUN_DEPLOYMENT.md](./CLOUD_RUN_DEPLOYMENT.md) for complete Cloud Run deployment guide.**

Quick deploy:
```bash
# Build and deploy with Google Analytics
gcloud builds submit \
  --tag=gcr.io/YOUR_PROJECT_ID/todo-list \
  --build-arg=VITE_GA_MEASUREMENT_ID=G-99W9E25V3C

gcloud run deploy todo-list \
  --image=gcr.io/YOUR_PROJECT_ID/todo-list \
  --platform=managed \
  --region=us-central1 \
  --allow-unauthenticated \
  --port=8080
```

#### Vercel
```bash
npm i -g vercel
vercel --prod
```
Set environment variable in dashboard: `VITE_GA_MEASUREMENT_ID=G-99W9E25V3C`

#### Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```
Set environment variable in dashboard: `VITE_GA_MEASUREMENT_ID=G-99W9E25V3C`

#### GitHub Pages
```bash
# Add to package.json scripts:
"deploy": "VITE_GA_MEASUREMENT_ID=G-99W9E25V3C pnpm build && gh-pages -d dist"

pnpm run deploy
```

#### Other Options
- AWS S3 + CloudFront
- Firebase Hosting
- Cloudflare Pages
- Render
- Railway

**Note:** For all platforms, set `VITE_GA_MEASUREMENT_ID=G-99W9E25V3C` as an environment variable.

---

## 🤝 Contributing

Contributions are welcome! Here are some ideas:

### Feature Ideas
- [ ] Backend sync (Firebase, Supabase, etc.)
- [ ] Collaborative editing
- [ ] Tags and filters
- [ ] Dark mode
- [ ] Task templates
- [ ] Priority levels
- [ ] Recurring tasks

### Recently Implemented
- [x] Kanban Board view with drag-and-drop columns
- [x] Add to Calendar (Google Calendar + ICS download)
- [x] HTML support in Markdown Visualizer (GitHub-style)
- [x] Task Notifications with reminders
- [x] SEO optimization (meta tags, Open Graph, sitemap)
- [x] Due dates with visual indicators
- [x] Import from .md files (Markdown Visualizer)
- [x] Focus Mode
- [x] Pomodoro Timer
- [x] Productivity Dashboard with statistics
- [x] Streak tracking
- [x] Quick add tasks
- [x] Copy task/section to clipboard
- [x] Link detection in tasks

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

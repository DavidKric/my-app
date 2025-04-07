# Software Requirements Specification (SRS) – Frontend for Legal PDF Analysis Platform

**Table of Contents**
1. [Introduction](#introduction)
2. [Overall Architecture & Component Mapping](#overall-architecture--component-mapping)
3. [Screen Structure and User Interface Details](#screen-structure-and-user-interface-details)
   1. [Left Sidebar: Project & File Explorer](#left-sidebar-project--file-explorer)
   2. [Main Panel: PDF Viewer & Annotation Interface](#main-panel-pdf-viewer--annotation-interface)
   3. [Right Sidebar: Annotations & AI Copilot](#right-sidebar-annotations--ai-copilot)
4. [Functional Requirements](#functional-requirements)
5. [User Flow Examples](#user-flow-examples)
6. [Authentication & Authorization](#authentication--authorization)
7. [Non-Functional & UI/UX Requirements](#non-functional--uiux-requirements)
8. [References](#references)


<a name="introduction"></a>
## 1. Introduction

This **Software Requirements Specification (SRS)** covers the **frontend** of a Next.js 14 (App Router) application designed for legal professionals to manage, annotate, and analyze large sets of case PDF documents. Inspired by:

- [Visual Studio Code Web](https://vscode.dev)
- [Semantic Scholar’s Semantic Reader](https://www.semanticscholar.org/product/semantic-reader)
- [Humata](https://app.humata.ai/)
- [Allen AI PAWLS](https://github.com/allenai/pawls)
- [React-PDF-Highlighter example by agentcooper](https://agentcooper.github.io/react-pdf-highlighter/)
- [OpenContracts (pawls-based frontend)](https://github.com/JSv4/OpenContracts/tree/main/frontend)
- Various [LangChain AI UIs and templates](https://github.com/langchain-ai)

We also leverage the styling approach of [Shadcn/UI](https://github.com/shadcn/ui) for a modern, professional, and accessible design. The platform aims to give lawyers a **VSCode-like** project/file explorer, a **Word-like** PDF annotation experience, and an integrated **AI Copilot** (multi-agent system) to accelerate legal document review.

**Key Features:**
- Next.js 14 App Router for improved routing and file-based layouts.
- React-PDF viewer integrated with **PAWLS** for robust token-based annotation and bounding box highlights.
- **Left Sidebar**: Project/file explorer with search, history, rename, delete, multi-folder organization, referencing [VSCode’s layout](https://vscode.dev).
- **Right Sidebar**: Annotations tab (list, filter, color-coded categories, comments) and AI Copilot tab (LangChain-based chat integrated with PDF content).
- **Center**: PDF viewer with word-processor-like UX, highlight/annotate, bounding-box selection, AI-provided annotations, label management, comment threads.
- Role-based authentication (Admin, Lawyer, Paralegal), with future offline/online sync.

<a name="overall-architecture--component-mapping"></a>
## 2. Overall Architecture & Component Mapping

The UI is divided into three main zones:
1. **Left Sidebar** – Project/file explorer (like [VSCode Explorer](https://vscode.dev)).  
2. **Main Panel** – The PDF viewer (using [react-pdf](https://www.npmjs.com/package/react-pdf)) with annotation overlays from [Allen AI PAWLS](https://github.com/allenai/pawls).  
3. **Right Sidebar** – Annotations list and AI chat, referencing designs from [LangChain agent chat UIs](https://github.com/langchain-ai/agent-chat-ui).

Everything is styled with the [Shadcn/UI library](https://github.com/shadcn/ui) for consistency. We store user-created annotations in a local DB (IndexedDB) initially, but the architecture is ready for a remote DB.

<a name="screen-structure-and-user-interface-details"></a>
## 3. Screen Structure and User Interface Details

<a name="left-sidebar-project--file-explorer"></a>
### 3.1 Left Sidebar: Project & File Explorer
- **Visual**: Mimics the [VSCode Sidebar](https://vscode.dev), showing a tree of folders/files.
- **Features**:
  - Multi-project handling (drop-down or top-level selection).
  - Search panel for cross-document text search.
  - History/recently-opened documents.
  - File operations (rename, delete, move, new folder, upload PDF).

<a name="main-panel-pdf-viewer--annotation-interface"></a>
### 3.2 Main Panel: PDF Viewer & Annotation Interface
- **Core**: Uses [react-pdf](https://www.npmjs.com/package/react-pdf), referencing or integrating [PAWLS overlays](https://github.com/allenai/pawls) for token-based highlights.
- **Features**:
  - Word-like toolbar: zoom, page navigation, highlight color/category, add comment, undo/redo.
  - Context menu on selection: “Add Annotation,” “Research Using Agent,” “Add to Chat.”
  - Multi-page support, bounding-box area selection, token snapping, AI annotation rendering.

<a name="right-sidebar-annotations--ai-copilot"></a>
### 3.3 Right Sidebar: Annotations & AI Copilot
- **Tab 1**: Annotation list + management. Filter by category/color, search within highlights, rename/delete annotation, and page-jump on click.
- **Tab 2**: AI Copilot chat (powered by [LangChain’s agentic UI patterns](https://github.com/langchain-ai/agent-chat-ui)):
  - Q&A, summarizations, cross-document analysis.
  - Possibly plugin-based agent expansions (case law retriever, contract summarizer).
  - User commands like “highlight all references to X.”

<a name="functional-requirements"></a>
## 4. Functional Requirements

1. **Project/File Management**: Create, rename, delete, move files/folders.  
2. **Annotation**: Highlight text, bounding-box selection, color-coded categories, comment threads.  
3. **Annotation Filters**: Category-based color filtering, user vs. AI highlights.  
4. **AI Chat**: Summaries, Q&A, cross-document analysis, with streaming responses.  
5. **Auth**: Login, registration, role-based UI.  
6. **Local/Remote DB**: Annotations stored locally first, future remote sync.  
7. **Undo/Redo**: For annotation creation, edits, deletes.  
8. **Mobile Optimization** (basic, focusing on read-only or quick queries).

<a name="user-flow-examples"></a>
## 5. User Flow Examples

- **Case Creation**: Lawyer logs in, creates new project, uploads PDFs, organizes, opens and annotates.  
- **AI Summaries**: Lawyer clicks “Copilot” tab, requests contract summary, gets bullet points referencing doc sections.  
- **Annotation Review**: Switch to “Annotations” tab, filter by category, jump through highlights.  
- **Role Control**: Paralegal can annotate but not delete entire project, admin can manage users/plugins.

<a name="authentication--authorization"></a>
## 6. Authentication & Authorization

- **Login Flow**: NextAuth or Clerk-based, email/password or SSO.  
- **Role-based**: Admin (full system control), Lawyer (project-level control), Paralegal (limited).  
- **Access**: Certain UI panels hidden/disabled based on role.

<a name="non-functional--uiux-requirements"></a>
## 7. Non-Functional & UI/UX Requirements

- **Shadcn/UI**: Modern, accessible components.  
- **Performance**: Virtualized PDF rendering, minimal lag.  
- **Scalability**: Large projects with many PDFs and annotations.  
- **Extensibility**: Plugin system for AI agents, easily integrated with [LangChain AI Tools](https://github.com/langchain-ai).  
- **Responsive**: Desktop-first, but workable on tablet/mobile with collapsible sidebars.

<a name="references"></a>
## 8. References

1. **VSCode Web**: [https://vscode.dev](https://vscode.dev)
2. **Semantic Reader**: [https://www.semanticscholar.org/product/semantic-reader](https://www.semanticscholar.org/product/semantic-reader)
3. **Humata**: [https://app.humata.ai/](https://app.humata.ai/)
4. **AllenAI Pawls**: [https://github.com/allenai/pawls](https://github.com/allenai/pawls)
5. **OpenContracts (PAWLS-based)**: [https://github.com/JSv4/OpenContracts/tree/main/frontend](https://github.com/JSv4/OpenContracts/tree/main/frontend)
6. **React PDF Highlighter**: [https://agentcooper.github.io/react-pdf-highlighter/](https://agentcooper.github.io/react-pdf-highlighter/)
7. **LangChain & Tools**: [https://github.com/langchain-ai/](https://github.com/langchain-ai/)
8. **Shadcn/UI**: [https://github.com/shadcn/ui](https://github.com/shadcn/ui)

You are an expert in building extensible plugin systems in React.

Help me detail a **Plugin Management** approach for my Next.js 14 legal PDF/AI app:
1. Admin can enable/disable AI-based plugins (e.g., case law retriever) from a settings panel.
2. Each plugin can add new context menu actions, new AI chat commands, or new project-level features.
3. The SRS hints at a “Copilot” with multi-agent architecture. We want a front-end extension point for new agents or tools.

Explain:
- How the front-end can dynamically load or conditionally render plugin components (if they exist).
- Data structure for plugin definitions (name, description, entry points, config form).
- UI in “Settings -> Plugins” for toggling, providing config (API keys, etc.).
- Communication with backend if the plugin is orchestrated by LangChain.
- Example code or architecture for a plugin registry or config store.
- Potential security considerations (running untrusted plugin code).
- Steps for an advanced scenario: user installs a plugin that adds a custom context-menu item in the PDF viewer to “Find Similar Clauses.”

Conclude with real-world best practices for stable, maintainable plugin systems in a large-scale React/Next.js app.

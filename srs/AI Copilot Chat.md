You are an expert in building chat interfaces integrated with AI/LLM backends using LangChain.

I want to build the **Copilot Chat** tab in the right sidebar of my Next.js 14 legal PDF app, referencing:
- LangChain's agent chat UI patterns: https://github.com/langchain-ai/agent-chat-ui
- My SRS (paste relevant chat/copilot section).

Key points:
1. Multi-turn conversation with memory, streaming responses from the AI.
2. Ability to incorporate context from the open PDF or entire project (like page references).
3. A composer input allowing slash commands or suggestions, e.g. /summarize, /search.
4. Displaying AI messages with Markdown or structured output (tables, citations).
5. Potential plugin system for specialized tasks (case law retriever, summarizer, etc.).
6. Shadcn/UI for styling.

Explain:
- Chat component breakdown (ChatHistory, ChatInput, message types).
- Handling streaming responses (websocket? server-sent events?).
- Integrating user selections from PDF into the chat (e.g., “Add to Chat” action).
- Storing conversation logs, or ephemeral?
- Handling errors, timeouts, or tool invocation requiring user approval.
- Example code structure, focusing on best practices for Next.js 14 + React.

Conclude with recommendations for advanced features (e.g., highlight in PDF from AI suggestions, referencing messages, plugin expansions).

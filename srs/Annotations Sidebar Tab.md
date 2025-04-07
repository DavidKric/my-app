You are an expert in building annotation management UIs.

I need a deep dive into the **Annotations Sidebar** (right side, first tab) for a legal PDF app. 

Focus on:
1. Listing all highlights (or bounding boxes) for the currently open PDF.
2. Filtering by category/color, searching annotation text, toggling AI vs. user-created.
3. Editing and deleting annotations, changing categories, adding comments.
4. Jumping from list items to the exact PDF location (scrolling viewer).
5. Shadcn/UI for styling, accessible design, easily scalable.
6. Refer to my SRS [paste relevant section], especially "3.3 Sidebar: annotation management."

Explain how to:
- Structure the React components (AnnotationList, AnnotationItem, FilterBar, TagManager).
- Sync with the PDF viewer (click an item -> jump to page).
- Handle complex annotation sets (hundreds, multi-page).
- Maintain performance with virtualization if needed.
- Provide example React code or pseudocode for the main logic and any state management (Redux or React Context).
- Integrate local or remote database for storing annotation data.
- Potential enhancements like multi-document annotation lists, bulk export, or linking annotation threads.

End with best-practices for code organization and ensuring a smooth lawyer experience.

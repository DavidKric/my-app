// file-structure.ts
export type FileNode = {
    id: string;
    name: string;
    type: 'file';       // only 'file' for FileNode
    fileType: 'pdf';    // could store file type, here specifically PDF
    parentId: string;   // reference to parent folder (or project)
  };
  
  export type FolderNode = {
    id: string;
    name: string;
    type: 'folder';    // distinguishes folder vs file
    parentId: string;
    children: Array<FolderNode | FileNode>;  // nested contents
  };
  
  // Each project has a root folder
  export type Case = {
    id: string;
    name: string;
    root: FolderNode;
  };
  
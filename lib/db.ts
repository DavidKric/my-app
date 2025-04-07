import Dexie, { Table } from 'dexie';
import { Annotation } from '@/types/integrated_ai/integrated_ai';

export class AnnotationDB extends Dexie {
  annotations!: Table<Annotation>;

  constructor() {
    super('annotationDB');
    this.version(1).stores({
      annotations: 'id,pageNumber,category,creator,timestamp'
    });
  }
}

export const db = new AnnotationDB();

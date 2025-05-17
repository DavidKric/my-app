// Temporary in-memory store replacing Prisma while the real database
// setup is unavailable. This mimics the subset of the Prisma client
// used by the annotation API routes.
type Annotation = {
  id: string
  documentId: string
  pageNumber: number
  rects: any[]
  selectedText: string
  note: string
  tags: string[]
  parentId?: string | null
  createdAt: Date
  updatedAt: Date
}

let annotations: Annotation[] = []

const generateId = () => Math.random().toString(36).slice(2)

export const prisma = {
  annotation: {
    async findMany({ where }: { where?: { documentId?: string } } = {}) {
      return where?.documentId
        ? annotations.filter(a => a.documentId === where.documentId)
        : [...annotations]
    },
    async create({ data }: { data: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'> }) {
      const ann: Annotation = {
        ...data,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      annotations.push(ann)
      return ann
    },
    async findUnique({ where: { id } }: { where: { id: string } }) {
      return annotations.find(a => a.id === id) ?? null
    },
    async update({ where: { id }, data }: { where: { id: string }; data: Partial<Annotation> }) {
      const idx = annotations.findIndex(a => a.id === id)
      if (idx === -1) return null
      const updated: Annotation = {
        ...annotations[idx],
        ...data,
        updatedAt: new Date(),
      }
      annotations[idx] = updated
      return updated
    },
    async delete({ where: { id } }: { where: { id: string } }) {
      annotations = annotations.filter(a => a.id !== id)
      return {}
    },
  },
}

export default prisma

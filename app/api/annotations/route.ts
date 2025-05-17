import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const documentId = req.nextUrl.searchParams.get('documentId')
  const annotations = await prisma.annotation.findMany({
    where: documentId ? { documentId } : undefined,
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(annotations)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const annotation = await prisma.annotation.create({ data })
  return NextResponse.json(annotation)
}

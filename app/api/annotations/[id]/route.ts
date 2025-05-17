import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const annotation = await prisma.annotation.findUnique({ where: { id: params.id } })
  if (!annotation) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(annotation)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json()
  const annotation = await prisma.annotation.update({ where: { id: params.id }, data })
  return NextResponse.json(annotation)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.annotation.delete({ where: { id: params.id } })
  return NextResponse.json({})
}

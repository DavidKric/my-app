import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function openPath(path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    let cmd: string;
    if (process.platform === 'darwin') {
      cmd = `open -R "${path}"`;
    } else if (process.platform === 'win32') {
      cmd = `explorer /select,\"${path}\"`;
    } else {
      cmd = `xdg-open "${path}"`;
    }
    exec(cmd, err => {
      if (err) reject(err); else resolve();
    });
  });
}

export async function POST(request: NextRequest) {
  const { path } = await request.json();
  if (!path) {
    return NextResponse.json({ error: 'No path provided' }, { status: 400 });
  }

  try {
    await openPath(path);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Failed to open path', err);
    return NextResponse.json({ error: err.message || 'Failed to open path' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { requireRole } from '@/lib/auth-utils';

export const runtime = 'nodejs';

const PUBLIC_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'schemas');
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/svg+xml',
  'application/pdf',
  'application/json',
];

export async function POST(request: Request) {
  try {
    // Require authenticated admin/instructor (return 403 if not)
    try {
      await requireRole(['ADMIN', 'INSTRUCTOR']);
    } catch {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Prefer writing into public/uploads so files are publicly accessible for students
    const targetDir = PUBLIC_UPLOAD_DIR;
    await fs.promises.mkdir(PUBLIC_UPLOAD_DIR, { recursive: true });

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Type de fichier non autorisé' }, { status: 400 });
    }

    const size = (await file.arrayBuffer()).byteLength;
    if (size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'Taille du fichier trop grande' }, { status: 413 });
    }

  const originalName = path.basename((file as any).name || 'upload');
  const sanitized = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const safeName = `${Date.now()}-${sanitized}`;

    // try saving to the chosen targetDir
    try {
      await fs.promises.writeFile(path.join(targetDir, safeName), Buffer.from(await file.arrayBuffer()));
    } catch (writeErr) {
      console.error('Failed to write file to target dir:', writeErr);
      // Include error message for easier debugging in dev
      const errorMessage = writeErr instanceof Error ? writeErr.message : String(writeErr);
      return NextResponse.json(
        { error: 'Erreur lors de la sauvegarde du fichier', detail: errorMessage },
        { status: 500 }
      );
    }

  // Public URL that can be used directly by the frontend
  const publicUrl = `/uploads/schemas/${safeName}`;

  return NextResponse.json({ filename: safeName, url: publicUrl }, { status: 201 });
  } catch (err) {
    console.error('Upload error:', err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde du fichier', detail: errorMessage }, { status: 500 });
  }
}

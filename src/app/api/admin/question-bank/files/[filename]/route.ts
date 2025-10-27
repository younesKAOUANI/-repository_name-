import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
// lightweight mime mapping to avoid extra dependency
import { requireRole } from '@/lib/auth-utils';

export const runtime = 'nodejs';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'schemas');
const PUBLIC_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'schemas');

function sanitizeFilename(name: string) {
  // Remove any path separators and return a basename
  return path.basename(name).replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function GET(request: Request, { params }: { params: Promise<{ filename: string }> }) {
  try {
    // Ensure caller has ADMIN or INSTRUCTOR role
    try {
      await requireRole(['ADMIN', 'INSTRUCTOR']);
    } catch (authErr: any) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { filename } = await params;
    if (!filename) {
      return NextResponse.json({ error: 'Nom de fichier manquant' }, { status: 400 });
    }

    const safeName = sanitizeFilename(filename);

    // Check both public and private upload locations
    const candidatePaths = [
      path.join(PUBLIC_UPLOAD_DIR, safeName),
      path.join(UPLOAD_DIR, safeName),
    ];

    let foundPath: string | null = null;
    let stat: fs.Stats | null = null;
    for (const p of candidatePaths) {
      try {
        if (fs.existsSync(p)) {
          const s = await fs.promises.stat(p);
          if (s.isFile()) {
            foundPath = p;
            stat = s;
            break;
          }
        }
      } catch (e) {
        // ignore and continue
      }
    }

    if (!foundPath || !stat) {
      return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 });
    }

    const ext = path.extname(foundPath).toLowerCase();
    const mimeType = (() => {
      switch (ext) {
        case '.png': return 'image/png';
        case '.jpg':
        case '.jpeg': return 'image/jpeg';
        case '.svg': return 'image/svg+xml';
        case '.pdf': return 'application/pdf';
        case '.json': return 'application/json';
        default: return 'application/octet-stream';
      }
    })();

    const fileBuffer = await fs.promises.readFile(foundPath);
    const body = fileBuffer as unknown as BodyInit;
    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': String(stat.size),
        'Cache-Control': 'public, max-age=3600'
      },
    });
  } catch (err: any) {
    console.error('Error serving file:', err);
    return NextResponse.json({ error: 'Erreur lors de la récupération du fichier', detail: err?.message || String(err) }, { status: 500 });
  }
}

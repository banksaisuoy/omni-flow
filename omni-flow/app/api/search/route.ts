import { NextResponse } from 'next/server';
import lunr from 'lunr';
import fs from 'fs';
import path from 'path';
import { auth } from '@/auth';

let cachedIndex: lunr.Index | null = null;
let cachedDocs: any[] = [];

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
    try {
        const files = fs.readdirSync(dirPath);

        files.forEach(function(file) {
            const fullPath = path.join(dirPath, file);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                if (!['node_modules', '.next', '.git', 'dist', 'build', 'public'].includes(file)) {
                    arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
                }
            } else {
                const ext = path.extname(file);
                if (['.md', '.json', '.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
                    arrayOfFiles.push(fullPath);
                }
            }
        });
    } catch (e) {
        console.error('Error reading directory', dirPath, e);
    }
    return arrayOfFiles;
}

function buildIndex() {
    const basePath = process.cwd();
    const files = getAllFiles(basePath);
    
    const docs = files.map((file, id) => {
        try {
            const content = fs.readFileSync(file, 'utf8');
            return {
                id: id.toString(),
                path: path.relative(basePath, file),
                content,
            };
        } catch (e) {
            return null;
        }
    }).filter(Boolean);

    const idx = lunr(function () {
        this.ref('id');
        this.field('path');
        this.field('content');

        docs.forEach(function (doc) {
            this.add(doc);
        }, this);
    });

    cachedIndex = idx;
    cachedDocs = docs;
}

export async function GET(request: Request) {
    // SECURITY: Disable in production to prevent leaking proprietary source code
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
            { error: 'Source code search is disabled in production environment.' },
            { status: 403 }
        );
    }

    // SECURITY: Ensure only authorized ADMIN users can use this feature
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
        return NextResponse.json(
            { error: 'Unauthorized access.' },
            { status: 403 }
        );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ results: [] });
    }

    if (!cachedIndex) {
        buildIndex();
    }

    try {
        // Simple search with wildcard for partial matches
        const searchQuery = query.split(' ').filter(Boolean).map(term => term + '*').join(' ');
        const searchResults = cachedIndex!.search(searchQuery);
        
        const results = searchResults.map(result => {
            const doc = cachedDocs.find(d => d.id === result.ref);
            if (!doc) return null;
            
            // Create a simple snippet
            const contentLower = doc.content.toLowerCase();
            const queryLower = query.toLowerCase().split(' ')[0]; // use first term for snippet highlighting
            const index = contentLower.indexOf(queryLower);
            
            let snippet = '';
            if (index !== -1) {
                const start = Math.max(0, index - 60);
                const end = Math.min(doc.content.length, index + query.length + 60);
                snippet = (start > 0 ? '...' : '') + doc.content.substring(start, end) + (end < doc.content.length ? '...' : '');
            } else {
                snippet = doc.content.substring(0, 120) + '...';
            }

            return {
                path: doc.path,
                score: result.score,
                snippet
            };
        }).filter(Boolean).slice(0, 15);

        return NextResponse.json({ results });
    } catch (e) {
        // Fallback for lunr parse errors
        return NextResponse.json({ results: [] });
    }
}
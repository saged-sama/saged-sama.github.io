import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

/**
 * What the sync wrote last time, per file (repo-relative path):
 * - `version`: what the content was made from (a content hash, or the media file name);
 * - `sha`: hash of the bytes written, to tell whether someone edited the file since.
 * Files that aren't listed here are never touched.
 */
export type Manifest = { files: Record<string, { version: string; sha: string }> };

export const MANIFEST_PATH = '.sync/manifest.json';

export function sha(content: string | Buffer) {
	return createHash('sha256').update(content).digest('hex');
}

export function loadManifest(root: string): Manifest {
	const file = resolve(root, MANIFEST_PATH);
	if (!existsSync(file)) return { files: {} };
	return JSON.parse(readFileSync(file, 'utf8')) as Manifest;
}

export function saveManifest(root: string, manifest: Manifest) {
	const file = resolve(root, MANIFEST_PATH);
	mkdirSync(dirname(file), { recursive: true });
	// Sorted keys keep the diff small and stable.
	const files = Object.fromEntries(Object.entries(manifest.files).sort(([a], [b]) => a.localeCompare(b)));
	writeFileSync(file, JSON.stringify({ files }, null, 2) + '\n');
}

/** Hash of a file on disk, or null when it doesn't exist. */
export function diskSha(root: string, path: string): string | null {
	const file = resolve(root, path);
	return existsSync(file) ? sha(readFileSync(file)) : null;
}

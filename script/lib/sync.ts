import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { diskSha, sha, type Manifest } from './manifest.ts';

/** A file the sync wants to exist. `load` is only called when it has to be (re)written. */
export type Desired = {
	path: string;
	version: string;
	load: () => Promise<string | Buffer>;
};

export type Action =
	| { type: 'add' | 'update' | 'restore'; path: string }
	| { type: 'delete'; path: string }
	| { type: 'keep'; path: string }
	/** Not touched, with the reason (a hand-made or hand-edited file). */
	| { type: 'skip'; path: string; reason: string }
	/** A synced file that was edited by hand and is no longer wanted: it becomes a manual file. */
	| { type: 'release'; path: string; reason: string }
	/** In the manifest, gone from disk and no longer wanted: just forget it. */
	| { type: 'forget'; path: string };

/**
 * Decides what to do with every file, without touching anything. `shaOf` returns the hash of a
 * file on disk (null if missing), so this can be tested without a filesystem.
 */
export function planSync(
	desired: Desired[],
	manifest: Manifest,
	shaOf: (path: string) => string | null
): Action[] {
	const actions: Action[] = [];
	const wanted = new Set<string>();

	for (const file of desired) {
		wanted.add(file.path);
		const known = manifest.files[file.path];
		const disk = shaOf(file.path);
		if (!known) {
			actions.push(
				disk === null
					? { type: 'add', path: file.path }
					: { type: 'skip', path: file.path, reason: 'a file with this name already exists and wasn’t written by the sync' }
			);
		} else if (disk === null) {
			actions.push({ type: 'restore', path: file.path });
		} else if (disk !== known.sha) {
			actions.push({ type: 'skip', path: file.path, reason: 'edited by hand, so admin changes aren’t applied' });
		} else {
			actions.push({ type: known.version === file.version ? 'keep' : 'update', path: file.path });
		}
	}

	for (const [path, known] of Object.entries(manifest.files)) {
		if (wanted.has(path)) continue;
		const disk = shaOf(path);
		if (disk === null) actions.push({ type: 'forget', path });
		else if (disk === known.sha) actions.push({ type: 'delete', path });
		else actions.push({ type: 'release', path, reason: 'removed in the admin but edited by hand, so it’s kept as a manual file' });
	}
	return actions;
}

/** Carries out a plan and updates the manifest in place. */
export async function applySync(
	root: string,
	actions: Action[],
	desired: Desired[],
	manifest: Manifest
) {
	const byPath = new Map(desired.map((d) => [d.path, d]));
	for (const action of actions) {
		const file = resolve(root, action.path);
		switch (action.type) {
			case 'add':
			case 'update':
			case 'restore': {
				const item = byPath.get(action.path)!;
				const content = await item.load();
				mkdirSync(dirname(file), { recursive: true });
				writeFileSync(file, content);
				manifest.files[action.path] = { version: item.version, sha: sha(content) };
				break;
			}
			case 'delete':
				rmSync(file, { force: true });
				delete manifest.files[action.path];
				break;
			case 'release':
			case 'forget':
				delete manifest.files[action.path];
				break;
		}
	}
}

export const shaOnDisk = (root: string) => (path: string) => diskSha(root, path);

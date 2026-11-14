import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planSync, type Desired } from './sync.ts';

const want = (path: string, version = 'v1'): Desired => ({ path, version, load: async () => '' });
const plan = (desired: Desired[], files: Record<string, { version: string; sha: string }>, disk: Record<string, string>) =>
	planSync(desired, { files }, (p) => disk[p] ?? null).map((a) => `${a.type} ${a.path}`);

test('adds new files and keeps unchanged ones', () => {
	assert.deepEqual(plan([want('a'), want('b')], { b: { version: 'v1', sha: 's' } }, { b: 's' }), ['add a', 'keep b']);
});

test('updates a file whose source changed, if nobody edited it', () => {
	assert.deepEqual(plan([want('a', 'v2')], { a: { version: 'v1', sha: 's' } }, { a: 's' }), ['update a']);
});

test('never overwrites hand-made or hand-edited files', () => {
	assert.deepEqual(plan([want('manual')], {}, { manual: 'x' }), ['skip manual']);
	assert.deepEqual(plan([want('a', 'v2')], { a: { version: 'v1', sha: 's' } }, { a: 'edited' }), ['skip a']);
});

test('restores a synced file that went missing', () => {
	assert.deepEqual(plan([want('a')], { a: { version: 'v1', sha: 's' } }, {}), ['restore a']);
});

test('deletes files removed in the admin, but keeps edited ones as manual', () => {
	const files = { gone: { version: 'v1', sha: 's' }, edited: { version: 'v1', sha: 's' }, missing: { version: 'v1', sha: 's' } };
	assert.deepEqual(plan([], files, { gone: 's', edited: 'x' }), ['delete gone', 'release edited', 'forget missing']);
});

test('a renamed slug deletes the old file and adds the new one', () => {
	assert.deepEqual(plan([want('new')], { old: { version: 'v1', sha: 's' } }, { old: 's' }), ['add new', 'delete old']);
});

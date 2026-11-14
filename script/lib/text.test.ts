import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toSingleLine } from './html.ts';
import { replaceSections } from './readme.ts';
import { clean, day } from './transforms/util.ts';

test('HTML becomes one line; code keeps its newlines as entities', () => {
	assert.equal(toSingleLine('<p>a</p>\n\n<pre><code>x\n\ny</code></pre>\n<p>b</p>'), '<p>a</p> <pre><code>x&#10;&#10;y</code></pre> <p>b</p>');
});

test('README: only marked blocks with a generator change', () => {
	const readme = 'intro\n<!-- portfolio:posts -->\nold\n<!-- /portfolio:posts -->\n<!-- portfolio:other -->keep<!-- /portfolio:other -->';
	const { text, found } = replaceSections(readme, { posts: '- new' });
	assert.equal(text, 'intro\n<!-- portfolio:posts -->\n- new\n<!-- /portfolio:posts -->\n<!-- portfolio:other -->keep<!-- /portfolio:other -->');
	assert.deepEqual(found, ['posts']);
});

test('dates: midnight UTC becomes a plain day', () => {
	assert.equal(day('2025-08-01 00:00:00.000Z'), '2025-08-01');
	assert.equal(day('2026-10-31 06:01:00.000Z'), '2026-10-31T06:01:00.000Z');
	assert.equal(day(''), undefined);
});

test('clean drops empty values but keeps zero', () => {
	assert.deepEqual(clean({ a: '', b: [], c: false, d: 0, e: { f: undefined }, g: ['x', ''] }), { d: 0, g: ['x'] });
});

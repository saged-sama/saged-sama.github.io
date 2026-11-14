import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { PbRecord } from './api.ts';
import { topicFolder, topicMetas, topicSlug } from './topics.ts';

const post = (topic: string) => ({ id: 'x', updated: '', topic }) as PbRecord;

test('topic levels become folders, any script kept', () => {
	assert.equal(topicFolder(post('Machine Learning / Linear Models')), 'machine-learning/linear-models');
	assert.equal(topicFolder(post('')), '');
	assert.equal(topicSlug('সাপ ও প্রকৃতি'), 'সাপ-ও-প্রকৃতি');
	assert.equal(topicSlug('C++'), 'c');
});

test('every topic level gets one _meta.json with its display name', () => {
	const metas = topicMetas([post('ML / Trees'), post('ml / Linear'), post('')], 'blogs');
	assert.deepEqual(Object.fromEntries(metas), {
		'blogs/ml/_meta.json': { label: 'ML' },
		'blogs/ml/trees/_meta.json': { label: 'Trees' },
		'blogs/ml/linear/_meta.json': { label: 'Linear' }
	});
});

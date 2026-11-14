import type { Action } from './sync.ts';

const LABELS: Record<Action['type'], string> = {
	add: 'added',
	update: 'updated',
	restore: 'restored',
	delete: 'deleted',
	keep: 'unchanged',
	skip: 'skipped',
	release: 'released',
	forget: 'forgotten'
};

/** Prints the plan: one line per change, then counts. Unchanged files are only counted. */
export function printPlan(actions: Action[], dryRun: boolean) {
	const counts = new Map<string, number>();
	for (const action of actions) {
		counts.set(action.type, (counts.get(action.type) ?? 0) + 1);
		if (action.type === 'keep') continue;
		const reason = 'reason' in action ? `  (${action.reason})` : '';
		console.log(`  ${LABELS[action.type].padEnd(10)} ${action.path}${reason}`);
	}
	const summary = [...counts].map(([type, n]) => `${n} ${LABELS[type as Action['type']]}`).join(', ');
	console.log(`${dryRun ? 'Would sync' : 'Synced'}: ${summary || 'nothing to do'}`);
}

export const step = (title: string) => console.log(`\n▸ ${title}`);

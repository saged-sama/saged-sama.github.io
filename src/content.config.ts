import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { profileSchema, socialSchema } from './schemas/profile';
import { achievementSchema, educationSchema, experienceSchema } from './schemas/career';
import { blogSchema, projectSchema } from './schemas/content';
import { lifeEventSchema, skillSchema, testimonialSchema } from './schemas/extras';

/**
 * All content lives outside src/: hand-written files and files synced from portfolio-admin
 * (script/static-gen.ts) sit side by side. Each entry's id is its file name.
 */
const json = (folder: string) => glob({ base: `./data/${folder}`, pattern: '*.json' });

export const collections = {
	profile: defineCollection({
		loader: glob({ base: './data', pattern: 'profile.json' }),
		schema: profileSchema
	}),
	social: defineCollection({ loader: json('social'), schema: socialSchema }),
	skills: defineCollection({ loader: json('skills'), schema: skillSchema }),
	experience: defineCollection({ loader: json('experience'), schema: experienceSchema }),
	education: defineCollection({ loader: json('education'), schema: educationSchema }),
	achievements: defineCollection({ loader: json('achievements'), schema: achievementSchema }),
	testimonials: defineCollection({ loader: json('testimonials'), schema: testimonialSchema }),
	lifeEvents: defineCollection({ loader: json('life-events'), schema: lifeEventSchema }),
	projects: defineCollection({
		loader: glob({ base: './data/projects', pattern: '*.md' }),
		schema: projectSchema
	}),
	blog: defineCollection({
		loader: glob({ base: './blogs', pattern: '*.md' }),
		schema: blogSchema
	})
};

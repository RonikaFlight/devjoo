import { db } from '../src/lib/db';
import { categories } from './seed/data/categories';

/**
 * Seed categories, skills, and synonyms into the database.
 * Idempotent: skips if categories already exist.
 */
async function main() {
  console.log('🌱 Seeding DevJoo database...');

  // Check if categories already exist
  const existingCount = await db.category.count();
  if (existingCount > 0) {
    console.log(`✅ ${existingCount} categories already exist. Skipping seed.`);
    return;
  }

  let totalSkills = 0;
  let totalSynonyms = 0;

  for (const cat of categories) {
    // Create category
    const category = await db.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        seoTitle: cat.seoTitle,
        seoDescription: cat.seoDescription,
        icon: cat.icon,
        displayOrder: cat.displayOrder,
      },
    });

    console.log(`  ✓ Category: ${cat.name} (${cat.skills.length} skills)`);

    // Create skills + synonyms
    for (let i = 0; i < cat.skills.length; i++) {
      const skill = cat.skills[i];
      const createdSkill = await db.skill.create({
        data: {
          name: skill.name,
          slug: skill.slug,
          categoryId: category.id,
          displayOrder: i,
        },
      });

      // Create synonyms
      for (const synonym of skill.synonyms) {
        await db.skillSynonym.create({
          data: {
            skillId: createdSkill.id,
            name: synonym,
            normalized: synonym
              .replace(/\s+/g, '')
              .toLowerCase(),
          },
        });
        totalSynonyms++;
      }

      totalSkills++;
    }
  }

  console.log(`\n✅ Seed complete!`);
  console.log(`   ${categories.length} categories`);
  console.log(`   ${totalSkills} skills`);
  console.log(`   ${totalSynonyms} synonyms`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

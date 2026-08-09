import { db } from '@/lib/db';
import type { PortfolioCreateInput, PortfolioUpdateInput, PortfolioReorderInput } from '@/lib/validators/portfolio';

/**
 * List portfolio items for a freelancer (ordered by displayOrder).
 */
export async function listPortfolioItems(profileId: string) {
  return db.portfolioItem.findMany({
    where: { freelancerId: profileId },
    orderBy: { displayOrder: 'asc' },
  });
}

/**
 * Get a single portfolio item by ID.
 */
export async function getPortfolioItem(id: string, profileId: string) {
  return db.portfolioItem.findFirst({
    where: { id, freelancerId: profileId },
  });
}

/**
 * Create a new portfolio item for a freelancer.
 */
export async function createPortfolioItem(profileId: string, data: PortfolioCreateInput) {
  // Enforce max 20 items per freelancer
  const count = await db.portfolioItem.count({
    where: { freelancerId: profileId },
  });
  if (count >= 20) {
    return { error: 'LIMIT_REACHED', message: 'حداکثر ۲۰ نمونه کار مجاز است.' };
  }

  const item = await db.portfolioItem.create({
    data: {
      freelancerId: profileId,
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      projectUrl: data.projectUrl,
      displayOrder: data.displayOrder ?? count,
    },
  });

  return { item };
}

/**
 * Update a portfolio item.
 */
export async function updatePortfolioItem(
  id: string,
  profileId: string,
  data: PortfolioUpdateInput
) {
  const item = await db.portfolioItem.findFirst({
    where: { id, freelancerId: profileId },
  });

  if (!item) return { error: 'NOT_FOUND', message: 'نمونه کار یافت نشد.' };

  const updated = await db.portfolioItem.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      projectUrl: data.projectUrl,
      displayOrder: data.displayOrder,
    },
  });

  return { item: updated };
}

/**
 * Delete a portfolio item.
 */
export async function deletePortfolioItem(id: string, profileId: string) {
  const item = await db.portfolioItem.findFirst({
    where: { id, freelancerId: profileId },
  });

  if (!item) return { error: 'NOT_FOUND', message: 'نمونه کار یافت نشد.' };

  await db.portfolioItem.delete({ where: { id } });
  return { success: true };
}

/**
 * Reorder portfolio items.
 */
export async function reorderPortfolioItems(
  profileId: string,
  items: PortfolioReorderInput
) {
  // Verify all items belong to this freelancer
  const itemIds = items.map((i) => i.id);
  const existing = await db.portfolioItem.findMany({
    where: { id: { in: itemIds }, freelancerId: profileId },
    select: { id: true },
  });

  const existingIds = new Set(existing.map((i) => i.id));
  for (const itemId of itemIds) {
    if (!existingIds.has(itemId)) {
      return { error: 'NOT_FOUND', message: `نمونه کار با شناسه ${itemId} یافت نشد.` };
    }
  }

  // Update display order in a transaction
  await db.$transaction(
    items.map((item) =>
      db.portfolioItem.update({
        where: { id: item.id },
        data: { displayOrder: item.displayOrder },
      })
    )
  );

  return { success: true };
}

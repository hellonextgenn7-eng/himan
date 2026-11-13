import { Product } from '../types';

/**
 * Generates a clean, readable SEO-friendly slug for a product.
 * Example: OPPO A72 -> oppo-a72
 */
export function toProductSlug(product: Product): string {
  if (!product) return '';
  const brand = (product.brand || '').toLowerCase().trim();
  const name = (product.name || product.model || '').toLowerCase().trim();

  let text = name;
  if (!name.startsWith(brand)) {
    text = `${brand} ${name}`;
  }

  const slug = text
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');

  return slug || product.id;
}

/**
 * Resolves a product by URL slug or raw product ID.
 */
export function findProductBySlugOrId(slugOrId: string, products: Product[]): Product | undefined {
  if (!slugOrId || !products || products.length === 0) return undefined;
  const decoded = decodeURIComponent(slugOrId).toLowerCase().trim().replace(/(^-|-$)/g, '');

  // 1. Direct ID match
  const byId = products.find((p) => p.id.toLowerCase() === decoded);
  if (byId) return byId;

  // 2. Direct slug match
  const bySlug = products.find((p) => toProductSlug(p) === decoded);
  if (bySlug) return bySlug;

  // 3. Match brand + model
  const byBrandModel = products.find((p) => {
    const brandModelSlug = `${p.brand}-${p.model}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return brandModelSlug === decoded;
  });
  if (byBrandModel) return byBrandModel;

  // 4. Match cleaned ID without 'pb-'
  const cleanDecoded = decoded.replace(/^pb-/, '');
  const byCleanId = products.find((p) => {
    const cleanId = p.id.toLowerCase().replace(/^pb-/, '');
    return cleanId === cleanDecoded;
  });
  if (byCleanId) return byCleanId;

  // 5. Match token subset
  const tokens = decoded.split('-').filter(Boolean);
  if (tokens.length >= 2) {
    const byTokens = products.find((p) => {
      const pText = `${p.brand} ${p.name} ${p.model}`.toLowerCase();
      return tokens.every((token) => pText.includes(token));
    });
    if (byTokens) return byTokens;
  }

  return undefined;
}

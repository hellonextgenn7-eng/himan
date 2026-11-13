import { Product } from '../types';

export const BRAND_ALIASES: Record<string, string[]> = {
  moto: ['motorola', 'moto'],
  motorola: ['motorola', 'moto'],
  apple: ['apple', 'iphone'],
  iphone: ['apple', 'iphone'],
  samsung: ['samsung', 'galaxy'],
  galaxy: ['samsung', 'galaxy'],
  oppo: ['oppo', 'reno'],
  reno: ['oppo', 'reno'],
  vivo: ['vivo'],
  realme: ['realme', 'narzo'],
  narzo: ['realme', 'narzo'],
  redmi: ['redmi', 'xiaomi', 'mi'],
  xiaomi: ['redmi', 'xiaomi', 'mi'],
  mi: ['redmi', 'xiaomi', 'mi'],
  poco: ['poco'],
  iqoo: ['iqoo'],
  google: ['google', 'pixel'],
  pixel: ['google', 'pixel'],
  oneplus: ['oneplus', '1+']
};

export function normalizeSearchString(s: string): string {
  return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Robust case-insensitive, space-insensitive, and brand/spec/budget-aware search matcher.
 * Supports model names, brand names, storage, RAM, processor, OS, 5G, and budget queries.
 */
export function matchesSearchQuery(product: Product, query: string): boolean {
  if (!query || !query.trim()) return true;

  const qClean = normalizeSearchString(query);
  const qRaw = query.toLowerCase().trim();

  // Budget query support e.g. "under 15000", "under 20k", "below 25000"
  const budgetMatch = qRaw.match(/(?:under|below|less than)\s*₹?\s*(\d+)(k)?/i);
  if (budgetMatch) {
    let limit = parseInt(budgetMatch[1], 10);
    if (budgetMatch[2] || limit < 100) limit *= 1000;
    return product.sellingPrice <= limit;
  }

  const normName = normalizeSearchString(product.name);
  const normBrand = normalizeSearchString(product.brand);
  const normModel = normalizeSearchString(product.model);
  const normCombined = `${normBrand}${normModel}`;
  const yearStr = String(product.launchYear || '');
  const normStorage = normalizeSearchString(product.storage);
  const normRam = normalizeSearchString(product.ram);
  const normProc = normalizeSearchString(product.specs?.processor || '');
  const normOs = normalizeSearchString(product.specs?.os || '');
  const normNetwork = normalizeSearchString(product.specs?.network || '');

  // 1. Direct normalized alphanumeric match across name, brand, model, storage, RAM, processor, OS, network
  if (
    normName.includes(qClean) ||
    normBrand.includes(qClean) ||
    normModel.includes(qClean) ||
    normCombined.includes(qClean) ||
    yearStr.includes(qClean) ||
    normStorage.includes(qClean) ||
    normRam.includes(qClean) ||
    normProc.includes(qClean) ||
    normOs.includes(qClean) ||
    normNetwork.includes(qClean)
  ) {
    return true;
  }

  // Check variants for storage/RAM match
  if (
    product.variants?.some(
      (v) =>
        normalizeSearchString(v.storage).includes(qClean) ||
        normalizeSearchString(v.ram).includes(qClean) ||
        normalizeSearchString(`${v.ram}${v.storage}`).includes(qClean)
    )
  ) {
    return true;
  }

  // 2. Direct raw substring match
  if (
    product.name.toLowerCase().includes(qRaw) ||
    product.brand.toLowerCase().includes(qRaw) ||
    product.model.toLowerCase().includes(qRaw) ||
    (product.launchYear && String(product.launchYear).includes(qRaw)) ||
    (product.specs && product.specs.processor && product.specs.processor.toLowerCase().includes(qRaw)) ||
    (product.specs && product.specs.os && product.specs.os.toLowerCase().includes(qRaw))
  ) {
    return true;
  }

  // 3. Brand aliases (e.g. 'moto' matches 'Motorola', 'galaxy' matches 'Samsung', 'apple' matches 'iPhone')
  for (const [alias, targets] of Object.entries(BRAND_ALIASES)) {
    if (qClean === alias || qClean.startsWith(alias) || alias.startsWith(qClean)) {
      if (targets.some((t) => normBrand.includes(t) || normModel.includes(t))) {
        return true;
      }
    }
  }

  return false;
}

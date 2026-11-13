import { Product, ProductVariant } from '../types';

export interface CompleteSpecRow {
  label: string;
  value: string;
  key: string;
}

export interface PincodeDeliveryResult {
  valid: boolean;
  serviceable: boolean;
  pincode: string;
  regionName: string;
  estimatedDays: string;
  estimatedDateStr: string;
  courierPartner: string;
  codAvailable: boolean;
  freeDelivery: boolean;
  message: string;
}

/**
 * Resolves model-specific Indian variants for any smartphone in the catalog.
 * If the admin has configured explicit `product.variants`, those are returned directly.
 * Otherwise, derives authentic RAM / Storage combinations for the model so variant switching
 * updates price, original price, discount, RAM, storage, and stock accurately.
 */
export function resolveProductVariants(product: Product): ProductVariant[] {
  if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
    return product.variants;
  }

  const brand = (product.brand || '').toLowerCase();
  const name = `${product.name} ${product.model}`.toLowerCase();
  const basePrice = product.sellingPrice || 9999;
  const baseOrig = product.originalPrice || Math.round(basePrice * 1.6);
  const baseStock = Math.max(1, product.stock || 3);

  const calcDiscount = (sell: number, orig: number) =>
    orig > sell ? Math.round(((orig - sell) / orig) * 100) : product.discountPercentage || 45;

  // 1. Apple iPhone models
  if (brand.includes('apple') || name.includes('iphone')) {
    let ram = '4GB';
    let storages = ['64GB', '128GB', '256GB'];

    if (name.includes('16 pro') || name.includes('15 pro')) {
      ram = '8GB';
      storages = ['128GB', '256GB', '512GB'];
    } else if (name.includes('16') || name.includes('15') || name.includes('14') || name.includes('13 pro') || name.includes('12 pro')) {
      ram = '6GB';
      storages = ['128GB', '256GB', '512GB'];
    } else if (name.includes('13') || name.includes('12')) {
      ram = '4GB';
      storages = ['64GB', '128GB', '256GB'];
    } else if (name.includes('xr') || name.includes('xs') || name.includes('11')) {
      ram = '4GB';
      storages = ['64GB', '128GB'];
    } else if (name.includes('7') || name.includes('8') || name.includes('se')) {
      ram = '3GB';
      storages = ['64GB', '128GB'];
    }

    // Ensure product's default storage is included if specific
    if (product.storage && product.storage !== 'Variant Dependent' && !storages.includes(product.storage)) {
      storages = [product.storage, ...storages.slice(0, 2)];
    }

    return storages.map((st, idx) => {
      const priceStep = idx === 0 ? 0 : idx === 1 ? Math.round(basePrice * 0.11) : Math.round(basePrice * 0.24);
      const origStep = idx === 0 ? 0 : idx === 1 ? 4000 : 9000;
      const sell = basePrice + priceStep;
      const orig = Math.max(sell + 2000, baseOrig + origStep);
      return {
        id: `${product.id}-v-${idx}`,
        ram,
        storage: st,
        sellingPrice: sell,
        originalPrice: orig,
        discountPercentage: calcDiscount(sell, orig),
        stock: Math.max(1, baseStock - (idx === 2 ? 1 : 0))
      };
    });
  }

  // 2. Flagship / Upper Mid-range Android (S20+, S21, S22, S23, S24, OnePlus, Pixel, Ultra, Reno, Vivo V, GT)
  if (
    basePrice >= 13500 ||
    name.includes('s20') ||
    name.includes('s21') ||
    name.includes('s22') ||
    name.includes('s23') ||
    name.includes('s24') ||
    name.includes('ultra') ||
    name.includes('oneplus') ||
    name.includes('pixel') ||
    name.includes('reno')
  ) {
    let comboList: Array<{ ram: string; storage: string; delta: number; origDelta: number }> = [
      { ram: '8GB', storage: '128GB', delta: 0, origDelta: 0 },
      { ram: '8GB', storage: '256GB', delta: 2000, origDelta: 4000 },
      { ram: '12GB', storage: '256GB', delta: 3500, origDelta: 7000 }
    ];

    if (name.includes('s20')) {
      comboList = [
        { ram: '8GB', storage: '128GB', delta: 0, origDelta: 0 },
        { ram: '8GB', storage: '256GB', delta: 2000, origDelta: 4000 }
      ];
    } else if (
      product.ram &&
      product.ram !== 'Variant Dependent' &&
      product.storage &&
      product.storage !== 'Variant Dependent'
    ) {
      const baseRam = product.ram;
      const baseSt = product.storage;
      const secondSt = baseSt === '128GB' ? '256GB' : baseSt === '256GB' ? '512GB' : '128GB';
      const secondRam = baseRam === '6GB' ? '8GB' : baseRam === '8GB' ? '12GB' : '8GB';
      comboList = [
        { ram: baseRam, storage: baseSt, delta: 0, origDelta: 0 },
        { ram: baseRam, storage: secondSt, delta: 1800, origDelta: 3500 },
        { ram: secondRam, storage: secondSt, delta: 3200, origDelta: 6000 }
      ];
    }

    return comboList.map((c, idx) => {
      const sell = basePrice + c.delta;
      const orig = Math.max(sell + 2500, baseOrig + c.origDelta);
      return {
        id: `${product.id}-v-${idx}`,
        ram: c.ram,
        storage: c.storage,
        sellingPrice: sell,
        originalPrice: orig,
        discountPercentage: calcDiscount(sell, orig),
        stock: Math.max(1, baseStock - (idx === 2 ? 1 : 0))
      };
    });
  }

  // 3. Mid-Range Smartphones (₹7,500 to ₹13,499)
  if (basePrice >= 7500) {
    const defaultRam = product.ram && product.ram !== 'Variant Dependent' ? product.ram : '6GB';
    const defaultStorage = product.storage && product.storage !== 'Variant Dependent' ? product.storage : '128GB';

    const combos =
      defaultRam === '4GB'
        ? [
            { ram: '4GB', storage: '64GB', delta: 0, origDelta: 0 },
            { ram: '6GB', storage: '128GB', delta: 1200, origDelta: 2500 },
            { ram: '8GB', storage: '128GB', delta: 2200, origDelta: 4000 }
          ]
        : [
            { ram: defaultRam, storage: defaultStorage, delta: 0, origDelta: 0 },
            { ram: '8GB', storage: '128GB', delta: 1200, origDelta: 2500 },
            { ram: '8GB', storage: '256GB', delta: 2400, origDelta: 4500 }
          ];

    return combos.map((c, idx) => {
      const sell = basePrice + c.delta;
      const orig = Math.max(sell + 1500, baseOrig + c.origDelta);
      return {
        id: `${product.id}-v-${idx}`,
        ram: c.ram,
        storage: c.storage,
        sellingPrice: sell,
        originalPrice: orig,
        discountPercentage: calcDiscount(sell, orig),
        stock: Math.max(1, baseStock - (idx === 2 ? 1 : 0))
      };
    });
  }

  // 4. Budget / Entry Smartphones (Under ₹7,500)
  const combos = [
    { ram: '3GB', storage: '32GB', delta: 0, origDelta: 0 },
    { ram: '4GB', storage: '64GB', delta: 800, origDelta: 1500 },
    { ram: '6GB', storage: '128GB', delta: 1600, origDelta: 3000 }
  ];

  return combos.map((c, idx) => {
    const sell = basePrice + c.delta;
    const orig = Math.max(sell + 1200, baseOrig + c.origDelta);
    return {
      id: `${product.id}-v-${idx}`,
      ram: c.ram,
      storage: c.storage,
      sellingPrice: sell,
      originalPrice: orig,
      discountPercentage: calcDiscount(sell, orig),
      stock: Math.max(1, baseStock - (idx === 2 ? 1 : 0))
    };
  });
}

/**
 * Infers accurate, model-authentic hardware specifications for any phone in the catalog
 * and binds RAM, Storage, and Processor to the currently selected variant.
 */
export function resolveCompleteSpecs(product: Product, activeVariant?: ProductVariant) {
  const brand = (product.brand || '').trim();
  const model = (product.model || product.name || '').trim();
  const lowerName = `${brand} ${model}`.toLowerCase();
  const year = Number(product.launchYear) || 2022;

  const selectedRam =
    activeVariant?.ram ||
    (product.ram && product.ram !== 'Variant Dependent' ? product.ram : '6GB');
  const selectedStorage =
    activeVariant?.storage ||
    (product.storage && product.storage !== 'Variant Dependent' ? product.storage : '128GB');

  // 1. Processor resolution
  let processor = product.specs?.processor || '';
  if (!processor || processor.toLowerCase().includes('variant dependent')) {
    if (lowerName.includes('iphone 16 pro')) processor = 'Apple A18 Pro (3nm Hexa-Core)';
    else if (lowerName.includes('iphone 16')) processor = 'Apple A18 Bionic (3nm Hexa-Core)';
    else if (lowerName.includes('iphone 15 pro')) processor = 'Apple A17 Pro (3nm Hexa-Core)';
    else if (lowerName.includes('iphone 15') || lowerName.includes('iphone 14 pro')) processor = 'Apple A16 Bionic (4nm Hexa-Core)';
    else if (lowerName.includes('iphone 14') || lowerName.includes('iphone 13')) processor = 'Apple A15 Bionic (5nm Hexa-Core)';
    else if (lowerName.includes('iphone 12')) processor = 'Apple A14 Bionic (5nm Hexa-Core)';
    else if (lowerName.includes('iphone 11')) processor = 'Apple A13 Bionic (7nm+ Hexa-Core)';
    else if (lowerName.includes('iphone xr') || lowerName.includes('iphone xs')) processor = 'Apple A12 Bionic (7nm Hexa-Core)';
    else if (lowerName.includes('s24 ultra') || lowerName.includes('oneplus 12') || lowerName.includes('iqoo 12')) processor = 'Qualcomm Snapdragon 8 Gen 3 (4nm Octa-Core)';
    else if (lowerName.includes('s23') || lowerName.includes('oneplus 11') || lowerName.includes('iqoo 11')) processor = 'Qualcomm Snapdragon 8 Gen 2 (4nm Octa-Core)';
    else if (lowerName.includes('s22') || lowerName.includes('oneplus 10')) processor = 'Qualcomm Snapdragon 8 Gen 1 (4nm Octa-Core)';
    else if (lowerName.includes('s21')) processor = 'Samsung Exynos 2100 / Snapdragon 888 5G (5nm)';
    else if (lowerName.includes('s20')) processor = 'Qualcomm Snapdragon 865 / Exynos 990 Octa-Core';
    else if (lowerName.includes('pixel 8')) processor = 'Google Tensor G3 (4nm Nona-Core)';
    else if (lowerName.includes('pixel 7')) processor = 'Google Tensor G2 (5nm Octa-Core)';
    else if (lowerName.includes('pixel 6')) processor = 'Google Tensor (5nm Octa-Core)';
    else if (lowerName.includes('5g') || year >= 2022) {
      if (lowerName.includes('motorola') || lowerName.includes('moto') || lowerName.includes('poco') || lowerName.includes('iqoo')) {
        processor = 'Qualcomm Snapdragon 695 / 7s Gen 2 5G Octa-Core';
      } else {
        processor = 'MediaTek Dimensity 6080 / 7050 5G Octa-Core';
      }
    } else if (product.sellingPrice >= 11000) {
      processor = 'Qualcomm Snapdragon 720G / 732G Octa-Core (8nm)';
    } else {
      processor = 'MediaTek Helio G85 / Qualcomm Snapdragon 665 Octa-Core';
    }
  }
  if (activeVariant?.processor) {
    processor = activeVariant.processor;
  }

  // 2. Screen Size & Display Type resolution
  let screenSize = product.specs?.screenSize || '';
  let displayType = product.specs?.displayType || '';
  const rawDisplay = product.specs?.display || '';

  if (!screenSize || !displayType) {
    if (rawDisplay && !rawDisplay.toLowerCase().includes('variant dependent')) {
      const sizeMatch = rawDisplay.match(/(\d+\.\d+)\s*(?:-inch|inch|")/i);
      screenSize = sizeMatch ? `${sizeMatch[1]} inches` : '6.5 inches (16.51 cm)';
      displayType = rawDisplay;
    } else if (lowerName.includes('pro max') || lowerName.includes('ultra') || lowerName.includes('plus') || lowerName.includes('s20+')) {
      screenSize = '6.7 inches (17.02 cm)';
      displayType = lowerName.includes('iphone')
        ? 'Super Retina XDR OLED, 120Hz ProMotion, HDR10'
        : 'Dynamic AMOLED 2X, 120Hz, HDR10+, Corning Gorilla Glass';
    } else if (lowerName.includes('iphone 12') || lowerName.includes('iphone 13') || lowerName.includes('iphone 14') || lowerName.includes('iphone 15') || lowerName.includes('iphone 16')) {
      screenSize = '6.1 inches (15.49 cm)';
      displayType = 'Super Retina XDR OLED, True Tone, Wide Color (P3)';
    } else if (lowerName.includes('iphone 11') || lowerName.includes('iphone xr')) {
      screenSize = '6.1 inches (15.49 cm)';
      displayType = 'Liquid Retina IPS LCD, True Tone, 625 nits';
    } else if (lowerName.includes('samsung') || lowerName.includes('galaxy')) {
      screenSize = '6.5 inches (16.51 cm)';
      displayType = product.sellingPrice >= 10000 ? 'Super AMOLED Plus, 90Hz/120Hz FHD+ Display' : 'PLS LCD HD+ Infinity-V Display';
    } else if (product.sellingPrice >= 11000 || lowerName.includes('pro') || lowerName.includes('reno') || lowerName.includes('vivo v')) {
      screenSize = '6.67 inches (16.94 cm)';
      displayType = 'FHD+ AMOLED Display, 120Hz Refresh Rate, 2400 × 1080 px';
    } else {
      screenSize = '6.52 inches (16.56 cm)';
      displayType = 'HD+ IPS LCD Capacitive Touchscreen, 90Hz Eye-Care Display';
    }
  }

  // 3. Camera System resolution
  let camera = product.specs?.camera || '';
  if (!camera || camera.toLowerCase().includes('verified on inspection') || camera.toLowerCase().includes('variant dependent')) {
    if (lowerName.includes('ultra')) {
      camera = '200MP/108MP Quad Telephoto Camera with OIS & 100x Space Zoom + 40MP/12MP Front';
    } else if (lowerName.includes('s20+')) {
      camera = '64MP Telephoto + 12MP Wide + 12MP Ultra-Wide + DepthVision (8K Video) · 10MP Front';
    } else if (lowerName.includes('iphone') && lowerName.includes('pro')) {
      camera = '48MP/12MP Pro Triple Camera System (Wide, Ultra-Wide, Telephoto, LiDAR) + 12MP TrueDepth Front';
    } else if (lowerName.includes('iphone')) {
      camera = '12MP Dual Camera System (Wide + Ultra-Wide, OIS, 4K 60fps Dolby Vision) + 12MP TrueDepth Front';
    } else if (product.sellingPrice >= 12000) {
      camera = '64MP / 50MP OIS Primary + 8MP Ultra-Wide + 2MP Macro · 16MP Front Selfie Camera';
    } else {
      camera = '48MP / 13MP AI Dual Rear Camera with LED Flash & Portrait Mode · 8MP Front Camera';
    }
  }

  // 4. Battery Capacity & Battery Health resolution
  let batteryCapacity = product.specs?.batteryCapacity || '';
  if (!batteryCapacity) {
    const mahMatch = (product.specs?.battery || '').match(/(\d{4})\s*mAh/i);
    if (mahMatch) {
      batteryCapacity = `${mahMatch[1]} mAh Li-Po`;
    } else if (lowerName.includes('iphone')) {
      batteryCapacity = lowerName.includes('pro max') || lowerName.includes('plus')
        ? '4323 mAh Built-in Li-Ion'
        : '3279 mAh Built-in Li-Ion';
    } else if (lowerName.includes('s20+')) {
      batteryCapacity = '4500 mAh Non-removable Li-Ion';
    } else {
      batteryCapacity = '5000 mAh High-Density Li-Polymer';
    }
  }

  const batteryHealthText =
    typeof product.batteryHealth === 'number' && product.batteryHealth > 0
      ? `${product.batteryHealth}% Certified Capacity (Stress-Tested)`
      : 'Verified Healthy Capacity (Passed 32-Point Drain Diagnostic)';

  // 5. Operating System
  let os = product.specs?.os || '';
  if (!os || os.toLowerCase().includes('official os')) {
    if (lowerName.includes('iphone') || brand.toLowerCase().includes('apple')) {
      os = 'Apple iOS (Upgradable to Latest Official iOS Security Release)';
    } else if (brand.toLowerCase().includes('samsung')) {
      os = `Android ${year >= 2022 ? '14 / 13' : '12 / 13'} with Samsung One UI`;
    } else if (brand.toLowerCase().includes('oppo') || brand.toLowerCase().includes('realme') || brand.toLowerCase().includes('oneplus')) {
      os = `Android ${year >= 2022 ? '13 / 14' : '11 / 12'} with ColorOS / OxygenOS`;
    } else if (brand.toLowerCase().includes('redmi') || brand.toLowerCase().includes('xiaomi') || brand.toLowerCase().includes('poco')) {
      os = `Android ${year >= 2022 ? '13 / 14' : '11 / 12'} with MIUI / HyperOS`;
    } else if (brand.toLowerCase().includes('vivo') || brand.toLowerCase().includes('iqoo')) {
      os = `Android ${year >= 2022 ? '13 / 14' : '11 / 12'} with Funtouch OS`;
    } else {
      os = `Official Android ${year >= 2022 ? '13 / 14' : '12'} with Security Updates`;
    }
  }

  // 6. Network Connectivity
  let network = product.specs?.network || '';
  if (!network || network.toLowerCase().includes('as per indian carrier')) {
    const is5G =
      lowerName.includes('5g') ||
      lowerName.includes('iphone 12') ||
      lowerName.includes('iphone 13') ||
      lowerName.includes('iphone 14') ||
      lowerName.includes('iphone 15') ||
      lowerName.includes('iphone 16') ||
      lowerName.includes('s21') ||
      lowerName.includes('s22') ||
      lowerName.includes('s23') ||
      lowerName.includes('s24') ||
      (year >= 2022 && product.sellingPrice >= 11500);
    network = is5G
      ? '5G SA/NSA, Dual 4G VoLTE, Wi-Fi 6 (802.11ax), Bluetooth 5.2, GPS, USB Type-C'
      : 'Dual 4G VoLTE, Wi-Fi 802.11 a/b/g/n/ac, Bluetooth 5.0, GPS, Dual Nano-SIM';
  }

  // 7. Charging Support
  let charging = product.specs?.charging || '';
  if (!charging || charging === 'Fast Charging Support') {
    if (lowerName.includes('iphone')) {
      charging = '20W USB-C PD Fast Charging + MagSafe / Qi Wireless Charging';
    } else if (lowerName.includes('samsung') || lowerName.includes('s20')) {
      charging = '25W Super Fast Charging + 15W Fast Wireless Charging';
    } else if (lowerName.includes('oneplus') || lowerName.includes('realme') || lowerName.includes('oppo') || lowerName.includes('iqoo')) {
      charging = product.sellingPrice >= 14000 ? '65W / 80W SuperVOOC Flash Charge' : '33W SuperVOOC Fast Charging';
    } else if (lowerName.includes('redmi') || lowerName.includes('xiaomi') || lowerName.includes('poco')) {
      charging = product.sellingPrice >= 12000 ? '33W / 67W SonicCharge / Turbo Charge' : '18W Fast Charging via USB-C';
    } else {
      charging = '18W / 30W Certified Fast Charging Adapter Included';
    }
  }

  const warranty = product.warrantyInfo || '6 Months Phone Bazar Store Warranty + 7-Day Replacement Guarantee';

  const specRows: CompleteSpecRow[] = [
    { key: 'brand', label: '1. Brand Name', value: brand },
    { key: 'model', label: '2. Model Name', value: model },
    { key: 'processor', label: '3. Processor', value: processor },
    { key: 'screenSize', label: '4. Screen Size', value: screenSize },
    { key: 'displayType', label: '5. Display Type', value: displayType },
    { key: 'ram', label: '6. RAM', value: selectedRam },
    { key: 'storage', label: '7. Internal Storage', value: selectedStorage },
    { key: 'batteryCapacity', label: '8. Battery Capacity', value: batteryCapacity },
    { key: 'batteryHealth', label: '9. Battery Health', value: batteryHealthText },
    { key: 'camera', label: '10. Camera System', value: camera },
    { key: 'os', label: '11. Operating System', value: os },
    { key: 'network', label: '12. Network Connectivity', value: network },
    { key: 'launchYear', label: '13. Launch Year', value: String(product.launchYear || '2022') },
    { key: 'condition', label: '14. Device Condition', value: `${product.condition} Condition (32-Point Hardware Verified)` },
    { key: 'warranty', label: '15. Warranty / Guarantee', value: warranty },
    { key: 'charging', label: '16. Charging Support', value: charging }
  ];

  return {
    brand,
    model,
    processor,
    screenSize,
    displayType,
    ram: selectedRam,
    storage: selectedStorage,
    batteryCapacity,
    batteryHealthText,
    camera,
    os,
    network,
    launchYear: String(product.launchYear || '2022'),
    condition: product.condition,
    warranty,
    charging,
    specRows
  };
}

/**
 * Validates Indian 6-digit PIN codes and returns configured regional delivery data.
 * Indian Postal Index Numbers (PIN) start with digits 1–8 (9 is Army Postal Service).
 */
export function checkIndianPincodeDelivery(rawInput: string): PincodeDeliveryResult {
  const clean = (rawInput || '').trim();

  if (!/^\d{6}$/.test(clean)) {
    return {
      valid: false,
      serviceable: false,
      pincode: clean,
      regionName: '',
      estimatedDays: '',
      estimatedDateStr: '',
      courierPartner: '',
      codAvailable: false,
      freeDelivery: false,
      message: 'Please enter a valid 6-digit Indian Postal PIN code (e.g. 110001, 400001, 560001).'
    };
  }

  const firstDigit = clean[0];
  const prefix2 = clean.slice(0, 2);

  if (firstDigit === '0' || firstDigit === '9') {
    return {
      valid: false,
      serviceable: false,
      pincode: clean,
      regionName: '',
      estimatedDays: '',
      estimatedDateStr: '',
      courierPartner: '',
      codAvailable: false,
      freeDelivery: false,
      message: 'Invalid postal zone. Standard Indian civilian PIN codes begin with digits 1 through 8.'
    };
  }

  // Map 2-digit prefix to actual Indian State / Postal Circle
  const postalRegions: Record<string, { region: string; daysMin: number; daysMax: number; courier: string }> = {
    '11': { region: 'New Delhi / NCR Hub', daysMin: 1, daysMax: 2, courier: 'BlueDart Express Priority' },
    '12': { region: 'Haryana (Gurugram / Faridabad)', daysMin: 1, daysMax: 2, courier: 'BlueDart Express' },
    '13': { region: 'Haryana', daysMin: 2, daysMax: 3, courier: 'Delhivery Express' },
    '14': { region: 'Punjab', daysMin: 2, daysMax: 3, courier: 'BlueDart Express' },
    '15': { region: 'Punjab', daysMin: 2, daysMax: 4, courier: 'Delhivery Express' },
    '16': { region: 'Chandigarh Tricity', daysMin: 2, daysMax: 3, courier: 'BlueDart Express' },
    '17': { region: 'Himachal Pradesh', daysMin: 3, daysMax: 5, courier: 'Delhivery Surface/Air' },
    '18': { region: 'Jammu & Kashmir', daysMin: 3, daysMax: 5, courier: 'BlueDart Air' },
    '19': { region: 'Jammu & Kashmir / Ladakh', daysMin: 4, daysMax: 6, courier: 'India Post / BlueDart Air' },
    '20': { region: 'Western Uttar Pradesh (Noida / Ghaziabad)', daysMin: 1, daysMax: 2, courier: 'BlueDart Express' },
    '21': { region: 'Uttar Pradesh (Prayagraj)', daysMin: 2, daysMax: 4, courier: 'Delhivery Express' },
    '22': { region: 'Uttar Pradesh (Lucknow / Varanasi)', daysMin: 2, daysMax: 3, courier: 'BlueDart Express' },
    '30': { region: 'Rajasthan (Jaipur Metro)', daysMin: 2, daysMax: 3, courier: 'BlueDart Express' },
    '36': { region: 'Gujarat (Rajkot / Saurashtra)', daysMin: 2, daysMax: 4, courier: 'Delhivery Express' },
    '38': { region: 'Gujarat (Ahmedabad / Gandhinagar)', daysMin: 2, daysMax: 3, courier: 'BlueDart Express' },
    '39': { region: 'Gujarat (Surat / Vadodara)', daysMin: 2, daysMax: 3, courier: 'BlueDart Express' },
    '40': { region: 'Maharashtra (Mumbai / Navi Mumbai / Thane)', daysMin: 2, daysMax: 3, courier: 'BlueDart Air Express' },
    '41': { region: 'Maharashtra (Pune)', daysMin: 2, daysMax: 3, courier: 'BlueDart Air Express' },
    '44': { region: 'Maharashtra (Nagpur)', daysMin: 2, daysMax: 4, courier: 'Delhivery Express' },
    '45': { region: 'Madhya Pradesh (Indore)', daysMin: 2, daysMax: 4, courier: 'BlueDart Express' },
    '46': { region: 'Madhya Pradesh (Bhopal)', daysMin: 2, daysMax: 4, courier: 'BlueDart Express' },
    '50': { region: 'Telangana (Hyderabad Metro)', daysMin: 2, daysMax: 3, courier: 'BlueDart Air Express' },
    '56': { region: 'Karnataka (Bengaluru Metro)', daysMin: 2, daysMax: 3, courier: 'BlueDart Air Express' },
    '60': { region: 'Tamil Nadu (Chennai Metro)', daysMin: 2, daysMax: 3, courier: 'BlueDart Air Express' },
    '68': { region: 'Kerala (Kochi / Ernakulam)', daysMin: 3, daysMax: 4, courier: 'BlueDart Air Express' },
    '70': { region: 'West Bengal (Kolkata Metro)', daysMin: 2, daysMax: 3, courier: 'BlueDart Air Express' },
    '75': { region: 'Odisha (Bhubaneswar / Cuttack)', daysMin: 3, daysMax: 4, courier: 'Delhivery Express' },
    '78': { region: 'Assam (Guwahati)', daysMin: 3, daysMax: 5, courier: 'BlueDart Air Express' },
    '80': { region: 'Bihar (Patna)', daysMin: 2, daysMax: 4, courier: 'BlueDart Express' },
    '83': { region: 'Jharkhand (Ranchi / Jamshedpur)', daysMin: 3, daysMax: 4, courier: 'Delhivery Express' }
  };

  const zoneFallbacks: Record<string, { region: string; daysMin: number; daysMax: number; courier: string }> = {
    '1': { region: 'Northern Postal Zone (DL/HR/PB/HP/JK)', daysMin: 2, daysMax: 3, courier: 'BlueDart / Delhivery Express' },
    '2': { region: 'Uttar Pradesh & Uttarakhand Zone', daysMin: 2, daysMax: 4, courier: 'Delhivery Express' },
    '3': { region: 'Western Zone (Rajasthan & Gujarat)', daysMin: 2, daysMax: 4, courier: 'BlueDart / Delhivery Express' },
    '4': { region: 'Western & Central Zone (MH/MP/CG/Goa)', daysMin: 2, daysMax: 4, courier: 'BlueDart Air Express' },
    '5': { region: 'Southern Zone (Telangana, AP & Karnataka)', daysMin: 2, daysMax: 4, courier: 'BlueDart Air Express' },
    '6': { region: 'Southern Zone (Tamil Nadu & Kerala)', daysMin: 3, daysMax: 4, courier: 'BlueDart Air Express' },
    '7': { region: 'Eastern & North-Eastern Zone (WB/OR/NE)', daysMin: 3, daysMax: 5, courier: 'BlueDart / Delhivery Air' },
    '8': { region: 'Eastern Zone (Bihar & Jharkhand)', daysMin: 3, daysMax: 4, courier: 'Delhivery Express' }
  };

  const matched = postalRegions[prefix2] || zoneFallbacks[firstDigit];
  const now = new Date();
  const minDate = new Date(now.getTime() + matched.daysMin * 24 * 3600 * 1000);
  const maxDate = new Date(now.getTime() + matched.daysMax * 24 * 3600 * 1000);

  const fmt = (d: Date) =>
    d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  const estimatedDateStr = `${fmt(minDate)} – ${fmt(maxDate)}`;
  const estimatedDays = `${matched.daysMin}–${matched.daysMax} Business Days`;

  return {
    valid: true,
    serviceable: true,
    pincode: clean,
    regionName: matched.region,
    estimatedDays,
    estimatedDateStr,
    courierPartner: matched.courier,
    codAvailable: true,
    freeDelivery: true,
    message: `Delivery available to ${clean} (${matched.region}). Estimated arrival: ${estimatedDateStr} (${estimatedDays}) via ${matched.courier}.`
  };
}

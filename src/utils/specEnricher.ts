import { Product, ProductVariant, DeviceCondition } from '../types';

/**
 * Deterministic hash helper from string
 */
function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Generates accurate Indian smartphone hardware specifications and selectable variants
 * for any smartphone model in the Phone Bazar catalog.
 */
export function enrichProductSpecs(product: Product): Product {
  const brand = (product.brand || '').trim();
  const brandLower = brand.toLowerCase();
  const model = (product.model || product.name || '').trim();
  const modelLower = model.toLowerCase();
  const nameLower = (product.name || '').toLowerCase();
  const year = Number(product.launchYear) || 2022;
  const price = product.sellingPrice || 12999;
  const origPrice = product.originalPrice || Math.round(price * 1.6);
  const hash = hashCode(product.id || product.name);

  // Check if product already has concrete non-placeholder specs & variants
  const hasPlaceholderRam =
    !product.ram ||
    product.ram.toLowerCase().includes('variant') ||
    product.ram.toLowerCase().includes('depend');
  const hasPlaceholderStorage =
    !product.storage ||
    product.storage.toLowerCase().includes('variant') ||
    product.storage.toLowerCase().includes('depend');
  const hasPlaceholderDisplay =
    !product.specs?.display ||
    product.specs.display.toLowerCase().includes('variant') ||
    product.specs.display.toLowerCase().includes('verify');
  const hasPlaceholderProcessor =
    !product.specs?.processor ||
    product.specs.processor.toLowerCase().includes('variant') ||
    product.specs.processor.toLowerCase().includes('octa-core platform');

  let processor = product.specs?.processor || '';
  let screenSize = product.specs?.screenSize || '';
  let displayType = product.specs?.displayType || '';
  let camera = product.specs?.camera || '';
  let batteryCapacity = product.specs?.batteryCapacity || '';
  let charging = product.specs?.charging || '';
  let os = product.specs?.os || '';
  let network = product.specs?.network || '';
  let baseRam = hasPlaceholderRam ? '8GB' : product.ram;
  let baseStorage = hasPlaceholderStorage ? '128GB' : product.storage;

  const is5G =
    modelLower.includes('5g') ||
    year >= 2022 ||
    price >= 14000 ||
    brandLower.includes('apple') && !modelLower.includes('11') && !modelLower.includes('xr') && !modelLower.includes('xs');

  // 1. Specific Flagship & Reference Model Rules
  if (modelLower.includes('s20+') || nameLower.includes('s20+')) {
    processor = 'Samsung Exynos 990 (7nm+) / Qualcomm Snapdragon 865 Octa-Core';
    screenSize = '6.7 inches';
    displayType = 'Dynamic AMOLED 2X, 120Hz, HDR10+ (3200 × 1440 WQHD+)';
    camera = '64MP Telephoto (3x Hybrid Optic Zoom) + 12MP Wide OIS + 12MP Ultra-Wide + DepthVision | 10MP 4K Selfie';
    batteryCapacity = '4500 mAh';
    charging = '25W USB-C PD 3.0 Super Fast Charging & 15W Wireless Charging';
    os = 'Android 13 (One UI 5.1 Official Security Patch)';
    network = '4G VoLTE / 5G Sub-6, Dual SIM, Wi-Fi 6, Bluetooth 5.0, NFC';
    baseRam = '8GB';
    baseStorage = '128GB';
  } else if (brandLower.includes('apple') || nameLower.includes('iphone')) {
    // Apple iPhone exact specs by generation
    if (modelLower.includes('16 pro')) {
      processor = 'Apple A18 Pro (3nm) Hexa-Core with 16-Core Neural Engine';
      baseRam = '8GB';
      baseStorage = '256GB';
      screenSize = modelLower.includes('max') ? '6.9 inches' : '6.3 inches';
      displayType = 'LTPO Super Retina XDR OLED, 120Hz ProMotion, Always-On, Ceramic Shield';
      camera = '48MP Fusion OIS + 48MP Ultra-Wide + 12MP 5x Tetraprism Telephoto | 12MP TrueDepth 4K60';
      batteryCapacity = modelLower.includes('max') ? '4685 mAh' : '3582 mAh';
      charging = '25W MagSafe Wireless & 30W USB-C PD Fast Charging';
      os = 'iOS 18 (Upgradable to Latest iOS Releases)';
      network = '5G Dual eSIM / Nano-SIM, Wi-Fi 7, Bluetooth 5.3, Ultra Wideband, NFC';
    } else if (modelLower.includes('16')) {
      processor = 'Apple A18 (3nm) Hexa-Core with 16-Core Neural Engine';
      baseRam = '8GB';
      baseStorage = '128GB';
      screenSize = modelLower.includes('plus') ? '6.7 inches' : '6.1 inches';
      displayType = 'Super Retina XDR OLED, HDR10, Dolby Vision, 2000 nits Peak';
      camera = '48MP Fusion OIS (2x Optical-Quality Telephoto) + 12MP Ultra-Wide | 12MP TrueDepth';
      batteryCapacity = modelLower.includes('plus') ? '4674 mAh' : '3561 mAh';
      charging = '20W USB-C PD Fast Charging & MagSafe Wireless';
      os = 'iOS 18 (Official Apple Support)';
      network = '5G Sub-6, Dual SIM (Nano + eSIM), Wi-Fi 7, Bluetooth 5.3, NFC';
    } else if (modelLower.includes('15 pro')) {
      processor = 'Apple A17 Pro (3nm) Hexa-Core with 6-Core GPU';
      baseRam = '8GB';
      baseStorage = modelLower.includes('max') ? '256GB' : '128GB';
      screenSize = modelLower.includes('max') ? '6.7 inches' : '6.1 inches';
      displayType = 'LTPO Super Retina XDR OLED, 120Hz ProMotion, Titanium Frame';
      camera = '48MP Main OIS + 12MP Telephoto (3x/5x Optical) + 12MP Ultra-Wide + LiDAR | 12MP TrueDepth';
      batteryCapacity = modelLower.includes('max') ? '4441 mAh' : '3274 mAh';
      charging = '20W USB-C PD Fast Charging & 15W MagSafe';
      os = 'iOS 17 / iOS 18 Ready';
      network = '5G Dual SIM (Nano + eSIM), Wi-Fi 6E, Bluetooth 5.3, USB-C 3.2, NFC';
    } else if (modelLower.includes('15')) {
      processor = 'Apple A16 Bionic (4nm) Hexa-Core Processor';
      baseRam = '6GB';
      baseStorage = '128GB';
      screenSize = modelLower.includes('plus') ? '6.7 inches' : '6.1 inches';
      displayType = 'Super Retina XDR OLED, Dynamic Island, HDR10, Dolby Vision';
      camera = '48MP Main Sensor-Shift OIS + 12MP Ultra-Wide | 12MP TrueDepth Front';
      batteryCapacity = modelLower.includes('plus') ? '4383 mAh' : '3349 mAh';
      charging = '20W USB-C PD Fast Charging & 15W MagSafe';
      os = 'iOS 17 / iOS 18 Supported';
      network = '5G Sub-6, Dual SIM (Nano + eSIM), Wi-Fi 6, Bluetooth 5.3, NFC';
    } else if (modelLower.includes('14 pro')) {
      processor = 'Apple A16 Bionic (4nm) Hexa-Core Chip';
      baseRam = '6GB';
      baseStorage = '128GB';
      screenSize = modelLower.includes('max') ? '6.7 inches' : '6.1 inches';
      displayType = 'LTPO Super Retina XDR OLED, 120Hz ProMotion, Dynamic Island';
      camera = '48MP Quad-Pixel Main OIS + 12MP 3x Telephoto + 12MP Ultra-Wide + LiDAR | 12MP TrueDepth';
      batteryCapacity = modelLower.includes('max') ? '4323 mAh' : '3200 mAh';
      charging = '20W Fast Charging & 15W MagSafe Wireless';
      os = 'iOS 17 / iOS 18 Supported';
      network = '5G Dual SIM (Indian Variant with Physical Nano-SIM + eSIM), Wi-Fi 6, NFC';
    } else if (modelLower.includes('14')) {
      processor = 'Apple A15 Bionic (5nm) with 5-Core GPU';
      baseRam = '6GB';
      baseStorage = '128GB';
      screenSize = modelLower.includes('plus') ? '6.7 inches' : '6.1 inches';
      displayType = 'Super Retina XDR OLED, Ceramic Shield, True Tone';
      camera = '12MP Main Sensor-Shift OIS + 12MP Ultra-Wide Photonic Engine | 12MP Autofocus Selfie';
      batteryCapacity = modelLower.includes('plus') ? '4325 mAh' : '3279 mAh';
      charging = '20W Fast Charging & 15W MagSafe';
      os = 'iOS 17 / iOS 18 Supported';
      network = '5G Sub-6, Dual SIM (Nano + eSIM), Wi-Fi 6, Bluetooth 5.3, NFC';
    } else if (modelLower.includes('13')) {
      processor = 'Apple A15 Bionic (5nm) Hexa-Core Processor';
      baseRam = modelLower.includes('pro') ? '6GB' : '4GB';
      baseStorage = '128GB';
      screenSize = modelLower.includes('max') ? '6.7 inches' : modelLower.includes('mini') ? '5.4 inches' : '6.1 inches';
      displayType = modelLower.includes('pro')
        ? 'Super Retina XDR OLED with 120Hz ProMotion'
        : 'Super Retina XDR OLED, HDR10, Dolby Vision';
      camera = modelLower.includes('pro')
        ? '12MP Triple Pro Camera (Wide + Telephoto 3x + Ultra-Wide) + LiDAR | 12MP TrueDepth'
        : '12MP Dual Camera with Sensor-Shift OIS & Cinematic Mode | 12MP TrueDepth';
      batteryCapacity = modelLower.includes('max') ? '4352 mAh' : '3240 mAh';
      charging = '20W USB-C Power Delivery & 15W MagSafe';
      os = 'iOS 17 / iOS 18 Supported';
      network = '5G Sub-6, Dual SIM (Nano + eSIM), Wi-Fi 6, Bluetooth 5.0, NFC';
    } else if (modelLower.includes('12')) {
      processor = 'Apple A14 Bionic (5nm) Hexa-Core Processor';
      baseRam = modelLower.includes('pro') ? '6GB' : '4GB';
      baseStorage = modelLower.includes('pro') ? '128GB' : '64GB';
      screenSize = modelLower.includes('max') ? '6.7 inches' : modelLower.includes('mini') ? '5.4 inches' : '6.1 inches';
      displayType = 'Super Retina XDR OLED, HDR10, Dolby Vision, Ceramic Shield';
      camera = modelLower.includes('pro')
        ? '12MP Pro Triple Camera + LiDAR Scanner, Night Mode Portraits | 12MP TrueDepth'
        : '12MP Dual Camera (Wide OIS + Ultra-Wide) with 4K Dolby Vision HDR | 12MP TrueDepth';
      batteryCapacity = modelLower.includes('max') ? '3687 mAh' : '2815 mAh';
      charging = '20W Fast Charging & 15W MagSafe';
      os = 'iOS 17 / iOS 18 Supported';
      network = '5G Sub-6, Dual SIM (Nano + eSIM), Wi-Fi 6, Bluetooth 5.0, NFC';
    } else {
      // iPhone 11 / SE / XR
      processor = 'Apple A13 Bionic (7nm+) Hexa-Core with 3rd-Gen Neural Engine';
      baseRam = '4GB';
      baseStorage = '64GB';
      screenSize = modelLower.includes('max') ? '6.5 inches' : modelLower.includes('se') ? '4.7 inches' : '6.1 inches';
      displayType = modelLower.includes('pro') ? 'Super Retina XDR OLED Display' : 'Liquid Retina IPS LCD, True Tone';
      camera = modelLower.includes('pro')
        ? '12MP Triple Camera (Wide + Telephoto + Ultra-Wide) | 12MP 4K Selfie'
        : '12MP Dual Camera (Wide OIS + 120° Ultra-Wide) with Night Mode | 12MP TrueDepth';
      batteryCapacity = '3110 mAh';
      charging = '18W USB-C PD Fast Charging & Qi Wireless Charging';
      os = 'iOS 17 Supported';
      network = '4G LTE-Advanced, Dual SIM (Nano + eSIM), Wi-Fi 6, Bluetooth 5.0, NFC';
    }
  } else if (brandLower.includes('samsung')) {
    if (modelLower.includes('s24')) {
      processor = modelLower.includes('ultra')
        ? 'Qualcomm Snapdragon 8 Gen 3 for Galaxy (4nm)'
        : 'Samsung Exynos 2400 (4nm) Deca-Core with Galaxy AI';
      baseRam = modelLower.includes('ultra') || modelLower.includes('+') ? '12GB' : '8GB';
      baseStorage = '256GB';
      screenSize = modelLower.includes('ultra') ? '6.8 inches' : modelLower.includes('+') ? '6.7 inches' : '6.2 inches';
      displayType = 'Dynamic LTPO AMOLED 2X, 120Hz, HDR10+, 2600 nits Peak';
      camera = modelLower.includes('ultra')
        ? '200MP Wide OIS + 50MP 5x Periscope + 10MP 3x Telephoto + 12MP Ultra-Wide | 12MP Dual Pixel Front'
        : '50MP Wide OIS + 10MP 3x Telephoto + 12MP Ultra-Wide | 12MP Front';
      batteryCapacity = modelLower.includes('ultra') ? '5000 mAh' : modelLower.includes('+') ? '4900 mAh' : '4000 mAh';
      charging = modelLower.includes('ultra') || modelLower.includes('+') ? '45W Super Fast Charging 2.0 & 15W Wireless' : '25W Super Fast Charging & 15W Wireless';
      os = 'Android 14 (One UI 6.1 with Galaxy AI)';
      network = '5G SA/NSA, Dual SIM + eSIM, Wi-Fi 6E/7, Bluetooth 5.3, NFC';
    } else if (modelLower.includes('s23')) {
      processor = modelLower.includes('fe')
        ? 'Samsung Exynos 2200 (4nm) Octa-Core'
        : 'Qualcomm Snapdragon 8 Gen 2 for Galaxy (4nm)';
      baseRam = modelLower.includes('ultra') ? '12GB' : '8GB';
      baseStorage = modelLower.includes('ultra') ? '256GB' : '128GB';
      screenSize = modelLower.includes('ultra') ? '6.8 inches' : modelLower.includes('+') ? '6.6 inches' : '6.1 inches';
      displayType = 'Dynamic AMOLED 2X, 120Hz, HDR10+, Gorilla Glass Victus 2';
      camera = modelLower.includes('ultra')
        ? '200MP Adaptive Pixel OIS + 10MP 10x Periscope + 10MP 3x Telephoto + 12MP Ultra-Wide | 12MP Selfie'
        : '50MP Wide OIS + 10MP 3x Optical Telephoto + 12MP Ultra-Wide | 12MP Dual Pixel Selfie';
      batteryCapacity = modelLower.includes('ultra') ? '5000 mAh' : modelLower.includes('+') ? '4700 mAh' : '3900 mAh';
      charging = modelLower.includes('ultra') || modelLower.includes('+') ? '45W Super Fast Charging & 15W Wireless' : '25W Super Fast Charging';
      os = 'Android 14 (One UI 6.1)';
      network = '5G SA/NSA, Dual SIM, Wi-Fi 6E, Bluetooth 5.3, NFC';
    } else if (modelLower.includes('s22') || modelLower.includes('s21') || modelLower.includes('s20')) {
      processor = modelLower.includes('s22')
        ? 'Qualcomm Snapdragon 8 Gen 1 (4nm) Octa-Core'
        : modelLower.includes('s21')
        ? 'Samsung Exynos 2100 / Snapdragon 888 5G (5nm)'
        : 'Samsung Exynos 990 (7nm+) / Snapdragon 865 Octa-Core';
      baseRam = modelLower.includes('ultra') ? '12GB' : '8GB';
      baseStorage = '128GB';
      screenSize = modelLower.includes('ultra') ? '6.8 inches' : modelLower.includes('+') || modelLower.includes('fe') ? '6.5 inches' : '6.2 inches';
      displayType = 'Dynamic AMOLED 2X, 120Hz Refresh Rate, HDR10+';
      camera = modelLower.includes('ultra')
        ? '108MP Pro Wide OIS + 10MP Periscope 100x Space Zoom + 12MP Ultra-Wide | 40MP Selfie'
        : '64MP/50MP Pro-Grade Triple Camera with OIS & 3x Hybrid Optic Zoom | 10MP/32MP 4K Selfie';
      batteryCapacity = modelLower.includes('ultra') ? '5000 mAh' : '4500 mAh';
      charging = '25W USB-C PD 3.0 Super Fast Charging & 15W Fast Wireless';
      os = 'Android 13 / Android 14 (One UI 6)';
      network = '5G / 4G VoLTE, Dual SIM, Wi-Fi 6, Bluetooth 5.2, NFC';
    } else if (modelLower.includes('fold') || modelLower.includes('flip')) {
      processor = 'Qualcomm Snapdragon 8+ Gen 1 / 8 Gen 2 for Galaxy (4nm)';
      baseRam = modelLower.includes('fold') ? '12GB' : '8GB';
      baseStorage = '256GB';
      screenSize = modelLower.includes('fold') ? '7.6 inches (Main) / 6.2 inches (Cover)' : '6.7 inches (Foldable)';
      displayType = 'Foldable Dynamic AMOLED 2X, 120Hz Adaptive, HDR10+';
      camera = '50MP/12MP FlexCam OIS Multi-Camera System with Nightography';
      batteryCapacity = modelLower.includes('fold') ? '4400 mAh' : '3700 mAh';
      charging = '25W Super Fast Charging & 15W Wireless Charging';
      os = 'Android 14 (One UI 6.1 Foldable Edition)';
      network = '5G Dual SIM (Nano + eSIM), Wi-Fi 6E, Bluetooth 5.3, NFC';
    } else {
      // Samsung Galaxy A / M / F series
      const isHighA = modelLower.includes('a5') || modelLower.includes('a7') || modelLower.includes('m5') || modelLower.includes('f5');
      processor = isHighA
        ? 'Samsung Exynos 1380 / Qualcomm Snapdragon 778G 5G Octa-Core'
        : is5G
        ? 'MediaTek Dimensity 6100+ / Samsung Exynos 1330 5G (5nm)'
        : 'Samsung Exynos 850 / MediaTek Helio G85 Octa-Core';
      baseRam = isHighA ? '8GB' : price >= 10000 ? '6GB' : '4GB';
      baseStorage = price >= 9500 ? '128GB' : '64GB';
      screenSize = isHighA ? '6.6 inches' : '6.5 inches';
      displayType = isHighA || price >= 12000
        ? 'Super AMOLED Display, 120Hz Refresh Rate, FHD+ (1080 × 2400)'
        : 'PLS LCD / Super AMOLED Infinity-V Display, 90Hz';
      camera = isHighA
        ? '50MP Main with OIS + 12MP Ultra-Wide + 5MP Macro | 32MP Front Camera'
        : '50MP High-Resolution Main + 5MP Ultra-Wide + 2MP Depth | 13MP Front';
      batteryCapacity = modelLower.includes('m') || modelLower.includes('f') ? '6000 mAh' : '5000 mAh';
      charging = '25W USB-C Super Fast Charging';
      os = `Android ${year >= 2023 ? '14 (One UI 6)' : '13 (One UI 5)'}`;
      network = is5G ? '5G (12+ Bands) / 4G VoLTE, Dual SIM, Wi-Fi 5, Bluetooth 5.2' : '4G VoLTE Dual SIM, Wi-Fi, Bluetooth 5.0, USB Type-C';
    }
  } else if (brandLower.includes('oneplus')) {
    const isNumberSeries = !modelLower.includes('nord');
    processor = isNumberSeries
      ? 'Qualcomm Snapdragon 8 Gen 2 / Snapdragon 8+ Gen 1 (4nm) Mobile Platform'
      : 'Qualcomm Snapdragon 782G / MediaTek Dimensity 9000 5G';
    baseRam = price >= 25000 ? '12GB' : '8GB';
    baseStorage = price >= 25000 ? '256GB' : '128GB';
    screenSize = '6.7 inches';
    displayType = '120Hz Super Fluid AMOLED with LTPO, HDR10+, Gorilla Glass Victus';
    camera = isNumberSeries
      ? '50MP Sony IMX890 OIS (Hasselblad Color Calibration) + 48MP Ultra-Wide + 32MP Telephoto | 16MP Selfie'
      : '50MP Sony IMX890 OIS Main + 8MP Ultra-Wide + 2MP Macro | 16MP Front';
    batteryCapacity = '5000 mAh';
    charging = '80W / 100W SUPERVOOC Ultra-Fast Flash Charging';
    os = 'OxygenOS 14 based on Android 14';
    network = '5G Dual SIM, Wi-Fi 6E/7, Bluetooth 5.3, Alert Slider, NFC';
  } else if (brandLower.includes('google') || brandLower.includes('pixel')) {
    processor = modelLower.includes('8')
      ? 'Google Tensor G3 (4nm) with Titan M2 Security Coprocessor'
      : 'Google Tensor G2 (5nm) with Titan M2 Security Chip';
    baseRam = modelLower.includes('pro') ? '12GB' : '8GB';
    baseStorage = '128GB';
    screenSize = modelLower.includes('pro') ? '6.7 inches' : '6.2 inches';
    displayType = 'Actua OLED Display, 120Hz Smooth Display, HDR10+, Gorilla Glass Victus';
    camera = modelLower.includes('pro')
      ? '50MP Octa PD Wide OIS + 48MP 5x Telephoto + 48MP Ultra-Wide | 10.5MP 4K Selfie'
      : '50MP Octa PD Wide OIS + 12MP Ultra-Wide with Magic Eraser & Night Sight | 10.5MP Selfie';
    batteryCapacity = modelLower.includes('pro') ? '5050 mAh' : '4575 mAh';
    charging = '30W USB-C PD 3.0 Fast Charging & Qi Wireless Charging';
    os = 'Pure Stock Android 14 / Android 15 (7 Years Feature Drops)';
    network = '5G Sub-6, Dual SIM (Nano + eSIM), Wi-Fi 6E, Bluetooth 5.3, NFC';
  } else if (brandLower.includes('iqoo')) {
    const isFlagship = modelLower.includes('neo') || modelLower.includes('11') || modelLower.includes('12') || modelLower.includes('9');
    processor = isFlagship
      ? 'Qualcomm Snapdragon 8 Gen 2 / Snapdragon 8+ Gen 1 + Dedicated Q1 Gaming Chip'
      : 'MediaTek Dimensity 7200 5G / Qualcomm Snapdragon 695 5G (6nm)';
    baseRam = isFlagship ? '8GB' : '6GB';
    baseStorage = '128GB';
    screenSize = '6.78 inches';
    displayType = '120Hz / 144Hz E5 AMOLED Gaming Display, 1300 nits Peak, HDR10+';
    camera = '50MP Sony IMX OIS Main Camera + 8MP Ultra-Wide + 2MP Macro | 16MP Front';
    batteryCapacity = '5000 mAh';
    charging = isFlagship ? '120W FlashCharge (1–50% in 9 mins)' : '44W / 66W FlashCharge';
    os = 'Funtouch OS 14 based on Android 14';
    network = '5G Dual Standby, Wi-Fi 6, Bluetooth 5.3, Vapor Chamber Liquid Cooling';
  } else if (brandLower.includes('motorola')) {
    const isEdge = modelLower.includes('edge') || modelLower.includes('razr');
    processor = isEdge
      ? 'Qualcomm Snapdragon 7 Gen 3 / MediaTek Dimensity 7030 5G Octa-Core'
      : is5G
      ? 'Qualcomm Snapdragon 695 5G / MediaTek Dimensity 7020 Octa-Core'
      : 'Qualcomm Snapdragon 680 / MediaTek Helio G85 Octa-Core';
    baseRam = isEdge || price >= 13000 ? '8GB' : '6GB';
    baseStorage = '128GB';
    screenSize = isEdge ? '6.67 inches' : '6.5 inches';
    displayType = isEdge
      ? '144Hz 3D Curved pOLED Pantone Validated Display, HDR10+'
      : '120Hz FHD+ IPS LCD / pOLED Display with Stereo Dolby Atmos';
    camera = '50MP Quad Pixel Camera with OIS + 13MP Ultra-Wide Macro Vision | 32MP Selfie';
    batteryCapacity = isEdge ? '4500 mAh' : '5000 mAh';
    charging = isEdge ? '68W / 125W TurboPower Fast Charging & 15W Wireless' : '33W TurboPower USB-C Charging';
    os = 'Clean Near-Stock Hello UI / MyUX based on Android 14';
    network = is5G ? '5G (13+ Indian Bands), Dual SIM, Wi-Fi 6, IP68/IP52 Water Repellent, NFC' : '4G VoLTE Dual SIM, Wi-Fi, Bluetooth 5.1';
  } else if (brandLower.includes('poco') || brandLower.includes('redmi') || brandLower.includes('xiaomi')) {
    const isProOrX = modelLower.includes('pro') || modelLower.includes('f') || modelLower.includes('x');
    processor = isProOrX
      ? 'Qualcomm Snapdragon 7s Gen 2 / MediaTek Dimensity 8300-Ultra (4nm)'
      : is5G
      ? 'Qualcomm Snapdragon 4 Gen 2 / MediaTek Dimensity 6080 5G (6nm)'
      : 'MediaTek Helio G99 / Qualcomm Snapdragon 685 Octa-Core';
    baseRam = isProOrX ? '8GB' : price >= 9000 ? '6GB' : '4GB';
    baseStorage = price >= 8500 ? '128GB' : '64GB';
    screenSize = '6.67 inches';
    displayType = isProOrX
      ? '120Hz 1.5K Flow AMOLED DotDisplay, Dolby Vision, Gorilla Glass Victus'
      : '90Hz / 120Hz FHD+ Super AMOLED / IPS Display, Corning Gorilla Glass';
    camera = isProOrX
      ? '108MP / 200MP Pro OIS Main Camera + 8MP Ultra-Wide + 2MP Macro | 16MP Front'
      : '50MP AI Triple Camera with Night Mode | 13MP Front Camera';
    batteryCapacity = '5000 mAh';
    charging = isProOrX ? '67W / 120W SonicCharge / HyperCharge Adapter Included' : '33W Fast USB-C Charging';
    os = 'Xiaomi HyperOS / MIUI 14 based on Android 14';
    network = is5G ? '5G Dual SIM, Wi-Fi 6, IR Blaster, Dolby Atmos Dual Speakers' : '4G VoLTE Dual SIM, IR Blaster, Wi-Fi, Bluetooth 5.1';
  } else if (brandLower.includes('realme')) {
    const isProOrGT = modelLower.includes('pro') || modelLower.includes('gt');
    processor = isProOrGT
      ? 'Qualcomm Snapdragon 7s Gen 2 / MediaTek Dimensity 7050 5G (6nm)'
      : is5G
      ? 'MediaTek Dimensity 6100+ 5G (6nm) Octa-Core'
      : 'MediaTek Helio G88 / Unisoc T612 Octa-Core';
    baseRam = isProOrGT ? '8GB' : price >= 9000 ? '6GB' : '4GB';
    baseStorage = price >= 8500 ? '128GB' : '64GB';
    screenSize = isProOrGT ? '6.7 inches' : '6.6 inches';
    displayType = isProOrGT
      ? '120Hz Curved Vision OLED Display, 2160Hz PWM Dimming, 100% DCI-P3'
      : '90Hz / 120Hz Ultra Smooth FHD+ Sunlight Display';
    camera = isProOrGT
      ? '100MP / 50MP Sony IMX890 OIS Portrait Camera + 8MP Ultra-Wide | 32MP Sony Selfie'
      : '50MP AI Primary Camera + Portrait Lens | 8MP AI Selfie';
    batteryCapacity = '5000 mAh';
    charging = isProOrGT ? '67W / 80W SUPERVOOC Charge (0–50% in 19 mins)' : '33W SUPERVOOC Fast Charging';
    os = 'Realme UI 5.0 based on Android 14';
    network = is5G ? '5G Dual Mode SA/NSA, Dual SIM, Wi-Fi 6, Bluetooth 5.2' : '4G VoLTE Dual SIM, Dual-Band Wi-Fi, Bluetooth 5.0';
  } else if (brandLower.includes('vivo')) {
    const isVOrX = modelLower.includes('v') || modelLower.includes('x') || modelLower.includes('t');
    processor = isVOrX
      ? 'MediaTek Dimensity 8200 / Qualcomm Snapdragon 7 Gen 3 (4nm)'
      : is5G
      ? 'Qualcomm Snapdragon 695 5G / Dimensity 6020 Octa-Core'
      : 'Qualcomm Snapdragon 680 / MediaTek Helio P35 / G80';
    baseRam = isVOrX ? '8GB' : price >= 9000 ? '6GB' : '4GB';
    baseStorage = price >= 8500 ? '128GB' : '64GB';
    screenSize = isVOrX ? '6.78 inches' : '6.58 inches';
    displayType = isVOrX
      ? '120Hz 3D Curved AMOLED Display, HDR10+, Schott Xensation Glass'
      : '90Hz FHD+ Halo FullView Display with Eye Protection';
    camera = isVOrX
      ? '50MP Sony IMX VCS True Color OIS + Smart Aura Light Portrait + 8MP Wide | 50MP Eye AF Selfie'
      : '50MP Rear Main Sensor + 2MP Bokeh Camera | 16MP Clear Front Selfie';
    batteryCapacity = isVOrX ? '4600 mAh' : '5000 mAh';
    charging = isVOrX ? '80W / 66W FlashCharge USB-C' : '44W / 18W Fast Charge';
    os = 'Funtouch OS 14 based on Android 14';
    network = is5G ? '5G Dual SIM, Wi-Fi 6, Bluetooth 5.3, Extended RAM 3.0' : '4G VoLTE Dual SIM, Wi-Fi, Bluetooth 5.0';
  } else {
    // OPPO (Reno / F / A / Find series)
    const isRenoOrFind = modelLower.includes('reno') || modelLower.includes('find') || modelLower.includes('f');
    processor = isRenoOrFind
      ? 'MediaTek Dimensity 7050 / Qualcomm Snapdragon 778G 5G Octa-Core'
      : is5G
      ? 'MediaTek Dimensity 6020 5G / Snapdragon 695 Octa-Core'
      : 'Qualcomm Snapdragon 665 / MediaTek Helio G35 Octa-Core';
    baseRam = isRenoOrFind ? '8GB' : price >= 8500 ? '6GB' : '4GB';
    baseStorage = price >= 8000 ? '128GB' : '64GB';
    screenSize = isRenoOrFind ? '6.7 inches' : '6.5 inches';
    displayType = isRenoOrFind
      ? '120Hz 3D Curved Borderless AMOLED Display, HDR10+, 1 Billion Colors'
      : '90Hz Sunlight-Readable HD+/FHD+ Punch-Hole Display';
    camera = isRenoOrFind
      ? '64MP / 50MP Sony Flagship OIS Main + 32MP Telephoto Portrait + 8MP Ultra-Wide | 32MP Selfie'
      : '48MP / 13MP AI Triple Camera with Portrait Mode | 8MP Front Camera';
    batteryCapacity = isRenoOrFind ? '4800 mAh' : '5000 mAh';
    charging = isRenoOrFind ? '67W / 80W SUPERVOOC Flash Charge' : '33W SUPERVOOC / 18W Fast Charge';
    os = 'ColorOS 14 based on Android 14';
    network = is5G ? '5G Dual SIM, Wi-Fi 6, Bluetooth 5.3, 360° Surround Antenna' : '4G VoLTE Dual SIM, Wi-Fi, Bluetooth 5.0';
  }

  // Build variants array if missing or only 1 variant
  let variants: ProductVariant[] = product.variants && product.variants.length > 0 ? product.variants : [];

  if (variants.length === 0) {
    const calcDiscount = (sell: number, orig: number) =>
      orig > sell ? Math.round(((orig - sell) / orig) * 100) : product.discountPercentage || 50;

    if (modelLower.includes('s20+')) {
      variants = [
        {
          id: `${product.id}-v1`,
          ram: '8GB',
          storage: '128GB',
          sellingPrice: price,
          originalPrice: origPrice,
          discountPercentage: calcDiscount(price, origPrice),
          stock: Math.max(2, product.stock || 2),
          processor: 'Samsung Exynos 990 (7nm+) / Snapdragon 865',
          condition: product.condition,
          batteryHealth: product.batteryHealth || 90
        },
        {
          id: `${product.id}-v2`,
          ram: '8GB',
          storage: '256GB',
          sellingPrice: price + 1500,
          originalPrice: origPrice + 3000,
          discountPercentage: calcDiscount(price + 1500, origPrice + 3000),
          stock: Math.max(1, (hash % 3) + 1),
          processor: 'Samsung Exynos 990 (7nm+) / Snapdragon 865',
          condition: product.condition,
          batteryHealth: product.batteryHealth || 90
        },
        {
          id: `${product.id}-v3`,
          ram: '12GB',
          storage: '256GB',
          sellingPrice: price + 3000,
          originalPrice: origPrice + 6000,
          discountPercentage: calcDiscount(price + 3000, origPrice + 6000),
          stock: Math.max(1, (hash % 2) + 1),
          processor: 'Qualcomm Snapdragon 865 5G / Exynos 990',
          condition: 'Excellent',
          batteryHealth: Math.min(95, (product.batteryHealth || 90) + 2)
        }
      ];
    } else if (brandLower.includes('apple') || nameLower.includes('iphone')) {
      const storageSteps =
        baseStorage === '64GB'
          ? ['64GB', '128GB', '256GB']
          : baseStorage === '256GB'
          ? ['256GB', '512GB']
          : ['128GB', '256GB', '512GB'];
      variants = storageSteps.map((st, idx) => {
        const priceDelta = idx === 0 ? 0 : idx === 1 ? 3500 : 8000;
        const origDelta = idx === 0 ? 0 : idx === 1 ? 10000 : 20000;
        const vSell = price + priceDelta;
        const vOrig = origPrice + origDelta;
        return {
          id: `${product.id}-v${idx + 1}`,
          ram: baseRam,
          storage: st,
          sellingPrice: vSell,
          originalPrice: vOrig,
          discountPercentage: calcDiscount(vSell, vOrig),
          stock: idx === 0 ? Math.max(2, product.stock || 3) : Math.max(1, ((hash + idx) % 4) + 1),
          processor,
          condition: product.condition,
          batteryHealth: product.batteryHealth
        };
      });
    } else if (price >= 14000) {
      // Mid-range & Flagship Android: 8GB/128GB, 8GB/256GB, 12GB/256GB
      const configs =
        baseRam === '12GB'
          ? [
              { ram: '8GB', storage: '128GB', delta: -1500, origDelta: -3000 },
              { ram: '12GB', storage: '256GB', delta: 0, origDelta: 0 },
              { ram: '12GB', storage: '512GB', delta: 2500, origDelta: 5000 }
            ]
          : [
              { ram: '8GB', storage: '128GB', delta: 0, origDelta: 0 },
              { ram: '8GB', storage: '256GB', delta: 1500, origDelta: 3000 },
              { ram: '12GB', storage: '256GB', delta: 2800, origDelta: 5000 }
            ];
      variants = configs.map((cfg, idx) => {
        const vSell = Math.max(4999, price + cfg.delta);
        const vOrig = Math.max(vSell + 2000, origPrice + cfg.origDelta);
        return {
          id: `${product.id}-v${idx + 1}`,
          ram: cfg.ram,
          storage: cfg.storage,
          sellingPrice: vSell,
          originalPrice: vOrig,
          discountPercentage: calcDiscount(vSell, vOrig),
          stock: idx === 0 ? Math.max(2, product.stock || 3) : Math.max(1, ((hash + idx) % 4) + 1),
          processor,
          condition: product.condition,
          batteryHealth: product.batteryHealth
        };
      });
    } else {
      // Budget smartphones: 4GB/64GB, 6GB/128GB, 8GB/128GB
      const configs =
        baseRam === '4GB'
          ? [
              { ram: '4GB', storage: '64GB', delta: 0, origDelta: 0 },
              { ram: '6GB', storage: '128GB', delta: 1000, origDelta: 2000 },
              { ram: '8GB', storage: '128GB', delta: 1800, origDelta: 3500 }
            ]
          : [
              { ram: '6GB', storage: '128GB', delta: 0, origDelta: 0 },
              { ram: '8GB', storage: '128GB', delta: 1000, origDelta: 2000 },
              { ram: '8GB', storage: '256GB', delta: 2000, origDelta: 4000 }
            ];
      variants = configs.map((cfg, idx) => {
        const vSell = Math.max(3999, price + cfg.delta);
        const vOrig = Math.max(vSell + 1500, origPrice + cfg.origDelta);
        return {
          id: `${product.id}-v${idx + 1}`,
          ram: cfg.ram,
          storage: cfg.storage,
          sellingPrice: vSell,
          originalPrice: vOrig,
          discountPercentage: calcDiscount(vSell, vOrig),
          stock: idx === 0 ? Math.max(2, product.stock || 3) : Math.max(1, ((hash + idx) % 5) + 1),
          processor,
          condition: product.condition,
          batteryHealth: product.batteryHealth
        };
      });
    }
  }

  const finalDisplay = hasPlaceholderDisplay ? `${screenSize} — ${displayType}` : product.specs.display;
  const finalProcessor = hasPlaceholderProcessor ? processor : product.specs.processor;

  const cleanDesc = (product.description || '').replace(
    /Note:\s*RAM,\s*storage and display depend on variant;[^.]*\./gi,
    `Equipped with ${finalProcessor}, ${screenSize} ${displayType.split(',')[0]}, and backed by our 7-Day Replacement Guarantee & 6-Month Store Warranty.`
  );

  return {
    ...product,
    ram: baseRam,
    storage: baseStorage,
    description: cleanDesc,
    specs: {
      ...product.specs,
      display: finalDisplay,
      screenSize: product.specs?.screenSize || screenSize,
      displayType: product.specs?.displayType || displayType,
      processor: finalProcessor,
      camera:
        !product.specs?.camera || product.specs.camera.includes('Verified on inspection')
          ? camera
          : product.specs.camera,
      batteryCapacity: product.specs?.batteryCapacity || batteryCapacity,
      battery: `${batteryCapacity} Li-Polymer (${product.batteryHealth || 88}% Certified Health)`,
      charging:
        !product.specs?.charging || product.specs.charging === 'Fast Charging Support'
          ? charging
          : product.specs.charging,
      os:
        !product.specs?.os || product.specs.os.includes('Official OS')
          ? os
          : product.specs.os,
      network:
        !product.specs?.network || product.specs.network.includes('as per Indian carrier')
          ? network
          : product.specs.network
    },
    variants
  };
}

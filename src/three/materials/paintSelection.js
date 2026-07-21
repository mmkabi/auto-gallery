import { BODY_COLORS } from '../../config/product.js';

export function getPaintPreset(id) {
  return BODY_COLORS.find((paint) => paint.id === id) || null;
}

export function isPaintPreset(id) {
  return Boolean(getPaintPreset(id));
}

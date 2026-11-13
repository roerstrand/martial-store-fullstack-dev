const CATEGORY_LABELS = { bjj: "BJJ", boxing: "Boxing", muaythai: "Muay Thai", karate: "Karate" };

export function categoryLabel(category) {
  return CATEGORY_LABELS[category] ?? category;
}

export function salePriceOf(product) {
  return product.sale > 0 ? Math.round(product.price * (1 - product.sale / 100)) : null;
}

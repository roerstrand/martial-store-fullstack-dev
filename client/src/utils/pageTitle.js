const SITE = "Apex Core";

const INFO_TITLES = {
  about: "About us",
  shipping: "Shipping",
  returns: "Returns",
  faq: "FAQ",
};

const ROUTES = [
  [/^\/$/, () => null],
  [/^\/products\/?$/, () => "All products"],
  [/^\/products\/[^/]+$/, () => "Product"],
  [/^\/login$/, () => "Log in"],
  [/^\/register$/, () => "Create account"],
  [/^\/cart$/, () => "Cart"],
  [/^\/checkout$/, () => "Checkout"],
  [/^\/confirmation$/, () => "Order confirmed"],
  [/^\/contact$/, () => "Contact"],
  [/^\/articles\/?$/, () => "Stories"],
  [/^\/articles\/[^/]+$/, () => "Story"],
  [/^\/favorites$/, () => "Favorites"],
  [/^\/info\/([^/]+)$/, (m) => INFO_TITLES[m[1]] ?? "Information"],
  [/^\/orders\/[^/]+$/, () => "Order"],
  [/^\/my-pages$/, () => "My pages"],
  [/^\/admin$/, () => "Admin"],
];

export function titleFor(pathname) {
  for (const [pattern, name] of ROUTES) {
    const match = pathname.match(pattern);
    if (match) {
      const page = name(match);
      return page ? `${page} · ${SITE}` : `${SITE} · Fight gear for winners`;
    }
  }
  return `Page not found · ${SITE}`;
}

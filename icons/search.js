export function searchTerms(query) {
  return String(query).toLowerCase().trim().split(/\s+/).filter(Boolean);
}

export function scoreIcon(icon, terms) {
  let total = 0;
  const tokens = icon.name.split("-");
  const groups = icon.category.toLowerCase().split(/[^a-z0-9]+/);
  for (const term of terms) {
    let best = 0;
    const exact = icon.keywords.indexOf(term);
    const prefix = icon.keywords.findIndex((word) => word.startsWith(term));
    if (icon.name === term) best = 100;
    else if (icon.name.startsWith(term)) best = 80;
    else if (tokens.includes(term)) best = 70;
    else if (tokens.some((token) => token.startsWith(term))) best = 55;
    else if (
      (term.length > 3 || term.includes("-")) &&
      icon.name.includes(term)
    )
      best = 40;
    else if (exact >= 0) best = 35 - Math.min(exact, 9);
    else if (groups.includes(term)) best = 30;
    else if (prefix >= 0) best = 25 - Math.min(prefix, 9);
    else if (icon.category.toLowerCase().includes(term)) best = 15;
    if (!best) return 0;
    total += best;
  }
  return total;
}

export function matchIcons(icons, query) {
  const terms = searchTerms(query);
  return icons
    .map((icon) => ({ icon, rank: scoreIcon(icon, terms) }))
    .filter((entry) => entry.rank)
    .sort(
      (a, b) =>
        b.rank - a.rank ||
        a.icon.name.length - b.icon.name.length ||
        a.icon.name.localeCompare(b.icon.name),
    )
    .map((entry) => entry.icon);
}

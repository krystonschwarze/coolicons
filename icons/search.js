export function searchTerms(query) {
  return String(query).toLowerCase().trim().split(/\s+/).filter(Boolean);
}

const NOT_PLURAL = new Set(["news"]);

function singulars(term) {
  if (
    term.length < 4 ||
    !term.endsWith("s") ||
    /(ss|us|is)$/.test(term) ||
    NOT_PLURAL.has(term)
  )
    return [];
  const forms = [term.slice(0, -1)];
  if (/(ss|x|z|ch|sh)es$/.test(term)) forms.push(term.slice(0, -2));
  if (term.endsWith("ies")) forms.push(`${term.slice(0, -3)}y`);
  return forms;
}

function termScore(icon, term, tokens, groups) {
  const exact = icon.keywords.indexOf(term);
  const prefix = icon.keywords.findIndex((word) => word.startsWith(term));
  if (icon.name === term) return 100;
  if (icon.name.startsWith(term)) return 80;
  if (tokens.includes(term)) return 70;
  if (tokens.some((token) => token.startsWith(term))) return 55;
  if ((term.length > 3 || term.includes("-")) && icon.name.includes(term))
    return 40;
  if (exact >= 0) return 35 - Math.min(exact, 9);
  if (groups.includes(term)) return 30;
  if (prefix >= 0) return 25 - Math.min(prefix, 9);
  if (icon.category.toLowerCase().includes(term)) return 15;
  return 0;
}

function singularScore(icon, form, tokens, groups) {
  const exact = icon.keywords.indexOf(form);
  if (icon.name === form) return 25;
  if (tokens.includes(form)) return 23;
  if (exact >= 0) return 20 - Math.min(exact, 9);
  if (groups.includes(form)) return 10;
  return 0;
}

export function scoreIcon(icon, terms) {
  let total = 0;
  const tokens = icon.name.split("-");
  const groups = icon.category.toLowerCase().split(/[^a-z0-9]+/);
  for (const term of terms) {
    const best = Math.max(
      termScore(icon, term, tokens, groups),
      ...singulars(term).map((form) =>
        singularScore(icon, form, tokens, groups),
      ),
    );
    if (!best) return 0;
    total += best;
  }
  return total;
}

function rankIcons(icons, terms) {
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

export function matchIcons(icons, query) {
  return rankIcons(icons, searchTerms(query));
}

const vocabularies = new WeakMap();

function vocabulary(icons) {
  const cached = vocabularies.get(icons);
  if (cached) return cached;
  const uses = new Map();
  for (const icon of icons) {
    const words = new Set([
      icon.name,
      ...icon.name.split("-"),
      ...icon.keywords,
      ...icon.category.toLowerCase().split(/[^a-z0-9]+/),
    ]);
    for (const word of words)
      if (word) uses.set(word, (uses.get(word) ?? 0) + 1);
  }
  vocabularies.set(icons, uses);
  return uses;
}

function differences(a, b) {
  return [...a].flatMap((char, k) => (char === b[k] ? [] : [k]));
}

function swapped(a, b) {
  if (a.length !== b.length) return false;
  const diff = differences(a, b);
  return (
    diff.length === 2 &&
    diff[1] === diff[0] + 1 &&
    a[diff[0]] === b[diff[1]] &&
    a[diff[1]] === b[diff[0]]
  );
}

function missingOne(term, word) {
  if (word.length !== term.length + 1) return false;
  let k = 0;
  while (k < term.length && term[k] === word[k]) k++;
  return term.slice(k) === word.slice(k + 1);
}

function typo(term, word) {
  if (term.length < 4) return false;
  if (swapped(term, word) || missingOne(term, word)) return true;
  return (
    term.length >= 8 &&
    word.length === term.length &&
    differences(term, word).length === 1
  );
}

function closestWord(words, term) {
  let best = null;
  let bestUses = 0;
  for (const [word, uses] of words) {
    if (!typo(term, word)) continue;
    if (uses > bestUses || (uses === bestUses && word < best)) {
      best = word;
      bestUses = uses;
    }
  }
  return best;
}

export function matchIconsCorrected(icons, query) {
  const terms = searchTerms(query);
  const found = rankIcons(icons, terms);
  if (found.length)
    return { icons: found, corrected: [], query: terms.join(" ") };
  let words = null;
  const corrected = [];
  const fixed = terms.map((term) => {
    if (icons.some((icon) => scoreIcon(icon, [term]))) return term;
    words ??= vocabulary(icons);
    const to = closestWord(words, term);
    if (to && !corrected.some((entry) => entry.from === term))
      corrected.push({ from: term, to });
    return to ?? term;
  });
  const again = corrected.length ? rankIcons(icons, fixed) : [];
  return again.length
    ? { icons: again, corrected, query: fixed.join(" ") }
    : { icons: [], corrected: [], query: terms.join(" ") };
}

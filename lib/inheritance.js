/**
 * Turkish Civil Law (TMK) Inheritance Calculation
 * Calculates inheritance shares for heirs based on their relationship to the deceased
 */

export function hesaplaPaylar({ es, cocuklar, anne, baba, kardesler }) {
  const m = [];

  // If there are children, they inherit (children are primary heirs)
  if (cocuklar.length > 0) {
    if (es) {
      m.push({ ad: "Eş", pay: 25 });
      const p = 75 / cocuklar.length;
      cocuklar.forEach(c => m.push({ ad: c, pay: p }));
    } else {
      const p = 100 / cocuklar.length;
      cocuklar.forEach(c => m.push({ ad: c, pay: p }));
    }
    return m;
  }

  // No children: if spouse and at least one parent
  if (es && (anne || baba)) {
    m.push({ ad: "Eş", pay: 50 });
    const ebeveyn = (anne ? 1 : 0) + (baba ? 1 : 0);
    if (anne) m.push({ ad: "Anne", pay: 50 / ebeveyn });
    if (baba) m.push({ ad: "Baba", pay: 50 / ebeveyn });
    return m;
  }

  // Only spouse
  if (es) return [{ ad: "Eş", pay: 100 }];

  // Only parents (no spouse, no children)
  if (anne || baba) {
    const ebeveyn = (anne ? 1 : 0) + (baba ? 1 : 0);
    if (anne) m.push({ ad: "Anne", pay: 100 / ebeveyn });
    if (baba) m.push({ ad: "Baba", pay: 100 / ebeveyn });
    return m;
  }

  // No spouse, no parents, no children: siblings inherit
  if (kardesler.length > 0) {
    if (es) {
      m.push({ ad: "Eş", pay: 50 });
      const p = 50 / kardesler.length;
      kardesler.forEach(k => m.push({ ad: k, pay: p }));
    } else {
      const p = 100 / kardesler.length;
      kardesler.forEach(k => m.push({ ad: k, pay: p }));
    }
    return m;
  }

  // No heirs found: estate goes to state (Hazine)
  return [{ ad: "Hazine", pay: 100 }];
}

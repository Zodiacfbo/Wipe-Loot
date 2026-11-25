// Les règles de l'export pour analyse, sans Firebase (testées dans tests/export.test.ts).
// Les pseudos et les identifiants des joueurs sont remplacés par « Joueur 1, 2… » : le fichier peut être partagé.

/**
 * Prépare l'export : les journaux des runs (sans uid ni pseudo) et un résumé des profils.
 * `runs` : les documents de sites/{site}/runs ; `players` : ceux de sites/{site}/joueurs.
 */
export function buildExport({ site, days, now, runs, players }) {
  const names = new Map();
  const nameOf = (uid) => {
    if (!names.has(uid)) names.set(uid, `Joueur ${names.size + 1}`);
    return names.get(uid);
  };
  const sorted = [...runs].sort((a, b) => a.finMs - b.finMs);
  const outRuns = sorted.map((r) => {
    const { uid, pseudo, ...rest } = r;
    return { joueur: nameOf(uid), ...rest };
  });
  const outPlayers = players.map((p) => {
    let profil = null;
    try { profil = p.profil ? JSON.parse(p.profil) : null; } catch { profil = null; }
    return {
      joueur: nameOf(p.uid),
      majMs: p.majMs ?? null,
      version: p.version ?? null,
      // Seulement la progression : l'expérience par classe, les victoires, la difficulté débloquée.
      classes: profil?.classes ?? {},
      stats: profil?.stats ?? null,
      difficulte: profil?.difficulty ?? {},
      coffre: profil?.guildChest ?? [],
    };
  });
  return { site, jours: days, exporteMs: now, runs: outRuns, joueurs: outPlayers };
}

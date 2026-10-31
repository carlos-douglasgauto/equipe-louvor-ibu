// Utilitário inteligente para importar e mapear músicas, tons e cifras diretamente do Google Docs da igreja

const VALID_CHORD_ROOTS = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];

/**
 * Extrai o ID do documento a partir de qualquer link do Google Docs
 */
export function extractGoogleDocId(url = '') {
  if (!url) return null;
  const match = url.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

/**
 * Verifica se uma linha parece ser exclusivamente uma linha de acordes/cifra
 */
function isChordLine(line = '') {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (/^\[?(?:intro|solo|refr[aã]o|ponte|verso|primeira parte|segunda parte|final|interl[uú]dio)/i.test(trimmed)) {
    return true;
  }
  // Remove annotations like "1x intro", "2x", "8 tempo", dots, bars
  const cleaned = trimmed
    .replace(/\b\d+x\b/gi, '')
    .replace(/\b\d+\s*tempos?\b/gi, '')
    .replace(/\bintro\b/gi, '')
    .replace(/[.()|\[\]]/g, ' ')
    .trim();

  if (!cleaned) return false;
  const tokens = cleaned.split(/\s+/);
  const chordRegex = /^[b#]?[A-G][#b]?(?:m|maj|min|dim|aug|sus|add|M)?\d*(?:\/[A-G][#b]?)?$/;
  const validCount = tokens.filter(t => chordRegex.test(t)).length;
  return validCount > 0 && validCount >= Math.ceil(tokens.length * 0.65);
}

/**
 * Detecta o Tom principal (Key) de um bloco de cifra
 */
export function detectKeyFromChordsBlock(chordsText = '') {
  const lines = chordsText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // 1. Procura por "Tom: X" explícito
  for (const line of lines.slice(0, 6)) {
    const tomMatch = line.match(/^Tom:\s*([A-G][#b]?m?)\b/i);
    if (tomMatch) {
      return normalizeKeyRoot(tomMatch[1]);
    }
  }

  // 2. Coleta as linhas de acordes e identifica o primeiro acorde da estrofe (após a Intro) e os acordes gerais
  let introChords = [];
  let verseFirstChord = null;
  const allChords = [];

  const chordTokenRegex = /\b([A-G][#b]?)(m|maj|min|dim|sus|add|M|\d)*(?:\/[A-G][#b]?)?\b/g;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isIntroLine = /^\[?intro\]?[:\s]/i.test(line);

    if (isIntroLine) {
      const withoutLabel = line.replace(/^\[?intro\]?[:\s]*/i, '');
      const matches = [...withoutLabel.matchAll(chordTokenRegex)];
      introChords.push(...matches.map(m => ({ root: m[1], minor: m[2] === 'm' })));
      continue;
    }

    if (isChordLine(line) && !/^\[/.test(line)) {
      const matches = [...line.matchAll(chordTokenRegex)];
      if (matches.length > 0) {
        if (!verseFirstChord) {
          verseFirstChord = { root: matches[0][1], minor: matches[0][2] === 'm' };
        }
        allChords.push(...matches.map(m => ({ root: m[1], minor: m[2] === 'm' })));
      }
    }
  }

  // O primeiro acorde cantado na primeira estrofe é quase sempre a tônica na música congregacional
  if (verseFirstChord && VALID_CHORD_ROOTS.includes(verseFirstChord.root)) {
    return verseFirstChord.root;
  }

  if (introChords.length > 0 && VALID_CHORD_ROOTS.includes(introChords[0].root)) {
    return introChords[0].root;
  }

  if (allChords.length > 0 && VALID_CHORD_ROOTS.includes(allChords[0].root)) {
    return allChords[0].root;
  }

  return 'G';
}

function normalizeKeyRoot(rawKey = '') {
  const clean = rawKey.trim().replace(/m$/i, '');
  const upper = clean.charAt(0).toUpperCase() + clean.slice(1);
  return VALID_CHORD_ROOTS.includes(upper) ? upper : 'G';
}

/**
 * Verifica se uma linha é um cabeçalho "Nome da Música - Cantor/Ministério"
 */
function isSongHeaderLine(line = '', nextLines = []) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 90 || trimmed.length < 4) return false;
  if (/^[_=\-*]{3,}$/.test(trimmed)) return false;
  if (/^\[/.test(trimmed)) return false;
  if (/^[EBGDAE]\|/.test(trimmed)) return false; // Tablatura

  // Precisa ter separador " - " ou " – "
  const sepMatch = trimmed.match(/^(.+?)\s+[-–—]\s+(.+)$/);
  if (!sepMatch) return false;

  const left = sepMatch[1].trim();
  const right = sepMatch[2].trim();
  if (!left || !right) return false;

  // Não pode ser uma linha de acordes (ex: "F - Bb - C")
  if (isChordLine(left) && isChordLine(right)) return false;

  // Verifica se logo nas próximas linhas não-vazias existe Intro, Tom ou linha de cifra
  const nonEmptyNext = nextLines.map(l => l.trim()).filter(Boolean).slice(0, 3);
  if (nonEmptyNext.length === 0) return false;

  return nonEmptyNext.some(nl =>
    /^\[?intro/i.test(nl) ||
    /^tom:/i.test(nl) ||
    isChordLine(nl)
  );
}

/**
 * Recebe o texto bruto exportado do Google Docs e retorna a lista de músicas mapeadas
 * com { title, artist, key, originalKey, bpm, chordsText, notes }
 */
export function parseGoogleDocTextToSongs(rawText = '') {
  if (!rawText || !rawText.trim()) return [];

  // Normaliza quebras de linha e remove BOM
  const cleanText = rawText.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const allLines = cleanText.split('\n');

  // Agrupa em blocos de músicas usando tanto divisores (____) quanto cabeçalhos "Música - Artista"
  const rawBlocks = [];
  let currentBlockLines = [];

  for (let i = 0; i < allLines.length; i++) {
    const line = allLines[i];
    const trimmed = line.trim();

    // Se for linha divisória (ex: ________________)
    if (/^[_=\-]{4,}$/.test(trimmed)) {
      if (currentBlockLines.some(l => l.trim())) {
        rawBlocks.push(currentBlockLines);
        currentBlockLines = [];
      }
      continue;
    }

    // Se encontrarmos um novo cabeçalho "Música - Cantor" no meio de um bloco que já tem conteúdo
    const upcoming = allLines.slice(i + 1, i + 8);
    if (
      currentBlockLines.filter(l => l.trim()).length >= 4 &&
      isSongHeaderLine(trimmed, upcoming)
    ) {
      rawBlocks.push(currentBlockLines);
      currentBlockLines = [line];
      continue;
    }

    currentBlockLines.push(line);
  }

  if (currentBlockLines.some(l => l.trim())) {
    rawBlocks.push(currentBlockLines);
  }

  // Agora transforma cada bloco em um objeto de música estruturado
  const parsedSongs = [];

  rawBlocks.forEach((blockLines, idx) => {
    // Remove linhas vazias do início e do fim
    let start = 0;
    while (start < blockLines.length && !blockLines[start].trim()) start++;
    let end = blockLines.length - 1;
    while (end >= start && !blockLines[end].trim()) end--;

    const trimmedBlock = blockLines.slice(start, end + 1);
    if (trimmedBlock.length < 2) return;

    const firstLine = trimmedBlock[0].trim();
    let title = firstLine;
    let artist = '';
    let bodyLines = trimmedBlock.slice(1);

    // Extrai "Título - Artista" da primeira linha
    const headerMatch = firstLine.match(/^(.+?)\s+[-–—]\s+(.+)$/);
    if (headerMatch) {
      title = headerMatch[1].trim();
      artist = headerMatch[2].trim();
    } else {
      // Caso a primeira linha seja apenas o título
      title = firstLine.replace(/^#+\s*/, '').trim();
    }

    // Remove linhas em branco iniciais do corpo da cifra
    while (bodyLines.length > 0 && !bodyLines[0].trim()) {
      bodyLines.shift();
    }

    const rawBody = bodyLines.join('\n').trim();
    if (!rawBody) return;

    const detectedKey = detectKeyFromChordsBlock(rawBody);
    const hasTomHeader = /^tom:\s*[A-G]/i.test(rawBody);
    const finalChordsText = hasTomHeader
      ? rawBody
      : `Tom: ${detectedKey}\n${rawBody}`;

    // Verifica se há alguma observação de ponte/modulação dentro da cifra
    let notes = 'Importada do Google Docs da semana';
    if (/ponte\s+trocar|modula/i.test(rawBody)) {
      notes = 'Atenção: Contém ponte / transição na cifra (importado do Google Docs)';
    }

    parsedSongs.push({
      id: `gdoc_${Date.now()}_${idx}`,
      title,
      artist: artist || 'Louvor IBU',
      version: artist ? `Versão ${artist} (Google Docs)` : 'Google Docs da Semana',
      key: detectedKey,
      originalKey: detectedKey,
      bpm: 72,
      youtubeUrl: '',
      cifraUrl: '',
      notes,
      chordsText: finalChordsText
    });
  });

  return parsedSongs;
}


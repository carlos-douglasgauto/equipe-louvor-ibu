// Musical Chord Transposition Engine
const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTES_FLAT  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const EQUIVALENTS = {
  'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
  'B#': 'C', 'Cb': 'B', 'E#': 'F', 'Fb': 'E'
};

export function normalizeRoot(note) {
  return EQUIVALENTS[note] || note;
}

export function transposeRoot(root, semitones, preferFlats = false) {
  const norm = normalizeRoot(root);
  let idx = NOTES_SHARP.indexOf(norm);
  if (idx === -1) return root;

  let newIdx = (idx + semitones) % 12;
  if (newIdx < 0) newIdx += 12;

  const scale = preferFlats ? NOTES_FLAT : NOTES_SHARP;
  return scale[newIdx];
}

export function getSemitonesBetween(fromKey, toKey) {
  if (!fromKey || !toKey) return 0;
  const f = normalizeRoot(fromKey);
  const t = normalizeRoot(toKey);
  const idx1 = NOTES_SHARP.indexOf(f);
  const idx2 = NOTES_SHARP.indexOf(t);
  if (idx1 === -1 || idx2 === -1) return 0;
  let diff = (idx2 - idx1) % 12;
  if (diff < 0) diff += 12;
  return diff;
}

// Regex to match chords like C, G/B, F#m7, Bb9, C#m7(b5), D/F#
const CHORD_REGEX = /\b([A-G][b#]?)(m|maj|min|dim|aug|sus[24]?|[0-9]+|\+[0-9]*|-[0-9]*|\([^\)]+\))*(\/([A-G][b#]?))?\b/g;

export function transposeChord(chord, semitones) {
  if (semitones === 0) return chord;

  return chord.replace(CHORD_REGEX, (match, root, suffix = '', slash, bass) => {
    const newRoot = transposeRoot(root, semitones);
    let newBass = '';
    if (bass) {
      newBass = '/' + transposeRoot(bass, semitones);
    }
    return `${newRoot}${suffix}${newBass}`;
  });
}

export function transposeChordsText(text, semitones) {
  if (!text || semitones === 0) return text;
  
  return text.split('\n').map(line => {
    // If the line starts with Tom: or key:
    if (/^\s*(Tom|Key):\s*([A-G][b#]?)/i.test(line)) {
      return line.replace(/([A-G][b#]?)/i, (m) => transposeRoot(m, semitones));
    }
    // If it looks like a chord line or [Intro] section, transpose chords in it
    return line.replace(CHORD_REGEX, (match, root, suffix = '', slash, bass) => {
      // Avoid matching plain English words like "A" in lyrics unless surrounded or uppercase
      if (match === 'A' && line.includes(' ')) {
        // If it's a lyrics line without other musical markers, be conservative
        const isLikelyChordLine = /\[.*\]|Intro|Refrão|Verso|Ponte|\b[CDEFGAB][#b]?m|\/|9|7/i.test(line);
        if (!isLikelyChordLine && !line.startsWith('A ')) {
          return match;
        }
      }
      const newRoot = transposeRoot(root, semitones);
      const newBass = bass ? '/' + transposeRoot(bass, semitones) : '';
      return `${newRoot}${suffix || ''}${newBass}`;
    });
  }).join('\n');
}

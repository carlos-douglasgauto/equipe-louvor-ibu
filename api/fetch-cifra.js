// Vercel Serverless Function para buscar Cifra, Tom Original e URLs a partir do Título/Artista ou Link
// Funciona automaticamente na Vercel (/api/fetch-cifra) e no servidor Vite local

export function slugify(text = '') {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildCifraUrls(artist = '', title = '') {
  const artistSlug = slugify(artist.split('/')[0].split('ft')[0].split('feat')[0].trim());
  const titleSlug = slugify(title.split('(')[0].split('-')[0].trim());
  const firstLetter = artistSlug ? artistSlug[0] : 'a';

  return {
    bananaCifrasUrl: artistSlug && titleSlug
      ? `https://www.bananacifras.com/cifra/${firstLetter}/${artistSlug}/${titleSlug}`
      : '',
    cifraClubUrl: artistSlug && titleSlug
      ? `https://www.cifraclub.com.br/${artistSlug}/${titleSlug}/`
      : ''
  };
}

export function parseHtmlCifra(html = '') {
  if (!html || html.includes('Just a moment...')) {
    return null;
  }

  // Extract Tom (Key)
  let detectedKey = null;
  const tomMatch =
    html.match(/id=["']cifra_tom["'][^>]*>[\s\S]*?<a[^>]*>([A-G][#b]?m?)<\/a>/i) ||
    html.match(/Tom:\s*<a[^>]*>([A-G][#b]?m?)<\/a>/i) ||
    html.match(/Tom:\s*([A-G][#b]?m?)\b/i);

  if (tomMatch && tomMatch[1]) {
    // Normalize minor keys to major/base key if needed or keep base note
    detectedKey = tomMatch[1].trim().replace(/m$/, '');
  }

  // Extract <pre> block containing chords + lyrics
  const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
  if (!preMatch || !preMatch[1]) {
    return null;
  }

  let chordsText = preMatch[1]
    .replace(/<\/?b[^>]*>/gi, '')
    .replace(/<\/?span[^>]*>/gi, '')
    .replace(/<\/?a[^>]*>/gi, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();

  if (!chordsText || chordsText.length < 30) {
    return null;
  }

  if (detectedKey && !chordsText.toLowerCase().startsWith('tom:')) {
    chordsText = `Tom: ${detectedKey}\n\n${chordsText}`;
  }

  return {
    originalKey: detectedKey,
    chordsText
  };
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const query = req.query || {};
  const title = query.title || '';
  const artist = query.artist || '';
  const directUrl = query.url || '';

  const { bananaCifrasUrl, cifraClubUrl } = buildCifraUrls(artist, title);
  const candidateUrls = [
    directUrl,
    cifraClubUrl,
    bananaCifrasUrl
  ].filter(Boolean);

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8'
  };

  for (const url of candidateUrls) {
    try {
      const response = await fetch(url, { headers, signal: AbortSignal.timeout(5000) });
      if (!response.ok) continue;
      const html = await response.text();
      const parsed = parseHtmlCifra(html);
      if (parsed && parsed.chordsText) {
        return res.status(200).json({
          found: true,
          sourceUrl: url,
          bananaCifrasUrl: bananaCifrasUrl || url,
          cifraClubUrl,
          originalKey: parsed.originalKey || 'G',
          chordsText: parsed.chordsText
        });
      }
    } catch (_) {
      // Try next candidate
    }
  }

  return res.status(200).json({
    found: false,
    bananaCifrasUrl,
    cifraClubUrl
  });
}


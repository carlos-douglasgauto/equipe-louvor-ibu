// YouTube & Music Metadata utility for worship team rehearsals

export function extractYouTubeId(url) {
  if (!url) return null;
  
  // Handles formats:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  // - https://music.youtube.com/watch?v=VIDEO_ID
  // - https://www.youtube.com/shorts/VIDEO_ID
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regExp);
  return (match && match[1]) ? match[1] : null;
}

export function getYouTubeThumbnail(videoId) {
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function getYouTubeEmbedUrl(videoId) {
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
}

export function slugifyText(text = '') {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildBananaCifrasUrl(artist = '', title = '') {
  const cleanArtist = artist.split('/')[0].split(/ft\.?|feat\.?/i)[0].trim();
  const cleanTitle = title.split('(')[0].split('[')[0].split('+')[0].trim();
  const artistSlug = slugifyText(cleanArtist);
  const titleSlug = slugifyText(cleanTitle);
  if (!artistSlug || !titleSlug) return '';
  const firstLetter = artistSlug[0] || 'a';
  return `https://www.bananacifras.com/cifra/${firstLetter}/${artistSlug}/${titleSlug}`;
}

export function buildCifraClubUrl(artist = '', title = '') {
  const cleanArtist = artist.split('/')[0].split(/ft\.?|feat\.?/i)[0].trim();
  const cleanTitle = title.split('(')[0].split('[')[0].split('+')[0].trim();
  const artistSlug = slugifyText(cleanArtist);
  const titleSlug = slugifyText(cleanTitle);
  if (!artistSlug || !titleSlug) return '';
  return `https://www.cifraclub.com.br/${artistSlug}/${titleSlug}/`;
}

/**
 * Parses a YouTube video title and channel name (author_name) into clean
 * { title, artist, version, detectedKey, detectedBpm }
 */
export function parseYouTubeVideoInfo(rawTitle = '', authorName = '') {
  if (!rawTitle) return { title: '', artist: authorName || '', version: '' };

  let working = rawTitle.trim();

  // Detect explicit key or BPM in video title if present (e.g., "Tom G", "Key of A", "72 BPM")
  let detectedKey = null;
  const keyMatch = working.match(/\b(?:tom|key(?:\s+of)?)\s*[:=-]?\s*([A-G][#b]?m?)\b/i);
  if (keyMatch && keyMatch[1]) {
    detectedKey = keyMatch[1].replace(/m$/i, '');
  }

  let detectedBpm = null;
  const bpmMatch = working.match(/\b(\d{2,3})\s*bpm\b/i);
  if (bpmMatch && bpmMatch[1]) {
    detectedBpm = Number(bpmMatch[1]);
  }

  // Extract version info in parentheses/brackets like (Ao Vivo), [Clipe Oficial], etc.
  const versionParts = [];
  const bracketMatches = working.match(/[\(\[]([^\)\]]+)[\)\]]/g);
  if (bracketMatches) {
    bracketMatches.forEach(part => {
      const inner = part.slice(1, -1).trim();
      if (inner && !/^(?:ofici?al\s+m?u?s?i?c?\s*video|clipe\s+oficial|video\s+oficial|lyric\s+video|4k|hd)$/i.test(inner)) {
        versionParts.push(inner);
      }
    });
  }

  // Remove brackets and pipe suffixes
  working = working
    .replace(/[\(\[][^\)\]]*[\)\]]/g, '')
    .split('|')[0]
    .replace(/\b(?:clipe oficial|vídeo oficial|video oficial|ao vivo|live session|lyric video|oficial)\b/gi, '')
    .trim();

  // Clean authorName (remove " - Topic", "VEVO", "Oficial")
  const cleanChannel = (authorName || '')
    .replace(/\s*-\s*Topic$/i, '')
    .replace(/VEVO$/i, '')
    .replace(/\s*Oficial$/i, '')
    .trim();

  let title = working;
  let artist = cleanChannel;

  // Split by " - " or " – " or " — "
  const separators = [' - ', ' – ', ' — ', ' : '];
  for (const sep of separators) {
    if (working.includes(sep)) {
      const parts = working.split(sep).map(p => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        const first = parts[0];
        const second = parts.slice(1).join(' - ');

        // Check if the first part is the channel/artist or the second part is the channel/artist
        if (
          cleanChannel &&
          slugifyText(second).includes(slugifyText(cleanChannel)) &&
          !slugifyText(first).includes(slugifyText(cleanChannel))
        ) {
          title = first;
          artist = second;
        } else {
          artist = first;
          title = second;
        }
        break;
      }
    }
  }

  // Format ALL CAPS strings into Title Case (e.g. "MORADA" -> "Morada", "EMAÚS" -> "Emaús")
  const formatCase = (str) => {
    if (!str) return '';
    if (str === str.toUpperCase() && str.length > 3) {
      return str
        .toLowerCase()
        .replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
    }
    return str;
  };

  title = formatCase(title.replace(/^[-–—:\s]+|[-–—:\s]+$/g, ''));
  artist = formatCase(artist.replace(/^[-–—:\s]+|[-–—:\s]+$/g, ''));

  const version = versionParts.length > 0
    ? versionParts.join(' • ')
    : (artist ? `${artist} (YouTube)` : 'Versão YouTube');

  return {
    title,
    artist,
    version,
    detectedKey,
    detectedBpm
  };
}

/**
 * Fetches YouTube video metadata via public oEmbed endpoints (no API key required)
 */
export async function fetchYouTubeMetadata(youtubeUrl) {
  const videoId = extractYouTubeId(youtubeUrl);
  if (!videoId) return null;

  const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const endpoints = [
    `https://noembed.com/embed?url=${encodeURIComponent(canonicalUrl)}`,
    `https://www.youtube.com/oembed?url=${encodeURIComponent(canonicalUrl)}&format=json`
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint);
      if (!res.ok) continue;
      const data = await res.json();
      if (data && data.title) {
        const parsed = parseYouTubeVideoInfo(data.title, data.author_name);
        return {
          videoId,
          rawTitle: data.title,
          authorName: data.author_name || '',
          thumbnailUrl: data.thumbnail_url || getYouTubeThumbnail(videoId),
          ...parsed
        };
      }
    } catch (_) {
      // Try next endpoint
    }
  }

  return null;
}

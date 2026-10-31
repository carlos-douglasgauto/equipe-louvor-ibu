// Vercel Serverless Function para ler e exportar o texto de um Google Docs compartilhado
import { extractGoogleDocId, parseGoogleDocTextToSongs } from '../src/utils/googleDocsParser.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = req.query?.url || '';
  const docId = extractGoogleDocId(url);

  if (!docId) {
    return res.status(400).json({
      ok: false,
      error: 'Link do Google Docs inválido. Certifique-se de que contém /document/d/ID.'
    });
  }

  const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;

  try {
    const response = await fetch(exportUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      return res.status(400).json({
        ok: false,
        error: 'Não foi possível ler o Google Docs. Verifique se o compartilhamento está como "Qualquer pessoa com o link pode ver".'
      });
    }

    const rawText = await response.text();
    const songs = parseGoogleDocTextToSongs(rawText);

    return res.status(200).json({
      ok: true,
      docId,
      songsCount: songs.length,
      songs,
      rawText
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: 'Falha ao conectar ao Google Docs: ' + (err.message || 'Erro desconhecido')
    });
  }
}


// Vercel Serverless Function para sincronização em nuvem entre todos os dispositivos (PC, Celular, Aba Anônima)
// Utiliza armazenamento em nuvem redundante (Bytebin + KeyValue Pointer + Ntfy Realtime) sem custo

const KV_APP_KEY = 'az9a6uze';
const KV_POINTER_KEY = 'louvorsync_ibu_ptr_v2';
const NTFY_TOPIC = 'louvorsync_ibu_sync_v2';

// Cache em memória da instância serverless para resposta ultra-rápida
let memoryStateCache = null;
let memoryPointerCache = null;

async function getLatestPointer() {
  // 1. Tenta KeyValue pointer
  try {
    const res = await fetch(`https://keyvalue.immanuel.co/api/KeyVal/GetValue/${KV_APP_KEY}/${KV_POINTER_KEY}`, {
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      const text = await res.text();
      const cleaned = text.replace(/^"+|"+$/g, '').trim();
      if (cleaned && cleaned !== 'null' && cleaned.length >= 5) {
        return cleaned;
      }
    }
  } catch (_) {}

  // 2. Fallback: Tenta último evento no ntfy
  try {
    const res = await fetch(`https://ntfy.sh/${NTFY_TOPIC}/json?poll=1`, {
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      const text = await res.text();
      const lines = text.trim().split('\n').filter(Boolean);
      for (let i = lines.length - 1; i >= 0; i--) {
        try {
          const item = JSON.parse(lines[i]);
          if (item.event === 'message' && item.message) {
            const parsed = JSON.parse(item.message);
            if (parsed && parsed.blobKey) return parsed.blobKey;
          }
        } catch (_) {}
      }
    }
  } catch (_) {}

  return memoryPointerCache;
}

async function savePointer(blobKey, updatedAt) {
  memoryPointerCache = blobKey;
  await Promise.allSettled([
    fetch(`https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/${KV_APP_KEY}/${KV_POINTER_KEY}/${encodeURIComponent(blobKey)}`, {
      method: 'POST',
      signal: AbortSignal.timeout(4500)
    }),
    fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: 'POST',
      body: JSON.stringify({ blobKey, updatedAt }),
      signal: AbortSignal.timeout(4500)
    })
  ]);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const blobKey = await getLatestPointer();
      if (!blobKey) {
        return res.status(200).json({ ok: true, hasCloudState: false, state: memoryStateCache });
      }

      if (memoryStateCache && memoryPointerCache === blobKey) {
        return res.status(200).json({ ok: true, hasCloudState: true, blobKey, state: memoryStateCache });
      }

      const blobRes = await fetch(`https://bytebin.lucko.me/${encodeURIComponent(blobKey)}`, {
        signal: AbortSignal.timeout(5000)
      });

      if (blobRes.ok) {
        const state = await blobRes.json();
        memoryStateCache = state;
        memoryPointerCache = blobKey;
        return res.status(200).json({ ok: true, hasCloudState: true, blobKey, state });
      }

      return res.status(200).json({
        ok: true,
        hasCloudState: Boolean(memoryStateCache),
        state: memoryStateCache
      });
    } catch (err) {
      return res.status(200).json({
        ok: false,
        error: err.message,
        hasCloudState: Boolean(memoryStateCache),
        state: memoryStateCache
      });
    }
  }

  if (req.method === 'POST') {
    try {
      let body = req.body;
      if (typeof body === 'string') {
        body = JSON.parse(body);
      }

      if (!body || typeof body !== 'object') {
        return res.status(400).json({ ok: false, error: 'Payload inválido' });
      }

      const payload = {
        ...body,
        updatedAt: body.updatedAt || Date.now()
      };

      memoryStateCache = payload;

      // Salva o JSON completo no Bytebin
      const postRes = await fetch('https://bytebin.lucko.me/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(6000)
      });

      if (!postRes.ok) {
        return res.status(502).json({ ok: false, error: 'Falha ao gravar estado na nuvem' });
      }

      const postData = await postRes.json();
      const blobKey = postData.key;

      if (blobKey) {
        await savePointer(blobKey, payload.updatedAt);
      }

      return res.status(200).json({
        ok: true,
        blobKey,
        updatedAt: payload.updatedAt
      });
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}


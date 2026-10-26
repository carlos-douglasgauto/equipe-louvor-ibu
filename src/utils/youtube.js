// YouTube utility for worship team rehearsals
export function extractYouTubeId(url) {
  if (!url) return null;
  
  // Handles formats:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  // - https://music.youtube.com/watch?v=VIDEO_ID
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
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

const getYouTubeVideoId = (url = '') => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/live\/)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : '';
};

const getYouTubeThumbnail = (url = '') => {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
};

const getEmbedUrl = (url = '') => {
  const videoId = getYouTubeVideoId(url);
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }

  return '';
};

export { getYouTubeVideoId, getYouTubeThumbnail, getEmbedUrl };

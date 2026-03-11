// Utility function to get proper image URL
// Handles relative paths by prepending backend URL

const BACKEND_URL = 'http://localhost:5000';

export const getImageUrl = (imgUrl, fallback = 'https://via.placeholder.com/50') => {
  if (!imgUrl) return fallback;
  
  // If it's already a full URL, return as is
  if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
    return imgUrl;
  }
  
  // If it's a path to public assets, serve from frontend
  if (imgUrl.startsWith('/assets/')) {
    return imgUrl;
  }
  
  // If it's a relative path (uploads), prepend backend URL
  return `${BACKEND_URL}${imgUrl}`;
};

// Helper to get first image from array or single image field
export const getProductImage = (product, fallback = 'https://via.placeholder.com/50') => {
  const imgUrl = product.image || product.images?.[0];
  return getImageUrl(imgUrl, fallback);
};

export default getImageUrl;

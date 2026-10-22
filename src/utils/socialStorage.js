// Social Media & Public Channels Storage Utility
export const SOCIAL_STORAGE_KEY = 'allied_social_links';

export const DEFAULT_SOCIAL_LINKS = {
  linkedin: 'https://www.linkedin.com/company/allied-power-industrial-co',
  whatsapp: 'https://wa.me/966534017242?text=Hello%20Allied%20Power%20Industrial%20Sales%20Team',
  twitter: 'https://x.com/alliedpowerksa',
  facebook: 'https://www.facebook.com/alliedpowerindustrial',
  instagram: 'https://www.instagram.com/alliedpowerindustrial',
  youtube: 'https://www.youtube.com/@alliedpowerindustrial'
};

export const SOCIAL_PLATFORMS = [
  { id: 'linkedin', name: 'LinkedIn', icon: 'bi-linkedin', placeholder: 'https://www.linkedin.com/company/...', color: '#0077b5' },
  { id: 'whatsapp', name: 'WhatsApp', icon: 'bi-whatsapp', placeholder: 'https://wa.me/966534017242...', color: '#25d366' },
  { id: 'twitter', name: 'X (Twitter)', icon: 'bi-twitter-x', placeholder: 'https://x.com/...', color: '#000000' },
  { id: 'facebook', name: 'Facebook', icon: 'bi-facebook', placeholder: 'https://facebook.com/...', color: '#1877f2' },
  { id: 'instagram', name: 'Instagram', icon: 'bi-instagram', placeholder: 'https://instagram.com/...', color: '#e4405f' },
  { id: 'youtube', name: 'YouTube', icon: 'bi-youtube', placeholder: 'https://youtube.com/@...', color: '#ff0000' }
];

export function getStoredSocialLinks() {
  try {
    const stored = localStorage.getItem(SOCIAL_STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SOCIAL_LINKS, ...JSON.parse(stored) };
    }
  } catch (err) {
    console.error('Error reading social links:', err);
  }
  return DEFAULT_SOCIAL_LINKS;
}

export function saveSocialLinks(links) {
  try {
    localStorage.setItem(SOCIAL_STORAGE_KEY, JSON.stringify(links));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('allied_social_updated'));
    }
    if (typeof fetch !== 'undefined') {
      fetch('/api.php?action=save_social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ social: links })
      }).catch(() => {});
    }
  } catch (err) {
    console.error('Error saving social links:', err);
  }
}

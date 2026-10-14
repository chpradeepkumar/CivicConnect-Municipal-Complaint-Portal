// Free images sourced from Wikimedia Commons (see IMAGE_CREDITS).
// Category photos are keyed by the category's icon name so they work with seeded data.

export const SITE_IMAGES = {
  // Civic workers repairing the city — used as the home hero backdrop.
  hero: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Roadmen.jpg',
  // A municipal corporation headquarters building.
  about:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b3/Ripon_Building_panorama.jpg/1920px-Ripon_Building_panorama.jpg',
  // Reused on the login panel.
  login:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b3/Ripon_Building_panorama.jpg/1920px-Ripon_Building_panorama.jpg',
};

export const CATEGORY_IMAGES = {
  construction:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/36/Potholes_in_Bengaluru_road.jpg/1280px-Potholes_in_Bengaluru_road.jpg',
  'trash-2':
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bb/Overflowing_Hamburg_street_garbage_bin.jpg/1280px-Overflowing_Hamburg_street_garbage_bin.jpg',
  lightbulb:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b1/Lamp_post_in_Rajshahi.jpg/1280px-Lamp_post_in_Rajshahi.jpg',
  droplets:
    'https://upload.wikimedia.org/wikipedia/commons/3/33/Hand_Water-pump_-_geograph.org.uk_-_1122598.jpg',
  waves:
    'https://upload.wikimedia.org/wikipedia/commons/1/1e/Sewer_Drain_-_geograph.org.uk_-_3320532.jpg',
  'building-2':
    'https://upload.wikimedia.org/wikipedia/commons/f/fb/Damaged_Building%2C_Hungjao_%2814597942844%29.jpg',
};

export function categoryImage(icon) {
  return CATEGORY_IMAGES[icon] || '';
}

export const IMAGE_CREDITS = [
  { label: 'Road repair workers', file: 'Roadmen.jpg' },
  { label: 'Municipal corporation building', file: 'Ripon Building panorama.jpg' },
  { label: 'Potholes on a road', file: 'Potholes in Bengaluru road.jpg' },
  { label: 'Overflowing street garbage bin', file: 'Overflowing Hamburg street garbage bin.jpg' },
  { label: 'Street lamp post', file: 'Lamp post in Rajshahi.jpg' },
  { label: 'Hand water pump', file: 'Hand Water-pump - geograph.org.uk - 1122598.jpg' },
  { label: 'Street sewer drain', file: 'Sewer Drain - geograph.org.uk - 3320532.jpg' },
  { label: 'Damaged building', file: 'Damaged Building, Hungjao (14597942844).jpg' },
].map((c) => ({
  ...c,
  url: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(c.file.replace(/ /g, '_'))}`,
}));

export default SITE_IMAGES;

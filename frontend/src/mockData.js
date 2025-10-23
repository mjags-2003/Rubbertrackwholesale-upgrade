// Mock data for Rubber Track Wholesale

export const brands = [
  { id: 1, name: 'Bobcat', logo: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=200&h=100&fit=crop' },
  { id: 2, name: 'Kubota', logo: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=200&h=100&fit=crop' },
  { id: 3, name: 'Caterpillar', logo: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=200&h=100&fit=crop' },
  { id: 4, name: 'Case', logo: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=200&h=100&fit=crop' },
  { id: 5, name: 'Gehl', logo: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=200&h=100&fit=crop' },
  { id: 6, name: 'ASV', logo: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=200&h=100&fit=crop' },
  { id: 7, name: 'JCB', logo: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=200&h=100&fit=crop' },
  { id: 8, name: 'Yanmar', logo: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=200&h=100&fit=crop' },
  { id: 9, name: 'Takeuchi', logo: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=200&h=100&fit=crop' }
];

export const categories = [
  { id: 1, name: 'Rubber Tracks', slug: 'rubber-tracks', description: 'Premium quality rubber tracks for all major brands' },
  { id: 2, name: 'Undercarriage Parts', slug: 'undercarriage-parts', description: 'Complete undercarriage solutions' },
  { id: 3, name: 'Rollers', slug: 'rollers', description: 'Top and bottom rollers' },
  { id: 4, name: 'Sprockets', slug: 'sprockets', description: 'Drive sprockets and parts' },
  { id: 5, name: 'Idlers', slug: 'idlers', description: 'Front idlers and components' }
];

export const products = [
  {
    id: 1,
    sku: 'RT-450-86-56',
    title: 'Bobcat T190 Rubber Track',
    description: 'Premium rubber track for Bobcat T190 compact track loader. Heavy-duty construction with reinforced steel cords.',
    price: 1299.99,
    brand: 'Bobcat',
    category: 'Rubber Tracks',
    size: '450x86x56',
    partNumber: 'RT-450-86-56',
    images: [
      'https://images.unsplash.com/photo-1621574091584-4b4ea63b8f9a?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop'
    ],
    inStock: true,
    specifications: {
      width: '450mm',
      pitch: '86mm',
      links: '56',
      warranty: '1 Year'
    }
  },
  {
    id: 2,
    sku: 'RT-400-72-74',
    title: 'Kubota SVL95 Rubber Track',
    description: 'High-performance rubber track designed for Kubota SVL95. Exceptional traction and durability.',
    price: 1580.00,
    brand: 'Kubota',
    category: 'Rubber Tracks',
    size: '400x72x74',
    partNumber: 'V0611-28111',
    images: [
      'https://images.unsplash.com/photo-1621574091584-4b4ea63b8f9a?w=600&h=400&fit=crop'
    ],
    inStock: true,
    specifications: {
      width: '400mm',
      pitch: '72mm',
      links: '74',
      warranty: '1 Year'
    }
  },
  {
    id: 3,
    sku: 'RT-320-86-52',
    title: 'Cat 247B MTL Rubber Track',
    description: 'OEM quality rubber track for Caterpillar 247B Multi Terrain Loader. Superior performance and longevity.',
    price: 1340.00,
    brand: 'Caterpillar',
    category: 'Rubber Tracks',
    size: '320x86x52',
    partNumber: '420-9876',
    images: [
      'https://images.unsplash.com/photo-1621574091584-4b4ea63b8f9a?w=600&h=400&fit=crop'
    ],
    inStock: true,
    specifications: {
      width: '320mm',
      pitch: '86mm',
      links: '52',
      warranty: '1 Year'
    }
  },
  {
    id: 4,
    sku: 'UP-BR-001',
    title: 'Bottom Roller Assembly',
    description: 'Heavy-duty bottom roller for compact track loaders. Fits multiple brands and models.',
    price: 189.99,
    brand: 'Universal',
    category: 'Rollers',
    size: 'N/A',
    partNumber: 'BR-001',
    images: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop'
    ],
    inStock: true,
    specifications: {
      type: 'Single Flange',
      bearing: 'Sealed',
      warranty: '6 Months'
    }
  },
  {
    id: 5,
    sku: 'UP-SPR-002',
    title: 'Drive Sprocket',
    description: 'Precision-machined drive sprocket for skid steers and compact track loaders.',
    price: 429.99,
    brand: 'Universal',
    category: 'Sprockets',
    size: 'N/A',
    partNumber: 'SPR-002',
    images: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop'
    ],
    inStock: true,
    specifications: {
      teeth: '15',
      material: 'Hardened Steel',
      warranty: '6 Months'
    }
  },
  {
    id: 6,
    sku: 'RT-300-52-74',
    title: 'Takeuchi TL8 Rubber Track',
    description: 'Premium rubber track for Takeuchi TL8. Excellent traction in all conditions.',
    price: 1199.00,
    brand: 'Takeuchi',
    category: 'Rubber Tracks',
    size: '300x52x74',
    partNumber: 'TK-300-52',
    images: [
      'https://images.unsplash.com/photo-1621574091584-4b4ea63b8f9a?w=600&h=400&fit=crop'
    ],
    inStock: true,
    specifications: {
      width: '300mm',
      pitch: '52mm',
      links: '74',
      warranty: '1 Year'
    }
  }
];

export const testimonials = [
  {
    id: 1,
    name: 'Mike Johnson',
    company: 'Johnson Excavating',
    text: 'Best rubber tracks I\'ve purchased. Quality is outstanding and they last much longer than OEM.',
    rating: 5
  },
  {
    id: 2,
    name: 'Sarah Martinez',
    company: 'Martinez Construction',
    text: 'Fast shipping and excellent customer service. The tracks fit perfectly on our Bobcat fleet.',
    rating: 5
  },
  {
    id: 3,
    name: 'Tom Wilson',
    company: 'Wilson Landscaping',
    text: 'Great prices and the quality matches OEM. Will definitely order again.',
    rating: 5
  }
];

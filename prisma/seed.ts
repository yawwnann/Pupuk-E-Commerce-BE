import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create seller users first
  const hashedPassword = await bcrypt.hash('password123', 10);

  const seller1 = await prisma.user.upsert({
    where: { email: 'seller1@sedulurtani.com' },
    update: {},
    create: {
      email: 'seller1@sedulurtani.com',
      password_hash: hashedPassword,
      name: 'Toko Pupuk Subur',
      phone: '081234567890',
      role: 'seller'
    }
  });

  const seller2 = await prisma.user.upsert({
    where: { email: 'seller2@sedulurtani.com' },
    update: {},
    create: {
      email: 'seller2@sedulurtani.com',
      password_hash: hashedPassword,
      name: 'Toko Pertanian Maju',
      phone: '081234567891',
      role: 'seller'
    }
  });

  console.log('✅ Sellers created');

  // Create products with random images
  const products = [
    // Pupuk Organik
    {
      name: 'Pupuk Kompos Organik 10kg',
      description: 'Pupuk kompos organik berkualitas tinggi dari bahan alami. Cocok untuk semua jenis tanaman. Meningkatkan kesuburan tanah dan hasil panen.',
      weight: 10000, // 10kg in grams
      price: 45000,
      stock: 100,
      image_url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=500',
      seller_id: seller1.id
    },
    {
      name: 'Pupuk Kandang Ayam 5kg',
      description: 'Pupuk kandang dari kotoran ayam yang sudah difermentasi. Kaya akan nitrogen dan fosfor untuk pertumbuhan tanaman optimal.',
      weight: 5000,
      price: 25000,
      stock: 150,
      image_url: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=500',
      seller_id: seller1.id
    },
    {
      name: 'Pupuk Hijau Daun NPK 1kg',
      description: 'Pupuk NPK lengkap untuk pertumbuhan daun. Komposisi seimbang untuk tanaman hias dan sayuran.',
      weight: 1000,
      price: 35000,
      stock: 200,
      image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500',
      seller_id: seller2.id
    },
    
    // Pupuk Kimia
    {
      name: 'Pupuk Urea 50kg',
      description: 'Pupuk urea kadar tinggi untuk pertumbuhan vegetatif tanaman. Kandungan nitrogen 46%. Cocok untuk padi, jagung, dan sayuran.',
      weight: 50000,
      price: 180000,
      stock: 50,
      image_url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500',
      seller_id: seller2.id
    },
    {
      name: 'Pupuk NPK Mutiara 25kg',
      description: 'Pupuk NPK Mutiara 16:16:16 untuk semua fase pertumbuhan tanaman. Mudah larut dan cepat diserap.',
      weight: 25000,
      price: 250000,
      stock: 75,
      image_url: 'https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=500',
      seller_id: seller1.id
    },
    {
      name: 'Pupuk TSP (Triple Super Phosphate) 40kg',
      description: 'Pupuk fosfat tinggi untuk pembentukan bunga dan buah. P2O5 46%. Ideal untuk tanaman buah dan palawija.',
      weight: 40000,
      price: 320000,
      stock: 60,
      image_url: 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=500',
      seller_id: seller2.id
    },

    // Pupuk Cair
    {
      name: 'Pupuk Cair Organik 1 Liter',
      description: 'Pupuk cair organik untuk penyemprotan daun. Mengandung mikroorganisme menguntungkan dan hormon tumbuh alami.',
      weight: 1100,
      price: 55000,
      stock: 120,
      image_url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=500',
      seller_id: seller1.id
    },
    {
      name: 'Pupuk NPK Cair Premium 500ml',
      description: 'Pupuk NPK cair konsentrasi tinggi. Cepat diserap tanaman. Untuk tanaman hias, sayur, dan buah.',
      weight: 550,
      price: 45000,
      stock: 180,
      image_url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=500',
      seller_id: seller2.id
    },

    // Pupuk Khusus
    {
      name: 'Pupuk Khusus Cabai 10kg',
      description: 'Formulasi khusus untuk tanaman cabai. Meningkatkan produktivitas dan kualitas buah cabai.',
      weight: 10000,
      price: 120000,
      stock: 80,
      image_url: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=500',
      seller_id: seller1.id
    },
    {
      name: 'Pupuk Padi Sawah 50kg',
      description: 'Pupuk formulasi khusus padi sawah. Meningkatkan jumlah anakan dan bobot gabah. NPK 15:15:15.',
      weight: 50000,
      price: 280000,
      stock: 45,
      image_url: 'https://images.unsplash.com/photo-1536882240095-0379873feb4e?w=500',
      seller_id: seller2.id
    },
    {
      name: 'Pupuk Tanaman Hias 2kg',
      description: 'Pupuk slow release untuk tanaman hias. Membuat daun lebih hijau dan pertumbuhan optimal.',
      weight: 2000,
      price: 65000,
      stock: 150,
      image_url: 'https://images.unsplash.com/photo-1466781783364-36c955e42a7f?w=500',
      seller_id: seller1.id
    },
    {
      name: 'Pupuk Buah-buahan 15kg',
      description: 'Pupuk khusus tanaman buah. Mempercepat pembungaan dan pembuahan. Meningkatkan rasa manis buah.',
      weight: 15000,
      price: 165000,
      stock: 90,
      image_url: 'https://images.unsplash.com/photo-1464454709131-ffd692591ee5?w=500',
      seller_id: seller2.id
    },

    // Pupuk Mikro
    {
      name: 'Pupuk Mikro Lengkap 1kg',
      description: 'Pupuk mikro elemen lengkap (Fe, Mn, Zn, Cu, Bo, Mo). Mencegah kekurangan unsur hara mikro.',
      weight: 1000,
      price: 75000,
      stock: 100,
      image_url: 'https://images.unsplash.com/photo-1530836176360-f256cb634e5e?w=500',
      seller_id: seller1.id
    },
    {
      name: 'Pupuk Boron 500g',
      description: 'Pupuk khusus boron untuk pembentukan buah. Mencegah buah rontok dan keropos.',
      weight: 500,
      price: 45000,
      stock: 130,
      image_url: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=500',
      seller_id: seller2.id
    },
    {
      name: 'Pupuk Kalsium Nitrat 5kg',
      description: 'Pupuk kalsium untuk mencegah busuk ujung pada tomat dan cabai. Meningkatkan kualitas buah.',
      weight: 5000,
      price: 85000,
      stock: 110,
      image_url: 'https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=500',
      seller_id: seller1.id
    }
  ];

  console.log('🌾 Creating products...');

  for (const product of products) {
    await prisma.product.create({
      data: product
    });
  }

  console.log(`✅ Created ${products.length} products`);
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

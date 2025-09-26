import { db } from './db';
import { forumCategories, pharmacies, testimonials, users } from '@shared/schema';

async function seed() {
  console.log('Seeding database...');

  try {
    // Verifica se ci sono già utenti nel database
    const existingUsers = await db.select().from(users);
    if (existingUsers.length === 0) {
      console.log('Creating default users...');
      
      // Create test users (using only columns that exist in database)
    await db.insert(users).values([
      {
        username: 'testuser',
        password: 'test123', // Note: In production this should be hashed
        email: 'test@example.com',
        fullName: 'Test User',
        userType: 'patient',
        isVerified: true
      },
      {
        username: 'realtime',
        password: 'test123',
        email: 'realtime@test.com',
        fullName: 'Realtime Test User',
        userType: 'patient',
        isVerified: true
      },
      {
        username: 'dr_rossi',
        password: 'test123',
        email: 'marco.rossi@hospital.it',
        fullName: 'Dr. Marco Rossi',
        userType: 'professional',
        specialization: 'oncologia-medica',
        hospital: 'Ospedale San Raffaele',
        isVerified: true
      },
      {
        username: 'dr_bianchi',
        password: 'test123',
        email: 'anna.bianchi@hospital.it',
        fullName: 'Dr.ssa Anna Bianchi',
        userType: 'professional',
        specialization: 'radioterapia',
        hospital: 'Istituto Europeo di Oncologia',
        isVerified: true
      },
      {
        username: 'farmacia1',
        password: 'test123',
        email: 'farmacia@centrale.it',
        fullName: 'Farmacia Centrale',
        userType: 'pharmacy',
        isVerified: true
      },
      {
        username: 'farmacia2',
        password: 'test123',
        email: 'info@farmaciasanpaolo.it',
        fullName: 'Farmacia San Paolo',
        userType: 'pharmacy',
        isVerified: true
      },
      {
        username: 'farmacia3',
        password: 'test123',
        email: 'contact@farmaciamoderna.it',
        fullName: 'Farmacia Moderna',
        userType: 'pharmacy',
        isVerified: true
      }
    ]);
    console.log('Test users created: testuser/test123, realtime/test123, dr_rossi/test123, dr_bianchi/test123, farmacia1/test123, farmacia2/test123, farmacia3/test123');
    } else {
      console.log('Users already exist in database');
    }

    // Verifica e crea categorie del forum
    const existingCategories = await db.select().from(forumCategories);
    if (existingCategories.length === 0) {
      console.log('Creating forum categories...');
      // Forum categories
    await db.insert(forumCategories).values([
      { name: "Tumore al seno", slug: "breast-cancer", description: "Discussioni riguardanti il tumore al seno", postCount: 0 },
      { name: "Tumore al polmone", slug: "lung-cancer", description: "Discussioni riguardanti il tumore al polmone", postCount: 0 },
      { name: "Leucemia", slug: "leukemia", description: "Discussioni riguardanti la leucemia", postCount: 0 },
      { name: "Terapie e trattamenti", slug: "therapies-treatments", description: "Discussioni su diverse terapie e trattamenti", postCount: 0 },
      { name: "Supporto emotivo", slug: "emotional-support", description: "Supporto emotivo per pazienti e familiari", postCount: 0 }
    ]);
    console.log('Forum categories seeded');
    } else {
      console.log('Forum categories already exist');
    }

    // Verifica e crea farmacie
    const existingPharmacies = await db.select().from(pharmacies);
    if (existingPharmacies.length === 0) {
      console.log('Creating pharmacies...');
      // Pharmacies
    await db.insert(pharmacies).values([
      {
        name: "Farmacia San Paolo",
        address: "Via Roma 123",
        city: "Milano",
        region: "Lombardia",
        phone: "02 1234567",
        specializations: ["preparazioni-galeniche", "nutrizione-oncologica"],
        rating: 4,
        reviewCount: 42,
        imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=200&q=80",
        latitude: "45.4642",
        longitude: "9.1900"
      },
      {
        name: "Farmacia Centrale",
        address: "Corso Italia 45",
        city: "Roma",
        region: "Lazio",
        phone: "06 9876543",
        specializations: ["supporto-post-chemioterapia", "presidi-medico-chirurgici"],
        rating: 5,
        reviewCount: 35,
        imageUrl: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=200&q=80",
        latitude: "41.9028",
        longitude: "12.4964"
      },
      {
        name: "Farmacia Moderna",
        address: "Via Napoli 78",
        city: "Napoli",
        region: "Campania",
        phone: "081 5557777",
        specializations: ["preparazioni-galeniche", "nutrizione-oncologica", "presidi-medico-chirurgici"],
        rating: 3,
        reviewCount: 28,
        imageUrl: "https://images.unsplash.com/photo-1580281657702-257584239a55?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=200&q=80",
        latitude: "40.8518",
        longitude: "14.2681"
      }
    ]);
    console.log('Pharmacies seeded');
    } else {
      console.log('Pharmacies already exist');
    }

    // Verifica e crea testimonial
    const existingTestimonials = await db.select().from(testimonials);
    if (existingTestimonials.length === 0) {
      console.log('Creating testimonials...');
      // Testimonials
    await db.insert(testimonials).values([
      {
        name: "Luisa Bianchi",
        role: "Paziente",
        location: "Milano",
        content: "Grazie a Onconet24 ho potuto ricevere un secondo parere che ha cambiato il mio percorso terapeutico. La piattaforma mi ha permesso di contattare facilmente specialisti che altrimenti non avrei mai potuto raggiungere.",
        rating: 5,
        imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&h=50&q=80"
      },
      {
        name: "Dr. Andrea Conti",
        role: "Oncologo",
        location: "Torino",
        content: "Come oncologo, posso affermare che Onconet24 ha rivoluzionato il modo in cui interagisco con i pazienti. La piattaforma mi permette di offrire consulenze anche a persone che vivono lontano, espandendo notevolmente la mia capacità di aiutare.",
        rating: 5,
        imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&h=50&q=80"
      },
      {
        name: "Giovanni Russo",
        role: "Familiare di paziente",
        location: "Firenze",
        content: "Quando mio padre ha ricevuto la diagnosi, ci sentivamo persi. Il forum di Onconet24 ci ha messo in contatto con altre famiglie nella nostra situazione e con medici che ci hanno guidato attraverso tutto il percorso di cura.",
        rating: 4,
        imageUrl: "https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&h=50&q=80"
      }
    ]);
    console.log('Testimonials seeded');
    } else {
      console.log('Testimonials already exist');
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Esegui la funzione di seeding
seed()
  .then(() => console.log('Completed'))
  .catch((error) => {
    console.error('Error:', error);
  });

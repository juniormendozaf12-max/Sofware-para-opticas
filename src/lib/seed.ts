import { db, Timestamp } from './firebase';
import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';

export async function seedDatabase() {
  const patientsSnap = await getDocs(query(collection(db, 'patients'), limit(1)));
  if (!patientsSnap.empty) return; // Already seeded

  console.log('Seeding database...');

  // Seed Patients
  const patients = [
    { name: 'Elena Rodriguez Salas', dni: '48.291.004-K', isVIP: true, lastVisit: Timestamp.now(), photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200' },
    { name: 'Julianne Moore', dni: '34.552.129-K', isVIP: false, lastVisit: Timestamp.now(), photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200' },
    { name: 'Alejandro Sanz', dni: '12.345.678-A', isVIP: true, lastVisit: Timestamp.now(), photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200' },
  ];

  for (const p of patients) {
    const docRef = await addDoc(collection(db, 'patients'), p);
    
    // Seed Consultations for each patient
    await addDoc(collection(db, `patients/${docRef.id}/consultations`), {
      patientId: docRef.id,
      date: Timestamp.now(),
      reason: 'Control Anual',
      diagnosis: ['Miopía', 'Astigmatism'],
      notes: 'Paciente presenta visión borrosa a distancia.'
    });

    // Seed Prescriptions
    await addDoc(collection(db, `patients/${docRef.id}/prescriptions`), {
      patientId: docRef.id,
      date: Timestamp.now(),
      od: { sph: -2.75, cyl: -0.50, axis: 165, add: 1.50 },
      oi: { sph: -3.00, cyl: -0.75, axis: 15, add: 1.50 },
      dip: 63
    });
  }

  // Seed Inventory
  const inventory = [
    { material: 'Organic CR-39', sph: 0.00, cyl: 0.00, stock: 12 },
    { material: 'Organic CR-39', sph: 0.00, cyl: -0.25, stock: 8 },
    { material: 'Organic CR-39', sph: 0.00, cyl: -0.50, stock: 0 },
    { material: 'Organic CR-39', sph: -0.25, cyl: 0.00, stock: 15 },
    { material: 'Organic CR-39', sph: -0.25, cyl: -0.25, stock: 6 },
    { material: 'Organic CR-39', sph: -0.50, cyl: 0.00, stock: 0 },
  ];

  for (const i of inventory) {
    await addDoc(collection(db, 'inventory'), i);
  }

  console.log('Seeding complete.');
}

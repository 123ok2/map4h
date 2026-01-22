
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  updateDoc, 
  doc, 
  deleteDoc,
  serverTimestamp 
} from "firebase/firestore";
import { HelpRequest, HelpType, HelpStatus } from "../types";

const firebaseConfig = {
  apiKey: "AIzaSyCnb9zDOgguEDoqAeSZWolQ92R1Ck3j-jY",
  authDomain: "hopemap-d4288.firebaseapp.com",
  projectId: "hopemap-d4288",
  storageBucket: "hopemap-d4288.firebasestorage.app",
  messagingSenderId: "807197911890",
  appId: "1:807197911890:web:00fdc4c05dd2be1179e88b",
  measurementId: "G-BNSX5TZ0X5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

const COLLECTION_NAME = 'help_requests';

export const submitHelpRequest = async (
  lat: number, 
  lng: number, 
  type: HelpType, 
  requesterName: string,
  description: string, 
  contact: string,
  userId: string,
  imageUrl?: string
) => {
  try {
    await addDoc(collection(db, COLLECTION_NAME), {
      location: { lat, lng },
      type,
      requesterName,
      description,
      contact,
      imageUrl: imageUrl || null,
      status: 'waiting',
      createdAt: serverTimestamp(),
      createdBy: userId
    });
  } catch (error: any) {
    console.error("Error adding help request: ", error);
    throw error;
  }
};

export const updateHelpRequest = async (
  id: string,
  data: Partial<HelpRequest>
) => {
  try {
    const requestRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(requestRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error: any) {
    throw error;
  }
};

export const deleteHelpRequest = async (id: string) => {
  try {
    const requestRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(requestRef);
  } catch (error: any) {
    throw error;
  }
};

export const updateRequestStatus = async (
  id: string, 
  status: HelpStatus, 
  additionalData: Partial<HelpRequest> = {}
) => {
  try {
    const requestRef = doc(db, COLLECTION_NAME, id);
    const updatePayload: any = { 
      status,
      ...additionalData 
    };
    
    if (status === 'completed') {
      updatePayload.completedAt = serverTimestamp();
    }

    await updateDoc(requestRef, updatePayload);
  } catch (error: any) {
    throw error;
  }
};

export const subscribeToRequests = (
  callback: (requests: HelpRequest[]) => void, 
  onError: (error: any) => void
) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, 
    (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HelpRequest[];
      callback(requests);
    },
    (error) => {
      onError(error);
    }
  );
};

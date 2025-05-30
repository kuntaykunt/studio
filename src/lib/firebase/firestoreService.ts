
'use server'; // For potential use in Server Actions later, though primarily client-side for now

import { db } from '@/lib/firebase/config';
import type { Storybook, StoryPage } from '@/lib/types';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  orderBy,
  limit,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';

/**
 * IMPORTANT: Firestore Security Rules
 * -----------------------------------
 * You MUST set up Firestore security rules in your Firebase project console
 * to ensure data privacy and security. Users should only be able to read,
 * write, and delete their own storybooks.
 *
 * Example rules (rules_version = '2'; service cloud.firestore):
 *
 * match /databases/{database}/documents {
 *   match /storybooks/{storybookId} {
 *     // Allow read, write, delete only if the userId on the document matches the authenticated user's UID
 *     allow read, write, delete: if request.auth != null && request.auth.uid == resource.data.userId;
 *     // Allow create if the userId in the new document will be the authenticated user's UID
 *     allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
 *   }
 * }
 *
 * Also consider validating data types and required fields in your security rules.
 * For image data URIs (pages.*.imageUrl): These can be very large.
 * Consider moving to Firebase Storage and storing URLs instead for scalability.
 */

const STORYBOOKS_COLLECTION = 'storybooks';

// Helper to convert Firestore doc data to Storybook type
const fromFirestore = (docSnap: QueryDocumentSnapshot<DocumentData> | DocumentData): Storybook => {
  const data = typeof docSnap.data === 'function' ? docSnap.data() : docSnap; // Handle both snapshot and direct data
  return {
    id: typeof docSnap.id === 'string' ? docSnap.id : '', // Ensure id is present if it's a snapshot
    userId: data.userId,
    title: data.title,
    originalPrompt: data.originalPrompt,
    childAge: data.childAge,
    voiceGender: data.voiceGender,
    rewrittenStoryText: data.rewrittenStoryText,
    pages: data.pages.map((page: any) => ({ // Explicitly type page to avoid implicit any
      ...page,
      // No date conversion needed for page sub-objects unless they contain Timestamps
    })) as StoryPage[],
    createdAt: (data.createdAt as Timestamp)?.toDate ? (data.createdAt as Timestamp).toDate() : new Date(data.createdAt), // Handle both Timestamp and already converted dates
  } as Storybook;
};


export async function addStorybook(
  userId: string,
  storybookData: Omit<Storybook, 'id' | 'userId' | 'createdAt'>
): Promise<string> {
  if (!userId) {
    throw new Error('User must be authenticated to add a storybook.');
  }
  try {
    const docRef = await addDoc(collection(db, STORYBOOKS_COLLECTION), {
      ...storybookData,
      userId: userId,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding storybook to Firestore:', error);
    throw new Error('Failed to save storybook.');
  }
}

export async function getUserStorybooks(userId: string): Promise<Storybook[]> {
  if (!userId) {
    console.warn('Attempted to fetch storybooks without a userId.');
    return [];
  }
  try {
    const q = query(
      collection(db, STORYBOOKS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => fromFirestore(docSnap));
  } catch (error) {
    console.error('Error fetching user storybooks:', error);
    throw new Error('Failed to fetch storybooks.');
  }
}

export async function getStorybookById(storybookId: string, userId: string): Promise<Storybook | null> {
   if (!userId) {
    throw new Error('User must be authenticated to fetch a storybook.');
  }
  try {
    const docRef = doc(db, STORYBOOKS_COLLECTION, storybookId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const storybook = fromFirestore(docSnap);
      // Verify ownership
      if (storybook.userId === userId) {
        return storybook;
      } else {
        console.warn(`User ${userId} attempted to access storybook ${storybookId} owned by ${storybook.userId}`);
        return null; // Or throw an explicit "access denied" error
      }
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching storybook by ID:', error);
    throw new Error('Failed to fetch storybook details.');
  }
}

export async function deleteStorybook(storybookId: string, userId: string): Promise<void> {
   if (!userId) {
    throw new Error('User must be authenticated to delete a storybook.');
  }
  try {
    // Optional: Fetch the document first to verify ownership before deleting,
    // though security rules should be the primary enforcer.
    const storybookDoc = await getStorybookById(storybookId, userId);
    if (!storybookDoc) {
        console.warn(`Storybook ${storybookId} not found or user ${userId} does not have permission to delete.`);
        throw new Error("Storybook not found or permission denied.");
    }

    await deleteDoc(doc(db, STORYBOOKS_COLLECTION, storybookId));
  } catch (error) {
    console.error('Error deleting storybook from Firestore:', error);
    // Don't rethrow "Storybook not found or permission denied." if it was already handled.
    if (error instanceof Error && error.message.startsWith("Storybook not found")) {
        throw error;
    }
    throw new Error('Failed to delete storybook.');
  }
}

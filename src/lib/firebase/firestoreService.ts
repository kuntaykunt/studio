
'use server';

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
 *     // Validate data types and structure
 *     allow create, update: if request.resource.data.title is string &&
 *                           request.resource.data.childAge is number &&
 *                           request.resource.data.pages is list &&
 *                           request.resource.data.userId is string &&
 *                           request.resource.data.originalPrompt is string &&
 *                           request.resource.data.voiceGender is string &&
 *                           request.resource.data.rewrittenStoryText is string &&
 *                           (request.resource.data.storyStyleDescription == null || request.resource.data.storyStyleDescription is string) &&
 *                           (request.resource.data.selectedLearningTagIds == null || request.resource.data.selectedLearningTagIds is list); 
 *   }
 * }
 */

const STORYBOOKS_COLLECTION = 'storybooks';

// Helper to convert Firestore doc data to Storybook type
const fromFirestore = (docSnap: QueryDocumentSnapshot<DocumentData> | DocumentData): Storybook => {
  const data = typeof docSnap.data === 'function' ? docSnap.data() : docSnap;
  return {
    id: typeof (docSnap as QueryDocumentSnapshot).id === 'string' ? (docSnap as QueryDocumentSnapshot).id : '',
    userId: data.userId,
    title: data.title,
    originalPrompt: data.originalPrompt,
    childAge: data.childAge,
    voiceGender: data.voiceGender,
    storyStyleDescription: data.storyStyleDescription,
    selectedLearningTagIds: data.selectedLearningTagIds || [], // Added
    rewrittenStoryText: data.rewrittenStoryText,
    pages: (data.pages || []).map((page: any) => ({
      pageNumber: page.pageNumber,
      text: page.text,
      transformedDialogue: page.transformedDialogue || undefined,
      imageUrl: page.imageUrl,
      imageMatchesText: page.imageMatchesText,
      voiceoverUrl: page.voiceoverUrl,
      animationUrl: page.animationUrl,
      dataAiHint: page.dataAiHint,
    })) as StoryPage[],
    createdAt: (data.createdAt as Timestamp)?.toDate ? (data.createdAt as Timestamp).toDate() : new Date(data.createdAt as string | number | Date),
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
      storyStyleDescription: storybookData.storyStyleDescription || null, 
      selectedLearningTagIds: storybookData.selectedLearningTagIds || [], // Added
      pages: storybookData.pages.map(p => ({
        pageNumber: p.pageNumber,
        text: p.text,
        transformedDialogue: p.transformedDialogue || null,
        imageUrl: p.imageUrl || null,
        imageMatchesText: p.imageMatchesText || false,
        voiceoverUrl: p.voiceoverUrl || null,
        animationUrl: p.animationUrl || null,
        dataAiHint: p.dataAiHint || null,
      })),
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
      if (storybook.userId === userId) {
        return storybook;
      } else {
        console.warn(`User ${userId} attempted to access storybook ${storybookId} owned by ${storybook.userId}`);
        return null;
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
    const storybookDoc = await getStorybookById(storybookId, userId);
    if (!storybookDoc) {
        console.warn(`Storybook ${storybookId} not found or user ${userId} does not have permission to delete.`);
        throw new Error("Storybook not found or permission denied.");
    }

    await deleteDoc(doc(db, STORYBOOKS_COLLECTION, storybookId));
  } catch (error) {
    console.error('Error deleting storybook from Firestore:', error);
    if (error instanceof Error && error.message.startsWith("Storybook not found")) {
        throw error;
    }
    throw new Error('Failed to delete storybook.');
  }
}

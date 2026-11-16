import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { firebaseAuth, firestore } from '../lib/firebase';
import { CareerSave } from '../types/football';
import { loadCareer, saveCareer, SAVE_SLOTS } from './storage';

const CHUNK_SIZE = 180_000;
const MAX_BATCH_WRITES = 450;

function saveRef(uid: string, slotId: string) {
  return doc(firestore, 'users', uid, 'careerSaves', slotId);
}

function splitIntoChunks(value: string): string[] {
  const chunks: string[] = [];
  for (let offset = 0; offset < value.length; offset += CHUNK_SIZE) {
    chunks.push(value.slice(offset, offset + CHUNK_SIZE));
  }
  return chunks;
}

async function uploadSave(uid: string, save: CareerSave): Promise<void> {
  const payload: CareerSave = { ...save, updatedAt: Math.max(save.updatedAt || 0, Date.now()) };
  const serialized = JSON.stringify(payload);
  const chunks = splitIntoChunks(serialized);
  const parentRef = saveRef(uid, save.slotId);
  const oldChunks = await getDocs(collection(parentRef, 'chunks'));

  let pendingBatch = writeBatch(firestore);\n  let pendingWrites = 0;\n  const operations: Array<() => void> = [];
  chunks.forEach((data, index) => {
    operations.push(() => {
      const chunkId = `chunk_${String(index).padStart(4, '0')}`;
      const chunkRef = doc(parentRef, 'chunks', chunkId);
      pendingBatch.set(chunkRef, { index, data });
    });
  });
  oldChunks.docs.forEach((oldChunk) => {
    const index = Number(oldChunk.data().index);
    if (!Number.isInteger(index) || index >= chunks.length) {
      operations.push(() => pendingBatch.delete(oldChunk.ref));
    }
  });

  let pendingBatch = writeBatch(firestore);
  let pendingWrites = 0;
  for (const operation of operations) {
    operation();
    pendingWrites += 1;
    if (pendingWrites >= MAX_BATCH_WRITES) {
      await pendingBatch.commit();
      pendingBatch = writeBatch(firestore);
      pendingWrites = 0;
    }
  }
  if (pendingWrites) await pendingBatch.commit();

  await setDoc(parentRef, {
    slotId: save.slotId,
    updatedAt: payload.updatedAt,
    chunkCount: chunks.length,
    schemaVersion: 1,
  });
}

async function downloadSave(uid: string, slotId: string, chunkCount: number): Promise<CareerSave | null> {
  const parentRef = saveRef(uid, slotId);
  const snapshot = await getDocs(collection(parentRef, 'chunks'));
  const ordered = snapshot.docs
    .map((item) => ({ index: Number(item.data().index), data: item.data().data }))
    .filter((item) => Number.isInteger(item.index) && typeof item.data === 'string')
    .sort((a, b) => a.index - b.index);

  if (ordered.length !== chunkCount || ordered.some((item, index) => item.index !== index)) {
    throw new Error('A cloud career save is incomplete. Your local save has been kept safe.');
  }

  const parsed = JSON.parse(ordered.map((item) => item.data).join('')) as CareerSave;
  if (!parsed || parsed.slotId !== slotId) {
    throw new Error('The cloud career save could not be verified. Your local save has been kept safe.');
  }
  return parsed;
}

export interface CloudSyncResult {
  uploaded: number;
  downloaded: number;
  unchanged: number;
}

export async function syncCareerSaves(uid: string): Promise<CloudSyncResult> {
  const result: CloudSyncResult = { uploaded: 0, downloaded: 0, unchanged: 0 };

  for (const slotId of SAVE_SLOTS) {
    const localSave = await loadCareer(slotId);
    const parentRef = saveRef(uid, slotId);
    const cloudSnapshot = await getDoc(parentRef);

    if (!cloudSnapshot.exists()) {
      if (localSave) {
        await uploadSave(uid, localSave);
        result.uploaded += 1;
      }
      continue;
    }

    const cloudData = cloudSnapshot.data();
    const cloudUpdatedAt = Number(cloudData.updatedAt) || 0;
    const chunkCount = Number(cloudData.chunkCount) || 0;

    if (!localSave || cloudUpdatedAt > (localSave.updatedAt || 0)) {
      if (!chunkCount) throw new Error('A cloud career save is missing its data.');
      const cloudSave = await downloadSave(uid, slotId, chunkCount);
      if (cloudSave) {
        await saveCareer(cloudSave);
        result.downloaded += 1;
      }
    } else if ((localSave.updatedAt || 0) > cloudUpdatedAt) {
      await uploadSave(uid, localSave);
      result.uploaded += 1;
    } else {
      result.unchanged += 1;
    }
  }

  return result;
}

export async function saveCareerToCloud(save: CareerSave): Promise<void> {
  const user = firebaseAuth.currentUser;
  if (!user) return;
  await uploadSave(user.uid, save);
}

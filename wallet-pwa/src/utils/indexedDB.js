import { openDB } from 'idb'

const DB_NAME = 'rozgarid-wallet'
const DB_VERSION = 1

const getDB = () => openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('credentials')) {
      db.createObjectStore('credentials', { keyPath: '_id' })
    }
    if (!db.objectStoreNames.contains('pendingSync')) {
      db.createObjectStore('pendingSync', { keyPath: 'id', autoIncrement: true })
    }
  },
})

// ─── Credentials ──────────────────────────────────────
export const saveCredentials = async (credentials) => {
  const db = await getDB()
  const tx = db.transaction('credentials', 'readwrite')
  for (const cred of credentials) {
    await tx.store.put(cred)
  }
  await tx.done
}

export const getLocalCredentials = async () => {
  const db = await getDB()
  return db.getAll('credentials')
}

export const getLocalCredential = async (id) => {
  const db = await getDB()
  return db.get('credentials', id)
}

export const deleteLocalCredential = async (id) => {
  const db = await getDB()
  return db.delete('credentials', id)
}

export const clearLocalCredentials = async () => {
  const db = await getDB()
  const tx = db.transaction('credentials', 'readwrite')
  await tx.store.clear()
  await tx.done
}


// ─── Pending Sync Queue ─────────────────────────────
export const addPendingSync = async (item) => {
  const db = await getDB()
  return db.add('pendingSync', { ...item, timestamp: Date.now() })
}

export const getPendingSync = async () => {
  const db = await getDB()
  return db.getAll('pendingSync')
}

export const clearPendingSync = async () => {
  const db = await getDB()
  const tx = db.transaction('pendingSync', 'readwrite')
  await tx.store.clear()
  await tx.done
}

export const removePendingItem = async (id) => {
  const db = await getDB()
  return db.delete('pendingSync', id)
}

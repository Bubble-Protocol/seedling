/* eslint-disable no-restricted-globals */

const DB_VERSION = 1;

let localStorage = {
  name: "null-storage",
  read: () => {},
  write: () => {},
  remove: () => {}
};

export default localStorage;


export async function initialiseLocalStorage(id) {
  const storage = new IndexedDbStorage(id);
  localStorage.name = storage.name;
  localStorage.read = storage.read.bind(storage);
  localStorage.write = storage.write.bind(storage);
  localStorage.remove = storage.remove.bind(storage);
  return storage.initialise();
}


//
// IndexedDB Storage
//

class IndexedDbStorage {

  constructor(id) {
    this.name = 'IndexedDB';
    this.id = id;
    this.values = {};
    this.read = this.read.bind(this);
    this.write = this.write.bind(this);
    this.remove = this.remove.bind(this);
    this.storeName = "keyValuePairs";
    this.messageTable = "messages";
  }

  initialise() {
    return new Promise((resolve, reject) => {
      
      const openRequest = self.indexedDB.open(this.id, DB_VERSION);

      openRequest.onerror = (event) => {
        console.error("indexedDB error:", event.target.error);
        reject(event.target.error);
      }

      openRequest.onupgradeneeded = (event) => {
        const oldVersion = event.oldVersion;
        const db = event.target.result;
        console.trace("indexedDB upgrade needed from", oldVersion, 'to', db.version);

        switch (oldVersion) {
          case 0:
            db.createObjectStore(this.storeName, {keyPath: 'key'});
            const msgStore = db.createObjectStore(this.messageTable, {keyPath: 'id'});
            msgStore.createIndex("by_conversation", "conversationId");
            break;
        }
      }

      openRequest.onsuccess = (event) => {
        console.trace("indexedDB open");
        this.db = event.target.result;
        this._load(resolve, reject);
      }

    })
  }

  _upgrade() {

  }

  read(key) {
    if (key === undefined) return this.values;
    return this.values[key];
  }
  
  write(key, value) {
    this.values[key] = value;
    this._save();
  }
  
  remove(key) {
    this.values[key] = undefined;
    this._save();
  }

  _load(resolve, reject) {
    try {
      const transaction = this.db.transaction(this.storeName, 'readwrite');
      transaction.onerror = (event) => {
        console.error("indexedDB transaction error:", event.target.error);
        if (reject) reject(event.target.error);
      }
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();
      request.onsuccess = event => {
        event.target.result.forEach( item => {
          if (item.key !== "undefined") this.values[item.key] = item.value;
        })
        if (resolve) resolve();
      }
      request.onerror = event => {
        console.error("indexedDB getAll request error:", event.target.error);
        if (reject) reject(event.target.error);
      }
    }
    catch (error) {
      console.error('indexedDB load failed', error);
      if (reject) reject(error);
    }
  }
  
  _save() {
    const transaction = this.db.transaction(this.storeName, 'readwrite');
    transaction.onerror = (event) => {
      console.error("indexedDB transaction error:", event.target.error);
    }
    const store = transaction.objectStore(this.storeName);
    const values = this.values;
    for(let key in values) {
      if (Object.prototype.hasOwnProperty.call(values, key)) {
        try {
          const request = store.put({key: key, value: values[key]});
          request.onerror = event => {
            console.error('indexedDB store.put error', event.target.error);
          }
        }
        catch (error) {
          console.error('indexedDB store.put failed', error);
        }
      }
    }
  }
  
}

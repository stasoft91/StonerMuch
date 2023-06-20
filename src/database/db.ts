import Dexie from 'dexie'
import type { Table } from 'dexie'

export interface Puff {
  id?: number
  timestamp: number
  weight: number
  icon?: 'joint' | 'bong' | 'bolt'
  temperature?: number
  note?: string
}
export interface Settings {
  id?: number
  lastExport?: number
  jointWeight: number
  boltWeight: number
  bongWeight: number
}

export class DexieDB extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  puffs!: Table<Puff>
  settings!: Table<Settings>

  constructor() {
    super('pufflogger')

    this.version(3).stores({
      puffs: '++id, timestamp, weight, icon, temperature, note', // Primary key and indexed props
      settings: '++id, lastExport, jointWeight, boltWeight, bongWeight' // Primary key and indexed props
    })
  }
}

export const db = new DexieDB()

export type CharMeta = {
  guid: string;
  character: string;
  server: string;
  raceName: string;
  className: string;
  spec: string;
  mpKey: string;
  mpKeyTimeOut: number;
  resting: boolean;
  warMode: boolean;
  heritageArmor: boolean;
  classID: number;
  raceID: number;
  lastSeen: number;
  il: number;
  playedTotal: number;
  money: number;
  mp: number;
  level: number;
  zone: string;
  currency: Record<string, number>;
  meta: boolean;
  faction: string;
  guildName: string;
  guildRankName: string;
  guildRankIndex: number;
};
export interface Character {
  e_id: string;
  name: string;
  server: string;
  level: number;
  playerClass: string;
  rase: string;
  faction: string;
  meta: {
    raw?: CharMeta;
    weekly?: { key: string; completed: boolean }[];
    instances?: { instance: string; difficulties: number[] }[];
    vault?: {
      v1: (number | string)[];
      v2: (number | string)[];
      v3: (number | string)[];
    };
  };
}

export interface Weekly {
  e_id: string;
  anzeige_text: string;
  note: string | null;
  weekly_type: number;
}

export interface Instanzen {
  e_id: string;
  expansion: number;
  instance_type: string;
  holiday: boolean;
}

export type PreloadData = {
  classList: [string, string][];
  weekly: Weekly[];
  instanzen: Instanzen[];
};

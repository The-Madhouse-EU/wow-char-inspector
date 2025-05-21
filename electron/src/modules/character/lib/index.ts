export interface ProfileData {
  _links: Links;
  id: number;
  wow_accounts: WowAccount[];
  collections: Collections;
}

export interface Links {
  self: Self;
  user: User;
  profile: Profile;
}

export interface Self {
  href: string;
}

export interface User {
  href: string;
}

export interface Profile {
  href: string;
}

export interface WowAccount {
  id: number;
  characters: Character[];
}

export interface Character {
  character: Character2;
  protected_character: ProtectedCharacter;
  name: string;
  id: number;
  realm: Realm;
  playable_class: PlayableClass;
  playable_race: PlayableRace;
  gender: Gender;
  faction: Faction;
  level: number;
}

export interface Character2 {
  href: string;
}

export interface ProtectedCharacter {
  href: string;
}

export interface Realm {
  key: Key;
  name: string;
  id: number;
  slug: string;
}

export interface Key {
  href: string;
}

export interface PlayableClass {
  key: Key;
  name: string;
  id: number;
}

export interface PlayableRace {
  key: Key;
  name: string;
  id: number;
}

export interface Gender {
  type: string;
  name: string;
}

export interface Faction {
  type: string;
  name: string;
}

export interface Collections {
  href: string;
}

import { CoreEntity, Entity, EProperties } from '@grandlinex/e-kernel';

export enum PFaction {
  'Horde' = 'Horde',
  'Allianz' = 'Allianz',
}

@Entity('Faction')
export default class Faction extends CoreEntity {
  constructor(props?: EProperties<Faction> & { e_id: PFaction }) {
    super(props?.e_id);
  }
}

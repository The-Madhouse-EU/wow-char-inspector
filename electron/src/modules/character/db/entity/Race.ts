import { Column, CoreEntity, Entity, EProperties } from '@grandlinex/e-kernel';
import { PFaction } from './Faction';

@Entity('Race')
export default class Race extends CoreEntity {
  @Column({
    dataType: 'string',
  })
  faction: PFaction;

  @Column({
    dataType: 'string',
  })
  race_name: string;

  constructor(props?: EProperties<Race> & { e_id: string }) {
    super(props?.e_id);
    this.faction = props?.faction ?? PFaction.Horde;
    this.race_name = props?.race_name ?? '';
  }
}

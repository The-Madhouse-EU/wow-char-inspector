import { Column, CoreEntity, Entity, EProperties } from '@grandlinex/e-kernel';
import { MHData } from '../../util/MHParser';
import { CharProgress } from '../../util/SIParser';

@Entity('Character')
export default class Character extends CoreEntity {
  @Column({
    dataType: 'string',
  })
  name: string;

  @Column({
    dataType: 'string',
  })
  server: string;

  @Column({
    dataType: 'int',
  })
  level: number;

  @Column({
    dataType: 'string',
  })
  playerClass: string;

  @Column({
    dataType: 'string',
  })
  rase: string;

  @Column({
    dataType: 'string',
  })
  faction: string;

  @Column({ dataType: 'json' })
  meta: {
    raw?: MHData['itemArr'][number];
    weekly?: CharProgress['weekly'];
    instances?: CharProgress['instances'];
    vault?: CharProgress['vault'];
  };

  constructor(props?: EProperties<Character> & { e_id?: string }) {
    super(props?.e_id);
    this.name = props?.name ?? '';
    this.server = props?.server ?? '';
    this.level = props?.level ?? 0;
    this.playerClass = props?.playerClass ?? '';
    this.rase = props?.rase ?? '';
    this.faction = props?.faction ?? '';
    this.meta = props?.meta ?? {};
  }
}

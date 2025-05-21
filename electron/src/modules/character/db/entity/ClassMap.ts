import { Column, CoreEntity, Entity, EProperties } from '@grandlinex/e-kernel';

@Entity('ClassMap')
export default class ClassMap extends CoreEntity {
  @Column({
    dataType: 'string',
  })
  race: string;

  @Column({
    dataType: 'string',
  })
  playerClass: string;

  constructor(props?: EProperties<ClassMap>) {
    super();
    this.race = props?.race ?? '';
    this.playerClass = props?.playerClass ?? '';
  }
}

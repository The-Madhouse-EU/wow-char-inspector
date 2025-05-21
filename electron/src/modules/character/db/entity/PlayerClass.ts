import { Column, CoreEntity, Entity, EProperties } from '@grandlinex/e-kernel';

export enum PClass {
  'Dämonenjäger' = 'Dämonenjäger',
  'Druide' = 'Druide',
  'Hexenmeister' = 'Hexenmeister',
  'Jäger' = 'Jäger',
  'Krieger' = 'Krieger',
  'Magier' = 'Magier',
  'Mönch' = 'Mönch',
  'Paladin' = 'Paladin',
  'Priester' = 'Priester',
  'Rufer' = 'Rufer',
  'Schamane' = 'Schamane',
  'Schurke' = 'Schurke',
  'Todesritter' = 'Todesritter',
}

@Entity('PlayerClass')
export default class PlayerClass extends CoreEntity {
  @Column({
    dataType: 'string',
  })
  color: string;

  @Column({
    dataType: 'string',
  })
  class_name: PClass;

  constructor(props?: EProperties<PlayerClass> & { e_id: string }) {
    super(props?.e_id);
    this.color = props?.color || '#FFFFFF';
    this.class_name = props?.class_name || PClass.Krieger;
  }
}

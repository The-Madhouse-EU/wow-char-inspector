import { Column, CoreEntity, Entity, EProperties } from '@grandlinex/e-kernel';

@Entity('Instanzen')
export default class Instanzen extends CoreEntity {
  @Column({
    dataType: 'int',
  })
  expansion: number;

  @Column({
    dataType: 'string',
  })
  instance_type: string;

  @Column({
    dataType: 'boolean',
  })
  holiday: boolean;

  constructor(props?: EProperties<Instanzen> & { e_id: string }) {
    super(props?.e_id);
    this.expansion = props?.expansion ?? 0;
    this.instance_type = props?.instance_type ?? '';
    this.holiday = props?.holiday ?? false;
  }
}

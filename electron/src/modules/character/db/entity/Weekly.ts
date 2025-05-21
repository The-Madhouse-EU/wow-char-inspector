import { Column, CoreEntity, Entity, EProperties } from '@grandlinex/e-kernel';

@Entity('Weekly')
export default class Weekly extends CoreEntity {
  @Column({
    dataType: 'string',
  })
  anzeige_text: string;

  @Column({
    dataType: 'string',
    canBeNull: true,
  })
  note: string | null;

  @Column({
    dataType: 'int',
  })
  weekly_type: number;

  constructor(props?: EProperties<Weekly> & { e_id: string }) {
    super(props?.e_id);
    this.anzeige_text = props?.anzeige_text ?? '';
    this.weekly_type = props?.weekly_type ?? 0;
    this.note = props?.note || null;
  }
}

import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn, OneToMany } from 'typeorm';
import { GastoComun } from './gasto-comun.entity';
import { Parcela } from './parcela.entity';
import { Pago } from './pago.entity';

@Entity('GastoParcela')
export class GastoParcela {
  @PrimaryColumn({ name: 'idGasto' })
  idGasto: number;

  @PrimaryColumn({ name: 'idParcela' })
  idParcela: number;

  @Column({ name: 'monto_prorrateado', type: 'decimal', precision: 10, scale: 2 })
  montoProrreateado: number;

  @Column({
    type: 'enum',
    enum: ['Pendiente', 'Pagado', 'Atrasado'],
    default: 'Pendiente'
  })
  estado: string;

  @ManyToOne(() => GastoComun, gastoComun => gastoComun.gastosParcela)
  @JoinColumn({ name: 'idGasto' })
  gastoComun: GastoComun;

  @ManyToOne(() => Parcela, parcela => parcela.gastosParcela)
  @JoinColumn({ name: 'idParcela' })
  parcela: Parcela;

  @OneToMany(() => Pago, pago => pago.gastoParcela)
  pagos: Pago[];
} 
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Comunidad } from './comunidad.entity';
import { GastoParcela } from './gasto-parcela.entity';

@Entity('GastoComun')
export class GastoComun {
  @PrimaryGeneratedColumn({ name: 'idGasto' })
  id: number;

  @Column({ length: 255 })
  concepto: string;

  @Column({ name: 'montoTotal', type: 'decimal', precision: 10, scale: 2 })
  montoTotal: number;

  @Column({ name: 'fechaVencimiento', type: 'date' })
  fechaVencimiento: Date;

  @Column({
    type: 'enum',
    enum: ['Cuota Ordinaria', 'Cuota Extraordinaria', 'Multa', 'Otro'],
    default: 'Cuota Ordinaria'
  })
  tipo: string;

  @Column({ name: 'idComunidad' })
  idComunidad: number;

  @ManyToOne(() => Comunidad)
  @JoinColumn({ name: 'idComunidad' })
  comunidad: Comunidad;

  @Column({
    type: 'enum',
    enum: ['Pendiente', 'Activo', 'Cerrado'],
    default: 'Pendiente'
  })
  estado: string;

  @OneToMany(() => GastoParcela, gastoParcela => gastoParcela.gastoComun)
  gastosParcela: GastoParcela[];
} 
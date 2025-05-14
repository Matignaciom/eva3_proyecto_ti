import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from './usuario.entity';
import { GastoParcela } from './gasto-parcela.entity';

@Entity('Pago')
export class Pago {
  @PrimaryGeneratedColumn({ name: 'idPago' })
  id: number;

  @Column({ name: 'montoPagado', type: 'decimal', precision: 10, scale: 2 })
  montoPagado: number;

  @Column({ name: 'fechaPago', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  fechaPago: Date;

  @Column({
    type: 'enum',
    enum: ['Pendiente', 'Pagado', 'Fallido'],
    default: 'Pendiente'
  })
  estado: string;

  @Column({ name: 'transaccion_id', length: 255, nullable: true, unique: true })
  transaccionId: string;

  @Column({ name: 'comprobante', length: 50 })
  comprobante: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ name: 'idUsuario' })
  idUsuario: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'idUsuario' })
  usuario: Usuario;

  @Column({ name: 'idGastoParcela' })
  idGastoParcela: number;

  @ManyToOne(() => GastoParcela, gastoParcela => gastoParcela.pagos)
  @JoinColumn({ name: 'idGastoParcela', referencedColumnName: 'idGasto' })
  gastoParcela: GastoParcela;
} 
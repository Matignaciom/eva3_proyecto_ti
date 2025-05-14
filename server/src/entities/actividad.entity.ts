import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from './usuario.entity';
import { Parcela } from './parcela.entity';

@Entity('Actividad')
export class Actividad {
  @PrimaryGeneratedColumn({ name: 'idActividad' })
  id: number;

  @Column({
    type: 'enum',
    enum: ['Pago', 'Documento', 'Notificación', 'Otro']
  })
  tipo: string;

  @Column({ length: 255 })
  descripcion: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @Column({ name: 'idUsuario' })
  idUsuario: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'idUsuario' })
  usuario: Usuario;

  @Column({ name: 'idParcela' })
  idParcela: number;

  @ManyToOne(() => Parcela, parcela => parcela.actividades)
  @JoinColumn({ name: 'idParcela' })
  parcela: Parcela;
} 
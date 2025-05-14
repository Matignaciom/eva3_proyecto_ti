import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('Notificacion')
export class Notificacion {
  @PrimaryGeneratedColumn({ name: 'idNotificacion' })
  id: number;

  @Column({
    type: 'enum',
    enum: ['email', 'push'],
  })
  tipo: string;

  @Column({ type: 'text' })
  contenido: string;

  @Column({ name: 'fecha_envio', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  fechaEnvio: Date;

  @Column({ name: 'idUsuario' })
  idUsuario: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'idUsuario' })
  usuario: Usuario;

  @Column({ type: 'boolean', default: false })
  leida: boolean;
} 
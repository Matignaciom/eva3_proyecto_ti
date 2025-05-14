import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Comunidad } from './comunidad.entity';

@Entity('Usuario')
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'idUsuario' })
  id: number;

  @Column({ name: 'nombreCompleto', length: 255 })
  nombreCompleto: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ name: 'contrasena', length: 64 })
  password: string;

  @Column({
    type: 'enum',
    enum: ['Administrador', 'Copropietario'],
    default: 'Copropietario'
  })
  rol: string;

  @Column({ length: 64 })
  rut: string;

  @Column({ name: 'idComunidad' })
  idComunidad: number;

  @ManyToOne(() => Comunidad, comunidad => comunidad.usuarios)
  @JoinColumn({ name: 'idComunidad' })
  comunidad: Comunidad;

  @Column({ nullable: true })
  telefono: string;

  @Column({ nullable: true })
  direccion: string;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn()
  fechaCreacion: Date;

  @UpdateDateColumn()
  fechaActualizacion: Date;
} 
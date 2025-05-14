import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('Comunidad')
export class Comunidad {
  @PrimaryGeneratedColumn({ name: 'idComunidad' })
  id: number;

  @Column({ length: 255 })
  nombre: string;

  @Column({ name: 'fecha_creacion', type: 'date', default: () => 'CURRENT_DATE' })
  fechaCreacion: Date;

  @OneToMany(() => Usuario, usuario => usuario.comunidad)
  usuarios: Usuario[];
} 
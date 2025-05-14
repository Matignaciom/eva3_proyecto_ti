import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Comunidad } from './comunidad.entity';
import { UsuarioAviso } from './usuario-aviso.entity';

@Entity('Aviso')
export class Aviso {
  @PrimaryGeneratedColumn({ name: 'idAviso' })
  id: number;

  @Column({ length: 255 })
  titulo: string;

  @Column({ type: 'text' })
  contenido: string;

  @Column({ name: 'fechaPublicacion', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  fechaPublicacion: Date;

  @Column({ name: 'fechaExpiracion', type: 'date', nullable: true })
  fechaExpiracion: Date;

  @Column({ name: 'idComunidad' })
  idComunidad: number;

  @ManyToOne(() => Comunidad)
  @JoinColumn({ name: 'idComunidad' })
  comunidad: Comunidad;

  @OneToMany(() => UsuarioAviso, usuarioAviso => usuarioAviso.aviso)
  usuariosAviso: UsuarioAviso[];
} 
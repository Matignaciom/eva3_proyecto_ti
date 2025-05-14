import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Usuario } from './usuario.entity';
import { Aviso } from './aviso.entity';

@Entity('UsuarioAviso')
export class UsuarioAviso {
  @PrimaryColumn({ name: 'idUsuario' })
  idUsuario: number;

  @PrimaryColumn({ name: 'idAviso' })
  idAviso: number;

  @Column({ type: 'boolean', default: false })
  leido: boolean;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'idUsuario' })
  usuario: Usuario;

  @ManyToOne(() => Aviso, aviso => aviso.usuariosAviso)
  @JoinColumn({ name: 'idAviso' })
  aviso: Aviso;
} 
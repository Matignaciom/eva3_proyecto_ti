import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Usuario } from './usuario.entity';
import { Comunidad } from './comunidad.entity';
import { GastoParcela } from './gasto-parcela.entity';
import { Actividad } from './actividad.entity';

@Entity('Parcela')
export class Parcela {
  @PrimaryGeneratedColumn({ name: 'idParcela' })
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ length: 255 })
  direccion: string;

  @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326 })
  ubicacion: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: 'En hectáreas' })
  area: number;

  @Column({ 
    type: 'enum', 
    enum: ['Al día', 'Pendiente', 'Atrasado'],
    default: 'Al día'
  })
  estado: string;

  @Column({ name: 'fechaAdquisicion', type: 'date' })
  fechaAdquisicion: Date;

  @Column({ name: 'valorCatastral', type: 'decimal', precision: 12, scale: 2 })
  valorCatastral: number;

  @Column({ name: 'idUsuario' })
  idUsuario: number;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'idUsuario' })
  usuario: Usuario;

  @Column({ name: 'idComunidad' })
  idComunidad: number;

  @ManyToOne(() => Comunidad)
  @JoinColumn({ name: 'idComunidad' })
  comunidad: Comunidad;

  @OneToMany(() => GastoParcela, gastoParcela => gastoParcela.parcela)
  gastosParcela: GastoParcela[];

  @OneToMany(() => Actividad, actividad => actividad.parcela)
  actividades: Actividad[];
} 
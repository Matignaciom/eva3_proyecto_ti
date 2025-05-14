import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Comunidad } from './comunidad.entity';

@Entity('Contrato')
export class Contrato {
  @PrimaryGeneratedColumn({ name: 'idContrato' })
  id: number;

  @Column({ name: 'idComunidad' })
  idComunidad: number;

  @ManyToOne(() => Comunidad)
  @JoinColumn({ name: 'idComunidad' })
  comunidad: Comunidad;

  @Column({ name: 'pdf_ruta', length: 255 })
  pdfRuta: string;

  @Column({
    type: 'enum',
    enum: ['Vigente', 'Expirado'],
    default: 'Vigente'
  })
  estado: string;
} 
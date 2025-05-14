import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { Usuario } from './entities/usuario.entity';
import { Comunidad } from './entities/comunidad.entity';
import { Parcela } from './entities/parcela.entity';
import { GastoComun } from './entities/gasto-comun.entity';
import { GastoParcela } from './entities/gasto-parcela.entity';
import { Pago } from './entities/pago.entity';
import { Contrato } from './entities/contrato.entity';
import { Notificacion } from './entities/notificacion.entity';
import { Aviso } from './entities/aviso.entity';
import { UsuarioAviso } from './entities/usuario-aviso.entity';
import { Actividad } from './entities/actividad.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 3306),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', 'matias123'),
        database: configService.get('DB_DATABASE', 'sigepa_db'),
        entities: [
          Usuario, 
          Comunidad,
          Parcela,
          GastoComun,
          GastoParcela,
          Pago,
          Contrato,
          Notificacion,
          Aviso,
          UsuarioAviso,
          Actividad
        ],
        synchronize: configService.get('DB_SYNCHRONIZE', false),
      }),
    }),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {} 
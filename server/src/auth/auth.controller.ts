import { Controller, Post, Body, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { compare } from 'bcrypt';
import { Usuario } from '../entities/usuario.entity';
import { LoginDto } from './dto/login.dto';

@Controller('api/auth')
export class AuthController {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    private jwtService: JwtService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      // Buscar usuario por email
      const usuario = await this.usuarioRepository.findOne({ 
        where: { email: loginDto.email } 
      });

      // Si no existe el usuario
      if (!usuario) {
        throw new UnauthorizedException('Credenciales incorrectas');
      }

      // Verificar contraseña
      const isPasswordValid = await compare(loginDto.password, usuario.password);
      
      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciales incorrectas');
      }

      // Verificar si el usuario está activo
      if (!usuario.activo) {
        throw new UnauthorizedException('Tu cuenta está desactivada. Contacta al administrador.');
      }

      // Generar token JWT
      const payload = { 
        sub: usuario.id,
        email: usuario.email,
        rol: usuario.rol
      };
      
      const token = this.jwtService.sign(payload);

      // Retornar respuesta
      return {
        token,
        user: {
          id: usuario.id,
          email: usuario.email,
          nombreCompleto: usuario.nombreCompleto,
          rol: usuario.rol
        }
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('Error durante el login:', error);
      throw new InternalServerErrorException('Error al procesar la solicitud');
    }
  }
} 
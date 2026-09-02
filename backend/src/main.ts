import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MysqlExceptionFilter } from './common/filters/mysql-exception.filter';

async function bootstrap() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET não definida');
  }

  const app = await NestFactory.create(AppModule);

  app.enableCors({ origin: ['http://localhost', 'http://localhost:4200'] });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.useGlobalFilters(new MysqlExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('API de Gerenciamento de Usuários')
    .setDescription('CRUD completo de usuários')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();

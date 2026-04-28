import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { UsersService } from './modules/users/users.service';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cookie parser
  app.use(cookieParser());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: [
      process.env.ADMIN_URL || 'http://localhost:3000',
      'http://43.204.144.76',
      'http://43.204.144.76:3000',
      'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'multipart/form-data'],
  });

  // Swagger docs
  const config = new DocumentBuilder()
    .setTitle('Carbon Grounds API')
    .setDescription('Carbon Credit Management System — REST API')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`\n🚀 Carbon Grounds API running on: http://localhost:${port}`);
  console.log(`📚 Swagger Docs: http://localhost:${port}/api\n`);

  // Seed default admin user if not exists
  const usersService = app.get(UsersService);
  await usersService.seedAdmin();
}
bootstrap();

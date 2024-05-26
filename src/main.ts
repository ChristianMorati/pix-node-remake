import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.enableCors();

  const swagger_config = new DocumentBuilder()
    .setTitle('Users Auth')
    .setDescription('The cats API description')
    .setVersion('1.0')
    // .addTag('cats')
    .build();
  const document = SwaggerModule.createDocument(app, swagger_config);
  SwaggerModule.setup('api', app, document);

  
  await app.listen(3000);
}
bootstrap();

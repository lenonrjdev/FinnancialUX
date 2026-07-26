import fastifyCookie from "@fastify/cookie";
import fastifyHelmet from "@fastify/helmet";
import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ trustProxy: true }),
  );
  const config = app.get(ConfigService);
  const prefix = config.get<string>("API_PREFIX", "api/v1");
  const port = config.get<number>("PORT", 3001);
  const origins = config
    .get<string>("FRONTEND_URL", "http://localhost:3000")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  await app.register(fastifyCookie);
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: false,
  });

  app.enableCors({
    origin: origins,
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });
  app.setGlobalPrefix(prefix);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.enableShutdownHooks();

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Dashboard Financeira API")
    .setDescription("API local preparada para futura evolução SaaS.")
    .setVersion("15.2")
    .addCookieAuth("finance_access_token")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${prefix}/docs`, app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(port, "0.0.0.0");
  Logger.log(`API disponível em http://localhost:${port}/${prefix}`, "Bootstrap");
  Logger.log(`Swagger em http://localhost:${port}/${prefix}/docs`, "Bootstrap");
}

void bootstrap();

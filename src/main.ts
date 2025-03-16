import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";

import * as cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  app.use(cookieParser(config.getOrThrow("COOKIES_SECRET")));

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();

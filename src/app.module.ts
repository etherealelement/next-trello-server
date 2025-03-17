import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { IS_DEV_ENV } from "./common/lib/is-dev";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: !IS_DEV_ENV,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
  ],
})
export class AppModule {}

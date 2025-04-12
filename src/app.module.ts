import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { CustomSchemaModule } from './custom-schema/custom-schema.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: false,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    AuthModule,
    CustomSchemaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }

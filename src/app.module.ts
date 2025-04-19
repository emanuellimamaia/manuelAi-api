import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { CustomSchemaModule } from './modules/custom-schema/custom-schema.module';
import { CustomDataModule } from './modules/23/custom-data.module';


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
    CustomDataModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }

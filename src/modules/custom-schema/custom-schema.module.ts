import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomSchemaController } from './custom-schema.controller';
import { CustomSchemaService } from './custom-schema.service';
import { CreateSchemaController } from './use-cases/create-schema/create-schema.controller';
import { CreateSchemaService } from './use-cases/create-schema/create-schema.service';
import { GetAllSchemaController } from './use-cases/getAll-schema/getAll.controller';
import { GetAllSchemaService } from './use-cases/getAll-schema/getAll.service';
import { CustomData, CustomDataSchema, CustomSchema, CustomSchemaSchema } from '../database/schemas';
import { GetSchemaService } from './use-cases/get-schema/get-schema.service';
import { GetSchemaController } from './use-cases/get-schema/get-schema.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CustomSchema.name, schema: CustomSchemaSchema },
      { name: CustomData.name, schema: CustomDataSchema }
    ])
  ],
  controllers: [CustomSchemaController, CreateSchemaController, GetAllSchemaController, GetSchemaController],
  providers: [CustomSchemaService, CreateSchemaService, GetAllSchemaService, GetSchemaService],
  exports: [CustomSchemaService]
})
export class CustomSchemaModule { } 
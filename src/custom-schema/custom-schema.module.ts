import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CustomSchema, CustomSchemaSchema } from '../database/schemas/custom-schema.schema';
import { CustomData, CustomDataSchema } from '../database/schemas/custom-data.schema';
import { CustomSchemaController } from './custom-schema.controller';
import { CustomSchemaService } from './custom-schema.service';
import { CreateDataController } from './use-cases/create-data/create-data.controller';
import { CreateSchemaController } from './use-cases/create-schema/create-schema.controller';
import { CreateDataService } from './use-cases/create-data/create-data.service';
import { CreateSchemaService } from './use-cases/create-schema/create-schema.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CustomSchema.name, schema: CustomSchemaSchema },
      { name: CustomData.name, schema: CustomDataSchema }
    ])
  ],
  controllers: [CustomSchemaController, CreateDataController, CreateSchemaController],
  providers: [CustomSchemaService, CreateDataService, CreateSchemaService],
  exports: [CustomSchemaService]
})
export class CustomSchemaModule { } 
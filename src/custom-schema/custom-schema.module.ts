import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CustomSchema, CustomSchemaSchema } from '../database/schemas/custom-schema.schema';
import { CustomData, CustomDataSchema } from '../database/schemas/custom-data.schema';
import { CustomSchemaController } from './custom-schema.controller';
import { CustomSchemaService } from './custom-schema.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CustomSchema.name, schema: CustomSchemaSchema },
      { name: CustomData.name, schema: CustomDataSchema }
    ])
  ],
  controllers: [CustomSchemaController],
  providers: [CustomSchemaService],
  exports: [CustomSchemaService]
})
export class CustomSchemaModule { } 
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CustomData, CustomDataSchema, CustomSchema, CustomSchemaSchema } from "../database/schemas";
import { CreateDataController } from "./use-cases/create-data/create-data.controller";
import { CreateDataService } from "./use-cases/create-data/create-data.service";
import { CustomSchemaService } from "../custom-schema/custom-schema.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CustomData.name, schema: CustomDataSchema },
      { name: CustomSchema.name, schema: CustomSchemaSchema }
    ])
  ],
  controllers: [CreateDataController],
  providers: [CreateDataService, CustomSchemaService],
  exports: [CreateDataService]
})
export class CustomDataModule { }
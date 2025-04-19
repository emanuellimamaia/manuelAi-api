import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { CustomSchema, CustomSchemaDocument } from "src/modules/database/schemas";
import { Model } from 'mongoose';
@Injectable()
export class GetSchemaService {
  constructor(
    @InjectModel(CustomSchema.name) private customSchemaModel: Model<CustomSchemaDocument>
  ) { }



  async getSchemaById(schemaId: string): Promise<CustomSchemaDocument> {
    const schema = await this.customSchemaModel.findById(schemaId);
    if (!schema) {
      throw new NotFoundException(`Schema with ID ${schemaId} not found`);
    }
    return schema;
  }

}

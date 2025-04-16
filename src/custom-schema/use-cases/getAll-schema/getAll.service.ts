import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CustomData, CustomDataDocument } from "src/database/schemas/custom-data.schema";

@Injectable()
export class GetAllSchemaService {
  constructor(
    @InjectModel(CustomData.name)
    private readonly customDataModel: Model<CustomDataDocument>,
  ) { }

  async getAllByUserId(userId: string): Promise<CustomDataDocument[]> {
    return this.customDataModel.find({ userId }).exec();
  }
}


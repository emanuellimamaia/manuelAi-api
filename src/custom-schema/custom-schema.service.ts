import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomSchema, CustomSchemaDocument } from '../database/schemas/custom-schema.schema';
import { CustomData, CustomDataDocument } from '../database/schemas/custom-data.schema';

@Injectable()
export class CustomSchemaService {
  private readonly logger = new Logger(CustomSchemaService.name);

  constructor(
    @InjectModel(CustomSchema.name) private customSchemaModel: Model<CustomSchemaDocument>,
    @InjectModel(CustomData.name) private customDataModel: Model<CustomDataDocument>
  ) { }



  async getSchemaById(schemaId: string): Promise<CustomSchemaDocument> {
    const schema = await this.customSchemaModel.findById(schemaId);
    if (!schema) {
      throw new NotFoundException(`Schema with ID ${schemaId} not found`);
    }
    return schema;
  }



  async getDataBySchemaId(schemaId: string, userId: string): Promise<CustomDataDocument[]> {
    return this.customDataModel.find({ schemaId, userId });
  }

  async getDataById(dataId: string, userId: string): Promise<CustomDataDocument> {
    const data = await this.customDataModel.findOne({ _id: dataId, userId });
    if (!data) {
      throw new NotFoundException(`Data with ID ${dataId} not found`);
    }
    return data;
  }

  async getUserSchemas(userId: string): Promise<CustomSchemaDocument[]> {
    return this.customSchemaModel.find({ userId }).exec();
  }

  validateDataAgainstSchema(data: any, schema: CustomSchemaDocument): void {
    // Implementar validação dos dados contra o schema
    // Esta é uma implementação básica que pode ser expandida
    for (const field of schema.fields) {
      if (field.options?.required && !(field.name in data)) {
        throw new BadRequestException(`Required field ${field.name} is missing`);
      }

      if (field.name in data) {
        const value = data[field.name];

        // Validar tipo
        if (field.type === 'number' && typeof value !== 'number') {
          throw new BadRequestException(`Field ${field.name} must be a number`);
        }

        if (field.type === 'string' && typeof value !== 'string') {
          throw new BadRequestException(`Field ${field.name} must be a string`);
        }

        if (field.type === 'boolean' && typeof value !== 'boolean') {
          throw new BadRequestException(`Field ${field.name} must be a boolean`);
        }

        if (field.type === 'object' && typeof value !== 'object') {
          throw new BadRequestException(`Field ${field.name} must be an object`);
        }

        // Validar opções
        if (field.type === 'number' && field.options) {
          if (field.options.min !== undefined && value < field.options.min) {
            throw new BadRequestException(`Field ${field.name} must be at least ${field.options.min}`);
          }

          if (field.options.max !== undefined && value > field.options.max) {
            throw new BadRequestException(`Field ${field.name} must be at most ${field.options.max}`);
          }
        }

        // Validar subfields recursivamente
        if (field.type === 'object' && field.subfields && typeof value === 'object') {
          for (const subfield of field.subfields) {
            if (subfield.options?.required && !(subfield.name in value)) {
              throw new BadRequestException(`Required subfield ${field.name}.${subfield.name} is missing`);
            }

            if (subfield.name in value) {
              const subvalue = value[subfield.name];

              if (subfield.type === 'number' && typeof subvalue !== 'number') {
                throw new BadRequestException(`Subfield ${field.name}.${subfield.name} must be a number`);
              }

              if (subfield.type === 'string' && typeof subvalue !== 'string') {
                throw new BadRequestException(`Subfield ${field.name}.${subfield.name} must be a string`);
              }
            }
          }
        }
      } else if (field.type === 'object' && field.options?.required) {
        // Se o campo é do tipo objeto e é obrigatório, mas não foi enviado, criar um objeto vazio
        data[field.name] = {};
      }
    }
  }
} 
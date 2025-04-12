import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomSchema, CustomSchemaDocument } from '../database/schemas/custom-schema.schema';
import { CustomData, CustomDataDocument } from '../database/schemas/custom-data.schema';

@Injectable()
export class CustomSchemaService {
  constructor(
    @InjectModel(CustomSchema.name) private customSchemaModel: Model<CustomSchemaDocument>,
    @InjectModel(CustomData.name) private customDataModel: Model<CustomDataDocument>
  ) { }

  async createSchema(userId: string, schemaData: any): Promise<CustomSchemaDocument> {
    // Validar a estrutura do schema
    this.validateSchemaStructure(schemaData);

    // Criar o schema
    const schema = await this.customSchemaModel.create({
      userId,
      name: schemaData.name,
      fields: schemaData.fields
    });

    return schema;
  }

  async getSchemaById(schemaId: string): Promise<CustomSchemaDocument> {
    const schema = await this.customSchemaModel.findById(schemaId);
    if (!schema) {
      throw new NotFoundException(`Schema with ID ${schemaId} not found`);
    }
    return schema;
  }

  async getUserSchemas(userId: string): Promise<CustomSchemaDocument[]> {
    return this.customSchemaModel.find({ userId });
  }

  async createData(schemaId: string, userId: string, data: any): Promise<CustomDataDocument> {
    // Buscar o schema
    const schema = await this.getSchemaById(schemaId);

    // Validar os dados contra o schema
    this.validateDataAgainstSchema(data, schema);

    // Criar os dados
    const customData = await this.customDataModel.create({
      userId,
      schemaId,
      name: data.name || 'Sem nome',
      ...data
    });

    return customData;
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

  private validateSchemaStructure(schemaData: any): void {
    if (!schemaData.name || typeof schemaData.name !== 'string') {
      throw new BadRequestException('Schema must have a valid name');
    }

    if (!schemaData.fields || !Array.isArray(schemaData.fields)) {
      throw new BadRequestException('Schema must have a fields array');
    }

    for (const field of schemaData.fields) {
      if (!field.name || typeof field.name !== 'string') {
        throw new BadRequestException('Each field must have a valid name');
      }

      if (!field.type || !['string', 'number', 'boolean', 'date', 'array', 'object'].includes(field.type)) {
        throw new BadRequestException(`Invalid field type: ${field.type}`);
      }

      if (field.type === 'object' && field.subfields) {
        if (!Array.isArray(field.subfields)) {
          throw new BadRequestException('Subfields must be an array');
        }

        // Validar recursivamente os subfields
        for (const subfield of field.subfields) {
          if (!subfield.name || typeof subfield.name !== 'string') {
            throw new BadRequestException('Each subfield must have a valid name');
          }

          if (!subfield.type || !['string', 'number', 'boolean', 'date', 'array', 'object'].includes(subfield.type)) {
            throw new BadRequestException(`Invalid subfield type: ${subfield.type}`);
          }
        }
      }
    }
  }

  private validateDataAgainstSchema(data: any, schema: CustomSchemaDocument): void {
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
      }
    }
  }
} 
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

  async createSchema(userId: string, schemaData: any): Promise<CustomSchemaDocument> {
    try {
      this.logger.debug(`Creating schema for user ${userId}: ${JSON.stringify(schemaData)}`);

      // Validar a estrutura do schema
      this.validateSchemaStructure(schemaData);

      // Criar o schema
      const schema = await this.customSchemaModel.create({
        userId,
        name: schemaData.name,
        fields: schemaData.fields
      });

      this.logger.debug(`Schema created successfully: ${schema._id}`);
      return schema;
    } catch (error) {
      this.logger.error(`Error creating schema: ${error.message}`);
      throw error;
    }
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
    try {
      // Buscar o schema
      const schema = await this.getSchemaById(schemaId);

      this.logger.debug(`Creating data for schema ${schemaId}: ${JSON.stringify(data)}`);

      // Validar os dados contra o schema
      this.validateDataAgainstSchema(data.data, schema);

      // Criar os dados
      const customData = await this.customDataModel.create({
        userId,
        schemaId,
        name: data.name || 'Sem nome',
        data: data.data
      });

      this.logger.debug(`Data created successfully: ${customData._id}`);
      return customData;
    } catch (error) {
      this.logger.error(`Error creating data: ${error.message}`);
      throw error;
    }
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
    if (!schemaData) {
      throw new BadRequestException('Schema data is required');
    }

    if (!schemaData.name || typeof schemaData.name !== 'string') {
      throw new BadRequestException('Schema must have a valid name');
    }

    if (!schemaData.fields || !Array.isArray(schemaData.fields)) {
      throw new BadRequestException('Schema must have a fields array');
    }

    if (schemaData.fields.length === 0) {
      throw new BadRequestException('Schema must have at least one field');
    }

    for (const field of schemaData.fields) {
      if (!field.name || typeof field.name !== 'string') {
        throw new BadRequestException('Each field must have a valid name');
      }

      if (!field.type || !['string', 'number', 'boolean', 'date', 'array', 'object'].includes(field.type)) {
        throw new BadRequestException(`Invalid field type: ${field.type}. Must be one of: string, number, boolean, date, array, object`);
      }

      if (field.options) {
        if (typeof field.options !== 'object') {
          throw new BadRequestException(`Field ${field.name} options must be an object`);
        }

        if (field.options.required !== undefined && typeof field.options.required !== 'boolean') {
          throw new BadRequestException(`Field ${field.name} required option must be a boolean`);
        }

        if (field.options.min !== undefined && typeof field.options.min !== 'number') {
          throw new BadRequestException(`Field ${field.name} min option must be a number`);
        }

        if (field.options.max !== undefined && typeof field.options.max !== 'number') {
          throw new BadRequestException(`Field ${field.name} max option must be a number`);
        }

        if (field.options.enum !== undefined && !Array.isArray(field.options.enum)) {
          throw new BadRequestException(`Field ${field.name} enum option must be an array`);
        }
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

  public validateDataAgainstSchema(data: any, schema: CustomSchemaDocument): void {
    // Verificar se data é undefined
    if (!data) {
      throw new BadRequestException('Data is required');
    }

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

        if (field.type === 'date' && !(value instanceof Date) && isNaN(Date.parse(value))) {
          throw new BadRequestException(`Field ${field.name} must be a valid date`);
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

        // Validar enum
        if (field.options?.enum && !field.options.enum.includes(value)) {
          throw new BadRequestException(`Field ${field.name} must be one of: ${field.options.enum.join(', ')}`);
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
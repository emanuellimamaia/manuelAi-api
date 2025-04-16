import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomData, CustomDataDocument } from '../../../database/schemas/custom-data.schema';
import { CustomSchemaService } from '../../../custom-schema/custom-schema.service';
import { CustomSchemaDocument } from 'src/database/schemas';

@Injectable()
export class CreateDataService {
  private readonly logger = new Logger(CreateDataService.name);

  constructor(
    @InjectModel(CustomData.name) private customDataModel: Model<CustomDataDocument>,
    private readonly customSchemaService: CustomSchemaService
  ) { }

  async createData(schemaId: string, userId: string, data: any): Promise<CustomDataDocument> {
    try {
      // Buscar o schema
      const schema = await this.customSchemaService.getSchemaById(schemaId);

      // Verificar se data.data é undefined
      if (!data.data) {
        throw new BadRequestException('Data is required');
      }

      // Validar os dados contra o schema
      this.customSchemaService.validateDataAgainstSchema(data.data, schema);

      // Criar os dados
      const customData = await this.customDataModel.create({
        userId,
        schemaId,
        name: data.name || 'Sem nome',
        data: data.data
      });

      return customData;
    } catch (error) {
      this.logger.error(`Error creating data: ${error.message}`);
      throw error;
    }
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
      } else if (field.type === 'object' && field.options?.required) {
        // Se o campo é do tipo objeto e é obrigatório, mas não foi enviado, criar um objeto vazio
        data[field.name] = {};
      }
    }
  }
}
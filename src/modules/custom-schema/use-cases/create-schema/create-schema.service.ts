import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomSchema, CustomSchemaDocument } from 'src/modules/database/schemas';

@Injectable()
export class CreateSchemaService {
  private readonly logger = new Logger(CreateSchemaService.name);

  constructor(
    @InjectModel(CustomSchema.name) private customSchemaModel: Model<CustomSchemaDocument>
  ) { }

  async createSchema(userId: string, schemaData: any): Promise<CustomSchemaDocument> {
    try {
      this.logger.debug(`Creating schema for user ${userId}: ${JSON.stringify(schemaData)}`);

      // Validate schema structure
      this.validateSchemaStructure(schemaData);

      // Create schema
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

        // Validate subfields recursively
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
}

import { Controller, Post, Body, Req, Logger } from '@nestjs/common';
import { CreateSchemaService } from './create-schema.service';
import { CreateSchemaDto } from '../../dto/create-schema.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('Schema')
@Controller('create-schema')
@ApiBearerAuth()
export class CreateSchemaController {
  private readonly logger = new Logger(CreateSchemaController.name);

  constructor(private readonly createSchemaService: CreateSchemaService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new custom schema' })
  @ApiResponse({ status: 201, description: 'Schema created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid schema data' })
  async createSchema(@Req() req: Request, @Body() createSchemaDto: CreateSchemaDto) {
    try {
      const userId = req.user['_id'];
      this.logger.debug(`Creating schema with data: ${JSON.stringify(createSchemaDto)}`);
      const schema = await this.createSchemaService.createSchema(userId, createSchemaDto);
      this.logger.debug(`Schema created successfully: ${schema._id}`);
      return schema;
    } catch (error) {
      this.logger.error(`Error creating schema: ${error.message}`);
      throw error;
    }
  }
}

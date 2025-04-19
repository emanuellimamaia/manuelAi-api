import { Controller, Get, Post, Body, Param, UseGuards, Logger, Req } from '@nestjs/common';
import { CustomSchemaService } from './custom-schema.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('custom-schema')
@Controller('custom-schema')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomSchemaController {
  private readonly logger = new Logger(CustomSchemaController.name);

  constructor(private readonly customSchemaService: CustomSchemaService) { }




  @Get(':id/data')
  @ApiOperation({
    summary: 'Get all data entries for a schema',
    description: 'Retrieve all data entries that belong to a specific schema'
  })
  @ApiResponse({ status: 200, description: 'Returns all data entries for the schema' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Schema not found' })
  async getDataBySchemaId(@Req() req: Request, @Param('id') schemaId: string) {
    try {
      const userId = req.user['_id'];
      this.logger.debug(`Getting data for schema ${schemaId}`);
      const data = await this.customSchemaService.getDataBySchemaId(schemaId, userId);
      this.logger.debug(`Found ${data.length} entries`);
      return data;
    } catch (error) {
      this.logger.error(`Error getting data: ${error.message}`);
      throw error;
    }
  }

  @Get('data/:id')
  @ApiOperation({
    summary: 'Get a specific data entry by ID',
    description: 'Retrieve a single data entry by its ID'
  })
  @ApiResponse({ status: 200, description: 'Returns the data entry' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Data entry not found' })
  async getDataById(@Req() req: Request, @Param('id') id: string) {
    try {
      const userId = req.user['_id'];
      this.logger.debug(`Getting data entry ${id}`);
      const data = await this.customSchemaService.getDataById(id, userId);
      this.logger.debug(`Found data entry: ${data._id}`);
      return data;
    } catch (error) {
      this.logger.error(`Error getting data entry: ${error.message}`);
      throw error;
    }
  }
} 
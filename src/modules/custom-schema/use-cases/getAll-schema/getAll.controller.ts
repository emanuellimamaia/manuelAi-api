import { Controller, Get, Injectable, Logger, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/modules/auth/guards/jwt-auth.guard";
import { GetAllSchemaService } from "./getAll.service";
import { Request } from 'express';

@ApiTags('Schema')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GetAllSchemaController {
  private readonly logger = new Logger(GetAllSchemaController.name)

  constructor(private readonly getAllSchemaService: GetAllSchemaService) { }

  @Get("get-schemas")
  @ApiOperation({ summary: 'Get all schemas for the authenticated user' })
  async getAllSchemas(@Req() req: Request) {
    try {
      const userId = req.user['_id'];
      this.logger.debug('Getting all schemas');
      const schemas = await this.getAllSchemaService.getAllByUserId(userId);
      this.logger.debug(`Found ${schemas.length} schemas`);
      return schemas;
    } catch (error) {
      this.logger.error(`Error getting schemas: ${error.message}`);
      throw error;
    }
  }

}

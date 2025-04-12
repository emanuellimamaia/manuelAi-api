import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CustomSchemaService } from './custom-schema.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { CreateSchemaDto } from './dto/create-schema.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Schemas Personalizados')
@Controller('custom-schema')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomSchemaController {
  constructor(private readonly customSchemaService: CustomSchemaService) { }

  @Post()
  async createSchema(@Req() req: Request, @Body() schemaData: CreateSchemaDto) {
    const userId = req.user['_id'];
    return this.customSchemaService.createSchema(userId, schemaData);
  }

  @Get()
  getUserSchemas(@Req() req: Request) {
    const userId = req.user['_id'];
    return this.customSchemaService.getUserSchemas(userId);
  }

  @Get(':id')
  async getSchemaById(@Param('id') id: string) {
    return this.customSchemaService.getSchemaById(id);
  }

  @Post(':id/data')
  async createData(
    @Req() req: Request,
    @Param('id') schemaId: string,
    @Body() data: any
  ) {
    const userId = req.user['_id'];
    return this.customSchemaService.createData(schemaId, userId, data);
  }

  @Get(':id/data')
  async getDataBySchemaId(@Req() req: Request, @Param('id') schemaId: string) {
    const userId = req.user['_id'];
    return this.customSchemaService.getDataBySchemaId(schemaId, userId);
  }

  @Get('data/:id')
  async getDataById(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user['_id'];
    return this.customSchemaService.getDataById(id, userId);
  }
} 
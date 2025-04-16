import { IsString, IsNumber, IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SchemaDataDto {
  // Removendo os campos fixos e usando um tipo genérico para aceitar qualquer campo
  [key: string]: any;
} 
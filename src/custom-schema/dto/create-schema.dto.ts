import { IsString, IsArray, ValidateNested, IsOptional, IsEnum, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class CustomFieldOptionsDto {
  @IsOptional()
  @IsObject()
  required?: boolean;

  @IsOptional()
  @IsObject()
  min?: number;

  @IsOptional()
  @IsObject()
  max?: number;

  @IsOptional()
  @IsObject()
  enum?: string[];

  [key: string]: any;
}

export class CustomFieldDto {
  @IsString()
  name: string;

  @IsEnum(['string', 'number', 'boolean', 'date', 'array', 'object'])
  type: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CustomFieldDto)
  subfields?: CustomFieldDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CustomFieldOptionsDto)
  options?: CustomFieldOptionsDto;
}

export class CreateSchemaDto {
  @IsString()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomFieldDto)
  fields: CustomFieldDto[];
} 
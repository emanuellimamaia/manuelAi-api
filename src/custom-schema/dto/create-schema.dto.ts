import { IsString, IsArray, ValidateNested, IsOptional, IsEnum, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CustomFieldOptionsDto {
  @ApiProperty({
    description: 'Indica se o campo é obrigatório',
    required: false,
    example: true
  })
  @IsOptional()
  @IsObject()
  required?: boolean;

  @ApiProperty({
    description: 'Valor mínimo para campos numéricos',
    required: false,
    example: 0
  })
  @IsOptional()
  @IsObject()
  min?: number;

  @ApiProperty({
    description: 'Valor máximo para campos numéricos',
    required: false,
    example: 100
  })
  @IsOptional()
  @IsObject()
  max?: number;

  @ApiProperty({
    description: 'Lista de valores permitidos para campos enum',
    required: false,
    example: ['PENDING', 'ACTIVE', 'INACTIVE']
  })
  @IsOptional()
  @IsObject()
  enum?: string[];

  [key: string]: any;
}

export class CustomFieldDto {
  @ApiProperty({
    description: 'Nome do campo',
    example: 'status'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Tipo do campo',
    example: 'string',
    enum: ['string', 'number', 'boolean', 'object']
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Opções adicionais do campo',
    required: false,
    type: () => CustomFieldOptionsDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CustomFieldOptionsDto)
  options?: CustomFieldOptionsDto;
}

export class CreateSchemaDto {
  @ApiProperty({
    description: 'Nome do schema personalizado',
    example: 'Cliente'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Lista de campos do schema',
    type: [CustomFieldDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomFieldDto)
  fields: CustomFieldDto[];
} 
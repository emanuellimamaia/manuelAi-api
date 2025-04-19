import { IsString, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SchemaDataDto } from './schema-data.dto';

export class CreateDataDto {
  @ApiProperty({
    description: 'Nome da entrada de dados',
    example: 'Cliente João Silva'
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Dados específicos do schema. Deve corresponder à estrutura definida no schema.',
    type: () => SchemaDataDto
  })
  @ValidateNested()
  @Type(() => SchemaDataDto)
  data: SchemaDataDto;
} 
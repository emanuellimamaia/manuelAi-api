import { Controller, Post, Body, Param, UseGuards, Logger, Req } from '@nestjs/common';

import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { CreateDataDto } from '../../../custom-schema/dto/create-data.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Request } from 'express';
import { CreateDataService } from './create-data.service';

@ApiTags('Data')
@Controller('create-data')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CreateDataController {
  private readonly logger = new Logger(CreateDataController.name);

  constructor(private readonly createDataService: CreateDataService) { }

  @Post(':id')
  @ApiOperation({
    summary: 'Add data to a schema',
    description: 'Add one or multiple data entries according to the schema structure. The data must match the fields defined in the schema.'
  })
  @ApiResponse({ status: 201, description: 'Data created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data format or validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Schema not found' })
  @ApiBody({
    description: 'Data to be added. Can be a single object or an array of objects. Must match the schema structure.',
    examples: {
      singleItem: {
        value: {
          name: "Example Entry",
          data: {
            Título: "Example Title",
            Descrição: "Example Description",
            "Data de Vencimento": "2025-04-14T18:00:00.000Z",
            Prioridade: "Alta",
            Concluída: false
          }
        }
      },
      multipleItems: {
        value: [
          {
            data: {
              Título: "Example Title 1",
              Descrição: "Example Description 1",
              "Data de Vencimento": "2025-04-14T18:00:00.000Z",
              Prioridade: "Alta",
              Concluída: false
            }
          },
          {
            data: {
              Título: "Example Title 2",
              Descrição: "Example Description 2",
              "Data de Vencimento": "2025-04-14T20:00:00.000Z",
              Prioridade: "Média",
              Concluída: false
            }
          }
        ]
      }
    }
  })
  async createData(
    @Req() req: Request,
    @Param('id') schemaId: string,
    @Body() createDataDto: CreateDataDto | { data: any }[]
  ) {
    try {
      const userId = req.user['_id'];
      this.logger.debug(`Creating data for schema ${schemaId}: ${JSON.stringify(createDataDto)}`);

      // Verificar se é um array (múltiplos itens) ou um objeto único
      if (Array.isArray(createDataDto)) {
        // Processar múltiplos itens
        const results = await Promise.all(
          createDataDto.map(async (dto) => {
            const createDataDto = {
              name: dto.data.Título || 'Sem nome', // Usando o título como nome
              data: dto.data
            };
            return this.createDataService.createData(schemaId, userId, createDataDto);
          })
        );

        this.logger.debug(`Bulk data created successfully: ${results.map(r => r._id).join(', ')}`);
        return results;
      } else {
        // Processar um único item
        const result = await this.createDataService.createData(schemaId, userId, createDataDto);
        this.logger.debug(`Data created successfully: ${result._id}`);
        return result;
      }
    } catch (error) {
      this.logger.error(`Error creating data: ${error.message}`);
      throw error;
    }
  }
}

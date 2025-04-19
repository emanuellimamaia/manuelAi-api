import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Controller, Get, Logger, Param } from "@nestjs/common";
import { GetSchemaService } from "./get-schema.service";
import { CustomSchemaController } from "../../custom-schema.controller";

@ApiTags("Schema")
@Controller("get-schema")
export class GetSchemaController {
  private readonly logger = new Logger(CustomSchemaController.name);
  constructor(private readonly getSchemaService: GetSchemaService) {

  }


  @Get(':id')
  @ApiOperation({ summary: 'Get a schema by ID' })
  @ApiResponse({ status: 200, description: 'Returns the schema' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Schema not found' })
  async getSchemaById(@Param('id') id: string) {
    try {
      this.logger.debug(`Getting schema with ID: ${id}`);
      const schema = await this.getSchemaService.getSchemaById(id);
      this.logger.debug(`Found schema: ${schema._id}`);
      return schema;
    } catch (error) {
      this.logger.error(`Error getting schema: ${error.message}`);
      throw error;
    }
  }

}


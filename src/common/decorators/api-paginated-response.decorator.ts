import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

/**
 * Swagger decorator for paginated responses
 * Usage: @ApiPaginatedResponse(EntityDto)
 */
export const ApiPaginatedResponse = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      description: 'Successfully retrieved paginated results',
      schema: {
        allOf: [
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
              meta: {
                type: 'object',
                properties: {
                  total: {
                    type: 'number',
                    description: 'Total number of items',
                    example: 100,
                  },
                  page: {
                    type: 'number',
                    description: 'Current page number',
                    example: 1,
                  },
                  limit: {
                    type: 'number',
                    description: 'Items per page',
                    example: 20,
                  },
                  totalPages: {
                    type: 'number',
                    description: 'Total number of pages',
                    example: 5,
                  },
                  hasNextPage: {
                    type: 'boolean',
                    description: 'Whether there is a next page',
                    example: true,
                  },
                  hasPreviousPage: {
                    type: 'boolean',
                    description: 'Whether there is a previous page',
                    example: false,
                  },
                },
              },
            },
          },
        ],
      },
    }),
  );
};
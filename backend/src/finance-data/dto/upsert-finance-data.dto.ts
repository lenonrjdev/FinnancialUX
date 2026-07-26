import { ApiProperty } from "@nestjs/swagger";
import { IsDefined } from "class-validator";

export class UpsertFinanceDataDto {
  @ApiProperty({
    type: Object,
    description: "Documento JSON do módulo financeiro no espaço atual.",
  })
  @IsDefined()
  data!: unknown;
}

import { Body, Controller, Delete, Get, Param, Put, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentWorkspace } from "../common/decorators/current-workspace.decorator";
import { WorkspaceRoles } from "../common/decorators/workspace-roles.decorator";
import { WorkspaceContextGuard } from "../common/guards/workspace-context.guard";
import { WorkspaceRolesGuard } from "../common/guards/workspace-roles.guard";
import type { WorkspaceContext } from "../common/types/workspace-context";
import { UpsertFinanceDataDto } from "./dto/upsert-finance-data.dto";
import { FinanceDataService } from "./finance-data.service";

@ApiTags("Dados financeiros")
@Controller("finance-data")
@UseGuards(WorkspaceContextGuard, WorkspaceRolesGuard)
export class FinanceDataController {
  constructor(private readonly financeData: FinanceDataService) {}

  @Get()
  @ApiOperation({ summary: "Lista os documentos financeiros do espaço atual" })
  list(@CurrentWorkspace() workspace: WorkspaceContext) {
    return this.financeData.list(workspace.id);
  }

  @Get(":module")
  @ApiOperation({ summary: "Obtém os dados persistidos de um módulo" })
  get(
    @CurrentWorkspace() workspace: WorkspaceContext,
    @Param("module") module: string,
  ) {
    return this.financeData.get(workspace.id, module);
  }

  @Put(":module")
  @WorkspaceRoles("OWNER", "EDITOR")
  @ApiOperation({ summary: "Salva os dados de um módulo no PostgreSQL" })
  upsert(
    @CurrentWorkspace() workspace: WorkspaceContext,
    @Param("module") module: string,
    @Body() dto: UpsertFinanceDataDto,
  ) {
    return this.financeData.upsert(workspace.id, workspace.userId, module, dto.data);
  }

  @Delete(":module")
  @WorkspaceRoles("OWNER", "EDITOR")
  @ApiOperation({ summary: "Limpa os dados persistidos de um módulo" })
  remove(
    @CurrentWorkspace() workspace: WorkspaceContext,
    @Param("module") module: string,
  ) {
    return this.financeData.remove(workspace.id, workspace.userId, module);
  }
}

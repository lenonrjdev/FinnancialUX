import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Public } from "../common/decorators/public.decorator";
import type { AuthenticatedUser } from "../common/types/authenticated-user";
import { CreateWorkspaceDto } from "./dto/create-workspace.dto";
import { InviteMemberDto } from "./dto/invite-member.dto";
import { UpdateMemberRoleDto } from "./dto/update-member-role.dto";
import { WorkspacesService } from "./workspaces.service";

@ApiTags("Espaços financeiros")
@Controller("workspaces")
export class WorkspacesController {
  constructor(private readonly workspaces: WorkspacesService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.workspaces.list(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateWorkspaceDto) {
    return this.workspaces.create(user.id, dto);
  }

  @Get(":workspaceId")
  details(@CurrentUser() user: AuthenticatedUser, @Param("workspaceId") workspaceId: string) {
    return this.workspaces.details(user.id, workspaceId);
  }

  @Get(":workspaceId/members")
  members(@CurrentUser() user: AuthenticatedUser, @Param("workspaceId") workspaceId: string) {
    return this.workspaces.members(user.id, workspaceId);
  }

  @Patch(":workspaceId/members/:memberId")
  updateMemberRole(
    @CurrentUser() user: AuthenticatedUser,
    @Param("workspaceId") workspaceId: string,
    @Param("memberId") memberId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.workspaces.updateMemberRole(user.id, workspaceId, memberId, dto.role);
  }

  @Delete(":workspaceId/members/:memberId")
  removeMember(
    @CurrentUser() user: AuthenticatedUser,
    @Param("workspaceId") workspaceId: string,
    @Param("memberId") memberId: string,
  ) {
    return this.workspaces.removeMember(user.id, workspaceId, memberId);
  }

  @Get(":workspaceId/invitations")
  invitations(@CurrentUser() user: AuthenticatedUser, @Param("workspaceId") workspaceId: string) {
    return this.workspaces.invitations(user.id, workspaceId);
  }

  @Post(":workspaceId/invitations")
  invite(
    @CurrentUser() user: AuthenticatedUser,
    @Param("workspaceId") workspaceId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.workspaces.invite(user.id, workspaceId, dto);
  }

  @Post(":workspaceId/invitations/:invitationId/resend")
  resend(
    @CurrentUser() user: AuthenticatedUser,
    @Param("workspaceId") workspaceId: string,
    @Param("invitationId") invitationId: string,
  ) {
    return this.workspaces.resendInvitation(user.id, workspaceId, invitationId);
  }

  @Delete(":workspaceId/invitations/:invitationId")
  cancel(
    @CurrentUser() user: AuthenticatedUser,
    @Param("workspaceId") workspaceId: string,
    @Param("invitationId") invitationId: string,
  ) {
    return this.workspaces.cancelInvitation(user.id, workspaceId, invitationId);
  }

  @Public()
  @Get("invitations/:token/details")
  @ApiOperation({ summary: "Consulta um convite pelo token" })
  invitationDetails(@Param("token") token: string) {
    return this.workspaces.invitationDetails(token);
  }

  @Post("invitations/:token/accept")
  acceptInvitation(@CurrentUser() user: AuthenticatedUser, @Param("token") token: string) {
    return this.workspaces.acceptInvitation(user.id, token);
  }
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { AccessHeading } from "@/components/acessos/access-heading";
import { AccessOverviewPanel } from "@/components/acessos/access-overview-panel";
import { AccessSummary } from "@/components/acessos/access-summary";
import { InvitationsPanel } from "@/components/acessos/invitations-panel";
import { InviteDialog } from "@/components/acessos/invite-dialog";
import { MemberRoleDialog } from "@/components/acessos/member-role-dialog";
import { MembersPanel } from "@/components/acessos/members-panel";
import { PermissionMatrix } from "@/components/acessos/permission-matrix";
import { WorkspaceDialog } from "@/components/acessos/workspace-dialog";
import { WorkspacesPanel } from "@/components/acessos/workspaces-panel";
import { CheckIcon } from "@/components/shared/icons";
import { accessContent } from "@/content/acessos";
import {
  demoSessionUser,
  initialAccessInvitations,
  initialWorkspaceMembers,
  initialWorkspaces,
} from "@/data/acessos";
import {
  getStoredWorkspaceId,
  persistWorkspaceId,
  roleCan,
} from "@/lib/access-control";
import type {
  AccessInvitation,
  CreateWorkspaceInput,
  FinancialWorkspace,
  InviteMemberInput,
  WorkspaceMember,
  WorkspaceRole,
} from "@/types/acessos";

export default function AcessosView() {
  const [workspaces, setWorkspaces] = useState<FinancialWorkspace[]>(initialWorkspaces);
  const [members, setMembers] = useState<WorkspaceMember[]>(initialWorkspaceMembers);
  const [invitations, setInvitations] = useState<AccessInvitation[]>(initialAccessInvitations);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(initialWorkspaces[0].id);
  const [query, setQuery] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [workspaceDialogOpen, setWorkspaceDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<WorkspaceMember | null>(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const storedId = getStoredWorkspaceId(initialWorkspaces[0].id);
    if (initialWorkspaces.some((workspace) => workspace.id === storedId)) {
      setSelectedWorkspaceId(storedId);
    }
  }, []);

  const selectedWorkspace = workspaces.find((workspace) => workspace.id === selectedWorkspaceId) ?? workspaces[0];
  const currentRole = selectedWorkspace?.role ?? "viewer";
  const canManage = roleCan(currentRole, "manage-members");

  const selectedMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    return members
      .filter((member) => member.workspaceId === selectedWorkspaceId)
      .filter((member) => !normalizedQuery
        || member.name.toLocaleLowerCase("pt-BR").includes(normalizedQuery)
        || member.email.toLocaleLowerCase("pt-BR").includes(normalizedQuery));
  }, [members, query, selectedWorkspaceId]);

  const selectedInvitations = invitations.filter((invitation) => invitation.workspaceId === selectedWorkspaceId);
  const pendingInvitationsCount = invitations.filter((invitation) => invitation.status === "pending").length;

  function showFeedback(message: string) {
    setFeedback(message);
    window.setTimeout(() => setFeedback(""), 2800);
  }

  function selectWorkspace(workspaceId: string) {
    setSelectedWorkspaceId(workspaceId);
    persistWorkspaceId(workspaceId);
    setQuery("");
    showFeedback(accessContent.feedback.workspaceChanged);
  }

  function inviteMember(input: InviteMemberInput) {
    if (!selectedWorkspace) return;
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 7);
    const invitation: AccessInvitation = {
      id: `invite-${Date.now()}`,
      workspaceId: selectedWorkspace.id,
      email: input.email,
      role: input.role,
      invitedBy: demoSessionUser.name,
      sentAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: "pending",
      token: `${selectedWorkspace.id}-${Date.now()}`,
    };
    setInvitations((current) => [invitation, ...current]);
    setInviteOpen(false);
    showFeedback(accessContent.feedback.invited);
  }

  function createWorkspace(input: CreateWorkspaceInput) {
    const workspaceId = `workspace-${Date.now()}`;
    const now = new Date().toISOString();
    const workspace: FinancialWorkspace = {
      id: workspaceId,
      name: input.name,
      description: input.description,
      kind: "shared",
      role: "owner",
      membersCount: 1,
      createdAt: now,
      lastActivityAt: now,
    };
    const member: WorkspaceMember = {
      id: `member-${Date.now()}`,
      workspaceId,
      name: demoSessionUser.name,
      email: demoSessionUser.email,
      initials: demoSessionUser.initials,
      role: "owner",
      joinedAt: now,
      lastAccessAt: now,
      isCurrentUser: true,
    };
    const nextWorkspaces = [...workspaces, workspace];
    setWorkspaces(nextWorkspaces);
    window.dispatchEvent(new CustomEvent("finance-workspaces-change", { detail: nextWorkspaces }));
    setMembers((current) => [...current, member]);
    setSelectedWorkspaceId(workspaceId);
    persistWorkspaceId(workspaceId);
    setWorkspaceDialogOpen(false);
    showFeedback(accessContent.feedback.workspaceCreated);
  }

  function changeMemberRole(role: Exclude<WorkspaceRole, "owner">) {
    if (!editingMember) return;
    setMembers((current) => current.map((member) => member.id === editingMember.id ? { ...member, role } : member));
    setEditingMember(null);
    showFeedback(accessContent.feedback.roleChanged);
  }

  function removeMember(member: WorkspaceMember) {
    setMembers((current) => current.filter((item) => item.id !== member.id));
    setWorkspaces((current) => current.map((workspace) => workspace.id === member.workspaceId
      ? { ...workspace, membersCount: Math.max(1, workspace.membersCount - 1) }
      : workspace));
    showFeedback(accessContent.feedback.memberRemoved);
  }

  function resendInvitation(invitation: AccessInvitation) {
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 7);
    setInvitations((current) => current.map((item) => item.id === invitation.id
      ? { ...item, sentAt: now.toISOString(), expiresAt: expiresAt.toISOString(), status: "pending" }
      : item));
    showFeedback(accessContent.feedback.invitationResent);
  }

  function cancelInvitation(invitation: AccessInvitation) {
    setInvitations((current) => current.filter((item) => item.id !== invitation.id));
    showFeedback(accessContent.feedback.invitationCanceled);
  }

  const unavailableEmails = [
    ...members.filter((member) => member.workspaceId === selectedWorkspaceId).map((member) => member.email.toLowerCase()),
    ...invitations.filter((invitation) => invitation.workspaceId === selectedWorkspaceId && invitation.status === "pending").map((invitation) => invitation.email.toLowerCase()),
  ];

  return (
    <div className="financial-management-page access-page">
      <AccessHeading
        onInvite={() => setInviteOpen(true)}
        onCreateWorkspace={() => setWorkspaceDialogOpen(true)}
        canInvite={canManage}
      />
      <AccessSummary
        workspacesCount={workspaces.length}
        membersCount={members.length}
        invitationsCount={pendingInvitationsCount}
        currentRole={currentRole}
      />

      <div className="access-main-grid">
        <WorkspacesPanel workspaces={workspaces} selectedWorkspaceId={selectedWorkspaceId} onSelect={selectWorkspace} />
        <AccessOverviewPanel />
      </div>

      <MembersPanel
        members={selectedMembers}
        query={query}
        canManage={canManage}
        onQueryChange={setQuery}
        onEdit={setEditingMember}
        onRemove={removeMember}
      />

      <InvitationsPanel
        invitations={selectedInvitations}
        canManage={canManage}
        onResend={resendInvitation}
        onCancel={cancelInvitation}
      />

      <PermissionMatrix />

      {inviteOpen && selectedWorkspace ? (
        <InviteDialog
          workspace={selectedWorkspace}
          unavailableEmails={unavailableEmails}
          onClose={() => setInviteOpen(false)}
          onSubmit={inviteMember}
        />
      ) : null}

      {workspaceDialogOpen ? (
        <WorkspaceDialog onClose={() => setWorkspaceDialogOpen(false)} onSubmit={createWorkspace} />
      ) : null}

      {editingMember ? (
        <MemberRoleDialog member={editingMember} onClose={() => setEditingMember(null)} onSubmit={changeMemberRole} />
      ) : null}

      {feedback ? (
        <div className="transaction-feedback access-feedback" role="status">
          <CheckIcon />
          {feedback}
        </div>
      ) : null}
    </div>
  );
}

"use client";

import Link from "next/link";
import { MailIcon, ShieldIcon, UsersIcon, WorkspaceIcon } from "@/components/shared/icons";
import { accessContent, authContent } from "@/content/acessos";
import { initialAccessInvitations, initialWorkspaces } from "@/data/acessos";
import { formatAccessDate, persistDemoSession } from "@/lib/access-control";

export function InvitationAcceptanceView({ token }: { token: string }) {
  const invitation = initialAccessInvitations.find((item) => item.token === token && item.status === "pending");
  const workspace = invitation
    ? initialWorkspaces.find((item) => item.id === invitation.workspaceId)
    : undefined;

  function acceptInvitation() {
    if (!invitation) return;
    persistDemoSession(invitation.email);
    window.location.assign("/acessos");
  }

  if (!invitation || !workspace) {
    return (
      <div className="auth-card invitation-card auth-success-card">
        <span className="auth-success-icon muted"><MailIcon /></span>
        <header className="auth-card-heading">
          <h2>{authContent.invitation.invalidTitle}</h2>
          <p>{authContent.invitation.invalidDescription}</p>
        </header>
        <Link className="auth-submit-button" href="/login">{authContent.invitation.goLogin}</Link>
      </div>
    );
  }

  return (
    <div className="auth-card invitation-card">
      <span className="invitation-main-icon"><UsersIcon /></span>
      <header className="auth-card-heading">
        <span>{authContent.invitation.eyebrow}</span>
        <h2>{authContent.invitation.title}</h2>
        <p>{authContent.invitation.description}</p>
      </header>

      <dl className="invitation-details">
        <div>
          <dt><WorkspaceIcon /> {authContent.invitation.workspace}</dt>
          <dd>{workspace.name}</dd>
        </div>
        <div>
          <dt><MailIcon /> {authContent.invitation.invitedBy}</dt>
          <dd>{invitation.invitedBy}</dd>
        </div>
        <div>
          <dt><ShieldIcon /> {authContent.invitation.permission}</dt>
          <dd>{accessContent.roles[invitation.role]}</dd>
        </div>
        <div>
          <dt>{authContent.invitation.expires}</dt>
          <dd>{formatAccessDate(invitation.expiresAt)}</dd>
        </div>
      </dl>

      <button className="auth-submit-button" type="button" onClick={acceptInvitation}>
        {authContent.invitation.accept}
      </button>
      <Link className="auth-back-link" href="/login">{authContent.invitation.decline}</Link>
      <small className="auth-demo-note">{authContent.invitation.loginNote}</small>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { ActivityPanel } from "@/components/configuracoes/activity-panel";
import { BackupsPanel } from "@/components/configuracoes/backups-panel";
import { NotificationsPanel } from "@/components/configuracoes/notifications-panel";
import { PreferencesPanel } from "@/components/configuracoes/preferences-panel";
import { ProfileSettingsPanel } from "@/components/configuracoes/profile-settings-panel";
import { SecurityPanel } from "@/components/configuracoes/security-panel";
import { SettingsHeading } from "@/components/configuracoes/settings-heading";
import { SettingsNavigation } from "@/components/configuracoes/settings-navigation";
import { SettingsSummary } from "@/components/configuracoes/settings-summary";
import { CheckIcon } from "@/components/shared/icons";
import { settingsContent } from "@/content/configuracoes";
import {
  initialActiveSessions,
  initialActivityLog,
  initialBackupSettings,
  initialBackupSnapshots,
  initialFinancialPreferences,
  initialNotificationSettings,
  initialProfileSettings,
  initialSecuritySettings,
} from "@/data/configuracoes";
import {
  applyAppearance,
  createSettingsBackup,
  downloadFullSettingsBackup,
  getStoredBackupSettings,
  getStoredFinancialPreferences,
  getStoredNotificationSettings,
  getStoredProfile,
  getStoredSecuritySettings,
  persistBackupSettings,
  persistFinancialPreferences,
  persistNotificationSettings,
  persistProfile,
  persistSecuritySettings,
} from "@/lib/settings";
import type {
  ActiveSession,
  BackupSnapshot,
  SettingsView,
} from "@/types/configuracoes";

export default function ConfiguracoesView() {
  const [view, setView] = useState<SettingsView>("profile");
  const [profile, setProfile] = useState(initialProfileSettings);
  const [preferences, setPreferences] = useState(initialFinancialPreferences);
  const [notifications, setNotifications] = useState(initialNotificationSettings);
  const [security, setSecurity] = useState(initialSecuritySettings);
  const [backupSettings, setBackupSettings] = useState(initialBackupSettings);
  const [sessions, setSessions] = useState<ActiveSession[]>(initialActiveSessions);
  const [snapshots, setSnapshots] = useState<BackupSnapshot[]>(initialBackupSnapshots);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const storedProfile = getStoredProfile(initialProfileSettings);
    const storedPreferences = getStoredFinancialPreferences(initialFinancialPreferences);
    setProfile(storedProfile);
    setPreferences(storedPreferences);
    setNotifications(getStoredNotificationSettings(initialNotificationSettings));
    setSecurity(getStoredSecuritySettings(initialSecuritySettings));
    setBackupSettings(getStoredBackupSettings(initialBackupSettings));
    applyAppearance(storedPreferences.appearance);
  }, []);

  const protectedAccount = security.twoFactorEnabled && security.loginAlerts;
  const availableBackupsCount = snapshots.filter((snapshot) => snapshot.status === "available").length;
  const lastActivityAt = useMemo(() => [...initialActivityLog].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))[0]?.occurredAt ?? new Date().toISOString(), []);

  function showFeedback(message: string) {
    setFeedback(message);
    window.setTimeout(() => setFeedback(""), 2800);
  }

  function saveCurrentView() {
    setSaving(true);
    if (view === "profile") {
      persistProfile(profile);
      showFeedback(settingsContent.feedback.profileSaved);
    } else if (view === "preferences") {
      persistFinancialPreferences(preferences);
      showFeedback(settingsContent.feedback.preferencesSaved);
    } else if (view === "notifications") {
      persistNotificationSettings(notifications);
      showFeedback(settingsContent.feedback.notificationsSaved);
    } else if (view === "security") {
      persistSecuritySettings(security);
      showFeedback(settingsContent.feedback.securitySaved);
    } else if (view === "backups") {
      persistBackupSettings(backupSettings);
      showFeedback(settingsContent.feedback.backupSettingsSaved);
    } else {
      showFeedback(settingsContent.heading.saved);
    }
    window.setTimeout(() => setSaving(false), 950);
  }

  function createBackup() {
    const payload = createSettingsBackup(profile, preferences, notifications, security, backupSettings);
    const fileName = downloadFullSettingsBackup(payload);
    const snapshot: BackupSnapshot = {
      id: `backup-${Date.now()}`,
      fileName,
      createdAt: payload.generatedAt,
      sizeBytes: new Blob([JSON.stringify(payload)]).size,
      modulesCount: 9,
      status: "available",
      automatic: false,
    };
    setSnapshots((current) => [snapshot, ...current]);
    showFeedback(settingsContent.backups.created);
  }

  function removeBackup(id: string) {
    setSnapshots((current) => current.filter((snapshot) => snapshot.id !== id));
    showFeedback(settingsContent.backups.removed);
  }

  function restoreBackup() {
    showFeedback(settingsContent.backups.restored);
  }

  function requestAccountDeletion() {
    showFeedback(settingsContent.backups.deleteRequested);
  }

  return (
    <div className="financial-management-page settings-page">
      <SettingsHeading onSave={saveCurrentView} saving={saving} />
      <SettingsSummary
        profileName={profile.name}
        profileEmail={profile.email}
        protectedAccount={protectedAccount}
        lastActivityAt={lastActivityAt}
        backupsCount={availableBackupsCount}
      />

      <SettingsNavigation value={view} onChange={setView} />

      {view === "profile" ? <ProfileSettingsPanel value={profile} onChange={setProfile} /> : null}
      {view === "preferences" ? <PreferencesPanel value={preferences} onChange={(next) => { setPreferences(next); applyAppearance(next.appearance); }} /> : null}
      {view === "notifications" ? <NotificationsPanel value={notifications} onChange={setNotifications} /> : null}
      {view === "security" ? <SecurityPanel value={security} sessions={sessions} onChange={setSecurity} onSessionsChange={setSessions} onFeedback={showFeedback} /> : null}
      {view === "activity" ? <ActivityPanel entries={initialActivityLog} /> : null}
      {view === "backups" ? (
        <BackupsPanel
          settings={backupSettings}
          snapshots={snapshots}
          onSettingsChange={setBackupSettings}
          onCreate={createBackup}
          onRemove={removeBackup}
          onRestore={restoreBackup}
          onDeleteAccount={requestAccountDeletion}
        />
      ) : null}

      {feedback ? <div className="transaction-feedback settings-feedback" role="status"><CheckIcon /> {feedback}</div> : null}
    </div>
  );
}

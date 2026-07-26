import { ConflictException, Injectable } from "@nestjs/common";
import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../database/prisma.service";
import { UpdatePreferencesDto } from "./dto/update-preferences.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const email = dto.email?.trim().toLowerCase();
    if (email) {
      const existing = await this.prisma.user.findFirst({
        where: { email, id: { not: userId } },
        select: { id: true },
      });
      if (existing) throw new ConflictException("Este e-mail já está em uso.");
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone.trim() || null } : {}),
        ...(dto.locale !== undefined ? { locale: dto.locale.trim() } : {}),
        ...(dto.timezone !== undefined ? { timezone: dto.timezone.trim() } : {}),
      },
    });
    void this.audit.log({ userId, action: "user.profile.update", entity: "user", entityId: userId }).catch(() => undefined);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      locale: user.locale,
      timezone: user.timezone,
    };
  }

  async getPreferences(userId: string) {
    const preferences = await this.prisma.userPreferences.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
    return this.mapPreferences(preferences);
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    const preferences = await this.prisma.userPreferences.upsert({
      where: { userId },
      update: {
        ...(dto.appearance ? { appearance: dto.appearance.toUpperCase() as "SYSTEM" | "LIGHT" | "DARK" } : {}),
        ...(dto.hideBalancesOnOpen !== undefined ? { hideBalancesOnOpen: dto.hideBalancesOnOpen } : {}),
        ...(dto.compactLargeValues !== undefined ? { compactLargeValues: dto.compactLargeValues } : {}),
        ...(dto.notifyUpcomingBills !== undefined ? { notifyUpcomingBills: dto.notifyUpcomingBills } : {}),
        ...(dto.notifyExpectedIncome !== undefined ? { notifyExpectedIncome: dto.notifyExpectedIncome } : {}),
        ...(dto.notifyBudgetAlerts !== undefined ? { notifyBudgetAlerts: dto.notifyBudgetAlerts } : {}),
        ...(dto.notifyLowBalance !== undefined ? { notifyLowBalance: dto.notifyLowBalance } : {}),
        ...(dto.notifyWeeklySummary !== undefined ? { notifyWeeklySummary: dto.notifyWeeklySummary } : {}),
        ...(dto.notifyMonthlyClosing !== undefined ? { notifyMonthlyClosing: dto.notifyMonthlyClosing } : {}),
        ...(dto.notifySecurityAlerts !== undefined ? { notifySecurityAlerts: dto.notifySecurityAlerts } : {}),
        ...(dto.billReminderDays !== undefined ? { billReminderDays: dto.billReminderDays } : {}),
        ...(dto.lowBalanceThreshold !== undefined ? { lowBalanceThreshold: dto.lowBalanceThreshold } : {}),
      },
      create: {
        userId,
        ...(dto.appearance ? { appearance: dto.appearance.toUpperCase() as "SYSTEM" | "LIGHT" | "DARK" } : {}),
        ...(dto.hideBalancesOnOpen !== undefined ? { hideBalancesOnOpen: dto.hideBalancesOnOpen } : {}),
        ...(dto.compactLargeValues !== undefined ? { compactLargeValues: dto.compactLargeValues } : {}),
        ...(dto.notifyUpcomingBills !== undefined ? { notifyUpcomingBills: dto.notifyUpcomingBills } : {}),
        ...(dto.notifyExpectedIncome !== undefined ? { notifyExpectedIncome: dto.notifyExpectedIncome } : {}),
        ...(dto.notifyBudgetAlerts !== undefined ? { notifyBudgetAlerts: dto.notifyBudgetAlerts } : {}),
        ...(dto.notifyLowBalance !== undefined ? { notifyLowBalance: dto.notifyLowBalance } : {}),
        ...(dto.notifyWeeklySummary !== undefined ? { notifyWeeklySummary: dto.notifyWeeklySummary } : {}),
        ...(dto.notifyMonthlyClosing !== undefined ? { notifyMonthlyClosing: dto.notifyMonthlyClosing } : {}),
        ...(dto.notifySecurityAlerts !== undefined ? { notifySecurityAlerts: dto.notifySecurityAlerts } : {}),
        ...(dto.billReminderDays !== undefined ? { billReminderDays: dto.billReminderDays } : {}),
        ...(dto.lowBalanceThreshold !== undefined ? { lowBalanceThreshold: dto.lowBalanceThreshold } : {}),
      },
    });
    void this.audit.log({ userId, action: "user.preferences.update", entity: "user_preferences", entityId: preferences.id }).catch(() => undefined);
    return this.mapPreferences(preferences);
  }

  private mapPreferences(value: {
    appearance: string;
    defaultWorkspaceId: string | null;
    defaultAccountId: string | null;
    hideBalancesOnOpen: boolean;
    compactLargeValues: boolean;
    notifyUpcomingBills: boolean;
    notifyExpectedIncome: boolean;
    notifyBudgetAlerts: boolean;
    notifyLowBalance: boolean;
    notifyWeeklySummary: boolean;
    notifyMonthlyClosing: boolean;
    notifySecurityAlerts: boolean;
    billReminderDays: number;
    lowBalanceThreshold: { toString(): string };
  }) {
    return {
      appearance: value.appearance.toLowerCase(),
      defaultWorkspaceId: value.defaultWorkspaceId,
      defaultAccountId: value.defaultAccountId,
      hideBalancesOnOpen: value.hideBalancesOnOpen,
      compactLargeValues: value.compactLargeValues,
      notifyUpcomingBills: value.notifyUpcomingBills,
      notifyExpectedIncome: value.notifyExpectedIncome,
      notifyBudgetAlerts: value.notifyBudgetAlerts,
      notifyLowBalance: value.notifyLowBalance,
      notifyWeeklySummary: value.notifyWeeklySummary,
      notifyMonthlyClosing: value.notifyMonthlyClosing,
      notifySecurityAlerts: value.notifySecurityAlerts,
      billReminderDays: value.billReminderDays,
      lowBalanceThreshold: Number(value.lowBalanceThreshold.toString()),
    };
  }
}

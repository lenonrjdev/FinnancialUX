import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsIn, IsInt, IsNumber, IsOptional, Max, Min } from "class-validator";

export class UpdatePreferencesDto {
  @ApiPropertyOptional({ enum: ["system", "light", "dark"] })
  @IsOptional()
  @IsIn(["system", "light", "dark"])
  appearance?: "system" | "light" | "dark";

  @IsOptional() @IsBoolean() hideBalancesOnOpen?: boolean;
  @IsOptional() @IsBoolean() compactLargeValues?: boolean;
  @IsOptional() @IsBoolean() notifyUpcomingBills?: boolean;
  @IsOptional() @IsBoolean() notifyExpectedIncome?: boolean;
  @IsOptional() @IsBoolean() notifyBudgetAlerts?: boolean;
  @IsOptional() @IsBoolean() notifyLowBalance?: boolean;
  @IsOptional() @IsBoolean() notifyWeeklySummary?: boolean;
  @IsOptional() @IsBoolean() notifyMonthlyClosing?: boolean;
  @IsOptional() @IsBoolean() notifySecurityAlerts?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(30)
  billReminderDays?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  lowBalanceThreshold?: number;
}

import { Module } from "@nestjs/common";
import { FinanceDataController } from "./finance-data.controller";
import { FinanceDataService } from "./finance-data.service";

@Module({
  controllers: [FinanceDataController],
  providers: [FinanceDataService],
})
export class FinanceDataModule {}

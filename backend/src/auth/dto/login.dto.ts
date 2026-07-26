import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "lenon@ateliux.com.br" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "financeiro2026" })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  remember?: boolean;
}

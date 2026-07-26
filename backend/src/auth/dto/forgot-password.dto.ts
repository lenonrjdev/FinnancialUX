import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

export class ForgotPasswordDto {
  @ApiProperty({ example: "lenon@ateliux.com.br" })
  @IsEmail()
  email!: string;
}

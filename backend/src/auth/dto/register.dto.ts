import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
  @ApiProperty({ example: "Lenon Alexandre" })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: "lenon@ateliux.com.br" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "uma-senha-segura" })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;
}

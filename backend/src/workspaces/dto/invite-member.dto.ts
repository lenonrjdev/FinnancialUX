import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsIn } from "class-validator";

export class InviteMemberDto {
  @ApiProperty({ example: "pessoa@exemplo.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: ["editor", "viewer"] })
  @IsIn(["editor", "viewer"])
  role!: "editor" | "viewer";
}

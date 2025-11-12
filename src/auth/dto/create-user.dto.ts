import { IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  login!: string;

  @IsString()
  @MinLength(4)
  password!: string;
}

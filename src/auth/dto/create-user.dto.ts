import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  login!: string;

  @ApiProperty()
  @IsString()
  @MinLength(4)
  password!: string;
}

/* eslint-disable prettier/prettier */
import {IsEmail, IsEnum, IsNotEmpty, IsString} from 'class-validator';
import {PartialType} from '@nestjs/mapped-types';




export class CreateUserDto {

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsEmail({}, {message: 'Invalid email'})
    email: string;
    role: 'DOCTOR' | 'PATIENT' | 'ADMIN' | 'HOSPITAL';
}

export class UpdateUserDto extends PartialType(CreateUserDto) {

}

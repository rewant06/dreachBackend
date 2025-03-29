/* eslint-disable prettier/prettier */
import {Body, Controller, Get, Param, Post, Patch, Delete, Query, ParseIntPipe,
  ValidationPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Controller('users')
export class UsersController {

    constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query('role') role?: 'DOCTOR' | 'PATIENT' | 'ADMIN' | 'HOSPITAL') {
    return this.usersService.findAll(role);
  }



  @Get(':id')
  findOne(@Param('id') id: string) {
    return {id};
  }
  
  @Post() // POST/users
  create(@Body(ValidationPipe) user: CreateUserDto) {
    return this.usersService.create(user)
  }

  @Patch(':id') // PATCH/ users/:id
  update(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) userUpdate: UpdateUserDto) {
    return this.usersService.update(id, userUpdate)
  }

  @Delete(':id') // DELETE/ users/:id
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.delete(id)
  }
}

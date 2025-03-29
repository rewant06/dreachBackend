/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class UsersService {
    private users = [
        { id: 1, name: 'John Doe', email:'john@dreach.in', role: 'DOCTOR' },
        { id: 2, name: 'Jane Smith', email:'jone@dreach.in', role: 'PATIENT' },
        { id: 3, name: 'Alice Johnson', email:'alice@dreach.in', role: 'ADMIN' },
        { id: 4, name: 'Bob Brown', email:'bob@dreach.in', role: 'HOSPITAL' }
    ];

    findAll(role?: 'DOCTOR' | 'PATIENT' | 'ADMIN' | 'HOSPITAL') {
        if (role) {
          const rolesArray = this.users.filter(user => user.role === role)
          if(rolesArray.length === 0) throw new NotFoundException('User Access Not Found')
            
            return rolesArray;
        }
        return this.users
      }
    

    findOne(id: number) {
        const user = this.users.find(user => user.id === id);
        if (!user) throw new NotFoundException('User Not Found')
        return user
    }

    create(user: CreateUserDto) {
        const usersByHighestId = [...this.users].sort((a,b) => b.id = a.id)

        const newUser = {
            id: usersByHighestId[0].id + 1, ...user
        }

        this.users.push(newUser)
        return newUser 
    }

    update(id: number, updatedUser: UpdateUserDto) {
        this.users = this.users.map(user => {
            if (user.id === id) {
                const updated = { ...user, ...updatedUser } as typeof this.users[0];
                return updated;
            }
            return user;
        });
    }

    delete(id:number) {
        const removedUser = this.findOne(id)
        this.users = this.users.filter(user => user.id !== id)
        return removedUser
      }

}

import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateAccountInput } from './dtos/create-account.dto';
import { User } from './entities/user.entity';
import { UserService } from './users.service';

@Resolver((of) => User)
export class UserResolver {
  constructor(private readonly usersService: UserService) {}

  @Query((returns) => Boolean)
  hi() {
    return true;
  }

  @Mutation((returns) => CreateAccountInput)
  createAccount(@Args('input') createAccountInput: CreateAccountInput) {
    return;
  }
}

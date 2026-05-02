import { randomUUID } from "node:crypto";

import { Injectable } from "@nestjs/common";
import type { UserDto, UserId } from "@rme/contracts";

import { PrismaDatabaseService } from "@/database/database.service.js";
import type { AccountRepository } from "@/modules/identity/ports/account-repository.js";
import type { PasswordCredential } from "@/modules/identity/use-cases/password-credential.js";

@Injectable()
export class PrismaAccountRepository implements AccountRepository {
  constructor(private readonly database: PrismaDatabaseService) {}

  async createAccount(input: {
    email: string;
    name: string;
    passwordCredential: PasswordCredential;
  }): Promise<UserDto | null> {
    const existing = await this.database.user.findUnique({
      where: { email: input.email },
      select: userSelect,
    });
    if (existing) return null;

    return toUserDto(
      await this.database.user.create({
        data: {
          id: `user_${randomUUID()}`,
          email: input.email,
          name: input.name,
          passwordHash: input.passwordCredential.passwordHash,
          passwordSalt: input.passwordCredential.passwordSalt,
        },
        select: userSelect,
      }),
    );
  }

  async updateAccountProfile(userId: UserId, input: { name?: string }): Promise<UserDto | null> {
    const existing = await this.database.user.findUnique({
      where: { id: userId },
      select: userSelect,
    });
    if (!existing) return null;

    return toUserDto(
      await this.database.user.update({
        where: { id: userId },
        data: input.name === undefined ? {} : { name: input.name },
        select: userSelect,
      }),
    );
  }
}

const userSelect = {
  id: true,
  email: true,
  name: true,
} as const;

type UserRecord = Readonly<{
  id: string;
  email: string;
  name: string;
}>;

function toUserDto(record: UserRecord): UserDto {
  return {
    id: record.id as UserId,
    email: record.email,
    name: record.name,
  };
}

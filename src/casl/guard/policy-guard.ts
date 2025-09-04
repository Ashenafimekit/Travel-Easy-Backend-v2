import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  CaslAbilityFactory,
  AppAbility,
} from '../casl-ability.factory/casl-ability.factory';
import { CHECK_POLICIES_KEY, PolicyHandler } from '../policy/policies';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers =
      this.reflector.get<PolicyHandler[]>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) || [];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { user } = context.switchToHttp().getRequest();
    const ability: AppAbility = this.caslAbilityFactory.createForUser(user);

    for (const handler of policyHandlers) {
      const allowed = await this.execPolicyHandler(handler, ability);
      if (!allowed) return false; // stop early if any policy fails
    }

    return true;
  }

  private async execPolicyHandler(
    handler: PolicyHandler,
    ability: AppAbility,
  ): Promise<boolean> {
    if (typeof handler === 'function') {
      // eslint-disable-next-line @typescript-eslint/await-thenable
      return await handler(ability);
    }
    // eslint-disable-next-line @typescript-eslint/await-thenable
    return await handler.handle(ability);
  }
}

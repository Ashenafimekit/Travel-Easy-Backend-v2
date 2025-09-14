import { Injectable } from '@nestjs/common';
import {
  AbilityBuilder,
  ExtractSubjectType,
  InferSubjects,
  MongoAbility,
  createMongoAbility,
} from '@casl/ability';
import { User } from 'src/user/type/user.type';

class Booking {}
class Trip {}
class Bus {}
class Route {}

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

type Subjects =
  | InferSubjects<typeof Booking | typeof Trip | typeof Bus | typeof Route>
  | 'all';

// MongoAbility explicitly typed
export type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User): AppAbility {
    const { can, build } = new AbilityBuilder<MongoAbility<[Action, Subjects]>>(
      createMongoAbility,
    );

    if (user.role === 'STAFF') {
      can(Action.Manage, 'all');
    } else if (user.role === 'PASSENGER') {
      can(Action.Read, Booking);
      can(Action.Create, Booking);
      can(Action.Update, Booking, { userId: user.id });
      can(Action.Delete, Booking, { userId: user.id });
      can(Action.Read, Trip);
      can(Action.Read, Bus);
      can(Action.Read, Route);
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}

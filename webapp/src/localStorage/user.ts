import { Persister, JSONPersister, PersisterKey } from ".";
import { User } from "../models/user";

interface UserPersister extends Persister<User> {}

export const UserPersister: UserPersister = JSONPersister<User>(
  PersisterKey.User,
  window.localStorage
);

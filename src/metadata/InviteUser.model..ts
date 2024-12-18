import API_PRIVATE from '~/providers/types/api-private';

type InviteNewUserContract = API_PRIVATE['/users/invite-new-user'];
type InviteNewUserParams = {
  reqParams: Parameters<InviteNewUserContract>[0],
  session: Parameters<InviteNewUserContract>[1]
};
type InviteNewUserResponse = ReturnType<InviteNewUserContract> extends PromiseLike<infer PT> ? PT : never;

export type {
  InviteNewUserContract,
  InviteNewUserParams,
  InviteNewUserResponse,
};

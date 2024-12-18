import API_PRIVATE from '~/providers/types/api-private';

type GetUsersListContract = API_PRIVATE['/users/list-users'];
type GetUsersListParams = {
  reqParams: Parameters<GetUsersListContract>[0],
  session: Parameters<GetUsersListContract>[1]
};
type GetUsersListResponse = ReturnType<GetUsersListContract> extends PromiseLike<infer PT> ? PT : never;
type GetUsersListType = GetUsersListResponse['list'] extends (infer U)[] ? U : GetUsersListResponse['list'];

export type {
  GetUsersListContract,
  GetUsersListParams,
  GetUsersListResponse,
  GetUsersListType,
};

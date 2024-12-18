import API_PRIVATE from '~/providers/types/api-private';

type GetClientsListContract = API_PRIVATE['/clients/get-clients-list'];
type GetClientsListParams = {
  reqParams: Parameters<GetClientsListContract>[0],
  session: Parameters<GetClientsListContract>[1]
};
type GetClientsListResponse = ReturnType<GetClientsListContract> extends PromiseLike<infer PT> ? PT : never;
type GetClientsListType = GetClientsListResponse['list'] extends (infer U)[] ? U : GetClientsListResponse['list'];

export type {
  GetClientsListContract,
  GetClientsListParams,
  GetClientsListResponse,
  GetClientsListType,
};

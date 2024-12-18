import API_PRIVATE from '~/providers/types/api-private';

type GetUnitsListContract = API_PRIVATE['/clients/get-units-list'];
type GetUnitsListParams = {
  reqParams: Parameters<GetUnitsListContract>[0],
  session: Parameters<GetUnitsListContract>[1]
};
type GetUnitsListResponse = ReturnType<GetUnitsListContract> extends PromiseLike<infer PT> ? PT : never;
type GetUnitsListType = GetUnitsListResponse extends (infer U)[] ? U : GetUnitsListResponse;

export type {
  GetUnitsListContract,
  GetUnitsListParams,
  GetUnitsListResponse,
  GetUnitsListType,
};

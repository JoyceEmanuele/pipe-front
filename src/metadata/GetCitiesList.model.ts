import API_PRIVATE from '~/providers/types/api-private';

type GetCitiesListContract = API_PRIVATE['/dac/get-cities-list'];
type GetCitiesListParams = {
  reqParams: Parameters<GetCitiesListContract>[0],
  session: Parameters<GetCitiesListContract>[1]
};
type GetCitiesListResponse = ReturnType<GetCitiesListContract> extends PromiseLike<infer PT> ? PT : never;
type GetCitiesListType = GetCitiesListResponse['list'] extends (infer U)[] ? U : GetCitiesListResponse['list'];

export type {
  GetCitiesListContract,
  GetCitiesListParams,
  GetCitiesListResponse,
  GetCitiesListType,
};

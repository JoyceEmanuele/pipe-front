import API_PRIVATE from '~/providers/types/api-private';

type GetTvCharacteristicsListContract = API_PRIVATE['/vt/list-vt-caracteristicas'];
type GetTvCharacteristicsListParams = {
  reqParams: Parameters<GetTvCharacteristicsListContract>[0],
  session: Parameters<GetTvCharacteristicsListContract>[1]
};
type GetTvCharacteristicsListResponse = ReturnType<GetTvCharacteristicsListContract> extends PromiseLike<infer PT> ? PT : never;
type GetTvCharacteristicsListType = GetTvCharacteristicsListResponse extends (infer U)[] ? U : GetTvCharacteristicsListResponse;

export type {
  GetTvCharacteristicsListContract,
  GetTvCharacteristicsListParams,
  GetTvCharacteristicsListResponse,
  GetTvCharacteristicsListType,
};

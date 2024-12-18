import API_PRIVATE from '~/providers/types/api-private';

type GetTechnicalVisitsListContract = API_PRIVATE['/vt/list-vt-byStatus'];
type GetTechnicalVisitsListParams = {
  reqParams: Parameters<GetTechnicalVisitsListContract>[0],
  session: Parameters<GetTechnicalVisitsListContract>[1]
};
type GetTechnicalVisitsListResponse = ReturnType<GetTechnicalVisitsListContract> extends PromiseLike<infer PT> ? PT : never;
type GetTechnicalVisitsListType = GetTechnicalVisitsListResponse extends (infer U)[] ? U : GetTechnicalVisitsListResponse;

export const TVStatusValues = {
  Agendado: 1,
  EmAndamento: 2,
  AguardandoAprovacao: 3,
  Finalizado: 4,
  Reagendado: 5,
};

export type {
  GetTechnicalVisitsListContract,
  GetTechnicalVisitsListParams,
  GetTechnicalVisitsListResponse,
  GetTechnicalVisitsListType,
};

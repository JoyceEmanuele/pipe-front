import API_PRIVATE from '~/providers/types/api-private';

type GetTechnicalVisitInfoContract = API_PRIVATE['/vt/get-vt-info'];
type GetTechnicalVisitInfoParams = {
  reqParams: Parameters<GetTechnicalVisitInfoContract>[0],
  session: Parameters<GetTechnicalVisitInfoContract>[1]
};
type GetTechnicalVisitInfoResponse = ReturnType<GetTechnicalVisitInfoContract> extends PromiseLike<infer PT> ? PT : never;

export const TVStatusValues = {
  Agendado: 1,
  EmAndamento: 2,
  AguardandoAprovacao: 3,
  Finalizado: 4,
  Reagendado: 5,
};

export type {
  GetTechnicalVisitInfoContract,
  GetTechnicalVisitInfoParams,
  GetTechnicalVisitInfoResponse,
};

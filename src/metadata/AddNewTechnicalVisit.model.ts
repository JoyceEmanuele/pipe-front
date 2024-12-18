import API_PRIVATE from '~/providers/types/api-private';

type AddNewTechnicalVisitContract = API_PRIVATE['/vt/set-vt-info'];
type AddNewTechnicalVisitParams = {
  reqParams: Parameters<AddNewTechnicalVisitContract>[0],
  session: Parameters<AddNewTechnicalVisitContract>[1]
};
type AddNewTechnicalVisitResponse = ReturnType<AddNewTechnicalVisitContract> extends PromiseLike<infer PT> ? PT : never;

export type {
  AddNewTechnicalVisitContract,
  AddNewTechnicalVisitParams,
  AddNewTechnicalVisitResponse,
};

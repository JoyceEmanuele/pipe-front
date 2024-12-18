import API_PRIVATE from '~/providers/types/api-private';

type EditTechnicalVisitContract = API_PRIVATE['/vt/update-vt-info'];
type EditTechnicalVisitParams = {
  reqParams: Parameters<EditTechnicalVisitContract>[0],
  session: Parameters<EditTechnicalVisitContract>[1]
};
type EditTechnicalVisitResponse = ReturnType<EditTechnicalVisitContract> extends PromiseLike<infer PT> ? PT : never;

export type {
  EditTechnicalVisitContract,
  EditTechnicalVisitParams,
  EditTechnicalVisitResponse,
};

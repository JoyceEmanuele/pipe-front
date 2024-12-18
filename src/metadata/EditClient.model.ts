import API_PRIVATE from '~/providers/types/api-private';

type EditClientContract = API_PRIVATE['/clients/edit-client'];
type EditClientParams = {
  reqParams: Parameters<EditClientContract>[0],
  session: Parameters<EditClientContract>[1]
};
type EditClientResponse = ReturnType<EditClientContract> extends PromiseLike<infer PT> ? PT : never;

export type {
  EditClientContract,
  EditClientParams,
  EditClientResponse,
};

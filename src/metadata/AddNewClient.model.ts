import API_PRIVATE from '~/providers/types/api-private';

type AddNewClientContract = API_PRIVATE['/clients/add-new-client'];
type AddNewClientParams = {
  reqParams: Parameters<AddNewClientContract>[0],
  session: Parameters<AddNewClientContract>[1]
};
type AddNewClientResponse = ReturnType<AddNewClientContract> extends PromiseLike<infer PT> ? PT : never;

export type {
  AddNewClientContract,
  AddNewClientParams,
  AddNewClientResponse,
};

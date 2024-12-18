import API_PRIVATE from '~/providers/types/api-private';

type GetDacsFaultsContract = API_PRIVATE['/get-dacs-faults'];
type GetDacsFaultsParams = {
  reqParams: Parameters<GetDacsFaultsContract>[0],
  session: Parameters<GetDacsFaultsContract>[1]
};
type GetDacsFaultsResponse = ReturnType<GetDacsFaultsContract> extends PromiseLike<infer PT> ? PT : never;
type GetDacsFaultsListType = GetDacsFaultsResponse['list'] extends (infer U)[] ? U : GetDacsFaultsResponse['list'];

export type {
  GetDacsFaultsContract,
  GetDacsFaultsParams,
  GetDacsFaultsResponse,
  GetDacsFaultsListType,
};

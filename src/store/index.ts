import { createStore, applyMiddleware, Reducer } from 'redux';
import thunk from 'redux-thunk';

// import logger from 'redux-logger'
import { ApiResps } from 'providers';

const middleware = [thunk];
// if (process.env.NODE_ENV === 'development') {
//   middleware.push(logger)
// }

export type DevFullInfo = ApiResps['/get-dev-full-info']['info'] & {
  dac?: ApiResps['/get-dev-full-info']['dac']
  dut?: ApiResps['/get-dev-full-info']['dut']
  dam?: ApiResps['/get-dev-full-info']['dam']
  dut_aut?: ApiResps['/get-dev-full-info']['dut_aut']
  dri?: ApiResps['/get-dev-full-info']['dri']
  dma?: ApiResps['/get-dev-full-info']['dma']
  dal?: ApiResps['/get-dev-full-info']['dal']
  dmt?: ApiResps['/get-dev-full-info']['dmt']
  optsDescs?: ApiResps['/get-dev-full-info']['optsDescs']
};

type StoreData = {
  devInfo: DevFullInfo
};

const InitialState: StoreData = {
  devInfo: {} as any,
};

const reducer: Reducer = function (state: StoreData|undefined, action: { type: string, payload?: any }) {
  if (!state) {
    state = { ...InitialState };
  }
  switch (action && action.type) {
    case 'SET_DEV_INFO':
      state.devInfo = action.payload || {};
      break;
    case 'RESET_DATA':
      return { ...InitialState };
      // return {};
      // return null;
  }
  return state;
};

const store = createStore(reducer, applyMiddleware(...middleware));
export default store;

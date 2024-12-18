import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import 'moment/locale/pt-br';
import { Helmet } from 'react-helmet';
import { toast } from 'react-toastify';
import { useRouteMatch } from 'react-router';
import { useStateVar } from 'helpers/useStateVar';
import { apiCall, ApiResps } from 'providers';
import {
  Wrapper,
} from './styles';
import { Loader } from 'components';
import { UtilityLayout } from './UtilityLayout';
import { DmtUsageIndex } from '../DMTs/DmtUsageIndex';
import { DalUsageIndex } from '../DALs/DalUsageIndex';
import { withTransaction } from '@elastic/apm-rum-react';
import { generateNameFormatted } from '~/helpers/titleHelper';

export const UtilityUsageIndex = (): JSX.Element => {
  const { t } = useTranslation();
  const match = useRouteMatch<{ type: string, utilId: string }>();

  const { type, utilId } = match.params;

  const [state, _render, setState] = useStateVar(() => {
    moment.locale('pt-br');
    return {
      selectedIndex: -1 as number,
      utilInfo: null as null|(ApiResps['/dmt/get-nobreak-info'])|(ApiResps['/dal/get-illumination-info']),
      isLoading: false,
      linkBase: match.url.split(`/${match.params.utilId}`)[0],
      isNobreak: false,
      isIllumination: false,
      isDmt: false,
      isDal: false,
    };
  });

  async function getUtilityInfo() {
    try {
      setState({ isLoading: true });
      if (type === 'nobreak') {
        const utilInfo = await apiCall('/dmt/get-nobreak-info', { NOBREAK_ID: Number(utilId) });
        state.utilInfo = utilInfo;
        state.isNobreak = true;
      }
      if (type === 'iluminacao') {
        const utilInfo = await apiCall('/dal/get-illumination-info', { ILLUMINATION_ID: Number(utilId) });
        state.utilInfo = utilInfo;
        state.isIllumination = true;
      }
      state.isDal = !!(state.utilInfo && 'DAL_CODE' in state.utilInfo && state.utilInfo.DAL_CODE);
      state.isDmt = !!(state.utilInfo?.DMT_CODE);
    } catch (err) {
      console.log(err);
      toast.error(t('houveErro'));
    }
    setState({ isLoading: false });
  }

  useEffect(() => {
    getUtilityInfo();
  }, []);

  return (
    <>
      <Helmet>
        <title>{generateNameFormatted(state.utilInfo?.NAME, t('indiceUso'))}</title>
      </Helmet>
      <UtilityLayout key={state.selectedIndex} utilInfo={state.utilInfo} />
      <Wrapper>
        <div
          style={{
            overflowY: 'scroll', maxHeight: '100%', height: state.isDmt ? 'calc(100vh - 210px)' : undefined, padding: '0px 10px',
          }}
        >
          {(state.isLoading)
            && (
            <div style={{ paddingTop: '40px' }}>
              {' '}
              <Loader />
              {' '}
            </div>
            )}
          {((state.isDmt || state.isDal) && !state.isLoading)
            && (
            <div>
              <div style={{ paddingBottom: '30px' }}>
                { state.isDmt
                && (
                  <DmtUsageIndex utilityInfo={state.utilInfo as ApiResps['/dmt/get-nobreak-info']} />
                )}
                { state.isDal
                && (
                  <DalUsageIndex illuminationInfo={state.utilInfo as ApiResps['/dal/get-illumination-info']} />
                )}
                { (!state.isDmt && !state.isDal)
                && (
                <>
                  (vazio)
                </>
                )}

              </div>
            </div>
            )}
        </div>
      </Wrapper>
    </>
  );
};

export default withTransaction('UtilityUsageIndex', 'component')(UtilityUsageIndex);

import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useRouteMatch } from 'react-router';
import { toast } from 'react-toastify';
import {
  Loader,
} from '~/components';
import { useTranslation } from 'react-i18next';
import { useStateVar } from 'helpers/useStateVar';
import { apiCall, ApiResps } from '~/providers';
import { UtilityLayout } from './UtilityLayout';
import { IlluminationEdit } from './Illumination/IlluminationEdit';
import { NobreakEdit } from './Nobreak/NobreakEdit';
import { withTransaction } from '@elastic/apm-rum-react';
import { generateNameFormatted } from '~/helpers/titleHelper';

export const EditUtilityInfo = ({ utilInfo }): JSX.Element => {
  const match = useRouteMatch<{ utilId: string, type: string }>();
  const { t } = useTranslation();
  const [state, render, setState] = useStateVar({
    linkBase: match.url.split(`/${match.params.utilId}`)[0],
    isLoading: false,
    utilInfo: utilInfo as (ApiResps['/dal/get-illumination-info'] | (ApiResps['/dmt/get-nobreak-info'])),
  });

  const { utilId, type } = match.params;

  async function getUtilityInfo() {
    if (!utilInfo || state.isLoading) {
      try {
        setState({ isLoading: true });
        if (type === 'nobreak') {
          const utilInfo = await apiCall('/dmt/get-nobreak-info', { NOBREAK_ID: Number(utilId) });
          state.utilInfo = utilInfo;
        } else if (type === 'iluminacao') {
          const utilInfo = await apiCall('/dal/get-illumination-info', { ILLUMINATION_ID: Number(utilId) });
          state.utilInfo = utilInfo;
        }
      } catch (err) {
        console.log(err);
        toast.error(t('houveErro'));
      }
      setState({ isLoading: false });
    }
  }

  useEffect(() => {
    getUtilityInfo();
  }, []);

  return (
    <>
      <Helmet>
        <title>{generateNameFormatted(state.utilInfo?.NAME, t('perfil'))}</title>
      </Helmet>
      <UtilityLayout utilInfo={state.utilInfo} />
      {state.isLoading && (
        <div style={{ marginTop: '50px' }}>
          <Loader variant="primary" />
        </div>
      )}
      <div style={{ marginTop: '30px' }} />
      {(!state.isLoading) && state.utilInfo && type === 'iluminacao' && (
        <IlluminationEdit utilInfo={state.utilInfo} getUtilityInfo={getUtilityInfo} />
      )}
      {(!state.isLoading) && state.utilInfo && type === 'nobreak' && (
        <NobreakEdit utilInfo={state.utilInfo} getUtilityInfo={getUtilityInfo} />
      )}
    </>
  );
};

export default withTransaction('EditUtilityInfo', 'component')(EditUtilityInfo);

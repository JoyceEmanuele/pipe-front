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
  Card,
} from './styles';
import { UtilityLayout } from './UtilityLayout';
import { IlluminationInfo } from './Illumination/IlluminationInfo';
import { NobreakInfo } from './Nobreak/NobreakInfo';
import { withTransaction } from '@elastic/apm-rum-react';
import { generateNameFormatted } from '~/helpers/titleHelper';

export const UtilityInfo = (): JSX.Element => {
  const { t } = useTranslation();
  const match = useRouteMatch<{ utilId: string, type: string }>();

  const { type, utilId } = match.params;

  const [state, _, setState] = useStateVar(() => {
    moment.locale('pt-br');
    return {
      selectedIndex: -1 as number,
      utilInfo: null as null|(ApiResps['/dal/get-illumination-info'])|(ApiResps['/dmt/get-nobreak-info']),
      isLoading: false,
      linkBase: match.url.split(`/${match.params.utilId}`)[0],
    };
  });

  async function getUtilityInfo() {
    try {
      setState({ isLoading: true });
      let utilInfo;
      if (type === 'iluminacao') {
        utilInfo = await apiCall('/dal/get-illumination-info', { ILLUMINATION_ID: Number(utilId) });
      } else if (type === 'nobreak') {
        utilInfo = await apiCall('/dmt/get-nobreak-info', { NOBREAK_ID: Number(utilId) });
      }
      state.utilInfo = utilInfo;
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
        <title>{generateNameFormatted(state.utilInfo?.NAME, t('perfil'))}</title>
      </Helmet>
      <UtilityLayout key={state.selectedIndex} utilInfo={state.utilInfo} />
      <Card style={{ borderTop: '10px solid #363BC4' }}>
        {type === 'iluminacao' && state.utilInfo && <IlluminationInfo screen="utilityInfo" util={state.utilInfo} /> }
        {type === 'nobreak' && state.utilInfo && <NobreakInfo screen="utilityInfo" util={state.utilInfo} /> }
      </Card>
    </>
  );
};

export default withTransaction('UtilityInfo', 'component')(UtilityInfo);

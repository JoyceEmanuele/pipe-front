import { useEffect } from 'react';
import { useStateVar } from 'helpers/useStateVar';
import queryString from 'query-string';
import { Helmet } from 'react-helmet';
import { useHistory, useParams } from 'react-router';
import { Flex, Box } from 'reflexbox';
import { useTranslation } from 'react-i18next';
import { Breadcrumb, Card, Loader } from '~/components';

import { FormEditNotification } from '../FormEditNotification';
import { EnergyNotification } from './EnergyNotification';
import { apiCall } from '~/providers';
import { withTransaction } from '@elastic/apm-rum-react';
// import { Card } from './styles';

export const Notification = (): JSX.Element => {
  const routeParams = useParams<{ notifId: string }>();
  const history = useHistory();
  const { t } = useTranslation();
  const { tipo: notificationType } = queryString.parse(history.location.search);
  const { notifId } = routeParams;
  const [state, render, setState] = useStateVar({
    notifInfo: null as null|{
      CLIENT_ID?: number
      FILT_IDS?: (string[])|(number[])
      FILT_TYPE?: string
      FREQ?: string
      NAME?: string
      COND_VAR?: string
      COND_OP?: string
      COND_VAL?: string
      COND_SECONDARY_VAL?: string
      NOTIF_DESTS?: string[]
      COND_PARS?: string
    },
    isLoading: true,
  });

  useEffect(() => {
    handleGetNotifInfo();
  }, []);

  async function handleGetNotifInfo() {
    if (notifId) {
      await apiCall('/dac/get-notification-request', { notifId: Number(notifId) }).then((info) => {
        setState({ notifInfo: info, isLoading: false });
      });
    }
    setState({ isLoading: false });
  }

  return (
    <>
      <Helmet>
        <title>
          Diel Energia -
          {' '}
          {notifId ? t('editar') : t('nova')}
          {' '}
          {t('notificacao')}
        </title>
      </Helmet>
      {state.isLoading ? (
        <Loader variant="primary" size="large" />
      ) : (
        <Card>
          {(notificationType === 'Energia' || state.notifInfo?.COND_VAR === 'ENERGY') ? (
            <EnergyNotification
              notificationType={notificationType as string}
              notifId={Number(notifId)}
              notifInfo={state.notifInfo}
              onSuccess={() => history.push('/notificacoes/gerenciamento')}
              onCancel={() => history.push('/notificacoes/gerenciamento')}
            />
          ) : (
            <>
              <Flex mb="24px">
                <Box>
                  <Breadcrumb />
                </Box>
              </Flex>
              <FormEditNotification
                notificationType={notificationType as string}
                notifId={Number(notifId)}
                notifInfo={state.notifInfo}
                onSuccess={() => history.push('/notificacoes/gerenciamento')}
                onCancel={() => history.push('/notificacoes/gerenciamento')}
              />
            </>
          )}
        </Card>
      )}
    </>
  );
};

export default withTransaction('Notification', 'component')(Notification);

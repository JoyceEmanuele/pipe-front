import { Helmet } from 'react-helmet';

import { AdminLayout } from '../AdminLayout';
import { ClientsList } from '../ClientsList';
import { withTransaction } from '@elastic/apm-rum-react';
import { t } from 'i18next';

export const ClientsListWrapper = (): JSX.Element => (
  <>
    <Helmet>
      <title>{t('celcius360Empresas')}</title>
    </Helmet>
    <AdminLayout />
    <ClientsList />
  </>
);

export default withTransaction('ClientsListWrapper', 'component')(ClientsListWrapper);

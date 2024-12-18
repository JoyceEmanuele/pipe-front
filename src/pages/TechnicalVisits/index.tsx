import { Helmet } from 'react-helmet';

import { Layout } from './Layout';
import { TechnicalUsersListing as TechnicalUsersListingPage } from './TechnicalUsersListing';
import { TVListing as TVListingPage } from './TVListing';
import { TVRegistration as TVRegistrationPage } from './TVRegistration';
import { withTransaction } from '@elastic/apm-rum-react';

export const TVRegistration = (): JSX.Element => (
  <Layout>
    <Helmet>
      <title>Diel Energia - Cadastro de VT</title>
    </Helmet>
    <TVRegistrationPage />
  </Layout>
);

export const TVListing = (): JSX.Element => (
  <Layout>
    <Helmet>
      <title>Diel Energia - Visitas Técnicas</title>
    </Helmet>
    <TVListingPage />
  </Layout>
);

export const TechnicalUsersListing = (): JSX.Element => (
  <Layout>
    <Helmet>
      <title>Diel Energia - Usuários Técnicos</title>
    </Helmet>
    <TechnicalUsersListingPage />
  </Layout>
);

export default withTransaction('TVListing', 'component')(TVListing);

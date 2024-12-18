import { Helmet } from 'react-helmet';
import {
  Card,
} from 'components';

import { AdminLayout } from '../../AdminLayout';
import { ProjetoBBLayout } from '../ProjetoBBLayout';
import { PowerBIEmbedContainer, PowerBIEmbedTitle } from '../styles';
import '../ProjetoBB.css';
import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';
import { getUserProfile } from '~/helpers/userProfile';
import { useState } from 'react';
import { ClientPanelLayout } from '~/pages/ClientPanel/ClientPanelLayout';
import { withTransaction } from '@elastic/apm-rum-react';

export function ProjetoBBCronograma(): JSX.Element {
  const [profile] = useState(getUserProfile);
  return (
    <>
      <Helmet>
        <title>Diel Energia - Projeto BB Cronograma</title>
      </Helmet>
      {(profile.permissions.isAdminSistema)
      && <AdminLayout />}
      {((!profile.manageAllClients) && (profile.manageSomeClient) && !profile.permissions.isInstaller)
        && <ClientPanelLayout />}
      {(profile.permissions.isAdminSistema || ((!profile.manageAllClients) && (profile.manageSomeClient) && !profile.permissions.isInstaller && profile.permissions.CLIENT_MANAGE.includes(145)))
      && (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '23px' }}>
          <ProjetoBBLayout />
        </div>
        <Card>
          <>
            <PowerBIEmbedContainer>
              <PowerBIEmbedTitle>REPORT BANCO DO BRASIL - Resumo</PowerBIEmbedTitle>
              <PowerBIEmbed
                embedConfig={{
                  type: 'report', // Supported types: report, dashboard, tile, visual, qna, paginated report and create
                  id: '<Report Id>',
                  embedUrl: 'https://dielenergialtda749.sharepoint.com/:x:/s/PROJETO-BANCODOBRASIL/EdJ3Mf6TM39CvxE4sejqsAMBKYdOD3sAzJvJP47IIV7wNA?rtime=X6BHYBbx20g&action=embedview',
                  accessToken: '<Access Token>',
                  tokenType: models.TokenType.Embed, // Use models.TokenType.Aad for SaaS embed
                  settings: {
                    panes: {
                      filters: {
                        expanded: false,
                        visible: false,
                      },
                    },
                    background: models.BackgroundType.Transparent,
                  },
                }}
                eventHandlers={
                new Map([
                  ['loaded', function () { console.log('Report loaded'); }],
                  ['rendered', function () { console.log('Report rendered'); }],
                  ['error', function (event) { console.log(event && event.detail); }],
                  ['visualClicked', () => console.log('visual clicked')],
                  ['pageChanged', (event) => console.log(event)],
                ])
              }
                cssClassName="Embed-container"
              />
            </PowerBIEmbedContainer>

          </>
        </Card>
      </>
      )}
    </>
  );
}

export default withTransaction('ProjetoBBCronograma', 'component')(ProjetoBBCronograma);

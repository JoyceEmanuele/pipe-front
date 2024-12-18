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
import { useState } from 'react';
import { getUserProfile } from '~/helpers/userProfile';
import { ClientPanelLayout } from '~/pages/ClientPanel/ClientPanelLayout';
import { withTransaction } from '@elastic/apm-rum-react';

export function ProjetoBBKPIs(): JSX.Element {
  const [profile] = useState(getUserProfile);

  return (
    <>
      <Helmet>
        <title>Diel Energia - Projeto BB KPIs</title>
      </Helmet>
      {(profile.permissions.isAdminSistema)
      && <AdminLayout />}
      {((!profile.manageAllClients) && (profile.manageSomeClient) && !profile.permissions.isInstaller && profile.permissions.CLIENT_MANAGE.includes(145))
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
              <PowerBIEmbedTitle>KPIs BB</PowerBIEmbedTitle>
              <PowerBIEmbed
                embedConfig={{
                  type: 'report', // Supported types: report, dashboard, tile, visual, qna, paginated report and create
                  id: '<Report Id>',
                  embedUrl: 'https://dielenergialtda749.sharepoint.com/:x:/s/PROJETO-BANCODOBRASIL/EYrrEYQhukxBhr0ublrGkPUBHTl_gK1zTb_3-JWdMZPbHA?e=4%3ApiYdph&fromShare=true&at=9&action=embedview',
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

export default withTransaction('ProjetoBBKPIs', 'component')(ProjetoBBKPIs);

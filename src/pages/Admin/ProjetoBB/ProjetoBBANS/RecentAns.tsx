import { Helmet } from 'react-helmet';
import {
  Card,
} from 'components';
import { AdminLayout } from '../../AdminLayout';
import { AnsLayout, ProjetoBBLayout } from '../ProjetoBBLayout';
import { PowerBIEmbedContainer, PowerBIEmbedTitle } from '../styles';
import '../ProjetoBB.css';
import { PowerBIEmbed } from 'powerbi-client-react';
import { models } from 'powerbi-client';
import { useState } from 'react';
import { getUserProfile } from '~/helpers/userProfile';
import { ClientPanelLayout } from '~/pages/ClientPanel/ClientPanelLayout';
import { withTransaction } from '@elastic/apm-rum-react';

export function ProjetoBBANSRecente(): JSX.Element {
  const [profile] = useState(getUserProfile);
  return (
    <>
      <Helmet>
        <title>Diel Energia - Projeto BB ANS</title>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '23px' }}>
          <AnsLayout />
        </div>
        <Card>
          <PowerBIEmbedContainer>
            <PowerBIEmbedTitle>ANS - BANCO DO BRASIL</PowerBIEmbedTitle>
            <PowerBIEmbed
              embedConfig={{
                type: 'report', // Supported types: report, dashboard, tile, visual, qna, paginated report and create
                id: '<Report Id>',
                embedUrl: 'https://dielenergialtda749.sharepoint.com/:x:/s/PROJETO-BANCODOBRASIL/ERrRx6YOshBAjSYKbA3fu9UBlCOk6MrAB1kM_qUQYeyYfQ?e=GzglFB&fromShare=true&at=9&action=embedview',
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
        </Card>
      </>
      )}
    </>
  );
}

export default withTransaction('ProjetoBBANSRecente', 'component')(ProjetoBBANSRecente);

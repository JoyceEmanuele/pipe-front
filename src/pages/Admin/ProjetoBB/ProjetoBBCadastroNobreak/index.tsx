import { Helmet } from 'react-helmet';
import {
  Card,
} from 'components';

import { AdminLayout } from '../../AdminLayout';
import { ProjetoBBLayout } from '../ProjetoBBLayout';
import { PowerBIEmbedContainer, PowerBIEmbedTitle } from '../styles';
import '../ProjetoBB.css';
import { PowerBIEmbed } from 'powerbi-client-react';
import { useEffect, useRef, useState } from 'react';
import { getUserProfile } from '~/helpers/userProfile';
import { ClientPanelLayout } from '~/pages/ClientPanel/ClientPanelLayout';
import { withTransaction } from '@elastic/apm-rum-react';
import { models, Report } from 'powerbi-client';

export function ProjetoBBNobreak(): JSX.Element {
  const [profile] = useState(getUserProfile);
  const embedRef = useRef<HTMLDivElement | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [pages, setPages] = useState<models.IPage[]>([]);

  useEffect(() => {
    if (report) {
      report.getPages().then((reportPages) => {
        setPages(reportPages);
      }).catch((error) => {
        console.error('Error getting pages:', error);
      });
    }
  }, [report]);

  const navigateToPage = (pageName: string) => {
    if (report) {
      report.getPages().then((reportPages) => {
        const page = reportPages.find((p) => p.name === pageName);
        if (page) {
          page.setActive().catch((error) => {
            console.error('Error setting active page:', error);
          });
        }
      }).catch((error) => {
        console.error('Error getting pages:', error);
      });
    }
  };
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
          <PowerBIEmbedContainer ref={embedRef}>
            <PowerBIEmbedTitle>Cadastro Nobreak</PowerBIEmbedTitle>
            <PowerBIEmbed
              embedConfig={{
                type: 'report',
                id: '<Report Id>',
                embedUrl: 'https://dielenergialtda749.sharepoint.com/:x:/s/PROJETO-BANCODOBRASIL/EYNZKCMp0Q5AuHtLOGS21rwBS5vShn4DPQbt7pLfXkecVA?e=uAx8vl&fromShare=true&at=9&action=embedview',
                accessToken: '<Access Token>',
                tokenType: models.TokenType.Embed,
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
                  ['loaded', () => { console.log('Report loaded'); }],
                  ['rendered', () => { console.log('Report rendered'); }],
                  ['error', (event: any) => { console.log(event && event.detail); }],
                  ['visualClicked', () => console.log('visual clicked')],
                  ['pageChanged', (event: any) => console.log(event)],
                  ['loaded', () => {
                    if (embedRef.current) {
                      const powerbi = window.powerbi;
                      const reportInstance = powerbi.get(embedRef.current) as Report;
                      setReport(reportInstance);
                    }
                  }],
                ])
              }
              cssClassName="Embed-container"
            />
            <div>
              {pages.map((page) => (
                <button type="button" key={page.name} onClick={() => navigateToPage(page.name)}>
                  {page.displayName}
                </button>
              ))}
            </div>
          </PowerBIEmbedContainer>
        </Card>
      </>
      )}
    </>
  );
}

export default withTransaction('ProjetoBBNobreak', 'component')(ProjetoBBNobreak);

import { useEffect, useState } from 'react';

import { useHistory } from 'react-router-dom';

import { Button } from '~/components';

import {
  DefaultCard, TabsContainer, TabsList, TabItem,
} from '../components/StyledComponents';
import { TVList } from './components/TVList';
import { CardHeader, CardSubHeader, Content } from './styles';

const TVStatusValues = {
  Agendado: 1,
  EmAndamento: 2,
  AguardandoAprovacao: 3,
  Finalizado: 4,
  Reagendado: 5,
};

type TVStatus = {
  label: string;
  value: typeof TVStatusValues[keyof typeof TVStatusValues];
}

const TABS: TVStatus[] = [
  {
    label: 'Agendado',
    value: TVStatusValues.Agendado,
  },
  {
    label: 'Em Andamento',
    value: TVStatusValues.EmAndamento,
  },
  {
    label: 'Aprovar',
    value: TVStatusValues.AguardandoAprovacao,
  },
  {
    label: 'Finalizado',
    value: TVStatusValues.Finalizado,
  },
];

export const TechnicalUsersListing = (): JSX.Element => {
  const history = useHistory();
  const [activeTab, setActiveTab] = useState(0);

  const fetchTechnicalVisitsList = async () => {
  };

  useEffect(() => {
    fetchTechnicalVisitsList();
  }, []);

  return (
    <DefaultCard style={{ padding: 30 }}>
      <CardHeader>
        <Button variant="primary" type="submit" style={{ width: 170 }} onClick={() => history.push('/visita-tecnica/registro')}>
          ADICIONAR TÉCNICO
        </Button>
        <TabsContainer style={{ width: '80%' }}>
          <TabsList>
            {TABS.map((item, index) => (
              <TabItem key={item.label} isActive={index === activeTab} style={{ cursor: 'pointer', padding: '5px 10px' }} role="button" onClick={() => setActiveTab(index)}>
                {item.label}
              </TabItem>
            ))}
          </TabsList>
        </TabsContainer>
      </CardHeader>
      <CardSubHeader>
        <b>VTs Agendadas</b>
        <span>
          Total
          <b> 10VTs</b>
        </span>
      </CardSubHeader>
      <Content>
        <TVList />
      </Content>
    </DefaultCard>
  );
};

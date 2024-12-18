/* eslint-disable no-case-declarations */
import { useEffect, useState } from 'react';

import moment from 'moment';
import { useHistory, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

import { Button } from '~/components';
import { LoadingSpinner } from '~/components/LoadingSpinner';
import { InputSearch } from '~/components/NewInputs/Search';
import { GetTechnicalVisitsListType, TVStatusValues } from '~/metadata/GetTechnicalVisitsList';
import { apiCall } from '../../../providers';

import {
  DefaultCard, TabsContainer, TabsList, TabItem,
} from '../components/StyledComponents';
import { TVList } from './components/TVList';
import { CardHeader, CardSubHeader, Content } from './styles';

type TVStatus = {
  label: string;
  pluralLabel: string;
  filter: typeof TVStatusValues[keyof typeof TVStatusValues];
}

const TABS: TVStatus[] = [
  {
    label: 'Agendado',
    pluralLabel: 'Agendadas',
    filter: TVStatusValues.Agendado,
  },
  {
    label: 'Em Andamento',
    pluralLabel: 'Em Andamento',
    filter: TVStatusValues.EmAndamento,
  },
  {
    label: 'Aprovar',
    pluralLabel: 'Aguardando Aprovação',
    filter: TVStatusValues.AguardandoAprovacao,
  },
  {
    label: 'Finalizado',
    pluralLabel: 'Finalizadas',
    filter: TVStatusValues.Finalizado,
  },
];

type Truthy<T> = T extends false | '' | 0 | null | undefined ? never : T; // from lodash

function truthy<T>(value: T): value is Truthy<T> {
  return !!value;
}

export const TVListing = (): JSX.Element => {
  const history = useHistory();
  const { pathname } = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<typeof TVStatusValues[keyof typeof TVStatusValues]>(TVStatusValues.Agendado);
  const [searchTerm, setSearchTerm] = useState('');
  const [technicalVisitsList, setTechnicalVisitsList] = useState<GetTechnicalVisitsListType[]>([]);
  const [filteredTechnicalVisitsList, setFilteredTechnicalVisitsList] = useState<GetTechnicalVisitsListType[]>([]);

  const fetchTechnicalVisitsList = async () => {
    try {
      setIsLoading(true);
      const listOfTechnicalVisits = await apiCall('/vt/list-vt-byStatus', { STATUS_ID: [statusFilter] });
      setTechnicalVisitsList(listOfTechnicalVisits);
    } catch {
      toast.error('Não foi possível buscar as visitas técnicas.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      setIsLoading(true);
      await apiCall('/vt/delete-vt', { ID: id });
      setTechnicalVisitsList(technicalVisitsList.filter((tv) => tv.ID !== id));
      toast.success('Visita técnica deletada com sucesso!');
    } catch {
      toast.error('Não foi possível deletar a visita técnica.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditItem = (id: number) => {
    history.push(`/visita-tecnica/editar/${id}`);
  };

  const handleApproveItem = async (id: number) => {
    try {
      setIsLoading(true);
      await apiCall('/vt/approve-vt', { ID: id });
      setTechnicalVisitsList(technicalVisitsList.filter((tv) => tv.ID !== id));
      toast.success('Visita técnica aprovada com sucesso!');
    } catch {
      toast.error('Não foi possível aprovar a visita técnica.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRescheduleItem = (id: number) => {
    history.push(`/visita-tecnica/editar/${id}`);
  };

  const handleAccompanyItem = (id: number) => {
    // not implemented.
  };

  const handleVisualizeItem = (id: number) => {
    // not implemented.
  };

  const handleOrdenation = (column: string, asc: boolean) => {
    const technicalVisitsListCopy = [...technicalVisitsList];
    if (asc) {
      switch (column) {
        case 'ID VT':
          setTechnicalVisitsList(technicalVisitsListCopy.sort((a, b) => {
            if (a.ID > b.ID) return 1;
            if (a.ID < b.ID) return -1;
            return 0;
          }));
          break;

        case 'Data':
          setTechnicalVisitsList(technicalVisitsListCopy.sort((a, b) => {
            if (moment(a.VTDATE).format('DD-MM-YYYY') > moment(b.VTDATE).format('DD-MM-YYYY')) return 1;
            if (moment(a.VTDATE).format('DD-MM-YYYY') < moment(b.VTDATE).format('DD-MM-YYYY')) return -1;
            return 0;
          }));
          break;

        case 'Hora':
          setTechnicalVisitsList(technicalVisitsListCopy.sort((a, b) => {
            if (a.VTTIME > b.VTTIME) return 1;
            if (a.VTTIME < b.VTTIME) return -1;
            return 0;
          }));
          break;

        case 'Unidade':
          setTechnicalVisitsList(technicalVisitsListCopy.sort((a, b) => {
            if (a.UNIT_NAME > b.UNIT_NAME) return 1;
            if (a.UNIT_NAME < b.UNIT_NAME) return -1;
            return 0;
          }));
          break;

        case 'Técnico':
          setTechnicalVisitsList(technicalVisitsListCopy.sort((a, b) => {
            if (`${a.TECNICO_NOME} ${a.TECNICO_SOBRENOME}` > `${b.TECNICO_NOME} ${b.TECNICO_SOBRENOME}`) return 1;
            if (`${a.TECNICO_NOME} ${a.TECNICO_SOBRENOME}` < `${b.TECNICO_NOME} ${b.TECNICO_SOBRENOME}`) return -1;
            return 0;
          }));
          break;

        case 'Status':
          setTechnicalVisitsList(technicalVisitsListCopy.sort((a, b) => {
            const statusOrdenation = Object.keys(TVStatusValues);
            if (statusOrdenation.findIndex((statusId) => statusId === String(a.STATUS_ID)) > statusOrdenation.findIndex((statusId) => statusId === String(b.STATUS_ID))) return 1;
            if (statusOrdenation.findIndex((statusId) => statusId === String(a.STATUS_ID)) < statusOrdenation.findIndex((statusId) => statusId === String(b.STATUS_ID))) return -1;
            return 0;
          }));
          break;

        case 'Duração':
          // À Implementar no Backend
          break;

        default:
          break;
      }
    } else {
      switch (column) {
        case 'ID VT':
          setTechnicalVisitsList(technicalVisitsListCopy.sort((a, b) => {
            if (a.ID < b.ID) return 1;
            if (a.ID > b.ID) return -1;
            return 0;
          }));
          break;

        case 'Data':
          setTechnicalVisitsList(technicalVisitsListCopy.sort((a, b) => {
            if (moment(a.VTDATE).format('DD-MM-YYYY') < moment(b.VTDATE).format('DD-MM-YYYY')) return 1;
            if (moment(a.VTDATE).format('DD-MM-YYYY') > moment(b.VTDATE).format('DD-MM-YYYY')) return -1;
            return 0;
          }));
          break;

        case 'Hora':
          setTechnicalVisitsList(technicalVisitsListCopy.sort((a, b) => {
            if (a.VTTIME < b.VTTIME) return 1;
            if (a.VTTIME > b.VTTIME) return -1;
            return 0;
          }));
          break;

        case 'Unidade':
          setTechnicalVisitsList(technicalVisitsListCopy.sort((a, b) => {
            if (a.UNIT_NAME < b.UNIT_NAME) return 1;
            if (a.UNIT_NAME > b.UNIT_NAME) return -1;
            return 0;
          }));
          break;

        case 'Técnico':
          setTechnicalVisitsList(technicalVisitsListCopy.sort((a, b) => {
            if (`${a.TECNICO_NOME} ${a.TECNICO_SOBRENOME}` < `${b.TECNICO_NOME} ${b.TECNICO_SOBRENOME}`) return 1;
            if (`${a.TECNICO_NOME} ${a.TECNICO_SOBRENOME}` > `${b.TECNICO_NOME} ${b.TECNICO_SOBRENOME}`) return -1;
            return 0;
          }));
          break;

        case 'Status':
          setTechnicalVisitsList(technicalVisitsListCopy.sort((a, b) => {
            const statusOrdenation = Object.keys(TVStatusValues);
            if (statusOrdenation.findIndex((statusId) => statusId === String(a.STATUS_ID)) < statusOrdenation.findIndex((statusId) => statusId === String(b.STATUS_ID))) return 1;
            if (statusOrdenation.findIndex((statusId) => statusId === String(a.STATUS_ID)) > statusOrdenation.findIndex((statusId) => statusId === String(b.STATUS_ID))) return -1;
            return 0;
          }));
          break;

        case 'Duração':
          // À Implementar no Backend
          break;

        default:
          break;
      }
    }
  };

  const handleTechnicalVisitsFiltering = () => {
    const rawVisitsData = technicalVisitsList.map((visit) => ({
      id: visit.ID,
      data: Object.values(visit).join(''),
    }));
    const filteredVisits = rawVisitsData.filter((rawVisit) => rawVisit.data.includes(searchTerm)).map((rawVisit) => technicalVisitsList.find((visit) => visit.ID === rawVisit.id));
    setFilteredTechnicalVisitsList(filteredVisits.filter(truthy));
  };

  useEffect(() => {
    fetchTechnicalVisitsList();
  }, [statusFilter]);

  useEffect(() => {
    handleTechnicalVisitsFiltering();
  }, [searchTerm, technicalVisitsList]);

  return (
    <DefaultCard style={{ padding: 30 }}>
      <CardHeader>
        {
          pathname.includes('historico') ? (
            <InputSearch
              id="search"
              name="search"
              label="Pesquisar VT"
              placeholder="Digite alguma informação sobre a VT"
              value={searchTerm}
              onChange={(value) => setSearchTerm(value)}
              style={{ width: 300 }}
            />
          ) : (
            <Button variant="primary" type="submit" style={{ width: 170, marginRight: 20 }} onClick={() => history.push('/visita-tecnica/registro')}>
              CRIAR NOVA VT
            </Button>
          )
        }

        <TabsContainer style={{ width: '100%', marginLeft: 50 }}>
          <TabsList>
            {TABS.map((item, index) => (
              <TabItem key={item.label} isActive={TABS[index].filter === statusFilter} style={{ cursor: 'pointer', padding: '0px 10px' }} role="button" onClick={() => setStatusFilter(TABS[index].filter)}>
                {item.label}
                <div style={{ height: 7, width: '100%' }} />
              </TabItem>
            ))}
          </TabsList>
        </TabsContainer>
      </CardHeader>
      <div style={{ position: 'relative' }}>
        <LoadingSpinner variant="primary" loading={isLoading} />
        <CardSubHeader>
          <b>{`VTS ${TABS.find((tab) => tab.filter === statusFilter)?.pluralLabel}`}</b>
          <span>
            Total
            <b>{` ${technicalVisitsList.length} VTs`}</b>
          </span>
        </CardSubHeader>
        <Content>
          <TVList
            activeTab={statusFilter}
            data={filteredTechnicalVisitsList}
            handleOrdenation={handleOrdenation}
            handleDeleteItem={handleDeleteItem}
            handleEditItem={handleEditItem}
            handleAccompanyItem={handleAccompanyItem}
            handleVisualizeItem={handleVisualizeItem}
            handleApproveItem={handleApproveItem}
            handleRescheduleItem={handleRescheduleItem}
          />
        </Content>
      </div>
    </DefaultCard>
  );
};

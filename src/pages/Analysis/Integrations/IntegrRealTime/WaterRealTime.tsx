import { useEffect } from 'react';

import moment from 'moment';
import { toast } from 'react-toastify';
import { Flex } from 'reflexbox';
import {
  Card,
  Loader,
} from '~/components';
import { useStateVar } from '~/helpers/useStateVar';
import { apiCall } from '~/providers';

import { waterVars } from '../IntegrPerfil/WaterProfile';
import {
  CardContainer,
  VarContainer, VarName, VarsCardTitle, VarUnit, VarValue,
} from './styles';
import { useTranslation } from 'react-i18next';

export function WaterRealTimeContents(props: {
  unit_id: string
  varsList: {
    varId: string
    name: string
    currVal?: string|null
    valUnit?: string
    card?: string
    subcard?: string
    relevance?: number | string
  }[],
 }) : JSX.Element {
  const { t } = useTranslation();
  const { unit_id, varsList } = props;
  const [state, _, setState] = useStateVar({
    loading: true,
    informationSection: {} as {
      batery_state: string;
      current_usage: number;
      day_usage: number;
      last_reading_date: string;
      meter_type: string;
      module_rf: number;
    },
    varsCards: [] as {
      title: string
      subCards: {
        title: string
        varsList: {
          name: string
          currVal?: string|null
          valUnit?: string
          relevance?: number | string
        }[],
      }[]
    }[],
  });

  useEffect(() => {
    (async () => {
      try {
        setState({ loading: true });
        const response = await apiCall('/laager/get-informations', { unit_id });
        state.varsCards = [];
        for (const row of waterVars) {
          const varsValues = varsList.find((x) => x.varId === row.varId);
          const varInfo = {
            name: row.name,
            currVal: getVarValue(row.varId, response, varsValues?.valUnit),
            valUnit: row.unity ? (varsValues?.valUnit || 'L') : '',
            card: varsValues?.card || '',
            subcard: varsValues?.subcard || '',
            relevance: varsValues?.relevance || 1,
          };

          if (varInfo.card) {
            const cardTitle = varInfo.card;
            const subcardTitle = varInfo.subcard || '';
            let card = state.varsCards.find((x) => x.title === cardTitle);
            if (!card) {
              card = { title: cardTitle, subCards: [] };
              state.varsCards.push(card);
            }
            let subcard = card.subCards.find((x) => x.title === subcardTitle);
            if (!subcard) {
              subcard = { title: subcardTitle, varsList: [] };
              card.subCards.push(subcard);
            }
            subcard.varsList.push(varInfo);
          }
        }
        setState({ informationSection: response });
      } catch (err) { toast.error(t('erroInformacoesTempoReal')); console.error(err); }
      setState({ loading: false });
    })();
  }, [unit_id]);

  function getVarValue(
    id: string,
    response: {
      batery_state: string;
      current_usage: number;
      day_usage: number;
      last_reading_date: string;
      meter_type: string;
      module_rf: number;
    },
    unity?: string,
  ) {
    if (id === 'last_reading_date') {
      return moment(response?.[id]).format('lll');
    } if (['current_usage', 'day_usage'].includes(id) && unity === 'm³') {
      return response?.[id] / 1000;
    }

    return response?.[id];
  }

  return (
    <>
      {state.loading && <Loader />}
      {!state.loading && (
        <div>
          {state.varsCards.map((card) => (
            <CardContainer key={card.title}>
              <Card>
                <>
                  <VarsCardTitle>{card.title}</VarsCardTitle>
                  <Flex flexWrap="wrap">
                    {card.subCards.map((subcard) => (subcard.title !== '' ? (
                      <CardContainer key={subcard.title}>
                        <Card>
                          <>
                            <VarsCardTitle>{subcard.title}</VarsCardTitle>
                            {subcard.varsList.map((varInfo) => (
                              <VarContainer key={varInfo.name}>
                                <VarName>
                                  {varInfo.name}
                                </VarName>
                                <div>
                                  <VarValue relevance={varInfo.relevance}>
                                    {varInfo.currVal}
                                  </VarValue>
                                  <VarUnit relevance={varInfo.relevance}>
                                    {varInfo.valUnit}
                                  </VarUnit>
                                </div>
                              </VarContainer>
                            ))}
                          </>
                        </Card>
                      </CardContainer>
                    ) : (
                      <>
                        {subcard.varsList.map((varInfo) => (
                          <VarContainer key={varInfo.name}>
                            <VarName>
                              {varInfo.name}
                            </VarName>
                            <div>
                              <VarValue relevance={varInfo.relevance}>
                                {varInfo.currVal}
                              </VarValue>
                              <VarUnit relevance={varInfo.relevance}>
                                {varInfo.valUnit}
                              </VarUnit>
                            </div>
                          </VarContainer>
                        ))}
                      </>
                    )))}
                  </Flex>
                </>
              </Card>
            </CardContainer>
          ))}
        </div>
      )}
    </>
  );
}

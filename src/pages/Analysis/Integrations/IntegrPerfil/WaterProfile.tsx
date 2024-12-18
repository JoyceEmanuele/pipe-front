import { useEffect } from 'react';
import moment from 'moment';

import { Loader } from '~/components';
import jsonTryParse from '~/helpers/jsonTryParse';
import { useStateVar } from '~/helpers/useStateVar';
import { apiCall, ApiResps } from '~/providers';
import { colors } from '~/styles/colors';

import { CardsCfg } from '../IntegrEdit';
import { InfoItem, TableNew2 } from './styles';
import { useTranslation } from 'react-i18next';
import i18n from '~/i18n';

const t = i18n.t.bind(i18n);

export const waterVars = [
  {
    varId: 'module_rf',
    name: t('moduloRf'),
  },
  {
    varId: 'batery_state',
    name: t('bateriaStatus'),
  },
  {
    varId: 'meter_type',
    name: t('tipoDeMedidor'),
  },
  {
    varId: 'last_reading_date',
    name: t('ultimaLeitura'),
  },
  {
    varId: 'current_usage',
    name: t('consumoAtual'),
    unity: true,
  },
  {
    varId: 'day_usage',
    name: t('consumoDia'),
    unity: true,
  },
];

export function WaterProfile({ devInfoResp, integrId }: {
  devInfoResp: ApiResps['/get-integration-info'],
  integrId: string
}): JSX.Element {
  const { t } = useTranslation();
  const [state, _, setState] = useStateVar(() => ({
    loading: true,
    laagerUsage: {} as ApiResps['/laager/get-informations'] | null,
    varsList: waterVars as {
        name: string
        varId: string,
        currVal?: string|null
        valUnit?: string
        card?: string,
        subcard?: string,
        relevance?: number | string
      }[],
  }));

  useEffect(() => {
    (async function () {
      setState({ loading: true });
      const laagerUsage = await apiCall('/laager/get-informations', {
        unit_id: integrId,
      });

      setState({ laagerUsage, loading: false });
    }());

    const cardsCfg = (devInfoResp.cardsCfg && jsonTryParse<CardsCfg>(devInfoResp.cardsCfg)) || null;
    if (cardsCfg && cardsCfg.varscards) {
      for (const rowVar of state.varsList) {
        if (cardsCfg.varscards[rowVar.varId]) {
          rowVar.card = cardsCfg.varscards[rowVar.varId].card;
          rowVar.subcard = cardsCfg.varscards[rowVar.varId].subcard;
          rowVar.relevance = cardsCfg.varscards[rowVar.varId].relevance;
          rowVar.valUnit = cardsCfg.varscards[rowVar.varId].valUnit;
        }
      }
    }
  }, [integrId]);

  function getVarValue(id: string, unity?: string) {
    if (id === 'last_reading_date') {
      return moment(state?.laagerUsage?.[id]).format('lll');
    } if (['current_usage', 'day_usage'].includes(id) && unity === 'm³') {
      return state?.laagerUsage?.[id] / 1000;
    }

    return state?.laagerUsage?.[id];
  }

  return (
    <>
      {state.loading && <Loader />}
      {!state.loading && (
        <>
          <>
            <div style={{ fontWeight: 'bold', paddingBottom: '35px', fontSize: '1.25em' }}>{t('consumo')}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              <InfoItem>
                <b>{t('consumoAtual')}</b>
                <br />
                {state.laagerUsage?.current_usage}
                m³
              </InfoItem>
              <InfoItem>
                <b>{t('consumoDia')}</b>
                <br />
                {state.laagerUsage?.day_usage}
                m³
              </InfoItem>
              <InfoItem>
                <b>{t('ultimaLeitura')}</b>
                <br />
                {moment(state.laagerUsage?.last_reading_date).format('lll') || '-'}
              </InfoItem>
            </div>
          </>
          <div>
            <div style={{ fontWeight: 'bold', paddingBottom: '35px', fontSize: '1.25em' }}>{t('dadosRecebidos')}</div>
            <TableNew2 style={{ color: colors.Grey400 }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{t('descricao')}</th>
                  <th>{t('valorAtual')}</th>
                  <th>{t('unMedida')}</th>
                  <th>Card</th>
                  <th>Subcard</th>
                  <th>{t('relevancia')}</th>
                </tr>
              </thead>
              <tbody>
                {waterVars.map((rowVar, index) => {
                  const varValues = state.varsList.find((x) => x.varId === rowVar.varId);
                  return (
                    <tr key={index}>
                      <td>{devInfoResp.info.dataSource || '-'}</td>
                      <td>{rowVar.name || '-'}</td>
                      <td>
                        {getVarValue(rowVar.varId, varValues?.valUnit)}
                      </td>
                      <td>
                        {rowVar.unity
                          ? (varValues?.valUnit !== 'm³' ? t('litros') : t('metrosCubicos'))
                          : t('nenhum')}
                      </td>
                      <td>{varValues?.card || '-'}</td>
                      <td>{varValues?.subcard || '-'}</td>
                      <td>{varValues?.relevance || '1'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </TableNew2>
          </div>
        </>
      )}
    </>
  );
}

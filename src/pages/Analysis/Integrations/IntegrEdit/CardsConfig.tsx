import { useTranslation } from 'react-i18next';
import {
  Button,
  Input,
  Select,
} from '~/components';
import { useStateVar } from '~/helpers/useStateVar';
import { colors } from '~/styles/colors';

import {
  CardIntem, TableNew2,
} from './styles';

export const CardsConfig = (props: {
  integrType: string
  varsList: {
    varId: string
    name: string
    currVal?: string
    valUnit?: string
    card?: string
    subcard?: string
    relevance?: string | number
  }[]
  cards: string[]
  subcards: string[]
  relevances: string[]
}): JSX.Element => {
  const { t } = useTranslation();
  const [state, render, setState] = useStateVar({
    newCardName: '',
    newSubcardName: '',
    newRelevance: '',
  });

  function addNewRelevance() {
    const name = state.newRelevance.trim();
    if (!props.relevances.includes(name)) props.relevances.push(name);
    state.newRelevance = '';
    render();
  }
  function addNewCard() {
    const name = state.newCardName.trim();
    if (!props.cards.includes(name)) props.cards.push(name);
    state.newCardName = '';
    render();
  }
  function addNewSubcard() {
    const name = state.newSubcardName.trim();
    if (!props.subcards.includes(name)) props.subcards.push(name);
    state.newSubcardName = '';
    render();
  }
  function removeCard(itemName: string) {
    for (const rowVar of props.varsList) {
      if (rowVar.card === itemName) {
        alert(t('alertaCardEstaSendoUtilizado'));
        return;
      }
    }
    for (let i = props.cards.length - 1; i >= 0; i--) {
      if (props.cards[i] === itemName) {
        props.cards.splice(i, 1);
      }
    }
    render();
  }
  function removeSubcard(itemName: string) {
    for (const rowVar of props.varsList) {
      if (rowVar.subcard === itemName) {
        alert(t('alertaSubcardEstaSendoUtilizado'));
        return;
      }
    }
    for (let i = props.subcards.length - 1; i >= 0; i--) {
      if (props.subcards[i] === itemName) {
        props.subcards.splice(i, 1);
      }
    }
    render();
  }
  function removeRelevance(itemName: string) {
    for (const rowVar of props.varsList) {
      if (rowVar.relevance === itemName) {
        alert(t('alertaRelevanceEstaSendoUtilizado'));
        return;
      }
    }
    for (let i = props.relevances.length - 1; i >= 0; i--) {
      if (props.relevances[i] === itemName) {
        props.relevances.splice(i, 1);
      }
    }
    render();
  }

  return (
    <div>
      <div style={{ display: 'flex' }}>

        <div>
          <div style={{ fontWeight: 'bold', paddingBottom: '15px', fontSize: '1.25em' }}>{t('cards')}</div>
          <div style={{ display: 'flex' }}>
            <Input
              style={{ maxWidth: '200px' }}
              type="text"
              value={state.newCardName}
              placeholder={t('adicionarNovoCard')}
              onChange={(event) => setState({ newCardName: event.target.value })}
            />
            <div style={{ width: '120px', marginLeft: '10px', display: 'flex' }}>
              <Button onClick={() => addNewCard()} variant="primary">
                {t('botaoAdicionar')}
              </Button>
            </div>
          </div>
          <div style={{ display: 'flex', marginTop: '8px' }}>
            {props.cards.map((itemName) => (
              <CardIntem key={itemName} onClick={() => removeCard(itemName)} variant="blue">{`${itemName} X`}</CardIntem>
            ))}
          </div>
        </div>

        <div style={{ marginLeft: '50px' }}>
          <div style={{ fontWeight: 'bold', paddingBottom: '15px', fontSize: '1.25em' }}>{t('subcards')}</div>
          <div style={{ display: 'flex' }}>
            <Input
              style={{ maxWidth: '200px' }}
              type="text"
              value={state.newSubcardName}
              placeholder={t('adicionarNovoSubcard')}
              onChange={(event) => setState({ newSubcardName: event.target.value })}
            />
            <div style={{ width: '120px', marginLeft: '10px', display: 'flex' }}>
              <Button onClick={() => addNewSubcard()} variant="primary">
                {t('botaoAdicionar')}
              </Button>
            </div>
          </div>
          <div style={{ display: 'flex', marginTop: '8px' }}>
            {props.subcards.map((itemName) => (
              <CardIntem key={itemName} onClick={() => removeSubcard(itemName)} variant="blue">{`${itemName} X`}</CardIntem>
            ))}
          </div>
        </div>

        <div style={{ marginLeft: '50px' }}>
          <div style={{ fontWeight: 'bold', paddingBottom: '15px', fontSize: '1.25em' }}>{t('relevancia')}</div>
          <div style={{ display: 'flex' }}>
            <Input
              style={{ maxWidth: '200px' }}
              type="text"
              value={state.newRelevance}
              placeholder={t('adicionarRelevancia')}
              onChange={(event) => setState({ newRelevance: event.target.value })}
            />
            <div style={{ width: '120px', marginLeft: '10px', display: 'flex' }}>
              <Button onClick={() => addNewRelevance()} variant="primary">
                {t('botaoAdicionar')}
              </Button>
            </div>
          </div>
          <div style={{ display: 'flex', marginTop: '8px' }}>
            {props.relevances.map((itemName) => (
              <CardIntem key={itemName} onClick={() => removeRelevance(itemName)} variant="blue">{`${itemName} X`}</CardIntem>
            ))}
          </div>
        </div>

      </div>

      <br />
      <br />

      <div>
        <TableNew2 style={{ color: colors.Grey400 }}>
          <thead>
            <tr>
              <th>{t('Nome')}</th>
              <th>{t('valorAtual')}</th>
              <th>{t('unidadeMedida')}</th>
              <th style={{ minWidth: '200px' }}>{t('card')}</th>
              <th style={{ minWidth: '200px' }}>{t('subcard')}</th>
              <th>{t('relevancia')}</th>
            </tr>
          </thead>
          <tbody>
            {props.varsList.map((rowVar, index) => (
              <tr key={index}>
                <td>{rowVar.name}</td>
                <td>{rowVar.currVal || '-'}</td>
                <td>
                  {['current_usage', 'day_usage'].includes(rowVar.varId) ? (
                    <Select
                      options={['L', 'm³']}
                      value={rowVar.valUnit}
                      placeholder=""
                      onSelect={(item) => { rowVar.valUnit = item; render(); }}
                    />
                  ) : ''}
                </td>
                <td>
                  <Select
                    options={props.cards}
                    value={rowVar.card}
                    placeholder=""
                    onSelect={(item) => { rowVar.card = item; render(); }}
                  />
                </td>
                <td>
                  <Select
                    options={props.subcards}
                    value={rowVar.subcard}
                    placeholder=""
                    onSelect={(item) => { rowVar.subcard = item; render(); }}
                  />
                </td>
                {props.integrType === 'water' ? (
                  <td>
                    <Select
                      options={[1, 2]}
                      value={rowVar.relevance || 1}
                      placeholder=""
                      onSelect={(item) => { rowVar.relevance = item; render(); }}
                    />
                  </td>
                ) : (
                  <td>{rowVar.relevance || '-'}</td>
                )}
              </tr>
            ))}
          </tbody>
        </TableNew2>
      </div>

    </div>
  );
};

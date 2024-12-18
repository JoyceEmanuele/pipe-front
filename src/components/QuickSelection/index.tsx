import { ClickAwayListener, Grid } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Row from 'antd/lib/row';
import { useState } from 'react';
import { Container, Item, SelectButton } from './styles';
import moment from 'moment';
import i18n from '../../i18n';
import { Flex } from 'reflexbox';

const t = i18n.t.bind(i18n);

export const QuickSelection = (props: {
  isShortMode?: boolean, excludeSelects?: string[], height?: string, setDate: (startDate, endDate, timeSelected?) => void }): JSX.Element => {
  const [showDialog, setShowDialog] = useState(false);
  const { setDate } = props;
  const handleClickAway = () => {
    setShowDialog(false);
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <div>
        <Box
          m="3px"
          onClick={() => setShowDialog(!showDialog)}
          style={{
            color: '#363BC4', textDecorationLine: 'underline', cursor: 'pointer', fontSize: '11px',
          }}
        >
          {t('selecaoRapida')}
        </Box>
        {showDialog && (
        <Box
          position="absolute"
          marginTop="8px"
          width={!props.isShortMode ? '313px' : '160px'}
          height={!props.isShortMode ? '210px' : '190px'}
          padding="1.5%"
          borderRadius="10px"
          style={{ background: '#FFFFFF', boxShadow: '0px 10px 10px rgba(0, 0, 0, 0.1)', zIndex: '10' }}
        >
          <Row style={{ fontWeight: 700, marginBottom: '10px' }}>
            {t('selecaoRapida')}
          </Row>
          {!props.isShortMode
            ? (
              <Container style={{ height: props.height || '130px' }}>
                <SelectButton onClick={() => { setDate(moment(), moment(), 'Hoje'); setShowDialog(false); }}>Hoje</SelectButton>
                <SelectButton onClick={() => { setDate(moment().subtract(1, 'days'), moment().subtract(1, 'days'), 'Ontem'); setShowDialog(false); }}>Ontem</SelectButton>
                <SelectButton onClick={() => { setDate(moment().startOf('week'), moment(), 'Semana Atual'); setShowDialog(false); }}>Semana Atual</SelectButton>
                <SelectButton onClick={() => { setDate(moment().subtract(7, 'days').startOf('week'), moment().subtract(7, 'days').endOf('week'), 'Semana Passada'); setShowDialog(false); }}>Semana Passada</SelectButton>
                <SelectButton onClick={() => { setDate(moment().subtract(7, 'days'), moment(), 'Últimos 7 dias'); setShowDialog(false); }}>Últimos 7 dias</SelectButton>
                <SelectButton onClick={() => { setDate(moment().subtract(30, 'days'), moment(), 'Últimos 30 dias'); setShowDialog(false); }}>Últimos 30 dias</SelectButton>
                {!props.excludeSelects?.includes('Últimos 60 dias') && (
                <SelectButton onClick={() => { setDate(moment().subtract(60, 'days'), moment(), 'Últimos 60 dias'); setShowDialog(false); }}>Últimos 60 dias</SelectButton>
                )}
                {!props.excludeSelects?.includes('Últimos 90 dias') && (
                <SelectButton onClick={() => { setDate(moment().subtract(90, 'days'), moment(), 'Últimos 90 dias'); setShowDialog(false); }}>Últimos 90 dias</SelectButton>
                )}
                <SelectButton onClick={() => { setDate(moment().subtract(12, 'months'), moment(), 'Últimos 12 meses'); setShowDialog(false); }}>Últimos 12 meses</SelectButton>

              </Container>
            )
            : (
              <Grid>
                <Grid item>
                  <SelectButton onClick={() => { setDate(moment().startOf('week'), moment(), 'Semana Atual'); setShowDialog(false); }}>Semana Atual</SelectButton>
                </Grid>
                <Grid item>
                  <SelectButton onClick={() => { setDate(moment().subtract(7, 'days'), moment(), 'Últimos 7 dias'); setShowDialog(false); }}>Últimos 7 dias</SelectButton>
                </Grid>
                <Grid item>
                  <SelectButton onClick={() => { setDate(moment().subtract(14, 'days'), moment(), 'Últimos 14 dias'); setShowDialog(false); }}>Últimos 14 dias</SelectButton>
                </Grid>
                <Grid item>
                  <SelectButton onClick={() => { setDate(moment().subtract(30, 'days'), moment(), 'Últimos 30 dias'); setShowDialog(false); }}>Últimos 30 dias</SelectButton>
                </Grid>
              </Grid>
            )}
        </Box>
        )}
      </div>
    </ClickAwayListener>
  );
};

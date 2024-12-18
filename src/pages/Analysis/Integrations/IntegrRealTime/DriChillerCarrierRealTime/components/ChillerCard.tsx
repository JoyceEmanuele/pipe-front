import { Box, Flex } from 'reflexbox';
import ChillerCarrierHX from '../../../../../../assets/img/chiller/chillerCarrierHX.png';
import ChillerCarrierXA from '../../../../../../assets/img/chiller/chillerCarrierXA.jpg';
import Point from '../../../../../../assets/img/point.svg';
import PointInvert from '../../../../../../assets/img/pointInvert.svg';
import Arrow from '../../../../../../assets/img/arrow.svg';
import AlarmIcon from '../../../../../../assets/img/alarm.svg';
import { t } from 'i18next';
import { Image } from 'antd';
import ProgressBar from './ProgressBar';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';
import { getGeralStatusInfo } from './StatusCard';

const getCompressorInfo = (value: number | null) => {
  if (value === 0) {
    return {
      label: t('desligadoMinusculo'),
    };
  }
  if (value === 1) {
    return {
      label: t('emFuncionamento'),
    };
  }

  return {
    label: t('semInformacao'),
  };
};

const tmpLimits = {
  evaporatorSP: { min: 5, max: 10 },
  evaporatorInputTemp: { min: 6.8, max: 21 },
  evaporatorOutputTemp: { min: 4, max: 15 },
  condenserInputTemp: { min: 20, max: 45 },
  condenserOutputTemp: { min: 25, max: 50 },
  compressorOleoA1: { min: 450, max: 900 },
  compressorOleoA2: { min: 450, max: 900 },
  compressorOleoB1: { min: 450, max: 900 },
  circuitSucA: { min: 200, max: 350 },
  circuitSucB: { min: 200, max: 350 },
  circuitSucC: { min: 200, max: 350 },
  circuitDescB: { min: 550, max: 1000 },
  circuitDescA: { min: 550, max: 1000 },
  circuitDescC: { min: 550, max: 1000 },
  compressorOleoA: { min: 450, max: 900 },
  compressorOleoB: { min: 450, max: 900 },
  compressorOleoC: { min: 450, max: 900 },
};

const tmpLimitsChillerXa = {
  evaporatorSP: { min: 5, max: 10 },
  evaporatorInputTemp: { min: 6.8, max: 21 },
  evaporatorOutputTemp: { min: 4, max: 15 },
  circuitSucA: { min: 200, max: 350 },
  circuitSucB: { min: 200, max: 350 },
  circuitSucC: { min: 200, max: 350 },
  circuitDescA: { min: 550, max: 1500 },
  circuitDescB: { min: 550, max: 1500 },
  circuitDescC: { min: 550, max: 1500 },
  compressorOleoA: { min: 450, max: 1300 },
  compressorOleoB: { min: 450, max: 1300 },
  compressorOleoC: { min: 450, max: 1300 },
};

const getTemperatureColor = (value: number | null, variable: string, model: string) => {
  const tmpLimitAux = model === 'chiller-carrier-30xab-hvar' ? tmpLimitsChillerXa : tmpLimits;
  if ((!value && value !== 0) || !tmpLimitAux[variable]) return '#E9E9E9';

  if (value >= tmpLimitAux[variable].min && value <= tmpLimitAux[variable].max) return '#4EB73B';

  if (value < tmpLimitAux[variable].min) return '#2D81FF';

  return '#FF1818';
};

function decideCSS(isMobile, valueNot, valueTrue) {
  if (isMobile) {
    return valueTrue;
  }
  return valueNot;
}

export default function ChillerCard(props: Readonly<{
  status?: number | null,
  compressorB1?: number | null,
  compressorA1?: number | null,
  compressorA2?: number | null,
  capacityCA?: number | null,
  capacityCB?: number | null,
  evaporatorSP?: number | null,
  evaporatorOutputTemp: number | null,
  evaporatorInputTemp: number | null,
  condenserOutputTemp?: number | null,
  condenserInputTemp?: number | null,
  circuitSucA: number | null,
  circuitSucB: number | null,
  circuitSucC?: number | null,
  circuitDescC?: number | null,
  circuitDescB: number | null,
  circuitDescA: number | null,
  compressorOleoA1?: number | null,
  compressorOleoA2?: number | null,
  compressorOleoB1?: number | null,
  alarm: number | null,
  mobile: boolean,
  tablet: boolean,
  model: string | null,
  showCircuitC?: boolean,
  compressorOleoA?: number | null,
  compressorOleoB?: number | null,
  compressorOleoC?: number | null,
  removeCondenser?: boolean,
}>): JSX.Element {
  const {
    compressorB1, compressorA1, compressorA2, capacityCA, capacityCB, evaporatorSP, evaporatorInputTemp, evaporatorOutputTemp, condenserInputTemp, condenserOutputTemp, alarm,
    tablet, mobile, circuitSucA, circuitSucB, circuitSucC, showCircuitC, circuitDescB, circuitDescA, compressorOleoA1, compressorOleoA2, compressorOleoB1, model, status, compressorOleoA, compressorOleoB, circuitDescC, compressorOleoC, removeCondenser,
  } = props;

  const formatTmp = (tmp: number | null) => {
    const temperatures = [evaporatorSP, evaporatorInputTemp, evaporatorOutputTemp, condenserInputTemp, condenserOutputTemp].filter((n) => n != null) as number[];
    const maxTmp = Math.max(...temperatures);
    if (!tmp || !maxTmp) return null;

    const maxTmpSplitted = maxTmp.toString().split('.');
    const numberBeforeDotMaxTmp = maxTmpSplitted[0];
    const tmpSplitted = tmp.toString().split('.');
    const numberBeforeDotTmp = tmpSplitted[0];

    const number = `${numberBeforeDotTmp.padStart(numberBeforeDotMaxTmp.length)},${(tmpSplitted.length > 1 ? tmpSplitted[1] : '0')}`;

    return formatNumberWithFractionDigits(number);
  };

  return (
    <Flex padding="40px 0px 20px 0px" flexDirection="column" marginTop="-30px" alignItems="center">
      {model?.startsWith('chiller-carrier-30hx')
      && (
        <Compressors30hxValuesCard
          mobile={mobile}
          tablet={tablet}
          capacityCB={capacityCB}
          capacityCA={capacityCA}
          compressorA1={compressorA1}
          compressorA2={compressorA2}
          compressorB1={compressorB1}
        />
      )}
      <Flex flexDirection="row" flexWrap={mobile ? 'wrap' : 'nowrap'} width="100%" justifyContent={mobile ? 'center' : 'unset'}>
        { !mobile && (
          <PressureValuesCard
            circuitDescA={circuitDescA}
            circuitDescB={circuitDescB}
            circuitSucA={circuitSucA}
            circuitSucB={circuitSucB}
            compressorOleoA1={compressorOleoA1}
            compressorOleoA2={compressorOleoA2}
            compressorOleoB1={compressorOleoB1}
            model={model}
            compressorOleoA={compressorOleoA}
            compressorOleoB={compressorOleoB}
            compressorOleoC={compressorOleoC}
            circuitSucC={circuitSucC}
            showCircuitC={showCircuitC}
            circuitDescC={circuitDescC}
          />
        )}

        <ImageValueCard mobile={mobile} alarm={alarm} model={model} showCircuitC={showCircuitC} />

        { mobile && (
          <Flex width="100%" justifyContent="space-evenly">
            <PressureValuesCard
              circuitDescA={circuitDescA}
              circuitDescB={circuitDescB}
              circuitSucA={circuitSucA}
              circuitSucB={circuitSucB}
              compressorOleoA1={compressorOleoA1}
              compressorOleoA2={compressorOleoA2}
              compressorOleoB1={compressorOleoB1}
              model={model}
              compressorOleoA={compressorOleoA}
              compressorOleoB={compressorOleoB}
              compressorOleoC={compressorOleoC}
              circuitSucC={circuitSucC}
              showCircuitC={showCircuitC}
              circuitDescC={circuitDescC}
            />
            <TemperatureValuesCard
              decideCSS={decideCSS}
              mobile={mobile}
              formatTmp={formatTmp}
              evaporatorInputTemp={evaporatorInputTemp}
              evaporatorOutputTemp={evaporatorOutputTemp}
              condenserInputTemp={condenserInputTemp}
              condenserOutputTemp={condenserOutputTemp}
              evaporatorSP={evaporatorSP}
              setArrows={model?.startsWith('chiller-carrier-30hx')}
              model={model}
              showCircuitC={showCircuitC}
              removeCondenser={removeCondenser}
            />
          </Flex>
        )}
        { !mobile && (
          <TemperatureValuesCard
            decideCSS={decideCSS}
            mobile={mobile}
            formatTmp={formatTmp}
            evaporatorInputTemp={evaporatorInputTemp}
            evaporatorOutputTemp={evaporatorOutputTemp}
            condenserInputTemp={condenserInputTemp}
            condenserOutputTemp={condenserOutputTemp}
            evaporatorSP={evaporatorSP}
            setArrows={model?.startsWith('chiller-carrier-30hx')}
            model={model}
            showCircuitC={showCircuitC}
            removeCondenser={removeCondenser}
          />
        )}
      </Flex>
    </Flex>
  );
}

function TemperatureValuesCard({
  decideCSS, mobile, formatTmp, evaporatorSP, evaporatorOutputTemp, evaporatorInputTemp, condenserOutputTemp, condenserInputTemp, setArrows, model, showCircuitC, removeCondenser,
}) {
  const includeArrows = !mobile && setArrows;

  const getMarginLeft = () => {
    if (mobile) return '10px';
    if (includeArrows) return '87px';
    return '30px';
  };

  return (
    <Flex flexDirection="column" marginLeft={decideCSS(mobile, '-30px', '0px')} marginTop={decideCSS(mobile, 'unset', '20px')} alignSelf={(showCircuitC || removeCondenser) && !mobile ? 'center' : 'flex-end'}>
      <span style={{
        color: '#616161', fontWeight: 'bold', fontSize: '10px', marginLeft: getMarginLeft(), marginBottom: '5px',
      }}
      >
        {t('evaporador')}
      </span>
      <Flex flexDirection="row" alignItems="flex-end">
        {includeArrows && (
          <Image
            preview={false}
            style={{ marginBottom: '16px' }}
            src={String(Arrow)}
          />
        )}
        <Flex flexDirection="column" marginLeft={mobile ? '0px' : '20px'} bg="#F8F8F8" padding="10px" style={{ borderRadius: '10px' }}>
          <Flex flexDirection="column" width="85px" marginBottom="7px">
            <span style={{ fontWeight: 'bold', fontSize: '11px' }}>{t('setpoint')}</span>
            <Flex flexDirection="row" alignItems="center">
              <div style={{
                width: '17px', height: '17px', backgroundColor: getTemperatureColor(evaporatorSP, 'evaporatorSP', model), borderRadius: '3px', marginRight: 6,
              }}
              />
              <span style={{ fontWeight: 'bold' }}>{formatTmp(evaporatorSP) ?? '-'}</span>
              <span style={{ color: '#8C8C8C' }}>°C</span>
            </Flex>
          </Flex>
          <Flex flexDirection="column" width="85px">
            <span style={{ fontWeight: 'bold', fontSize: '11px' }}>{t('tempSaida')}</span>
            <Flex flexDirection="row" alignItems="center">
              <div style={{
                width: '17px', height: '17px', backgroundColor: getTemperatureColor(evaporatorOutputTemp, 'evaporatorOutputTemp', model), borderRadius: '3px', marginRight: '6px',
              }}
              />
              <span style={{ fontWeight: 'bold' }}>{formatTmp(evaporatorOutputTemp) ?? '-'}</span>
              <span style={{ color: '#8C8C8C' }}>°C</span>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      <Flex flexDirection="row" alignItems="flex-end" marginBottom="17px">
        {includeArrows && (
          <Image
            preview={false}
            src={String(Arrow)}
            style={{ transform: 'scaleX(-1)' }}
          />
        )}
        <Flex flexDirection="column" marginLeft={decideCSS(mobile, '30px', '0px')} width="85px">
          <span style={{ fontWeight: 'bold', fontSize: '11px', marginLeft: decideCSS(mobile, '0px', '10px') }}>{t('tempEntrada')}</span>
          <Flex flexDirection="row" alignItems="center" marginLeft={mobile ? '10px' : '0px'}>
            <div style={{
              width: '17px', height: '17px', backgroundColor: getTemperatureColor(evaporatorInputTemp, 'evaporatorInputTemp', model), borderRadius: '3px', marginRight: '7px',
            }}
            />
            <span style={{ fontWeight: 'bold' }}>{formatTmp(evaporatorInputTemp) ?? '-'}</span>
            <span style={{ color: '#8C8C8C' }}>°C</span>
          </Flex>
        </Flex>
      </Flex>
      {
        !removeCondenser && (
          <>
            <span style={{
              color: '#616161', fontWeight: 'bold', fontSize: '10px', marginLeft: getMarginLeft(), marginBottom: '5px',
            }}
            >
              {t('condensador')}
            </span>
            <Flex flexDirection="row" marginBottom="7px">
              {includeArrows && (
                <Image
                  preview={false}
                  src={String(Arrow)}
                />
              )}
              <Flex flexDirection="column" marginLeft={mobile ? '0px' : '30px'} width="85px">
                <span style={{ fontWeight: 'bold', fontSize: '11px', marginLeft: decideCSS(mobile, '0px', '10px') }}>{t('tempSaida')}</span>
                <Flex flexDirection="row" alignItems="center" marginLeft={mobile ? '10px' : '0px'}>
                  <div style={{
                    width: '17px', height: '17px', backgroundColor: getTemperatureColor(condenserOutputTemp, 'condenserOutputTemp', model), borderRadius: '3px', marginRight: '7px',
                  }}
                  />
                  <span style={{ fontWeight: 'bold' }}>{formatTmp(condenserOutputTemp) ?? '-'}</span>
                  <span style={{ color: '#8C8C8C' }}>°C</span>
                </Flex>
              </Flex>
            </Flex>
            <Flex flexDirection="row" marginBottom="42px">
              {includeArrows && (
                <Image
                  preview={false}
                  src={String(Arrow)}
                  style={{ transform: 'scaleX(-1)' }}
                />
              )}
              <Flex flexDirection="column" marginLeft={decideCSS(mobile, '30px', '0px')} width="85px">
                <span style={{ fontWeight: 'bold', fontSize: '11px', marginLeft: decideCSS(mobile, '0px', '10px') }}>{t('tempEntrada')}</span>
                <Flex flexDirection="row" alignItems="center" marginLeft={mobile ? '10px' : '0px'}>
                  <div style={{
                    width: '17px', height: '17px', backgroundColor: getTemperatureColor(condenserInputTemp, 'condenserInputTemp', model), borderRadius: '3px', marginRight: '7px',
                  }}
                  />
                  <span style={{ fontWeight: 'bold' }}>{formatTmp(condenserInputTemp) ?? '-'}</span>
                  <span style={{ color: '#8C8C8C' }}>°C</span>
                </Flex>
              </Flex>
            </Flex>
          </>
        )
      }
    </Flex>
  );
}

function PressureValuesCard({
  circuitSucA, circuitSucB, circuitDescA, circuitDescB, compressorOleoA1, compressorOleoA2, compressorOleoB1, model, compressorOleoA, compressorOleoB, circuitSucC, circuitDescC, showCircuitC, compressorOleoC,
}) {
  return (
    <Flex flexDirection="column" marginTop={30} alignSelf={showCircuitC ? 'center' : 'flex-end'}>
      <span style={{
        color: '#616161', fontWeight: 'bold', fontSize: '10px', marginBottom: '5px',
      }}
      >
        {t('evaporador')}
      </span>
      <Flex flexDirection="column" marginBottom="17px">
        <ItemValueDescription
          variavel={circuitSucA}
          isEnd={false}
          description={t('descricao_SP_A-red')}
          nameVariavel="circuitSucA"
          model={model}
        />
        <ItemValueDescription
          variavel={circuitSucB}
          isEnd={false}
          description={t('descricao_SP_B-red')}
          nameVariavel="circuitSucB"
          model={model}
        />
        { showCircuitC && (
        <ItemValueDescription
          variavel={circuitSucC}
          isEnd={false}
          description={t('descricao_SP_C-red')}
          nameVariavel="circuitSucC"
          model={model}
        />
        )}
      </Flex>
      <span style={{
        color: '#616161', fontWeight: 'bold', fontSize: '10px', marginBottom: '5px',
      }}
      >
        {t('condensador')}
      </span>
      <Flex flexDirection="row">
        <ItemValueDescription
          variavel={circuitDescA}
          isEnd={false}
          description={t('descricao_DP_A-red')}
          nameVariavel="circuitDescA"
          model={model}
        />
      </Flex>
      <Flex flexDirection="row">
        <ItemValueDescription
          variavel={circuitDescB}
          isEnd={false}
          description={t('descricao_DP_B-red')}
          nameVariavel="circuitDescB"
          model={model}
        />
      </Flex>
      { showCircuitC && (
        <Flex flexDirection="row" marginBottom="17px">
          <ItemValueDescription
            variavel={circuitDescC}
            isEnd={false}
            description={t('descricao_DP_C-red')}
            nameVariavel="circuitDescC"
            model={model}
          />
        </Flex>
      )}
      {model?.startsWith('chiller-carrier-30hx')
      && (
      <>
        <span style={{
          color: '#616161', fontWeight: 'bold', fontSize: '10px', marginBottom: '5px',
        }}
        >
          {t('oleo')}
        </span>
        <Flex flexDirection="row">
          <ItemValueDescription
            variavel={compressorOleoA1}
            isEnd={false}
            description={t('descricao_CPA1_OP-red')}
            nameVariavel="compressorOleoA1"
            model={model}
          />
        </Flex>
        <Flex flexDirection="row">
          <ItemValueDescription
            variavel={compressorOleoA2}
            isEnd={false}
            description={t('descricao_CPA2_OP-red')}
            nameVariavel="compressorOleoA2"
            model={model}
          />
        </Flex>
        <ItemValueDescription
          variavel={compressorOleoB1}
          isEnd={false}
          description={t('descricao_CPB1_OP-red')}
          nameVariavel="compressorOleoB1"
          model={model}
        />
      </>
      )}
      {model?.startsWith('chiller-carrier-30xa')
      && (
      <>
        <span style={{
          color: '#616161', fontWeight: 'bold', fontSize: '10px', marginBottom: '5px',
        }}
        >
          {t('oleo')}
        </span>
        <Flex flexDirection="row">
          <ItemValueDescription
            variavel={compressorOleoA}
            isEnd={false}
            description={t('descricao_CPA_OP-red')}
            nameVariavel="compressorOleoA"
            model={model}
          />
        </Flex>
        <Flex flexDirection="row">
          <ItemValueDescription
            variavel={compressorOleoB}
            isEnd={false}
            description={t('descricao_CPB_OP-red')}
            nameVariavel="compressorOleoB"
            model={model}
          />
        </Flex>
        { showCircuitC && (
        <Flex flexDirection="row">
          <ItemValueDescription
            variavel={compressorOleoC}
            isEnd={false}
            description={t('descricao_CPC_OP-red')}
            nameVariavel="compressorOleoC"
            model={model}
          />
        </Flex>
        )}
      </>
      )}
    </Flex>
  );
}

function Compressors30hxValuesCard({
  mobile, tablet, capacityCB, capacityCA, compressorA1, compressorA2, compressorB1,
}) {
  return (
    <Flex
      flexDirection="row"
      flexWrap={mobile ? 'wrap-reverse' : 'unset'}
      marginLeft={decideCSS(tablet, '-20px', '00px')}
      marginBottom="-20px"
      alignItems="flex-end"
      gap="20px"
    >
      {!mobile && (
      <Image
        preview={false}
        src={String(Point)}
      />
      )}
      <Flex marginX="15px" flexDirection="column" marginTop={mobile ? 20 : 0}>
        <div style={{
          fontSize: '10px', backgroundColor: '#F5F5F5', color: '#616161', marginBottom: '10px', paddingLeft: '5px', borderRadius: 5,
        }}
        >
          <strong>{t('circuitoB')}</strong>
        </div>
        <ProgressBar progress={Math.floor(capacityCB ?? 0)} title={t('capacidadeTotalLabel')} disabled={(!capacityCB && capacityCB !== 0) || (!compressorB1 || compressorB1 === 0)} />
        <Flex flexDirection="column" marginTop="10px" paddingRight="20px" marginRight="20px">
          <span style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '-5px' }}>{t('compressorB1')}</span>
          <Flex flexDirection="row" alignItems="center" justifyContent="space-between">
            {getCompressorInfo(compressorB1).label}
          </Flex>
        </Flex>
      </Flex>
      {!mobile && (
      <Image
        preview={false}
        src={String(Point)}
      />
      )}
      <Flex marginX="15px" flexDirection="column">
        <div style={{
          fontSize: '10px', backgroundColor: '#F5F5F5', color: '#616161', marginBottom: '10px', paddingLeft: '5px', borderRadius: 5,
        }}
        >
          <strong>{t('circuitoA')}</strong>
        </div>
        <ProgressBar progress={Math.floor(capacityCA ?? 0)} title={t('capacidadeTotalLabel')} disabled={(!capacityCA && capacityCA !== 0) || (!compressorA2 || compressorA2 === 0)} />
        <Flex flexDirection="row" alignItems="flex-end">
          <Flex flexDirection="column">
            <Flex flexDirection="column" marginTop="10px" paddingRight="20px" marginRight="20px">
              <span style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '-5px' }}>{t('compressorA2')}</span>
              <Flex flexDirection="row" alignItems="center" justifyContent="space-between">
                {getCompressorInfo(compressorA2).label}
              </Flex>
            </Flex>
          </Flex>
          {!mobile && (
          <Box marginX="15px">
            <Image
              preview={false}
              src={String(Point)}
            />
          </Box>
          )}
          <Flex flexDirection="column" marginTop="10px" paddingRight="20px" marginRight="20px">
            <span style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '-5px' }}>{t('compressorA1')}</span>
            <Flex flexDirection="row" alignItems="center" justifyContent="space-between">
              {getCompressorInfo(compressorA1).label}
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}

function Compressors30xaValuesCard({
  mobile, tablet, status,
}) {
  return (
    <Flex
      flexDirection="row"
      flexWrap={mobile ? 'wrap-reverse' : 'unset'}
      marginLeft={decideCSS(tablet, '-20px', '00px')}
      alignItems="flex-end"
      gap="20px"
    >
      <Flex marginX="15px" flexDirection="column" marginTop={mobile ? 20 : 0}>
        {!mobile && (
        <Flex marginBottom="18px">

          <Image
            preview={false}
            src={String(PointInvert)}
          />
        </Flex>
        )}
        <div style={{
          fontSize: '10px', backgroundColor: '#F5F5F5', color: '#616161', paddingLeft: '2px', borderRadius: 5,
        }}
        >
          <strong>{t('circuitoA')}</strong>
        </div>

        <Flex flexDirection="column" marginTop="10px" paddingRight="20px" marginRight="20px">
          <span style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '-5px' }}>{t('compressorA')}</span>
          <Flex flexDirection="row" alignItems="center" justifyContent="space-between">
            {getGeralStatusInfo(status).label}
          </Flex>
        </Flex>
      </Flex>

      <Flex marginX="15px" flexDirection="column" marginTop={mobile ? 20 : 0}>
        {!mobile && (
        <Flex marginBottom="18px">
          <Image
            preview={false}
            src={String(PointInvert)}
          />
        </Flex>
        )}
        <div style={{
          fontSize: '10px', backgroundColor: '#F5F5F5', color: '#616161', paddingLeft: '2px', borderRadius: 5,
        }}
        >
          <strong>{t('circuitoB')}</strong>
        </div>

        <Flex flexDirection="column" marginTop="10px" paddingRight="20px" marginRight="20px">
          <span style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '-5px' }}>{t('compressorB')}</span>
          <Flex flexDirection="row" alignItems="center" justifyContent="space-between">
            {getGeralStatusInfo(status).label}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}

function ItemValueDescription({
  variavel, isEnd, description, nameVariavel, model,
}) {
  return (
    <Flex flexDirection="row" marginBottom={isEnd ? '17px' : '7px'}>
      <Flex flexDirection="column" width="100%">
        <span style={{ fontWeight: 'bold', fontSize: '11px' }}>{description}</span>
        <Flex flexDirection="row" alignItems="center" justifyContent="space-between" width="100%">
          <Flex alignItems="center">
            <div style={{
              width: '17px', height: '17px', backgroundColor: getTemperatureColor(variavel, nameVariavel, model), borderRadius: '2px', marginRight: 7,
            }}
            />
            <span style={{ fontWeight: 'bold', marginRight: 3 }}>{formatNumberWithFractionDigits(variavel ?? '-')}</span>
            <span style={{ color: '#8C8C8C' }}>kPa</span>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}

function ImageValueCard({
  alarm, mobile, model, showCircuitC,
}) {
  if (model?.startsWith('chiller-carrier-30hx')) { return (
    <Box
      style={{ position: 'relative' }}
      alignSelf={decideCSS(mobile, 'unset', 'center')}
      marginTop={10}
    >
      <div style={{
        position: 'absolute', bottom: '200px', left: '0', zIndex: 0, height: '50px', borderRadius: '100px / 50px', width: '90%', backgroundColor: 'transparent', boxShadow: '0px 170px 80px rgba(0, 0, 0, 0.5)',
      }}
      />
      <Image
        preview={false}
        width={mobile ? '300px' : '500px'}
        src={String(ChillerCarrierHX)}
        style={{ opacity: (alarm === 2 ? '0.4' : '1') }}
      />
      {(alarm === 2)
          && (
            <div style={{
              position: 'absolute', bottom: '50%', right: '110px', zIndex: 0, borderRadius: '10px', backgroundColor: '#fff', padding: '15px',
            }}
            >
              <Flex flexDirection="row" alignItems="center" justifyContent="center">
                <Image
                  preview={false}
                  src={String(AlarmIcon)}
                  style={{ width: '40px', marginRight: '10px' }}
                />
                <span style={{ fontWeight: 'bold', width: '160px' }}>{t('chillerEmAlarmeEParadaDeEmergencia')}</span>
              </Flex>
            </div>
          )}
    </Box>
  ); }

  if (model?.startsWith('chiller-carrier-30xa')) { return (
    <Flex
      style={{ position: 'relative' }}
      alignSelf={showCircuitC ? 'center' : 'flex-end'}
      padding="20px 50px"
    >

      <Image
        preview={false}
        width={mobile ? '300px' : '500px'}
        src={String(ChillerCarrierXA)}
        style={{ opacity: (alarm === 2 ? '0.4' : '1') }}
      />

      {(alarm === 2)
          && (
            <div style={{
              position: 'absolute', bottom: '50%', right: '110px', zIndex: 0, borderRadius: '10px', backgroundColor: '#fff', padding: '15px',
            }}
            >
              <Flex flexDirection="row" alignItems="center" justifyContent="center">
                <Image
                  preview={false}
                  src={String(AlarmIcon)}
                  style={{ width: '40px', marginRight: '10px' }}
                />
                <span style={{ fontWeight: 'bold', width: '160px' }}>{t('chillerEmAlarmeEParadaDeEmergencia')}</span>
              </Flex>
            </div>
          )}
    </Flex>
  ); }

  return <></>;
}

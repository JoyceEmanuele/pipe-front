import ReactTooltip from 'react-tooltip';
import { Flex, Box } from 'reflexbox';

import { Card, HealthIcon } from '..';
import { formatTime } from '../../helpers/formatTime';
import { t } from 'i18next';
import {
  TopTitle,
  TopDate,
  ItemTitle,
  ItemSubTitle,
  ItemValue,
  ItemValueInt,
  TootipTexName,
  TootipTexValue,
  TootipTex,
  CardLine,
  ZeroConsumo,
  MenorConsumo,
  MedioConsumo,
  MaiorConsumo,
} from './styles';
import { formatNumberWithFractionDigits } from '~/helpers/thousandFormatNumber';

export const EnergyEfficiencyMachines = ({
  selectedTimeRange,
  dateList,
  consumptionSum,
  dacList,
  higherConsumptionCounter,
  mediumConsumptionCounter,
  lowerConsumptionCounter,
  zeroConsumptionCounter,
}): JSX.Element => (
  <Box width={[1, 1, 1, 1, 1, 25 / 51]} mb={40}>
    <Card>

      <Flex flexWrap="wrap" justifyContent="space-between" alignItems="center">
        <Box width={[1, 1, 1, 1 / 2, 1 / 2, 1 / 2]}>
          <TopTitle>{t('consumoRefrigeracaoMaquinas')}</TopTitle>
        </Box>
        <Box width={[1, 1, 1, 1 / 2, 1 / 2, 1 / 2]}>
          <TopDate>
            {
                selectedTimeRange === t('dia')
                  ? dateList[0].DMY
                  : `${dateList[0].DMY} ${t('a')} ${dateList[dateList.length - 1].DMY}`
              }
          </TopDate>
        </Box>
      </Flex>

      <Flex flexWrap="wrap" alignItems="center" pl={15} pr={15}>

        <Flex alignItems="center" mt={40}>
          <Box mr={25}>
            <ItemTitle>
              {t('total')}
            </ItemTitle>
            <ItemSubTitle>
              {t('maquinas')}
            </ItemSubTitle>
          </Box>
          <Box>
            <ItemValue>
              <ItemValueInt>{dacList.length}</ItemValueInt>
            </ItemValue>
          </Box>
        </Flex>

        <Box width={[1, 1, 1, 1, 1, 1]} display="flex" justifyContent="center">
          <div style={{ width: '100%' }}>
            <Flex alignItems="center" mt={19}>
              {dacList.map((dac, index) => (
                <div
                  key={`dac-${dac.id}`}
                  data-tip
                  data-for={dac.id}
                  style={{
                    height: 59,
                    width: `${consumptionSum ? Math.ceil(dac.consKWH / consumptionSum * 100) || 0.5 : 0.5}%`,
                    background: dac.rangeCons === 'higher' ? '#363BC4' : dac.rangeCons === 'medium' ? '#898DF3' : dac.rangeCons === 'lower' ? '#C6C7EC' : '#CCCCCC',
                    marginRight: 3,
                    borderTopLeftRadius: index === 0 ? 5 : 0,
                    borderBottomLeftRadius: index === 0 ? 5 : 0,
                    borderTopRightRadius: index === dacList.length - 1 ? 5 : 0,
                    borderBottomRightRadius: index === dacList.length - 1 ? 5 : 0,
                  }}
                >
                  <ReactTooltip
                    id={`${dac.id}`}
                    place="right"
                    border
                    textColor="#000000"
                    backgroundColor="rgba(255, 255, 255, 0.9)"
                    borderColor="rgba(0, 0, 0, 0.33)"
                    offset={{ top: -100, right: 5 }}
                  >
                    <TootipTexName>{dac.name}</TootipTexName>

                    <div style={{ marginTop: 8 }}>
                      <TootipTexValue>
                        <strong>{formatNumberWithFractionDigits(dac.consKWH, { minimum: 2, maximum: 2 })}</strong>
                        {' '}
                        kWh
                      </TootipTexValue>
                      <TootipTexValue>
                        <strong>{formatNumberWithFractionDigits(dac.pot)}</strong>
                        {' '}
                        TR
                      </TootipTexValue>
                    </div>

                    <div style={{ marginTop: 8 }}>
                      <TootipTex>
                        <strong>{t('usoMedio')}</strong>
                        {formatTime(dac.consH)}
                        h
                      </TootipTex>
                    </div>

                    {dac.dacs.map((machine) => (
                      <Flex key={`dev_${machine.id}_tooltip`} width={1} style={{ marginTop: 8 }}>
                        <Box width={10 / 12}>
                          <TootipTex>{machine.name}</TootipTex>
                          <TootipTex>{machine.id}</TootipTex>
                        </Box>
                        {machine.id.startsWith('DAC') && (
                          <Box width={2 / 12}>
                            <HealthIcon health={(machine.health || 0).toString()} />
                          </Box>
                        )}
                      </Flex>
                    ))}

                  </ReactTooltip>
                </div>
              ))}
            </Flex>
          </div>
        </Box>

        <CardLine />

        <Flex justifyContent="space-between" alignItems="center" width={1} mt={25}>
          <Box>
            <div>
              <ItemTitle>
                {t('maior')}
                {' '}
                <MaiorConsumo />
              </ItemTitle>
              <ItemSubTitle>
                {t('maquinas')}
              </ItemSubTitle>
              <ItemValue>
                <ItemValueInt>{higherConsumptionCounter}</ItemValueInt>
              </ItemValue>
            </div>
          </Box>
          <Box>
            <div>
              <ItemTitle>
                {t('medio')}
                {' '}
                <MedioConsumo />
              </ItemTitle>
              <ItemSubTitle>
                {t('maquinas')}
              </ItemSubTitle>
              <ItemValue>
                <ItemValueInt>{mediumConsumptionCounter}</ItemValueInt>
              </ItemValue>
            </div>
          </Box>
          <Box>
            <div>
              <ItemTitle>
                {t('menor')}
                {' '}
                <MenorConsumo />
              </ItemTitle>
              <ItemSubTitle>
                {t('maquinas')}
              </ItemSubTitle>
              <ItemValue>
                <ItemValueInt>{lowerConsumptionCounter}</ItemValueInt>
              </ItemValue>
            </div>
          </Box>
          <Box>
            <div>
              <ItemTitle>
                {t('semConsumo')}
                {' '}
                <ZeroConsumo />
              </ItemTitle>
              <ItemSubTitle>
                {t('maquinas')}
              </ItemSubTitle>
              <ItemValue>
                <ItemValueInt>{zeroConsumptionCounter}</ItemValueInt>
              </ItemValue>
            </div>
          </Box>
        </Flex>

      </Flex>

    </Card>
  </Box>
);

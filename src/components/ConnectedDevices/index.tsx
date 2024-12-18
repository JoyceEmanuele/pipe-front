import { Flex, Box } from 'reflexbox';
import { useTranslation } from 'react-i18next';
import { Card, Loader } from '../index';
import { colors } from '../../styles/colors';
import Environments from '../../assets/img/icons/environment.svg';
import Active from '../../assets/img/icons/active.svg';
import Machines from '../../assets/img/icons/machines.svg';
import Energy from '../../assets/img/icons/energy.svg';
import Water from '../../assets/img/icons/water.svg';
import Lighting from '../../assets/img/icons/lighting.svg';
import Nobreaks from '../../assets/img/icons/nobreak.svg';
import Utilities from '../../assets/img/icons/utilities.svg';

import {
  ItemTitle, ItemSubTitle, ItemValue, ItemVal, Overlay, NewCardPersonalized, ServerStyledBorder, TooltipContainer, BoxHover, ContainerIconImage,
} from './styles';
import { BsSquareFill } from 'react-icons/bs';
import { getUserProfile } from '../../helpers/userProfile';
import ReactTooltip from 'react-tooltip';
import { useState } from 'react';
import { thousandPointFormat } from '~/helpers/thousandFormatNumber';

type ConnectedDevicesProps = {
  devicesCount: any;
  unitsCount: any;
  maxWidth?: number;
  marginLeft: number;
  marginRight: number;
  isLoading: boolean;
  utils: {
    maquinas: {
      catalogadas: number;
      monitoradas: {
        online: number;
        offline: number;
      }
    },
    ambientes: {
      online: number;
      offline: number;
      unMonitored: number;
    },
    energia: {
      online: number;
      offline: number;
    },
    agua: {
      online: number;
      offline: number;
    },
    iluminacao: {
      online: number;
      offline: number;
    },
    nobreak: {
      online: number;
      offline: number;
    },
  },
}

export const ConnectedDevices = ({
  devicesCount,
  unitsCount,
  utils,
  isLoading = false,
}: ConnectedDevicesProps): JSX.Element => {
  const { t } = useTranslation();
  const [profile] = useState(getUserProfile);
  const utilitaries = utils?.nobreak?.offline + utils?.nobreak?.online + utils?.iluminacao?.offline + utils?.iluminacao?.online;
  const isDesktop = window.matchMedia('(min-width: 426px)');
  const isMobile = !isDesktop.matches;

  return (
    <NewCardPersonalized>
      <Card>

        {isLoading ? (
          <Overlay>
            <Loader variant="primary" size="large" />
          </Overlay>
        ) : (<> </>)}

        <Flex
          className="wrapFlexContainer"
          flexWrap="wrap"
          justifyContent={isMobile ? 'space-between' : 'center'}
          style={{ gap: isMobile ? '15px' : '35px' }}
        >
          <Flex flexWrap="wrap" flexDirection="column" alignItems="flex-start">
            <Box>
              <ItemValue>
                <ItemVal>
                  { thousandPointFormat(unitsCount.onlineUnits + unitsCount.offlineUnits) || '-'}
                </ItemVal>
              </ItemValue>
            </Box>
            <Box>
              <ItemTitle>
                {t('unidades')}
              </ItemTitle>
            </Box>
          </Flex>

          {
            profile.manageAllClients && (
              <>
                <Flex className="wrapFlexContainer disableBorder" flexWrap="nowrap" style={{ minWidth: '110px' }}>
                  <Flex flexWrap="wrap" flexDirection="column" alignItems="flex-start">
                    <Box>
                      <ItemValue>
                        <ItemVal style={{
                          fontSize: '11px',
                          marginTop: '7px',
                          display: 'flex',
                          flexDirection: 'row',
                        }}
                        >
                          {t('emOperacao')}
                          <span style={{
                            fontSize: '9px', marginLeft: '4px', fontWeight: 'normal', marginTop: '2px',
                          }}
                          >
                            {thousandPointFormat(unitsCount.onlineUnits)}
                          </span>
                        </ItemVal>
                      </ItemValue>
                    </Box>
                    <Box>
                      <ItemValue>
                        <ItemVal style={{
                          fontSize: '11px',
                          marginTop: '8px',
                          display: 'flex',
                          flexDirection: 'row',
                        }}
                        >
                          {t('emInstalacao')}
                          <span style={{
                            fontSize: '9px', marginLeft: '4px', fontWeight: 'normal', marginTop: '2px',
                          }}
                          >
                            {thousandPointFormat(unitsCount.offlineUnits)}
                          </span>
                        </ItemVal>
                      </ItemValue>
                    </Box>
                  </Flex>
                </Flex>

                <ReactTooltip
                  id="tooltip-dispositivos"
                  place="top"
                  textColor="#000000"
                  backgroundColor="#FFFFFF"
                  className="boxShadow"
                >
                  <TooltipContainer>
                    <Flex flexWrap="wrap" justifyContent="center" alignItems="center" flexDirection="column">
                      <Box justifyContent="start">
                        <ItemTitle>
                          {t('dispositivos')}
                        </ItemTitle>
                        <Flex flexDirection="row" mt={2}>
                          <BsSquareFill size={15} color={colors.BlueSecondary} className="margin-right" />
                          <ItemTitle>
                            {t('online')}
                            :
                          </ItemTitle>
                          <ItemSubTitle className="margin-left">
                            {thousandPointFormat(devicesCount?.onlineDevs)}
                          </ItemSubTitle>
                        </Flex>
                        <Flex flexDirection="row">
                          <BsSquareFill size={15} color={colors.Grey300} className="margin-right" />
                          <ItemTitle>
                            {t('offline')}
                            :
                          </ItemTitle>
                          <ItemSubTitle className="margin-left">
                            {thousandPointFormat(devicesCount?.offlineDevs)}
                          </ItemSubTitle>
                        </Flex>
                      </Box>
                    </Flex>
                  </TooltipContainer>
                </ReactTooltip>
                <Flex className="wrapFlexContainer" flexWrap="nowrap" justifyContent="space-between">
                  <BoxHover data-tip data-for="tooltip-dispositivos">
                    <Flex flexWrap="wrap" flexDirection="column" alignItems="flex-start">
                      <Box>
                        <ItemValue>
                          <ItemVal>
                            {thousandPointFormat(devicesCount && (devicesCount.onlineDevs + devicesCount.offlineDevs)) || '-'}
                          </ItemVal>
                        </ItemValue>
                        <ItemTitle>
                          {t('dispositivos')}
                        </ItemTitle>
                      </Box>
                    </Flex>
                  </BoxHover>
                </Flex>
              </>
            )
          }

          <ReactTooltip
            id="tooltip-ativo"
            place="top"
            textColor="#000000"
            backgroundColor="#FFFFFF"
            className="boxShadow"
          >
            <TooltipContainer>
              <strong>{t('ativos')}</strong>
              <Flex mt={1}>
                <span>
                  {t('monitorados')}
                  :
                </span>
                <ItemSubTitle className="margin-left">
                  {thousandPointFormat(utils && utils.maquinas.monitoradas.online + utils.maquinas.monitoradas.offline + utils.nobreak.online + utils.nobreak.offline)}
                </ItemSubTitle>
              </Flex>
              <Flex flexDirection="row" mt={1}>
                <BsSquareFill size={15} color={colors.BlueSecondary} className="margin-right" />
                <span>
                  {t('online')}
                  :
                </span>
                <ItemSubTitle className="margin-left">
                  {thousandPointFormat(utils && utils.maquinas.monitoradas.online + utils.nobreak.online)}
                </ItemSubTitle>
              </Flex>
              <Flex flexDirection="row">
                <BsSquareFill size={15} color={colors.Grey300} className="margin-right" />
                <span>
                  {t('offline')}
                  :
                </span>
                <ItemSubTitle className="margin-left">
                  {thousandPointFormat(utils && utils.maquinas.monitoradas.offline + utils.nobreak.offline)}
                </ItemSubTitle>
              </Flex>
            </TooltipContainer>
          </ReactTooltip>
          <Flex flexDirection="row" style={{ minWidth: '110px' }}>
            <BoxHover data-tip data-for="tooltip-ativo">
              <ServerStyledBorder>
                <img src={Active} alt="ativo" />
              </ServerStyledBorder>
              <Flex flexDirection="column" justifyContent="space-between">
                <Box>
                  <ItemValue>
                    <ItemVal>
                      {thousandPointFormat(utils && utils.maquinas.catalogadas + utils.nobreak.offline + utils.nobreak.online)}
                    </ItemVal>
                  </ItemValue>
                  <ItemTitle>
                    {t('ativos')}
                  </ItemTitle>
                </Box>
              </Flex>
            </BoxHover>
          </Flex>

          <ReactTooltip
            id="tooltip-maquinas"
            place="top"
            textColor="#000000"
            backgroundColor="#FFFFFF"
            className="boxShadow"
          >
            <TooltipContainer>
              <strong>{t('maquinas')}</strong>
              <Flex mt={1}>
                <span>
                  {t('monitoradas')}
                  :
                </span>
                <ItemSubTitle className="margin-left">
                  {thousandPointFormat(utils?.maquinas && utils.maquinas.monitoradas.online + utils.maquinas.monitoradas.offline)}
                </ItemSubTitle>
              </Flex>
              <Flex flexDirection="row" marginTop={1}>
                <BsSquareFill size={15} color={colors.BlueSecondary} className="margin-right" />
                <span>
                  {t('online')}
                  :
                </span>
                <ItemSubTitle className="margin-left">
                  {thousandPointFormat(utils?.maquinas?.monitoradas.online)}
                </ItemSubTitle>
              </Flex>
              <Flex flexDirection="row">
                <BsSquareFill size={15} color={colors.Grey300} className="margin-right" />
                <span>
                  {t('offline')}
                  :
                </span>
                <ItemSubTitle className="margin-left">
                  {thousandPointFormat(utils?.maquinas?.monitoradas.offline)}
                </ItemSubTitle>
              </Flex>
            </TooltipContainer>
          </ReactTooltip>
          <Flex flexDirection="row" style={{ minWidth: '110px' }}>
            <BoxHover data-tip data-for="tooltip-maquinas">
              <ServerStyledBorder>
                <img src={Machines} alt="máquinas" />
              </ServerStyledBorder>
              <Flex flexDirection="column" justifyContent="space-between">
                <Box>
                  <ItemValue>
                    <ItemVal>
                      {thousandPointFormat(utils?.maquinas?.catalogadas)}
                    </ItemVal>
                  </ItemValue>
                  <ItemTitle>
                    {t('maquinas')}
                  </ItemTitle>
                </Box>
              </Flex>
            </BoxHover>
          </Flex>

          <ReactTooltip
            id="tooltip-ambientes"
            place="top"
            textColor="#000000"
            backgroundColor="#FFFFFF"
            className="boxShadow"
          >
            <TooltipContainer>
              <strong>{t('ambientes')}</strong>
              <Flex flexDirection="row" marginTop={1}>
                <BsSquareFill size={15} color={colors.BlueSecondary} className="margin-right" />
                <span>
                  {t('online')}
                  :
                </span>
                <ItemSubTitle className="margin-left">
                  {thousandPointFormat(utils?.ambientes?.online)}
                </ItemSubTitle>
              </Flex>
              <Flex flexDirection="row">
                <BsSquareFill size={15} color={colors.Grey300} className="margin-right" />
                <span>
                  {t('offline')}
                  :
                </span>
                <ItemSubTitle className="margin-left">
                  {thousandPointFormat(utils?.ambientes?.offline)}
                </ItemSubTitle>
              </Flex>
            </TooltipContainer>
          </ReactTooltip>
          <Flex flexDirection="row" style={{ minWidth: '110px' }}>
            <BoxHover data-tip data-for="tooltip-ambientes">
              <ServerStyledBorder>
                <img src={Environments} alt="" />
              </ServerStyledBorder>
              <Flex flexDirection="column" justifyContent="space-between">
                <Box>
                  <ItemValue>
                    <ItemVal>
                      {thousandPointFormat(utils?.ambientes && utils.ambientes.online + utils.ambientes.offline + utils.ambientes.unMonitored)}
                    </ItemVal>
                  </ItemValue>
                  <ItemTitle>
                    {t('ambientes')}
                  </ItemTitle>
                </Box>
              </Flex>
            </BoxHover>
          </Flex>

          <ReactTooltip
            id="tooltip-energia"
            place="top"
            textColor="#000000"
            backgroundColor="#FFFFFF"
            className="boxShadow"
          >
            <TooltipContainer>
              <strong>{t('energia')}</strong>
              <span>{t('medidores')}</span>
              <Flex flexDirection="row" marginTop={2}>
                <BsSquareFill size={15} color={colors.BlueSecondary} className="margin-right" />
                <span>
                  {t('online')}
                  :
                </span>
                <ItemSubTitle className="margin-left">
                  {thousandPointFormat(utils?.energia?.online)}
                </ItemSubTitle>
              </Flex>
              <Flex flexDirection="row">
                <BsSquareFill size={15} color={colors.Grey300} className="margin-right" />
                <span>
                  {t('offline')}
                  :
                </span>
                <ItemSubTitle className="margin-left">
                  {thousandPointFormat(utils?.energia?.offline)}
                </ItemSubTitle>
              </Flex>
            </TooltipContainer>
          </ReactTooltip>
          <Flex flexDirection="row" style={{ minWidth: '110px' }}>
            <BoxHover data-tip data-for="tooltip-energia">
              <ServerStyledBorder>
                <img src={Energy} alt="" />
              </ServerStyledBorder>
              <Flex flexDirection="column" justifyContent="space-between">
                <Box>
                  <ItemValue>
                    <ItemVal>
                      {thousandPointFormat(utils?.energia && utils.energia.online + utils.energia.offline)}
                    </ItemVal>
                  </ItemValue>
                  <Box>
                    <ItemTitle>
                      {t('energia')}
                    </ItemTitle>
                    <ItemSubTitle>
                      {t('medidores')}
                    </ItemSubTitle>
                  </Box>
                </Box>
              </Flex>
            </BoxHover>
          </Flex>

          {
            utils && utils.agua && (utils.agua.offline + utils.agua.online) > 0 && (
              <>
                <ReactTooltip
                  id="tooltip-agua"
                  place="top"
                  textColor="#000000"
                  backgroundColor="#FFFFFF"
                  className="boxShadow"
                >
                  <TooltipContainer>
                    <strong>{t('agua')}</strong>
                    <span>{t('medidores')}</span>
                    <Flex flexDirection="row" marginTop={1}>
                      <BsSquareFill size={15} color={colors.BlueSecondary} className="margin-right" />
                      <span>
                        {t('online')}
                        :
                      </span>
                      <ItemSubTitle className="margin-left">
                        {thousandPointFormat(utils?.agua?.online)}
                      </ItemSubTitle>
                    </Flex>
                    <Flex flexDirection="row">
                      <BsSquareFill size={15} color={colors.Grey300} className="margin-right" />
                      <span>
                        {t('offline')}
                        :
                      </span>
                      <ItemSubTitle className="margin-left">
                        {thousandPointFormat(utils?.agua?.offline)}
                      </ItemSubTitle>
                    </Flex>
                  </TooltipContainer>
                </ReactTooltip>
                <Flex flexDirection="row" style={{ minWidth: '110px' }}>
                  <BoxHover data-tip data-for="tooltip-agua">
                    <ServerStyledBorder>
                      <img src={Water} alt="" />
                    </ServerStyledBorder>
                    <Flex flexDirection="column" justifyContent="space-between">
                      <Box>
                        <ItemValue>
                          <ItemVal>
                            {thousandPointFormat(utils?.agua && utils.agua.online + utils.agua.offline)}
                          </ItemVal>
                        </ItemValue>
                        <Box>
                          <ItemTitle>
                            {t('agua')}
                          </ItemTitle>
                          <ItemSubTitle>
                            {t('medidores')}
                          </ItemSubTitle>
                        </Box>
                      </Box>
                    </Flex>
                  </BoxHover>
                </Flex>

              </>
            )
          }

          {
            utilitaries > 0 && (
              <>
                <ReactTooltip
                  id="tooltip-utilitarios"
                  place="top"
                  textColor="#000000"
                  backgroundColor="#FFFFFF"
                  className="boxShadow"
                >
                  <TooltipContainer>
                    <Flex flexDirection="column">
                      <ContainerIconImage>
                        <img src={Lighting} alt="" />
                        <strong>
                          {t('iluminacao')}
                          :
                        </strong>
                        <span>
                          {thousandPointFormat(utils?.iluminacao && utils.iluminacao.online + utils.iluminacao.offline)}
                        </span>
                      </ContainerIconImage>
                      <Flex flexDirection="row" marginTop={1}>
                        <BsSquareFill size={15} color={colors.BlueSecondary} className="margin-right" />
                        <span>
                          {t('online')}
                          :
                        </span>
                        <ItemSubTitle className="margin-left">
                          {thousandPointFormat(utils?.iluminacao?.online)}
                        </ItemSubTitle>
                      </Flex>
                      <Flex flexDirection="row">
                        <BsSquareFill size={15} color={colors.Grey300} className="margin-right" />
                        <span>
                          {t('offline')}
                          :
                        </span>
                        <ItemSubTitle className="margin-left">
                          {thousandPointFormat(utils?.iluminacao?.offline)}
                        </ItemSubTitle>
                      </Flex>
                    </Flex>

                    <Flex flexDirection="column" marginTop={2}>
                      <ContainerIconImage>
                        <img src={Nobreaks} alt="" />
                        <strong>
                          {t('nobreak')}
                          :
                        </strong>
                        <span>
                          {thousandPointFormat(utils?.nobreak && utils.nobreak.online + utils.nobreak.offline)}
                        </span>
                      </ContainerIconImage>
                      <Flex flexDirection="row" marginTop={1}>
                        <BsSquareFill size={15} color={colors.BlueSecondary} className="margin-right" />
                        <span>
                          {t('online')}
                          :
                        </span>
                        <ItemSubTitle className="margin-left">
                          {thousandPointFormat(utils?.nobreak?.online)}
                        </ItemSubTitle>
                      </Flex>
                      <Flex flexDirection="row">
                        <BsSquareFill size={15} color={colors.Grey300} className="margin-right" />
                        <span>
                          {t('offline')}
                          :
                        </span>
                        <ItemSubTitle className="margin-left">
                          {thousandPointFormat(utils?.nobreak?.offline)}
                        </ItemSubTitle>
                      </Flex>
                    </Flex>
                  </TooltipContainer>
                </ReactTooltip>
                <Flex flexDirection="row">
                  <BoxHover data-tip data-for="tooltip-utilitarios">
                    <ServerStyledBorder>
                      <img src={Utilities} alt="" />
                    </ServerStyledBorder>
                    <Flex flexDirection="column" justifyContent="space-between">
                      <Box>
                        <ItemValue>
                          <ItemVal>
                            {thousandPointFormat(utils?.iluminacao && utils?.nobreak && utils.iluminacao.online + utils.iluminacao.offline + utils.nobreak.online + utils.nobreak.offline)}
                          </ItemVal>
                        </ItemValue>
                        <Box>
                          <ItemTitle>
                            {t('utilitarios')}
                          </ItemTitle>
                        </Box>
                      </Box>
                    </Flex>
                  </BoxHover>
                </Flex>
              </>
            )
          }
        </Flex>
      </Card>
    </NewCardPersonalized>
  );
};

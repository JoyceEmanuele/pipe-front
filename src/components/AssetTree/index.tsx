import { useEffect, useState } from 'react';
import { useStateVar } from 'helpers/useStateVar';
import { Flex } from 'reflexbox';
import { IconWrapper, IconBiggerWrapper } from './styles';
import { getUserProfile } from 'helpers/userProfile';
import { AssetConnection } from 'components/AssetConnection';
import { formatHealthIcon, healthLevelColor } from 'components/HealthIcon';
import ReactTooltip from 'react-tooltip';
import { useTranslation } from 'react-i18next';
import {
  BoxIcon,
  LayersIcon,
  ChipIcon,
} from '../../icons';
import { useHistory } from 'react-router-dom';
import { position } from 'html2canvas/dist/types/css/property-descriptors/position';

interface ComponentProps {
  assets: {
    ASSET_ID: number,
    DAT_ID: string,
    AST_TYPE: string,
    AST_DESC: string,
    DEV_ID: string|null,
    H_INDEX: number|null,
    AST_ROLE_NAME: string,
    AST_ROLE_INDEX: number
    selected: boolean,
    rssiText: string,
  } [],
  AUTOM_ID: string|null,
  DEV_AUT: string|null,
  DUT_ID: string|null,
  GROUP_NAME: string|null,
  GROUP_ID: string,
  isAutomationelected: boolean,
  isGroupSelected: boolean,
  onHandleSelectCard,
}

export const AssetTree = (props: ComponentProps): JSX.Element => {
  const [profile] = useState(getUserProfile);
  const history = useHistory();
  const { t } = useTranslation();
  const [state, render] = useStateVar(() => ({
    assets: props.assets,
    automationSelected: props.isAutomationelected,
    groupSelected: props.isGroupSelected,
    isSelected: false,
  }));

  // position -1 means selected automation and -2 means selected group
  function selectCard(position: number) {
    state.isSelected = true;
    state.assets.forEach((asset, index) => asset.selected = position === index);
    state.automationSelected = position === -1;
    state.groupSelected = position === -2;
    props.onHandleSelectCard(position);
    render();
  }

  function splitUrl(url: string) {
    const partes = url.split('/');
    const index = partes.indexOf('ativos');
    if (index !== -1 && index + 1 < partes.length) {
      return partes[index + 1];
    }
    return null;
  }

  useEffect(() => {
    if (!state.isSelected) {
      let position;
      const machineId = splitUrl(history.location.pathname);
      if (!machineId) {
        position = -2;
        state.groupSelected = true;
        state.automationSelected = false;
        state.assets.forEach((asset) => asset.selected = false);
      }
      else if (props.AUTOM_ID === machineId) {
        position = -1;
        state.groupSelected = false;
        state.automationSelected = true;
        state.assets.forEach((asset) => asset.selected = false);
      }
      else {
        const assetfilter = state.assets.filter((asset) => String(asset.ASSET_ID) === machineId || asset.DEV_ID === machineId);
        position = assetfilter.length > 0 ? state.assets.indexOf(assetfilter[0]) : -1;
        state.groupSelected = false;
        state.assets.forEach((asset, index) => asset.selected = position === index);
      }
      props.onHandleSelectCard(position);
      render();
    }
    state.isSelected = false;
  }, [history.location.pathname]);

  function borderCard(isSelected: boolean) {
    return !isSelected ? '1px solid lightgrey' : '2px solid #363BC4';
  }

  function borderLeftCard(isSelected: boolean) {
    return !isSelected ? '1px solid lightgrey' : '4px solid #363BC4';
  }

  function cardName(DAT_ID: string, DEV_ID: string|null) {
    const devIdText = DEV_ID ? `/${DEV_ID}` : '';
    if (DAT_ID) return `${DAT_ID}${devIdText}`;
    return DEV_ID;
  }

  function cardRootDescription(name: string|null, maxSize: number) {
    if (!name) return null;
    const overExtended = name.length > maxSize;
    const nameDisplay = !overExtended ? name : `${name.substring(0, maxSize)}...`;
    return (
      <>
        <div
          style={{
            marginTop: '6px', fontSize: '95%', textOverflow: 'ellipsis', overflowX: 'hidden', overflowY: 'hidden', whiteSpace: 'nowrap',
          }}
          data-tip
          data-for={nameDisplay}
        >
          <strong>
            {name}
          </strong>
        </div>
        {overExtended && (
          <ReactTooltip
            id={nameDisplay}
            place="top"
            effect="solid"
            delayHide={100}
            offset={{ top: 0, left: 10 }}
            textColor="#000000"
            border
            backgroundColor="rgba(255, 255, 255, 0.97)"
          >
            <span
              style={{
                marginTop: '6px', fontSize: '95%', textOverflow: 'ellipsis', overflowX: 'hidden', overflowY: 'hidden', whiteSpace: 'nowrap',
              }}
            >
              <strong>
                {name}
              </strong>
            </span>
          </ReactTooltip>
        )}
      </>
    );
  }

  function formatItemIcon(type: string) {
    switch (type) {
      case 'Group': return <LayersIcon />;
      case 'Asset': return <BoxIcon />;
      case 'Automation': return <ChipIcon />;
      default: return null;
    }
  }

  function shouldShowHealthIcon(asset: (typeof state.assets)[number]) {
    return props.AUTOM_ID === asset.DEV_ID
        || asset.DEV_ID?.startsWith('DAC'); // DACs sempre mostram ícone de saúde se existir
  }

  return (
    <Flex
      flexWrap="nowrap"
      flexDirection="column"
      height="400px"
      style={{
        backgroundColor: '#F5F5F5',
        overflow: 'auto',
        width: '100%',
      }}
    >
      <Flex flexWrap="wrap" flexDirection="column" style={{ height: '19%', width: '100%' }}>
        <Flex
          flexWrap="nowrap"
          flexDirection="row"
          height="58px"
          width="336px "
          alignItems="left"
          mt={3}
          ml={15}
          style={{
            border: borderCard(state.groupSelected),
            borderLeft: borderLeftCard(state.groupSelected),
            borderRadius: '5px',
            backgroundColor: '#FFFFFF',
            cursor: 'pointer',
          }}
          onClick={() => selectCard(-2)}
        >
          <Flex
            flexWrap="nowrap"
            flexDirection="row"
            height="58px"
            width="27px"
            alignItems="left"
          >
            <strong style={{ marginLeft: '10px', marginTop: '20px', fontSize: '95%' }}>
              ▼
            </strong>
          </Flex>
          <Flex
            flexWrap="nowrap"
            flexDirection="row"
            height="58px"
            width="27px"
            alignItems="left"
          >
            <IconBiggerWrapper style={{ marginTop: '20px', marginLeft: '2px', marginRight: '5px' }}>
              {formatItemIcon('Group')}
            </IconBiggerWrapper>
          </Flex>
          <Flex
            flexWrap="nowrap"
            flexDirection="column"
            height="58px"
            alignItems="left"
            mt={profile.manageAllClients ? 0 : 13}
          >
            {cardRootDescription(props.GROUP_NAME, 36)}
            {profile.manageAllClients && (
              <span style={{ marginBottom: '12px', fontSize: '95%' }}>
                {`ID${props.GROUP_ID}`}
              </span>
            )}
          </Flex>
        </Flex>
      </Flex>
      {state.assets.map((asset, index) => (
        <Flex key={`${asset.DAT_ID} - ${asset.DEV_ID}`} flexWrap="wrap" flexDirection="row" style={{ height: '22%', width: '100%' }}>
          <div style={{ borderLeft: '1px dashed black', height: index !== state.assets.length - 1 ? '100%' : '60%', marginLeft: '31px' }} />
          <div style={{
            borderBottom: '1px dashed black',
            height: '60%',
            width: '15px',
          }}
          />
          <Flex
            flexWrap="nowrap"
            flexDirection="row"
            height="58px"
            width="306px "
            alignItems="left"
            mt={3}
            style={{
              border: borderCard(asset.selected),
              borderLeft: borderLeftCard(asset.selected),
              borderRadius: '5px',
              backgroundColor: '#FFFFFF',
              cursor: 'pointer',
            }}
            onClick={() => selectCard(index)}
          >
            <Flex
              flexWrap="nowrap"
              flexDirection="row"
              height="58px"
              width="27px"
              alignItems="left"
            >
              <IconBiggerWrapper style={{ marginTop: profile.manageAllClients ? '20px' : '19px', marginLeft: '5px', marginRight: '5px' }}>
                {formatItemIcon('Asset')}
              </IconBiggerWrapper>
            </Flex>
            <Flex
              flexWrap="nowrap"
              flexDirection="row"
              height="58px"
              alignItems="left"
              width="245px "
            >
              <Flex
                flexWrap="nowrap"
                flexDirection="column"
                mr={2}
                mt={profile.manageAllClients ? 0 : 12}
                alignItems="left"
                height="58px"
              >
                {cardRootDescription(`${asset.AST_DESC}`, 20)}
                {profile.manageAllClients && (
                  <div style={{ fontSize: '95%' }}>
                    {cardName(asset.DAT_ID, asset.DEV_ID)}
                  </div>
                )}
              </Flex>
            </Flex>
            {asset.H_INDEX && shouldShowHealthIcon(asset)
                && (
                <Flex flexWrap="wrap" flexDirection="row" alignItems="left" width="36px" height="36px">
                  <Flex flexWrap="wrap" flexDirection="column" alignItems="left" width="0">
                    <div
                      style={{
                        marginTop: '12px', borderLeft: '1px solid #DCDCDC', height: '30px',
                      }}
                    />
                  </Flex>
                  <Flex flexWrap="wrap" flexDirection="column" alignItems="left" width="32px">
                    {profile.manageAllClients && (
                    <IconBiggerWrapper style={{ marginTop: '6px', marginLeft: '6px' }}>
                      <AssetConnection key={asset.DEV_ID} DUT_ID={null} DEV_ID={asset.DEV_ID} isAutomation={false} />
                    </IconBiggerWrapper>
                    )}
                    <IconWrapper style={{ marginTop: profile.manageAllClients ? '4px' : '19px', marginLeft: '8px', backgroundColor: healthLevelColor(asset.H_INDEX) }}>
                      {formatHealthIcon(asset.H_INDEX)}
                    </IconWrapper>
                  </Flex>
                </Flex>
                )}
            {!asset.H_INDEX
                && (
                <Flex flexWrap="wrap" flexDirection="row" alignItems="left" width="36px" height="36px">
                  <Flex flexWrap="wrap" flexDirection="column" alignItems="left" width="0">
                    <div
                      style={{
                        marginTop: '12px', borderLeft: '1px solid #DCDCDC', height: '30px',
                      }}
                    />
                  </Flex>
                  <Flex flexWrap="wrap" flexDirection="column" alignItems="left" justifyContent="center" width="32px">
                    {profile.manageAllClients && (
                    <IconBiggerWrapper style={{ marginTop: '6px', marginLeft: '6px' }}>
                      <AssetConnection key={asset.DEV_ID} DUT_ID={null} DEV_ID={asset.DEV_ID} isAutomation={false} />
                    </IconBiggerWrapper>
                    )}
                  </Flex>
                </Flex>
                )}
          </Flex>
        </Flex>
      ))}
      {props.AUTOM_ID && (
        <Flex flexWrap="wrap" flexDirection="row" style={{ height: '22%', width: '100%' }}>
          <Flex
            flexWrap="nowrap"
            flexDirection="row"
            height="58px"
            width="191px "
            alignItems="left"
            mt={3}
            ml={47}
            style={{
              border: borderCard(state.automationSelected),
              borderLeft: borderLeftCard(state.automationSelected),
              borderRadius: '5px',
              backgroundColor: '#FFFFFF',
              cursor: 'pointer',
            }}
            onClick={() => selectCard(-1)}
          >
            <Flex
              flexWrap="nowrap"
              flexDirection="row"
              height="58px"
              width="27px"
              alignItems="left"
            >
              <IconBiggerWrapper style={{ marginTop: profile.manageAllClients ? '20px' : '19px', marginLeft: '2px', marginRight: '5px' }}>
                {formatItemIcon('Automation')}
              </IconBiggerWrapper>
            </Flex>
            <Flex
              flexWrap="nowrap"
              flexDirection="column"
              height="58px"
              alignItems="left"
              width="130px"
              mt={profile.manageAllClients ? 0 : 12}
            >
              {cardRootDescription(t('descricaoRaizCartaoArvoreAtivos'), 20)}
              {profile.manageAllClients && (
              <span style={{ marginBottom: '12px', fontSize: '95%' }}>
                {props.AUTOM_ID}
              </span>
              )}
            </Flex>
            {profile.manageAllClients && (
            <Flex flexWrap="wrap" flexDirection="row" alignItems="left" width="36px" height="36px">
              <Flex flexWrap="wrap" flexDirection="column" alignItems="left" width="0">
                <div
                  style={{
                    marginTop: '12px', borderLeft: '1px solid #DCDCDC', height: '30px',
                  }}
                />
              </Flex>
              <Flex flexWrap="wrap" flexDirection="column" alignItems="left" width="32px">
                <IconBiggerWrapper style={{ marginTop: '18px', marginLeft: '6px' }}>
                  <AssetConnection key={props.AUTOM_ID} DEV_AUT={props.DEV_AUT} DUT_ID={props.DUT_ID} DEV_ID={props.AUTOM_ID} isAutomation />
                </IconBiggerWrapper>
              </Flex>
            </Flex>
            )}
          </Flex>
        </Flex>
      )}
    </Flex>
  );
};

import { memo, ReactElement } from 'react';
import { TableVirtuoso, TableProps as TableDefaultProps } from 'react-virtuoso';
import { DevList, DutReferenceList } from './types';
import { Checkbox, InputCalculator, Loader } from 'components';
import { checkDecimalPlace, getCheckStatusKey, toggleAllDevicesFromKey } from './helpers/verifications';
import { Box, Flex } from 'reflexbox';
import ReactTooltip from 'react-tooltip';
import { CustomSelectDutsReference, IconWrapper } from '../styles';
import { defaultMaximumTemperature, defaultMinimumTemperature } from './constants';
import { useTranslation } from 'react-i18next';
import { InformationIcon } from '~/icons';

interface TableProps {
  data: DevList[],
  dutsToReference: DutReferenceList[];
  keys: DevKeys,
  isLoading: boolean,
  clientId?: number,
  render: () => void,
}

interface DevKeys {
  id: string,
  stateName: string,
  cityName: string,
  name: string,
  groupName: string,
  canSelfReference: string,
  unitId: string,
  dutId: string,
  selfReference: string,
  minimumTemperature: string,
  maximumTemperature: string
}

interface ItemTableProps {
  dev: DevList,
  devsList: DevList[],
  index: number,
  keys: DevKeys,
  clientId?: number,
  dutsListToReference: DutReferenceList[],
  onClickDevCheck: (id: string) => void,
  onSelectDutReference: (devId: string, dutId: string) => void,
  onChangeMinimumTemperature: (value: string) => void;
  onChangeMaximumTemperature: (value: string) => void;
  toggleAllDevices: (key: string, value: string) => void,
}

interface FilterColumnProps {
  dev: DevList,
  index: number,
  devsList: DevList[],
  keyProp: string,
  toggleAllDevicesFromValue: (value: string) => void;
}

interface HandleGroupNameProps {
  dev: DevList,
  keys: { id: string, groupName: string },
  onClickDevCheck: () => void;
  clientId?: number
}

interface HandleRoomNameProps {
  dev: DevList,
  keys: { id: string, unitId: string, selfReference: string, canSelfReference: string },
  dutsListToReference: DutReferenceList[],
  onSelectDutReference: (item: DutReferenceList) => void;
  dutReference?: DutReferenceList | null,
  clientId?: number,
}

interface HandleDamSelfReferenceInfosProps {
  dev: DevList,
  keys: { selfReference: string, minimumTemperature: string, maximumTemperature: string },
  onChangeMinimumTemperature: (value: string) => void;
  onChangeMaximumTemperature: (value: string) => void;
  dutReference?: DutReferenceList,
  clientId?: number,
}

const Table = ({ style, ...props }: TableDefaultProps): ReactElement => (
  <table
    {...props}
    style={{
      ...style,
      width: '100%',
      border: '1px solid rgb(210, 211, 226)',
      borderRadius: '5px',
    }}
  />
);

const HandleDamSelfReferenceInfos = ({
  clientId,
  dev,
  dutReference,
  keys: {
    selfReference, minimumTemperature, maximumTemperature,
  },
  onChangeMaximumTemperature,
  onChangeMinimumTemperature,
}: HandleDamSelfReferenceInfosProps): ReactElement => {
  const { t } = useTranslation();

  return (
    <>
      <Flex
        alignItems="flex-start"
        flexDirection="row"
        paddingTop="25px"
        width={clientId ? '11%' : '10%'}
        style={{
          borderRight: '1px solid #D2D3E2',
          borderBottom: '1px solid #D2D3E2',
          paddingLeft: '6px',
        }}
        justifyContent="center"
      >
        {!dev[selfReference] && (
          <>
            {dutReference?.TUSEMIN ? `${dutReference.TUSEMIN} ºC` : '-'}
          </>
        )}
        {dev[selfReference] && (
          <div>
            <InputCalculator
              label={t('tMin')}
              value={dev[minimumTemperature] || defaultMinimumTemperature}
              style={{ width: '130px' }}
              onIncreaseDecrease={onChangeMinimumTemperature}
              unity="ºC"
              onChange={(e) => {
                if (checkDecimalPlace(e.target.value)) onChangeMinimumTemperature(e.target.value);
              }}
            />
          </div>
        )}
      </Flex>
      <Flex
        alignItems="flex-start"
        paddingTop="25px"
        flexDirection="row"
        width={clientId ? '11%' : '10%'}
        style={{
          borderRight: '1px solid #D2D3E2',
          borderBottom: '1px solid #D2D3E2',
          paddingLeft: '6px',
        }}
        justifyContent="center"
      >
        {!dev[selfReference] && (
          <>
            {dutReference?.TUSEMAX ? `${dutReference.TUSEMAX} ºC` : '-'}
          </>
        )}
        {dev[selfReference] && (
          <div>
            <InputCalculator
              label={t('tMax')}
              value={dev[maximumTemperature] || defaultMaximumTemperature}
              style={{ width: '130px' }}
              onIncreaseDecrease={onChangeMaximumTemperature}
              unity="ºC"
              onChange={(e) => { if (checkDecimalPlace(e.target.value)) onChangeMaximumTemperature(e.target.value); }}
            />
          </div>
        )}
      </Flex>
    </>
  );
};

const HandleRoomName = ({
  dev,
  keys: {
    id, canSelfReference, unitId, selfReference,
  },
  dutReference,
  dutsListToReference,
  onSelectDutReference,
  clientId,
}: HandleRoomNameProps): ReactElement => {
  const selfReferenceOption = { DEV_ID: dev[id], UNIT_ID: dev[unitId], ROOM_NAME: 'Sensor Interno do DAM' };
  const dutsReferenceUnit = dutsListToReference.filter((item) => item.UNIT_ID === dev[unitId]);

  return (
    <Flex alignItems="flex-start" flexDirection="row" paddingTop="15px" paddingBottom="20px" style={{ borderRight: '1px solid #D2D3E2', borderBottom: '1px solid #D2D3E2', paddingLeft: '6px' }} width={clientId ? '21%' : '30%'} justifyContent="center">
      <Box>
        <CustomSelectDutsReference
          options={[
            ...dutsReferenceUnit,
            ...(dev[canSelfReference] ? [selfReferenceOption] : []),
          ]}
          value={dev[selfReference] ? selfReferenceOption : (dutReference ?? null)}
          placeholder=""
          style={{ width: '250px' }}
          onSelect={onSelectDutReference}
          propLabel="ROOM_NAME"
        />
      </Box>
    </Flex>
  );
};

const HandleGroupName = ({
  clientId,
  dev,
  keys: { groupName, id },
  onClickDevCheck,
}: HandleGroupNameProps): ReactElement => {
  const sizeStringLimit = (clientId ? 69 : 75);

  return (
    <>
      <div
        style={{
          width: clientId ? '12%' : '15%',
          paddingLeft: '6px',
          borderBottom: '1px solid #D2D3E2',
          borderRight: '1px solid #D2D3E2',
        }}
      >
        <Checkbox
          label={dev[id]}
          size={20}
          checked={dev.checked}
          onClick={onClickDevCheck}
          style={{ marginTop: '20px' }}
          link={`/analise/ambiente/${dev[id]}/informacoes`}
        />
      </div>
      <div
        data-tip
        data-for={dev[id]}
        style={{
          paddingTop: '20px',
          hyphens: 'auto',
          width: clientId ? '15%' : '35%',
          paddingLeft: '6px',
          borderRight: '1px solid #D2D3E2',
          borderBottom: '1px solid #D2D3E2',
        }}
      >
        {dev[groupName].length < sizeStringLimit ? dev[groupName] : `${dev[groupName].slice(0, sizeStringLimit)}...`}
        {dev[groupName].length >= sizeStringLimit && (
          <ReactTooltip
            id={dev[id]}
            place="top"
            effect="solid"
            delayHide={100}
            offset={{ top: 0, left: 10 }}
            textColor="#000000"
            border
            backgroundColor="rgba(256, 256, 256, 1)"
          >
            <Flex flexWrap="nowrap" flexDirection="column" alignItems="left">
              <span
                style={{
                  fontSize: '95%',
                }}
              >
                {dev[groupName]}
              </span>
            </Flex>
          </ReactTooltip>
        )}
      </div>
    </>
  );
};

const FilterColumn = ({
  dev,
  devsList,
  index,
  keyProp,
  toggleAllDevicesFromValue,
}: FilterColumnProps): ReactElement => (
  <div
    style={{
      width: '10%',
      paddingLeft: '10px',
      borderRight: '1px solid #D2D3E2',
      borderBottom: !dev[keyProp] || (index < devsList.length - 1 && devsList[index + 1][keyProp] !== dev[keyProp]) || index === devsList.length - 1 ? '1px solid #D2D3E2' : '0',
    }}
  >
    {dev[keyProp] && (index === 0 || index !== 0 && devsList[index - 1][keyProp] !== dev[keyProp])
        && (
          <Checkbox
            label={dev[keyProp]}
            size={20}
            checked={getCheckStatusKey(devsList, keyProp, dev[keyProp])}
            onClick={() => toggleAllDevicesFromValue(dev[keyProp])}
            style={{ marginTop: '20px' }}
          />
        )}
  </div>
);

const ItemTable = ({
  clientId,
  dev,
  devsList,
  index,
  keys,
  dutsListToReference,
  onSelectDutReference,
  onClickDevCheck,
  toggleAllDevices,
  onChangeMaximumTemperature,
  onChangeMinimumTemperature,
}: ItemTableProps): ReactElement => {
  const dutReference = dutsListToReference.find((item) => item.DEV_ID === dev[keys.dutId]);

  return (
    <div
      key={dev[keys.id]}
      style={{
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      {clientId && (
        <>
          <FilterColumn
            dev={dev}
            devsList={devsList}
            index={index}
            keyProp={keys.stateName}
            toggleAllDevicesFromValue={
              (value) => toggleAllDevices(keys.stateName, value)
            }
          />
          <FilterColumn
            dev={dev}
            devsList={devsList}
            index={index}
            keyProp={keys.cityName}
            toggleAllDevicesFromValue={
              (value) => toggleAllDevices(keys.cityName, value)
            }
          />
          <FilterColumn
            dev={dev}
            devsList={devsList}
            index={index}
            keyProp={keys.name}
            toggleAllDevicesFromValue={
              (value) => toggleAllDevices(keys.name, value)
            }
          />
        </>
      )}
      <HandleGroupName
        dev={dev}
        clientId={clientId}
        keys={{ id: keys.id, groupName: keys.groupName }}
        onClickDevCheck={() => onClickDevCheck(dev[keys.id])}
      />

      <HandleRoomName
        dev={dev}
        dutsListToReference={dutsListToReference}
        keys={{
          canSelfReference: keys.canSelfReference,
          id: keys.id,
          selfReference: keys.selfReference,
          unitId: keys.unitId,
        }}
        onSelectDutReference={(item) => onSelectDutReference(dev[keys.id], item.DEV_ID)}
        dutReference={dutReference}
        clientId={clientId}
      />

      <HandleDamSelfReferenceInfos
        dev={dev}
        keys={{
          maximumTemperature: keys.maximumTemperature,
          minimumTemperature: keys.minimumTemperature,
          selfReference: keys.selfReference,
        }}
        onChangeMaximumTemperature={onChangeMaximumTemperature}
        onChangeMinimumTemperature={onChangeMinimumTemperature}
        dutReference={dutReference}
        clientId={clientId}
      />
    </div>
  );
};

export const TableHeader = memo(({ clientId }: { clientId?: number }): ReactElement => {
  const { t } = useTranslation();
  return (
    <div style={{ marginLeft: '10px', width: '100%' }}>
      <tbody style={{ width: '100%', display: 'table' }}>
        <tr style={{ width: '100%' }}>
          {clientId && (
            <>
              <th style={{ textAlign: 'left', width: '10%' }}>{t('estado')}</th>
              <th style={{ textAlign: 'left', width: '10%' }}>{t('cidade')}</th>
              <th style={{ textAlign: 'left', width: '10%' }}>{t('unidade')}</th>
            </>
          )}
          <th style={{ textAlign: 'left', width: clientId ? '12%' : '15%' }}>{t('dispositivo')}</th>
          <th style={{ textAlign: 'left', width: clientId ? '15%' : '35%' }}>{t('maquina')}</th>
          <th style={{ textAlign: 'center', width: clientId ? '21%' : '30%' }}>
            <div style={{ display: 'flex', flexDirection: 'row', marginLeft: clientId ? 22 : 0 }}>
              {t('ambienteMonitorado')}
              <IconWrapper data-tip data-for="information" style={{ marginLeft: '3px', marginTop: '-2px' }}>
                <InformationIcon />
                <ReactTooltip
                  id="information"
                  place="top"
                  effect="solid"
                  delayHide={100}
                  offset={{ top: 0, left: 10 }}
                  textColor="#000000"
                  border
                  backgroundColor="rgba(256, 256, 256, 0.97)"
                >
                  <Flex flexWrap="nowrap" flexDirection="column" alignItems="left">
                    <span
                      style={{
                        marginTop: '6px',
                        fontSize: '95%',
                        maxWidth: '262px',
                        textAlign: 'justify',
                      }}
                    >
                      {t('tooltipAmbienteMonitorado')}
                    </span>
                  </Flex>
                </ReactTooltip>
              </IconWrapper>
            </div>
          </th>
          <th style={{ textAlign: 'left', width: clientId ? '11%' : '10%' }}>{t('tMin')}</th>
          <th style={{ textAlign: 'left', width: clientId ? '11%' : '10%' }}>{t('tMax')}</th>
        </tr>
      </tbody>
    </div>
  );
});

export const DamTable = ({
  clientId, data, keys, dutsToReference, render, isLoading,
}: TableProps): ReactElement => {
  function toggleAllDevices(key: string, value: string): void {
    toggleAllDevicesFromKey(data, key, value);
    render();
  }

  function onClickDevCheck(id: string, index: number) {
    data[index].checked = !data[index].checked;
    render();
  }

  function onSelectDutReference(devId: string, dutId: string, index: number): void {
    if (devId === dutId) {
      data[index][keys.dutId] = null;
      data[index][keys.selfReference] = true;
    }
    else {
      data[index][keys.dutId] = dutId;
      data[index][keys.selfReference] = false;
    }
    render();
  }

  function onChangeMaximumTemperature(index: number, value: string): void {
    data[index][keys.maximumTemperature] = value;
    render();
  }

  function onChangeMinimumTemperature(index: number, value: string): void {
    data[index][keys.minimumTemperature] = value;
    render();
  }

  return (
    <>
      <TableHeader clientId={clientId} />
      {isLoading ? <Loader />
        : (
          <TableVirtuoso
            components={{
              Table: (props) => <Table {...props} />,
            }}
            data={data}
            itemContent={(index, dev): ReactElement => (
              <ItemTable
                key={dev[keys.id]}
                dev={dev}
                devsList={data}
                index={index}
                keys={keys}
                clientId={clientId}
                toggleAllDevices={toggleAllDevices}
                dutsListToReference={dutsToReference}
                onClickDevCheck={(id) => onClickDevCheck(id, index)}
                onSelectDutReference={(devId, dutId) => onSelectDutReference(devId, dutId, index)}
                onChangeMaximumTemperature={(value) => onChangeMaximumTemperature(index, value)}
                onChangeMinimumTemperature={(value) => onChangeMinimumTemperature(index, value)}
              />
            )}
            useWindowScroll
          />
        )}
    </>
  );
};

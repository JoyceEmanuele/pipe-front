import { memo, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { TableVirtuoso } from 'react-virtuoso';
import { DevList, DutList } from './types';
import { Flex } from 'reflexbox';
import { StyledLink, TableBasic } from '../styles';
import { Checkbox, Loader } from 'components';
import ReactTooltip from 'react-tooltip';
import { cutText } from 'helpers/formatText';
import { getCheckStatusKey, toggleAllDevicesFromKey } from './helpers/verifications';

interface DevKeys {
  cityName: string,
  unitName: string,
  stateName: string,
  id: string,
  name: string,
  unitId: string,
}

interface DutTableProps {
  data: DevList[],
  keys: DevKeys,
  isLoading: boolean,
  clientId?: number,
  render: () => void,
}

interface ItemTableProps {
  dev: DevList,
  data: DevList[],
  index: number,
  keys: DevKeys,
  clientId?: number,
  onClickDevCheck: () => void,
  toggleAllDevices: (key: string, value: string) => void,
}

interface FilterColumnProps {
  dev: DevList,
  index: number,
  devsList: DevList[],
  keyProp: string,
  toggleAllDevicesFromValue: (value: string) => void;
}

const FilterColumn = ({
  dev,
  devsList,
  index,
  keyProp,
  toggleAllDevicesFromValue,
}: FilterColumnProps): ReactElement => (
  <td
    style={{
      verticalAlign: 'top',
      borderBottom: !dev[keyProp] || (index < devsList.length - 1 && devsList[index + 1][keyProp] !== dev[keyProp]) || index === devsList.length - 1 ? '1px solid' : '0',
      borderTop: '0',
    }}
  >
    {dev[keyProp] && (index === 0 || index !== 0 && devsList[index - 1][keyProp] !== dev[keyProp]) && (
    <Checkbox
      label={dev[keyProp]}
      size={20}
      checked={getCheckStatusKey(devsList, keyProp, dev[keyProp])}
      onClick={() => toggleAllDevicesFromValue(dev[keyProp])}
      alignLeft
    />
    )}
  </td>
);

const ItemTable = ({
  dev,
  data,
  index,
  clientId,
  keys: {
    cityName, id, name, stateName, unitName,
  },
  onClickDevCheck,
  toggleAllDevices,
}: ItemTableProps): ReactElement => (
  <>
    {clientId
        && (
          <>
            <FilterColumn
              dev={dev}
              devsList={data}
              index={index}
              keyProp={stateName}
              toggleAllDevicesFromValue={
              (value) => toggleAllDevices(stateName, value)
            }
            />
            <FilterColumn
              dev={dev}
              devsList={data}
              index={index}
              keyProp={cityName}
              toggleAllDevicesFromValue={
              (value) => toggleAllDevices(cityName, value)
            }
            />
            <FilterColumn
              dev={dev}
              devsList={data}
              index={index}
              keyProp={unitName}
              toggleAllDevicesFromValue={
              (value) => toggleAllDevices(unitName, value)
            }
            />
          </>
        )}
    <td data-tip data-for={dev[id]}>
      <Checkbox
        label={cutText(dev[name], 55)}
        checked={dev.checked}
        onClick={onClickDevCheck}
        alignLeft
        link={`/analise/ambiente/${dev[id]}/informacoes`}
      />
      {dev[name]?.length >= 55 && (
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
            {dev[name]}
          </span>
        </Flex>
      </ReactTooltip>
      )}
    </td>
    <td>
      <StyledLink to={`/analise/dispositivo/${dev[id]}/informacoes`}>
        {dev[id]}
      </StyledLink>
    </td>
  </>
);

const TableHeader = memo(({ clientId }: { clientId?: number}): ReactElement => {
  const { t } = useTranslation();

  return (
    <tr>
      {clientId && (
      <>
        <th style={{ width: '15%' }}>{t('estado')}</th>
        <th style={{ width: '15%' }}>{t('cidade')}</th>
        <th style={{ width: '30%' }}>{t('unidade')}</th>
      </>
      )}
      <th style={{ width: clientId ? '30%' : undefined }}>{t('nomeAmbiente')}</th>
      <th style={{ width: clientId ? '15%' : undefined }}>DUT</th>
    </tr>
  );
});

export const DutTable = ({
  data, clientId, keys, render, isLoading,
}: DutTableProps): ReactElement => {
  function toggleAllDevices(key: string, value: string): void {
    toggleAllDevicesFromKey(data, key, value);
    render();
  }

  function onClickDevCheck(index: number) {
    data[index].checked = !data[index].checked;
    render();
  }

  if (isLoading) {
    return (
      <>
        <TableHeader />
        <Loader />
      </>
    );
  }

  return (
    <div>
      <TableVirtuoso
        components={{
          Table: ({ style, ...props }) => (
            <TableBasic
              {...props}
              style={{
                ...style,
                width: '100%',
              }}
            />
          ),
        }}
        fixedHeaderContent={() => (
          <TableHeader clientId={clientId} />
        )}
        data={data}
        itemContent={(index, dev): ReactElement => (
          <ItemTable
            dev={dev}
            data={data}
            index={index}
            keys={keys}
            key={(dev as DutList).DEV_ID}
            clientId={clientId}
            onClickDevCheck={() => onClickDevCheck(index)}
            toggleAllDevices={toggleAllDevices}
          />
        )}
        useWindowScroll
      />
    </div>
  );
};

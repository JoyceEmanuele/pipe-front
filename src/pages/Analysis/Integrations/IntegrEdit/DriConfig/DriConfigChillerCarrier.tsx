import { ReactElement } from 'react';
import { DriConfigState } from '../types';
import { Flex } from 'reflexbox';
import { Label, SearchInput } from '../../../styles';
import SelectSearch, { fuzzySearch } from 'react-select-search';
import { useTranslation } from 'react-i18next';
import { ClearSelect } from '~/components';
import { Select } from '~/components/NewSelect';
import { SelectSearchStyled } from '../styles';

interface DriConfigChillerCarrierProps {
  state: DriConfigState;
  render: () => void;
  updateAssets: () => Promise<void>;
  setVariablesChiller: (name: string) => void;
}

export function DriConfigChillerCarrier({
  state,
  render,
  updateAssets,
  setVariablesChiller,
}: DriConfigChillerCarrierProps): ReactElement | null {
  const { t } = useTranslation();

  if (state.driApplication !== 'Chiller Carrier') {
    return null;
  }

  return (
    <Flex flexDirection="row" style={{ gap: 14 }} flexWrap="wrap">
      <Flex flexDirection="column">
        <SearchInput
          style={{
            width: '200px',
            height: '50px',
            margin: 0,
            marginBottom: 10,
            border: '1px solid #818181',
          }}
        >
          <SelectSearchStyled style={{ width: '100%', paddingTop: 3, paddingBottom: 3 }}>
            <Label>{t('maquina')}</Label>
            <SelectSearch
              options={state.comboOpts.groups.map((item) => ({
                value: item.value,
                name: item.label,
                unit: item.unit,
              }))}
              value={state.formData.GROUP_ID_item?.value.toString()}
              placeholder={t('conjunto')}
              search
              filterOptions={fuzzySearch}
              onChange={(value, name) => {
                // @ts-ignore
                state.formData.GROUP_ID_item = name;
                render();
                updateAssets();
              }}
              disabled={!state.formData.UNIT_ID_item?.UNIT_ID}
            />
          </SelectSearchStyled>
        </SearchInput>
        {state.formData.GROUP_ID_item?.value && (
          <div style={{ maxWidth: '200px', textOverflow: 'ellipsis' }}>
            <ClearSelect
              onClickClear={() => {
                state.formData.GROUP_ID_item = null;
                state.formData.ASSET_ID_item = null;
                render();
              }}
              value={state.formData.GROUP_ID_item.name || state.formData.GROUP_ID_item.label}
            />
          </div>
        )}
      </Flex>
      <Flex flexDirection="column">
        <SearchInput
          style={{
            width: '200px',
            height: '50px',
            margin: 0,
            marginBottom: 10,
            border: '1px solid #818181',
          }}
        >
          <div style={{ width: '100%', paddingTop: 3, paddingBottom: 3 }}>
            <Label>{t('ativo')}</Label>
            <SelectSearch
              options={state.comboOpts.assets}
              value={state.formData.ASSET_ID_item?.value.toString()}
              placeholder={t('ativo')}
              search
              filterOptions={fuzzySearch}
              onChange={(value, name) => {
                // @ts-ignore
                state.formData.ASSET_ID_item = name;
                render();
              }}
              disabled={!state.formData.GROUP_ID_item?.value}
            />
          </div>
        </SearchInput>
        {state.formData.ASSET_ID_item?.value && (
          <div style={{ marginBottom: '20px' }}>
            <ClearSelect
              onClickClear={() => {
                state.formData.ASSET_ID_item = null;
                render();
              }}
              value={state.formData.ASSET_ID_item?.label}
            />
          </div>
        )}
      </Flex>
      <Select
        style={{ width: '200px' }}
        label={t('linha')}
        placeholder={t('selecionar')}
        options={state.comboOpts.chillerLines}
        propLabel="name"
        value={state.driChillerCarrierLine}
        onSelect={(item) => {
          state.driChillerCarrierLine = item;
          setVariablesChiller(item.name);
          state.driChillerCarrierModel = null;
          render();
        }}
      />
      <Select
        style={{ width: '200px' }}
        label={t('modelo')}
        placeholder={t('selecionar')}
        options={state.comboOpts.chillerModels.filter((item) => {
          if (state.driChillerCarrierLine?.name) {
            return item.name.startsWith(state.driChillerCarrierLine?.name);
          }
          return true;
        })}
        propLabel="name"
        value={state.driChillerCarrierModel}
        disabled={!state.driChillerCarrierLine}
        onSelect={(item) => {
          state.driChillerCarrierModel = item;
          render();
        }}
      />
    </Flex>
  );
}

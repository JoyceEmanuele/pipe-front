import {
  IconWrapper,
} from './styles';
import { Button, FormAsset } from 'components';
import {
  useState,
  useEffect,
} from 'react';
import { useStateVar } from 'helpers/useStateVar';
import { Flex } from 'reflexbox';
import {
  BoxIcon,
} from '../../icons';

interface ComponentProps {
    comboOpts: {
      fluids: { value: number, name: string, id: string, }[],
      types: { value: number, name: string, id: string, }[],
      brands: { value: number, name: string, id: string, }[],
      roles: { value: number, name: string }[],
    },
    assets: {
      index: number,
      name: string|null,
      installationLocation: string | null,
      datId: string|null,
      devId: string|null,
      roleId: number|null,
      role: string|null,
      type: string|null,
      brandName: string|null,
      model: string|null,
      refrigerationCapacity: string|null,
      ratedPower: string|null,
      refrigerationFluid: string|null,
      capacityMeasurementUnit: string|null,
      devClientAssetId: number|null,
      datIndex: number|null,
      devIdPersisted: string|null,
      assetId: number|null,
    }[],
    dacsList?: {
      DAC_ID: string
      GROUP_ID: number
      automationEnabled: boolean
    }[],
    isEdit: boolean,
    onHandleChange
    onHandleDeleteAsset
}

type Asset = {
  index: number,
  name: string|null,
  installationLocation: string | null,
  datId: string|null,
  devId: string|null,
  roleId: number|null,
  role: string|null,
  type: string|null,
  brandName: string|null,
  model: string|null,
  refrigerationCapacity: string|null,
  ratedPower: string|null,
  refrigerationFluid: string|null,
  capacityMeasurementUnit: string|null,
  devClientAssetId: number|null,
  datIndex: number|null,
  devIdPersisted: string|null,
  assetId: number|null,
};

export const FormAssetsList = (props: ComponentProps): JSX.Element => {
  const [state, render] = useStateVar({
    selectedTemplate: '' as string,
    isLoading: false as boolean,
    distributors: [] as { value: number, name: string }[],
    assetList: [0] as number[],
    pressedNewAsset: false as boolean,
  });

  let [formData] = useState([{
    index: 0 as number,
    name: null as string|null,
    installationLocation: null as string | null,
    datId: null as string|null,
    devId: null as string|null,
    roleId: null as number|null,
    role: null as string|null,
    type: null as string|null,
    brandName: null as string|null,
    model: null as string|null,
    refrigerationCapacity: null as string|null,
    ratedPower: null as string|null,
    refrigerationFluid: null as string|null,
    capacityMeasurementUnit: 'TR' as string|null,
    devClientAssetId: null as number|null,
    datIndex: null as number|null,
    devIdPersisted: null as string|null,
    assetId: null as number|null,
  }]);

  useEffect(() => {
    if (props.isEdit && (props.assets.length > 0)) {
      formData = props.assets;
    }
  }, []);

  function addAsset() {
    state.pressedNewAsset = true;
    formData.push({
      index: formData[formData.length - 1].index + 1,
      name: null as string|null,
      installationLocation: null as string | null,
      datId: null as string|null,
      devId: null as string|null,
      roleId: null as number|null,
      role: null as string|null,
      type: null as string|null,
      brandName: null as string|null,
      model: null as string|null,
      refrigerationCapacity: null as string|null,
      ratedPower: null as string|null,
      refrigerationFluid: null as string|null,
      capacityMeasurementUnit: 'TR' as string|null,
      devClientAssetId: null,
      datIndex: null,
      devIdPersisted: null,
      assetId: null as number|null,
    });
    render();
  }

  function deleteAsset(index: number) {
    props.onHandleDeleteAsset(index);
    props.onHandleChange(formData);
    render();
  }

  function handleChangeAsset(asset: Asset) {
    formData[formData.findIndex((item) => item.index === asset.index)] = asset;
    props.onHandleChange(formData);
  }

  fetchAssets();

  function fetchAssets() {
    state.isLoading = true;
    if (props.assets.length > 0) {
      formData = props.assets;
    }
    else if (props.isEdit && props.dacsList && props.dacsList.length > 0) {
      const assetsAux = [] as Asset[];
      let index = 0;
      for (const dac of props.dacsList) {
        assetsAux.push({
          index,
          name: null as string|null,
          installationLocation: null as string | null,
          datId: null as string|null,
          devId: dac.DAC_ID as string|null,
          roleId: null as number|null,
          role: null as string|null,
          type: null as string|null,
          brandName: null as string|null,
          model: null as string|null,
          refrigerationCapacity: null as string|null,
          ratedPower: null as string|null,
          refrigerationFluid: null as string|null,
          capacityMeasurementUnit: 'TR' as string|null,
          devClientAssetId: null,
          datIndex: null,
          devIdPersisted: null,
          assetId: null as number|null,
        });
        index++;
      }
      formData = assetsAux;
    }
    state.isLoading = false;
  }

  return (
    <Flex flexWrap="wrap" flexDirection="column" justifyContent="space-between">
      <Flex flexWrap="nowrap" flexDirection="row" justifyContent="space-between">
        <Flex flexWrap="nowrap" flexDirection="row" justifyContent="left">
          <IconWrapper>
            <BoxIcon />
          </IconWrapper>
          <strong style={{ fontSize: '14px' }}>
            Ativos
          </strong>
        </Flex>
        <Flex flexWrap="nowrap" flexDirection="row" justifyContent="left" ml="292px">
          <strong style={{ fontSize: '12px' }}>
            Total Adicionado:
          </strong>
          <div style={{ fontSize: '12px' }}>
            {` ${formData.length}`}
          </div>
        </Flex>
      </Flex>
      <Flex
        flexWrap="nowrap"
        flexDirection="column"
        mt="17px"
        height="540px"
        width="516px"
        style={{
          border: '1px solid #C5C5C5',
        }}
      >
        <Flex
          mt="20px"
          ml="18px"
          width="480px"
          height="500px"
          flexDirection={state.pressedNewAsset ? 'column-reverse' : 'column'}
          style={{
            overflowY: 'scroll',
            overflowX: 'hidden',
            borderRight: '1px solid #C5C5C5',
            borderTop: '1px solid #C5C5C5',
            borderBottom: '1px solid #C5C5C5',
            borderRadius: '5px',
          }}
        >
          <Flex
            flexWrap="nowrap"
            flexDirection="column"
          >
            {formData.map((asset, index) => <FormAsset asset={asset} key={asset.index} comboOpts={props.comboOpts} assetNumber={index + 1} onHandleChange={handleChangeAsset} onHandleDeleteAsset={deleteAsset} />)}
          </Flex>

        </Flex>

        <Flex flexWrap="nowrap" flexDirection="row" justifyContent="left" ml="18px" mt="18px">
          {/* eslint-disable-next-line react/jsx-no-bind */}
          <Button style={{ width: '479px', height: '42px' }} variant="blue-white" onClick={(e) => { e.preventDefault(); addAsset(); }} data-test-id="buttonAddAsset">
            ADICIONAR NOVO ATIVO
          </Button>
          {/* @ts-ignore */}
        </Flex>
      </Flex>
    </Flex>
  );
};

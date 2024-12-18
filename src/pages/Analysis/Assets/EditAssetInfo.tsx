import {
  useEffect,
} from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import {
  Select, Button, Loader, FormAsset,
} from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { apiCall, ApiResps } from 'providers';
import { colors } from 'styles/colors';
import { AssetLayout } from './AssetLayout';
import { useTranslation } from 'react-i18next';
import { withTransaction } from '@elastic/apm-rum-react';

type Asset = {
  index: number,
  name: string,
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

export const EditAssetInfo = (): JSX.Element => {
  const { t } = useTranslation();
  const routeParams = useParams<{ devId: string, indexId: string }>();
  const [state, render, setState] = useStateVar(() => ({
    devId: routeParams.devId,
    indexId: routeParams.indexId != null ? Number(routeParams.indexId) : undefined,
    isLoading: true,
    devInfo: null as null|(ApiResps['/clients/get-asset-info']['info']),
    formData: {
      CLIENT_ID_item: null as null|{ NAME: string, CLIENT_ID: number },
      UNIT_ID_item: null as null|{ UNIT_NAME: string, UNIT_ID: number },
      GROUP_ID_item: null as null|{ label: string, value: number, unit: number },
      MCHN_APPL_item: null as null|{ label: string, value: string },
      FLUID_TYPE_item: null as null|{ label: string, value: string },
      AST_TYPE_item: null as null|{ label: string, value: string, tags: string },
      MCHN_ENV_item: null as null|{ label: string, value: string, tags: string },
      MCHN_BRAND_item: null as null|{ label: string, value: string },
      CAPACITY_UNIT_item: null as null|{ value: string },
      MCHN_MODEL: '',
      AST_DESC: '',
      CAPACITY_PWR: '',
      MCHN_KW: '',
      GROUP_ID: null as number|null,
      UNIT_ID: null as number|null,
      CLIENT_ID: null as number|null,

      asset: {
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
        capacityMeasurementUnit: null as string|null,
        devClientAssetId: null as number|null,
        datIndex: null as number|null,
        devIdPersisted: null as string|null,
        assetId: null as number|null,
      },
    },
    comboOpts: {
      yesNo: [
        {
          label: 'Sim', value: '1', valueN: 1, valueNinv: 0,
        },
        {
          label: 'Não', value: '0', valueN: 0, valueNinv: 1,
        },
      ] as { label: string, value: string, valueN: 0|1, valueNinv: 0|1 }[],
      capacUnits: [
        { label: 'TR', value: 'TR' },
        { label: 'BTU/hr', value: 'BTU/hr' },
        { label: 'kW', value: 'kW' },
        { label: 'HP', value: 'HP' },
      ],
      clients: [] as { NAME: string, CLIENT_ID: number }[],
      states: [] as { STATE_NAME: string, STATE_ID: string }[],
      cities: [] as { CITY_NAME: string, CITY_ID: string, STATE_ID: string }[],
      units: [] as { UNIT_NAME: string, UNIT_ID: number }[],
      groups: [] as { label: string, value: number, unit: number }[],
      envs: [] as { label: string, value: string }[],
      fluids: [] as { value: number, name: string, id: string, }[],
      types: [] as { value: number, name: string, id: string, }[],
      brands: [] as { value: number, name: string, id: string, }[],
      roles: [] as { value: number, name: string }[],
    },
    filtComboOpts: {
      groups: [] as { label: string, value: number, unit: number }[],
      envs: [] as { label: string, value: string }[],
      fluids: [] as { value: number, name: string, id: string, }[],
      types: [] as { value: number, name: string, id: string, }[],
      brands: [] as { value: number, name: string, id: string, }[],
      roles: [] as { value: number, name: string }[],
    },
    openModal: null as null|string,
  }));

  const { formData } = state;
  const { comboOpts } = state;

  async function getData() {
    try {
      const { info: devInfoData } = await apiCall('/clients/get-asset-info', { ASSET_ID: state.devId, DAT_ID: state.devId, DAT_INDEX: state.indexId });
      state.devInfo = devInfoData;

      await apiCall('/dev/dev-info-combo-options', {
        CLIENT_ID: formData.CLIENT_ID_item?.CLIENT_ID,
        fluids: true,
        types: true,
        brands: true,
        roles: true,
        applics: true,
      }).then(({
        types,
        brands,
        fluids,
        roles,
      }) => {
        state.comboOpts.brands = [];
        state.comboOpts.fluids = [];
        state.comboOpts.roles = [];
        state.comboOpts.types = [];
        types?.forEach((type, index) => { state.comboOpts.types.push({ value: index + 1, name: type.label, id: type.value }); });
        brands?.forEach((brand, index) => state.comboOpts.brands.push({ value: index + 1, name: brand.label, id: brand.value }));
        fluids?.forEach((fluid, index) => state.comboOpts.fluids.push({ value: index + 1, name: fluid.label, id: fluid.value }));
        roles?.forEach((role) => state.comboOpts.roles.push({ value: Number(role.value), name: role.label }));
      });

      formData.CLIENT_ID = devInfoData.CLIENT_ID || null;
      formData.UNIT_ID = devInfoData.UNIT_ID || null;
      formData.GROUP_ID = devInfoData.GROUP_ID || null;
      formData.asset.name = devInfoData.AST_DESC || '';
      formData.asset.installationLocation = devInfoData.INSTALLATION_LOCATION || '';
      formData.asset.datId = devInfoData.DAT_ID || '';
      formData.asset.devId = devInfoData.DEV_ID || '';
      formData.asset.roleId = devInfoData.AST_ROLE || null;
      formData.asset.role = devInfoData.AST_ROLE_NAME || '';
      formData.asset.type = devInfoData.AST_TYPE || '';
      formData.asset.brandName = devInfoData.MCHN_BRAND || '';
      formData.asset.model = devInfoData.MCHN_MODEL || '';
      formData.asset.refrigerationCapacity = devInfoData.CAPACITY_PWR?.toString() || '';
      formData.asset.ratedPower = devInfoData.MCHN_KW?.toString() || '';
      formData.asset.refrigerationFluid = devInfoData.FLUID_TYPE || '';
      formData.asset.capacityMeasurementUnit = devInfoData.CAPACITY_UNIT || '';
      formData.asset.devClientAssetId = devInfoData.DEV_CLIENT_ASSET_ID || null;
      formData.asset.datIndex = devInfoData.DAT_INDEX || null;
      formData.asset.devIdPersisted = devInfoData.DEV_ID || '';
      formData.asset.assetId = devInfoData.ASSET_ID;
    } catch (err) {
      console.log(err);
      alert(t('erro'));
    }
    setState({ isLoading: false });
    render();
  }
  useEffect(() => {
    getData();
  }, []);

  async function saveDevInfo() {
    try {
      if (!formData.asset.name) {
        alert(t('alertaNecessarioInformarNomeAtivos'));
        render();
        return;
      }

      const devIdChanged = formData.asset.devIdPersisted != null && formData.asset.devIdPersisted !== formData.asset.devId;
      if (devIdChanged) {
        // is new devId, so 'set-dac-info' old and new
        if (formData.asset.devIdPersisted?.startsWith('DAC')) {
          await apiCall('/dac/set-dac-info', { DAC_ID: formData.asset.devIdPersisted!, GROUP_ID: null });
        }
      }

      await apiCall('/clients/edit-asset', {
        ASSET_ID: formData.asset.assetId,
        DAT_ID: formData.asset.datId as string,
        AST_DESC: formData.asset.name,
        AST_TYPE: formData.asset.type,
        CAPACITY_PWR: formData.asset.refrigerationCapacity != null ? Number(formData.asset.refrigerationCapacity) : null,
        CAPACITY_UNIT: formData.asset.capacityMeasurementUnit,
        CLIENT_ID: formData.CLIENT_ID,
        FLUID_TYPE: formData.asset.refrigerationFluid,
        GROUP_ID: formData.GROUP_ID,
        MCHN_BRAND: formData.asset.brandName,
        MCHN_MODEL: formData.asset.model,
        UNIT_ID: formData.UNIT_ID,
        AST_ROLE: formData.asset.roleId,
        DEV_ID: formData.asset.devId,
        DAT_COUNT: formData.asset.index,
        OLD_DEV_ID: formData.asset.devIdPersisted,
        DEV_CLIENT_ASSET_ID: formData.asset.devClientAssetId,
        DAT_INDEX: formData.asset.datIndex,
        MCHN_KW: formData.asset.ratedPower != null ? Number(formData.asset.ratedPower) : null,
        INSTALLATION_LOCATION: formData.asset.installationLocation,
        UPDATE_MACHINE_RATED_POWER: true,
      });

      if (devIdChanged && formData.asset.devId && formData.asset.devId.includes('DAC')) {
        await apiCall('/dac/set-dac-info', { DAC_ID: formData.asset.devId, GROUP_ID: formData.GROUP_ID });
      }

      getData().catch(console.log);
      toast.success(t('sucessoSalvar'));
    } catch (err) {
      console.log(err);
      toast.error(t('erro'));
    }
  }

  async function fetchGroupsAndUnits(CLIENT_ID) {
    comboOpts.units = [];
    comboOpts.groups = [];
    if (!CLIENT_ID) return;

    const reqCombos = { CLIENT_ID, units: true, groups: true };

    const [
      combos,
    ] = await Promise.all([
      apiCall('/dev/dev-info-combo-options', reqCombos),
    ]);

    let units;
    if (combos.units) {
      units = combos.units.map((unit) => ({ UNIT_ID: unit.value, UNIT_NAME: unit.label }));
    }

    Object.assign(comboOpts, combos, { units });
  }

  function handleChangeAssets(assetsForm: Asset) {
    formData.asset = assetsForm;
  }

  function handleDeleteAsset(_assetIndex: number) {
    // do nothing
  }
  const { devInfo } = state;

  return (
    <>
      <Helmet>
        <title>{t('tituloPagDielEnergiaEditar')}</title>
      </Helmet>
      <AssetLayout devInfo={devInfo} />
      {state.isLoading && (
        <div style={{ marginTop: '50px' }}>
          <Loader variant="primary" />
        </div>
      )}
      {(!state.isLoading) && devInfo && (
        <>
          <Card>
            <Title>{t('botaoEditar')}</Title>
            <br />
            <br />
            <div>
              <FormAsset asset={formData.asset} key={formData.asset.index} comboOpts={state.comboOpts} assetNumber={1} onHandleChange={handleChangeAssets} onHandleDeleteAsset={handleDeleteAsset} />
            </div>
            <div>
              <Button style={{ maxWidth: '100px' }} onClick={saveDevInfo} variant="primary">
                {t('botaoSalvar')}
              </Button>
            </div>
          </Card>
        </>
      )}
    </>
  );
};

const Text = styled.span`
  margin-left: 7px;
`;
const TextLine = styled.div`
  display: flex;
  align-items: center;
  color: #5d5d5d;
`;
const Title = styled.h1`
  font-size: 1.5em;
  color: ${colors.Grey400};
`;
const CustomSelect = styled(Select)`
  margin-bottom: 20px;
`;
const ContainerInfo = styled.div`
  display: flex;
  padding: 25px 0 0 0;
  height: auto;
`;
const ContainerText = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 30px;
`;
const Card = styled.div`
  padding: 32px;
  margin-top: 24px;
  border-radius: 16px;
  box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.24), 0px 3px 12px rgba(0, 0, 0, 0.12);
`;

export default withTransaction('EditAssetInfo', 'component')(EditAssetInfo);

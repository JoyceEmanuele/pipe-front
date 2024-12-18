import SelectSearch, { fuzzySearch } from 'react-select-search';
import {
  CustomInput,
  Label,
} from './styles';
import { colors } from '../../styles/colors';
import { Input } from 'components';
import {
  useState,
  useEffect,
} from 'react';
import { apiCall } from 'providers';
import { useStateVar } from 'helpers/useStateVar';
import { Flex } from 'reflexbox';
import { t } from 'i18next';

interface ComponentProps {
    UNIT_ID?: number,
    BASELINE_ID?: number,
    CLIENT_ID: number,
    onHandlePrice,
    onHandleKwh,
    onHandleBaselineId,
    onHandleBaselineTemplate,
    onHandleIsBaselineEdit,
    onHandleIsBaselineValuesEdit
}

export const FormEditBaselines = (props: ComponentProps): JSX.Element => {
  const [baselineTemplates, setBaselineTemplates] = useState<{value: number, name: string, tag: string}[]>([]);
  const [state, render] = useStateVar({
    selectedTemplate: '' as string,
    isLoading: false as boolean,
  });
  const [formData] = useState({
    baselineTemplate: null as null|{value: number, name: string},
    januaryPrice: null as null|number|string,
    januaryKwh: null as null|number|string,
    febuaryPrice: null as null|number|string,
    febuaryKwh: null as null|number|string,
    marchPrice: null as null|number|string,
    marchKwh: null as null|number|string,
    aprilPrice: null as null|number|string,
    aprilKwh: null as null|number|string,
    mayPrice: null as null|number|string,
    mayKwh: null as null|number|string,
    junePrice: null as null|number|string,
    juneKwh: null as null|number|string,
    jullyPrice: null as null|number|string,
    jullyKwh: null as null|number|string,
    augustPrice: null as null|number|string,
    augustKwh: null as null|number|string,
    septemberPrice: null as null|number|string,
    septemberKwh: null as null|number|string,
    octoberPrice: null as null|number|string,
    octoberKwh: null as null|number|string,
    novemberPrice: null as null|number|string,
    novemberKwh: null as null|number|string,
    decemberPrice: null as null|number|string,
    decemberKwh: null as null|number|string,
  });

  useEffect(() => {
    getBaselineTemplates();
  }, []);

  async function getBaselineTemplates() {
    const response = await apiCall('/clients/get-baseline-templates', {});
    await setBaselineTemplates(response.baselineTemplates);
    getBaselineInfo(response.baselineTemplates);
  }

  async function getBaselineInfo(baselineTemplatesAux: {
    value: number,
    name: string,
    tag: string,
  }[]) {
    if (props.UNIT_ID) {
      const response = await apiCall('/clients/get-baseline-info', { UNIT_ID: props.UNIT_ID });

      if (response) {
        state.selectedTemplate = response.BASELINE_TEMPLATE_ID.toString();
        const baselineTemplateAux = baselineTemplatesAux.find((template) => template.value === response.BASELINE_TEMPLATE_ID);
        props.onHandleIsBaselineEdit(true);
        props.onHandleBaselineId(response.BASELINE_ID);
        props.onHandleBaselineTemplate({ ...baselineTemplateAux });

        if (response.BASELINE_TEMPLATE_TAG === 'manual') {
          props.onHandleIsBaselineValuesEdit(true);
          const baselineValues = await apiCall('/clients/get-baseline-values', { CLIENT_ID: props.CLIENT_ID, UNIT_ID: props.UNIT_ID, BASELINE_ID: response.BASELINE_ID });

          let baselineAux;
          if (baselineValues) {
            baselineAux = baselineValues.find((aux) => aux.BASELINE_MONTH === 1);
            formData.januaryPrice = baselineAux?.BASELINE_PRICE;
            formData.januaryKwh = baselineAux?.BASELINE_KWH;
            baselineAux = baselineValues.find((aux) => aux.BASELINE_MONTH === 2);
            formData.febuaryPrice = baselineAux?.BASELINE_PRICE;
            formData.febuaryKwh = baselineAux?.BASELINE_KWH;
            baselineAux = baselineValues.find((aux) => aux.BASELINE_MONTH === 3);
            formData.marchPrice = baselineAux?.BASELINE_PRICE;
            formData.marchKwh = baselineAux?.BASELINE_KWH;
            baselineAux = baselineValues.find((aux) => aux.BASELINE_MONTH === 4);
            formData.aprilPrice = baselineAux?.BASELINE_PRICE;
            formData.aprilKwh = baselineAux?.BASELINE_KWH;
            baselineAux = baselineValues.find((aux) => aux.BASELINE_MONTH === 5);
            formData.mayPrice = baselineAux?.BASELINE_PRICE;
            formData.mayKwh = baselineAux?.BASELINE_KWH;
            baselineAux = baselineValues.find((aux) => aux.BASELINE_MONTH === 6);
            formData.junePrice = baselineAux?.BASELINE_PRICE;
            formData.juneKwh = baselineAux?.BASELINE_KWH;
            baselineAux = baselineValues.find((aux) => aux.BASELINE_MONTH === 7);
            formData.jullyPrice = baselineAux?.BASELINE_PRICE;
            formData.jullyKwh = baselineAux?.BASELINE_KWH;
            baselineAux = baselineValues.find((aux) => aux.BASELINE_MONTH === 8);
            formData.augustPrice = baselineAux?.BASELINE_PRICE;
            formData.augustKwh = baselineAux?.BASELINE_KWH;
            baselineAux = baselineValues.find((aux) => aux.BASELINE_MONTH === 9);
            formData.septemberPrice = baselineAux?.BASELINE_PRICE;
            formData.septemberKwh = baselineAux?.BASELINE_KWH;
            baselineAux = baselineValues.find((aux) => aux.BASELINE_MONTH === 10);
            formData.octoberPrice = baselineAux?.BASELINE_PRICE;
            formData.octoberKwh = baselineAux?.BASELINE_KWH;
            baselineAux = baselineValues.find((aux) => aux.BASELINE_MONTH === 11);
            formData.novemberPrice = baselineAux?.BASELINE_PRICE;
            formData.novemberKwh = baselineAux?.BASELINE_KWH;
            baselineAux = baselineValues.find((aux) => aux.BASELINE_MONTH === 12);
            formData.decemberPrice = baselineAux?.BASELINE_PRICE;
            formData.decemberKwh = baselineAux?.BASELINE_KWH;
            render();
          }
        }
      }
    }
  }

  function onFilterDistributorChange(baselineTemplate) {
    state.selectedTemplate = baselineTemplate;
    const baselineTemplateAux = baselineTemplates.find((template) => template.value === baselineTemplate);
    props.onHandleBaselineTemplate({ ...baselineTemplateAux });
    render();
  }

  function maskInput(value: string, isPrice: boolean) {
    value = value ? value.replace('.', '').replace(',', '').replace(/\D/g, '') : value;

    const options = { minimumFractionDigits: 2 };
    const result = new Intl.NumberFormat('pt-BR', options).format(
      parseFloat(value) / 100,
    );

    return isPrice ? `R$  ${result}` : `${result} kWh`;
  }

  function initialMaskInput(value: string, isPrice: boolean) {
    if (value.includes('R$') || value.includes('kWh')) {
      return value;
    }

    value = value.replace('.', '').replace(',', '').replace(/\D/g, '');

    const options = { minimumFractionDigits: 2 };
    const result = new Intl.NumberFormat('pt-BR', options).format(
      parseFloat(value),
    );

    return isPrice ? `R$  ${result}` : `${result} kWh`;
  }

  return (
    <>
      <Flex flexWrap="wrap" flexDirection="column" margin="40px">
        <Flex flexWrap="wrap" flexDirection="row" justifyContent="flex-end" alignItems="center">
          <Flex flexWrap="wrap" justifyContent="right" alignItems="right" mr={-90}>
            <CustomInput>
              <div style={{ width: '100%', paddingTop: 3 }}>
                <Label>Template de Baseline</Label>
                <SelectSearch
                  options={baselineTemplates}
                  value={state.selectedTemplate || formData.baselineTemplate?.value.toString() || ''}
                  printOptions="on-focus"
                  search
                  filterOptions={fuzzySearch}
                  placeholder={t('selecionarTemplate')}
                  // eslint-disable-next-line react/jsx-no-bind
                  onChange={onFilterDistributorChange}
                  // onBlur={onFilterUnitBlur}
                  disabled={false}
                  closeOnSelect={false}
                />
              </div>
            </CustomInput>
          </Flex>
        </Flex>
        <Flex flexWrap="wrap" flexDirection="row" justifyContent="space-between" alignItems="left" mt={10}>
          <Flex flexWrap="wrap" justifyContent="left" alignItems="left">
            <div style={{ color: colors.Blue700, fontWeight: 'bold' }}>{t('mesesDoAno.janeiro')}</div>
          </Flex>
          <Flex flexWrap="wrap" justifyContent="left" alignItems="left" ml={-10}>
            <div style={{ color: colors.Blue700, fontWeight: 'bold' }}>{t('mesesDoAno.fevereiro')}</div>
          </Flex>
          <Flex flexWrap="wrap" justifyContent="left" alignItems="left" ml={-15}>
            <div style={{ color: colors.Blue700, fontWeight: 'bold' }}>{t('mesesDoAno.marco')}</div>
          </Flex>
          <Flex flexWrap="wrap" justifyContent="left" alignItems="left" ml={-2}>
            <div style={{ color: colors.Blue700, fontWeight: 'bold' }}>{t('mesesDoAno.abril')}</div>
          </Flex>
          <Flex flexWrap="wrap" justifyContent="left" alignItems="left">
            <div style={{ color: colors.Blue700, fontWeight: 'bold' }}>{t('mesesDoAno.maio')}</div>
          </Flex>
          <Flex flexWrap="wrap" justifyContent="left" alignItems="left" mr={-30}>
            <div style={{ color: colors.Blue700, fontWeight: 'bold' }}>{t('mesesDoAno.junho')}</div>
          </Flex>
        </Flex>
        <Flex flexWrap="wrap" flexDirection="row" justifyContent="space-between" alignItems="center" mt={10}>
          <Flex flexWrap="wrap" justifyContent="left" alignItems="left">
            <div style={{ width: '100px' }}>
              <Input
                type="text"
                value={formData.januaryPrice ? initialMaskInput(formData.januaryPrice.toString(), true) : ''}
                placeholder="R$"
                onChange={(event) => { formData.januaryPrice = maskInput(event.target.value, true); props.onHandlePrice(1, formData.januaryPrice); props.onHandleKwh(1, formData.januaryKwh); render(); }}
              />
            </div>
          </Flex>
          <Flex flexWrap="wrap" justifyContent="left" alignItems="left">
            <div style={{ width: '100px' }}>
              <Input
                type="text"
                value={formData.febuaryPrice ? initialMaskInput(formData.febuaryPrice.toString(), true) : ''}
                placeholder="R$"
                onChange={(event) => { formData.febuaryPrice = maskInput(event.target.value, true); props.onHandlePrice(2, formData.febuaryPrice); props.onHandleKwh(2, formData.febuaryKwh); render(); }}
              />
            </div>
          </Flex>
          <Flex flexWrap="wrap" justifyContent="left" alignItems="left">
            <div style={{ width: '100px' }}>
              <Input
                type="text"
                value={formData.marchPrice ? initialMaskInput(formData.marchPrice.toString(), true) : ''}
                placeholder="R$"
                onChange={(event) => { formData.marchPrice = maskInput(event.target.value, true); props.onHandlePrice(3, formData.marchPrice); props.onHandleKwh(3, formData.marchKwh); render(); }}
              />
            </div>
          </Flex>
          <Flex flexWrap="wrap" justifyContent="left" alignItems="left">
            <div style={{ width: '100px' }}>
              <Input
                type="text"
                value={formData.aprilPrice ? initialMaskInput(formData.aprilPrice.toString(), true) : ''}
                placeholder="R$"
                onChange={(event) => { formData.aprilPrice = maskInput(event.target.value, true); props.onHandlePrice(4, formData.aprilPrice); props.onHandleKwh(4, formData.aprilKwh); render(); }}
              />
            </div>
          </Flex>
          <Flex flexWrap="wrap" justifyContent="left" alignItems="left">
            <div style={{ width: '100px' }}>
              <Input
                type="text"
                value={formData.mayPrice ? initialMaskInput(formData.mayPrice.toString(), true) : ''}
                placeholder="R$"
                onChange={(event) => { formData.mayPrice = maskInput(event.target.value, true); props.onHandlePrice(5, formData.mayPrice); props.onHandleKwh(5, formData.mayKwh); render(); }}
              />
            </div>
          </Flex>
          <Flex flexWrap="wrap" justifyContent="left" alignItems="left" mr={-90}>
            <div style={{ width: '100px' }}>
              <Input
                type="text"
                value={formData.junePrice ? initialMaskInput(formData.junePrice.toString(), true) : ''}
                placeholder="R$"
                onChange={(event) => { formData.junePrice = maskInput(event.target.value, true); props.onHandlePrice(6, formData.junePrice); props.onHandleKwh(6, formData.juneKwh); render(); }}
              />
            </div>
          </Flex>
        </Flex>
        <Flex flexWrap="wrap" flexDirection="row" justifyContent="space-between" alignItems="center" mt={10}>
          <Flex flexWrap="wrap" justifyContent="left" alignItems="left">
            <div style={{ width: '100px' }}>
              <Input
                type="text"
                value={formData.januaryKwh ? initialMaskInput(formData.januaryKwh.toString(), false) : ''}
                placeholder="kWh"
                onChange={(event) => { formData.januaryKwh = maskInput(event.target.value, false); props.onHandleKwh(1, formData.januaryKwh); props.onHandlePrice(1, formData.januaryPrice); render(); }}
              />
            </div>
          </Flex>
          <Flex flexWrap="wrap" justifyContent="left" alignItems="left">
            <div style={{ width: '100px' }}>
              <Input
                type="text"
                value={formData.febuaryKwh ? initialMaskInput(formData.febuaryKwh.toString(), false) : ''}
                placeholder="kWh"
                onChange={(event) => { formData.febuaryKwh = maskInput(event.target.value, false); props.onHandleKwh(2, formData.febuaryKwh); props.onHandlePrice(2, formData.febuaryPrice); render(); }}
              />
            </div>
          </Flex>
          <Flex flexWrap="wrap" justifyContent="left" alignItems="left">
            <div style={{ width: '100px' }}>
              <Input
                type="text"
                value={formData.marchKwh ? initialMaskInput(formData.marchKwh.toString(), false) : ''}
                placeholder="kWh"
                onChange={(event) => { formData.marchKwh = maskInput(event.target.value, false); props.onHandleKwh(3, formData.marchKwh); props.onHandlePrice(3, formData.marchPrice); render(); }}
              />
            </div>
          </Flex>
          <Flex flexWrap="wrap" justifyContent="left" alignItems="left">
            <div style={{ width: '100px' }}>
              <Input
                type="text"
                value={formData.aprilKwh ? initialMaskInput(formData.aprilKwh.toString(), false) : ''}
                placeholder="kWh"
                onChange={(event) => { formData.aprilKwh = maskInput(event.target.value, false); props.onHandleKwh(4, formData.aprilKwh); props.onHandlePrice(4, formData.aprilPrice); render(); }}
              />
            </div>
          </Flex>
          <Flex flexWrap="wrap" justifyContent="left" alignItems="left">
            <div style={{ width: '100px' }}>
              <Input
                type="text"
                value={formData.mayKwh ? initialMaskInput(formData.mayKwh.toString(), false) : ''}
                placeholder="kWh"
                onChange={(event) => { formData.mayKwh = maskInput(event.target.value, false); props.onHandleKwh(5, formData.mayKwh); props.onHandlePrice(5, formData.mayPrice); render(); }}
              />
            </div>
          </Flex>
          <Flex flexWrap="wrap" justifyContent="left" alignItems="left" mr={-90}>
            <div style={{ width: '100px' }}>
              <Input
                type="text"
                value={formData.juneKwh ? initialMaskInput(formData.juneKwh.toString(), false) : ''}
                placeholder="kWh"
                onChange={(event) => { formData.juneKwh = maskInput(event.target.value, false); props.onHandleKwh(6, formData.juneKwh); props.onHandlePrice(6, formData.junePrice); render(); }}
              />
            </div>
          </Flex>
        </Flex>
        <Flex flexWrap="wrap" flexDirection="row" justifyContent="space-between" alignItems="left" mt={10}>
          <Flex flexWrap="wrap" justifyContent="left" alignItems="left">
            <div style={{ color: colors.Blue700, fontWeight: 'bold' }}>{t('mesesDoAno.julho')}</div>
          </Flex>
          <Flex flexWrap="wrap" justifyContent="left" alignItems="left" ml={48}>
            <div style={{ color: colors.Blue700, fontWeight: 'bold' }}>{t('mesesDoAno.agosto')}</div>
          </Flex>
          <Flex flexWrap="wrap" justifyContent="left" alignItems="left" ml={28}>
            <div style={{ color: colors.Blue700, fontWeight: 'bold' }}>{t('mesesDoAno.setembro')}</div>
          </Flex>
          <Flex flexWrap="wrap" justifyContent="left" alignItems="left" ml={3} mr={30}>
            <div style={{ color: colors.Blue700, fontWeight: 'bold' }}>{t('mesesDoAno.outubro')}</div>
          </Flex>
          <Flex flexWrap="wrap" justifyContent="left" alignItems="left" mr={2}>
            <div style={{ color: colors.Blue700, fontWeight: 'bold' }}>{t('mesesDoAno.novembro')}</div>
          </Flex>
          <Flex flexWrap="wrap" justifyContent="left" alignItems="left" mr={-57}>
            <div style={{ color: colors.Blue700, fontWeight: 'bold' }}>{t('mesesDoAno.dezembro')}</div>
          </Flex>
        </Flex>
        <Flex flexWrap="wrap" flexDirection="row" justifyContent="space-between" alignItems="center" mt={10}>
          <Flex flexWrap="wrap" justifyContent="left" alignItems="left">
            <div style={{ width: '100px' }}>
              <Input
                type="text"
                value={formData.jullyPrice ? initialMaskInput(formData.jullyPrice.toString(), true) : ''}
                placeholder="R$"
                onChange={(event) => { formData.jullyPrice = maskInput(event.target.value, true); props.onHandlePrice(7, formData.jullyPrice); props.onHandleKwh(7, formData.jullyKwh); render(); }}
              />
            </div>
          </Flex>
          <Flex flexWrap="wrap" justifyContent="left" alignItems="left">
            <div style={{ width: '100px' }}>
              <Input
                type="text"
                value={formData.augustPrice ? initialMaskInput(formData.augustPrice.toString(), true) : ''}
                placeholder="R$"
                onChange={(event) => { formData.augustPrice = maskInput(event.target.value, true); props.onHandlePrice(8, formData.augustPrice); props.onHandleKwh(8, formData.augustKwh); render(); }}
              />
            </div>
          </Flex>
          <Flex flexWrap="wrap" justifyContent="left" alignItems="left">
            <div style={{ width: '100px' }}>
              <Input
                type="text"
                value={formData.septemberPrice ? initialMaskInput(formData.septemberPrice.toString(), true) : ''}
                placeholder="R$"
                onChange={(event) => { formData.septemberPrice = maskInput(event.target.value, true); props.onHandlePrice(9, formData.septemberPrice); props.onHandleKwh(9, formData.septemberKwh); render(); }}
              />
            </div>
          </Flex>
          <Flex flexWrap="wrap" justifyContent="left" alignItems="left">
            <div style={{ width: '100px' }}>
              <Input
                type="text"
                value={formData.octoberPrice ? initialMaskInput(formData.octoberPrice.toString(), true) : ''}
                placeholder="R$"
                onChange={(event) => { formData.octoberPrice = maskInput(event.target.value, true); props.onHandlePrice(10, formData.octoberPrice); props.onHandleKwh(10, formData.octoberKwh); render(); }}
              />
            </div>
          </Flex>
          <Flex flexWrap="wrap" justifyContent="left" alignItems="left">
            <div style={{ width: '100px' }}>
              <Input
                type="text"
                value={formData.novemberPrice ? initialMaskInput(formData.novemberPrice.toString(), true) : ''}
                placeholder="R$"
                onChange={(event) => { formData.novemberPrice = maskInput(event.target.value, true); props.onHandlePrice(11, formData.novemberPrice); props.onHandleKwh(11, formData.novemberKwh); render(); }}
              />
            </div>
          </Flex>
          <Flex flexWrap="wrap" justifyContent="left" alignItems="left" mr={-90}>
            <div style={{ width: '100px' }}>
              <Input
                type="text"
                value={formData.decemberPrice ? initialMaskInput(formData.decemberPrice.toString(), true) : ''}
                placeholder="R$"
                onChange={(event) => { formData.decemberPrice = maskInput(event.target.value, true); props.onHandlePrice(12, formData.decemberPrice); props.onHandleKwh(12, formData.decemberKwh); render(); }}
              />
            </div>
          </Flex>
        </Flex>
        <Flex flexWrap="wrap" flexDirection="row" justifyContent="space-between" alignItems="center" mt={10}>
          <Flex flexWrap="wrap" justifyContent="left" alignItems="left">
            <div style={{ width: '100px' }}>
              <Input
                type="text"
                value={formData.jullyKwh ? initialMaskInput(formData.jullyKwh.toString(), false) : ''}
                placeholder="kWh"
                onChange={(event) => { formData.jullyKwh = maskInput(event.target.value, false); props.onHandleKwh(7, formData.jullyKwh); props.onHandlePrice(7, formData.jullyPrice); render(); }}
              />
            </div>
          </Flex>
          <Flex flexWrap="wrap" justifyContent="left" alignItems="left">
            <div style={{ width: '100px' }}>
              <Input
                type="text"
                value={formData.augustKwh ? initialMaskInput(formData.augustKwh.toString(), false) : ''}
                placeholder="kWh"
                onChange={(event) => { formData.augustKwh = maskInput(event.target.value, false); props.onHandleKwh(8, formData.augustKwh); props.onHandlePrice(8, formData.augustPrice); render(); }}
              />
            </div>
          </Flex>
          <Flex flexWrap="wrap" justifyContent="left" alignItems="left">
            <div style={{ width: '100px' }}>
              <Input
                type="text"
                value={formData.septemberKwh ? initialMaskInput(formData.septemberKwh.toString(), false) : ''}
                placeholder="kWh"
                onChange={(event) => { formData.septemberKwh = maskInput(event.target.value, false); props.onHandleKwh(9, formData.septemberKwh); props.onHandlePrice(9, formData.septemberPrice); render(); }}
              />
            </div>
          </Flex>
          <Flex flexWrap="wrap" justifyContent="left" alignItems="left">
            <div style={{ width: '100px' }}>
              <Input
                type="text"
                value={formData.octoberKwh ? initialMaskInput(formData.octoberKwh.toString(), false) : ''}
                placeholder="kWh"
                onChange={(event) => { formData.octoberKwh = maskInput(event.target.value, false); props.onHandleKwh(10, formData.octoberKwh); props.onHandlePrice(10, formData.octoberPrice); render(); }}
              />
            </div>
          </Flex>
          <Flex flexWrap="wrap" justifyContent="left" alignItems="left">
            <div style={{ width: '100px' }}>
              <Input
                type="text"
                value={formData.novemberKwh ? initialMaskInput(formData.novemberKwh.toString(), false) : ''}
                placeholder="kWh"
                onChange={(event) => { formData.novemberKwh = maskInput(event.target.value, false); props.onHandleKwh(11, formData.novemberKwh); props.onHandlePrice(11, formData.novemberPrice); render(); }}
              />
            </div>
          </Flex>
          <Flex flexWrap="wrap" justifyContent="left" alignItems="left" mr={-90}>
            <div style={{ width: '100px' }}>
              <Input
                type="text"
                value={formData.decemberKwh ? initialMaskInput(formData.decemberKwh.toString(), false) : ''}
                placeholder="kWh"
                onChange={(event) => { formData.decemberKwh = maskInput(event.target.value, false); props.onHandleKwh(12, formData.decemberKwh); props.onHandlePrice(12, formData.decemberPrice); render(); }}
              />
            </div>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
};

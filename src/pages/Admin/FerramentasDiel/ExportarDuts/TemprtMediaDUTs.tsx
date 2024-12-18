import { useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Button,
  Loader,
  Select,
  Input,
} from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { apiCall, apiCallDownload } from 'providers';
import SelectSearch, { fuzzySearch } from 'react-select-search';
import { StyleSelect } from '../styles';
import { useTranslation } from 'react-i18next';

export function TemprtMediaDUTs(): JSX.Element {
  const { t } = useTranslation();
  const [state, render_, setState] = useStateVar({
    isLoading: true,
    isExporting: false,
    dayStart: new Date(Date.now() - 3 * (60 * 60 * 1000) - 60 * (24 * 60 * 60 * 1000)).toISOString().substring(0, 10),
    clients: [] as { value: string, name: string }[],
    selectedClient: [] as any | any[],
    async fetchServerData() {
      try {
        const { list } = await apiCall('/clients/get-clients-list', {});
        state.clients = list.map((client) => ({
          value: client.CLIENT_ID.toString(),
          name: client.NAME,
        }));
      } catch (err) { console.log(err); toast.error(t('houveErro')); }
      setState({ isLoading: false });
    },
  });

  useEffect(() => {
    state.fetchServerData();
  }, []);

  if (state.isLoading) return <Loader />;

  async function exportList() {
    try {
      if (!state.selectedClient) return;
      setState({ isExporting: true });
      const exportResponse = await apiCallDownload('/devtools/export-duts-mean-temperatures', {
        dayStart: new Date(`${state.dayStart}T00:00Z`).toISOString().substring(0, 10),
        clientIds: [Number(state.selectedClient)],
      });
      const link: any = document.getElementById('downloadLink');
      if (link.href !== '#') window.URL.revokeObjectURL(link.href);
      link.href = window.URL.createObjectURL(exportResponse.data);
      link.download = exportResponse.headers.filename || 'TemperaturasMedias.xlsx';
      link.click();
      toast.success(t('sucessoExportacao'));
    } catch (err) {
      console.log(err);
      toast.error(t('erroExportacao'));
    }
    setState({ isExporting: false });
  }

  return (
    <>
      <div style={{ display: 'flex' }}>
        <div>
          <StyleSelect>
            <label>{t('cliente')}</label>
            <SelectSearch
              options={state.clients}
              value={state.selectedClient}
              search
              printOptions="on-focus"
              filterOptions={fuzzySearch}
              closeOnSelect
              onChange={(value, index) => { setState({
                selectedClient: value,
              }); render_(); }}
              placeholder={t('selecioneCliente')}
              label={t('cliente')}
            />
          </StyleSelect>
        </div>
        <div style={{ paddingLeft: '30px' }}>
          <Input
            value={state.dayStart}
            onChange={(e) => setState({ dayStart: e.target.value })}
            label={t('dataInicial')}
            style={{ width: '130px' }}
          />
        </div>
        <div>
          <Button variant={(state.isExporting || (state.selectedClient == null)) ? 'disabled' : 'primary'} onClick={() => exportList()} style={{ width: '200px', marginLeft: '30px' }}>
            {t('botaoExportar')}
          </Button>
        </div>
      </div>
      <a id="downloadLink" href="#" />
    </>
  );
}

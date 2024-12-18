import { toast } from 'react-toastify';
import { Button } from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { apiCallDownload } from 'providers';
import { useTranslation } from 'react-i18next';

export function ExportarDevs(): JSX.Element {
  const { t } = useTranslation();
  const [state, , setState] = useStateVar(() => ({
    isExportingDacs: false,
  }));

  async function exportDacsList() {
    try {
      setState({ isExportingDacs: true });
      const exportResponse = await apiCallDownload('/devtools/export-dacs-info', {});
      const link: any = document.getElementById('downloadLink');
      if (link.href !== '#') window.URL.revokeObjectURL(link.href);
      link.href = window.URL.createObjectURL(exportResponse.data);
      link.download = exportResponse.headers.filename || 'DEVs.xlsx';
      link.click();
      toast.success(t('sucessoExportacao'));
    } catch (err) {
      console.log(err);
      toast.error(t('erroExportacao'));
    }
    setState({ isExportingDacs: false });
  }
  async function exportDutsList() {
    try {
      setState({ isExportingDacs: true });
      const exportResponse = await apiCallDownload('/devtools/export-duts-info', {});
      console.log(exportResponse);
      const link: any = document.getElementById('downloadLink');
      if (link.href !== '#') window.URL.revokeObjectURL(link.href);
      link.href = window.URL.createObjectURL(exportResponse.data);
      link.download = exportResponse.headers.filename || 'DEVs.xlsx';
      link.click();
      toast.success(t('sucessoExportacao'));
    } catch (err) {
      console.log(err);
      toast.error(t('erroExportacao'));
    }
    setState({ isExportingDacs: false });
  }
  async function exportDamsList() {
    try {
      setState({ isExportingDacs: true });
      const exportResponse = await apiCallDownload('/devtools/export-dams-info', {});
      const link: any = document.getElementById('downloadLink');
      if (link.href !== '#') window.URL.revokeObjectURL(link.href);
      link.href = window.URL.createObjectURL(exportResponse.data);
      link.download = exportResponse.headers.filename || 'DEVs.xlsx';
      link.click();
      toast.success(t('sucessoExportacao'));
    } catch (err) {
      console.log(err);
      toast.error(t('erroExportacao'));
    }
    setState({ isExportingDacs: false });
  }

  return (
    <>
      <div style={{ display: 'flex' }}>
        <Button variant={state.isExportingDacs ? 'disabled' : 'primary'} onClick={() => exportDacsList()} style={{ width: '200px', marginRight: '30px' }}>
          {`${t('botaoExportar')} DACS`}
        </Button>
        <Button variant={state.isExportingDacs ? 'disabled' : 'primary'} onClick={() => exportDutsList()} style={{ width: '200px', marginRight: '30px' }}>
          {`${t('botaoExportar')} DUTS`}
        </Button>
        <Button variant={state.isExportingDacs ? 'disabled' : 'primary'} onClick={() => exportDamsList()} style={{ width: '200px', marginRight: '30px' }}>
          {`${t('botaoExportar')} DAMS`}
        </Button>
      </div>
      <a id="downloadLink" href="#" />
    </>
  );
}

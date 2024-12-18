import { useEffect, useState } from 'react';
import queryString from 'query-string';
import { apiCallDownload } from '~/providers';
import { Redirect, useHistory } from 'react-router';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { withTransaction } from '@elastic/apm-rum-react';

export const DownloadUnitReport = (): JSX.Element => {
  const { t } = useTranslation();
  const history = useHistory();
  const queryPars = queryString.parse(history.location.search);

  const [downloaded, setDownloaded] = useState(false);

  const getUnitReport = async () => {
    try {
      if (queryPars.key) {
        const res = await apiCallDownload('/get-private-unit-report-file', { key: queryPars.key as string });
        const link: any = document.getElementById('downloadLink');
        if (link.href !== '#') {
          window.URL.revokeObjectURL(link.href);
        }
        link.href = window.URL.createObjectURL(res.data);
        const arrTitleFile = (queryPars.key as string).split('/');
        link.download = arrTitleFile[arrTitleFile.length - 1];

        link.click();
      }
      setDownloaded(true);
    } catch (err) {
      console.log(err);
      toast.error(t('erroDownloadRelatorioUnidade'));
    }
  };

  useEffect(() => {
    getUnitReport();
  }, []);

  if (downloaded) return (<Redirect to="/visao-geral" />);

  return (
    <>
      <a href="#" style={{ display: 'none' }} id="downloadLink" />
      {t('sucessoDownloadRelatorioUnidade')}
    </>
  );
};

export default withTransaction('DownloadUnitReport', 'component')(DownloadUnitReport);

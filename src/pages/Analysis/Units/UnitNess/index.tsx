import { useEffect } from 'react';
import { t } from 'i18next';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';

import { Loader } from '~/components';
import { useStateVar } from '~/helpers/useStateVar';
import { TUnitInfo, UnitLayout } from '~/pages/Analysis/Units/UnitLayout';
import { apiCall } from '~/providers';
import { useTranslation } from 'react-i18next';
import { withTransaction } from '@elastic/apm-rum-react';
import { generateNameFormatted } from '~/helpers/titleHelper';

export const UnitNess = (): JSX.Element => {
  const { t } = useTranslation();
  const routeParams = useParams<{ unitId: string }>();
  const [state, render, setState] = useStateVar({
    unitId: Number(routeParams.unitId),
    unitInfo: null as null| TUnitInfo,
  });

  async function fetchUnitInfo() {
    try {
      const unitInfo = await apiCall('/clients/get-unit-info', { unitId: state.unitId });
      state.unitInfo = unitInfo;
      render();
    } catch (err) {
      console.log(err);
      toast.error(t('houveErro'));
    }
  }

  useEffect(() => {
    fetchUnitInfo();
  }, []);

  return (
    <>
      <Helmet>
        <title>{generateNameFormatted(state.unitInfo?.UNIT_NAME, t('sistemasNess'))}</title>
      </Helmet>
      <UnitLayout unitInfo={state.unitInfo} />
      <br />
      <UnitNessContent unitId={state.unitId} />
    </>
  );
};

export function UnitNessContent(props: { unitId: number }): JSX.Element {
  const { t } = useTranslation();
  const [state, render, setState] = useStateVar({
    isLoading: true,
    iframeLoading: false,
    // @ts-ignore
    url: null as string,
  });

  async function handleGetUnitInfo() {
    try {
      setState({ isLoading: true });
      const { url } = await apiCall('/get-ness-dashboard-url-for-unit', { unitId: props.unitId });
      state.url = url;
      state.iframeLoading = !!url;

      render();
    } catch (err) {
      console.log(err);
      toast.error(t('houveErro'));
    }
    setState({ isLoading: false });
  }

  useEffect(() => {
    handleGetUnitInfo();
  }, []);

  return (
    <>
      {(state.isLoading) && <Loader />}
      {(!state.isLoading) && (
        (state.url)
          ? (
            <>
              {state.iframeLoading && <div>{t('carregando')}</div>}
              <iframe title="iframe" style={{ width: '100%', height: '100vh' }} src={state.url} onLoad={() => { setState({ iframeLoading: false }); }} />
            </>
          )
          : `(${t('semInformacao')})`
      )}
    </>
  );
}

export default withTransaction('UnitNess', 'component')(UnitNess);

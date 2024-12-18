import { Switch, BrowserRouter } from 'react-router-dom';
import { Route404 } from 'pages/404';
import { AdmCities } from 'pages/Admin/AdmCities';
import { AdmFirmware } from 'pages/Admin/AdmFirmware';
import { AdminGroupAutomation } from 'pages/Admin/AdminGroupAutomation';
import { ClientsListWrapper } from 'pages/Admin/ClientsListWrapper';
import { DevLogs } from 'pages/Admin/DevLogs';
import { DevManufacts } from 'pages/Admin/DevManufacts';
import { DevTools } from 'pages/Admin/DevTools';
import { DUTIrList } from 'pages/Admin/DUTIrList';
import { EditClient } from 'pages/Admin/EditClient';
import { FaultsList } from '~/pages/Admin/FaultsList';
import { FaultsListDAM } from 'pages/Admin/FaultsListDAM';
import { FaultsListInstallation } from 'pages/Admin/FaultsListInstallation';
import { FerramentasDiel } from 'pages/Admin/FerramentasDiel';
import { Integrations } from 'pages/Admin/Integrations';
import { SensorsConfig } from 'pages/Admin/SensorsConfig';
import { ServersMonitoring } from 'pages/Admin/ServersMonitoring';
import { SimCards } from 'pages/Admin/SimCards';
import { ProjetoBBKPIs } from 'pages/Admin/ProjetoBB/ProjetoBBKPIs';
import { ProjetoBBANS } from 'pages/Admin/ProjetoBB/ProjetoBBANS';
import { ProjetoBBCronograma } from 'pages/Admin/ProjetoBB/ProjetoBBCronograma';
import { AssetInfo } from '~/pages/Analysis/Assets/AssetInfo';
import { EditAssetInfo } from 'pages/Analysis/Assets/EditAssetInfo';
import { BatchSchedule } from 'pages/Analysis/DAMs/BatchSchedule';
import { DamSchedule } from 'pages/Analysis/DAMs/DamSchedule';
import { DamsList } from 'pages/Analysis/DAMs/DamsList';
import { ScheduleCheck } from 'pages/Analysis/DAMs/ScheduleCheck';
import { DevHistory } from 'pages/Analysis/DEVs/DevHistory';
import { DevInfo } from 'pages/Analysis/DEVs/DevInfo';
import { DevRealTime } from 'pages/Analysis/DEVs/DevRealTime';
import { DevSchedule } from 'pages/Analysis/DEVs/DevSchedule';
import { EditDevInfo } from 'pages/Analysis/DEVs/EditDevInfo';
import { DutIrManagement } from 'pages/Analysis/DUTs/DutIrManagement';
import { Environments } from 'pages/Analysis/DUTs/Environments';
import { Geolocation } from 'pages/Analysis/Geolocation';
import { CoolAutomationHist } from '~/pages/Analysis/Integrations/IntegrHistory/CoolAutomationHist';
import { IntegrEdit } from 'pages/Analysis/Integrations/IntegrEdit/index';
import IntegrHistory from 'pages/Analysis/Integrations/IntegrHistory/index';
import { IntegrPerfil } from 'pages/Analysis/Integrations/IntegrPerfil/index';
import { IntegrRealTime } from 'pages/Analysis/Integrations/IntegrRealTime/index';
import { IntegrsList } from 'pages/Analysis/Integrations/IntegrsList/index';
import { Units } from 'pages/Analysis/Units';
import { EnergyEfficiency } from 'pages/Analysis/Units/EnergyEfficiency';
import { UnitDetail } from 'pages/Analysis/Units/UnitDetail';
import { UnitIntegratedAnalysis } from 'pages/Analysis/Units/UnitIntegratedAnalysis';
import { UnitWater } from 'pages/Analysis/Units/UnitWater';
import { UnitNess } from 'pages/Analysis/Units/UnitNess';
import { UnitProfile } from 'pages/Analysis/Units/UnitProfile';
import { UnitCAG } from '~/pages/Analysis/Units/CAG';
import { UnitVRF } from '~/pages/Analysis/Units/UnitVRF';
import { EditUnitDevProg } from 'pages/Analysis/Units/UnitProfile/EditUnitDevProg';
import { SchedTurnConfig } from 'pages/Analysis/Units/UnitProfile/SchedTurnConfig';
import { BatchInput } from 'pages/ClientPanel/BatchInput';
import { ClientPanelPage } from 'pages/ClientPanel/ClientPanel';
import { ChangePassword } from 'pages/Configs/ChangePassword';
import { EditInfo } from 'pages/Configs/EditInfo';
import { Settings } from 'pages/Configs/Settings';
import { Help } from 'pages/Help';
import { Notifications } from 'pages/Notifications/Default';
import { Notification } from 'pages/Notifications/Notification';
import { Overview } from 'pages/Overview/Default';
import { IntegrationNess } from 'pages/Overview/IntegrationNess';
import { TVListing, TVRegistration } from 'pages/TechnicalVisits';
import { Users } from 'pages/Users/Default';
import { EditUser } from 'pages/Users/EditUser';
import { ClientMultipleProg } from 'pages/ClientPanel/ClientMultipleProg';

import { PrivateRoute } from './PrivateRoute';
import { PublicRoute } from './PublicRoute';
import { SpecialRoute } from './SpecialRoute';
import { Comparative } from '~/pages/Analysis/Comparative';
import { DownloadUnitReport } from '~/pages/Analysis/Units/DownloadUnitReport';
import { PrivateWithRedirectRoute } from './PrivateWithRedirectRoute';
import { FaultsDisable } from '~/pages/Admin/FaultsDisable';
import { Devices } from '~/pages/Analysis/Devices';
import { UtilityInfo } from 'pages/Analysis/Utilities/UtilityInfo';
import { EditUtilityInfo } from 'pages/Analysis/Utilities/EditUtilityInfo';
import { DevUsageIndex } from '~/pages/Analysis/DEVs/DevUsageIndex';
import { UtilityUsageIndex } from '~/pages/Analysis/Utilities/UtilityUsageIndex';
import { UtilityRealTime } from '~/pages/Analysis/Utilities/UtilityRealTime';
import { NewLogin } from 'pages/Authentication';
import { HorarioVerao } from '~/pages/Admin/HorarioVerao';
import { NewNotifications } from '~/pages/NewNotifications';
import { DevHealth } from '~/pages/Analysis/DEVs/DevHealth';
import { ProjetoBBCadastroAC } from '~/pages/Admin/ProjetoBB/ProjetoBBCadastroAC';
import { ProjetoBBNobreak } from '~/pages/Admin/ProjetoBB/ProjetoBBCadastroNobreak';
import { ProjetoBBANSRecente } from '~/pages/Admin/ProjetoBB/ProjetoBBANS/RecentAns';
import { AnalysisEnergy } from '~/pages/Analysis/Energy';
import { RedirectUtilities } from '~/pages/Analysis/Utilities/RedirectUtility';
import { ResetPassword } from '~/pages/ResetPassword';
import { AnalysisMachines } from '~/pages/Analysis/Machines/AnalysisMachine';

export const Routes = (): JSX.Element => (
  <BrowserRouter
    getUserConfirmation={() => {
      /* Empty callback to block the default browser prompt */
    }}
  >
    <Switch>
      {/* authentication */}
      <PublicRoute exact path="/login" component={NewLogin} />
      <PublicRoute path="/resetar-senha" component={ResetPassword} />
      {/* config */}
      <PrivateRoute exact path="/configuracoes" component={Settings} />
      <PrivateRoute exact path="/configuracoes/editar" component={EditInfo} />
      <PrivateRoute exact path="/configuracoes/alterar-senha" component={ChangePassword} />
      {/* overview */}
      <PrivateRoute exact path="/visao-geral" component={Overview} />
      {/* analysis - energia */}
      <PrivateRoute exact path="/analise/energia" component={AnalysisEnergy} />
      {/* analysis - units */}
      <PrivateRoute exact path="/analise/unidades" component={Units} />
      <PrivateWithRedirectRoute exact path="/analise/unidades/download-relatorio-de-unidade" component={DownloadUnitReport} />
      <PrivateRoute exact path="/analise/unidades/:unitId" component={UnitDetail} />
      <PrivateRoute exact path="/analise/unidades/integrated/:unitId/" component={UnitIntegratedAnalysis} />
      <PrivateRoute exact path="/analise/unidades/energyEfficiency/:unitId/" component={EnergyEfficiency} />
      <PrivateRoute exact path="/analise/unidades/integracao-ness/:unitId/" component={UnitNess} />
      <PrivateRoute exact path="/analise/unidades/integracao-agua/:unitId/" component={UnitWater} />
      <PrivateRoute exact path="/analise/unidades/integracao-agua/water/:unitId/" component={UnitWater} />
      <PrivateRoute exact path="/analise/unidades/integracao-vrf/:unitId/" component={UnitVRF} />
      <PrivateRoute exact path="/analise/unidades/perfil/:unitId" component={UnitProfile} />
      <PrivateRoute exact path="/analise/unidades/cag/:unitId" component={UnitCAG} />
      <PrivateRoute exact path="/analise/unidades/perfil/:unitId/editar-unidade" component={EditUnitDevProg} />
      <PrivateRoute exact path="/analise/unidades/revezamento-programacao/:unitId/editar/:roomId" component={SchedTurnConfig} />
      <PrivateRoute exact path="/analise/unidades/revezamento-programacao/:unitId/adicionar" component={SchedTurnConfig} />
      {/* analysis - ativos sem grupo */}
      {/* <PrivateRoute exact path="/analise/dispositivo/:devId/informacoes" component={AssetInfo} /> */}
      <PrivateRoute exact path="/analise/ativo/:devId/informacoes" component={AssetInfo} />
      <PrivateRoute exact path="/analise/ativo/:devId/editarAtivo" component={EditAssetInfo} />
      <PrivateRoute exact path="/analise/ativo/:devId/editar" component={EditDevInfo} />
      <PrivateRoute exact path="/analise/ativo/:devId/historico" component={DevHistory} />
      <PrivateRoute exact path="/analise/ativo/:devId/saude" component={DevHealth} />
      <PrivateRoute exact path="/analise/ativo/:devId/indice-de-uso" component={DevUsageIndex} />
      <PrivateRoute exact path="/analise/ativo/:devId/tempo-real" component={DevRealTime} />
      {/* analysis - ativos com grupo */}
      <PrivateRoute exact path="/analise/dispositivo/:devId/informacoes" component={DevInfo} />
      <PrivateRoute exact path="/analise/maquina/:groupId/ativos" component={AssetInfo} />
      <PrivateRoute exact path="/analise/maquina/:groupId/ativos/:devId/informacoes" component={AssetInfo} />
      <PrivateRoute exact path="/analise/maquina/:groupId/ativos/:devId/editar" component={EditDevInfo} />
      <PrivateRoute exact path="/analise/maquina/:groupId/ativos/:devId/editarAtivo" component={EditAssetInfo} />
      <PrivateRoute exact path="/analise/maquina/:groupId/ativos/:devId/editarAtivo/:indexId" component={EditAssetInfo} />
      <PrivateRoute exact path="/analise/maquina/:groupId/ativos/:devId/historico" component={DevHistory} />
      <PrivateRoute exact path="/analise/maquina/:groupId/ativos/:devId/saude" component={DevHealth} />
      <PrivateRoute exact path="/analise/maquina/:groupId/ativos/:devId/indice-de-uso" component={DevUsageIndex} />
      <PrivateRoute exact path="/analise/maquina/:groupId/ativos/:devId/tempo-real" component={DevRealTime} />
      <PrivateRoute exact path="/analise/maquina/:groupId/ativos/:devId/controle-remoto" component={DutIrManagement} />
      {/* analysis - ativos */}
      <PrivateRoute exact path="/analise/maquina/:groupId/ativos/ASSET:devId/informacoes" component={AssetInfo} />
      <PrivateRoute exact path="/analise/maquina/:groupId/ativos/ASSET:devId/editar" component={EditDevInfo} />
      <PrivateRoute exact path="/analise/maquina/:groupId/ativos/ASSET:devId/editarAtivo" component={EditAssetInfo} />
      <PrivateRoute exact path="/analise/maquina/:groupId/ativos/ASSET:devId/editarAtivo/:indexId" component={EditAssetInfo} />
      <PrivateRoute exact path="/analise/maquina/:groupId/ativos/ASSET:devId/historico" component={DevHistory} />
      {/* <PrivateRoute exact path="/analise/maquina/:groupId/ativos/ASSET:devId/saude" component={DacHealth} /> */}
      <PrivateRoute exact path="/analise/maquina/:groupId/ativos/ASSET:devId/indice-de-uso" component={DevUsageIndex} />
      <PrivateRoute exact path="/analise/maquina/:groupId/ativos/ASSET:devId/tempo-real" component={DevRealTime} />
      <PrivateRoute exact path="/analise/maquina/:groupId/ativos/ASSET:devId/controle-remoto" component={DutIrManagement} />
      {/* analysis - dev */}
      <PrivateRoute exact path="/analise/dispositivo/:devId/editar" component={EditDevInfo} />
      <PrivateRoute exact path="/analise/dispositivo/:devId/historico" component={DevHistory} />
      <PrivateRoute exact path="/analise/dispositivo/:devId/saude" component={DevHealth} />
      <PrivateRoute exact path="/analise/dispositivo/:devId/indice-de-uso" component={DevUsageIndex} />
      <PrivateRoute exact path="/analise/dispositivo/:devId/tempo-real" component={DevRealTime} />
      <PrivateRoute exact path="/analise/dispositivo/:devId/infravermelho" component={DutIrManagement} />
      <PrivateRoute exact path="/analise/dispositivo/:type/:utilId/:devId/historico" component={DevHistory} />
      <PrivateRoute exact path="/analise/dispositivo/:type/:utilId/:devId/tempo-real" component={DevRealTime} />
      {/* analysis - machines */}
      <PrivateRoute exact path="/analise/maquinas" component={AnalysisMachines} />
      <PrivateRoute exact path="/analise/maquina/:devId/informacoes" component={DevInfo} />
      <PrivateRoute exact path="/analise/maquina/:devId/saude" component={DevHealth} />
      <PrivateRoute exact path="/analise/maquina/:devId/indice-de-uso" component={DevUsageIndex} />
      <PrivateRoute exact path="/analise/maquina/:devId/tempo-real" component={DevRealTime} />
      <PrivateRoute exact path="/analise/maquina/:devId/historico" component={DevHistory} />
      <PrivateRoute exact path="/analise/maquina/:devId/programacao" component={DamSchedule} />
      <PrivateRoute exact path="/analise/maquina/:devId/editar" component={EditDevInfo} />
      {/* analysis - automation */}
      <PrivateRoute exact path="/analise/dams" component={DamsList} />
      <PrivateRoute exact path="/analise/dam/:devId/editar" component={EditDevInfo} />
      <PrivateRoute exact path="/analise/dam/:devId/informacoes" component={DevInfo} />
      <PrivateRoute exact path="/analise/dam/:devId/tempo-real" component={DevRealTime} />
      <PrivateRoute exact path="/analise/dam/:devId/programacao" component={DamSchedule} />
      <PrivateRoute exact path="/analise/automacao/:devId/historico" component={DevHistory} />
      <PrivateRoute exact path="/analise/dam/:devId/historico" component={DevHistory} />
      <PrivateRoute exact path="/analise/programacao-dams" component={BatchSchedule} />
      <PrivateRoute exact path="/analise/status-programacao" component={ScheduleCheck} />
      <PrivateRoute exact path="/analise/automacao" component={DamsList} />
      {/* analysis - automation DUT */}
      <PrivateRoute exact path="/analise/automacao/:devId/editar" component={EditDevInfo} />
      <PrivateRoute exact path="/analise/automacao/:devId/informacoes" component={DevInfo} />
      <PrivateRoute exact path="/analise/automacao/:devId/tempo-real" component={DevRealTime} />
      <PrivateRoute exact path="/analise/automacao/:devId/programacao" component={DevSchedule} />
      <PrivateRoute exact path="/analise/automacao/:devId/infravermelho" component={DutIrManagement} />
      <PrivateRoute exact path="/analise/ambiente/:devId/infravermelho" component={DutIrManagement} />
      {/* analysis - environments */}
      <PrivateRoute exact path="/analise/ambientes" component={Environments} />
      <PrivateRoute exact path="/analise/ambiente/:devId/informacoes" component={DevInfo} />
      <PrivateRoute exact path="/analise/ambiente/:devId/tempo-real" component={DevRealTime} />
      <PrivateRoute exact path="/analise/ambiente/:devId/historico" component={DevHistory} />
      <PrivateRoute exact path="/analise/ambiente/:devId/editar" component={EditDevInfo} />
      {/* analysis - utilities */}
      <PrivateRoute exact path="/analise/utilitario/:type/:utilId/informacoes" component={UtilityInfo} />
      <PrivateRoute exact path="/analise/utilitario/:type/:utilId/editar" component={EditUtilityInfo} />
      <PrivateRoute exact path="/analise/utilitario/:type/:utilId/tempo-real" component={UtilityRealTime} />
      <PrivateRoute exact path="/analise/utilitario/:type/:utilId/indice-de-uso" component={UtilityUsageIndex} />
      {/* integrations */}
      <SpecialRoute exact path="/integracao-ness/visao-geral" component={IntegrationNess} />
      <PrivateRoute exact path="/integracoes" component={IntegrsList} />
      <PrivateRoute exact path="/integracoes/info/:integrType/:integrId/perfil" component={IntegrPerfil} />
      <PrivateRoute exact path="/integracoes/info/:integrType/:integrId/tempo-real" component={IntegrRealTime} />
      <PrivateRoute exact path="/integracoes/info/:integrType/:integrId/historico" component={IntegrHistory} />
      <PrivateRoute exact path="/integracoes/info/:integrType/:integrId/editar" component={IntegrEdit} />
      {/* geolocation */}
      <PrivateRoute exact path="/analise/geolocalizacao" component={Geolocation} />
      {/* analysis - comparative */}
      <PrivateRoute exact path="/analise/comparativo" component={Comparative} />
      {/* devices */}
      <PrivateRoute exact path="/analise/dispositivos" component={Devices} />
      {/* Utilities */}
      <PrivateRoute exact path="/analise/utilitarios" component={RedirectUtilities} />
      {/* notifications */}
      <PrivateRoute exact path="/notificacoes/gerenciamento" component={Notifications} />
      <PrivateRoute exact path="/notificacoes" component={Notifications} />
      <PrivateRoute exact path="/notificacoes/feed" component={NewNotifications} />
      <PrivateRoute exact path="/notificacoes/historico" component={NewNotifications} />
      <PrivateRoute exact path="/notificacoes/adicionar-notificacao" component={Notification} />
      <PrivateRoute exact path="/notificacoes/editar-notificacao/" component={Notification} />
      <PrivateRoute exact path="/notificacoes/editar-notificacao/:notifId" component={Notification} />
      {/* users */}
      <PrivateRoute exact path="/usuarios" component={Users} />
      <PrivateRoute exact path="/adicionar-usuario" component={EditUser} />
      <PrivateRoute exact path="/editar-usuario/:userId" component={EditUser} />
      {/* technical visits */}
      <PrivateRoute exact path="/visita-tecnica" component={TVListing} />
      <PrivateRoute exact path="/visita-tecnica/historico" component={TVListing} />
      <PrivateRoute exact path="/visita-tecnica/registro" component={TVRegistration} />
      <PrivateRoute exact path="/visita-tecnica/editar/:id" component={TVRegistration} />
      {/* admin */}
      <PrivateRoute exact path="/painel/integracoes" component={Integrations} />
      <PrivateRoute exact path="/painel/clientes/listagem" component={ClientsListWrapper} />
      <PrivateRoute exact path="/painel/clientes/novo-cliente" component={EditClient} />
      <PrivateRoute exact path="/painel/clientes/editar-cliente/:clientId" component={EditClient} />
      <PrivateRoute exact path="/painel/devlogs" component={DevLogs} />
      <PrivateRoute exact path="/painel/client-painel" component={ClientPanelPage} />
      <PrivateRoute exact path="/painel/cidades" component={AdmCities} />
      <PrivateRoute exact path="/painel/devtools" component={DevTools} />
      <PrivateRoute exact path="/painel/ferramentas-diel" component={FerramentasDiel} />
      <PrivateRoute exact path="/painel/falhas/dac" component={FaultsList} />
      <PrivateRoute exact path="/painel/falhas/dut" component={FaultsList} />
      <PrivateRoute exact path="/painel/falhas/dam" component={FaultsListDAM} />
      <PrivateRoute exact path="/painel/falhas/instalacao" component={FaultsListInstallation} />
      <PrivateRoute exact path="/painel/falhas/desativadas" component={FaultsDisable} />
      <PrivateRoute exact path="/painel/dut-ir" component={DUTIrList} />
      <PrivateRoute exact path="/painel/firmware" component={AdmFirmware} />
      <PrivateRoute exact path="/painel/sensores" component={SensorsConfig} />
      <PrivateRoute exact path="/painel/fabricantes" component={DevManufacts} />
      <PrivateRoute exact path="/painel/fabricantes/adicionar" component={EditClient} />
      <PrivateRoute exact path="/painel/fabricantes/editar/:clientId" component={EditClient} />
      <PrivateRoute exact path="/painel/simCards" component={SimCards} />
      <PrivateRoute exact path="/painel/projeto-bb/kpis" component={ProjetoBBKPIs} />
      <PrivateRoute exact path="/painel/projeto-bb/ans/antiga" component={ProjetoBBANS} />
      <PrivateRoute exact path="/painel/projeto-bb/ans/recente" component={ProjetoBBANSRecente} />
      <PrivateRoute exact path="/painel/projeto-bb/cronograma" component={ProjetoBBCronograma} />
      <PrivateRoute exact path="/painel/horario-verao" component={HorarioVerao} />
      <PrivateRoute exact path="/painel/projeto-bb/cadastroac" component={ProjetoBBCadastroAC} />
      <PrivateRoute exact path="/painel/projeto-bb/nobreak" component={ProjetoBBNobreak} />
      <PrivateRoute exact path="/painel/programacao-multipla/:clientId" component={ClientMultipleProg} />
      <PrivateRoute exact path="/painel/adicionar-lote" component={BatchInput} />
      <PrivateRoute exact path="/painel/adicionar-lote/:tipo" component={BatchInput} />
      <PrivateRoute exact path="/painel/analise-automacao-grupos" component={AdminGroupAutomation} />
      <PrivateRoute exact path="/painel/servers-monitoring" component={ServersMonitoring} />
      <PrivateRoute exact path="/painel/coolautomation/unit/:coolAutUnitId" component={CoolAutomationHist} />
      {/* help */}
      <PrivateRoute exact path="/ajuda" component={Help} />
      <Route404 />
    </Switch>
  </BrowserRouter>
);

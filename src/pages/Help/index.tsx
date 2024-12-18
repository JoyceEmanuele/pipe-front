import React from 'react';

import MuiExpansionPanel from '@material-ui/core/ExpansionPanel';
import MuiExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import MuiExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Helmet } from 'react-helmet';
import { Flex, Box } from 'reflexbox';

import { ArrowIcon } from '~/icons';
import { colors } from '~/styles/colors';

import {
  ExpansionBody,
  SectionTitle,
} from './styles';
import { withTransaction } from '@elastic/apm-rum-react';

const ExpansionPanel = withStyles({
  root: {
    border: `2px solid ${colors.Grey050}`,
    boxShadow: 'none',
    overflow: 'hidden',
    '&:first-child': {
      borderTopLeftRadius: '16px',
      borderTopRightRadius: '16px',
    },
    '&:last-child': {
      borderBottomLeftRadius: '16px',
      borderBottomRightRadius: '16px',
    },
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 'auto',
    },
  },
  expanded: {},
})(MuiExpansionPanel);

const ExpansionPanelSummary = withStyles({
  root: {
    backgroundColor: colors.White,
    borderBottom: '1px solid rgba(0, 0, 0, .125)',
    marginBottom: -1,
    minHeight: 48,
    '&$expanded': {
      minHeight: 48,
    },
  },
  content: {
    '&$expanded': {
      margin: '12px 0',
    },
  },
  expanded: {},
})(MuiExpansionPanelSummary);

const ExpansionPanelDetails = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiExpansionPanelDetails);

export const Help = (): JSX.Element => {
  const [expanded, setExpanded] = React.useState('');

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  return (
    <>
      <Helmet>
        <title>Diel Energia - Ajuda</title>
      </Helmet>
      <SectionTitle>INTRODUÇÃO</SectionTitle>
      <ExpansionBody>
        <ExpansionPanel square expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
          <ExpansionPanelSummary aria-controls="panel1d-content" id="panel1d-header" expandIcon={<ArrowIcon />}>
            <Typography>PLATAFORMA</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Flex>
              <Box>
                <p>A plataforma online permite que você monitore ambientes e máquinas em tempo real, tendo acesso a:</p>
                <ul>
                  <li>Índice de saúde e uso da máquinas;</li>
                  <li>Detecção de vazamentos e alerta de irregularidades;</li>
                  <li>Medições em tempo real;</li>
                  <li>Relatório enviado periodicamente para e-mail cadastrado.</li>
                </ul>
              </Box>
            </Flex>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel square expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
          <ExpansionPanelSummary aria-controls="panel2d-content" id="panel2d-header" expandIcon={<ArrowIcon />}>
            <Typography>DISPOSITIVOS DIEL</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Flex>
              <Box>
                <p>
                  Dispositivos e sensores que devem ser instalados nos ambientes e máquinas a serem monitoradas para
                  enviar dados de telemetria para a plataforma:
                </p>
                <ul>
                  <li>
                    DAC – Coleta dados de temperatura, pressão e tensão da condensadora para diagnosticar a saúde de sua
                    máquina e evitar falhas;
                  </li>
                  <li>
                    DUT – Coleta dados de temperatura e umidade do ambiente e te ajuda a acompanhar a qualidade e o
                    conforto do ambiente monitorado;
                  </li>
                  <li>
                    DAM – Aciona remotamente máquinas de refrigeração através da plataforma online. É possível programar
                    um acionamento automático de acordo com o horário desejado.
                  </li>
                </ul>
              </Box>
            </Flex>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel square expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
          <ExpansionPanelSummary aria-controls="panel3d-content" id="panel3d-header" expandIcon={<ArrowIcon />}>
            <Typography>NAVEGAÇÃO E CONFIGURAÇÕES</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Flex>
              <Box>
                <p>Na barra lateral você irá encontrar as seções de:</p>
                <ul>
                  <li>Visão geral;</li>
                  <li>Análise;</li>
                  <li>Notificações;</li>
                  <li>Usuários;</li>
                  <li>Ajuda.</li>
                </ul>
                <p>
                  Na barra superior, em configurações, será possível alterar Nome, Sobrenome e gerar uma nova senha,
                  além de poder escolher a unidade de medida da pressão (bar ou psi).
                </p>
              </Box>
            </Flex>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </ExpansionBody>
      <SectionTitle>VISÃO GERAL</SectionTitle>
      <ExpansionBody>
        <ExpansionPanel square expanded={expanded === 'panel4'} onChange={handleChange('panel4')}>
          <ExpansionPanelSummary aria-controls="panel4d-content" id="panel4d-header" expandIcon={<ArrowIcon />}>
            <Typography>RESUMO DE MONITORAMENTO</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Flex>
              <Box>
                <p>Existem quatro tipos de resumo na seção da visão geral: </p>
                <ul>
                  <li>
                    AMBIENTES MONITORADOS - Total de ambientes monitorados, e maior e menor temperaturas registradas;
                  </li>
                  <li>MÁQUINAS MONITORADAS - Total de máquinas e seus respectivos índices de saúde;</li>
                  <li>
                    QUADRO DE FALHAS - Resumo de índices de saúde organizado por estado ou cidade, como um quadro de
                    medalhas.
                  </li>
                  <li>MÁQUINAS AUTOMATIZADAS - Total de máquinas com dispositivo de automação instalado;</li>
                </ul>
                <p>
                  É possível excluir análises, clicando no ícone de lixeira, ou adicionar clicando no botão “ADICIONAR
                  ANÁLISE”.
                </p>
              </Box>
            </Flex>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel square expanded={expanded === 'panel5'} onChange={handleChange('panel5')}>
          <ExpansionPanelSummary aria-controls="panel5d-content" id="panel5d-header" expandIcon={<ArrowIcon />}>
            <Typography>FILTROS</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Flex>
              <Box>
                <p>
                  É possível filtrar os resumos por estado, cidade e unidade das máquinas e/ou ambientes monitorados. Os
                  números da visão geral serão atualizados conforme filtros selecionados:
                </p>
                <ul>
                  <li>ESTADO – Para clientes com máquinas e/ou ambientes monitorados em mais de um estado;</li>
                  <li>CIDADE – Para clientes com máquinas e/ou ambientes monitorados em mais de uma cidade;</li>
                  <li>
                    UNIDADE – Para clientes com máquinas e/ou ambientes monitorados em mais de uma unidade (em uma
                    unidade pode ter mais de um ambiente e/ou máquinas).
                  </li>
                </ul>
              </Box>
            </Flex>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </ExpansionBody>
      <SectionTitle>ANÁLISE</SectionTitle>
      <ExpansionBody>
        <ExpansionPanel square expanded={expanded === 'panel6'} onChange={handleChange('panel6')}>
          <ExpansionPanelSummary aria-controls="panel6d-content" id="panel6d-header" expandIcon={<ArrowIcon />}>
            <Typography>LISTAS</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Flex>
              <Box>
                <ul>
                  <li>
                    UNIDADES – Por meio dos filtros você pode organizar a lista por Estado, Cidade, Unidade, Máquinas e
                    Ambientes. É possível acessar a análise detalhada da unidade, máquina e ambiente clicando nos textos
                    sublinhados.
                  </li>
                  <li>
                    AMBIENTES – Por meio dos filtros você pode organizar a lista por Estado, Cidade, Unidade, Ambiente,
                    Ponto de medição, Temperatura, Umidade e Status. É possível acessar a análise detalhada da unidade e
                    ambiente clicando nos textos sublinhados.
                  </li>
                  <li>
                    MÁQUINAS – Por meio dos filtros você pode organizar a lista por Estado, Cidade, Unidade, Grupo,
                    Máquina, Saúde e Status. É possível acessar a análise detalhada da unidade e máquina clicando nos
                    textos sublinhados.
                  </li>
                </ul>
                <p>Para exportar uma lista no formato XLS, é só clicar no botão “EXPORTAR LISTA”.</p>
              </Box>
            </Flex>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel square expanded={expanded === 'panel7'} onChange={handleChange('panel7')}>
          <ExpansionPanelSummary aria-controls="panel7d-content" id="panel7d-header" expandIcon={<ArrowIcon />}>
            <Typography>GEOLOCALIZAÇÃO</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Flex>
              <Box>
                <p>
                  Por meio dos filtros você pode visualizar no mapa as unidades organizadas por Estado, Cidade e
                  Unidade.
                </p>
              </Box>
            </Flex>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel square expanded={expanded === 'panel8'} onChange={handleChange('panel8')}>
          <ExpansionPanelSummary aria-controls="panel8d-content" id="panel8d-header" expandIcon={<ArrowIcon />}>
            <Typography>ANÁLISE DETALHADA DA UNIDADE</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Flex>
              <Box>
                <p>
                  Na análise detalhada dos ambientes e máquinas que estão sendo monitorados dentro do mesmo endereço.
                </p>
                <p>
                  AMBIENTES - São sinalizados a temperatura e umidade em tempo real, além do número de série (ID) do
                  DUT.
                </p>
                <p>
                  MÁQUINAS - Apresentado um resumo da saúde e outros indicadores da máquina, além do número de série
                  (ID) do DAC. Caso a máquina tenha o DAM (dispositivo de automação) instalado é possível ver/inserir
                  programação de funcionamento, status da máquina (ligado ou desligado) e acionamento manual.
                </p>
                <p>
                  Para exportar o relatório detalhado da unidade no formato PDF, é só clicar no botão “EXPORTAR
                  RELATÓRIO”.
                </p>
              </Box>
            </Flex>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel square expanded={expanded === 'panel9'} onChange={handleChange('panel9')}>
          <ExpansionPanelSummary aria-controls="panel9d-content" id="panel9d-header" expandIcon={<ArrowIcon />}>
            <Typography>ANÁLISE DETALHADA DA MÁQUINA</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Flex>
              <Box>
                <p>Clicando no número de série (ID) do DAC você visualiza:</p>
                <ul>
                  <li>
                    INFORMAÇÕES – Contém número de série (ID), identificação bluetooth (BT ID), última mensagem
                    recebida, estado, cidade, unidade, andar, condensadora, início do monitoramento, descrição, modelo,
                    capacidade frigorífica (BTU/HR) e fluido refrigerante. Também é possível salvar fotos da máquina
                    para facilitar a identificação.
                  </li>
                  <li>
                    TEMPO REAL – Dados de temperatura ambiente, temperatura de sucção, temperatura de líquido, pressão
                    de sucção, pressão de condensação, subresfriamento, superaquecimento e sinal de comando.
                  </li>
                  <li>
                    ÍNDICE DE USO – Identifica o tempo que o compressor ficou ligado e o número de partidas em um
                    determinado tempo. É possível filtrar por período.
                  </li>
                  <li>
                    SAÚDE – A saúde é classificada em 4 níveis: Operando corretamente (VERDE); Fora de especificação
                    (AMARELO); Risco iminente (LARANJA) e Manutenção Urgente (VERMELHO). Além dos indicadores Laudo
                    Técnico, Possíveis Causas e Performance.
                  </li>
                  <li>
                    HISTÓRICO – Filtra por período os dados de temperatura ambiente, temperatura de sucção, temperatura
                    de líquido, pressão de sucção, pressão de condensação, subresfriamento, superaquecimento e sinal de
                    comando.
                  </li>
                </ul>
              </Box>
            </Flex>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel square expanded={expanded === 'panel10'} onChange={handleChange('panel10')}>
          <ExpansionPanelSummary aria-controls="panel10d-content" id="panel10d-header" expandIcon={<ArrowIcon />}>
            <Typography>ANÁLISE DETALHADA DO AMBIENTE</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Flex>
              <Box>
                <p>Clicando no ID do DUT você visualiza:</p>
                <ul>
                  <li>
                    INFORMAÇÕES – Contém número de série (ID), identificação bluetooth (BT ID), última mensagem
                    recebida, estado, cidade, unidade, andar, sensor de temperatura e início do monitoramento. Também é
                    possível salvar fotos do ambiente para facilitar a identificação.
                  </li>
                  <li>TEMPO REAL – Dados de temperatura e umidade.</li>
                  <li>HISTÓRICO – Filtra por período: Temperatura ambiente e Umidade.</li>
                </ul>
              </Box>
            </Flex>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </ExpansionBody>
      <SectionTitle>NOTIFICAÇÕES</SectionTitle>
      <ExpansionBody>
        <ExpansionPanel square expanded={expanded === 'panel11'} onChange={handleChange('panel11')}>
          <ExpansionPanelSummary aria-controls="panel11d-content" id="panel11d-header" expandIcon={<ArrowIcon />}>
            <Typography>NOTIFICAÇÕES</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Flex>
              <Box>
                <p>
                  Mensagens enviadas ao usuário via e-mail, avisando-o sobre o comportamento de sua(s) máquina(s). O
                  usuário define o que será notificado, de acordo com os tipos de notificações:
                </p>
                <ul>
                  <li>Default (Padrão) – Falha Repentina e Relatório Periódico;</li>
                  <li>Personalizadas – Índice de Saúde e Uso da Condensadora;</li>
                </ul>
                <p>Para adicionar notificações, é só clicar no botão de Nova Notificação.</p>
              </Box>
            </Flex>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel square expanded={expanded === 'panel12'} onChange={handleChange('panel12')}>
          <ExpansionPanelSummary aria-controls="panel12d-content" id="panel12d-header" expandIcon={<ArrowIcon />}>
            <Typography>FALHA REPENTINA</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Flex>
              <Box>
                <p>
                  São falhas que acontecem de forma abrupta e levam a máquina para uma situação de risco iminente de
                  falha ou de manuntenção urgente. Quando uma falha repentina acontece, o sistema para de refrigerar de
                  imediato e por isso deve ser notificado imediatamente.
                </p>
                <p>Por padrão, serão enviadas notificações caso houver:</p>
                <ul>
                  <li>
                    VAZAMENTO DE GÁS – O vazamento de gás do seu ar-condicionado pode ter sido causado por problemas
                    durante a instalação, bem como a quantidade inadequada de gás, danificações na tubulação, e também
                    devido ao envelhecimento do sistema.
                  </li>
                  <li>
                    CARGA DE GÁS CRÍTICA – Quando é necessário repor o gás, pois é ele que tem a função de transformar o
                    ar quente em ar frio e manter a eficiência do equipamento.
                  </li>
                  <li>
                    RISCO DE ENTRADA DE LÍQUIDO NO COMPRESSOR – Há o risco de grande volume de líquido refrigerante
                    retornar de forma descontrolada ao compressor em funcionamento através da linha de sucção. Podendo
                    danificar o compressor que é feito para operar com o gás refrigerante na forma de vapor.
                  </li>
                  <li>
                    SUCÇÃO CONGELADA – Quando ocorre formação de gelo na sucção da condensadora, sendo um sintoma de
                    possível deficiência de fluxo de ar na serpentina ou carga de gás crítica. O impacto pode ser perda
                    acentuada de eficiência e operação em faixa de risco.
                  </li>
                </ul>
              </Box>
            </Flex>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel square expanded={expanded === 'panel13'} onChange={handleChange('panel13')}>
          <ExpansionPanelSummary aria-controls="panel13d-content" id="panel13d-header" expandIcon={<ArrowIcon />}>
            <Typography>RELATÓRIO PERIÓDICO</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Flex>
              <Box>
                <p>
                  O relatório periódico é o conjunto de informações facilmente visualizadas acerca da unidade, no
                  formato de arquivo PDF. Nele contém a saúde de cada máquina, laudo técnico, performance, possíveis
                  causas e uso médio de dado período.
                </p>
                <p>O período padrão é semanal, porém o usuário poderá configurar a periodicidade.</p>
              </Box>
            </Flex>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel square expanded={expanded === 'panel14'} onChange={handleChange('panel14')}>
          <ExpansionPanelSummary aria-controls="panel14d-content" id="panel14d-header" expandIcon={<ArrowIcon />}>
            <Typography>ÍNDICE DE SAÚDE</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Flex>
              <Box>
                <p>Notificações caso índice de saúde:</p>
                <ul>
                  <li>Ficar vermelho;</li>
                  <li>Ficar vermelho ou laranja;</li>
                  <li>For diferente de verde;</li>
                  <li>Descer abruptamente;</li>
                  <li>Se recuperar.</li>
                </ul>
              </Box>
            </Flex>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel square expanded={expanded === 'panel15'} onChange={handleChange('panel15')}>
          <ExpansionPanelSummary aria-controls="panel15d-content" id="panel15d-header" expandIcon={<ArrowIcon />}>
            <Typography>USO DA CONDENSADORA</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Flex>
              <Box>
                <p>Notificações caso:</p>
                <ul>
                  <li>Compressor ficar ligado por: 1. Mais que; 2. Menos que.</li>
                  <li>Número de partidas no dia for: 1. Maior que; 2. Menor ou igual.</li>
                  <li>Compressor estiver ligado: 1. Depois que; 2. Antes de.</li>
                </ul>
              </Box>
            </Flex>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </ExpansionBody>
      <SectionTitle>USUÁRIOS</SectionTitle>
      <ExpansionBody>
        <ExpansionPanel square expanded={expanded === 'panel16'} onChange={handleChange('panel16')}>
          <ExpansionPanelSummary aria-controls="panel16d-content" id="panel16d-header" expandIcon={<ArrowIcon />}>
            <Typography>USUÁRIOS</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Flex>
              <Box>
                <p>Existem dois tipos de usuário:</p>
                <p>ADMIN - Pode adicionar e deletar outros usuários.</p>
                <p>COMUM – Navega pelas informações do dash sem poder adicionar e deletar outros usuários.</p>
                <p>
                  Usuários ADMIN podem deletar e editar usuários existentes através dos ícones de lixeira e caneta, e
                  convidar novos usuários. Clicar em CONVIDAR USUÁRIO e preencher com Nome, Sobrenome e Email. Será
                  enviado um convite para o e-mail com usuário e senha.
                </p>
              </Box>
            </Flex>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </ExpansionBody>
    </>
  );
};

export default withTransaction('Help', 'component')(Help);

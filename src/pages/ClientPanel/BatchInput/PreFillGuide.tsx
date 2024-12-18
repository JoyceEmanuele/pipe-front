import { TableContainer } from '@material-ui/core';
import { Table } from './styles';
import { useEffect, useState } from 'react';
import { currentCapacityOpts } from '~/helpers/driConfigOptions';
import { useTranslation } from 'react-i18next';
import { apiCall } from '~/providers';
import { stateObject } from '~/helpers/batchInputHelpers';

interface PreFillGuideProps {
   typeOfSolution: string;
   comboOpts: ReturnType<typeof stateObject>['comboOpts'];
   energyOpts: ReturnType<typeof stateObject>['energyOpts'];
}

export const PreFillGuide = ({ typeOfSolution, comboOpts, energyOpts }: PreFillGuideProps): JSX.Element => {
  const { t } = useTranslation();
  const [unitMachine] = useState<string[]>([]);
  const [unitMachineIds] = useState<string[]>([]);
  const [unitMachineLabel] = useState<string[]>([]);
  const [timezoneList, setTimezonesList] = useState<{ label: string; value: number; }[]>();
  const typeSolutionHeader = {
    unit: [
      [{ value: ' ' }],
      [{ value: 'Tipo de Solução' }],
      [{ value: 'ID da Unidade' }],
      [{ value: 'Código da Unidade - Celsius' }],
      [{ value: 'Código da Unidade - API' }],
      [{ value: 'Unidade' }],
      [{ value: 'País' }],
      [{ value: 'Estado' }],
      [{ value: 'Cidade' }],
      [{ value: 'Fuso Horário' }],
      [{ value: 'Área Construída' }],
      [{ value: 'Status da Unidade' }],
      [{ value: 'LAT e LONG' }],
      [{ value: 'Endereço' }],
      [{ value: 'Número de Pessoas' }],
      [{ value: 'Croquis (1 - 5)' }],
      [{ value: 'SIMCARD ICCID' }],
      [{ value: 'Ponto de Acesso' }],
      [{ value: 'Modem' }],
      [{ value: 'MAC - Ponto de Acesso' }],
      [{ value: 'MAC - Repetidor' }],
      [{ value: 'Fotos (1-3) SIMCARD' }],
      [{ value: 'Documentos (1 - 5)' }],
    ],
    energy: [
      [{ value: ' ' }],
      [{ value: 'Tipo de Solução' }],
      [{ value: 'Nome da Unidade' }],
      [{ value: 'Aplicação' }],
      [{ value: 'ID do Quadro Elétrico' }],
      [{ value: 'Nome do Quadro Elétrico' }],
      [{ value: 'ID Dispositivo Energia' }],
      [{ value: 'ID Med. Energia' }],
      [{ value: 'N. Serie Medidor' }],
      [{ value: 'Modelo Medidor' }],
      [{ value: 'Capacidade de TC (A)' }],
      [{ value: 'Tipo de Instalação Elétrica' }],
      [{ value: 'Intervalo de Envio' }],
      [{ value: 'Foto 1-5 (DRI)' }],
      [{ value: 'Ambiente Monitorado VAV' }],
      [{ value: 'Fabricante do Termostato' }],
      [{ value: 'Modelo do Termostato' }],
      [{ value: 'Fabricante do Atuador' }],
      [{ value: 'Modelo do Atuador' }],
      [{ value: 'Tipo do Atuador' }],
      [{ value: 'Fabricante da Caixa VAV' }],
      [{ value: 'Modelo da Caixa VAV' }],
      [{ value: 'Fabricante do Fancoil' }],
      [{ value: 'Modelo do Fancoil' }],
    ],
    water: [
      [{ value: ' ' }],
      [{ value: 'Tipo de Solução' }],
      [{ value: 'Unidade' }],
      [{ value: 'ID DMA' }],
      [{ value: 'Hidrômetro' }],
      [{ value: 'Local de Instalação' }],
      [{ value: 'Data de Instalação do DMA' }],
      [{ value: 'Capacidade Total dos Reservatórios (L)' }],
      [{ value: 'Total de Reservatórios' }],
      [{ value: 'Foto (1-5) DMA' }],
    ],
    machine: [
      [{ value: ' ' }],
      [{ value: 'Tipo de Solução' }],
      [{ value: 'Unidade' }],
      [{ value: 'ID da Máquina' }],
      [{ value: 'Nome da Máquina' }],
      [{ value: 'Máquina Instalada em' }],
      [{ value: 'Aplicação' }],
      [{ value: 'Tipo de Equipamento' }],
      [{ value: 'Fabricante' }],
      [{ value: 'Fluido' }],
      [{ value: 'Potência Nominal da Máquina [kW]' }],
      [{ value: 'Foto (1-5) Máquina' }],
      [{ value: 'Dispositivo de Automação (ID DUT/DAM/DRI)' }],
      [{ value: 'Posicionamento (INS/AMB/DUO)' }],
      [{ value: 'DUT DUO (POSIÇÃO SENSORES)' }],
      [{ value: 'Local de Instalação do DAM' }],
      [{ value: 'Posicionamento do DAM' }],
      [{ value: 'Sensor T0 do DAM' }],
      [{ value: 'Sensor T1 do DAM' }],
      [{ value: 'Foto (1-5) Dispositivo de Automação' }],
      [{ value: 'DUT de Referência (ID DUT)' }],
      [{ value: 'Foto (1-5) DUT Referência' }],
      [{ value: 'Nome do Ambiente' }],
      [{ value: 'Tipo de Ambiente' }],
      [{ value: 'ID Ativo' }],
      [{ value: 'Nome do Ativo' }],
      [{ value: 'Função' }],
      [{ value: 'Modelo' }],
      [{ value: 'Capacidade Frigorífica' }],
      [{ value: 'COP' }],
      [{ value: 'Potência Nominal do Ativo [kW]' }],
      [{ value: 'Modelo da Evaporadora' }],
      [{ value: 'Velocidade de Insuflamento' }],
      [{ value: 'Corrente Nominal / RLA do Compressor [A]' }],
      [{ value: 'Alimentação do Equipamento' }],
      [{ value: 'Foto (1-5) Ativo' }],
      [{ value: 'Dispositivo Diel associado ao ativo (DAC/DUT)' }],
      [{ value: 'Comissionado (S/N)' }],
      [{ value: 'Sensor P0' }],
      [{ value: 'P0' }],
      [{ value: 'Sensor P1' }],
      [{ value: 'P1' }],
      [{ value: 'Foto (1-5) DAC' }],
      [{ value: 'Local de Instalação do Dispositivo' }],
    ],
    environment: [
      [{ value: '' }],
      [{ value: 'Tipo de Solução' }],
      [{ value: 'Unidade' }],
      [{ value: 'DUT de Referência (ID DUT)' }],
      [{ value: 'Foto (1-5) DUT Referência' }],
      [{ value: 'Nome do Ambiente' }],
      [{ value: 'Tipo de Ambiente' }],
    ],
    nobreak: [
      [{ value: ' ' }],
      [{ value: 'Tipo de Solução' }],
      [{ value: 'Nome da unidade' }],
      [{ value: 'Id do utilitario' }],
      [{ value: 'Nome do utilitario' }],
      [{ value: 'Data de Instalação do Utilitário' }],
      [{ value: 'Fabricante Nobreak' }],
      [{ value: 'Modelo Nobreak' }],
      [{ value: 'Tensão de Entrada (V)' }],
      [{ value: 'Tensão de Saída (V)' }],
      [{ value: 'Potência Nominal (VA)' }],
      [{ value: 'Autonomia Nominal (min)' }],
      [{ value: 'Corrente Elétrica de Entrada (A)' }],
      [{ value: 'Corrente Elétrica de Saída (A)' }],
      [{ value: 'Capacidade Nominal da Bateria (Ah)' }],
      [{ value: 'Ativo associado' }],
      [{ value: 'Dispositivo associado' }],
      [{ value: 'Porta do Dispositivo associado' }],
      [{ value: 'Foto DMT' }],
      [{ value: 'Foto Utilitário' }],
    ],

    illumination: [
      [{ value: '' }],
      [{ value: 'Tipo de Solução' }],
      [{ value: 'Unidade' }],
      [{ value: 'ID do Utilitário' }],
      [{ value: 'Nome do Utilitário' }],
      [{ value: 'Tensão da Rede (VAC)' }],
      [{ value: 'Corrente da Rede Elétrica (A)' }],
      [{ value: 'Dispositivo associado' }],
      [{ value: 'Porta do Dispositivo associado' }],
      [{ value: 'Feedback do DAL ou DMT' }],
      [{ value: 'Foto DAL ou DMT' }],
      [{ value: 'Foto Utilitário' }],
    ],
  };

  const required = {
    energy: [
      [{ value: 'Obrigatório' }],
      [{ value: 'Sim' }],
      [{ value: 'Sim' }],
      [{ value: 'Sim' }],
      [{ value: 'Obrigatório para edição' }],
      [{ value: 'Sim' }],
      [{ value: 'Obrigatório para edição' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não obrigatório para cadastro. Obrigatório caso tenha Dispositivo' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Obrigatório se Aplicação = VAV' }],
      [{ value: 'Obrigatório se Aplicação = VAV/Fancoil' }],
      [{ value: 'Obrigatório se Aplicação = VAV/Fancoil' }],
      [{ value: 'Obrigatório se Aplicação = VAV/Fancoil' }],
      [{ value: 'Obrigatório se Aplicação = VAV/Fancoil' }],
      [{ value: 'Obrigatório se Modelo do Termostato = BAC-6000 AMLN' }],
      [{ value: 'Obrigatório se Aplicação = VAV' }],
      [{ value: 'Não' }],
      [{ value: 'Obrigatório se Aplicação = Fancoil' }],
      [{ value: 'Obrigatório se Aplicação = Fancoil' }],
    ],
    machine: [
      [{ value: 'Obrigatório' }],
      [{ value: 'Sim' }],
      [{ value: 'Sim' }],
      [{ value: 'Não obrigatório para cadastro.' }, { value: 'Obrigatório para edição' }],
      [{ value: 'Sim' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não obrigatório para cadastro.' }, { value: 'Obrigatório para edição' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
    ],
    water: [
      [{ value: 'Obrigatório' }],
      [{ value: 'Sim' }],
      [{ value: 'Sim' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
    ],
    unit: [
      [{ value: 'Obrigatório' }],
      [{ value: 'Sim' }],
      [{ value: 'Apenas para edição' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Apenas para cadastro' }],
      [{ value: 'Sim' }],
      [{ value: 'Sim' }],
      [{ value: 'Sim' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
    ],
    environment: [
      [{ value: 'Obrigatório' }],
      [{ value: 'Sim' }],
      [{ value: 'Sim' }],
      [{ value: '' }],
      [{ value: 'Não' }],
      [{ value: 'Sim' }],
      [{ value: 'Não' }],
    ],
    illumination: [
      [{ value: 'Obrigatório' }],
      [{ value: 'Sim' }],
      [{ value: 'Sim' }],
      [{ value: 'Não obrigatório para cadastro. Obrigatório na edição' }],
      [{ value: 'Sim' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
    ],
    nobreak: [
      [{ value: 'Obrigatório' }],
      [{ value: 'Sim' }],
      [{ value: 'Sim' }],
      [{ value: 'Apenas para edição' }],
      [{ value: 'Apenas para criação' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
      [{ value: 'Não' }],
    ],
  };

  const restrict = {
    energy: [
      [{ value: 'Restrições' }],
      [{ value: 'Deve ser um dos valores tabelados.' }],
      [{ value: 'Deve ser um dos valores tabelados.' }],
      [{ value: 'Deve ser um dos valores tabelados.' }],
      [{ value: 'Incremental gerado pelo dash para edição.' }],
      [{ value: '' }],
      [{ value: 'Incremental gerado pelo dash para edição.' }],
      [{ value: 'Ao colocar um dispositivo que não existe, este é criado.' }, { value: 'Deve começar com DRI' }],
      [{ value: 'Só se aplica a Medidor de Energia' }],
      [{ value: 'Deve ser um dos valores tabelados.' }, { value: 'Só se aplica a Medidor de Energia' }],
      [{ value: 'Só se aplica a Medidor de Energia.' }, { value: 'Deve ser um dos valores tabelados.' }],
      [{ value: 'Para os modelos ET330 e EM210 deve ser um dos valores tabelados' }],
      [{ value: '' }],
      [{ value: 'Ao colocar uma nova foto, a foto antiga é sobrescrita.' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: 'Deve ser um dos valores tabelados.' }],
      [{ value: 'Deve ser um dos valores tabelados.' }],
      [{ value: '' }],
      [{ value: 'Deve ser um dos valores tabelados.' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: 'Deve ser um dos valores tabelados.' }],
      [{ value: '' }],
    ],
    machine: [
      [{ value: 'Restrições' }],
      [{ value: 'Deve ser um dos valores tabelados.' }],
      [{ value: 'Deve ser um dos valores tabelados.' }],
      [{ value: 'Deve ser um dos valores tabelados.' }],
      [{ value: 'Para criar uma máquina, deve ser um nome diferente das demais máquinas.' }],
      [{ value: 'A data deve estar como texto = DD/MM/AAAA' }],
      [{ value: 'Deve ser um dos valores tabelados.' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: 'Deve ser um dos valores tabelados.' }],
      [{ value: '' }],
      [{ value: 'Ao colocar uma nova foto, a foto antiga é sobrescrita.' }],
      [
        { value: 'Ao colocar um dispositivo que não existe, este é criado.' },
        { value: 'O dispositivo não pode estar associado a outro cliente,  exceto quando o cliente é o fabricante.' },
        { value: 'Se for DRI, não pode automatizar mais de uma máquina.' },
        { value: 'Se for DUT, deve estar também no DUT de Referência' },
      ],
      [{ value: 'Deve ser um dos valores tabelados.' }],
      [{ value: 'Necessário apenas para Posicionamento DUO.' }],
      [{ value: 'Deve ser um dos valores tabelados.' }],
      [{ value: 'Deve ser um dos valores tabelados.' }],
      [{ value: 'Deve ser um dos valores tabelados. Necessário apenas para Posicionamento do DAM DUO' }],
      [{ value: 'Deve ser um dos valores tabelados. Necessário apenas para Posicionamento do DAM DUO' }],
      [{ value: 'Ao colocar uma nova foto, a foto antiga é sobrescrita.' }],
      [{ value: 'Ao colocar um dispositivo que não existe, este é criado. ' }],
      [{ value: 'Ao colocar uma nova foto, a foto antiga é sobrescrita.' }],
      [{ value: '' }],
      [{ value: 'Deve ser um dos valores tabelados.' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: 'Deve ser um dos valores tabelados.' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: 'Deve ser um dos valores tabelados.' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: 'Deve ser um dos valores tabelados.' }],
      [{ value: 'Ao colocar uma nova foto, a foto antiga é sobrescrita.' }],
      [{ value: 'Ao colocar um dispositivo que não existe, este é criado.' }],
      [{ value: '' }],
      [{ value: 'Deve ser um dos valores tabelados.' }],
      [{ value: 'Deve ser um dos valores tabelados.' }],
      [{ value: 'Deve ser um dos valores tabelados.' }],
      [{ value: 'Deve ser um dos valores tabelados.' }],
      [{ value: 'Ao colocar uma nova foto, a foto antiga é sobrescrita.' }],
      [{ value: '' }],
    ],
    water: [
      [{ value: 'Restrições' }],
      [{ value: 'Deve ser um dos valores tabelados.' }],
      [{ value: 'Deve ser um dos valores tabelados.' }],
      [{ value: 'Ao colocar um dispositivo que não existe, este é criado.' }, { value: 'Deve começar com DMA' }],
      [{ value: '' }],
      [{ value: 'Ao colocar um local que não existe, este é criado.' }],
      [{ value: 'Se não preencher, coloca a data atual.' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: 'Ao colocar uma nova foto, a foto antiga é sobrescrita.' }],
    ],
    unit: [
      [{ value: 'Restrições' }],
      [{ value: 'Deve ser um dos valores tabelados' }],
      [{ value: 'Deve ser um dos valores tabelados' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: 'Deve ser um dos valores tabelados' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: 'Deve ser um dos valores tabelados.' }, { value: 'Lista de fuso horários com o offset entre parênteses.' }],
      [{ value: 'O valor deve estar em m²' }],
      [{ value: 'O valor padrão é "Em instalação".' }, { value: 'Em operação.' }],
      [{ value: 'Deve estar no formato: -XX.XXXXXXXXXXXXXXXX, -XX.XXXXXXXXXXXXXXXX,' }],
      [{ value: 'O endereço é convertido em Latitude e Longitude' }],
      [{ value: 'Ao colocar um novo valor, o valor antigo é sobrescrito' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: 'Ao colocar uma nova foto, a foto antiga é sobrescrita.' }],
    ],
    environment: [
      [{ value: 'Restrições' }],
      [{ value: 'Deve ser um dos valores tabelados.' }],
      [{ value: 'Deve ser um dos valores tabelados.' }],
      [{ value: 'Ao colocar um dispositivo que não existe, este é criado.' }, { value: 'Deve começar com DUT' }],
      [{ value: 'Ao colocar uma nova foto, a foto antiga é sobrescrita.' }],
      [{ value: '' }],
      [{ value: 'Deve ser um dos valores tabelados.' }],
    ],
    illumination: [
      [{ value: 'Restrições' }],
      [{ value: 'Deve ser um dos valores tabelados.' }],
      [{ value: 'Deve ser um dos valores tabelados.' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: 'Deve ser um dos valores tabelados.' }],
      [{ value: '' }],
      [{ value: 'Ao colocar um dispositivo que não existe, este é criado. Deve começar com DAL, DMT ou DAM. Se o dispositivo já existir, deve ser da mesma unidade e possuir menos de 4 circuitos de iluminação associados a ele.' }],
      [{ value: 'Deve ser 1,2,3 ou 4 e precisa estar desocupada.' }],
      [{ value: 'Deve ser 1,2,3 ou 4 e precisa estar desocupada.' }],
      [{ value: 'Ao colocar uma nova foto, a foto antiga é sobrescrita.' }],
      [{ value: 'Ao colocar uma nova foto, a foto antiga é sobrescrita.' }],
    ],
    nobreak: [
      [{ value: 'Restrições' }],
      [{ value: 'Deve ser um dos valores tabelados.' }],
      [{ value: 'Deve ser um dos valores tabelados.' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: 'Deve ser um dos valores tabelados.' }],
      [{ value: 'Deve ser um dos valores tabelados.' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: 'Ao colocar uma nova foto, a foto antiga é sobrescrita.' }],
      [{ value: 'Ao colocar uma nova foto, a foto antiga é sobrescrita.' }],
    ],
  };

  const valuesDefault = {
    aplicationMachine: ['AR-CONDICIONADO', 'CÂMARA FRIA', 'CHILLER', 'Cortina de ar', 'FANCOIL', 'Trocador de Calor'],
    dutDuoSensors: ['Retorno, Insuflação', 'Insuflação, Retorno'],
    sensorsTypes: ['pliq', 'psuc'],
    aplicationEnergy: ['Medidor de Energia', 'Carrier ECOSPLIT', 'Fancoil', 'VAV'],
    thermostatModels: [{ label: 'BAC-2000', value: 'BAC-2000' }, { label: 'BAC-6000', value: 'BAC-6000' }, { label: 'BAC-6000 AMLN', value: 'BAC-6000-AMLN' }],
    valveTypes: ['Válvula Proporcional 0-10V', 'Válvula Fixa On-Off'],
    hydrometerModels: ['Elster S120 (1 L/pulso)', 'ZENNER ETKD-P-N (10 L/pulso)', 'ZENNER MTKD-AM-I (10 L/pulso)', 'Saga Unijato US-1.5 (1 L/pulso)', 'Saga Unijato US-3.0 (1 L/pulso)', 'Saga Unijato US-5.0 (1 L/pulso)'],
    installationType: ['Para os modelos ET330 e EM210:', 'Rede Bifásica', 'Rede Trifásica sem neutro', 'Rede Trifásica com neutro'],
    inputVoltage: ['127', '220', '380'],
    outVoltage: ['127', '220'],
    tensaoRede: ['127', '220', '380'],
    damInstallationLocation: ['Casa de Máquina', 'Ambiente Refrigerado', 'Outros'],
    damPlacement: [{ label: 'Retorno', value: 'RETURN' }, { label: 'DUO', value: 'DUO' }],
    damDuoSensors: [{ label: 'Retorno', value: 'RETURN' }, { label: 'Insuflação', value: 'INSUFFLATION' }],
    equipmentPower: ['380V / 3F / 60Hz', '220V / 3F / 60Hz', '220V / 1F / 60Hz'],
  };

  function separateData() {
    if (comboOpts.units) {
      comboOpts.units.map((unit: {value: number, label: string}, index) => {
        if (index !== 0) {
          unitMachineIds.push(' ');
          unitMachineLabel.push(' ');
          unitMachineIds.push('x');
          unitMachineLabel.push('x');
          unitMachine.push('x');
        }
        unitMachine.push(unit.label);
        (comboOpts.groups || []).filter((x) => x.unit === unit.value).map((machine) => {
          unitMachineLabel.push(machine.label);
          unitMachineIds.push(String(machine.value));
          unitMachine.push(' ');
        });
      });
    }
  }

  async function getTimezones() {
    try {
      const { list } = await apiCall('/get-timezones-list-with-offset', {});
      setTimezonesList(list.map((item) => ({
        label: `${item.area} - (${item.offset})`,
        value: item.id,
      })));
    } catch (err) {
      console.log('error timezones');
    }
  }

  useEffect(() => {
    separateData();
    getTimezones();
  }, []);

  function tranformeArrayInValue(array, type?: string) {
    if (array) {
      if (type === 'label') {
        return array.map((item) => ({ value: item.label }));
      }
      if (type === 'value') {
        return array.map((item) => ({ value: item.value }));
      }
      return array.map((item) => ({ value: item }));
    }
    return [{ value: '' }];
  }

  const valuesTable = {
    energy: [
      [{ value: 'Valores Tabelados' }],
      [{ value: 'Energia' }],
      tranformeArrayInValue(comboOpts.units, 'label'),
      tranformeArrayInValue(valuesDefault.aplicationEnergy),
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      energyOpts ? energyOpts.map((row) => ({ value: row.NAME })) : [{ value: '' }],
      currentCapacityOpts,
      tranformeArrayInValue(valuesDefault.installationType),
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      tranformeArrayInValue(comboOpts.vavs, 'label'),
      tranformeArrayInValue(valuesDefault.thermostatModels, 'label'),
      tranformeArrayInValue(comboOpts.vavs, 'label'),
      [{ value: '' }],
      tranformeArrayInValue(valuesDefault.valveTypes),
      tranformeArrayInValue(comboOpts.vavs, 'label'),
      [{ value: '' }],
      tranformeArrayInValue(comboOpts.fancoilsManuf, 'label'),
      [{ value: '' }],
    ],
    machine: [
      [{ value: 'Valores Tabelados' }],
      [{ value: 'Máquina' }],
      tranformeArrayInValue(unitMachine),
      tranformeArrayInValue(unitMachineIds),
      tranformeArrayInValue(unitMachineLabel),
      [{ value: '' }],
      tranformeArrayInValue(valuesDefault.aplicationMachine),
      tranformeArrayInValue(comboOpts.types, 'label'),
      tranformeArrayInValue(comboOpts.brands, 'label'),
      tranformeArrayInValue(comboOpts.fluids, 'label'),
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      tranformeArrayInValue(comboOpts.dutPlacement, 'label'),
      tranformeArrayInValue(valuesDefault.dutDuoSensors),
      tranformeArrayInValue(valuesDefault.damInstallationLocation),
      tranformeArrayInValue(valuesDefault.damPlacement, 'label'),
      tranformeArrayInValue(valuesDefault.damDuoSensors, 'label'),
      tranformeArrayInValue(valuesDefault.damDuoSensors, 'label'),
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      comboOpts.rtypes ? comboOpts.rtypes.map((row) => ({ value: row.RTYPE_NAME })) : [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      tranformeArrayInValue(comboOpts.roles, 'label'),
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      tranformeArrayInValue(comboOpts.evaporatorModels, 'label'),
      [{ value: '' }],
      [{ value: '' }],
      tranformeArrayInValue(valuesDefault.equipmentPower),
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      tranformeArrayInValue(comboOpts.psens, 'label'),
      tranformeArrayInValue(valuesDefault.sensorsTypes),
      tranformeArrayInValue(comboOpts.psens, 'label'),
      tranformeArrayInValue(valuesDefault.sensorsTypes),
      [{ value: '' }],
      [{ value: '' }],
    ],
    water: [
      [{ value: 'Valores Tabelados' }],
      [{ value: 'Água' }],
      tranformeArrayInValue(comboOpts.units, 'label'),
      [{ value: '' }],
      tranformeArrayInValue(valuesDefault.hydrometerModels),
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
    ],
    unit: [
      [{ value: 'Valores Tabelados' }],
      [{ value: 'Unidade' }],
      tranformeArrayInValue(comboOpts.units, 'value'),
      [{ value: '' }],
      [{ value: '' }],
      tranformeArrayInValue(comboOpts.units, 'label'),
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      tranformeArrayInValue(timezoneList, 'label'),
      [{ value: '' }],
      [{ value: 'Em produção' }, { value: 'Em instalação' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
    ],
    environment: [
      [{ value: 'Valores Tabelados' }],
      [{ value: 'Ambientes' }],
      tranformeArrayInValue(comboOpts.units, 'label'),
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      comboOpts.rtypes ? comboOpts.rtypes.map((row) => ({ value: row.RTYPE_NAME })) : [{ value: '' }],
    ],
    illumination: [
      [{ value: 'Valores Tabelados' }],
      [{ value: 'Iluminação' }],
      tranformeArrayInValue(comboOpts.units, 'label'),
      [{ value: '' }],
      [{ value: '' }],
      tranformeArrayInValue(valuesDefault.tensaoRede),
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
    ],
    nobreak: [
      [{ value: 'Valores Tabelados' }],
      [{ value: 'Nobreak' }],
      tranformeArrayInValue(comboOpts.units, 'label'),
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      tranformeArrayInValue(valuesDefault.inputVoltage),
      tranformeArrayInValue(valuesDefault.outVoltage),
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
      [{ value: '' }],
    ],
  };

  return (
    <TableContainer>
      <Table>
        {
          typeOfSolution && (
            <>
              <ValuesTableTable valuesTable={typeSolutionHeader[typeOfSolution]} typeHeader={typeOfSolution.length > 0} typeOfSolution={typeOfSolution} />
              <tbody>
                <tr>
                  <ValuesTableTable valuesTable={required[typeOfSolution]} typeHeader={typeOfSolution.length < 0} typeOfSolution={typeOfSolution} />
                </tr>
                <tr>
                  <ValuesTableTable valuesTable={restrict[typeOfSolution]} typeHeader={typeOfSolution.length < 0} typeOfSolution={typeOfSolution} />
                </tr>
                <ValuesTableTable valuesTable={valuesTable[typeOfSolution]} typeHeader={typeOfSolution.length < 0} typeOfSolution={typeOfSolution} />
              </tbody>
            </>
          )
        }
      </Table>
    </TableContainer>
  );
};

function ValuesTableTable({ valuesTable, typeHeader, typeOfSolution }) {
  function verifyParam(value: { value: string | number }, index) {
    if (typeOfSolution === 'machine') {
      if (value.value === ' ') {
        return (
          <tr
            key={`params ${value.value} ${index}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'initial',
              textAlign: 'center',
              marginBottom: '22px',
            }}
          >
            {value.value}
          </tr>
        );
      }
      if (value.value === 'x') {
        return (
          <tr
            key={value.value}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'initial',
              textAlign: 'center',
              marginTop: '10px',
            }}
          />
        );
      }
      return (
        <tr
          key={`params ${value.value} ${index}`}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'initial',
            textAlign: 'center',
          }}
        >
          {value.value}
        </tr>
      );
    }
    return (
      <tr
        key={`params ${value.value} ${index}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'initial',
          textAlign: 'center',
        }}
      >
        {value.value}
      </tr>
    );
  }

  function tableValuesCell(param: {value: string | number}[]) {
    return (
      <th style={{
        fontWeight: 'normal',
        alignItems: 'initial',
        textAlign: 'center',
        flexDirection: 'column',
      }}
      >
        { param.map((value, index) => verifyParam(value, index)) }
      </th>
    );
  }

  function tableValuesHeader(param: {value: string | number}[]) {
    return (
      <th style={{
        alignItems: 'initial',
        textAlign: 'center',
        flexDirection: 'column',
      }}
      >
        { param.map((value, index) => (
          <tr
            key={`header ${value.value} ${index}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'initial',
              textAlign: 'center',
            }}
          >
            {value.value}
          </tr>
        ))}
      </th>
    );
  }

  if (typeHeader) {
    return (
      valuesTable.map((values) => (
        <>
          {tableValuesHeader(values)}
        </>
      ))
    );
  }

  return (
    valuesTable.map((values) => (
      <>
        {tableValuesCell(values)}
      </>
    ))
  );
}

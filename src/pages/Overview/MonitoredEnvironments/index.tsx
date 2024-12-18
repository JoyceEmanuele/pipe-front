import { useState, useEffect } from 'react';

import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import { Loader, EmptyWrapper } from '~/components';
import { HighTemperatureIcon, LowTemperatureIcon } from '~/icons';
import { apiCall } from '~/providers';

import {
  IconWrapper,
  TotalEnvironments,
  EnvironmentStatus,
  EnvironmentLastResults,
  TemperatureType,
  TextWrapper,
  DUTName,
  MonitoredEnvironments,
} from './styles';

const maxValue = (duts) => duts.reduce((acc, cur) => (acc.Temperature > cur.Temperature ? acc : cur), duts[0]);
const minValue = (duts) => duts.reduce((acc, cur) => (acc.Temperature < cur.Temperature ? acc : cur), duts[0]);

const MonitoredMachEnvironments = ({ monitoredDuts }) => {
  const dutsLength = monitoredDuts.length;
  const [isLoading, setIsLoading] = useState(true);
  const [lowestDutInfo, setLowestDutInfo] = useState({ DEV_ID: null, Temperature: null });
  const [highestDutInfo, setHighestDutInfo] = useState({ DEV_ID: null, Temperature: null });

  const getAllDutsInfo = async () => {
    try {
      if (monitoredDuts.length) {
        const max = maxValue(monitoredDuts);
        const min = minValue(monitoredDuts);

        const [highest, lowest] = await Promise.all([
          apiCall('/dut/get-dut-info', { DEV_ID: max.DEV_ID }),
          apiCall('/dut/get-dut-info', { DEV_ID: min.DEV_ID }),
        ]);
        // @ts-ignore
        setHighestDutInfo({ ...highest.info, Temperature: max.Temperature });
        // @ts-ignore
        setLowestDutInfo({ ...lowest.info, Temperature: min.Temperature });
      }
    } catch (err) {
      toast.error(`Error: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllDutsInfo();
  }, []);

  if (isLoading) {
    return (
      <EmptyWrapper>
        <Loader variant="primary" size="large" />
      </EmptyWrapper>
    );
  }
  return (
    <MonitoredEnvironments>
      <TotalEnvironments>
        <h1>{dutsLength}</h1>
      </TotalEnvironments>
      {!!dutsLength && (
        <EnvironmentLastResults>
          {highestDutInfo && (
            <EnvironmentStatus>
              <TextWrapper>
                <TemperatureType>Maior temperatura</TemperatureType>
                <Link to={`/analise/dispositivo/${highestDutInfo.DEV_ID}/informacoes`}>
                  <DUTName>{highestDutInfo.DEV_ID}</DUTName>
                </Link>
              </TextWrapper>
              <IconWrapper>
                <HighTemperatureIcon />
                <span>
                  {highestDutInfo.Temperature}
                  °C
                </span>
              </IconWrapper>
            </EnvironmentStatus>
          )}
          {lowestDutInfo && (
            <EnvironmentStatus>
              <TextWrapper>
                <TemperatureType>Menor temperatura</TemperatureType>
                <Link to={`/analise/dispositivo/${lowestDutInfo.DEV_ID}/informacoes`}>
                  <DUTName>{lowestDutInfo.DEV_ID}</DUTName>
                </Link>
              </TextWrapper>
              <IconWrapper>
                <LowTemperatureIcon />
                <span>
                  {lowestDutInfo.Temperature}
                  °C
                </span>
              </IconWrapper>
            </EnvironmentStatus>
          )}
        </EnvironmentLastResults>
      )}
    </MonitoredEnvironments>
  );
};

export default MonitoredMachEnvironments;

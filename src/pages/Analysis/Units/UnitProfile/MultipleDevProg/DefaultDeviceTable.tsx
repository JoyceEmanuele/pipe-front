import { ReactElement, ReactNode } from 'react';
import { DevList } from './types';
import { TableBasic } from '../styles';
import { Checkbox } from 'components';

interface DefaultDeviceTableProps {
  idKey: string;
  nameKey: string;
  devsList: DevList[];
  devType: string;
  onClickSelectDevice: (dev: DevList) => void;
  selectAllDevicesElement: ReactNode;
}

export const DefaultDeviceTable = ({
  idKey,
  nameKey,
  devsList,
  devType,
  onClickSelectDevice,
  selectAllDevicesElement,
}: DefaultDeviceTableProps): ReactElement => (
  <>
    {devsList.length > 0 && (<>{selectAllDevicesElement}</>)}
    <TableBasic>
      <tbody>
        <tr>
          <th>{devType}</th>
        </tr>
      </tbody>
      {devsList.map((dev) => (
        <tbody key={dev[idKey]}>
          <tr key={dev[idKey]}>
            <td>
              <Checkbox
                label={dev[nameKey] ? `${dev[nameKey]} (${dev[idKey]})` : dev[idKey]}
                checked={dev.checked}
                onClick={onClickSelectDevice}
                alignLeft
              />
            </td>
          </tr>
        </tbody>
      ))}
    </TableBasic>
    {(devsList.length === 0) && (
      <div>{`Nenhum ${devType} disponível na unidade`}</div>
    )}
  </>
);

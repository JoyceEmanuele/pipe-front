import styled from 'styled-components';
import { ApiResps } from '~/providers';
import { colors } from '~/styles/colors';

export function CoolAutomationProfile({ devInfoResp, integrId }: {
  devInfoResp: ApiResps['/get-integration-info'],
  integrId: string
}): JSX.Element {
  return (
    <>
      {/* {(state.varsList.length > 0) && (
        <div style={{ marginTop: '25px' }}>
          <Card>
            <div style={{ fontWeight: 'bold', paddingBottom: '30px', fontSize: '1.25em' }}>Programações Adicionadas</div>
            <TableNew2 style={{ color: colors.Grey400 }}>
              <thead>
                <tr>
                  <th>Ambiente</th>
                  <th>Status</th>
                  <th>Modo</th>
                  <th>Hora Inicio</th>
                  <th>Hora Término</th>
                  <th>Temperatura</th>
                  <th>Programação</th>
                </tr>
              </thead>
              <tbody>
                // FAZER MAP dados coolautomation não inseridos
                state.varsList.map((rowVar, index) => (
                  <tr key={index}>
                    <td>{rowVar.name || '-'}</td>
                    <td>{rowVar.currVal || '-'}</td>
                    <td>{rowVar.valUnit || '-'}</td>
                    <td>{rowVar.timestamp || '-'}</td>
                    <td>{rowVar.card || '-'}</td>
                    <td>{rowVar.subcard || '-'}</td>
                    <td>{rowVar.relevance || '-'}</td>
                  </tr>
                ))
                <tr>
                  <td>COMANDO RM</td>
                  <td>Inativo</td>
                  <td>
                    <img style={{ height: '20px', width: '35px' }} src={blizzardImg} alt="" />
                  </td>
                  <td>6:00</td>
                  <td>18:00</td>
                  <td>25°C</td>
                  <td>SEG-TER-QUA-QUI-SEX-SAB-DOM</td>
                </tr>
              </tbody>
            </TableNew2>
          </Card>
        </div>
      )}

      {(state.varsList.length > 0) && (
        <div style={{ marginTop: '25px' }}>
          <Card>
            <div style={{ fontWeight: 'bold', paddingBottom: '30px', fontSize: '1.25em' }}>Dados Recebidos</div>
            <TableNew2 style={{ color: colors.Grey400 }}>
              <Theadd>
                <tr>
                  <th>ID</th>
                  <th>Variável</th>
                  <th>Valor Atual</th>
                  <th>Un. Medida</th>
                  <th>Card</th>
                  <th>Subcard</th>
                </tr>
              </Theadd>
              <TbodyScroll>
                state.varsList.map((rowVar, index) => (
                  <tr key={index}>
                    <td>{rowVar.name || '-'}</td>
                    <td>{rowVar.currVal || '-'}</td>
                    <td>{rowVar.valUnit || '-'}</td>
                    <td>{rowVar.timestamp || '-'}</td>
                    <td>{rowVar.card || '-'}</td>
                    <td>{rowVar.subcard || '-'}</td>
                    <td>{rowVar.relevance || '-'}</td>
                  </tr>
                ))
                <tr style={{ padding: '25px' }}>
                  <td>comando_rm_355</td>
                  <td>room_temp</td>
                  <td>19</td>
                  <td>Graus°C</td>
                  <td>Indoor</td>
                  <td>Comando RM355</td>
                </tr>
              </TbodyScroll>
            </TableNew2>
          </Card>
        </div>
      )} */}
    </>
  );
}

// scroll thead
const Theadd = styled.thead`

  tr {
    text-align: left;
    border-bottom: 1px solid ${colors.DarkGrey};
  }
`;

// scroll tbody
const TbodyScroll = styled.tbody`

  tr {

    td {

    }
  }
`;

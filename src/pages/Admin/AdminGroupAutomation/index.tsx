import { useEffect } from 'react';

import queryString from 'query-string';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Flex, Box } from 'reflexbox';

import {
  Loader, ModalWindow,
} from 'components';
import { useStateVar } from 'helpers/useStateVar';
import { FormEditGroup } from 'pages/ClientPanel/FormEditGroup';
import { apiCall, ApiResps } from 'providers';
import { colors } from 'styles/colors';

import { AdminLayout } from '../AdminLayout';
import {
  TableNew2,
} from './styles';
import { withTransaction } from '@elastic/apm-rum-react';

export const AdminGroupAutomation = ({ history }) => {
  const [state, render, setState] = useStateVar(() => {
    const { preFiltered } = queryString.parse(history.location.search);
    const state = {
      list: [] as ApiResps['/get-machines-automation-info']['list'],
      filteredList: [] as ApiResps['/get-machines-automation-info']['list'],
      damsListFull: [] as ApiResps['/dam/get-dams-list']['list'],
      dacsListFull: [] as ApiResps['/dac/get-dacs-list']['list'],
      dutsListFull: [] as ApiResps['/dut/get-duts-list']['list'],
      limitItems: 50,
      lastScrollHeight: 0,
      isLoading: true,
      editingGroup: null as null|{
        group: ApiResps['/get-machines-automation-info']['list'][0],
        damsList: ApiResps['/dam/get-dams-list']['list'],
        dacsList: ApiResps['/dac/get-dacs-list']['list'],
        dutsList: ApiResps['/dut/get-duts-list']['list'],
      },
    };

    return state;
  });

  function openEditGroup(groupId: number) {
    const group = groupId && state.list.find((row) => row.GROUP_ID === groupId) || null;
    if (!group) {
      state.editingGroup = null;
      return;
    }
    state.editingGroup = {
      group,
      dacsList: state.dacsListFull.filter((dac) => (dac.UNIT_ID === group.UNIT_ID) && ((dac.GROUP_ID == null) || (dac.GROUP_ID === group.GROUP_ID))),
      dutsList: state.dutsListFull.filter((dut) => dut.UNIT_ID === group.UNIT_ID),
      damsList: state.damsListFull.filter((dam) => dam.UNIT_ID === group.UNIT_ID),
    };
    state.editingGroup.damsList = state.editingGroup.damsList.filter((dam) => {
      const dac = dam.isDac && state.editingGroup!.dacsList.find((dac) => dac.DAC_ID === dam.DAM_ID) || null;
      if (dac && dac.GROUP_ID !== group.GROUP_ID) return false;
      return true;
    });
    render();
  }

  async function handleGetData() {
    try {
      setState({ isLoading: true });
      const [
        { list },
        { list: damsListFull },
        { list: dacsListFull },
        { list: dutsListFull },
      ] = await Promise.all([
        apiCall('/get-machines-automation-info', {}),
        apiCall('/dam/get-dams-list', { includeDacs: true }),
        apiCall('/dac/get-dacs-list', {}),
        apiCall('/dut/get-duts-list', {}),
      ]);
      state.list = list;
      state.damsListFull = damsListFull;
      state.dacsListFull = dacsListFull;
      state.dutsListFull = dutsListFull;
      state.filteredList = state.list.filter((x) => x.problemsFound && x.problemsFound.length);
    } catch (err) {
      console.log(err);
      toast.error('Houve erro');
    }
    setState({ isLoading: false });
  }

  useEffect(() => {
    handleGetData();
  }, []);

  useEffect(() => {
    function onScroll() {
      if (!state.limitItems) return;
      if (state.limitItems >= state.filteredList.length) return;
      const scrollBottom = document.documentElement.scrollTop + window.innerHeight;
      const distanceToEnd = document.documentElement.offsetHeight - scrollBottom;
      if (!(distanceToEnd < 500)) return;
      if (state.lastScrollHeight >= document.documentElement.offsetHeight) return;
      setState({
        limitItems: state.limitItems + 200,
        lastScrollHeight: document.documentElement.offsetHeight,
      });
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <Helmet>
        <title>Diel Energia - Máquinas</title>
      </Helmet>
      <AdminLayout />
      {state.isLoading && <Loader variant="primary" />}
      {(!state.isLoading) && (
        <>
          {state.editingGroup && (
            <ModalWindow onClickOutside={() => setState({ editingGroup: null })}>
              <FormEditGroup
                groupInfo={state.editingGroup.group}
                clientId={state.editingGroup.group.CLIENT_ID}
                dutsList={state.editingGroup.dutsList}
                damsList={state.editingGroup.damsList}
                dacsList={state.editingGroup.dacsList}
                onCancel={() => setState({ editingGroup: null })}
                onSuccess={() => { toast.success('Atualize a página'); setState({ editingGroup: null }); }}
              />
            </ModalWindow>
          )}
          <Flex flexWrap="wrap">
            <Box width={1}>
              <TableNew2 style={{ color: colors.Grey400 }}>
                <thead>
                  <tr>
                    <th>CLIENT_NAME</th>
                    <th>UNIT_NAME</th>
                    <th>GROUP_NAME</th>
                    <th>dacs</th>
                    <th>DAM_ID</th>
                    <th>DUT_ID</th>
                    <th>problemsFound</th>
                  </tr>
                </thead>
                <tbody>
                  {state.filteredList.filter((x, i) => (i < state.limitItems)).map((group) => (
                    <tr key={group.GROUP_ID}>
                      <td>{group.CLIENT_NAME}</td>
                      <td>{group.UNIT_NAME}</td>
                      <td>
                        <span style={{ cursor: 'pointer' }} onClick={() => openEditGroup(group.GROUP_ID)}>
                          {group.GROUP_NAME}
                        </span>
                      </td>
                      <td>
                        {group.dacs.map((dac) => (
                          <div key={dac.DAC_ID}>
                            <Link to={`/analise/dispositivo/${dac.DAC_ID}/editar`}>
                              {dac.DAC_ID}
                            </Link>
                            {dac.automationEnabled && ' (aut)'}
                          </div>
                        )) || '-'}
                      </td>
                      <td>
                        {group.DEV_AUT && (
                          <Link to={`/analise/dispositivo/${group.DEV_AUT}/editar`}>
                            {group.DEV_AUT}
                          </Link>
                        ) || '-'}
                        {group.DAM_DUT_REF && (
                          <Link to={`/analise/dispositivo/${group.DAM_DUT_REF}/editar`}>
                            {` (${group.DAM_DUT_REF})`}
                          </Link>
                        )}
                      </td>
                      <td>
                        {group.DUT_ID && (
                          <div>
                            <Link to={`/analise/dispositivo/${group.DUT_ID}/editar`}>
                              {group.DUT_ID}
                            </Link>
                            {group.dutAutomationEnabled && ' (aut)'}
                          </div>
                        ) || '-'}
                      </td>
                      <td>
                        {group.problemsFound && group.problemsFound.map((problem) => <div key={problem}>{problem}</div>)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </TableNew2>
              {(state.limitItems < state.filteredList.length)
                && (
                <p>
                  Carregando mais itens... (
                  {state.limitItems}
                  {' '}
                  /
                  {' '}
                  {state.filteredList.length}
                  )
                </p>
                )}
            </Box>
          </Flex>
        </>
      )}
    </>
  );
};

export default withTransaction('AdminGroupAutomation', 'component')(AdminGroupAutomation);

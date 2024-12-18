import posthog from 'posthog-js';
import { ApiResps, apiCall } from '../providers';

import jsonTryParse from './jsonTryParse';
import { UserPermissions } from '~/providers/types/api-private';

type ProfileServer = ApiResps['/my-profile']
export type Profile = ProfileServer & {
  isTracker?: boolean
  fullName?: null|string
  isLogged?: boolean
  prefsObj: {
    pressureUnit?: 'bar'|'psi',
    language?: 'pt'| 'en',
    water?: 'liters'|'cubic',
    tour_finished?: boolean,
    viewTratedData?: boolean,
  }
  manageSomeClient?: boolean
  manageMultipleClients?: boolean
  manageAllClients?: boolean
  viewAllClients?: boolean
  viewMultipleClients?: boolean
  singleClientViewId?: number
  isUserManut?: boolean
  adminClientProg?: { UNIT_MANAGE: number[], CLIENT_MANAGE: number[] }
  permissions: ProfileServer['permissions'] & { CLIENT_MANAGE: number[] }
}

function verifyPermissions(profile: Profile, permissions: UserPermissions & {
  CLIENT_MANAGE: number[];
}) {
  profile.permissions.CLIENT_MANAGE = permissions.PER_CLIENT
    .filter((x) => (x.p.includes('[C]') || x.p.includes('[CP]') || x.p.includes('[M]') || x.p.includes('[I]')))
    .map((x) => x.clientId);
  profile.manageAllClients = permissions.isAdminSistema || permissions.isParceiroValidador;
  const CLIENT_VIEW = permissions.PER_CLIENT.map((x) => x.clientId);
  profile.manageSomeClient = permissions.MANAGE_ALL_CLIENTS_AND_DACS || (permissions.CLIENT_MANAGE.length > 0);
  profile.manageMultipleClients = permissions.MANAGE_ALL_CLIENTS_AND_DACS || (permissions.CLIENT_MANAGE.length > 1);
  profile.viewAllClients = permissions.VIEW_ALL_CLIENTS_DACS_GROUPS_UNITS;
  profile.viewMultipleClients = permissions.VIEW_ALL_CLIENTS_DACS_GROUPS_UNITS || (CLIENT_VIEW.length > 1);
  profile.adminClientProg = {
    UNIT_MANAGE: permissions.PER_UNIT?.filter((x) => x.p.some((profile) => profile.includes('[CP]')))
      .flatMap((x) => x.units.map((y) => y)) || [],

    CLIENT_MANAGE: permissions.PER_CLIENT
      .filter((x) => x.p.includes('[CP]'))
      .map((x) => x.clientId),
  };

  if ((!profile.viewMultipleClients) && CLIENT_VIEW.length === 1) {
    profile.singleClientViewId = CLIENT_VIEW[0];
  }
  profile.isUserManut = permissions.isUserManut;
}

export function getUserProfile(): Profile {
  try {
    const token = localStorage.getItem('@diel:token');
    const profile: Profile = JSON.parse(localStorage.getItem('@diel:profile') || '{}');
    if ((!token) || (!profile.user)) { profile.user = null as any; }
    if (!profile.fullName) { profile.fullName = null; }
    if (!profile.permissions) {
      profile.permissions = {
        // CLIENT_VIEW: [],
        CLIENT_MANAGE: [],
        PER_CLIENT: [],
      };
    }
    profile.isLogged = !!profile.user;
    profile.prefsObj = jsonTryParse(profile.prefs || '{}') || {};

    if (token && !profile.isLogged) {
      localStorage.removeItem('@diel:token');
    }

    const { permissions } = profile;
    // if (!permissions.CLIENT_MANAGE) { permissions.CLIENT_MANAGE = []; }
    // if (!permissions.CLIENT_VIEW) { permissions.CLIENT_VIEW = []; }
    if (!permissions.PER_CLIENT) { permissions.PER_CLIENT = []; }
    verifyPermissions(profile, permissions);
    return profile;
  } catch (err) {
    return {
      token: null as any,
      user: null as any,
      name: null,
      lastName: null,
      prefs: null,
      notifsby: null,
      phonenb: null,
      permissions: {
        CLIENT_MANAGE: [],
        // CLIENT_VIEW: [],
        PER_CLIENT: [],
      },
      prefsObj: {},
    };
  }
}

// export async function fetchUserProfile () {
//   localStorage.getItem('@diel:token')
//   const profile = await api['/get-profile']({})
//   delete profile.token
//   profile.fullName = `${profile.name || ''} ${profile.lastName || ''}`.trim()
//   profile.prefs = (profile.prefs && JSON.parse(profile.prefs)) || null
//   localStorage.setItem('@diel:profile', JSON.stringify(profile))
// }

export async function fetchServerData(CLIENT_VIEW: number[]) {
  const clientes : string[] = [];
  for (let index = 0; index < CLIENT_VIEW.length; index++) {
    const reqParams = { CLIENT_ID: CLIENT_VIEW[index] };
    const { client } = await apiCall('/clients/get-client-info', reqParams);
    clientes.push(client.NAME);
  }
  localStorage.setItem('clients', JSON.stringify(clientes));
}

export async function refreshUserProfile() {
  const profile: ProfileServer = await apiCall('/my-profile', {});
  localStorage.setItem('@diel:token', profile.token);
  setUpdatedProfile(profile); // localStorage.setItem('@diel:profile', JSON.stringify(profile));
  posthog.reset();
}

export function setUpdatedProfile(profile: ProfileServer) {
  localStorage.setItem('@diel:profile', JSON.stringify({ ...profile, token: undefined }));
}

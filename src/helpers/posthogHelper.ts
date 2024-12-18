import posthog from 'posthog-js';
import { Profile } from './userProfile';

export const identifyUser = (user: Profile) => {
  posthog.identify(user.user, {
    email: user.user,
    name: user.name,
    maintainer: user.permissions.isUserManut || false,
    admin: user.permissions.isAdminSistema || false,
    instalador: user.permissions.isInstaller || false,
    validator: user.permissions.isParceiroValidador || false,
  });
};

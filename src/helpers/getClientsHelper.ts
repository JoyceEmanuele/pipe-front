import { apiCall } from '~/providers';

export const getUserClientId = async ({ profile, setClientIds }) => {
  try {
    const { profiles_v2 } = await apiCall('/users/get-user-info', { userId: profile.user });
    setClientIds([...profiles_v2.map((p) => p.clientId), ...profile.permissions.PER_CLIENT.map((c) => (c.clientId))]);
  } catch (err) {
    console.log(err);
    setClientIds([]);
  }
};

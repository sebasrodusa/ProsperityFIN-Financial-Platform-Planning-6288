import { DEFAULT_AVATAR_URL } from './constants';

export function getProfileImageUrl(user) {
  return user?.profileImageUrl || user?.avatar || DEFAULT_AVATAR_URL;
}

export const DEFAULT_AVATAR =
  'https://media.publit.io/file/c_fill,h_200,w_300/pfiw5twH.jpg';

export function getProfileImageUrl(user) {
  return user?.profileImageUrl || user?.avatar || DEFAULT_AVATAR;
}

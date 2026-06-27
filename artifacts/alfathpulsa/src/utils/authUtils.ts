import { AppUser } from '../api';

export const checkIsBos = (user: AppUser | null | undefined, role: string | null | undefined) => {
  if (!user) return false;
  return (
    role === 'bos' ||
    user.email === 'alfathpulsa27@gmail.com'
  );
};

export const checkIsMandor = (role: string | null | undefined) => {
  return role === 'mandor';
};

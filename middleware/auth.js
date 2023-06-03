import includes from 'lodash/includes';
import store from '~/store/index';

export default function auth(to, from, next) {
  const userId = store.getters['root/user']?.id || null;

  // Exception for profile page, anyone's profile can be viewed without logging in
  if (!userId && !includes(to.path, '/profile')) {
    window.location.href = `/login?q=${to.path}`;
    return;
  }

  next();
}

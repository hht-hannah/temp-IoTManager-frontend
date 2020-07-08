export function checkAuth(auth) {
  const userAuth = localStorage.getItem('auth');
  let flag = false;
  if (userAuth) {
    auth.forEach(e => {
      if (userAuth.indexOf(e) !== -1) {
        flag = true;
      }
    });
    return flag;
  } else {
    return true;
  }
}

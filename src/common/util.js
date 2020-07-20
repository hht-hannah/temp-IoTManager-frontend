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

export function timeFormatter(time) {
  return time.split("T")[0] + " " + time.split("T")[1].split(".")[0] 
}
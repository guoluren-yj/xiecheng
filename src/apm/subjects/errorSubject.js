import getDefaultBrowser from '../utils/getDefaultBrowser';

const ERROR_SUBJECT_NAME = 'err_0';

function observeError(handle, observe) {
  const win = getDefaultBrowser();
  if (win) {
    win.addEventListener('error', handle, true);
    observe(() => {
      win.removeEventListener('error', handle, true);
    });
  }
}

const errorSubject = [ERROR_SUBJECT_NAME, observeError];

export default errorSubject;

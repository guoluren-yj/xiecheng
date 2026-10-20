import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

/**
 * 提示接口结果
*/
const operateResponseMessagePrompt = (data = {}) => {
  const {
    res = null,
    notificationConfig = {},
    errorHandle,
  } = data || {};
  let result = getResponse(res);

  if (!result) {
    if (typeof errorHandle === 'function') {
      result = errorHandle(result);
      return result;
    }
    return;
  }

  const { type = '', message = '' } = result || {};
  const commonNotification = {
    message,
    ...(notificationConfig || {}),
  };

  if (type === "info") {
    notification.info(commonNotification);
  } else if (type === "warn") {
    notification.warning(commonNotification);
  } else if (type === "error") {
    notification.error(commonNotification);
  } else {
    notification.success(commonNotification);
  }

  return result;
};

export {
  operateResponseMessagePrompt,
};

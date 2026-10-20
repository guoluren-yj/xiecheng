import intl from 'utils/intl';

import { ReactComponent as Error403 } from './imgs/403_new.svg';
import Error404 from './imgs/404_new.js';
import Error500 from './imgs/500_new.js';

const config = {
  403: {
    img: <Error403 />,
    title: '403',
    desc() {
      return intl.get('hzero.common.notification.403').d('抱歉，您无权访问该页面');
    },
  },
  404: {
    img: <Error404 />,
    title: '404',
    desc() {
      return intl.get('hzero.common.notification.404').d('抱歉，您访问的页面不存在');
    },
  },
  500: {
    img: <Error500 />,
    title: '500',
    desc() {
      return intl.get('hzero.common.notification.500').d('抱歉，服务器出错了');
    },
  },
};

export default config;

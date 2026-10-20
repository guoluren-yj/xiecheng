/*
 * @author: biao.zhu@going-link.com
 * @Date: 2024-08-22 09:53:35
 * @LastEditTime: 2024-08-22 10:09:22
 * @Description:
 * @copyright: Copyright (c) 2020, Hand
 */
import { compose } from 'lodash';

// import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import Page from './Page';

export default compose(
  // WithCustomizeC7N({
  //   // unitCode: [
  //   // ],
  //   // manualQuery: true,
  // }),
  formatterCollections({
    code: [['ssrc.findBusiness', 'ssrc.rfNotice', 'hzero.c7nProUI', 'ssrc.common']],
  })
)(Page);

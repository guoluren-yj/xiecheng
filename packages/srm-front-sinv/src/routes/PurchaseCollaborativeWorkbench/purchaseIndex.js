import { compose } from 'lodash';
import withProps from 'utils/withProps';
import cuxRemote from 'hzero-front/lib/utils/remote';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { DataSet } from 'choerodon-ui/pro';
import submitDataSet from './store/submitDs';
import affirmDataSet from './store/affirmDs';
import allDataSet from './store/allDs';
import detailAllDataSet from './store/DetailAllDs';
import detailAffirmDataSet from './store/DetailAffirmDs';

import { Index } from './index';

export default compose(
  formatterCollections({
    code: ['sinv.inventoryBench', 'hzero.common', 'slod.deliveryWorkbench'],
  }),
  WithCustomize({
    unitCode: [
      'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.WAIT.LIST',
      'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.AFFIRM.LIST',
      'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.ALL.LIST',
      'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.WAIT.SEARCH',
      'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.ALL.SEARCH',
      'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.AFFIRM.SEARCH',
      'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.AFFIRM.LIST.BTNS',
      'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.ALL.LIST.BTNS',
      'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.WAIT.LIST.BTNS',
      'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.TAB',
      'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.ALL.SEARCH',
      'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.DETAIL.ALL.SEARCH',
      'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.DETAIL.ALL.LIST',
      'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.DETAIL.ALL.LIST.BTNS',
      'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.DETAIL.AFFIRM.LIST.BTNS',
      'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.DETAIL.AFFIRM.LIST',
      'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.DETAIL.AFFIRM.LIST.BTNS',
      'SINV.PURCHASER.COLLABORATIVE.WORKBENCH.DETAIL.AFFIRM.SEARCH',
    ],
  }),
  cuxRemote(
    {
      code: 'SINV_PURCHASECOLLABORATIVEWORKBENCH_REMOTE', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
      name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
    },
    {
      process: {
        cuxPageSizeOptions: undefined,
      },
    }
  ),
  withProps(
    () => {
      const cacheTab = new Map();
      const sureSupplier = false;
      const submitDs = new DataSet(submitDataSet(sureSupplier));
      const affirmDs = new DataSet(affirmDataSet(sureSupplier));
      const allDs = new DataSet(allDataSet(sureSupplier));
      const detailallDs = new DataSet(detailAllDataSet(sureSupplier));
      const detailAffirmDs = new DataSet(detailAffirmDataSet(sureSupplier));
      return { cacheTab, submitDs, affirmDs, allDs, detailAffirmDs, detailallDs, sureSupplier };
    },
    { cacheState: true }
  )
)(Index);

import { DataSet } from 'choerodon-ui/pro';
import { compose } from 'lodash';
import withProps from 'utils/withProps';
import cuxRemote from 'hzero-front/lib/utils/remote';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import submitDataSet from './store/submitDs';
import affirmDataSet from './store/affirmDs';
import detailAllDataSet from './store/DetailAllDs';
import detailAffirmDataSet from './store/DetailAffirmDs';

import allDataSet from './store/allDs';
import { Index } from './index';

export default compose(
  formatterCollections({
    code: ['sinv.inventoryBench', 'hzero.common', 'slod.deliveryWorkbench'],
  }),
  WithCustomize({
    unitCode: [
      'SINV.SUPPLIER.COLLABORATIVE.WORKBENCH.LIST.BTNS',
      'SINV.SUPPLIER.COLLABORATIVE.WORKBENCH.AFFIRM.LIST.BTNS',
      'SINV.SUPPLIER.COLLABORATIVE.WORKBENCH.ALL.LIST.BTNS',
      'SINV.SUPPLIER.COLLABORATIVE.WORKBENCH.AFFIRM.LIST',
      'SINV.SUPPLIER.COLLABORATIVE.WORKBENCH.ALL.LIST',
      'SINV.SUPPLIER.COLLABORATIVE.WORKBENCH.WAIT.SEARCH',
      'SINV.SUPPLIER.COLLABORATIVE.WORKBENCH.WAIT.LIST',
      'SINV.SUPPLIER.COLLABORATIVE.WORKBENCH.ALL.SEARCH',
      'SINV.SUPPLIER.COLLABORATIVE.WORKBENCH.AFFIRM.SEARCH',
      'SINV.SUPPLIER.COLLABORATIVE.WORKBENCH.TAB',
      'SINV.SUPPLIER.COLLABORATIVE.WORKBENCH.ALL.SEARCH',
      'SINV.SUPPLIER.COLLABORATIVE.WORKBENCH.DETAIL.ALL.SEARCH',
      'SINV.SUPPLIER.COLLABORATIVE.WORKBENCH.DETAIL.ALL.LIST',
      'SINV.SUPPLIER.COLLABORATIVE.WORKBENCH.DETAIL.ALL.LIST.BTNS',
      'SINV.SUPPLIER.COLLABORATIVE.WORKBENCH.DETAIL.AFFIRM.LIST',
      'SINV.SUPPLIER.COLLABORATIVE.WORKBENCH.DETAIL.AFFIRM.LIST.BTNS',
      'SINV.SUPPLIER.COLLABORATIVE.WORKBENCH.DETAIL.AFFIRM.SEARCH',
    ],
  }),
  cuxRemote(
    {
      code: 'SINV_SUPPLIERCOLLABORATIVEWORKBENCH_REMOTE', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
      name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
    },
    {
      process: {
        cuxPageSizeOptions: undefined,
        cuxConfirmLineBtnsChange: undefined,
      },
    }
  ),
  withProps(
    () => {
      const cacheTab = new Map();
      const sureSupplier = true;
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

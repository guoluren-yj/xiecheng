import React, { useEffect } from 'react';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SPUC } from '_utils/config';
import { Table } from 'choerodon-ui/pro';

import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const bomDataSet = (sureSupplier) => ({
  dataToJSON: 'all',
  autoQuery: false,
  cacheSelection: true,
  cacheModified: true,
  selection: 'single',
  pageSize: 20,
  fields: [
    {
      name: 'strategyCode',
      label: intl.get(`sinv.inventoryBench.model.view.strategyCode`).d('类型编码'),
    },
    {
      name: 'strategyName',
      label: intl.get(`sinv.inventoryBench.model.view.strategyName`).d('类型描述'),
    },
    {
      name: 'cuszDocTmplCodeObj',
      type: 'object',
      label: intl.get(`sinv.inventoryBench.model.view.cuszDocTmplCode`).d('单据样式模版'),
      lovCode: 'HPFM.CUSZ.DOC_TEMPLATE_LAST',
      valueField: 'templateCode',
      textField: 'templateCode',
      dynamicProps: {
        lovPara: ({ record }) => {
          if (!record.get('processFactory')) return;
          return {
            docCode:
              record.get('processFactory') === '1'
                ? 'SINV_COLLABORATIVE_WORKBENCH_ONE_INVENTORY'
                : record.get('processFactory') === '2'
                ? 'SINV_COLLABORATIVE_WORKBENCH_TWO_ORDINARY'
                : 'SINV_COLLABORATIVE_WORKBENCH_ZERO_TRANSFER',
          };
        },
      },
    },
    {
      name: 'cuszDocTmplCode',
      type: 'string',
      bind: 'cuszDocTmplCodeObj.templateCode',
    },
    {
      name: 'processFactory',
      type: 'string',
      lookupCode: 'SPUC.SINV_STOCK_OUT_TYPE',
      label: intl.get(`sinv.inventoryBench.model.view.processFactory`).d('类型属性'),
    },
  ],
  transport: {
    read: () => {
      const flag = [1, 2].join();
      const url = sureSupplier
        ? `${SRM_SPUC}/v1/${organizationId}/stockout/strategy/page?enableFlag=1&position=SUPPLIER&processFactorys=${flag}`
        : `${SRM_SPUC}/v1/${organizationId}/stockout/strategy/page?enableFlag=1&position=PURCHASER`;
      return {
        url,
        method: 'GET',
      };
    },
  },
});

function CreateModal(params) {
  const { bomDs } = params;

  useEffect(() => {
    bomDs.query();
  }, []);

  const columns = [
    {
      name: 'strategyCode',
      width: 150,
    },
    {
      name: 'strategyName',
      width: 150,
    },
    {
      name: 'cuszDocTmplCodeObj',
      width: 150,
    },
    {
      width: 150,
      name: 'processFactory',
    },
  ];
  return (
    <>
      <Table
        dataSet={bomDs}
        columns={columns}
        style={{ maxHeight: `calc(100vh - 350px)` }}
        virtual
        virtualCell
        customizable
        customizedCode="purchase-collaborative-workbench"
      />
    </>
  );
}

export { CreateModal, bomDataSet };

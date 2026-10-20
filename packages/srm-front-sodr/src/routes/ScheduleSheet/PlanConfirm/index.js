import React, { useEffect, useMemo, useState } from 'react';
import intl from 'utils/intl';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';

import styles from './index.less';

const PlanConfirm = ({ data = [] }) => {
  const [pagination, setPagination] = useState({});
  const tableDs = useMemo(
    () =>
      new DataSet({
        data,
        pageSize: 5,
        paging: true,
        selection: false,
        dataToJSON: 'all',
        fields: [
          {
            name: 'displayPoNum',
            type: 'string',
            label: intl.get(`sodr.common.model.common.displayPoNum`).d('订单号'),
          },
          {
            name: 'lineNum',
            type: 'string',
            label: intl.get(`sodr.common.model.common.poLineId`).d('订单行号'),
          },
          {
            name: 'lineLocationNum',
            type: 'string',
            label: intl.get(`sodr.common.model.common.orderDisplayLineLocationNum`).d('订单发运号'),
          },
          {
            name: 'planQuantity',
            type: 'string',
            label: intl.get(`sodr.common.model.common.planQuantity`).d('本次计划数量'),
          },
          {
            name: 'planDate',
            type: 'date',
            label: intl.get(`sodr.common.model.common.currentPlanDate`).d('本次计划时间'),
          },
          {
            name: 'supplierCompanyName',
            type: 'string',
            label: intl.get(`sodr.common.model.common.supplierName`).d('供应商名称'),
          },
        ],
      }),
    []
  );

  useEffect(() => {
    tableDs.loadData([]);
    tableDs.loadData(data, data.length);
  }, []);

  const columns = [
    {
      name: 'displayPoNum',
      width: 140,
    },
    {
      name: 'lineNum',
      width: 72,
    },
    {
      name: 'lineLocationNum',
      width: 82,
    },
    {
      name: 'planQuantity',
      width: 102,
    },
    {
      name: 'planDate',
      width: 110,
    },
    {
      name: 'supplierCompanyName',
      width: 200,
    },
  ];

  const tip = (
    <>
      <div>
        {intl
          .get(`sodr.scheduleSheet.view.message.title.confirmDeleteWarnPlan`)
          .d(
            '以下订单涉及的排程信息存在下游单据，将执行排程取消校验，通过校验后，排程为已取消状态且将未收货部分的排程释放回订单；其他排程信息将执行排程删除逻辑，请确认是否继续执行操作'
          )}
      </div>
    </>
  );

  return (
    <div style={{ width: '692px' }}>
      <Alert
        type="info"
        message={tip}
        iconType="help"
        className={styles['sceduleSheet-top-title']}
      />
      <Table
        columns={columns}
        dataSet={tableDs}
        className={styles['sceduleSheet-confirm-table']}
        pagination={{
          ...pagination,
          //   showPager: true,
          pageSizeOptions: ['5', '10', '20', '50', '100'],
          onChange: (page, pageSize) => {
            tableDs.currentPage = page;
            tableDs.loadData(data.slice((page - 1) * pageSize, page * pageSize));
            setPagination({ page, pageSize });
          },
        }}
        style={{ maxHeight: `calc(100vh -252px)`, overflowY: 'auto' }}
      />
    </div>
  );
};

export default PlanConfirm;

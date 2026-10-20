import React, { Fragment, useEffect, useMemo } from 'react';
import type { DataSet} from 'choerodon-ui/pro';
import { Table, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';


interface FillHeadInfoProps {
  modal?: any;
  okCallback: (type: number) => void;
  backTipsListDs: DataSet;
}

const BackTipList = (props: FillHeadInfoProps) => {

  const { modal, okCallback, backTipsListDs } = props;

  useEffect(() => {
    if (modal) {
      modal.handleOk(() => okCallback(1));
      modal.update({
        title: intl.get('sbsm.paymentPool.model.paymentPool.backOperate').d('退回'),
        okText: intl.get('sbsm.paymentPool.model.paymentPool.backAll').d('全部退回'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        footer: (okBtn, cancelBtn) => [
          cancelBtn,
          <Button onClick={() => okCallback(0)}>{intl.get('sbsm.paymentPool.model.paymentPool.backPart').d('仅退回勾选行')}</Button>,
          okBtn,
        ],
      });
    };
  }, [modal, okCallback]);

  const columns: any = useMemo(() => [
    {
      name: 'payNum',
      width: 150,
    },
    {
      name: 'payStatus',
      width: 120,
    },
    {
      name: 'documentAndLineNum',
      width: 180,
    },
    {
      name: 'companyName',
      width: 190,
    },
    {
      name: 'displaySupplierName',
      width: 200,
    },
    {
      name: 'payAmount',
      width: 120,
    },
    {
      name: 'payTypeName',
      width: 120,
    },
  ], []);

  return (
    <Fragment>
      <div style={{marginBottom: '8px'}}>{intl.get('sbsm.paymentPool.model.paymentPool.backTipsOperate').d('已勾选支付事务行来源单据存在如下关联事务行，全部退回后申请人方可进行数据修改并重推，是否一并退回？')}</div>
      <Table dataSet={backTipsListDs} columns={columns} />
    </Fragment>
  );

};

export default BackTipList;

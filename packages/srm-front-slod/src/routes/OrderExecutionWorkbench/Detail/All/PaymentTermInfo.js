/*
 * All - 订单执行工作台-订单付款条款信息
 * @date: 2025/07/03 15:45:03
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2025, Hand
 */
import React, { useMemo, useEffect } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import PaymentTermInfo from 'srm-front-sodr/lib/routes/components/PaymentTermInfo';

const PaymentTermsInfo = (props) => {
  const {
    dsMap,
    headerInfo = {},
    loading,
    isSupplier,
    customizeForm,
    paymentTermInfo,
    doubleUnitEnabled,
  } = props;

  // 使用useMemo钩子，在paymentTermInfo()函数发生变化时，重新创建DataSet
  const paymentTermInfoDs = useMemo(() => new DataSet(paymentTermInfo()), [paymentTermInfo]);

  useEffect(() => {
    paymentTermInfoDs.setState({
      ...dsMap,
      loading,
      doubleUnitEnabled,
      paymentTermInfoDs,
    });
    paymentTermInfoDs.loadData([headerInfo]);
  }, [paymentTermInfo, headerInfo]);

  // 返回PaymentTermInfo组件
  return (
    <PaymentTermInfo
      ds={paymentTermInfoDs}
      customizeForm={customizeForm}
      customizeCode="SINV.ORDER_EXECUTION_ALL_DETAIL.PAYMENTTERMINFO"
      isSupplier={isSupplier}
    />
  );
};

export default observer(PaymentTermsInfo);

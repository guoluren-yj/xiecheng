/*
 * @Description: 付款条款外层容器
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @Date: 2022-09-14 17:38:03
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2022, Hand
 */
import React, { useEffect, useCallback, useState } from 'react';
import { Spin, Modal, notification, Icon } from 'choerodon-ui/pro';
import { isUndefined } from 'lodash';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import PayTermsCtrlList from './List';
import PaymentTermsOld from '../PaymentTerms/PaymentTerms';
import { fetchPayTermsCtrlState, switchPayTermsCtrlState } from './utils/api';

const notificationKey = 'smdm-payTermsCtrl-switch-page';

const PaymentTermsIndex = (props) => {

  const [ctrlPageFlag, setCtrlPageFlag] = useState<boolean>();
  const [switchLoading, setSwitchLoading] = useState<boolean>(false);

  const handleInitConifg = useCallback(async () => {
    const res = getResponse(await fetchPayTermsCtrlState());
    if (!res) return;
    const { actionCode } = res;
    setCtrlPageFlag(Number(actionCode) === 1);
  }, []);

  // 切换付款管控启用状态
  const handleSwitchPage = useCallback(() => {
    Modal.confirm({
      style: { width: 560 },
      title: ctrlPageFlag ?
        intl.get('smdm.payTermsCtrl.view.title.enableConfirmClosePayCtrl').d('是否确认关闭付款管控') :
        intl.get('smdm.payTermsCtrl.view.title.enableConfirmSwitchToPayCtrl').d('是否确认切换至付款条款维护与管控'),
      children: (
        <span style={{ fontSize: 14 }}>
          {ctrlPageFlag ?
            intl.get('smdm.payTermsCtrl.view.message.closePayCtrlTip').d('该按钮仅系统管理员使用！当前条款定义支持维护结构化付款条款及管控规则，切换至【付款条款维护】后，付款条款管控相关配置当即失效。2种条款定义方式有差异，请谨慎切换该配置！') :
            intl.get('smdm.payTermsCtrl.view.message.switchToPayCtrlTip').d('该按钮仅系统管理员使用！启用后【付款条款定义】功能将进行功能增强，支持定义结构化付款条款、支持定义消息提醒等管控规则。增强版付款条款结合订单模块的付款管控相关配置，可在订单生效时，按单生成付款计划，协助用户在SRM系统提报付款申请/预付款申请结算单，并实现付款申请日期、付款申请金额维护的管控需求。2种条款定义方式有差异，请谨慎切换该配置！')}
        </span>
      ),
      onOk: async () => {
        const newCtrlPageFlag = !ctrlPageFlag;
        setSwitchLoading(true);
        notification.info({
          key: notificationKey,
          icon: <Icon type="error" />,
          duration: null,
          message: ctrlPageFlag ?
            intl.get('smdm.payTermsCtrl.view.message.closePayCtrling').d('正在关闭付款管控') :
            intl.get('smdm.payTermsCtrl.view.message.switchToPayCtrling').d('正在切换至付款条款维护与管控'),
          description: intl.get('smdm.payTermsCtrl.view.message.backRefreshingAndWait').d('后台刷新数据中，请耐心等候一段时间...'),
        });
        const res = getResponse(await switchPayTermsCtrlState(newCtrlPageFlag ? 1 : 0));
        setSwitchLoading(false);
        notification.close(notificationKey);
        if (res) {
          setCtrlPageFlag(newCtrlPageFlag);
        }
      },
    });
  }, [ctrlPageFlag]);

  // 查询付款管控启用状态
  useEffect(() => {
    handleInitConifg();
  }, [handleInitConifg]);

  if (isUndefined(ctrlPageFlag) || switchLoading) return <Spin />;
  return ctrlPageFlag ?
    <PayTermsCtrlList onSwitchPage={handleSwitchPage} {...props} /> :
    <PaymentTermsOld onSwitchPage={handleSwitchPage} {...props} />;
};

export default formatterCollections({ code: ['smdm.payTermsCtrl'] })(PaymentTermsIndex);
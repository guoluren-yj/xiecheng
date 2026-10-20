import React from 'react';
import { Modal, Button, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import ServiceChargeManage from './ServiceChargeManage';
import tableDS from './indexDS';

import { serviceManageSave, serviceManageSync } from '@/services/serviceChargeManageService';

export function openServiceChargeManageModal(props) {
  const { record = {}, bidFlag = false } = props;
  const tableDs = new DataSet(
    tableDS({
      bidFlag,
      sourceId: record?.get('rfxHeaderId'),
    })
  );
  const modalProps = {
    ...props,
    tableDs,
  };

  // 保存 isQueryFlag - 保存后是否查询头接口
  const handleSave = async () => {
    const errorMessage =
      tableDs
        .getValidationErrors()[0]
        ?.errors[0]?.errors?.toJS()
        ?.find((item) => item.ruleName === 'rangeUnderflow') || {};
    if (!isEmpty(errorMessage)) {
      notification.warning({
        message: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.inputError`)
          .d('含税服务费金额（元）必须大于或等于0.01。'),
      });
      return;
    }
    const res = await serviceManageSave({
      data: tableDs?.toData(),
      customizeUnitCode: `SSRC.${bidFlag ? 'BID' : 'INQUIRY'}_HALL.NEW_LIST.SERVICE_FEE_TABLE`,
    });
    if (getResponse(res)) {
      notification.success();
      const queryRes = await tableDs.query();
      return queryRes;
    }
    return res;
  };

  // 同步
  const handleSync = async () => {
    const flag = await tableDs.validate();
    if (!flag) {
      notification.warning({
        message: intl.get(`ssrc.inquiryHall.model.inquiryHall.required`).d('请填写必填项！'),
      });
      return false;
    }
    // 先调用保存接口
    const saveResult = await handleSave();
    if (!getResponse(saveResult)) return false;
    const res = await serviceManageSync(tableDs?.toData());
    if (getResponse(res)) {
      notification.success();
      tableDs.query();
    }
    return false;
  };

  const modal = Modal.open({
    key: Modal.key(),
    title: intl.get(`ssrc.inquiryHall.view.message.button.refundChargeButton`).d('服务费管理'),
    drawer: true,
    closable: true,
    style: {
      width: '1090px',
    },
    children: <ServiceChargeManage {...modalProps} modal={modal} handleSave={handleSave} />,
    footer: (okBtn, cancelBtn) => {
      return (
        <>
          {okBtn}
          <Button onClick={handleSave}>{intl.get(`hzero.common.button.save`).d('保存')}</Button>
          {cancelBtn}
        </>
      );
    },
    okText: intl.get(`ssrc.inquiryHall.view.message.button.sync`).d('同步'),
    onOk: handleSync,
  });
  return modal;
}

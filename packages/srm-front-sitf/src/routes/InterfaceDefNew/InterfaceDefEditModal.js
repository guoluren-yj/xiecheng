/**
 * @description 接口定义 - 编辑弹窗
 * @export InterfaceDefEditModal
 * @class InterfaceDefEditModal
 * @extends {Component}
 */

import React from 'react';
import { Modal, Spin, Form, Lov, TextField, Select, Switch, NumberField, IntlField } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse, isTenantRoleLevel } from 'utils/utils';

import { updateInterfaces } from '@/services/interfaceDefNewService';

/**
 * 编辑模态框数据展示
 * @reactProps {Function} onOkModal - 确认逻辑
 * @reactProps {DS} modalDataDs - 表格数据源
 * @reactProps {Object} data - 表格中信息的一条记录
 */
const prefix = 'sitf.interfaceDef';
const organizationRole = isTenantRoleLevel();

export default function InterfaceDefEditModal(modalDataDs, type, data, tableDataDs, tenantId) {
  if (type === 'update') {
    modalDataDs.loadData([data]);
  } else {
    modalDataDs.loadData([]);
    const record = modalDataDs.create();
    record.set({
      orderSeq: 10000,
      enabledFlag: 1,
      individualFlag: organizationRole ? 1 : 0,
      rerunErrorFlag: 0,
      asyncFlag: 0,
      pushFlag: 1,
    });
  }

  // 关闭弹窗逻辑
  const onOkModal = async () => {
    const validateFlag = await modalDataDs.current.validate();
    let flag = false;
    if (validateFlag) {
      const currentModalData = modalDataDs.current.toJSONData();
      const currentData = {
        ...data,
        ...currentModalData,
        tenantId,
      };
      const response = await updateInterfaces([currentData]);
      try {
        if (getResponse(response)) {
          notification.success();
          tableDataDs.query();
          flag = true;
        }
      } catch (error) {
        throw error;
      }
    } else {
      notification.warning({
        message: intl.get(`${prefix}.view.message.requredWarning`).d('请填写必填项!'),
      });
    }
    return flag;
  };

  const ModalForm = observer(({ formDs }) => {
    const {multiReceiverTypeFlag, abnormalAlarmFlag} = formDs.current.get(['multiReceiverTypeFlag', 'abnormalAlarmFlag']);
    return (
      <Spin dataSet={formDs}>
        <Form dataSet={formDs} labelWidth={130}>
          <Lov name="interfaceCategoryCodeLov" />
          <TextField name="interfaceCode" disabled={data.interfaceCode} />
          <IntlField name="interfaceName" />
          <Select name="interfaceType" />
          <TextField name="handleFunction" />
          <TextField name="comments" />
          <TextField name="orderSeq" />
          <Switch name="enabledFlag" />
          <Switch name="individualFlag" hidden={!organizationRole} />
          <Switch name="rerunErrorFlag" />
          <Switch name="asyncFlag" />
          <NumberField name="batchMaxCount" />
          <Switch name="pushFlag" />
          <Select name="abnormalAlarmFlag" hidden={!organizationRole || multiReceiverTypeFlag === 1} />
          <Lov name="alarmReceiverTypeCodeLov" hidden={!(organizationRole && abnormalAlarmFlag === '1') || multiReceiverTypeFlag === 1} />
          <Switch name="multiReceiverTypeFlag" hidden={!organizationRole} />
        </Form>
      </Spin>
    );
  });

  Modal.open({
    title: intl.get('sitf.interfaceDef.view.interfaceDef.interfaceDefEdit').d('接口定义维护'),
    drawer: true,
    closable: true,
    children: <ModalForm formDs={modalDataDs} />,
    onOk: onOkModal,
  });
}

/* eslint-disable react/jsx-filename-extension */
/**
 * @description 限制白名单
 * @export RestrictedWhiteList
 * @class RestrictedWhiteList
 * @extends {Component}
 */

import React, { memo, useMemo, useCallback } from 'react';
import { DataSet, useModal, Button, Form, Lov, DateTimePicker, TextField } from 'choerodon-ui/pro';

import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';

import { whiteListData, whiteListFormData, fetchWhiteListSave } from './initialDataDs';

const queryFields = () => [
  {
    name: 'tenantId',
    type: FieldType.object,
    label: intl
      .get(`scux.interfaceFlowControl.model.interfaceFlowControl.tenantNum`)
      .d('租户编码'),
    display: true,
    lovCode: 'HPFM.TENANT_PAGING',
    lovPara: { tenantId: getCurrentOrganizationId()},
  },
  {
    name: 'tenantName',
    type: FieldType.string,
    label: intl
      .get(`scux.interfaceFlowControl.model.interfaceFlowControl.tenantName`)
      .d('租户名称'),
    display: true,
  },
];

const RestrictedWhiteList = () => {
  const whiteListDataDs = useMemo(() => new DataSet(whiteListData()), []);

  const _modal = useModal();

  const columns = useMemo(() => [
    {
      name: 'wlStatusMeaning',
    },
    {
      name: 'tenantNum',
    },
    {
      name: 'tenantName',
    },
    {
      name: 'validTimeFrom',
    },
    {
      name: 'validTimeTo',
    },
    {
      name: 'sourceApplyTime',
    },
    {
      name: 'sourceNum',
      renderer: ({value, record}) => <a onClick={() => handleAdd(1, record)}>{value}</a>,
    },
    {
      name: 'sourceFromMeaning',
    },
    {
      name: 'createdRealName',
    },
    {
      name: 'lastUpdatedRealName',
    },
    ], []);

  const handleAdd = useCallback(
    (type, record={}) => {
      const whiteListFormDataDs = new DataSet(whiteListFormData());
      const editFlag = type === 1 ? ['ENDED'].includes(record.get('wlStatus')) : false;
      if(type === 1) {
        whiteListFormDataDs.loadData([record.toData()]);
      }
      _modal.open({
        title: intl
          .get(`scux.interfaceFlowControl.model.title.tenant.whiteList`)
          .d('租户白名单'),
        drawer: true,
        style: { width: 800 },
        children: (
          <Form dataSet={whiteListFormDataDs} labelWidth={130}>
            <Lov name='tenantIdLov' disabled={editFlag} />
            <Lov name="interfaceCodeList" disabled={editFlag} />
            <DateTimePicker name='validTimeFrom' disabled={editFlag} />
            <DateTimePicker name='validTimeTo' disabled={editFlag} />
            <TextField name='sourceNum' disabled />
          </Form>
        ),
        onOk: async () => {
          let flag = false;
          const validateFlag = await whiteListFormDataDs.validate();
          if(validateFlag) {
            const currentData = whiteListFormDataDs.toJSONData();
            const response = await fetchWhiteListSave(currentData);
            if(getResponse(response)) {
              notification.success();
              flag = true;
              whiteListDataDs.query();
            }
          } else {
            notification.warning({
              message: intl.get('scux.interfaceFlowControl.view.message.notNull').d("请填写必填项!"),
            });
          }

          return flag;
        },
      });
    },
    [_modal]
  );

  return (
    <>
      <div style={{color: '#29BEDB'}}>{intl.get('scux.interfaceFlowControl.view.title.restictedWhiteList.message').d('考虑到项目期初上线存在大批量数据同步，因此可通过企微提交期初数据导入申请，审批通过后不进行访问流量控制，计划窗口结束后进行正常数据校验')}</div>
      <FilterBarTable
        key="whitelist"
        cacheState
        border={false}
        filterBarConfig={{
          cacheKey: 'whitelist',
          fields: queryFields(),
          right: {
            render: () => <Button onClick={() => handleAdd(0)} color='primary'>{intl.get('scux.interfaceFlowControl.view.btn.update').d('新建')}</Button>,
          },
        }}
        customizable
        customizedCode="SITF.CUSTOMIZABLE.WHITELIST"
        dataSet={whiteListDataDs}
        columns={columns}
      />
    </>
  );
};

export default memo(RestrictedWhiteList);

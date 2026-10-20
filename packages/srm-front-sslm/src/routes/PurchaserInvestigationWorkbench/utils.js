/*
 * @Date: 2023-06-19 15:38:24
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Modal, Form, CheckBox, Select, Lov, TextField, TextArea } from 'choerodon-ui/pro';

import intl from 'utils/intl';

// 调查表审批拒绝弹框
export const handleRejectModal = ({
  dataSet,
  customizeForm,
  customizeUnitCode,
  onOk = () => {},
}) => {
  Modal.open({
    drawer: true,
    movable: false,
    closable: false,
    destroyOnClose: true,
    key: Modal.key(),
    style: { width: 380 },
    title: intl.get(`spfm.disposeInvite.view.button.investigateReject`).d('调查表拒绝'),
    children: customizeForm(
      {
        code: customizeUnitCode,
      },
      <Form dataSet={dataSet} labelLayout="float">
        <CheckBox name="isChange" />
        <Select name="investigateType" />
        <Lov name="investigateTemplateId" />
        <TextField name="remark" />
        <TextArea name="rejectRemark" resize="vertical" rows={16} />
      </Form>
    ),
    onOk,
  });
};

// 获取列表页TabPane
export const getTabPane = () => [
  {
    key: 'waitRelease',
    countKey: 'releaseCount',
    searchCode: 'SSLM.INVESTIGATION_WAIT_RELEASE.SEARCH_BAR',
    customizeCode: 'SSLM.INVESTIGATION_WAIT_RELEASE.TABLE_LIST',
    tab: intl.get(`sslm.investTempConfig.view.title.waitRelease`).d('待发布'),
  },
  {
    key: 'waitApprove',
    countKey: 'approveCount',
    searchCode: 'SSLM.INVESTIGATION_WAIT_APPROVE.SEARCH_BAR',
    customizeCode: 'SSLM.INVESTIGATION_WAIT_APPROVE.TABLE_LIST',
    tab: intl.get('sslm.investTempConfig.view.title.waitApprove').d('待审批'),
  },
  {
    key: 'all',
    countKey: 'totalCount',
    searchCode: 'SSLM.INVESTIGATION_ALL.SEARCH_BAR',
    customizeCode: 'SSLM.INVESTIGATION_ALL.LIST_TABLE',
    tab: intl.get('sslm.investTempConfig.view.title.all').d('全部'),
  },
];

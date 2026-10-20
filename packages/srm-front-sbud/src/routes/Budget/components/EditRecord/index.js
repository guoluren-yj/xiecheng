/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-18 17:43:15
 * @LastEditors: yanglin
 * @LastEditTime: 2023-11-03 15:35:27
 */

import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import EidtRecord from './EditRecord';

// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';

const Index = function Index(props) {
  const { record, ...otherProps } = props;

  const openEditRecordModal = () => {
    // productListDs.loadData(value ? JSON.parse(value) : []);

    Modal.open({
      title: intl.get(`${commonPrompt}.editRecord`).d('调整记录'),
      style: {
        width: 742,
      },
      closable: true,
      drawer: true,
      children: <EidtRecord budgetLineId={record.get('budgetLineId')} />,
      cancelButton: false,
      onOk: () => {},
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: okBtn => okBtn,
    });
  };

  return (
    <>
      <a onClick={() => openEditRecordModal()} disabled={record.status === 'add'} {...otherProps}>
        {intl.get(`${commonPrompt}.editRecord`).d('调整记录')}
      </a>
    </>
  );
};

export default Index;

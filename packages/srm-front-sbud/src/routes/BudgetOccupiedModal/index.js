/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-18 17:43:15
 * @LastEditors: yanglin
 * @LastEditTime: 2022-07-23 13:09:57
 */

import React from 'react';
import intl from 'utils/intl';
import { Modal } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';
import DetailModal from './DetailModal';
// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';
const Index = function Index(props) {

  const showModal = (props) => {
    Modal.open({
      key: Modal.key(),
      drawer: true,
      title: intl.get(`${commonPrompt}.occupiedDetail`).d('占用明细'),
      style: {
        width: 1080,
      },
      children: <DetailModal {...props} />,
      onOk: () => { },
      closable: true,
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: (okBtn) => okBtn,
    });
  }

  return <a onClick={() => showModal(props)} > {intl.get('hzero.common.sbud.showOccupancy').d('查看占用记录')}</a >
};

export default formatterCollections({
  code: ['sbdm.common', 'hzero.common'],
})(Index);

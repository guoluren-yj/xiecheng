/*
 * OccupyModal - 订单金额占用记录
 * @Date: 2024-06-28 16:24:49
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import OccupyWrap from './OccupyWrap';

const Index = (props) => {
  const openModal = () => {
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: 1090 },
      cancelButton: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      title: intl.get('spcm.common.model.common.amountOccupyRecords').d('金额占用记录'),
      children: <OccupyWrap {...props} />,
    });
  };

  return (
    <a onClick={() => openModal()}>
      {intl.get('spcm.common.model.common.checkTheImplementationView').d('查看')}
    </a>
  );
};

export default Index;

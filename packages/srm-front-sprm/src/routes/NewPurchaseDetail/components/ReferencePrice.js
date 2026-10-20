/*
 * @Descripttion: 参考价格
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yanglin
 * @LastEditTime: 2022-07-01 17:45:26
 */

import React from 'react';
import intl from 'utils/intl';
import { Modal } from 'choerodon-ui/pro';
import ReferPrice from '@/routes/components/LadderPriceC7N';

const ReferencePrice = function ReferencePrice({ record, headerDs, uomControl, sourceForm, remote }) {
  const handleLadderPrice = () => {
    const data = record?.toData();
    const headerInfo = headerDs.current.toData();
    const currentRecord = { ...headerInfo, prLineList: [data] };
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: '1090px' },
      bodyStyle: { paddingTop: '20px' },
      title: intl.get(`sprm.common.model.common.referPrice`).d('参考价格'),
      children: <ReferPrice currentRecord={currentRecord} sourceForm={sourceForm} sourceRecord={record} headerDs={headerDs} uomControl={uomControl} remote={remote} />,
      closable: true,
      movable: false,
      destroyOnClose: true,
      footer: (okBtn, cancelBtn) => ['create', 'update'].includes(sourceForm) ? <div>{okBtn}{cancelBtn}</div> : cancelBtn,
    });
  };

  const flag = record && record.get('itemCode') && record.get('prSourcePlatform') !== 'CATALOGUE';

  return flag ? (
    <a onClick={() => handleLadderPrice()}>
      {intl.get(`sprm.common.model.common.referDetail`).d('查看详细')}
    </a>
  ) : null;
};

export default ReferencePrice;

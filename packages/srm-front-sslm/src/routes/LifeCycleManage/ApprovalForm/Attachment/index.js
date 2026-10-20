/*
 * @Date: 2023-08-31 11:18:15
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useContext } from 'react';
import intl from 'utils/intl';
import { Context } from '../../Context';
import AttachmentInfo from '../../Documents/Detail/AttachmentInfo';

const Index = () => {
  const context = useContext(Context);
  const { baseInfoDs, customizeForm } = context;
  return (
    <div className="card-wrap">
      <div className="card-detail-title">
        {intl.get('hzero.common.upload.modal.title').d('附件')}
      </div>
      <div style={{ paddingBottom: 20 }}>
        <AttachmentInfo
          dataSet={baseInfoDs}
          customizeForm={customizeForm}
          customizeUnitCode="SSLM.LIFE_CYCLE.DOCUMENT_CUSTOM.ATT_INFO"
        />
      </div>
    </div>
  );
};

export default Index;

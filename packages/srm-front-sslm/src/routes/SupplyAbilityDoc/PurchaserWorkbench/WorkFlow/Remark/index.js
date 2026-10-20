/*
 * @Date: 2025-08-28 10:57:37
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
import React from 'react';

import intl from 'utils/intl';

const Index = ({ dataSet }) => {
  return (
    <div className="card-content">
      <div className="card-content-title">{intl.get('hzero.common.remark').d('备注')}</div>
      <div style={{ fontWeight: 500 }}>{dataSet.current?.get('remark')}</div>
    </div>
  );
};

export default Index;

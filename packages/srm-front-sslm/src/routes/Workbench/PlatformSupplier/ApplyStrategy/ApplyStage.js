/*
 * @Date: 2022-11-02 10:55:08
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Fragment, useRef } from 'react';

import intl from 'utils/intl';
import ZoomToolbar from '@/routes/components/ZoomToolbar';
import StageComponent from '@/routes/components/SupplierLifeConfig/StageComponent';

const Index = ({ dataSource, onVisible, resizSize, curProcess, primaryColor }) => {
  const customRef = useRef(null);
  return (
    <Fragment>
      <div className="strategy-title">
        {intl.get('sslm.common.view.stage').d('阶段')}
        <ZoomToolbar customRef={customRef} />
      </div>
      <StageComponent
        readOnly
        ref={customRef}
        sourceKey="workbench"
        resizSize={resizSize}
        dataSource={dataSource}
        onVisible={onVisible}
        curProcess={curProcess}
        primaryColor={primaryColor}
        style={{ height: 'calc(100vh - 184px)' }}
      />
    </Fragment>
  );
};

export default Index;

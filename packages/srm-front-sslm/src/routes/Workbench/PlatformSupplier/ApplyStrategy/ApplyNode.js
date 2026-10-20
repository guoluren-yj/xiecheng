/*
 * @Date: 2022-11-02 10:56:44
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isEmpty } from 'lodash';
import React, { Fragment, useRef, useMemo, useCallback } from 'react';

import intl from 'utils/intl';

import ZoomToolbar from '@/routes/components/ZoomToolbar';
import EmptyPage from '@/routes/components/SupplierLifeConfig/EmptyPage';
import NodeComponent from '@/routes/components/SupplierLifeConfig/NodeComponent';
import { ReactComponent as VirtualProcess } from '@/assets/lifeConfig/virtual-process.svg';
import { ReactComponent as VisibleProcess } from '@/assets/lifeConfig/visible-process.svg';

const Index = ({
  curProcess,
  dataSource,
  resizSize,
  isUpgradeOrDegrade,
  handleExpansion,
  handleSelectBoxChange,
}) => {
  const customRef = useRef(null);

  // 点击节点回调
  const handleNodeClick = useCallback(nodeData => {
    handleExpansion();
    if (isUpgradeOrDegrade) {
      handleSelectBoxChange('processDetail');
    }
    const { nodeId } = nodeData;
    const doc = document.getElementById(nodeId);
    if (doc) {
      document.getElementById(nodeId).scrollIntoView();
    }
  }, []);

  const showImgFlag = useMemo(() => isEmpty(curProcess) || curProcess?._local, [
    JSON.stringify(curProcess),
  ]);
  const ImgComp = useMemo(() => (isEmpty(curProcess) ? VisibleProcess : VirtualProcess), [
    JSON.stringify(curProcess),
  ]);
  const label = useMemo(
    () =>
      isEmpty(curProcess)
        ? intl.get('sslm.workbench.view.message.visibleProcessMsg').d('请选择流程查看对应策略')
        : intl
            .get('sslm.workbench.view.message.virtualProcessMsg')
            .d('允许手工发起升降级，无其他单据管控流程'),
    [JSON.stringify(curProcess)]
  );
  return (
    <Fragment>
      <div className="strategy-title">
        {intl.get('sslm.common.view.node').d('节点')}
        {!showImgFlag && <ZoomToolbar customRef={customRef} />}
      </div>
      {showImgFlag ? (
        <EmptyPage label={label} ImgComp={ImgComp} height="calc(100vh - 184px)" />
      ) : (
        <NodeComponent
          readOnly
          ref={customRef}
          sourceKey="workbench"
          resizSize={resizSize}
          dataSource={dataSource}
          handleNodeClick={handleNodeClick}
          style={{ height: 'calc(100vh - 184px)' }}
        />
      )}
    </Fragment>
  );
};

export default Index;

/*
 * @Date: 2022-10-08 11:15:15
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isEmpty } from 'lodash';
import React, { Fragment, useRef, useCallback } from 'react';

import intl from 'utils/intl';

import ZoomToolbar from '@/routes/components/ZoomToolbar';
import EmptyPage from '@/routes/components/SupplierLifeConfig/EmptyPage';
import NodeComponent from '@/routes/components/SupplierLifeConfig/NodeComponent';
import styles from '../index.less';

const NodeContent = ({
  remote,
  curProcess,
  resizSize,
  dataSource,
  primaryColor,
  sourceKey = '',
  isEdit = true,
  handleExpansion,
}) => {
  const customRef = useRef(null);

  // 点击节点回调
  const handleNodeClick = useCallback(nodeData => {
    handleExpansion();
    const { nodeId } = nodeData;
    const doc = document.getElementById(nodeId);
    if (doc) {
      doc.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);
  return (
    <Fragment>
      <div className={styles['process-stage']}>
        {intl.get('sslm.common.view.node').d('节点')}
        {!isEmpty(curProcess) && <ZoomToolbar customRef={customRef} />}
      </div>
      {isEmpty(curProcess) ? (
        <EmptyPage
          height="calc(100vh - 284px)"
          label={
            isEdit
              ? intl
                  .get('sslm.supplierLifePolicyConfig.view.message.visibleProcessMsg')
                  .d('请点击阶段创建流程或点击流程线编辑流程信息')
              : intl
                  .get('sslm.workbench.view.message.visibleProcessMsg')
                  .d('请选择流程查看对应策略')
          }
        />
      ) : (
        <NodeComponent
          ref={customRef}
          remote={remote}
          readOnly={!isEdit}
          resizSize={resizSize}
          dataSource={dataSource}
          primaryColor={primaryColor}
          handleNodeClick={handleNodeClick}
          sourceKey={!isEdit ? 'workbench' : ''}
          style={{
            height: sourceKey === 'batchEdit' ? 'calc(100vh - 168px)' : 'calc(100vh - 284px)',
          }}
        />
      )}
    </Fragment>
  );
};

export default NodeContent;

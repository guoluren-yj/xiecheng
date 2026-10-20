/*
 * @Date: 2022-10-08 11:14:15
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Fragment, useRef, useCallback, useState } from 'react';
import { Icon, Tooltip } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import ZoomToolbar from '@/routes/components/ZoomToolbar';
import StageComponent from '@/routes/components/SupplierLifeConfig/StageComponent';
import styles from '../index.less';

const StageContent = ({
  strategyId,
  onClear,
  onVisible,
  resizSize,
  dataSource,
  onQueryStage,
  curProcess,
  primaryColor,
  onFilter,
  isEdit = true,
}) => {
  const customRef = useRef(null); // 阶段ref
  const [hasProc, setHasProc] = useState(false);

  // 过滤无节点的流程
  const hanldeFilterStage = useCallback(() => {
    setHasProc(prevState => !prevState);
    onFilter({ hasProc: !hasProc });
  }, [hasProc]);

  const stageTooltipTitle = hasProc
    ? intl.get('sslm.supplierLifePolicyConfig.view.stage.showStage').d('显示未配置节点流程')
    : intl.get('sslm.supplierLifePolicyConfig.view.stage.hiddenStage').d('隐藏未配置节点流程');

  return (
    <Fragment>
      <div className={styles['process-stage']}>
        {intl.get('sslm.common.view.stage').d('阶段')}
        <Tooltip title={stageTooltipTitle}>
          <Icon
            type={hasProc ? 'visibility_off' : 'visibility'}
            style={{ fontSize: 16, marginLeft: 8, marginTop: -4 }}
            onClick={hanldeFilterStage}
          />
        </Tooltip>
        <ZoomToolbar customRef={customRef} />
      </div>
      <StageComponent
        ref={customRef}
        readOnly={!isEdit}
        hasProc={hasProc}
        onClear={onClear}
        onVisible={onVisible}
        resizSize={resizSize}
        strategyId={strategyId}
        dataSource={dataSource}
        curProcess={curProcess}
        onQueryStage={onQueryStage}
        primaryColor={primaryColor}
        sourceKey={!isEdit ? 'workbench' : ''}
        style={{ height: 'calc(100vh - 284px)', padding: '0 16px' }}
      />
    </Fragment>
  );
};

export default StageContent;

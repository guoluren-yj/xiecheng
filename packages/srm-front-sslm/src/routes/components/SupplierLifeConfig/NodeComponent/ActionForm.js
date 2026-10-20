/*
 * @Date: 2022-10-28 16:09:00
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Fragment, useMemo, useEffect } from 'react';
import { Alert } from 'choerodon-ui';
import { Form, CheckBox } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import styles from './index.less';

const ActionForm = ({
  dataSet,
  regulationFlag,
  dataSource: { branches: { branchConfigs = [] } = {} } = {},
}) => {
  // 判断流程线上是否有节点
  const nodeFlag = useMemo(
    () => branchConfigs.some(branchConfig => branchConfig.some(n => n.nodeType === 'node')),
    [branchConfigs]
  );

  useEffect(() => {
    // nodeFlag如果流程上没有节点，后置动作取消勾选（处理有节点的情况下勾选后置动作，后来又把节点删除了）
    if (!nodeFlag && dataSet.current) {
      dataSet.current.set({
        actionContinueFlag: 0,
        autoUpgradeFlag: 0,
      });
    }
  }, [nodeFlag]);

  return (
    <Fragment>
      {!nodeFlag && (
        <Alert
          closable
          showIcon
          type="info"
          className={styles['alert-tip']}
          message={intl
            .get('sslm.supplierLifePolicyConfig.view.message.maintainNode')
            .d('请先维护节点')}
        />
      )}
      <Form dataSet={dataSet} labelLayout="float">
        <CheckBox name="actionContinueFlag" disabled={regulationFlag || !nodeFlag} />
        <CheckBox
          showHelp="tooltip"
          name="autoUpgradeFlag"
          disabled={regulationFlag || !nodeFlag}
          help={intl
            .get('sslm.supplierLifePolicyConfig.modal.config.autoUpgradeFlagMsg')
            .d(
              '供应商匹配策略成功后，创建最新的单据满足所有节点配置的条件时，系统将会自动发起升降级至目标阶段'
            )}
        />
      </Form>
    </Fragment>
  );
};

export default ActionForm;

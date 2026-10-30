/*
 * @Date: 2022-07-13 22:46:50
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isEmpty } from 'lodash';
import React, { useCallback, useMemo } from 'react';
import { Steps } from 'choerodon-ui';
import { getCurrentOrganizationId } from 'utils/utils';
import styles from '../index.less';
import { stepsList } from 'srm-front-sslm/lib/routes/EnterpriseCertification/utils';

const { Step } = Steps;
const tenantRoleLevel = getCurrentOrganizationId() !== 0;

const ValidationSteps = ({ location = {}, stepsObj = {} }) => {
  const { realNameFlag, investigateTemplateId, secondaryTabConfig } = stepsObj;

  const routerPaths = useMemo(() => {
    return [
      tenantRoleLevel && realNameFlag && 'certification',
      'affiliated',
      'main-info',
      !isEmpty(secondaryTabConfig) && 'secondary-info',
      tenantRoleLevel && investigateTemplateId && 'investigation',
      !tenantRoleLevel && 'apply-manager',
      'preview',
    ].filter(Boolean);
    // 二开：补充 secondaryTabConfig 依赖，stepsObj 异步下发后步骤节点需要重新计算
  }, [tenantRoleLevel, investigateTemplateId, realNameFlag, secondaryTabConfig]);

  // 获取步骤条集合
  const finallyStepList = stepsList().filter(step => routerPaths.includes(step.key));

  // 获取当前步骤条
  const getCurrentStep = useCallback(() => {
    const { pathname = '' } = location;
    const pathList = pathname.split('/');
    const currentNode = pathList[pathList.length - 1];
    switch (currentNode) {
      case routerPaths[0]:
      case `${routerPaths[0]}-result`:
        return 0;
      case routerPaths[1]:
      case `${routerPaths[1]}-result`:
        return 1;
      case routerPaths[2]:
      case `${routerPaths[2]}-result`:
        return 2;
      case routerPaths[3]:
      case `${routerPaths[3]}-result`:
        return 3;
      case routerPaths[4]:
      case `${routerPaths[4]}-result`:
        return 4;
      case routerPaths[5]:
      case `${routerPaths[5]}-result`:
        return 5;
      case routerPaths[6]:
        return 6;
      default:
        return 0;
    }
  }, [location, routerPaths]);

  return (
    <div className={styles['certification-steps']}>
      <Steps size="small" current={getCurrentStep()}>
        {finallyStepList.map(step => (
          <Step title={step.title} key={step.key} />
        ))}
      </Steps>
    </div>
  );
};

export default ValidationSteps;

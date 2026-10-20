import React, { useContext, useCallback } from 'react';
import { Select, Icon, Output } from 'choerodon-ui/pro';
import { Steps } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { isEmpty } from 'lodash';
import CollapseForm from '_components/CollapseForm';

import classNames from 'classnames';
import { Store } from '../store/index';

import styles from './index.less';

const { Step } = Steps;

export default observer(function BasicInfoCard() {
  const {
    routerParams: { isHistory = false },
    commonDs: { ruleFormDs },
    customizeCollapseForm,
  } = useContext(Store);

  // 节点
  const renderNodes = useCallback((option = {}) => {
    const { name = '', dataSet = {} } = option || {};

    if (!dataSet.current) {
      return null;
    }

    const rfSteps = dataSet.current.get(name) || [];
    if (!rfSteps || isEmpty(rfSteps)) {
      return null;
    }

    return (
      <Steps size="small">
        {rfSteps.map((rfStep = {}) => {
          const { finishedFlag, currentNodeFlag, nodeStatus = null, nodeStatusMeaning = null } =
            rfStep || {};

          return (
            <Step
              key={nodeStatus}
              title={
                <span
                  style={{
                    fontSize: '12px',
                    color: currentNodeFlag ? '#000000' : finishedFlag ? '#46B880' : 'black',
                    fontWeight: currentNodeFlag ? '600' : '400',
                  }}
                >
                  {nodeStatusMeaning || nodeStatus}
                </span>
              }
              icon={
                <Icon
                  type={finishedFlag ? 'brightness_1' : 'brightness_o'}
                  style={{
                    backgroundColor: '#fff',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                />
              }
            />
          );
        })}
      </Steps>
    );
  }, []);

  return (
    <div className={styles['rfx-card-item-form']}>
      {customizeCollapseForm(
        {
          code: `SSRC.SOURCE_TEMPLATE.RF_TEMPLATE.PROCESS_NODE`,
          dataSet: ruleFormDs,
        },
        <CollapseForm dataSet={ruleFormDs} columns={3} labelLayout="float" disabled={isHistory}>
          <Select name="expertScoreType" showHelp="tooltip" />
          <Output
            name="progressNodes"
            colSpan={2}
            newLine
            className={classNames('c7n-steps-rf-custom', 'rfx-card-item-step')}
            renderer={renderNodes}
          />
        </CollapseForm>
      )}
    </div>
  );
});

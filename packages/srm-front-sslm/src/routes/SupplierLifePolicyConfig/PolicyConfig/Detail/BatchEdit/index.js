/*
 * @Date: 2022-11-28 11:18:45
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, {
  Fragment,
  useCallback,
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Alert } from 'choerodon-ui';
import { Form, DataSet, SelectBox, Select } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { TopSection, SecondSection } from '_components/Section';

import styles from './index.less';
import { getIndexDS } from './stores/getIndexDS';

const { Option } = SelectBox;

const Index = ({ strategyId }, ref) => {
  const [checkedValue, setCheckedValue] = useState('initialStage');
  const formDs = useMemo(() => new DataSet(getIndexDS({ strategyId, checkedValue })), [
    strategyId,
    checkedValue,
  ]);

  // 场景改变时的回调
  const handleSelectChange = useCallback(value => {
    setCheckedValue(value);
  }, []);

  useImperativeHandle(ref, () => ({
    formDs,
    checkedValue,
  }));

  return (
    <Fragment>
      <Alert
        banner
        showIcon
        closable
        type="warning"
        iconType="error"
        className={styles['batch-edit-alert']}
        message={intl
          .get('sslm.supplierLifePolicyConfig.view.message.coverStageProcess')
          .d('此操作会覆盖已配置节点的流程')}
      />
      <div style={{ margin: '16px 20px' }}>
        <TopSection>
          <SecondSection
            title={intl.get('sslm.supplierLifePolicyConfig.modal.title.scenario').d('场景')}
          >
            <div style={{ marginBottom: 32 }}>
              <SelectBox
                value={checkedValue}
                onChange={handleSelectChange}
                className={styles['batch-edit-select']}
              >
                <Option value="initialStage">
                  {intl
                    .get('sslm.supplierLifePolicyConfig.modal.selcet.initialStage')
                    .d('相同初始阶段')}
                </Option>
                <Option value="targetStage">
                  {intl
                    .get('sslm.supplierLifePolicyConfig.modal.selcet.targetStage')
                    .d('相同目标阶段')}
                </Option>
              </SelectBox>
              <div className={styles['batch-edit-select-msg']}>
                {checkedValue === 'initialStage'
                  ? intl
                      .get('sslm.supplierLifePolicyConfig.modal.selcet.initialStageMsg')
                      .d('适用于同一初始阶段指向多个目标阶段')
                  : intl
                      .get('sslm.supplierLifePolicyConfig.modal.selcet.targetStageMsg')
                      .d('适用于多个初始阶段指向同一目标阶段')}
              </div>
            </div>
          </SecondSection>
          <SecondSection
            title={intl
              .get('sslm.supplierLifePolicyConfig.view.leftContent.createProcess')
              .d('创建流程')}
          >
            <Form dataSet={formDs} labelLayout="float">
              <Select name="startStages" />
              <Select name="endStages" />
            </Form>
          </SecondSection>
        </TopSection>
      </div>
    </Fragment>
  );
};

export default forwardRef(Index);

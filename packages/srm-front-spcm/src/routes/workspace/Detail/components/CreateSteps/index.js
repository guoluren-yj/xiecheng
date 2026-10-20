import React, { useState, useCallback, useEffect } from 'react';
import { Steps } from 'choerodon-ui';
// import { Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { compose } from 'lodash';
import classnames from 'classnames';
import Card from './Card';
import styles from './common.less';

const { Step } = Steps;

const CreateSteps = (props) => {
  const {
    pcHeaderWorkbenchPreTextFlag,
    onPreTextBack = () => {},
    onlyEditReplaceWildcardBefore,
  } = props;
  const [currentStep, setCurrentStep] = useState(pcHeaderWorkbenchPreTextFlag);
  useEffect(() => {
    setCurrentStep(pcHeaderWorkbenchPreTextFlag);
  }, [pcHeaderWorkbenchPreTextFlag]);

  const progress = [
    {
      nodeStatus: '0',
      nodeStatusMeaning: intl
        .get('spcm.workspace.view.steps.title.contractTemplateStage')
        .d('协议模板阶段'),
    },
    {
      nodeStatus: '1',
      nodeStatusMeaning: intl.get('spcm.workspace.view.steps.title.preTextStage').d('预文本阶段'),
    },
  ];
  // 点击步骤条
  const handleClickStep = ({ nodeStatus }) => {
    if (currentStep === '0' && nodeStatus === '1') {
      notification.warning({
        message: intl
          .get('spcm.workspace.view.message.title.notPreText')
          .d('尚未到预文本阶段，无法查看'),
      });
      return;
    }

    if (currentStep === '1' && nodeStatus === '0') {
      onPreTextBack(() => setCurrentStep('0'));
      return;
    }

    if (nodeStatus === currentStep) {
      return;
    }

    setCurrentStep(nodeStatus);
  };

  // 进度条
  const renderSteps = useCallback(() => {
    if (progress?.length) {
      const currentIndex = progress.findIndex((i) => i.nodeStatus === currentStep);
      return (
        <Steps className={styles['steps-container']} current={currentIndex} size="small">
          {progress?.map((s, index) => {
            const { nodeStatus = null, nodeStatusMeaning = null } = s;
            return (
              <Step
                key={nodeStatus}
                onClick={() => handleClickStep(s)}
                title={
                  <span
                    className={classnames(styles[index === currentIndex ? 'current-title' : ''])}
                    style={{ fontSize: '14px' }}
                  >
                    {nodeStatusMeaning || nodeStatus}
                  </span>
                }
                description={
                  // 配置表《在线编辑共享配置》中，是否启用在线编辑协同=开启，且，仅编辑通配符替换前的文件=开启，且，当前处于“预文本阶段”时，显示该提示
                  nodeStatus === '0' &&
                  currentStep === '1' &&
                  onlyEditReplaceWildcardBefore === '1' &&
                  intl
                    .get('spcm.workspace.view.tips.backToTemplateStage')
                    .d('提示：如需修改协议文本内容请退回至模板阶段')
                }
              />
            );
          })}
        </Steps>
      );
    }
  }, [currentStep]);
  return (
    <div className={styles['rf-card-content-wrapper']}>
      <Card component={renderSteps()} />
    </div>
  );
};

export default compose(
  formatterCollections({
    code: ['spcm.workspace'],
  })
)(CreateSteps);

import React, { useCallback, useContext } from 'react';
import { TextField, TextArea, Icon, Lov, Output } from 'choerodon-ui/pro';
import { Steps } from 'choerodon-ui';
import classNames from 'classnames';

import { isEmpty } from 'lodash';
import { observer } from 'mobx-react';

import CollapseForm from '_components/CollapseForm';
import intl from 'utils/intl';

import Store from '../store/index';

import styles from './index.less';

const { Step } = Steps;

export default observer(function BasicInfoCard() {
  const {
    ref: { basicInfoRef },
    routerParams: { sourceCategory },
    commonDs: { basicFormDs, ruleFormDs, noticeDs },
    customizeCollapseForm,
  } = useContext(Store);

  const { current } = basicFormDs;

  // 改变模板，将模板的默认值赋值到规则板块上
  const changeTemplate = (value) => {
    if (value) {
      const {
        createdBy,
        creationDate,
        lastUpdateDate,
        lastUpdatedBy,
        latestFlag,
        objectVersionNumber,
        templateId,
        templateName,
        templateNum,
        templateStatus,
        versionNumber,
        _token,
        progressNodes,
        tenantId,
        ...others
      } = value || {};

      ruleFormDs.loadData([{ ...(ruleFormDs?.current?.toData() || {}), ...others }]);
      if (basicFormDs.current) {
        basicFormDs.current.set('progressNodes', progressNodes);
        basicFormDs.current.set('templateId', templateId);
        basicFormDs.current.set('templateName', templateName);
        basicFormDs.current.set('templateStatus', templateStatus);
      }
    }
  };

  // 标题change
  const changeRfTitle = (value = null) => {
    if (!basicFormDs.current || !noticeDs.current) {
      return;
    }

    const oldNoticeTitle = noticeDs.current.get('noticeTitle') || null;
    if (oldNoticeTitle) {
      return;
    }

    const common = intl.get('ssrc.rf.view.message.rfNotice').d('公告');
    const noticeTitle = value + common;

    noticeDs.current.set('noticeTitle', noticeTitle);
  };

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
      <Steps size="small" className={styles['rf-update-step']}>
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
          code: `SSRC.INQUIRY_HALL.RF_EDIT.HEADER_${sourceCategory}`,
          dataSet: basicFormDs,
        },
        <CollapseForm
          dataSet={basicFormDs}
          columns={3}
          labelLayout="float"
          formRef={(ref) => {
            basicInfoRef.current = ref;
          }}
          useWidthPercent
        >
          <TextField name="rfTitle" onChange={changeRfTitle} />
          <Lov name="templateLov" onChange={changeTemplate} noCache />
          {current?.get('sourceFrom') === 'PROJECT' && (
            <TextField name="sourceProjectName" showHelp="tooltip" />
          )}
          <Output
            name="progressNodes"
            colSpan={2}
            newLine
            className={classNames('c7n-steps-rf-custom', 'rfx-card-item-step')}
            renderer={renderNodes}
          />
          <TextArea newLine name="rfRemark" colSpan={2} resize rows={3} />
        </CollapseForm>
      )}
    </div>
  );
});

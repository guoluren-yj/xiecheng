import React, { useContext, useEffect } from 'react';

import intl from 'utils/intl';
import classnames from 'classnames';
// import { isEmpty, isArray } from 'lodash';
import { getResponse } from 'utils/utils';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';

import { Header, Content } from 'components/Page';
import { Spin, Modal, TextArea, DataSet, Form } from 'choerodon-ui/pro';
import { Button } from 'components/Permission';
import DynamicButtons from '_components/DynamicButtons';
import { Collapse } from 'choerodon-ui';

import {
  saveItemFeedback,
  submitItemFeedback,
  rejectItemFeedback,
} from '@/services/materialFeedbackService';

import NodeInfo from '../../components/NodeInfo';
import BaseInfo from '../../components/BaseInfo';
import DetailInfo from '../../components/DetailInfo';
import StageInfo from '../../components/StageInfo';
import SampleInfo from '../../components/SampleInfo';
import OperationRecord from '../../components/OperationHistory';

import { Store } from '../storeProvider';
import { feedbackRejectDS } from '@/routes/MaterialFeedback/stores/detailDs';
import styles from '../index.less';

// 设置smdm国际化前缀 - common - model
const commonPrompt = 'smdm.common.model.common';
const { Panel } = Collapse;
const HeaderButtons = observer(({ loading, handleSave }) => {
  const {
    header,
    unitCode,
    queryFlag,
    operateFlag,
    templateInfo,
    itemAuthFeeHeaderId,
    authFeeStatusCode,
    history,
    headerDs,
    handleGetInfo,
    customizeBtnGroup,
  } = useContext(Store);

  // 操作记录
  const handleActHistory = () => {
    return Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: '742px' },
      bodyStyle: { padding: '20px' },
      title: intl.get(`hzero.common.button.operating`).d('操作记录'),
      children: (
        <OperationRecord
          itemAuthFeeHeaderId={itemAuthFeeHeaderId}
          nodeCodeMeaning={header?.get('nodeCodeMeaning')}
        />
      ),
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: () => { },
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: (okBtn) => okBtn,
    });
  };

  // 提交
  const handleSubmit = async () => {
    const dataInfo = await handleGetInfo();
    if (dataInfo) {
      return new Promise((resolve) => {
        submitItemFeedback({
          query: {
            ...templateInfo,
            customizeUnitCode: unitCode,
          },
          body: {
            ...dataInfo,
          },
        })
          .then((res) => {
            if (getResponse(res)) {
              notification.success();
              history.push(`/smdm/material-certification-feedback/list`);
            }
          })
          .finally(() => {
            resolve();
          });
      });
    }
  };

  const handleRefuseFeedbackOk = async (formDs) => {
    const flag = await formDs.validate();
    if (!flag) {
      return false;
    }
    const [{ feedbackRejectedReason, ...other }] = formDs ? formDs.toJSONData() : [{}];
    rejectItemFeedback({
      body: {
        ...(headerDs.current?.toData() || {}),
        feedbackRejectedReason,
        other,
      },
    }).then((res) => {
      if (getResponse(res)) {
        notification.success();
        history.push(`/smdm/material-certification-feedback/list`);
      }
    });
  };

  // 拒绝反馈
  const handleRefuseFeedback = () => {
    const formDs = new DataSet(feedbackRejectDS());
    Modal.open({
      title: intl.get(`${commonPrompt}.title.refusefeedback`).d('反馈拒绝确认'),
      drawer: true,
      style: {
        width: 450,
      },
      children: (
        <Form dataSet={formDs} labelLayout="float">
          <TextArea name="feedbackRejectedReason" resize="vertical" />
        </Form>
      ),
      onOk: () => {
        return handleRefuseFeedbackOk(formDs);
      },
    });
  };

  const headerBtn = () => {
    const operateButtonFlag = [
      'WAIT_FEEDBACK',
      'AUTHENTICATION_REJECTED',
      'PREAPPROVAL_REJECTED',
      'SAMPLE_DELIVERY_WAIT_FEEDBACK',
    ].includes(authFeeStatusCode);
    const buttons = [
      {
        name: 'submit',
        child: intl.get('hzero.common.button.submit').d('提交'),
        btnComp: Button,
        btnProps: {
          type: 'c7n-pro',
          color: 'primary',
          funcType: 'raised',
          wait: 500,
          icon: 'done',
          onClick: handleSubmit,
          hidden: !operateButtonFlag || !operateFlag,
          permissionList: [
            {
              code: 'srm.smdm.material.certification.feedback.button.submit',
              type: 'button',
              meaning: '提交',
            },
          ],
        },
      },
      {
        name: 'save',
        child: intl.get('hzero.common.button.save').d('保存'),
        btnComp: Button,
        btnProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          wait: 500,
          icon: 'save',
          onClick: handleSave,
          hidden: !operateButtonFlag || !operateFlag,
          permissionList: [
            {
              code: 'srm.smdm.material.certification.feedback.button.save',
              type: 'button',
              meaning: '保存',
            },
          ],
        },
      },
      {
        name: 'reject',
        child: intl.get(`${commonPrompt}.button.reject`).d('反馈拒绝'),
        btnComp: Button,
        hidden:
          ![
            'WAIT_FEEDBACK',
            'PREAPPROVAL_REJECTED',
            'AUTHENTICATION_REJECTED',
            'SAMPLE_DELIVERY_WAIT_FEEDBACK',
          ].includes(authFeeStatusCode) || !operateFlag,
        btnProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          wait: 500,
          icon: 'cancel',
          onClick: handleRefuseFeedback,
          permissionList: [
            {
              code: 'srm.smdm.material.certification.feedback.button.reject',
              type: 'button',
              meaning: '反馈拒绝',
            },
          ],
        },
      },
      {
        name: 'operation',
        child: intl.get(`hzero.common.button.operating`).d('操作记录'),
        btnComp: Button,
        btnProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'print',
          onClick: handleActHistory,
        },
      },
    ];

    return customizeBtnGroup(
      {
        code: 'SMDM_ITEM_FEEDBACK_DETAIL.HEADER_BUTTONS',
        pro: true,
      },
      <DynamicButtons buttons={buttons} />
    );
  };

  return (
    <Header
      title={intl.get(`${commonPrompt}.materialFeedbackDoc`).d('物料申请反馈单')}
      backPath="/smdm/material-certification-feedback/list"
    >
      <Spin spinning={loading}>
        <div className="page-head-operator" style={{ marginRight: '0px' }}>
          {!!queryFlag && headerBtn()}
        </div>
      </Spin>
    </Header>
  );
});

const Detail = function Detail() {
  const {
    init,
    onLoad,
    source,
    remotes,
    unitCode,
    queryFlag,
    templateInfo,
    headerDs,
    stageListDs,
    detailListDs,
    nodeList,
    commonUpdate,
    handleGetInfo,
    testingResultEnterFlag,
    customizeCollapse,
  } = useContext(Store); 

  const loading =
    init ||
    headerDs.status !== 'ready' ||
    detailListDs.status !== 'ready' ||
    stageListDs.status !== 'ready';

  const defaultActiveKey = ['baseInfo', 'detailInfo', 'sampleInfo', 'nodeInfo'];

  // 保存
  const handleSave = async () => {
    const dataInfo = await handleGetInfo();
    if (dataInfo) {
      return new Promise((resolve) => {
        saveItemFeedback({
          query: {
            ...templateInfo,
            customizeUnitCode: unitCode,
          },
          body: {
            ...dataInfo,
          },
        })
          .then((res) => {
            if (getResponse(res)) {
              notification.success();
              commonUpdate();
            }
          })
          .finally(() => {
            setTimeout(() => {
              resolve();
            }, 500);
          });
      });
    }
  };

  useEffect(() => {
    if (remotes && remotes.event) {
      remotes.event.fireEvent('cuxHanldeWorkFlowSave', {onLoad,source,handleSave, handleGetInfo})
    }
  }, []);
  
  return (
    <>
      <HeaderButtons loading={loading} handleSave={handleSave} />
      {!!queryFlag && (
        <div
          className={classnames(styles['new-detail-content'], styles['overflow-detail-content'])}
        >
          <Spin spinning={loading} style={{ height: '100%' }}>
            {nodeList?.length > 1 && (
              <Content>
                <NodeInfo />
              </Content>
            )}

            <Content>
              {customizeCollapse(
                {
                  code: 'SMDM_ITEM_FEEDBACK_DETAIL.COLLAPSE',
                },
                <Collapse
                  ghost
                  expandIconPosition="text-right"
                  defaultActiveKey={defaultActiveKey}
                  trigger="text-icon"
                >
                  <Panel
                    key="baseInfo"
                    header={intl.get(`${commonPrompt}.materialCA.baseInfo`).d('基本信息')}
                  >
                    <BaseInfo />
                  </Panel>

                  <Panel
                    key="detailInfo"
                    header={intl.get(`${commonPrompt}.materialCA.detailInfo`).d('明细信息')}
                  >
                    <DetailInfo />
                  </Panel>
                  <Panel
                    key="sampleInfo"
                    hidden={!testingResultEnterFlag}
                    header={intl.get(`${commonPrompt}.materialCA.sampleInfo`).d('样品信息')}
                  >
                    <SampleInfo />
                  </Panel>
                  <Panel
                    key="nodeInfo"
                    // id="-workSpace-detail-content-basicInfo"
                    header={intl.get(`${commonPrompt}.materialCA.nodeInfo`).d('阶段附件信息')}
                  >
                    <StageInfo />
                  </Panel>
                </Collapse>
              )}
            </Content>
          </Spin>
        </div>
      )}
    </>
  );
};

export default observer(Detail);

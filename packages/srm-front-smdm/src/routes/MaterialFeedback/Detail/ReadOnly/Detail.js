import React, { useContext, useEffect, useRef } from 'react';

import intl from 'utils/intl';
import classnames from 'classnames';
import { observer } from 'mobx-react-lite';
import { isFunction } from 'lodash';
import { Header, Content } from 'components/Page'; 
import { Spin, Modal } from 'choerodon-ui/pro';
import { Button } from 'components/Permission';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { Collapse } from 'choerodon-ui';

import {
  preAction,
  workFlowFeeSubmitSave,
  workFlowSubmitSaveCheck,
} from '@/services/materialCertificationPoolService';

import Remark from '../../components/Remark';
import NodeInfo from '../../components/NodeInfo';
import BaseInfo from '../../components/BaseInfo';
import DetailInfo from '../../components/DetailInfo';
import StageInfo from '../../components/StageInfo';
import SampleInfo from '../../components/SampleInfo';
import OperationRecord from '../../components/OperationHistory';

import { Store } from '../storeProvider';
import styles from '../index.less';

// 设置smdm国际化前缀 - common - model
const commonPrompt = 'smdm.common.model.common';
const { Panel } = Collapse;
const HeaderButtons = observer(({ loading }) => {
  const {
    header,
    history,
    remotes,
    headerDs,
    pubPathFlag,
    queryFlag,
    operateFlag,
    isPrequalification,
    itemAuthFeeHeaderId,
    nodeList,
    node,
    handleGetInfo,
    renderCuxHeaderButtons,
  } = useContext(Store);

  const remarkRef = useRef({});

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
          isFilterFlag={true}
        />
      ),
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: () => {},
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: (okBtn) => okBtn,
    });
  };
  
  const handlePreAction = (result) => {
    return Modal.open({
      key: Modal.key(),
      title: intl.get(`${commonPrompt}.preAction`).d('物料认证审批'),
      children: (
        <Remark
          ref={remarkRef}
          required={result === 'REJECTED'}
          remarkLabel={intl.get(`${commonPrompt}.preActionReason`).d('审批原因')}
        />
      ),
      drawer: true,
      closable: true,
      onOk: async () => {
        const remarkCurrent = remarkRef?.current?.saveCurrentData();
        const [{ operationReason, ...other }] = remarkCurrent ? remarkCurrent.toJSONData() : [{}];
        const validateFlag = await remarkCurrent.validate();
        if (validateFlag) {
          const params = {
            ...(headerDs.current?.toData() || {}),
            result,
            approvedRemark: operationReason,
            ...other,
          };
          const parameter = remotes
          ?await remotes.process("SMDM_ITEMCAFB_REMOTE_PRE_ACTION_PARAMS",params,{handleGetInfo})
          :params;
          await preAction(parameter).then((res) => {
            if (getResponse(res)) {
              notification.success();
              history.push(`/smdm/material-certification-pool/list`);
            }
          });
        } else {
          return false;
        }
      },
      movable: false,
      destroyOnClose: true,
      onCancel: () => {},
      style: { width: 380 },
    });
  };

  const headerBtn = () => {
    return (
      <>
        {isPrequalification && !!operateFlag && (
          <>
            <Button
              icon="check"
              type="c7n-pro"
              color="primary"
              funcType="raised"
              wait={500}
              onClick={() => handlePreAction('APPROVED')}
              permissionList={[
                {
                  code: `srm.smdm.material.certification.pool.button.preapproved`,
                  type: 'button',
                  meaning: '预审通过',
                },
              ]}
            >
              {intl.get(`${commonPrompt}.preApprove`).d('预审通过')}
            </Button>
            <Button
              icon="close"
              type="c7n-pro"
              funcType="flat"
              wait={500}
              onClick={() => handlePreAction('REJECTED')}
              permissionList={[
                {
                  code: `srm.smdm.material.certification.pool.api.preapproval.rejected`,
                  type: 'button',
                  meaning: '预审拒绝',
                },
              ]}
            >
              {intl.get(`${commonPrompt}.preReject`).d('预审拒绝')}
            </Button>
          </>
        )}
        <Button icon="assignment" funcType="flat" type="c7n-pro" onClick={handleActHistory}>
          {intl.get(`hzero.common.button.operating`).d('操作记录')}
        </Button>
        {typeof renderCuxHeaderButtons === 'function' &&
          renderCuxHeaderButtons({ pubPathFlag, headerDs, nodeList, node })}
      </>
    );
  };

  return (
    <Header
      backPath={
        isPrequalification
          ? '/smdm/material-certification-pool/list'
          : pubPathFlag
          ? null
          : '/smdm/material-certification-feedback/list'
      }
      title={intl.get(`${commonPrompt}.materialFeedbackDoc`).d('物料申请反馈单')}
    >
      <Spin spinning={loading}>
        <div className="page-head-operator" style={{ marginRight: '0px' }}>
          {!!queryFlag && headerBtn()}
        </div>
      </Spin>
    </Header>
  );
});

const Detail = function Detail({ onLoad, onFormLoaded }) {
  const {
    init,
    queryFlag,
    pubPathFlag,
    testingResultEnterFlag,
    headerDs,
    stageListDs,
    detailListDs,
    nodeList,
    handleGetInfo,
    isPrequalification,
    itemAuthReqHeaderId,
    handleWorkFlowCheck,
    templateInfo,
    unitCode,
    location,
    authFeeStatusCode,
    cuxDom,
    customizeCollapse,
  } = useContext(Store);

  const loading =
    init ||
    headerDs.status !== 'ready' ||
    detailListDs.status !== 'ready' ||
    stageListDs.status !== 'ready';

  const handleCuxSubmit = (result) => {
    const itemAuthCode = [
      'SMDM.ITEM_CERTIFIED.DETAIL_BASEINFO', // 基本信息0
      'SMDM.ITEM_CERTIFIED.DETAIL_LINEINFO', // 明细信息1
      'SMDM.ITEM_CERTIFIED.DETAIL_STAGEINFO', // 阶段信息2
      'SMDM.ITEM_CERTIFIED.DETAIL_SAMPLE', // 样品信息3
    ]?.join(',');
    return new Promise(async (resolve, reject) => {
      const approveFlag = await handleWorkFlowCheck({
        handleGetInfo,
        templateInfo,
        unitCode: `${unitCode},${itemAuthCode}`,
        location,
        result,
      });
      console.log(approveFlag);
      if (approveFlag) {
        resolve();
      } else {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject();
      }
    });
  };

  const handleSubmit = (result) => {
    return new Promise(async (resolve, reject) => {
      if (!cuxDom) {
        resolve();
      } else if (cuxDom && result === 'Approved') {
        const dataInfo = await handleGetInfo();
        const checkSaveFlag = getResponse(
          await workFlowSubmitSaveCheck({
            type: `ITEM_AUTH_FEE_APRROVAL`,
          })
        );
        if (checkSaveFlag) {
          if (dataInfo) {
            const itemAuthCode = [
              'SMDM.ITEM_CERTIFIED.DETAIL_BASEINFO', // 基本信息0
              'SMDM.ITEM_CERTIFIED.DETAIL_LINEINFO', // 明细信息1
              'SMDM.ITEM_CERTIFIED.DETAIL_STAGEINFO', // 阶段信息2
              'SMDM.ITEM_CERTIFIED.DETAIL_SAMPLE', // 样品信息3
            ]?.join(',');
            const approveFlag = getResponse(
              await workFlowFeeSubmitSave({
                query: { ...templateInfo, customizeUnitCode: `${unitCode},${itemAuthCode}` },
                body: dataInfo,
              })
            );
            if (approveFlag) {
              resolve();
            } else {
              // eslint-disable-next-line prefer-promise-reject-errors
              reject();
            }
          } else {
            reject();
          }
        } else {
          resolve();
        }
      } else {
        resolve();
      }
    });
  };

  useEffect(() => {
    if (isFunction(onLoad)) {
      onLoad({
        submit: handleWorkFlowCheck ? handleCuxSubmit : handleSubmit,
      });
    }
    return () => {
      if (isFunction(onLoad)) {
        console.log('组件被销毁');
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    onLoad,
    handleGetInfo,
    templateInfo,
    unitCode,
    itemAuthReqHeaderId,
    headerDs,
    handleWorkFlowCheck,
  ]);

  const defaultActiveKey = ['baseInfo', 'detailInfo', 'sampleInfo', 'nodeInfo'];

  useEffect(() => {
    const workflowLoading = headerDs?.current?.get('itemAuthFeeHeaderId') && !init;
    if (isFunction(onFormLoaded) && workflowLoading) {
      onFormLoaded(true);
    }
  }, [init, headerDs, authFeeStatusCode]);

  return (
    <>
      <HeaderButtons loading={loading} />
      {(!!queryFlag || !!pubPathFlag) && (
        <div
          className={classnames(
            styles['new-detail-content'],
            pubPathFlag ? '' : styles['overflow-detail-content']
          )}
        >
          <Spin spinning={loading} style={{ height: '100%' }}>
            {!pubPathFlag && nodeList?.length > 1 && !isPrequalification && (
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

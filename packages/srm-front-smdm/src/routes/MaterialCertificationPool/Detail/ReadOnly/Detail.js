/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useRef, useEffect } from 'react';

import intl from 'utils/intl';
import classnames from 'classnames';
import { isFunction } from 'lodash';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';
// import { Button } from 'components/Permission';
import { Header, Content } from 'components/Page';
import { Spin, Modal } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import DynamicButtons from '_components/DynamicButtons';
import PrintProButton from '_components/PrintProButton';
import { openApproveModal } from 'srm-front-boot/lib/components/ApproveModal';
import { checkPrintWindow, getPdfPreviewUrl } from 'srm-front-boot/lib/utils/utils';
import { SRM_MDM } from '_utils/config';

import {
  cancelItemAuth,
  endItemAuth,
  itemReqPrint,
  closeItemAuth,
  workFlowSubmitSave,
  workFlowSubmitSaveCheck,
} from '@/services/materialCertificationPoolService';
import { revokeWorkFlow } from '../../util.js';

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
    source,
    pubPathFlag,
    latestNode,
    authReqStatusCode,
    history,
    header,
    headerDs,
    queryFlag,
    operateFlag,
    detailListDs,
    customizeForm,
    nodeEarlyTerminationFlag,
    itemAuthReqHeaderId,
    customizeBtnGroup,
    isFirstNode,
    unitCode,
    closedFlag,
    handleGetInfo,
    templateInfo,
    cuxButtonsListFc,
  } = useContext(Store);

  const remarkRef = useRef({});

  const hasLineFlag = detailListDs?.getState('hasLineFlag') || false;

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
          nodeCodeMeaning={header?.get('nodeCodeMeaning')}
          itemAuthReqHeaderId={itemAuthReqHeaderId}
          authenticatedFlag={['certified', 'canceled', 'prequalification'].includes(source) ? 1 : 0}
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

  // 终止
  const handleEnd = () => {
    return Modal.open({
      key: Modal.key(),
      title: intl.get(`${commonPrompt}.earlyReasonTitle`).d('物料认证提前完成确认'),
      children: (
        <Remark
          ref={remarkRef}
          customizeForm={customizeForm}
          cusCode="SMDM.ITEM_PENDING_AUTH.CANCEL_MODAL"
          remarkLabel={intl.get(`${commonPrompt}.earlyReason`).d('提前完成原因')}
        />
      ),
      drawer: true,
      closable: true,
      onOk: async () => {
        const remarkCurrent = remarkRef?.current?.saveCurrentData();
        const [{ operationReason, ...other }] = remarkCurrent ? remarkCurrent.toJSONData() : [{}];
        const validateFlag = await remarkCurrent.validate();
        if (validateFlag) {
          endItemAuth({
            ...(headerDs.current?.toData() || {}),
            operationReason,
            ...other,
          }).then((res) => {
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

  // 取消
  const handleCancel = () => {
    return Modal.open({
      key: Modal.key(),
      title: intl.get(`${commonPrompt}.cancelReasonTitle`).d('物料认证取消确认'),
      children: (
        <Remark
          ref={remarkRef}
          customizeForm={customizeForm}
          cusCode="SMDM.ITEM_PENDING_AUTH.CANCEL_MODAL"
          remarkLabel={intl.get(`${commonPrompt}.cancelReason`).d('取消原因')}
        />
      ),
      drawer: true,
      closable: true,
      onOk: async () => {
        const remarkCurrent = remarkRef?.current?.saveCurrentData();
        const [{ operationReason, ...other }] = remarkCurrent ? remarkCurrent.toJSONData() : [{}];
        const validateFlag = await remarkCurrent.validate();
        const dataInfo = await handleGetInfo(true);
        if (validateFlag) {
          cancelItemAuth({
            ...dataInfo,
            operationReason,
            query: { ...templateInfo, customizeUnitCode: unitCode },
            ...other,
          }).then((res) => {
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

  // 打印
  const handlePrint = () => {
    return new Promise((resolve) => {
      const printFlag = checkPrintWindow();

      const patchParams = {
        itemAuthReqHeaderId,
        responseType: printFlag ? 'blob' : 'json',
        headers: printFlag ? {} : { 's-print-using-preview': '1' },
      };

      itemReqPrint(patchParams)
        .then(async (res) => {
          if (printFlag) {
            if (res && res.type && res.type.includes('application/json')) {
              const reader = new FileReader();
              reader.readAsText(res, 'utf-8');
              reader.onload = () => {
                const readers = reader.result;
                const parseObj = JSON.parse(readers);
                notification.error({ message: parseObj.message });
              };
            } else if (res) {
              const file = new Blob([res], { type: 'application/pdf' });
              const fileURL = URL.createObjectURL(file);
              const printWindow = window.open(fileURL);
              if (printWindow) printWindow.print();
            }
          }
          if (!printFlag) {
            if (getResponse(res)) {
              // 添加如下代码
              const { fileUrl, bucketName, fileToken } = res;
              const url = await getPdfPreviewUrl({ fileUrl, bucketName, fileToken });
              window.open(url);
            }
          }
        })
        .finally(() => {
          resolve();
        });
    });
  };

  //  关闭
  const handleClose = () => {
    return Modal.open({
      key: Modal.key(),
      title: intl.get(`${commonPrompt}.closeReasonTitle`).d('物料认证关闭确认'),
      children: (
        <Remark
          required={false}
          ref={remarkRef}
          customizeForm={customizeForm}
          remarkLabel={intl.get(`${commonPrompt}.closeReason`).d('关闭原因')}
        />
      ),
      drawer: true,
      closable: true,
      onOk: async () => {
        const remarkCurrent = remarkRef?.current?.saveCurrentData();
        const [{ operationReason, ...other }] = remarkCurrent ? remarkCurrent.toJSONData() : [{}];
        const validateFlag = await remarkCurrent.validate();
        return new Promise((resolve) => {
          if (validateFlag) {
            closeItemAuth({
              ...(headerDs.current?.toData() || {}),
              operationReason,
              ...other,
            }).then((res) => {
              if (getResponse(res)) {
                notification.success();
                history.push(`/smdm/material-certification-pool/list`);
              }
              resolve();
            });
          } else {
            resolve(false);
          }
        });
      },
      movable: false,
      destroyOnClose: true,
      onCancel: () => {},
      style: { width: 380 },
    });
  };

  const headerBtn = () => {
    const approvaFlags = headerDs?.getState('approvaFlags');
    const operationFlags = headerDs?.getState('operationFlags');
    const workFlowBusinessKey =
      header?.get('feeWorkflowBusinessKey') || header?.get('workflowBusinessKey');
    const approvaFlag = approvaFlags?.[workFlowBusinessKey];
    const operationFlag = operationFlags?.[workFlowBusinessKey];
    const { taskId, processInstanceId } = approvaFlag || {};
    const headerButtons = [
      {
        name: 'print',
        btnType: 'c7n-pro',
        child: intl.get('hzero.common.button.print').d('打印'),
        // btnComp: Button,
        btnProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'print',
          wait: 500,
          hidden: pubPathFlag || ['PREAPPROVAL'].includes(authReqStatusCode),
          onClick: handlePrint,
          // permissionList: [
          //   {
          //     code: `srm.smdm.material.certification.pool.button.print`,
          //     type: 'button',
          //     meaning: '打印',
          //   },
          // ],
        },
      },
      {
        name: 'printNew',
        type: 'c7n-pro',
        btnComp: PrintProButton,
        child: intl.get(`sodr.workspace.view.button.print`).d('打印'),
        btnProps: {
          buttonProps: {
            funcType: 'flat',
            hidden: pubPathFlag || ['PREAPPROVAL'].includes(authReqStatusCode),
            // permissionList: [
            //   {
            //     code: 'srm.smdm.material.certification.pool.button.new_print',
            //     type: 'button',
            //     meaning: '新打印',
            //   },
            // ],
          },
          wait: 500,
          requestUrl: `${SRM_MDM}/v1/${getCurrentOrganizationId()}/item-auth-req-headers/${itemAuthReqHeaderId}/print-token`,
          method: 'GET',
          buttonText: intl.get('hzero.common.button.print.new').d('打印-新'),
        },
      },
      {
        name: 'earlyEnd',
        btnType: 'c7n-pro',
        child: intl.get(`${commonPrompt}.earlyEnd`).d('提前完成'),
        // btnComp: Button,
        btnProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'do_not_disturb_alt',
          onClick: handleEnd,
          wait: 500,
          hidden:
            !['AUTHENTICATION_REJECTED', 'APPROVED', 'FEEDBACK_REJECTED'].includes(
              authReqStatusCode
            ) ||
            !operateFlag ||
            !latestNode ||
            !nodeEarlyTerminationFlag ||
            !hasLineFlag ||
            (isFirstNode && authReqStatusCode === 'FEEDBACK_REJECTED'),
          // permissionList: [
          //   {
          //     code: `srm.smdm.material.certification.pool.button.earlyend`,
          //     type: 'button',
          //     meaning: '提交按钮权限',
          //   },
          // ],
        },
      },
      {
        name: 'cancel',
        btnType: 'c7n-pro',
        // btnComp: Button,
        child: intl.get('hzero.common.button.cancel').d('取消'),
        btnProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'close',
          onClick: handleCancel,
          wait: 500,
          hidden:
            !operateFlag ||
            !latestNode ||
            !['AUTHENTICATION_REJECTED', 'APPROVED', 'FEEDBACK_REJECTED'].includes(
              authReqStatusCode
            ),
          // permissionList: [
          //   {
          //     code: `srm.smdm.material.certification.pool.button.cancel`,
          //     type: 'button',
          //     meaning: '取消',
          //   },
          // ],
        },
      },
      {
        name: 'approval',
        btnType: 'c7n-pro',
        // btnComp: Button,
        child: intl.get('hzero.common.button.approval').d('审批'),
        btnProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'check',
          onClick: () => {
            openApproveModal({
              modalProps: {
                closable: true,
              },
              taskId,
              processInstanceId,
              onSuccess: () => {
                if (history) {
                  history.push(`/smdm/material-certification-pool/list`);
                }
              },
            });
          },
          wait: 500,
          hidden: !(approvaFlags && approvaFlag && !pubPathFlag),
        },
      },
      {
        name: 'close',
        btnType: 'c7n-pro',
        // btnComp: Button,
        child: intl.get('hzero.common.status.closed').d('关闭'),
        btnProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'close',
          wait: 500,
          hidden:
            !operateFlag ||
            !closedFlag ||
            ![
              'APPROVED',
              'REJECTED',
              'AUTHENTICATION_APPROVED',
              'AUTHENTICATION_REJECTED',
              'PREAPPROVAL',
              'PREAPPROVAL_REJECTED',
              'TEST_RESULTS_TO_BE_ENTERED',
              'SAMPLE_DELIVERY_WAIT_FEEDBACK',
            ].includes(authReqStatusCode) ||
            (authReqStatusCode === 'REJECTED' && isFirstNode) ||
            ['prequalification'].includes(source),
          loading: ['submitting', 'loading'].includes(headerDs?.status),
          onClick: handleClose,
        },
      },
      {
        name: 'revoke',
        btnType: 'c7n-pro',
        // btnComp: Button,
        child: intl.get('hzero.common.button.revokeApproval').d('撤销审批'),
        btnProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'reply',
          onClick: async () => {
            const res = await revokeWorkFlow(workFlowBusinessKey);
            if (res && history) {
              history.push(`/smdm/material-certification-pool/list`);
            }
          },
          wait: 500,
          hidden: !(!pubPathFlag && operationFlags && operationFlag?.REVOKE),
        },
      },

      {
        name: 'opration',
        btnType: 'c7n-pro',
        btnProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'assignment',
          onClick: handleActHistory,
        },
        child: intl.get(`hzero.common.button.operating`).d('操作记录'),
      },
    ];
    const cuxButtons = isFunction(cuxButtonsListFc)
      ? cuxButtonsListFc({
          headerDs,
          detailListDs,
          handleGetInfo,
          templateInfo,
          history,
        })
      : [];
    headerButtons.push(...cuxButtons);
    const newHeaderButtons = headerButtons.filter((ele) => !ele.btnProps.hidden);

    return (
      <>
        {customizeBtnGroup(
          {
            code: unitCode?.split(',')[4],
            pro: true,
          },
          <DynamicButtons
            defaultBtnType="c7n-pro"
            buttons={newHeaderButtons}
            maxNum={5}
            permissions={[
              {
                name: 'print',
                code: 'srm.smdm.material.certification.pool.button.print',
              },
              {
                name: 'printNew',
                code: 'srm.smdm.material.certification.pool.button.new_print',
              },
              {
                name: 'earlyEnd',
                code: 'srm.smdm.material.certification.pool.button.earlyend',
              },
              {
                name: 'cancel',
                code: 'srm.smdm.material.certification.pool.button.cancel',
              },
              {
                name: 'close',
                code: 'srm.smdm.material.certification.pool.button.close',
              },
            ]}
          />
        )}
      </>
    );
  };

  return (
    <Header
      backPath={pubPathFlag ? null : '/smdm/material-certification-pool/list'}
      title={intl.get(`${commonPrompt}.materialAuthDoc`).d('物料认证申请单')}
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
    itemAuthReqHeaderId,
    queryFlag,
    pubPathFlag,
    testingResultEnterFlag,
    headerDs,
    stageListDs,
    detailListDs,
    nodeList,
    handleGetInfo,
    templateInfo,
    handleWorkFlowCheck,
    unitCode,
    location,
    authReqStatusCode,
    cuxDom,
    customizeCollapse,
  } = useContext(Store);

  const loading =
    init ||
    headerDs.status !== 'ready' ||
    detailListDs.status !== 'ready' ||
    stageListDs.status !== 'ready';

  const handleCuxSubmit = (result) => {
    return new Promise(async (resolve, reject) => {
      const approveFlag = await handleWorkFlowCheck({
        handleGetInfo,
        templateInfo,
        unitCode,
        result,
        location,
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
            type: `ITEM_AUTH_SUBMIT_APRROVAL`,
          })
        );
        if (checkSaveFlag) {
          if (dataInfo) {
            const approveFlag = getResponse(
              await workFlowSubmitSave({
                query: { ...templateInfo, customizeUnitCode: unitCode },
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
  }, [
    onLoad,
    handleGetInfo,
    templateInfo,
    unitCode,
    itemAuthReqHeaderId,
    headerDs,
    handleWorkFlowCheck,
  ]);

  useEffect(() => {
    const workflowLoading = headerDs?.current?.get('itemAuthReqHeaderId') && !init;
    console.log(authReqStatusCode, workflowLoading);
    if (isFunction(onFormLoaded) && workflowLoading) {
      onFormLoaded(true);
    }
  }, [init, headerDs, authReqStatusCode]);

  const defaultActiveKey = ['baseInfo', 'detailInfo', 'sampleInfo', 'nodeInfo'];

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
            {!pubPathFlag && nodeList?.length > 1 && (
              <Content>
                <NodeInfo />
              </Content>
            )}
            <Content>
              {customizeCollapse(
                {
                  code: unitCode?.includes('SMDM.ITEM_CERTIFIED.COLLAPSE')
                    ? 'SMDM.ITEM_CERTIFIED.COLLAPSE'
                    : 'SMDM.ITEM_PENDING_AUTH.COLLAPSE',
                },
                <Collapse
                  ghost
                  expandIconPosition="text-right"
                  defaultActiveKey={defaultActiveKey}
                  trigger="text-icon"
                >
                  <Panel
                    key="baseInfo"
                    // id="-workSpace-detail-content-basicInfo"
                    header={intl.get(`${commonPrompt}.materialCA.baseInfo`).d('基本信息')}
                  >
                    <BaseInfo />
                  </Panel>

                  <Panel
                    key="detailInfo"
                    // id="-workSpace-detail-content-basicInfo"
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

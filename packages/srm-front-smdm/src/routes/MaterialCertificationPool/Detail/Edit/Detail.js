import React, { useContext, useRef } from 'react';

import intl from 'utils/intl';
import classnames from 'classnames';
import { isFunction } from 'lodash';
import { getResponse } from 'utils/utils';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';
// import { Button } from 'components/Permission';
import { Header, Content } from 'components/Page';
import { Spin, Modal } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
// import { Button } from 'components/Permission';
import DynamicButtons from '_components/DynamicButtons';

import {
  saveItemAuth,
  submitItemAuth,
  deleteItemAuth,
  cancelItemAuth,
  returnItemAuth,
  closeItemAuth,
  endItemAuth,
  skipItemAuth,
  initiateSample,
  testResultSave,
  testResultSubmitSample,
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
    source,
    unitCode,
    queryFlag,
    operateFlag,
    isFirstNode,
    nodeSkipFlag,
    templateInfo,
    testingResultEnterFlag,
    nodeEarlyTerminationFlag,
    closedFlag,
    itemAuthReqHeaderId,
    authReqStatusCode,
    history,
    header,
    headerDs,
    latestNode,
    stageListDs,
    detailListDs,
    commonUpdate,
    handleGetInfo,
    customizeForm,
    customizeBtnGroup,
    submitParams,
    handleCuxRequired,
    handleCuxSubmitCheck,
    handleCuxTextResultSubmit, // 提交埋点逻辑！
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
          isFilterFlag
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
      if (testingResultEnterFlag && dataInfo?.itemAuthReqSampleVOList?.length === 0) {
        notification.warning({
          message: intl
            .get(`${commonPrompt}.itemAuthMustHaveSampleLine`)
            .d('提交失败，原因是样品信息未维护'),
        });
        headerDs.status = 'ready';
      } else if (dataInfo?.itemAuthReqLineVOList?.length === 0) {
        notification.warning({
          message: intl
            .get(`${commonPrompt}.itemAuthMustHaveLine`)
            .d('当前物料认证申请单未维护行信息'),
        });
      } else {
        if (isFunction(handleCuxSubmitCheck)) {
          const data = await handleCuxSubmitCheck();
          if (!data) return;
        }
        return new Promise((resolve) => {
          headerDs.status = 'submitting';
          submitItemAuth({
            query: { ...templateInfo, customizeUnitCode: unitCode },
            body: {
              ...dataInfo,
              ...(isFunction(submitParams) ? submitParams(dataInfo) : {}),
            },
          })
            .then((res) => {
              if (getResponse(res)) {
                notification.success();
                history.push(`/smdm/material-certification-pool/list`);
              }
            })
            .finally(() => {
              headerDs.status = 'ready';
              resolve();
            });
        });
      }
    }
  };

  // 保存
  const handleTestResultSave = async () => {
    if (isFunction(handleCuxRequired)) {
      handleCuxRequired({ headerDs, value: null });
    }
    const dataInfo = await handleGetInfo();

    // if(testingResultEnterFlag && dataInfo?.itemAuthReqSampleVOList?.length === 0){
    //   notification.warning({
    //     message: intl
    //       .get(`${commonPrompt}.itemAuthMustHaveSampleLine`)
    //       .d('当前物料认证申请单未维护样品信息'),
    //   });
    // }else
    if (dataInfo) {
      stageListDs.unSelectAll();
      stageListDs.clearCachedSelected();
      detailListDs.unSelectAll();
      detailListDs.clearCachedSelected();
      return new Promise((resolve) => {
        testResultSave({
          query: { ...templateInfo, customizeUnitCode: unitCode },
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

  // 保存
  const handleSave = async () => {
    const dataInfo = await handleGetInfo();

    // if(testingResultEnterFlag && dataInfo?.itemAuthReqSampleVOList?.length === 0){
    //   notification.warning({
    //     message: intl
    //       .get(`${commonPrompt}.itemAuthMustHaveSampleLine`)
    //       .d('当前物料认证申请单未维护样品信息'),
    //   });
    // }else
    if (dataInfo) {
      stageListDs.unSelectAll();
      stageListDs.clearCachedSelected();
      detailListDs.unSelectAll();
      detailListDs.clearCachedSelected();
      headerDs.status = 'loading';
      return new Promise((resolve) => {
        saveItemAuth({
          query: { ...templateInfo, customizeUnitCode: unitCode },
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
              headerDs.status = 'ready';
              resolve();
            }, 500);
          });
      });
    }
  };

  // 删除
  const handleDelete = () => {
    const data = header?.toData() || {};
    Modal.confirm({
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: (
        <div>
          {intl
            .get(`${commonPrompt}.itemAuthDeleteTip`, { reqHeaderNum: header?.get('reqHeaderNum') })
            .d(`确认要删除物料认证申请单${header?.get('reqHeaderNum')}`)}
        </div>
      ),
    }).then((button) => {
      if (button === 'ok') {
        return new Promise((resolve) => {
          deleteItemAuth({
            ...(data || {}),
          })
            .then((res) => {
              if (getResponse(res)) {
                notification.success();
                history.push(`/smdm/material-certification-pool/list`);
              }
            })
            .finally(() => {
              resolve();
            });
        });
      }
    });
  };

  // 终止
  const handleEnd = async () => {
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
        return new Promise((resolve) => {
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
              resolve();
            });
          } else {
            resolve(false);
          }
        });
      },
      movable: false,
      destroyOnClose: true,
      onCancel: () => { },
      style: { width: 380 },
    });
  };

  // 跳过
  const handleJumpover = async () => {
    return Modal.open({
      key: Modal.key(),
      title: intl.get(`${commonPrompt}.skipReasonTitle`).d('物料认证跳过确认'),
      children: (
        <Remark
          ref={remarkRef}
          customizeForm={customizeForm}
          cusCode="SMDM.ITEM_PENDING_AUTH.SKIP_MODAL"
          remarkLabel={intl.get(`${commonPrompt}.skipReason`).d('跳过原因')}
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
            skipItemAuth({
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
      onCancel: () => { },
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
        const query = source === 'testResultEntry' ? { testResultsInputFlag: 1 } : {};
        return new Promise((resolve) => {
          if (validateFlag) {
            cancelItemAuth({
              ...(headerDs.current?.toData() || {}),
              operationReason,
              ...other,
              query,
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
      onCancel: () => { },
      style: { width: 380 },
    });
  };

  // 退回
  const handleReturn = () => {
    return Modal.open({
      key: Modal.key(),
      title: intl.get(`${commonPrompt}.returnReasonTitle`).d('物料认证退回确认'),
      children: (
        <Remark
          required
          ref={remarkRef}
          customizeForm={customizeForm}
          remarkLabel={intl.get(`${commonPrompt}.returnReason`).d('退回原因')}
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
            returnItemAuth({
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
      onCancel: () => { },
      style: { width: 380 },
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
      onCancel: () => { },
      style: { width: 380 },
    });
  };

  // 录入结果提交
  const handleTestResultSubmit = async () => {
    const dataInfo = await handleGetInfo();
    if (dataInfo) {
      if (testingResultEnterFlag && dataInfo?.itemAuthReqSampleVOList?.length === 0) {
        notification.warning({
          message: intl
            .get(`${commonPrompt}.itemAuthMustHaveSampleLine`)
            .d('提交失败，原因是样品信息未维护'),
        });
      } else if (dataInfo?.itemAuthReqLineVOList?.length === 0) {
        notification.warning({
          message: intl
            .get(`${commonPrompt}.itemAuthMustHaveLine`)
            .d('当前物料认证申请单未维护行信息'),
        });
      } else if (isFunction(handleCuxTextResultSubmit)) {
        return new Promise((resolve) => {
          handleCuxTextResultSubmit({
            templateInfo,
            unitCode,
            dataInfo,
            headerDs,
            stageListDs,
            detailListDs,
            handleSave,
            history,
          }).finally(() => {
            resolve();
          });
        });
      } else {
        return new Promise((resolve) => {
          testResultSubmitSample({
            query: { ...templateInfo, customizeUnitCode: unitCode },
            body: {
              ...dataInfo,
              ...(isFunction(submitParams) ? submitParams(dataInfo) : {}),
            },
          })
            .then((res) => {
              if (getResponse(res)) {
                notification.success();
                history.push(`/smdm/material-certification-pool/list`);
              }
            })
            .finally(() => {
              resolve();
            });
        });
      }
    }
  };

  // 发起送样
  const handleInitiateSample = async () => {
    const dataInfo = await handleGetInfo();

    // if(testingResultEnterFlag && dataInfo?.itemAuthReqSampleVOList?.length === 0){
    //   notification.warning({
    //     message: intl
    //       .get(`${commonPrompt}.itemAuthMustHaveSampleLine`)
    //       .d('当前物料认证申请单未维护样品信息'),
    //   });
    // }else

    if (dataInfo) {
      stageListDs.unSelectAll();
      stageListDs.clearCachedSelected();
      detailListDs.unSelectAll();
      detailListDs.clearCachedSelected();
      return new Promise((resolve) => {
        initiateSample({
          query: { ...templateInfo, customizeUnitCode: unitCode },
          body: {
            ...dataInfo,
          },
        })
          .then((res) => {
            if (getResponse(res)) {
              notification.success();
              history.push(`/smdm/material-certification-pool/list`);
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

  const headerBtn = () => {
    // 提交，新建，删除等操作的判断条件- operateFlag：认证策略中的可操作角色
    const submitHiddenFlag =
      !!operateFlag &&
      latestNode &&
      ['PENDING', 'REJECTED', 'FEEDBACK_REJECTED'].includes(authReqStatusCode);
    // 提前完成，取消等操作的公共判断条件
    const earlyEndHiddenFlag = [
      'PENDING',
      'FEEDBACK_REJECTED',
      'AUTHENTICATION_REJECTED',
      'APPROVED',
    ].includes(authReqStatusCode);

    const headerButtons = [
      {
        name: 'testResultSubmit',
        btnType: 'c7n-pro',
        // btnComp: Button,
        child: intl.get(`${commonPrompt}.testResultSubmit`).d('录入结果提交'),
        btnProps: {
          type: 'c7n-pro',
          funcType: 'raised',
          icon: 'done',
          color: 'primary',
          wait: 500,
          hidden: source !== 'testResultEntry' || !operateFlag,
          onClick: handleTestResultSubmit,
          // permissionList: [
          //   {
          //     code: `srm.smdm.material.certification.pool.button.testResultSubmit`,
          //     type: 'button',
          //     meaning: '录入结果提交',
          //   },
          // ],
        },
      },
      {
        name: 'testResultSave',
        btnType: 'c7n-pro',
        // btnComp: Button,
        child: intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'save',
          wait: 500,
          hidden: source !== 'testResultEntry' || !operateFlag,
          onClick: handleTestResultSave,
          loading: ['submitting', 'loading'].includes(headerDs?.status),
          // permissionList: [
          //   {
          //     code: `srm.smdm.material.certification.pool.button.testResultSubmit`,
          //     type: 'button',
          //     meaning: '录入结果提交',
          //   },
          // ],
        },
      },
      {
        name: 'sampleDelivery',
        btnType: 'c7n-pro',
        // btnComp: Button,
        child: intl.get(`${commonPrompt}.sampleDelivery`).d('发起送样'),
        btnProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'save',
          wait: 500,
          hidden: source !== 'testResultEntry' || !operateFlag,
          onClick: handleInitiateSample,
          // permissionList: [
          //   {
          //     code: `srm.smdm.material.certification.pool.button.sampleDelivery`,
          //     type: 'button',
          //     meaning: '发起送样',
          //   },
          // ],
        },
      },
      {
        name: 'submit',
        btnType: 'c7n-pro',
        // btnComp: Button,
        child: intl.get('hzero.common.button.submit').d('提交'),
        btnProps: {
          type: 'c7n-pro',
          funcType: 'raised',
          icon: 'done',
          color: 'primary',
          wait: 500,
          hidden: !submitHiddenFlag,
          loading: ['submitting', 'loading'].includes(headerDs?.status),
          onClick: handleSubmit,
          // permissionList: [
          //   {
          //     code: `srm.smdm.material.certification.pool.button.submit`,
          //     type: 'button',
          //     meaning: '提交',
          //   },
          // ],
        },
      },
      {
        name: 'save',
        btnType: 'c7n-pro',
        // btnComp: Button,
        child: intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'save',
          wait: 500,
          hidden: !submitHiddenFlag,
          loading: ['submitting', 'loading'].includes(headerDs?.status),
          onClick: handleSave,
          // permissionList: [
          //   {
          //     code: `srm.smdm.material.certification.pool.button.save`,
          //     type: 'button',
          //     meaning: '保存',
          //   },
          // ],
        },
      },
      {
        name: 'delete',
        btnType: 'c7n-pro',
        // btnComp: Button,
        child: intl.get('hzero.common.button.delete').d('删除'),
        btnProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'delete',
          wait: 500,
          hidden: !submitHiddenFlag || !isFirstNode || authReqStatusCode === 'FEEDBACK_REJECTED',
          loading: ['submitting', 'loading'].includes(headerDs?.status),
          onClick: handleDelete,
          // permissionList: [
          //   {
          //     code: `srm.smdm.material.certification.pool.button.delete`,
          //     type: 'button',
          //     meaning: '删除',
          //   },
          // ],
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
        name: 'skip',
        btnType: 'c7n-pro',
        // btnComp: Button,
        child: intl.get('smdm.common.button.skip').d('跳过'),
        btnProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'recover',
          wait: 500,
          hidden: !submitHiddenFlag || !nodeSkipFlag || !hasLineFlag,
          onClick: handleJumpover,
          // permissionList: [
          //   {
          //     code: `srm.smdm.material.certification.pool.button.skip`,
          //     type: 'button',
          //     meaning: '跳过',
          //   },
          // ],
        },
      },
      {
        name: 'earlyEnd',
        btnType: 'c7n-pro',
        // btnComp: Button,
        child: intl.get(`${commonPrompt}.earlyEnd`).d('提前完成'),
        btnProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'do_not_disturb_alt',
          wait: 500,
          onClick: handleEnd,
          hidden:
            !earlyEndHiddenFlag ||
            !operateFlag ||
            !latestNode ||
            !nodeEarlyTerminationFlag ||
            !hasLineFlag ||
            (isFirstNode && authReqStatusCode === 'FEEDBACK_REJECTED'),
          // permissionList: [
          //   {
          //     code: `srm.smdm.material.certification.pool.button.earlyend`,
          //     type: 'button',
          //     meaning: '提前完成按钮权限',
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
          loading: ['submitting', 'loading'].includes(headerDs?.status),
          hidden:
            !['AUTHENTICATION_REJECTED', 'APPROVED', 'TEST_RESULTS_TO_BE_ENTERED', 'FEEDBACK_REJECTED'].includes(
              authReqStatusCode
            ) ||
            !operateFlag ||
            !latestNode,
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
        name: 'return',
        btnType: 'c7n-pro',
        // btnComp: Button,
        child: intl.get('hzero.common.button.return').d('退回'),
        btnProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'reply',
          onClick: handleReturn,
          wait: 500,
          // 退回按钮与录入结果提交保持一致
          // hidden:
          //   !['TEST_RESULTS_TO_BE_ENTERED'].includes(authReqStatusCode) ||
          //   !operateFlag ||
          //   !latestNode,
          hidden: source !== 'testResultEntry' || !operateFlag,
        },
      },
      {
        name: 'opration',
        btnType: 'c7n-pro',
        // btnComp: Button,
        btnProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'assignment',
          onClick: handleActHistory,
        },
        child: intl.get(`hzero.common.button.operating`).d('操作记录'),
      },
    ];

    const newHeaderButtons = headerButtons.filter((ele) => !ele.btnProps.hidden);

    return (
      <>
        {customizeBtnGroup(
          {
            code: 'SMDM.ITEM_PENDING_AUTH.DETAIL_BTN',
            pro: true,
          },
          <DynamicButtons
            defaultBtnType="c7n-pro"
            buttons={newHeaderButtons}
            maxNum={5}
            permissions={[
              {
                name: 'testResultSubmit',
                code: 'srm.smdm.material.certification.pool.button.testResultSubmit',
              },
              {
                name: 'sampleDelivery',
                code: 'srm.smdm.material.certification.pool.button.sampleDelivery',
              },
              {
                name: 'submit',
                code: 'srm.smdm.material.certification.pool.button.submit',
              },
              {
                name: 'save',
                code: 'srm.smdm.material.certification.pool.button.save',
              },
              {
                name: 'delete',
                code: 'srm.smdm.material.certification.pool.button.delete',
              },
              {
                name: 'skip',
                code: 'srm.smdm.material.certification.pool.button.skip',
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
                name: 'return',
                code: 'srm.smdm.material.certification.pool.button.return',
              },
              {
                name: 'testResultSave',
                code: 'srm.smdm.material.certification.pool.button.test_result_save',
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
      title={intl.get(`${commonPrompt}.materialAuthDoc`).d('物料认证申请单')}
      backPath="/smdm/material-certification-pool/list"
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
    queryFlag,
    headerDs,
    stageListDs,
    detailListDs,
    testingResultEnterFlag,
    nodeList,
    customizeCollapse,
    unitCode,
  } = useContext(Store);

  const loading =
    init ||
    headerDs.status !== 'ready' ||
    detailListDs.status !== 'ready' ||
    stageListDs.status !== 'ready';
  const defaultActiveKey = ['baseInfo', 'detailInfo', 'sampleInfo', 'nodeInfo'];

  return (
    <>
      <HeaderButtons loading={loading} />
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

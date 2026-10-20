import React, { useContext, useRef, useEffect, useCallback } from 'react';
import queryString from 'querystring';
import intl from 'utils/intl';
import classnames from 'classnames';
import { isEmpty, isArray, isFunction, isObject } from 'lodash';
import { getResponse } from 'utils/utils';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';

import { Header, Content } from 'components/Page';
import { Modal, Spin } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import { Button } from 'components/Permission';
import DynamicButtons from '_components/DynamicButtons';

import AiCheckAlert from '@/routes/components/AiCheckAlert';
import OperationNewRecord from '@/routes/components/OperationHistory';
import { BudgetCheckTable } from '@/routes/components/BudgetCheckTable';
import { saveFirst } from '@/services/purchasePlatformService';
import {
  update,
  singleSubmit,
  cancel,
  deleteHeader,
  budgetCheck,
} from '@/services/purchaseRequisitionCreationService';
import { THROTTLE_TIME } from '@/routes/utils';
import BaseInfo from './BaseInfo';
import BillingInfo from './BillingInfo';
import DeliveryInfo from './DeliveryInfo';
import Remark from '../components/Remark';
import PurchaseOrgInfo from './PurchaseOrgInfo';
import PurchaseLineInfo from './PurchaseLineInfo';
import AttachmentInfo from '../components/AttachmentInfo';
import Anchor from '../components/Anchor';

import { Store } from '../stores';
import styles from '../index.less';

// 设置sprm国际化前缀 - common - model
const commonPrompt = 'sprm.common.model.common';
const { Panel } = Collapse;
const defaultActiveKey = [
  'baseInfo',
  'purchaseOrgInfo',
  'deliveryInfo',
  'billingInfo',
  'attachmentInfo',
  'editTable',
];

const HeaderButtons = observer(() => {
  const {
    handleOperationModal,
    customizeForm,
    customizeBtnGroup,
    history,
    headerDs,
    listDs,
    backPath,
    prHeaderId,
    listUnitCode,
    headerUnitCode,
    commonUpdate,
    handleGetInfo,
    prSourcePlatform,
    uomControl,
    headerLoading,
    setHeaderLoading,
    handleBackPath,
    lineDsSaveFlag,
    setLineDsSaveFlag,
    handleBeforeSave,
    handleBeforeSubmit,
    handleCuxSubmit,
    handleBeforeSRMSubmit,
    handleCuxSave,
    handleSubmitedMsg,
    handleSubmitedAfterMsg,
    handleAiCheckSubmit,
    cuxBudgetCheck,
    handleCuxOperation,
    handleRenderCuxOperation,
    remote,
    cuxLineRef,
  } = useContext(Store);
  const remarkRef = useRef({});
  const { current } = headerDs;
  const backCuxHeader = isFunction(handleBackPath) ? handleBackPath({ location }) : {};

  // 保存
  const handleSave = () => {
    return new Promise(async () => {
      setHeaderLoading(true);
      setTimeout(async () => {
        const data = await handleGetInfo();
        let { prLineList = [] } = data || {};
        if (data) {
          if (isFunction(handleCuxSave)) {
            prLineList = await handleCuxSave({ data });
            if (!isObject(prLineList)) {
              setHeaderLoading(false);
              return;
            }
          }
          // 行信息处理
          const prLine = prLineList?.map((ele) => {
            const nullObject =
              isArray(ele.supplierList) && ele.supplierList.length
                ? {
                    supplierNum: undefined,
                    supplierName: undefined,
                    supplierId: undefined,
                    supplierCode: undefined,
                    supplierTenantId: undefined,
                    supplierCompanyId: undefined,
                    supplierCompanyNum: undefined,
                    supplierCompanyCode: undefined,
                    supplierCompanyName: undefined,
                    supplierCompanyIdLov: undefined,
                    displaySupplierName: undefined,
                  }
                : {};
            // 双单位逻辑处理，当未开启双单位的时候，辅助单位，数量，单价=基本的单位，数量，单价
            const {
              taxIncludedUnitPrice,
              secondaryTaxInUnitPrice,
              quantity,
              secondaryQuantity,
              uomId,
              uomCode,
              secondaryUomId,
              secondaryUomCode,
            } = ele;
            return {
              ...ele,
              secondaryTaxInUnitPrice: uomControl ? secondaryTaxInUnitPrice : taxIncludedUnitPrice,
              taxIncludedUnitPrice: uomControl
                ? taxIncludedUnitPrice || secondaryTaxInUnitPrice
                : taxIncludedUnitPrice,
              secondaryQuantity: uomControl ? secondaryQuantity : quantity,
              secondaryUomId: uomControl ? secondaryUomId : uomId,
              secondaryUomCode: uomControl ? secondaryUomCode : uomCode,
              supplierList: !isArray(ele.supplierList)
                ? []
                : ele?.supplierList?.map((item) => ({
                    ...item,
                  })),
              ...nullObject,
            };
          });
          const dataInfo = {
            ...data,
            prLineList: prLine,
            customizeUnitCode: `${headerUnitCode},${listUnitCode}`,
          };
          if (!prHeaderId) {
            const res = await saveFirst({ ...dataInfo });
            if (res && !res.failed) {
              if (res?.saveResponseTipMsg) {
                notification.warning({ message: res?.saveResponseTipMsg });
              } else {
                notification.success();
                // eslint-disable-next-line no-unused-expressions
                headerDs.current?.set({ cuxFieldBatchMapNoModal: null, batchEditFieldMap: null });
              }
              if (history) {
                // eslint-disable-next-line no-unused-expressions
                headerDs.current?.set({ cuxFieldBatchMapNoModal: null, batchEditFieldMap: null });
                history.push({
                  pathname: backCuxHeader?.currentPath
                    ? `${backCuxHeader?.currentPath}/${res?.prHeaderId}`
                    : `/sprm/purchase-platform/creation-detail/${res?.prHeaderId}`,
                  search: `prHeaderId=${res.prHeaderId}`,
                });
              }
            } else if (res && res.failed) {
              notification.error({ message: res.message });
            }
          } else {
            // 保存更新前的二开拦截校验
            if (typeof handleBeforeSave === 'function') {
              const res = await handleBeforeSave({ dataInfo, listDs, headerDs, cuxLineRef });
              if (!res) {
                setHeaderLoading(false);
                return false;
              }
            }
            const res = await update({
              ...dataInfo,
            });
            if (res && !res.failed) {
              if (res?.saveResponseTipMsg) {
                notification.warning({ message: res?.saveResponseTipMsg });
              } else {
                notification.success();
              }
              setLineDsSaveFlag(lineDsSaveFlag + 1);
              await commonUpdate();
            } else if (res && res.failed) {
              notification.error({ message: res.message });
            }
          }
        }
        setHeaderLoading(false);
      }, 300);
    });
  };

  // 提交
  const handleSubmit = useCallback(async () => {
    setHeaderLoading(true);
    if (listDs?.length === 0) {
      notification.warning({
        message: intl
          .get('sprm.purchaseReqCreation.view.message.mustHaveLine')
          .d('当前采购申请未维护行信息'),
      });
      setHeaderLoading(false);
    } else {
      return new Promise(async () => {
        setTimeout(async () => {
          const data = await handleGetInfo();
          if (data) {
            const { prLineList = [] } = data;
            // 行信息处理，处理多选供应商
            const prLine = prLineList?.map((ele) => {
              const nullObject =
                isArray(ele.supplierList) && ele.supplierList.length
                  ? {
                      supplierNum: undefined,
                      supplierName: undefined,
                      supplierId: undefined,
                      supplierCode: undefined,
                      supplierTenantId: undefined,
                      supplierCompanyId: undefined,
                      supplierCompanyNum: undefined,
                      supplierCompanyCode: undefined,
                      supplierCompanyName: undefined,
                      supplierCompanyIdLov: undefined,
                      displaySupplierName: undefined,
                    }
                  : {};
              // 双单位逻辑处理，当未开启双单位的时候，辅助单位，数量，单价=基本的单位，数量，单价
              const {
                taxIncludedUnitPrice,
                secondaryTaxInUnitPrice,
                quantity,
                secondaryQuantity,
                uomId,
                uomCode,
                secondaryUomId,
                secondaryUomCode,
              } = ele;
              return {
                ...ele,
                secondaryTaxInUnitPrice: uomControl
                  ? secondaryTaxInUnitPrice
                  : taxIncludedUnitPrice,
                taxIncludedUnitPrice: uomControl
                  ? taxIncludedUnitPrice || secondaryTaxInUnitPrice
                  : taxIncludedUnitPrice,
                secondaryQuantity: uomControl ? secondaryQuantity : quantity,
                secondaryUomId: uomControl ? secondaryUomId : uomId,
                secondaryUomCode: uomControl ? secondaryUomCode : uomCode,
                supplierList: !isArray(ele.supplierList)
                  ? []
                  : ele?.supplierList?.map((item) => ({
                      ...item,
                    })),
                ...nullObject,
              };
            });
            const dataInfo = {
              ...data,
              prLineList: prLine,
              customizeUnitCode: `${headerUnitCode},${listUnitCode}`,
            };
            const handleGoBack = () => {
              if (history) {
                history.push(backCuxHeader?.backCuxPath || `/sprm/purchase-platform/list`);
              }
            };
            const submit = async () => {
              // 二开：SRM的变更单子提交前执行钩子
              if (typeof handleBeforeSRMSubmit === 'function' && prSourcePlatform === 'SRM') {
                const res = await handleBeforeSRMSubmit({ dataInfo });
                if (!res) return false;
              }

              // 提交前的二开拦截校验
              if (typeof handleBeforeSubmit === 'function') {
                const res = await handleBeforeSubmit({
                  dataInfo,
                  isBatch: false,
                  listDs,
                  headerDs,
                  handleGoBack,
                  handleSave,
                  update,
                  setLineDsSaveFlag,
                  commonUpdate,
                  lineDsSaveFlag,
                  handleGetInfo,
                  cuxLineRef,
                });
                if (!res) return false;
              }
              if (isFunction(handleCuxSubmit)) {
                const response = await handleCuxSubmit({
                  dataInfo,
                  listDs,
                  headerDs,
                });
                if (!response) return false;
              }

              const res = getResponse(await singleSubmit({ ...dataInfo }));

              if (res && !res.failed) {
                if (isFunction(handleSubmitedMsg)) {
                  handleSubmitedMsg(res);
                } else if (res?.submitResponseTipMsg) {
                  notification.warning({ message: res?.submitResponseTipMsg });
                } else {
                  notification.success();
                }
                if (isFunction(handleSubmitedAfterMsg)) {
                  handleSubmitedAfterMsg(res, handleGoBack, commonUpdate);
                } else {
                  handleGoBack();
                }
              }
            };

            const handleOperationSubmitModal = async () => {
              // 工作流审批提交前的弹窗表单
              const result = await handleOperationModal({
                code: 'SPRM.PURCHASE_PLAFORM_CREATE.OPERATION_SUBMIT_FORM',
                operationType: 'SUBMIT',
                dataInfo,
                body: {
                  ...data,
                  prLineList: [],
                },
                handleOk: (customWorkFlowParam) => {
                  dataInfo.customWorkFlowParam = customWorkFlowParam;
                },
                handleCancel: () => {
                  setHeaderLoading(false);
                },
              });
              return result;
            };

            // 来源SRM，提交进行预算校验, cuxSkipBudget为二开字段，判断是否跳过预算校验-三生
            console.log(current.get('cuxSkipBudget'));
            if (['SRM', 'SHOP'].includes(prSourcePlatform) && !current?.get('cuxSkipBudget')) {
              const checkMsg = await budgetCheck([
                {
                  ...data,
                  prLineList: prLine,
                },
              ]);

              if (checkMsg && checkMsg?.length && !checkMsg.failed) {
                // 预算不足的行
                const failedList = [];

                // 需要检查提示的行
                const checkList = [];

                const cuxBudgetRemainingAmount = {};

                (checkMsg[0].prLineList || []).forEach((item) => {
                  cuxBudgetRemainingAmount[item.prLineId] = item.remainingAmount;
                  if (item?.failed === '1') {
                    failedList.push({
                      ...item,
                      displayPrNum: checkMsg[0].displayPrNum,
                    });
                  } else if (['02', '03'].includes(item.errorStatusCode)) {
                    checkList.push({
                      ...item,
                      displayPrNum: checkMsg[0].displayPrNum,
                    });
                  }
                });
                dataInfo.cuxBudgetRemainingAmount = JSON.stringify(cuxBudgetRemainingAmount);
                if (isFunction(cuxBudgetCheck)) {
                  const checkFlag = cuxBudgetCheck({
                    checkMsg,
                    failedList,
                    checkList,
                    dataInfo,
                  });
                  if (!checkFlag) {
                    return false;
                  }
                }
                if (!isEmpty(failedList)) {
                  const prListStr = failedList
                    ?.filter((i) => i?.failed === '1')
                    ?.map((e) => `${e.displayPrNum}|${e.lineNum}`)
                    .join(', ');
                  const prLineErrors = failedList
                    ?.filter((i) => i?.failed === '1')
                    ?.map((e) => e.errorMessage)
                    .join(', ');
                  notification.error({
                    message:
                      intl.get(`${commonPrompt}.prNum`).d('采购申请编号') +
                      prListStr +
                      prLineErrors,
                  });
                  setHeaderLoading(false);
                  return;
                } else if (!isEmpty(failedList) || !isEmpty(checkList)) {
                  // 余额已超过预警线 或者  余额不足，未超过预算允差范围
                  Modal.open({
                    key: Modal.key(),
                    closable: true,
                    drawer: true,
                    style: { width: '742px' },
                    title: intl.get(`${commonPrompt}.budgetCheckTip`).d('预算校验提示'),
                    border: true,
                    children: (
                      <BudgetCheckTable
                        data={checkList}
                        tipMessage={intl
                          .get(`sprm.common.model.common.budgetCheckSubmit`)
                          .d('以下申请行已超预警线或超量占用，请确认是否继续提交？')}
                      />
                    ),
                    onOk: async () => {
                      setHeaderLoading(true);
                      // 工作流审批提交前的弹窗表单
                      const result = await handleOperationSubmitModal();
                      if (!result) {
                        setHeaderLoading(false);
                        return false;
                      }
                      await submit();
                      setHeaderLoading(false);
                    },
                    onCancel: () => {},
                    destroyOnClose: true,
                  });
                  setHeaderLoading(false);
                  return;
                }
              } else if (checkMsg?.failed) {
                notification.error({ message: checkMsg?.message });
                setHeaderLoading(false);
                return;
              }
            }

            // 工作流审批提交前的弹窗表单
            const result = await handleOperationSubmitModal();
            if (!result) return false;
            await submit();
          }
          setHeaderLoading(false);
        }, 300);
      });
    }
  }, [
    headerDs,
    listDs,
    handleGetInfo,
    commonUpdate,
    headerUnitCode,
    listUnitCode,
    prSourcePlatform,
    history,
  ]);

  // 删除
  const handleDelete = async () => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      bodyStyle: { padding: '20px' },
      children: (
        <p>
          {intl.get('sprm.purchaseReqCreation.view.message.confirmDelete').d('是否确认删除需求?')}
        </p>
      ),
    }).then((button) => {
      if (button === 'ok') {
        setHeaderLoading(true);
        deleteHeader([{ ...current?.toData() }]).then((res) => {
          setHeaderLoading(false);
          if (getResponse(res)) {
            notification.success();
            if (history) {
              history.push(backCuxHeader?.backCuxPath || `/sprm/purchase-platform/list`);
            }
          }
        });
      }
    });
  };

  // 打开操作记录
  const handleActHistory = () => {
    return Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: '742px' },
      bodyStyle: { paddingTop: '20px' },
      title: intl.get(`hzero.common.button.operating`).d('操作记录'),
      children: (
        <OperationNewRecord
          prHeaderId={prHeaderId}
          handleCuxOperation={handleCuxOperation}
          handleRenderCuxOperation={handleRenderCuxOperation}
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

  // 取消
  const handleCancel = () => {
    const { handleCancelProps } = remote?.props?.process || {};
    return Modal.open({
      key: Modal.key(),
      title: intl.get(`sprm.purchaseRequisitionCancel.view.message.cancelReason`).d('取消原因'),
      children: (
        <Remark
          prHeaderId={prHeaderId}
          ref={remarkRef}
          required
          customizeForm={customizeForm}
          cusCode="SPRM.PURCHASE_PLAFORM.CANCELMODAL"
          remarkLabel={intl
            .get(`sprm.purchaseRequisitionCancel.view.message.cancelReason`)
            .d('取消原因')}
        />
      ),
      drawer: true,
      closable: true,
      onOk: async () => {
        setHeaderLoading(true);
        const remarkCurrent = remarkRef?.current?.saveCurrentData();
        const [{ cancelledRemark, ...other }] = remarkCurrent ? remarkCurrent.toJSONData() : [{}];
        const validateFlag = await remarkCurrent.validate();
        if (validateFlag) {
          // 工作流审批提交前的弹窗表单
          const resp = await handleOperationModal({
            code: 'SPRM.PURCHASE_PLAFORM_CANCEL.OPERATION_CANCEL_FORM',
            operationType: 'CANCEL',
            body: {
              prHeaderId,
              prLineList: [],
            },
            handleOk: (data) => {
              other.customWorkFlowParam = data;
            },
            handleCancel: () => {
              setHeaderLoading(false);
            },
          });
          if (!resp) return false;

          const cuxCancelProps = isFunction(handleCancelProps)
            ? handleCancelProps({ headCurrent: current, ...other })
            : {};
          cancel([{ ...current?.toData(), cancelledRemark, ...other, ...cuxCancelProps }]).then(
            (res) => {
              setHeaderLoading(false);
              if (res && !res.failed) {
                notification.success();
                if (history) {
                  history.push(backCuxHeader?.backCuxPath || `/sprm/purchase-platform/list`);
                }
              } else if (res && res.failed) {
                notification.error({ message: res.message });
              }
            }
          );
        } else {
          setHeaderLoading(false);
          return false;
        }
      },
      movable: false,
      destroyOnClose: true,
      onCancel: () => {
        setHeaderLoading(false);
      },
      style: { width: 380 },
    });
  };

  const headerBtn = () => {
    const { createHeaderBtnFc } = remote?.props?.process || {};
    const headerButtons = [
      {
        name: 'save',
        // btnComp: Button,
        btnProps: {
          icon: 'save',
          type: 'c7n-pro',
          color: prHeaderId ? 'default' : 'primary',
          funcType: prHeaderId ? 'flat' : 'raised',
          onClick: handleSave,
          wait: THROTTLE_TIME,
          loading: headerDs.status !== 'ready' || listDs.status !== 'ready' || headerLoading,
          disabled:
            !current ||
            [
              'SUBMIT_SYN',
              'CANCELLED',
              'CLOSED',
              'WORKFLOW_APPROVAL',
              'EXOSYS_APPROVAL',
              'SUBMITTED',
              'APPROVED',
            ].includes(current?.get('prStatusCode')) ||
            headerLoading,
        },
        hidden:
          current?.get('prStatusCode') === 'PENDING' &&
          current?.get('cancelStatusCode') !== 'UNCANCELLED',
        child: intl.get(`hzero.common.button.save`).d('保存'),
      },
      {
        name: 'submit',
        // btnComp: Button,
        btnProps: {
          icon: 'done',
          type: 'c7n-pro',
          color: 'primary',
          funcType: 'raised',
          onClick: handleSubmit,
          wait: THROTTLE_TIME,
          loading: headerDs.status !== 'ready' || listDs.status !== 'ready' || headerLoading,
          disabled:
            !current ||
            !current?.get('prHeaderId') ||
            !prHeaderId ||
            ['SUBMIT_SYNC', 'SUBMITTED', 'APPROVED', 'WORKFLOW_APPROVAL'].includes(
              current?.get('prStatusCode')
            ) ||
            headerLoading,
        },
        hidden:
          !prHeaderId ||
          (current?.get('prStatusCode') === 'PENDING' &&
            current?.get('cancelStatusCode') !== 'UNCANCELLED'),
        child: intl.get(`hzero.common.button.submit`).d('提交'),
      },
      {
        name: 'delete',
        btnType: 'c7n-pro',
        // btnComp: Button,
        btnProps: {
          icon: 'delete',
          type: 'c7n-pro',
          funcType: 'flat',
          onClick: handleDelete,
          wait: THROTTLE_TIME,
          loading: headerDs.status !== 'ready' || listDs.status !== 'ready' || headerLoading,
          disabled:
            !prHeaderId ||
            !current?.get('prHeaderId') ||
            prSourcePlatform !== 'SRM' ||
            [
              'SUBMIT_SYN',
              'CANCELLED',
              'CLOSED',
              'WORKFLOW_APPROVAL',
              'EXOSYS_APPROVAL',
              'SUBMITTED',
              'APPROVED',
            ].includes(current?.get('prStatusCode')) ||
            headerLoading,
        },
        child: intl.get('hzero.common.button.delete').d('删除'),
      },
      {
        name: 'aiCheck',
        btnProps: {
          icon: 'offline_bolt-o',
          type: 'c7n-pro',
          funcType: 'flat',
          onClick: handleAiCheckSubmit,
          hidden:
            !prHeaderId || headerDs.current?.get('aiCheckResultDTO')?.approveResult === 'APPROVING',
        },
        child: intl.get('sprm.common.view.button.aiCheck').d('智能预审'),
      },
    ];
    if (prHeaderId) {
      headerButtons.push({
        name: 'operating',
        btnType: 'c7n-pro',
        child: intl.get(`hzero.common.button.operating`).d('操作记录'),
        btnProps: {
          type: 'c7n-pro',
          icon: 'assignment',
          funcType: 'flat',
          onClick: handleActHistory,
        },
      });
    }
    if (prSourcePlatform !== 'SRM') {
      headerButtons.push({
        name: 'cancel',
        btnComp: Button,
        btnProps: {
          icon: 'cancel',
          type: 'c7n-pro',
          funcType: 'flat',
          onClick: handleCancel,
          wait: THROTTLE_TIME,
          loading: headerDs.status !== 'ready' || listDs.status !== 'ready' || headerLoading,
          disabled:
            !current ||
            [
              'SUBMIT_SYN',
              'CANCELLED',
              'CLOSED',
              'WORKFLOW_APPROVAL',
              'EXOSYS_APPROVAL',
              'SUBMITTED',
              'APPROVED',
            ].includes(current?.get('prStatusCode')) ||
            current?.get('transactionMode') === 'TRIPARTITE' ||
            headerLoading,
        },
        child: intl.get(`sprm.purchasePlatform.view.button.cancel`).d('取消'),
      });
    }
    if (isFunction(createHeaderBtnFc)) {
      const cuxBtns = createHeaderBtnFc({
        headerDs,
        history,
        location,
        prSourcePlatform,
        listDs,
        current,
        headerLoading,
        handleCancel,
      });
      headerButtons.push(...(cuxBtns || []));
    }
    return (
      <>
        {customizeBtnGroup(
          {
            code: 'SPRM.PURCHASE_PLAFORM_CREATE.BTNS',
            pro: true,
          },
          <DynamicButtons
            buttons={headerButtons}
            maxNum={5}
            defaultBtnType="c7n-pro"
            permissions={[
              {
                code: 'hzero.srm.requirement.prm.pr-platform.ps.create-save',
                name: 'save',
              },
              {
                code: 'hzero.srm.requirement.prm.pr-platform.ps.create-submit',
                name: 'submit',
              },
              {
                code: 'hzero.srm.requirement.prm.pr-platform.ps.create-delete',
                name: 'delete',
              },
              {
                code: 'hzero.srm.requirement.prm.pr-platform.ps.create-cancel',
                name: 'cancel',
              },
            ]}
          />
        )}
      </>
    );
  };

  useEffect(() => {
    if (headerDs) {
      headerDs.setState({
        handleSubmit,
        handleGetInfo,
      });
    }
  }, [headerDs, handleSubmit]);

  const returnBackPath = () => {
    const params = queryString.parse(location.search.substr(1)) || {};
    const { copyPrHeaderId } = params;
    if (backCuxHeader?.backCuxPath) {
      return backCuxHeader?.backCuxPath;
    } else if (!backPath) {
      return '/sprm/purchase-platform/list';
    } else if (prSourcePlatform !== 'ERP') {
      return `/sprm/purchase-platform/noerp-detail/${copyPrHeaderId || prHeaderId}`;
    } else {
      return `/sprm/purchase-platform/erp-detail/${prHeaderId}`;
    }
  };

  return (
    <Header
      backPath={returnBackPath()}
      title={
        prHeaderId
          ? intl.get(`sprm.common.view.title.purchaseMaintain`).d('编辑申请')
          : intl.get(`sprm.purchaseReqCreation.view.title.purchaseCreate`).d('新建申请')
      }
    >
      {headerBtn()}
    </Header>
  );
});

const Detail = function Detail() {
  const { prSourcePlatform, headerDs, listDs, customizeCollapse } = useContext(Store);

  return (
    <>
      <HeaderButtons />
      <Spin spinning={headerDs.status !== 'ready' || listDs.status !== 'ready'}>
        <Anchor prSourcePlatform={prSourcePlatform} />
        <div className={styles.sprm_fixed_header}>
          <AiCheckAlert record={headerDs?.current} />
          <Content
            className={classnames(styles['sprm-new-detail-content'], 'sprm-detail')}
            style={{ overflowY: 'auto' }}
          >
            {customizeCollapse(
              {
                code: 'SPRM.PURCHASE_PLAFORM_CREATE.BASEINFO_SECTION',
              },

              <Collapse
                ghost
                expandIconPosition="text-right"
                defaultActiveKey={defaultActiveKey}
                // expandIcon={expandIconRender}
                trigger="text-icon"
              >
                <Panel
                  key="baseInfo"
                  id="sprm-workSpace-detail-content-basicInfo"
                  header={intl.get('sprm.common.title.baseInfo').d('申请基础信息')}
                >
                  <BaseInfo />
                </Panel>
                {prSourcePlatform !== 'ERP' && (
                  <Panel
                    key="purchaseOrgInfo"
                    id="sprm-workSpace-detail-content-organizationInfo"
                    header={intl.get('sprm.common.title.purchaseOrgInfo').d('采购方及采买组织信息')}
                  >
                    <PurchaseOrgInfo />
                  </Panel>
                )}
                {prSourcePlatform === 'E-COMMERCE' && (
                  <Panel
                    key="deliveryInfo"
                    id="sprm-workSpace-detail-content-deliveryInfo"
                    header={intl.get('sprm.common.title.deliveryInfo').d('收货/收单信息')}
                  >
                    <DeliveryInfo />
                  </Panel>
                )}
                {prSourcePlatform === 'E-COMMERCE' && (
                  <Panel
                    key="billingInfo"
                    id="sprm-workSpace-detail-content-billingInfo"
                    header={intl.get('sprm.common.title.BillingInfo').d('开票信息')}
                  >
                    <BillingInfo />
                  </Panel>
                )}
                <Panel
                  key="editTable"
                  id="sprm-workSpace-detail-content-detailInfo"
                  header={intl.get('sprm.common.title.detailLineInfo').d('申请明细信息')}
                >
                  <PurchaseLineInfo />
                </Panel>
                <Panel
                  key="attachmentInfo"
                  showArrow={false}
                  disabled
                  header={intl.get('sprm.common.model.common.enterEnclosure').d('内部附件')}
                  id="sprm-workSpace-detail-content-attachmentInfo"
                >
                  <AttachmentInfo
                    code="SPRM.PURCHASE_PLAFORM_CREATE.ATTACHMENT"
                    externalCode="SPRM.PURCHASE_PLAFORM_CREATE.ATTACH_EX"
                  />
                </Panel>
              </Collapse>
            )}
          </Content>
        </div>
      </Spin>
    </>
  );
};

export default observer(Detail);

// 采购申请控制明细
import React, { useContext, useRef, useCallback, useState, useEffect } from 'react';

import intl from 'utils/intl';
import classnames from 'classnames';
import { isArray, isFunction, isEmpty } from 'lodash';
import { getResponse } from 'utils/utils';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';

import { Collapse } from 'choerodon-ui';
import { Modal, Spin } from 'choerodon-ui/pro';
import { Button } from 'components/Permission';
import { Header, Content } from 'components/Page';
import DynamicButtons from '_components/DynamicButtons';

import OperationNewRecord from '@/routes/components/OperationHistory';
import { BudgetCheckTable } from '@/routes/components/BudgetCheckTable';
import { fetchDoExecute, budgetCheck } from '@/services/purchaseRequisitionCreationService';
import {
  cancel,
  // fetchPrChangeConfigs,
  fetchPurchaseSubmit,
  sendBack,
  revokeChange,
  fetchPurchaseClose,
} from '@/services/purchaseRequisitionCancelService';
import { THROTTLE_TIME } from '@/routes/utils';
import Anchor from '../components/Anchor';
import Remark from '../components/Remark';
import BaseInfo from '../components/BaseInfo';
import BillingInfo from '../components/BillingInfo';
import DeliveryInfo from '../components/DeliveryInfo';
import AttachmentInfo from '../components/AttachmentInfo';
import PurchaseOrgInfo from '../components/PurchaseOrgInfo';
import PurchaseLineInfo from './PurchaseLineInfo';

import { Store } from '../stores';
import styles from '../index.less';

const commonPrompt = 'sprm.common.model.common';
const viewMessagePrompt = 'sprm.purchaseReqCancel.view.message';
const defaultActiveKey = [
  'baseInfo',
  'purchaseOrgInfo',
  'deliveryInfo',
  'billingInfo',
  'attachmentInfo',
  'editTable',
];
const { Panel } = Collapse;
const HeaderButtons = observer(({ erpCancelFlag }) => {
  const {
    sourceType,
    backPath,
    urlflagIf,
    history,
    listDs,
    headerDs,
    addLineDs,
    prHeaderId,
    isNewCancelTeant,
    isNewChangeTeant,
    prSourcePlatform,
    handleGetInfo,
    customizeForm,
    uomControl,
    customizeBtnGroup,
    handleBackPath,
    headerLoading,
    setHeaderLoading,
    isOldUser,
    handleBeforeSRMSubmit,
    handleCuxSubmit,
    cuxAddImportLine,
    handleCuxHeaderClose,
    handleChangeSubmit,
    handleCuxOperation,
    handleRenderCuxOperation,
    cuxBudgetCheck,
    remote,
    handleOperationModal,
    location,
  } = useContext(Store);

  const remarkRef = useRef({});
  const { current } = headerDs;
  const [statusLoading, setLoading] = useState({});
  const backCuxHeader = isFunction(handleBackPath) ? handleBackPath({ location }) : {};
  // 返回
  const returnBackPath = useCallback(() => {
    if (backCuxHeader?.backCuxPath) {
      return backCuxHeader?.backCuxPath;
    }
    switch (true) {
      case backPath === 'cancelBack' && prSourcePlatform !== 'ERP':
        return `/sprm/purchase-platform/cancel-noerp-detail/${prHeaderId}?type=normal`;
      case backPath === 'cancelBack' && prSourcePlatform === 'ERP':
        return `/sprm/purchase-platform/cancelerp-detail/${prHeaderId}?type=normal`;
      case backPath !== 'inquery':
        return '/sprm/purchase-platform/list';
      case prSourcePlatform !== 'ERP':
        return `/sprm/purchase-platform/noerp-detail/${prHeaderId}`;
      case prSourcePlatform === 'ERP':
        return `/sprm/purchase-platform/erp-detail/${prHeaderId}`;
      default:
        return '/sprm/purchase-platform/list';
    }
  }, [backPath, prHeaderId, prSourcePlatform]);

  // 提交
  const handleReSubmit = useCallback(async () => {
    setHeaderLoading(true);
    if (current?.get('cancelStatusCode') === 'CANCELLED') {
      notification.error({
        message: intl
          .get(`sprm.purchaseReqCancel.view.message.errorMessage`)
          .d('此申请已取消，请至采购申请查询界面查看申请状态。'),
      });
    } else if (
      !(listDs.dirty || addLineDs.dirty || current.get('changeDeleteLineIds')?.length > 0) &&
      handleChangeSubmit
    ) {
      notification.warning({
        message: intl
          .get(`sprm.purchaseReqCancel.view.message.forbidChange`)
          .d('当前行信息无更改,不允许提交变更'),
      });
    } else {
      const data = await handleGetInfo();
      const cuxLineAdd = isFunction(cuxAddImportLine)
        ? getResponse(await cuxAddImportLine({ prHeaderId, addLineDs }))
        : [];
      if (data) {
        const { prLineList = [] } = data;
        // 住化电子的prLineList需要拼接变更erp的变更新增行
        if (headerDs.getState('cuxAddLineFlag') === 1) {
          const cuxAddLineList = addLineDs.getState('createdLine') || [];
          prLineList.push(...cuxAddLineList);
        }
        if (current?.get('prStatusCode') !== 'REJECTED') {
          prLineList.push(...(cuxLineAdd || []));
        } else {
          prLineList.filter((e) => Number(e.changeInsertFlag) !== 1).push(...(cuxLineAdd || []));
        }
        // 行信息处理，处理多选供应商
        const prLine = prLineList.map((ele, index) => {
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
            index: !ele.prLineId ? index + 1 : undefined,
            secondaryTaxInUnitPrice: uomControl ? secondaryTaxInUnitPrice : taxIncludedUnitPrice,
            taxIncludedUnitPrice: uomControl
              ? taxIncludedUnitPrice || secondaryTaxInUnitPrice
              : taxIncludedUnitPrice,
            secondaryQuantity: uomControl ? secondaryQuantity : quantity,
            secondaryUomId: uomControl ? secondaryUomId : uomId,
            secondaryUomCode: uomControl ? secondaryUomCode : uomCode,
            supplierList: !isArray(ele.supplierList)
              ? []
              : ele.supplierList?.map((item) => ({
                  ...item,
                })),
            ...nullObject,
          };
        });
        const dataInfo = {
          ...data,
          prLineList: prLine,
        };
        // 调用提交接口
        const submit = async () => {
          // 二开：SRM的变更单子提交前执行钩子
          if (typeof handleBeforeSRMSubmit === 'function' && prSourcePlatform === 'SRM') {
            const res = await handleBeforeSRMSubmit({ dataInfo, isChange: true, location });
            if (!res) return false;
          }

          if (isFunction(handleCuxSubmit)) {
            const response = await handleCuxSubmit({
              dataInfo,
              listDs,
              headerDs,
              location,
              isChange: true,
            });
            if (!response) return false;
          }

          const res = await fetchPurchaseSubmit({
            ...dataInfo,
            customizeUnitCode: 'SPRM.PURCHASE_PLAFORM_CANCEL.CHANGE_PURCHASELINE',
          });

          if (res && !res.failed) {
            if (res?.submitResponseTipMsg) {
              notification.warning({ message: res?.submitResponseTipMsg });
            } else {
              notification.success();
            }
            if (history) {
              history.push(backCuxHeader?.backCuxPath || `/sprm/purchase-platform/list`);
            }
          } else if (res?.failed) {
            // eslint-disable-next-line no-unused-expressions
            listDs?.updated?.forEach((i) => i?.set({ dirtyFlag: null }));
            notification.error({ message: res.message });
          }
        };

        const handleOperationSubmitModal = async () => {
          // 工作流审批提交前的弹窗表单
          const result = await handleOperationModal({
            code: 'SPRM.PURCHASE_PLAFORM_CANCEL.OPERATION_SUBMIT_FORM',
            operationType: 'CHANGE_SUBMIT',
            body: {
              ...data,
              prLineList: [],
            },
            dataInfo,
            handleOk: (customWorkFlowParam) => {
              dataInfo.customWorkFlowParam = customWorkFlowParam;
            },
            handleCancel: () => {
              setHeaderLoading(false);
            },
          });
          return result;
        };

        if (prSourcePlatform === 'SRM') {
          const checkMsg = await budgetCheck([
            {
              ...dataInfo,
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
                ?.map(
                  (e) =>
                    `${e.displayPrNum}|${e.lineNum ||
                      intl
                        .get('sprm.common.modal.addLine.line', { index: e.index })
                        .d(`新增行${e.index}`)}`
                )
                .join(', ');
              notification.error({
                message:
                  intl.get(`${commonPrompt}.prNum`).d('采购申请编号') +
                  prListStr +
                  failedList[0].errorMessage,
              });
              setHeaderLoading(false);
              return;
            } else if (!isEmpty(checkList)) {
              // 余额已超过预警线 或者  余额不足，未超过预算允差范围
              Modal.open({
                key: Modal.key(),
                style: { width: '742px' },
                drawer: true,
                closable: true,
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
        if (!result) {
          setHeaderLoading(false);
          return false;
        }
        await submit();
      }
    }
    setHeaderLoading(false);
  }, [headerDs, listDs, handleGetInfo, prSourcePlatform]);

  // 变更
  const handleChange = () => {
    if (history) {
      if (prSourcePlatform === 'SRM') {
        history.push({
          pathname: `/sprm/purchase-platform/cancel-noerp-detail/${prHeaderId}`,
          search: 'flag=update&back=cancelBack',
        });
      } else {
        history.push({
          pathname: `/sprm/purchase-platform/cancel-erp-detail/${prHeaderId}`,
          search: 'flag=update&back=cancelBack',
        });
      }
    }
  };

  // 退回
  const handleSendBack = () => {
    return Modal.open({
      key: Modal.key(),
      title: intl.get(`sprm.purchaseRequisitionCancel.view.message.sendBackReason`).d('退回原因'),
      children: (
        <Remark
          prHeaderId={prHeaderId}
          ref={remarkRef}
          required
          remarkLabel={intl
            .get(`sprm.purchaseRequisitionCancel.view.message.sendBackReason`)
            .d('退回原因')}
        />
      ),
      drawer: true,
      closable: true,
      movable: false,
      destroyOnClose: true,
      onCancel: () => {},
      onOk: async () => {
        setHeaderLoading(true);
        const remarkCurrent = remarkRef.current.saveCurrentData();
        const [{ cancelledRemark }] = remarkCurrent.toData();
        const validateFlag = await remarkCurrent.validate();
        if (validateFlag) {
          setLoading({ sendBackLoading: true });
          sendBack({ ...current?.toData(), extendRemark: cancelledRemark })
            .then((res) => {
              setHeaderLoading(false);
              if (res && !res.failed) {
                notification.success();
                if (history) {
                  history.push(backCuxHeader?.backCuxPath || `/sprm/purchase-platform/list`);
                }
              } else if (res && res.failed) {
                notification.error({ message: res.message });
              }
            })
            .finally(() => {
              setLoading({ sendBackLoading: false });
            });
        } else {
          setHeaderLoading(false);
        }
      },
      footer: (okBtn, cancelBtn) => (
        <div>
          {okBtn}
          {cancelBtn}
        </div>
      ),
      style: { width: 380 },
    });
  };

  // 头取消功能
  const handleHeaderCancel = () => {
    const { handleCancelProps } = remote?.props?.process || {};
    if (current?.get('cancelStatusCode') === 'CANCELLED') {
      notification.error({
        message: intl
          .get(`sprm.purchaseReqCancel.view.message.errorMessage`)
          .d('此申请已取消，请至采购申请查询界面查看申请状态。'),
      });
    } else {
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
          const remarkCurrent = remarkRef.current.saveCurrentData();
          const [{ cancelledRemark, ...other }] = remarkCurrent.toData();
          const validateFlag = await remarkCurrent.validate();
          if (validateFlag) {
            setLoading({ cancelLoading: true });

            // 工作流审批提交前的弹窗表单
            const result = await handleOperationModal({
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
                setLoading({ cancelLoading: false });
                setHeaderLoading(false);
              },
            });
            if (!result) return false;

            const cuxCancelProps = isFunction(handleCancelProps)
              ? handleCancelProps({ headCurrent: current, ...other })
              : {};
            cancel([{ ...current?.toData(), cancelledRemark, ...other, ...cuxCancelProps }])
              .then((res) => {
                setHeaderLoading(false);
                if (res && !res.failed) {
                  notification.success();
                  if (history) {
                    history.push(backCuxHeader?.backCuxPath || `/sprm/purchase-platform/list`);
                  }
                } else if (res && res.failed) {
                  notification.error({ message: res.message });
                }
              })
              .finally(() => {
                setLoading({ cancelLoading: false });
              });
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
        style: { width: '380px' },
      });
    }
  };

  // 头关闭功能
  const handleHeaderClose = () => {
    const { prStatusCode } = current?.get(['prStatusCode']);
    const ifCanClose = ['SUSPEND', 'ASSIGNED', 'APPROVED'].includes(prStatusCode);
    if (ifCanClose) {
      const headerCloseFunc = () => {
        Modal.open({
          key: Modal.key(),
          title: intl.get(`sprm.purchaseRequisitionCancel.view.message.closeReason`).d('关闭原因'),
          children: (
            <Remark
              isOldUser={isOldUser}
              prHeaderId={prHeaderId}
              ref={remarkRef}
              required
              params={{ prHeaderId }}
              btnType="closedRemark"
              customizeForm={customizeForm}
              cusCode="SPRM.PURCHASE_PLAFORM.CLOSEMODAL"
              remarkLabel={intl
                .get(`sprm.purchaseRequisitionCancel.view.message.closeReason`)
                .d('关闭原因')}
            />
          ),
          drawer: true,
          closable: true,
          onOk: async () => {
            const remarkCurrent = remarkRef.current.saveCurrentData();
            const [{ cancelledRemark, ...other }] = remarkCurrent.toData();
            const validateFlag = await remarkCurrent.validate();
            if (validateFlag) {
              setLoading({ closeLoading: true });

              // 工作流审批提交前的弹窗表单
              const result = await handleOperationModal({
                code: 'SPRM.PURCHASE_PLAFORM_CANCEL.OPERATION_CLOSE_FORM',
                operationType: 'CLOSE',
                body: {
                  prHeaderId,
                  prLineList: [],
                },
                handleOk: (customWorkFlowParam) => {
                  other.customWorkFlowParam = customWorkFlowParam;
                },
                handleCancel: () => {
                  setLoading({ closeLoading: false });
                  setHeaderLoading(false);
                },
              });
              if (!result) return false;

              fetchPurchaseClose({
                ...current?.toData(),
                closedRemark: cancelledRemark,
                ...other,
              })
                .then((res) => {
                  if (res && !res.failed) {
                    notification.success();
                    if (history) {
                      history.push(backCuxHeader?.backCuxPath || `/sprm/purchase-platform/list`);
                    }
                  } else if (res && res.failed) {
                    notification.error({ message: res.message });
                  }
                })
                .finally(() => {
                  setLoading({ closeLoading: false });
                });
            } else {
              return false;
            }
          },
          movable: false,
          destroyOnClose: true,
          onCancel: () => {
            setHeaderLoading(false);
          },
          style: { width: '742px' },
        });
      };
      if (isFunction(handleCuxHeaderClose)) {
        handleCuxHeaderClose(current, headerCloseFunc);
      } else {
        headerCloseFunc();
      }
    } else {
      notification.warning({
        message: intl
          .get(`${viewMessagePrompt}.confirmCloseWarning`)
          .d('只有已审批、已分配、暂挂状态的采购申请允许关闭'),
      });
    }
  };

  //  头撤销变更功能
  const handleHeaderRevoke = async () => {
    const res = await revokeChange({ ...current?.toData() });

    const result = getResponse(res);
    if (result) {
      notification.success();
      if (history) {
        history.push(backCuxHeader?.backCuxPath || `/sprm/purchase-platform/list`);
      }
    }
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

  const headerBtn = () => {
    const {
      prStatusCode,
      changedFlag,
      shopExecuteFlag,
      closeStatusCode,
      cancelStatusCode,
      prHeaderCancelledFlag,
      prHeaderClosedFlag,
      prHeaderChangedFlag,
    } =
      current?.get([
        'prStatusCode',
        'changedFlag',
        'shopExecuteFlag',
        'closeStatusCode',
        'cancelStatusCode',
        'prHeaderCancelledFlag',
        'prHeaderClosedFlag',
        'prHeaderChangedFlag',
      ]) || {};

    const headerButtons = [];

    // 提交按钮---变更中,且已审批||变更审批拒绝的单子才可以变更提交
    if (
      urlflagIf &&
      (prStatusCode === 'APPROVED' || (prStatusCode === 'REJECTED' && changedFlag === 1))
    ) {
      headerButtons.push({
        name: 'submit',
        btnComp: Button,
        btnProps: {
          icon: 'done',
          type: 'c7n-pro',
          color: 'primary',
          funcType: 'raised',
          onClick: handleReSubmit,
          wait: THROTTLE_TIME,
          loading: headerDs.status !== 'ready' || listDs.status !== 'ready' || headerLoading,
        },
        child: intl.get(`hzero.common.button.submit`).d('提交'),
      });
    }

    // 取消按钮---- 从单号进来/点取消按钮进来的单据, 未变更且未配置了老租户取消逻辑配置,头取消标识存在的数据
    if (
      ['cancel', 'normal'].includes(sourceType) &&
      !urlflagIf &&
      changedFlag !== 1 &&
      current?.get('cancelStatusCode') !== 'CANCELLEDING' &&
      !(isNewCancelTeant && prHeaderCancelledFlag !== 1)
    ) {
      headerButtons.push({
        name: 'cancel',
        btnComp: Button,
        btnProps: {
          icon: 'cancel',
          type: 'c7n-pro',
          color: sourceType === 'cancel' ? 'primary' : 'default',
          funcType: sourceType === 'cancel' ? 'raised' : 'flat',
          onClick: handleHeaderCancel,
          wait: THROTTLE_TIME,
          loading:
            headerDs.status !== 'ready' ||
            listDs.status !== 'ready' ||
            headerLoading ||
            statusLoading.cancelLoading,
          disabled:
            !(cancelStatusCode === 'UNCANCELLED' && closeStatusCode === 'UNCLOSED') ||
            shopExecuteFlag === 1 ||
            (erpCancelFlag === '0' && prSourcePlatform === 'ERP') ||
            (isNewCancelTeant && prHeaderCancelledFlag !== 1) ||
            headerLoading,
        },
        child: intl.get(`sprm.purchasePlatform.view.button.cancel`).d('取消'),
      });
    }

    // 关闭按钮---- 点单号进来/点关闭按钮进来的单据, 未变更且配置了老租户取消逻辑,头关闭标识存在的数据
    if (
      isNewCancelTeant &&
      changedFlag !== 1 &&
      ['close', 'normal'].includes(sourceType) &&
      !urlflagIf &&
      prHeaderClosedFlag === 1
    ) {
      headerButtons.push({
        name: 'close',
        btnComp: Button,
        btnProps: {
          icon: 'not_interested',
          type: 'c7n-pro',
          color: sourceType === 'close' ? 'primary' : 'default',
          funcType: sourceType === 'close' ? 'raised' : 'flat',
          onClick: handleHeaderClose,
          wait: THROTTLE_TIME,
          loading:
            headerDs.status !== 'ready' ||
            listDs.status !== 'ready' ||
            headerLoading ||
            statusLoading.closeLoading,
          disabled:
            !(cancelStatusCode === 'UNCANCELLED' && closeStatusCode === 'UNCLOSED') ||
            // shopExecuteFlag === 1 ||
            (erpCancelFlag === '0' && prSourcePlatform === 'ERP') ||
            prHeaderClosedFlag !== 1,
        },
        child: intl.get(`sprm.purchasePlatform.view.button.close`).d('关闭'),
      });
    }
    // 变更----- 点单号进来的,有可变更标识的 (SRM或ERP)数据
    if (
      prHeaderChangedFlag &&
      ['SRM', 'ERP'].includes(prSourcePlatform) &&
      !urlflagIf &&
      !['close', 'cancel'].includes(sourceType) &&
      closeStatusCode !== 'CLOSEDING'
    ) {
      headerButtons.push({
        name: 'change',
        btnComp: Button,
        btnProps: {
          icon: 'mode_edit',
          type: 'c7n-pro',
          funcType: 'flat',
          wait: THROTTLE_TIME,
          loading: headerDs.status !== 'ready' || listDs.status !== 'ready' || headerLoading,
          onClick: handleChange,
        },
        child: intl.get(`sprm.common.view.button.actionChange`).d('变更'),
      });
    }
    // 退回----- 来源于SRM,未取消未关闭的已审批单据,点单号进来的
    if (
      prSourcePlatform === 'SRM' &&
      cancelStatusCode === 'UNCANCELLED' &&
      closeStatusCode === 'UNCLOSED' &&
      !urlflagIf &&
      !['cancel', 'close'].includes(sourceType) &&
      prStatusCode === 'APPROVED'
    ) {
      headerButtons.push({
        name: 'sendBack',
        btnComp: Button,
        btnProps: {
          icon: 'reply',
          type: 'c7n-pro',
          funcType: 'flat',
          onClick: handleSendBack,
          wait: THROTTLE_TIME,
          loading:
            headerDs.status !== 'ready' ||
            listDs.status !== 'ready' ||
            headerLoading ||
            statusLoading.sendBackLoading,
        },
        child: intl.get(`sprm.purchasePlatform.view.button.sendBack`).d('退回'),
      });
    }
    // 撤销变更按钮----点单号/变更进来,处于变更拒绝的单据,配置表配置了变更逻辑
    if (
      prStatusCode === 'REJECTED' &&
      (prSourcePlatform === 'SRM' || prSourcePlatform === 'ERP') &&
      !['cancel', 'close'].includes(sourceType) &&
      changedFlag === 1 &&
      isNewChangeTeant
    ) {
      headerButtons.push({
        name: 'controlRevoke',
        btnComp: Button,
        btnProps: {
          icon: 'reply',
          type: 'c7n-pro',
          funcType: 'flat',
          onClick: handleHeaderRevoke,
          wait: THROTTLE_TIME,
          loading:
            headerDs.status !== 'ready' ||
            listDs.status !== 'ready' ||
            headerLoading ||
            statusLoading.sendBackLoading,
        },
        child: intl.get(`${commonPrompt}.revoke`).d('撤销变更'),
      });
    }

    headerButtons.push({
      name: 'history',
      btnType: 'c7n-pro',
      child: intl.get(`hzero.common.button.operating`).d('操作记录'),
      btnProps: {
        funcType: 'flat',
        onClick: handleActHistory,
        icon: 'assignment',
      },
    });
    const { cancelHeaderBtnFc } = remote?.props?.process || {};
    if (isFunction(cancelHeaderBtnFc)) {
      const cuxBts = cancelHeaderBtnFc({ headerDs });
      headerButtons.push(...(cuxBts || []));
    }
    const cuxHeaderButtons =
      remote?.process?.('SPRM_PRHEADER_REMOTE_PROCESS_HEADER_BTN', headerButtons, {
        headerDs,
        listDs,
        prSourcePlatform,
        location,
      }) || headerButtons;
    return (
      <>
        {customizeBtnGroup(
          {
            code: 'SPRM.PURCHASE_PLAFORM_CANCEL.HEADER_BTN',
            pro: true,
          },
          <DynamicButtons
            buttons={cuxHeaderButtons}
            maxNum={5}
            defaultBtnType="c7n-pro"
            permissions={[
              {
                code: 'hzero.srm.requirement.prm.pr-platform.ps.control-submit',
                name: 'submit',
              },
              {
                code: `hzero.srm.requirement.prm.pr-platform.ps.control-cancel`,
                name: 'cancel',
              },
              {
                code: `hzero.srm.requirement.prm.pr-platform.ps.control-close`,
                name: 'close',
              },
              {
                code: `hzero.srm.requirement.prm.pr-platform.ps.change`,
                name: 'change',
              },
              {
                name: 'sendBack',
                code: `hzero.srm.requirement.prm.pr-platform.ps.control-return`,
              },
              {
                name: 'controlRevoke',
                code: `hzero.srm.requirement.prm.pr-platform.ps.control-revoke`,
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
        handleReSubmit,
      });
    }
  }, [headerDs, handleReSubmit]);

  useEffect(() => {
    const handleUpdateHeader = ({ dataSet }) => {
      dataSet.forEach((record) => {
        record.init({
          urlflagIf: urlflagIf ? true : null,
        });
      });
    };

    headerDs.addEventListener('load', handleUpdateHeader);

    return () => {
      headerDs.removeEventListener('load', handleUpdateHeader);
    };
  }, [headerDs, urlflagIf]);

  return (
    <Header
      backPath={returnBackPath()}
      title={
        backCuxHeader?.backCuxName ||
        intl.get(`sprm.common.view.title.cancelRequisition`).d('采购申请控制')
      }
    >
      {headerBtn()}
    </Header>
  );
});

const Detail = function Detail() {
  const { prSourcePlatform, headerDs, listDs, customizeCollapse, urlflagIf } = useContext(Store);

  const [erpCancelFlag, setErpChangeFlag] = useState('0');

  // 获取取消规则
  const fetchCancelRule = () => {
    fetchDoExecute([{ fullPathCode: 'SITE.SPUC.PR.CONTROL.CANCEL' }]).then((res) => {
      if (res && isArray(res)) {
        const erpChangeFlag = res[0];
        setErpChangeFlag(erpChangeFlag);
      }
    });
  };

  useEffect(() => {
    fetchCancelRule();
  }, []);

  return (
    <>
      <HeaderButtons erpCancelFlag={erpCancelFlag} />
      <Spin spinning={headerDs.status !== 'ready' || listDs.status !== 'ready'}>
        <Anchor prSourcePlatform={prSourcePlatform} />
        <div className={styles.sprm_fixed_header}>
          <Content
            className={classnames(styles['sprm-new-detail-content'], 'sprm-detail')}
            style={{ overflowY: 'auto' }}
          >
            {customizeCollapse(
              {
                code: 'SPRM.PURCHASE_PLAFORM_CANCEL.BASEINFO_SECTION',
              },

              <Collapse
                ghost
                expandIconPosition="text-right"
                defaultActiveKey={defaultActiveKey}
                trigger="text-icon"
              >
                <Panel
                  key="baseInfo"
                  id="sprm-workSpace-detail-content-basicInfo"
                  header={intl.get('sprm.common.title.baseInfo').d('申请基础信息')}
                >
                  <BaseInfo code="SPRM.PURCHASE_PLAFORM_CANCEL.BASE" control />
                </Panel>
                {prSourcePlatform !== 'ERP' && (
                  <Panel
                    key="purchaseOrgInfo"
                    id="sprm-workSpace-detail-content-organizationInfo"
                    header={intl.get('sprm.common.title.purchaseOrgInfo').d('采购方及采买组织信息')}
                  >
                    <PurchaseOrgInfo code="SPRM.PURCHASE_PLAFORM_CANCEL.PURCHASEORGINFO" />
                  </Panel>
                )}
                {prSourcePlatform === 'E-COMMERCE' && (
                  <Panel
                    key="deliveryInfo"
                    id="sprm-workSpace-detail-content-deliveryInfo"
                    header={intl.get('sprm.common.title.deliveryInfo').d('收货/收单信息')}
                  >
                    <DeliveryInfo code="SPRM.PURCHASE_PLAFORM_CANCEL.DELIVERYINFO" />
                  </Panel>
                )}
                {prSourcePlatform === 'E-COMMERCE' && (
                  <Panel
                    key="billingInfo"
                    id="sprm-workSpace-detail-content-billingInfo"
                    header={intl.get('sprm.common.title.BillingInfo').d('开票信息')}
                  >
                    {' '}
                    <BillingInfo code="SPRM.PURCHASE_PLAFORM_CANCEL.BILLINGINFO" />
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
                    code="SPRM.PURCHASE_PLAFORM_CANCEL.ATTACHMENT"
                    externalCode="SPRM.PURCHASE_PLAFORM_CANCEL.ATTACH_EX"
                    readOnly
                    showChangeAttach
                    changeReadOnly={!urlflagIf}
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

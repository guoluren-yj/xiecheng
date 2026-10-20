// 采购申请查询明细
import React, { useContext, useRef, useCallback, useEffect, useState } from 'react';

import intl from 'utils/intl';
import { isFunction, isArray } from 'lodash';
import classnames from 'classnames';
import querystring from 'querystring';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';

import { Collapse } from 'choerodon-ui';
import { Modal, Spin } from 'choerodon-ui/pro';
import { Button } from 'components/Permission';
import { Header, Content } from 'components/Page';
import DynamicButtons from '_components/DynamicButtons';
import PrintProButton from '_components/PrintProButton';
import { openApproveModal } from '_components/ApproveModal';
import { checkPrintWindow, getPdfPreviewUrl } from 'srm-front-boot/lib/utils/utils';

import AiCheckAlert from '@/routes/components/AiCheckAlert';
import { SRM_SPRM } from '_utils/config';
import OperationNewRecord from '@/routes/components/OperationHistory';
import {
  print,
  reImportERP,
  fetchWithdraw,
  handleSaveArrtibuteData,
} from '@/services/purchaseRequisitionInquiryService';
import {
  cancel,
  sendBack,
  revokeChange,
  fetchPurchaseClose,
} from '@/services/purchaseRequisitionCancelService';
import { confirmCopyLine } from '@/services/purchasePlatformService';
import Remark from '../components/Remark';
import Anchor from '../components/Anchor';
import BaseInfo from '../components/BaseInfo';
import BillingInfo from '../components/BillingInfo';
import DeliveryInfo from '../components/DeliveryInfo';
import AttachmentInfo from '../components/AttachmentInfo';
import PurchaseOrgInfo from '../components/PurchaseOrgInfo';
import PurchaseLineInfo from '../components/PurchaseLineInfo';
import getPermissions from '@/routes/components/Permission/getPermissions';

import { Store } from '../stores';
import styles from '../index.less';
import { THROTTLE_TIME, revokeWorkFlow } from '@/routes/utils';

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
    pubPathFlag,
    customizeForm,
    customizeBtnGroup,
    history,
    headerDs,
    listDs,
    prHeaderId,
    commonUpdate,
    backViodPageFlag,
    isNewChangeTeant,
    prSourcePlatform,
    handleBackPath,
    docLinkFlag,
    headerLoading,
    setHeaderLoading,
    isOldUser,
    isNewCancelTeant,
    handleAiCheckSubmit,
    handleCuxHeaderButtons,
    handleCuxHeaderClose,
    handleCuxOperation,
    handleRenderCuxOperation,
    remote,
    handleOperationModal,
  } = useContext(Store);

  const remarkRef = useRef({});
  const { current } = headerDs;
  const [statusLoading, setLoading] = useState({});
  const backCuxHeader = isFunction(handleBackPath) ? handleBackPath({ location }) : {};
  const [btnPermissions, setBtnPermissions] = useState({});

  useEffect(() => {
    const btnArray = [
      { code: 'hzero.srm.requirement.prm.pr-platform.ps.query-withdraw', key: 'callBack' },
    ];
    const btnShowFlag = {};
    getPermissions(btnArray?.map((ele) => ele.code)).then((res) => {
      btnArray.forEach((ele) => {
        btnShowFlag[ele.key] = res.get(ele.code);
      });
      setBtnPermissions(btnShowFlag);
    });
  }, []);

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

  // 重新同步
  const handleReImportERP = async () => {
    setHeaderLoading(true);
    const result = await reImportERP([prHeaderId]);
    if (result && !result.failed) {
      notification.success();
      commonUpdate();
    } else {
      notification.error({ message: result?.message });
    }
    setHeaderLoading(false);
  };

  // 打印
  const handlePrint = async () => {
    const printFlag = checkPrintWindow();

    const patchParams = {
      prHeaderId,
      responseType: printFlag ? 'blob' : 'json',
      headers: printFlag ? {} : { 's-print-using-preview': '1' },
    };

    const res = await print(patchParams);

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
  };

  // 撤回
  const hanleCallBack = async () => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      bodyStyle: { padding: '20px' },
      children: <p>{intl.get('sprm.common.confirm.callback').d('是否确认撤回')}</p>,
    }).then((button) => {
      setHeaderLoading(true);
      if (button === 'ok') {
        setLoading({ callBackLoading: true });
        fetchWithdraw(current.toData())
          .then((res) => {
            const result = getResponse(res);
            if (result && !result.failed) {
              notification.success();
              history.push(backCuxHeader?.backCuxPath || `/sprm/purchase-platform/list`);
            }
          })
          .finally(() => {
            setHeaderLoading(false);
            setLoading({ callBackLoading: false });
          });
      }
    });
  };

  // 跳转编辑
  const handleDetail = useCallback(() => {
    const search = {
      prHeaderId,
      newFlag: true,
      back: 'inquery',
    };
    history.push({
      pathname: '/sprm/purchase-platform/creation-detail',
      search: querystring.stringify(search),
    });
  }, [prHeaderId]);

  // 头取消功能
  const handleHeaderCancel = async () => {
    if (current.get('cancelStatusCode') === 'CANCELLED') {
      notification.error({
        message: intl
          .get(`sprm.purchaseReqCancel.view.message.errorMessage`)
          .d('此申请已取消，请至采购申请查询界面查看申请状态。'),
      });
    } else {
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
          const [{ cancelledRemark, ...other }] = remarkCurrent ? remarkCurrent.toData() : [{}];
          const validateFlag = await remarkCurrent.validate();
          if (validateFlag) {
            setLoading({ cancelLoading: true });

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
                setLoading({ cancelLoading: false });
              },
            });
            if (!resp) return false;

            const cuxCancelProps = isFunction(handleCancelProps)
              ? handleCancelProps({ headCurrent: current, ...other })
              : {};
            cancel([{ ...current?.toData(), cancelledRemark, ...other, ...cuxCancelProps }])
              .then((result) => {
                const res = getResponse(result);
                if (res && !res.failed) {
                  notification.success();
                  if (history) {
                    history.push(backCuxHeader?.backCuxPath || `/sprm/purchase-platform/list`);
                  }
                }
              })
              .finally(() => {
                setHeaderLoading(false);
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
          setLoading({ cancelLoading: false });
          setHeaderLoading(false);
        },
        style: { width: 380 },
      });
    }
  };

  // 头关闭功能
  const handleHeaderClose = async () => {
    const ifCanClose = ['SUSPEND', 'ASSIGNED', 'APPROVED'].includes(current?.get('prStatusCode'));
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
            setHeaderLoading(true);
            const remarkCurrent = remarkRef.current.saveCurrentData();
            const [{ cancelledRemark, ...other }] = remarkCurrent.toJSONData();
            const validateFlag = await remarkCurrent.validate();
            if (validateFlag) {
              // 工作流审批提交前的弹窗表单
              const resp = await handleOperationModal({
                code: 'SPRM.PURCHASE_PLAFORM_CANCEL.OPERATION_CLOSE_FORM',
                operationType: 'CLOSE',
                body: {
                  prHeaderId,
                  prLineList: [],
                },
                handleOk: (data) => {
                  other.customWorkFlowParam = data;
                },
                handleCancel: () => {
                  setHeaderLoading(false);
                  setLoading({ cancelLoading: false });
                },
              });
              if (!resp) return false;

              setLoading({ closeLoading: true });
              fetchPurchaseClose({
                ...current.toData(),
                closedRemark: cancelledRemark,
                ...other,
              })
                .then((result) => {
                  const res = getResponse(result);
                  if (res && !res.failed) {
                    notification.success();
                    if (history) {
                      history.push(backCuxHeader?.backCuxPath || `/sprm/purchase-platform/list`);
                    }
                  }
                })
                .finally(() => {
                  setHeaderLoading(false);
                  setLoading({ closeLoading: false });
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
          style: { width: 742 },
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
          .get(`sprm.purchaseReqCancel.view.message.confirmCloseWarning`)
          .d('只有已审批、已分配、暂挂状态的采购申请允许关闭'),
      });
    }
  };

  // 变更页面跳转
  const handleChange = () => {
    if (history) {
      if (prSourcePlatform === 'SRM') {
        history.push({
          pathname: `/sprm/purchase-platform/cancel-noerp-detail/${prHeaderId}`,
          search: 'flag=update&back=inquery',
        });
      } else {
        history.push({
          pathname: `/sprm/purchase-platform/cancel-erp-detail/${prHeaderId}`,
          search: 'flag=update&back=inquery',
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
      onOk: () => {
        setHeaderLoading(true);
        const remarkCurrent = remarkRef.current.saveCurrentData();
        const [{ cancelledRemark }] = remarkCurrent.toData();
        setLoading({ sendBackLoading: true });
        sendBack({ ...current.toData(), extendRemark: cancelledRemark })
          .then((result) => {
            const res = getResponse(result);
            if (res && !res.failed) {
              history.push(backCuxHeader?.backCuxPath || `/sprm/purchase-platform/list`);
            }
          })
          .finally(() => {
            setHeaderLoading(false);
            setLoading({ sendBackLoading: false });
          });
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

  //  头撤销变更功能
  const handleHeaderRevoke = async () => {
    setHeaderLoading(true);
    const res = await revokeChange({ ...current.toData() });
    const result = getResponse(res);
    if (result) {
      notification.success();
      history.push(backCuxHeader?.backCuxPath || `/sprm/purchase-platform/list`);
    }
    setHeaderLoading(false);
  };

  const handleCopy = async () => {
    const [dateSelectd] = headerDs.toData();
    setHeaderLoading(true);
    if (remote) {
      const copyFlag = await remote.event.fireEvent('SPRM_PURCHASE_PLAFORM_DETAIL_PROCESS_COPY', {
        setHeaderLoading,
        headerDs,
      });
      if (!copyFlag) return;
    }
    confirmCopyLine(dateSelectd)
      .then((res) => {
        const data = getResponse(res);
        if (data) {
          notification.success();
          const { prHeaderId: prHeaderNewId } = res;
          const search = {
            prHeaderId: prHeaderNewId,
            copyPrHeaderId: dateSelectd?.prHeaderId,
            back: 'inquery',
          };
          if (history) {
            if (backCuxHeader && backCuxHeader?.currentPath) {
              setHeaderLoading(false);
              history.push({
                pathname: backCuxHeader.currentPath,
                search: querystring.stringify(search),
              });
            } else {
              setHeaderLoading(false);
              history.push({
                pathname: '/sprm/purchase-platform/creation-detail',
                search: querystring.stringify(search),
              });
            }
          } else {
            setHeaderLoading(false);
          }
        }
      })
      .finally(() => {
        setHeaderLoading(false);
      });
  };

  const handleRevoke = async () => {
    const res = await revokeWorkFlow(current.get('workflowBusinessKey'));
    if (res) {
      if (history) {
        history.push(backCuxHeader?.backCuxPath || `/sprm/purchase-platform/list`);
      }
    }
  };

  const handleWorkFlowApprove = async () => {
    const approvaFlags = headerDs.getState('approvaFlags');
    const workflowBusinessKey = headerDs.current.get('workflowBusinessKey');
    const approvaFlag = approvaFlags?.[workflowBusinessKey];
    const { taskId, processInstanceId } = approvaFlag || {};
    openApproveModal({
      modalProps: {
        closable: true,
      },
      taskId,
      processInstanceId,
      onSuccess: () => {
        if (history) {
          history.push(backCuxHeader?.backCuxPath || `/sprm/purchase-platform/list`);
        }
      },
    });
  };

  const headerBtn = () => {
    const workflowBusinessKey = headerDs?.current?.get('workflowBusinessKey');
    const approvaFlags = headerDs?.getState('approvaFlags');
    const operationFlags = headerDs?.getState('operationFlags');
    const workflowApprovalFlag =
      workflowBusinessKey && approvaFlags ? approvaFlags[workflowBusinessKey] : false;
    const workflowRevokeFlag =
      workflowBusinessKey && operationFlags ? operationFlags[workflowBusinessKey]?.REVOKE : false;
    const headerButtons = [
      // 操作记录
      {
        name: 'operation',
        btnType: 'c7n-pro',
        btnComp: Button,
        child: intl.get('hzero.common.button.operationRecords').d('操作记录'),
        btnProps: {
          type: 'c7n-pro',
          funcType: 'flat',
          icon: 'assignment',
          wait: THROTTLE_TIME,
          onClick: handleActHistory,
        },
      },

      // 打印
      {
        name: 'print',
        btnComp: Button,
        btnProps: {
          icon: 'print',
          type: 'c7n-pro',
          funcType: 'flat',
          wait: THROTTLE_TIME,
          onClick: handlePrint,
          hidden: docLinkFlag && Number(docLinkFlag) === 1,
          // permissionList: [
          //   {
          //     code: `hzero.srm.requirement.prm.pr-platform.ps.query-print`,
          //     type: 'button',
          //   },
          // ],
        },
        child: intl.get(`hzero.common.button.print`).d('打印'),
      },
      {
        name: 'printNew',
        type: 'c7n-pro',
        btnComp: PrintProButton,
        child: intl.get(`hzero.common.button.print`).d('打印'),
        btnProps: {
          buttonProps: {
            funcType: 'flat',
            // permissionList: [
            //   {
            //     code: 'hzero.srm.requirement.prm.pr-platform.button.new-print',
            //     type: 'button',
            //   },
            // ],
            hidden: docLinkFlag && Number(docLinkFlag) === 1,
          },
          wait: THROTTLE_TIME,
          requestUrl: `${SRM_SPRM}/v1/${getCurrentOrganizationId()}/purchase-requests/${prHeaderId}/print-token`,
          method: 'GET',
          buttonText: intl.get('hzero.common.button.print.new').d('打印-新'),
        },
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
    const pubHeaderBtns = [...headerButtons];
    // 撤销变更按钮 OR 编辑按钮
    if (
      current?.get('prStatusCode') === 'REJECTED' &&
      current?.get('changedFlag') === 1 &&
      isNewChangeTeant &&
      !backViodPageFlag &&
      Number(docLinkFlag) !== 1
    ) {
      headerButtons.push({
        name: 'revoke',
        btnComp: Button,
        btnProps: {
          icon: 'reply',
          type: 'c7n-pro',
          funcType: 'flat',
          wait: THROTTLE_TIME,
          loading: headerLoading,
          onClick: handleHeaderRevoke,
          // permissionList: [
          //   {
          //     code: `hzero.srm.requirement.prm.pr-platform.ps.control-revoke`,
          //     type: 'button',
          //     meaning: '撤销变更按钮权限',
          //   },
          // ],
        },
        child: intl.get(`sprm.common.model.common.revoke`).d('撤销变更'),
      });
    }
    if (prSourcePlatform === 'SRM') {
      // 复制按钮
      headerButtons.push({
        name: 'copy',
        btnComp: Button,
        btnProps: {
          icon: 'baseline-file_copy',
          type: 'c7n-pro',
          funcType: 'flat',
          wait: THROTTLE_TIME,
          onClick: handleCopy,
          loading: headerLoading,
          // permissionList: [
          //   {
          //     code: `hzero.srm.requirement.prm.pr-platform.ps.copy`,
          //     type: 'button',
          //     meaning: '复制按钮权限',
          //   },
          // ],
        },
        child: intl.get('hzero.common.button.copy').d('复制'),
      });
    }
    if (current?.get('workflowBusinessKey') && workflowRevokeFlag) {
      // 撤销审批按钮
      headerButtons.push({
        name: 'revokeWorkflow',
        btnComp: Button,
        btnProps: {
          icon: 'reply',
          type: 'c7n-pro',
          funcType: 'flat',
          wait: THROTTLE_TIME,
          onClick: handleRevoke,
          loading: headerLoading,
        },
        hidden:
          current?.get('prStatusCode') === 'WORKFLOW_APPROVAL' &&
          pubPathFlag &&
          !backViodPageFlag &&
          Number(docLinkFlag) !== 1 &&
          btnPermissions?.callBack,
        child: intl.get(`hzero.common.button.revokeApproval`).d('撤销审批'),
      });
    }
    if (current?.get('workflowBusinessKey') && workflowApprovalFlag) {
      // 工作流审批按钮
      headerButtons.push({
        name: 'approveWorkflow',
        btnComp: Button,
        btnProps: {
          icon: 'authorize',
          type: 'c7n-pro',
          funcType: 'flat',
          wait: THROTTLE_TIME,
          onClick: handleWorkFlowApprove,
          loading: headerLoading,
        },
        child: intl.get('hzero.common.button.approval').d('审批'),
      });
    }

    // 重新同步按钮
    if (
      !['PENDING', 'SEND_BACK', 'REJECTED'].includes(current?.get('prStatusCode')) &&
      !backViodPageFlag &&
      Number(docLinkFlag) !== 1
    ) {
      headerButtons.push({
        name: 'resync',
        btnComp: Button,
        child: intl.get(`sprm.purchaseRequisitionInquiry.view.button.resync`).d('重新同步'),
        btnProps: {
          type: 'c7n-pro',
          icon: 'sync',
          funcType: 'flat',
          wait: THROTTLE_TIME,
          loading: headerLoading,
          onClick: handleReImportERP,
          disabled: current?.get('syncStatus') !== 'SYNC_FAILURE',
        },
      });
    } else if (
      current?.get('changedFlag') === 0 &&
      prSourcePlatform !== 'ERP' &&
      current?.get('cancelStatusCode') === 'UNCANCELLED' &&
      !backViodPageFlag &&
      Number(docLinkFlag) !== 1
    ) {
      // 编辑按钮
      headerButtons.push({
        name: 'edit',
        btnComp: Button,
        btnProps: {
          icon: 'mode_edit',
          type: 'c7n-pro',
          funcType: 'flat',
          wait: THROTTLE_TIME,
          onClick: handleDetail,
          // permissionList: [
          //   {
          //     code: `hzero.srm.requirement.prm.pr-platform.ps.create-save`,
          //     type: 'button',
          //   },
          // ],
        },
        child: intl.get('hzero.common.button.edit').d('编辑'),
      });
    }

    // 取消按钮
    if (
      (!isNewCancelTeant || current?.get('prHeaderCancelledFlag') === 1) &&
      !backViodPageFlag &&
      !['SUBMITTED', 'WORKFLOW_APPROVAL'].includes(current?.get('prStatusCode')) &&
      current?.get('cancelStatusCode') !== 'CANCELLEDING' &&
      Number(docLinkFlag) !== 1
    ) {
      headerButtons.push({
        name: 'cancel',
        btnComp: Button,
        btnProps: {
          icon: 'cancel',
          type: 'c7n-pro',
          funcType: 'flat',
          wait: THROTTLE_TIME,
          onClick: handleHeaderCancel,
          loading: statusLoading.cancelLoading || headerLoading,
          disabled: !(
            current?.get('cancelStatusCode') === 'UNCANCELLED' &&
            current?.get('closeStatusCode') === 'UNCLOSED'
          ),
          // permissionList: [
          //   {
          //     code: `hzero.srm.requirement.prm.pr-platform.ps.control-cancel`,
          //     type: 'button',
          //     meaning: '取消按钮权限',
          //   },
          // ],
        },
        child: intl.get(`sprm.purchasePlatform.view.button.cancel`).d('取消'),
      });
    }

    // 关闭按钮
    if (
      current?.get('prHeaderClosedFlag') === 1 &&
      !backViodPageFlag &&
      Number(docLinkFlag) !== 1
    ) {
      headerButtons.push({
        name: 'close',
        btnType: 'c7n-pro',
        btnComp: Button,
        btnProps: {
          icon: 'not_interested',
          type: 'c7n-pro',
          funcType: 'flat',
          wait: THROTTLE_TIME,
          onClick: handleHeaderClose,
          loading: statusLoading.closeLoading || headerLoading,
          disabled: !(
            current?.get('cancelStatusCode') === 'UNCANCELLED' &&
            current?.get('closeStatusCode') === 'UNCLOSED'
          ),
          // permissionList: [
          //   {
          //     code: `hzero.srm.requirement.prm.pr-platform.ps.control-close`,
          //     type: 'button',
          //     meaning: '关闭按钮权限',
          //   },
          // ],
        },
        child: intl.get(`sprm.purchasePlatform.view.button.close`).d('关闭'),
      });
    }

    // 撤回按钮
    if (
      current?.get('prStatusCode') === 'WORKFLOW_APPROVAL' &&
      pubPathFlag &&
      !backViodPageFlag &&
      Number(docLinkFlag) !== 1
    ) {
      headerButtons.push({
        name: 'callBack',
        btnComp: Button,
        btnProps: {
          icon: 'reply',
          type: 'c7n-pro',
          funcType: 'flat',
          wait: THROTTLE_TIME,
          onClick: hanleCallBack,
          loading: statusLoading.callBackLoading || headerLoading,
          // permissionList: [
          //   {
          //     code: `hzero.srm.requirement.prm.pr-platform.ps.query-withdraw`,
          //     type: 'button',
          //   },
          // ],
        },
        child: intl.get(`sprm.purchasePlatform.view.button.callBack`).d('撤回'),
      });
    }

    // 变更按钮
    if (
      !backViodPageFlag &&
      current?.get('closeStatusCode') !== 'CLOSEDING' &&
      Number(docLinkFlag) !== 1 &&
      current?.get('prHeaderChangedFlag') &&
      ['SRM', 'ERP'].includes(prSourcePlatform) &&
      (current?.get('prStatusCode') === 'APPROVED' ||
        (current?.get('prStatusCode') === 'REJECTED' && current?.get('changedFlag') === 1))
    ) {
      headerButtons.push({
        name: 'change',
        btnComp: Button,
        btnProps: {
          icon: 'mode_edit',
          type: 'c7n-pro',
          funcType: 'flat',
          wait: THROTTLE_TIME,
          onClick: handleChange,
          // permissionList: [
          //   {
          //     code: `hzero.srm.requirement.prm.pr-platform.ps.change`,
          //     type: 'button',
          //     meaning: '变更按钮权限',
          //   },
          // ],
        },
        child: intl.get(`sprm.purchasePlatform.view.button.actionChange`).d('变更'),
      });
    }

    // 退回按钮
    if (
      !backViodPageFlag &&
      Number(docLinkFlag) !== 1 &&
      prSourcePlatform === 'SRM' &&
      current?.get('prStatusCode') === 'APPROVED' &&
      current?.get('cancelStatusCode') === 'UNCANCELLED' &&
      current?.get('closeStatusCode') === 'UNCLOSED'
    ) {
      headerButtons.push({
        name: 'sendBack',
        btnType: 'c7n-pro',
        btnComp: Button,
        btnProps: {
          icon: 'reply',
          type: 'c7n-pro',
          funcType: 'flat',
          onClick: handleSendBack,
          wait: THROTTLE_TIME,
          loading: statusLoading.sendBackLoading || headerLoading,
          // permissionList: [
          //   {
          //     code: `hzero.srm.requirement.prm.pr-platform.ps.control-return`,
          //     type: 'button',
          //     meaning: '退回按钮权限',
          //   },
          // ],
        },
        child: intl.get(`sprm.purchasePlatform.view.button.sendBack`).d('退回'),
      });
    }

    if (isFunction(handleCuxHeaderButtons)) {
      const cuxBtn = handleCuxHeaderButtons({ setHeaderLoading, headerDs, headerLoading, history });
      const cuxBtns = isArray(cuxBtn) ? cuxBtn : [cuxBtn];
      const onlyPubBtns = cuxBtns?.filter((btns) => btns?.workShowFlag === 1);
      const onlyReadBtns = cuxBtns?.filter((btns) => !btns?.workShowFlag);

      if (onlyPubBtns?.length > 0) {
        pubHeaderBtns.push(...onlyPubBtns);
      }
      headerButtons.push(...onlyReadBtns);
    }
    const buttons = pubPathFlag ? headerButtons : pubHeaderBtns;
    const cuxBtns = remote.process('SPRM_PURCHASE_PLAFORM_BUTTONS_PROCESS', buttons, {
      headerDs,
      listDs,
      pubPathFlag,
    });

    return (
      <>
        {customizeBtnGroup(
          {
            code: 'SPRM.PURCHASE_PLAFORM_QUERY.BTNS',
            pro: true,
          },
          <DynamicButtons
            buttons={cuxBtns}
            maxNum={5}
            defaultBtnType="c7n-pro"
            permissions={[
              {
                code: `hzero.srm.requirement.prm.pr-platform.ps.query-print`,
                name: 'print',
              },
              {
                name: 'printNew',
                code: 'hzero.srm.requirement.prm.pr-platform.button.new-print',
              },
              {
                name: 'revoke',
                code: `hzero.srm.requirement.prm.pr-platform.ps.control-revoke`,
              },
              {
                name: 'copy',
                code: `hzero.srm.requirement.prm.pr-platform.ps.copy`,
              },
              {
                name: 'edit',
                code: `hzero.srm.requirement.prm.pr-platform.ps.create-save`,
              },
              {
                name: 'cancel',
                code: `hzero.srm.requirement.prm.pr-platform.ps.control-cancel`,
              },
              {
                name: 'close',
                code: `hzero.srm.requirement.prm.pr-platform.ps.control-close`,
              },
              {
                name: 'callBack',
                code: `hzero.srm.requirement.prm.pr-platform.ps.query-withdraw`,
              },
              {
                name: 'change',
                code: `hzero.srm.requirement.prm.pr-platform.ps.change`,
              },
              {
                name: 'sendBack',
                code: `hzero.srm.requirement.prm.pr-platform.ps.control-return`,
              },
            ]}
          />
        )}
      </>
    );
  };

  const returnBackPath = () => {
    if (docLinkFlag && Number(docLinkFlag) === 1) {
      return null;
    } else if (backCuxHeader?.backCuxPath) {
      return backCuxHeader?.backCuxPath;
    } else if (!pubPathFlag) {
      return null;
    } else if (!backViodPageFlag) {
      return '/sprm/purchase-platform/list';
    } else {
      return null;
    }
  };

  return (
    // pubPathFlag && (
    <Header
      backPath={returnBackPath()}
      title={
        backCuxHeader?.backCuxName ||
        intl.get(`sprm.common.view.title.purchaseInquirynew`).d('查看申请')
      }
    >
      {headerBtn()}
    </Header>
    // )
  );
});

const Detail = function Detail({ onLoad, onFormLoaded }) {
  const {
    id,
    prSourcePlatform,
    headerUnitCode,
    listUnitCode,
    headerDs,
    listDs,
    customizeCollapse,
    pubPathFlag,
    handleGetInfo,
    handleWorkFlowCheck,
    remote,
    location,
    uomControl,
    code: workflowFormCode,
    prHeaderId,
  } = useContext(Store);

  const handleSubmit = (result) => {
    return new Promise(async (resolve, reject) => {
      if (
        ['SPUC_SRM_SUBMIT_DOC:EDIT_DOM', 'SPUC_CATALOG_SUBMIT_DOC:EDIT_DOM'].includes(
          workflowFormCode
        ) &&
        result === 'Approved'
      ) {
        // eslint-disable-next-line no-param-reassign
        headerDs.current.status = 'update';
        const data = await handleGetInfo();
        if (data) {
          const dataInfo = {
            ...data,
            customizeUnitCode: `${headerUnitCode},${listUnitCode}`,
          };
          const res = getResponse(await handleSaveArrtibuteData(dataInfo));
          if (res) {
            resolve(res);
          } else {
            reject();
          }
        } else {
          reject();
        }
      } else {
        resolve(result);
      }
    });
  };

  const handleCuxSubmit = (result) => {
    return new Promise(async (resolve, reject) => {
      const approveFlag = await handleWorkFlowCheck({
        id,
        handleGetInfo,
        result,
        listDs,
        headerDs,
        location,
        uomControl,
        workflowFormCode,
        customizeUnitCode: `${headerUnitCode},${listUnitCode}`,
        handleSubmit,
        handleSaveArrtibuteData,
      });
      if (approveFlag) {
        resolve();
      } else {
        reject();
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
  }, [onLoad, handleGetInfo, headerDs, listDs, handleWorkFlowCheck, id]);

  useEffect(() => {
    const workflowLoading = headerDs?.current?.get('prHeaderId');
    // eslint-disable-next-line no-unused-expressions
    headerDs?.current?.set({ workflowFormCode });
    if (isFunction(onFormLoaded) && Boolean(workflowLoading) && listDs.status === headerDs.status) {
      onFormLoaded(true);
    }
  }, [onFormLoaded, listDs.status]);

  const renderRemotePanel = remote
    ? remote.process('SPRM_PURCHASE_PLAFORM_QUERY_SECTION_REMOTE_RENDER', null, {
        headerDs,
        listDs,
        location,
        prHeaderId,
      })
    : null;

  return (
    <>
      <HeaderButtons />
      <Spin spinning={headerDs.status !== 'ready' || listDs.status !== 'ready'}>
        <Anchor prSourcePlatform={prSourcePlatform} />
        <div className={pubPathFlag ? styles.sprm_fixed_header : styles.sprm_pub_header}>
          <AiCheckAlert record={headerDs?.current} />
          <Content className={classnames(styles['sprm-new-detail-content'], 'sprm-detail')}>
            {customizeCollapse(
              {
                code: 'SPRM.PURCHASE_PLAFORM_QUERY.SECTION',
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
                  <BaseInfo code="SPRM.PURCHASE_PLAFORM_QUERY.BASE_HEADER" query />
                </Panel>
                {prSourcePlatform !== 'ERP' && (
                  <Panel
                    key="purchaseOrgInfo"
                    id="sprm-workSpace-detail-content-organizationInfo"
                    header={intl.get('sprm.common.title.purchaseOrgInfo').d('采购方及采买组织信息')}
                  >
                    <PurchaseOrgInfo code="SPRM.PURCHASE_PLAFORM_QUERY.PURCHASEORGINFO" />
                  </Panel>
                )}
                {prSourcePlatform === 'E-COMMERCE' && (
                  <Panel
                    key="deliveryInfo"
                    id="sprm-workSpace-detail-content-deliveryInfo"
                    header={intl.get('sprm.common.title.deliveryInfo').d('收货/收单信息')}
                  >
                    <DeliveryInfo code="SPRM.PURCHASE_PLAFORM_QUERY.DELIVERYINFO" />
                  </Panel>
                )}
                {prSourcePlatform === 'E-COMMERCE' && (
                  <Panel
                    key="billingInfo"
                    id="sprm-workSpace-detail-content-billingInfo"
                    header={intl.get('sprm.common.title.BillingInfo').d('开票信息')}
                  >
                    <BillingInfo code="SPRM.PURCHASE_PLAFORM_QUERY.BILLINGINFO" />
                  </Panel>
                )}
                <Panel
                  key="editTable"
                  id="sprm-workSpace-detail-content-detailInfo"
                  header={intl.get('sprm.common.title.detailLineInfo').d('申请明细信息')}
                >
                  <PurchaseLineInfo
                    code="SPRM.PURCHASE_PLAFORM_QUERY.PURCHASELINE"
                    remote={remote}
                    buttonCode="SPRM.PURCHASE_PLAFORM_QUERY.TABLE_BTN"
                  />
                </Panel>
                <Panel
                  key="attachmentInfo"
                  disabled
                  id="sprm-workSpace-detail-content-attachmentInfo"
                  header={intl.get('sprm.common.model.common.enterEnclosure').d('内部附件')}
                  showArrow={false}
                >
                  <AttachmentInfo
                    code="SPRM.PURCHASE_PLAFORM_QUERY.ATTACHMENT"
                    externalCode="SPRM.PURCHASE_PLAFORM_QUERY.ATTACH_EX"
                    readOnly
                    showChangeAttach
                    changeReadOnly
                  />
                </Panel>
                {renderRemotePanel}
              </Collapse>
            )}
          </Content>
        </div>
      </Spin>
    </>
  );
};

export default observer(Detail);

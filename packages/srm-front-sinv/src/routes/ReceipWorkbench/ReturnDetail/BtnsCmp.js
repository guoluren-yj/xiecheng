// 按钮组的重新封装
import React, { useCallback } from 'react';
import intl from 'utils/intl';
import { Badge } from 'choerodon-ui';
import { SRM_SPUC } from '_utils/config';
import { compose, isNil } from 'lodash';
import { observer } from 'mobx-react-lite';
import { getCurrentOrganizationId } from 'utils/utils';
import DynamicButtons from '_components/DynamicButtons';
import { openApproveModal } from '_components/ApproveModal';
import formatterCollections from 'utils/intl/formatterCollections';
import PrintProButton from 'srm-front-boot/lib/components/PrintProButton';
import { Button as PermissionButton } from 'hzero-front/lib/components/Permission';
import ChatCmp from '../../components/Chat';

const HeaderBtnComps = observer((props) => {
  const { _btnObjs, dataSet } = props;
  const {
    type,
    from,
    formDs,
    history,
    spinning,
    isSupplier, // *todo
    rcvStatusCode,
    rcvTrxHeaderId, // *todo
    unreadQuantity,
    sourceFromPub,
    editFieldFlag,
    isRoleWorkbench,
    docFlow,
    pageFromFlag,
    customizeBtnGroup,
    nodeConfigIndexAbc, // *todo
    handRate = (e) => e,
    handlePrint = (e) => e,
    handleAffirm = (e) => e,
    openMessage = (e) => e,
    operaChange = (e) => e,
    handleRevoke = (e) => e,
    handleSubmit = (e) => e,
    handleSave = (e) => e,
    handleDelete = (e) => e,
    openEdit = (e) => e,
  } = _btnObjs;
  const numBtn = unreadQuantity === 0 || isNil(unreadQuantity) ? 0 : unreadQuantity;
  const opreateFlag =
    rcvStatusCode === '10_NEW' ||
    rcvStatusCode === '30_REJECTED' ||
    rcvStatusCode === '30_SUP_REJECTED';
  const saveFlag =
    rcvStatusCode === '10_NEW' ||
    rcvStatusCode === '30_REJECTED' ||
    rcvStatusCode === '30_SUP_REJECTED' ||
    rcvStatusCode === '40_FINISHED';
  const approvaFlags = dataSet?.getState('approvaFlags');
  const operationFlags = dataSet?.getState('operationFlags');
  const businessKeys = dataSet?.current?.get('businessKey');
  const approvaFlag = approvaFlags?.[businessKeys];
  const operationFlag = operationFlags?.[businessKeys];
  const { taskId, processInstanceId } = approvaFlag || {};

  const getBtns = useCallback(() => {
    const ChatCmps = (btns) => {
      return (
        <ChatCmp
          type="c7n-pro"
          btnType="button"
          color="#000"
          // funcType="flat"
          // icon="headset"
          funcType={btns?.inMenuItem ? 'link' : 'flat'}
          icon={!btns?.inMenuItem && 'headset'}
          camp="pur"
          loading={spinning}
          id={rcvTrxHeaderId}
          btnText={btns?.buttonText}
          companyId={formDs?.current?.get('companyId')}
        />
      );
    };
    const fiveBtns = [
      docFlow !== 'flow' && {
        name: 'affirm',
        child: intl.get(`hzero.common.button.affirm`).d('确认'),
        btnProps: {
          icon: 'done',
          loading: spinning,
          type: 'c7n-pro',
          color: 'primary',
          onClick: () => handleAffirm('40_FINISHED'),
        },
      },
      docFlow !== 'flow' && {
        name: 'refuse',
        child: intl.get(`hzero.common.button.refuse`).d('拒绝'),
        btnProps: {
          icon: 'close',
          loading: spinning,
          type: 'c7n-pro',
          funcType: 'flat',
          onClick: () => handleAffirm('30_SUP_REJECTED'),
        },
      },
      docFlow !== 'flow' &&
        !sourceFromPub && {
          name: 'print',
          child: intl.get('hzero.common.button.print').d('打印'),
          btnComp: PermissionButton,
          btnProps: {
            icon: 'print',
            loading: spinning,
            type: 'c7n-pro',
            funcType: 'flat',
            onClick: handlePrint,
            permissionList: [
              {
                code: `srm.logistics.receive.workbench.button.print`,
                type: 'c7n-pro',
              },
            ],
          },
        },
      docFlow !== 'flow' &&
        !sourceFromPub && {
          name: 'newPrint',
          child: intl.get('hzero.common.button.newPrint').d('打印(新)'),
          btnComp: PrintProButton,
          btnProps: {
            loading: spinning,
            buttonProps: {
              icon: 'print',
              type: 'c7n-pro',
              funcType: 'flat',
              permissionList: [
                {
                  code: `srm.logistics.receive.workbench.button.newPrint`,
                  type: 'c7n-pro',
                },
              ],
            },
            requestUrl: `${SRM_SPUC}/v1/${getCurrentOrganizationId()}/sinv/rcv/trx/workbench/batch-print-rcv-token`,
            method: 'POST',
            data: [rcvTrxHeaderId],
            buttonText: intl.get('hzero.common.button.newPrint').d('打印(新)'),
          },
        },
      docFlow !== 'flow' &&
        rcvStatusCode === '35_PUBLISH' && {
          name: 'message',
          child: (
            <Badge count={numBtn}>
              <span>
                {intl.get(`sinv.receiptWorkbench.view.title.detail.message`).d('留言板')}
                &nbsp;&nbsp;&nbsp;
              </span>
            </Badge>
          ),
          btnProps: {
            loading: spinning,
            icon: 'comment',
            onClick: openMessage,
            funcType: 'flat',
            type: 'c7n-pro',
            buttonProps: {
              type: 'c7n-pro',
              loading: spinning,
              buttonProps: {
                type: 'c7n-pro',
                funcType: 'flat',
              },
              funcType: 'flat',
            },
          },
        },
      {
        name: 'operation',
        child: intl.get(`hzero.common.view.message.operateHistory`).d('操作记录'),
        btnProps: {
          loading: spinning,
          icon: 'operation_service_request',
          onClick: operaChange,
          funcType: 'flat',
          type: 'c7n-pro',
        },
      },
      rcvStatusCode === '35_PUBLISH' && {
        name: 'rate',
        child: intl.get(`sinv.common.view.message.button.rate`).d('评价'),
        btnProps: {
          icon: 'rate_review1',
          loading: spinning,
          onClick: handRate,
          funcType: 'flat',
          type: 'c7n-pro',
        },
        hidden: isSupplier,
      },
      docFlow !== 'flow' &&
        !sourceFromPub && {
          name: 'approval',
          child: (name) => name || intl.get('hzero.common.button.approval').d('审批'),
          hidden: docFlow === 'flow' && sourceFromPub && !approvaFlags && !approvaFlag,
          btnProps: {
            icon: 'authorize',
            type: 'c7n-pro',
            funcType: 'flat',
            loading: spinning,
            onClick: async () => {
              openApproveModal({
                modalProps: {
                  closable: true,
                },
                taskId,
                processInstanceId,
                onSuccess: () => {
                  history.push({
                    pathname: '/sinv/receipt-workbench/list',
                  });
                },
              });
            },
          },
        },
      docFlow !== 'flow' &&
        !sourceFromPub && {
          name: 'revoke',
          child: intl.get('sinv.receiptWorkbench.view.button.Revoke').d('撤销审批'),
          hidden: !operationFlags && !operationFlag?.REVOKE,
          btnProps: {
            icon: 'reply',
            loading: spinning,
            onClick: handleRevoke,
            funcType: 'flat',
            type: 'c7n-pro',
            disabled:
              sourceFromPub ||
              ['flow', 'oldFlow'].includes(docFlow) ||
              (rcvStatusCode && rcvStatusCode !== '20_SUBMITTED'),
          },
        },
      docFlow !== 'flow' &&
        !sourceFromPub && {
          name: 'onlineChat',
          child: intl.get('sinv.receiptWorkbench.view.title.detail.onlineChat').d('在线沟通'),
          childFor: 'buttonText',
          btnComp: ChatCmps,
        },
    ];
    const btns = [
      !['flow', 'oldFlow'].includes(docFlow) &&
        isNil(isRoleWorkbench) &&
        !sourceFromPub &&
        rcvStatusCode &&
        rcvStatusCode !== '40_FINISHED' && {
          name: 'submit',
          child: intl.get('hzero.common.button.submit').d('提交'),
          btnProps: {
            icon: 'check',
            loading: spinning,
            disabled: !opreateFlag,
            color: 'primary',
            type: 'c7n-pro',
            onClick: handleSubmit,
          },
        },
      docFlow !== 'flow' &&
        isNil(isRoleWorkbench) &&
        !sourceFromPub &&
        (((from === 'three' || from === 'four') && editFieldFlag) ||
          (from !== 'three' && from !== 'four' && !editFieldFlag)) && {
          name: 'save',
          child: intl.get('hzero.common.button.save').d('保存'),
          btnProps: {
            icon: 'save',
            loading: spinning,
            funcType: 'flat',
            type: 'c7n-pro',
            disabled: !saveFlag,
            onClick: handleSave,
          },
        },
      docFlow !== 'flow' &&
        !sourceFromPub && {
          name: 'print',
          child: intl.get('hzero.common.button.print').d('打印'),
          btnComp: PermissionButton,
          btnProps: {
            icon: 'print',
            loading: spinning,
            type: 'c7n-pro',
            funcType: 'flat',
            onClick: handlePrint,
            permissionList: [
              {
                code: `srm.logistics.receive.workbench.button.print`,
                type: 'c7n-pro',
              },
            ],
          },
        },
      docFlow !== 'flow' &&
        !sourceFromPub && {
          name: 'newPrint',
          child: intl.get('hzero.common.button.newPrint').d('打印(新)'),
          btnComp: PrintProButton,
          btnProps: {
            buttonProps: {
              icon: 'print',
              type: 'c7n-pro',
              funcType: 'flat',
              permissionList: [
                {
                  code: `srm.logistics.receive.workbench.button.newPrint`,
                  type: 'c7n-pro',
                },
              ],
            },
            icon: 'print',
            type: 'c7n-pro',
            funcType: 'flat',
            loading: spinning,

            requestUrl: `${SRM_SPUC}/v1/${getCurrentOrganizationId()}/sinv/rcv/trx/workbench/batch-print-rcv-token`,
            buttonText: intl.get('hzero.common.button.newPrint').d('打印(新)'),
            method: 'POST',
            data: [rcvTrxHeaderId],
          },
        },
      !['flow', 'oldFlow'].includes(docFlow) &&
        isNil(isRoleWorkbench) &&
        !sourceFromPub &&
        rcvStatusCode &&
        rcvStatusCode !== '40_FINISHED' && {
          name: 'delete',
          child: intl.get(`hzero.common.button.delete`).d('删除'),
          btnProps: {
            icon: 'delete',
            loading: spinning,
            onClick: handleDelete,
            disabled: !opreateFlag,
            type: 'c7n-pro',
            funcType: 'flat',
          },
        },
      {
        name: 'operation',
        child: intl.get(`hzero.common.view.message.operateHistory`).d('操作记录'),
        btnProps: {
          loading: spinning,
          icon: 'operation_service_request',
          funcType: 'flat',
          type: 'c7n-pro',
          onClick: operaChange,
        },
      },
      docFlow !== 'flow' &&
        !sourceFromPub &&
        (type === 'SOURCE' || type === 'COURSE' || type === 'END') && {
          name: 'message',
          child: (
            <Badge count={numBtn}>
              <span>
                {intl.get(`sinv.receiptWorkbench.view.title.detail.message`).d('留言板')}
                &nbsp;&nbsp;&nbsp;
              </span>
            </Badge>
          ),
          btnProps: {
            loading: spinning,
            icon: 'comment',
            onClick: openMessage,
            funcType: 'flat',
            type: 'c7n-pro',
            buttonProps: {
              type: 'c7n-pro',
              funcType: 'flat',
            },
          },
        },
      docFlow !== 'flow' &&
        isNil(isRoleWorkbench) &&
        !sourceFromPub &&
        (from === 'three' || from === 'four') &&
        !editFieldFlag && {
          name: 'update',
          child: intl.get('sinv.receiptWorkbench.view.title.detail.update').d('变更'),
          btnProps: {
            icon: 'mode_edit',
            onClick: openEdit,
            funcType: 'flat',
            type: 'c7n-pro',
          },
        },
      docFlow !== 'flow' &&
        !sourceFromPub &&
        approvaFlags &&
        approvaFlag && {
          name: 'approval',
          child: (name) => name || intl.get('hzero.common.button.approval').d('审批'),
          hidden: !approvaFlags && !approvaFlag,
          btnProps: {
            icon: 'authorize',
            type: 'c7n-pro',
            funcType: 'flat',
            loading: spinning,
            onClick: async () => {
              openApproveModal({
                modalProps: {
                  closable: true,
                },
                taskId,
                processInstanceId,
                onSuccess: () => {
                  history.push({
                    pathname: '/sinv/receipt-workbench/list',
                  });
                },
              });
            },
          },
        },
      docFlow !== 'flow' &&
        !sourceFromPub &&
        operationFlags &&
        operationFlag?.REVOKE && {
          name: 'revoke',
          child: intl.get('sinv.receiptWorkbench.view.button.Revoke').d('撤销审批'),
          hidden: !operationFlags && !operationFlag?.REVOKE,
          btnProps: {
            icon: 'reply',
            loading: spinning,
            onClick: handleRevoke,
            funcType: 'flat',
            type: 'c7n-pro',
            disabled:
              sourceFromPub ||
              ['flow', 'oldFlow'].includes(docFlow) ||
              (rcvStatusCode && rcvStatusCode !== '20_SUBMITTED'),
          },
        },
      docFlow !== 'flow' &&
        isNil(isRoleWorkbench) &&
        !sourceFromPub &&
        from === 'three' &&
        !editFieldFlag && {
          name: 'onlineChat',
          child: (name) =>
            name || intl.get('sinv.receiptWorkbench.view.title.detail.onlineChat').d('在线沟通'),
          childFor: 'buttonText',
          btnComp: ChatCmps,
        },
    ];
    const cuzBtns = [
      {
        name: 'operation',
        child: intl.get(`hzero.common.view.message.operateHistory`).d('操作记录'),
        btnProps: {
          loading: spinning,
          icon: 'operation_service_request',
          funcType: 'flat',
          type: 'c7n-pro',
          onClick: operaChange,
        },
      },
    ];
    const btnCmp = from === 'five' ? fiveBtns.filter(Boolean) : btns.filter(Boolean);
    const formBtns = cuzBtns.filter(Boolean);
    if (!pageFromFlag) {
      return (
        <>
          {customizeBtnGroup(
            {
              code: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.BUTTON.RETURN_${nodeConfigIndexAbc}`,
              pro: true,
            },
            <DynamicButtons
              maxNum={7}
              defaultBtnType="c7n-pro"
              buttons={btnCmp}
              permissions={[
                {
                  code: 'srm.logistics.receive.workbench.button.line.approval',
                  name: 'approval',
                },
                {
                  code: 'srm.logistics.receive.workbench.button.line.revokeapproval',
                  name: 'revoke',
                },
                {
                  code: 'srm.logistics.receive.workbench.button.line.onlinechat',
                  name: 'onlineChat',
                },
              ]}
            />
          )}
        </>
      );
    }
    if (pageFromFlag) {
      return <DynamicButtons maxNum={7} defaultBtnType="c7n-pro" buttons={formBtns} />;
    }
  }, [
    taskId,
    docFlow,
    spinning,
    rcvStatusCode,
    unreadQuantity,
    sourceFromPub,
    editFieldFlag,
    isRoleWorkbench,
    approvaFlag,
    operationFlag,
    operationFlags,
    pageFromFlag,
    processInstanceId,
    nodeConfigIndexAbc,
  ]);

  return <>{getBtns()}</>;
});
export default compose(
  formatterCollections({
    code: [
      'sinv.receiptExecution',
      'sinv.receiptWorkbench',
      'hzero.common',
      'sinv.purchaserDelivery',
      'entity.company',
      'sinv.receipWork',
      'sinv.common',
    ],
  })
)(HeaderBtnComps);

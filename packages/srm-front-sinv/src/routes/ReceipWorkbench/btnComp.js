// 按钮组的重新封装
import React, { useCallback } from 'react';
import intl from 'utils/intl';
import { Button, Icon, Tooltip } from 'choerodon-ui/pro';
import { SRM_SPUC } from '_utils/config';
import { compose, isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import formatterCollections from 'utils/intl/formatterCollections';
// import DynamicButtons from '_components/DynamicButtons';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import PrintProButton from 'srm-front-boot/lib/components/PrintProButton';
import { Button as PermissionButton } from 'components/Permission';
import CommonImport from 'hzero-front/lib/components/Import';
import DynamicButtons from 'srm-front-boot/lib/components/DynamicButtons';

import USMButton from './components/UpdateSubjectMatter';
import style from './index.less';

const organizationId = getCurrentOrganizationId();

const BtnComps = observer((props) => {
  const { _btnObjs, dataSet, docManageRemote } = props;
  const {
    viewType,
    tabCutPage,
    courseAsLine,
    isSlodConfig,
    asyncLoading,
    ceationLoading,
    sendBackLoading,
    subAndDeleteLoading,
    nodeConfigIndexAbc,
    creationButton,
    handleToDetail,
    handleTransfer,
    handlePrint,
    subAndDelChange,
    handleCancel,
    handleToOperation,
    handleAffirm,
    handleRevoke,
    synchronousButton,
    customizeBtnGroup,
    sendBackShowModalChange,
  } = _btnObjs;
  const getQueryParams = () =>
    filterNullValueObject({
      ...dataSet?.queryParameter.params,
      ...dataSet.queryDataSet?.toData()[0],
    });
  const selectedRecords = dataSet?.selected || [];
  const rcvTrxLineIds = []; // 待收货 可退货 （包括按行） 行id
  const rcvTrxHeaderIds = []; // 按单头id
  let disBtn = false;
  selectedRecords.forEach((item) => {
    rcvTrxLineIds.push(item?.get('rcvTrxLineId'));
    rcvTrxHeaderIds.push(item?.get('rcvTrxHeaderId'));
    if (!disBtn && item.get('rcvStatusCode') === '20_SUBMITTED') {
      disBtn = true;
    }
  });

  const getBtns = useCallback(() => {
    const { SINV_PRLIST_REMOTE_LIST_BTNS } = docManageRemote?.props?.process || {};
    const cuxBtnsList = SINV_PRLIST_REMOTE_LIST_BTNS
      ? SINV_PRLIST_REMOTE_LIST_BTNS({ ..._btnObjs, dataSet }) || []
      : [];
    switch (tabCutPage) {
      case 'one':
        return (
          <>
            {customizeBtnGroup(
              {
                code: `SINV.RECEIPT_WORKBENCH_THING.BUTTON.WAIT_${nodeConfigIndexAbc}`,
                pro: true,
              },
              <DynamicButtons
                key="one"
                maxNum={5}
                defaultBtnType="c7n-pro"
                permissions={[
                  {
                    code: 'srm.logistics.receive.workbench.button.newimport',
                    name: 'newImport',
                  },
                  {
                    code: 'srm.logistics.receive.workbench.button.subMat',
                    name: 'subMat',
                  },
                  {
                    code: 'srm.logistics.receive.workbench.button.subMatOptaion',
                    name: 'subMatOptaion',
                  },
                ]}
                buttons={[
                  {
                    name: 'create',
                    group: true,
                    children: [
                      {
                        name: 'instantly',
                        child: intl.get('sinv.receiptExecution.model.selectCreate').d('勾选新建'),
                        btnProps: {
                          disabled: isEmpty(dataSet?.selected),
                          onClick: () => creationButton(true),
                        },
                      },
                      {
                        name: 'all',
                        child: intl.get('hzero.common.model.allCreate').d('全选新建'),
                        btnProps: {
                          disabled: !dataSet.length,
                          onClick: () => creationButton(false),
                        },
                      },
                    ],
                    child: (name) => {
                      return (
                        (
                          <Button
                            style={{ border: 'none', color: '#FFF' }}
                            loading={ceationLoading}
                            color="primary"
                            icon="add"
                            type="c7n-pro"
                          >
                            {name || intl.get('hzero.common.button.creat').d('新建')}
                            <Icon type="expand_more" style={{ marginLeft: 4 }} />
                          </Button>
                        ) || <span style={{ display: 'none' }} />
                      );
                    },
                  },
                  {
                    name: 'newExport',
                    btnComp: ExcelExportPro,
                    btnProps: {
                      allBody: true,
                      method: 'POST',
                      templateCode: 'SPUC_SINV_WORKBENCH_WAITING_EXPORT',
                      queryParams: isEmpty(dataSet?.selected) ? getQueryParams : { rcvTrxLineIds },
                      requestUrl: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/trx/waiting/export/new`,
                      buttonText: isEmpty(dataSet?.selected)
                        ? intl.get(`sinv.receiptWorkbench.view.button.newExport`).d('新版导出')
                        : intl
                            .get(`sinv.receiptWorkbench.view.button.newCheckExport`)
                            .d('新版勾选导出'),
                      otherButtonProps: {
                        icon: 'unarchive',
                        type: 'c7n-pro',
                        funcType: 'flat',
                        permissionList: [
                          {
                            code: 'srm.logistics.receive.workbench.ps.button.wait.newexport',
                            type: 'c7n-pro',
                          },
                        ],
                      },
                    },
                  },
                  {
                    name: 'export',
                    btnComp: ExcelExport,
                    btnProps: {
                      method: 'POST',
                      queryParams: isEmpty(dataSet?.selected) ? getQueryParams : { rcvTrxLineIds },
                      requestUrl: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/trx/waiting/export`,
                      buttonText: isEmpty(dataSet?.selected)
                        ? intl.get(`sinv.receiptWorkbench.view.button.Export`).d('导出')
                        : intl.get(`sinv.receiptWorkbench.view.button.checkExport`).d('勾选导出'),
                      otherButtonProps: {
                        icon: 'unarchive',
                        type: 'c7n-pro',
                        funcType: 'flat',
                      },
                    },
                  },
                  {
                    name: 'executionRecord',
                    btnType: 'c7n-pro',
                    child: intl
                      .get('sinv.receiptWorkbench.view.button.executionRecord')
                      .d('异步执行记录'),
                    btnProps: {
                      btnType: 'c7n-pro',
                      funcType: 'flat',
                      icon: 'operation_service_request',
                      onClick: handleToDetail,
                    },
                  },
                  {
                    name: 'transfer',
                    child: intl.get('sinv.receiptWorkbench.view.button.transfer').d('转交'),
                    btnType: 'c7n-pro',
                    btnProps: {
                      btnType: 'c7n-pro',
                      funcType: 'flat',
                      icon: 'call_missed_outgoing',
                      disabled: !dataSet.selected.length,
                      onClick: handleTransfer,
                    },
                  },
                  {
                    name: 'newImport',
                    child: (name) =>
                      name ||
                      intl.get(`sinv.receiptWorkbench.view.button.newImport`).d('期初数据导入'),
                    childFor: 'buttonText',
                    btnComp: CommonImport,
                    btnProps: {
                      buttonProps: {
                        icon: 'archive',
                        type: 'c7n-pro',
                        funcType: 'flat',
                      },
                      refreshButton: true,
                      prefixPatch: SRM_SPUC,
                      args: {
                        tenantId: getCurrentOrganizationId(),
                        templateCode: 'SRM_C_SRM_SINV_RCV_TRX_HEADER_IMPORT',
                      },
                      buttonText: intl
                        .get(`sinv.receiptWorkbench.view.button.newImport`)
                        .d('期初数据导入'),
                      businessObjectTemplateCode: 'SRM_C_SRM_SINV_RCV_TRX_HEADER_IMPORT',
                      successCallBack: () => dataSet.query(),
                    },
                  },
                  {
                    name: 'subMat',
                    child: (name) =>
                      name ||
                      intl
                        .get('sinv.receiptWorkbench.view.button.updateSubjectMatter')
                        .d('更新收货策略'),
                    btnComp: USMButton,
                    btnProps: {
                      buttonProps: {
                        icon: 'operation_service_request',
                        type: 'c7n-pro',
                        funcType: 'flat',
                      },
                      dataSet,
                      isSlodConfig,
                      features: 'subMat',
                      disabled: isEmpty(dataSet?.selected) || !isSlodConfig,
                      btnText: intl
                        .get('sinv.receiptWorkbench.view.button.updateSubjectMatter')
                        .d('更新收货策略'),
                    },
                  },
                  {
                    name: 'subMatOptaion',
                    child: (name) =>
                      name ||
                      intl.get('sinv.receiptWorkbench.view.button.subMatOptaion').d('更新策略记录'),
                    btnComp: USMButton,
                    btnProps: {
                      buttonProps: {
                        icon: 'operation_service_request',
                        type: 'c7n-pro',
                        funcType: 'flat',
                      },
                      dataSet,
                      isSlodConfig,
                      features: 'subMatOptaion',
                      // disabled: isSlodConfig,
                      btnText: intl
                        .get('sinv.receiptWorkbench.view.button.subMatOptaion')
                        .d('更新策略记录'),
                    },
                  },
                  ...(cuxBtnsList || []),
                ]}
              />
            )}
          </>
        );
      case 'two':
        // 按单
        if (!courseAsLine) {
          return (
            <>
              {customizeBtnGroup(
                {
                  code: `SINV.RECEIPT_WORKBENCH_THING.BUTTON.COURSE_${nodeConfigIndexAbc}`,
                  pro: true,
                },
                <DynamicButtons
                  buttons={[
                    {
                      name: 'revoke',
                      btnType: 'c7n-pro',
                      child: intl.get('sinv.receiptWorkbench.view.button.Revoke').d('撤销审批'),
                      btnProps: {
                        btnType: 'c7n-pro',
                        funcType: 'flat',
                        disabled: isEmpty(dataSet?.selected),
                        loading: subAndDeleteLoading,
                        onClick: handleRevoke,
                      },
                    },
                    {
                      name: 'executionRecord',
                      btnType: 'c7n-pro',
                      child: intl
                        .get('sinv.receiptWorkbench.view.button.executionRecord')
                        .d('异步执行记录'),
                      btnProps: {
                        btnType: 'c7n-pro',
                        funcType: 'flat',
                        icon: 'operation_service_request',
                        onClick: handleToDetail,
                      },
                    },
                    {
                      name: 'export',
                      btnComp: ExcelExport,
                      btnProps: {
                        method: 'POST',
                        queryParams: isEmpty(dataSet?.selected)
                          ? getQueryParams
                          : { rcvTrxHeaderIds },
                        requestUrl: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/trx/doing/export`,
                        buttonText: isEmpty(dataSet?.selected)
                          ? intl.get(`sinv.receiptWorkbench.view.button.Export`).d('导出')
                          : intl.get(`sinv.receiptWorkbench.view.button.checkExport`).d('勾选导出'),
                        otherButtonProps: {
                          icon: 'unarchive',
                          type: 'c7n-pro',
                          funcType: 'flat',
                        },
                      },
                    },
                    {
                      name: 'newExport',
                      btnComp: ExcelExportPro,
                      btnProps: {
                        allBody: true,
                        method: 'POST',
                        templateCode: 'SPUC_SINV_WORKBENCH_DOING_EXPORT',
                        queryParams: isEmpty(dataSet?.selected)
                          ? getQueryParams
                          : { rcvTrxHeaderIds },
                        requestUrl: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/trx/doing/export/new`,
                        buttonText: isEmpty(dataSet?.selected)
                          ? intl.get(`sinv.receiptWorkbench.view.button.newExport`).d('新版导出')
                          : intl
                              .get(`sinv.receiptWorkbench.view.button.newCheckExport`)
                              .d('新版勾选导出'),
                        otherButtonProps: {
                          icon: 'unarchive',
                          type: 'c7n-pro',
                          funcType: 'flat',
                          permissionList: [
                            {
                              code: 'srm.logistics.receive.workbench.ps.doing.line.newexport',
                              type: 'c7n-pro',
                            },
                          ],
                        },
                      },
                    },
                    {
                      name: 'delete',
                      btnType: 'c7n-pro',
                      child: intl.get('hzero.common.model.delete').d('删除'),
                      btnProps: {
                        btnType: 'c7n-pro',
                        funcType: 'flat',
                        icon: 'delete',
                        disabled: isEmpty(dataSet?.selected) || disBtn,
                        loading: subAndDeleteLoading,
                        onClick: () => subAndDelChange('50_DELETED'),
                      },
                    },
                    {
                      name: 'newPrint',
                      child: (name) =>
                        name || intl.get(`sinv.common.view.message.button.newPrints`).d('打印(新)'),
                      btnComp: PrintProButton,
                      btnProps: {
                        buttonProps: {
                          disabled: isEmpty(dataSet?.selected),
                          funcType: 'flat',
                          permissionList: [
                            {
                              code: `srm.logistics.receive.workbench.button.newPrint`,
                              type: 'button',
                              meaning: '收货工作台-列表-新打印',
                            },
                          ],
                        },
                        requestUrl: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/batch-print-rcv-token`,
                        method: 'POST',
                        data: dataSet?.selected.map((item) => item.get('rcvTrxHeaderId')),
                        buttonText: intl
                          .get(`sinv.common.view.message.button.newPrints`)
                          .d('打印(新)'),
                      },
                    },
                    {
                      name: 'print',
                      child: intl.get(`sinv.common.view.message.button.print`).d('打印'),
                      btnComp: PermissionButton,
                      btnProps: {
                        funcType: 'flat',
                        icon: 'print',
                        type: 'c7n-pro',
                        loading: subAndDeleteLoading,
                        disabled: isEmpty(dataSet?.selected),
                        onClick: () => handlePrint(dataSet.selected),
                        permissionList: [
                          {
                            code: `srm.logistics.receive.workbench.button.print`,
                            type: 'button',
                          },
                        ],
                      },
                    },
                    {
                      name: 'submit',
                      btnType: 'c7n-pro',
                      child: intl.get('hzero.common.model.submit').d('提交'),
                      btnProps: {
                        color: 'primary',
                        icon: 'done',
                        disabled: isEmpty(dataSet?.selected) || disBtn,
                        loading: subAndDeleteLoading,
                        onClick: () => subAndDelChange('40_FINISHED'),
                      },
                    },
                    ...(cuxBtnsList || []),
                  ].reverse()}
                />
              )}
            </>
          );
        } else {
          return (
            <div className={style['thing-receipts-btn']}>
              {customizeBtnGroup(
                {
                  code: `SINV.RECEIPT_WORKBENCH_THING.BUTTON.COURSE.ASN_${nodeConfigIndexAbc}`,
                  pro: true,
                },
                <DynamicButtons
                  buttons={[
                    {
                      name: 'export',
                      btnComp: ExcelExport,
                      btnProps: {
                        method: 'POST',
                        queryParams: isEmpty(dataSet?.selected)
                          ? getQueryParams
                          : { rcvTrxLineIds },
                        requestUrl: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/trx/doing-sinv/line/export`,
                        buttonText: isEmpty(dataSet?.selected)
                          ? intl.get(`sinv.receiptWorkbench.view.button.Export`).d('导出')
                          : intl.get(`sinv.receiptWorkbench.view.button.checkExport`).d('勾选导出'),
                        otherButtonProps: {
                          icon: 'unarchive',
                          type: 'c7n-pro',
                          funcType: 'flat',
                        },
                      },
                    },
                    {
                      name: 'newExport',
                      btnComp: ExcelExportPro,
                      btnProps: {
                        allBody: true,
                        method: 'POST',
                        templateCode: 'SPUC_SINV_WORKBENCH_DOING_DETAIL_EXPORT',
                        queryParams: isEmpty(dataSet?.selected)
                          ? getQueryParams
                          : { rcvTrxLineIds },
                        requestUrl: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/trx/doing-sinv/line/export/new`,
                        buttonText: isEmpty(dataSet?.selected)
                          ? intl.get(`sinv.receiptWorkbench.view.button.newExport`).d('新版导出')
                          : intl
                              .get(`sinv.receiptWorkbench.view.button.newCheckExport`)
                              .d('新版勾选导出'),
                        otherButtonProps: {
                          icon: 'unarchive',
                          type: 'c7n-pro',
                          funcType: 'flat',
                          permissionList: [
                            {
                              code: 'srm.logistics.receive.workbench.ps.button.doing.newexport',
                              type: 'c7n-pro',
                            },
                          ],
                        },
                      },
                    },
                    ...(cuxBtnsList || []),
                  ]}
                />
              )}
            </div>
          );
        }
      case 'three':
        if (viewType === 'wide') {
          // 按单
          return (
            <div className={style['thing-receipts-btn']}>
              {customizeBtnGroup(
                {
                  code: `SINV.RECEIPT_WORKBENCH_THING.BUTTON.END.DAN_${nodeConfigIndexAbc}`,
                  pro: true,
                },
                <DynamicButtons
                  buttons={[
                    {
                      name: 'cancel',
                      btnType: 'c7n-pro',
                      child: (
                        <Tooltip
                          title={intl
                            .get('sinv.receiptWorkbench.view.button.cancelTip')
                            .d(
                              '单据取消，又名反审核，用于删除单据并回滚上游单据的接收数量。该操作不可逆，成功后列表页将无法查询到。'
                            )}
                        >
                          <Button
                            loading={asyncLoading}
                            funcType="flat"
                            icon="cancel"
                            onClick={handleCancel}
                            disabled={isEmpty(dataSet?.selected)}
                          >
                            {intl.get('sinv.receiptWorkbench.view.button.cancel').d('取消')}
                          </Button>
                        </Tooltip>
                      ),
                      btnProps: {
                        btnType: 'c7n-pro',
                        funcType: 'flat',
                      },
                    },
                    {
                      name: 'newPrint',
                      child: (name) =>
                        name || intl.get(`sinv.common.view.message.button.newPrint`).d('打印(新)'),
                      btnComp: PrintProButton,
                      btnProps: {
                        buttonProps: {
                          disabled: isEmpty(dataSet?.selected),
                          funcType: 'flat',
                          permissionList: [
                            {
                              code: `srm.logistics.receive.workbench.button.newPrint`,
                              type: 'button',
                              meaning: '收货工作台-列表-新打印',
                            },
                          ],
                        },
                        requestUrl: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/batch-print-rcv-token`,
                        method: 'POST',
                        data: dataSet?.selected.map((item) => item.get('rcvTrxHeaderId')),
                        buttonText: intl
                          .get(`sinv.common.view.message.button.newPrints`)
                          .d('打印(新)'),
                      },
                    },
                    {
                      name: 'print',
                      child: intl.get(`sinv.common.view.message.button.print`).d('打印'),
                      btnComp: PermissionButton,
                      btnProps: {
                        funcType: 'flat',
                        icon: 'print',
                        type: 'c7n-pro',
                        loading: subAndDeleteLoading,
                        disabled: isEmpty(dataSet?.selected),
                        onClick: () => handlePrint(dataSet.selected),
                        permissionList: [
                          {
                            code: `srm.logistics.receive.workbench.button.print`,
                            type: 'button',
                          },
                        ],
                      },
                    },
                    {
                      name: 'export',
                      btnComp: ExcelExport,
                      btnProps: {
                        method: 'POST',
                        queryParams: isEmpty(dataSet?.selected)
                          ? getQueryParams
                          : { rcvTrxHeaderIds },
                        requestUrl: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/trx/finish/header/export`,
                        buttonText: isEmpty(dataSet?.selected)
                          ? intl.get(`sinv.receiptWorkbench.view.button.Export`).d('导出')
                          : intl.get(`sinv.receiptWorkbench.view.button.checkExport`).d('勾选导出'),
                        otherButtonProps: {
                          icon: 'unarchive',
                          type: 'c7n-pro',
                          funcType: 'flat',
                        },
                      },
                    },
                    {
                      name: 'newExport',
                      btnComp: ExcelExportPro,
                      btnProps: {
                        allBody: true,
                        method: 'POST',
                        templateCode: 'SPUC_SINV_WORKBENCH_FINISH_EXPORT',
                        queryParams: isEmpty(dataSet?.selected)
                          ? getQueryParams
                          : { rcvTrxHeaderIds },
                        requestUrl: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/trx/finish/header/export/new`,
                        buttonText: isEmpty(dataSet?.selected)
                          ? intl.get(`sinv.receiptWorkbench.view.button.newExport`).d('新版导出')
                          : intl
                              .get(`sinv.receiptWorkbench.view.button.newCheckExport`)
                              .d('新版勾选导出'),
                        otherButtonProps: {
                          icon: 'unarchive',
                          type: 'c7n-pro',
                          funcType: 'flat',
                          permissionList: [
                            {
                              code: 'srm.logistics.receive.workbench.ps.button.finish.newexport',
                              type: 'c7n-pro',
                            },
                          ],
                        },
                      },
                    },
                    ...(cuxBtnsList || []),
                  ]}
                />
              )}
            </div>
          );
        } else {
          return (
            <div className={style['thing-receipts-btn']}>
              {customizeBtnGroup(
                {
                  code: `SINV.RECEIPT_WORKBENCH_THING.BUTTON.END.HAN_${nodeConfigIndexAbc}`,
                  pro: true,
                },
                <DynamicButtons
                  buttons={[
                    {
                      name: 'abnormalRecord',
                      btnType: 'c7n-pro',
                      child: intl
                        .get('sinv.receiptWorkbench.view.button.AbnormalOperationRecord')
                        .d('异常操作记录'),
                      btnProps: {
                        btnType: 'c7n-pro',
                        funcType: 'flat',
                        icon: 'operation_service_request',
                        onClick: handleToOperation,
                        loading: asyncLoading,
                      },
                    },
                    {
                      name: 'executionRecord',
                      btnType: 'c7n-pro',
                      child: intl
                        .get('sinv.receiptWorkbench.view.button.executionRecord')
                        .d('异步执行记录'),
                      btnProps: {
                        btnType: 'c7n-pro',
                        funcType: 'flat',
                        icon: 'operation_service_request',
                        onClick: handleToDetail,
                        loading: asyncLoading,
                      },
                    },
                    {
                      name: 'cancel',
                      btnType: 'c7n-pro',
                      child: (
                        <Tooltip
                          title={intl
                            .get('sinv.receiptWorkbench.view.button.cancelTip')
                            .d(
                              '单据取消，又名反审核，用于删除单据并回滚上游单据的接收数量。该操作不可逆，成功后列表页将无法查询到。'
                            )}
                        >
                          <Button
                            loading={asyncLoading}
                            funcType="flat"
                            icon="cancel"
                            onClick={handleCancel}
                            disabled={isEmpty(dataSet?.selected)}
                          >
                            {intl.get('sinv.receiptWorkbench.view.button.cancel').d('取消')}
                          </Button>
                        </Tooltip>
                      ),
                      btnProps: {
                        btnType: 'c7n-pro',
                        funcType: 'flat',
                      },
                    },
                    {
                      name: 'export',
                      btnComp: ExcelExport,
                      btnProps: {
                        method: 'POST',
                        queryParams: isEmpty(dataSet?.selected)
                          ? getQueryParams
                          : { rcvTrxLineIds },
                        requestUrl: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/trx/finish/line/export`,
                        buttonText: isEmpty(dataSet?.selected)
                          ? intl.get(`sinv.receiptWorkbench.view.button.Export`).d('导出')
                          : intl.get(`sinv.receiptWorkbench.view.button.checkExport`).d('勾选导出'),
                        otherButtonProps: {
                          icon: 'unarchive',
                          type: 'c7n-pro',
                          funcType: 'flat',
                        },
                      },
                    },
                    {
                      name: 'newExport',
                      btnComp: ExcelExportPro,
                      btnProps: {
                        allBody: true,
                        method: 'POST',
                        templateCode: 'SPUC_SINV_WORKBENCH_FINISH_DETAIL_EXPORT',
                        queryParams: isEmpty(dataSet?.selected)
                          ? getQueryParams
                          : { rcvTrxLineIds },
                        requestUrl: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/trx/finish/line/export/new`,
                        buttonText: isEmpty(dataSet?.selected)
                          ? intl.get(`sinv.receiptWorkbench.view.button.newExport`).d('新版导出')
                          : intl
                              .get(`sinv.receiptWorkbench.view.button.newCheckExport`)
                              .d('新版勾选导出'),
                        otherButtonProps: {
                          icon: 'unarchive',
                          type: 'c7n-pro',
                          funcType: 'flat',
                          permissionList: [
                            {
                              code:
                                'srm.logistics.receive.workbench.ps.button.line.finish.newexport',
                              type: 'c7n-pro',
                            },
                          ],
                        },
                      },
                    },
                    {
                      name: 'synchronous',
                      group: true,
                      children: [
                        {
                          name: 'settlement',
                          child: intl.get('sinv.receiptWorkbench.view.button.settlement').d('结算'),
                          btnProps: {
                            disabled: isEmpty(dataSet?.selected),
                            onClick: () => synchronousButton('settlement', dataSet?.selected),
                          },
                        },
                        {
                          name: 'externalSystem',
                          child: intl
                            .get('sinv.receiptWorkbench.view.button.externalSystem')
                            .d('外部系统'),
                          btnProps: {
                            disabled: isEmpty(dataSet?.selected),
                            onClick: () => synchronousButton('externalSystem', dataSet?.selected),
                          },
                        },
                      ],
                      child: (name) => {
                        return (
                          <Button
                            style={{ border: 'none' }}
                            loading={asyncLoading}
                            type="c7n-pro"
                            icon="cached"
                          >
                            {name ||
                              intl
                                .get('sinv.receiptWorkbench.view.button.synchronous')
                                .d('重新同步')}
                            <Icon type="expand_more" style={{ marginLeft: 4 }} />
                          </Button>
                        );
                      },
                    },
                    ...(cuxBtnsList || []),
                  ]}
                />
              )}
            </div>
          );
        }
      case 'four':
        return (
          <>
            {customizeBtnGroup(
              {
                code: `SINV.RECEIPT_WORKBENCH_THING.BUTTON.RETURN_${nodeConfigIndexAbc}`,
                pro: true,
              },
              <DynamicButtons
                buttons={[
                  {
                    name: 'executionRecord',
                    btnType: 'c7n-pro',
                    child: intl
                      .get('sinv.receiptWorkbench.view.button.executionRecord')
                      .d('异步执行记录'),
                    btnProps: {
                      btnType: 'c7n-pro',
                      funcType: 'flat',
                      icon: 'operation_service_request',
                      onClick: handleToDetail,
                    },
                  },
                  {
                    name: 'export',
                    btnComp: ExcelExport,
                    btnProps: {
                      method: 'POST',
                      queryParams: isEmpty(dataSet?.selected) ? getQueryParams : { rcvTrxLineIds },
                      requestUrl: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/trx/can-reverse/line/export`,
                      buttonText: isEmpty(dataSet?.selected)
                        ? intl.get(`sinv.receiptWorkbench.view.button.Export`).d('导出')
                        : intl.get(`sinv.receiptWorkbench.view.button.checkExport`).d('勾选导出'),
                      otherButtonProps: {
                        icon: 'unarchive',
                        type: 'c7n-pro',
                        funcType: 'flat',
                      },
                    },
                  },
                  {
                    name: 'newExport',
                    btnComp: ExcelExportPro,
                    btnProps: {
                      allBody: true,
                      method: 'POST',
                      templateCode: 'SPUC_SINV_WORKBENCH_REVERSE_EXPORT',
                      queryParams: isEmpty(dataSet?.selected) ? getQueryParams : { rcvTrxLineIds },
                      requestUrl: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/trx/can-reverse/line/export/new`,
                      buttonText: isEmpty(dataSet?.selected)
                        ? intl.get(`sinv.receiptWorkbench.view.button.newExport`).d('新版导出')
                        : intl
                            .get(`sinv.receiptWorkbench.view.button.newCheckExport`)
                            .d('新版勾选导出'),
                      otherButtonProps: {
                        icon: 'unarchive',
                        type: 'c7n-pro',
                        funcType: 'flat',
                        permissionList: [
                          {
                            code: 'srm.logistics.receive.workbench.ps.button.back.newexport',
                            type: 'c7n-pro',
                          },
                        ],
                      },
                    },
                  },
                  {
                    name: 'return',
                    group: true,
                    child: (name) => {
                      return (
                        (
                          <Button
                            style={{ border: 'none', color: '#FFF' }}
                            loading={sendBackLoading}
                            color="primary"
                            icon="reply"
                            type="c7n-pro"
                          >
                            {name ||
                              intl.get('sinv.receiptWorkbench.model.receipt.sendBack').d('退货')}
                            <Icon type="expand_more" style={{ marginLeft: 4 }} />
                          </Button>
                        ) || <span style={{ display: 'none' }} />
                      );
                    },
                    children: [
                      {
                        name: 'selectReturn',
                        child: intl
                          .get('sinv.receiptWorkbench.model.receipt.selectSendBack')
                          .d('勾选退货'),
                        btnProps: {
                          disabled: isEmpty(dataSet?.selected),
                          onClick: () => sendBackShowModalChange('select'),
                        },
                      },
                      {
                        name: 'allReturn',
                        child: intl
                          .get('sinv.receiptWorkbench.model.receipt.allSendBack')
                          .d('全选退货'),
                        btnProps: {
                          onClick: () => sendBackShowModalChange('all'),
                        },
                      },
                    ],
                  },
                ].reverse()}
                // 解决按钮颜色问题
              />
            )}
          </>
        );
      case 'five':
        // 按单
        if (!courseAsLine) {
          return (
            <>
              {customizeBtnGroup(
                {
                  code: `SINV.RECEIPT_WORKBENCH_THING.BUTTON.CONFIRM_${nodeConfigIndexAbc}`,
                  pro: true,
                },
                <DynamicButtons
                  buttons={[
                    {
                      name: 'newExport',
                      btnComp: ExcelExportPro,
                      btnProps: {
                        allBody: true,
                        method: 'POST',
                        templateCode: 'SPUC_SINV_WORKBENCH_CONFIRM_EXPORT',
                        queryParams: isEmpty(dataSet?.selected)
                          ? getQueryParams
                          : { rcvTrxHeaderIds },
                        requestUrl: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/trx/confirm/export/new`,
                        buttonText: isEmpty(dataSet?.selected)
                          ? intl.get(`sinv.receiptWorkbench.view.button.newExport`).d('新版导出')
                          : intl
                              .get(`sinv.receiptWorkbench.view.button.newCheckExport`)
                              .d('新版勾选导出'),
                        otherButtonProps: {
                          icon: 'unarchive',
                          type: 'c7n-pro',
                          funcType: 'flat',
                        },
                      },
                    },
                    {
                      name: 'newPrint',
                      child: (name) =>
                        name || intl.get(`sinv.common.view.message.button.newPrints`).d('打印(新)'),
                      btnComp: PrintProButton,
                      btnProps: {
                        buttonProps: {
                          disabled: isEmpty(dataSet?.selected),
                          funcType: 'flat',
                          permissionList: [
                            {
                              code: `srm.logistics.receive.workbench.button.newPrint`,
                              type: 'button',
                              meaning: '收货工作台-列表-新打印',
                            },
                          ],
                        },
                        requestUrl: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/batch-print-rcv-token`,
                        method: 'POST',
                        data: dataSet?.selected.map((item) => item.get('rcvTrxHeaderId')),
                        buttonText: intl
                          .get(`sinv.common.view.message.button.newPrints`)
                          .d('打印(新)'),
                      },
                    },
                    {
                      name: 'print',
                      child: intl.get(`sinv.common.view.message.button.print`).d('打印'),
                      btnComp: PermissionButton,
                      btnProps: {
                        funcType: 'flat',
                        icon: 'print',
                        type: 'c7n-pro',
                        loading: subAndDeleteLoading,
                        disabled: isEmpty(dataSet?.selected),
                        onClick: () => handlePrint(dataSet.selected),
                        permissionList: [
                          {
                            code: `srm.logistics.receive.workbench.button.print`,
                            type: 'button',
                          },
                        ],
                      },
                    },
                    {
                      name: 'refuse',
                      btnType: 'c7n-pro',
                      child: intl.get('hzero.common.model.refuse').d('拒绝'),
                      btnProps: {
                        btnType: 'c7n-pro',
                        funcType: 'flat',
                        icon: 'close',
                        loading: subAndDeleteLoading,
                        disabled: isEmpty(dataSet?.selected),
                        onClick: () => handleAffirm('30_SUP_REJECTED'),
                      },
                    },
                    {
                      name: 'affirm',
                      btnType: 'c7n-pro',
                      child: intl.get('hzero.common.model.affirm').d('确认'),
                      btnProps: {
                        btnType: 'c7n-pro',
                        color: 'primary',
                        icon: 'done',
                        loading: subAndDeleteLoading,
                        disabled: isEmpty(dataSet?.selected),
                        onClick: () => handleAffirm('40_FINISHED'),
                      },
                    },
                  ].reverse()}
                />
              )}
            </>
          );
        } else {
          return (
            <div className={style['thing-receipts-btn']}>
              {customizeBtnGroup(
                {
                  code: `SINV.RECEIPT_WORKBENCH_THING.BUTTON.CONFIRM.ASN.${nodeConfigIndexAbc}`,
                  pro: true,
                },
                <DynamicButtons
                  buttons={[
                    {
                      name: 'newExport',
                      btnComp: ExcelExportPro,
                      btnProps: {
                        allBody: true,
                        method: 'POST',
                        templateCode: 'SPUC_SINV_WORKBENCH_CONFIRM_DETAIL_EXPORT',
                        queryParams: isEmpty(dataSet?.selected)
                          ? getQueryParams
                          : { rcvTrxLineIds },
                        requestUrl: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/trx/confirm-sinv/line/export/new`,
                        buttonText: isEmpty(dataSet?.selected)
                          ? intl.get(`sinv.receiptWorkbench.view.button.newExport`).d('新版导出')
                          : intl
                              .get(`sinv.receiptWorkbench.view.button.newCheckExport`)
                              .d('新版勾选导出'),
                        otherButtonProps: {
                          icon: 'unarchive',
                          type: 'c7n-pro',
                          funcType: 'flat',
                        },
                      },
                    },
                  ]}
                />
              )}
            </div>
          );
        }
      default:
    }
  }, [
    viewType,
    tabCutPage,
    courseAsLine,
    nodeConfigIndexAbc,
    rcvTrxHeaderIds,
    rcvTrxLineIds,
    disBtn,
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
)(BtnComps);

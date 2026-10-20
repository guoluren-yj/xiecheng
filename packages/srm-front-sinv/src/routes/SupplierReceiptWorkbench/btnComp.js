// 按钮组的重新封装
import React, { useCallback } from 'react';
import intl from 'utils/intl';
import { Button, Icon } from 'choerodon-ui/pro';
import { SRM_SPUC } from '_utils/config';
import { compose, isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import formatterCollections from 'utils/intl/formatterCollections';
import DynamicButtons from '_components/DynamicButtons';
// import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import PrintProButton from 'srm-front-boot/lib/components/PrintProButton';
import { Button as PermissionButton } from 'components/Permission';
// import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
// import { getCustomizeBtnCode } from './util';
import style from './index.less';

const organizationId = getCurrentOrganizationId();

const BtnComps = observer((props) => {
  const {
    _btnObjs,
    dataSet,
    // queryUnitConfig,
    // customizeBtnGroup,
  } = props;
  const {
    visible,
    viewType,
    tabCutPage,
    courseAsLine,
    ceationLoading,
    sendBackLoading,
    subAndDeleteLoading,
    nodeConfigIndexAbc,
    creationButton,
    handleToDetail,
    // handleTransfer,
    handlePrint,
    subAndDelChange,
    // handleCancel,
    // handleToOperation,
    sendBackShowModalChange,
    handleAffirm,
    // handleState,
    // queryUnitConfig,
    customizeBtnGroup,
  } = _btnObjs;

  // useMemo(() => {
  //   const custCode = getCustomizeBtnCode(tabCutPage);
  //   queryUnitConfig(undefined, null, custCode);
  // }, [tabCutPage, viewType, courseAsLine, nodeConfigIndexAbc]);
  const queryData = dataSet?.queryDataSet?.toData()[0];
  const queryParams = filterNullValueObject({
    ...dataSet?.queryParameter.params,
    ...queryData,
  });

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
    rcvTrxLineIds.push(item.get('rcvTrxLineId'));
    rcvTrxHeaderIds.push(item.get('rcvTrxHeaderId'));
    if (!disBtn && item.get('rcvStatusCode') === '20_SUBMITTED') {
      disBtn = true;
    }
  });

  const getBtns = useCallback(() => {
    // 按钮组
    switch (tabCutPage) {
      case 'one':
        return (
          <>
            {customizeBtnGroup(
              { code: `SINV.RECEIPT_WORKBENCH_THING.BUTTON.WAIT_${nodeConfigIndexAbc}`, pro: true },
              <DynamicButtons
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
                      queryParams: isEmpty(dataSet?.selected) ? queryParams : { rcvTrxLineIds },
                      requestUrl: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/supplier/trx/waiting/export/new`,
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
                              'srm.logistics.receive.supplier-receipt-workbench.ps.srm.logistics.receive.supplier-receipt-workbench.ps.button.wait.newexport',
                            type: 'c7n-pro',
                          },
                        ],
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
                ]}
              />
            )}
          </>
        );
      case 'two':
        if (!courseAsLine) {
          return (
            <>
              {customizeBtnGroup(
                { code: `SINV.RECEIPT_WORKBENCH_THING.BUTTON.COURSE_${nodeConfigIndexAbc}` },
                [
                  <Button
                    data-name="executionRecord"
                    icon="operation_service_request"
                    type="c7n-pro"
                    funcType="flat"
                    onClick={() => handleToDetail(tabCutPage)}
                    style={{ border: 'none' }}
                  >
                    {intl
                      .get('sinv.receiptWorkbench.view.button.executionRecord')
                      .d('异步执行记录')}
                  </Button>,
                  isEmpty(dataSet?.selected) && (
                    <ExcelExportPro
                      allBody
                      method="POST"
                      otherButtonProps={{
                        icon: 'unarchive',
                        type: 'c7n-pro',
                        funcType: 'flat',
                        permissionList: [
                          {
                            code:
                              'srm.logistics.receive.supplier-receipt-workbench.ps.doing.line.newexport',
                            type: 'c7n-pro',
                          },
                        ],
                      }}
                      data-name="newExport"
                      style={{ border: 'none' }}
                      requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/supplier/trx/doing/export/new`}
                      queryParams={queryParams}
                      templateCode="SPUC_SINV_SUPPLIER_WORKBENCH_DOING_EXPORT"
                      buttonText={intl
                        .get(`sinv.receiptWorkbench.view.button.newExport`)
                        .d('新版导出')}
                    />
                  ),
                  !isEmpty(dataSet?.selected) && (
                    <ExcelExportPro
                      allBody
                      method="POST"
                      otherButtonProps={{
                        icon: 'unarchive',
                        type: 'c7n-pro',
                        funcType: 'flat',
                        permissionList: [
                          {
                            code:
                              'srm.logistics.receive.supplier-receipt-workbench.ps.doing.line.newexport',
                            type: 'c7n-pro',
                          },
                        ],
                      }}
                      data-name="newExport"
                      buttonText={intl
                        .get(`sinv.receiptWorkbench.view.button.newCheckExport`)
                        .d('新版勾选导出')}
                      style={{ border: 'none' }}
                      requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/supplier/trx/doing/export/new`}
                      queryParams={{ rcvTrxHeaderIds }}
                      templateCode="SPUC_SINV_SUPPLIER_WORKBENCH_DOING_EXPORT"
                    />
                  ),
                  <Button
                    data-name="delete"
                    icon="delete"
                    type="c7n-pro"
                    funcType="flat"
                    loading={subAndDeleteLoading}
                    disabled={isEmpty(dataSet?.selected) || disBtn}
                    onClick={() => subAndDelChange('50_DELETED')}
                    style={{ border: 'none' }}
                  >
                    {intl.get('hzero.common.model.delete').d('删除')}
                  </Button>,
                  <PermissionButton
                    data-name="print"
                    type="c7n-pro"
                    icon="print"
                    funcType="flat"
                    onClick={() => handlePrint(dataSet.selected)}
                    disabled={isEmpty(dataSet?.selected)}
                    style={{ border: 'none' }}
                    permissionList={[
                      {
                        code: `srm.logistics.receive.supplier-receipt-workbench.button.print`,
                        type: 'button',
                      },
                    ]}
                    loading={subAndDeleteLoading}
                  >
                    {intl.get(`sinv.common.view.message.button.print`).d('打印')}
                  </PermissionButton>,
                  <PrintProButton
                    data-name="newPrint"
                    buttonProps={{
                      icon: 'print',
                      type: 'c7n-pro',
                      funcType: 'flat',
                      disabled: isEmpty(dataSet?.selected),
                      // 权限集配置，可不传
                      permissionList: [
                        {
                          code: `srm.logistics.receive.supplier-receipt-workbench.button.newPrint`,
                          type: 'button',
                          meaning: '收货工作台-列表-新打印',
                        },
                      ],
                    }}
                    method="POST"
                    requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/batch-print-rcv-token`}
                    data={dataSet?.selected.map((item) => item.get('rcvTrxHeaderId'))}
                    buttonText={intl.get(`sinv.common.view.message.button.newPrint`).d('打印(新)')}
                  >
                    {intl.get(`sinv.common.view.message.button.newPrints`).d('打印(新)')}
                  </PrintProButton>,
                  <Button
                    data-name="submit"
                    icon="check"
                    color="primary"
                    style={{ color: '#FFF' }}
                    onClick={() => subAndDelChange('40_FINISHED')}
                    disabled={isEmpty(dataSet?.selected) || disBtn}
                    loading={subAndDeleteLoading}
                  >
                    {intl.get('hzero.common.model.submit').d('提交')}
                  </Button>,
                ].reverse()
              )}
            </>
          );
        } else {
          return (
            <div className={style['thing-receipts-btn']}>
              {customizeBtnGroup(
                { code: `SINV.RECEIPT_WORKBENCH_THING.BUTTON.COURSE.ASN_${nodeConfigIndexAbc}` },
                [
                  isEmpty(dataSet?.selected) && (
                    <ExcelExportPro
                      allBody
                      method="POST"
                      data-name="newExport"
                      style={{ border: 'none' }}
                      requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/supplier/trx/doing-sinv/line/export/new`}
                      queryParams={queryParams}
                      otherButtonProps={{
                        type: 'c7n-pro',
                        icon: 'unarchive',
                        funcType: 'flat',
                        permissionList: [
                          {
                            code:
                              'srm.logistics.receive.supplier-receipt-workbench.ps.button.doing.newexport',
                            type: 'c7n-pro',
                          },
                        ],
                      }}
                      buttonText={intl
                        .get(`sinv.receiptWorkbench.view.button.newExport`)
                        .d('新版导出')}
                      templateCode="SPUC_SINV_SUPPLIER_WORKBENCH_DOING_DETAIL_EXPORT"
                    />
                  ),
                  !isEmpty(dataSet?.selected) && (
                    <ExcelExportPro
                      allBody
                      method="POST"
                      otherButtonProps={{
                        icon: 'unarchive',
                        type: 'c7n-pro',
                        funcType: 'flat',
                        permissionList: [
                          {
                            code:
                              'srm.logistics.receive.supplier-receipt-workbench.ps.button.doing.newexport',
                            type: 'c7n-pro',
                          },
                        ],
                      }}
                      data-name="newExport"
                      buttonText={intl
                        .get(`sinv.receiptWorkbench.view.button.newCheckExport`)
                        .d('新版勾选导出')}
                      style={{ border: 'none' }}
                      requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/supplier/trx/doing-sinv/line/export/new`}
                      queryParams={{ rcvTrxLineIds }}
                      templateCode="SPUC_SINV_SUPPLIER_WORKBENCH_DOING_DETAIL_EXPORT"
                    />
                  ),
                ]
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
                { code: `SINV.RECEIPT_WORKBENCH_THING.BUTTON.END.DAN_${nodeConfigIndexAbc}` },
                [
                  <PrintProButton
                    data-name="newPrint"
                    buttonProps={{
                      icon: 'print',
                      type: 'c7n-pro',
                      funcType: 'flat',
                      disabled: isEmpty(dataSet?.selected),
                      // 权限集配置，可不传
                      permissionList: [
                        {
                          code: `srm.logistics.receive.supplier-receipt-workbench.button.newPrint`,
                          type: 'button',
                          meaning: '收货工作台-列表-新打印',
                        },
                      ],
                    }}
                    method="POST"
                    requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/batch-print-rcv-token`}
                    data={dataSet?.selected.map((item) => item.get('rcvTrxHeaderId'))}
                    buttonText={intl.get(`sinv.common.view.message.button.newPrint`).d('打印(新)')}
                  >
                    {intl.get(`sinv.common.view.message.button.newPrints`).d('打印(新)')}
                  </PrintProButton>,
                  <PermissionButton
                    data-name="print"
                    icon="print"
                    type="c7n-pro"
                    funcType="flat"
                    onClick={() => handlePrint(dataSet.selected)}
                    disabled={isEmpty(dataSet?.selected)}
                    style={{ border: 'none' }}
                    loading={subAndDeleteLoading}
                    permissionList={[
                      {
                        code: `srm.logistics.receive.supplier-receipt-workbench.button.print`,
                        type: 'button',
                      },
                    ]}
                  >
                    {intl.get(`sinv.common.view.message.button.print`).d('打印')}
                  </PermissionButton>,
                  !isEmpty(dataSet?.selected) && (
                    <ExcelExportPro
                      method="POST"
                      allBody
                      otherButtonProps={{
                        icon: 'unarchive',
                        type: 'c7n-pro',
                        funcType: 'flat',
                        permissionList: [
                          {
                            code:
                              'srm.logistics.receive.supplier-receipt-workbench.ps.ps.button.finish.newexport',
                            type: 'c7n-pro',
                          },
                        ],
                      }}
                      data-name="newExport"
                      buttonText={intl
                        .get(`sinv.receiptWorkbench.view.button.newCheckExport`)
                        .d('新版勾选导出')}
                      style={{ border: 'none' }}
                      requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/supplier/trx/finish/header/export/new`}
                      queryParams={{ rcvTrxHeaderIds }}
                      templateCode="SPUC_SINV_SUPPLIER_WORKBENCH_FINISH_EXPORT"
                    />
                  ),
                  isEmpty(dataSet?.selected) && (
                    <ExcelExportPro
                      method="POST"
                      allBody
                      otherButtonProps={{
                        icon: 'unarchive',
                        type: 'c7n-pro',
                        funcType: 'flat',
                        permissionList: [
                          {
                            code:
                              'srm.logistics.receive.supplier-receipt-workbench.ps.ps.button.finish.newexport',
                            type: 'c7n-pro',
                          },
                        ],
                      }}
                      data-name="newExport"
                      style={{ border: 'none' }}
                      queryParams={queryParams}
                      buttonText={intl
                        .get(`sinv.receiptWorkbench.view.button.newExport`)
                        .d('新版导出')}
                      requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/supplier/trx/finish/header/export/new`}
                      templateCode="SPUC_SINV_SUPPLIER_WORKBENCH_FINISH_EXPORT"
                    />
                  ),
                ]
              )}
            </div>
          );
        } else {
          return (
            <div className={style['thing-receipts-btn']}>
              {customizeBtnGroup(
                { code: `SINV.RECEIPT_WORKBENCH_THING.BUTTON.END.HAN_${nodeConfigIndexAbc}` },
                [
                  isEmpty(dataSet?.selected) && (
                    <ExcelExportPro
                      allBody
                      method="POST"
                      otherButtonProps={{
                        icon: 'unarchive',
                        type: 'c7n-pro',
                        funcType: 'flat',
                        permissionList: [
                          {
                            code:
                              'srm.logistics.receive.supplier-receipt-workbench.ps.finish.newexport',
                            type: 'c7n-pro',
                          },
                        ],
                      }}
                      data-name="newExport"
                      style={{ border: 'none' }}
                      requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/supplier/trx/finish/line/export/new`}
                      queryParams={queryParams}
                      buttonText={intl
                        .get(`sinv.receiptWorkbench.view.button.newExport`)
                        .d('新版导出')}
                      templateCode="SPUC_SINV_SUPPLIER_WORKBENCH_FINISH_DETAIL_EXPORT"
                    />
                  ),
                  !isEmpty(dataSet?.selected) && (
                    <ExcelExportPro
                      allBody
                      method="POST"
                      otherButtonProps={{
                        icon: 'unarchive',
                        type: 'c7n-pro',
                        funcType: 'flat',
                        permissionList: [
                          {
                            code:
                              'srm.logistics.receive.supplier-receipt-workbench.ps.finish.newexport',
                            type: 'c7n-pro',
                          },
                        ],
                      }}
                      data-name="newExport"
                      buttonText={intl
                        .get(`sinv.receiptWorkbench.view.button.newCheckExport`)
                        .d('新版勾选导出')}
                      style={{ border: 'none' }}
                      requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/supplier/trx/finish/line/export/new`}
                      queryParams={{ rcvTrxLineIds }}
                      templateCode="SPUC_SINV_SUPPLIER_WORKBENCH_FINISH_DETAIL_EXPORT"
                    />
                  ),
                ]
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
                      onClick: () => handleToDetail(tabCutPage),
                    },
                  },
                  {
                    name: 'newExport',
                    btnComp: ExcelExportPro,
                    btnProps: {
                      allBody: true,
                      method: 'POST',
                      templateCode: 'SPUC_SINV_SUPPLIER_WORKBENCH_REVERSE_EXPORT',
                      queryParams: isEmpty(dataSet?.selected) ? queryParams : { rcvTrxLineIds },
                      requestUrl: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/supplier/trx/can-reverse/line/export/new`,
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
                              'srm.logistics.receive.supplier-receipt-workbench.ps.ps.button.back.newexport',
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
                { code: `SINV.RECEIPT_WORKBENCH_THING.BUTTON.CONFIRM_${nodeConfigIndexAbc}` },
                [
                  isEmpty(dataSet?.selected) && (
                    <ExcelExportPro
                      allBody
                      method="POST"
                      otherButtonProps={{
                        icon: 'unarchive',
                        type: 'c7n-pro',
                        funcType: 'flat',
                      }}
                      data-name="newExport"
                      style={{ border: 'none' }}
                      requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/supplier/trx/confirm/export/new`}
                      queryParams={getQueryParams}
                      templateCode="SPUC_SINV_WORKBENCH_CONFIRM_EXPORT"
                      buttonText={intl
                        .get(`sinv.receiptWorkbench.view.button.newExport`)
                        .d('新版导出')}
                    />
                  ),
                  !isEmpty(dataSet?.selected) && (
                    <ExcelExportPro
                      allBody
                      method="POST"
                      otherButtonProps={{
                        icon: 'unarchive',
                        type: 'c7n-pro',
                        funcType: 'flat',
                      }}
                      data-name="newExport"
                      buttonText={intl
                        .get(`sinv.receiptWorkbench.view.button.newCheckExport`)
                        .d('新版勾选导出')}
                      style={{ border: 'none' }}
                      requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/supplier/trx/confirm/export/new`}
                      queryParams={{ rcvTrxHeaderIds }}
                      templateCode="SPUC_SINV_WORKBENCH_CONFIRM_EXPORT"
                    />
                  ),
                  <PrintProButton
                    data-name="newPrint"
                    buttonProps={{
                      icon: 'print',
                      type: 'c7n-pro',
                      funcType: 'flat',
                      disabled: isEmpty(dataSet?.selected),
                      // 权限集配置，可不传
                      permissionList: [
                        {
                          code: `srm.logistics.receive.supplier-receipt-workbench.button.newPrint`,
                          type: 'button',
                          meaning: '收货工作台-列表-新打印',
                        },
                      ],
                    }}
                    method="POST"
                    requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/batch-print-rcv-token`}
                    data={dataSet?.selected.map((item) => item.get('rcvTrxHeaderId'))}
                    buttonText={intl.get(`sinv.common.view.message.button.newPrint`).d('打印(新)')}
                  >
                    {intl.get(`sinv.common.view.message.button.newPrints`).d('打印(新)')}
                  </PrintProButton>,

                  <PermissionButton
                    data-name="print"
                    type="c7n-pro"
                    icon="print"
                    funcType="flat"
                    onClick={() => handlePrint(dataSet.selected)}
                    disabled={isEmpty(dataSet?.selected)}
                    style={{ border: 'none' }}
                    loading={subAndDeleteLoading}
                    permissionList={[
                      {
                        code: `srm.logistics.receive.supplier-receipt-workbench.button.print`,
                        type: 'button',
                      },
                    ]}
                  >
                    {intl.get(`sinv.common.view.message.button.print`).d('打印')}
                  </PermissionButton>,

                  <Button
                    data-name="refuse"
                    icon="close"
                    type="c7n-pro"
                    funcType="flat"
                    loading={subAndDeleteLoading}
                    disabled={isEmpty(dataSet?.selected)}
                    onClick={() => handleAffirm('30_SUP_REJECTED')}
                    style={{ border: 'none' }}
                  >
                    {intl.get('hzero.common.button.refuse').d('拒绝')}
                  </Button>,
                  <Button
                    data-name="affirm"
                    icon="done"
                    color="primary"
                    onClick={() => handleAffirm('40_FINISHED')}
                    disabled={isEmpty(dataSet?.selected)}
                    loading={subAndDeleteLoading}
                  >
                    {intl.get('hzero.common.button.affirm').d('确认')}
                  </Button>,
                ].reverse()
              )}
            </>
          );
        } else {
          return (
            <div className={style['thing-receipts-btn']}>
              {customizeBtnGroup(
                { code: `SINV.RECEIPT_WORKBENCH_THING.BUTTON.CONFIRM.ASN.${nodeConfigIndexAbc}` },
                [
                  !isEmpty(dataSet?.selected) && (
                    <ExcelExportPro
                      allBody
                      method="POST"
                      otherButtonProps={{
                        icon: 'unarchive',
                        type: 'c7n-pro',
                        funcType: 'flat',
                      }}
                      data-name="newExport"
                      buttonText={intl
                        .get(`sinv.receiptWorkbench.view.button.newCheckExport`)
                        .d('新版勾选导出')}
                      style={{ border: 'none' }}
                      requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/supplier/trx/confirm-sinv/line/export/new`}
                      queryParams={{ rcvTrxLineIds }}
                      templateCode="SPUC_SINV_WORKBENCH_CONFIRM_DETAIL_EXPORT"
                    />
                  ),
                  isEmpty(dataSet?.selected) && (
                    <ExcelExportPro
                      allBody
                      method="POST"
                      otherButtonProps={{
                        icon: 'unarchive',
                        type: 'c7n-pro',
                        funcType: 'flat',
                      }}
                      data-name="newExport"
                      style={{ border: 'none' }}
                      requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/supplier/trx/confirm-sinv/line/export/new`}
                      queryParams={getQueryParams}
                      buttonText={intl
                        .get(`sinv.receiptWorkbench.view.button.newExport`)
                        .d('新版导出')}
                      templateCode="SPUC_SINV_WORKBENCH_CONFIRM_DETAIL_EXPORT"
                    />
                  ),
                ]
              )}
            </div>
          );
        }
      default:
        break;
    }
  }, [
    viewType,
    tabCutPage,
    courseAsLine,
    nodeConfigIndexAbc,
    visible,
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

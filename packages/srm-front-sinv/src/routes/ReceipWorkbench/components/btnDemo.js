// 按钮组的重新封装
import React, { useCallback, useMemo } from 'react';
import intl from 'utils/intl';
import { Menu } from 'choerodon-ui';
import { Button, Icon, Tooltip, Dropdown } from 'choerodon-ui/pro';
import { SRM_SPUC } from '_utils/config';
import { compose, isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import formatterCollections from 'utils/intl/formatterCollections';
import DynamicButtons from '_components/DynamicButtons';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import PrintProButton from 'srm-front-boot/lib/components/PrintProButton';
import { Button as PermissionButton } from 'components/Permission';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { getCustomizeBtnCode, nodeType } from '../util';

const organizationId = getCurrentOrganizationId();

const BtnComps = observer((props) => {
  const { _btnObjs, dataSet, customizeBtnGroup } = props;
  const {
    viewType,
    tabCutPage,
    courseAsLine,
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
    sendBackShowModal,
    handleAffirm,
  } = _btnObjs;
  useMemo(() => {
    const custCode = getCustomizeBtnCode(tabCutPage);
    props.queryUnitConfig(undefined, null, custCode);
  }, [tabCutPage, viewType, courseAsLine, nodeConfigIndexAbc]);

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
  const buttonSynchronous = () => (
    <Menu>
      <Menu.Item key="settlement">
        <a
          disabled={isEmpty(dataSet?.selected)}
          onClick={() => this.synchronousButton('settlement', dataSet?.selected)}
        >
          {intl.get('sinv.receiptWorkbench.view.button.settlement').d('结算')}
        </a>
      </Menu.Item>
      <Menu.Item key="externalSystem">
        <a
          disabled={isEmpty(dataSet?.selected)}
          onClick={() => this.synchronousButton('externalSystem', dataSet?.selected)}
        >
          {intl.get('sinv.receiptWorkbench.view.button.externalSystem').d('外部系统')}
        </a>
      </Menu.Item>
    </Menu>
  );

  const getBtns = useCallback(() => {
    // 按钮组
    const btns = [
      // 待收货
      {
        name: 'create',
        group: true,
        hidden: !['one'].includes(tabCutPage),
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
        hidden: !['one'].includes(tabCutPage),
        btnComp: ExcelExportPro,
        btnProps: {
          allBody: true,
          method: 'POST',
          templateCode: 'SPUC_SINV_WORKBENCH_WAITING_EXPORT',
          queryParams: isEmpty(dataSet?.selected) ? getQueryParams : { rcvTrxLineIds },
          requestUrl: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/trx/waiting/export/new`,
          buttonText: isEmpty(dataSet?.selected)
            ? intl.get(`sinv.receiptWorkbench.view.button.newExport`).d('新版导出')
            : intl.get(`sinv.receiptWorkbench.view.button.newCheckExport`).d('新版勾选导出'),
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
        hidden: !['one'].includes(tabCutPage),
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
        hidden: !['one'].includes(tabCutPage),
        child: intl.get('sinv.receiptWorkbench.view.button.executionRecord').d('异步执行记录'),
        btnProps: {
          btnType: 'c7n-pro',
          funcType: 'flat',
          icon: 'operation_service_request',
          onClick: handleToDetail,
        },
      },
      {
        name: 'transfer',
        hidden: !['one'].includes(tabCutPage),
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
      // 执行中
      {
        name: 'submit',
        btnType: 'c7n-pro',
        child: intl.get('hzero.common.model.submit').d('提交'),
        hidden: !['two'].includes(tabCutPage) ? true : courseAsLine, // 按单
        btnProps: {
          color: 'primary',
          icon: 'done',
          disabled: isEmpty(dataSet?.selected) || disBtn,
          loading: subAndDeleteLoading,
          onClick: () => subAndDelChange('40_FINISHED'),
        },
      },
      {
        name: 'print',
        child: (name) => name || intl.get(`sinv.common.view.message.button.print`).d('打印'),
        btnComp: PermissionButton,
        hidden: !['two'].includes(tabCutPage) ? true : courseAsLine, // 按单
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
        name: 'newPrint',
        child: (name) =>
          name || intl.get(`sinv.common.view.message.button.newPrints`).d('打印(新)'),
        btnComp: PrintProButton,
        hidden: !['two'].includes(tabCutPage) ? true : courseAsLine, // 按单
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
          buttonText: intl.get(`sinv.common.view.message.button.newPrints`).d('打印(新)'),
        },
      },
      {
        name: 'delete',
        btnType: 'c7n-pro',
        child: (name) => name || intl.get('hzero.common.model.delete').d('删除'),
        hidden: !['two'].includes(tabCutPage) ? true : courseAsLine, // 按单
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
        name: 'newExport',
        hidden: !['two'].includes(tabCutPage) ? true : courseAsLine, // 按单
        btnComp: ExcelExportPro,
        btnProps: {
          allBody: true,
          method: 'POST',
          templateCode: 'SPUC_SINV_WORKBENCH_DOING_EXPORT',
          queryParams: isEmpty(dataSet?.selected) ? getQueryParams : { rcvTrxHeaderIds },
          requestUrl: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/trx/doing/export/new`,
          buttonText: isEmpty(dataSet?.selected)
            ? intl.get(`sinv.receiptWorkbench.view.button.newExport`).d('新版导出')
            : intl.get(`sinv.receiptWorkbench.view.button.newCheckExport`).d('新版勾选导出'),
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
        name: 'export',
        hidden: !['two'].includes(tabCutPage) ? true : courseAsLine, // 按单
        btnComp: ExcelExport,
        btnProps: {
          method: 'POST',
          queryParams: isEmpty(dataSet?.selected) ? getQueryParams : { rcvTrxHeaderIds },
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
        name: 'executionRecord',
        btnType: 'c7n-pro',
        child: (name) =>
          name || intl.get('sinv.receiptWorkbench.view.button.executionRecord').d('异步执行记录'),
        hidden: !['two'].includes(tabCutPage) ? true : courseAsLine, // 按单
        btnProps: {
          btnType: 'c7n-pro',
          funcType: 'flat',
          icon: 'operation_service_request',
          onClick: handleToDetail,
        },
      },
      {
        name: 'revoke',
        btnType: 'c7n-pro',
        child: (name) => name || intl.get('sinv.receiptWorkbench.view.button.Revoke').d('撤销审批'),
        hidden: !['two'].includes(tabCutPage) ? true : courseAsLine, // 按单
        btnProps: {
          btnType: 'c7n-pro',
          funcType: 'flat',
          disabled: isEmpty(dataSet?.selected),
          loading: subAndDeleteLoading,
          // onClick: this.handleRevoke,
        },
      },
      // 执行中-按行
      {
        name: 'newExport',
        hidden: !['two'].includes(tabCutPage) ? true : !courseAsLine, // 按行
        btnComp: ExcelExportPro,
        btnProps: {
          allBody: true,
          method: 'POST',
          templateCode: 'SPUC_SINV_WORKBENCH_DOING_DETAIL_EXPORT',
          queryParams: isEmpty(dataSet?.selected) ? getQueryParams : { rcvTrxLineIds },
          requestUrl: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/trx/doing-sinv/line/export/new`,
          buttonText: isEmpty(dataSet?.selected)
            ? intl.get(`sinv.receiptWorkbench.view.button.newExport`).d('新版导出')
            : intl.get(`sinv.receiptWorkbench.view.button.newCheckExport`).d('新版勾选导出'),
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
      {
        name: 'export',
        hidden: !['two'].includes(tabCutPage) ? true : !courseAsLine, // 按行
        btnComp: ExcelExport,
        btnProps: {
          method: 'POST',
          queryParams: isEmpty(dataSet?.selected) ? getQueryParams : { rcvTrxLineIds },
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
      // 已完成-按单
      {
        name: 'cancel',
        btnType: 'c7n-pro',
        hidden: !['three'].includes(tabCutPage) ? true : viewType !== 'wide', // 按单
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
        hidden: !['three'].includes(tabCutPage) ? true : viewType !== 'wide', // 按单
        child: (name) => name || intl.get(`sinv.common.view.message.button.newPrint`).d('打印(新)'),
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
          buttonText: intl.get(`sinv.common.view.message.button.newPrints`).d('打印(新)'),
        },
      },
      {
        name: 'print',
        child: intl.get(`sinv.common.view.message.button.print`).d('打印'),
        btnComp: PermissionButton,
        hidden: !['three'].includes(tabCutPage) ? true : viewType !== 'wide', // 按单
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
        name: 'newExport',
        hidden: !['three'].includes(tabCutPage) ? true : viewType !== 'wide', // 按单
        btnComp: ExcelExportPro,
        btnProps: {
          allBody: true,
          method: 'POST',
          templateCode: 'SPUC_SINV_WORKBENCH_FINISH_EXPORT',
          queryParams: isEmpty(dataSet?.selected) ? getQueryParams : { rcvTrxHeaderIds },
          requestUrl: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/trx/finish/header/export/new`,
          buttonText: isEmpty(dataSet?.selected)
            ? intl.get(`sinv.receiptWorkbench.view.button.newExport`).d('新版导出')
            : intl.get(`sinv.receiptWorkbench.view.button.newCheckExport`).d('新版勾选导出'),
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
      {
        name: 'export',
        hidden: !['three'].includes(tabCutPage) ? true : viewType !== 'wide', // 按单
        btnComp: ExcelExport,
        btnProps: {
          method: 'POST',
          queryParams: isEmpty(dataSet?.selected) ? getQueryParams : { rcvTrxHeaderIds },
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
      //  已完成-按行
      {
        name: 'synchronous',
        group: true,
        hidden: !['three'].includes(tabCutPage) ? true : viewType === 'wide', // 按行
        child: (
          <Dropdown
            data-name="synchronous"
            overlay={!isEmpty(dataSet?.selected) && buttonSynchronous}
            disabled={isEmpty(dataSet?.selected)}
          >
            <Button
              disabled={isEmpty(dataSet?.selected)}
              type="c7n-pro"
              style={{ border: 'none' }}
              icon="cached"
              loading={asyncLoading}
            >
              {intl.get('sinv.receiptWorkbench.view.button.synchronous').d('重新同步')}{' '}
              <Icon type="expand_more" />
            </Button>
          </Dropdown>
        ),
      },
      {
        name: 'newExport',
        group: true,
        hidden: !['three'].includes(tabCutPage) ? true : viewType === 'wide', // 按行
        child: (
          <ExcelExportPro
            allBody
            method="POST"
            otherButtonProps={{
              icon: 'unarchive',
              type: 'c7n-pro',
              funcType: 'flat',
              permissionList: [
                {
                  code: 'srm.logistics.receive.workbench.ps.button.line.finish.newexport',
                  type: 'c7n-pro',
                },
              ],
            }}
            data-name="newExport"
            style={{ border: 'none' }}
            requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/trx/finish/line/export/new`}
            queryParams={isEmpty(dataSet?.selected) ? getQueryParams : { rcvTrxLineIds }}
            templateCode="SPUC_SINV_WORKBENCH_FINISH_DETAIL_EXPORT"
            buttonText={
              isEmpty(dataSet?.selected)
                ? intl.get(`sinv.receiptWorkbench.view.button.newExport`).d('新版导出')
                : intl.get(`sinv.receiptWorkbench.view.button.newCheckExport`).d('新版勾选导出')
            }
          />
        ),
      },
      {
        name: 'export',
        group: true,
        hidden: !['three'].includes(tabCutPage) ? true : viewType === 'wide', // 按行
        child: (
          <ExcelExport
            method="POST"
            data-name="export"
            style={{ border: 'none' }}
            requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/trx/finish/line/export`}
            queryParams={isEmpty(dataSet?.selected) ? getQueryParams : { rcvTrxLineIds }}
            buttonText={
              isEmpty(dataSet?.selected)
                ? intl.get(`sinv.receiptWorkbench.view.button.Export`).d('导出')
                : intl.get(`sinv.receiptWorkbench.view.button.checkExport`).d('勾选导出')
            }
            otherButtonProps={{
              type: 'c7n-pro',
              icon: 'unarchive',
              funcType: 'flat',
            }}
          />
        ),
      },
      {
        name: 'cancel',
        btnType: 'c7n-pro',
        hidden: !['three'].includes(tabCutPage) ? true : viewType === 'wide', // 按行
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
        name: 'executionRecord',
        btnType: 'c7n-pro',
        hidden: !['three'].includes(tabCutPage) ? true : viewType === 'wide', // 按行
        child: intl.get('sinv.receiptWorkbench.view.button.executionRecord').d('异步执行记录'),
        btnProps: {
          btnType: 'c7n-pro',
          funcType: 'flat',
          icon: 'operation_service_request',
          onClick: handleToDetail,
          loading: asyncLoading,
        },
      },
      {
        name: 'abnormalRecord',
        btnType: 'c7n-pro',
        hidden: !['three'].includes(tabCutPage) ? true : viewType === 'wide', // 按行
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
      // 已退回
      {
        name: 'export',
        group: true,
        hidden: !['four'].includes(tabCutPage),
        child: (
          <ExcelExport
            method="POST"
            data-name="export"
            style={{ border: 'none' }}
            requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/trx/can-reverse/line/export`}
            queryParams={isEmpty(dataSet?.selected) ? getQueryParams : { rcvTrxLineIds }}
            buttonText={
              isEmpty(dataSet?.selected)
                ? intl.get(`sinv.receiptWorkbench.view.button.Export`).d('导出')
                : intl.get(`sinv.receiptWorkbench.view.button.checkExport`).d('勾选导出')
            }
            otherButtonProps={{
              type: 'c7n-pro',
              icon: 'unarchive',
              funcType: 'flat',
            }}
          />
        ),
      },
      {
        name: 'newExport',
        group: true,
        hidden: !['four'].includes(tabCutPage),
        child: (
          <ExcelExportPro
            allBody
            method="POST"
            otherButtonProps={{
              icon: 'unarchive',
              type: 'c7n-pro',
              funcType: 'flat',
              permissionList: [
                {
                  code: 'srm.logistics.receive.workbench.ps.button.back.newexport',
                  type: 'c7n-pro',
                },
              ],
            }}
            data-name="newExport"
            style={{ border: 'none' }}
            requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/trx/can-reverse/line/export/new`}
            queryParams={isEmpty(dataSet?.selected) ? getQueryParams : { rcvTrxLineIds }}
            templateCode="SPUC_SINV_WORKBENCH_REVERSE_EXPORT"
            buttonText={
              isEmpty(dataSet?.selected)
                ? intl.get(`sinv.receiptWorkbench.view.button.newExport`).d('新版导出')
                : intl.get(`sinv.receiptWorkbench.view.button.newCheckExport`).d('新版勾选导出')
            }
          />
        ),
      },
      {
        name: 'return',
        hidden: !['four'].includes(tabCutPage),
        child: intl.get('sinv.receiptWorkbench.model.receipt.sendBack').d('退货'),
        btnType: 'c7n-pro',
        btnProps: {
          btnType: 'c7n-pro',
          color: 'primary',
          icon: 'reply',
          loading: sendBackLoading,
          disabled: isEmpty(dataSet?.selected),
          onClick: sendBackShowModal,
        },
      },
      // 待确认-按单
      {
        name: 'affirm',
        btnType: 'c7n-pro',
        hidden: !['five'].includes(tabCutPage) ? true : courseAsLine, // 按单
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
      {
        name: 'refuse',
        btnType: 'c7n-pro',
        hidden: !['five'].includes(tabCutPage) ? true : courseAsLine, // 按单
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
        name: 'print',
        hidden: !['five'].includes(tabCutPage) ? true : courseAsLine, // 按单
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
        name: 'newPrint',
        hidden: !['five'].includes(tabCutPage) ? true : courseAsLine, // 按单
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
          buttonText: intl.get(`sinv.common.view.message.button.newPrints`).d('打印(新)'),
        },
      },
      {
        name: 'newExport',
        group: true,
        hidden: !['five'].includes(tabCutPage) ? true : courseAsLine, // 按单
        child: (
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
            requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/trx/confirm/export/new`}
            queryParams={isEmpty(dataSet?.selected) ? getQueryParams : { rcvTrxHeaderIds }}
            templateCode="SPUC_SINV_WORKBENCH_CONFIRM_EXPORT"
            buttonText={
              isEmpty(dataSet?.selected)
                ? intl.get(`sinv.receiptWorkbench.view.button.newExport`).d('新版导出')
                : intl.get(`sinv.receiptWorkbench.view.button.newCheckExport`).d('新版勾选导出')
            }
          />
        ),
      },
      // 待确认-按行
      {
        name: 'newExport',
        group: true,
        hidden: !['five'].includes(tabCutPage) ? true : !courseAsLine, // 按行
        child: (
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
            requestUrl={`${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/trx/confirm-sinv/line/export/new`}
            queryParams={isEmpty(dataSet?.selected) ? getQueryParams : { rcvTrxLineIds }}
            templateCode="SPUC_SINV_WORKBENCH_CONFIRM_DETAIL_EXPORT"
            buttonText={
              isEmpty(dataSet?.selected)
                ? intl.get(`sinv.receiptWorkbench.view.button.newExport`).d('新版导出')
                : intl.get(`sinv.receiptWorkbench.view.button.newCheckExport`).d('新版勾选导出')
            }
          />
        ),
      },
    ];
    return btns.filter((i) => !i.hidden);
  }, [viewType, tabCutPage, courseAsLine]);

  return (
    <>
      {customizeBtnGroup(
        {
          code: nodeType(tabCutPage, viewType, courseAsLine, nodeConfigIndexAbc),
          pro: true,
        },
        <DynamicButtons buttons={getBtns()} />
      )}
    </>
  );
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
)(WithCustomize({ manualQuery: true })(BtnComps));

import React, { useCallback } from 'react';
import intl from 'utils/intl';
import DocFlow from '_components/DocFlow';
import { observer } from 'mobx-react-lite';
import { Tag } from 'choerodon-ui';
import { yesOrNoRender } from 'utils/renderer';
import { isNil, isEmpty, isFunction } from 'lodash';
import { FlexLink } from 'srm-front-cuz/components';
import ImageList from '@/routes/components/ImageList';
import { Icon } from 'choerodon-ui/pro';
import DynamicButtons from '_components/DynamicButtons';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';

import { showBigNumber } from '@/routes/components/utils';
import C7nPrecisionInputNumber from '@/components/Precision/C7nPrecisionInputNumber';
import { TooltipButton } from '../util';

const LineTable = observer(({ props }) => {
  const {
    from,
    formDs,
    tableDs,
    attachmentDs,
    custLoading,
    rcvStatusCode,
    customizeTable,
    cuxHandleLineBtns,
    doubleUnitEnabled,
    nodeConfigIndexAbc,
    renderCreateLineColumns,
    splitLine = (e) => e,
    lineDelete = (e) => e,
    operaClick = (e) => e,
    onOpenLinkChange = (e) => e,
    handleBatchMaintenance = (e) => e,
    onCustomSpecsJsonChange = (e) => e,
  } = props;
  const opreateFlag =
    rcvStatusCode === '10_NEW' ||
    rcvStatusCode === '30_REJECTED' ||
    rcvStatusCode === '30_SUP_REJECTED';
  const lineColumns = useCallback(() => {
    const columns = [
      {
        name: 'importStatusMeaning',
        width: 160,
        renderer: ({ record, value }) => {
          let dom = null;
          const importStatus = record.get('importStatus');
          if (importStatus === 'SUCCESS') {
            dom = (
              <Tag onClick={() => operaClick(record)} color="green" style={{ border: 'none' }}>
                {value}
                <Icon
                  type="wysiwyg"
                  style={{ fontSize: '14px', margin: '0 0 2px 3px', fontWeight: 'normal' }}
                />
              </Tag>
            );
          } else if (importStatus === 'FAIL') {
            dom = (
              <Tag onClick={() => operaClick(record)} color="red" style={{ border: 'none' }}>
                {value}
                <Icon
                  type="wysiwyg"
                  style={{ fontSize: '14px', margin: '0 0 2px 3px', fontWeight: 'normal' }}
                />
              </Tag>
            );
          } else if (importStatus === 'IMPORTING') {
            dom = (
              <Tag onClick={() => operaClick(record)} color="yellow" style={{ border: 'none' }}>
                {value}
                <Icon
                  type="wysiwyg"
                  style={{ fontSize: '14px', margin: '0 0 2px 3px', fontWeight: 'normal' }}
                />
              </Tag>
            );
          } else {
            dom = '-';
          }
          return dom;
        },
      },
      {
        name: 'action',
        width: 160,
        renderer: ({ record }) => {
          return (
            <a onClick={() => splitLine(record)} disabled={from === 'five'}>
              {intl.get(`sinv.deliveryCreation.view.button.split`).d('拆分')}
            </a>
          );
        },
      },
      {
        name: 'itemCode',
        width: 160,
        sortable: true,
      },
      {
        name: 'itemName',
        width: 160,
      },
      doubleUnitEnabled && {
        name: 'secondaryUomId',
        width: 180,
        editor: (record) =>
          record.get('itemId') &&
          record.get('firstNodeFlag') === 1 &&
          doubleUnitEnabled === 2 &&
          record.get('upStreamSuFlag') === 0, // 当前节点是第一个事务节点、上游模块（订单、协议）未开启双单位、物流开启双单位的情况下，该字段可编辑
        renderer: ({ record }) => record.get('secondaryUomName'),
        header: intl.get('sinv.receiptExecution.model.receipt.secondaryUomName').d('单位'),
      },
      {
        name: 'uomName',
        width: 150,
        header: doubleUnitEnabled
          ? intl.get('sinv.receiptExecution.model.receipt.uomBaseName').d('基本单位')
          : intl.get('sinv.receiptExecution.model.receipt.uomName').d('单位'),
      },
      doubleUnitEnabled && {
        name: 'secondaryQuantity',
        width: 120,
        editor: (record) =>
          !['20_SUBMITTED', '40_FINISHED'].includes(record?.get('lineRcvStatusCode')) &&
          record.get('subjectType') === 'QUANTITY' && (
            <C7nPrecisionInputNumber
              name="secondaryQuantity"
              record={record}
              precision={
                !isNil(record.get('secondaryUomPrecision'))
                  ? record.get('secondaryUomPrecision')
                  : 6
              }
            />
          ),
        renderer: ({ value }) => showBigNumber(value),
      },
      doubleUnitEnabled &&
        !['40_FINISHED'].includes(rcvStatusCode) && {
          name: 'secondaryLeftQuantity',
          width: 100,
          renderer: ({ value, record }) =>
            record.get('parentLimitlessReceiptFlag') === 1 &&
            record.get('subjectType') === 'QUANTITY' &&
            value === 0
              ? '-'
              : showBigNumber(value),
        },
      {
        name: 'quantity',
        width: 120,
        editor: (record) =>
          !['20_SUBMITTED', '40_FINISHED'].includes(record?.get('lineRcvStatusCode')) &&
          record.get('subjectType') === 'QUANTITY' && (
            <C7nPrecisionInputNumber
              name="quantity"
              record={record}
              precision={!isNil(record.get('uomPrecision')) ? record.get('uomPrecision') : 10}
            />
          ),
        renderer: ({ value }) => showBigNumber(value),
        header: doubleUnitEnabled
          ? intl.get('sinv.receiptExecution.model.receipt.exec.baseQuantity').d('执行基本数量')
          : intl.get('sinv.receiptExecution.model.receipt.exec.quantity').d('执行数量'),
      },
      !['40_FINISHED'].includes(rcvStatusCode) && {
        name: 'leftQuantity',
        width: 120,
        renderer: ({ value, record }) =>
          record.get('parentLimitlessReceiptFlag') === 1 &&
          record.get('subjectType') === 'QUANTITY' &&
          value === 0
            ? '-'
            : showBigNumber(value),
        header: doubleUnitEnabled
          ? intl.get('sinv.receiptExecution.model.receipt.baseLeftQuantity').d('可执行基本数量')
          : intl.get('sinv.receiptExecution.model.receipt.leftQuantity').d('可执行数量'),
      },
      {
        name: 'taxIncludedAmount',
        width: 130,
        editor: (record) =>
          !['20_SUBMITTED', '40_FINISHED'].includes(record?.get('lineRcvStatusCode')) &&
          record.get('subjectType') === 'AMOUNT',
        renderer: ({ value, record }) =>
          record.get('hidePriceFlag') === 1
            ? '***'
            : record.get('parentLimitlessReceiptFlag') === 1 &&
              record.get('subjectType') === 'QUANTITY' &&
              value === 0
            ? '-'
            : showBigNumber(value, record.get('financialPrecision')),
      },
      !['40_FINISHED'].includes(rcvStatusCode) && {
        name: 'leftTaxAmount',
        width: 120,
        renderer: ({ value, record }) =>
          record.get('hidePriceFlag') === 1
            ? '***'
            : record.get('parentLimitlessReceiptFlag') === 1 &&
              record.get('subjectType') === 'QUANTITY' &&
              value === 0
            ? '-'
            : showBigNumber(value, record.get('financialPrecision')),
      },
      {
        name: 'trxDate',
        width: 160,
        editor: (record) =>
          !['20_SUBMITTED', '40_FINISHED'].includes(record?.get('lineRcvStatusCode')),
        sortable: true,
      },
      {
        name: 'invOrganizationName',
        width: 150,
      },
      {
        name: 'inventoryId',
        width: 160,
        editor: (record) =>
          !['20_SUBMITTED', '40_FINISHED'].includes(record?.get('lineRcvStatusCode')),
      },
      {
        name: 'locatorId',
        width: 160,
        editor: (record) =>
          !['20_SUBMITTED', '40_FINISHED'].includes(record?.get('lineRcvStatusCode')),
      },
      {
        name: 'fromDisplayPoNum',
        width: 170,
        renderer: ({ value, record }) =>
          value && <span>{`${value}-${record.get('fromDisplayPoLineNum')}`}</span>,
        sortable: true,
      },
      {
        name: 'fromPcNum',
        width: 170,
        renderer: ({ value, record }) =>
          value && <span>{`${value}-${record.get('fromPcSubjectNum')}`}</span>,
        sortable: true,
      },
      {
        name: 'fromDisplayAsnNum',
        width: 170,
        renderer: ({ value, record }) =>
          value && <span>{`${value}-${record.get('fromDisplayAsnLineNum')}`}</span>,
        sortable: true,
      },
      {
        name: 'fromOrderTypeName',
        width: 135,
      },
      {
        name: 'fromDisplayTrxNum',
        width: 170,
        renderer: ({ value, record }) =>
          value && <span>{`${value}-${record.get('fromDisplayTrxLineNum')}`}</span>,
        sortable: true,
      },
      {
        name: 'productNum',
        width: 150,
        sortable: true,
      },
      {
        name: 'productName',
        width: 150,
      },
      {
        name: 'deliverTime',
        width: 150,
      },
      {
        name: 'supplierCompanyName',
        width: 180,
      },
      {
        name: 'companyName',
        width: 180,
      },
      {
        name: 'agentName',
        width: 150,
      },
      doubleUnitEnabled && {
        name: 'secondaryExecuteReverseQuantity',
        width: 120,
        editor: (record) => record.get('subjectType') === 'QUANTITY',
        renderer: ({ value }) => showBigNumber(value),
      },
      {
        name: 'executeReverseQuantity',
        width: 120,
        editor: (record) => record.get('subjectType') === 'QUANTITY',
        renderer: ({ value }) => showBigNumber(value),
        header: doubleUnitEnabled
          ? intl.get('sinv.receiptExecution.model.receipt.BaseReverseQuantity').d('退货基本数量')
          : intl
              .get('sinv.receiptExecution.model.receipt.secondaryUomReverseQuantity')
              .d('退货数量'),
      },
      {
        name: 'reverseNodeLov',
        width: 120,
        editor: (record) => record.get('subjectType') === 'QUANTITY',
      },
      {
        name: 'remark',
        width: 150,
        editor: (record) =>
          !['20_SUBMITTED', '40_FINISHED'].includes(record?.get('lineRcvStatusCode')),
      },
      {
        name: 'sinvLineAttachmentUuid',
        editor: opreateFlag,
      },
      {
        name: 'customSpecsJson',
        width: 120,
        renderer: ({ value }) => {
          return (
            <a onClick={() => onCustomSpecsJsonChange(value)}>
              {intl.get(`sinv.receiptExecution.model.title.customSpecsJson`).d('定制品属性')}
            </a>
          );
        },
      },
      {
        name: 'orderReturnedFlag',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(+value),
      },
      {
        name: 'attachmentUrlList',
        width: 80,
        renderer: ({ record, value }) => {
          return value?.length ? (
            <ImageList imageDTO={record.get('attachmentUrlList').slice() || []} />
          ) : (
            <span>-</span>
          );
        },
      },
      {
        name: 'linkFirst',
        width: 100,
        renderer: ({ record }) => (
          <FlexLink
            record={record}
            name="linkFirst"
            linkType="normal-btn"
            linkTitle={
              from === 'three'
                ? intl.get('hzero.common.button.look').d('查看')
                : intl.get('hzero.common.view.button.edit').d('编辑')
            }
            disabled={!record.get('rcvTrxLineId')}
            onClick={() => onOpenLinkChange(record, Number(1), Number(0))}
          />
        ),
      },
      {
        name: 'linkSecond',
        width: 100,
        renderer: ({ record }) => (
          <FlexLink
            record={record}
            name="linkSecond"
            linkType="normal-btn"
            linkTitle={
              from === 'three'
                ? intl.get('hzero.common.button.look').d('查看')
                : intl.get('hzero.common.view.button.edit').d('编辑')
            }
            disabled={!record.get('rcvTrxLineId')}
            onClick={() => onOpenLinkChange(record, Number(2), Number(0))}
          />
        ),
      },
      {
        name: 'processDocuments',
        width: 80,
        renderer: ({ record }) => (
          <DocFlow
            tableName="sinv_rcv_trx_line"
            tablePk={record.get('rcvTrxLineId')}
            buttonType="button"
          />
        ),
      },
      {
        name: 'projectTaskId',
        width: 110,
        renderer: ({ record }) => {
          return record.get('projectTaskName');
        },
      },
    ];

    return isFunction(renderCreateLineColumns)
      ? renderCreateLineColumns({ columns, dataset: tableDs })
      : columns;
  }, [from, opreateFlag, doubleUnitEnabled, renderCreateLineColumns]);

  const LineBtn = observer(({ dataSet }) => {
    const symbol = dataSet?.selected.length === 0;
    const buttons = [
      {
        name: 'batchEdit',
        btnType: 'c7n-pro',
        btnComp: TooltipButton,
        childFor: 'buttonText',
        hidden: ['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode),
        child: symbol
          ? intl.get('sinv.receiptWorkbench.view.title.detail.modeEdit').d('批量维护')
          : intl.get('sinv.receiptWorkbench.view.title.detail.modeCheckEdit').d('勾选批量维护'),
        btnProps: {
          tipTitle: symbol
            ? intl.get('sinv.receiptWorkbench.view.title.detail.modeEditData').d('批量维护全部数据')
            : intl
                .get('sinv.receiptWorkbench.view.title.detail.modeCheckedData')
                .d('批量维护勾选数据'),
          btnProps: {
            funcType: 'flat',
            icon: 'mode_edit',
            color: 'primary',
            // type: 'c7n-pro',
            onClick: () => handleBatchMaintenance(symbol),
          },
        },
      },
      {
        name: 'delete',
        btnType: 'c7n-pro',
        hidden: ['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode),
        child: (name) => name || intl.get(`hzero.common.button.batchdelete`).d('批量删除'),
        btnProps: {
          funcType: 'flat',
          color: 'primary',
          icon: 'delete_sweep',
          onClick: () => lineDelete(dataSet),
          disabled: isEmpty(dataSet?.selected),
        },
      },
    ];
    const btns = cuxHandleLineBtns(buttons, {
      formDs,
      tableDs: dataSet,
      attachmentDs,
      isMerge: true,
      customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.DETAIL.LINE_${nodeConfigIndexAbc}`,
    });
    return <DynamicButtons buttons={btns} />;
  });

  return (
    <>
      {customizeTable(
        {
          code: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.LINE_${nodeConfigIndexAbc}`,
          readOnly: rcvStatusCode === '20_SUBMITTED',
        },
        <SearchBarTable
          virtual
          dataSet={tableDs}
          custLoading={custLoading}
          columns={lineColumns()}
          searchCode="SINV.RECEIPT_WORKBENCH_THING.DETAIL.LINE_SEARCH_A"
          pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
          style={{ maxHeight: 370 }}
          virtualCell
          queryFieldsLimit={3}
          buttons={[<LineBtn dataSet={tableDs} />]}
          searchBarConfig={{
            checkDataSetStatus: false,
            closeFilterSelector: true,
          }}
        />
      )}
    </>
  );
});

export default LineTable;

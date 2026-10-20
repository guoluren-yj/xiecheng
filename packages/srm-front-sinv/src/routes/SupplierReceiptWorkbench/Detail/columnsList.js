import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Tag } from 'choerodon-ui';
import { Icon } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { isNil, isEmpty } from 'lodash';
import { yesOrNoRender } from 'utils/renderer';
import DynamicButtons from '_components/DynamicButtons';

import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import C7nPrecisionInputNumber from '@/components/Precision/C7nPrecisionInputNumber';
import { showBigNumber } from '@/routes/components/utils';
import ImageList from '@/routes/components/ImageList';
import { TooltipButton } from '../util';

const LineTable = observer((props) => {
  const {
    type,
    from,
    formDs,
    tableDs,
    custLoading,
    editFieldFlag,
    sourceFromPub,
    rcvStatusCode,
    externalSystem,
    customizeTable,
    cuxHandleLineBtns,
    doubleUnitEnabled,
    nodeConfigIndexAbc,
    operaClick = (e) => e,
    splitLine = (e) => e,
    lineDelete = (e) => e,
    onOpenLinkChange = (e) => e,
    handleBatchMaintenance = (e) => e,
    onCustomSpecsJsonChange = (e) => e,
  } = props;
  const opreateFlag = ['10_NEW', '30_REJECTED']?.includes(rcvStatusCode);

  const lineColumns = useCallback(() => {
    const columns = {
      action: [
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
            if (
              (type === 'COURSE' || type === 'SOURCE') &&
              !['20_SUBMITTED', '40_FINISHED'].includes(record?.get('lineRcvStatusCode'))
            ) {
              return (
                <a
                  onClick={() => splitLine(record)}
                  disabled={
                    from === 'five' ||
                    (record?.get('lineRcvStatusCode') === '30_SUP_REJECTED' && !externalSystem)
                  }
                >
                  {intl.get(`sinv.deliveryCreation.view.button.split`).d('拆分')}
                </a>
              );
            } else {
              return '-';
            }
          },
        },
      ],
      other: [
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
          width: 200,
          editor: (record) =>
            from === 'five' || !externalSystem
              ? false
              : record.get('itemId') &&
                record.get('firstNodeFlag') === 1 &&
                doubleUnitEnabled === 2 &&
                record.get('upStreamSuFlag') === 0,
          renderer: ({ record }) => record.get('secondaryUomName'),
          header: intl.get('sinv.receiptExecution.model.receipt.secondaryUomName').d('单位'),
        },
        {
          name: 'uomName',
          width: 150,
          header: doubleUnitEnabled
            ? intl.get('sinv.receiptExecution.model.receipt.baseUomName').d('基本单位')
            : intl.get('sinv.receiptExecution.model.receipt.uomName').d('单位'),
        },
        doubleUnitEnabled && {
          name: 'secondaryQuantity',
          width: 120,
          editor: (record) =>
            from === 'five' || !externalSystem
              ? false
              : !['20_SUBMITTED', '40_FINISHED'].includes(record?.get('lineRcvStatusCode')) &&
                record.get('subjectType') === 'QUANTITY' && (
                  <C7nPrecisionInputNumber
                    name="secondaryQuantity"
                    record={record}
                    // precision={record.get('uomPrecision') || 6}
                    precision={
                      !isNil(record.get('secondaryUomPrecision'))
                        ? record.get('secondaryUomPrecision')
                        : 10
                    }
                  />
                ),
          renderer: ({ value }) => showBigNumber(value),
        },
        doubleUnitEnabled &&
          !['40_FINISHED'].includes(rcvStatusCode) && {
            name: 'secondaryLeftQuantity',
            width: 120,
            renderer: ({ value }) => showBigNumber(value),
          },
        {
          name: 'quantity',
          width: 120,
          editor: (record) =>
            from === 'five' || !externalSystem
              ? false
              : !['20_SUBMITTED', '40_FINISHED'].includes(record?.get('lineRcvStatusCode')) &&
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
        externalSystem &&
          !['40_FINISHED'].includes(rcvStatusCode) && {
            name: 'leftQuantity',
            width: 150,
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
            from === 'five' || !externalSystem
              ? false
              : !['20_SUBMITTED', '40_FINISHED'].includes(record?.get('lineRcvStatusCode')) &&
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
        externalSystem &&
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
            from === 'five' || !externalSystem
              ? false
              : !['20_SUBMITTED', '40_FINISHED'].includes(record?.get('lineRcvStatusCode')),
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
            from === 'five' || !externalSystem
              ? false
              : !['20_SUBMITTED', '40_FINISHED'].includes(record?.get('lineRcvStatusCode')),
        },
        {
          name: 'locatorId',
          width: 160,
          editor: (record) =>
            from === 'five' || !externalSystem
              ? false
              : !['20_SUBMITTED', '40_FINISHED'].includes(record?.get('lineRcvStatusCode')),
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
        {
          name: 'remark',
          width: 150,
          editor: (record) =>
            from === 'five' || !externalSystem
              ? false
              : !['20_SUBMITTED', '40_FINISHED'].includes(record?.get('lineRcvStatusCode')),
        },
        {
          name: 'sinvLineAttachmentUuid',
          editor: from === 'five' || !externalSystem ? false : opreateFlag,
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
            <a onClick={() => onOpenLinkChange(record, Number(1), Number(0))}>
              {from === 'three' ||
              !externalSystem ||
              record?.get('lineRcvStatusCode') === '35_PUBLISH'
                ? intl.get('hzero.common.button.look').d('查看')
                : intl.get('hzero.common.view.button.edit').d('编辑')}
            </a>
          ),
        },
        {
          name: 'linkSecond',
          width: 100,
          renderer: ({ record }) => (
            <a onClick={() => onOpenLinkChange(record, Number(2), Number(0))}>
              {from === 'three' ||
              !externalSystem ||
              record?.get('lineRcvStatusCode') === '35_PUBLISH'
                ? intl.get('hzero.common.button.look').d('查看')
                : intl.get('hzero.common.view.button.edit').d('编辑')}
            </a>
          ),
        },
        {
          name: 'projectTaskId',
          width: 110,
          renderer: ({ record }) => {
            return record.get('projectTaskName');
          },
        },
      ],
    };
    return columns.action.concat(columns.other);
  }, [from, doubleUnitEnabled, opreateFlag, externalSystem]);

  const LineBtn = observer(({ dataSet }) => {
    const symbol = dataSet?.selected.length === 0;
    const flags1 = from === 'five' || !externalSystem;
    const flags2 = ['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode);
    const buttons = [
      {
        name: 'batchEdit',
        btnType: 'c7n-pro',
        btnComp: TooltipButton,
        childFor: 'buttonText',
        hidden: flags1 || flags2,
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
        hidden: flags1 || flags2,
        child: (name) => name || intl.get(`hzero.common.button.batchdelete`).d('批量删除'),
        btnProps: {
          funcType: 'flat',
          color: 'primary',
          icon: 'delete_sweep',
          onClick: () => lineDelete(dataSet.selected, dataSet),
          disabled: isEmpty(dataSet?.selected),
        },
      },
    ];

    const btns = cuxHandleLineBtns(buttons, { formDs });
    return <DynamicButtons buttons={btns} />;
  });

  return (
    <>
      {customizeTable(
        {
          code: `SINV.RECEIPT_WORKBENCH_THING.DETAIL.LINE_${nodeConfigIndexAbc}`,
          readOnly: sourceFromPub
            ? from === 'five' || !externalSystem
              ? false
              : from === 'three' || from === 'four'
              ? !editFieldFlag || rcvStatusCode === '20_SUBMITTED'
              : rcvStatusCode === '20_SUBMITTED'
            : from === 'five' || !externalSystem
            ? false
            : from === 'three' || (from === 'four' && !editFieldFlag),
          __force_record_to_update__: true,
        },
        <SearchBarTable
          virtual
          dataSet={tableDs}
          custLoading={custLoading}
          columns={lineColumns()}
          searchCode="SINV.RECEIPT_WORKBENCH_THING.DETAIL.LINE_SEARCH_A"
          pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
          style={{ maxHeight: 400 }}
          virtualCell
          queryFieldsLimit={3}
          buttons={
            from === 'five' || !externalSystem
              ? []
              : !['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode) && [
                <LineBtn dataSet={tableDs} />,
                ]
          }
          selectionMode={
            from === 'five' || !externalSystem
              ? 'none'
              : !['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode)
              ? 'rowbox'
              : 'none'
          }
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

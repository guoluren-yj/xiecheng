import React, { useCallback } from 'react';
import intl from 'utils/intl';
import { Tag } from 'choerodon-ui';
import DocFlow from '_components/DocFlow';
import { observer } from 'mobx-react-lite';
import { yesOrNoRender } from 'utils/renderer';
import { isNil, isEmpty, isFunction } from 'lodash';
import { FlexLink } from 'srm-front-cuz/components';
import ImageList from '@/routes/components/ImageList';
import { Icon } from 'choerodon-ui/pro';
import DynamicButtons from '_components/DynamicButtons';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { showBigNumber } from '@/routes/components/utils';
import C7nPrecisionInputNumber from '@/components/Precision/C7nPrecisionInputNumber';

const LineTable = observer(({ props }) => {
  const {
    from,
    docFlow,
    formDs,
    tableDs,
    editFlag, // TODO
    attachmentDs,
    custLoading,
    pageFromFlag,
    rcvStatusCode,
    sourceFromPub,
    editFieldFlag,
    externalSystem,
    customizeTable,
    isRoleWorkbench,
    cuxHandleLineBtns,
    doubleUnitEnabled,
    externalSystemFlag,
    nodeConfigIndexAbc,
    renderCreateLineColumns,
    operaClick = e => e,
    lineDelete = e => e,
    handleRefresh = e => e,
    onOpenLinkChange = e => e,
    onCustomSpecsJsonChange = e => e,
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
        name: 'itemCode',
        width: 120,
        sortable: true,
      },
      {
        name: 'itemName',
        width: 160,
      },
      doubleUnitEnabled && {
        name: 'secondaryUomId',
        width: 160,
        renderer: ({ record }) => record.get('secondaryUomName'),
        editor: false,
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
        width: 150,
        editor: record =>
          from === 'five' || !externalSystem || ['flow', 'oldFlow'].includes(docFlow)
            ? false
            : !['20_SUBMITTED', '40_FINISHED'].includes(record?.get('lineRcvStatusCode')) &&
              record.get('subjectType') === 'QUANTITY' &&
              editFlag && (
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
          width: 150,
        },
      {
        name: 'quantity',
        width: 120,
        editor: record =>
          from === 'five' || !externalSystem || ['flow', 'oldFlow'].includes(docFlow)
            ? false
            : !['20_SUBMITTED', '40_FINISHED'].includes(record?.get('lineRcvStatusCode')) &&
              record.get('subjectType') === 'QUANTITY' &&
              editFlag && (
                <C7nPrecisionInputNumber
                  name="quantity"
                  record={record}
                  precision={!isNil(record.get('uomPrecision')) ? record.get('uomPrecision') : 10}
                />
              ),
        renderer: ({ value }) => showBigNumber(value),
        header: doubleUnitEnabled
          ? intl.get('sinv.receiptExecution.model.receipt.return.baseQuantity').d('退货基本数量')
          : intl.get('sinv.receiptExecution.model.receipt.return.quantitys').d('退货数量'),
      },
      {
        name: 'moveReason',
        width: 160,
        editor: record =>
          from === 'five' || !externalSystem || ['flow', 'oldFlow'].includes(docFlow)
            ? false
            : !['20_SUBMITTED', '40_FINISHED'].includes(record?.get('lineRcvStatusCode')) &&
              editFlag,
      },
      externalSystemFlag &&
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
            ? intl
                .get('sinv.receiptExecution.model.receipt.canLeftBaseQuantity')
                .d('可退货基本数量')
            : intl.get('sinv.receiptExecution.model.receipt.canLeftQuantitys').d('可退货数量'),
        },
      {
        name: 'taxIncludedAmount',
        width: 130,
        editor: record =>
          from === 'five' || !externalSystem || ['flow', 'oldFlow'].includes(docFlow)
            ? false
            : !['20_SUBMITTED', '40_FINISHED'].includes(record?.get('lineRcvStatusCode')) &&
              editFlag &&
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
      externalSystemFlag &&
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
        editor: record =>
          from === 'five' || !externalSystem || ['flow', 'oldFlow'].includes(docFlow)
            ? false
            : !['20_SUBMITTED', '40_FINISHED'].includes(record?.get('lineRcvStatusCode')) &&
              editFlag,
        sortable: true,
      },
      {
        name: 'invOrganizationName',
        width: 150,
      },
      {
        name: 'inventoryId',
        width: 160,
      },
      {
        name: 'locatorId',
        width: 160,
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
        editor: record =>
          from === 'five' || !externalSystem || ['flow', 'oldFlow'].includes(docFlow)
            ? false
            : !['20_SUBMITTED', '40_FINISHED'].includes(record?.get('lineRcvStatusCode')) &&
              editFlag,
      },
      {
        name: 'sinvLineAttachmentUuid',
        editor:
          from === 'five' || !externalSystem || ['flow', 'oldFlow'].includes(docFlow)
            ? false
            : opreateFlag,
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
              from === 'three' ||
              !externalSystem ||
              record?.get('lineRcvStatusCode') === '35_PUBLISH' ||
              ['flow', 'oldFlow'].includes(docFlow)
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
              from === 'three' ||
              !externalSystem ||
              record?.get('lineRcvStatusCode') === '35_PUBLISH' ||
              ['flow', 'oldFlow'].includes(docFlow)
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
        renderer: ({ record }) =>
          docFlow !== 'flow' && (
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
  }, [
    from,
    docFlow,
    opreateFlag,
    sourceFromPub,
    externalSystem,
    doubleUnitEnabled,
    externalSystemFlag,
    renderCreateLineColumns,
  ]);

  const LineBtn = observer(({ dataSet, handleQuery }) => {
    const flags1 = ['flow', 'oldFlow'].includes(docFlow) || from === 'five' || !externalSystem;
    const flags2 = !(
      isNil(isRoleWorkbench) && !['20_SUBMITTED', '40_FINISHED'].includes(rcvStatusCode)
    );
    const buttons = [
      {
        name: 'delete',
        btnType: 'c7n-pro',
        hidden: flags1 || flags2,
        child: name => name || intl.get(`hzero.common.button.batchdelete`).d('批量删除'),
        btnProps: {
          funcType: 'flat',
          color: 'primary',
          icon: 'delete_sweep',
          onClick: () => lineDelete(dataSet.selected),
          disabled: isEmpty(dataSet?.selected) || !editFlag,
        },
      },
    ];
    const btns = cuxHandleLineBtns(
      buttons.filter(i => !i.hidden),
      {
        formDs,
        handleQuery,
        attachmentDs,
        tableDs: dataSet,
        customizeUnitCode: `SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.${nodeConfigIndexAbc},SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.LINE_${nodeConfigIndexAbc}`,
      }
    );
    return <DynamicButtons buttons={btns} handleQuery={handleRefresh} />;
  });
  return (
    <>
      {customizeTable(
        {
          code: `SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.LINE_${nodeConfigIndexAbc}`,
          readOnly:
            ['flow', 'oldFlow'].includes(docFlow) || pageFromFlag
              ? true
              : from === 'five'
              ? false
              : from === 'three'
              ? !editFieldFlag || rcvStatusCode === '20_SUBMITTED'
              : rcvStatusCode === '20_SUBMITTED',
          //   __force_record_to_update__: true,
        },
        <SearchBarTable
          virtual
          dataSet={tableDs}
          custLoading={custLoading}
          columns={lineColumns()}
          style={{ maxHeight: 400 }}
          virtualCell
          queryFieldsLimit={3}
          searchCode="SINV.RECEIPT_WORKBENCH_THING.RETURN_DETAIL.LINE_SEARCH_A"
          pagination={{ pageSizeOptions: ['10', '20', '50', '100', '200'] }}
          buttons={[<LineBtn dataSet={tableDs} />]}
          selectionMode={
            from === 'five' || !externalSystem || ['flow', 'oldFlow'].includes(docFlow)
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

import React, { useMemo, Fragment } from 'react';
import {
  Table,
  Lov,
  DatePicker,
  TextField,
  DataSet,
  Button,
  Form,
  Modal,
  NumberField,
  Tooltip,
  Icon,
  Attachment,
} from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import DocFlow from '_components/DocFlow';
import { noop, isEmpty, isFunction } from 'lodash';
import intl from 'utils/intl';
import { observer } from 'mobx-react';
// import { getCurrentOrganizationId } from 'utils/utils';
// import notification from 'utils/notification';
import DynamicButtons from '_components/DynamicButtons';

import CategoryLov from '@/routes/components/CategoryLov';
import { formatAumont, redirectToOther } from '@/routes/components/utils';
import { handleBatchOk } from '@/routes/QuotePurchaseRequisition/utils';
import styles from './index.less';
import { batchMaintenance, isDisabledFields } from './stores/OrderLineInfoDS';

// const organizationId = getCurrentOrganizationId();

const style = {
  maxHeight: 450,
};

const OrderLineInfoC7N = observer((props) => {
  const {
    ouId,
    remote,
    companyId,
    orderLineInfoDs,
    orderHeaderInfoDs,
    customizeTable,
    headerInfo = {},
    enumMap: { batchMaintain = [] },
    openBOMModalC7N = noop,
    amountFinancialPrecision = noop,
    customizeBtnGroup,
    doubleUnitEnabled,
    setChangeFlag,
  } = props;

  const batchEditDs = useMemo(() => new DataSet(batchMaintenance(orderHeaderInfoDs)), [
    companyId,
    ouId,
  ]);

  // 行字段是否配置可修改
  // const isDisabledFields = (record, item) => {
  //   return record.get('cancelledFlag') || record.get('closedFlag') || !changeFields.includes(item);
  // };

  const handleTranslate = ({ record, dataSet }) => {
    dataSet.create({
      ...record.toData(),
      poLineId: null,
      displayLineNum: null,
      poLineLocationId: null,
      splitFromLineNum: record.get('displayLineNum'),
    });
  };

  const columns = useMemo(() => {
    const allColumns = [
      {
        name: 'translate',
        width: 120,
        renderer: ({ record, dataSet }) => (
          <a
            disabled={
              !record.get('poLineLocationId') ||
              record.get('cancelledFlag') ||
              record.get('closedFlag')
            }
            onClick={() => handleTranslate({ record, dataSet })}
          >
            {intl.get(`sodr.common.model.common.translate`).d('拆分')}
          </a>
        ),
      },
      {
        name: 'displayLineNum',
        width: 150,
      },
      {
        name: 'displayLineLocationNum',
        width: 150,
      },
      {
        name: 'itemCode',
        width: 150,
      },
      {
        name: 'itemName',
        width: 150,
        editor: (record) => !(isDisabledFields(record, 'itemName') || record.get('itemId')),
      },
      {
        name: 'categoryId',
        width: 180,
        editor: (record) => <CategoryLov data={{ record, ds: orderLineInfoDs }} />,
      },
      {
        name: 'commonName',
        width: 150,
      },
      {
        name: 'quantity',
        width: 150,
        editor: true,
        renderer: ({ value }) => formatAumont(value),
      },
      {
        name: 'uomId',
        width: 150,
        editor: true,
        renderer: ({ record }) => record.get('uomCodeAndName'),
      },
      doubleUnitEnabled && {
        name: 'secondaryQuantity',
        width: 150,
        editor: true,
      },
      doubleUnitEnabled && {
        name: 'secondaryUomId',
        width: 150,
        editor: true,
        renderer: ({ record }) => record.get('secondaryUomCodeAndName'),
      },
      {
        name: 'needByDate',
        width: 150,
        editor: true,
      },
      {
        name: 'currencyCode',
        width: 150,
      },
      {
        name: 'taxId',
        width: 150,
        editor: (record) => !!record?.get('taxRateFlag'),
      },
      {
        name: 'lastPurchasePrice',
        width: 150,
        align: 'right',
      },
      {
        name: 'unitPrice',
        width: 150,
        align: 'right',
        editor: (record) => !!record?.get('unitPriceFlag'),
        renderer: ({ value }) => formatAumont(value),
      },
      {
        name: 'enteredTaxIncludedPrice',
        width: 150,
        align: 'right',
        editor: (record) => !!record?.get('enteredTaxIncludedPriceFlag'),
        renderer: ({ value }) => formatAumont(value),
      },
      {
        name: 'unitPriceBatch',
        width: 150,
        align: 'right',
        editor: (record) => !!record?.get('unitPriceBatchFlag'),
      },
      {
        name: 'lineAmount',
        width: 150,
        align: 'right',
        renderer: ({ record, value }) => {
          return amountFinancialPrecision(
            value,
            record.get('financialPrecision'),
            headerInfo.poSourcePlatform
          );
        },
      },
      {
        name: 'taxIncludedLineAmount',
        width: 150,
        align: 'right',
        renderer: ({ record, value }) => {
          return amountFinancialPrecision(
            value,
            record.get('financialPrecision'),
            headerInfo.poSourcePlatform
          );
        },
      },
      {
        name: 'departmentName',
        width: 150,
      },
      {
        name: 'clearOrganizationName',
        width: 150,
      },
      {
        name: 'copeOrganizationName',
        width: 150,
      },
      {
        name: 'invOrganizationId',
        width: 150,
        editor: true,
      },
      {
        name: 'invInventoryId',
        width: 150,
        editor: true,
      },
      {
        name: 'invLocationId',
        width: 150,
        editor: true,
      },
      {
        name: 'bom',
        width: 100,
        renderer: ({ record }) => (
          <a onClick={() => openBOMModalC7N(record)} disabled={record.status === 'add'}>
            {intl.get(`hzero.common.button.view`).d('查看')}
          </a>
        ),
      },
      {
        name: 'shipToThirdPartyName',
        width: 150,
      },
      {
        name: 'shipToThirdPartyAddress',
        width: 150,
        editor: true,
      },
      {
        name: 'shipToThirdPartyContact',
        width: 150,
        editor: true,
      },
      {
        name: 'brand',
        width: 150,
      },
      {
        name: 'specifications',
        width: 150,
      },
      {
        name: 'model',
        width: 150,
      },
      {
        name: 'chartCode',
        width: 150,
      },
      {
        name: 'surfaceTreatFlag',
        width: 150,
        renderer: ({ value }) =>
          value ? intl.get('hzero.common.status.yes') : intl.get('hzero.common.status.no'),
      },
      {
        name: 'pcNum',
        width: 150,
      },
      {
        name: 'accountAssignment',
        width: 150,
      },
      {
        name: 'displayPrNum',
        width: 150,
        renderer: ({ value, record }) => (
          <a onClick={() => redirectToOther('purchase', record.toData())}>
            {value || record?.get('displayPrLineNum')
              ? `${record?.get('displayPrNum') || ''}|${record?.get('displayPrLineNum') || ''}`
              : ''}
          </a>
        ),
      },
      {
        name: 'contractNum',
        width: 150,
        renderer: ({ value, record }) => (
          <a onClick={() => redirectToOther('contract', record.toData())}>
            {value === '|' ? '' : value}
          </a>
        ),
      },
      {
        name: 'sourceNumAndLine',
        width: 150,
        renderer: ({ record, value }) => (
          <a onClick={() => redirectToOther('source', record.toData())}>
            {value || record.get('sourceCodeNum')
              ? `${record.get('sourceNumAndLine') || ''}|${record?.get('sourceCodeNum') || ''}`
              : ''}
          </a>
        ),
      },
      {
        name: 'prRequestedName',
        width: 150,
        renderer: ({ record }) => record?.get('purReqAppliedName'),
      },
      {
        name: 'accountAssignTypeId',
        width: 150,
        editor: true,
      },
      {
        name: 'projectCategory',
        width: 150,
        editor: true,
      },
      {
        name: 'costId',
        width: 150,
        editor: true,
      },
      {
        name: 'accountSubjectId',
        width: 150,
        editor: true,
      },
      {
        name: 'wbsCode',
        width: 150,
        editor: true,
      },
      {
        name: 'freeFlag',
        width: 150,
        editor: true,
      },
      {
        name: 'remark',
        width: 150,
        editor: (record) => !!record?.get('remarkFlag'),
      },
      {
        name: 'budgetAccountId',
        width: 120,
        renderer: ({ record }) => record?.get('budgetAccountName'),
      },
      {
        name: 'purchaseLineTypeId',
        width: 150,
        editor: true,
      },
      {
        name: 'receiveTelNum',
        width: 400,
        editor: true,
      },
      {
        name: 'attachmentUuid',
        width: 100,
        editor: (
          <Attachment
            viewMode="popup"
            funcType="link"
            onAttachmentsChange={() => setChangeFlag(true)}
          />
        ),
      },
      {
        name: 'domesticTaxIncludedPrice',
        width: 120,
        renderer: ({ value }) =>
          headerInfo?.poSourcePlatform === 'ERP'
            ? formatAumont(value)
            : formatAumont(value, headerInfo?.domesticDefaultPrecision),
      },
      {
        name: 'domesticUnitPrice',
        width: 120,
        renderer: ({ value }) =>
          headerInfo?.poSourcePlatform === 'ERP'
            ? formatAumont(value)
            : formatAumont(value, headerInfo?.domesticDefaultPrecision),
      },
      {
        name: 'domesticTaxIncludedLineAmount',
        width: 120,
        renderer: ({ value }) =>
          amountFinancialPrecision(
            value,
            headerInfo?.domesticFinancialPrecision,
            headerInfo?.poSourcePlatform
          ),
      },
      {
        name: 'domesticLineAmount',
        width: 120,
        renderer: ({ value }) =>
          amountFinancialPrecision(
            value,
            headerInfo?.domesticFinancialPrecision,
            headerInfo?.poSourcePlatform
          ),
      },
      {
        name: 'docFlow',
        width: 100,
        renderer: ({ record }) => (
          <DocFlow tableName="sodr_po_line_location" tablePk={record.get('poLineLocationId')} />
        ),
      },
      {
        name: 'subSupplierId',
        width: 150,
        editor: true,
      },
      {
        name: 'netReceivedQuantity',
        width: 150,
        editor: false,
      },
      {
        name: 'netDeliverQuantity',
        width: 150,
        editor: false,
      },
      {
        name: 'shippedQuantity',
        width: 150,
        editor: false,
      },
    ];
    return allColumns;
  }, [headerInfo, doubleUnitEnabled]);

  const batchMaintenanceItem = (item) => {
    const { value, meaning } = item || {};
    if (['taxId', 'invInventoryId', 'costId', 'invOrganizationId'].includes(value)) {
      return <Lov name={value} />;
    } else if (['needByDate'].includes(value)) {
      return <DatePicker name="needByDate" />;
    } else if (['enteredTaxIncludedPrice'].includes(value)) {
      return (
        <NumberField
          name="enteredTaxIncludedPrice"
          disabled={orderHeaderInfoDs?.current?.get('benchmarkPriceType') === 'NET_PRICE'}
        />
      );
    } else if (['unitPrice'].includes(value)) {
      return (
        <NumberField
          name="unitPrice"
          disabled={
            orderHeaderInfoDs?.current?.get('benchmarkPriceType') === 'TAX_INCLUDED_PRICE' ||
            orderHeaderInfoDs?.current?.get('benchmarkPriceType') === undefined
          }
        />
      );
    } else {
      return <TextField name={value} label={meaning} />;
    }
  };

  const handleBatchMaintenance = () => {
    const { selected } = orderLineInfoDs;
    Modal.open({
      drawer: true,
      style: { width: 380 },
      title: intl.get(`sodr.workspace.view.button.batchEdit`).d('批量编辑'),
      children: (
        <Fragment>
          <Alert
            className={styles['order-top-title-alert']}
            border={false}
            message={
              <div>
                <Icon type="help" />
                {!isEmpty(selected)
                  ? intl
                      .get(`sodr.workspace.view.alert.batchAllMaintainData`, {
                        num: selected.length,
                      })
                      .d(`已勾选{num}条数据进行批量编辑`)
                  : intl
                      .get('sodr.workspace.view.alert.currentPagebatchAllMaintain')
                      .d('针对当前页全部数据进行批量编辑')}
              </div>
            }
            closable
          />
          <Form dataSet={batchEditDs} columns={1} labelLayout="float">
            {batchMaintain
              // .filter((i) => !['enteredTaxIncludedPrice', 'unitPrice'].includes(i.value))
              .map((i) => batchMaintenanceItem(i))}
          </Form>
        </Fragment>
      ),
      onOk: () =>
        handleBatchOk({
          ds: orderLineInfoDs,
          batchMaintenanceDs: batchEditDs,
          headerInfoDs: orderHeaderInfoDs,
          // hasPriceLibrary: true,
        }),
    });
  };

  const handleDeleteLines = () => {
    const { selected } = orderLineInfoDs;
    orderLineInfoDs.delete(selected);
  };

  const getButtons = () => {
    const Buttons = observer(({ dataSet }) => {
      const { selected } = dataSet;
      const realData = selected.filter((i) => i.get('poLineLocationId'));
      const buttons = [
        {
          name: 'delete',
          btnType: 'c7n-pro',
          child: intl.get(`hzero.common.button.delete`).d('删除'),
          btnProps: {
            onClick: handleDeleteLines,
            funcType: 'flat',
            color: 'primary',
            icon: 'delete',
            disabled: !isEmpty(realData) || isEmpty(selected),
          },
        },
      ];
      return (
        <Fragment>
          <Tooltip
            title={
              !isEmpty(selected)
                ? intl.get(`sodr.workspace.view.button.tickaBtchEdit`).d('勾选批量编辑')
                : intl.get('sodr.quotePurchase.view.allBatchMaintain').d('批量编辑当前页全部数据')
            }
          >
            <Button
              funcType="flat"
              icon="mode_edit"
              color="primary"
              type="c7n-pro"
              onClick={handleBatchMaintenance}
              disabled={!orderLineInfoDs.length}
            >
              {!isEmpty(selected)
                ? intl.get(`sodr.workspace.view.button.tickaBtchEdit`).d('勾选批量编辑')
                : intl.get(`sodr.workspace.view.button.batchEdit`).d('批量编辑')}
            </Button>
          </Tooltip>
          {customizeBtnGroup(
            {
              code: 'SODR.ORDER_CANCEL_CHANGE.LIST_BUTTONS',
              pro: true,
            },
            <DynamicButtons buttons={buttons} />
          )}
          {isFunction(remote?.props?.process?.detailLineButtons) &&
            remote?.process('detailLineButtons', { dataSet })}
        </Fragment>
      );
    });
    return [<Buttons dataSet={orderLineInfoDs} />];
  };

  return (
    <React.Fragment>
      <div className={styles['orderLine-table']}>
        {customizeTable(
          {
            code: 'SODR.ORDER_CANCEL_CHANGE.LIST',
            dataSet: orderLineInfoDs,
          },
          <Table style={style} columns={columns} dataSet={orderLineInfoDs} buttons={getButtons()} />
        )}
      </div>
    </React.Fragment>
  );
});

export default OrderLineInfoC7N;

import React, { useContext, useMemo } from 'react';
import { TextArea } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { defaultTo } from 'lodash';
import intl from 'utils/intl';
import DocFlow from '_components/DocFlow';
import { formatAumont } from '@/routes/components/utils';
import openCustomSpecModal from '@/routes/QuotePurchaseRequisition/components/newCustomSpecModal';
import {
  useAmountRenderer,
  useDefaultColumns,
  useLineAmountByHeaderRenderer,
  useLineAmountRenderer,
  useTable,
} from './hooks';
import { Store } from './stores';

// 设置sodr国际化前缀 - common - model
const modelPrompt = 'sodr.sendOrder.model.common';

const BasicTable = function BasicTable(props) {
  const { header } = props;
  const { customizeTable, listDs, sourceFromCancel, sourceFromModal, isDocFlowLink } = useContext(
    Store
  );
  const defaultColumns = useDefaultColumns('basic');
  const priceRenderer = useLineAmountRenderer('defaultPrecision', header);
  const financialAmountRenderer = useAmountRenderer('financialPrecision', header);
  const domesticAmountRenderer = useLineAmountByHeaderRenderer('domesticDefaultPrecision', header);
  const domesticFinancialAmountRenderer = useAmountRenderer('domesticFinancialPrecision', header);
  const doubleUnitEnabled = listDs.getState('doubleUnitEnabled');
  const columns = useMemo(
    () =>
      [
        ...defaultColumns,
        doubleUnitEnabled && {
          name: 'secondaryQuantity',
          width: 80,
          renderer: ({ value, record }) => formatAumont(value, record.get('secondaryUomPrecision')),
        },
        doubleUnitEnabled && {
          name: 'secondaryUomName',
          renderer: ({ record }) => record.get('secondaryUomCodeAndName'),
          width: 150,
        },
        {
          name: 'quantity',
          width: 80,
          renderer: ({ value, record }) => formatAumont(value, record.get('uomPrecision')),
        },
        {
          name: 'uomName',
          renderer: ({ record }) => record.get('uomCodeAndName'),
          width: 150,
        },
        {
          name: 'needByDate',
          width: 120,
        },
        {
          name: 'promiseDeliveryDate',
          width: 120,
        },
        {
          width: 130,
          name: 'lastPurchasePrice',
        },
        {
          width: 120,
          name: 'unitPrice',
          renderer: priceRenderer,
        },
        {
          name: 'enteredTaxIncludedPrice',
          width: 120,
          renderer: priceRenderer,
        },

        {
          name: 'unitPriceBatch',
          width: 80,
        },
        {
          name: 'lineAmount',
          width: 120,
          renderer: financialAmountRenderer,
        },
        {
          name: 'taxIncludedLineAmount',
          width: 120,
          renderer: financialAmountRenderer,
        },
        {
          // title: intl.get(`${modelPrompt}.taxRate`).d('税率'),
          // header: (_ds, _name, title) => `${title}(%)`,
          name: 'taxRate',
          width: 80,
          renderer: ({ text }) => defaultTo(text, 0),
        },
        {
          name: 'currencyCode',
          width: 80,
        },
        {
          name: 'departmentName',
          width: 130,
        },
        {
          name: 'invOrganizationName',
          width: 120,
        },
        {
          name: 'inventoryName',
          width: 120,
        },
        {
          name: 'locationName',
          width: 120,
        },
        {
          name: 'costName',
          width: 120,
        },
        {
          name: 'accountSubjectName',
          width: 120,
        },
        {
          name: 'wbs',
          width: 120,
        },
        {
          name: 'specifications',
          width: 100,
          // renderer: ({ value }) => (
          //   <Tooltip title={value}>
          //     <span
          //       style={{
          //         width: '100%',
          //         display: 'inline-block',
          //         overflow: 'hidden',
          //         textOverflow: 'ellipsis',
          //       }}
          //     >
          //       {value}
          //     </span>
          //   </Tooltip>
          // ),
        },
        {
          name: 'model',
          width: 100,
        },
        {
          width: 150,
          name: 'customSpecsJson',
          renderer: ({ value }) => (
            <a
              disabled={sourceFromModal}
              onClick={() => {
                openCustomSpecModal({
                  dataSource: value ? JSON.parse(value) : [],
                  specsJsonType: 'custom',
                });
              }}
            >
              {intl.get(`sprm.purchaseReqCreation.model.common.customSpecsJson`).d('定制品属性')}
            </a>
          ),
        },
        {
          width: 150,
          name: 'customSpecs',
          editor: true,
        },
        {
          width: 150,
          name: 'productSpecsJson',
          renderer: ({ value }) => {
            return (
              <a
                disabled={sourceFromModal}
                onClick={() => {
                  openCustomSpecModal({
                    dataSource: value ? JSON.parse(value) : [],
                    specsJsonType: 'product',
                  });
                }}
              >
                {intl.get(`sprm.purchaseReqCreation.model.common.productSpecsJson`).d('商品属性')}
              </a>
            );
          },
        },
        {
          width: 150,
          name: 'productBrand',
        },
        {
          width: 150,
          name: 'productModel',
        },
        {
          width: 150,
          name: 'packingList',
        },
        {
          width: 150,
          name: 'productSpecs',
          editor: true,
        },
        {
          name: 'brand',
          width: 150,
        },
        {
          name: 'remark',
          width: 240,
          editor: <TextArea style={{ resize: 'vertical' }} rows={1} />,
        },
        {
          title: intl.get(`${modelPrompt}.feedbackInfo`).d('反馈信息'),
          name: 'feedback',
          width: 180,
        },
        {
          name: 'attachmentUuid',
          width: 100,
        },
        {
          width: 120,
          name: 'domesticTaxIncludedPrice',
          renderer: domesticAmountRenderer,
        },
        {
          width: 120,
          name: 'domesticUnitPrice',
          renderer: domesticAmountRenderer,
        },
        {
          width: 120,
          name: 'domesticTaxIncludedLineAmount',
          renderer: domesticFinancialAmountRenderer,
        },
        {
          width: 120,
          name: 'domesticLineAmount',
          renderer: domesticFinancialAmountRenderer,
        },
        {
          width: 120,
          name: 'budgetAccountId',
          renderer: ({ record }) => record.get('budgetAccountName'),
        },
        {
          width: 150,
          name: 'receiveToleranceQuantityType',
        },
        {
          name: 'purchaseLineTypeId',
          width: 120,
          editor: true,
        },
        {
          name: 'deliveryStrategyId',
          width: 120,
        },
        !isDocFlowLink && {
          name: 'docFlow',
          width: 100,
          renderer: ({ record }) => (
            <DocFlow tableName="sodr_po_line_location" tablePk={record.get('poLineLocationId')} />
          ),
        },
      ].filter((i) => i),
    [defaultColumns, doubleUnitEnabled, isDocFlowLink]
  );
  return customizeTable(
    {
      code: sourceFromCancel
        ? 'SODR.ORDER_PROCESS_CONTROL_DETAIL.LINE'
        : 'SODR.SEND_ORDER_DETAIL.BASIC',
    },
    useTable(listDs, columns)
  );
};

export default observer(BasicTable);

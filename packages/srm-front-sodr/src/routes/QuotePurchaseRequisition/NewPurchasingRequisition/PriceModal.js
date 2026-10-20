import React, { useContext, useMemo } from 'react';
import { Popover } from 'choerodon-ui';
import { useDataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { MAX_QUAN_NUMBER } from '@/routes/components/utils/constant';
import { useTable } from './hooks';
import { Store } from './stores';
import { formatAumont } from '@/routes/components/utils';

const style = {
  maxHeight: 500,
};

const style2 = {
  maxHeight: 500,
  width: 500,
};

const LadderDetailTable = function LadderDetailTable(props) {
  const { record: line } = props;
  const dataSet = useDataSet(
    () => ({
      primaryKey: 'ladderPriceLibId',
      data: line.get('ladderPriceLibList') || [],
      paging: false,
    }),
    []
  );
  const columns = useMemo(
    () => [
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.ladderLineNum`).d('行号'),
        name: 'ladderLineNum',
        width: 80,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.numberRange`).d('数量范围'),
        name: 'numberRange',
        width: 120,
        renderer: ({ record }) => `[${record.get('ladderFrom')},${record.get('ladderTo')})`,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.price`).d('价格'),
        name: 'ladderPrice',
        width: 100,
        renderer: ({ value }) => formatAumont(value),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.ladderPriceRemark`).d('备注'),
        name: 'ladderPriceRemark',
        width: 120,
      },
    ],
    []
  );
  return useTable(dataSet, columns, { selectionMode: 'none', style: style2 });
};

const PriceModal = function PriceModal(props) {
  const { customizeTable, tenantId = getCurrentOrganizationId() } = useContext(Store) || {};
  const { record: line } = props;
  const dataSet = useDataSet(
    () => ({
      autoQuery: true,
      transport: {
        read: ({ data, params }) => ({
          url: `${SRM_SPUC}/v1/${tenantId}/po-header/reference-price`,
          method: 'GET',
          params: {
            ...line.get([
              'companyId',
              'itemId',
              'invOrganizationId',
              'purchaseOrgId',
              'uomId',
              'prLineId',
              'ouId',
              'currencyCode',
            ]),
            ...data,
            ...params,
          },
          data: null,
        }),
      },
      queryFields: [
        { name: 'supplierCompanyNum', label: intl.get(`entity.supplier.code`).d('供应商编码') },
        { name: 'supplierCompanyName', label: intl.get(`entity.supplier.name`).d('供应商名称') },
        {
          name: 'supplierNum',
          label: intl.get(`entity.supplier.localSupplierNums`).d('本地供应商编码'),
        },
        {
          name: 'supplierName',
          label: intl.get(`entity.supplier.localSupplierName`).d('本地供应商名称'),
        },
      ],
      fields: [
        { name: 'supplierCompanyNum', label: intl.get(`entity.supplier.code`).d('供应商编码') },
        { name: 'supplierCompanyName', label: intl.get(`entity.supplier.name`).d('供应商名称') },
        {
          name: 'supplierNum',
          label: intl.get(`sodr.common.model.common.localSupplierCompanyNum`).d('本地供应商编码'),
        },
        {
          name: 'supplierName',
          label: intl.get(`sodr.common.model.common.localSupplierCompanyName`).d('本地供应商编码'),
        },
        {
          name: 'taxPrice',
          type: 'currency',
          label: intl.get(`sodr.common.model.common.taxPrice`).d('含税单价'),
          dynamicProps: {
            precision: ({ record }) => record && record.get('defaultPrecision'),
            currency: ({ record }) => record && record.get('currencyCode'),
          },
        },
        {
          name: 'unitPrice',
          type: 'currency',
          max: MAX_QUAN_NUMBER,
          label: intl.get(`sodr.common.model.common.excludingTaxPrice`).d('单价（不含税）'),
          dynamicProps: {
            precision: ({ record }) => record && record.get('defaultPrecision'),
            currency: ({ record }) => record && record.get('currencyCode'),
          },
        },
        { name: 'uomName', label: intl.get(`sodr.common.model.common.uomNames`).d('单位') },
        {
          name: 'currencyCode',
          label: intl.get(`sodr.common.model.common.currencyName`).d('币种'),
        },
        { name: 'taxCode', label: intl.get(`sodr.common.model.common.taxType`).d('税种') },
        { name: 'taxRate', label: intl.get(`sodr.common.model.common.taxRate`).d('税率') },
        { name: 'quantity', label: intl.get(`sodr.common.model.common.11111`).d('阶梯价格') },
        {
          name: 'priceSourceMeaning',
          label: intl.get(`sodr.common.model.common.priceSource`).d('价格来源'),
        },
        {
          name: 'orderNum',
          label: intl.get(`sodr.common.model.common.sourceFromNum`).d('价格来源单据号'),
        },
      ],
    }),
    [line, tenantId]
  );
  const columns = useMemo(
    () => [
      {
        name: 'supplierCompanyNum',
        width: 120,
      },
      {
        name: 'supplierCompanyName',
        width: 120,
      },
      {
        name: 'supplierNum',
        width: 120,
      },
      {
        name: 'supplierName',
        width: 120,
      },

      {
        name: 'taxPrice',
        width: 100,
      },
      {
        name: 'unitPrice',
        width: 100,
      },
      {
        name: 'uomName',
        width: 80,
        renderer: ({ record }) => record.get('uomCodeAndName'),
      },
      {
        name: 'currencyCode',
        width: 80,
      },
      {
        name: 'taxCode',
        width: 80,
      },
      {
        name: 'taxRate',
        width: 80,
      },
      {
        name: 'quantity',
        width: 100,
        renderer: ({ record }) =>
          record.get('ladderInquiryFlag') === 1 ? (
            <Popover
              placement="bottomLeft"
              content={() => <LadderDetailTable record={record} />}
              arrowPointAtCenter
            >
              <a>{`${intl.get(`sodr.common.model.common.ladderPrice`).d('阶梯价格')}`}</a>
            </Popover>
          ) : (
            '-'
          ),
      },
      {
        name: 'priceSourceMeaning',
        width: 100,
      },
      {
        name: 'orderNum',
        width: 150,
      },
    ],
    []
  );
  return customizeTable
    ? customizeTable(
        {
          code: 'SODR.PURCHASE_REQUISITION_LIST.PROPOSED.PRICE',
          filterCode: 'SODR.PURCHASE_REQUISITION_LIST.FILTER_PROPOSED_PRICE',
        },
        useTable(dataSet, columns, { selectionMode: 'none', style })
      )
    : useTable(dataSet, columns, { selectionMode: 'none', style });
};

export default PriceModal;

import React, { useMemo, memo, useRef, useState } from 'react';
import { Modal, DataSet } from 'choerodon-ui/pro';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { dateRender } from 'utils/renderer';
import SearchBarTable from '_components/SearchBarTable';
import QueryField from '@/components/QueryField';
import { precisionRender } from '@/utils/precision';
import { taxPriceRender, regionRender } from '../ProtocolWorkbench/renderUtils';
import ViewFilter from '../ProtocolWorkbench/component/ViewFilter';
import { openTransfer } from '../agreement';
import FormPro from '../SagmWorkbench/Comps/FormPro';

const organizationId = getCurrentOrganizationId();

function AgmDetailTable(props) {
  const [aggregation, setAggregation] = useState(true);
  const {
    dataSet,
    skuPermission,
    searchBarCode,
    customizeUnitCode,
    onViewAgmDetail = (e) => e,
    customizeTable,
  } = props;

  const queryRef = useRef();

  function handleViewOther(record) {
    const fields = [
      // {
      //   name: 'agreementQuantity',
      //   renderer: precisionRender,
      //   label: intl.get('sagm.protocolManagement.model.agreementQuantity').d('协议数量'),
      // },
      {
        name: 'orderQuantity',
        renderer: precisionRender,
        label: intl.get('sagm.protocolManagement.model.orderQuantity').d('起订量'),
      },
      {
        name: 'deliveryDay',
        label: intl.get('sagm.protocolManagement.model.deliveryDay').d('供货周期（天）'),
      },
      {
        name: 'guaranteeDay',
        label: intl.get('sagm.protocolManagement.model.guaranteeDay').d('质保期（天）'),
      },
    ];
    const ds = new DataSet({ data: [record.toData()], fields });
    Modal.open({
      drawer: true,
      okCancel: false,
      title: intl.get('sagm.protocolManagement.view.otherInfo').d('其他信息'),
      style: { width: 380 },
      children: <FormPro readOnly dataSet={ds} fields={fields} columns={1} />,
    });
  }

  const columns = useMemo(
    () =>
      [
        { name: 'agreementStatusMeaning', width: 90 },
        {
          key: 'agmInfo',
          aggregation: true,
          align: 'left',
          minWidth: 280,
          header: intl.get('sagm.protocolManagement.view.protocolInfo').d('协议信息'),
          children: [
            {
              name: 'agreementNumber',
              minWidth: 170,
              renderer: ({ text, record }) => <a onClick={() => onViewAgmDetail(record)}>{text}</a>,
            },
            {
              name: 'agreementName',
              minWidth: 180,
            },
            {
              name: 'versionNum',
              width: 80,
              renderer: ({ value }) => (value ? `v${value}` : '-'),
            },
            {
              name: 'creationDate',
              width: 150,
            },
          ],
        },
        {
          key: 'companyInfo',
          width: 200,
          aggregation: true,
          align: 'left',
          header: intl.get('sagm.protocolManagement.view.companyInfo').d('供采公司'),
          children: [
            {
              name: 'companyName',
              minWidth: 180,
            },
            {
              name: 'supplierCompanyName',
              minWidth: 180,
            },
          ],
        },
        {
          key: 'itemInfo',
          width: 180,
          aggregation: true,
          align: 'left',
          header: intl.get('sagm.protocolManagement.view.itemInfo').d('物料信息'),
          children: [
            {
              name: 'itemCode',
              width: 120,
            },
            {
              name: 'itemName',
              minWidth: 180,
            },
            {
              name: 'itemCategoryCode',
              width: 150,
              renderer: ({ value, record }) => {
                const itemCategoryName = record.get('itemCategoryName');
                return value ? `${value}-${itemCategoryName || ''}` : '-';
              },
            },
            {
              name: 'uomName',
              width: 100,
            },
          ],
        },
        {
          key: 'priceInfo',
          width: 180,
          aggregation: true,
          align: 'left',
          header: intl.get('sagm.protocolManagement.view.priceInfo').d('价格信息'),
          children: [
            {
              name: 'taxPrice',
              width: 120,
              renderer: taxPriceRender,
            },
            {
              name: 'currencyName',
              width: 120,
            },
            {
              name: 'tax',
              width: 120,
              renderer: ({ value }) => value && math.floor(value),
            },
            {
              name: 'validDate',
              header: intl.get('sagm.common.view.validDate').d('有效期'),
              width: 150,
              renderer: ({ record }) => {
                const from = record.get('validDateFrom');
                const to = record.get('validDateTo');
                return (
                  <span>
                    {dateRender(from)}
                    {intl.get('small.common.model.to').d('至')}
                    {dateRender(to)}
                  </span>
                );
              },
            },
          ],
        },
        {
          key: 'saleInfo',
          width: 170,
          aggregation: true,
          align: 'left',
          header: intl.get('sagm.protocolManagement.view.saleInfo').d('可售信息'),
          children: [
            {
              name: 'saleRegion',
              width: 120,
              header: intl.get('sagm.protocolManagement.view.saleRegion').d('可售区域'),
              renderer: regionRender,
            },
            {
              name: 'otherInfo',
              width: 120,
              header: intl.get('sagm.protocolManagement.view.otherInfo').d('其他信息'),
              renderer: ({ record }) => (
                <a onClick={() => handleViewOther(record)}>
                  {intl.get('hzero.common.button.look').d('查看')}
                </a>
              ),
            },
          ],
        },
        {
          name: 'skuAction',
          header: intl.get('sagm.protocolManagement.view.productInfo').d('添加商品'),
          width: 110,
          lock: 'right',
          renderer: ({ record }) => (
            <a
              onClick={() =>
                openTransfer({
                  record,
                  mode: ['TERMINATED', 'DISABLED'].includes(record.get('agreementStatus'))
                    ? 'read'
                    : 'default',
                  isSup: true,
                  isCreateGo: true,
                  backPath: '/small/mall-received-agreement/list?tabKey=a',
                  skuApprove: skuPermission,
                  afterRequest: () => dataSet.query(dataSet.currentPage),
                })
              }
            >
              {intl
                .get('small.common.model.productManage', { value: record.get('detailsFlag') })
                .d(`商品管理(${record.get('detailsFlag')})`)}
            </a>
          ),
        },
      ].filter((f) => f.show || !('show' in f)),
    [skuPermission, aggregation]
  );

  const searchBarProps = {
    aggregation,
    style: { maxHeight: 'calc(100% - 22px)' },
    searchBarConfig: {
      fieldProps: {
        companyId: { lovPara: { tenantId: organizationId } },
        skuId: { lovPara: { tenantId: organizationId } },
      },
      onReset: () => {
        if (queryRef.current) queryRef.current.handleClear();
      },
      onClear: () => {
        if (queryRef.current) queryRef.current.handleClear();
      },
      left: {
        render: () => (
          <QueryField
            name="agreementNumbers"
            dataSet={dataSet}
            onRef={(ref) => {
              queryRef.current = ref;
            }}
            placeholder={intl
              .get('sagm.common.view.queryMsg.agreementCode')
              .d('请输入协议编码查询')}
          />
        ),
      },
      right: {
        render: () => (
          <ViewFilter
            aggregation={aggregation}
            onAggregationChange={(_aggregation) => {
              setAggregation(_aggregation);
            }}
          />
        ),
      },
    },
    cacheState: true,
    searchCode: searchBarCode,
    customizedCode: customizeUnitCode,
    onAggregationChange: setAggregation,
  };

  return customizeTable(
    { code: customizeUnitCode },
    <SearchBarTable dataSet={dataSet} columns={columns} {...searchBarProps} />
  );
}

export default memo(AgmDetailTable);

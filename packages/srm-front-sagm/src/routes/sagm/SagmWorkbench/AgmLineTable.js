import React, { useMemo, memo } from 'react';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import SearchBarTable from '_components/SearchBarTable';
import { precisionRender } from '@/utils/precision';
import { Tag } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';
import {
  agmTypeRenderer,
  agmStatusRenderer,
  agmLineActionColumn,
  agmLineOrgColumn,
  agmLinePurPriceColumn,
  agmLineSellPriceColumn,
  strategyDetailRenderer,
  strategyAdjustColumn,
} from './renderers';
import { viewLinePriceRecord } from './Drawers/record';

function AgmLineTable(props) {
  const {
    tabKey,
    dataSet,
    searchBarCode,
    customizeTable,
    customizeUnitCode,
    onViewDetail = e => e,
  } = props;

  const organizationId = useMemo(() => getCurrentOrganizationId(), []);

  const columns = useMemo(
    () => [
      {
        name: 'effectiveFlag',
        width: 100,
        header: intl.get('sagm.common.view.detailStatus').d('明细状态'),
        renderer: ({ value, record }) => {
          const type = value ? 'green' : 'gray';
          return (
            <Tag color={type} style={{ border: 'none' }}>
              {record.get('effectiveFlagMeaning')}
            </Tag>
          );
        },
      },
      tabKey === 'LINE_ALL' && agmLineActionColumn(),
      {
        name: 'agreementHeaderNum',
        width: 200,
        hidden: true,
        renderer: ({ text, record }) => <a onClick={() => onViewDetail(record)}>{text}</a>,
      },
      { name: 'agreementHeaderName', width: 200 },
      {
        name: 'statusCodeMeaning',
        width: 100,
        hidden: true,
        header: intl.get('sagm.common.view.agmStatus').d('协议状态'),
        renderer: agmStatusRenderer,
      },
      { name: 'skuCode', width: 120 },
      { name: 'skuName', width: 180 },
      agmLineOrgColumn(),
      { name: 'categoryName', width: 120 },
      { name: 'directoryName', width: 120 },
      { name: 'uomName', width: 80, hidden: true },
      { name: 'taxRate', width: 80, hidden: true },
      { name: 'currencyName', width: 100, hidden: true },
      { name: 'thirdSkuId', width: 140 },
      { name: 'supplierCompanyName', width: 200 },
      { name: 'marketPrice', width: 90, renderer: precisionRender },
      agmLinePurPriceColumn(),
      agmLineSellPriceColumn(),
      { name: 'strategyName', width: 120, hidden: true },
      {
        name: 'versionNum',
        width: 100,
        hidden: true,
        align: 'right',
        renderer: strategyDetailRenderer,
      },
      { name: 'addPricePercent', width: 120, hidden: true },
      strategyAdjustColumn({ hidden: true }),
      {
        name: 'overlinePriceEnableMeaning',
        hidden: true,
        width: 120,
        renderer: strategyDetailRenderer,
      },
      { name: 'agreementHeaderName', width: 200, hidden: true },
      {
        name: 'agreementHeaderTypeMeaning',
        width: 180,
        hidden: true,
        renderer: agmTypeRenderer,
      },
      {
        name: 'records',
        width: 120,
        hidden: true,
        renderer: ({ record }) =>
          record.get('priceStrategyId') ? (
            <Button funcType="link" onClick={() => viewLinePriceRecord(record)}>
              {intl.get('hzero.common.button.look').d('查看')}
            </Button>
          ) : (
            '-'
          ),
      },
    ],
    []
  );

  return customizeTable(
    { code: customizeUnitCode },
    <SearchBarTable
      cacheState
      dataSet={dataSet}
      columns={columns}
      searchCode={searchBarCode}
      searchBarConfig={{
        fieldProps: {
          orgId: { lovPara: { enabledFlag: 1 } },
          skuId: { lovPara: { tenantId: organizationId } },
          catalogId: { lovPara: { tenantId: organizationId } },
          directoryId: { lovPara: { tenantId: organizationId } },
          supplierCompanyId: { lovPara: { tenantId: organizationId } },
        },
        editorProps: { skuType: { clearButton: false } },
        // editorProps: {
        //   skuId: {
        //     searchFieldProps: {
        //       placeholder: intl.get('sagm.common.view.skuLov.placeholder').d('请输入商品名称/编码'),
        //     },
        //   },
        // },
      }}
      style={{ maxHeight: 'calc(100% - 4px)' }}
    />
  );
}

export default memo(AgmLineTable);

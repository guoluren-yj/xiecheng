import React, { memo, useMemo, useEffect, useState } from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';
import SearchBarTable from '_components/SearchBarTable';
import { precisionRender } from '@/utils/precision';
import { Tag } from 'choerodon-ui';
import getAgmLineDs from '../Stores/agmLineDs';
import { viewLinePriceRecord } from '../Drawers/record';
import {
  agmLineActionColumn,
  agmLineOrgColumn,
  agmLinePurPriceColumn,
  agmLineSellPriceColumn,
  overlinePriceRenderer,
  strategyAdjustColumn,
} from '../renderers';

const searchBarCode = 'SAGM.SALE_WORKBENCH.DETAIL.AGM_LINE.SEARCH_BAR';

export default memo(function SaleLine(props) {
  const { refresh, agreementHeaderId, path, customizeTable, isPub, readOnly } = props;
  const organizationId = useMemo(() => getCurrentOrganizationId(), []);
  const [firstFlag, setFirstFlag] = useState(false);

  const dataSet = useMemo(() => {
    const ds = new DataSet(
      getAgmLineDs(
        {
          queryParams: {
            agreementHeaderId,
            customizeUnitCode: `${searchBarCode},SAGM.SALE_WORKBENCH.DETAIL_LINE.TABLE`,
          },
        },
        { autoQuery: false, paging: !!agreementHeaderId, pageSize: 20 }
      )
    );
    return ds;
  }, [agreementHeaderId]);

  // 刷新
  useEffect(() => {
    if (!firstFlag) {
      setFirstFlag(true);
    } else {
      dataSet.query();
    }
  }, [refresh]);

  const getQueryParams = () => {
    const params =
      dataSet.queryDataSet && dataSet.queryDataSet.current && dataSet.queryDataSet.current.toData();
    return filterNullValueObject({
      agreementHeaderId,
      ...params,
    });
  };

  const columns = useMemo(
    () => [
      {
        name: 'effectiveFlag',
        width: 100,
        header: intl.get('hzero.common.status').d('状态'),
        renderer: ({ value, record }) => {
          const type = value ? 'green' : 'gray';
          return (
            <Tag color={type} style={{ border: 'none' }}>
              {record.get('effectiveFlagMeaning')}
            </Tag>
          );
        },
      },
      { name: 'skuCode', width: 120 },
      { name: 'skuName', width: 180 },
      agmLineOrgColumn(),
      { name: 'categoryName', width: 120 },
      { name: 'directoryName', width: 120 },
      { name: 'uomName', width: 80 },
      { name: 'taxRate', width: 80 },
      { name: 'currencyName', width: 100 },
      { name: 'thirdSkuId', width: 140 },
      { name: 'supplierCompanyName', width: 200 },
      { name: 'marketPrice', width: 90, renderer: precisionRender },
      agmLinePurPriceColumn(),
      agmLineSellPriceColumn(),
      { name: 'priceBatchQuantity', width: 120 },
      { name: 'strategyName', width: 120 },
      { name: 'creationDate', width: 120 },
      { name: 'addPricePercent', width: 120 },
      strategyAdjustColumn(),
      { name: 'overlinePriceEnableMeaning', width: 120, renderer: overlinePriceRenderer },
      {
        name: 'records',
        width: 120,
        renderer: ({ record }) =>
          record.get('priceStrategyId') ? (
            <Button funcType="link" onClick={() => viewLinePriceRecord(record)}>
              {intl.get('hzero.common.button.look').d('查看')}
            </Button>
          ) : (
            '-'
          ),
      },
      ...(readOnly ? [] : [agmLineActionColumn({ lock: 'right' })]),
    ],
    [readOnly]
  );

  return agreementHeaderId ? (
    customizeTable(
      {
        code: 'SAGM.SALE_WORKBENCH.DETAIL_LINE.TABLE',
        buttonCode: 'SAGM.SALE_WORKBENCH.COMMON.TABLE.BTNS',
      },
      <SearchBarTable
        dataSet={dataSet}
        columns={columns}
        searchCode={searchBarCode}
        style={{ maxHeight: 531 }}
        customizedCode="SAGM.SALE_AGREEMENT_WORKBENCH.DETAIL.SALE_LINE"
        buttons={
          isPub
            ? []
            : [
              <ExcelExport
                name="oldExport"
                exportAsync
                requestUrl={`/sagm/v1/${organizationId}/sale-agreement-lines/export`}
                queryParams={getQueryParams}
                otherButtonProps={{
                    type: 'c7n-pro',
                    funcType: 'flat',
                    color: 'primary',
                    icon: 'unarchive',
                  }}
              />,
              <ExcelExportPro
                name="newExport"
                templateCode="SAGM_SALE_AGREEMENT_LINE_EXPORT"
                buttonText={intl.get('sagm.common.button.exportNew').d('(新)导出')}
                requestUrl={`/sagm/v1/${organizationId}/sale-agreement-lines/export/new`}
                queryParams={getQueryParams}
                exportAsync
                otherButtonProps={{
                    type: 'c7n-pro',
                    funcType: 'flat',
                    color: 'primary',
                    icon: 'unarchive',
                    permissionList: [
                      {
                        code: `${path}.button.export-new`,
                        type: 'button',
                        meaning: '销售协议工作台-(新)详情行导出',
                      },
                    ],
                  }}
              />,
              ]
        }
        searchBarConfig={{
          closeFilterSelector: true,
          defaultExpand: true,
          fieldProps: {
            orgId: { lovPara: { enabledFlag: 1 } },
            skuId: { lovPara: { tenantId: organizationId, receiveFlag: 0 } },
            catalogId: { lovPara: { tenantId: organizationId } },
            directoryId: { lovPara: { tenantId: organizationId } },
            priceStrategyId: {
              lovPara: { tenantId: organizationId, statusCode: 'EXECUTED', agreementHeaderId },
            },
            supplierCompanyId: { lovPara: { tenantId: organizationId } },
          },
          editorProps: { skuType: { clearButton: false } },
        }}
      />
    )
  ) : (
    <Table
      dataSet={dataSet}
      columns={columns}
      // 勿删
      buttons={[]}
      style={{ maxHeight: 450 }}
      customizedCode="SAGM.SALE_AGREEMENT_WORKBENCH.DETAIL.SALE_LINE"
    />
  );
});

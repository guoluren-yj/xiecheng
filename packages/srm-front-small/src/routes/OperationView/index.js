import React, { useMemo, useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { DataSet, Form, Icon, Output, Table } from 'choerodon-ui/pro';
import { Tooltip } from 'choerodon-ui';
import qs from 'querystring';

import { Content, Header } from 'components/Page';
import FilterBar from '_components/FilterBarTable/FilterBar';
import ExcelExportPro from 'components/ExcelExportPro';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import openCompareModal from 'srm-front-smodr/lib/routes/components/CompareModal';

import { filterBarDs, summaryDs, detailTableDs } from './tableDs';
import styles from './index.less';

function PriceSavingsAnalysis({ history }) {
  const filterBarDataSet = useMemo(() => new DataSet(filterBarDs()), []);
  const summaryDataSet = useMemo(() => new DataSet(summaryDs()), []);
  const detailDataSet = useMemo(() => new DataSet(detailTableDs()), []);
  const cardConfigs = useMemo(() => summaryDs().fields, []);
  const [queryParams, setQueryParams] = useState({});

  const handleSearch = useCallback(
    ({ params } = {}) => {
      if (params) {
        summaryDataSet.query(1, params);
        detailDataSet.query(1, params);
        setQueryParams(params);
      }
    },
    [summaryDataSet, detailDataSet],
  );

  const handleToDetail = useCallback((record) => {
    history.push({
      pathname: '/s2-mall/oms/order-line/order-detail',
      search: qs.stringify({
        orderId: record.get('orderId'),
        backPath: '/small/price-savings-analysis/list',
      }),
    });
  }, []);

  const renderFlag = (value) => {
    return value === 1
      ? intl.get('hzero.common.button.yes').d('是')
      : intl.get('hzero.common.button.no').d('否');
  };

  const columns = [
    { name: 'orderCodeLine', width: 200, renderer: ({ value, record }) => <a onClick={() => handleToDetail(record)}>{value}</a>, },
    { name: 'skuCode', width: 150 },
    { name: 'skuName', width: 200 },
    { name: 'originalQuantityMeaning', align: 'right' },
    { name: 'unitPriceMeaning', align: 'right' },
    { name: 'entryAmountMeaning', align: 'right' },
    { name: 'purchaseCompanyName', width: 200},
    { name: 'supplierCompanyName', width: 200 },
    { name: 'ouName', width: 200 },
    { name: 'purOrganizationName', width: 200 },
    { name: 'buyerName' },
    { name: 'cecCreatedTime', width: 170 },
    {
      name: 'productCompareDTO',
      renderer: ({ value }) => (
        <a
          onClick={() => openCompareModal(value)}
        >
          {value
            ? intl.get('smodr.orderDetail.model.check').d('查看')
            : '-'}
        </a>
      ),
    },
    {
      name: 'lowestPrice',
      width: 150,
      align: 'left',
      renderer: ({ value }) => renderFlag(value),
    },
    {
      name: 'intelligenceFlag',
      width: 150,
      align: 'left',
      renderer: ({ value }) => renderFlag(value),
    },
    {
      name: 'lowestConversionPriceFlag',
      width: 150,
      align: 'left',
      renderer: ({ value }) => renderFlag(value),
    },
    { name: 'conversionPrice', align: 'right' },
  ];

  return (
    <>
      <Header title={intl.get('small.common.view.title').d('智能比价采购节流分析报表')}>
        <ExcelExportPro
          templateCode="SRM_C_SRM_S2FUL_ORDER_INTELLIGENCE_COMPARE"
          exportAsync
          method="POST"
          allBody
          buttonText={intl.get('hzero.common.button.export').d('导出')}
          requestUrl={`/smodr/v1/${getCurrentOrganizationId()}/order-entrys/intelligence-compare/report/line/export`}
          queryParams={queryParams}
          otherButtonProps={{
            type: 'c7n-pro',
            funcType: 'flat',
          }}
        />
      </Header>
      <Content className={styles['price-savings-content-wrapper']}>
      {/* 搜索栏 */}
      <div className="section-wrapper">
        <FilterBar
          dataSet={[filterBarDataSet]}
          onQuery={handleSearch}
        />
      </div>

      {/* 指标卡片区域 — 数组遍历渲染 */}
      <div className="card-area">
        <Form dataSet={summaryDataSet} columns={4} labelLayout="none">
          {cardConfigs.map((cfg) => (
            <Output
              key={cfg.name}
              name={cfg.name}
              colSpan={cfg.colSpan || 1}
              renderer={({ text, record }) => (
                <div className="card-block">
                  <div className="card-block-title">
                    {cfg.label}
                    {cfg.helpTip && (
                      <Tooltip title={cfg.helpTip}>
                        <Icon type='help' style={{ fontSize: 14 }}/>
                      </Tooltip>
                    )}
                    </div>
                  <div className="card-block-body">
                    <span className="metric-value" style={{ fontSize: 24, color: cfg.color }}>
                        {cfg.isCurrency && record && record.get('currencySymbol')}{text}
                      </span>
                  </div>
                </div>
              )}
            />
          ))}
        </Form>
      </div>

      {/* 明细表格 */}
      <div className="section-wrapper table-card-wrapper">
          <div className="table-card-title">
            {intl.get('small.common.card.detailTable').d('采购节流明细')}
          </div>
          <Table dataSet={detailDataSet} columns={columns} queryBar="none" customizedCode='SMAL.PRICE_SAVINGS_DETAIL_TABLE' />
      </div>
      </Content>
    </>
  );
}

export default formatterCollections({
  code: ['small.common', 'smodr.orderDetail', 'smodr.orderLine'],
})(observer(PriceSavingsAnalysis));

import React, { Component } from 'react';
import { Table, Lov } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { getCurrentOrganizationId, getResponse, filterNullValueObject } from 'utils/utils';
import notification from 'utils/notification';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';

import Detail from '@/routes/sagm/PriceStrategy/Detail';
import c7nModal, { showRecordModal } from '@/utils/c7nModal';
import { precisionRender } from '@/utils/precision';
import { updateSaleLine } from './api';
import openLadder from './ladder';

export default class SaleAgreement extends Component {
  organizationId = getCurrentOrganizationId();

  getColumns = () => {
    const columns = [
      { name: 'supplierCompanyName', width: 200 },
      { name: 'org', width: 140, renderer: this.renderOrgs },
      { name: 'skuCode', width: 120 },
      { name: 'thirdSkuId', width: 140 },
      { name: 'skuName', minWidth: 180 },
      { name: 'categoryName', width: 120 },
      { name: 'directoryName', width: 120 },
      { name: 'marketPrice', width: 90, renderer: precisionRender },
      { name: 'purchasePrice', width: 90, renderer: precisionRender },
      {
        name: 'sellingPrice',
        width: 100,
        renderer: ({ record }) => {
          const priceType = record.get('priceType');
          return priceType === 'LADDER_PRICE'
            ? intl.get('sagm.common.view.ladderPirce').d('阶梯价格')
            : precisionRender({ record, name: 'sellingPrice' });
        },
      },
      {
        name: 'priceType',
        width: 130,
        renderer: ({ text }) => yesOrNoRender(text === 'LADDER_PRICE' ? 1 : 0),
      },
      {
        name: 'saleAgreementLineLadders',
        width: 100,
        renderer: ({ record }) => {
          const { priceType, saleAgreementLineLadders, purAgreementLineLadders } = record.get([
            'priceType',
            'saleAgreementLineLadders',
            'purAgreementLineLadders',
          ]);
          const commonColumns = [
            {
              name: 'lineNum',
              width: 60,
            },
            {
              name: 'ladderFrom',
              minWidth: 100,
            },
            {
              name: 'ladderTo',
              minWidth: 100,
            },
          ];
          let otherCol = [];
          const isSale = saleAgreementLineLadders && saleAgreementLineLadders.length > 0;
          if (isSale) {
            otherCol = [
              {
                name: 'purchasePrice',
                minWidth: 120,
                renderer: ({ record: r }) => precisionRender({ name: 'purchasePrice', record: r }),
              },
              {
                name: 'salePrice',
                minWidth: 120,
                renderer: ({ record: r }) => precisionRender({ name: 'salePrice', record: r }),
              },
            ];
          } else {
            otherCol = [
              {
                name: 'unitPrice',
                minWidth: 120,
                renderer: ({ record: r }) => precisionRender({ name: 'unitPrice', record: r }),
              },
              {
                name: 'taxPrice',
                minWidth: 120,
                renderer: ({ record: r }) => precisionRender({ name: 'taxPrice', record: r }),
              },
            ];
          }
          const ladderColumns = [...commonColumns, ...otherCol];
          return priceType === 'LADDER_PRICE' ? (
            <a
              onClick={() =>
                openLadder({
                  readOnly: true,
                  columns: ladderColumns,
                  data: saleAgreementLineLadders || purAgreementLineLadders || [],
                })
              }
            >
              {intl.get('sagm.common.view.ladderPrice').d('阶梯价格')}
            </a>
          ) : (
            ''
          );
        },
      },
      { name: 'strategyName', width: 120 },
      { name: 'addPricePercent', width: 120 },
      { name: 'currencyName', width: 100 },
      { name: 'taxRate', width: 80 },
      {
        name: 'option',
        width: 120,
        renderer: ({ record }) => (
          <a
            onClick={() => this.handleOpenHistoryPrice(record)}
            disabled={!record.get('priceStrategyId')}
          >
            {intl.get('sagm.common.model.look').d('查看')}
          </a>
        ),
      },
      {
        name: 'action',
        width: 80,
        lock: 'right',
        renderer: ({ record }) =>
          record.get('priceStrategyId') && (
            <a onClick={() => this.handleUpdateLine(record)}>
              {record.get('effectiveFlag')
                ? intl.get('sagm.common.button.noEffective').d('失效')
                : intl.get('sagm.common.button.effective').d('生效')}
            </a>
          ),
      },
    ];
    return columns.filter((field) => field.show !== false);
  };

  renderOrgs = ({ record }) => {
    const { orgId, unitCode, unitName } = record.toData();
    return orgId === -2
      ? intl.get('sagm.common.model.allOrganizations').d('所有组织')
      : unitCode && unitName
      ? `${unitCode}-${unitName}`
      : '';
  };

  handleOpenHistoryPrice(record) {
    const { skuId, priceStrategyId, orgId, orgLevelPath } = record.toData();
    const columns = [
      { name: 'creationDate', width: 150 },
      { name: 'purchasePrice', width: 100, renderer: precisionRender },
      { name: 'salePrice', width: 100, renderer: precisionRender },
      {
        name: 'priceStrategyId',
        width: 100,
        renderer: ({ record: strategy }) => (
          <a onClick={() => this.handleViewDetail(strategy)}>
            {intl.get('sagm.priceStrategy.view.strategyDetail').d('策略明细')}
          </a>
        ),
      },
    ];
    const fields = [
      { name: 'creationDate', label: intl.get('sagm.common.view.time').d('时间') },
      {
        name: 'purchasePrice',
        type: 'number',
        label: intl.get('sagm.common.view.purchasePrice').d('采购价'),
      },
      {
        name: 'salePrice',
        type: 'number',
        label: intl.get('sagm.common.view.salePrice').d('销售价'),
      },
      { name: 'priceStrategyId', label: intl.get('sagm.common.view.priceStrategy').d('价格策略') },
    ];
    showRecordModal({
      fields,
      columns,
      width: 550,
      params: { skuId, priceStrategyId, orgId, orgLevelPath },
      url: `/sagm/v1/${this.organizationId}/sale-price-historys`,
      title: intl.get('sagm.common.view.priceHistoryRecord').d('价格历史记录'),
    });
  }

  handleViewDetail = (record) => {
    const { viewSkuBackPath } = this.props;
    const { priceStrategyId } = record.toData();
    const title = intl.get('sagm.priceStrategy.view.strategyDetail').d('策略明细');
    c7nModal({
      style: { width: 800 },
      footer: null,
      title,
      children: <Detail type={priceStrategyId} readOnly viewSkuBackPath={viewSkuBackPath} />,
    });
  };

  handleUpdateLine = async (record) => {
    const { tableDs } = this.props;
    const line = record.toData();
    const params = { saleLines: [line], suffix: line.effectiveFlag ? 'expired' : 'effected' };
    tableDs.status = 'loading';
    const res = getResponse(await updateSaleLine(params));
    tableDs.status = 'ready';
    if (res) {
      notification.success();
      tableDs.query(tableDs.currentPage);
    }
  };

  getQueryParams = () => {
    const { tableDs, agreementHeaderId } = this.props;
    const query = tableDs.queryDataSet.current && tableDs.queryDataSet.current.toData();
    return filterNullValueObject({
      agreementHeaderId,
      ...query,
    });
  };

  render() {
    const { agreementHeaderId } = this.props;

    const buttons = [
      <ExcelExport
        requestUrl={`/sagm/v1/${this.organizationId}/sale-agreement-lines/export`}
        queryParams={this.getQueryParams}
        exportAsync
        otherButtonProps={{
          type: 'c7n-pro',
          funcType: 'flat',
          color: 'primary',
          icon: 'unarchive',
        }}
      />,
      <ExcelExportPro
        templateCode="SAGM_SALE_AGREEMENT_LINE_EXPORT"
        buttonText={intl.get('sagm.common.button.exportNew').d('(新)导出')}
        requestUrl={`/sagm/v1/${this.organizationId}/sale-agreement-lines/export/new`}
        queryParams={this.getQueryParams}
        exportAsync
        otherButtonProps={{
          type: 'c7n-pro',
          funcType: 'flat',
          color: 'primary',
          icon: 'unarchive',
          permissionList: [
            {
              code: `${this.props.path}.button.export-new`,
              type: 'button',
              meaning: '销售协议管理-(新)详情行导出',
            },
          ],
        }}
      />,
    ];

    return (
      <Table
        dataSet={this.props.tableDs}
        columns={this.getColumns()}
        buttons={agreementHeaderId ? buttons : []}
        queryFields={{
          strategyLov: <Lov noCache />,
        }}
      />
    );
  }
}

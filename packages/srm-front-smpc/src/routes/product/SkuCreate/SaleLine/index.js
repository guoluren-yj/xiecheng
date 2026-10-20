import React, { Component } from 'react';
import { Table } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import { precisionRender } from '../../utilsApi/precision';
import { updateSaleLine } from '../api';
import openLadder from './ladder';

export default class SaleLine extends Component {
  getColumns = () => {
    const { isPoint = true, readOnly = false } = this.props;
    const columns = [
      { name: 'org', minWidth: 200, renderer: this.renderOrgs },
      { name: 'marketPrice', minWidth: 100 },
      { name: 'purchasePrice', minWidth: 100 },
      {
        name: 'sellingPrice',
        minWidth: 100,
        renderer: ({ record }) => {
          const { sellingPrice, priceType } = record.toData();
          return priceType === 'LADDER_PRICE'
            ? intl.get('smpc.product.view.ladderPrice').d('阶梯价格')
            : String(sellingPrice);
        },
      },
      {
        name: 'pointPrice',
        minWidth: 100,
        show: isPoint,
        editor: (record) => {
          const { priceType, priceStrategyId } = record.toData();
          return !readOnly && priceStrategyId && priceType !== 'LADDER_PRICE';
        },
      },
      {
        name: 'priceType',
        width: 130,
        renderer: ({ text }) => yesOrNoRender(text === 'LADDER_PRICE' ? 1 : 0),
      },
      {
        name: 'ladderPrices',
        width: 120,
        renderer: ({ record }) => {
          const {
            priceType,
            priceStrategyId,
            agreementHeaderType,
            saleAgreementLineLadders,
            purAgreementLineLadders,
          } = record.toData();
          const pointFlag = agreementHeaderType === 'POINTS';
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
          if (pointFlag) {
            ladderColumns.push({
              name: 'pointPrice',
              minWidth: 120,
              editor: !!priceStrategyId,
            });
          }
          return priceType === 'LADDER_PRICE' ? (
            <a
              onClick={() =>
                openLadder({
                  readOnly: readOnly || !priceStrategyId || !pointFlag,
                  columns: ladderColumns,
                  data: saleAgreementLineLadders || purAgreementLineLadders || [],
                  onSave: (ladders) => {
                    record.set('saleAgreementLineLadders', ladders);
                    if (ladders.length > 0) {
                      const { pointPrice } = ladders[0];
                      record.set('pointPrice', pointPrice);
                    }
                  },
                })
              }
            >
              {intl.get('smpc.product.view.ladderPrice').d('阶梯价格')}
            </a>
          ) : (
            ''
          );
        },
      },
      { name: 'currencyName', width: 100 },
      { name: 'taxRate', width: 80 },
      {
        name: 'action',
        width: 100,
        lock: 'right',
        renderer: ({ record }) =>
          record.get('priceStrategyId') && (
            <a onClick={() => this.handleUpdateLine(record)}>
              {record.get('effectiveFlag')
                ? intl.get('smpc.product.view.invalid').d('失效')
                : intl.get('smpc.product.view.effect').d('生效')}
            </a>
          ),
      },
    ];
    return columns.filter((field) => field.show !== false);
  };

  renderOrgs = ({ record }) => {
    const { orgId, unitCode, unitName } = record.toData();
    return orgId === -2
      ? intl.get('smpc.product.model.allUnit').d('所有组织')
      : unitCode && unitName
      ? `${unitCode}-${unitName}`
      : '';
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

  render() {
    const { readOnly, tableDs, isPoint } = this.props;
    const buttons = readOnly || !isPoint ? [] : ['save'];
    return <Table dataSet={tableDs} columns={this.getColumns()} buttons={buttons} />;
  }
}

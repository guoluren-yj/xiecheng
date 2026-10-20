/**
 * LadderLevelModal - 寻源服务/询价大厅-还比价-阶梯还价
 * @date: 2019-3-26
 * @author: HZL <zili.hou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Table, Form, Output, Tooltip } from 'choerodon-ui/pro';
import { Popover } from 'choerodon-ui';
import { Bind, Throttle } from 'lodash-decorators';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { numberSeparatorRender } from '@/utils/renderer';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import { yesOrNoRender } from 'utils/renderer';

@observer
export default class LadderLevelModal extends React.Component {
  componentDidMount() {
    const { dataSet } = this.props;
    dataSet.query();
  }

  /**
   * 阶梯报价头信息查询
   */
  @Throttle(800)
  @Bind()
  fetchLadderLevelyHeader() {
    const { record } = this.props;
    const { supplierCompanyName, itemCode, itemName } = record.get([
      'supplierCompanyName',
      'itemCode',
      'itemName',
    ]);
    return (
      <Form columns={3}>
        <Output
          label={intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称')}
          renderer={() => (
            <Tooltip title={supplierCompanyName} placement="topLeft">
              {supplierCompanyName.length > 8
                ? `${supplierCompanyName.substr(0, 8)}...`
                : supplierCompanyName}
            </Tooltip>
          )}
        />
        <Output
          label={intl.get(`ssrc.inquiryHall.model.inquiryHall.itemsCode`).d('物料编码')}
          value={itemCode}
        />
        <Output
          label={intl.get(`ssrc.inquiryHall.model.inquiryHall.itemsName`).d('物料名称')}
          value={itemName}
        />
      </Form>
    );
  }

  getCurrentColumns = () => {
    const { record, doubleUnitFlag = false } = this.props;

    const columns = [
      {
        name: 'rfxLadderLineNum',
        width: 80,
      },
      doubleUnitFlag
        ? {
            name: 'secondaryLadderFrom',
            width: 100,
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'secondaryLadderTo',
            width: 100,
          }
        : null,
      {
        name: 'ladderFrom',
        width: 120,
      },
      {
        name: 'ladderTo',
        width: 120,
      },
      doubleUnitFlag
        ? {
            name: 'validLadderSecPrice',
            width: 100,
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'validNetLadderSecPrice',
            width: 100,
          }
        : null,
      {
        name: 'validLadderPrice',
        width: 120,
      },
      {
        name: 'validNetLadderPrice',
        width: 120,
      },
      {
        name: 'cumulativeFlag',
        width: 80,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'currentBargainPrice',
        width: 100,
        editor: (line) => {
          return (
            <C7nPrecisionInputNumber
              name="currentBargainPrice"
              currency="quotationCurrencyCode"
              record={line}
              headerRecord={record}
              omitZeroFlag
            />
          );
        },
        renderer: ({ record: _record, value }) =>
          numberSeparatorRender(value, _record.getState('currency_precision'), {
            omitZeroFlag: true,
          }),
      },
      {
        name: 'currentBargainRemark',
        width: 100,
        editor: true,
      },
      {
        name: 'validBargainPrice',
        width: 100,
        renderer: ({ value }) =>
          value ? (
            <Popover placement="topLeft" content={numberSeparatorRender(value)}>
              {numberSeparatorRender(value)}
            </Popover>
          ) : null,
      },
      {
        name: 'validBargainRemark',
        width: 120,
        renderer: ({ value }) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
    ].filter(Boolean);

    return columns.filter(Boolean);
  };

  // 当前供应商分类表格
  feedLadderLevelyTable() {
    const { dataSet } = this.props;
    const columns = this.getCurrentColumns();

    return (
      <React.Fragment>
        <Table dataSet={dataSet} columns={columns} style={{ maxHeight: 'calc(100vh - 200px)' }} />
      </React.Fragment>
    );
  }

  render() {
    return (
      <React.Fragment>
        {this.fetchLadderLevelyHeader()}
        {this.feedLadderLevelyTable()}
      </React.Fragment>
    );
  }
}

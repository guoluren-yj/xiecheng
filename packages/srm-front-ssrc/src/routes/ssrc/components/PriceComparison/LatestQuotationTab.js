import React, { PureComponent } from 'react';
import { Table, Button } from 'hzero-ui';
import { Tooltip as C7nTooltip } from 'choerodon-ui/pro';
import { isEmpty, isNil } from 'lodash';
import { Chart, Geom, Axis, Tooltip, Legend } from 'bizcharts';
import DataSet from '@antv/data-set';

import intl from 'utils/intl';

import { numberSeparatorRender } from '@/utils/renderer';
import style from './index.less';

export default class LatestQuotationTab extends PureComponent {
  componentDidMount() {
    this.handleCuxInit();
  }

  // handle cux
  handleCuxInit = () => {
    const { remote } = this.props;

    if (remote?.event) {
      remote.event.fireEvent('remoteInitLatestQuotationTab', {
        that: this,
      });
    }
  };

  /**
   * 渲染数据源
   */
  renderDataSource(dataSource) {
    const { doubleUnitFlag, remote } = this.props;
    let newDataSource = [];
    newDataSource = dataSource.map((item) => {
      const { supplierQuotationPriceList = [], lowestQuotationPrice, ...otherItem } = item;
      let elementValue = {};
      supplierQuotationPriceList.forEach((ele) => {
        elementValue = {
          ...elementValue,
          [`supplierPrice${ele.rfxLineSupplierId}`]: !isNil(ele.sumPrice)
            ? numberSeparatorRender(ele.sumPrice)
            : doubleUnitFlag
            ? numberSeparatorRender(ele.validQuotationSecPrice)
            : numberSeparatorRender(ele.validQuotationPrice),
          [`${ele.rfxLineSupplierId}auctionDirectionTopFlag`]: ele.auctionDirectionTopFlag || 0,
        };
      });
      return {
        lowestQuotationPrice: numberSeparatorRender(lowestQuotationPrice),
        ...otherItem,
        ...elementValue,
      };
    });
    const otherProps = {
      dataSource,
      doubleUnitFlag,
    };
    return remote
      ? remote.process(
          'PRICE_COMPARISON_PROCESS_LATEST_QUOTATION_DATASOURCE',
          newDataSource,
          otherProps
        )
      : newDataSource;
  }

  /**
   * 渲染列
   */
  renderColumns(dataSource) {
    const { remote, sourceKey = '' } = this.props;
    let columns = [];
    if (!isEmpty(dataSource)) {
      const { supplierQuotationPriceList } = dataSource[dataSource.length - 1];
      columns = supplierQuotationPriceList.map((ele) => {
        return {
          title: (
            <span>
              <span className={style['priceComparisonTab-supplierName']}>
                {ele.supplierCompanyName}
              </span>
              {this.renderSupplierTag(ele)}
            </span>
          ),
          dataIndex: `supplierPrice${ele.rfxLineSupplierId}`,
          width: 230,
          align: 'right',
          render: (val, record) =>
            record[`${ele.rfxLineSupplierId}auctionDirectionTopFlag`] === 1 ? (
              <span
                style={{
                  color: remote
                    ? remote?.process(
                        'PRICE_COMPARISON_PROCESS_LATEST_QUOTATION_COLUMNS_COLOR',
                        'red'
                      )
                    : 'red',
                }}
              >
                {numberSeparatorRender(val)}
              </span>
            ) : (
              numberSeparatorRender(val)
            ),
        };
      });
    }
    const latestColumns = [
      {
        title: '',
        dataIndex: 'itemName',
        width: 330,
        fixed: 'left',
        render: (_, record) =>
          record.itemCode ? (
            <C7nTooltip title={`${record.itemCode} - ${record.itemName}`} placement="topLeft">
              <span>
                {record.itemCode} - {record.itemName}
              </span>
            </C7nTooltip>
          ) : (
            <C7nTooltip title={`${record.itemName}`} placement="topLeft">
              <span>{record.itemName}</span>
            </C7nTooltip>
          ),
      },
      ...columns,
      {
        title: dataSource?.[0]?.benchmarkPriceTypeMeaning
          ? `${
              dataSource?.[0]?.auctionDirection === 'FORWARD'
                ? intl.get('ssrc.priceComparison.model.comparison.highestPrice').d('最高价')
                : intl.get('ssrc.priceComparison.model.comparison.lowestPrice').d('最低价')
            }(${dataSource?.[0]?.benchmarkPriceTypeMeaning})`
          : intl.get('ssrc.priceComparison.model.comparison.lowestPrice').d('最低价'),
        // dataIndex: 'lowestQuotationPrice',
        width: 230,
        render: (_value, record) => {
          if (record.sumFlag === 1) {
            return numberSeparatorRender(
              dataSource?.[0]?.auctionDirection === 'FORWARD'
                ? record.highestSumPrice
                : record.lowestSumPrice
            );
          } else {
            return numberSeparatorRender(
              dataSource?.[0]?.auctionDirection === 'FORWARD'
                ? record.highestQuotationPrice
                : record.lowestQuotationPrice
            );
          }
        },
      },
    ];
    const otherProps = {
      dataSource,
      sourceKey,
      that: this,
    };
    return remote
      ? remote.process(
          'PRICE_COMPARISON_PROCESS_LATEST_QUOTATION_COLUMNS',
          latestColumns,
          otherProps
        )
      : latestColumns;
  }

  renderSupplierTag(item) {
    const tagList = [];
    if (Number(item.wholeSuggestFlag) === 1) {
      tagList.push(
        <span className={style['priceComparisonTab-supplierSelectTag']}>
          {intl.get('ssrc.inquiryHall.model.inquiryHall.all.selected').d('全部选用')}
        </span>
      );
    } else if (Number(item.partSuggestFlag) === 1) {
      tagList.push(
        <span className={style['priceComparisonTab-supplierSelectTag']}>
          {intl.get('ssrc.inquiryHall.model.inquiryHall.part.selected').d('部分选用')}
        </span>
      );
    }
    if (Number(item.allEliminate) === 1) {
      tagList.push(
        <span className={style['priceComparisonTab-supplierTag']}>
          {intl.get('ssrc.common.view.status.allEliminate').d('全部淘汰')}
        </span>
      );
    } else if (Number(item.partEliminate) === 1) {
      tagList.push(
        <span className={style['priceComparisonTab-supplierTag']}>
          {intl.get('ssrc.common.view.status.partiallyEliminate').d('部分淘汰')}
        </span>
      );
    } else if (item.summaryReviewResult === 'NO_APPROVED') {
      tagList.push(
        <span className={style['priceComparisonTab-supplierTag']}>
          {intl.get('ssrc.common.view.status.noApprovedCheck').d('未通过检查')}
        </span>
      );
    } else if (Number(item.invalidFlag) === 1) {
      tagList.push(
        <span className={style['priceComparisonTab-supplierTag']}>
          {intl.get('ssrc.common.view.status.invalid').d('无效')}
        </span>
      );
    }
    // 供应商状态为禁止报价
    if (item.supplierStatus === 'PROHIBIT_QUOTATION') {
      tagList.push(
        <span className={style['priceComparisonTab-supplierTag']}>
          {intl.get('ssrc.common.view.status.banQuotation').d('禁止报价')}
        </span>
      );
    }
    return tagList;
  }

  render() {
    const {
      dataSource = [],
      chartDataSource = [],
      chartXList = [],
      type = 'table',
      loading,
      onChangeType,
      remote,
    } = this.props;
    const ds = new DataSet();
    const dv = ds.createView().source(chartDataSource);
    dv.transform({
      type: 'fold',
      fields: chartXList,
      key: 'itemItem',
      value: 'itemPrice',
    });

    const tableDom = (
      <Table
        bordered
        rowKey="itemId"
        loading={loading}
        pagination={false}
        columns={this.renderColumns(dataSource)}
        dataSource={this.renderDataSource(dataSource)}
      />
    );

    const chartDom = (
      <Chart height={400} data={dv} forceFit padding="auto">
        <Axis
          name="itemItem"
          label={{
            formatter: (val) => {
              return val.replace(' ', '\n');
            },
          }}
        />
        <Axis name="itemPrice" />
        <Tooltip showTitle={false} />
        <Legend />
        <Geom
          type="interval"
          position="itemItem*itemPrice"
          color="name"
          adjust={[{ type: 'dodge', marginRatio: 1 / 32 }]}
        />
      </Chart>
    );

    const buttonDom = (
      <div className={style['latest-title']}>
        {type === 'table'
          ? intl
              .get(`ssrc.priceComparison.model.comparison.latestQuotationEdition`)
              .d('最新报价表格版')
          : intl
              .get(`ssrc.priceComparison.model.comparison.newQuoBucketChat`)
              .d('最新报价柱形图版')}
        <Button
          type="default"
          icon="bar-chart"
          onClick={() => onChangeType('chart')}
          className={style['latest-title-btn']}
        />
        <Button
          type="default"
          icon="table"
          onClick={() => onChangeType('table')}
          className={style['latest-title-btn']}
        />
      </div>
    );

    let currentDom = (
      <>
        {buttonDom}
        {type === 'table' ? tableDom : chartDom}
      </>
    );

    currentDom = remote
      ? remote.process('PRICE_COMPARISON_PROCESS_LATEST_RENDERERDOM', currentDom, {
          that: this,
          tableDom,
          chartDom,
          buttonDom,
          ds,
          dv,
        })
      : currentDom;

    return <React.Fragment>{currentDom}</React.Fragment>;
  }
}

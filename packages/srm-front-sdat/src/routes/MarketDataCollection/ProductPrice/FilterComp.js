import React, { Component } from 'react';
import intl from 'utils/intl';
import moment from 'moment';
import FilterBar from 'srm-front-boot/lib/components/FilterBarTable/FilterBar';

class FilterComp extends Component {
  /**
   * 处理清空事件，重置价格业务时间。
   * 使用防抖机制防止连续快速点击导致 DataSet 内部 reset 与 set 冲突从而清空数据的问题。
   */
  handleClear = () => {
    const { priceDS } = this.props;
    if (this.clearTimer) {
      clearTimeout(this.clearTimer);
    }
    this.clearTimer = setTimeout(() => {
      if (priceDS && priceDS.queryDataSet && priceDS.queryDataSet.current) {
        priceDS.queryDataSet.current.set('priceDate', [moment().subtract(30, 'days'), moment()]);
      }
    }, 50);
  };

  /**
   * 组件卸载时清除定时器，防止内存泄漏。
   */
  componentWillUnmount() {
    if (this.clearTimer) {
      clearTimeout(this.clearTimer);
    }
  }

  render() {
    const { priceDS, onFilterQuery = () => {}, cacheKey } = this.props;

    return (
      <FilterBar
        ref={(ref) => {
          this.filterBarRef = ref;
        }}
        dataSet={[priceDS]}
        cacheState
        cacheKey={cacheKey}
        checkDataSetStatus={false}
        onQuery={onFilterQuery}
        onClear={this.handleClear}
        fields={[
          {
            name: 'specifications',
            label: intl.get('sdat.productPrice.view.model').d('规格型号'),
            type: 'string',
            merge: true,
            display: true,
          },
          {
            name: 'market',
            label: intl.get('sdat.productPrice.view.market').d('市场'),
            type: 'string',
            display: true,
          },
          {
            name: 'priceTypeList',
            label: intl.get('sdat.productPrice.model.priceType').d('价格类型'),
            type: 'string',
            lookupCode: 'SDAT.MDC_PRICE_TYPE',
            display: true,
            multiple: true,
          },
          {
            name: 'priceDate',
            label: intl.get('sdat.productPrice.view.priceBusinessTime').d('价格业务时间'),
            type: 'date',
            range: true,
            display: true,
            // required: true,
            defaultValue: [moment().subtract(30, 'days'), moment()],
            // validator: (value) => {
            //   if (value && value[0] && value[1]) {
            //     const start = moment(value[0]);
            //     const end = moment(value[1]);
            //     if (end.diff(start, 'days') > 30) {
            //       return intl
            //         .get('sdat.productPrice.view.validation.priceDateRangeLimit')
            //         .d('日期范围不能超过30天');
            //     }
            //   }
            //   return true;
            // },
          },
        ]}
      />
    );
  }
}

export default FilterComp;

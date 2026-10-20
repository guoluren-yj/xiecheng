/**
 * 日式，荷兰 聚合表格
 * 考虑到 JAPANDUTCHAggregationTable 会共用，包一层，做逻辑处理
 * 
 * 比价助手组件在引用，请谨慎修改 src/routes/ssrc/components/PriceComparison/ThisQuoteProcessTab.js
*/

import React from 'react';
import { observer } from 'mobx-react';

import JAPANDUTCHAggregationTable from "./JAPANDUTCHAggregationTable";

import style from './index.less';

// 总价竞价供应商列表
const JAPANDUTCHAggregationTableList = observer((props = {}) => {
  const {
    header,
    japanDutchAggregationTableDs,
  } = props || {};

  const tableProps = {
    tableDs: japanDutchAggregationTableDs,
    header,
    ...props,
  };

  return (
    <div className={style['pur-main-content-bidding-list-supplier-wrapper']}>
      <div className={style['pur-main-content-bidding-list-supplier-table-wrapper']}>
        <JAPANDUTCHAggregationTable
          {...tableProps}
        />
      </div>
    </div>
  );
});

export default JAPANDUTCHAggregationTableList;

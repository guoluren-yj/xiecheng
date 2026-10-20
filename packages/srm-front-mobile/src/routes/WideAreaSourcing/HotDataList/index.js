/**
 * dropDown 热门品类
 */
import React, { useState, useEffect } from 'react';
import intl from 'utils/intl';
import './index.less';

import { getTopListApi } from '@/services/wideAreaService';

export default function HotDataList(props = {}) {
  const [topData, setTopData] = useState([]);

  const { onSelected } = props;

  useEffect(() => {
    getTopListApi().then((data) => {
      setTopData(data);
    });
  }, []);

  return (
    <div className="hotdata">
      <div className="hotdata-title">
        {intl.get('smbl.wideAreaSourcing.view.title.hotCategory').d('热门品类')}
      </div>
      <div className="hotdata-list">
        {topData.map((item, index) => {
          return (
            <div className="hotdata-list-item" key={item} onClick={() => onSelected(item.itemName)}>
              <div className="hotdata-list-item-head">
                <span className={['hodata-tag', ['first', 'second', 'third'][index]].join(' ')}>
                  Top{index + 1}
                </span>
                <span>{item.itemName}</span>
              </div>
              <div className="hotdata-list-item-count">
                {intl
                  .get('smbl.wideAreaSourcing.view.title.total.nums', { count: item.totalSupplier })
                  .d(`共${item.totalSupplier}家企业`)}{' '}
              </div>
              <div className="hotdata-list-city">
                {item.suppliers.map((city) => {
                  return (
                    <div className="hotdata-list-city-item" key={city}>
                      {city.province} <span className="city-count">{city.num}</span>{' '}
                      {intl.get('smbl.wideAreaSourcing.view.title.home').d('家')}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * SearchBar - 筛选器
 * @date: 2021-11-10
 * @author: Goku<xu.pan01@going-link.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2021, ZhenYun
 */
import React, { useState, useCallback, useEffect } from 'react';
import { map, isFunction, isEmpty } from 'lodash';

import formatterCollections from 'utils/intl/formatterCollections';
import { queryMapIdpValue } from 'services/api';

import { clsPrefix } from './utils/constant';

import Field from './components/Field';
import './index.less';

function SearchBar(props) {
  const { renderLeftLayout, renderRightLayout, queryDs, queryFields = [] } = props;

  const [currentField] = useState({});

  const handleSelectField = useCallback(() => {}, []);

  useEffect(() => {
    // 查询lov数据
    fetchLovData();
    // 默认创建一条record
    queryDs.create();
  }, []);

  const fetchLovData = () => {
    queryMapIdpValue({
      comparisonSet: 'HPFM.CUST.FIELD_QUERY_REALTION',
    }).then((res) => {
      if (res && !isEmpty(res.comparisonSet)) {
        const tempComparisonSetObj = {};
        res.comparisonSet.forEach((item) => {
          tempComparisonSetObj[item.value] = item.meaning;
        });
      }
    });
  };

  /**
   * 渲染所有query Fields
   */
  const renderFields = () => {
    return (
      <div style={{ display: 'flex' }}>
        {/* 左侧自定义区域 */}
        {isFunction(renderLeftLayout) && renderLeftLayout()}
        {/* 查询条件 */}
        <div className={`${clsPrefix}-fields-wrap`}>
          {map(queryFields, (field) => {
            return (
              <div key={field.name}>
                <Field
                  autoFocus={currentField.name === field.name}
                  field={field}
                  dataSet={queryDs}
                  onDelete={handleSelectField}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  return (
    <div className={clsPrefix}>
      {/* 自定义左侧布局 */}
      <div className={`${clsPrefix}-left`}>
        <div className={`${clsPrefix}-fields`}>{renderFields()}</div>
      </div>
      {/* 自定义右侧布局 */}
      {isFunction(renderRightLayout) && <div className="right-wrapper">{renderRightLayout()}</div>}
    </div>
  );
}

export default formatterCollections({ code: ['ssrc.searchBar'] })(SearchBar);

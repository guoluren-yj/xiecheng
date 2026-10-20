/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2021-06-29 10:23:32
 * @LastEditors: yanglin
 * @LastEditTime: 2024-04-02 19:09:01
 */
import React, { Fragment } from 'react';
import { Popover } from 'choerodon-ui';

import './../index.less';

/**
 * 普通多行渲染
 * @param {{multiLineFields = [] record, dataSet}} param0 多行表的一些属性，{multiLineFields = [] record, dataSet }
 * @param {[]} custObjList 自义定渲染
 * 格式 [{name: 字段名1, content: 渲染内容(VNODE)}]
 */
export function mutiLineRender({ multiLineFields = [], record, dataSet }, custObjList) {
  const newMultiLineFields = multiLineFields?.map(LineField => {
    const label = `${dataSet.getField(LineField.get('name')).get('label')}:`;
    let mean = {};
    const currentCustObj =
      custObjList &&
      custObjList.length > 0 &&
      custObjList.filter(item => item.name === LineField.get('name'));
    if (currentCustObj && currentCustObj.length > 0) {
      if (currentCustObj[0].content) {
        mean = {
          label,
          content: currentCustObj[0].content,
        };
      } else {
        mean = null;
      }
    } else {
      mean = {
        label,
        content: (
          <Popover className="popoverContent" content={record.get(LineField.get('name'))}>
            {record.get(LineField.get('name'))}
          </Popover>
        ),
      };
    }
    return mean;
  });

  const renderMultiLineFields = newMultiLineFields.filter(Boolean);

  const renderContent = (contentItems, overFlag) => {
    return overFlag ? (
      <div className="over-content">
        {contentItems &&
          contentItems.length &&
          contentItems?.map(item => (
            <div className="moreContent">
              <span className="multiLineLabel">{item.label}</span>
              {item.content}
            </div>
          ))}
      </div>
    ) : (
      <Fragment>
        {contentItems &&
          contentItems.length &&
          contentItems?.map(item => (
            <div>
              <span className="multiLineLabel">{item.label}</span>
              {item.content}
            </div>
          ))}
      </Fragment>
    );
  };

  if (renderMultiLineFields && renderMultiLineFields.length < 4) {
    return renderContent(renderMultiLineFields);
  } else if (renderMultiLineFields.length > 3) {
    const otherItem = renderMultiLineFields.slice(2);
    return (
      <Fragment>
        {renderContent(renderMultiLineFields.slice(0, 2))}
        <Popover placement="right" content={renderContent(otherItem, true)}>
          <span className="ellipsis">. . .</span>
        </Popover>
      </Fragment>
    );
  }
}

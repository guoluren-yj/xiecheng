/* eslint-disable no-unused-expressions */
/*
 * @Descripttion: 寻源过程控制--对更新内容的渲染
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2021-07-22 10:23:46
 * @LastEditors: yiping.liu
 */
import React from 'react';
import { Popover } from 'choerodon-ui';
import moment from 'moment';
import { isEmpty } from 'lodash';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { observer } from 'mobx-react';

import styles from './CardMessage/index.less';

export const ComponentDiffRender = observer((props) => {
  const {
    children,
    historyDTO = '',
    name,
    special,
    display = '',
    change = '',
    check = false,
  } = props;
  let { record } = props;
  if (special) {
    record = record?.current;
  }
  const historyValue = check
    ? record?.get(historyDTO)
      ? record?.get(historyDTO)[name]
      : ''
    : record?.get(historyDTO)
    ? record?.get(historyDTO)[change || name]
    : null;
  const currentValue = check
    ? record?.get(name) || 0
    : record?.get(change || name)?._d
    ? moment(record?.get(change || name)).format(DEFAULT_DATETIME_FORMAT)
    : record?.get(change || name) || null;
  let adjustFields = [];
  if (record?.get('adjustFields')?.length) {
    adjustFields = record?.get('adjustFields').toJS();
  }
  // 对比原始值
  if (historyValue !== currentValue) {
    if (display) {
      if (!adjustFields.includes(display)) {
        record?.set('adjustFields', [...adjustFields, display]);
      }
    } else if (!adjustFields.includes(name)) {
      record?.set('adjustFields', [...adjustFields, name]);
    }
  } else if (display) {
    const index = adjustFields.indexOf(display);
    adjustFields.splice(index, 1);
    record?.set('adjustFields', adjustFields.length ? adjustFields : null);
  } else if (adjustFields.includes(name)) {
    const index = adjustFields.indexOf(name);
    adjustFields.splice(index, 1);
    record?.set('adjustFields', adjustFields.length ? adjustFields : null);
  }
  return (
    <div className={styles['diff-render-component']}>
      {historyValue === currentValue ? (
        <div>{children}</div>
      ) : historyValue ? (
        <div className={styles['diff-render-red']}>
          {check ? children : <Popover content={historyValue || ''}>{children}</Popover>}
        </div>
      ) : (
        <div className={styles['diff-render-red']}>{children}</div>
      )}
    </div>
  );
});

export const historyDiffRenderComp = (
  record,
  dataSet,
  historyDTO = {},
  name = null,
  text = null,
  type = null
) => {
  if (!name || isEmpty(record) || !dataSet) {
    return null;
  }

  const currentField = dataSet.getField(name);
  const lookupCode = currentField?.get('lookupCode');

  const telText = dataSet.getField('internationalTelCode');

  const historyValue = type
    ? record.get(historyDTO)
      ? `${telText?.getText(record.get(historyDTO)?.internationalTelCode)} | ${
          record.get(historyDTO)[name]
        }`
      : ''
    : record.get(historyDTO)
    ? record.get(historyDTO)[name] === 0
      ? 0
      : record.get(historyDTO)[name]
    : '';
  const currentValue = type
    ? `${telText?.getText(record.get('internationalTelCode'))} | ${record.get(name)}`
    : record.get(name)?._d
    ? moment(record.get(name)).format(DEFAULT_DATETIME_FORMAT)
    : record.get(name) === 0
    ? 0
    : record.get(name) || null;

  let adjustFields = [];
  if (record.get('adjustFields')?.length) {
    adjustFields = record.get('adjustFields').toJS();
  }

  if (historyValue !== currentValue) {
    if (!adjustFields.includes(name)) {
      const arr = [...adjustFields, name];
      // 修复专家变更未传ID
      if (historyDTO === 'rfExpert' && name === 'loginName' && !arr.includes('memberUserId')) {
        arr.push('expertUserId');
      }
      // 修复成员变更未传ID
      if (historyDTO === 'rfMember' && name === 'loginName' && !arr.includes('memberUserId')) {
        arr.push('memberUserId');
      }
      record?.set('adjustFields', arr);
    }
  } else if (adjustFields.includes(name)) {
    const index = adjustFields.indexOf(name);
    adjustFields.splice(index, 1);
    if (historyDTO === 'rfExpert' && name === 'loginName') {
      const idx = adjustFields.indexOf('expertUserId');
      if (idx > -1) {
        adjustFields.splice(idx, 1);
      }
    }
    if (historyDTO === 'rfMember' && name === 'loginName') {
      const idx = adjustFields.indexOf('expertUserId');
      if (idx > -1) {
        adjustFields.splice(idx, 1);
      }
    }
    record?.set('adjustFields', adjustFields.length ? adjustFields : null);
  }

  const children = lookupCode
    ? text
    : type
    ? record.get(name)
      ? `${telText?.getText(record.get('internationalTelCode'))} | ${record.get(name)}`
      : ''
    : record.get(name);

  const Styles = {
    width: !children && '100%',
    height: !children && '0.28rem',
  };

  // 判空但不包含数字
  const emptyNotNumber = (value) => {
    if (typeof value === 'number') {
      return false;
    }
    if (isEmpty(value)) {
      return true;
    }
    return false;
  };

  return (
    <div className={styles['history-render-component']}>
      {!emptyNotNumber(historyValue) ? (
        historyValue === currentValue ? (
          <div>{children}</div>
        ) : (
          <div className={styles['history-render-red']}>
            <Popover
              content={
                lookupCode
                  ? currentField?.getText(historyValue)
                  : historyValue === 0
                  ? 0
                  : historyValue || ''
              }
            >
              <div style={Styles}>{children}</div>
            </Popover>
          </div>
        )
      ) : (
        <div className={styles['history-render-red']}>{children}</div>
      )}
    </div>
  );
};

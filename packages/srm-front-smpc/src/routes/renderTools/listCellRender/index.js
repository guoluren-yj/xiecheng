import React, { useState } from 'react';
import { Icon } from 'choerodon-ui';
import { isNil } from 'lodash';

import intl from 'utils/intl';
import OverflowTip from '@/components/OverflowTip';
import styles from './index.less';

const getNameValue = ({ label, color, showLabel, content, render }) => {
  const labelClass = styles['c7n-list-cell-label'];
  const contentClass = styles['c7n-list-cell-content'];

  const text = isNil(content) ? '-' : content;
  return (
    <p className={styles['c7n-list-cell-row']}>
      {showLabel && (
        <span
          className={labelClass}
          // style={{ minWidth: labelMinWidth + 1 }}
        >
          <OverflowTip>{label}</OverflowTip>
        </span>
      )}
      {render ? (
        render(contentClass)
      ) : (
        <span className={contentClass} style={{ color }}>
          <OverflowTip>{text}</OverflowTip>
        </span>
      )}
    </p>
  );
};

function ListCell(props) {
  const { list = [], record, style = {} } = props;
  const [isMore, setIsMore] = useState(false);
  const showList = list.length > 4 ? list.slice(0, 3) : list;
  const hiddList = list.length > 4 ? list.slice(3, list.length) : [];

  const mapFn = (_data = []) => {
    return _data.map((m) => {
      const { name, label, getVal, render, color, showLabel = true, labelMinWidth = 48 } = m;
      const { [name]: content } = record;
      const _content = getVal ? getVal(content) : content;
      return getNameValue({
        label,
        color,
        showLabel,
        labelMinWidth,
        content: _content,
        render: render ? (contentClass) => render(record, contentClass) : null,
      });
    });
  };

  return (
    <div className={styles['c7n-list-cell']} style={style}>
      {mapFn(showList)}
      {isMore && <>{mapFn(hiddList)}</>}
      {hiddList.length > 1 && (
        <a onClick={() => setIsMore(!isMore)}>
          {isMore
            ? intl.get(`hzero.common.button.up`).d('收起')
            : intl.get(`hzero.common.button.expand`).d('展开')}
          <Icon
            type={isMore ? 'expand_less' : 'expand_more'}
            style={{ marginLeft: 4, fontSize: '14px', marginBottom: 4 }}
          />
        </a>
      )}
    </div>
  );
}

export default function renderListCell(list = [], record, style = {}) {
  const listProps = {
    list,
    style,
    record,
  };
  return <ListCell {...listProps} />;
}

export { ListCell };

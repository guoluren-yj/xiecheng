import React from 'react';
import { observer } from 'mobx-react-lite';

import classNames from 'classnames';

import intl from 'utils/intl';

import style from './index.less';

const SortItem = props => {
  const { num = 0, label = '', record, onClick = e => e } = props;

  return (
    <div className={style['sort-item']}>
      <div
        className={classNames({
          [style['sort-item-checkbox']]: true,
          [style['sort-item-checkbox-defalut']]: !num,
          [style['sort-item-checkbox-active']]: !!num,
        })}
        onClick={() => {
          onClick(record, num, !num);
        }}
      >
        {!num ? '' : num}
      </div>
      <span> {label} </span>
    </div>
  );
};

export default observer(props => {
  const { elmDs } = props;

  const renderShowText = () => {
    const sortData = elmDs.toData().sort((a, b) => a.orderSeq - b.orderSeq);
    return sortData
      .filter(f => f.orderSeq)
      .map((m, idx) =>
        idx === 0
          ? `${m.customElementName || m.elementCodeMeaning}`
          : ` - ${m.customElementName || m.elementCodeMeaning}`
      );
  };

  const onSort = (record, eleV, active) => {
    // console.log('onSort', record, eleV, active);
    if (active) {
      const currentMax = Math.max(...elmDs.map(m => m.get('orderSeq')));
      record.set('orderSeq', currentMax + 1);
    } else {
      // 保持必须有一条选中元素
      if (elmDs.filter(r => r.get('orderSeq')).length === 1) {
        record.set('orderSeq', eleV);
        return;
      }
      record.set('orderSeq', 0);
      elmDs.forEach(r => {
        if (r.get('orderSeq') > eleV) {
          r.set('orderSeq', r.get('orderSeq') - 1);
        }
      });
    }
  };
  return (
    <>
      <p className={style['first-tip']}>
        {intl.get('sagm.purchaseManageNew.view.card.viewCfgInfo').d('可配置主站采买身份的显示方式')}
      </p>
      <p className={style['second-tip']}>
        {intl.get('sagm.purchaseManageNew.view.chooseEle').d('选择元素')}
      </p>
      <div className={style['sort-wrap']}>
        {elmDs.map(m => (
          <SortItem
            label={m.get('customElementName') || m.get('elementCodeMeaning')}
            record={m}
            onClick={onSort}
            num={m.get('orderSeq')}
          />
        ))}
      </div>
      <p className={style['second-tip']}>
        {intl.get('sagm.purchaseManageNew.view.viewChoose').d('显示预览')}
      </p>
      <p className={style['elem-value']}>{renderShowText()}</p>
    </>
  );
});

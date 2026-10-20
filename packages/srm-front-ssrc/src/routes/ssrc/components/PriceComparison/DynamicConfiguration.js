import React, { memo, useRef, useState, useEffect } from 'react';
import { Tag } from 'hzero-ui';
import { useDrop, useDrag } from 'ahooks';
import { compose, noop } from 'lodash';

import intl from 'utils/intl';

import style from './index.less';

const { CheckableTag } = Tag;

const DragItem = ({ item, itemConfigSelected, changeSelected, primaryKey, configType }) => {
  const dragRef = useRef(null);

  const { key, meaning } = item;

  useDrag(primaryKey, dragRef);

  return (
    <div ref={dragRef} style={{ display: 'inline-block' }}>
      <CheckableTag
        key={key}
        primaryKey={primaryKey}
        checked={itemConfigSelected.includes(key)}
        onChange={(checked) => changeSelected(checked, key, configType)}
      >
        {meaning}
      </CheckableTag>
    </div>
  );
};

const DynamicConfiguration = (props) => {
  const {
    data = [],
    itemConfigSelected = [],
    changeSelected = noop,
    configType,
    getAllConfigItem = noop,
    quotationCountData = [],
    subTitle = undefined,
  } = props;
  const [list, setList] = useState([]); // 报价信息
  const [countList, setCountList] = useState([]); // 小计

  useEffect(() => {
    const countKeys = quotationCountData.map((item) => item.value);
    const spliteList = [];
    const spliteCountList = [];
    if (data?.length) {
      data.forEach((item) => {
        if (countKeys.includes(item.key)) {
          spliteCountList.push(item);
        } else {
          spliteList.push(item);
        }
      });
      setList(spliteList);
      setCountList(spliteCountList);
    }
  }, [data, quotationCountData]);

  const dropRef = useRef(null);
  const dropRefCount = useRef(null);

  useDrop(dropRef, {
    onDom: (current, e) => {
      const targetIndex = Number(e.target.getAttribute('primaryKey'));
      const array = [...list];
      if (targetIndex >= 0) {
        // 删除当前元素
        const deleteItem = array.splice(current, 1);
        // 添加到current之前
        array.splice(targetIndex, 0, deleteItem[0]);
        setList(array);
        getAllConfigItem(configType, array, countList);
      }
    },
  });

  useDrop(dropRefCount, {
    onDom: (current, e) => {
      const targetIndex = Number(e.target.getAttribute('primaryKey'));
      const array = [...countList];
      if (targetIndex >= 0) {
        // 删除当前元素
        const deleteItem = array.splice(current, 1);
        // 添加到current之前
        array.splice(targetIndex, 0, deleteItem[0]);
        setCountList(array);
        getAllConfigItem(configType, list, array);
      }
    },
  });

  const itemProps = {
    configType,
    changeSelected,
    getAllConfigItem,
    itemConfigSelected,
  };

  return (
    <div className={style['config-modal']}>
      <div ref={dropRef}>
        <h3 className="sub-title">
          <div className="sub-title-line" />
          {subTitle ?? intl.get('ssrc.inquiryHall.view.card.subtitle.quotationInfo').d('报价信息')}
        </h3>
        {list?.length &&
          list.map((item, index) => <DragItem item={item} primaryKey={index} {...itemProps} />)}
      </div>
      {countList?.length ? (
        <div ref={dropRefCount}>
          <h3 className="sub-title">
            <div className="sub-title-line" />
            {intl.get('ssrc.inquiryHall.view.card.subtitle.quotationSummary').d('报价小计')}
          </h3>
          {countList.map((item, index) => (
            <DragItem item={item} primaryKey={index} {...itemProps} />
          ))}
        </div>
      ) : null}
    </div>
  );
};

const hocDynamicConfiguration = (Comp) => {
  return compose(memo)(Comp);
};

export default hocDynamicConfiguration(DynamicConfiguration);

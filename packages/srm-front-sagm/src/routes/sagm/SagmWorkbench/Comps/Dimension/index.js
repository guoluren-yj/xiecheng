import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import { Icon } from 'choerodon-ui/pro';

import styles from './index.less';

function getShowText(data, totalCount) {
  let str = '';
  //   let showCount = 0;
  let isOverflow = false;
  const containerWidth = 252;
  const container = document.createElement('div');
  container.style.display = 'inline-block';
  container.style.position = 'absolute';
  container.style.visibility = 'hidden';
  document.body.appendChild(container);
  const dataStr = data.join('、');
  for (const i of dataStr) {
    if (container.clientWidth > containerWidth) {
      isOverflow = true;
      break;
    }
    str += i;
    container.innerText = str;
  }
  const endStr = str.substr(str.length - 1);
  let resStr = endStr === '、' ? str.substr(0, str.length - 2) : str;
  const showCount = resStr.split('、').length;
  resStr = isOverflow ? `${resStr}...` : resStr;
  document.body.removeChild(container);
  return [resStr, totalCount - showCount];
}

const DimensionCard = observer(function DimensionCard(props) {
  const {
    dataSet,
    displayField,
    className = '',
    isActive,
    icon,
    title,
    count = () => undefined,
    onClick = (e) => e,
  } = props;
  const totalCount = count();
  const data = dataSet.toData();
  const [showText, showCount] = getShowText(
    data.map((m) => m[displayField]),
    totalCount
  );
  return (
    <div
      className={classNames({
        [className]: true,
        'dimension-card': true,
        'dimension-card-active': isActive,
      })}
      onClick={onClick}
    >
      <div className="card-info">
        <Icon type={icon} />
        <span className="dimension-card-title">{title}</span>
        {totalCount > 0 && <span className="card-count">{totalCount}</span>}
      </div>
      <div className="card-text">{`${showText}${showCount > 0 ? `+${showCount}` : ''}`}</div>
    </div>
  );
});

export default function DimensionList(props) {
  const { card = [], className = '', style, onCardChange = (e) => e } = props;
  const [key, setKey] = useState();

  useEffect(() => {
    setKey(card?.[0]?.cardKey);
  }, [card]);

  const { content } = card.find((f) => f.cardKey === key) || {};
  return (
    <div
      className={classNames({ [styles['dimension-container']]: true, [className]: true })}
      style={style}
    >
      <div className="dimension-card-wrapper">
        {card.map((m) => (
          <DimensionCard
            {...m}
            isActive={key === m.cardKey}
            onClick={() => {
              setKey(m.cardKey);
              onCardChange({ dataSet: m.dataSet, cardKey: m.cardKey });
            }}
          />
        ))}
      </div>
      <div className="dimension-content">{content}</div>
    </div>
  );
}

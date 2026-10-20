import React, { useState, useEffect } from 'react';
import { Icon, Collapse } from 'choerodon-ui';

import { CalculateList } from './config';

import styles from '../index.less';

const { Panel } = Collapse;

interface ILeftCalculator {
  handleClickCallback: (val: string) => void;
}
export default function LeftContent({ handleClickCallback }: ILeftCalculator) {
  const [content, setContent] = useState<string>(
    '计算两个值的和。也可用于拼接字符串，例如A+B拼接可得到AB'
  );
  const [contentName, setContentName] = useState<string>('+（加）');

  const drag = (obj1: HTMLElement, obj2: HTMLElement) => {
    const _obj1 = obj1;
    const _obj2 = obj2;
    _obj2.onmousedown = (e: MouseEvent) => {
      let _e = e;
      let dir = ''; // 设置好方向
      const firstY = _e.clientY; // 获取第一次点击的纵坐标
      const height = _obj2.offsetHeight; // 获取到元素的高度
      dir = 'top';
      // 判断方向结束
      document.onmousemove = (_event: MouseEvent) => {
        _e = _event;
        switch (dir) {
          case 'top':
            _obj2.style.height = `${height - (_e.clientY - firstY)}px`;
            _obj1.style.height = `${399 - height + (_e.clientY - firstY)}px`;
            break;
          default:
            break;
        }
      };
      _obj2.onmouseup = () => {
        document.onmousemove = null;
      };
      return false;
    };
  };

  useEffect(() => {
    drag(
      document.getElementById('pageDiv5') as HTMLElement,
      document.getElementById('pageDiv6') as HTMLElement
    );
  });

  interface IItem {
    title: string;
    key: string;
    children: { name: string; _name: string; expression: string }[];
  }
  const getContent = (item: IItem) => {
    return item.children.map((i) => (
      <li
        style={{ color: contentName === i._name ? '#29bece' : '#333333' }}
        onClick={() => {
          handleClickCallback(i._name);
          setContentName(i._name);
          setContent(i.expression);
        }}
      >
        {i.name}
      </li>
    ));
  };
  return (
    <div>
      <div id="pageDiv5" className={styles['content-top']}>
        <Collapse defaultActiveKey={['MatheConfig', 'LogicConfig']}>
          {CalculateList.map((item) => (
            <Panel header={item.title} key={item.key}>
              <div>
                <ul className={styles['calculate-ul']}>{getContent(item)}</ul>
              </div>
            </Panel>
          ))}
        </Collapse>
      </div>
      <div id="pageDiv6" className={styles['content-bottom']} style={{ height: '156px' }}>
        <React.Fragment>
          <div style={{ margin: '8px 0 4px 0', color: '#333435' }}>
            <Icon type="" className={styles['data-description-icon']} />
            说明：
          </div>
          <div style={{ paddingLeft: '12px', color: '#5A6677' }}>{content}</div>
        </React.Fragment>
      </div>
    </div>
  );
}

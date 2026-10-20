/* eslint-disable no-nested-ternary */
import React, { useEffect, useState } from 'react';
import { Icon } from 'choerodon-ui/pro';
import { Collapse, Input } from 'choerodon-ui';

import { FunctionList, DescriptionConfig, CareConfig } from './config';
import styles from '../index.less';

const { Panel } = Collapse;
const { Search } = Input;
interface IFunctionList {
  title: string;
  key: string;
  children: {
    funName: string;
    expression: string;
    _expression: string;
  }[];
}

interface ILeftContent {
  handleClickCallback: (val: string) => void;
}
export default function LeftContent({ handleClickCallback }: ILeftContent) {
  const [type, setType] = useState<string>('CONCAT'); // 点击标识
  const [dataList, setDataList] = useState<IFunctionList[]>([...FunctionList]); // 数据源

  // 高级函数或复合函数
  const getFunctionList = (record: IFunctionList) => {
    return (record.children || []).map((item) => (
      <li
        style={{ color: type === item.funName ? '#29bece' : '#333333' }}
        onClick={() => {
          setType(item.funName);
          handleClickCallback(item._expression);
        }}
      >
        {item.expression}
      </li>
    ));
  };

  // 说明
  const description = <span>{DescriptionConfig[type]}</span>;

  // 注意事项细分
  const careChild = (item: { title: string; children: string[] }) => {
    if (item.children) {
      return item.children.map((child) => <li>{child}</li>);
    }
  };

  // 注意
  const care = () => {
    const _careList = CareConfig[type];
    return _careList.map((item, index) => (
      <li>
        <React.Fragment>
          <span>{`${index + 1}、${item.title}`}</span>
          <ul>{careChild(item)}</ul>
        </React.Fragment>
      </li>
    ));
  };

  const drag = (obj1: HTMLElement, obj2: HTMLElement) => {
    const _obj1 = obj1;
    const _obj2 = obj2;
    _obj2.onmousedown = (e) => {
      let _e = e;
      let dir = ''; // 设置好方向
      const firstY = _e.clientY; // 获取第一次点击的纵坐标
      const height = _obj2.offsetHeight; // 获取到元素的高度
      dir = 'top';
      // 判断方向结束
      document.onmousemove = (_event) => {
        _e = _event;
        switch (dir) {
          case 'top':
            _obj2.style.height = `${height - (_e.clientY - firstY)}px`;
            _obj1.style.height = `${359 - height + (_e.clientY - firstY)}px`;
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
      document.getElementById('div3') as HTMLElement,
      document.getElementById('div4') as HTMLElement
    );
  }, []);

  // 搜索过滤
  const handleSearch = (value: string) => {
    if (!value) {
      setDataList(FunctionList);
      return;
    }
    const _dataList = (FunctionList || []).map((item) => {
      if (item.children) {
        const newChildren = (item.children || []).filter(
          (i) =>
            i?.funName?.toLowerCase().indexOf(value.toLowerCase()) > -1 ||
            i?.expression?.toLowerCase().indexOf(value?.toLowerCase()) > -1
        );
        return { ...item, children: newChildren };
      }
      return item;
    });
    setDataList(_dataList);
  };

  return (
    <div>
      <div style={{ width: '100%', padding: '8px 12px' }}>
        <Search placeholder="请输入" onSearch={(value) => handleSearch(value)} enterButton />
      </div>
      <div id="div3" className={styles['content-top']} style={{ height: '231px' }}>
        <Collapse defaultActiveKey={['FunAConfig', 'FunBConfig']}>
          {dataList.map((item) => (
            <Panel header={item.title} key={item.key}>
              <div>
                <ul className={styles['calculate-ul']}>{getFunctionList(item)}</ul>
              </div>
            </Panel>
          ))}
        </Collapse>
      </div>
      <div id="div4" className={styles['content-bottom']} style={{ height: '128px' }}>
        <React.Fragment>
          <div style={{ margin: '8px 0 4px 0', color: '#333435' }}>
            <Icon type="" className={styles['data-description-icon']} />
            说明：
          </div>
          <li style={{ paddingLeft: 8 }}>{description}</li>
          <div style={{ margin: '8px 0 4px 0', color: '#333435' }}>
            <Icon type="" className={styles['data-warning-icon']} />
            注意：
          </div>
          <div style={{ paddingLeft: '12px' }}>{care()}</div>
        </React.Fragment>
      </div>
    </div>
  );
}

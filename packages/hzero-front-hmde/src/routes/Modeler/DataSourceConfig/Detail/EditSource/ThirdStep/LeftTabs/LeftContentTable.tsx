import React, { useState, useEffect } from 'react';
import { Menu, Icon, Tooltip, Input } from 'choerodon-ui';

import ImgIcon from '@/utils/ImgIcon';

import styles from '../index.less';

const { SubMenu } = Menu;
const { Search } = Input;
interface ILeftContentTable {
  handleClickCallback: (val: string) => void;
  secondRightData: model.data.DataObjectModel[]; // 打平后的主模型对象
  openKeys: string[];
}
export default function LeftContent({
  handleClickCallback,
  secondRightData,
  openKeys,
}: ILeftContentTable) {
  const [dataList, setDataList] = useState<model.data.DataObjectModel[]>(secondRightData); // 数据源
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
      document.getElementById('div1') as HTMLElement,
      document.getElementById('div2') as HTMLElement
    );
  }, []);

  const menuFields = (record: model.data.DataObjectModel) => {
    return ((record?.fields || []) as model.data.BaseDataObjectField[]).map((
      i // fixme
    ) => (
      <Menu.Item key={i.rightFieldUniqueKey || i.dataFieldId}>
        <Tooltip placement="top" title={i.aliasName}>
          {`${i.displayName} ${'('}${i.aliasName}${')'}`}
        </Tooltip>
      </Menu.Item>
    ));
  };

  // 搜索过滤
  const handleSearch = (value: string) => {
    if (!value) {
      setDataList(secondRightData);
      return;
    }
    const _dataList = ((secondRightData || []) as model.data.DataObjectModel[]).map((item) => {
      if (item.fields) {
        const newFields = (item.fields || []).filter(
          (i) =>
            i?.aliasName?.toLowerCase().indexOf(value.toLowerCase()) > -1 ||
            i?.displayName?.toLowerCase().indexOf(value.toLowerCase()) > -1
        );
        return { ...item, fields: newFields };
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
      <div id="div1" className={styles['content-top']} style={{ height: '231px' }}>
        <Menu
          className="hlod-routes-model"
          defaultOpenKeys={openKeys}
          mode="inline"
          inlineCollapsed={false}
          onClick={({ item }) => {
            handleClickCallback(item.props.children.props.title);
          }}
        >
          {dataList.map((record) => (
            <SubMenu
              key={record.dataModelId}
              title={
                <span>
                  <Icon type="" className={styles['data-base-icon']} />
                  {record.relationCode ? (
                    <Tooltip placement="top" title={`关系名：${record?.relation?.name}`}>
                      <ImgIcon
                        name="guanlian@v4.0.svg"
                        size="14"
                        style={{ marginLeft: '4px', marginRight: '4px' }}
                      />
                    </Tooltip>
                  ) : (
                    <Tooltip placement="top" title="主模型">
                      <ImgIcon name="main-icon.svg" size={16} style={{ margin: '0px 4px' }} />
                    </Tooltip>
                  )}
                  <span
                    style={{
                      maxWidth: '192px',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'no-wrapper' as any,
                    }}
                  >
                    <Tooltip placement="top" title={record.referenceTableName}>
                      {`${record.logicModelName}(${record.referenceTableName})`}
                    </Tooltip>
                  </span>
                </span>
              }
            >
              {menuFields(record)}
            </SubMenu>
          ))}
        </Menu>
      </div>
      <div id="div2" className={styles['content-bottom']} style={{ height: '128px' }}>
        <React.Fragment>
          <div style={{ margin: '8px 0 4px 0', color: '#333435' }}>
            <Icon type="" className={styles['data-description-icon']} />
            说明：
          </div>
          <div style={{ paddingLeft: '12px', color: '#5A6677' }}>
            可选字段为当前数据对象的所有模型字段
          </div>
        </React.Fragment>
      </div>
    </div>
  );
}

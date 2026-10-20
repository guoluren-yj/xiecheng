import React, { memo, useState, useImperativeHandle } from 'react';
import { Tabs } from 'choerodon-ui';

import ImgIcon from '@/utils/ImgIcon';

import { IDataSource, IChildren } from './enums';
import styles from './style/index.less';

const { TabPane } = Tabs;
interface IIconPickerItem {
  selectedKeys?: string[]; // 外部传入选中的keys数组
  dataSource: IDataSource[]; // 图标数据源
  handleItemClick: (item: IChildren) => void; // 图标点击事件
  onItemEnter: (child: IChildren) => void; // 图标移入事件
  onItemLeave: (child: IChildren) => void; // 图标移出事件
  iconPickerItemRef: any;
}
const IconPickerItem = ({
  selectedKeys = [], // 外部传入选中的keys数组
  dataSource = [] as any, // 图标数据源
  handleItemClick = () => {}, // 图标点击事件
  onItemEnter = () => {}, // 图标移入事件
  onItemLeave = () => {}, // 图标移出事件
  iconPickerItemRef,
}: IIconPickerItem) => {
  useImperativeHandle(iconPickerItemRef, () => ({
    clearSelect: () => {
      setSelectedKey([]);
    },
  }));
  const [selectedKey, setSelectedKey] = useState<string[]>([]);

  const _handleItemClick = (item: IChildren) => {
    setSelectedKey([item.key]);
    handleItemClick(item);
  };
  return (
    <Tabs
      // defaultActiveKey={dataSource?.[0]?.key}
      onChange={() => {}}
      // animated={false}
    >
      {dataSource?.map((item) => (
        <TabPane tab={item?.tabName} key={item?.key}>
          <div className={styles['icon-picker-category']}>
            <ul>
              {item?.children?.length > 0 ? (
                item?.children?.map((child) => (
                  <li
                    key={child?.key}
                    onClick={_handleItemClick.bind(null, child)}
                    onMouseEnter={onItemEnter.bind(null, child)}
                    onMouseLeave={onItemLeave.bind(null, child)}
                  >
                    <div
                      className={`${styles['icon-picker-item-content']} ${
                        (selectedKey || selectedKeys).includes(child?.key) &&
                        styles['icon-picker-item-selected']
                      }`}
                    >
                      <ImgIcon name={child?.iconName} size={20} />
                      <div>{child?.title}</div>
                    </div>
                  </li>
                ))
              ) : (
                <div className={styles['icon-picker-no-data']}>暂无数据</div>
              )}
            </ul>
          </div>
        </TabPane>
      ))}
    </Tabs>
  );
};

export default memo(IconPickerItem);

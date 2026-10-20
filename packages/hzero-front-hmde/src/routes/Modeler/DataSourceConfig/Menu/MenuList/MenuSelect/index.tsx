/* eslint-disable react/jsx-props-no-spreading */
/**
 * MenuList - 可移动树状侧边栏（最深2层）
 * @date: 2019-12-22
 * @author: wz
 * @version: 4.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { forwardRef, useContext } from 'react';
import { Icon, Menu } from 'choerodon-ui/pro';
import ImgIcon from '@/utils/ImgIcon';
import { TargetType } from '@/globalData/common';
import { SingleTagDistribute } from '@/routes/Modeler/hooks/tags';
// import globalStyles from '@/lowcodeGlobalStyles/global.less';
import _store, { ISourceManagerStore } from '@/routes/Modeler/DataSourceConfig/stores';
import styles from './index.less';

interface IMenuSelectParams {
  handleDeleteNode: (currentNodeData: model.data.DataObject) => any;
  handlePublishNode: (currentNodeData: model.data.DataObject, cb: () => any) => any;
  handleInheritNode: (currentNodeData: model.data.DataObject) => any;
  handleSourceMenuQuery: () => void;
  platformHidden: boolean;
  className: string;
  currentNodeData: model.data.DataObject;
}
const MenuSelect = forwardRef(
  ({
    handleDeleteNode = () => {},
    handlePublishNode = () => {},
    handleInheritNode = () => {},
    handleSourceMenuQuery = () => {},
    platformHidden,
    className,
    currentNodeData,
  }: IMenuSelectParams) => {
    const { setTabActiveKey }: ISourceManagerStore = useContext<ISourceManagerStore>(
      _store as any
    ).store;

    /**
     * 返回默认tab
     */
    const backToDefaultTab = () => {
      setTabActiveKey('1');
    };

    /**
     * 启用
     * @param e
     */
    const publishNode = (e) => {
      if (e && e.domEvent) {
        e.domEvent.stopPropagation();
      }
      backToDefaultTab();
      handlePublishNode(currentNodeData, () => {});
    };

    /**
     * 删除
     * @param e
     * @param NodeData
     */
    const deleteNode = (e) => {
      if (e && e.domEvent) {
        e.domEvent.stopPropagation();
      }
      backToDefaultTab();
      handleDeleteNode(currentNodeData);
    };

    /**
     * 继承
     * @param e
     * @param NodeData
     */
    const inheritNode = (e) => {
      if (e && e.domEvent) {
        e.domEvent.stopPropagation();
      }
      backToDefaultTab();
      handleInheritNode(currentNodeData);
    };

    const selectProps = {
      className,
    };

    return (
      <div className={`${styles['list-item-popover']}`}>
        <Menu {...selectProps}>
          {!(currentNodeData.dataObjectOwnerType === 'PLATFORM_SHARED' && platformHidden) && (
            <Menu.Item onClick={(e) => deleteNode(e)}>
              <ImgIcon
                name="delete-black.svg"
                size={16}
                style={{ width: 18, marginRight: '0.1rem' }}
              />
              <span>删除</span>
            </Menu.Item>
          )}
          {!(currentNodeData.dataObjectOwnerType === 'PLATFORM_SHARED' && platformHidden) && (
            <Menu.Item onClick={(e) => publishNode(e)}>
              <Icon type="state_over" style={{ color: '#38BC84' }} />
              <span>发布</span>
            </Menu.Item>
          )}
          {platformHidden && currentNodeData.dataObjectOwnerType === 'PLATFORM_SHARED' && (
            <Menu.Item onClick={(e) => inheritNode(e)}>
              <Icon type="low_priority" />
              <span>继承</span>
            </Menu.Item>
          )}
          {currentNodeData.dataObjectOwnerType !== 'PLATFORM_SHARED' && platformHidden && (
            <Menu.Item onClick={(e) => e?.domEvent?.stopPropagation()}>
              <SingleTagDistribute
                code={currentNodeData.dataObjectCode}
                type={TargetType.VIEW}
                leftMenuDsQuery={handleSourceMenuQuery}
              >
                <div>
                  <ImgIcon name="Tags.svg" size={16} style={{ width: 18, marginRight: '0.1rem' }} />
                  <span>分配标签</span>
                </div>
              </SingleTagDistribute>
            </Menu.Item>
          )}
        </Menu>
      </div>
    );
  }
);

export default MenuSelect;

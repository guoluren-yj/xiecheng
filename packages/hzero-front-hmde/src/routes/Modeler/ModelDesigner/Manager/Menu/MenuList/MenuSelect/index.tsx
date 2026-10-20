/**
 * MenuList - 可移动树状侧边栏（最深2层）
 * @date: 2019-12-22
 * @author: wz
 * @version: 4.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { forwardRef, FC } from 'react';
import { Icon, Menu } from 'choerodon-ui/pro';

import ImgIcon from '@/utils/ImgIcon';
import globalStyles from '@/lowcodeGlobalStyles/global.less';
import { ETableType, EModelType } from '@/globalData/modelManager';
import { TargetType } from '@/globalData/common';
import { SingleTagDistribute } from '@/routes/Modeler/hooks/tags';

import styles from './index.less';
import { IHandleMenuQueryList } from '@/routes/Modeler/ModelDesigner/ListView';

enum EDataSourceType {
  API = 'API',
  TABLE = 'TABLE',
}

interface IMenuSelect extends IHandleMenuQueryList {
  handleRefresh: (currentNodeData: model.LogicModel, grade: string) => void;
  handleDeleteNode: (currentNodeData: model.LogicModel, grade: string) => void;
  handleEnableNode: (currentNodeData: model.LogicModel, grade: string) => void;
  // handleMenuQueryList: (params?: any) => any;
  handleExtend: (currentNodeData: model.LogicModel, grade: string) => void;
  // hidden: ;
  className: string;
  currentNodeData: model.LogicModel;
  modelRadio: ETableType;
  platformHidden: boolean;
}
const MenuSelect: FC<IMenuSelect> = forwardRef(
  ({
    handleRefresh = () => {
      // 模型同步
    },
    handleDeleteNode = () => {},
    handleEnableNode = () => {},
    handleMenuQueryList = () => {},
    handleExtend = () => {},
    // hidden,
    className,
    currentNodeData,
    // modelRadio,
    platformHidden,
  }) => {
    /**
     * 启用
     * @param e
     */
    const enableNode = (e, grade: string) => {
      if (e && e.domEvent) {
        e.domEvent.stopPropagation();
      }
      handleEnableNode(currentNodeData, grade);
      handleMenuQueryList();
    };
    // ////////////// 增加编辑删除功能

    /**
     * 同步
     * @param e
     */
    const refreshNode = (e, grade: string) => {
      if (e && e.domEvent) {
        e.domEvent.stopPropagation();
      }
      handleRefresh(currentNodeData, grade);
      handleMenuQueryList();
    };

    /**
     * 删除
     * @param e
     * @param NodeData
     */
    const deleteNode = (e, grade) => {
      if (e && e.domEvent) {
        e.domEvent.stopPropagation();
      }
      handleDeleteNode(currentNodeData, grade);
      handleMenuQueryList();
    };

    const selectProps = {
      // hidden,
      className,
    };

    /**
     * 继承
     * @param e Event
     * @param grade
     */
    const extendModel = (e, grade) => {
      if (e && e.domEvent) {
        e.domEvent.stopPropagation();
      }
      handleExtend(currentNodeData, grade);
    };

    return (
      <div className={`${globalStyles['menu-pro']} ${styles['list-item-popover']}`}>
        <Menu {...selectProps}>
          {(!platformHidden || currentNodeData?.type !== EModelType.PLATFORM_SHARED) && (
            <Menu.Item onClick={(e) => deleteNode(e, currentNodeData.grade)}>
              <ImgIcon
                name="delete-black.svg"
                size={16}
                style={{ width: 18, marginRight: '0.1rem' }}
              />
              <span>删除</span>
            </Menu.Item>
          )}
          {(!platformHidden || currentNodeData?.type !== EModelType.PLATFORM_SHARED) && (
            <Menu.Item onClick={(e) => enableNode(e, currentNodeData.grade)}>
              <ImgIcon
                name="cancellation-of-publication@3x.png"
                size={16}
                style={{ width: 18, marginRight: '0.1rem' }}
              />
              <span>发布</span>
            </Menu.Item>
          )}
          {
            // currentNodeData.grade === 'module' && modelRadio === ETableType.modelTable && (
            (!platformHidden || currentNodeData?.type !== EModelType.PLATFORM_SHARED) &&
              currentNodeData?.dataSourceType !== EDataSourceType.API && (
                <Menu.Item onClick={(e) => refreshNode(e, 'module')}>
                  {
                    <>
                      <Icon
                        type="refresh"
                        // style={{ color: '#b6bbc6' }}
                      />
                      <span>同步</span>
                      {/* {`${platformHidden}---${currentNodeData?.type}`} */}
                    </>
                  }
                </Menu.Item>
              )
          }
          {platformHidden && currentNodeData?.type !== EModelType.PLATFORM_SHARED && (
            <Menu.Item
              onClick={(e) => {
                if (e?.domEvent) {
                  e.domEvent.stopPropagation();
                }
              }}
            >
              <SingleTagDistribute
                code={currentNodeData?.code}
                type={TargetType.MODEL}
                leftMenuDsQuery={handleMenuQueryList}
              >
                <ImgIcon name="Tags.svg" size={16} style={{ width: 18, marginRight: '0.1rem' }} />
                <span>分配标签</span>
              </SingleTagDistribute>
            </Menu.Item>
          )}
          {platformHidden && currentNodeData?.type === EModelType.PLATFORM_SHARED && (
            <Menu.Item onClick={(e) => extendModel(e, 'module')}>
              {
                <>
                  <Icon type="low_priority" />
                  <span>继承</span>
                </>
              }
            </Menu.Item>
          )}
        </Menu>
      </div>
    );
  }
);

export default MenuSelect;

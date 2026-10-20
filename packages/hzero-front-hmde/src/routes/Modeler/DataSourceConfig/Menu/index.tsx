/* eslint-disable react/jsx-props-no-spreading */
/**
 * Table - 页面列表 - menu
 * @date: 2019-12-22
 * @author: wz
 * @version: 4.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { useState, useEffect, useContext, useRef } from 'react';
import notification from 'utils/notification';
import { TextField } from 'choerodon-ui/pro';
import { Tooltip } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';

import { getResponse } from 'hzero-front/lib/utils/utils';

import Modal from '@/components/LowcodeModal';
import ImgIcon from '@/utils/ImgIcon';
// import BatchAuthorization from '@/routes/Modeler/DataSourceConfig/Detail/SourceAuthorization/BatchAuthorization';
import MenuList from './MenuList';

import { sourceDeleteService, sourcePublishService } from '@/services/modelDataSourceService';
import _store, { ISourceManagerStore } from '@/routes/Modeler/DataSourceConfig/stores';
import useModalMain from '@/routes/Modeler/hooks/useModalMain';
import { TargetType } from '@/globalData/common';
import { TagsScreen } from '@/routes/Modeler/hooks/tags';

import styles from './index.less';

const { confirm } = Modal;
interface IListViewParams {
  handleSourceMenuQuery: (
    data?: string,
    type?: string | null
  ) => Promise<model.data.DataSourceTreeVO>;
}
const ListView = observer(({ handleSourceMenuQuery }: IListViewParams) => {
  const {
    pageFun: { type: pageType },
    setIsLeftShow,
    dataObject: { isLeftShow, dataObjectDetail, dataRadio, dataObjParams, dataObjectDetailType },
    setDataObject,
    setDataObjectTreeData, // 设置右边数据
    setDataObjectDetailAll,
    platformHidden,
  }: // ref: { menuSelectRef },
  ISourceManagerStore = useContext<ISourceManagerStore>(_store as any).store;
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const searchInputRef = useRef() as any;
  // 搜搜索
  useEffect(() => {
    handleSourceMenuQuery();
  }, [dataObjParams]);

  const { openTagsManagerModal } = useModalMain();

  // 删除提示
  const moduleDeleteModel = async (
    currentNodeData: model.data.DataObject = {} as model.data.DataObject
  ): Promise<void> => {
    await confirm({
      children:
        '删除该数据对象将会同时删除运行态数据对象数据，您将无法继续使用API，您确定要删除吗？',
      lowcodeSize: 'small',
      onOk: async () => {
        const params = {
          body: [currentNodeData.dataObjectCode],
        };
        const res = await sourceDeleteService(params); // 这里返回的204
        if (getResponse(res)) {
          setTimeout(() => handleSourceMenuQuery(), 310);
          // setExpandedKeys([parentNodeData.code.toString()]);
          notification.success({
            message: '操作成功！',
          } as any);
          if (currentNodeData.dataObjectCode === dataObjectDetail.dataObjectCode) {
            // 删除的是当前选中的 则清空中间
            setDataObject('dataObjectDetail.dataObjectCode', null); // 肃清中间
          }
          setDataObject('dataObjectDetail.dataObjectName', null); // 清空标题
        }
        return true;
      },
    });
  };

  /**
   * 发布
   * @param currentNodeData
   * @param parentNodeData
   * @param grade
   */
  const handlePublishNode = async (
    currentNodeData: model.data.DataObject,
    callback: () => any
  ): Promise<void> => {
    await confirm({
      children: '您确定需要发布该数据对象吗？',
      lowcodeSize: 'small',
      onOk: async () => {
        const res = await sourcePublishService({
          body: [currentNodeData.dataObjectCode],
        }); // 接口返回的204
        if (res && res.failed) {
          // 错误
          notification.error({
            message: '警告',
            description: res.message,
          });
        } else {
          setTimeout(() => handleSourceMenuQuery(), 310);
          notification.success({
            message: '操作成功！',
          } as any);
          setDataObject('dataObjectDetailType', 'see');
          setDataObject(`dataSelectedKey.${dataRadio}`, {
            dataObjectId: currentNodeData.dataObjectId,
            dataObjectName: currentNodeData.dataObjectName,
            dataObjectCode: currentNodeData.dataObjectCode,
            dataObjectCategory: currentNodeData.dataObjectCategory,
            assignPattern: (currentNodeData as any)?.assignPattern,
            publishStatus: 'PUBLISHED',
            extendsParentCode: (currentNodeData as any)?.extendsParentCode,
            extendsParentName: (currentNodeData as any)?.extendsParentName,
            encryptId: (currentNodeData as any)?.encryptId,
          });
          setDataObjectDetailAll({
            ...dataObjectDetail,
            publishStatus: 'PUBLISHED',
          });
          callback();
        }
        return true;
      },
    });
  };

  /**
   * 继承数据对象
   */
  const handleInheritNode = (currentNodeData: model.data.DataObject): void => {
    if (dataObjectDetailType !== 'see') {
      // 数据源详情为编辑态时不可重复新建
      notification.warning({
        description: '请退出编辑后重试',
      } as any);
      return;
    }
    const parentModal = currentNodeData || {};
    // 设置初始化数据
    setDataObjectTreeData({
      dataObjectOwnerType: 'TENANT', // 继承只能是TENANT
      dataObjectCode: parentModal.dataObjectCode,
      extendsParentCode: parentModal?.dataObjectCode,
      extendsParentName: parentModal?.dataObjectName,
    });
    // 修改编辑状态
    setDataObject('dataObjectDetailType', 'inherit');
    setDataObject('dataObjectDetail.dataObjectCode', parentModal.dataObjectCode);
    // if (!dataObjectDetail.dataObjectCode) {
    setDataObject('dataObjectDetail.dataObjectName', '继承数据对象');
    // }
    setDataObject('dataObjectDetail.dataObjectId', parentModal.dataObjectId);
    setDataObject(`dataSelectedKey.${dataRadio}`, parentModal);
  };

  /**
   * 新建数据对象
   */
  const handleAddNode = () => {
    setDataObject(`dataSelectedKey.${dataRadio}`, {}); // 取消左侧菜单选中状态
    if (dataObjectDetailType !== 'see') {
      // 数据源详情为编辑态时不可重复新建
      notification.warning({
        description: '请退出编辑后重试',
      } as any);
      return false;
    }
    // 设置权限用的appId
    setDataObjectTreeData({}); // 数据清空，改编辑状态
    setDataObjectDetailAll({} as any);
    setDataObject('dataObjectDetailType', 'create');
    setDataObject('dataObjectDetail.dataObjectCode', true);
    // if (!dataObjectDetail.dataObjectCode) {
    setDataObject('dataObjectDetail.dataObjectName', '新建数据对象');
    // }
  };

  const menuProps = {
    expandedKeys,
    setExpandedKeys,
    handlePublishNode, // 发布
    handleDeleteNode: moduleDeleteModel,
    handleInheritNode, // 继承
    handleSourceMenuQuery,
  };

  /**
   * enter事件
   */
  // const handleEnterKey = async (e) => {
  //   if (e.nativeEvent.keyCode === 13) {
  //     // e.nativeEvent获取原生的事件对像
  //     await handleSourceMenuQuery();
  //     if (menuSelectRef?.current?.handleExpandedOpenAll) {
  //       menuSelectRef.current.handleExpandedOpenAll();
  //     }
  //   }
  // };

  return (
    <div className={styles['menu-left']}>
      {pageType === 'source' && dataRadio !== 'apiSource' && (
        <a className={styles['menu-left-add']} onClick={() => handleAddNode()}>
          {/* <Tooltip title="新建数据对象"> */}
          <ImgIcon name="Creating models.svg" size={14} style={{ marginRight: 4 }} />
          创建数据对象
          {/* </Tooltip> */}
        </a>
      )}
      <div className={styles['menu-left-query']}>
        <div className={styles.input}>
          <TextField
            ref={searchInputRef}
            // onEnterDown={handleEnterKey}
            onChange={(data = '') => {
              setDataObject('dataObjParams', {
                ...dataObjParams,
                dataObjectName: data,
                page: 0,
              });
            }}
            className={styles['query-input']}
            name="query"
            value={dataObjParams.dataObjectName}
            placeholder="请搜索数据对象名称"
            suffix={
              <ImgIcon
                name="search@v4.0.svg"
                size={14}
                onClick={async (e) => {
                  e.stopPropagation();
                  searchInputRef.current.blur(); // 输入框失焦
                  await handleSourceMenuQuery();
                }}
              />
            }
          />
        </div>
        {platformHidden && (
          <>
            <Tooltip title="标签管理" placement="top">
              <ImgIcon
                name="TagsManager.svg"
                size={16}
                style={{ marginLeft: 8, cursor: 'pointer' }}
                onClick={() => openTagsManagerModal({ callback: handleSourceMenuQuery })}
              />
            </Tooltip>
            <TagsScreen
              type={TargetType.VIEW}
              labelCodes={dataObjParams.labelCodeList}
              menuTagsScreenQuery={(list) =>
                setDataObject('dataObjParams', {
                  ...dataObjParams,
                  labelCodeList: list,
                  page: 0,
                })
              }
            />
          </>
        )}
      </div>
      <MenuList {...menuProps} />
      <div
        className={styles['collapse-handle']}
        style={{ display: !isLeftShow ? 'none' : 'flex' }}
        onClick={() => setIsLeftShow(false)}
      >
        <ImgIcon name="fold.svg" size={8} />
      </div>
    </div>
  );
});

export default ListView;

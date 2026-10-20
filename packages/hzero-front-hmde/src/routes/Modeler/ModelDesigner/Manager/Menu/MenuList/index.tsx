/**
 * MenuList - 可移动树状侧边栏（最深2层）
 * @date: 2019-12-22
 * @author: wz
 * @version: 4.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { useState, useContext, useEffect, forwardRef, useImperativeHandle, FC } from 'react';
import { observer } from 'mobx-react-lite';
import { Dropdown, Menu } from 'choerodon-ui';
import { Icon, Tooltip, CheckBox } from 'choerodon-ui/pro';
import { runInAction } from 'mobx';

import _store, { IModelManagerStore } from '@/routes/Modeler/ModelDesigner/stores';
import ImgIcon from '@/utils/ImgIcon';
import { MenuListLabels } from '@/routes/Modeler/hooks/tags';
import useModalMain, { IData } from '@/routes/Modeler/hooks/useModalMain';
import { EModelType, EModeStatus } from '@/globalData/modelManager';
import { TargetType } from '@/globalData/common';
import BatchAuthorization from '@/routes/Modeler/component/BatchAuthorization';

import { isTenantRoleLevel } from 'utils/utils';
import styles from './index.less';
import MenuSelect from './MenuSelect';

import PaginationCompacted from '@/routes/Modeler/component/SmallPagination';
import { IHandleMenuQueryList } from '../../../ListView';

const { Item } = Menu;
interface IButtonsConfig {
  name: string;
  active: boolean;
  value: string;
  text: string;
}
interface IListView extends IHandleMenuQueryList {
  handleRefresh: (currentNodeData: model.LogicModel, grade: string) => void;
  handleDeleteNode: (currentNodeData: model.LogicModel, grade: string) => void;
  handleEnableNode: (currentNodeData: model.LogicModel, grade: string) => void;
  handleExtend: (currentNodeData: model.LogicModel, grade: string) => void;
}

const modelTypeToIconNameDict = {
  PREDEFINE: 'preset.svg',
  PLATFORM: 'platformcustomization.svg',
  PLATFORM_SHARED: 'platformsharing.svg',
  TENANT: 'tenantcustomization.svg',
};

const ListView: FC<IListView> = observer(
  ({ handleRefresh, handleDeleteNode, handleEnableNode, handleMenuQueryList, handleExtend }) => {
    const modelManagerStore = useContext<IModelManagerStore>(_store as any).store;

    const { openTagsDistributionModal } = useModalMain();

    // 添加2级菜单 // 同步
    const {
      pageFun: { type: pageType },
      ref: { menuListRef },
      setDataStore,
      getDataStore,
      setModelDetailAll,
      clearDetailAll,
      setEditStatusToDefault,
      storeData: {
        modelDetail,
        modelDataObj,
        modelDataObjParams,
        modelRadio,
        resourceUponRoleHierarchy,
        selectedTenantId,
        modelTypeList,
        modelListPagingResetSignal,
      },
      platformHidden,
      pageFun,
    }: IModelManagerStore = modelManagerStore; // useContext<IModelManagerStore>(_store as any).store;

    const buttonsConfig: IButtonsConfig[] = isTenantRoleLevel()
      ? [
          { name: 'preset.svg', active: false, value: 'PREDEFINE', text: '预置' },
          {
            name: 'platformsharing.svg',
            active: false,
            value: 'PLATFORM_SHARED',
            text: '平台共享',
          },
          { name: 'tenantcustomization.svg', active: false, value: 'TENANT', text: '租户自定义' },
        ]
      : [
          { name: 'preset.svg', active: false, value: 'PREDEFINE', text: '预置' },
          {
            name: 'platformsharing.svg',
            active: false,
            value: 'PLATFORM_SHARED',
            text: '平台共享',
          },
          {
            name: 'platformcustomization.svg',
            active: false,
            value: 'PLATFORM',
            text: '平台自定义',
          },
        ];

    useEffect(() => {
      if (!isTenantRoleLevel() && resourceUponRoleHierarchy === 'platform') {
        if (modelRadio === 'modelTable') {
          setButtonsData([
            { name: 'preset.svg', active: false, value: 'PREDEFINE', text: '预置' },
            {
              name: 'platformsharing.svg',
              active: false,
              value: 'PLATFORM_SHARED',
              text: '平台共享',
            },
            {
              name: 'platformcustomization.svg',
              active: false,
              value: 'PLATFORM',
              text: '平台自定义',
            },
          ]);
        } else {
          setButtonsData([
            {
              name: 'platformsharing.svg',
              active: false,
              value: 'PLATFORM_SHARED',
              text: '平台共享',
            },
            {
              name: 'platformcustomization.svg',
              active: false,
              value: 'PLATFORM',
              text: '平台自定义',
            },
          ]);
        }
      } else if (modelRadio === 'modelTable') {
        setButtonsData([
          { name: 'preset.svg', active: false, value: 'PREDEFINE', text: '预置' },
          {
            name: 'platformsharing.svg',
            active: false,
            value: 'PLATFORM_SHARED',
            text: '平台共享',
          },
          { name: 'tenantcustomization.svg', active: false, value: 'TENANT', text: '租户自定义' },
        ]);
      } else {
        setButtonsData([
          {
            name: 'platformsharing.svg',
            active: false,
            value: 'PLATFORM_SHARED',
            text: '平台共享',
          },
          { name: 'tenantcustomization.svg', active: false, value: 'TENANT', text: '租户自定义' },
        ]);
      }
    }, [resourceUponRoleHierarchy, modelRadio]);

    useImperativeHandle(menuListRef, () => ({
      handelSelect,
    }));

    const [buttonsData, setButtonsData] = useState<IButtonsConfig[]>(buttonsConfig); // 过滤树形结构按钮
    const [modelType, setModelType] = useState<string>(); // 过滤数据
    const [dataState, setDataState] = useState(getDataStore('modelDataObj'));
    const [thisSelectedKeys, setThisSelectedKeys] = useState<string[]>(['']);
    const [checkedNodes, setCheckedNodes] = useState<IData[]>([]);
    const [startBatchCheckFlag, setStartBatchCheckFlag] = useState(false);

    useEffect(() => {
      setCheckedNodes([]);
    }, [selectedTenantId]);
    /**
     * 根据key擦找nodeData
     * @param key
     * @param callback 操作后回调
     */
    const getNodeData = (code: string, callback: any) => {
      const data = [...dataState.content] || [];
      const _getNodeData = (_data, _code, _callback) => {
        _data.forEach((item, index, arr) => {
          // 树的id值和modelDetail中的id值相同，因为在每个 MenuItem 上设置code = item.id
          if (item.id === _code || item.appId === _code) {
            return _callback(item, index, arr);
          }
          if (item.children) {
            return _getNodeData(item.children, _code, _callback);
          }
        });
      };
      _getNodeData(data, code, callback);
    };

    const handleClick = async ({ item }) => {
      const { code } = item.props;

      // 需要清除批量编辑的标识
      setEditStatusToDefault();

      // 此处 code === item.id
      getNodeData(code, (obj) => {
        setModelDetailAll(obj);
      });
    };

    const menuSelectProps = {
      className: styles['menu-left-list-more'],
      dataState,
      platformHidden,
      setDataState: (val) => setDataStore('fieldAttribute', val),
      handleRefresh, // 同步
      handleDeleteNode,
      handleEnableNode,
      handleMenuQueryList,
      handleExtend,
    };

    /**
     * 设置菜单选项Item样式
     * @param {Object} item
     * @param {Object} parentNode
     */
    const SetItemStyle = (args) => {
      const { item }: { item: model.LogicModel } = args;

      // 文本溢出显示Tooltip
      const [tooltipHidden, setTooltipHidden] = useState(true);
      const [visible, setVisible] = useState<boolean>(false); // 下拉菜单显示
      const [curNode, setCurNode] = useState<string>('');

      const icon: any = constructPublishStatusIcon(item.publishStatus as EModeStatus);
      // 设置标题前icon

      return (
        <div className={styles['menu-left-list-item']}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              height: '100%',
              userSelect: startBatchCheckFlag ? 'none' : 'auto',
            }}
            onMouseEnter={() => setCurNode(`${item?.name}&${item?.type}&${item?.id}`)}
            onMouseLeave={() => {
              setCurNode('');
            }}
          >
            {
              <CheckBox
                value={`${item.name}&${item.type}&${item.code}&${item.id}`}
                checked={!!checkedNodes.find((n) => n.id === (item as any).id)}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={onmousedown}
                onMouseUp={onmouseup}
                onMouseEnter={(e) => {
                  if (startBatchCheckFlag) {
                    mouseoverChecked(e);
                  }
                }}
                disabled={
                  (((item.type === EModelType.PLATFORM_SHARED && platformHidden) ||
                    item.type === EModelType.PREDEFINE) &&
                    isTenantRoleLevel()) ||
                  (!isTenantRoleLevel() &&
                    (item.type === 'PLATFORM_SHARED' || item.type === 'PREDEFINE') &&
                    pageType === 'model')
                }
                hidden={
                  !isTenantRoleLevel() &&
                  resourceUponRoleHierarchy === 'platform' &&
                  pageType === 'model'
                }
              />
            }
            <div className={styles['menu-left-list-icon']}>
              <ImgIcon name={modelTypeToIconNameDict[item.type]} size={16} />
              {item.type !== EModelType.PREDEFINE && icon}
            </div>
            <Tooltip hidden={tooltipHidden} title={item.name}>
              <i className={styles['menu-left-list-font']}>
                <span
                  onMouseMove={(e: any) => {
                    if (e.target?.offsetWidth >= e.target?.parentNode?.offsetWidth) {
                      setTooltipHidden(false);
                    }
                  }}
                  onMouseLeave={() => setTooltipHidden(true)}
                >
                  {item.name}
                </span>
              </i>
            </Tooltip>
            {item.enabledFlag === 0 && (
              <Tooltip title="已失效">
                <Icon
                  type="report"
                  style={{ color: '#f75e5e' }}
                  className={styles['menu-left-list-refresh']}
                />
              </Tooltip>
            )}
            {!(item.type === EModelType.PREDEFINE) && pageFun.type !== 'authorization' && (
              <>
                <MenuListLabels labelAssignList={item?.labelAssignList} />
                <Dropdown
                  visible={visible && curNode === `${item?.name}&${item?.type}&${item?.id}`}
                  onVisibleChange={(vis) => setVisible(!!vis)}
                  trigger={['hover']}
                  overlay={
                    <MenuSelect
                      modelRadio={modelRadio}
                      currentNodeData={item}
                      {...menuSelectProps}
                    />
                  }
                >
                  <ImgIcon
                    name="more-options.svg"
                    size={14}
                    style={{
                      visibility: item.type === EModelType.PREDEFINE ? 'hidden' : 'visible',
                    }}
                  />
                </Dropdown>
              </>
            )}
          </div>
        </div>
      );
    };

    const onCheck = (val, oldValue) => {
      if (val) {
        const [name, type, code, id] = val.split('&');
        setCheckedNodes([...checkedNodes, { name, type, code, id }]);
      } else {
        setCheckedNodes([...checkedNodes].filter(({ code }) => code !== oldValue.split('&')?.[2]));
      }
    };

    const onmousedown = (e) => {
      setStartBatchCheckFlag(true);
      if (navigator.userAgent.indexOf('Firefox') === -1) {
        mouseoverChecked(e);
      }
    };

    const mouseoverChecked = (e) => {
      const _value = e.target?.value;
      if (_value && checkedNodes.find((n) => Object.values(n)?.join('&') === _value)) {
        onCheck(false, _value);
      } else {
        onCheck(_value, false);
      }
    };

    const onmouseup = () => {
      setStartBatchCheckFlag(false);
    };

    useEffect(() => {
      document.body.addEventListener('mouseup', () => setStartBatchCheckFlag(false));
      return () => {
        document.body.removeEventListener('mouseup', onmouseup);
      };
    }, [startBatchCheckFlag]);

    /**
     * 循环遍历菜单选项Item
     * @param {Array<Object>} data
     * @param {Object} parentNode 菜单根对象
     */
    const loop = (data: model.LogicModel[]) => {
      const newData = data;
      // if (modelType) {
      //   newData = data.filter((item) => item.type === modelType);
      // }
      // return [...newData, ...newData, ...newData, ...newData, ...newData].map((item) => (
      return newData.map((item) => (
        <Item
          key={item.id}
          // code={item.code || item.appId}
          code={item.id}
          className={
            item.id === modelDetail.id ? styles['menu-item-selected'] : styles['menu-item-node']
          }
        >
          <SetItemStyle item={item} />
        </Item>
      ));
    };

    const handleButtonClick = (index: number) => {
      const buttons: IButtonsConfig[] = [...buttonsData];
      buttons[index].active = !buttons[index].active;
      setButtonsData(buttons);

      // 过滤分类全选或全不选 //
      let activeButtonsCount = 0;
      buttons.forEach((buttonData) => {
        if (buttonData.active) activeButtonsCount++;
      });

      if (activeButtonsCount === 0 || activeButtonsCount === buttons.length) {
        setModelType('');
        setDataStore('modelTypeList', []);
        if (isTenantRoleLevel()) {
          // fix租户角色不触发查询
          handleMenuQueryList({ dataSourceType: modelRadio, modelTypeList: [] });
        }
      } else {
        const _index = buttons.findIndex((item) => item.active);
        setModelType(buttons[_index].value);

        const modelTypeListToSet: string[] = [];

        buttons.forEach((buttonConfig) => {
          if (buttonConfig.active) {
            modelTypeListToSet.push(buttonConfig.value);
          }
        });

        setDataStore('modelTypeList', modelTypeListToSet);

        if (isTenantRoleLevel()) {
          // fix租户角色不触发查询
          handleMenuQueryList({ dataSourceType: modelRadio, modelTypeList: modelTypeListToSet });
        }
      }
      runInAction(() => {
        setDataStore('modelTypeParam', modelType);

        // 在类型筛选变动后清空中部详情区
        clearDetailAll('modelDetail');
        clearDetailAll('apiDetail');
      });
    };

    /**
     * 选中一个节点触发点击事件
     * @param keyArr
     */
    const handelSelect = ({ selectedKeys }: { selectedKeys: string[] }): void => {
      setThisSelectedKeys(selectedKeys);
    };

    const [pagingPage, setPagingPage] = useState(1);
    const [pagingSize, setPagingSize] = useState(20);

    useEffect(() => {
      setPagingPage(1);
    }, [modelListPagingResetSignal]);

    useEffect(() => {
      setPagingPage(1);
    }, [modelDataObjParams]);
    // TODO: 为啥不放ListView里？
    useEffect(() => {
      if (resourceUponRoleHierarchy === 'tenant' && !selectedTenantId) {
        // 资源层级在租户，且并未选择租户id，则清空所有模型列表、表模型详情、api模型详情
        modelManagerStore.setDataStore('modelDataObj', {});
        modelManagerStore.clearDetailAll('modelDetail');
      } else {
        handleMenuQueryList({ dataSourceType: modelRadio === 'modelTable' ? 'TABLE' : 'API' });
      }
    }, [resourceUponRoleHierarchy, selectedTenantId, modelTypeList, modelDataObjParams]);

    // 模型排序 预置模型优先显示
    useEffect(() => {
      const newDataStateObj = getDataStore('modelDataObj');
      setDataState(newDataStateObj);
    }, [modelDataObj]);

    useEffect(() => {
      const buttonsDataModified = JSON.parse(JSON.stringify(buttonsData));

      for (const data of buttonsDataModified) {
        data.active = false;
      }

      setButtonsData(buttonsDataModified);
    }, [selectedTenantId]);

    return (
      <React.Fragment>
        <div className={styles['control-buttons']}>
          {pageType !== 'authorization' &&
            buttonsData.map((ele, index) => (
              <div
                className={ele.active ? `${styles.active}` : ''}
                onClick={() => handleButtonClick(index)}
              >
                <ImgIcon name={`${ele.name}`} style={{ width: 14, height: 14, marginRight: 6 }} />
                {ele.text}
              </div>
            ))}
          {pageType === 'authorization' && (
            <div className={`${styles.active}`} style={{ cursor: 'not-allowed' }}>
              <ImgIcon
                name="platformsharing.svg"
                style={{ width: 14, height: 14, marginRight: 6 }}
              />
              平台共享
            </div>
          )}
        </div>
        <div className={styles['menu-list-tree']}>
          <div className={styles['menu-list-tree-content']}>
            <Menu
              selectedKeys={thisSelectedKeys}
              mode="inline"
              onClick={handleClick}
              onSelect={handelSelect}
              className={styles['menu-list']}
            >
              {dataState && dataState.content && loop(dataState.content)}
            </Menu>
          </div>
        </div>
        <PaginationCompacted
          className={styles['left-list-pagination']}
          pageObj={{
            page: pagingPage,
            pageSize: pagingSize,
            total: dataState.totalElements,
          }}
          showSizeChanger
          showTotal
          showPager={false}
          showQuickJumper={false}
          showSizeChangerLabel={false}
          onChange={(page, pageSize) => {
            setPagingPage(page);
            setPagingSize(pageSize);

            const modelNature =
              modelManagerStore.storeData.modelRadio === 'modelTable' ? 'TABLE' : 'API';

            handleMenuQueryList({
              dataSourceType: modelNature,
              page: page - 1,
              size: pageSize,
            });
          }}
        />
        {checkedNodes.length > 0 && platformHidden && (
          <div className={styles['bottom-wrapper']}>
            <div>
              <span
                onClick={() =>
                  openTagsDistributionModal({
                    data: checkedNodes,
                    type: TargetType.MODEL,
                    callback: handleMenuQueryList,
                  })
                }
              >
                分配标签
              </span>
            </div>
          </div>
        )}
        {checkedNodes.length > 0 && pageType === 'authorization' && (
          <div className={styles['bottom-wrapper']}>
            <div>
              <span>
                <BatchAuthorization
                  dataSource={checkedNodes}
                  url="model-assigns/batch"
                  title="模型"
                  listName="logicModelCodes"
                  leftMenuQuery={handleMenuQueryList}
                />
              </span>
            </div>
          </div>
        )}
      </React.Fragment>
    );
  }
);

function constructPublishStatusIcon(publishStatus: 'PUBLISHED' | 'UNPUBLISHED' | 'MODIFIED') {
  if (publishStatus === 'UNPUBLISHED') {
    return null;
  }

  return (
    <Tooltip placement="top" title={publishStatus === 'PUBLISHED' ? '已发布' : '发布后已修改'}>
      <ImgIcon
        className={styles['model-publish-status']}
        name={publishStatus === 'PUBLISHED' ? 'tick.svg' : 'hint.svg'}
        size={10}
      />
    </Tooltip>
  );
}

export default forwardRef((props: any) => <ListView {...props} />);

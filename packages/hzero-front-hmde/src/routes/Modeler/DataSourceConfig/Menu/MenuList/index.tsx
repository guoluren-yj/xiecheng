/* eslint-disable jsx-a11y/mouse-events-have-key-events */
/* eslint-disable react/jsx-props-no-spreading */
/**
 * MenuList - 可移动树状侧边栏（最深2层）
 * @date: 2019-12-22
 * @author: wz
 * @version: 4.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { useState, useMemo, useContext, ReactElement, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Icon, Tooltip, Dropdown, Menu } from 'choerodon-ui';
import { CheckBox } from 'choerodon-ui/pro';
import { isTenantRoleLevel } from 'utils/utils';
// import { runInAction } from 'mobx';
// import { xorBy } from 'lodash'; // , unionBy, intersectionBy

import ImgIcon from '@/utils/ImgIcon';
import SmallPagination from '@/routes/Modeler/component/SmallPagination';
import MenuSelect from './MenuSelect';
import _store, { ISourceManagerStore } from '@/routes/Modeler/DataSourceConfig/stores';
import useModalMain, { IData } from '@/routes/Modeler/hooks/useModalMain';
import { TargetType } from '@/globalData/common';
import BatchAuthorization from '@/routes/Modeler/component/BatchAuthorization';
import { ESource } from '@/globalData/modelManager';
import { MenuListLabels } from '@/routes/Modeler/hooks/tags';

import styles from './index.less';

/**
 * 这里的parentNodeData没有用到，any
 */
interface IListViewParams {
  handleDeleteNode: (currentNodeData: model.data.DataObject) => any;
  handlePublishNode: (currentNodeData: model.data.DataObject, cb: () => any) => any;
  handleInheritNode: (currentNodeData: model.data.DataObject) => any;
  handleSourceMenuQuery: () => void;
}
const { Item } = Menu;
const ListView = observer(
  ({
    handleDeleteNode,
    handlePublishNode,
    handleSourceMenuQuery,
    handleInheritNode,
  }: IListViewParams) => {
    const buttonsConfig = [
      { name: 'preset.svg', active: false, value: 'PREDEFINE', text: '平台预定义' },
      { name: 'platformsharing.svg', active: false, value: 'PLATFORM_SHARED', text: '平台共享' },
      { name: 'platformcustomization.svg', active: false, value: 'PLATFORM', text: '平台自定义' },
      { name: 'tenantcustomization.svg', active: false, value: 'TENANT', text: '租户自定义' },
    ];
    // 添加2级菜单 // 同步
    const {
      getDataObject,
      setDataObjectDetailAll,
      setDataObject,
      setTabActiveKey,
      pageFun: { type: pageType },
      dataObject: { dataObj, dataRadio, dataSelectedKey, dataObjParams, level },
      platformHidden,
    }: ISourceManagerStore = useContext<ISourceManagerStore>(_store as any).store;
    const dataState = useMemo(() => getDataObject('dataObj'), [dataObj]);
    const [buttonsData, setButtonsData] = useState(buttonsConfig); // 过滤树形结构按钮
    const [checkedNodes, setCheckedNodes] = useState<IData[]>([]);
    const [startBatchCheckFlag, setStartBatchCheckFlag] = useState(false);
    useEffect(() => {
      const newButtons = [...buttonsConfig]
        .map((item) => ({
          ...item,
          active: dataObjParams.dataObjectOwnerTypeList?.split(',')?.includes(item.value),
        }))
        .filter(
          ({ value }) => (level === 'platform' ? 'tenant' : 'platform').toUpperCase() !== value
        )
        .filter(({ value }) => pageType === ESource.source || value === 'PLATFORM_SHARED');
      setButtonsData(newButtons);
      setCheckedNodes([]);
    }, [level, dataObjParams.dataObjectOwnerTypeList, pageType]);

    const { openTagsDistributionModal } = useModalMain();
    /**
     * 根据key擦找nodeData
     * @param key
     * @param callback 操作后回调
     */
    const getNodeData = (id: number | string, callback: (obj: any) => any) => {
      const data = [...dataState.content] || [];
      const thisGetNodeData = (
        _data: any,
        _id: number | string,
        _callback: (item: object, index: number, arr: any[]) => any
      ) => {
        _data.forEach((item, index, arr) => {
          if (item.dataObjectId === _id) {
            return _callback(item, index, arr);
          }
          if (item.content) {
            return thisGetNodeData(item.content, _id, _callback);
          }
        });
      };
      thisGetNodeData(data, id, callback);
    };

    /**
     * 选中一个节点触发点击事件
     * @param keyArr
     */
    interface IHandleSelectNode {
      item: ReactElement;
    }
    const handleSelectNode = async ({ item }: IHandleSelectNode): Promise<void> => {
      // 重新选择数据对象时默认回到基本信息tab
      setTabActiveKey('1');
      const { eventKey } = item.props;
      getNodeData(eventKey, (obj) => {
        setDataObject('dataObjectDetailType', 'see');
        setDataObject(`dataSelectedKey.${dataRadio}`, obj);
        setDataObjectDetailAll({
          dataObjectId: obj.dataObjectId,
          dataObjectName: obj.dataObjectName,
          dataObjectCode: obj.dataObjectCode,
          assignPattern: obj.assignPattern,
          publishStatus: obj.publishStatus,
          dataObjectCategory: obj.dataObjectCategory,
          dataObjectOwnerType: obj.dataObjectOwnerType,
          extendsParentCode: obj?.extendsParentCode,
          extendsParentName: obj?.extendsParentName,
          encryptId: obj.encryptId,
        });
      });
    };

    const menuSelectProps = {
      handleDeleteNode,
      handlePublishNode,
      handleInheritNode,
      handleSourceMenuQuery,
      platformHidden,
      className: styles['menu-left-list-more'],
    };

    /**
     * 设置菜单选项Item样式
     * @param {model.data.DataObject} item
     * @param {Object} parentNode
     */
    const SetItemStyle = ({ item }: { item: any }): JSX.Element => {
      const [visible, setVisible] = useState<boolean>(false); // 下拉菜单显示
      const [curNode, setCurNode] = useState<string>('');
      const [nameTip, setNameTip] = useState<boolean>(false);

      const key = `${item?.dataObjectName}&${item?.dataObjectOwnerType}&${item?.dataObjectCode}`;

      const icon = (
        <div className={styles['menu-left-list-icon']}>
          <ImgIcon
            name={
              buttonsConfig.find((i) => i.value === item.dataObjectOwnerType)?.name ||
              'data-base@2x.png'
            }
            size={16}
          />
          {['PUBLISHED', 'MODIFIED'].includes(item.publishStatus) && (
            <Tooltip
              placement="top"
              title={item.publishStatus === 'PUBLISHED' ? '已发布' : '发布后已修改'}
            >
              <ImgIcon
                className={styles['menu-left-list-release']}
                name={item.publishStatus === 'PUBLISHED' ? 'tick.svg' : 'hint.svg'}
                size={10}
              />
            </Tooltip>
          )}
        </div>
      );

      return (
        <div className={styles['menu-left-list-item']}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              height: '100%',
              paddingLeft:
                item.dataObjectOwnerType === 'PLATFORM_SHARED' && isTenantRoleLevel() ? 16 : 0,
              userSelect: startBatchCheckFlag ? 'none' : 'auto',
            }}
            onMouseEnter={() => setCurNode(key)}
            onMouseLeave={() => setCurNode('')}
          >
            <CheckBox
              value={key}
              checked={!!checkedNodes.find((n) => n.code === item.dataObjectCode)}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={onmousedown}
              onMouseUp={onmouseup}
              onMouseEnter={(e) => {
                if (startBatchCheckFlag) {
                  mouseoverChecked(e);
                }
              }}
              disabled={item.dataObjectOwnerType === 'PLATFORM_SHARED' && platformHidden}
              hidden={
                (item.dataObjectOwnerType === 'PLATFORM_SHARED' && isTenantRoleLevel()) ||
                (!platformHidden && pageType === ESource.source)
              }
            />
            {icon}
            <i className={styles['menu-left-list-font']}>
              <Tooltip title={item.dataObjectName || item.name} visible={nameTip}>
                <span
                  style={{ maxWidth: '100%' }}
                  onMouseEnter={(e) => {
                    const ele: any = e?.target;
                    if ((ele?.offsetWidth || 0) > (ele?.parentNode?.offsetWidth || 0)) {
                      setNameTip(true);
                    }
                  }}
                  onMouseLeave={() => setNameTip(false)}
                >
                  {item.dataObjectName || item.name}
                </span>
              </Tooltip>
            </i>
            {item.enabledFlag === 0 && (
              <Tooltip title="已失效">
                <Icon
                  type="report"
                  style={{ color: '#f75e5e' }}
                  className={styles['menu-left-list-refresh']}
                />
              </Tooltip>
            )}
            {pageType !== ESource.sourceAuthorization && (
              <>
                <MenuListLabels labelAssignList={item?.labelAssignList} />
                <Dropdown
                  visible={visible && curNode === key}
                  onVisibleChange={(vis) => setVisible(!!vis)}
                  trigger={['hover']}
                  overlayClassName={styles['menu-left-list-dropdown']}
                  overlay={<MenuSelect currentNodeData={item} {...menuSelectProps} />}
                >
                  <ImgIcon name="more-options.svg" size={14} />
                </Dropdown>
              </>
            )}
          </div>
        </div>
      );
    };

    const onCheck = (val, oldValue) => {
      let arr: IData[] = [];
      if (val) {
        const [name, type, code] = val.split('&');
        arr = [...checkedNodes, { name, type, code }];
        setCheckedNodes(arr);
      } else {
        arr = [...checkedNodes].filter(({ code }) => code !== oldValue.split('&')?.[2]);
        setCheckedNodes(arr);
      }
      setDataObject('checkedNodes', arr);
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
    const loop = (data) => {
      return data.map((item) => (
        <Item
          key={item.dataObjectId}
          code={item.dataObjectCode}
          className={
            item.dataObjectId === dataSelectedKey[dataRadio].dataObjectId
              ? styles['menu-item-selected']
              : styles['menu-item-node']
          }
        >
          <SetItemStyle item={item} />
        </Item>
      ));
    };

    const handleButtonClick = (index) => {
      const buttons = [...buttonsData];
      buttons[index].active = !buttons[index].active;
      setButtonsData(buttons);
      setDataObject('dataObjParams', {
        ...dataObjParams,
        dataObjectOwnerTypeList: buttons
          .filter((i) => i.active)
          .map((i) => i.value)
          .join(','),
        page: 0,
      });
    };

    const pageSizeChange = (page: number, size: number) => {
      setDataObject('dataObjParams', {
        ...dataObjParams,
        page: size !== dataObjParams.size ? 0 : page - 1,
        size,
      });
    };

    return (
      <React.Fragment>
        <div className={styles['control-bar']}>
          <div className={styles['control-buttons']}>
            {buttonsData.map((ele, index) => (
              <div
                className={ele.active ? `${styles.active}` : ''}
                onClick={() => pageType === ESource.source && handleButtonClick(index)}
                style={{ marginBottom: '4px' }}
              >
                <ImgIcon name={`${ele.name}`} style={{ width: 14, height: 14, marginRight: 4 }} />
                {ele.text}
              </div>
            ))}
          </div>
        </div>
        <div className={styles['menu-list-tree']}>
          <div className={styles['menu-list-tree-content']}>
            <Menu
              mode="inline"
              onSelect={handleSelectNode}
              selectedKeys={[dataSelectedKey[dataRadio].dataObjectId]}
              className="global-c7n"
            >
              {dataState &&
                dataState.content &&
                Array.isArray(dataState.content) &&
                loop(dataState.content)}
            </Menu>
            <SmallPagination
              showSizeChanger
              showSizeChangerLabel={false}
              showTotal
              showPager={false}
              showQuickJumper={false}
              sizeChangerPosition={'left' as any}
              pageObj={{
                page: dataState?.number + 1,
                pageSize: dataState?.size,
                total: dataState?.totalElements,
              }}
              onChange={pageSizeChange}
            />
          </div>
          {pageType === ESource.source && checkedNodes.length > 0 && platformHidden && (
            <div className={styles['bottom-wrapper']}>
              <div>
                <span
                  onClick={() =>
                    openTagsDistributionModal({
                      data: checkedNodes,
                      type: TargetType.VIEW,
                      callback: () => {
                        handleSourceMenuQuery();
                        setCheckedNodes([]);
                      },
                    })
                  }
                >
                  分配标签
                </span>
              </div>
            </div>
          )}
          {pageType === ESource.sourceAuthorization && checkedNodes.length > 0 && (
            <div className={styles['bottom-wrapper']}>
              <div>
                <span>
                  <BatchAuthorization
                    dataSource={getDataObject('checkedNodes')}
                    url="data-assigns/batch"
                    leftMenuQuery={() => {
                      handleSourceMenuQuery();
                      setCheckedNodes([]);
                    }}
                  />
                </span>
              </div>
            </div>
          )}
        </div>
      </React.Fragment>
    );
  }
);

export default ListView;

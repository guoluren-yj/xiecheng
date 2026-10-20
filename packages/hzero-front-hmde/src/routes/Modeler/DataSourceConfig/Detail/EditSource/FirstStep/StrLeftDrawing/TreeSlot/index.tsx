import React, { useContext, useState } from 'react';
import { Dropdown, Menu } from 'choerodon-ui/pro';
import { Tooltip } from 'choerodon-ui';
import { isNull } from 'lodash';
import ImgIcon from '@/utils/ImgIcon';

import styles from './index.less';
import _store, { ISourceManagerStore } from '@/routes/Modeler/DataSourceConfig/stores';

interface IIndex {
  models: { label: string; value: string; label2: string };
  slotMenuList: model.BaseLogicModel[];
  slotMenuListByCode: string;
  porpsItem: model.data.DataObjectModel;
  treeData: model.data.DataObjectModel[];
  queryMenuList: (moduleData: model.data.DataObjectModel) => any;
  addTree: (propsItem: model.data.DataObjectModel, slotMenusItem: model.BaseLogicModel) => void;
  delTree: (propsItem: model.data.DataObjectModel) => void;
}
export default ({
  models,
  slotMenuList,
  slotMenuListByCode,
  porpsItem,
  treeData,
  queryMenuList,
  addTree = () => {},
  delTree = () => {},
}: IIndex) => {
  const {
    getDataObjectDetailType = () => {},
    dataObject: { level },
  }: ISourceManagerStore = useContext<ISourceManagerStore>(_store as any).store;
  const [mouseMoveId, setMouseMoveId] = useState<string | number>('');
  const [showSpecial, setShowSpecial] = useState<boolean>(false);
  const [titleMoved, setTitleMoved] = useState<boolean>(false);
  const [iconMoved, setIconMoved] = useState<boolean>(false);

  const dropdownColumn = () => (
    <Menu
      className={styles['model-source-tree-slot-menu']}
      style={{
        marginTop: '-10px',
      }}
      mode="inline"
    >
      {(slotMenuList || []).map((item: any) => (
        <Menu.Item
          key={`${item.code}${item?.modelRelation?.code || item.modelRelation}`}
          onClick={(e) => {
            if (e && e.domEvent) {
              e.domEvent.stopPropagation();
            }
            addTree(porpsItem, item);
          }}
        >
          <div className={styles['tree-slot-menu-item']}>
            {/* TODO: */}
            <h4>
              <Tooltip
                placement="top"
                title={`关系名: ${item.relationName || item?.modelRelation?.name}`}
              >
                <ImgIcon name="guanlian@v4.0.svg" size={14} style={{ marginRight: '4px' }} />
              </Tooltip>
              {item.name}
            </h4>
            <div>{item.refTableName}</div>
          </div>
        </Menu.Item>
      ))}
      {showSpecial && // 控制显示时机
      slotMenuList?.length === 0 && // slotMenuList是数组且没有数据时
        slotMenuListByCode === porpsItem?.logicModelCode && (
          <Menu.Item key="empty">
            <div className={styles['tree-slot-menu-item']}>暂无可用的模型</div>
          </Menu.Item>
        )}
      {showSpecial && !slotMenuList && slotMenuListByCode === porpsItem.logicModelCode && (
        <Menu.Item key="empty">
          <div className={styles['tree-slot-menu-item']}>加载中……</div>
        </Menu.Item>
      )}
    </Menu>
  );

  /**
   * 判断编辑、创建的模型是否可编辑
   */
  const handleJudgeDisabled = (
    item: model.data.DataObjectModel = {} as any,
    operateFlag: boolean = false,
    strongRelationFlag: number = 0
  ) => {
    let disabledAll = false;
    if (!(treeData?.[0] as any)?.children) {
      // 只有一条数据时默认可编辑
      return true;
    }
    if (item.masterFlag === 1) {
      // 主模型可操作
      return true;
    }
    // const disabledAll = treeData.some((i) => i.relation && i.relation.relationType === "ONE_TO_MANY"); // 存在一对多 全部不可编辑
    const judger = (_treeData) => {
      for (let i = 0; i < _treeData.length; i++) {
        if (_treeData[i].relation && _treeData[i].relation.relationType === 'ONE_TO_MANY') {
          disabledAll = true;
          return;
        }
        if (!disabledAll && _treeData[i].children && Array.isArray(_treeData[i].children)) {
          judger(_treeData[i].children);
        }
      }
    };
    judger(treeData); // 存在一对多 全部不可编辑
    if (disabledAll) {
      return false;
    }
    if (item.relation && item.relation.relationType === 'ONE_TO_ONE') {
      // 正向都是一对一
      if (item.masterFlag === 1 || (operateFlag === true && strongRelationFlag === 1)) {
        // 主模型
        // 主模型可操作
        return true;
      }
    }
    return false;
  };

  return (
    <div
      className={styles['model-source-tree-slot']}
      onMouseEnter={() => setMouseMoveId(porpsItem.logicModelId)}
      onMouseLeave={() => {
        setMouseMoveId('');
        setShowSpecial(false);
      }}
    >
      {porpsItem.masterFlag === 1 && <span className={styles['icon-main']}>主</span>}
      <div className={styles['model-source-tree-slot-con']}>
        {getDataObjectDetailType('dataObjectDetailType') === 'see' ? ( // 查看状态使用operateFlag作为禁用判断
          <Tooltip
            visible={!porpsItem.operateFlag && iconMoved && porpsItem.masterFlag !== 1}
            title="当前模型关系未建立反向关联或反向关联为1-N，关联模型的字段不可编辑"
          >
            <span onMouseMove={() => setIconMoved(true)} onMouseLeave={() => setIconMoved(false)}>
              <ImgIcon
                name={
                  !porpsItem.operateFlag && porpsItem.masterFlag !== 1
                    ? 'data-source-gray.svg'
                    : 'data-source.svg'
                }
                size={24}
                style={{ margin: 12 }}
              />
            </span>
          </Tooltip>
        ) : (
          // 创建/编辑状态需前端走一遍逻辑判断
          <Tooltip
            visible={
              !handleJudgeDisabled(
                porpsItem,
                porpsItem.operateFlag,
                porpsItem.strongRelationFlag
              ) && iconMoved
            }
            title="当前模型关系未建立反向关联或反向关联为1-N，关联模型的字段不可编辑"
          >
            <span onMouseMove={() => setIconMoved(true)} onMouseLeave={() => setIconMoved(false)}>
              <ImgIcon
                name={
                  porpsItem.masterFlag !== 1 &&
                  !handleJudgeDisabled(
                    porpsItem,
                    porpsItem.operateFlag,
                    porpsItem.strongRelationFlag
                  )
                    ? 'data-source-gray.svg'
                    : 'data-source.svg'
                }
                size={24}
                style={{ margin: 12 }}
              />
            </span>
          </Tooltip>
        )}
        <div
          style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', margin: 0 }}
        >
          <Tooltip
            visible={titleMoved}
            title={porpsItem[models.label] || '当前数据已丢失，请检查！'}
          >
            <span
              onMouseMove={() => setTitleMoved(true)}
              onMouseLeave={() => setTitleMoved(false)}
              style={{
                margin: 0,
                maxWidth: '181px',
                fontSize: 12,
                color: '#333435',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {porpsItem[models.label] || '当前数据已丢失，请检查！'}
            </span>
          </Tooltip>
          {!isNull(porpsItem[models.label2]) ? <span>{porpsItem[models.label2]}</span> : null}
        </div>
      </div>
      <div
        style={{
          display:
            ['see', 'inherit'].includes(getDataObjectDetailType('dataObjectDetailType')) ||
            (level === 'tenant' && getDataObjectDetailType('dataObjectDetailType') === 'edit')
              ? 'none'
              : 'block',
          position: 'absolute',
          right: '10px',
          bottom: '-10px',
        }}
      >
        {porpsItem.logicModelId === mouseMoveId && ( // 对应的模块才显示（鼠标在哪个上边）
          <Dropdown overlay={dropdownColumn()} trigger={['click' as any]}>
            <span
              style={{
                cursor: 'pointer',
                color: '#fff',
                textAlign: 'center',
                display: 'inline-block',
                width: '20px',
                height: '20px',
                marginRight: '10px',
                borderRadius: '50%',
                backgroundColor: '#29bece',
              }}
              onClick={(e) => {
                if (e) {
                  e.stopPropagation();
                }
                setShowSpecial(true);
                queryMenuList(porpsItem);
              }}
            >
              +
            </span>
          </Dropdown>
        )}
        {
          // !porpsItem.active && // 正在编辑的不能删除
          porpsItem.masterFlag !== 1 && // 非主模块
          porpsItem.logicModelId === mouseMoveId && // 对应的模块才显示（鼠标在哪个上边）
          (!(porpsItem as any).children || (porpsItem as any)?.children?.length === 0) && ( // 没有子集
          <span
            style={{
                  cursor: 'pointer',
                  color: '#fff',
                  textAlign: 'center',
                  display: 'inline-block',
                  width: '20px',
                  height: '20px',
                  // marginRight: '20px',
                  borderRadius: '50%',
                  backgroundColor: '#f75e5e',
                }}
            onClick={(e) => {
                  if (e) {
                    e.stopPropagation();
                  }
                  delTree(porpsItem);
                }}
          >
                ×
          </span>
            )
        }
      </div>
    </div>
  );
};

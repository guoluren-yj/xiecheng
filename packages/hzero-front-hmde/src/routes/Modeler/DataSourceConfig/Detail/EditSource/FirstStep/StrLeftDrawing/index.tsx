/* eslint-disable react/jsx-props-no-spreading */
import React, { forwardRef, useState, useRef, useEffect, useMemo } from 'react';
import notification from 'utils/notification';
import { observer } from 'mobx-react-lite';
import { uuid } from '@/utils/common';
import { findTree, treeToArr, findAncestorsTree, mapTree } from '@/utils/treeUtils';
import { queryRelationListService } from '@/services/modelDataSourceService';
import Modal from '@/components/LowcodeModal';

import TreeShow from './TreeShow';
import styles from './index.less';

const { confirm } = Modal;

interface IIndex {
  dataList: model.data.BaseDataObject;
  setDataList: (data: any) => void;
  handleClickItem: (data: model.data.DataObjectModel) => boolean;
  setRightFormData: any;
  handleSaveItem: () => boolean | model.data.BaseDataObject; // 保存当前数据
  setSecondLeftData: any;
  setSecondRightData: any;
}
const Index = forwardRef(
  ({
    dataList,
    setDataList,
    handleClickItem = () => false,
    setRightFormData = () => {},
    handleSaveItem = () => false, // 保存当前数据
    setSecondLeftData,
    setSecondRightData,
  }: IIndex) => {
    const treeData = useMemo(() => [dataList.masterModel], [dataList.masterModel]);
    const [slotMenuList, setSlotMenuList] = useState<model.BaseLogicModel[]>([]); // 下拉框数据
    const [slotMenuListByCode, setSlotMenuListByCode] = useState<string>(''); // 下拉框对应code
    /**
     * 查询关联模型信息
     * @param {*} moduleData
     */
    const queryMenuList = async (moduleData: model.data.DataObjectModel) => {
      // 获取当前点击节点的所有父节点
      const headerList = findAncestorsTree(treeData, (item) => {
        if (item && moduleData) {
          return (
            item.logicModelCode === moduleData.logicModelCode &&
            item.relationCode === moduleData.relationCode
          );
        }
      });
      if (slotMenuListByCode === moduleData.logicModelCode && Array.isArray(slotMenuList)) {
        // 过滤数据
        const treeArr = treeToArr(treeData);
        const newSlotMenuList = slotMenuList.filter(
          (_item) =>
            !treeArr.some(
              (treeItem) =>
                treeItem.logicModelCode === _item.code &&
                _item.modelRelation?.code === treeItem.relationCode
            )
        );
        setSlotMenuList(newSlotMenuList);
      } else {
        // loading
        setSlotMenuListByCode(moduleData.logicModelCode);
        // 查询下拉框的数据
        setSlotMenuList([]);
        const query = {
          logicModelId: moduleData.logicModelId,
        };

        let res: model.BaseLogicModel[] = await queryRelationListService({
          query,
          body: { headers: headerList.arr || [] },
        });
        if (res && (res as any).failed) {
          // 错误
          res = [];
          notification.error({
            message: '警告',
            description: (res as any).message,
          });
        }
        // 过滤数据
        const treeArr = treeToArr(treeData);
        if (res instanceof Array) {
          const _slotMenuList = res
            .filter(
              (_item) =>
                !treeArr.some(
                  (treeItem) =>
                    treeItem.logicModelCode === _item.code &&
                    _item.modelRelation?.code === treeItem.relationCode
                )
            )
            .map((data) => ({
              ...data,
            }));
          setSlotMenuList(_slotMenuList);
        }
      }
    };

    /**
     * 添加关联模型
     * @param {*} propsItem 当前选中模型信息
     * @param {*} slotMenusItem 当前选中关联模型信息
     */
    const addTree = (
      propsItem: model.data.DataObjectModel,
      slotMenusItem: model.BaseLogicModel
    ) => {
      const _dataList: any = handleSaveItem();
      if (!_dataList) {
        notification.error({
          message: '警告',
          description: '保存校验失败！请填写完必输字段再添加模型！',
        });
        return;
      }
      let _TreeData: model.data.DataObjectModel[] = [_dataList.masterModel];
      const { item: moduleItem } = findTree(
        _TreeData,
        (_item) =>
          _item.logicModelId === propsItem.logicModelId &&
          _item.treeParentModelKey === propsItem.treeParentModelKey
      );
      // 添加的模板
      const template = {
        // ...slotMenusItem,
        children: [],
        conditions: [],
        dataObjectId: moduleItem?.dataObjectId,
        logicModelCode: slotMenusItem?.code,
        logicModelId: slotMenusItem?.id,
        logicModelName: slotMenusItem?.name,
        logicModelType: slotMenusItem?.type,
        relationName: slotMenusItem?.modelRelation?.name,
        relationCode: slotMenusItem?.modelRelation?.code,
        relation: slotMenusItem?.modelRelation,
        referenceTableName: slotMenusItem?.refTableName,
        treeParentModelKey: moduleItem?.treeModelKey,
        operateFlag: slotMenusItem?.operateFlag,
        treeModelKey: uuid(),
        _status: 'create',
      };
      // 插入树
      if (moduleItem.children) {
        moduleItem.children.push(template);
      } else {
        moduleItem.children = [template];
      }
      _TreeData = mapTree(_TreeData, (_item) => {
        if (
          _item.logicModelId === moduleItem.logicModelId &&
          _item.treeParentModelKey === moduleItem.treeParentModelKey
        ) {
          return Object.assign(_item, moduleItem);
        }
      });
      setSecondLeftData([]);
      setSecondRightData([]);
      setDataList({ ...dataList, masterModel: _TreeData[0] });
      setRightFormData(template);
      // eslint-disable-next-line no-unused-expressions
      (treeShowProps?.ref?.current as any)?.initMaster?.(template); // 边框设为新增模型
    };

    useEffect(() => {
      handleClickItem(treeData[0]);
      // eslint-disable-next-line no-unused-expressions
      (treeShowProps?.ref?.current as any)?.initMaster?.(null); // 切换对象模型初始化TreeShow默认选中第一个
    }, [treeData[0]?.dataObjectId]);

    // useEffect(() => {
    //   handleClickItem(rightFormData);
    // }, [rightFormData]);

    /**
     * 删除关联模型
     * @param {Object} propsItem
     */
    const delTree = async (propsItem: model.data.DataObjectModel) => {
      const submitOk =
        (await confirm(
          '删除当前模型后同时会删除已启用的所有子关联模型，该操作将会使引用该数据对象的结构性组件数据部分失效，您确定要删除吗？'
        )) === 'ok'
          ? 'ok'
          : 'cancel';
      if (submitOk === 'ok') {
        const _TreeData = treeData;
        const { arr, index } = findTree(
          _TreeData,
          (item) =>
            item.logicModelId === propsItem.logicModelId && item.parentId === propsItem.parentId
        );
        notification.success({
          message: '提示',
          description: '操作成功，该关联模型已删除',
        });
        arr.splice(index, 1);
        setSecondLeftData([]);
        setSecondRightData([]);
        setDataList({ ...dataList, masterModel: _TreeData[0] });
        setSlotMenuListByCode(''); // 清空缓存的下拉框code
        setRightFormData(_TreeData[0]); // 设置右边的值为主模型
        // eslint-disable-next-line no-unused-expressions
        (treeShowProps?.ref?.current as any)?.initMaster(); // 边框设为主模型的
      }
    };

    const treeShowProps = {
      ref: useRef(),
      addTree,
      delTree,
      queryMenuList,
      slotMenuList,
      slotMenuListByCode,

      cellWidth: 230,
      cellMarginTop: 10 + 6 + 20,
      cellMarginLeft: 20 + 3,
      cellColor: '#000',
      cellBgColor: '#fff',
      cellBorder: '1px solid #DFDFDF',
      activeBorder: '1px solid #29bece',
      // activeCellBgColor: "blue",
      fontSize: 13,
      // cellWidth: 30,
      cellHeight: 50,
      lineWidth: 1,
      lineColor: '#29bece',
      cellClick: (v) => handleClickItem(v),
      treeData, // required
      models: {
        // required
        label: 'logicModelName',
        value: 'id',
        label2: 'referenceTableName',
      },
    };
    return (
      <>
        <div className={styles['right-tips']}>
          <ul>
            <li className={styles['tips-1-n']}>
              <span>
                <div />
                <section>N</section>
                <i />
              </span>
              <strong>1 - N</strong>
            </li>
            <li className={styles['tips-1-1']}>
              <span>
                <div />
                <section>1</section>
                <i />
              </span>
              <strong>1 - 1</strong>
            </li>
          </ul>
        </div>
        <TreeShow {...treeShowProps} />
      </>
    );
  }
);
export default observer((props: any) => <Index {...props} />);

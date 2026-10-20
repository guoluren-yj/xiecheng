/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
// import { uuid } from '@/utils/common';
import { uuid } from '@/utils/common.js';

import intl from 'hzero-front/lib/utils/intl';

import notification from 'hzero-front/lib/utils/notification';
/**
 * 遍历树
 */
type IMapTree = (
  data: boModel.combine.IBusinessObject[],
  callback
) => boModel.combine.IBusinessObject[];
export const mapTree: IMapTree = (data = [], callback) => {
  const _mapTree = (_data, _callback) =>
    _data.map((item, index, arr) => {
      let newItem = item;
      // 处理关系
      if (item?.businessObjectRelationList && item?.businessObjectRelationList?.length > 0) {
        newItem = {
          ...newItem,
          businessObjectRelationList: _mapTree(item.businessObjectRelationList, _callback),
        };
      }
      // 处理字段
      if (
        item?.businessObjectRelationFieldList &&
        item?.businessObjectRelationFieldList?.length > 0
      ) {
        newItem = {
          ...newItem,
          businessObjectRelationFieldList: _mapTree(
            item.businessObjectRelationFieldList,
            _callback
          ),
        };
      }
      return callback(newItem, index, arr) || newItem;
    });
  return _mapTree(data, callback);
};

// 对打平的关系对象处理字段和关系之间的id和parentId
export const dealIdAndParentId = data => {
  let fieldList = [];
  const originData = data?.map(item => {
    Object.assign(item, { id: item?.businessObjectRelationId });
    // 处理字段
    if (item?.businessObjectRelationFieldList) {
      fieldList = fieldList.concat(
        item?.businessObjectRelationFieldList?.map(i => ({
          ...i,
          parentId: i?.businessObjectRelationId,
        }))
      );
    }
    return item;
  });

  const list = fieldList.concat(originData);

  return list;
};

// 创建字段打平的关系对象处理字段和关系之间的id和parentId
export const dealCreateIdAndParentId = (data: any[], onLyChild?: any) => {
  let fieldList: boModel.combine.IBusinessObjectRelationFieldList[] = [];
  let relationList: boModel.combine.IBusinessObject[] = [];
  const originData = data?.map(item => {
    const _uuid = uuid();
    if (data[0]?.relateType === 'MASTER') {
      Object.assign(item, { parentId: null });
    }
    Object.assign(item, { id: item.id || _uuid });
    // 处理字段
    if (item?.businessObjectRelationFieldList) {
      const arr: boModel.combine.IBusinessObjectRelationFieldList[] = item?.businessObjectRelationFieldList?.map(
        i => {
          return {
            ...i,
            parentId: item.id || _uuid,
          };
        }
      );
      fieldList = [...fieldList, ...arr];
    }
    // 处理关联对象
    if (item?.businessObjectRelationList) {
      const arr: boModel.combine.IBusinessObject[] = item?.businessObjectRelationList?.map(i => {
        const _uuid1 = uuid();
        return {
          ...i,
          id: _uuid1,
          parentId: item.id || _uuid,
        };
      });
      relationList = [...relationList, ...arr];
    }
    return item;
  });
  // 只返回子节点
  if (onLyChild) {
    return [...relationList, ...fieldList];
  }
  // return fieldList.concat(originData).concat(relationList);
  return [...originData, ...relationList, ...fieldList];
};

// 打平数据转成树
export const toTree = selectData => {
  const _list: any = [];
  const map = {};
  selectData.forEach((i: any) => {
    Object.assign(i, {
      businessObjectRelationList: undefined,
      businessObjectRelationFieldList: undefined,
    });
    map[i.id] = i;
  });
  selectData.forEach(i => {
    if (i?.parentId) {
      // 非根节点
      if (i?.businessObjectId) {
        // 关系对象
        if (map[i.parentId] && !map?.[i.parentId]?.businessObjectRelationList) {
          map[i.parentId].businessObjectRelationList = [i];
        } else {
          // eslint-disable-next-line no-unused-expressions
          map?.[i.parentId]?.businessObjectRelationList.push(i);
        }
      } else if (map[i.parentId]) {
        if (map[i.parentId] && !map?.[i.parentId]?.businessObjectRelationFieldList) {
          map[i.parentId].businessObjectRelationFieldList = [i];
        } else {
          // eslint-disable-next-line no-unused-expressions
          map?.[i.parentId]?.businessObjectRelationFieldList.push(i);
        }
      }
    } else {
      // 根节点
      _list.push(i);
    }
  });
  return _list;
};

/**
 * 删除关系对象中模型上的id和parentId
 * @param {*} businessObject 完整对象
 * @return {*} 不包含parentId和id的数据视图完整对象
 */
export const deleteObjectModelId = businessObject => {
  // 保存前对新增视图模型清除所有模型上的id parentId
  const newModel = mapTree([businessObject], model => {
    if (model?.id || model?.parentId) {
      Object.assign(model, { id: undefined, parentId: undefined });
    }
  })?.[0];
  return newModel;
};

// 打平数据根据parentId寻找所有父对象列表 返回一个按照父节点顺序从上而下排列的list
export const getParentObjList = (data, parentId) => {
  const _data = [...data];
  const objList: boModel.combine.IBusinessObject[] = [];
  const getParentObj = (list, _parentId) => {
    const index = list.findIndex(item => item.id === _parentId);
    objList.unshift(list[index]);
    const curPid = list[index]?.parentId;
    list.splice(index, 1);
    if (curPid) {
      getParentObj(list, curPid);
    }
  };
  getParentObj(_data, parentId);
  return objList;
};

// 打平数据根据Id寻找所有当前对象的字段列表
/** *
 * @params0 data 打平数据列表
 * @params1 id 当前起始项id
 * @params2 flag 是否包含当前数据对象
 */
export const getChildList = (data, id, flag) => {
  const objList: boModel.combine.IBusinessObject[] = data.filter(item => item.parentId === id);
  if (flag) {
    const currentItem = data.find(item => item.id === id);
    if (currentItem) {
      objList.unshift(currentItem);
    }
  }
  return objList;
};

/**
 * list children行的数据 通过给定节点 找到此节点的所有父节点
 * @param tree tree数据
 * @param fun1 路径节点筛选条件判断
 * @param func2 终止条件判断
 * @param path 路径上的节点数据 以[{}, {}]形式返回
 */
export function treeFindPath(
  tree: any[],
  func1: any,
  func2: any,
  children = 'businessObjectRelationList',
  path: any[] = []
) {
  if (!tree) return [];
  for (const data of tree) {
    if (func2(data)) return path;
    // 这里按照需求来存放最后返回的内容
    if (func1(data)) {
      path.push(data);
    }
    if (data[children]) {
      const findChildren = treeFindPath(data[children], func1, func2, children, path);
      if (findChildren.length) return findChildren;
    }
    path.pop(); // 循环完一轮后不满足条件则清空数组
  }
  return [];
}

/**
 * list children行的数据 通过给定节点信息 找到树中的此节点
 * @param tree tree数据
 * @param fun 路径节点筛选条件判断
 * @param path 路径上的节点数据 以{}形式返回
 */
export function treeFindNode(tree: any[], func: any, children = 'businessObjectRelationList') {
  if (!tree) return [];
  for (const data of tree) {
    if (func(data)) {
      return data;
    }
    if (data[children]) {
      const childData = treeFindNode(data[children], func, children);
      if (childData) return childData;
    }
  }
  return undefined;
}

export const getFieldTree = data => {
  // const obj = {..._data};
  // 处理对象字段树列表数据
  const _getFieldTree = _obj => {
    if (_obj.businessObjectRelationFieldList || _obj.businessObjectRelationList) {
      // eslint-disable-next-line
      _obj.businessObjectRelationFieldList = [
        ...(_obj.businessObjectRelationFieldList || []),
        ...(_obj.businessObjectRelationList || []),
      ];
    }
    (_obj.businessObjectRelationList || []).forEach(d => {
      _getFieldTree(d);
    });
  };
  _getFieldTree(data);
  // return obj;
};

// 关联脚本保存校验
export const handleRelationCheck = (data) => {
  // 字段名保持一致
  let fieldSameFlag = true;
  // 触发类型编码不重复
  let typeCodeUniqueFlag = true;
  let fieldNameArr: string[] = [];
  let typeCodeArr: string[] = [];
  const scriptTypeArr: string[] = [];
  data.forEach((item) => {
    fieldNameArr.push(item.paramCode);
    typeCodeArr.push(item.triggerTypeCode);
    scriptTypeArr.push(item.scriptTypeCode);
  });
  fieldNameArr = fieldNameArr.filter(i => i !== undefined);
  fieldNameArr.forEach((item, index) => {
    if (index && fieldSameFlag && item !== fieldNameArr[index - 1]) {
      fieldSameFlag = false;
    }
  });
  typeCodeArr = typeCodeArr.filter(i => i !== undefined);
  typeCodeArr.filter(i => i !== undefined).forEach((item, index) => {
    // 触发类型编码第一次出现的位置不是当前遍历到的位置，说明index前存在重复数据
    if (typeCodeUniqueFlag && typeCodeArr.indexOf(item) !== index) {
      typeCodeUniqueFlag = false;
    }
  });
  const beforeTypeArr = scriptTypeArr.filter(item => item === 'BEFORE');
  const afterTypeArr = scriptTypeArr.filter(item => item === 'AFTER');
  if (!fieldSameFlag) {
    notification.warning({
      message: intl.get('hitf.common.same.field.info').d('同一接口下不允许出现多个字段名，请检查'),
    });
  }
  if (!typeCodeUniqueFlag) {
    notification.warning({
      message: intl.get('hitf.common.type.code.unique.info').d('同一接口下，触发类型编码不允许重复，请检查'),
    });
  }
  if (beforeTypeArr.length > 1 || afterTypeArr.length > 1) {
    notification.warning({
      message: intl.get('hitf.common.script.type.info').d('同一接口下，仅可出现一个前置脚本与后置脚本，请检查'),
    });
  }
  return fieldSameFlag && typeCodeUniqueFlag && beforeTypeArr.length <= 1 && afterTypeArr.length <= 1;
};

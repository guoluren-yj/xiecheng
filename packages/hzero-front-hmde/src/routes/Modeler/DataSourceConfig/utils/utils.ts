import { treeToArr } from '@/utils/treeUtils';

/**
 * 自动解决冲突
 * @param {*} rightData 需要解决冲突的数组
 * @param {*} item 当前数组的迭代对象
 */
export const resolveConflict = (rightData: any[], item) => {
  let i = 1;
  const lookDuplicate = (newItem) => {
    // 判断是否存在重复 true:重复
    return rightData.some(
      (ele) =>
        ele.secParentCode !== item.secParentCode &&
        ele.aliasName.toLowerCase() === newItem.aliasName.toLowerCase() && // 对比的不是自己
        !Object.prototype.hasOwnProperty.call(ele, 'modelFields') && // 对比的不是模型
        !Object.prototype.hasOwnProperty.call(ele, 'fields') // 对比的不是模型
    );
  };
  const dealDuplicate = () => {
    rightData.forEach((obj) => {
      if (
        obj.secParentCode !== item.secParentCode && // 解决冲突的字段不是自己
        obj.aliasName.toLowerCase() === item.aliasName.toLowerCase()
      ) {
        Object.assign(item, { aliasName: `${item.aliasName}${i}` });
        i += 1;
      }
    });
  };
  while (lookDuplicate(item)) {
    // 循环解决冲突
    dealDuplicate();
  }
};

const judgerCode = (item) => {
  if (item.relationCode) {
    return `${item.code || item.logicModelCode}${item.relationCode}`;
  }
  return item.code || item.logicModelCode;
};

export const mapToSecondData = (data: any[], childrenName: string) => {
  // 扩充指向父级指针
  let newData = [...data];
  newData = data.map((item) => {
    if (Array.isArray(item[childrenName])) {
      return {
        ...item,
        aliasName: item.aliasName || item.logicModelName || item.name || '',
        secCode: judgerCode(item),
        [childrenName]: item[childrenName].map((field) => ({
          ...field,
          aliasName: field.aliasName || field.fieldName || field.name || '',
          // secParentCode: item.code || item.logicModelCode,
          secParentCode: judgerCode(item),
          secCode: field.code || field.modelFieldCode,
        })),
      };
    }
    return {
      ...item,
      [childrenName]: [],
      aliasName: item.aliasName || item.logicModelName || item.name || '',
      secCode: judgerCode(item),
    };
  });
  // 打平
  newData = treeToArr(newData, childrenName);
  return newData;
};

export const mapTree = (data, callback) => {
  const _mapTree = (_data, _callback, self) =>
    _data.map((item) => {
      let newItem = _callback(item, self) || item;
      if (item.children && item.children.length > 0) {
        newItem = { ...newItem, children: _mapTree(item.children, _callback, newItem) };
      }
      return newItem;
    });
  return _mapTree(data, callback, null);
};

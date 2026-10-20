import { isArray } from 'lodash';

/**
 * 对集合操作的方法
 * @email WY <yang.wang06@hand-china.com>
 * @creationDate 2019/12/30
 * @copyright HAND ® 2019
 */

interface TravelTreeOption<T> {
  childrenName?: string;
  parent?: T;
  childrenNullable: boolean;
}
/**
 * 遍历并转化树
 */
export function mapTree<T = any, P = T>(
  tree: T[],
  iter: (item: T, parent?: P) => P,
  options: TravelTreeOption<P>
): P[] {
  return (tree || []).map(item => {
    const { childrenName = 'children', parent, childrenNullable = false } = options || {};
    const tran = iter(item, parent);
    if (tran[childrenName] || !childrenNullable) {
      tran[childrenName] = mapTree(tran[childrenName] || [], iter, {
        ...options,
        parent: tran,
      });
    }
    return tran;
  });
}

// 树形数据转成数组
export function transformTreeToArr(
  treeData = [], // 树形数据
  valueField, // 树形值字段
  childrenFieldName = 'children', // 树形数据子节点字段
  idKeyName = 'id', // 数组主键字段
  parentKeyName = 'parentId', // 数组关联的父级数据字段
): object[] {
  if (!treeData.length) {
    return [];
  }
  const arr: object[] = [];
  const _transformTreeToArr = (data, parentValue?) => {
    data.forEach((item) => {
      arr.push({
        ...item,
        [idKeyName]: item[valueField],
        [parentKeyName]: parentValue,
      });
      const children = item[childrenFieldName];
      if (isArray(children) && children.length > 0) {
        _transformTreeToArr(children, item[valueField]);
      }
    });
  };
  _transformTreeToArr(treeData);
  return arr;
}

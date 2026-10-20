// import React from 'react';
import intl from 'hzero-front/lib/utils/intl';
/**
     * 收货管理配置 - 行Column处理
     * @delivery {*} params
     * return arr
   */
 const lineDataColumns: (x: Array<any>) => any = (columns) => {
    const line = columns.map((item: any) => {
        const { name = '', width, editor = false, renderer = undefined, command=undefined, custHidden = false } = item;
        if (!custHidden) return { name, width, editor, renderer, command };
        return null;
    });
    return line;
 };


 /**
     * 收货管理配置 - 节点个性化展示处理
     * @delivery {*} params
     * return string
*/
const custNode = (node) => {
  const _arr = [
    intl.get('sinv.receiptManage.model.receipt.nodeOne').d('节点一'),
    intl.get('sinv.receiptManage.model.receipt.nodeTwo').d('节点二'),
    intl.get('sinv.receiptManage.model.receipt.nodeThree').d('节点三'),
    intl.get('sinv.receiptManage.model.receipt.nodeFour').d('节点四'),
    intl.get('sinv.receiptManage.model.receipt.nodeFive').d('节点五'),
    intl.get('sinv.receiptManage.model.receipt.nodeSix').d('节点六'),
    intl.get('sinv.receiptManage.model.receipt.nodeSeven').d('节点七'),
    intl.get('sinv.receiptManage.model.receipt.nodeEight').d('节点八'),
    intl.get('sinv.receiptManage.model.receipt.nodeNine').d('节点九'),
    intl.get('sinv.receiptManage.model.receipt.nodeTen').d('节点十'),
  ];
  const num = node?.charCodeAt(0)-65;
  // eslint-disable-next-line array-callback-return
  const val = _arr.map((item = '-', index) => {
    if (num === index) return item;
  });
  return val;
};



export { lineDataColumns, custNode };
import React from 'react';
// import { Table } from 'choerodon-ui/pro';
import { Table } from 'hzero-ui';

/**
 * 判断两个 dataSet 中的数据是否一致
 * @param {dataSet} pDs
 * @param {dataSet} nDs
 */
// const checkSameDataSet = (pDs, nDs, keyValue) => {
//   let checkedFlag = true; // 数据一致为true
//   if (pDs.length === nDs.length) {
//     // 数据长度相等
//     for (let i = 0; i < pDs.length; i++) {
//       if (pDs[i]?.get(keyValue) !== nDs[i]?.get(keyValue)) {
//         checkedFlag = false;
//       }
//     }
//   } else {
//     checkedFlag = false;
//   }

//   return checkedFlag;
// };

// const shouldRender = (prevProps, nextProps) => {
//   const prevDS = prevProps.dataSet;
//   const nextDS = nextProps.dataSet;
//   // 返回真值 页面不重新渲染
//   return checkSameDataSet(prevDS, nextDS, 'id');
// };

const ListTable = (props) => {
  return (
    <>
      <Table {...props} />
    </>
  );
};

export default ListTable;

// export default React.memo(ListTable, shouldRender);

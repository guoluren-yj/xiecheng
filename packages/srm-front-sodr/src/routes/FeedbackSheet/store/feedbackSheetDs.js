/*
 * @Descripttion:
 * @version: 0.0.1
 * @Author: lilingfeng <lingfeng.li@going-link.com>
 * @Date: 2021-08-03 15:51:50
 * @LastEditors: lilingfeng
 * @LastEditTime: 2021-10-15 16:52:56
 */
import intl from 'utils/intl';

const queryDs = () => ({
  fields: [],
});

const referenceQueryDs = () => ({
  fields: [],
});

const lineDs = (qDs) => ({
  dataToJSON: 'selected',
  autoQuery: false,
  paging: 'server',
  primaryKey: 'feedbackId',
  idField: 'feedbackId',
  parentField: 'parentId',
  expandField: 'isExpand',
  modifiedCheck: false,
  fields: [
    {
      name: 'action',
      label: intl.get(`sodr.feedbackSheet.model.common.action`).d('操作'),
    },
  ],
  queryDataSet: qDs,
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((i) => {
        i.init('isExpand', false);
        Object.assign(i, { status: 'update' });
      });
    },
    select: ({ dataSet, record }) => {
      if (record.data.parentId) {
        // 勾选子行 只需求勾选父行
        dataSet.select(dataSet.filter((i) => i.data.feedbackId === record.data.parentId)[0]);
      } else if (record.data.parentId === null && record.data.feedbackId) {
        dataSet
          .filter((i) => i.data.parentId === record.data.feedbackId)
          .forEach((i) => dataSet.select(i));
      }
    },
    unSelect: ({ dataSet, record }) => {
      if (record.data.parentId) {
        dataSet.unSelect(dataSet.filter((i) => i.data.feedbackId === record.data.parentId)[0]);
      } else if (record.data.parentId === null && record.data.feedbackId) {
        // 取消父行 需要取消所有子行
        dataSet
          .filter((i) => i.data.parentId === record.data.feedbackId)
          .forEach((i) => dataSet.unSelect(i));
      }
    },
  },
});

const referencingLineDs = (qDs) => ({
  dataToJSON: 'selected',
  autoQuery: false,
  // paging: 'server',
  // primaryKey: 'feedbackId',
  // idField: 'feedbackId',
  // parentField: 'parentId',
  // expandField: 'isExpand',
  modifiedCheck: false,
  fields: [
    // {
    //   name: 'action',
    //   label: intl.get(`sodr.feedbackSheet.model.common.action`).d('操作'),
    // },
  ],
  queryDataSet: qDs,
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((i) => {
        // i.init('isExpand', false);
        Object.assign(i, { status: 'update' });
      });
    },
    select: ({ dataSet, record }) => {
      if (record.data.parentId) {
        // 勾选子行 只需求勾选父行
        dataSet.select(dataSet.filter((i) => i.data.feedbackId === record.data.parentId)[0]);
      } else if (record.data.parentId === null && record.data.feedbackId) {
        dataSet
          .filter((i) => i.data.parentId === record.data.feedbackId)
          .forEach((i) => dataSet.select(i));
      }
    },
    unSelect: ({ dataSet, record }) => {
      if (record.data.parentId) {
        dataSet.unSelect(dataSet.filter((i) => i.data.feedbackId === record.data.parentId)[0]);
      } else if (record.data.parentId === null && record.data.feedbackId) {
        // 取消父行 需要取消所有子行
        dataSet
          .filter((i) => i.data.parentId === record.data.feedbackId)
          .forEach((i) => dataSet.unSelect(i));
      }
    },
  },
});

export { lineDs, queryDs, referencingLineDs, referenceQueryDs };

// import { SRM_SMBL } from '@/utils/config.js';
// import intl from 'utils/intl';
//
// function queueConsumerDS() {
//   return {
//     primaryKey: 'consumerId',
//     autoQuery: true,
//     selection: 'multiple',
//     autoQueryAfterSubmit: true,
//     pageSize: 10,
//
//     // table表单显示的字段
//     fields: [
//       {
//         name: 'consumerCode',
//         type: 'string',
//         required: true,
//         label: intl.get('smbl.queue.model.Queue.consumerCode').d('消费组编码'),
//       },
//       {
//         name: 'consumerName',
//         type: 'string',
//         required: true,
//         label: intl.get('smbl.queue.model.Queue.consumerName').d('消费组名称'),
//       },
//       {
//         name: 'enableFlag',
//         type: 'boolean',
//         label: intl.get('hzero.common.status.enabled').d('启用标识'),
//         defaultValue: 1,
//         trueValue: 1,
//         falseValue: 0,
//       },
//       {
//         name: 'remark',
//         type: 'string',
//         label: intl.get('smbl.queue.model.Queue.remark').d('备注'),
//       },
//     ],
//
//     // 事件
//     events: {
//       // 提交成功后在做一次查询，指定查第一页最新数据,一般如果后端没有在执行动作后没有返回数据给前端，需要在做一次查询
//       submitSuccess: ({ dataSet }) => dataSet.query(1),
//     },
//
//     transport: {
//       read: ({ data }) => {
//         // console.info(data,99999999999);
//         if (data.tagId) {
//           const { tagId } = data;
//           return {
//             url: `${SRM_SMBL}/v1/queue-consumers/${tagId}`,
//             method: 'get',
//           };
//         } else {
//           return null;
//         }
//       },
//       destroy: {
//         url: `${SRM_SMBL}/v1/queue-consumers/`,
//         method: 'delete',
//       },
//       create: {
//         url: `${SRM_SMBL}/v1/queue-consumers/`,
//         method: 'post',
//         autoQuery: true,
//       },
//       update: {
//         url: `${SRM_SMBL}/v1/queue-consumers/`,
//         method: 'post',
//       },
//     },
//   };
// }
// export { queueConsumerDS };

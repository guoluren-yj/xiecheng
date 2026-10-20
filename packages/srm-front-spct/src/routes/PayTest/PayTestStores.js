// /**
//  * 支付测试页面 DataSet
//  * @returns
//  */
// const PayTestDS = () => ({
//   transport: {
//     // create: ({ data }) => {
//     //   return {
//     //     url: `${MEMBER_MANAGE}/v1/${organizationId}/members/modify-list?sagaKey=`,
//     //     data,
//     //     method: 'POST',
//     //   };
//     // },
//     // update: ({ data }) => {
//     //   return {
//     //     url: `${MEMBER_MANAGE}/v1/${organizationId}/members/modify-list?sagaKey=`,
//     //     data,
//     //     method: 'POST',
//     //   };
//     // },
//   },
//   pageSize: 10,
//   primaryKey: 'id',
//   selection: false,
//   fields: [
//     {
//       label: '支付订单编号',
//       name: 'merchantOrderNum',
//       type: 'string',
//       required: true,
//     },
//     {
//       label: '交易标题',
//       name: 'paymentSubject',
//       type: 'string',
//       required: true,
//     },
//     {
//       label: '订单描述',
//       name: 'paymentDescription',
//       type: 'string',
//     },
//     {
//       label: '金额',
//       name: 'paymentAmount',
//       type: 'number',
//       step: 0.01,
//       min: 0,
//       required: true,
//     },
//     {
//       label: '页面回调url',
//       name: 'returnUrl',
//       type: 'string',
//     },
//     {
//       label: '支付回调通知url',
//       name: 'notifyUrl',
//       type: 'string',
//     },
//     {
//       label: '支付客户',
//       name: 'paymentCustomer',
//       type: 'string',
//       required: true,
//     },
//     {
//       label: '币种',
//       name: 'currencyCode',
//       type: 'string',
//       defaultValue: 'CNY',
//       required: true,
//     },
//   ],
//   queryFields: [],
// });

// export { PayTestDS };

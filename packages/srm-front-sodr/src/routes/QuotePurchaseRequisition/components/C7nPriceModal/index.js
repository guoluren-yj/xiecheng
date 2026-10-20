/*
 * C7nPriceModal - 工作台参考价格弹窗
 * @date: 2021/05/26 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */
// import { observer } from 'mobx-react-lite';
// import React, { useMemo, useEffect } from 'react';
// import { DataSet, Table, Modal } from 'choerodon-ui/pro';

// import intl from 'utils/intl';
// import { SRM_SPUC } from '_utils/config';
// import { getCurrentOrganizationId } from 'utils/utils';

// import { priceTable, ladderPrice } from './store/c7nPriceModalDs';

// const tenantId = getCurrentOrganizationId();

// const C7nPriceModal = (props) => {
//   const {
//     modal,
//     params = {},
//     alert = null,
//     readOnly = true, // 目前只在引用单据创建采购申请只读
//     customizeTable,
//     customizeUnitCode,
//     tableReadOnly = true,
//   } = props;

//   useEffect(() => {
//     if (modal) {
//       const { update } = modal;
//       const { onOk } = modal.props;
//       update({
//         onOk: () => onOk(priceTableDs),
//       });
//     }
//     priceTableDs.query();
//   }, []);

//   const priceTableDs = useMemo(
//     () =>
//       new DataSet({
//         ...priceTable(),
//         transport: {
//           read: ({ params: _params }) => {
//             return readOnly
//               ? {
//                   url: `${SRM_SPUC}/v1/${tenantId}/po-header/reference-price`,
//                   method: 'GET',
//                   params,
//                 }
//               : {
//                   url: `${SRM_SPUC}/v1/${tenantId}/po-header/new-reference-price`,
//                   method: 'PUT',
//                   data: params,
//                   params: { customizeUnitCode, ..._params },
//                 };
//           },
//         },
//       }),
//     []
//   );
//   const ladderPriceDs = useMemo(() => new DataSet(ladderPrice()));
//   const ladderPriceColumns = useMemo(() => [
//     {
//       name: 'ladderLineNum',
//     },
//     {
//       name: 'numberRange',
//       renderer: ({ record }) => `[${record.get('ladderFrom')},${record.get('ladderTo')})`,
//     },
//     {
//       name: 'ladderPrice',
//     },
//     {
//       name: 'ladderPriceRemark',
//     },
//   ]);

//   const openLadderPriceModal = (record) => {
//     ladderPriceDs.loadData(record.get('ladderPriceLibList') || []);
//     Modal.open({
//       title: intl.get(`sodr.common.model.common.ladderPrice`).d('阶梯价格'),
//       style: { width: 582 },
//       drawer: true,
//       destroyOnClose: true,
//       children: <Table dataSet={ladderPriceDs} columns={ladderPriceColumns} />,
//     });
//   };
//   const columns = useMemo(() => {
//     const defaultColumns = [
//       {
//         name: 'taxPrice',
//         width: 120,
//       },
//       {
//         name: 'unitPrice',
//         width: 120,
//       },
//       {
//         name: 'uomCodeName',
//         width: 120,
//       },
//       {
//         name: 'currencyCode',
//         width: 120,
//       },
//       {
//         name: 'taxCode',
//         width: 120,
//       },
//       {
//         name: 'taxRate',
//         width: 80,
//       },
//       {
//         name: 'ladderPrice',
//         width: 120,
//         renderer: ({ record }) =>
//           record.get('ladderInquiryFlag') === 1 && (
//             // <Popover
//             //   arrowPointAtCenter
//             //   onVisibleChange={(visible) => onVisibleChange(visible, record)}
//             //   content={
//             //     <Table
//             //       style={{ width: 500 }}
//             //       dataSet={ladderPriceDs}
//             //       columns={ladderPriceColumns}
//             //     />
//             //   }
//             // >
//             //   <a>{intl.get(`sodr.common.model.common.ladderPrice`).d('阶梯价格')}</a>
//             // </Popover>
//             <a onClick={() => openLadderPriceModal(record)}>
//               {intl.get(`sodr.common.model.common.ladderPrice`).d('阶梯价格')}
//             </a>
//           ),
//       },
//       {
//         name: 'priceSource',
//         width: 120,
//         renderer: ({ record }) => record.get('priceSourceMeaning'),
//       },
//       {
//         name: 'orderNum',
//         width: 150,
//       },
//     ];
//     const requestColumns = [
//       {
//         name: 'supplierCompanyNum',
//         width: 120,
//       },
//       {
//         name: 'supplierCompanyName',
//         width: 210,
//       },
//     ];
//     if (readOnly) {
//       defaultColumns.unshift(...requestColumns);
//     }
//     return defaultColumns;
//   }, []);

//   // const handleModal = () => {
//   //   const modalProps = Object.assign(
//   //     {
//   //       style: { width: 800 },
//   //       title: intl.get('sodr.workspace.model.common.referPrice').d('参考价格'),
//   //       children: (
//   //         <Table
//   //           dataSet={priceTableDs}
//   //           columns={columns}
//   //           selectionMode={readOnly ? 'none' : 'rowbox'}
//   //         />
//   //       ),
//   //     },
//   //     readOnly ? { footer: null, closable: true } : { onOk: () => onOk(priceTableDs) }
//   //   );
//   //   Modal.open(modalProps);
//   //   priceTableDs.query();
//   // };
//   if (customizeTable && customizeUnitCode) {
//     return (
//       <>
//         {alert}
//         {customizeTable(
//           {
//             code: customizeUnitCode,
//           },
//           <Table
//             dataSet={priceTableDs}
//             columns={columns}
//             selectionMode={tableReadOnly ? 'none' : 'rowbox'}
//           />
//         )}
//       </>
//     );
//   }
//   return (
//     // <a disabled={disabled} onClick={handleModal}>
//     //   {intl.get('sodr.workspace.model.common.referPrice').d('参考价格')}
//     // </a>
//     <>
//       {alert}
//       <Table
//         dataSet={priceTableDs}
//         columns={columns}
//         selectionMode={tableReadOnly ? 'none' : 'rowbox'}
//       />
//     </>
//   );
// };

// 同步工作台参考价格组件
import C7nPriceModal from '@/routes/components/C7nPriceModal';

export default C7nPriceModal;

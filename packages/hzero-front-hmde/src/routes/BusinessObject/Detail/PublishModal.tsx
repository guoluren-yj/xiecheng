// import React, { useEffect, useMemo, useState } from 'react';
// import intl from 'srm-front-boot/lib/utils/intl';
// import { getResponse, isTenantRoleLevel } from 'utils/utils';
// import { DataSet, Table, Button } from 'choerodon-ui/pro';
// import { observer } from 'mobx-react-lite';
// import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
// import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
// import { TableColumnTooltip } from 'choerodon-ui/pro/lib/table/enum';
// import styles from './index.less';
// import ImgIcon from '@/utils/ImgIcon';
// import { publishDS } from '@/stores/BusinessObject/PublishDS';
// import { syncModel, fixPhysical } from '@/services/businessObjectService';
// import { usePublicBusinessObjects } from '@/routes/BusinessObject/Detail';

// interface IProps {
//   data?: {
//     errorList?: any[];
//     warningList?: any[];
//     code?: string;
//     message?: string;
//     type?: string;
//     businessObject: any;
//     physicalModelId?: string;
//   };
//   baseInfoDS?: any;
//   initDetail?: any;
//   modal?: any;
//   listRef?: any;
// }

// const PublishModal = (props: IProps) => {
//   const { data, baseInfoDS, initDetail, modal, listRef } = props;

//   const PublishErrorDS = useMemo(() => new DataSet(publishDS()), []);
//   const PublishWarnDS = useMemo(() => new DataSet(publishDS()), []);
//   const [loading, setLoading] = useState(false);
//   const [warnLoading, setWarnLoading] = useState(false);
//   const { handlePublicObject } = usePublicBusinessObjects({
//     queryParams: true,
//     ignoreWarning: true,
//   });

//   useEffect(() => {
//     const errorList = data?.errorList?.map((list, index) => {
//       return {
//         index: `#${index + 1}`,
//         ...list,
//       };
//     });
//     PublishErrorDS.loadData(errorList);
//     const warnList = data?.warningList?.map((list, index) => {
//       return {
//         index: `#${index + 1}`,
//         ...list,
//       };
//     });
//     PublishWarnDS.loadData(warnList);
//     let modalProps = {};
//     if (data?.code === 'hmde.error.publish.physical_model_changed') {
//       modalProps = {
//         okText: intl.get('hmde.bo.publish.button.FixAndPublish').d('修复并发布'),
//         onOk: () => {
//           const {
//             physicalModelId,
//             businessObject: { objectVersionNumber, businessObjectId, publishStatus },
//           } = data;
//           const body = {
//             physicalModelId,
//             objectVersionNumber,
//             businessObjectId,
//             publishStatus,
//           };
//           setTimeout(() => {
//             modal.update({
//               okProps: { loading: true },
//             });
//           }, 0);
//           fixPhysical(body).then((res) => {
//             if (getResponse(res)) {
//               publicObject(businessObjectId);
//             } else {
//               modal.close();
//             }
//           });
//           return false;
//         },
//       };
//     } else if (data?.code === 'hmde.error.publish.physical_model_not_exist') {
//       modalProps = {
//         okText: intl.get('hmde.bo.publish.button.fix').d('修复'),
//         onOk: () => {
//           const {
//             physicalModelId,
//             businessObject: { objectVersionNumber, businessObjectId, publishStatus },
//           } = data;
//           const body = {
//             physicalModelId,
//             objectVersionNumber,
//             businessObjectId,
//             publishStatus,
//           };
//           setTimeout(() => {
//             modal.update({
//               okProps: { loading: true },
//             });
//           }, 0);
//           fixPhysical(body).then((res) => {
//             getResponse(res);
//             modal.close();
//           });
//           return false;
//         },
//       };
//     } else if (data?.code === 'hmde.error.publish.field_error' && data?.type === 'error') {
//       modalProps = {
//         okText: intl.get('hmde.bo.publish.button.publish').d('发布'),
//         okProps: { disabled: true },
//       };
//     } else if (data?.code === 'hmde.error.publish.field_error' && data?.type === 'warn') {
//       modalProps = {
//         okText: intl.get('hmde.bo.publish.button.publish').d('发布'),
//         onOk: () => {
//           const {
//             businessObject: { businessObjectId },
//           } = data;
//           setTimeout(() => {
//             modal.update({
//               okProps: { loading: true },
//             });
//           }, 0);
//           publicObject(businessObjectId);
//           return false;
//         },
//       };
//     } else if (data?.code === 'hmde.error.publish.physical_model_cannot_create') {
//       modalProps = {
//         footer: (okBtn) => <div>{okBtn}</div>,
//       };
//     }
//     modal.update(modalProps);
//   }, []);

//   const publicObject = (businessObjectId) => {
//     handlePublicObject(businessObjectId).then(() => {
//       if (baseInfoDS) {
//         baseInfoDS.query();
//       }
//       if (initDetail) {
//         initDetail();
//       }
//       modal.close();
//     });
//   };

//   const columns = [
//     { name: 'index', tooltip: TableColumnTooltip.overflow },
//     { name: 'businessObjectFieldName', tooltip: TableColumnTooltip.overflow },
//     {
//       name: 'propertyType',
//       tooltip: TableColumnTooltip.overflow,
//     },
//     {
//       name: 'message',
//       width: 400,
//       tooltip: TableColumnTooltip.overflow,
//     },
//     {
//       name: 'physicsValue',
//       tooltip: TableColumnTooltip.overflow,
//     },
//     {
//       name: 'businessValue',
//       tooltip: TableColumnTooltip.overflow,
//     },
//   ] as ColumnProps[];

//   const tipRender = () => {
//     let tip = '';
//     const iconName = 'publish_fail_icon.svg';
//     const picName = 'publish_fail_red.png';
//     if (data?.code) {
//       switch (data?.code) {
//         case 'hmde.error.publish.field_error':
//           tip = intl
//             .get('hmde.bo.publish.fieldTip')
//             .d(
//               '请先解决以下差异才能再次发布，请选择字段并点击批量“批量同步”按钮进行同步，将物理模型属性同步到业务对象'
//             );
//           break;
//         case 'hmde.error.publish.physical_model_changed':
//           tip = intl
//             .get('hmde.bo.publish.modelChangedTip')
//             .d('请点击“修复并发布”将关联此同名的物理模型');
//           break;
//         case 'hmde.error.publish.physical_model_not_exist':
//           tip = intl
//             .get('hmde.bo.publish.modelExitTip')
//             .d('请点击“修复”按钮将清空与原物理模型关系，再次发布将生成新的物理模型');
//           break;
//         default:
//           tip = '';
//           break;
//       }
//     }
//     return tip !== '' ? (
//       <div className={styles['tip-contain']}>
//         <div>
//           <ImgIcon name={iconName} size={14} />
//           <span>{tip}</span>
//         </div>
//         <ImgIcon name={picName} style={{ width: '195px', height: '28px' }} />
//       </div>
//     ) : null;
//   };

//   const syncField = (dataSet: DataSet, flag: string) => {
//     if (flag === 'error') {
//       setLoading(true);
//     } else {
//       setWarnLoading(true);
//     }
//     const body = dataSet.selected.map((item) => {
//       return { ...item.toJSONData() };
//     });
//     syncModel(body).then((res) => {
//       if (getResponse(res)) {
//         // eslint-disable-next-line no-unused-expressions
//         listRef?.current?.tableDS?.query();
//         if (!isTenantRoleLevel()) {
//           // eslint-disable-next-line no-unused-expressions
//           listRef?.current?.extendTableDS?.query();
//         }
//         dataSet.remove(dataSet.selected);
//         if (
//           data?.code === 'hmde.error.publish.field_error' &&
//           PublishErrorDS?.toData()?.length === 0
//         ) {
//           modal.update({
//             okProps: { disabled: false },
//             okText: intl.get('hmde.bo.publish.button.publish').d('发布'),
//             onOk: () => {
//               const {
//                 businessObject: { businessObjectId },
//               } = data;
//               setTimeout(() => {
//                 modal.update({
//                   okProps: { loading: true },
//                 });
//               }, 0);
//               publicObject(businessObjectId);
//               return false;
//             },
//           });
//         }
//         if (baseInfoDS) {
//           baseInfoDS.query();
//         }
//         if (initDetail) {
//           initDetail();
//         }
//       }
//       setLoading(false);
//       setWarnLoading(false);
//     });
//   };

//   const ErrorButtons = [
//     <Button
//       style={{ marginTop: '5px' }}
//       loading={loading}
//       onClick={() => {
//         // eslint-disable-next-line no-unused-expressions
//         PublishErrorDS?.selected?.length && syncField(PublishErrorDS, 'error');
//       }}
//     >
//       <ImgIcon name="tonbu-lv.svg" size={14} style={{ marginRight: 4 }} />
//       {intl.get('hmde.common.button.sync').d('批量同步')}
//     </Button>,
//   ] as Buttons[];

//   const warnButtons = [
//     <Button
//       style={{ marginTop: '5px' }}
//       loading={warnLoading}
//       onClick={() => {
//         // eslint-disable-next-line no-unused-expressions
//         PublishWarnDS?.selected?.length && syncField(PublishWarnDS, 'warn');
//       }}
//     >
//       <ImgIcon name="tonbu-lv.svg" size={14} style={{ marginRight: 4 }} />
//       {intl.get('hmde.common.button.sync').d('批量同步')}
//     </Button>,
//   ] as Buttons[];

//   return (
//     <div className={styles['more-property-contain']}>
//       {(data?.errorList?.length || !data?.warningList?.length) && (
//         <div>
//           {data?.errorList?.length && data?.warningList?.length && (
//             <div className={styles['info-title']}>
//               {intl.get('hzero.bo.publish.title.error').d('失败信息')}
//             </div>
//           )}
//           <div className={styles['property-message']}>{data?.message}</div>
//           {tipRender()}
//           {data?.errorList?.length && (
//             <div className={styles['publish-table']}>
//               <Table
//                 dataSet={PublishErrorDS}
//                 columns={columns}
//                 buttons={ErrorButtons}
//                 showRemovedRow={false}
//               />
//             </div>
//           )}
//         </div>
//       )}
//       {data?.warningList?.length && (
//         <div>
//           {data?.errorList?.length && data?.warningList?.length && (
//             <div className={styles['info-title']} style={{ marginTop: '15px' }}>
//               {intl.get('hzero.bo.publish.title.warn').d('警告信息')}
//             </div>
//           )}
//           <div className={styles['property-message']}>{data?.message}</div>
//           <div className={styles['tip-contain-warn']}>
//             <div>
//               <ImgIcon name="publish_warning_icon.svg" size={14} />
//               <span>
//                 {intl
//                   .get('hmde.bo.publish.warnTip')
//                   .d(
//                     '可以继续发布，如需处理差异，请选择字段并点击批量“批量同步”按钮进行同步，将物理模型属性同步到业务对象'
//                   )}
//               </span>
//             </div>
//             <ImgIcon name="yellow@3x.png" style={{ width: '195px', height: '28px' }} />
//           </div>
//           <div className={styles['publish-table']}>
//             <Table
//               dataSet={PublishWarnDS}
//               columns={columns}
//               buttons={warnButtons}
//               showRemovedRow={false}
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default observer(PublishModal);

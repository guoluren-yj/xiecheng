// import React, {
//   Fragment,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
//   useCallback,
//   useImperativeHandle,
// } from 'react';
// import {
//   Form,
//   DataSet,
//   Output,
//   NumberField,
//   TextField,
//   TextArea,
//   Table,
//   Spin,
//   Select,
//   Lov,
//   DatePicker,
//   DateTimePicker,
//   Switch,
//   CheckBox,
// } from 'choerodon-ui/pro';
// import { isEmpty } from 'lodash';
// import classnames from 'classnames';

// import intl from 'utils/intl';
// import C7NUpload from '_components/C7NUpload';
// import {
//   getResponse,
//   getCurrentOrganizationId,
//   filterNullValueObject,
//   getDateFormat,
//   getDateTimeFormat,
// } from 'utils/utils';
// import notification from 'utils/notification';
// import { PRIVATE_BUCKET } from '_utils/config';

// import { fetchHeader, savePurchaseData } from '@/services/quotationDetailNewService';
// import { ChunkUploadProps } from '@/utils/SsrcRegx';
// import inquiryNewUpdateStyle from '@/routes/ssrc/InquiryHallNew/Update/index.less';
// import { execMathExpress } from '../calculate';
// import { formDS, tableDS } from './storeDS';

// import style from '../index.less';

// const organizationId = getCurrentOrganizationId();

// export default function Content({ rowData, sourceFrom, contentRef, uiType, operationType }) {
//   // 暴露子组件的api给父组件使用
//   useImperativeHandle(contentRef, () => ({
//     handleSaveAll,
//   }));

//   const templateRef = useRef({});
//   const tableDsRef = useRef({});
//   const headerRef = useRef({});

//   const [moduleRule, setModuleRule] = useState();
//   const [dynamicColumns, setDynamicColumns] = useState({});
//   const [queryLoading, setQueryLoading] = useState(false);

//   const formDs = useMemo(() => new DataSet(formDS()), []);

//   const {
//     rfxLineItemId,
//     bidLineItemId,
//     itemId,
//     itemCategoryId,
//     rfxHeaderId,
//     bidHeaderId,
//     quotationHeaderCurrentId,
//     projectLineItemId,
//     sourceProjectId,
//     quotationTemplateId,
//   } =
//     uiType === 'hzero'
//       ? rowData
//       : rowData.get([
//           'rfxLineItemId',
//           'bidLineItemId',
//           'itemId',
//           'itemCategoryId',
//           'rfxHeaderId',
//           'bidHeaderId',
//           'quotationHeaderCurrentId',
//           'projectLineItemId',
//           'sourceProjectId',
//           'quotationTemplateId',
//         ]);

//   useEffect(() => {
//     init();
//   }, []);

//   const init = () => {
//     const params = {
//       sourceFrom,
//       itemId,
//       itemCategoryId,
//       quotationHeaderCurrentId,
//       quotationTemplateId,
//       rfxHeaderId: rfxHeaderId || bidHeaderId || sourceProjectId,
//       rfxLineItemId: rfxLineItemId || bidLineItemId || projectLineItemId,
//       operationType,
//     };
//     setQueryLoading(true);
//     fetchHeader(params)
//       .then((res) => {
//         const result = getResponse(res);
//         if (result && !result.failed) {
//           const { supQuotationDtlCurPage = {}, moduleList = [] } = result;
//           // 缓存头数据
//           headerRef.current = result;
//           // 分模块
//           if (result.moduleRule === 'SUB_MODULE') {
//             let columns = [];
//             // 缓存ds
//             moduleList.forEach((i) => {
//               tableDsRef.current = {
//                 ...tableDsRef.current,
//                 [i.templateId]: new DataSet(tableDS({ queryParams: params, handleDataSource })),
//               };
//               columns = { ...columns, [i.templateId]: handleDynamicColumns(i) };
//               // eslint-disable-next-line no-unused-expressions
//               tableDsRef.current?.[i.templateId]?.loadData(
//                 handleDataSource(i?.supQuotationDtlCurPage?.content),
//                 i?.supQuotationDtlCurPage?.totalElements
//               );
//               templateRef.current = { ...templateRef.current, [i.templateId]: i.quotationColumns };
//               // 查询
//               tableDsRef.current[i.templateId].setQueryParameter('templateId', i.templateId);
//             });
//             // 设置动态列
//             setDynamicColumns(columns);
//           } else if (result.moduleRule === 'NO_DISTINCTION') {
//             // 不区分模块
//             tableDsRef.current = {
//               [result.templateId]: new DataSet(tableDS({ queryParams: params, handleDataSource })),
//             };
//             // 设置动态列
//             setDynamicColumns({ [result.templateId]: handleDynamicColumns(result) });
//             const dataSource = handleDataSource(supQuotationDtlCurPage.content);
//             // eslint-disable-next-line no-unused-expressions
//             tableDsRef.current?.[result.templateId]?.loadData(
//               dataSource,
//               supQuotationDtlCurPage.totalElements
//             );
//             templateRef.current = { [result.templateId]: result.quotationColumns };
//             tableDsRef.current[result.templateId].setQueryParameter(
//               'templateId',
//               result.templateId
//             );
//           }
//           formDs.loadData([result]);
//           // 设置值
//           setModuleRule(result.moduleRule);
//         }
//       })
//       .finally(() => setQueryLoading(false));
//   };

//   // 大保存后查询
//   const fetchHeaderAll = () => {
//     const params = {
//       sourceFrom,
//       rfxLineItemId: rfxLineItemId || bidLineItemId || projectLineItemId,
//       itemId,
//       itemCategoryId,
//       rfxHeaderId: rfxHeaderId || bidHeaderId || sourceProjectId,
//       quotationHeaderCurrentId,
//       quotationTemplateId,
//     };
//     setQueryLoading(true);
//     fetchHeader(params)
//       .then((res) => {
//         const result = getResponse(res);
//         if (result && !result.failed) {
//           const { supQuotationDtlCurPage = {}, moduleList = [] } = result;
//           // 分模块
//           if (result.moduleRule === 'SUB_MODULE') {
//             // 缓存ds
//             moduleList.forEach((i) => {
//               // eslint-disable-next-line no-unused-expressions
//               tableDsRef.current?.[i.templateId]?.loadData(
//                 handleDataSource(i?.supQuotationDtlCurPage?.content),
//                 i?.supQuotationDtlCurPage?.totalElements
//               );
//             });
//           } else if (result.moduleRule === 'NO_DISTINCTION') {
//             // 不区分模块
//             // eslint-disable-next-line no-unused-expressions
//             tableDsRef.current?.[result.templateId]?.loadData(
//               handleDataSource(supQuotationDtlCurPage.content),
//               supQuotationDtlCurPage.totalElements
//             );
//           }
//         }
//       })
//       .finally(() => setQueryLoading(false));
//   };

//   // 处理数据
//   const handleDataSource = (source = []) => {
//     if (isEmpty(source)) return [];
//     const restructureSource = source.map((item) => {
//       let elementValue = {};
//       const { quotationColumns = [], ...otherItem } = item;
//       // eslint-disable-next-line no-unused-expressions
//       quotationColumns?.forEach((newItem) => {
//         elementValue = {
//           ...elementValue,
//           [newItem.columnCode]: newItem.columnDefaultValue || null,
//           [`${newItem.columnCode}Required`]: newItem.quotationColumnValue || null,
//           [`${newItem.columnCode}Meaning`]: newItem.columnDefaultValueMeaning || null,
//         };
//       });
//       return {
//         ...otherItem,
//         ...elementValue,
//         quotationColumns,
//         expand: false, // 控制树形是否默认展开
//       };
//     });
//     return restructureSource;
//   };

//   // 设置动态列
//   const handleDynamicColumns = (data = {}) => {
//     const { quotationColumns = [] } = data || {};
//     const columns = [];
//     quotationColumns.forEach((item) => {
//       // visible过滤
//       if (item.visible === 1 || item.visible === 2) {
//         if (item.componentType === 'Lov') {
//           // eslint-disable-next-line no-unused-expressions
//           tableDsRef.current?.[data.templateId].addField(`${item.columnCode}Lov`, {
//             name: `${item.columnCode}Lov`,
//             label: item.columnName,
//             ignore: 'always',
//             ...renderFieldType(item),
//           });
//           // eslint-disable-next-line no-unused-expressions
//           tableDsRef.current?.[data.templateId].addField(`${item.columnCode}`, {
//             name: `${item.columnCode}`,
//             bind: `${item.columnCode}Lov.${item.valueField}`,
//           });
//           // eslint-disable-next-line no-unused-expressions
//           tableDsRef.current?.[data.templateId].addField(`${item.columnCode}Meaning`, {
//             name: `${item.columnCode}Meaning`,
//             bind: `${item.columnCode}Lov.${item.displayField}`,
//           });
//         } else {
//           // eslint-disable-next-line no-unused-expressions
//           tableDsRef.current?.[data.templateId].addField(item.columnCode, {
//             name: item.columnCode,
//             label: item.columnName,
//             ...renderFieldType(item),
//           });
//         }
//         if (item.componentType === 'Upload') {
//           columns.push({
//             name: item.columnCode,
//             width: 150,
//             renderer: ({ record }) => {
//               return (
//                 <C7NUpload
//                   filePreview
//                   tenantId={organizationId}
//                   name={item.columnCode}
//                   record={record}
//                   btnText={intl.get(`ssrc.rf.view.message.upLoadChangeAttachment`).d('上传附件')}
//                   bucketName={PRIVATE_BUCKET}
//                   {...ChunkUploadProps}
//                 />
//               );
//             },
//           });
//         } else {
//           columns.push({
//             name: item.componentType === 'Lov' ? `${item.columnCode}Lov` : item.columnCode,
//             width: 150,
//             editor: (record) => handleDynComponent(record, item, data.templateId),
//           });
//         }
//       }
//     });
//     return columns;
//   };

//   // 渲染类型
//   const renderFieldType = (field = {}) => {
//     let fieldConfig = {};
//     const allAttributesProps = collectAttrProps(field.quotationColumnCmpts);
//     const alls = {
//       ...allAttributesProps,
//       dynamicProps: {
//         disabled: ({ record }) => isDisabled(record, field),
//         // required: ({ record }) => isRequired(record, field),
//       },
//     };

//     switch (field.componentType) {
//       case 'Input':
//       case 'TextArea':
//       case 'Upload':
//         fieldConfig = {
//           ...alls,
//         };
//         break;
//       case 'InputNumber':
//         fieldConfig = {
//           type: 'number',
//           ...alls,
//         };
//         break;
//       // 下拉框
//       case 'ValueList':
//         fieldConfig = {
//           lookupCode: field.lovCode,
//           ...alls,
//         };
//         break;
//       // 值集
//       case 'Lov':
//         fieldConfig = {
//           type: 'object',
//           lovCode: field.lovCode,
//           lovPara: { tenantId: organizationId },
//           textField: field.displayField,
//           valueField: field.valueField,
//           ...alls,
//         };
//         break;
//       case 'DateTimePicker':
//         fieldConfig = {
//           type: 'dateTime',
//           format: getDateTimeFormat(),
//           ...alls,
//         };
//         break;
//       case 'DatePicker':
//         fieldConfig = {
//           type: 'date',
//           format: getDateFormat(),
//           ...alls,
//         };
//         break;
//       case 'Switch':
//       case 'Checkbox':
//         fieldConfig = {
//           type: 'boolean',
//           trueValue: 1,
//           falseValue: 0,
//           transformResponse: (val) => Number(val),
//           ...alls,
//         };
//         break;
//       default:
//         fieldConfig = {
//           ...alls,
//         };
//         break;
//     }
//     return fieldConfig;
//   };

//   // 收集组件属性
//   const collectAttrProps = (attrs = []) => {
//     if (!attrs || !Array.isArray(attrs) || !attrs.length) {
//       return {};
//     }

//     let data = {};
//     attrs.forEach((item) => {
//       const { attributeName = '', attributeValue = null } = item;
//       const BoolAttrs = ['allowThousandth'];
//       const NumberAttrs = ['maxLength', 'max', 'min', 'precision'];

//       if (attributeValue === 'null' || !attributeValue) {
//         return;
//       }

//       if (BoolAttrs.includes(attributeName)) {
//         data = Object.assign(data, {
//           [attributeName]: !(attributeValue === '0' || !attributeValue),
//         });
//       } else if (NumberAttrs.includes(attributeName)) {
//         data = Object.assign(data, {
//           [attributeName]: attributeValue || null,
//         });
//       }
//     });
//     return data;
//   };

//   /**
//    * 组件是否禁用
//    *
//    * @param {*} [record={}]
//    * @param {*} [item={}]
//    */
//   const isDisabled = (record = {}, item = {}) => {
//     const data = record.toData();
//     const { columnCode = null, componentType, disabled, calculationRule } = item;
//     if (!columnCode) {
//       return false;
//     }

//     if (
//       data.quotationDetailType === 'ALL' ||
//       data.quotationDetailType === 'SCOPE' ||
//       data.quotationDetailType === 'RULE'
//     ) {
//       return true;
//     } else {
//       if (
//         (componentType === 'InputNumber' || componentType === 'Input') &&
//         (disabled === 0 || disabled === 3)
//       ) {
//         return true;
//       }
//       if (['Lov', 'ValueList'].includes(componentType) && [0, 3].includes(disabled)) {
//         return true;
//       }
//       return data[`${columnCode}Required`] === 'READONLY' || calculationRule;
//     }
//   };

//   // 渲染组件
//   const handleDynComponent = (record = {}, field = {}, templateId) => {
//     const { componentType, columnCode } = field;
//     switch (componentType) {
//       case 'Input':
//         return <TextField name={columnCode} record={record} />;
//       case 'InputNumber':
//         return (
//           <NumberField
//             name={columnCode}
//             record={record}
//             onChange={(value) => changeInputNumberData(value, columnCode, record, templateId)}
//           />
//         );
//       case 'TextArea':
//         return <TextArea name={columnCode} record={record} resize />;
//       case 'ValueList':
//         return <Select name={columnCode} record={record} />;
//       case 'DatePicker':
//         return <DatePicker name={columnCode} record={record} />;
//       case 'DateTimePicker':
//         return <DateTimePicker name={columnCode} record={record} />;
//       case 'Lov':
//         return <Lov name={`${columnCode}Lov`} record={record} />;
//       case 'Switch':
//         return <Switch name={columnCode} record={record} />;
//       case 'Checkbox':
//         return <CheckBox name={columnCode} record={record} />;
//       default:
//         return <TextField name={columnCode} record={record} />;
//     }
//   };

//   /**
//    * 根据表达式，监听计算
//    */
//   const changeInputNumberData = (value, columnCode, record, templateId) => {
//     const quotationColumns = templateRef.current?.[templateId];
//     if (isEmpty(quotationColumns)) return;
//     const calculationRuleList = []; // [[key, value], [key, value]]
//     quotationColumns.forEach((item) => {
//       // 存在表达式
//       if (item.calculationRule) {
//         const precision = item.quotationColumnCmpts?.filter(
//           (i) => i.attributeName === 'precision'
//         )?.[0]?.attributeValue;
//         calculationRuleList.push({
//           columnCode: item.columnCode,
//           calculationRule: item.calculationRule,
//           precision,
//         });
//       }
//     });
//     if (isEmpty(calculationRuleList)) return;
//     calculationRuleList.forEach((item) => {
//       // 表达式中存在当前code,需要计算
//       if (item.calculationRule.indexOf(columnCode) !== -1) {
//         const formValues = record.toData();
//         const obj = {
//           ...formValues,
//           [columnCode]: value,
//         };
//         const targetValueObj = execMathExpress(item.calculationRule, filterNullValueObject(obj));
//         let targetValue = null;
//         if (targetValueObj.num || targetValueObj.num === 0) {
//           targetValue = targetValueObj.num / targetValueObj.den;
//           if (item.precision > 0) {
//             // 0.00000001解决firefox和chrome的五舍六入的问题
//             targetValue = (targetValue + 0.00000001).toFixed(item.precision);
//           }
//         }
//         record.set(item.columnCode, targetValue);
//       }
//     });
//   };

//   // 新建一级报价明细项
//   const handleAddOne = (templateId) => {
//     if (isEmpty(templateRef.current?.[templateId])) {
//       notification.warning({
//         message: 'quotation template is empty!',
//       });
//       return;
//     }

//     // eslint-disable-next-line no-unused-expressions
//     tableDsRef.current?.[templateId]?.create(
//       {
//         parentDetailId: null, // 一级细项标记
//         quotationColumns: templateRef.current?.[templateId],
//         quotationTemplateId: templateId,
//         quotationDimension: headerRef.current?.templateDimension,
//       },
//       0
//     );
//   };

//   // 新建二级报价明细项
//   const handleAddTwo = (record = {}, templateId) => {
//     if (!record.get('expand')) {
//       record.set('expand', true);
//     }
//     if (isEmpty(templateRef.current?.[templateId])) {
//       notification.warning({
//         message: 'quotation template is empty!',
//       });
//       return;
//     }
//     // eslint-disable-next-line no-unused-expressions
//     tableDsRef.current?.[templateId]?.create(
//       {
//         parentDetailId: record.data.quotationDetailId,
//         quotationColumns: templateRef.current?.[templateId],
//         quotationTemplateId: templateId,
//         quotationDimension: headerRef.current?.templateDimension,
//       },
//       0
//     );
//   };

//   // 获取保存数据
//   const getUpdateData = (templateId, type) => {
//     const currentData = tableDsRef.current?.[templateId]?.toData();
//     let data = [];
//     data = currentData.map((item) => {
//       const { quotationColumns = [], ...otherItems } = item;
//       const newQuotationColumns = quotationColumns?.map((i) => {
//         return {
//           ...i,
//           columnDefaultValue: otherItems[i.columnCode],
//         };
//       });
//       return {
//         ...otherItems,
//         sourceFrom,
//         tenantId: organizationId,
//         rfxLineItemId: rfxLineItemId || bidLineItemId || projectLineItemId,
//         sourceHeaderId: rfxHeaderId || bidHeaderId || sourceProjectId,
//         quotationHeaderCurrentId: quotationHeaderCurrentId || null,
//         quoDetailAttachmentUuid:
//           type === 'all'
//             ? formDs?.current?.get('quoDetailAttachmentUuid')
//             : otherItems.quoDetailAttachmentUuid,
//         quotationColumns: newQuotationColumns,
//       };
//     });
//     return data;
//   };

//   // 获取分模块所有行数据
//   const getSubAllData = () => {
//     const { moduleList = [] } = headerRef.current;
//     let data = [];
//     moduleList.forEach((r) => {
//       data = [...data, ...getUpdateData(r.templateId, 'all')];
//     });
//     return data;
//   };

//   // 小保存
//   const handleSave = async (templateId, type) => {
//     if (!templateId) {
//       return false;
//     }

//     if (await tableDsRef.current?.[templateId]?.validate()) {
//       const params = {
//         quotationTemplateId,
//         quotationDetailId: headerRef.current?.quotationDetailId,
//         quotationDetailList: getUpdateData(templateId, type),
//         operationType,
//       };
//       return savePurchaseData(params).then((res) => {
//         const result = getResponse(res);
//         if (result && !result.failed) {
//           notification.success();
//           // 查询
//           tableDsRef.current[templateId].query();
//         } else {
//           // 防止弹框关闭
//           return false;
//         }
//       });
//     } else {
//       // 防止弹框关闭
//       return false;
//     }
//   };

//   // 大保存
//   const handleSaveAll = useCallback(async () => {
//     if (uiType !== 'hzero') {
//       rowData.set('quotationDetail', 1);
//     }
//     if (moduleRule === 'SUB_MODULE') {
//       return handleSaveSubAll();
//     } else {
//       return handleSaveNonAll();
//     }
//   }, [moduleRule]);

//   // 区分模块 大保存
//   const handleSaveSubAll = async () => {
//     const { moduleList = [], quotationDetailId } = headerRef.current;

//     return Promise.all(moduleList?.map((r) => tableDsRef.current?.[r.templateId]?.validate())).then(
//       async (results) => {
//         if (results.every((result) => result)) {
//           const params = {
//             quotationDetailId,
//             quotationTemplateId,
//             quotationDetailList: getSubAllData(),
//             operationType,
//           };
//           savePurchaseData(params).then((res) => {
//             const result = getResponse(res);
//             if (result && !result.failed) {
//               notification.success();
//               // 查询
//               fetchHeaderAll();
//             } else {
//               // 防止弹框关闭
//               return false;
//             }
//           });
//         } else {
//           // 防止弹框关闭
//           return false;
//         }
//       }
//     );
//   };

//   // 不区分模块 大保存
//   const handleSaveNonAll = async () => {
//     return handleSave(headerRef.current?.templateId, 'all');
//   };

//   const getColumns = useCallback(
//     (templateId) =>
//       [
//         {
//           name: 'configCode',
//           editor: true,
//           width: 150,
//         },
//         {
//           name: 'configName',
//           width: 130,
//           editor: true,
//         },
//         headerRef?.current?.allowPurCreateFlag && {
//           header: intl.get(`ssrc.common.model.common.nextQuotationDetails`).d('下级报价明细'),
//           name: 'nextQuotationDetails',
//           width: 120,
//           align: 'left',
//           renderer: ({ record }) =>
//             record.data.parentDetailId === null && record.data.objectVersionNumber ? (
//               <a onClick={() => handleAddTwo(record, templateId)}>
//                 {intl.get('hzero.common.button.create').d('新建')}
//               </a>
//             ) : (
//               ''
//             ),
//         },
//         ...(dynamicColumns?.[templateId] || []),
//       ].filter(Boolean),
//     [dynamicColumns]
//   );

//   return (
//     <Spin spinning={queryLoading}>
//       <div
//         className={classnames(
//           inquiryNewUpdateStyle['rfx-detail-list-card'],
//           style['quotation-info-wrap-container']
//         )}
//       >
//         <h3 className={inquiryNewUpdateStyle['rfx-card-item-title']}>
//           {intl.get('ssrc.common.view.message.basicInfos').d('基础信息')}
//         </h3>
//         <Form
//           dataSet={formDs}
//           columns={2}
//           labelLayout="vertical"
//           labelAlign="left"
//           className="c7n-pro-vertical-form-display"
//         >
//           <Output name="templateName" />
//           <Output
//             name="attachmentNeedFlag"
//             renderer={({ record }) =>
//               record?.get('attachmentNeedFlag')
//                 ? intl.get(`hzero.common.status.yes`).d('是')
//                 : intl.get(`hzero.common.status.no`).d('否')
//             }
//           />
//           <Output
//             name="allowCreateFlag"
//             renderer={({ record }) =>
//               record?.get('allowCreateFlag')
//                 ? intl.get(`hzero.common.status.yes`).d('是')
//                 : intl.get(`hzero.common.status.no`).d('否')
//             }
//           />
//           <Output
//             name="allowPurCreateFlag"
//             renderer={({ record }) =>
//               record?.get('allowPurCreateFlag')
//                 ? intl.get(`hzero.common.status.yes`).d('是')
//                 : intl.get(`hzero.common.status.no`).d('否')
//             }
//           />
//           <Output name="attachmentUuid" />
//         </Form>
//         <h3
//           className={classnames(
//             inquiryNewUpdateStyle['rfx-card-item-title'],
//             inquiryNewUpdateStyle['m-t-lg']
//           )}
//         >
//           {intl.get('ssrc.common.view.message.quotationInfos').d('报价信息')}
//         </h3>
//         {moduleRule === 'SUB_MODULE' && (
//           <Fragment>
//             {/* <Anchor linkList={headerRef.current?.moduleList} /> */}
//             {headerRef.current?.moduleList?.map((item, index) => (
//               <Fragment className={style['quotation-info-warp']}>
//                 <h4
//                   id={item.templateId}
//                   className={classnames(
//                     inquiryNewUpdateStyle['rfx-card-item-title-level-two'],
//                     index === 0 ? null : inquiryNewUpdateStyle['m-t-lg']
//                   )}
//                 >
//                   <div className={inquiryNewUpdateStyle['rfx-card-item-title-line']} />
//                   {item.templateName}
//                 </h4>
//                 <Table
//                   mode="tree"
//                   dataSet={tableDsRef.current?.[item.templateId]}
//                   columns={getColumns(item.templateId)}
//                   buttons={[
//                     headerRef?.current?.allowPurCreateFlag && [
//                       'add',
//                       { onClick: () => handleAddOne(item.templateId) },
//                     ],
//                     ['delete', { icon: 'delete_sweep', }],
//                     ['save', { onClick: () => handleSave(item.templateId) }],
//                   ]}
//                 />
//               </Fragment>
//             ))}
//           </Fragment>
//         )}
//         {moduleRule === 'NO_DISTINCTION' && (
//           <Fragment>
//             <h4 className={inquiryNewUpdateStyle['rfx-card-item-title-level-two']}>
//               <div className={inquiryNewUpdateStyle['rfx-card-item-title-line']} />
//               {headerRef.current?.templateName}
//             </h4>
//             <Table
//               mode="tree"
//               dataSet={tableDsRef.current?.[headerRef.current?.templateId]}
//               columns={getColumns(headerRef.current?.templateId)}
//               buttons={[
//                 headerRef?.current?.allowPurCreateFlag && [
//                   'add',
//                   { onClick: () => handleAddOne(headerRef.current?.templateId) },
//                 ],
//                 ['delete', { icon: 'delete_sweep', }],
//                 ['save', { onClick: () => handleSave(headerRef.current?.templateId) }],
//               ]}
//             />
//           </Fragment>
//         )}
//       </div>
//     </Spin>
//   );
// }

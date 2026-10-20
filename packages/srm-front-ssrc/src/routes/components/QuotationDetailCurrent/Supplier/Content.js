import React, {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
} from 'react';
import {
  Form,
  DataSet,
  Output,
  NumberField,
  TextField,
  TextArea,
  Table,
  Spin,
  Icon,
  Select,
  Lov,
  DatePicker,
  DateTimePicker,
  Switch,
  CheckBox,
  Attachment,
} from 'choerodon-ui/pro';
import { isEmpty, noop, isArray } from 'lodash';
import { observer } from 'mobx-react-lite';
import classnames from 'classnames';
import { runInAction } from 'mobx';

import intl from 'utils/intl';
import {
  getResponse,
  getCurrentOrganizationId,
  filterNullValueObject,
  getDateFormat,
  getDateTimeFormat,
} from 'utils/utils';
import notification from 'utils/notification';
import { PRIVATE_BUCKET } from '_utils/config';
import C7NUpload from '_components/C7NUpload';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import {
  fetchHeaderCurrentQuotation,
  saveDataCurrentQuotation,
  exportQuotationDetailV2,
} from '@/services/quotationDetailNewService';
import { ChunkUploadProps } from '@/utils/SsrcRegx';

import { getExportFileName } from '@/routes/components/QuotationDetailCurrent/utils.js';
import { execMathExpress } from '../calculate';
import Anchor from '../Anchor';
import { formDS, tableDS, itemFormDS } from './storeDS';

import style from '../index.less';

const Content = (props = {}) => {
  const {
    rowData,
    sourceFrom,
    detailFrom,
    abandonedFlag,
    allowCreateFlag,
    contentRef,
    currentEditDisable,
    uiType,
    remote,
    pageFrom = '',
    customizeForm = noop,
    bidFlag = false,
    headerData = {},
  } = props;

  const organizationId = getCurrentOrganizationId();

  // 暴露子组件的api给父组件使用
  useImperativeHandle(contentRef, () => ({
    handleSaveAll,
  }));

  const templateRef = useRef({});
  const tableDsRef = useRef({});
  const headerRef = useRef({});

  const [moduleRule, setModuleRule] = useState();
  const [dynamicColumns, setDynamicColumns] = useState({});
  const [queryLoading, setQueryLoading] = useState(false);
  const [operateLoading, setOperateLoading] = useState(false);
  const moreRef = useRef(
    remote ? remote.process('SSRC_QUOTATION_DETAIL_CURRENT_SUPPLIER_PROCESS_MOREREF') : null
  ); // 二开临时存储数据仓库

  const formDs = useMemo(
    () =>
      new DataSet(
        formDS({
          currentEditDisable,
        })
      ),
    [currentEditDisable]
  );

  const itemFormDs = useMemo(() => new DataSet(itemFormDS()), []);

  const {
    rfxLineItemId,
    bidLineItemId,
    itemId,
    itemCategoryId,
    rfxHeaderId,
    bidHeaderId,
    quotationLineCurrentId,
    quotationHeaderCurrentId,
    quotationHeaderId,
    quotationLineId,
  } = useMemo(() => {
    return uiType === 'hzero' ? rowData : rowData?.toData();
  }, [uiType, rowData]);

  useEffect(() => {
    init();
    fetchItemInfo();
  }, []);

  const getCustomizeUnitCode = useCallback(
    (type = null) => {
      if (!type || isEmpty(type)) {
        return null;
      }

      const RfxCodeMap = new Map([
        ['baseItemForm', 'SSRC.SUPPLIER_QUOTATION_DETAIL_CURRENT.BASE_ITEM_FORM'], // 物料信息
        ['baseInfoForm', 'SSRC.SUPPLIER_QUOTATION_DETAIL_CURRENT.BASE_FORM'], // 基础信息
      ]);

      const BidCodeMap = new Map([
        ['baseItemForm', 'SSRC.SUPPLIER_QUOTATION_DETAIL_CURRENT_NEW_BID.BASE_ITEM_FORM'], // 物料信息
        ['baseInfoForm', 'SSRC.SUPPLIER_QUOTATION_DETAIL_CURRENT_NEW_BID.BASE_FORM'], // 基础信息
      ]);

      const CodeDataMap = !bidFlag ? RfxCodeMap : BidCodeMap;
      let currentUnitCode = null;

      if (typeof type === 'string') {
        currentUnitCode = CodeDataMap.get(type);
      }

      if (isArray(type)) {
        const codeSet = new Set();
        type.forEach((unitCode) => {
          codeSet.add(CodeDataMap.get(unitCode));
        });

        currentUnitCode = codeSet.size ? [...codeSet].join(',') : null;
      }

      return currentUnitCode;
    },
    [bidFlag]
  );

  const fetchItemInfo = useCallback(() => {
    if (!quotationLineId) {
      return;
    }

    itemFormDs.setQueryParameter('commonProps', {
      quotationHeaderId,
      quotationLineId,
      organizationId,
      customizeUnitCode: getCustomizeUnitCode('baseItemForm'),
    });

    itemFormDs.query();
  }, [quotationHeaderId, quotationLineId, organizationId, moduleRule]);

  const init = () => {
    const params = {
      sourceFrom,
      itemId,
      itemCategoryId,
      quotationLineCurrentId,
      quotationHeaderCurrentId,
      rfxLineItemId: rfxLineItemId || bidLineItemId,
      rfxHeaderId: rfxHeaderId || bidHeaderId,
      customizeUnitCode: getCustomizeUnitCode('baseInfoForm'),
      pageFrom,
    };
    if (detailFrom) {
      params.from = detailFrom;
    }
    const queryParams = remote
      ? remote.process('SSRC_QUOTATION_DETAIL_CURRENT_SUPPLIER_PROCESS_QUERY_PARAMS', params, {
          rowData,
          bidFlag,
        })
      : params;
    setQueryLoading(true);
    fetchHeaderCurrentQuotation(queryParams)
      .then((res) => {
        const result = getResponse(res);
        if (!result) {
          return;
        }

        runInAction(() => {
          const { moduleList = [] } = result || {};
          // 缓存头数据
          headerRef.current = result;
          const tableDsConfig = tableDS({
            abandonedFlag,
            queryParams: params,
            detailFrom,
            handleDataSource,
            currentEditDisable,
            remote,
            fetchHeaderAll,
          });
          // 分模块
          if (result.moduleRule === 'SUB_MODULE') {
            let columns = [];
            // 缓存ds
            moduleList.forEach((i) => {
              const { templateId, quotationColumns, supQuotationDtlCurPage = {} } = i || {};
              const { content, totalElements } = supQuotationDtlCurPage || {};

              const moduleCurrentTableDS = new DataSet(
                remote
                  ? remote.process(
                      'SSRC_QUOTATION_DETAIL_CURRENT_SUPPLIER_PROCESS_TABLE_DS',
                      tableDsConfig,
                      {
                        moduleRule,
                        pageFrom,
                        handleSaveAll,
                        bidFlag,
                        module: i,
                      }
                    )
                  : tableDsConfig
              );

              // 查询
              moduleCurrentTableDS.setQueryParameter('templateId', templateId);
              moduleCurrentTableDS.setQueryParameter(
                'quotationLineCurrentId',
                quotationLineCurrentId
              );
              moduleCurrentTableDS.setQueryParameter('sourceParams', {
                templateId,
                sourceFrom,
                sourceHeaderId: rfxHeaderId || bidHeaderId,
                pageFrom,
              });
              tableDsRef.current = {
                ...tableDsRef.current,
                [templateId]: moduleCurrentTableDS,
              };
              columns = { ...columns, [templateId]: handleDynamicColumns(i) };
              // eslint-disable-next-line no-unused-expressions
              tableDsRef.current?.[templateId]?.loadData(handleDataSource(content), totalElements);
              templateRef.current = { ...templateRef.current, [templateId]: quotationColumns };
            });
            // 设置动态列
            setDynamicColumns(columns);
            // 设置值
            setModuleRule(result.moduleRule);
          } else if (result.moduleRule === 'NO_DISTINCTION') {
            const { supQuotationDtlCurPage = {} } = result;
            const { content, totalElements } = supQuotationDtlCurPage || {};
            // 不区分模块
            tableDsRef.current = {
              [result.templateId]: new DataSet(
                remote
                  ? remote.process(
                      'SSRC_QUOTATION_DETAIL_CURRENT_SUPPLIER_PROCESS_TABLE_DS',
                      tableDsConfig,
                      {
                        moduleRule,
                        pageFrom,
                        handleSaveAll,
                        bidFlag,
                      }
                    )
                  : tableDsConfig
              ),
            };
            // 设置动态列
            setDynamicColumns({ [result.templateId]: handleDynamicColumns(result) });
            // eslint-disable-next-line no-unused-expressions
            tableDsRef.current?.[result.templateId]?.loadData(
              handleDataSource(content),
              totalElements
            );
            templateRef.current = { [result.templateId]: result.quotationColumns };
            tableDsRef.current[result.templateId].setQueryParameter(
              'templateId',
              result.templateId
            );
            tableDsRef.current[result.templateId].setQueryParameter(
              'quotationLineCurrentId',
              quotationLineCurrentId
            );
            tableDsRef.current[result.templateId].setQueryParameter('sourceParams', {
              sourceFrom,
              sourceHeaderId: rfxHeaderId || bidHeaderId,
            });
          }

          formDs.loadData([result]);
          // 设置值
          setModuleRule(result.moduleRule);
          const moreSearch = remote
            ? remote.process('SSRC_QUOTATION_DETAIL_CURRENT_SUPPLIER_PROCESS_MORESEARCH', null, {
                formDs,
              })
            : null;
          if (moreSearch) {
            moreRef.current = moreSearch;
          }
        });
      })
      .finally(() => setQueryLoading(false));
  };

  // 大保存后查询
  const fetchHeaderAll = () => {
    const params = {
      sourceFrom,
      itemId,
      itemCategoryId,
      quotationLineCurrentId,
      quotationHeaderCurrentId,
      rfxHeaderId: rfxHeaderId || bidHeaderId,
      rfxLineItemId: rfxLineItemId || bidLineItemId,
      customizeUnitCode: getCustomizeUnitCode('baseInfoForm'),
      pageFrom,
    };
    if (detailFrom) {
      params.from = detailFrom;
    }
    setQueryLoading(true);
    fetchHeaderCurrentQuotation(params)
      .then((res) => {
        const result = getResponse(res);
        if (result && !result.failed) {
          const { supQuotationDtlCurPage = {}, moduleList = [] } = result;

          headerRef.current = result;
          formDs.loadData([result]);

          // 分模块
          if (result.moduleRule === 'SUB_MODULE') {
            // 缓存ds
            moduleList.forEach((i) => {
              // eslint-disable-next-line no-unused-expressions
              tableDsRef.current?.[i.templateId]?.loadData(
                handleDataSource(i?.supQuotationDtlCurPage?.content),
                i?.supQuotationDtlCurPage?.totalElements
              );
            });
          } else if (result.moduleRule === 'NO_DISTINCTION') {
            // 不区分模块
            // eslint-disable-next-line no-unused-expressions
            tableDsRef.current?.[result.templateId]?.loadData(
              handleDataSource(supQuotationDtlCurPage.content),
              supQuotationDtlCurPage.totalElements
            );
          }
        }
      })
      .finally(() => setQueryLoading(false));
  };

  // 处理数据
  const handleDataSource = (source = []) => {
    if (isEmpty(source)) {
      return [];
    }

    const restructureSource = source.map((item) => {
      let elementValue = {};
      const { quotationColumns = [], ...otherItem } = item;
      // eslint-disable-next-line no-unused-expressions
      quotationColumns?.forEach((newItem) => {
        const {
          columnCode,
          supQuotationColumnValue,
          quotationColumnValue,
          supQuotationColumnValueMeaning,
        } = newItem || {};
        elementValue = {
          ...elementValue,
          [columnCode]: supQuotationColumnValue || null,
          [`${columnCode}Required`]: quotationColumnValue || null,
          [`${columnCode}Meaning`]: supQuotationColumnValueMeaning || null,
        };
      });
      return {
        ...otherItem,
        ...elementValue,
        quotationColumns,
        expand: true, // 控制树形是否默认展开
      };
    });

    return restructureSource;
  };

  // 设置动态列
  const handleDynamicColumns = (data = {}) => {
    const { quotationColumns = [], templateId } = data || {};
    const columns = [];
    if (!templateId) {
      return columns;
    }

    const currentTableDS = tableDsRef.current?.[templateId];

    quotationColumns.forEach((item) => {
      const { visible, componentType, columnCode, columnName, valueField, displayField } =
        item || {};

      // visible过滤
      if (visible === 0 || visible === 1) {
        if (componentType === 'Lov') {
          // eslint-disable-next-line no-unused-expressions
          currentTableDS.addField(`${columnCode}Lov`, {
            name: `${columnCode}Lov`,
            label: columnName,
            ignore: 'always',
            ...renderFieldType(item, { module: data }),
          });
          // eslint-disable-next-line no-unused-expressions
          currentTableDS.addField(`${columnCode}`, {
            name: `${columnCode}`,
            bind: `${columnCode}Lov.${valueField}`,
          });
          // eslint-disable-next-line no-unused-expressions
          currentTableDS.addField(`${columnCode}Meaning`, {
            name: `${columnCode}Meaning`,
            bind: `${columnCode}Lov.${displayField}`,
          });
        } else {
          // eslint-disable-next-line no-unused-expressions
          currentTableDS.addField(columnCode, {
            name: columnCode,
            label: columnName,
            ...renderFieldType(item, { module: data }),
          });
        }
        if (componentType === 'Upload') {
          columns.push({
            name: columnCode,
            width: 150,
            renderer: ({ record }) => {
              return (
                <C7NUpload
                  filePreview
                  tenantId={organizationId}
                  name={columnCode}
                  record={record}
                  btnText={intl.get(`ssrc.rf.view.message.upLoadChangeAttachment`).d('上传附件')}
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="quotation-template"
                  {...ChunkUploadProps}
                />
              );
            },
          });
        } else {
          columns.push({
            name: componentType === 'Lov' ? `${columnCode}Lov` : columnCode,
            width: 150,
            editor: (record) => handleDynComponent(record, item, templateId),
          });
        }
      }
    });
    return columns;
  };

  // 渲染类型
  const renderFieldType = (field = {}, options = {}) => {
    const { module } = options || {};

    let fieldConfig = {};
    const allAttributesProps = collectAttrProps(field.quotationColumnCmpts);
    const alls = {
      ...allAttributesProps,
      dynamicProps: {
        disabled({ record, dataSet }) {
          const flag = (currentEditDisable ? true : isDisabled(record, field)) || abandonedFlag;
          return remote
            ? remote.process(
                'SSRC_QUOTATION_DETAIL_CURRENT_SUPPLIER_PROCESS_FIELD_DISABLED',
                flag,
                {
                  field,
                  bidFlag,
                  dataSet,
                  record,
                  pageFrom,
                  current: headerRef?.current,
                  module,
                }
              )
            : flag;
        },
        required({ record, dataSet }) {
          const flag = isRequired(record, field);
          return remote
            ? remote.process(
                'SSRC_QUOTATION_DETAIL_CURRENT_SUPPLIER_PROCESS_FIELD_REQUIRED',
                flag,
                {
                  field,
                  bidFlag,
                  dataSet,
                  record,
                  pageFrom,
                  current: headerRef?.current,
                  module,
                }
              )
            : flag;
        },
      },
    };

    switch (field.componentType) {
      case 'Input':
      case 'TextArea':
      case 'Upload':
        fieldConfig = {
          ...alls,
        };
        break;
      case 'InputNumber':
        fieldConfig = {
          type: 'number',
          ...alls,
        };
        break;
      // 下拉框
      case 'ValueList':
        fieldConfig = {
          lookupCode: field.lovCode,
          ...alls,
        };
        break;
      // 值集
      case 'Lov':
        fieldConfig = {
          type: 'object',
          lovCode: field.lovCode,
          lovPara: { tenantId: organizationId },
          textField: field.displayField,
          valueField: field.valueField,
          ...alls,
        };
        break;
      case 'DateTimePicker':
        fieldConfig = {
          type: 'dateTime',
          format: getDateTimeFormat(),
          ...alls,
        };
        break;
      case 'DatePicker':
        fieldConfig = {
          type: 'date',
          format: getDateFormat(),
          ...alls,
        };
        break;
      case 'Switch':
      case 'Checkbox':
        fieldConfig = {
          type: 'boolean',
          trueValue: 1,
          falseValue: 0,
          transformResponse: (val) => Number(val),
          ...alls,
        };
        break;
      default:
        fieldConfig = {
          ...alls,
        };
        break;
    }

    const fieldOtherProps = {
      organizationId,
      formDs,
      fieldObj: field,
      headerRef,
      headerDTO: headerRef?.current,
      uiType,
      rowData,
      headerData,
      module,
      bidFlag,
      pageProps: props,
    };

    const NewFieldConfig = remote
      ? remote.process(
          'SSRC_QUOTATION_DETAIL_CURRENT_SUPPLIER_PROCESS_RENDERFIELDTYPE',
          fieldConfig,
          fieldOtherProps
        )
      : fieldConfig;
    return NewFieldConfig;
  };

  // 收集组件属性
  // 数值 ['allowThousandth', 'max', 'min', 'precision'] 文本 ['maxLength']
  const collectAttrProps = (attrs = []) => {
    if (!attrs || !Array.isArray(attrs) || !attrs.length) {
      return {};
    }

    let data = {};
    attrs.forEach((item) => {
      const { attributeName = '', attributeValue = null } = item;
      const BoolAttrs = ['allowThousandth'];
      const NumberAttrs = ['maxLength', 'max', 'min', 'precision'];

      if (attributeValue === 'null' || !attributeValue) {
        return;
      }

      if (BoolAttrs.includes(attributeName)) {
        data = Object.assign(data, {
          [attributeName]: !(attributeValue === '0' || !attributeValue),
        });
      } else if (NumberAttrs.includes(attributeName)) {
        const value =
          attributeName === 'precision'
            ? attributeValue
              ? Number(attributeValue)
              : null
            : attributeValue || null;
        data = Object.assign(data, {
          [attributeName]: value,
        });
      }
    });
    return data;
  };

  /**
   * 组件的属性提取
   *
   * @param {*} [record={}]
   * @param {*} [item={}]
   */
  const isRequired = (record = {}, item = {}) => {
    // const data = record.toData();
    const { columnCode = null } = item;
    if (!columnCode) {
      return false;
    }

    const quotationDetailType = record.get('quotationDetailType');
    if (
      quotationDetailType === 'ALL' ||
      quotationDetailType === 'SCOPE' ||
      quotationDetailType === 'RULE'
    ) {
      return false;
    } else {
      const isRequiredValue = record.get(`${columnCode}Required`);
      // const isRequiredValue = data[`${columnCode}Required`] || null;
      const result =
        isRequiredValue === 'REQUIRED' || isRequiredValue === 1 || isRequiredValue === '1';
      return result;
    }
  };

  /**
   * 组件是否禁用
   *
   * @param {*} [record={}]
   * @param {*} [item={}]
   */
  const isDisabled = (record = {}, item = {}) => {
    // const data = record.toData();
    const { columnCode = null, disabled, calculationRule } = item;
    if (!columnCode) {
      return false;
    }

    const quotationDetailType = record.get('quotationDetailType');
    if (
      quotationDetailType === 'ALL' ||
      quotationDetailType === 'SCOPE' ||
      quotationDetailType === 'RULE'
    ) {
      return true;
    } else {
      if ([2, 3].includes(disabled)) {
        return true;
      }

      const isRequiredValue = record.get(`${columnCode}Required`);
      return isRequiredValue === 'READONLY' || calculationRule;
    }
  };

  // 渲染组件
  const handleDynComponent = (record = {}, field = {}, templateId) => {
    const { componentType, columnCode } = field || {};
    switch (componentType) {
      case 'Input':
        return <TextField name={columnCode} record={record} />;
      case 'InputNumber':
        return (
          <NumberField
            name={columnCode}
            record={record}
            onChange={(value) => changeInputNumberData(value, columnCode, record, templateId)}
          />
        );
      case 'TextArea':
        return <TextArea name={columnCode} record={record} resize />;
      case 'ValueList':
        return <Select name={columnCode} record={record} />;
      case 'DatePicker':
        return <DatePicker name={columnCode} record={record} />;
      case 'DateTimePicker':
        return <DateTimePicker name={columnCode} record={record} />;
      case 'Lov':
        return <Lov name={`${columnCode}Lov`} record={record} />;
      case 'Switch':
        return <Switch name={columnCode} record={record} />;
      case 'Checkbox':
        return <CheckBox name={columnCode} record={record} />;
      default:
        return <TextField name={columnCode} record={record} />;
    }
  };

  /**
   * 根据表达式，监听计算
   */
  const changeInputNumberData = (value, columnCode, record, templateId) => {
    const quotationColumns = templateRef.current?.[templateId];
    if (isEmpty(quotationColumns)) return;
    const calculationRuleList = []; // [[key, value], [key, value]]
    quotationColumns.forEach((item) => {
      // 存在表达式
      if (item.calculationRule) {
        const precision = item.quotationColumnCmpts?.filter(
          (i) => i.attributeName === 'precision'
        )?.[0]?.attributeValue;
        calculationRuleList.push({
          columnCode: item.columnCode,
          calculationRule: item.calculationRule,
          precision,
        });
      }
    });
    if (isEmpty(calculationRuleList)) return;
    calculationRuleList.forEach((item) => {
      // 表达式中存在当前code,需要计算
      if (item.calculationRule.indexOf(columnCode) !== -1) {
        const formValues = record.toData();
        const obj = {
          ...formValues,
          [columnCode]: value,
        };
        const targetValueObj =
          execMathExpress(item.calculationRule, filterNullValueObject(obj)) || {};
        let targetValue = null;
        if (targetValueObj.num || targetValueObj.num === 0) {
          targetValue = targetValueObj.num / targetValueObj.den;
          if (item.precision > 0) {
            // 0.00000001解决firefox和chrome的五舍六入的问题
            targetValue = (targetValue + 0.00000001).toFixed(item.precision);
          }
        }
        record.set(item.columnCode, targetValue);
      }
    });
  };

  // 新建一级报价明细项
  const handleAddOne = (templateId) => {
    if (isEmpty(templateRef.current?.[templateId])) {
      notification.warning({
        message: intl.get('ssrc.inquiryHall.view.quotationTemplateEmpty').d('报价模板为空'),
      });
      return;
    }

    const data = handleDataSource([
      {
        parentDetailId: null, // 一级细项标记
        quotationColumns: templateRef.current?.[templateId],
        createFlag: 1,
      },
    ]);

    // eslint-disable-next-line no-unused-expressions
    tableDsRef.current?.[templateId]?.create(data[0], 0);
  };

  // 新建二级报价明细项
  const handleAddTwo = (record = {}, templateId) => {
    if (!record.get('expand')) {
      record.set('expand', true);
    }
    if (isEmpty(templateRef.current?.[templateId])) {
      notification.warning({
        message: 'quotation template is empty!',
      });
      return;
    }
    const data = handleDataSource([
      {
        parentDetailId: record.data.supQuotationDetailCurrentId,
        quotationColumns: templateRef.current?.[templateId],
        createFlag: 1,
      },
    ]);

    if (remote?.event) {
      remote.event.fireEvent('clearParent', {
        data,
        record,
        pageFrom,
        bidFlag,
        current: headerRef?.current,
        dataSource: tableDsRef.current?.[templateId]?.toData(),
      });
    }

    // eslint-disable-next-line no-unused-expressions
    tableDsRef.current?.[templateId]?.create(data[0], 0);
  };

  // 获取保存数据
  const getUpdateData = (templateId, type) => {
    const currentData = tableDsRef.current?.[templateId]?.toData();
    let data = [];
    data = currentData.map((item) => {
      const { quotationColumns = [], ...otherItems } = item || {};
      const newQuotationColumns = quotationColumns?.map((i) => {
        return {
          ...i,
          supQuotationColumnValue: otherItems[i.columnCode],
        };
      });
      return {
        ...otherItems,
        sourceFrom,
        tenantId: organizationId,
        rfxLineItemId: rfxLineItemId || bidLineItemId,
        sourceHeaderId: rfxHeaderId || bidHeaderId,
        quotationLineCurrentId: quotationLineCurrentId || null,
        quotationHeaderCurrentId: quotationHeaderCurrentId || null,
        quoDetailAttachmentUuid:
          type === 'all'
            ? formDs?.current?.get('quoDetailAttachmentUuid')
            : otherItems.quoDetailAttachmentUuid,
        quotationColumns: newQuotationColumns,
      };
    });
    return data;
  };

  // 获取分模块所有行数据
  const getSubAllData = () => {
    const { moduleList = [] } = headerRef.current || {};
    let data = [];
    if (isEmpty(moduleList)) {
      return [];
    }

    moduleList.forEach((r) => {
      data = [...data, ...getUpdateData(r?.templateId, 'all')];
    });
    return data;
  };

  // 小保存
  const handleSave = async (templateId = null, type = '', otherParam = {}) => {
    if (!templateId || currentEditDisable) {
      return false;
    }

    let otherData = {};
    otherData = remote
      ? remote.process(
          'SSRC_QUOTATION_DETAIL_CURRENT_SUPPLIER_PROCESS_HANDLESAVE_OTHERDATA',
          otherData,
          {
            pageProps: props,
            formDs,
            templateId,
            headerRef,
            tableDsRef,
          }
        )
      : otherData;
    otherData = otherData || {};

    const flag = await tableDsRef.current?.[templateId]?.validate();
    if (flag) {
      const quotationColumns = {
        sourceFrom,
        quotationHeaderCurrentId,
        supQuotationDetailCurrentId: headerRef.current?.supQuotationDetailCurrentId,
        quoDetailAttachmentUuid: formDs?.current?.get('quoDetailAttachmentUuid'),
        rfxLineItemId: rfxLineItemId || bidLineItemId,
        supQuotationDtlCurList: getUpdateData(templateId, type),
        pageFrom,
        ...(otherParam || {}),
        ...otherData,
      };
      const params = {
        quotationHeaderCurrentId,
        quotationColumns: remote
          ? remote.process(
              'SSRC_QUOTATION_DETAIL_CURRENT_SUPPLIER_PROCESS_SAVE_DATA_NONE',
              quotationColumns,
              {
                bidFlag,
                formDs,
              }
            )
          : quotationColumns,
        query: {
          customizeUnitCode: getCustomizeUnitCode(['baseItemForm', 'baseInfoForm']),
        },
      };
      const res = await saveDataCurrentQuotation(params);
      if (getResponse(res)) {
        notification.success();
        await tableDsRef.current[templateId].query();

        if (remote?.event) {
          remote.event.fireEvent('remoteAfterHandleSaveSuccess', {
            resultSavedData: res,
            fetchHeaderAll,
            templateId,
            type,
            pageProps: props,
          });
        }
        return true;
      } else {
        return false;
      }
    } else {
      // 防止弹框关闭
      return false;
    }
  };

  // 大保存
  const handleSaveAll = async () => {
    if (currentEditDisable) {
      return;
    }

    if (headerRef.current?.moduleRule === 'SUB_MODULE') {
      return handleSaveSubAll();
    } else {
      return handleSaveNonAll();
    }
  };

  // 区分模块 大保存
  const handleSaveSubAll = async () => {
    const { moduleList = [], supQuotationDetailCurrentId } = headerRef.current;

    // 先校验头附件
    if (!(await formDs?.validate())) {
      notification.warning({
        message: intl
          .get('hzero.common.message.confirm.attachment.atLeast')
          .d('附件为必传项，请至少上传一个附件！'),
      });
      return false;
    }

    let otherData = {};
    otherData = remote
      ? remote.process(
          'SSRC_QUOTATION_DETAIL_CURRENT_SUPPLIER_PROCESS_HANDLESAVESUBALL_OTHERDATA',
          otherData,
          {
            pageProps: props,
            formDs,
            headerRef,
            tableDsRef,
          }
        )
      : otherData;
    otherData = otherData || {};

    return Promise.all(moduleList?.map((r) => tableDsRef.current?.[r.templateId]?.validate())).then(
      async (results) => {
        if (results.every((result) => result)) {
          const quotationColumns = {
            sourceFrom,
            quotationHeaderCurrentId,
            supQuotationDetailCurrentId,
            quoDetailAttachmentUuid: formDs?.current?.get('quoDetailAttachmentUuid'),
            rfxLineItemId: rfxLineItemId || bidLineItemId,
            supQuotationDtlCurList: getSubAllData(),
            ...otherData,
            pageFrom,
          };
          const params = {
            quotationColumns: remote
              ? remote.process(
                  'SSRC_QUOTATION_DETAIL_CURRENT_SUPPLIER_PROCESS_SAVE_DATA_SUB',
                  quotationColumns,
                  {
                    bidFlag,
                    formDs,
                  }
                )
              : quotationColumns,
            query: {
              customizeUnitCode: getCustomizeUnitCode(['baseItemForm', 'baseInfoForm']),
            },
          };

          const cuxFlag = remote
            ? await remote.process(
                'SSRC_QUOTATION_DETAIL_CURRENT_SUPPLIER_PROCESS_HANDLESAVESUBALL_CUXFLAG',
                null,
                {
                  pageProps: props,
                  formDs,
                  params,
                  headerRef,
                  tableDsRef,
                  quotationHeaderId,
                }
              )
            : null;
          if (cuxFlag === false) {
            return false;
          }

          setOperateLoading(true);
          const res = await saveDataCurrentQuotation(params);
          setOperateLoading(false);
          if (getResponse(res)) {
            notification.success();
            // 查询
            fetchHeaderAll();
            return true;
          } else {
            return false;
          }
        } else {
          // 防止弹框关闭
          return false;
        }
      }
    );
  };

  // 不区分模块 大保存
  const handleSaveNonAll = async () => {
    // 先校验头附件
    if (!(await formDs?.validate())) {
      notification.warning({
        message: intl
          .get('hzero.common.message.confirm.attachment.atLeast')
          .d('附件为必传项，请至少上传一个附件！'),
      });
      return false;
    }

    return handleSave(headerRef.current?.templateId, 'all');
  };

  const getColumns = useCallback(
    (templateId, item) => {
      const showNextQuotationDetails = (record) => {
        const defaultValue = !record.data.parentDetailId && record.data.objectVersionNumber;
        return remote
          ? remote.process(
              'SSRC_QUOTATION_DETAIL_CURRENT_SUPPLIER_PROCESS_SHOWDETAIL',
              defaultValue,
              {
                moreRef,
                item,
              }
            )
          : defaultValue;
      };
      const allowCreateFlags =
        (!headerRef.current?.allowCreateFlag && !allowCreateFlag) ||
        abandonedFlag ||
        currentEditDisable;
      const showNextQuotationDetailsField = remote
        ? remote.process(
            'SSRC_QUOTATION_DETAIL_CURRENT_SUPPLIER_PROCESS_SHOWDETAILFIELD',
            allowCreateFlags,
            {
              moreRef,
              otherLogical: abandonedFlag || currentEditDisable,
              item,
            }
          )
        : allowCreateFlags;
      const columns = [
        {
          name: 'configCode',
          editor: true,
          width: 150,
          title: (
            <div className={style['quotation-detail-header-config-code']}>
              {intl.get(`ssrc.common.model.common.configCode`).d('报价明细项编码')}
            </div>
          ),
        },
        {
          name: 'configName',
          width: 130,
          editor: true,
        },
        showNextQuotationDetailsField
          ? false
          : {
              header: intl.get(`ssrc.common.model.common.nextQuotationDetails`).d('下级报价明细'),
              name: 'nextQuotationDetails',
              width: 120,
              align: 'left',
              renderer: ({ record }) =>
                showNextQuotationDetails(record) ? (
                  <a onClick={() => handleAddTwo(record, templateId)}>
                    {intl.get('hzero.common.button.create').d('新建')}
                  </a>
                ) : (
                  ''
                ),
            },
        ...(dynamicColumns?.[templateId] || []),
      ].filter(Boolean);
      const NewColumnns = remote
        ? remote.process(
            'SSRC_QUOTATION_DETAIL_CURRENT_SUPPLIER_PROCESS_TABS_ITEM_COLUMNS',
            columns,
            {
              pageFrom,
              moduleRule,
              rowData,
              uiType,
              formDs,
              bidFlag,
              item,
              headerRef,
            }
          )
        : columns;
      return NewColumnns || [];
    },
    [dynamicColumns, currentEditDisable, moduleRule, formDs]
  );

  // 导出明细
  const exportDetail = () => {
    let timer = null;
    return (e) => {
      if (!timer) {
        handleExport();
        timer = setTimeout(() => {
          timer = null;
        }, 5000);
      } else {
        e.stopPropagation();
      }
    };
  };

  const handleExport = () => {
    exportQuotationDetailV2({
      sourceHeaderId: rfxHeaderId || bidHeaderId,
      rfxLineItemId: rfxLineItemId || bidLineItemId,
      sourceFrom,
      quotationHeaderCurrentId,
      pageFrom,
    }).then((response) => {
      try {
        if (!response) {
          return;
        }
        const blobUrl = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        const fileName = getExportFileName({ baseDS: formDs });
        a.download = decodeURIComponent(`${fileName}.xlsx`);
        a.href = blobUrl;
        a.click();
      } catch (err) {
        throw err;
      }
    });
  };

  let exportDetailNode = null;
  if (
    (headerRef.current?.moduleRule === 'SUB_MODULE' && !isEmpty(headerRef.current?.moduleList)) ||
    (headerRef.current?.moduleRule === 'NO_DISTINCTION' && !isEmpty(tableDsRef.current))
  ) {
    exportDetailNode = (
      <text onClick={exportDetail()}>
        {intl.get('ssrc.common.button.batchExportDetail').d('导出明细')}
      </text>
    );
  }

  const itemInfoFields = useMemo(() => {
    const Fields = [<Output name="itemName" />];
    return Fields;
  }, []);

  // 分模块 表格按钮组
  const getModuleTableButtons = ({ item }) => {
    const showButton = !abandonedFlag && !currentEditDisable;
    if (!showButton) {
      return;
    }

    const buttonList = [
      headerRef.current?.allowCreateFlag === 1 || allowCreateFlag === 1
        ? ['add', { onClick: () => handleAddOne(item.templateId) }]
        : null,
      headerRef.current?.allowCreateFlag === 1 || allowCreateFlag === 1
        ? ['delete', { icon: 'delete_sweep' }]
        : null,
      [
        'save',
        {
          onClick: () => handleSave(item.templateId, '', { saveLinePostFlag: 1 }),
          loading: operateLoading || queryLoading,
        },
      ],
    ].filter(Boolean);

    const cuxProps = {
      handleSaveAll,
      headerRef,
      item,
      bidFlag,
      pageProps: props,
    };

    const button = remote
      ? remote.process(
          'SSRC_QUOTATION_DETAIL_CURRENT_SUPPLIER_PROCESS_TABLE_MODULE_BUTTONS',
          buttonList,
          cuxProps
        )
      : buttonList;

    return button;
  };

  const extraShowFlag = remote
    ? remote.process('SSRC_QUOTATION_DETAIL_CURRENT_SUPPLIER_PROCESS_SHOWDETAIL', true, { moreRef })
    : true;

  return (
    <Spin spinning={queryLoading}>
      <div className={style['modal-content-base-form-wrap']}>
        <div
          className={classnames(
            style['ssrc-supplier-quotation-current-base-form-wrap'],
            style['ssrc-supplier-quotation-current-base-form-wrap-first']
          )}
        >
          <h3 style={{ 'font-weight': '600px', fontSize: '16px' }}>
            {intl.get('ssrc.inquiryHall.view.card.subtitle.itemInfo').d('物料信息')}
          </h3>
          {customizeForm(
            {
              code: getCustomizeUnitCode('baseItemForm'),
              dataSet: itemFormDs,
            },
            <Form
              dataSet={itemFormDs}
              labelLayout="vertical"
              columns={3}
              useWidthPercent
              className="c7n-pro-vertical-form-display"
            >
              {itemInfoFields}
            </Form>
          )}
        </div>

        <div className={style['ssrc-supplier-quotation-current-base-form-wrap']}>
          <h3 style={{ 'font-weight': '600px', fontSize: '16px' }}>
            {intl.get('ssrc.common.view.message.basicInfos').d('基础信息')}
          </h3>
          {formDs?.length
            ? customizeForm(
                {
                  code: getCustomizeUnitCode('baseInfoForm'),
                  dataSet: formDs,
                },
                <Form
                  dataSet={formDs}
                  columns={3}
                  useWidthPercent
                  labelLayout="vertical"
                  labelAlign="left"
                  className="c7n-pro-vertical-form-display"
                >
                  <Output name="templateName" />
                  <Attachment
                    readOnly
                    name="attachmentUuid"
                    viewMode="popup"
                    data={{
                      tenantId: getCurrentOrganizationId(),
                    }}
                    funcType="link"
                  />
                  <Attachment
                    name="quoDetailAttachmentUuid"
                    viewMode="popup"
                    data={{
                      tenantId: getCurrentOrganizationId(),
                    }}
                    funcType="link"
                  />
                </Form>
              )
            : ''}
        </div>
      </div>
      <div className={style['modal-content-informationExport']}>
        <h3 style={{ 'font-weight': '600px', fontSize: '16px' }}>
          {intl.get('ssrc.common.view.message.quotationInfos').d('报价信息')}
        </h3>
        <div className={style['modal-content-informationExport-div']}>
          <Icon type="unarchive" />
          {exportDetailNode}
        </div>
      </div>
      {moduleRule === 'SUB_MODULE' && (
        <Fragment>
          <Anchor linkList={headerRef.current?.moduleList} />
          {headerRef.current?.moduleList?.map((item) => (
            <div className={style['quotation-info-warp']} key={item?.templateId}>
              <h4 id={item.templateId} className={style['quotation-info']}>
                {item.templateName}
              </h4>
              <Table
                mode="tree"
                rowKey="supQuotationDetailCurrentId"
                dataSet={tableDsRef.current?.[item.templateId]}
                columns={getColumns(item.templateId, item)}
                buttons={getModuleTableButtons({ item })}
                virtual
                virtualCell
                style={{ maxHeight: 390 }}
              />
            </div>
          ))}
        </Fragment>
      )}
      {moduleRule === 'NO_DISTINCTION' && (
        <Fragment>
          <h4 className={style['quotation-info']}>
            <span style={{ fontSize: '12px', fontWeight: '500' }}>
              {headerRef.current?.templateName}
            </span>
          </h4>
          <Table
            mode="tree"
            dataSet={tableDsRef.current?.[headerRef.current?.templateId]}
            columns={getColumns(headerRef.current?.templateId)}
            buttons={
              extraShowFlag &&
              !abandonedFlag &&
              !currentEditDisable && [
                (headerRef.current?.allowCreateFlag === 1 || allowCreateFlag === 1) && [
                  'add',
                  { onClick: () => handleAddOne(headerRef.current?.templateId) },
                ],
                (headerRef.current?.allowCreateFlag === 1 || allowCreateFlag === 1) && [
                  'delete',
                  { icon: 'delete_sweep' },
                ],
                [
                  'save',
                  {
                    onClick: () =>
                      handleSave(headerRef.current?.templateId, '', { saveLinePostFlag: 1 }),
                  },
                ],
              ]
            }
          />
        </Fragment>
      )}
    </Spin>
  );
};

export default withCustomize({
  unitCode: [
    'SSRC.SUPPLIER_QUOTATION_DETAIL_CURRENT.BASE_ITEM_FORM',
    'SSRC.SUPPLIER_QUOTATION_DETAIL_CURRENT.BASE_FORM',
    'SSRC.SUPPLIER_QUOTATION_DETAIL_CURRENT_NEW_BID.BASE_ITEM_FORM',
    'SSRC.SUPPLIER_QUOTATION_DETAIL_CURRENT_NEW_BID.BASE_FORM',
  ],
})(observer(Content));

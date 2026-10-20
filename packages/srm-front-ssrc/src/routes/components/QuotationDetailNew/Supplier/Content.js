/* eslint-disable eqeqeq */
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
import { math } from 'choerodon-ui/dataset';
import { isEmpty, isArray, noop } from 'lodash';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import {
  getResponse,
  getCurrentOrganizationId,
  filterNullValueObject,
  getDateFormat,
  getDateTimeFormat,
} from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import notification from 'utils/notification';
import { PRIVATE_BUCKET } from '_utils/config';
import C7NUpload from '_components/C7NUpload';

import { getExportFileName } from '@/routes/components/QuotationDetailCurrent/utils.js';
import { fetchHeader, saveData, exportQuotationDetail } from '@/services/quotationDetailNewService';
import { ChunkUploadProps } from '@/utils/SsrcRegx';
import { execMathExpress } from '../calculate';
import Anchor from '../Anchor';
import { formDS, tableDS } from './storeDS';

import style from '../index.less';

const organizationId = getCurrentOrganizationId();

function Content(props) {
  const {
    rowData,
    sourceFrom,
    detailFrom,
    abandonedFlag,
    allowCreateFlag,
    contentRef,
    currentEditDisable,
    uiType,
    postAndDeleteParams = {}, // 线下录入页面需要
    remote,
    extendInterfaceParams = {},
    pageFrom = '',
    bidFlag = false,
    customizeForm = noop,
  } = props || {};
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
  const moreRef = useRef(
    remote ? remote.process('SSRC_QUOTATION_DETAIL_SUPPLIER_PROCESS_MOREREF') : null
  ); // 二开临时存储数据仓库

  const formDs = useMemo(() => new DataSet(formDS()), []);

  const {
    rfxLineItemId,
    bidLineItemId,
    itemId,
    itemCategoryId,
    rfxHeaderId,
    bidHeaderId,
    quotationLineId,
    quotationHeaderId,
  } = useMemo(() => {
    return uiType === 'hzero' ? rowData : rowData?.toData();
  }, [uiType, rowData]);

  useEffect(() => {
    init();
  }, []);

  const init = () => {
    const params = {
      sourceFrom,
      itemId,
      itemCategoryId,
      quotationLineId,
      quotationHeaderId,
      rfxLineItemId: rfxLineItemId || bidLineItemId,
      rfxHeaderId: rfxHeaderId || bidHeaderId,
      customizeUnitCode: getCustomizeUnitCode('baseInfoForm'),
    };
    if (detailFrom) {
      params.from = detailFrom;
    }
    const queryParams = remote
      ? remote.process('SSRC_QUOTATION_DETAIL_SUPPLIER_PROCESS_QUERY_PARAMS', params, {
          rowData,
          bidFlag,
        })
      : params;
    setQueryLoading(true);
    fetchHeader(queryParams)
      .then(async (res) => {
        const result = getResponse(res);
        if (result && !result.failed) {
          const { supQuotationDetailPage = {}, moduleList = [] } = result;
          // 缓存头数据
          headerRef.current = result;
          const tableDsConfig = tableDS({
            abandonedFlag,
            queryParams: params,
            detailFrom,
            handleDataSource,
            postAndDeleteParams,
            extendInterfaceParams,
            remote,
            fetchHeaderAll,
          });

          const tableDsOtherProps = {
            formDs,
            organizationId,
            bidFlag,
          };
          // 分模块
          if (result.moduleRule === 'SUB_MODULE') {
            let columns = [];
            // 缓存ds
            moduleList.forEach((i) => {
              tableDsOtherProps.module = i;

              tableDsRef.current = {
                ...tableDsRef.current,
                [i.templateId]: new DataSet(
                  remote
                    ? remote.process(
                        'SSRC_QUOTATION_DETAIL_SUPPLIER_PROCESS_TABLE_DS',
                        tableDsConfig,
                        tableDsOtherProps
                      )
                    : tableDsConfig
                ),
              };
              columns = { ...columns, [i.templateId]: handleDynamicColumns(i) };
              // eslint-disable-next-line no-unused-expressions
              tableDsRef.current?.[i.templateId]?.loadData(
                handleDataSource(i?.supQuotationDetailPage?.content),
                i?.supQuotationDetailPage?.totalElements
              );
              templateRef.current = { ...templateRef.current, [i.templateId]: i.quotationColumns };
              // 查询
              tableDsRef.current[i.templateId].setQueryParameter('templateId', i.templateId);
              tableDsRef.current[i.templateId].setQueryParameter('moduleRule', result.moduleRule);
            });
            // 设置动态列
            setDynamicColumns(columns);
          } else if (result.moduleRule === 'NO_DISTINCTION') {
            // 不区分模块
            tableDsRef.current = {
              [result.templateId]: new DataSet(
                remote
                  ? remote.process(
                      'SSRC_QUOTATION_DETAIL_SUPPLIER_PROCESS_TABLE_DS',
                      tableDsConfig,
                      tableDsOtherProps
                    )
                  : tableDsConfig
              ),
            };
            // 设置动态列
            setDynamicColumns({ [result.templateId]: handleDynamicColumns(result) });
            // eslint-disable-next-line no-unused-expressions
            tableDsRef.current?.[result.templateId]?.loadData(
              handleDataSource(supQuotationDetailPage.content),
              supQuotationDetailPage.totalElements
            );
            templateRef.current = { [result.templateId]: result.quotationColumns };
            tableDsRef.current[result.templateId].setQueryParameter(
              'templateId',
              result.templateId
            );
          }
          formDs.loadData([result]);
          // 设置值
          setModuleRule(result.moduleRule);
          const moreSearch = remote
            ? remote.process('SSRC_QUOTATION_DETAIL_SUPPLIER_PROCESS_MORESEARCH', null, { formDs })
            : null;
          if (moreSearch) {
            moreRef.current = await moreSearch;
          }
        }
      })
      .finally(() => {
        setQueryLoading(false);
      });
  };

  // 获取个性化
  const getCustomizeUnitCode = useCallback(
    (type = null) => {
      if (!type || isEmpty(type)) {
        return null;
      }

      const RfxCodeMap = new Map([
        ['baseInfoForm', 'SSRC.INQUIRY_HALL_QUOTATION_DETAIL.BASE_FORM_SUPPLIER'], // 基础信息
      ]);

      const BidCodeMap = new Map([
        ['baseInfoForm', 'SSRC.BID_HALL_QUATION_DETAIL.BASE_FORM_SUPPLIER'], // 基础信息
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

  // 大保存后查询
  const fetchHeaderAll = () => {
    const params = {
      sourceFrom,
      itemId,
      itemCategoryId,
      quotationLineId,
      quotationHeaderId,
      rfxHeaderId: rfxHeaderId || bidHeaderId,
      rfxLineItemId: rfxLineItemId || bidLineItemId,
      customizeUnitCode: getCustomizeUnitCode('baseInfoForm'),
    };
    if (detailFrom) {
      params.from = detailFrom;
    }
    setQueryLoading(true);
    fetchHeader(params)
      .then((res) => {
        const result = getResponse(res);
        if (result && !result.failed) {
          const { supQuotationDetailPage = {}, moduleList = [] } = result;

          headerRef.current = result;
          formDs.loadData([result]);

          // 分模块
          if (result.moduleRule === 'SUB_MODULE') {
            // 缓存ds
            moduleList.forEach((i) => {
              // eslint-disable-next-line no-unused-expressions
              tableDsRef.current?.[i.templateId]?.loadData(
                handleDataSource(i?.supQuotationDetailPage?.content),
                i?.supQuotationDetailPage?.totalElements
              );
            });
          } else if (result.moduleRule === 'NO_DISTINCTION') {
            // 不区分模块
            // eslint-disable-next-line no-unused-expressions
            tableDsRef.current?.[result.templateId]?.loadData(
              handleDataSource(supQuotationDetailPage.content),
              supQuotationDetailPage.totalElements
            );
          }
        }
      })
      .finally(() => setQueryLoading(false));
  };

  // 处理数据
  const handleDataSource = (source = []) => {
    if (isEmpty(source)) return [];
    const restructureSource = source.map((item) => {
      let elementValue = {};
      const { quotationColumns = [], ...otherItem } = item;
      // eslint-disable-next-line no-unused-expressions
      quotationColumns?.forEach((newItem) => {
        elementValue = {
          ...elementValue,
          [newItem.columnCode]: newItem.supQuotationColumnValue || null,
          [`${newItem.columnCode}Required`]: newItem.quotationColumnValue || null,
          [`${newItem.columnCode}Meaning`]: newItem.supQuotationColumnValueMeaning || null,
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
    const { quotationColumns = [] } = data || {};
    const columns = [];
    quotationColumns.forEach((item) => {
      // visible过滤
      if (item.visible === 0 || item.visible === 1) {
        if (item.componentType === 'Lov') {
          // eslint-disable-next-line no-unused-expressions
          tableDsRef.current?.[data.templateId].addField(`${item.columnCode}Lov`, {
            name: `${item.columnCode}Lov`,
            label: item.columnName,
            ignore: 'always',
            ...renderFieldType(item, { module: data }),
          });
          // eslint-disable-next-line no-unused-expressions
          tableDsRef.current?.[data.templateId].addField(`${item.columnCode}`, {
            name: `${item.columnCode}`,
            bind: `${item.columnCode}Lov.${item.valueField}`,
          });
          // eslint-disable-next-line no-unused-expressions
          tableDsRef.current?.[data.templateId].addField(`${item.columnCode}Meaning`, {
            name: `${item.columnCode}Meaning`,
            bind: `${item.columnCode}Lov.${item.displayField}`,
          });
        } else {
          // eslint-disable-next-line no-unused-expressions
          tableDsRef.current?.[data.templateId].addField(item.columnCode, {
            name: item.columnCode,
            label: item.columnName,
            ...renderFieldType(item, { module: data }),
          });
        }
        if (item.componentType === 'Upload') {
          columns.push({
            name: item.columnCode,
            width: 150,
            renderer: ({ record }) => {
              return (
                <C7NUpload
                  filePreview
                  tenantId={organizationId}
                  name={item.columnCode}
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
            name: item.componentType === 'Lov' ? `${item.columnCode}Lov` : item.columnCode,
            width: 150,
            editor: (record) => handleDynComponent(record, item, data.templateId),
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
        disabled: ({ record, dataSet }) => {
          const flag = (currentEditDisable ? true : isDisabled(record, field)) || abandonedFlag;
          return remote
            ? remote.process('SSRC_QUOTATION_DETAIL_SUPPLIER_PROCESS_FIELD_DISABLED', flag, {
                field,
                bidFlag,
                dataSet,
                record,
                pageFrom,
                current: headerRef?.current,
                module,
              })
            : flag;
        },
        required: ({ record, dataSet }) => {
          const flag = isRequired(record, field);
          return remote
            ? remote.process('SSRC_QUOTATION_DETAIL_SUPPLIER_PROCESS_FIELD_REQUIRED', flag, {
                field,
                bidFlag,
                dataSet,
                record,
                pageFrom,
                current: headerRef?.current,
                module,
              })
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
      field,
      headerDTO: headerRef?.current,
      module,
    };

    const NewFieldConfig = remote
      ? remote.process(
          'SSRC_QUOTATION_DETAIL_SUPPLIER_PROCESS_RENDERFIELDTYPE',
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
    const data = record.toData();
    const { columnCode = null } = item;
    if (!columnCode) {
      return false;
    }
    if (
      data.quotationDetailType === 'ALL' ||
      data.quotationDetailType === 'SCOPE' ||
      data.quotationDetailType === 'RULE'
    ) {
      return false;
    } else {
      const isRequiredValue = data[`${columnCode}Required`] || null;
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
    const data = record.toData();
    const { columnCode = null, disabled, calculationRule } = item;
    if (!columnCode) {
      return false;
    }

    if (
      data.quotationDetailType === 'ALL' ||
      data.quotationDetailType === 'SCOPE' ||
      data.quotationDetailType === 'RULE'
    ) {
      return true;
    } else {
      if ([2, 3].includes(disabled)) {
        return true;
      }
      return data[`${columnCode}Required`] === 'READONLY' || calculationRule;
    }
  };

  // 渲染组件
  const handleDynComponent = (record = {}, field = {}, templateId) => {
    const { componentType, columnCode } = field;
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
          targetValue = math.div(targetValueObj.num, targetValueObj.den);
          if (item.precision > 0) {
            // 0.00000001解决firefox和chrome的五舍六入的问题
            targetValue = math.toFixed(math.plus(targetValue, 0.00000001), item.precision);
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
        parentDetailId: record.data.supQuotationDetailId,
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
      const { quotationColumns = [], ...otherItems } = item;
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
        quotationLineId: quotationLineId || null,
        quotationHeaderId: quotationHeaderId || null,
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
    const { moduleList = [] } = headerRef.current;
    let data = [];
    moduleList.forEach((r) => {
      data = [...data, ...getUpdateData(r.templateId, 'all')];
    });
    return data;
  };

  // 小保存
  const handleSave = async (templateId = null, type = '', otherParam = {}) => {
    const flag = await tableDsRef.current?.[templateId]?.validate();

    let otherData = {};
    otherData = remote
      ? remote.process('SSRC_QUOTATION_DETAIL_SUPPLIER_PROCESS_HANDLESAVE_OTHERDATA', otherData, {
          pageProps: props,
          formDs,
          templateId,
          headerRef,
          tableDsRef,
        })
      : otherData;
    otherData = otherData || {};

    if (flag) {
      const params = {
        quotationHeaderId,
        quotationColumns: {
          sourceFrom,
          supQuotationDetailId: headerRef.current?.supQuotationDetailId,
          quoDetailAttachmentUuid: formDs?.current?.get('quoDetailAttachmentUuid'),
          rfxLineItemId: rfxLineItemId || bidLineItemId,
          supQuotationDetailList: getUpdateData(templateId, type),
          ...otherParam,
          ...otherData,
        },
        query: { synCurrentFlag: 1, customizeUnitCode: getCustomizeUnitCode('baseInfoForm') },
      };

      let result = null;
      try {
        result = await saveData(params);
        result = getResponse(result);
        if (!result) {
          return false;
        }

        notification.success();
        // 查询
        await tableDsRef.current[templateId].query();

        if (remote?.event) {
          remote.event.fireEvent('remoteAfterHandleSaveSuccess', {
            resultSavedData: result,
            fetchHeaderAll,
            templateId,
            type,
            pageProps: props,
          });
        }
        return true;
      } catch (e) {
        throw e;
      }
      // return new Promise((resolve, reject) => {
      //   saveData(params).then((res) => {
      //     const result = getResponse(res);
      //     if (result && !result.failed) {
      //       notification.success();
      //       // 查询
      //       tableDsRef.current[templateId].query();
      //       resolve(res);
      //     } else {
      //       reject(res);
      //       // 防止弹框关闭
      //       return false;
      //     }
      //   });
      // });
    } else {
      // 防止弹框关闭
      return false;
    }
  };

  // 大保存
  const handleSaveAll = async () => {
    if (moduleRule === 'SUB_MODULE') {
      return handleSaveSubAll();
    } else {
      return handleSaveNonAll();
    }
  };

  // 区分模块 大保存
  const handleSaveSubAll = async () => {
    const { moduleList = [], supQuotationDetailId } = headerRef.current;
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
          'SSRC_QUOTATION_DETAIL_SUPPLIER_PROCESS_HANDLESAVESUBALL_OTHERDATA',
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
          let params = {
            quotationHeaderId,
            quotationColumns: {
              sourceFrom,
              supQuotationDetailId,
              quoDetailAttachmentUuid: formDs?.current?.get('quoDetailAttachmentUuid'),
              rfxLineItemId: rfxLineItemId || bidLineItemId,
              supQuotationDetailList: getSubAllData(),
              ...(extendInterfaceParams || {}),
              ...otherData,
            },
            query: { synCurrentFlag: 1, customizeUnitCode: getCustomizeUnitCode('baseInfoForm') },
          };

          const cuxFlag = remote
            ? await remote.process(
                'SSRC_QUOTATION_DETAIL_SUPPLIER_PROCESS_HANDLESAVESUBALL_CUXFLAG',
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

          params = remote
            ? remote.process(
                'SSRC_QUOTATION_DETAIL_SUPPLIER_PROCESS_HANDLESAVESUBALL_PARAMS',
                params,
                {
                  pageProps: props,
                  formDs,
                  quotationHeaderId,
                }
              )
            : params;

          const res = await saveData(params);
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
    if (!(await formDs.validate())) {
      notification.warning({
        message: intl
          .get('hzero.common.message.confirm.attachment.atLeast')
          .d('附件为必传项，请至少上传一个附件！'),
      });
      return false;
    }

    return handleSave(headerRef.current?.templateId, 'all', { ...(extendInterfaceParams || {}) });
  };

  const getColumns = useCallback(
    (templateId, item) => {
      const showNextQuotationDetails = (record) => {
        const defaultValue = !record.data.parentDetailId && record.data.objectVersionNumber;
        return remote
          ? remote.process('SSRC_QUOTATION_DETAIL_SUPPLIER_PROCESS_SHOWDETAIL', defaultValue, {
              moreRef,
              item,
            })
          : defaultValue;
      };

      const allowCreateFlags =
        (!headerRef.current?.allowCreateFlag && !allowCreateFlag) ||
        abandonedFlag ||
        currentEditDisable;
      const showNextQuotationDetailsField = remote
        ? remote.process(
            'SSRC_QUOTATION_DETAIL_SUPPLIER_PROCESS_SHOWDETAILFIELD',
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

      // 埋点编码是错的
      let NewColumnns = remote
        ? remote.process('SSRC_DETAIL_CHECK_PRICE_TABS_ITEM_COLUMNS', columns, {
            formDs,
            item,
          })
        : columns;

      NewColumnns = remote
        ? remote.process('SSRC_QUOTATION_DETAIL_SUPPLIER_PROCESS_TABLE_COLUMNS', NewColumnns, {
            pageProps: props,
            formDs,
            templateId,
            headerRef,
            dynamicColumns,
            moduleRule,
            tableDsRef,
            item,
          })
        : NewColumnns;

      NewColumnns = (NewColumnns || []).filter(Boolean);

      return NewColumnns;
    },
    [dynamicColumns, formDs]
  );

  const throttle = () => {
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
    exportQuotationDetail({
      sourceHeaderId: rfxHeaderId || bidHeaderId,
      rfxLineItemId: rfxLineItemId || bidLineItemId,
      sourceFrom,
      quotationHeaderId,
    }).then((response) => {
      if (!response) {
        return;
      }

      try {
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
      <text onClick={throttle()}>
        {intl.get('ssrc.common.button.batchExportDetail').d('导出明细')}
      </text>
    );
  }

  // 渲染表单
  const renderForm = () => {
    return (
      <Form
        dataSet={formDs}
        columns={3}
        labelLayout="vertical"
        labelAlign="left"
        useWidthPercent
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
        />
        <Attachment
          name="quoDetailAttachmentUuid"
          viewMode="popup"
          data={{
            tenantId: getCurrentOrganizationId(),
          }}
        />
      </Form>
    );
  };

  const getTableButtons = (data = {}) => {
    const { templateId, item } = data || {};

    const preButtons =
      !abandonedFlag && !currentEditDisable
        ? [
            headerRef.current?.allowCreateFlag === 1 || allowCreateFlag === 1
              ? ['add', { onClick: () => handleAddOne(templateId) }]
              : null,
            headerRef.current?.allowCreateFlag === 1 || allowCreateFlag === 1 ? 'delete' : null,
            [
              'save',
              {
                onClick: () =>
                  handleSave(templateId, '', {
                    saveLinePostFlag: 1,
                    ...(extendInterfaceParams || {}),
                  }),
              },
            ],
          ]
        : [];

    let buttons = remote
      ? remote.process('SSRC_QUOTATION_DETAIL_SUPPLIER_PROCESS_TABLE_BUTTONS', preButtons, {
          pageProps: props,
          formDs,
          templateId,
          headerRef,
          dynamicColumns,
          moduleRule,
          tableDsRef,
          item,
        })
      : preButtons;
    buttons = (buttons || []).filter(Boolean);

    return buttons;
  };

  return (
    <Spin spinning={queryLoading}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
        {intl.get('ssrc.common.view.message.basicInformation').d('基础信息')}
      </h3>
      {sourceFrom === 'BID'
        ? renderForm()
        : customizeForm(
            {
              code: getCustomizeUnitCode('baseInfoForm'),
              dataSet: formDs,
            },
            renderForm()
          )}
      <div className={style['modal-content-informationExport']}>
        <h3 style={{ fontWeight: '600px', fontSize: '16px' }}>
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
            <Fragment className={style['quotation-info-warp']}>
              <h4 id={item.templateId} className={style['quotation-info']}>
                {item.templateName}
              </h4>
              <Table
                mode="tree"
                dataSet={tableDsRef.current?.[item.templateId]}
                columns={getColumns(item.templateId, item) || []}
                buttons={getTableButtons({ templateId: item.templateId, item })}
              />
            </Fragment>
          ))}
        </Fragment>
      )}
      {moduleRule === 'NO_DISTINCTION' && (
        <Fragment>
          <h4 className={style['quotation-info']}>{headerRef.current?.templateName}</h4>
          <Table
            mode="tree"
            dataSet={tableDsRef.current?.[headerRef.current?.templateId]}
            columns={getColumns(headerRef.current?.templateId) || []}
            buttons={getTableButtons({ templateId: headerRef.current?.templateId })}
          />
        </Fragment>
      )}
    </Spin>
  );
}

export default withCustomize({
  unitCode: [
    'SSRC.INQUIRY_HALL_QUOTATION_DETAIL.BASE_FORM_SUPPLIER',
    'SSRC.BID_HALL_QUATION_DETAIL.BASE_FORM_SUPPLIER',
  ],
})(observer(Content));

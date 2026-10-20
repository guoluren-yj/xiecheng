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
  Select,
  Lov,
  DatePicker,
  DateTimePicker,
  Switch,
  CheckBox,
  Attachment,
} from 'choerodon-ui/pro';
import { isEmpty, isArray, noop } from 'lodash';
import classnames from 'classnames';
import { math } from 'choerodon-ui/dataset';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import C7NUpload from '_components/C7NUpload';
import {
  getResponse,
  getCurrentOrganizationId,
  filterNullValueObject,
  getDateFormat,
  getDateTimeFormat,
} from 'utils/utils';
import notification from 'utils/notification';
import { PRIVATE_BUCKET } from '_utils/config';
import { yesOrNoRender } from 'utils/renderer';
import request from 'utils/request';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import { fetchHeader, savePurchaseData } from '@/services/quotationDetailNewService';
import { ChunkUploadProps } from '@/utils/SsrcRegx';
import inquiryNewUpdateStyle from '@/routes/ssrc/InquiryHallNew/Update/index.less';
import { execMathExpress } from '../calculate';
import { formDS, tableDS } from './storeDS';

import style from '../index.less';

const organizationId = getCurrentOrganizationId();

function Content(props) {
  const {
    rowData,
    sourceFrom,
    contentRef,
    uiType,
    operationType,
    remote,
    headerData,
    saveUrl, // 覆盖保存接口方法（ps: 目前寻源立项变更需要替换接口）
    deleteUrl, // 覆盖删除接口（ps: 目前寻源立项变更需要替换接口）
    deleteRequestPrams, // 自定义删除接口参数（ps: 目前寻源立项变更需要替换接口）
    coverInterfaceParam, // 覆盖从record中取出来传给后端的字段，因为如果id用实体字段的话会是对象，如果判断id是否是对象，对象中的取值又不确定，因此采取此种方式覆盖
    bidFlag = false,
    customizeForm = noop,
  } = props || {};
  // 暴露子组件的api给父组件使用
  useImperativeHandle(contentRef, () => ({
    handleSaveAll,
  }));

  const { event } = remote || {};

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
    quotationHeaderId,
    projectLineItemId,
    sourceProjectId,
    quotationTemplateId,
  } = useMemo(() => {
    return uiType === 'hzero' ? rowData : rowData?.toData();
  }, [uiType, rowData]);

  useEffect(() => {
    init();
  }, []);

  const init = () => {
    const queryParams = {
      sourceFrom,
      itemId,
      itemCategoryId,
      quotationHeaderId,
      quotationTemplateId,
      rfxHeaderId: rfxHeaderId || bidHeaderId || sourceProjectId,
      rfxLineItemId: rfxLineItemId || bidLineItemId || projectLineItemId,
      operationType,
      customizeUnitCode: getCustomizeUnitCode('baseInfoForm'),
      ...(coverInterfaceParam || {}),
    };
    const params = remote
      ? remote.process('SSRC_QUOTATION_DETAIL_PURCHASER_PROCESS_QUERY_PARAMS', queryParams, {
          rowData,
          bidFlag,
        })
      : queryParams;
    setQueryLoading(true);
    fetchHeader(params)
      .then(async (res) => {
        const result = getResponse(res);
        if (result && !result.failed) {
          const { supQuotationDetailPage = {}, moduleList = [] } = result;
          // 缓存头数据
          headerRef.current = result;
          const tableDsConfig = tableDS({
            queryParams: params,
            handleDataSource,
            deleteUrl,
            deleteRequestPrams,
            remote,
            fetchHeaderAll,
          });
          // 分模块
          if (result.moduleRule === 'SUB_MODULE') {
            let columns = [];
            // 缓存ds
            moduleList.forEach((i) => {
              tableDsRef.current = {
                ...tableDsRef.current,
                [i.templateId]: new DataSet(
                  remote
                    ? remote.process(
                        'SSRC_QUOTATION_DETAIL_PURCHASER_PROCESS_TABLE_DS',
                        tableDsConfig,
                        { rowData, bidFlag, module: i }
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
            });
            // 设置动态列
            setDynamicColumns(columns);
          } else if (result.moduleRule === 'NO_DISTINCTION') {
            // 不区分模块
            tableDsRef.current = {
              [result.templateId]: new DataSet(
                remote
                  ? remote.process(
                      'SSRC_QUOTATION_DETAIL_PURCHASER_PROCESS_TABLE_DS',
                      tableDsConfig,
                      { rowData, bidFlag }
                    )
                  : tableDsConfig
              ),
            };
            // 设置动态列
            setDynamicColumns({ [result.templateId]: handleDynamicColumns(result) });
            const dataSource = handleDataSource(supQuotationDetailPage.content);
            // eslint-disable-next-line no-unused-expressions
            tableDsRef.current?.[result.templateId]?.loadData(
              dataSource,
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
            ? remote.process('SSRC_QUOTATION_DETAIL_PURCHASER_PROCESS_MORESEARCH', null, {
                formDs,
              })
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

      const ProjectCodeMap = new Map([
        ['baseInfoForm', 'SSRC.PROJECT_SETUP_QUOTATION_DETAIL.BASE_FORM'], // 基础信息
      ]);

      const RfxCodeMap = new Map([
        ['baseInfoForm', 'SSRC.INQUIRY_HALL_QUOTATION_DETAIL.BASE_FORM'], // 基础信息
      ]);

      const BidCodeMap = new Map([
        ['baseInfoForm', 'SSRC.BID_HALL_QUATION_DETAIL.BASE_FORM'], // 基础信息
      ]);

      const CodeDataMap =
        sourceFrom === 'PROJECT' ? ProjectCodeMap : !bidFlag ? RfxCodeMap : BidCodeMap;
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

  // 保存接口
  const savePurchaseDataRequest = (params) => {
    if (saveUrl) {
      const { customizeUnitCode, ...otherParams } = params;
      // 如果是外部有传url，则使用外部的
      return request(saveUrl, {
        method: 'POST',
        body: otherParams,
        query: {
          customizeUnitCode,
        },
      });
    }
    return savePurchaseData(params);
  };

  // 大保存后查询
  const fetchHeaderAll = () => {
    const params = {
      sourceFrom,
      rfxLineItemId: rfxLineItemId || bidLineItemId || projectLineItemId,
      itemId,
      itemCategoryId,
      rfxHeaderId: rfxHeaderId || bidHeaderId || sourceProjectId,
      quotationHeaderId,
      quotationTemplateId,
      customizeUnitCode: sourceFrom === 'BID' ? undefined : getCustomizeUnitCode('baseInfoForm'),
      ...(coverInterfaceParam || {}),
    };
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
          [newItem.columnCode]: newItem.columnDefaultValue || null,
          [`${newItem.columnCode}Required`]: newItem.quotationColumnValue || null,
          [`${newItem.columnCode}Meaning`]: newItem.columnDefaultValueMeaning || null,
        };
      });
      return {
        ...otherItem,
        ...elementValue,
        quotationColumns,
        expand: false, // 控制树形是否默认展开
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
      if (item.visible === 1 || item.visible === 2) {
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
        disabled: ({ record }) => isDisabled(record, field),
        required: ({ record }) => isRequired(record, field),
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

    const fieldConfigObject = remote
      ? remote.process('SSRC_QUOTATION_DETAIL_PURCHASER_PROCESS_FIELD_TYPE_CONFIG', fieldConfig, {
          field,
          rowData,
          uiType,
          headerData,
          module,
          headerRef,
        })
      : fieldConfig;

    return fieldConfigObject;
  };

  // 收集组件属性
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
      if ([0, 3].includes(disabled)) {
        return true;
      }
      return data[`${columnCode}Required`] === 'READONLY' || calculationRule;
    }
  };

  /**
   * 组件是否禁用
   *
   * @param {*} [record={}]
   * @param {*} [item={}]
   */
  const isRequired = (record, item = {}) => {
    const data = record.toData();
    const { columnCode = null } = item;
    const { quotationColumns = [] } = data;
    const comRequired = record.get(`${columnCode}Required`);
    const disabledVal = isDisabled(record, item);
    if (!columnCode || disabledVal) {
      return false;
    }
    let requiredFlag = 0;
    quotationColumns.forEach((i) => {
      const { columnCode: currentCode } = i || {};
      if (currentCode === columnCode) {
        requiredFlag = i.quotationColumnCmpts?.filter((o) => o.attributeName === 'required')?.[0]
          ?.attributeValue;
      }
    });

    if (
      data.quotationDetailType === 'ALL' ||
      data.quotationDetailType === 'SCOPE' ||
      data.quotationDetailType === 'RULE'
    ) {
      return false;
    } else {
      return comRequired ? comRequired === 'REQUIRED' : requiredFlag === 'REQUIRED';
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
        message: 'quotation template is empty!',
      });
      return;
    }

    // eslint-disable-next-line no-unused-expressions
    tableDsRef.current?.[templateId]?.create(
      {
        parentDetailId: null, // 一级细项标记
        quotationColumns: templateRef.current?.[templateId],
        quotationTemplateId: templateId,
        quotationDimension: headerRef.current?.templateDimension,
      },
      0
    );
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
    // eslint-disable-next-line no-unused-expressions
    tableDsRef.current?.[templateId]?.create(
      {
        parentDetailId: record.data.quotationDetailId,
        quotationColumns: templateRef.current?.[templateId],
        quotationTemplateId: templateId,
        quotationDimension: headerRef.current?.templateDimension,
      },
      0
    );
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
          columnDefaultValue: otherItems[i.columnCode],
        };
      });
      return {
        ...otherItems,
        sourceFrom,
        tenantId: organizationId,
        rfxLineItemId: rfxLineItemId || bidLineItemId || projectLineItemId,
        sourceHeaderId: rfxHeaderId || bidHeaderId || sourceProjectId,
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
  const handleSave = async (templateId, type, options = {}) => {
    const { totalSaveNoNotification } = options || {};

    let otherData = {};
    otherData = remote
      ? remote.process('SSRC_QUOTATION_DETAIL_PURCHASER_PROCESS_HANDLESAVE_OTHERDATA', otherData, {
          pageProps: props,
          formDs,
          templateId,
          headerRef,
          tableDsRef,
        })
      : otherData;
    otherData = otherData || {};

    if (await tableDsRef.current?.[templateId]?.validate()) {
      const params = {
        quotationTemplateId: coverInterfaceParam?.quotationTemplateId || quotationTemplateId,
        quotationDetailId: headerRef.current?.quotationDetailId,
        quotationDetailList: getUpdateData(templateId, type),
        operationType,
        rfxLineItemId: rfxLineItemId || bidLineItemId || projectLineItemId,
        sourceHeaderId: rfxHeaderId || bidHeaderId || sourceProjectId,
        sourceFrom,
        saveLinePostFlag: type ? undefined : 1,
        attachmentUuid: formDs.current?.get('attachmentUuid'),
        customizeUnitCode: sourceFrom === 'BID' ? undefined : getCustomizeUnitCode('baseInfoForm'),
        ...otherData,
      };
      return savePurchaseDataRequest(params).then(async (res) => {
        const result = getResponse(res);
        if (result && !result.failed) {
          if (totalSaveNoNotification !== 1) {
            notification.success();
          }
          // 查询
          tableDsRef.current[templateId].query();
          if (event) {
            const eventProps = {
              resultSavedData: result,
              rowData,
              uiType,
              saveType: 'NO_DISTINCTION',
              fetchHeaderAll,
              templateId,
              type,
              pageProps: props,
            };
            await event.fireEvent('modalHandleOKSaved', eventProps);
          }
        } else {
          // 防止弹框关闭
          return false;
        }
      });
    } else {
      // 防止弹框关闭
      return false;
    }
  };

  // 大保存
  const handleSaveAll = useCallback(
    async (options = {}) => {
      if (uiType !== 'hzero') {
        rowData.set('quotationDetail', 1);
      }
      if (moduleRule === 'SUB_MODULE') {
        return handleSaveSubAll(options);
      } else {
        return handleSaveNonAll(options);
      }
    },
    [moduleRule]
  );

  // 区分模块 大保存
  const handleSaveSubAll = async (options = {}) => {
    const { moduleList = [], quotationDetailId } = headerRef.current;
    const { totalSaveNoNotification } = options || {};

    let otherData = {};
    otherData = remote
      ? remote.process(
          'SSRC_QUOTATION_DETAIL_PURCHASER_PROCESS_HANDLESAVESUBALL_OTHERDATA',
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
            quotationDetailId,
            quotationTemplateId: coverInterfaceParam?.quotationTemplateId || quotationTemplateId,
            quotationDetailList: getSubAllData(),
            operationType,
            rfxLineItemId: rfxLineItemId || bidLineItemId || projectLineItemId,
            sourceHeaderId: rfxHeaderId || bidHeaderId || sourceProjectId,
            sourceFrom,
            attachmentUuid: formDs.current?.get('attachmentUuid'),
            customizeUnitCode:
              sourceFrom === 'BID' ? undefined : getCustomizeUnitCode('baseInfoForm'),
            ...otherData,
          };

          const cuxFlag = remote
            ? await remote.process(
                'SSRC_QUOTATION_DETAIL_PURCHASER_PROCESS_HANDLESAVESUBALL_CUXFLAG',
                null,
                {
                  pageProps: props,
                  formDs,
                  params,
                  options,
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
                'SSRC_QUOTATION_DETAIL_PURCHASER_PROCESS_HANDLESAVESUBALL_PARAMS',
                params,
                {
                  pageProps: props,
                  formDs,
                  options,
                  quotationHeaderId,
                }
              )
            : params;

          let res = await savePurchaseDataRequest(params);
          res = getResponse(res);
          if (res) {
            if (totalSaveNoNotification !== 1) {
              notification.success();
            }
            // 查询
            fetchHeaderAll();

            if (event) {
              const eventProps = {
                resultSavedData: res,
                rowData,
                uiType,
                saveType: 'SUB_MODULE',
                pageProps: props,
              };
              await event.fireEvent('modalHandleOKSaved', eventProps);
            }
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
  const handleSaveNonAll = async (options) => {
    return handleSave(headerRef.current?.templateId, 'all', options);
  };

  const getColumns = useCallback(
    (templateId, item) => {
      const showNextQuotationDetails = (record) => {
        const defaultValue = !record.data.parentDetailId && record.data.objectVersionNumber;
        return remote
          ? remote.process('SSRC_QUOTATION_DETAIL_PURCHASER_PROCESS_SHOWDETAIL', defaultValue, {
              moreRef,
            })
          : defaultValue;
      };
      const allowPurCreateFlag = headerRef?.current?.allowPurCreateFlag;
      const showNextQuotationDetailsField = remote
        ? remote.process(
            'SSRC_QUOTATION_DETAIL_PURCHASER_PROCESS_SHOWDETAILFIELD',
            allowPurCreateFlag,
            {
              moreRef,
            }
          )
        : allowPurCreateFlag;

      const preColumns = [
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
        showNextQuotationDetailsField && {
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

      return remote
        ? remote.process('SSRC_QUOTATION_DETAIL_PURCHASER_PROCESS_COLUMNS', preColumns, {
            bidFlag,
            formDs,
            pageProps: props,
            templateId,
            headerRef,
            dynamicColumns,
            moduleRule,
            tableDsRef,
            item,
          })
        : preColumns;
    },
    [dynamicColumns, props]
  );

  // 渲染表单
  const renderForm = () => {
    return (
      <Form
        dataSet={formDs}
        columns={3}
        useWidthPercent
        labelLayout="vertical"
        labelAlign="left"
        className="c7n-pro-vertical-form-display"
      >
        <Output name="templateName" />
        <Output name="attachmentNeedFlag" renderer={({ value }) => yesOrNoRender(value)} />
        <Output name="allowCreateFlag" renderer={({ value }) => yesOrNoRender(value)} />
        <Output name="allowPurCreateFlag" renderer={({ value }) => yesOrNoRender(value)} />
        <Attachment
          name="attachmentUuid"
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

    const preButtons = [
      headerRef?.current?.allowPurCreateFlag && [
        'add',
        { onClick: () => handleAddOne(templateId) },
      ],
      'delete',
      ['save', { onClick: () => handleSave(templateId) }],
    ];

    let buttons = remote
      ? remote.process('SSRC_QUOTATION_DETAIL_PURCHASER_PROCESS_TABLE_BUTTONS', preButtons, {
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
      <div
        className={classnames(
          inquiryNewUpdateStyle['rfx-detail-list-card'],
          style['quotation-info-wrap-container']
        )}
      >
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
        <div>
          <h3
            className={classnames(
              inquiryNewUpdateStyle['rfx-card-item-title-level-two'],
              inquiryNewUpdateStyle['m-t-lg']
            )}
            style={{ fontSize: '16px', fontWeight: 600 }}
          >
            {intl.get('ssrc.common.view.message.quotationInfos').d('报价信息')}
          </h3>
        </div>

        {moduleRule === 'SUB_MODULE' && (
          <Fragment>
            {/* <Anchor linkList={headerRef.current?.moduleList} /> */}
            {headerRef.current?.moduleList?.map((item, index) => (
              <Fragment className={style['quotation-info-warp']}>
                <h4
                  id={item.templateId}
                  className={classnames(
                    inquiryNewUpdateStyle['rfx-card-item-title-level-two'],
                    index === 0 ? null : inquiryNewUpdateStyle['m-t-lg']
                  )}
                >
                  <div className={inquiryNewUpdateStyle['rfx-card-item-title-line']} />
                  {item.templateName}
                </h4>
                <Table
                  mode="tree"
                  dataSet={tableDsRef.current?.[item.templateId]}
                  columns={getColumns(item.templateId, item)}
                  buttons={getTableButtons({ templateId: item.templateId, item })}
                />
              </Fragment>
            ))}
          </Fragment>
        )}
        {moduleRule === 'NO_DISTINCTION' && (
          <Fragment>
            <h4 className={inquiryNewUpdateStyle['rfx-card-item-title-level-two']}>
              <div className={inquiryNewUpdateStyle['rfx-card-item-title-line']} />
              {headerRef.current?.templateName}
            </h4>
            <Table
              mode="tree"
              dataSet={tableDsRef.current?.[headerRef.current?.templateId]}
              columns={getColumns(headerRef.current?.templateId)}
              buttons={getTableButtons({ templateId: headerRef.current?.templateId })}
            />
          </Fragment>
        )}
      </div>
    </Spin>
  );
}

export default withCustomize({
  unitCode: [
    'SSRC.INQUIRY_HALL_QUOTATION_DETAIL.BASE_FORM',
    'SSRC.BID_HALL_QUATION_DETAIL.BASE_FORM',
    'SSRC.PROJECT_SETUP_QUOTATION_DETAIL.BASE_FORM',
  ],
})(observer(Content));

import { isEmpty, isUndefined } from 'lodash';
import { math } from 'choerodon-ui/dataset';

import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';
// import notification from 'utils/notification';

import { encryptMd5 } from '@/utils/utils';
import { calculationRender } from '@/utils/renderer';
import { SRM_SPC } from '_utils/config';
import { getPriceEditField } from '../util';

const organizationId = getCurrentOrganizationId();

const renderAccuracy = (record, field) => {
  let accuracy; // 精度
  if (record?.getField(field)?.get('step')) {
    accuracy = Math.log10(record.getField(field).get('step')) * -1;
  } else if (record?.getField(field)?.get('step') === 0) {
    accuracy = 0;
  }
  return record.getState('currency_precision') ?? accuracy;
};

const queryFormDS = () => ({
  // 查询表单显示的字段
  fields: [],
});

const listLineDS = (param) => ({
  autoQuery: false,
  primaryKey: 'priceLibId',
  cacheSelection: true,
  // table表单显示的字段
  fields: [],

  events: {
    update: ({ name, value, record, dataSet }) => {
      // 更新值集映射关系
      if (name.includes('LOV') && value) {
        const dimensionCode = name.split('LOV')[0];
        const priceLibDimMapList = record.getField(`${dimensionCode}MapList`).get('defaultValue');
        // 更新值集映射关系
        if (!isEmpty(priceLibDimMapList) && record.get(name)) {
          priceLibDimMapList.forEach((item) => {
            // 存在targetDimensionCode，目标维度编码
            if (item.targetDimensionCode) {
              // lov对象中的字段赋值到targetDimensionCode
              record.set(item.targetDimensionCode, record.get(name)[item.sourceFromFieldName]);
              // 设置meaning
              if (item.sourceFromFieldMeaning) {
                record.set(
                  `${item.targetDimensionCode}Meaning`,
                  record.get(name)[item.sourceFromFieldMeaning]
                );
              }
            }
          });
        }
      } else if (name.includes('LOV') && !value) {
        const dimensionCode = name.split('LOV')[0];
        const priceLibDimMapList = record.getField(`${dimensionCode}MapList`).get('defaultValue');
        if (!isEmpty(priceLibDimMapList)) {
          priceLibDimMapList.forEach((item) => {
            // 存在targetDimensionCode，目标维度编码
            if (item.targetDimensionCode) {
              record.set(item.targetDimensionCode, null);
              // 设置meaning
              if (item.sourceFromFieldMeaning) {
                record.set(`${item.targetDimensionCode}Meaning`, null);
              }
            }
          });
        }
      }

      // 当基准价为含税单价时,输入含税单价时，根据税率实时计算未税单价,若税率为空或没有税率维度，则当作税率为零计算, 未税=含税 /（1+税率）
      // 当基准价为未税单价时,当输入未税单价时，根据税率实时计算含税单价，若税率为空或没有税率维度，则当作税率为零计算, 含税 = 未税 * (1 + 税)
      // 不勾选是否含税标志，默认无税
      const ruleDefinition = dataSet.getState('ruleDefinition');
      const editField = getPriceEditField(record, ruleDefinition, {
        templateCode: param?.templateCode,
      });

      // // 获取fx中维护的规则
      // const fxPrice = dataSet.getState('fxPrice');
      // if (fxPrice) {
      //   const getFxTaxIncludedPrice = dataSet.getState('getFxTaxIncludedPrice');
      //   const getFxNetPrice = dataSet.getState('getFxNetPrice');
      //   if (name === 'taxIncludedPrice' && isFunction(getFxTaxIncludedPrice)) {
      //     editField = !getFxTaxIncludedPrice(record) ? 'TAX_INCLUDED_PRICE' : 'NET_PRICE';
      //   }
      //   if (name === 'netPrice' && isFunction(getFxNetPrice)) {
      //     editField = !getFxNetPrice(record) ? 'NET_PRICE' : 'TAX_INCLUDED_PRICE';
      //   }
      // }

      const taxIncludedPriceEdit = editField === 'TAX_INCLUDED_PRICE';
      const netPriceEdit = editField === 'NET_PRICE';

      if (name === 'taxIncludedPrice') {
        if (taxIncludedPriceEdit) {
          const taxRate = !record.get('taxIncludedFlag')
            ? 0
            : record.get('taxRate')
            ? math.div(record.get('taxRate'), 100)
            : 0;
          record.set(
            'netPrice',
            calculationRender(value, math.plus(1, taxRate), '/', renderAccuracy(record, 'netPrice'))
          );
        }
      } else if (name === 'netPrice') {
        if (netPriceEdit) {
          const taxRate = !record.get('taxIncludedFlag')
            ? 0
            : record.get('taxRate')
            ? math.div(record.get('taxRate'), 100)
            : 0;
          record.set(
            'taxIncludedPrice',
            calculationRender(
              value,
              math.plus(1, taxRate),
              '*',
              renderAccuracy(record, 'taxIncludedPrice')
            )
          );
        }
      } else if (name === 'taxRate') {
        if (taxIncludedPriceEdit) {
          const taxRate = !record.get('taxIncludedFlag') ? 0 : value ? math.div(value, 100) : 0;
          if (record.get('taxIncludedPrice') || record.get('taxIncludedPrice') === 0) {
            record.set(
              'netPrice',
              calculationRender(
                record.get('taxIncludedPrice'),
                math.plus(1, taxRate),
                '/',
                renderAccuracy(record, 'netPrice')
              )
            );
          }
        } else if (netPriceEdit) {
          const taxRate = !record.get('taxIncludedFlag') ? 0 : value ? math.div(value, 100) : 0;
          if (record.get('netPrice') || record.get('netPrice') === 0) {
            record.set(
              'taxIncludedPrice',
              calculationRender(
                record.get('netPrice'),
                math.plus(1, taxRate),
                '*',
                renderAccuracy(record, 'taxIncludedPrice')
              )
            );
          }
        }
      } else if (name === 'taxIncludedFlag') {
        // 修改含税标识，重新计算金额
        if (!value) {
          // 修改是否含税标识为否时清空税率
          record.set('taxIdLOV', undefined);
        } else if (taxIncludedPriceEdit) {
          const taxRate = record.get('taxRate') ? math.div(record.get('taxRate'), 100) : 0;
          if (record.get('taxIncludedPrice') || record.get('taxIncludedPrice') === 0) {
            record.set(
              'netPrice',
              calculationRender(
                record.get('taxIncludedPrice'),
                math.plus(1, taxRate),
                '/',
                renderAccuracy(record, 'netPrice')
              )
            );
          }
        } else if (netPriceEdit) {
          const taxRate = record.get('taxRate') ? math.div(record.get('taxRate'), 100) : 0;
          if (record.get('netPrice') || record.get('netPrice') === 0) {
            record.set(
              'taxIncludedPrice',
              calculationRender(
                record.get('netPrice'),
                math.plus(1, taxRate),
                '*',
                renderAccuracy(record, 'taxIncludedPrice')
              )
            );
          }
        }
      } else if (name === 'taxIncludedFlag' && !value) {
        // 修改是否含税标识为否时清空税率
        record.set('taxIdLOV', undefined);
      } else if (name === 'invOrganizationIdLOV') {
        // 物料配置invOrganizationId为入参是，修改库存组织清空物料。
        if (
          !isUndefined(
            record?.getField('itemIdLOV')?.get('lovPara', dataSet.current)?.invOrganizationId
          )
        ) {
          record.set('itemIdLOV', null);
        }
      }
      if (param?.remote?.event) {
        param.remote.event.fireEvent('handleUpdateListLineDs', {
          param,
          name,
          value,
          record,
          dataSet,
        });
      }
    },

    // submitSuccess: ({ dataSet }) => {
    //   // dataSet.query();
    // },
  },

  transport: {
    read: ({ data }) => {
      const { routerParams = {}, ...otherData } = data;
      const queryParams = {};
      for (const key in otherData) {
        // 日期数字 特殊处理
        if (otherData[key].start || otherData[key].end) {
          Object.assign(queryParams, {
            [key]: {
              from: otherData[key].start,
              to: otherData[key].end,
            },
          });
        } else if (Array.isArray(otherData[key])) {
          // 下拉框 值集 多选处理
          Object.assign(queryParams, { [key]: otherData[key].toString() });
        } else {
          Object.assign(queryParams, { [key]: otherData[key] });
        }
      }
      const newRouteParams = filterNullValueObject(routerParams);
      const newParams = {
        ...queryParams,
        ...newRouteParams,
        from:
          newRouteParams.viewCode && newRouteParams.viewCode !== 'ALL_VIEW' ? 'VIEW_EDIT' : 'EDIT',
      };
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-mains`,
        method: 'GET',
        data: {
          ...newParams,
          sign: encryptMd5({ templateCode: newParams?.templateCode }),
        },
      };
    },
    submit: ({ data }) => {
      const requestData = data.map((item) => {
        const { __id, _status, ...otherItem } = item;
        // Object.keys(otherItem).forEach(key => {
        //   if (Array.isArray(otherItem[key])) {
        //     if (otherItem[key][0] && isObject(otherItem[key][0])) {
        //       let str = JSON.stringify(otherItem[key]);
        //       str = str.slice(1, str.length - 1);
        //       Object.assign(otherItem, { [key]: str });
        //     }
        //     Object.assign(otherItem, { [key]: otherItem[key].toString() });
        //   }
        // });
        return {
          ...otherItem,
          ...param,
        };
      });
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-mains`,
        method: 'POST',
        data: requestData,
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-mains`,
        method: 'DELETE',
        data,
      };
    },
  },
});

const ladderQuotationFormDS = () => ({
  fields: [
    // {
    //   name: 'itemCode',
    //   type: 'string',
    //   label: intl.get('ssrc.priceLibraryNew.model.library.itemCode').d('物料编码'),
    // },
    // {
    //   name: 'itemName',
    //   type: 'string',
    //   label: intl.get('ssrc.priceLibraryNew.model.library.itemName').d('物料名称'),
    // },
    // {
    //   name: 'currencyCodeMeaning',
    //   type: 'string',
    //   label: intl.get('ssrc.priceLibraryNew.model.library.currency').d('币种'),
    // },
    {
      name: 'taxRate',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.taxRate').d('税率'),
    },
  ],
});

const ladderQuotationTableDS = () => ({
  primaryKey: 'priceLibLadderId',
  paging: false,

  // table表单显示的字段
  fields: [
    {
      name: 'ladderLineNum',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.ladderLineNum').d('行号'),
    },
    {
      name: 'ladderFrom',
      type: 'number',
      min: 0,
      label: intl.get('ssrc.priceLibraryNew.model.library.ladderFromRange').d('数量从（>=）'),
      required: true,
    },
    {
      name: 'ladderTo',
      type: 'number',
      min: 0,
      label: intl.get('ssrc.priceLibraryNew.model.library.ladderToRange').d('数量至(<)'),
      dynamicProps: {
        required: ({ record, dataSet }) => record.index < dataSet.length - 1,
      },
    },
    {
      name: 'ladderPrice',
      type: 'number',
      min: 0,
      label: intl.get('ssrc.priceLibraryNew.model.library.taxIncludedPrice').d('单价(含税)'),
      dynamicProps: {
        required: ({ dataSet }) =>
          dataSet.queryParameter.benchmarkPriceType === 'TAX_INCLUDED_PRICE',
      },
    },
    {
      name: 'ladderNetPrice',
      type: 'number',
      min: 0,
      label: intl.get('ssrc.priceLibraryNew.model.library.netPrice').d('单价(不含税)'),
      dynamicProps: {
        required: ({ dataSet }) => dataSet.queryParameter.benchmarkPriceType === 'NET_PRICE',
      },
    },
    {
      name: 'cumulativeFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl.get('ssrc.priceLibraryNew.model.library.cumulative').d('是否累计阶梯'),
    },
    {
      name: 'ladderPriceRemark',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.remark').d('备注'),
    },
  ],

  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-ladders`,
        method: 'GET',
        data: {
          ...data,
          customizeUnitCode: 'SSRC.PRICE_LIBRARY_NEW.LADDER_QUOTATION_EDIT_LIST',
        },
      };
    },
    submit: ({ data, dataSet }) => {
      const {
        queryParameter: { priceLibId },
      } = dataSet;
      const priceLibLadderIdList = data.map((item) => {
        const { __id, _status, ...other } = item;
        return { ...other, priceLibId };
      });
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-ladders`,
        method: 'POST',
        params: {
          customizeUnitCode: 'SSRC.PRICE_LIBRARY_NEW.LADDER_QUOTATION_EDIT_LIST',
        },
        data: priceLibLadderIdList,
      };
    },
    destroy: ({ data }) => {
      // if (data[0].ladderLineNum < data.length) {
      //   notification.warning({
      //     message: intl
      //       .get(`ssrc.inquiryHall.model.inquiryHall.onlySelectedLast`)
      //       .d('只能从最后一行已保存行开始删除!'),
      //   });
      //   return;
      // }
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-ladders`,
        method: 'DELETE',
        params: {
          customizeUnitCode: 'SSRC.PRICE_LIBRARY_NEW.LADDER_QUOTATION_EDIT_LIST',
        },
        data,
      };
    },
  },
  events: {
    // 提交成功会自动查询，此处无需再做重复查询处理
    // submitSuccess: ({ dataSet }) => {
    //   dataSet.query();
    // },
    load: ({ dataSet }) => {
      dataSet.forEach((item) => {
        const record = item;
        if (record?.data) {
          Object.assign(record.data, {
            ladderNetPrice: math.toFixed(
              record.get('ladderNetPrice'),
              dataSet.getState('netPricePrecision')
            ),
            ladderPrice: math.toFixed(
              record.get('ladderPrice'),
              dataSet.getState('taxPricePrecision')
            ),
          });
        }
      });
    },
    update: ({ dataSet, record, name, value }) => {
      // 当基准价为含税单价时,输入含税单价时，根据税率实时计算未税单价,若税率为空或没有税率维度，则当作税率为零计算, 未税=含税 /（1+税率）
      // 当基准价为未税单价时,当输入未税单价时，根据税率实时计算含税单价，若税率为空或没有税率维度，则当作税率为零计算, 含税 = 未税 * (1 + 税)
      const {
        queryParameter: { taxIncludedFlag, benchmarkPriceType, taxRate: paramtaxRate },
      } = dataSet;
      if (name === 'ladderPrice') {
        if (benchmarkPriceType === 'TAX_INCLUDED_PRICE') {
          const taxRate = !taxIncludedFlag ? 0 : paramtaxRate ? paramtaxRate / 100 : 0;
          record.set(
            'ladderNetPrice',
            calculationRender(value, 1 + taxRate, '/', dataSet.getState('netPricePrecision'))
          );
        }
      } else if (name === 'ladderNetPrice') {
        if (benchmarkPriceType === 'NET_PRICE') {
          const taxRate = !taxIncludedFlag ? 0 : paramtaxRate ? paramtaxRate / 100 : 0;
          record.set(
            'ladderPrice',
            calculationRender(value, 1 + taxRate, '*', dataSet.getState('taxPricePrecision'))
          );
        }
      }
    },
  },
});

const scopeTableDS = () => ({
  primaryKey: 'id',
  idField: 'key',
  parentField: 'parentKey',

  fields: [
    {
      name: 'dataName',
    },
    {
      name: 'dataCode',
      label: intl.get('ssrc.priceLibraryNew.model.library.dataCode').d('编码'),
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('hzero.common.enable').d('启用'),
    },
  ],
  // 查询表单字段
  queryFields: [
    {
      name: 'dataCode',
      label: intl.get('ssrc.priceLibraryNew.model.library.dataCode').d('编码'),
    },
    {
      name: 'dataName',
      label: intl.get('ssrc.priceLibraryNew.model.library.dataName').d('名称'),
    },
  ],

  events: {
    submitSuccess: ({ dataSet }) => {
      dataSet.query();
    },
  },

  transport: {
    read: ({ data }) => {
      const { params = {}, ...queryParams } = data;
      const url = `${SRM_SPC}/v1/${organizationId}/price-app-scope-lines`;
      return {
        url,
        method: 'GET',
        data: {
          ...queryParams,
          ...params,
        },
      };
    },
    destroy: ({ data, dataSet }) => {
      const { priceLibId } = dataSet?.queryParameter?.params || {};
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-app-scope-lines`,
        data,
        method: 'DELETE',
        params: {
          priceLibId,
        },
      };
    },
  },
});

const scopeAddTabsDS = () => ({
  autoCreate: true,
  selection: 'single',

  fields: [
    {
      name: 'dimensionCodeLOV',
      type: 'object',
      label: intl.get('ssrc.priceLibraryNew.model.library.appointDimension').d('维度'),
      required: true,
      lovCode: 'SSRC.PRICE_LIB_CHECK_DIM',
      valueField: 'dimensionCode',
      textField: 'dimensionName',
      ignore: 'always',
      dynamicProps: {
        lovPara: ({ dataSet }) => ({
          templateIds: dataSet.queryParameter.templateId,
          shieldDimCodes: dataSet.queryParameter.shieldDimCodes,
          fieldWidgets: 'LOV,SELECT',
        }),
      },
    },
    {
      name: 'dimensionCode',
      bind: 'dimensionCodeLOV.dimensionCode',
    },
    {
      name: 'dimensionName',
      bind: 'dimensionCodeLOV.dimensionName',
    },
  ],
});

const scopeIntroduceModalDS = () => ({
  primaryKey: 'id',
  idField: 'key',
  parentField: 'parentKey',

  fields: [
    {
      name: 'dataName',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.dataName').d('名称'),
    },
    {
      name: 'dataCode',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.dataCode').d('编码'),
    },
  ],

  // 查询表单字段
  queryFields: [
    {
      name: 'dataCode',
      label: intl.get('ssrc.priceLibraryNew.model.library.dataCode').d('编码'),
    },
    {
      name: 'dataName',
      label: intl.get('ssrc.priceLibraryNew.model.library.dataName').d('名称'),
    },
  ],

  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        if (record.data.checkedFlag) {
          Object.assign(record, { selectable: false, isSelected: true });
        }
      });
    },
  },

  transport: {
    read: ({ data }) => {
      const { params = {}, ...queryParams } = data;
      const url = `${SRM_SPC}/v1/${organizationId}/price-app-scope-lines/introduce`;
      return {
        url,
        method: 'GET',
        data: {
          ...queryParams,
          ...params,
        },
      };
    },
  },
});

const scopeIntroduceLovDS = () => ({
  fields: [],

  queryFields: [],

  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        if (record.data.checkedFlag) {
          Object.assign(record, { selectable: false, isSelected: true });
        }
      });
    },
  },

  transport: {
    read: ({ data }) => {
      const { params = {}, ...queryParams } = data;
      const url = `${SRM_SPC}/v1/${organizationId}/price-app-scope-lines/introduce`;
      return {
        url,
        method: 'GET',
        data: {
          ...queryParams,
          ...params,
        },
      };
    },
  },
});

const lineManualDS = (param) => ({
  primaryKey: 'requestId',
  selection: false,
  // table表单显示的字段
  fields: [
    {
      name: 'requestStatus',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.requestStatus').d('状态'),
      lookupCode: 'SSRC.PRICE_LIB_REQUEST_STATUS',
    },
    {
      name: 'requestNum',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.requestNum').d('申请单号'),
    },
    {
      name: 'realName',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.realName').d('申请人'),
    },
    {
      name: 'approveMethod',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.approveMethod').d('审批方式'),
      lookupCode: 'SSRC.PRICE_LIB_APPROVE_METHOD',
    },
    {
      name: 'creationDate',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.creationDate').d('创建日期'),
    },
    {
      name: 'approveDate',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.approveDate').d('审批时间'),
    },
  ],
  // 查询表单字段
  queryFields: [
    {
      name: 'requestNum',
      label: intl.get('ssrc.priceLibraryNew.model.library.requestNum').d('申请单号'),
    },
    {
      name: 'realName',
      label: intl.get('ssrc.priceLibraryNew.model.library.createdBy').d('提交人'),
    },
    {
      name: 'creationDateFrom',
      label: intl.get('ssrc.priceLibraryNew.model.library.applicationDateFrom').d('申请日期从'),
      type: 'dateTime',
    },
    {
      name: 'creationDateTo',
      label: intl.get('ssrc.priceLibraryNew.model.library.applicationDateTo').d('申请日期至'),
      type: 'dateTime',
      min: 'creationDateFrom',
    },
    {
      name: 'requestStatus',
      label: intl.get('ssrc.priceLibraryNew.model.library.status').d('状态'),
      lookupCode: 'SSRC.PRICE_LIB_REQUEST_STATUS',
    },
  ],

  transport: {
    read: ({ data }) => {
      const { routerParams = {}, ...queryParams } = data;
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-reqs`,
        method: 'GET',
        data: {
          ...queryParams,
          ...routerParams,
          ...param,
          customizeUnitCode: 'SSRC.PRICE_LIB_NEW.REQ_QUERY_LIST',
        },
      };
    },
  },
});

const releaseConfirmDs = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'remark',
      type: 'string',
      label: intl
        .get('ssrc.priceLibraryNew.model.library.createUpdatepriceLibrary')
        .d('手动创建/修改价格库原因'),
    },
    {
      name: 'attachmentUuid',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.attachmentUpload').d('附件上传'),
    },
  ],
});

const relevantPriceDS = (params) => ({
  primaryKey: 'priceLibId',
  selection: false,

  // table表单显示的字段
  fields: [],

  queryFields: [],

  transport: {
    read: ({ data }) => {
      const {
        templateCode = null,
        priceLibId = null,
        dimensionId = null,
        viewCode = '',
        ...otherData
      } = data;
      const { requestStatus = null, ...otherParams } = params;
      const queryParams = {};
      for (const key in otherData) {
        // 日期数字 特殊处理
        if (otherData[key].start || otherData[key].end) {
          Object.assign(queryParams, {
            [key]: {
              from: otherData[key].start,
              to: otherData[key].end,
            },
          });
        } else if (Array.isArray(otherData[key])) {
          // 下拉框 值集 多选处理
          Object.assign(queryParams, { [key]: otherData[key].toString() });
        } else {
          Object.assign(queryParams, { [key]: otherData[key] });
        }
      }
      const url =
        viewCode && viewCode !== 'ALL_VIEW'
          ? `${SRM_SPC}/v1/${organizationId}/price-lib-views`
          : `${SRM_SPC}/v1/${organizationId}/price-lib-mains`;
      return {
        url,
        method: 'GET',
        data: {
          templateCode,
          priceLibId,
          dimensionId,
          viewCode,
          ...queryParams,
          from:
            requestStatus === 'APPROVING' || requestStatus === 'APPROVE_SUCCESS'
              ? 'APPROVE_RELEVANT_PRICE'
              : 'RELEVANT_PRICE',
          ...otherParams,
        },
      };
    },
  },
});

const exportTemplateDS = () => ({
  primaryKey: 'priceLibLadderId',
  selection: false,
  autoQuery: false,

  fields: [
    {
      name: 'exportAppScopeMethod',
      label: intl.get('ssrc.priceLibraryNew.model.library.exportAppScopeMethod').d('导出模板'),
      lookupCode: 'SSRC.PRICE_EXPORT_APP_SCOPE_METHOD',
      type: 'string',
      required: true,
    },
  ],

  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { queryParams },
      } = dataSet;
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-user-views/detail`,
        method: 'GET',
        data: queryParams,
      };
    },
  },
});

export {
  queryFormDS,
  listLineDS,
  ladderQuotationFormDS,
  ladderQuotationTableDS,
  scopeTableDS,
  scopeAddTabsDS,
  scopeIntroduceModalDS,
  scopeIntroduceLovDS,
  lineManualDS,
  releaseConfirmDs,
  relevantPriceDS,
  exportTemplateDS,
};

// import moment from 'moment';
import intl from 'utils/intl';
import { SRM_SPRM } from '_utils/config';
import { isFunction } from 'lodash';
import { lovDefineAxiosConfig } from 'srm-front-boot/lib/utils/c7nUiConfig';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

import { fetchCategory } from '@/services/forecastTemplateDefOrgService';

const commonPrompt = 'sprm.forecastMgt.model.common';
const organizationId = getCurrentOrganizationId();

//
const wholeDs = ({ templateHeaderId, cuxUpdate, cuxLoad }) => ({
  pageSize: 20,
  autoQuery: false,
  dataToJSON: 'dirty',
  paging: 'server',
  autoCount: false,
  cacheSelection: true,
  cacheModified: true,
  primaryKey: 'fcstHeaderIdMain',
  parentField: 'fcstHeaderId',
  idField: 'fcstHeaderIdMain',
  queryFields: [],
  fields: [
    {
      name: 'fcstNum',
      label: intl.get(`${commonPrompt}.fcstNum`).d('预测批次号'),
    },
    {
      name: 'lineNum',
      label: intl.get(`${commonPrompt}.lineNum`).d('行号'),
    },
    { name: 'actionLine', label: intl.get(`hzero.common.oprate`).d('操作') },
    {
      name: 'fcstStatus',
      lookupCode: `SPRM.FCST_STATUS`,
      label: intl.get(`${commonPrompt}.fcstSatus`).d('状态'),
    },
    { name: 'fcrtType', label: intl.get(`${commonPrompt}.fcrtType`).d('类型') },
    {
      name: 'createdBy',
      label: intl.get(`${commonPrompt}.createdBy`).d('创建人'),
      lovCode: 'HIAM.USER_REAL_NAME',
      textField: 'realName',
      transformRequest: value => value?.createdBy,
      transformResponse: (value, object) => {
        return object?.createdByName
          ? {
              ...object,
              createdBy: object?.createdBy,
              realName: object?.createdByName,
            }
          : {};
      },
    },
    {
      name: 'supplierLov',
      type: 'object',
      lovCode: 'SPRM.SUPPLIER',
      dynamicProps: {
        lovPara: () => ({ tenantId: organizationId }),
        textField: ({ record }) =>
          record.get('supplierCode') ? 'supplierNum' : 'supplierCompanyNum',
      },
      transformResponse: (value, object) => {
        return object
          ? {
              ...object,
              displaySupplierName: object?.supplierName || object?.supplierCompanyName,
            }
          : {};
      },
      ignore: 'always',
      label: intl.get(`${commonPrompt}.supplierLov`).d('供应商'),
    },
    {
      name: 'supplierCompanyId',
      type: 'string',
      bind: 'supplierLov.supplierCompanyId',
    },
    {
      name: 'supplierId',
      type: 'string',
      bind: 'supplierLov.supplierId',
    },
    {
      name: 'supplierCompanyNum',
      type: 'string',
      label: intl.get(`${commonPrompt}.supplierCompanyNum`).d('供应商编码'),
      bind: 'supplierLov.supplierCompanyNum',
    },
    {
      name: 'supplierCompanyCode',
      type: 'string',
      label: intl.get(`${commonPrompt}.supplierCompanyNum`).d('供应商编码'),
      bind: 'supplierLov.supplierCompanyNum',
    },
    {
      name: 'supplierCode',
      type: 'string',
      bind: 'supplierLov.supplierNum',
    },
    {
      name: 'supplierNum',
      type: 'string',
      bind: 'supplierLov.supplierNum',
    },
    {
      name: 'supplierTenantId',
      type: 'string',
      bind: 'supplierLov.supplierTenantId',
    },
    {
      name: 'displaySupplierName',
      type: 'string',
      bind: 'supplierLov.displaySupplierName',
      label: intl.get(`${commonPrompt}.displaySupplierName`).d('供应商名称'),
    },
    // 存值
    {
      name: 'fcstLineList',
    },
    {
      name: 'itemId',
      type: 'object',
      lovCode: 'SPRM.ITEM_RELATE_PUR_PRICE',
      textField: 'itemCode',
      label: intl.get(`${commonPrompt}.itemId`).d('物料编码'),
      transformRequest: value => value?.itemId,
      transformResponse: (value, object) => {
        return object?.itemId
          ? {
              ...object,
              itemId: object?.itemId,
              itemCode: object?.itemCode,
            }
          : {};
      },
    },
    {
      label: intl.get(`sprm.common.model.common.categoryName`).d('物料分类'),
      name: 'categoryId',
      type: 'object',
      lovCode: 'SPRM.ITEM_CATEGOR_TILED',
      optionsProps: {
        paging: 'server',
      },
      lovDefineAxiosConfig: code => {
        const lovConfig = lovDefineAxiosConfig(code);
        return {
          ...lovConfig,
          transformResponse: [
            ...lovConfig.transformResponse,
            data => {
              return {
                ...data,
                treeFlag: 'Y',
                idField: 'categoryId',
                parentIdField: 'parentCategoryId',
              };
            },
          ],
        };
      },
      transformRequest: value => value?.categoryId,
      transformResponse: (value, object) => {
        return object?.categoryId
          ? {
              ...object,
              categoryId: object?.categoryId,
              categoryName: object?.categoryName,
            }
          : {};
      },
    },
    {
      name: 'itemName',
      label: intl.get(`${commonPrompt}.itemName`).d('物料名称'),
    },
    {
      name: 'itemSpecs',
      label: intl.get(`sprm.common.model.common.itemSpecs`).d('规格'),
    },
    {
      name: 'itemModel',
      label: intl.get(`sprm.common.model.common.itemModel`).d('型号'),
    },
    {
      name: 'uomId',
      label: intl.get(`sprm.common.model.common.uomName`).d('单位'),
      lovCode: 'SMDM.DUAL_UOM_ID',
      type: 'object',
      textField: 'uomName',
      required: true,
      valueField: 'uomId',
      transformRequest: value => value?.uomId,
      transformResponse: (value, object) => {
        return object?.uomId
          ? {
              ...object,
              uomId: object?.uomId,
              uomName: object?.uomName,
              uomCodeAndName: object?.uomCodeAndName,
            }
          : {};
      },
    },
    {
      name: 'companyId',
      label: intl.get(`entity.company.tag`).d('公司'),
      lovCode: 'SPFM.USER_AUTH.COMPANY',
      textField: 'companyName',
      valueField: 'companyId',
      type: 'object',
      required: true,
      lovPara: { tenantId: organizationId, enabledFlag: 1 },
      transformRequest: value => value?.companyId,
      transformResponse: (value, object) => {
        return object?.companyId
          ? {
              ...object,
              companyId: object?.companyId,
            }
          : {};
      },
    },
    {
      name: 'ouId',
      label: intl.get(`entity.business.tag`).d('业务实体'),
      lovCode: 'SPFM.USER_AUTH.OU',
      textField: 'ouName',
      type: 'object',
      required: true,
      dynamicProps: {
        lovPara({ record }) {
          return {
            companyId: record.get('companyId'),
            enabledFlag: 1,
            tenantId: organizationId,
          };
        },
      },
      transformRequest: value => value?.ouId,
      transformResponse: (value, object) => {
        return object?.ouId
          ? {
              ...object,
              ouId: object?.ouId,
            }
          : {};
      },
    },
    {
      name: 'ouId',
      label: intl.get(`entity.business.tag`).d('业务实体'),
      lovCode: 'SPFM.USER_AUTH.OU',
      textField: 'ouName',
      type: 'object',
      required: true,
      dynamicProps: {
        lovPara({ record }) {
          return {
            companyId: record.get('companyId'),
            enabledFlag: 1,
            tenantId: organizationId,
          };
        },
      },
      transformRequest: value => value?.ouId,
      transformResponse: (value, object) => {
        return object?.ouId
          ? {
              ...object,
              ouId: object?.ouId,
            }
          : {};
      },
    },
    {
      name: 'purchaseOrgId',
      required: true,
      label: intl.get(`entity.organization.class.purchase`).d('采购组织'),
      lovCode: 'HPFM.PURCHASE_ORGANIZATION',
      textField: 'organizationName',
      type: 'object',
      dynamicProps: {
        lovPara({ record }) {
          return {
            ouId: record.get('ouId'),
            tenantId: organizationId,
          };
        },
      },
      transformRequest: value => value?.purchaseOrgId,
      transformResponse: (value, object) => {
        return object?.purchaseOrgId
          ? {
              ...object,
              purchaseOrgId: object?.purchaseOrgId,
              organizationName: object?.purchaseOrgName,
            }
          : {};
      },
    },
    {
      name: 'purchaseAgentId',
      required: true,
      label: intl.get(`entity.organization.class.purchaseAgentName`).d('采购员'),
      lovCode: 'SPUC.PURCHASE_AGENT',
      textField: 'purchaseAgentName',
      valueField: 'purchaseAgentId',
      type: 'object',
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            purchaseOrgIds: record.get('purchaseOrgId')?.purchaseOrgId,
            tenantId: organizationId,
          };
        },
      },
      transformRequest: value => value?.purchaseAgentId,
      transformResponse: (value, object) => {
        return object?.purchaseAgentId
          ? {
              ...object,
              purchaseAgentId: object?.purchaseAgentId,
            }
          : {};
      },
    },
    {
      name: 'invOrganizationId',
      label: intl.get(`entity.organization.class.invOrganizationId`).d('收货组织'),
      lovCode: 'SPFM.USER_AUTH.INVORG',
      type: 'object',
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            purchaseOrgIds: record.get('purchaseOrgId')?.purchaseOrgId,
            tenantId: organizationId,
          };
        },
      },
      transformRequest: value => value?.organizationId,
      transformResponse: (value, object) => {
        return object?.invOrganizationId
          ? {
              ...object,
              invOrganizationId: object?.invOrganizationId,
              organizationName: object?.invOrganizationName,
            }
          : {};
      },
    },
    {
      name: 'deliveryPlan',
      type: 'number',
      min: 0,
      label: intl.get(`${commonPrompt}.deliveryPlan`).d('计划交期'),
    },
    {
      name: 'fcstStartDate',
      type: 'date',
      label: intl.get(`${commonPrompt}.fcstStartDate`).d('预测起始日期'),
    },
    {
      name: 'sumQiantity',
      type: 'number',
      label: intl.get(`${commonPrompt}.sumQiantity`).d('预测总量'),
    },
    {
      name: 'sumAmount',
      type: 'number',
      label: intl.get(`${commonPrompt}.sumAmount`).d('预测总额'),
    },
    {
      name: 'currencyCode',
      type: 'object',
      lovCode: 'SPRM.EXCHANGE_RATE.CURRENCY',
      textField: 'currencyCode',
      valueField: 'currenyCode',
      transformRequest: value => value?.currencyCode,
      transformResponse: (value, object) => {
        return object?.currencyCode
          ? {
              ...object,
              currencyCode: object?.currencyCode,
            }
          : null;
      },
      label: intl.get('sprm.common.model.common.currency').d('币种'),
    },
    {
      name: 'taxId',
      type: 'object',
      lovCode: 'SPRM.TAX',
      textField: 'taxCode',
      label: intl.get(`sprm.common.model.common.taxType`).d('税种'),
      transformRequest: value => value?.taxId,
      transformResponse: (value, object) => {
        return object?.taxId
          ? {
              ...object,
              taxRate: object?.taxRate,
              taxCode: object?.taxCode,
              includedTaxFlag: object?.includedTaxFlag,
            }
          : null;
      },
    },
    {
      name: 'taxCode',
      bind: 'taxId.taxCode',
    },
    {
      name: 'includedTaxFlag',
      bind: 'taxId.includedTaxFlag',
    },
    {
      name: 'taxRate',
      type: 'number',
      label: intl.get(`${commonPrompt}.taxRate`).d('税率'),
      bind: 'taxId.taxRate',
    },
  ],
  queryParameter: { asyncCountFlag: 'Y' },
  transport: {
    read: ({ data, dataSet }) => {
      const { currentTab, lines, fcrtType, ...others } = data;
      const { predictionDimensionCnf, needFeedback } = dataSet?.getState('templateHeaderObj') || {};
      let url = `${SRM_SPRM}/v1/${organizationId}/fcst-headers/list/all`;
      if (currentTab === 'released') {
        url = `${SRM_SPRM}/v1/${organizationId}/fcst-headers/list/await-feedback`;
      } else if (currentTab === 'feedBack') {
        url = `${SRM_SPRM}/v1/${organizationId}/fcst-headers/list/has_feedback`;
      } else {
        url = `${SRM_SPRM}/v1/${organizationId}/fcst-headers/list/all`;
      }
      if (needFeedback === 0) {
        url = `${SRM_SPRM}/v1/${organizationId}/fcst-headers/list/all`;
      }
      if (!data.fcstStartDate) {
        return;
      }
      return {
        url,
        method: 'GET',
        data: filterNullValueObject({
          ...others,
          tempKey: undefined,
          supplierQueryParamStr: others.tempKey,
          fcstFeedBackWorkbench: 1,
          customizeUnitCode: 'SPRM.FORECAST_SUPPLIER_WORKBENCH.SEARCHBAR',
        }),
        transformResponse: value => {
          const newRes = [];
          const queryLines = fcrtType
            ? lines.filter(ele => fcrtType.split(',').includes(ele.value))
            : lines;
          const { content: result = [], ...pages } = value ? JSON.parse(value) : {};
          result.forEach(item => {
            const resultTableData = {}; // 获取动态week,day,year的值
            const fcstQuantityList = {};
            // fcstLineList 所有的高阶维度字段值设置
            const { fcstStatus, fcstLineSumMap = {}, fcstLineList = [], fcstHeaderId } = item;
            const aggregationStatusList = [
              'RELEASED',
              'FEEDBACK',
              'CHANGED',
              'CLOSED',
              'FEEDBACK_REJECTED',
              'FEEDBACK_IN_APPROVAL',
              'FEEDBACK_PEND_APPROVAL',
            ];
            if (aggregationStatusList.includes(fcstStatus) && needFeedback) {
              const othersLine = queryLines
                .filter(
                  ele =>
                    ![
                      'fcstAmountIncTax',
                      'feedbackAmountIncTax',
                      'fcstAmountExcTax',
                      'feedbackAmountExcTax',
                    ].includes(ele.value)
                )
                .map(lineKey => {
                  const { value: ele, meaning, description } = lineKey;
                  fcstLineList.forEach(i => {
                    const { fcstDate } = i;
                    resultTableData[fcstDate] = i[ele];
                    fcstQuantityList[`${fcstDate}-fcstQuantity`] = i.fcstQuantity;
                  });
                  return {
                    ...item,
                    fcstHeaderIdMain:
                      ele === queryLines[0].value ? fcstHeaderId : `${fcstHeaderId}_${ele}`,
                    fcstHeaderId: ele === queryLines[0].value ? undefined : fcstHeaderId,
                    fcrtType: ele,
                    fcrtTypeMeaning: meaning,
                    forecastCategoryType: description,
                    ...resultTableData,
                    ...fcstQuantityList,
                    sumQiantity: fcstLineSumMap.sum ? fcstLineSumMap.sum[ele] : null,
                    sumAmount: fcstLineSumMap.sum ? fcstLineSumMap.sum[ele] : null,
                    sumByDay: fcstLineSumMap.sumByDay ? fcstLineSumMap.sumByDay[ele] : null,
                    sumByMonth: fcstLineSumMap.sumByMonth ? fcstLineSumMap.sumByMonth[ele] : null,
                    sumByWeek: fcstLineSumMap.sumByWeek ? fcstLineSumMap.sumByWeek[ele] : null,
                    sumByYear: fcstLineSumMap.sumByYear ? fcstLineSumMap.sumByYear[ele] : null,
                    fcstLineList: [queryLines[0]?.value, queryLines[1]?.value].includes(ele)
                      ? fcstLineList
                      : [],
                    fcstLineSumMap: ele === queryLines[0].value ? fcstLineSumMap : {},
                  };
                });
              newRes.push(...othersLine);
            } else {
              fcstLineList.forEach(ele => {
                const { fcstDate, fcstQuantity } = ele;
                resultTableData[fcstDate] = fcstQuantity;
              });
              newRes.push({
                ...item,
                fcstHeaderIdMain: fcstHeaderId,
                fcstHeaderId: undefined,
                fcrtType: 'feedbackQuantity',
                fcrtTypeMeaning:
                  lines.find(ele => ele.value === 'feedbackQuantity')?.meaning ||
                  (predictionDimensionCnf === 'QUANTITY'
                    ? '供应商确认'
                    : predictionDimensionCnf === 'AMOUNT_INCLUDING_TAX'
                    ? '反馈金额（含税）'
                    : '反馈金额（不含税）'),
                ...resultTableData,
                sumQiantity: fcstLineSumMap.sum.feedbackQuantity,
                sumAmount: fcstLineSumMap.sum.feedbackQuantity,
                sumByDay: fcstLineSumMap.sumByDay?.feedbackQuantity,
                sumByMonth: fcstLineSumMap.sumByMonth?.feedbackQuantity,
                sumByWeek: fcstLineSumMap.sumByWeek?.feedbackQuantity,
                sumByYear: fcstLineSumMap.sumByYear?.feedbackQuantity,
                // fcstLineList: [],
                // fcstLineSumMap: {},
              });
            }
          });
          return { content: newRes, ...pages };
        },
      };
    },
  },
  events: {
    update: ({ name, record, value }) => {
      if (name === 'itemCodeLov') {
        if (value) {
          const {
            itemName,
            itemId,
            uomCode,
            uomId,
            uomName,
            taxId,
            taxCode,
            taxRate,
            model,
            specifications,
          } = value;
          record.set({
            itemName,
            taxCode,
            taxRate,
            itemModel: model,
            itemSpecs: specifications,
            taxId: {
              taxId,
              taxCode,
              taxRate,
            },
            uomId: {
              uomCode,
              uomId,
              uomName,
              uomCodeAndName: uomName,
            },
          });
          if (itemId) {
            fetchCategory({ itemId, enabledFlag: 1, defaultFlag: 1 }).then(res => {
              if (res && res.length === 1) {
                const [{ categoryId, categoryCode, categoryName }] = res;
                record.set({
                  categoryId: { categoryId, categoryCode, categoryName },
                });
              }
            });
          }
        } else {
          record.set({ itemModel: null, itemSpecs: null });
        }
      }
      if (isFunction(cuxUpdate)) {
        cuxUpdate({ name, record, value });
      }
    },
    load: ({ dataSet }) => {
      dataSet.forEach(ele => {
        if (ele.get('fcrtType') !== 'feedbackQuantity') {
          // eslint-disable-next-line no-param-reassign
          ele.selectable = false;
        }
        if (isFunction(cuxLoad)) {
          cuxLoad(ele);
        }
      });
    },
    query: () => {
      return !!templateHeaderId;
    },
  },
});

const initQueryDate = ({ templateHeaderId }) => ({
  paging: false,
  selection: false,
  autoQuery: false,
  autoCreate: true,
  fields: [
    {
      name: 'queryDate',
      label: intl.get(`${commonPrompt}.queryDate`).d('预测时间'),
      lovCode: 'SPRM.FCST_START_DATE',
      type: 'object',
      required: true,
      valueField: 'fcstStartDate',
      textField: 'fcstStartDateString',
      lovPara: { templateHeaderId },
    },
  ],
});

const importDs = () => ({
  paging: true,
  selection: false,
  autoQuery: false,
  fields: [
    {
      name: '_dataStatus',
      label: intl.get('ssrc.priceLibBatchCreate.model.create.dataStatus').d('数据状态'),
      lookupCode: 'HIMP.DATA_STATUS',
    },
    {
      name: '_info',
      label: intl.get('ssrc.priceLibBatchCreate.model.create.message').d('错误信息'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params, ...otherData } = data;
      if (params?.batch) {
        return {
          url: `${SRM_SPRM}/v1/${organizationId}/import/data`,
          method: 'GET',
          data: {
            ...params,
            ...otherData,
          },
          transformResponse: res => {
            const dealData = JSON.parse(res);
            const { content = [] } = dealData;
            const result = content?.map(item => {
              const { _data = '{}', ...reset } = item;
              const newData = JSON.parse(_data);
              return { ...newData, ...reset };
            });
            return { ...dealData, content: result };
          },
        };
      } else {
        return false;
      }
    },
  },
});

const operateRecordDs = () => ({
  paging: false,
  selection: false,
  autoQuery: false,
  fields: [
    {
      name: 'processTypeCode',
      lookupCode: `SPRM.FCST_STATUS`,
      label: intl.get(`hzero.common.oprate`).d('操作'),
    },
    {
      name: 'processUserName',
      label: intl.get(`${commonPrompt}.processUserName`).d('操作人'),
    },
    {
      name: 'version',
      label: intl.get(`${commonPrompt}.version`).d('版本'),
    },
    {
      name: 'fcstStatus',
      lookupCode: `SPRM.FCST_STATUS`,
      label: intl.get(`${commonPrompt}.fcstSatus`).d('状态'),
    },
    {
      name: 'processDate',
      type: 'dateTime',
      label: intl.get(`${commonPrompt}.processDate`).d('创建时间'),
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/fcst-actions`,
        method: 'GET',
        data: { ...data, processTypeCode: 'RELEASE' },
      };
    },
  },
});

const searchDS = () => ({
  paging: false,
  selection: false,
  autoQuery: false,
  autoCreate: true,
  fields: [
    {
      name: 'status',
      label: intl.get('ssrc.priceLibBatchCreate.model.create.dataStatus').d('数据状态'),
      lookupCode: 'SPRM.FCST_IMPORT_STATUS',
    },
  ],
});

const historyVersionDs = () => ({
  paging: false,
  selection: false,
  autoQuery: false,
  fields: [
    {
      name: 'version',
      label: intl.get(`hzero.common.components.dataAudit.version`).d('版本'),
    },
    {
      name: 'itemCode',
      label: intl.get(`sprm.common.model.common.itemCode`).d('物料编码'),
    },
    {
      name: 'fcstStatus',
      lookupCode: `SPRM.FCST_STATUS`,
      label: intl.get(`${commonPrompt}.fcstSatus`).d('状态'),
    },
    {
      name: 'fcstNum',
      label: intl.get(`${commonPrompt}.fcstNum`).d('预测批次号'),
    },
    {
      name: 'lineNum',
      label: intl.get(`${commonPrompt}.lineNum`).d('行号'),
    },
    { name: 'fcrtType', label: intl.get(`hzero.common.model.common.entryCategory`).d('类别') },
    {
      name: 'sumQiantity',
      type: 'number',
      label: intl.get(`${commonPrompt}.sumQiantity`).d('预测总量'),
    },
    {
      name: 'sumAmount',
      type: 'number',
      label: intl.get(`${commonPrompt}.sumAmount`).d('预测总额'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/fcst-header-vers/list`,
        method: 'GET',
      };
    },
  },
});
export { wholeDs, operateRecordDs, historyVersionDs, importDs, initQueryDate, searchDS };

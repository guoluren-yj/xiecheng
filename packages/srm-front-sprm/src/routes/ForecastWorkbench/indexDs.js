// import moment from 'moment';
import intl from 'utils/intl';
import { SRM_SPRM } from '_utils/config';
import { lovDefineAxiosConfig } from 'srm-front-boot/lib/utils/c7nUiConfig';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

import {
  fetchCategory,
  fetchAutoGetCompany,
  fetchAutoGetPurchasing,
} from '@/services/forecastTemplateDefOrgService';

const commonPrompt = 'sprm.forecastMgt.model.common';
const organizationId = getCurrentOrganizationId();

//
const wholeDs = () => ({
  pageSize: 20,
  dataToJSON: 'dirty',
  paging: 'server',
  autoQuery: false,
  cacheModified: true,
  cacheSelection: true,
  primaryKey: 'fcstHeaderIdMain',
  parentField: 'fcstHeaderId',
  idField: 'fcstHeaderIdMain',
  fields: [
    {
      name: 'fcstNum',
      label: intl.get(`${commonPrompt}.fcstNum`).d('预测批次号'),
    },
    {
      name: 'lineNum',
      label: intl.get(`${commonPrompt}.lineNum`).d('行号'),
    },
    {
      name: 'fcstStatus',
      lookupCode: `SPRM.FCST_STATUS`,
      label: intl.get(`${commonPrompt}.fcstSatus`).d('状态'),
    },
    {
      name: 'supplierLov',
      type: 'object',
      ignore: 'always',
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
      label: intl.get(`${commonPrompt}.supplierLov`).d('供应商'),
    },
    {
      name: 'supplierCompanyId',
      bind: 'supplierLov.supplierCompanyId',
    },
    {
      name: 'supplierId',
      bind: 'supplierLov.supplierId',
    },
    {
      name: 'supplierCompanyCode',
      type: 'string',
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
      name: 'supplierCompanyNum',
      type: 'string',
      bind: 'supplierLov.supplierCompanyNum',
    },
    {
      name: 'supplierTenantId',
      type: 'string',
      bind: 'supplierLov.supplierTenantId',
    },
    {
      name: 'displaySupplierName',
      label: intl.get(`${commonPrompt}.displaySupplierName`).d('供应商名称'),
      type: 'string',
      bind: 'supplierLov.displaySupplierName',
    },
    {
      name: 'supplierName',
      label: intl.get(`${commonPrompt}.displaySupplierName`).d('供应商名称'),
      type: 'string',
      bind: 'supplierLov.supplierName',
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      bind: 'supplierLov.supplierCompanyName',
    },
    {
      name: 'createdBy',
      label: intl.get(`${commonPrompt}.createdBy`).d('创建人'),
      lovCode: 'HIAM.USER_REAL_NAME',
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
    // 存值
    {
      name: 'fcstLineList',
    },
    { name: 'actionLine', label: intl.get(`hzero.common.oprate`).d('操作') },
    {
      name: 'itemId',
      type: 'object',
      lovCode: 'SPRM.ITEM_RELATE_PUR_PRICE',
      label: intl.get(`${commonPrompt}.itemId`).d('物料编码'),
      transformRequest: value => value?.itemId,
      textField: 'itemCode',
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
    { name: 'itemName', label: intl.get(`${commonPrompt}.itemName`).d('物料名称') },
    {
      label: intl.get(`sprm.common.model.common.categoryName`).d('物料分类'),
      name: 'categoryId',
      type: 'object',
      // lovCode: 'SPRM.ITEM_CATEGOR_TILED',
      lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
      optionsProps: {
        paging: 'server',
      },
      dynamicProps: {
        lovPara({ record }) {
          return {
            itemId: record.get('itemId')?.itemId,
            businessObjectCode: 'SRM_C_SPRM_FCST',
          };
        },
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
      name: 'uomId',
      label: intl.get(`sprm.common.model.common.uomName`).d('单位'),
      lovCode: 'SMDM.DUAL_UOM_ID',
      type: 'object',
      textField: 'uomCodeAndName',
      valueField: 'uomId',
      transformRequest: value => value?.uomId,
      transformResponse: (value, object) => {
        return object?.itemId
          ? {
              ...object,
              uomId: object?.uomId,
              uomName: object?.uomName,
              uomCodeAndName: object?.uomName,
            }
          : {};
      },
    },
    {
      name: 'companyId',
      label: intl.get(`entity.company.tag`).d('公司'),
      lovCode: 'SPFM.USER_AUTH.COMPANY',
      type: 'object',
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
      dynamicProps: {
        lovPara({ record }) {
          return {
            companyId: record.get('companyId')?.companyId,
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

      label: intl.get(`entity.organization.class.purchase`).d('采购组织'),
      lovCode: 'HPFM.PURCHASE_ORGANIZATION',
      textField: 'organizationName',
      type: 'object',
      dynamicProps: {
        lovPara({ record }) {
          return {
            ouId: record.get('ouId')?.ouId,
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
      name: 'fcrtType',
      label: intl.get(`hzero.common.model.common.entryCategory`).d('类别'),
      lookupCode: 'SPRM.FCST_CATEGORY',
    },
    {
      name: 'forecastCategoryType',
      label: intl.get(`hzero.common.model.common.forecastCategoryType`).d('类别类型'),
    }, // 用于新增值集里面的类别字段的类型
    {
      name: 'purchaseAgentId',
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
            ouId: record.get('ouId')?.ouId,
            tenantId: organizationId,
          };
        },
      },
      transformRequest: value => value?.organizationId,
      transformResponse: (value, object) => {
        return object?.invOrganizationId
          ? {
              ...object,
              organizationId: object?.invOrganizationId,
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
      name: 'actionLine',
      label: intl.get(`${commonPrompt}.action`).d('操作记录'),
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
  ],
  transport: {
    read: ({ data, dataSet }) => {
      const { currentTab, tabNeedFeedback, fcrtType, fcrtStatus, ...others } = data;
      const lines = dataSet.getState('lines');
      let url = `${SRM_SPRM}/v1/${organizationId}/fcst-headers/list/await-release`;
      if (currentTab === 'awaitRelease') {
        url = `${SRM_SPRM}/v1/${organizationId}/fcst-headers/list/await-release`;
      } else if (currentTab === 'awaitFeedback') {
        url = `${SRM_SPRM}/v1/${organizationId}/fcst-headers/list/await-feedback`;
      } else if (currentTab === 'hasFeedback') {
        url = `${SRM_SPRM}/v1/${organizationId}/fcst-headers/list/has_feedback`;
      } else {
        url = `${SRM_SPRM}/v1/${organizationId}/fcst-headers/list/all`;
      }

      return {
        url,
        method: 'GET',
        data: filterNullValueObject({
          fcrtType,
          ...others,
          tempKey: undefined,
          supplierQueryParamStr: others.tempKey,
          customizeUnitCode: 'SPRM.FORECAST_WORKBENCH.SEARCHBAR',
        }),
        transformResponse: value => {
          const newRes = [];
          const queryLines = fcrtType
            ? lines.filter(ele => fcrtType.split(',').includes(ele.value))
            : lines;
          const { content: result = [], ...pages } = value ? JSON.parse(value) : {};
          if (result) {
            result.forEach(item => {
              const resultTableData = {}; // 获取动态week,day,year的值
              // fcstLineList 所有的高阶维度字段值设置
              const { fcstStatus, fcstLineSumMap = {}, fcstLineList = [], fcstHeaderId } = item;
              if (
                ([
                  'FEEDBACK',
                  'CLOSED',
                  'RELEASED',
                  'FEEDBACK_REJECTED',
                  'FEEDBACK_IN_APPROVAL',
                  'FEEDBACK_PEND_APPROVAL',
                ].includes(fcstStatus) ||
                  (fcstStatus === 'CHANGED' && currentTab === 'all')) &&
                tabNeedFeedback
              ) {
                const othersLine = queryLines.map(lineKey => {
                  const { value: ele, meaning, description } = lineKey;
                  fcstLineList.forEach(i => {
                    const { fcstDate } = i;
                    resultTableData[fcstDate] = i[ele];
                  });
                  return {
                    ...item,
                    fcstHeaderIdMain:
                      ele === queryLines[0].value ? fcstHeaderId : `${fcstHeaderId}_${ele}`,
                    fcstHeaderId: ele === queryLines[0].value ? undefined : fcstHeaderId,
                    fcrtType: ele,
                    forecastCategoryType: description,
                    fcrtTypeMeaning: meaning,
                    ...resultTableData,
                    currentTab,
                    sumQiantity: fcstLineSumMap.sum ? fcstLineSumMap.sum[ele] : null,
                    sumAmount: fcstLineSumMap.sum ? fcstLineSumMap.sum[ele] : null,
                    sumByDay: fcstLineSumMap.sumByDay ? fcstLineSumMap.sumByDay[ele] : null,
                    sumByMonth: fcstLineSumMap.sumByMonth ? fcstLineSumMap.sumByMonth[ele] : null,
                    sumByWeek: fcstLineSumMap.sumByWeek ? fcstLineSumMap.sumByWeek[ele] : null,
                    sumByYear: fcstLineSumMap.sumByYear ? fcstLineSumMap.sumByYear[ele] : null,
                    fcstLineList: ele === queryLines[0].value ? fcstLineList : [],
                    fcstLineSumMap: ele === queryLines[0].value ? fcstLineSumMap : {},
                  };
                });
                newRes.push(...othersLine);
              } else {
                fcstLineList.forEach(ele => {
                  const { fcstDate, fcstQuantity } = ele;
                  resultTableData[fcstDate] = fcstQuantity;
                });
                if (!fcrtType || fcrtType.includes('fcstQuantity')) {
                  newRes.push({
                    ...item,
                    fcstHeaderIdMain: fcstHeaderId,
                    fcstHeaderId: undefined,
                    fcrtType: 'fcstQuantity',
                    fcrtTypeMeaning: '预测数量',
                    ...resultTableData,
                    sumQiantity: fcstLineSumMap.sum.fcstQuantity,
                    sumAmount: fcstLineSumMap.sum.fcstQuantity,
                    sumByDay: fcstLineSumMap.sumByDay?.fcstQuantity,
                    sumByMonth: fcstLineSumMap.sumByMonth?.fcstQuantity,
                    sumByWeek: fcstLineSumMap.sumByWeek?.fcstQuantity,
                    sumByYear: fcstLineSumMap.sumByYear?.fcstQuantity,
                  });
                }
              }
            });
          }
          return { content: newRes, ...pages };
        },
      };
    },
  },
  events: {
    update: ({ name, record, value }) => {
      if (name === 'itemId') {
        if (value) {
          const { itemName, itemId, uomCode, uomId, uomName, taxId, taxCode, taxRate } = value;
          record.set({
            itemName,
            taxCode,
            taxRate,
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
        }
      }
      if (name === 'companyId') {
        if (value) {
          fetchAutoGetCompany({ companyId: value?.companyId }).then(res => {
            if (res) {
              const { ouId, ouCode, ouName, purchaseOrgId, purchaseOrgName } = res;
              record.set({
                purchaseOrgId: purchaseOrgId
                  ? {
                      purchaseOrgId,
                      purchaseOrgName,
                      organizationName: purchaseOrgName,
                    }
                  : null,
                ouId: ouId ? { ouId, ouCode, ouName } : null,
              });
            }
          });
        } else {
          record.set({
            ouId: null,
          });
        }
      }

      if (name === 'ouId') {
        if (value) {
          fetchAutoGetCompany({
            companyId: record.get('companyId')?.companyId,
            ouId: value?.ouId,
          }).then(res => {
            if (res) {
              const {
                purchaseOrgId,
                purchaseOrgName,
                // organizationId: resOrganizationId,
                // organizationName,
              } = res;
              record.set({
                purchaseOrgId: purchaseOrgId
                  ? {
                      purchaseOrgId,
                      purchaseOrgName,
                      organizationName: purchaseOrgName,
                    }
                  : null,
              });
            }
          });
        } else {
          record.set({
            purchaseOrgId: null,
          });
        }
      }

      if (name === 'purchaseOrgId' && value) {
        fetchAutoGetPurchasing({ purchaseOrgId: value?.purchaseOrgId }).then(res => {
          if (res) {
            const { purchaseAgentId, purchaseAgentCode, purchaseAgentName } = res;
            record.set({
              purchaseAgentId: purchaseAgentId
                ? {
                    purchaseAgentId,
                    purchaseAgentCode,
                    purchaseAgentName,
                  }
                : null,
            });
          }
        });
      }
    },
    load: ({ dataSet }) => {
      dataSet.forEach(ele => {
        if (ele.get('fcrtType') !== 'fcstQuantity') {
          // eslint-disable-next-line no-param-reassign
          ele.selectable = false;
        }
      });
    },
  },
});

const operateRecordDs = () => ({
  // pageSize: 20,
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
      name: 'processDate',
      label: intl.get(`${commonPrompt}.processDate`).d('创建时间'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/fcst-actions`,
        method: 'GET',
      };
    },
  },
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
            const result = content.map(item => {
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
    { name: 'fcrtType', label: intl.get(`hzero.common.model.common.entryCategory`).d('类别') },
    {
      name: 'forecastCategoryType',
      label: intl.get(`hzero.common.model.common.forecastCategoryType`).d('类别类型'),
    }, // 用于新增值集里面的类别字段的类型
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
      name: 'fcstNum',
      label: intl.get(`${commonPrompt}.fcstNum`).d('预测批次号'),
    },
    {
      name: 'lineNum',
      label: intl.get(`${commonPrompt}.lineNum`).d('行号'),
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

export { wholeDs, operateRecordDs, historyVersionDs, importDs, searchDS };

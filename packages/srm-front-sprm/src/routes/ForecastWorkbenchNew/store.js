// import moment from 'moment';
import intl from 'utils/intl';
import { SRM_SPRM } from '_utils/config';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { lovDefineAxiosConfig } from 'srm-front-boot/lib/utils/c7nUiConfig';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { isFunction } from 'lodash';

import {
  fetchCategory,
  fetchAutoGetCompany,
  fetchAutoGetPurchasing,
} from '@/services/forecastTemplateDefOrgService';
import { notification } from 'choerodon-ui';

const commonPrompt = 'sprm.forecastMgt.model.common';
const organizationId = getCurrentOrganizationId();

//
const wholeDs = ({ currentTab, templateHeaderId, dsFields, cuxWholeDsUpdate }) => {
  const fields = [
    {
      name: 'fcstNum',
      label: intl.get(`${commonPrompt}.fcstNum`).d('预测批次号'),
    },
    {
      name: 'viewVersion',
      lookupCode: 'SPRM.FCST_VERSION_DIMENSION',
      label: intl.get(`${commonPrompt}.viewVersion`).d('版本'),
    },
    {
      name: 'releaseStatus',
      lookupCode: 'SPRM.FCST_RELEASE_STATUS',
      label: intl.get(`${commonPrompt}.releaseStatus`).d('发布状态'),
    },
    {
      name: 'lineNum',
      type: 'number',
      label: intl.get(`${commonPrompt}.lineNum`).d('行号'),
    },
    {
      name: 'fcstStatus',
      lookupCode: `SPRM.FCST_STATUS`,
      label: intl.get(`${commonPrompt}.fcstSatus`).d('状态'),
    },
    {
      name: 'viewVersion',
      label: intl.get(`${commonPrompt}.viewVersion`).d('版本'),
    },
    {
      name: 'supplierLov',
      type: 'object',
      ignore: 'always',
      lovCode: 'SPRM.SUPPLIER',
      lovPara: { tenantId: organizationId },
      dynamicProps: {
        textField: ({ record }) =>
          record.get('supplierCode') ? 'supplierNum' : 'supplierCompanyNum',
      },
      transformResponse: (value, object) => {
        return object
          ? {
              ...object,
              displaySupplierName: object?.supplierName || object?.supplierCompanyName,
            }
          : null;
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
      textField: 'realName',
      transformRequest: value => value?.createdBy,
      transformResponse: (value, object) => {
        return object?.createdByName
          ? {
              ...object,
              createdBy: object?.createdBy,
              realName: object?.createdByName,
            }
          : null;
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
          : null;
      },
    },
    { name: 'itemName', label: intl.get(`${commonPrompt}.itemName`).d('物料名称') },
    {
      label: intl.get(`sprm.common.model.common.categoryName`).d('物料分类'),
      name: 'categoryId',
      type: 'object',
      lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
      optionsProps: {
        paging: 'server',
        record: {
          dynamicProps: {
            selectable: record => record.get('isCheck') !== false,
          },
        },
      },
      dynamicProps: {
        lovPara: ({ record, dataSet, name }) => {
          const dynamic = dataSet.getState(name) || [];
          const dynamicLovPara = {};
          dynamic.forEach(item => {
            const { lovParamName, lovValueCode } = item;
            dynamicLovPara[lovParamName] = record.get(lovValueCode)
              ? record.get(lovValueCode)[lovValueCode]
              : record.get(lovValueCode);
          });
          return {
            itemId: record.get('itemId')?.itemId,
            businessObjectCode: 'SRM_C_SPRM_FCST',
            ...dynamicLovPara,
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
          : null;
      },
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
      textField: 'uomCodeAndName',
      valueField: 'uomId',
      transformRequest: value => value?.uomId,
      transformResponse: (value, object) => {
        return object?.uomId
          ? {
              ...object,
              uomId: object?.uomId,
              uomName: object?.uomName,
              uomCodeAndName: object?.uomName,
            }
          : null;
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
          : null;
      },
    },
    {
      name: 'ouId',
      label: intl.get(`entity.business.tag`).d('业务实体'),
      lovCode: 'SPFM.USER_AUTH.OU',
      textField: 'ouName',
      type: 'object',
      dynamicProps: {
        lovPara: ({ record }) => {
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
          : null;
      },
    },
    {
      name: 'purchaseOrgId',

      label: intl.get(`entity.organization.class.purchase`).d('采购组织'),
      lovCode: 'HPFM.PURCHASE_ORGANIZATION',
      textField: 'organizationName',
      type: 'object',
      dynamicProps: {
        lovPara: ({ record }) => {
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
          : null;
      },
    },
    {
      name: 'fcrtType',
      label: intl.get(`hzero.common.model.common.entryCategory`).d('类别'),
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
          : null;
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
          : null;
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
      max: 'fcstDateRangeEnd',
      min: 'fcstDateRangeStart',
      transformRequest: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
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
    {
      name: 'fcstDateRangeEnd',
      label: intl.get(`${commonPrompt}.fcstDateRangeEnd`).d('预测时间至'),
    },
    {
      name: 'fcstDateRangeStart',
      label: intl.get(`${commonPrompt}.fcstDateRangeStart`).d('预测时间从'),
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
  ];
  const fieldNames = fields.map(ele => ele.name) || [];

  dsFields.forEach(item => {
    if (fieldNames.includes(item.name)) {
      const field = fields.find(ele => ele.name === item.name);
      field.required = item.required || field.required;
      field.lovCode = item.lovCode || field.lovCode;
      field.label = item.fieldName || field.label;
    } else {
      fields.push(item);
    }
  });

  return {
    pageSize: 20,
    dataToJSON: 'dirty',
    paging: 'server',
    autoQuery: false,
    cacheModified: true,
    cacheSelection: true,
    primaryKey: currentTab === 'version' ? 'idMain' : 'fcstHeaderIdMain',
    parentField: currentTab === 'version' ? 'id' : 'fcstHeaderId',
    idField: currentTab === 'version' ? 'idMain' : 'fcstHeaderIdMain',
    fields,
    queryFields: [],
    transport: {
      read: ({ data, dataSet }) => {
        const initParams = dataSet.getState('initParams') || {};
        const tempKey = dataSet.getState('tempKey') || {};
        const {
          needFeedback,
          predictionDimensionCnf,
          baseLine = 'fcstQuantity',
          showLines: lines,
        } = initParams;
        const { fcrtType, fcrtStatus, ...others } = data;
        if (!currentTab) {
          return false;
        } else {
          // console.log(currentTab);
          let url = `${SRM_SPRM}/v1/${organizationId}/fcst-headers/list/await-release`;
          if (currentTab === 'awaitRelease') {
            url = `${SRM_SPRM}/v1/${organizationId}/fcst-headers/list/await-release`;
          } else if (currentTab === 'awaitFeedback') {
            url = `${SRM_SPRM}/v1/${organizationId}/fcst-headers/list/await-feedback`;
          } else if (currentTab === 'hasFeedback') {
            url = `${SRM_SPRM}/v1/${organizationId}/fcst-headers/list/has_feedback`;
          } else if (currentTab === 'awaitApprove') {
            url = `${SRM_SPRM}/v1/${organizationId}/fcst-headers/list/await_approval_feedback`;
          } else if (currentTab === 'version') {
            const startTime = new Date(others?.fcstDateRangeStart);
            const endTime = new Date(others?.fcstDateRangeEnd);
            const gapDates =
              (endTime.getYear() - startTime.getYear()) * 12 +
              endTime.getMonth() -
              startTime.getMonth() +
              (endTime.getDate() > startTime.getDate() ? 1 : 0);
            if (gapDates > 1) {
              notification.error({
                message: intl.get(`${commonPrompt}.gapDate`).d('预测时间不能超过1个月'),
              });
              return false;
            }
            url = `${SRM_SPRM}/v1/${organizationId}/fcst-headers/list/version-view`;
          } else {
            url = `${SRM_SPRM}/v1/${organizationId}/fcst-headers/list/all`;
          }
          return {
            url,
            method: 'GET',
            data: filterNullValueObject({
              fcrtType,
              ...others,
              ...tempKey,
              tempKey: undefined,
              supplierQueryParamStr: data.tempKey,
              customizeUnitCode:
                currentTab === 'version'
                  ? 'SPRM.FORECAST_WORKBENCH.VERSION_FILTER'
                  : 'SPRM.FORECAST_WORKBENCH.SEARCHBAR',
            }),
            transformResponse: value => {
              const newRes = [];
              const { fcstDateRangeEnd, fcstDateRangeStart } = others || {};
              const queryLines = fcrtType
                ? lines.filter(ele => fcrtType.split(',').includes(ele.value))
                : lines;
              const { content: result = [], ...pages } = value ? JSON.parse(value) : {};
              if (result) {
                result.forEach(item => {
                  const resultTableData = {}; // 获取动态week,day,year的值
                  // fcstLineList 所有的高阶维度字段值设置
                  const {
                    fcstStatus,
                    fcstLineSumMap = {},
                    fcstLineList = [],
                    fcstHeaderId,
                    id,
                  } = item;
                  if (
                    ([
                      'FEEDBACK',
                      'CLOSED',
                      'CANCELED',
                      'RELEASED',
                      'FEEDBACK_REJECTED',
                      'FEEDBACK_PEND_APPROVAL',
                      'FEEDBACK_IN_APPROVAL',
                    ].includes(fcstStatus) ||
                      (fcstStatus === 'CHANGED' && currentTab === 'all')) &&
                    needFeedback
                  ) {
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
                      ?.map(lineKey => {
                        const { value: ele, meaning, description } = lineKey;
                        fcstLineList.forEach(i => {
                          const {
                            fcstDate,
                            fcstLineType,
                            fcstSeq,
                            cycleEndTime,
                            cycleStartTime,
                          } = i;
                          const fcstName =
                            fcstLineType === 'DAY' ? `${fcstLineType}${fcstSeq}` : fcstDate;
                          resultTableData[fcstName] = i[ele];
                          if (['YEAR', 'WEEK'].includes(fcstLineType)) {
                            resultTableData[`${fcstDate}Range`] = { cycleEndTime, cycleStartTime };
                          }
                        });
                        return {
                          ...item,
                          sourceType: currentTab,
                          fcstHeaderIdMain:
                            ele === queryLines[0].value ? fcstHeaderId : `${fcstHeaderId}_${ele}`,
                          idMain: ele === queryLines[0].value ? id : `${id}_${ele}`,
                          id: ele === queryLines[0].value ? undefined : id,
                          fcstHeaderId: ele === queryLines[0].value ? undefined : fcstHeaderId,
                          fcrtType: ele,
                          fcrtTypeMeaning: meaning,
                          forecastCategoryType: description,
                          ...resultTableData,
                          currentTab,
                          sumQiantity: fcstLineSumMap.sum ? fcstLineSumMap.sum[ele] : null,
                          sumAmount: fcstLineSumMap.sum ? fcstLineSumMap.sum[ele] : null,
                          sumByDay: fcstLineSumMap.sumByDay ? fcstLineSumMap.sumByDay[ele] : null,
                          sumByMonth: fcstLineSumMap.sumByMonth
                            ? fcstLineSumMap.sumByMonth[ele]
                            : null,
                          sumByWeek: fcstLineSumMap.sumByWeek
                            ? fcstLineSumMap.sumByWeek[ele]
                            : null,
                          sumByYear: fcstLineSumMap.sumByYear
                            ? fcstLineSumMap.sumByYear[ele]
                            : null,
                          fcstLineList: ele === queryLines[0].value ? fcstLineList : [],
                          fcstLineSumMap: ele === queryLines[0].value ? fcstLineSumMap : {},
                        };
                      });

                    newRes.push(...othersLine);
                  } else {
                    fcstLineList.forEach(ele => {
                      const {
                        fcstDate,
                        fcstQuantity,
                        fcstLineType,
                        fcstSeq,
                        cycleEndTime,
                        cycleStartTime,
                      } = ele;
                      const fcstName =
                        fcstLineType === 'DAY' ? `${fcstLineType}${fcstSeq}` : fcstDate;
                      resultTableData[fcstName] = fcstQuantity;
                      if (['YEAR', 'WEEK', 'MONTH'].includes(fcstLineType)) {
                        resultTableData[`${fcstDate}Range`] = { cycleEndTime, cycleStartTime };
                      }
                    });
                    if (!fcrtType || fcrtType.includes(baseLine)) {
                      newRes.push({
                        ...item,
                        fcstHeaderIdMain: fcstHeaderId,
                        idMain: id,
                        id: undefined,
                        sourceType: currentTab,
                        fcstHeaderId: undefined,
                        fcrtType: baseLine,
                        fcrtTypeMeaning:
                          lines.find(ele => ele.value === baseLine)?.meaning ||
                          (predictionDimensionCnf === 'QUANTITY'
                            ? '预测数量'
                            : predictionDimensionCnf === 'AMOUNT_INCLUDING_TAX'
                            ? '预测金额（含税）'
                            : '预测金额（不含税）'),
                        fcstDateRangeStart,
                        fcstDateRangeEnd,
                        ...resultTableData,
                        sumQiantity: fcstLineSumMap.sum.fcstQuantity,
                        sumAmount: fcstLineSumMap.sum.fcstQuantity,
                        sumByDay: fcstLineSumMap.sumByDay?.fcstQuantity,
                        sumByMonth: fcstLineSumMap.sumByMonth?.fcstQuantity,
                        sumByWeek: fcstLineSumMap.sumByWeek?.fcstQuantity,
                        sumByYear: fcstLineSumMap.sumByYear?.fcstQuantity,
                        // fcstLineList: [],
                        // fcstLineSumMap: {},
                      });
                    }
                  }
                });
              }
              return { content: newRes, ...pages };
            },
          };
        }
      },
    },
    events: {
      update: ({ name, record, value }) => {
        if (name === 'itemId') {
          if (value) {
            const { itemName, itemId, uomCode, uomId, uomName, model, specifications } = value;
            record.set({
              itemName,
              itemModel: model,
              itemSpecs: specifications,
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
        if (isFunction(cuxWholeDsUpdate)) {
          cuxWholeDsUpdate({ name, record, value });
        }
      },
      load: ({ dataSet }) => {
        dataSet.forEach(ele => {
          if (
            !['fcstQuantity', 'fcstAmountIncTax', 'fcstAmountExcTax'].includes(ele.get('fcrtType'))
          ) {
            // eslint-disable-next-line no-param-reassign
            ele.selectable = false;
          }
        });
      },
      query: ({ dataSet }) => {
        return (
          !!templateHeaderId &&
          !!(dataSet.queryParameter?.fcstDateRangeStart || dataSet.queryParameter?.fcstDateRangeEnd)
        );
      },
    },
  };
};

const operateRecordDs = fcstHeaderId => ({
  // pageSize: 20,
  paging: false,
  selection: false,
  autoQuery: false,
  queryFields: [
    {
      name: 'processTypeCode',
      display: true,
      noCache: true,
      type: 'string',
      lookupCode: 'SPRM.FCST.ACTION.STATUS',
      lovPara: { fcstHeaderId },
      label: intl.get('hzero.common.components.operationAudit.operatedCode').d('操作节点'),
    },
    {
      name: 'processedDateRange',
      type: 'dateTime',
      range: true,
      display: true,
      label: intl.get('hzero.common.components.operationAudit.operatedTime').d('操作时间'),
    },
    {
      name: 'processUserId',
      type: 'object',
      lovPara: { tenantId: organizationId },
      display: true,
      lovCode: 'HIAM.TENANT.USER',
      valueField: 'id',
      textField: 'realName',
      label: intl.get('hzero.common.components.operationAudit.operationBy').d('操作人'),
    },
    {
      name: 'processRemark',
      type: 'string',
      range: true,
      display: true,
      label: intl.get('hzero.common.view.description').d('描述'),
    },
  ],
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
      type: 'dateTime',
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

const historyVersionDs = ({ dsFields }) => {
  const fields = [
    {
      name: 'version',
      type: 'number',
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
      type: 'number',
      label: intl.get(`${commonPrompt}.lineNum`).d('行号'),
    },
  ];

  const fieldNames = fields.map(ele => ele.name) || [];

  dsFields.forEach(item => {
    if (fieldNames.includes(item.name)) {
      const field = fields.find(ele => ele.name === item.name);
      field.required = item.required || field.required;
      field.lovCode = item.lovCode || field.lovCode;
      field.label = item.fieldName || field.label;
    } else {
      fields.push(item);
    }
  });

  return {
    paging: false,
    selection: false,
    autoQuery: false,
    fields,
    transport: {
      read: ({ dataSet }) => {
        const initParams = dataSet.getState('initParams') || {};
        const fcstHeaderId = dataSet.getState('fcstHeaderId');
        const {
          needFeedback,
          predictionDimensionCnf,
          baseLine = 'fcstQuantity',
          showLines: lines,
        } = initParams;
        return {
          url: `${SRM_SPRM}/v1/${organizationId}/fcst-header-vers/list`,
          method: 'GET',
          transformResponse: value => {
            const newRes = [];
            const result = value ? JSON.parse(value) : [];
            result.forEach(item => {
              const { fcstLineSumMap = {}, fcstLineVerList = [], changeFieldLineMap = {} } = item;
              const typeDef = needFeedback
                ? lines
                : [
                    {
                      value: baseLine,
                      meaning:
                        lines.find(ele => ele.value === baseLine)?.meaning ||
                        (predictionDimensionCnf === 'QUANTITY'
                          ? '预测数量'
                          : predictionDimensionCnf === 'AMOUNT_INCLUDING_TAX'
                          ? '预测金额（含税）'
                          : '预测金额（不含税）'),
                      orderSeq: 10,
                    },
                  ];
              const othersLine = typeDef
                ?.filter(
                  ele =>
                    ![
                      'fcstAmountIncTax',
                      'feedbackAmountIncTax',
                      'fcstAmountExcTax',
                      'feedbackAmountExcTax',
                    ].includes(ele.value)
                )
                ?.map(({ value: ele, meaning, description }) => {
                  const resultTableData = {}; // 获取动态week,day,year的值
                  fcstLineVerList.forEach(i => {
                    const { fcstDate } = i;
                    resultTableData[fcstDate] = i[ele];
                    const changeLine = changeFieldLineMap[fcstDate];
                    const changedKey = changeLine
                      ? changeLine.find(e => e.fieldName === ele)
                      : undefined;
                    if (changedKey && [baseLine, 'feedbackQuantity'].includes(ele)) {
                      resultTableData[`${fcstDate}Color`] =
                        changedKey && ele !== 'diffQiantity'
                          ? String(changedKey.oldValue || 'null')
                          : null;
                    } else {
                      resultTableData[`${fcstDate}Color`] = undefined;
                    }
                  });
                  return {
                    ...item,
                    fcstHeaderIdMain: ele === baseLine ? fcstHeaderId : `${fcstHeaderId}_${ele}`,
                    fcstHeaderId: ele === baseLine ? undefined : fcstHeaderId,
                    fcrtType: ele,
                    fcrtTypeMeaning: meaning,
                    forecastCategoryType: description,
                    ...resultTableData,
                    sumQiantity: fcstLineSumMap.sum ? fcstLineSumMap.sum[ele] : null,
                    sumAmount: fcstLineSumMap.sum ? fcstLineSumMap.sum[ele] : null,
                    sumByDay: fcstLineSumMap.sumByDay ? fcstLineSumMap.sumByDay[ele] : null,
                    sumByMonth: fcstLineSumMap.sumByMonth ? fcstLineSumMap.sumByMonth[ele] : null,
                    sumByWeek: fcstLineSumMap.sumByWeek ? fcstLineSumMap.sumByWeek[ele] : null,
                    sumByYear: fcstLineSumMap.sumByYear ? fcstLineSumMap.sumByYear[ele] : null,
                  };
                });
              newRes.push(...othersLine);
            });
            return { content: newRes };
          },
        };
      },
    },
  };
};
export { wholeDs, operateRecordDs, historyVersionDs, importDs };

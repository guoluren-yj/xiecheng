/*
 * @Description: 资金计划预测列表页DataSet
 * @Author:  <xingya.li@gong-link.com>
 */
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { FieldType } from 'choerodon-ui/dataset/data-set/enum';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { ListCustomizeCode } from '../utils/type';
import { amountFormatterPrecision } from '../../../utils/utils';

export const fundPlanForecastListDS = (): DataSetProps => {
  const organizationId = getCurrentOrganizationId();
  return {
    pageSize: 20,
    autoQuery: false,
    primaryKey: 'fcHeaderId',
    fields: [
      {
        name: 'sourceDocNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.originNumAndLine').d('来源单据号-行号'),
      },
      {
        name: 'sourceAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.sourceDocAmount').d('来源单据金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'stageNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.stageNum').d('阶段编码'),
      },
      {
        name: 'stageDesc',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.stageDesc').d('阶段描述'),
      },
      {
        name: 'stagePercent',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.stagePercent').d('阶段比例%'),
      },
      {
        name: 'fcStageAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.fcStageAmount').d('预测阶段金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'fcStageDate',
        type: FieldType.dateTime,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.forecastedPayDate').d('预测阶段付款日期'),
      },
      {
        name: 'companyName',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.company').d('公司'),
      },
      {
        name: 'supplierCompanyName',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.supplierCompanyName').d('供应商'),
      },
      {
        name: 'creationDate',
        type: FieldType.dateTime,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.firstGeneratePreDate').d('首次生成预测时间'),
        help: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.creationDateTips').d('订单首次确认时间'),
      },
      {
        name: 'lastUpdateDate',
        type: FieldType.dateTime,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.forecastInfoUpdateTime').d('预测信息更新时间'),
      },
      {
        name: 'stagePreAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.stagePreAmount').d('阶段预制金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'stagePreparedAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.stagePreparedAmount').d('阶段已编制金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'stageToBePreparedAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.stageToBePreparedAmount').d('阶段待编制金额'),
        computedProps: { formatterOptions: amountFormatterPrecision },
      },
      {
        name: 'stagePreStatus',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.stagePreStatus').d('阶段预制状态'),
      },
      {
        name: 'stagePreparedStatus',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.stagePreparedStatus').d('阶段编制状态'),
      },
    ],
    queryParameter: {
      customizeUnitCode: Object.values(ListCustomizeCode).join(),
    },
    transport: {
      read: ({ data, params }) => ({
        url: `/sbdm/v1/${organizationId}/forecast-headers/list`,
        method: 'POST',
        params: {
          ...data,
          ...params,
        },
      }),
    },
  };
};

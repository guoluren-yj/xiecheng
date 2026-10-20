import { DataToJSON, FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import notification from 'utils/notification';

import { DetailCustomizeCode, RegEx, mapQueryFields } from '../utils/type';

interface MyDataSetProps extends DataSetProps {
  validationCode?: string,
  validationTitle?: string,
};
export const sourceDocHeaderDS = ({controlDimension, lineData, documentTermHeaderDTOList, cacheUpdateFlag, catchData}, readOnlyFlag?: boolean): MyDataSetProps => {
  return {
    paging: false,
    autoQuery: false,
    forceValidate: true,
    primaryKey: 'sourceDocId',
    dataToJSON: DataToJSON.all,
    autoCreate: true,
    validationTitle: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.basicTerm').d('条款基本信息'),
    validationCode: 'header',
    fields: [
      {
        name: 'docTermStatus',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.status').d('状态'),
        lookupCode: 'SBSM.DOC_TERM_STATUS',
      },
      {
        name: 'docTermNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.planNum').d('来源单据付款条款编号'),
      },
      {
        name: 'termVersionNumber',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.vision').d('版本'),
      },
      {
        name: 'controlDimension',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.controlDimension').d('管控维度'),
        lookupCode: 'SBSM.CONTROL_DIMENSION',
      },
      {
        name: 'sourceDocNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.docNumCode').d('来源单据编号'),
      },
      {
        name: 'sourceDocLineNum',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.docNumCodeAndLineNo').d('来源单据编号-行号'),
      },
      {
        name: 'amountComputeRule',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.stageAmountRule').d('阶段金额计算规则'),
        lookupCode: 'SBSM.AMOUNT_COMPUTE_MODE',
        required: true,
      },
      // {
      //   name: 'txSource',
      //   type: FieldType.string,
      //   label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.compileOrigin').d('编制事务匹配来源'),
      // },
      // {
      //   name: 'txMatchRule',
      //   type: FieldType.string,
      //   label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.compileRule').d('编制事务匹配规则'),
      // },
      {
        name: 'termNumLov',
        type: FieldType.object,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.payTermCode').d('付款条款编码'),
        help: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.payTermCodeHelp').d('若无下游数据，付款条款编码切换后，新条款将作为模板更新至来源单据付款条款、阶段'),
        lovCode: 'SBSM.TERM_HEADER',
        textField: 'termNum',
        required: true,
        dynamicProps: {
          lovPara: () => ({
            tenantId: getCurrentOrganizationId(),
            autoFillFlag: 1,
          }),
        },
      },
      {
        name: 'termNum',
        bind: 'termNumLov.termNum',
        type: FieldType.string,
      },
      {
        name: 'termHeaderId',
        bind: 'termNumLov.termHeaderId',
        type: FieldType.string,
      },
      {
        name: 'termName',
        bind: 'termNumLov.termName',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.payTermDesc').d('付款条款描述'),
      },
      {
        name: 'currencyCode',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.currencyCode').d('币种'),
      },
      {
        name: 'dtAmount',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.docNumAmount').d('来源单据金额'),
      },
      {
        name: 'dtLineAmount',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.docNumAmount').d('来源单据金额'),
      },
      {
        name: 'docTermAmount',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.docTermAmount').d('单据条款金额'),
      },
      {
        name: 'diffAmount',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.diffAmount').d('差异金额'),
      },
    ],
    transport: {
      read: ({ dataSet }) => {
        // 如果仅保存不关闭弹框，使用ds里的termHeaderId
        const headerData = dataSet?.getState('headerData');
        let queryParameter: any = [];
        if (controlDimension === 'ORDER') {
          queryParameter = [{
            ...documentTermHeaderDTOList[0],
            termHeaderId: headerData?.[0]?.termHeaderId || documentTermHeaderDTOList[0]?.termHeaderId,
            customizeUnitCode: Object.values(DetailCustomizeCode).join(),
          }];
        } else if (controlDimension === 'PO_LINE') {
          queryParameter = documentTermHeaderDTOList?.map((item: any) => {
            const record = headerData?.find((v) => Number(v.sourceDocLineNum) === Number(item.sourceDocLineNum));
            return {
              ...item,
              termHeaderId: record?.termHeaderId || item.termHeaderId,
              customizeUnitCode: Object.values(DetailCustomizeCode).join(),
            };
          }).filter((v: any) => !math.eq(v?.dtLineAmount, 0));
        }
        const url = readOnlyFlag ? `/sbdm/v1/${getCurrentOrganizationId()}/document-term-headers/query` : `/sbdm/v1/${getCurrentOrganizationId()}/document-term-headers/build-document-term`;
        return {
          url,
          method: 'POST',
          data: {documentTermHeaderDTOList: queryParameter, controlDimension},
          transformResponse: (response) => {
            let res: any = {};
            try {
              res = JSON.parse(response);
            } catch(e) {
              throw e;
            }
            if (!getResponse(res)) return;
            const { documentTermHeaderDTOList = [] } = res || {};
            const content = documentTermHeaderDTOList.map((item: any) => {
              const { forecastStatus, prefabricateStatus, sourceDocLineNum, amountComputeRule, forecastMsg, prefabricateMsg, dtAmount, dtLineAmount } = item || {};
              const info = lineData.find((v) => v?.[mapQueryFields[controlDimension]?.sourceDocLineNum] == sourceDocLineNum) || {};
              if (cacheUpdateFlag) {
                // 有缓存直接用缓存数据
                const catchItem = catchData.find((v) => v?.sourceDocLineNum === sourceDocLineNum);
                if (catchItem) return catchItem;
              }
              if (controlDimension === 'PO_LINE') {
                // 用于左侧显示
                item.displayLineNum = info[mapQueryFields[controlDimension]?.sourceDocDisplayLineNum];
                item.itemCode = info[mapQueryFields[controlDimension]?.itemCode];
                item.itemName = info[mapQueryFields[controlDimension]?.itemName];
              }
              if (item.docTermLineList) {
                // eslint-disable-next-line no-unused-expressions
                item.docTermLineList?.map((ele: any) => {
                  ele.amountComputeRule = amountComputeRule;
                  ele.dtAmount = dtAmount;
                  ele.dtLineAmount = dtLineAmount;
                  ele.forecastStatus = forecastStatus;
                  ele.prefabricateStatus = prefabricateStatus;
                  return ele;
                });
              }
              item.docTermSyncList = [{
                syncStatus: forecastStatus,
                syncFunction: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.fundPlanForecast').d('资金计划预测'),
                syncFeedBack: forecastMsg,
                syncType: 'syncFc',
              }, {
                syncStatus: prefabricateStatus,
                syncFunction: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.fundPlanCompilePool').d('资金计划编制池'),
                syncFeedBack: prefabricateMsg,
                syncType: 'syncTx',
              }];
              return item;
            });
            return {
              ...res,
              content,
            };
          },
        };
      },
      submit: ({ dataSet, data }): any => {
        const submitType = dataSet?.getState('submitType');
        switch (submitType) {
          case 'save':
            return {
              url: `/sbdm/v1/${getCurrentOrganizationId()}/document-term-headers/save-document-term`,
              method: 'POST',
              data: {documentTermHeaderDTOList: data},
            };
          case 'saveValidate':
            return {
              url: `/sbdm/v1/${getCurrentOrganizationId()}/document-term-headers/validate-save-document-term`,
              method: 'POST',
              data: {documentTermHeaderDTOList: data, controlDimension},
            };
          default:
        }
      },
    },
    feedback: {
      loadSuccess: (response) => {
        if (response?.responseStatus === 'ERROR') {
          notification.error({
            message: response && response.responseMessage,
          });
        }
      },
      submitSuccess: (res) => {
        const { content = [] } = res;
        const response = content[0] || {};
        if (response?.responseStatus === 'ERROR') {
          notification.error({
            message: response && response.responseMessage,
          });
        }
      },
    },
  };
};
export const sourceDocListDS = (dimensionType): MyDataSetProps => {
  return {
    autoQuery: false,
    forceValidate: true,
    primaryKey: 'docTermLineId',
    paging: false,
    validationTitle: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.lineTerm').d('付款条款阶段'),
    validationCode: 'line',
    fields: [
      {
        name: 'lineNum',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.orderNumber').d('序号'),
      },
      {
        name: 'stageNum',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.paymentStageCode').d('付款阶段编号'),
        maxLength: 30,
        // required: true,
        pattern: RegEx.NOCHINESE,
        disabled: true,
        defaultValidationMessages: {
          patternMismatch: intl.get('sbsm.payTermsCtrl.view.validation.noChinese').d('请输入字母、数字或字符'),
        },
      },
      {
        name: 'stageDesc',
        type: FieldType.intl,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.paymentStageDesc').d('付款阶段描述'),
        required: true,
        maxLength: 240,
      },
      {
        name: 'stageType',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.paymentStageType').d('阶段类型'),
        lookupCode: 'SBSM.STAGE_TYPE',
        defaultValue: 'PAYMENT_FOR_GOODS',
        required: true,
      },
      {
        name: 'stagePercent',
        type: FieldType.number,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.stageProportion').d('阶段比例（%）'),
        min: 0,
        max: 100,
        dynamicProps: {
          disabled: ({ record }) => {
            return record?.get('amountComputeRule') !== 'INPUT_PERCENT';
          },
          required: ({ record }) => {
            return record?.get('amountComputeRule') === 'INPUT_PERCENT';
          },
        },
      },
      {
        name: 'amountComputeRule', // 不是行字段 用于判断
        type: FieldType.string,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.stageAmountRule').d('阶段金额计算规则'),
      },
      {
        name: 'stageAmount',
        type: FieldType.number,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.stageAmount').d('阶段金额'),
        dynamicProps: {
          disabled: ({ record }) => {
            return record?.get('amountComputeRule') !== 'AMOUNT';
          },
          required: ({ record }) => {
            return record?.get('amountComputeRule') === 'AMOUNT';
          },
        },
        validator: (value, name, record: any) => {
          const { dtAmount, dtLineAmount } = record?.get(['dtAmount', 'dtLineAmount']) || {};
          const amount = ['ORDER'].includes(dimensionType) ? dtAmount : dtLineAmount;
          if (!math.isNaN(amount) && !math.isNaN(value) && math.lt(math.multipliedBy(amount, value), 0)) {
            return intl
              .get(`sbsm.common.message.validate.sameSign.stageAmount`)
              .d(`阶段金额需与来源单据金额同号，即同为正数/负数/0，请检查`);
          }
          return true;
        },
      },
      {
        name: 'fcDateRule',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.predictPayRulePlan').d('预测付款日期规则'),
        lookupCode: 'SBSM.FC_DATE_RULE',
        defaultValue: 'DYNAMIC_PAY_DATE',
        required: true,
        help: intl.get('sbsm.common.model.payTermsCtrl.predictPayRulePlanTips').d('适用于【资金计划预测】功能中的「预测付款日期」计算规则'),
      },
      {
        name: 'fcBaseDateType',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.predictBaseDateFieldCode').d('预测付款基准日期'),
        lookupCode: 'SBSM.FC_BASE_DATE_TYPE',
        dynamicProps: {
          disabled: ({ record }) => record?.get('fcDateRule') === 'NO_NEED_CALCULATE',
          required: ({ record }) => ['DYNAMIC_PAY_DATE', 'FIXED_PAY_DATE'].includes(record?.get('fcDateRule')), // 预测付款日期规则等于动态付款日期
        },
      },
      {
        name: 'fcDeadLine',
        type: FieldType.number,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.predictDeadLineDate').d('预测付款基准日期截止日'),
        dynamicProps: {
          disabled: ({ record }) => ['NO_NEED_CALCULATE', 'DYNAMIC_PAY_DATE'].includes(record?.get('fcDateRule')),
          required: ({ record }) => ['FIXED_PAY_DATE'].includes(record?.get('fcDateRule')),
        },
        help: intl.get('sbsm.common.model.payTermsCtrl.predictDeadLineDateTips').d('参见「期望付款基准日期截止日」释义'),
      },
      {
        name: 'fcFixedDay',
        type: FieldType.number,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.predictPayFixedDay').d('预测付款固定日'),
        dynamicProps: {
          disabled: ({ record }) => ['NO_NEED_CALCULATE', 'DYNAMIC_PAY_DATE'].includes(record?.get('fcDateRule')),
          required: ({ record }) => ['FIXED_PAY_DATE'].includes(record?.get('fcDateRule')),
        },
      },
      {
        name: 'fcAddMonth',
        type: FieldType.number,
        min: 0,
        step: 1,
        precision: 0,
        label: intl.get('sbsm.fundPlanForecast.model.fundPlanForecast.predictAddExtraMonth').d('预测付款附加月数'),
        dynamicProps: {
          disabled: ({ record }) => ['NO_NEED_CALCULATE', 'DYNAMIC_PAY_DATE'].includes(record?.get('fcDateRule')),
        },
      },
      {
        name: 'fcAccountPeriod',
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.predictAddDays').d('预测付款账期天数'),
        type: FieldType.number,
        min: 0,
        step: 1,
        precision: 0,
        dynamicProps: {
          disabled: ({ record }) => record?.get('fcDateRule') === 'NO_NEED_CALCULATE',
          required: ({ record }) => ['DYNAMIC_PAY_DATE', 'FIXED_PAY_DATE'].includes(record?.get('fcDateRule')),
        },
      },
      {
        name: 'exDateRule',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.expectPayRulePlan').d('期望付款日期规则'),
        lookupCode: 'SBSM.EX_DATE_RULE',
        defaultValue: 'DYNAMIC_PAY_DATE',
        required: true,
        help: intl.get('sbsm.common.model.payTermsCtrl.expectPayRulePlanTips').d('适用于【资金计划编制池】功能中的「预制付款日期」计算规则。编制事务来源单据以配置的预制规则接入【资金计划编制池】匹配付款阶段时，会以匹配阶段中配置的「期望付款日期规则」作为「预制付款日期」的计算规则'),
      },
      {
        name: 'exBaseDateType',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.expectBaseDateFieldCode').d('期望付款基准日期'),
        lookupCode: 'SBSM.EX_BASE_DATE_TYPE',
        dynamicProps: {
          disabled: ({ record }) => record?.get('exDateRule') === 'NO_NEED_CALCULATE',
          required: ({ record }) => ['DYNAMIC_PAY_DATE', 'FIXED_PAY_DATE'].includes(record?.get('exDateRule')), // 期望付款日期规则等于动态付款日期
        },
      },
      {
        name: 'exDeadLine',
        type: FieldType.number,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.expectDeadLineDate').d('期望付款基准日期截止日'),
        dynamicProps: {
          disabled: ({ record }) => ['NO_NEED_CALCULATE', 'DYNAMIC_PAY_DATE'].includes(record?.get('exDateRule')),
          required: ({ record }) => ['FIXED_PAY_DATE'].includes(record?.get('exDateRule')),
        },
        help: intl.get('sbsm.common.model.payTermsCtrl.expectDeadLineDateTips').d('适用于「固定付款日期-月结」计算规则场景：示例1:基准日期=接收事务日期，基准日期截止日=15，固定日=25，附加月数=1，账期天数=30;1.编制池编制来源单据行接收事务日期在当月15号前的，于（本月+附加月数1）月25日+付款账期天数，计算得到「预制付款日期」2.如果接收事务日期在15号之后，在「期望付款日期规则=固定基准日期-月结」中“月结”的设定下，则（本月+附加月数1+1）月25日+付款账期天数，计算得到「付款到期日期」'),
      },
      {
        name: 'exFixedDay',
        type: FieldType.number,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.expectPayFixedDays').d('期望付款固定日'),
        dynamicProps: {
          disabled: ({ record }) => ['NO_NEED_CALCULATE', 'DYNAMIC_PAY_DATE'].includes(record?.get('exDateRule')),
          required: ({ record }) => ['FIXED_PAY_DATE'].includes(record?.get('exDateRule')),
        },
      },
      {
        name: 'exAddMonth',
        type: FieldType.number,
        min: 0,
        step: 1,
        precision: 0,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.expectAddExtraMonth').d('期望付款附加月数'),
        dynamicProps: {
          disabled: ({ record }) => ['NO_NEED_CALCULATE', 'DYNAMIC_PAY_DATE'].includes(record?.get('exDateRule')),
        },
      },
      {
        name: 'exAccountPeriod',
        type: FieldType.number,
        min: 0,
        step: 1,
        precision: 0,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.expectAddExtraDays').d('期望付款账期天数'),
        dynamicProps: {
          disabled: ({ record }) => record?.get('exDateRule') === 'NO_NEED_CALCULATE',
          required: ({ record }) => ['DYNAMIC_PAY_DATE', 'FIXED_PAY_DATE'].includes(record?.get('exDateRule')),
        },
      },
      {
        name: 'operate',
        type: FieldType.string,
        label: intl.get('sbsm.common.model.fundPlanPrefabrication.watchDetails').d('执行情况'),
      },
    ],
    transport: {
      destroy: () => {
        return {
          url: `/sbdm/v1/${getCurrentOrganizationId()}/document-term-lines/delete`,
          method: 'DELETE',
        };
      },
    },
  };
};

export const sourceDocSyncListDS = (): MyDataSetProps => {
  return {
    autoQuery: false,
    paging: false,
    dataToJSON: DataToJSON.all,
    fields: [
      {
        name: 'syncStatus',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.syncStatus').d('同步状态'),
        lookupCode: 'SBSM.SYNC_DS_STATUS',
      },
      {
        name: 'syncFunction',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.syncFunction').d('同步功能'),
      },
      {
        name: 'syncFeedBack',
        type: FieldType.string,
        label: intl.get('sbsm.payTermsCtrl.model.payTermsCtrl.syncFeedBack').d('反馈信息'),
      },
      {
        name: 'operate',
        type: FieldType.string,
        label: intl.get('sbsm.fundPlan.model.fundPlan.operate').d('操作'),
      },
    ],
    transport: {
      submit: ({ dataSet }): any => {
        const submitType = dataSet?.getState('submitType');
        const syncData = dataSet?.getState('syncData');
        switch (submitType) {
          case 'syncFc':
            return {
              url: `/sbdm/v1/${getCurrentOrganizationId()}/document-term-headers/sync-fc`,
              method: 'POST',
              data: [syncData],
            };
          case 'syncTx':
            return {
              url: `/sbdm/v1/${getCurrentOrganizationId()}/document-term-headers/sync-tx`,
              method: 'POST',
              data: [syncData],
            };
          default:
        }
      },
    },
  };
};

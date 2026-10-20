// 评分明细表ds
import intl from 'utils/intl';

import { Prefix } from '@/utils/globalVariable';

import { commonValidationRules } from './utils/dsUtils';

const ScoringElementDS = ({ team, assignedExpertOptionDs, rfxInfoDs }) => {
  return {
    primaryKey: 'evaluateIndicId',
    dataToJSON: 'all',
    paging: false,
    validationRules: commonValidationRules('minLength')(),
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.indicateCode`).d('要素编码'),
        name: 'indicateLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SSRC.SCORE_INDIC',
        textField: 'indicateCode',
        valueField: 'indicateId',
        dynamicProps: {
          lovPara() {
            return {
              expertCategory: team,
              customizeUnitCode: 'SSRC.SCORE_TEMPLATE.SCORE_ELEMENT_LIST',
              // indicateType: 'SCORE',
            };
          },
        },
      },
      {
        name: 'indicateId',
        bind: 'indicateLov.indicateId',
      },
      {
        name: 'indicateCode',
        bind: 'indicateLov.indicateCode',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.indicateName`).d('要素名称'),
        name: 'indicateName',
        type: 'string',
        required: true,
        dynamicProps: {
          disabled({ record }) {
            return !!record.get('evaluateIndicDetail');
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.indicateTypeMeaning`).d('要素类型'),
        name: 'indicateType',
        type: 'string',
        lookupCode: 'SSRC.INDICATE_TYPE',
        dynamicProps: {
          required({ record }) {
            return !record.get('indicateId');
          },
          disabled({ record }) {
            return record.get('indicateId');
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.calculateType`).d('计算方式'),
        name: 'calculateType',
        lookupCode: 'SSRC.CALCULATE_TYPE',
        type: 'string',
        dynamicProps: {
          required({ record }) {
            const indicateTypeFlag = record.get('indicateType') === 'SCORE';
            return indicateTypeFlag;
          },
          disabled({ record }) {
            const { indicateType, indicateId } = record.get(['indicateType', 'indicateId']);
            return indicateId || indicateType === 'PASS';
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.scoreType`).d('评分类型'),
        name: 'scoreType',
        lookupCode: 'SSRC.SCORE_TYPE',
        type: 'string',
        dynamicProps: {
          required({ record }) {
            const isIndicateType = record.get('indicateType') === 'SCORE';
            const isCalculateType = record.get('calculateType') === 'AUTO';
            return isIndicateType && isCalculateType;
          },
          disabled({ record }) {
            const { indicateType, calculateType, indicateId } = record.get([
              'indicateType',
              'calculateType',
              'indicateId',
            ]);
            return indicateId || calculateType === 'MANUAL' || indicateType === 'PASS';
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.scoreRemark`).d('评分细则'),
        name: 'indicateRemark',
        type: 'string',
        dynamicProps: {
          required({ record }) {
            const isCalculateType = record.get('calculateType') === 'AUTO';
            return isCalculateType;
          },
          // readOnly({ record }) {
          //   const isCalculateType = record.get('calculateType') === 'AUTO';
          //   return isCalculateType;
          // },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.weightPercent`).d('权重(%)'),
        name: 'weight',
        type: 'number',
        max: 100,
        min: 0,
        step: 0.01,
        validator: (value) => {
          if (value && (value <= 0 || value > 100)) {
            return intl
              .get(`ssrc.inquiryHall.model.inquiryHall.weightPercentRemind`)
              .d('权重范围必须大于0且小于或等于100');
          }
          return true;
        },
        dynamicProps: {
          required({ dataSet, record }) {
            const { templateScoreType = null } = dataSet.queryParameter.headers || {};
            const indicateType = record.get('indicateType');
            return indicateType === 'SCORE' && templateScoreType === 'WEIGHT';
          },
          defaultValue({ dataSet }) {
            const { templateScoreType = null } = dataSet.queryParameter.headers || {};
            return ['SCORE', 'SCORE_NEW'].includes(templateScoreType) ? 100 : null;
          },
          disabled({ record }) {
            const indicateType = record.get('indicateType');
            return indicateType === 'PASS';
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.minScore`).d('最低分'),
        name: 'minScore',
        type: 'number',
        min: 0,
        step: 0.01,
        precision: 2,
        defaultValue: 0,
        dynamicProps: {
          required({ dataSet, record }) {
            const { templateScoreType = null } = dataSet.queryParameter.headers || {};
            const { scoreType, indicateType, detailEnabledFlag } = record.get([
              'scoreType',
              'indicateType',
              'detailEnabledFlag',
            ]);
            return (
              !(detailEnabledFlag || scoreType === 'PRICE') &&
              ['SCORE', 'SCORE_NEW'].includes(templateScoreType) &&
              indicateType !== 'PASS'
            );
          },
          disabled({ record, dataSet }) {
            const { templateScoreType = null } = dataSet.queryParameter.headers || {};
            const { scoreType, indicateType, detailEnabledFlag } = record.get([
              'scoreType',
              'indicateType',
              'detailEnabledFlag',
            ]);
            return (
              detailEnabledFlag ||
              scoreType === 'PRICE' ||
              !['SCORE', 'SCORE_NEW'].includes(templateScoreType) ||
              indicateType === 'PASS'
            );
          },
          defaultValue({ dataSet }) {
            const { templateScoreType = null } = dataSet.queryParameter.headers || {};
            return templateScoreType === 'WEIGHT' ? 0 : null;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.maxScore`).d('最高分'),
        name: 'maxScore',
        type: 'number',
        // max: 100,
        min: 'minScore',
        step: 0.01,
        precision: 2,
        defaultValue: 100,
        dynamicProps: {
          required({ dataSet, record }) {
            const { templateScoreType = null } = dataSet.queryParameter.headers || {};
            const { indicateType, detailEnabledFlag } = record.get([
              'indicateType',
              'detailEnabledFlag',
            ]);
            return (
              !detailEnabledFlag &&
              ['SCORE', 'SCORE_NEW'].includes(templateScoreType) &&
              indicateType !== 'PASS'
            );
          },
          disabled({ record, dataSet }) {
            const { templateScoreType = null } = dataSet.queryParameter.headers || {};
            const { indicateType, detailEnabledFlag } = record.get([
              'indicateType',
              'detailEnabledFlag',
            ]);
            return (
              detailEnabledFlag ||
              !['SCORE', 'SCORE_NEW'].includes(templateScoreType) ||
              indicateType === 'PASS'
            );
          },
          defaultValue({ dataSet }) {
            const { templateScoreType = null } = dataSet.queryParameter.headers || {};
            return templateScoreType === 'WEIGHT' ? 100 : null;
          },
        },
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.detailEnabledFlag`)
          .d('启用评分要素细项'),
        name: 'detailEnabledFlag',
        //        type: 'boolean',
        //        trueValue: 1,
        //        falseValue: 0,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertAllocation`).d('专家分配'),
        name: 'expertDistribute',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.assignExperts`).d('分配专家'),
        name: 'assignedExperts',
        type: 'object',
        valueField: 'evaluateExpertId',
        textField: 'expertName',
        options: assignedExpertOptionDs,
      },
      {
        // 分配专家LIST
        name: 'assignedExpertList',
      },
      {
        name: 'sourceFrom',
        type: 'string',
        defaultValue: 'RFX',
      },
      {
        name: 'openBidOrder',
        type: 'string',
      },
      {
        name: 'organizationId',
        type: 'string',
      },
      {
        name: 'tenantId',
        type: 'string',
      },
      {
        name: 'expertCategory',
        type: 'string',
        defaultValue: team,
      },
      {
        name: 'indicStatus',
        type: 'string',
        defaultValue: 'SUBMITTED',
      },
      {
        name: 'sourceHeaderId',
        type: 'string',
      },
      {
        name: 'team',
        type: 'string',
        defaultValue: team,
      },
      {
        name: 'technologyWeight',
        type: 'number',
        defaultValue: team === 'TECHNOLOGY' ? 50 : null,
      },
      {
        name: 'businessWeight',
        type: 'number',
        defaultValue: team === 'BUSINESS' ? 50 : null,
      },
      {
        name: 'lovChangeFlag',
        defaultValue: 0,
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'objectVersionNumber',
      },
      {
        name: 'scoreIndicId',
      },
      {
        name: 'evaluateIndicDetail',
      },
      // {
      //   name: 'indicateType',
      //   type: 'string',
      //   defaultValue: 'SCORE',
      // },
      {
        name: 'scoreIndicateList',
        defaultValue: null,
      },
      {
        name: 'sourceTemplateId',
      },
    ],
    events: {
      update: ({ dataSet = {}, record = {}, name, value = {}, oldValue }) => {
        if (name === 'indicateLov') {
          const {
            queryParameter: { commonProps = {}, headers = {} },
          } = dataSet;

          const { organizationId = null, rfxHeaderId } = commonProps;
          const { openBidOrder = null } = headers;
          const {
            indicateName,
            indicateId,
            indicateCode,
            indicateType,
            minScore = null,
            maxScore = null,
            mustApprovedFlag,
            qualifiedScore,
            scoreIndicId,
            weight,
            remark,
            detailEnabledFlag = 0,
            scoreType,
            calculateType = null,
            scoreIndicDetail = null,
          } = value || {};
          record.setState('indicateLovChangeFlag', value ? 1 : 0);
          record.set('indicateName', indicateName);
          record.set('indicateId', indicateId);
          record.set('indicateCode', indicateCode);
          record.set('indicateType', indicateType);
          record.set(
            'minScore',
            calculateType === 'AUTO'
              ? scoreIndicDetail?.lowestScore
              : indicateType === 'SCORE'
              ? minScore ?? 0
              : null
          );
          record.set('maxScore', indicateType === 'SCORE' ? maxScore ?? 100 : null);
          record.set('mustApprovedFlag', mustApprovedFlag);
          record.set('qualifiedScore', qualifiedScore);
          record.set('sourceFrom', 'RFX');
          record.set('tenantId', organizationId);
          record.set('indicStatus', 'SUBMITTED');
          record.set('sourceHeaderId', rfxHeaderId);
          record.set('indicateRemark', remark);
          record.set('detailEnabledFlag', indicateType === 'PASS' ? 0 : detailEnabledFlag);
          record.set('scoreIndicId', scoreIndicId);
          record.set('weight', weight);
          record.set('openBidOrder', openBidOrder);
          record.set('scoreType', scoreType);
          record.set('calculateType', calculateType);
          record.set('evaluateIndicDetail', scoreIndicDetail || null);
          record.set('lovChangeFlag', 1);
        } else if (name === 'calculateType') {
          if (
            (value === 'MANUAL' && oldValue === 'AUTO') ||
            (value === 'AUTO' && oldValue === 'MANUAL')
          ) {
            if (record.getState('indicateLovChangeFlag') === 1) {
              // 当由 `要素编码` 触发 `计算方式` 改变时无需清空
              // ps: 或将 set calculateType 放置于 set scoreType/indicateRemark
              // 之前, 因为set =》 fire update 属于同步执行
              record.setState('indicateLovChangeFlag', 0);
            } else {
              // 反之手动变更时, 需要清空
              record.set('scoreType', null);
              record.set('indicateRemark', null);
              record.set('detailEnabledFlag', 0);
            }
          }
          // 商务组 - 自动计算 - 最低分最高分默认
          if (value === 'MANUAL' && oldValue === 'AUTO') {
            const scoreObj = record?.getState('scoreObj') || {};
            const { templateScoreType } = rfxInfoDs?.current?.get(['templateScoreType']) || {};
            record.set({
              minScore: ['SCORE', 'SCORE_NEW'].includes(templateScoreType)
                ? scoreObj.minScore
                : scoreObj.minScore ?? 0,
              maxScore: ['SCORE', 'SCORE_NEW'].includes(templateScoreType)
                ? scoreObj.maxScore
                : scoreObj.maxScore ?? 100,
            });
          }
        }
        if (name === 'assignedExperts') {
          const optionsDs = record.getField('assignedExperts').options;
          // 删除操作(小删除和大清除)
          if (value?.length < oldValue?.length || value === null) {
            let differenceData = [];
            if (value === null) {
              // 大清除
              differenceData = oldValue;
            } else if (value?.length < oldValue?.length) {
              // 小删除
              differenceData = oldValue?.filter((i) => {
                return value?.every((v) => v?.evaluateExpertId !== i?.evaluateExpertId);
              });
            }
            const differenceKeys = differenceData.map((i) => i.evaluateExpertId) || [];
            // 将当前更新数据 设置assignFlag为0，更新到assignedExpertList
            const newDiffData = differenceData.map((i) => {
              return { ...i, assignFlag: 0 };
            });
            const newList = [...(value || []), ...(newDiffData || [])];

            // 专家分配弹框展开，处理联动
            if (record.getState('assignExpertsShow')) {
              // 与下拉选项联动，取消勾选
              optionsDs.records.forEach((r) => {
                if (differenceKeys.includes(r.get('evaluateExpertId'))) {
                  r.set('assignFlag', 0);
                  Object.assign(r, { isSelected: false });
                }
              });
            }
            record.set('assignedExpertList', newList);
          }
        }
      },
    },
    transport: {
      destroy: ({ dataSet, data }) => {
        const {
          queryParameter: { commonProps = {} },
        } = dataSet;
        const { organizationId, operationType = undefined } = commonProps;
        const ids = data.map((item) => item.evaluateIndicId).filter(Boolean);

        return {
          url: `${Prefix}/${organizationId}/evaluate-indics?operationType=${operationType}`,
          method: 'DELETE',
          data: ids,
        };
      },
    },
  };
};

const ExpertModalDS = () => {
  return {
    primaryKey: 'evaluateExpertId',
    selection: false,
    paging: false,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertSubAccount`).d('专家子账户'),
        name: 'loginName',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertName`).d('专家姓名'),
        name: 'expertName',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.whetherAssign`).d('是否分配'),
        name: 'assignFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
    ],
    transport: {
      read: ({ dataSet }) => {
        const {
          queryParameter: { commonProps = {} },
        } = dataSet;
        const { organizationId } = commonProps || {};

        return {
          url: `${Prefix}/${organizationId}/evaluate-indic-assigns`,
          method: 'GET',
          data: {
            ...commonProps,
          },
        };
      },
    },
  };
};

export { ScoringElementDS, ExpertModalDS };

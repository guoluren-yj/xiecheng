// 评分明细表 ScoringElementTableDS
import { isObject } from 'lodash';

import intl from 'utils/intl';
import { expertModalDS } from '@/routes/ssrc/components/AssignExperts/lineDs';
import { Prefix } from '@/utils/globalVariable';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

const ScoringElementTableDS = ({ team, assignedExpertOptionDs }) => {
  // 二阶段隐藏字段逻辑：待开标 && 二阶段存在标识 && 一阶段已全部完成
  const getExistSecondOpenBidFlag = (dataSet) => {
    const { existSecondOpenBidFlag, rfxStatus, allOpenedFlag } =
      dataSet?.queryParameter?.commonData?.header || {};
    return rfxStatus === 'OPEN_BID_PENDING' && existSecondOpenBidFlag && allOpenedFlag;
  };
  return {
    primaryKey: 'evaluateIndicAdjustId',
    dataToJSON: 'all',
    paging: false,
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
          disabled({ record, dataSet }) {
            return !!record.get('evaluateIndicDetail') || getExistSecondOpenBidFlag(dataSet);
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
          disabled({ record, dataSet }) {
            return record.get('indicateId') || getExistSecondOpenBidFlag(dataSet);
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
          disabled({ record, dataSet }) {
            const { indicateType, indicateId } = record.get(['indicateType', 'indicateId']);
            return indicateId || indicateType === 'PASS' || getExistSecondOpenBidFlag(dataSet);
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.scoreType`).d('评分类型'),
        name: 'scoreType',
        defaultValidationMessages: { valueMissingNoLabel: '', valueMissing: '' },
        lookupCode: 'SSRC.SCORE_TYPE',
        type: 'string',
        dynamicProps: {
          required({ record }) {
            const isIndicateType = record.get('indicateType') === 'SCORE';
            const isCalculateType = record.get('calculateType') === 'AUTO';
            return isIndicateType && isCalculateType;
          },
          disabled({ record, dataSet }) {
            const { indicateType, calculateType, indicateId } = record.get([
              'indicateType',
              'calculateType',
              'indicateId',
            ]);
            return (
              indicateId ||
              calculateType === 'MANUAL' ||
              indicateType === 'PASS' ||
              getExistSecondOpenBidFlag(dataSet)
            );
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
          disabled({ dataSet }) {
            return getExistSecondOpenBidFlag(dataSet);
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
        dynamicProps: {
          required({ dataSet, record }) {
            const { templateScoreType = null } = dataSet.queryParameter.commonData?.header || {};
            const indicateType = record.get('indicateType');
            return indicateType === 'SCORE' && templateScoreType === 'WEIGHT';
          },
          defaultValue({ dataSet }) {
            const { templateScoreType = null } = dataSet.queryParameter.commonData?.header || {};
            return ['SCORE', 'SCORE_NEW'].includes(templateScoreType) ? 100 : null;
          },
          disabled({ record, dataSet }) {
            const indicateType = record.get('indicateType');
            return indicateType === 'PASS' || getExistSecondOpenBidFlag(dataSet);
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
            const { templateScoreType = null } = dataSet.queryParameter.commonData?.header || {};
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
            const { templateScoreType = null } = dataSet.queryParameter.commonData?.header || {};
            const { scoreType, indicateType, detailEnabledFlag } = record.get([
              'scoreType',
              'indicateType',
              'detailEnabledFlag',
            ]);
            return (
              detailEnabledFlag ||
              scoreType === 'PRICE' ||
              !['SCORE', 'SCORE_NEW'].includes(templateScoreType) ||
              indicateType === 'PASS' ||
              getExistSecondOpenBidFlag(dataSet)
            );
          },
          defaultValue({ dataSet }) {
            const { templateScoreType = null } = dataSet.queryParameter.commonData?.header || {};
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
            const { templateScoreType = null } = dataSet.queryParameter.commonData?.header || {};
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
            const { templateScoreType = null } = dataSet.queryParameter.commonData?.header || {};
            const { indicateType, detailEnabledFlag } = record.get([
              'indicateType',
              'detailEnabledFlag',
            ]);
            return (
              detailEnabledFlag ||
              !['SCORE', 'SCORE_NEW'].includes(templateScoreType) ||
              indicateType === 'PASS' ||
              getExistSecondOpenBidFlag(dataSet)
            );
          },
          defaultValue({ dataSet }) {
            const { templateScoreType = null } = dataSet.queryParameter.commonData?.header || {};
            return templateScoreType === 'WEIGHT' ? 100 : null;
          },
        },
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.detailEnabledFlag`)
          .d('启用评分要素细项'),
        name: 'detailEnabledFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
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
        valueField: 'indicAssginAdjustId',
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
      },
      {
        name: 'tenantId',
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
      {
        name: 'adjustRecordId',
      },
      {
        name: 'sourceHeaderAdjustId',
      },
      {
        name: 'sourceEvaluateIndic',
      },
      {
        name: 'evaluateIndicAdjustFields',
        type: 'string',
      },
    ],
    events: {
      /**
       * 字段更新方法
       * @protected （屈臣氏二开）禁止修改、删除此方法名
       * indicateLov里面最小最大值屈臣氏固定返回0-5
       */
      update: ({ dataSet = {}, record = {}, name, value = null, oldValue }) => {
        const updateFields = (fields = []) => {
          if (record.status === 'add') {
            return;
          }

          const oldFields = record.get('evaluateIndicAdjustFields') || '';
          let newFields = oldFields.split(',').filter(Boolean);

          fields.forEach((field) => {
            const currentIndex = oldFields.indexOf(field);
            const currentValue = isObject(value) ? value[name] : value;
            const pristineValue = (record.get('sourceEvaluateIndic') || {})[name];
            // eslint-disable-next-line eqeqeq
            if (currentIndex > -1 && currentValue == pristineValue) {
              newFields.splice(currentIndex, 1);
            } else if (!newFields.includes(field)) {
              newFields.push(field);
            }
          });

          newFields = newFields.join(',');
          record.set('evaluateIndicAdjustFields', newFields);
        };
        const updateArrayFields = (field) => {
          if (record.status === 'add') {
            return;
          }

          const oldFields = record.get('evaluateIndicAdjustFields') || '';
          let newFields = oldFields.split(',').filter(Boolean);

          const currentValue = value;
          const pristineValue = (record.get('sourceEvaluateIndic') || {})[field] || [];

          const currentIndex = oldFields.indexOf(field);

          // 旧数据新数据个数不一致 一定是更改了
          let updatedFlag;
          if (pristineValue?.length !== currentValue?.length) {
            updatedFlag = true;
          } else {
            updatedFlag = pristineValue?.some((oldItem) => {
              // 第一步先看新数据中存不存在旧数据相等id的数据
              const currentItem = currentValue?.find(
                (item) => item?.evaluateExpertId === oldItem?.evaluateExpertId
              );
              // 新数据中不存在 则对比专家和权重 专家权重只要有一个不相等，则为修改
              if (currentItem) {
                const changeFlag =
                  // eslint-disable-next-line eqeqeq
                  oldItem?.expertWeight != currentItem?.expertWeight ||
                  // eslint-disable-next-line eqeqeq
                  oldItem?.assignFlag != currentItem?.assignFlag;
                if (changeFlag) {
                  return true;
                }
                return false;
              }
              // 新数据中不存在 则是被删除了算作修改;
              return true;
            });
          }
          if (currentIndex > -1 && !updatedFlag) {
            newFields.splice(currentIndex, 1);
          } else if (!newFields.includes(field)) {
            newFields.push(field);
          }

          newFields = newFields.join(',');
          record.set('evaluateIndicAdjustFields', newFields);
        };

        if (name === 'indicateLov') {
          const {
            queryParameter: { commonData = {} },
          } = dataSet;
          const { header = {}, organizationId } = commonData || {};
          const { rfxHeaderId, openBidOrder = null } = header || {};

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
          if (indicateType === 'PASS') {
            record.set('minScore', null);
            record.set('maxScore', null);
          } else {
            record.set(
              'minScore',
              (calculateType === 'AUTO' ? scoreIndicDetail?.lowestScore : minScore) || 0
            );
            record.set('maxScore', maxScore || 100);
          }
          record.set('mustApprovedFlag', mustApprovedFlag);
          record.set('qualifiedScore', qualifiedScore);
          record.set('sourceFrom', 'RFX');
          record.set('tenantId', organizationId);
          record.set('indicStatus', 'SUBMITTED');
          record.set('sourceHeaderId', rfxHeaderId);
          record.set('indicateRemark', remark || null);
          record.set('detailEnabledFlag', indicateType === 'PASS' ? 0 : detailEnabledFlag);
          record.set('scoreIndicId', scoreIndicId);
          record.set('weight', weight);
          record.set('openBidOrder', openBidOrder);
          record.set('scoreType', scoreType);
          record.set('calculateType', calculateType);
          record.set('evaluateIndicDetail', scoreIndicDetail || null);
          record.set('lovChangeFlag', 1);
          record.set('indicateLov', value || {});

          updateFields([
            'indicateName',
            'indicateId',
            'indicateCode',
            'indicateType',
            'minScore',
            'maxScore',
            'mustApprovedFlag',
            'scoreType',
            'weight',
            'calculateType',
          ]);
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
              updateFields(['indicateLovChangeFlag']);
            } else {
              record.set('scoreType', null);
              record.set('indicateRemark', null);
              record.set('detailEnabledFlag', 0);
              updateFields(['scoreType', 'indicateRemark', 'calculateType', 'detailEnabledFlag']);
            }
            record.set('calculateType', value);
          }
        } else if (name === 'indicateRemark') {
          record.set('indicateRemark', value);
          updateFields(['indicateRemark']);
        } else if (name === 'detailEnabledFlag') {
          record.set('detailEnabledFlag', value);
          updateFields(['minScore', 'detailEnabledFlag', 'maxScore']);
        } else if (name === 'minScore') {
          record.set('minScore', value);
          updateFields(['minScore']);
        } else if (name === 'maxScore') {
          record.set('maxScore', value);
          updateFields(['maxScore']);
        } else if (name === 'scoreType') {
          record.set('scoreType', value);
          updateFields(['scoreType']);
        } else if (name === 'weight') {
          record.set('weight', value);
          updateFields(['weight']);
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
                return value?.every((v) => v?.evaluateExpertAdjustId !== i?.evaluateExpertAdjustId);
              });
            }
            const differenceKeys = differenceData.map((i) => i.evaluateExpertAdjustId) || [];
            // 将当前更新数据 设置assignFlag为0，更新到assignedExpertList
            const newDiffData = differenceData.map((i) => {
              const oldFields = i.evaluateIndicAssignAdjustFields || '';
              let newFields = oldFields.split(',').filter(Boolean);
              const currentIndex = oldFields.indexOf('assignFlag');
              // 如果旧值中不存在assignFlag这个字段 则肯定是变化
              if (currentIndex === -1) {
                newFields.push('assignFlag');
              } else {
                // 原始值 目前取的是assignedExperts每一行的sourceEvaluateIndicAssign TODO
                const pristineValue = (i.sourceEvaluateIndicAssign || {}).assignFlag;
                // 如果旧值中存在 并且也是取消勾选，因为当前删除就是取消勾选 所以没变化
                if (pristineValue === 0) {
                  newFields.splice(currentIndex, 1);
                } else if (!newFields.includes('assignFlag')) {
                  newFields.push('assignFlag');
                }
              }
              newFields = newFields.join(',');
              return { ...i, assignFlag: 0, evaluateIndicAssignAdjustFields: newFields };
            });
            const newList = [...(value || []), ...(newDiffData || [])];

            // 专家分配弹框展开，处理联动
            if (record.getState('assignExpertsShow')) {
              // 与下拉选项联动，取消勾选
              optionsDs.records.forEach((r) => {
                if (differenceKeys.includes(r.get('evaluateExpertAdjustId'))) {
                  r.set('assignFlag', 0);
                  Object.assign(r, { isSelected: false });
                }
              });
            }
            record.set('assignedExpertList', newList);
          }
          updateArrayFields('assignedExperts');
        }
      },
    },
    transport: {
      destroy: ({ dataSet, data }) => {
        const {
          queryParameter: { commonData = {} },
        } = dataSet;
        const { organizationId } = commonData;
        const ids = data.map((item) => item.evaluateIndicAdjustId).filter(Boolean);

        return {
          url: `${Prefix}/${organizationId}/evaluate-indic-adjusts`,
          method: 'DELETE',
          data: ids,
        };
      },
    },
  };
};

// custKey 个性化单元前缀
// fromType 来源 'initialReview|''' 符合性检查|评分要素 符合性检查暂无个性化单元编码
const ExpertModalDS = (custKey = '', fromType = '') => {
  return {
    primaryKey: 'indicAssginAdjustId',
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
      {
        name: 'evaluateIndicAssignAdjustFields',
        type: 'string',
        defaultValue: null,
      },
      {
        name: 'adjustRecordId',
      },
      {
        name: 'sourceHeaderAdjustId',
      },
      {
        name: 'sourceEvaluateIndicAssign',
      },
    ],
    events: {
      update: ({ record, name, value = null }) => {
        const updateFields = (fields = []) => {
          if (record.status === 'add') {
            return;
          }

          const oldFields = record.get('evaluateIndicAssignAdjustFields') || '';
          let newFields = oldFields.split(',').filter(Boolean);

          fields.forEach((field) => {
            const currentIndex = oldFields.indexOf(field);
            const currentValue = isObject(value) ? value[name] : value;
            const pristineValue = (record.get('sourceEvaluateIndicAssign') || {})[name];
            // eslint-disable-next-line eqeqeq
            if (currentIndex > -1 && currentValue == pristineValue) {
              newFields.splice(currentIndex, 1);
            } else if (!newFields.includes(field)) {
              newFields.push(field);
            }
          });

          newFields = newFields.join(',');
          record.set('evaluateIndicAssignAdjustFields', newFields);
        };
        if (name === 'assignFlag') {
          record.set('assignFlag', value);
          updateFields(['assignFlag']);
        }
      },
    },
    transport: {
      read: ({ dataSet }) => {
        const {
          queryParameter: { commonData = {} },
        } = dataSet;
        const { organizationId } = commonData || {};

        return {
          url: `${Prefix}/${organizationId}/evaluate-indic-adjusts/assigns`,
          method: 'GET',
          data: {
            ...commonData,
            customizeUnitCode:
              fromType === 'initialReview'
                ? ''
                : `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.EXPERT_ASSIGN`,
          },
        };
      },
    },
  };
};

const ReferenceTemplateDS = (data = {}) => {
  const { bidRuleType, templateScoreType = null } = data;
  return {
    autoQuery: false,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.view.button.referTemplate`).d('参考模板'),
        name: 'templateLov',
        type: 'object',
        lovCode: 'SSRC.SCORE_TEMPL',
        // dynamicProps: {
        //   lovPara({ dataSet, record }) {
        //     const {
        //       queryParameter: { commonData = {} },
        //     } = dataSet;
        //     const { bidRuleType, templateScoreType, } = commonData?.header || {};
        //     // const bidRuleType = record.get('bidRuleType');
        //     // const templateScoreType = record.get('templateScoreType') || null;
        //     return {
        //       enabledFlag: 1,
        //       // expertCategory: type,
        //       scoreMode: bidRuleType,
        //       templatePurpose: 'EXPERT_SCORE',
        //       scoreTemplateScoreType: templateScoreType, // 模板评分类型,WEIGHT/SCORE
        //     };
        //   },
        // },
        lovPara: {
          enabledFlag: 1,
          // expertCategory: type,
          scoreMode: bidRuleType,
          templatePurpose: 'EXPERT_SCORE',
          scoreTemplateScoreType: templateScoreType, // 模板评分类型,WEIGHT/SCORE
        },
      },
      {
        name: 'reviewTemplateLov',
        type: 'object',
        lovCode: 'SSRC.SCORE_TEMPL',
        label: intl.get(`ssrc.inquiryHall.view.button.referTemplate`).d('参考模板'),
        lovPara: {
          enabledFlag: 1,
          templatePurpose: 'INITIAL_REVIEW',
        },
      },
    ],
  };
};

const assignedExpertOptionDS = () => {
  return {
    ...(expertModalDS() || {}),
    primaryKey: 'evaluateExpertAdjustId',
    events: {
      ...((expertModalDS() || {}).events || {}),

      // 更新
      update: ({ dataSet, record, name, value }) => {
        const updateFields = (fields = []) => {
          if (record.status === 'add') {
            return;
          }

          const oldFields = record.get('evaluateIndicAssignAdjustFields') || '';
          let newFields = oldFields.split(',').filter(Boolean);

          fields.forEach((field) => {
            const currentIndex = oldFields.indexOf(field);
            const currentValue = isObject(value) ? value[name] : value;
            const pristineValue = (record.get('sourceEvaluateIndicAssign') || {})[name];
            // eslint-disable-next-line eqeqeq
            if (currentIndex > -1 && currentValue == pristineValue) {
              newFields.splice(currentIndex, 1);
            } else if (!newFields.includes(field)) {
              newFields.push(field);
            }
          });

          newFields = newFields.join(',');
          record.set('evaluateIndicAssignAdjustFields', newFields);
        };

        const elementRecord = dataSet.getState('elementRecord');

        if (name === 'assignFlag' || name === 'expertWeight') {
          // 目前只有assignFlag 和expertWeight触发调整更新字段
          updateFields([name]);
        }

        if (
          ![
            'expertName',
            'assignFlag',
            'loginName',
            'evaluateExpertId',
            'indicAssginAdjustId',
            'evaluateIndicAssignAdjustFields',
          ].includes(name) &&
          record.get('assignFlag')
        ) {
          const optionData = dataSet.toData().filter((i) => i.assignFlag);
          elementRecord.set('assignedExperts', optionData);
        }
      },
    },
    transport: {
      ...((expertModalDS() || {}).transport || {}),
      read: ({ dataSet }) => {
        const {
          queryParameter: { commonProps = {} },
        } = dataSet;

        return {
          url: `${Prefix}/${getCurrentOrganizationId()}/evaluate-indic-adjusts/assigns`,
          method: 'GET',
          data: {
            ...commonProps,
            page: 0,
            size: 50, // 默认传50，避免下拉框数据未显示全
          },
          transformResponse: (res) => {
            const result = JSON.parse(res);
            const response = getResponse(result);
            if (response) {
              const { content = [] } = response;
              const elementRecord = dataSet.getState('elementRecord') || {};
              const assignedExperts = elementRecord.get('assignedExperts') || [];
              // 获取行上数据
              const getCurrentObj = (r) => {
                return assignedExperts.find(
                  (i) => i?.evaluateExpertAdjustId === r?.evaluateExpertAdjustId
                );
              };
              // 如果查到的下拉数据未外面显示，则不勾选当前数据，并且assignFlag置为0
              const data = content.map((r) => {
                const item = getCurrentObj(r);
                if (!item) {
                  return { ...r, assignFlag: 0 };
                } else {
                  // 处理个性化字段
                  return { ...r, ...item, assignFlag: 1 };
                }
              });
              return data;
            }
          },
        };
      },
    },
  };
};

export { ScoringElementTableDS, ExpertModalDS, ReferenceTemplateDS, assignedExpertOptionDS };

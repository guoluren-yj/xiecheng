import intl from 'utils/intl';
import { isEmpty, isNil, noop } from 'lodash';
import moment from 'moment';
import { math } from 'choerodon-ui/dataset';

import { getDateTimeFormat } from 'utils/utils';
import { EMAIL, NOT_CHINA_PHONE, PHONE } from 'utils/regExp';
import { ChunkUploadProps } from '@/utils/SsrcRegx';
import { NumberMax } from '@/utils/constants';
// import { dayHourMinuteToTimestamp } from '@/utils/utils';
import {
  biddingDisclosePriceTitle,
  trialBiddingDisclosePriceTitle,
  startingBiddingPriceTitle,
  trialStartingBiddingPriceTitle,
} from '@/routes/ssrc/InquiryHallNew/Update/utils/renderer';

const RfxInfoDS = (options = {}) => {
  const {
    documentTypeName = '',
    quotationName = '',
    bidFlag,
    japanBiddingTotalPrice = noop,
  } = options;
  const passwordValidator = (value, name, record) => {
    const testReg = record.get('internationalTelCode') === '+86' ? PHONE : NOT_CHINA_PHONE;
    if (!testReg.test(value) && value) {
      return intl.get('hzero.common.validation.phone').d('手机格式不正确');
    }
    return true;
  };

  /**
   * 获取资格预审时间
   * @param {*}
   */
  const getPrequalEndDate = ({ dataSet }) => {
    // 此处是个ds集合 主键名根据prequalGroupHeaderId来的，不好判断， 因此此处只处理不分组情况
    const prequalHeaderDsMap = dataSet.getQueryParameter('prequalHeaderDsMap');
    const prequalHeaderDs = prequalHeaderDsMap?.NONE;
    const prequalEndDate = prequalHeaderDs?.current?.get('prequalEndDate');
    return prequalEndDate;
  };

  /**
   * 是否是竞价大厅标识
   * @param { object } record
   * @param { object } dataSet
   */
  const isNewBiddingFlag = ({ record }) => {
    // const biddingHallFlag = dataSet.getState('biddingHallFlag'); // 开启竞价大厅配置
    const { sourceCategory, biddingFlag } = record.get(['sourceCategory', 'biddingFlag']) || {};
    // 竞价大厅标识
    const newBiddingFlag = sourceCategory === 'RFA' && (biddingFlag === 1 || biddingFlag === '1');
    return newBiddingFlag;
  };

  // JAPANESE_BIDDING or DUTCH_BIDDING 日式/荷兰
  const japOrDutchBidding = ({ record }) => {
    const { biddingMode } = record.get(['biddingMode']) || {};

    const flag =
      (biddingMode === 'JAPANESE_BIDDING' || biddingMode === 'DUTCH_BIDDING') &&
      isNewBiddingFlag({ record });
    return flag;
  };

  const dutchBidding = ({ record }) => {
    const { biddingMode } = record.get(['biddingMode']) || {};

    const flag = biddingMode === 'DUTCH_BIDDING' && isNewBiddingFlag({ record });
    return flag;
  };

  // DUTCH_BIDDING 日式/荷兰 总价
  const japOrDutchBiddingTotal = ({ record }) => {
    const { biddingTarget } = record.get(['biddingTarget']) || {};

    const flag = japOrDutchBidding({ record }) && biddingTarget === 'TOTAL_PRICE';
    return flag;
  };

  const fieldDisabledOrReadonly = ({ record, name }) => {
    const currentField = record.getField(name);

    let flag = false;

    if (!currentField) {
      return flag;
    }
    const disabledFlag = currentField?.get('disabled');
    const readOnlyFlag = currentField?.get('readOnly');

    flag = disabledFlag || readOnlyFlag;

    return flag;
  };

  return {
    fields: [
      {
        name: 'rfxTitle',
        type: 'string',
        required: true,
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.inquiryTitleRFX`, {
            documentTypeName,
          })
          .d(`{documentTypeName}标题`),
      },
      {
        name: 'sourceProjectNum',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourceProjectNum`).d('寻源项目编号'),
      },
      {
        name: 'sourceProjectName',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourceProjectName`).d('寻源项目名称'),
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sectionName`).d('标段名称'),
        name: 'sectionNameLov',
        // required: true,
        type: 'object',
        ignore: 'always',
        lovCode: 'SSRC.PROJECT_SRCTION',
        textField: 'sectionName',
        valueField: 'sectionCode',
        dynamicProps: {
          lovPara({ dataSet }) {
            const data = dataSet.toData();
            const { organizationId = null } = dataSet.queryParameter.commonProps || {};
            return {
              organizationId,
              sourceProjectId: data[0] && data[0].sourceProjectId,
              referenceFlag: 0,
            };
          },
        },
      },
      {
        name: 'sectionName',
        type: 'string',
        // label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sectionName`).d('标段名称'),
        bind: 'sectionNameLov.sectionName',
      },
      {
        name: 'sectionCode',
        bind: 'sectionNameLov.sectionCode',
      },
      {
        name: 'projectLineSectionId',
        bind: 'sectionNameLov.projectLineSectionId',
      },
      {
        name: 'budgetAmount',
        type: 'number',
        // step: 0.01,
        step: 0,
        min: '0',
        max: '99999999999999999999',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.budgetAmount`).d('预算金额'),
      },
      {
        name: 'totalNetEstimatedAmount',
        type: 'number',
        step: 0,
        min: '0',
        max: '99999999999999999999',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.totalNetEstimatedAmount`)
          .d('预估金额(不含税)'),
      },
      {
        name: 'totalEstimatedAmount',
        type: 'number',
        step: 0,
        min: '0',
        max: '99999999999999999999',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.totalEstimatedAmount`)
          .d('预估金额(含税)'),
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingTemplate`).d('寻源模板'),
        name: 'sourceTemplateLov',
        required: true,
        type: 'object',
        ignore: 'always',
        lovCode: 'SSRC.TEMPLATE_NAME',
        textField: 'templateName',
        valueField: 'templateId',
        dynamicProps: {
          lovPara({ record }) {
            const { sourceFrom, sourceProjectId } = record.get(['sourceFrom', 'sourceProjectId']);
            return {
              sourceCategory: 'RFX',
              secondarySourceCategory: bidFlag ? 'NEW_BID' : null,
              sourceFrom,
              sourceProjectId,
            };
          },
          help: ({ record }) => {
            const flag = record.get('latestFlag');
            if (flag === 'N') {
              return intl
                .get(`ssrc.inquiryHall.model.validation.sourceTemplate`)
                .d('非最新版本，你可以重新选择');
            }
          },
        },
      },
      {
        name: 'templateName',
        bind: 'sourceTemplateLov.templateName',
      },
      {
        name: 'templateId',
        bind: 'sourceTemplateLov.templateId',
      },
      {
        name: 'templateNum',
        bind: 'sourceTemplateLov.templateNum',
      },
      {
        name: 'preQualificationFlag',
      },
      {
        name: 'sourceNodes',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourceNodes`).d('寻源节点'),
        disabled: true,
      },
      {
        name: 'rfxRemark',
        type: 'string',
        maxLength: 1000,
        label: intl.get(`hzero.common.remark`).d('备注'),
      },
      {
        name: 'expertScoreType',
        type: 'string',
      },
      {
        name: 'expertSource',
        type: 'string',
      },
      {
        name: 'expertScoreType',
        type: 'string',
      },
      /**
       * Supplier with request
       * */
      {
        name: 'sourceMethod',
        required: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingApproach`).d('寻源方式'),
        type: 'string',
        lookupCode: 'SSRC.SOURCE_METHOD',
        dynamicProps: {
          help: ({ record }) =>
            ['OPEN', 'ALL_OPEN'].includes(record.get('sourceMethod'))
              ? intl
                  .get('ssrc.common.validate.sourceMethod')
                  .d(
                    '为保护您的个人信息，建议使用您的商务联系方式（如办公电话、商业邮箱，办公室地址等），而非私人联系信息。'
                  )
              : null,
          required({ record }) {
            const flag = !japOrDutchBidding({ record });
            return flag;
          },
          disabled({ record }) {
            // 日/荷兰 只有邀请
            const flag = japOrDutchBidding({ record });
            return flag;
          },
        },
      },
      {
        name: 'allowSourceSupplierStages',
        label: intl
          .get('ssrc.inquiryHall.model.inquiryHall.allowSourceSupplierStages')
          .d('可参与寻源供应商阶段'),
        type: 'string',
        disabled: true,
      },
      {
        name: 'organizationType',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.organizationType`).d('境内外关系'),
        type: 'string',
        lookupCode: 'SSRC.ORGANIZATION_TYPE',
      },
      {
        name: 'industryData',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.industryData`).d('行业类型'),
        type: 'string',
        // lookupCode: 'HPFM.INDUSTRY_FIRST',
        multiple: true,
        transformResponse: (value) => {
          let newValue = value || null;
          const correctValueFlag = value && !isEmpty(value) && typeof value === 'string';
          if (correctValueFlag) {
            const parsedValue = JSON.parse(value);
            newValue = parsedValue.map((item = {}) => {
              const { industryId = null } = item;
              return industryId;
            });
          }
          return newValue;
        },
        defaultValue: null,
      },
      {
        name: 'industryCategoryData',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.industryCategoryData`).d('主营品类'),
        multiple: true,
        // lovCode: 'HPFM.INDUSTRY.CATEGORY',
        transformResponse: (value) => {
          let newValue = value || null;
          const correctValueFlag = value && !isEmpty(value) && typeof value === 'string';
          if (correctValueFlag) {
            const parsedValue = JSON.parse(value);
            newValue = parsedValue.map((item = {}) => {
              const { categoryId = null } = item;
              return categoryId;
            });
          }
          return newValue;
        },
        defaultValue: null,
      },
      {
        name: 'expandScope',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.expandScope').d('拓展范围'),
        type: 'select',
        lookupCode: 'SSRC.RFQ_EXPAND_SCOPE',
        defaultValue: 'NO',
        help: intl
          .get('ssrc.inquiryHall.model.inquiryHall.expandScopeHelp')
          .d(
            '选择【平台供应商】单据发布后公告将会推送至会员供应商（包含非合作伙伴）以此拓展寻源的供应商范围。'
          ),
      },
      /**
       * rfx demand
       * */
      {
        name: 'sourceCategory',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingCategory`).d('寻源类别'),
        type: 'string',
        lookupCode: 'SSRC.SOURCE_CATEGORY',
        disabled: true,
        defaultValue: 'RFQ',
      },
      {
        name: 'secondarySourceCategory',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingCategory`).d('寻源类别'),
        type: 'string',
        lookupCode: 'SSRC.SECONDARY_SOURCE_CATEGORY',
        disabled: true,
        defaultValue: bidFlag ? 'NEW_BID' : null,
      },
      /**
       * 资格预审 -- 请移至 `./Prqual/PrequalHeaderDS.js` 查看
       * */
      {
        name: 'prequalEndDate',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prequalEndDate`).d('预审截止时间'),
        type: 'date',
        dynamicProps: {
          required({ record }) {
            const preQualificationFlag = record.get('preQualificationFlag') || 0;
            return preQualificationFlag;
          },
          max({ record, dataSet }) {
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            if (newBiddingFlag) {
              // 新竞价走此逻辑
              const {
                biddingOnlineSignInFlag,
                signInStartDate,
                biddingTrialBiddingFlag,
                startingTrialBiddingStartDate,
                quotationStartDate,
              } = record.get([
                'biddingOnlineSignInFlag',
                'signInStartDate',
                'biddingTrialBiddingFlag',
                'startingTrialBiddingStartDate',
                'quotationStartDate',
              ]);

              // 如果签到配置为真且有签到开始有值时间
              if (biddingOnlineSignInFlag && signInStartDate) {
                return 'signInStartDate';
              }

              // 模板中【试竞价】为【是】且试竞价截止时间有值时，只能选到试竞价截止时间后的时间
              if (biddingTrialBiddingFlag && startingTrialBiddingStartDate) {
                return 'startingTrialBiddingStartDate';
              }

              if (quotationStartDate) {
                return 'quotationStartDate';
              }
            }

            const quotationStartTime =
              record.get('quotationTime1') && record.get('quotationTime1').quotationStartTime1;
            if (quotationStartTime) {
              return quotationStartTime;
            }
          },
        },
      },
      {
        name: 'reviewMethod',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.reviewMethod`).d('审查方式'),
        type: 'string',
        dynamicProps: {
          required({ record }) {
            const preQualificationFlag = record.get('preQualificationFlag') || 0;
            return preQualificationFlag;
          },
        },
        lookupCode: 'SSRC.REVIEW_METHOD',
        defaultValue: 'QUALIFIED',
      },
      {
        name: 'qualifiedLimit',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.qualifiedLimit`).d('合格上限'),
        type: 'number',
        step: 1,
        dynamicProps: {
          required({ dataSet, record }) {
            const preQualificationFlag = record.get('preQualificationFlag') || 0;
            return (
              dataSet.current.get('reviewMethod') === 'LIMITED_QUANTITY' && preQualificationFlag
            );
          },
        },
      },
      {
        name: 'preGroupLeaderLov',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.pretrialGroupMain`).d('预审小组组长'),
        type: 'object',
        ignore: 'always',
        lovCode: 'SSRC.PREQUAL_USER',
        textField: 'realName',
        valueField: 'id',
        dynamicProps: {
          lovPara({ dataSet }) {
            const { organizationId = null } = dataSet.queryParameter.commonProps || {};
            return {
              organizationId,
            };
          },
          required({ record }) {
            const preQualificationFlag = record.get('preQualificationFlag') || 0;
            return !!preQualificationFlag;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.pretrialGroupMember`).d('预审小组成员'),
        name: 'preGroupMemberLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SSRC.PREQUAL_USER',
        textField: 'realName',
        valueField: 'id',
        multiple: true,
        dynamicProps: {
          lovPara({ dataSet }) {
            const { organizationId = null } = dataSet.queryParameter.commonProps || {};
            return {
              organizationId,
            };
          },
        },
      },
      {
        name: 'enableScoreFlag',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.enableScoreFlag`).d('启用评分细项'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'prequalRemark',
        label: intl.get(`ssrc.common.qualRequirements`).d('资质要求'),
        type: 'string',
        maxLength: 800,
      },
      {
        name: 'prequalHeaderId',
        type: 'string',
      },
      {
        name: 'prequalAttachmentUuid',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prequalAttachment`).d('资格预审文件'),
        type: 'string',
        ...(ChunkUploadProps || {}),
        dynamicProps: {
          required({ record }) {
            const preQualificationFlag = record.get('preQualificationFlag') || 0;
            return !!preQualificationFlag;
          },
        },
      },
      /**
       * 报价部分
       * */
      {
        // label: intl.get(`ssrc.inquiryHall.model.inquiryHall.startFlag`).d('发布即开始'),
        name: 'startFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        dynamicProps: {
          defaultValue({ record, dataSet }) {
            let defaultValue = 1;
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            if (newBiddingFlag) {
              defaultValue = 0;
            }
            return defaultValue;
          },
          label({ record, dataSet }) {
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            if (newBiddingFlag) {
              return intl.get(`ssrc.inquiryHall.model.inquiryHall.startingBidding`).d(`竞价`);
            }
            return intl.get(`ssrc.inquiryHall.model.inquiryHall.startFlag`).d('发布即开始');
          },
          required({ record, dataSet }) {
            // 竞价大厅-竞价单标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            return newBiddingFlag;
          },
        },
        defaultValue: 0,
      },
      {
        name: 'startQuotationRunningDuration',
        type: 'number',
      },
      {
        name: 'quotationDay',
        type: 'number',
        placeholder: intl.get('hzero.common.date.unit.day').d('天'),
        step: 1,
        min: 0,
        defaultValidationMessages: { valueMissingNoLabel: '' },
        dynamicProps: {
          required({ record }) {
            const startFlag = record.get('startFlag');
            const preQualificationFlag = record.get('preQualificationFlag');
            const biddingPriceFlag = record.get('sourceCategory') === 'RFA';
            const quotationHour = record.get('quotationHour');
            const quotationMinute = record.get('quotationMinute');
            const quotationDay = record.get('quotationDay');

            return (
              startFlag &&
              !preQualificationFlag &&
              !biddingPriceFlag &&
              !quotationHour &&
              !quotationMinute &&
              !quotationDay &&
              record.get('quotationEndDateFlag')
            );
          },
          disabled({ record }) {
            const biddingPriceFlag = record.get('sourceCategory') === 'RFA';
            const quotationEndDateFlag = record.get('quotationEndDateFlag');
            const preQualificationFlag = record.get('preQualificationFlag');

            return biddingPriceFlag || !quotationEndDateFlag || preQualificationFlag;
          },
        },
      },
      {
        name: 'quotationHour',
        type: 'number',
        step: 1,
        min: 0,
        defaultValidationMessages: { valueMissingNoLabel: '' },
        dynamicProps: {
          required({ record }) {
            const startFlag = record.get('startFlag');
            const preQualificationFlag = record.get('preQualificationFlag');
            const biddingPriceFlag = record.get('sourceCategory') === 'RFA';
            const quotationHour = record.get('quotationHour');
            const quotationMinute = record.get('quotationMinute');
            const quotationDay = record.get('quotationDay');
            return (
              startFlag &&
              !preQualificationFlag &&
              !biddingPriceFlag &&
              !quotationHour &&
              !quotationMinute &&
              !quotationDay &&
              record.get('quotationEndDateFlag')
            );
          },
          disabled({ record }) {
            const biddingPriceFlag = record.get('sourceCategory') === 'RFA';
            const quotationEndDateFlag = record.get('quotationEndDateFlag');
            const preQualificationFlag = record.get('preQualificationFlag');

            return biddingPriceFlag || !quotationEndDateFlag || preQualificationFlag;
          },
        },
      },
      {
        name: 'quotationMinute',
        type: 'number',
        step: '0.01',
        precision: 2,
        min: 0,
        dynamicProps: {
          required({ record }) {
            const startFlag = record.get('startFlag');
            const preQualificationFlag = record.get('preQualificationFlag');
            const biddingPriceFlag = record.get('sourceCategory') === 'RFA';
            const quotationHour = record.get('quotationHour');
            const quotationMinute = record.get('quotationMinute');
            const quotationDay = record.get('quotationDay');

            return (
              startFlag &&
              !preQualificationFlag &&
              !biddingPriceFlag &&
              !quotationHour &&
              !quotationMinute &&
              !quotationDay &&
              record.get('quotationEndDateFlag')
            );
          },
          disabled({ record }) {
            const biddingPriceFlag = record.get('sourceCategory') === 'RFA';
            const quotationEndDateFlag = record.get('quotationEndDateFlag');
            const preQualificationFlag = record.get('preQualificationFlag');

            return biddingPriceFlag || !quotationEndDateFlag || preQualificationFlag;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationRound`).d('报价轮次'),
        name: 'quotationRounds',
        type: 'number',
        min: 2,
        max: 10,
        step: 1,
        precision: 0,
        dynamicProps: {
          required({ record }) {
            const roundQuotationRule = record.get('roundQuotationRule');
            const autoRoundQuotationFlag =
              roundQuotationRule === 'AUTO' ||
              roundQuotationRule === 'AUTO_CHECK' ||
              roundQuotationRule === 'AUTO_SCORE';

            return !!autoRoundQuotationFlag;
          },
        },
      },
      {
        name: 'ssrcCustomCurrentNewDateTime', // 前端自定义字段，记录当前时间
        defaultValue: new Date(),
      },
      {
        // label: intl
        //   .get(`ssrc.inquiryHall.model.inquiryHall.quotationStartTimeRFX`, { quotationName })
        //   .d(`{quotationName}开始时间`),
        name: 'quotationStartDate',
        type: 'dateTime',
        format: getDateTimeFormat(),
        // min: new Date(),
        dynamicProps: {
          required({ record, dataSet }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });

            // 竞价大厅逻辑
            if (newBiddingFlag) {
              // 如果选择自定义时间，则必输
              return newBiddingFlag;
            }
            // 原有逻辑
            const startFlag = record.get('startFlag');
            const roundQuotationRule = record.get('roundQuotationRule');
            const autoRoundQuotationFlag =
              roundQuotationRule === 'AUTO' ||
              roundQuotationRule === 'AUTO_CHECK' ||
              roundQuotationRule === 'AUTO_SCORE';
            const requiredFlag = !startFlag && !autoRoundQuotationFlag;
            return requiredFlag;
          },
          label({ record, dataSet }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            return newBiddingFlag
              ? intl.get(`ssrc.inquiryHall.model.biddingTime.biddingStartTime`).d('竞价开始时间')
              : intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.quotationStartTimeRFX`, {
                    quotationName,
                  })
                  .d(`{quotationName}开始时间`);
          },
        },
        computedProps: {
          min({ record, dataSet, name }) {
            const currentFieldDisabledOrReadonly = fieldDisabledOrReadonly({ record, name });
            if (currentFieldDisabledOrReadonly) {
              return null;
            }

            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            if (newBiddingFlag) {
              const prequalEndDate = getPrequalEndDate({ dataSet });
              const {
                // startingTrialBiddingStartDate,
                signInEndDate,
                biddingTrialBiddingFlag,
                biddingOnlineSignInFlag,
                startingTrialBiddingEndDate,
                preQualificationFlag,
              } = record.get([
                // 'startingTrialBiddingStartDate',
                'signInEndDate',
                'biddingTrialBiddingFlag',
                'biddingOnlineSignInFlag',
                'startingTrialBiddingEndDate',
                'preQualificationFlag',
              ]);
              // 模板中【试竞价】为【是】且试竞价截止时间有值时，只能选到试竞价截止时间后的时间
              if (biddingTrialBiddingFlag && startingTrialBiddingEndDate) {
                return 'startingTrialBiddingEndDate';
              }
              // 模板中【试竞价】为【否】&【在线签到】为【是】&签到截止时间有值时，只能选到签到截止时间后的时间
              if (!biddingTrialBiddingFlag && biddingOnlineSignInFlag && signInEndDate) {
                return 'signInEndDate';
              }
              // 如果存在资格预审，则开始时间最小值就是截止时间
              if (
                !biddingOnlineSignInFlag &&
                !biddingTrialBiddingFlag &&
                preQualificationFlag &&
                prequalEndDate
              ) {
                return moment(prequalEndDate).add(1, 's');
              }
              return 'ssrcCustomCurrentNewDateTime';
            }
            return 'ssrcCustomCurrentNewDateTime';
          },
          max({ record, dataSet, name }) {
            const currentFieldDisabledOrReadonly = fieldDisabledOrReadonly({ record, name });
            if (currentFieldDisabledOrReadonly) {
              return null;
            }

            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            const { quotationEndDate, startingBiddingRunningDurationFlag } = record.get([
              'quotationEndDate',
              'startingBiddingRunningDurationFlag',
            ]);
            if (newBiddingFlag && quotationEndDate && !startingBiddingRunningDurationFlag) {
              // 日/荷兰 正式竞价截止时间不能编辑
              const biddingHallJapOrDutchTotal = japOrDutchBiddingTotal({ record });
              if (biddingHallJapOrDutchTotal) {
                return null;
              }

              return moment(quotationEndDate).subtract(1, 's');
            }
          },
        },
      },
      {
        // label: intl
        //   .get(`ssrc.inquiryHall.model.inquiryHall.quotationDeadlineRFX`, {
        //     quotationName,
        //   })
        //   .d(`{quotationName}截止时间`),
        name: 'quotationEndDate',
        type: 'dateTime',
        // min: 'quotationStartDate',
        format: getDateTimeFormat(),
        dynamicProps: {
          required({ record, dataSet }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            // 竞价大厅逻辑
            if (newBiddingFlag) {
              // 如果选择自定义时间，则必输
              return newBiddingFlag && !japOrDutchBiddingTotal({ record });
            }
            // 原有逻辑
            return (
              (!record.get('startFlag') &&
                (record.get('sourceCategory') === 'RFQ' ||
                  record.get('secondarySourceCategory') === 'NEW_BID') &&
                record.get('quotationEndDateFlag')) ||
              record.get('quotationRunningDurationFlag') === 1
            );
          },
          disabled({ record }) {
            return !record.get('quotationEndDateFlag') || japOrDutchBiddingTotal({ record });
          },
          label({ record, dataSet }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            return newBiddingFlag
              ? intl.get(`ssrc.inquiryHall.model.biddingTime.biddingEndDate`).d('竞价截止时间')
              : intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.quotationDeadlineRFX`, {
                    quotationName,
                  })
                  .d(`{quotationName}截止时间`);
          },
        },
        computedProps: {
          min({ record, dataSet, name }) {
            // 日/荷兰 正式竞价截止时间不能编辑
            const currentFieldDisabledOrReadonly = fieldDisabledOrReadonly({ record, name });
            if (currentFieldDisabledOrReadonly) {
              return null;
            }

            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            if (newBiddingFlag) {
              const { quotationStartDate } = record.get(['quotationStartDate']);
              // if ((biddingTrialBiddingFlag && startingTrialBiddingEndDate) && startFlag) {
              //   return moment(new Date()).format(DEFAULT_DATETIME_FORMAT);
              // };
              // 如果【在线签到】和【试竞价】都为否，并且勾选了【发布即开始】，只能选到此刻之后的时间
              // 其余情况需校验【竞价开始时间】是否有值，有值则只能选到【竞价开始时间】之后的时间，没值则只能选到此刻之后的时间
              if (quotationStartDate) {
                return moment(quotationStartDate).add(1, 's');
              }
              return 'ssrcCustomCurrentNewDateTime';
            }
            return 'quotationStartDate';
          },
          max({ record, dataSet, name }) {
            // 日/荷兰 正式竞价截止时间不能编辑
            const currentFieldDisabledOrReadonly = fieldDisabledOrReadonly({ record, name });
            if (currentFieldDisabledOrReadonly) {
              return null;
            }

            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            if (newBiddingFlag) {
              const {
                biddingTarget,
                biddingTotalPricePrinciple,
                biddingSupplementPriceStartFlag,
                biddingSupplementPriceStartDate,
              } = record.get([
                'biddingTarget',
                'biddingTotalPricePrinciple',
                'biddingSupplementPriceStartFlag',
                'biddingSupplementPriceStartDate',
              ]);
              const totalPriceFlag =
                biddingTarget === 'TOTAL_PRICE' &&
                biddingTotalPricePrinciple === 'TOTAL_PRICE_REQUIRED';
              // 如果竞价对象是总价竞价且总价竞价原则是总价必输，则补充单价可维护
              if (
                totalPriceFlag &&
                biddingSupplementPriceStartDate &&
                !biddingSupplementPriceStartFlag
              ) {
                // 自定义时间才校验
                return 'biddingSupplementPriceStartDate';
              }
            }
          },
        },
      },
      {
        name: 'quotationEndDateFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        // label: intl.get(`ssrc.inquiryHall.model.inquiryHall.biddingRunningTime`).d('竞价运行时间'),
        name: 'quotationRunningDuration',
        type: 'number',
      },
      {
        name: 'biddingRunnintDay',
        type: 'number',
        placeholder: intl
          .get('ssrc.inquiryHall.view.inquiryHall.durationRunningTimeDay')
          .d('运行时间(天)'),
        // step: 1,
        precision: 0,
        min: 0,
        defaultValidationMessages: { valueMissingNoLabel: '' },
        dynamicProps: {
          required({ record, dataSet }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            const {
              preQualificationFlag,
              sourceCategory,
              biddingRunnintDay,
              biddingRunnintHour,
              biddingRunnintMinute,
              startingBiddingRunningDurationFlag,
              startFlag,
            } = record.get([
              'preQualificationFlag',
              'sourceCategory',
              'biddingRunnintDay',
              'biddingRunnintHour',
              'biddingRunnintMinute',
              'startingBiddingRunningDurationFlag',
              'startFlag',
            ]);
            const sourceControllerOldFlag = dataSet.getState('sourceControllerOldFlag');
            const biddingPriceFlag = sourceCategory === 'RFA';

            if (newBiddingFlag) {
              // 新竞价逻辑
              const flag =
                newBiddingFlag &&
                startingBiddingRunningDurationFlag &&
                !biddingRunnintDay &&
                !biddingRunnintMinute &&
                !biddingRunnintHour &&
                !japOrDutchBiddingTotal({ record });

              return flag;
            }

            /**
             * 老竞价，老过程控制，包含资格预审
             *
             * 这种单子必须维护运行时间，否则可能存在单子无法截止的场景
             * */

            const biddingOldControllerWithPrequal =
              preQualificationFlag && sourceControllerOldFlag && !newBiddingFlag && !startFlag;

            const requiredFlag =
              (!preQualificationFlag || biddingOldControllerWithPrequal) &&
              biddingPriceFlag &&
              !biddingRunnintDay &&
              !biddingRunnintMinute &&
              !biddingRunnintHour;

            // 原有逻辑
            return requiredFlag;
          },
          step({ record, dataSet }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            if (!newBiddingFlag) {
              // 非竞价大厅-竞价单保持原有逻辑保留2位
              return 1;
            }
          },
        },
      },
      {
        name: 'biddingRunnintHour',
        type: 'number',
        min: 0,
        precision: 0,
        defaultValidationMessages: { valueMissingNoLabel: '' },
        placeholder: intl.get('hzero.common.date.unit.hours').d('小时'),
        dynamicProps: {
          required({ record, dataSet }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            const {
              preQualificationFlag,
              sourceCategory,
              biddingRunnintDay,
              biddingRunnintHour,
              biddingRunnintMinute,
              startingBiddingRunningDurationFlag,
              startFlag,
            } = record.get([
              'preQualificationFlag',
              'sourceCategory',
              'biddingRunnintDay',
              'biddingRunnintHour',
              'biddingRunnintMinute',
              'startingBiddingRunningDurationFlag',
              'startFlag',
            ]);
            const sourceControllerOldFlag = dataSet.getState('sourceControllerOldFlag');
            const biddingPriceFlag = sourceCategory === 'RFA';

            if (newBiddingFlag) {
              // 新竞价逻辑
              const flag =
                newBiddingFlag &&
                startingBiddingRunningDurationFlag &&
                !biddingRunnintDay &&
                !biddingRunnintMinute &&
                !biddingRunnintHour &&
                !japOrDutchBiddingTotal({ record });

              return flag;
            }

            const biddingOldControllerWithPrequal =
              preQualificationFlag && sourceControllerOldFlag && !newBiddingFlag && !startFlag;

            // 原有逻辑
            return (
              (!preQualificationFlag || biddingOldControllerWithPrequal) &&
              biddingPriceFlag &&
              !biddingRunnintDay &&
              !biddingRunnintMinute &&
              !biddingRunnintHour
            );
          },
          step({ record, dataSet }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            if (!newBiddingFlag) {
              // 非竞价大厅-竞价单保持原有逻辑保留2位
              return 1;
            }
          },
        },
      },
      {
        name: 'biddingRunnintMinute',
        type: 'number',
        // precision: 2,
        min: 0,
        defaultValidationMessages: { valueMissingNoLabel: '' },
        placeholder: intl.get('hzero.common.date.unit.minutes').d('分钟'),
        dynamicProps: {
          required({ record, dataSet }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            const {
              preQualificationFlag,
              sourceCategory,
              biddingRunnintDay,
              biddingRunnintHour,
              biddingRunnintMinute,
              startingBiddingRunningDurationFlag,
              startFlag,
            } = record.get([
              'preQualificationFlag',
              'sourceCategory',
              'biddingRunnintDay',
              'biddingRunnintHour',
              'biddingRunnintMinute',
              'startingBiddingRunningDurationFlag',
              'startFlag',
            ]);
            const sourceControllerOldFlag = dataSet.getState('sourceControllerOldFlag');
            const biddingPriceFlag = sourceCategory === 'RFA';

            if (newBiddingFlag) {
              // 新竞价逻辑
              const flag =
                newBiddingFlag &&
                startingBiddingRunningDurationFlag &&
                !biddingRunnintDay &&
                !biddingRunnintMinute &&
                !biddingRunnintHour &&
                !japOrDutchBiddingTotal({ record });

              return flag;
            }

            const biddingOldControllerWithPrequal =
              preQualificationFlag && sourceControllerOldFlag && !newBiddingFlag && !startFlag;

            // 原有逻辑
            return (
              (!preQualificationFlag || biddingOldControllerWithPrequal) &&
              biddingPriceFlag &&
              !biddingRunnintDay &&
              !biddingRunnintMinute &&
              !biddingRunnintHour
            );
          },
          step({ record, dataSet }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            if (newBiddingFlag) {
              return null;
            }
            // 非竞价大厅-竞价单保持原有逻辑保留2位
            return 0.02;
          },
          precision({ record, dataSet }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            if (newBiddingFlag) {
              return 1;
            }
            return 2;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationInterval`).d('报价间隔时间'),
        name: 'quotationInterval',
        type: 'number',
        step: 1,
        dynamicProps: {
          required({ record, dataSet }) {
            // 竞价大厅 寻源模板中【寻源类别】为【竞价】且【竞价模式】为【英式竞价】且【报价类型】是【单价竞价】且【报价次序】为【序列】时展示
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            if (newBiddingFlag) {
              const { biddingMode, quotationOrderType, biddingTarget } = record.get([
                'biddingMode', // 竞价模式
                'quotationOrderType', // 竞价大厅使用的 报价次序
                'biddingTarget',
              ]);
              // sourceCategory === 'RFA' && (biddingFlag === 1 || biddingFlag === '1') 为竞价大厅
              return (
                biddingMode === 'BRITISH_BIDDING' &&
                biddingTarget === 'UNIT_PRICE' &&
                quotationOrderType === 'SEQUENCE'
              );
            }

            return (
              record.get('sourceCategory') === 'RFA' &&
              record.get('quotationOrderType') !== 'PARALLEL'
            );
          },
          disabled({ record }) {
            return record.get('quotationOrderType') === 'PARALLEL';
          },
          min({ record, dataSet }) {
            // 非负非零正数
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            return newBiddingFlag ? 1 : 0;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationOrderType`).d('报价次序'),
        name: 'quotationOrderType',
        type: 'string',
        // lookupCode: 'SSRC.QUOTATION_ORDER_TYPE',
        dynamicProps: {
          required({ record, dataSet }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            if (newBiddingFlag) {
              const { biddingMode, biddingTarget, quotationType } = record?.get([
                'biddingMode', // 竞价模式
                'biddingTarget', // 竞价对象
                'quotationType',
              ]);
              // 寻源模板中【寻源类别】为【竞价】且【竞价模式】为【英式竞价】且【报价类型】是【单价竞价】且【报价方式】为【线上报价】时展示，任一不满足时隐藏
              // sourceCategory === 'RFA' && (biddingFlag === 1 || biddingFlag === '1') 为竞价大厅
              const requiredFlag =
                biddingMode === 'BRITISH_BIDDING' &&
                biddingTarget === 'UNIT_PRICE' &&
                quotationType === 'ONLINE'; // BRITISH_BIDDING 英式竞价
              return requiredFlag;
            }
            return record.get('sourceCategory') === 'RFA';
          },
          lookupCode({ record, dataSet }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            if (newBiddingFlag) {
              return 'SSRC.BIDDING_QUOTATION_ORDER';
            }
            return 'SSRC.QUOTATION_ORDER_TYPE';
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.auctionRule`).d('竞价规则'),
        name: 'auctionRule',
        type: 'string',
        lookupCode: 'SSRC.RFA_AUCTION_RULE',
        defaultValue: 'NONE',
        dynamicProps: {
          required({ record, dataSet }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            if (newBiddingFlag) {
              // const { sourceCategory, biddingMode } = record.get(['sourceCategory', 'biddingMode']);
              // return sourceCategory === 'RFA' && biddingMode === 'BRITISH_BIDDING';
              return false;
            }
            return record.get('sourceCategory') === 'RFA';
          },
        },
      },
      {
        // label: intl.get(`ssrc.inquiryHall.model.inquiryHall.openRule`).d('公开规则'),
        name: 'openRule',
        type: 'string',
        lookupCode: 'SSRC.RFA_OPEN_RULE',
        defaultValue: 'OPEN_IDENTITY_OPEN_QUOTE',
        dynamicProps: {
          required({ record }) {
            return record.get('sourceCategory') === 'RFA';
          },
          label({ record, dataSet }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            return newBiddingFlag
              ? intl.get(`ssrc.inquiryHall.model.biddingRules.openRuleOfData`).d('数据公开规则')
              : intl.get(`ssrc.inquiryHall.model.inquiryHall.openRule`).d('公开规则');
          },
        },
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.rankRule').d('排名规则'),
        name: 'rankRule',
        type: 'string',
        lookupCode: 'SSRC.RANK_RULE',
        defaultValue: 'UNIT_PRICE',
        dynamicProps: {
          required({ record, dataSet }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            if (newBiddingFlag) {
              // 寻源模板中【寻源类别】为【竞价】且【竞价模式】为【英式竞价】时
              const { sourceCategory, biddingMode } = record.get(['sourceCategory', 'biddingMode']);
              return sourceCategory === 'RFA' && biddingMode === 'BRITISH_BIDDING';
            }
            return record.get('sourceCategory') === 'RFA';
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.autoDeferFlag`).d('启用自动延时'),
        name: 'autoDeferFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        dynamicProps: {
          disabled({ record }) {
            // 日式/荷兰 没有延时
            const flag = japOrDutchBiddingTotal({ record });

            return flag;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.autoDeferDuration`).d('延时时长'),
        name: 'autoDeferDuration',
        type: 'number',
        // min: 0,
        max: '99999999999999999999',
        dynamicProps: {
          required({ record, dataSet }) {
            // 竞价大厅 寻源模板中【寻源类别】为【竞价】且【竞价模式】为【英式竞价】且【启用自动延时】为【启用】时展示，任一不满足时隐藏
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            const { autoDeferFlag, biddingMode } = record.get(['autoDeferFlag', 'biddingMode']);
            if (newBiddingFlag) {
              return autoDeferFlag === 1 && biddingMode === 'BRITISH_BIDDING';
            }
            // 原有逻辑
            return record.get('sourceCategory') === 'RFA' && record.get('autoDeferFlag') === 1;
          },
          disabled({ record }) {
            return (
              !(record.get('sourceCategory') === 'RFA' && record.get('autoDeferFlag') === 1) ||
              japOrDutchBiddingTotal({ record })
            );
          },
          min({ record, dataSet }) {
            // 竞价大厅标识 非负非零正数
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            // 新竞价最小值为1，否则保持原有逻辑
            return newBiddingFlag ? 1 : 0;
          },
          precision({ record, dataSet }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            if (newBiddingFlag) {
              // 新竞价 分钟保持小数点后2位
              return 1;
            }
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.autoDeferType`).d('延时触发规则'),
        name: 'autoDeferType',
        type: 'string',
        lookupCode: 'SSRC.AUTO_DEFER_TYPE', // 延时触发规则
        dynamicProps: {
          disabled({ record, dataSet }) {
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            return !newBiddingFlag || japOrDutchBiddingTotal({ record });
          },
          required({ record, dataSet }) {
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            const flag = newBiddingFlag && !japOrDutchBiddingTotal({ record });
            return flag;
          },
        },
      },
      {
        label: intl
          .get('ssrc.sourceTemplate.model.inquiryHall.autoDeferPeriod')
          .d('延时触发时间段'),
        name: 'autoDeferPeriod',
        type: 'number',
        // disabled: true,
        step: 0.1,
        min: 1,
        dynamicProps: {
          disabled({ dataSet, record }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            const { autoDeferFlag, biddingMode } = record.get(['autoDeferFlag', 'biddingMode']);

            /* 寻源模板中【寻源类别】为【竞价】且【竞价模式】为【英式竞价】且【启用自动延时】为【启用】时展示，任一不满足时隐藏 */
            const flag = newBiddingFlag && autoDeferFlag && biddingMode === 'BRITISH_BIDDING';

            return !flag;
          },
          required({ dataSet, record }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            const { autoDeferFlag, biddingMode } = record.get(['autoDeferFlag', 'biddingMode']);
            /* 寻源模板中【寻源类别】为【竞价】且【竞价模式】为【英式竞价】且【启用自动延时】为【启用】时展示，任一不满足时隐藏 */
            const flag = newBiddingFlag && autoDeferFlag && biddingMode === 'BRITISH_BIDDING';

            return flag;
          },
          precision({ dataSet, record }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            if (newBiddingFlag) {
              // 新竞价精度为1
              return 1;
            }
          },
        },
      },

      /**
       * 竞价大厅
       */
      // 签到
      /**
       * 1. biddingOnlineSignInFlag, signInStartFlag, signInStartDate [wrapper]
         2. signInRunningDuration, signInEndDate, signInRunningDurationFlag, [day, hour, minute, wrap]
      */
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.signInOnline').d('在线签到'),
        name: 'biddingOnlineSignInFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'signStartWrapper',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.signIn`).d(`签到`),
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.signIn`).d(`签到`),
        name: 'signInStartFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        dynamicProps: {
          required({ record, dataSet }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            const { biddingOnlineSignInFlag } = record.get(['biddingOnlineSignInFlag']);

            const requiredFlag = newBiddingFlag && biddingOnlineSignInFlag;
            return requiredFlag;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.signStartTimeRFX`).d(`签到开始时间`),
        name: 'signInStartDate',
        type: 'dateTime',
        format: getDateTimeFormat(),
        dynamicProps: {
          required({ record, dataSet }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            const { signInStartFlag, biddingOnlineSignInFlag } = record.get([
              'signInStartFlag',
              'biddingOnlineSignInFlag',
            ]);
            const requiredFlag = !signInStartFlag && newBiddingFlag && biddingOnlineSignInFlag;
            return requiredFlag;
          },
        },
        computedProps: {
          min({ record, dataSet }) {
            const prequalEndDate = getPrequalEndDate({ dataSet });
            const { preQualificationFlag } = record.get(['preQualificationFlag']);
            // 如果存在资格预审，则开始时间最小值就是截止时间
            if (preQualificationFlag && prequalEndDate) return prequalEndDate;
            return 'ssrcCustomCurrentNewDateTime';
          },
          max({ record }) {
            const { signInEndDate, signInRunningDurationFlag } = record.get([
              'signInEndDate',
              'signInRunningDurationFlag',
            ]);
            if (signInRunningDurationFlag) return null;
            if (signInEndDate) return moment(signInEndDate).subtract(1, 's');
          },
        },
      },
      {
        name: 'signEndWrapper',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.signIn`).d(`签到`),
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.signInEndDate`).d(`签到截止时间`),
        name: 'signInEndDate',
        type: 'dateTime',
        format: getDateTimeFormat(),
        dynamicProps: {
          required({ record, dataSet }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            const { signInRunningDurationFlag, biddingOnlineSignInFlag } = record.get([
              'signInRunningDurationFlag',
              'biddingOnlineSignInFlag',
            ]);

            const requiredFlag =
              biddingOnlineSignInFlag && newBiddingFlag && !signInRunningDurationFlag;
            return requiredFlag;
          },
        },
        computedProps: {
          min({ record }) {
            const currentField = record.getField('signInEndDate');

            if (!currentField) {
              return null;
            }
            const disabledFlag = currentField?.get('disabled');
            const readOnlyFlag = currentField?.get('readOnly');
            if (disabledFlag || readOnlyFlag) {
              return null;
            }

            const { signInStartDate, biddingOnlineSignInFlag } = record.get([
              'signInStartDate',
              'biddingOnlineSignInFlag',
            ]);
            // moment(new Date(signInStartDate).getTime()/1000 + 1)*1000).format(DEFAULT_DATETIME_FORMAT) 不能相同，最起码加1秒
            const min =
              signInStartDate && biddingOnlineSignInFlag
                ? moment(signInStartDate).add(1, 's')
                : 'ssrcCustomCurrentNewDateTime';
            return min;
          },
          max({ record }) {
            const {
              startingTrialBiddingStartFlag,
              biddingTrialBiddingFlag,
              startingTrialBiddingStartDate,
              quotationStartDate,
              startFlag,
            } = record.get([
              'startingTrialBiddingStartFlag',
              'startingTrialBiddingStartDate',
              'quotationStartDate',
              'biddingTrialBiddingFlag',
              'startFlag',
            ]);
            /**
             *  a.如果【试竞价】为【是】，判断试竞价开始时间是否有值，有值则为最大值
                b.如果【试竞价】为【否】，判断竞价开始时间是否有值，有值则为最大值
             */
            if (
              biddingTrialBiddingFlag &&
              !startingTrialBiddingStartFlag &&
              startingTrialBiddingStartDate
            ) {
              return 'startingTrialBiddingStartDate';
            }
            if (!biddingTrialBiddingFlag && !startFlag && quotationStartDate) {
              return 'quotationStartDate';
            }
          },
        },
      },
      {
        name: 'signInRunningDurationFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        dynamicProps: {
          required({ record, dataSet }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            const { biddingOnlineSignInFlag } = record.get(['biddingOnlineSignInFlag']);

            const requiredFlag = newBiddingFlag && biddingOnlineSignInFlag;
            return requiredFlag;
          },
        },
      },
      {
        // label: intl.get(`ssrc.inquiryHall.model.inquiryHall.biddingRunningTime`).d('竞价运行时间'),
        name: 'signInRunningDuration',
        type: 'number',
        min: 0,
      },
      {
        name: 'signInRunningDay',
        type: 'number',
        placeholder: intl.get('ssrc.inquiryHall.view.inquiryHall.signInTimeDay').d('签到时间(天)'),
        min: 0,
        precision: 0,
        defaultValidationMessages: { valueMissingNoLabel: '' },
        dynamicProps: {
          required({ dataSet, record }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            const {
              signInRunningDurationFlag,
              biddingOnlineSignInFlag,
              signInRunningHour,
              signInRunningMinute,
              signInRunningDay,
            } = record.get([
              'signInRunningDurationFlag',
              'biddingOnlineSignInFlag',
              'signInRunningHour',
              'signInRunningMinute',
              'signInRunningDay',
            ]);

            const flag =
              newBiddingFlag &&
              biddingOnlineSignInFlag &&
              signInRunningDurationFlag &&
              !signInRunningDay &&
              !signInRunningHour &&
              !signInRunningMinute;

            return flag;
          },
        },
      },
      {
        name: 'signInRunningHour',
        type: 'number',
        min: 0,
        precision: 0,
        defaultValidationMessages: { valueMissingNoLabel: '' },
        placeholder: intl.get('hzero.common.date.unit.hours').d('小时'),
        dynamicProps: {
          required({ dataSet, record }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            const {
              signInRunningDurationFlag,
              biddingOnlineSignInFlag,
              signInRunningHour,
              signInRunningMinute,
              signInRunningDay,
            } = record.get([
              'signInRunningDurationFlag',
              'biddingOnlineSignInFlag',
              'signInRunningHour',
              'signInRunningMinute',
              'signInRunningDay',
            ]);

            const flag =
              newBiddingFlag &&
              biddingOnlineSignInFlag &&
              signInRunningDurationFlag &&
              !signInRunningDay &&
              !signInRunningHour &&
              !signInRunningMinute;

            return flag;
          },
        },
      },
      {
        name: 'signInRunningMinute',
        type: 'number',
        precision: 1,
        min: 0,
        defaultValidationMessages: { valueMissingNoLabel: '' },
        placeholder: intl.get('hzero.common.date.unit.minutes').d('分钟'),
        dynamicProps: {
          required({ dataSet, record }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            const {
              signInRunningDurationFlag,
              biddingOnlineSignInFlag,
              signInRunningHour,
              signInRunningMinute,
              signInRunningDay,
            } = record.get([
              'signInRunningDurationFlag',
              'biddingOnlineSignInFlag',
              'signInRunningHour',
              'signInRunningMinute',
              'signInRunningDay',
            ]);

            const flag =
              newBiddingFlag &&
              biddingOnlineSignInFlag &&
              signInRunningDurationFlag &&
              !signInRunningDay &&
              !signInRunningHour &&
              !signInRunningMinute;

            return flag;
          },
        },
      },

      // 试竞价
      /**
       * 1. biddingTrialBiddingFlag, startingTrialBiddingStartFlag, startingTrialBiddingStartDate [wrapper]
         2. startingTrialBiddingRunningDuration, startingTrialBiddingEndDate, startingTrialBiddingRunningDurationFlag, [day, hour, minute, wrap]
      */
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.trialBiddingSymbol').d('试竞价标识'),
        name: 'biddingTrialBiddingFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'startingBiddingWrapper',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.startingTrialBidding`).d(`试竞价`),
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.startingTrialBidding`).d(`试竞价`),
        name: 'startingTrialBiddingStartFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        dynamicProps: {
          required({ record, dataSet }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            const { biddingTrialBiddingFlag } = record.get(['biddingTrialBiddingFlag']);

            const requiredFlag = newBiddingFlag && biddingTrialBiddingFlag;

            return requiredFlag;
          },
        },
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.startingTrialBiddingStartDate`)
          .d(`试竞价开始时间`),
        name: 'startingTrialBiddingStartDate',
        type: 'dateTime',
        format: getDateTimeFormat(),
        // min: new Date(),
        dynamicProps: {
          required({ record, dataSet }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            const { startingTrialBiddingStartFlag, biddingTrialBiddingFlag } = record.get([
              'startingTrialBiddingStartFlag',
              'biddingTrialBiddingFlag',
            ]);

            const requiredFlag =
              !startingTrialBiddingStartFlag && newBiddingFlag && biddingTrialBiddingFlag;
            return requiredFlag;
          },
        },
        computedProps: {
          min({ record, dataSet }) {
            const currentField = record.getField('signInEndDate');

            const disabledFlag = currentField?.get('disabled');
            const readOnlyFlag = currentField?.get('readOnly');
            if (disabledFlag || readOnlyFlag) {
              return null;
            }

            const prequalEndDate = getPrequalEndDate({ dataSet });

            const {
              biddingOnlineSignInFlag,
              signInEndDate,
              // startingTrialBiddingStartDate,
              biddingTrialBiddingFlag,
              // signInRunningDurationFlag,
              preQualificationFlag,
            } = record.get([
              'startingTrialBiddingStartDate',
              'signInEndDate',
              'biddingTrialBiddingFlag',
              'biddingOnlineSignInFlag',
              // 'signInRunningDurationFlag',
              'preQualificationFlag',
            ]);

            if (!biddingTrialBiddingFlag) return null;
            // 如果签到配置为真且有签到截止时间
            if (biddingOnlineSignInFlag && signInEndDate) {
              return 'signInEndDate';
            }
            // 如果存在资格预审，则开始时间最小值就是截止时间
            if (!biddingOnlineSignInFlag && preQualificationFlag && prequalEndDate) {
              return moment(prequalEndDate).add(1, 's');
            }

            return 'ssrcCustomCurrentNewDateTime';
          },
          max({ record }) {
            const {
              startingTrialBiddingEndDate,
              startingTrialBiddingRunningDurationFlag,
            } = record.get([
              'startingTrialBiddingEndDate',
              'startingTrialBiddingRunningDurationFlag',
            ]);
            if (startingTrialBiddingEndDate && !startingTrialBiddingRunningDurationFlag) {
              return moment(startingTrialBiddingEndDate).subtract(1, 's');
            }
          },
        },
      },
      {
        name: 'startingBiddingEndWrapper',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.startingTrialBidding`).d(`试竞价`),
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.startingTrialBiddingEndDate`)
          .d(`试竞价截止时间`),
        name: 'startingTrialBiddingEndDate',
        type: 'dateTime',
        format: getDateTimeFormat(),
        dynamicProps: {
          required({ record, dataSet }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            const {
              startingTrialBiddingRunningDurationFlag,
              biddingTrialBiddingFlag,
            } = record.get(['startingTrialBiddingRunningDurationFlag', 'biddingTrialBiddingFlag']);

            const requiredFlag =
              biddingTrialBiddingFlag && newBiddingFlag && !startingTrialBiddingRunningDurationFlag;
            return requiredFlag;
          },
        },
        computedProps: {
          min({ record }) {
            const currentField = record.getField('startingTrialBiddingEndDate');

            if (!currentField) {
              return null;
            }

            const disabledFlag = currentField?.get('disabled');
            const readOnlyFlag = currentField?.get('readOnly');
            if (disabledFlag || readOnlyFlag) {
              return null;
            }

            const {
              // signInEndDate,
              startingTrialBiddingStartDate,
              biddingTrialBiddingFlag,
            } = record.get([
              'startingTrialBiddingStartDate',
              'signInEndDate',
              'biddingTrialBiddingFlag',
            ]);
            if (!biddingTrialBiddingFlag) {
              return null;
            }

            if (startingTrialBiddingStartDate) {
              return moment(startingTrialBiddingStartDate).add(1, 's');
            }

            return 'ssrcCustomCurrentNewDateTime';
          },
          max({ record }) {
            const {
              quotationStartDate,
              startFlag,
              // quotationEndDate,
              // startingBiddingRunningDurationFlag,
            } = record.get([
              'quotationStartDate',
              'startFlag',
              // 'quotationEndDate',
              // 'startingBiddingRunningDurationFlag',
            ]);
            if (!startFlag && quotationStartDate) {
              return 'quotationStartDate';
            }
            // if (!startingBiddingRunningDurationFlag && quotationEndDate) {
            //   return moment(quotationEndDate).subtract(1, 's');
            // }
            return null;
          },
        },
      },
      {
        name: 'startingTrialBiddingRunningDurationFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        dynamicProps: {
          required({ record, dataSet }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            const { biddingTrialBiddingFlag } = record.get(['biddingTrialBiddingFlag']);

            const requiredFlag = newBiddingFlag && biddingTrialBiddingFlag;
            return requiredFlag;
          },
        },
      },
      {
        // label: intl.get(`ssrc.inquiryHall.model.inquiryHall.biddingRunningTime`).d('竞价运行时间'),
        name: 'startingTrialBiddingRunningDuration',
        type: 'number',
        min: 0,
      },
      {
        name: 'startingBiddingRunningDay',
        type: 'number',
        placeholder: intl.get('ssrc.inquiryHall.view.inquiryHall.signInTimeDay').d('签到时间(天)'),
        min: 0,
        precision: 0,
        defaultValidationMessages: { valueMissingNoLabel: '' },
        dynamicProps: {
          required({ dataSet, record }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            const {
              startingTrialBiddingRunningDurationFlag,
              biddingTrialBiddingFlag,
              startingBiddingRunningHour,
              startingBiddingRunningMinute,
              startingBiddingRunningDay,
            } = record.get([
              'startingTrialBiddingRunningDurationFlag',
              'biddingTrialBiddingFlag',
              'startingBiddingRunningHour',
              'startingBiddingRunningMinute',
              'startingBiddingRunningDay',
            ]);

            const flag =
              newBiddingFlag &&
              biddingTrialBiddingFlag &&
              startingTrialBiddingRunningDurationFlag &&
              !startingBiddingRunningDay &&
              !startingBiddingRunningHour &&
              !startingBiddingRunningMinute;

            return flag;
          },
        },
      },
      {
        name: 'startingBiddingRunningHour',
        type: 'number',
        min: 0,
        precision: 0,
        defaultValidationMessages: { valueMissingNoLabel: '' },
        placeholder: intl.get('hzero.common.date.unit.hours').d('小时'),
        dynamicProps: {
          required({ dataSet, record }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            const {
              startingTrialBiddingRunningDurationFlag,
              biddingTrialBiddingFlag,
              startingBiddingRunningHour,
              startingBiddingRunningMinute,
              startingBiddingRunningDay,
            } = record.get([
              'startingTrialBiddingRunningDurationFlag',
              'biddingTrialBiddingFlag',
              'startingBiddingRunningHour',
              'startingBiddingRunningMinute',
              'startingBiddingRunningDay',
            ]);

            const flag =
              newBiddingFlag &&
              biddingTrialBiddingFlag &&
              startingTrialBiddingRunningDurationFlag &&
              !startingBiddingRunningDay &&
              !startingBiddingRunningHour &&
              !startingBiddingRunningMinute;

            return flag;
          },
        },
      },
      {
        name: 'startingBiddingRunningMinute',
        type: 'number',
        precision: 1,
        min: 0,
        defaultValidationMessages: { valueMissingNoLabel: '' },
        placeholder: intl.get('hzero.common.date.unit.minutes').d('分钟'),
        dynamicProps: {
          required({ dataSet, record }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            const {
              startingTrialBiddingRunningDurationFlag,
              biddingTrialBiddingFlag,
              startingBiddingRunningHour,
              startingBiddingRunningMinute,
              startingBiddingRunningDay,
            } = record.get([
              'startingTrialBiddingRunningDurationFlag',
              'biddingTrialBiddingFlag',
              'startingBiddingRunningHour',
              'startingBiddingRunningMinute',
              'startingBiddingRunningDay',
            ]);

            const flag =
              newBiddingFlag &&
              biddingTrialBiddingFlag &&
              startingTrialBiddingRunningDurationFlag &&
              !startingBiddingRunningDay &&
              !startingBiddingRunningHour &&
              !startingBiddingRunningMinute;

            return flag;
          },
        },
      },
      {
        name: 'biddingStartFlagWrap',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.startingBidding`).d(`竞价`),
      },
      {
        name: 'biddingEndWrap',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.startingBidding`).d(`竞价`),
      },
      {
        name: 'startingBiddingRunningDurationFlag',
        defaultValue: 1,
        dynamicProps: {
          disabled({ record }) {
            const flag = japOrDutchBiddingTotal({ record });

            return flag;
          },
        },
      },
      /**
       * 补充单价
       */
      {
        name: 'biddingSupplementPriceStartWrap',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.biddingSupplementPrice').d('补充单价'),
      },
      {
        name: 'biddingSupplementPriceRunningDurationFlag',
        defaultValue: 1,
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.biddingSupplementPriceStartDate`)
          .d(`补充单价开始时间`),
        name: 'biddingSupplementPriceStartDate',
        type: 'dateTime',
        format: getDateTimeFormat(),
        computedProps: {
          min({ record }) {
            const currentField = record.getField('biddingSupplementPriceStartDate');

            const disabledFlag = currentField?.get('disabled');
            const readOnlyFlag = currentField?.get('readOnly');
            if (disabledFlag || readOnlyFlag) {
              return null;
            }

            const { quotationEndDate } = record.get(['quotationEndDate']);

            if (quotationEndDate) {
              return quotationEndDate;
            }

            return 'ssrcCustomCurrentNewDateTime';
          },
          max({ record }) {
            const {
              biddingSupplementPriceEndDate,
              biddingSupplementPriceRunningDurationFlag,
            } = record.get([
              'biddingSupplementPriceEndDate',
              'biddingSupplementPriceRunningDurationFlag',
            ]);
            if (biddingSupplementPriceEndDate && !biddingSupplementPriceRunningDurationFlag) {
              return moment(biddingSupplementPriceEndDate).subtract(1, 's');
            }
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.biddingSupplementPrice`).d(`补充单价`),
        name: 'biddingSupplementPriceStartFlag',
        // type: 'boolean',
        // trueValue: 1,
        // falseValue: 0,
        // defaultValue: 0,
      },
      {
        name: 'biddingSupplementPriceEndWrap',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.biddingSupplementPrice`).d(`补充单价`),
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.biddingSupplementPriceEndDate`)
          .d(`补充单价截止时间`),
        name: 'biddingSupplementPriceEndDate',
        type: 'dateTime',
        format: getDateTimeFormat(),
        computedProps: {
          min({ record }) {
            const currentField = record.getField('biddingSupplementPriceEndDate');

            const disabledFlag = currentField?.get('disabled');
            const readOnlyFlag = currentField?.get('readOnly');
            if (disabledFlag || readOnlyFlag) {
              return null;
            }

            const { biddingSupplementPriceStartDate } = record.get([
              'biddingSupplementPriceStartDate',
            ]);

            if (biddingSupplementPriceStartDate) {
              return moment(biddingSupplementPriceStartDate).add(1, 's');
            }

            return 'ssrcCustomCurrentNewDateTime';
          },
        },
      },
      {
        name: 'biddingSupplementPriceRunningDuration',
        type: 'number',
        min: 0,
      },
      {
        name: 'biddingSupplementPriceRunnintDay',
        type: 'number',
        placeholder: intl
          .get('ssrc.inquiryHall.view.inquiryHall.biddingSupplementPriceRunnintDay')
          .d('补充单价时间(天)'),
        min: 0,
        precision: 0,
        defaultValidationMessages: { valueMissingNoLabel: '' },
      },
      {
        name: 'biddingSupplementPriceRunnintHour',
        type: 'number',
        min: 0,
        precision: 0,
        defaultValidationMessages: { valueMissingNoLabel: '' },
        placeholder: intl.get('hzero.common.date.unit.hours').d('小时'),
      },
      {
        name: 'biddingSupplementPriceRunnintMinute',
        type: 'number',
        precision: 1,
        min: 0,
        defaultValidationMessages: { valueMissingNoLabel: '' },
        placeholder: intl.get('hzero.common.date.unit.minutes').d('分钟'),
      },
      /**
       * 竞价规则
       */
      {
        label: intl.get('ssrc.inquiryHall.model.biddingRules.biddingTarget').d('竞价对象'),
        name: 'biddingTarget',
        type: 'string',
        lookupCode: 'SSRC.BIDDING_TARGET',
        dynamicProps: {
          required({ record, dataSet }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            // const { biddingMode } = record.get(['biddingMode']);
            const requiredFlag = newBiddingFlag && !japOrDutchBidding({ record });
            return requiredFlag;
          },
          disabled({ record }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record });
            const flag = !newBiddingFlag || japOrDutchBidding({ record });
            return flag;
          },
        },
      },
      {
        label: intl.get('ssrc.inquiryHall.model.biddingRules.biddingStrategy').d('出价策略'),
        name: 'biddingStrategy',
        type: 'string',
        lookupCode: 'SSRC.BIDDING_STRATEGY',
        dynamicProps: {
          required({ record, dataSet }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            if (newBiddingFlag) {
              const { biddingMode } = record.get(['biddingMode']);
              // 寻源模板中【寻源类别】为【竞价】且【竞价模式】为【英式竞价】时展示，任一不为时隐藏
              return biddingMode === 'BRITISH_BIDDING';
            }
          },
          // 设置下拉框查询参数
          // lovPara({ record }) {
          //   // biddingQuotationMethod - 竞价方式：竞价（BIDDING）｜ 拍卖（AUCTION）
          //   const { biddingQuotationMethod } = record.get(['biddingQuotationMethod']);
          //   return {
          //     biddingQuotationMethod,
          //   };
          // },
        },
      },
      {
        label: intl
          .get(`ssrc.sourceTemplate.model.template.biddingAllowedQuotationCountFormalBidding`)
          .d('允许报价次数(正式竞价)'),
        name: 'biddingAllowedQuotationCount',
        type: 'number',
        min: '1',
        max: '99999999999999999999',
        precision: 0,
        step: 1,
      },
      {
        name: 'deferBiddingAllowedQuotationCount',
        label: intl
          .get(`ssrc.sourceTemplate.model.template.biddingAllowedQuotationCountDeferBidding`)
          .d('允许报价次数(延时竞价)'),
        type: 'number',
        min: 1,
        max: '99999999999999999999',
        step: 1,
        precision: 0,
      },
      {
        name: 'deferBiddingAllowedQuotationCount',
        label: intl
          .get(`ssrc.sourceTemplate.model.template.biddingAllowedQuotationCountDeferBidding`)
          .d('允许报价次数(延时竞价)'),
        type: 'number',
        min: 1,
        max: '99999999999999999999',
        step: 1,
      },
      {
        name: 'startingBiddingPrice', // 起竞价/起拍价
        type: 'number',
        min: '0',
        max: '99999999999999999999',
        step: 0,
        dynamicProps: {
          label({ record }) {
            const { biddingQuotationMethod, biddingMode } = record.get([
              'biddingQuotationMethod',
              'biddingMode',
            ]);

            const label = startingBiddingPriceTitle({ biddingQuotationMethod, biddingMode });
            return label;
          },
          required({ record }) {
            const flag = japOrDutchBiddingTotal({ record });
            return flag;
          },
        },
      },
      {
        name: 'trialStartingBiddingPrice',
        type: 'number',
        min: '0',
        max: NumberMax,
        dynamicProps: {
          label({ record }) {
            const { biddingQuotationMethod, biddingMode } = record.get([
              'biddingQuotationMethod',
              'biddingMode',
            ]);

            const label = trialStartingBiddingPriceTitle({ biddingQuotationMethod, biddingMode });
            return label;
          },
          required({ record }) {
            const { biddingTrialBiddingFlag } = record.get(['biddingTrialBiddingFlag']);
            const flag = japOrDutchBiddingTotal({ record }) && biddingTrialBiddingFlag;
            return flag;
          },
        },
      },
      {
        // label: intl.get('ssrc.inquiryHall.model.biddingRules.floatType').d('浮动方式'),
        label: intl.get('ssrc.inquiryHall.model.biddingRules.biddingQuotationRange').d('报价幅度'),
        name: 'floatType',
        type: 'string',
        defaultValue: 'money',
        computedProps: {
          lookupCode({ record, dataSet }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            return newBiddingFlag ? 'SSRC.BIDDING_FLOAT_TYPE' : 'SSRC.FLOAT_TYPE';
          },
          label({ record }) {
            let label = intl
              .get('ssrc.inquiryHall.model.biddingRules.biddingQuotationRange')
              .d('报价幅度');

            const flag = japOrDutchBiddingTotal({ record });

            // 当竞价模式=日式、荷兰式显示“叫价幅度”
            if (flag) {
              label = intl
                .get('ssrc.inquiryHall.model.biddingRules.biddingQuotationRangeBiddingPrice')
                .d('叫价幅度');
            }

            return label;
          },
          required({ record }) {
            const flag = japOrDutchBiddingTotal({ record });
            return flag;
          },
        },
      },
      {
        // label: intl.get('ssrc.inquiryHall.model.biddingRules.biddingQuotationRange').d('报价幅度'),
        name: 'quotationRange',
        type: 'number',
        min: '0',
        max: '99999999999999999999',
        step: 0,
        dynamicProps: {
          precision({ record }) {
            const floatType = record.get('floatType');
            if (floatType === 'ratio') {
              return 2;
            }
          },
          required({ record }) {
            const flag = japOrDutchBiddingTotal({ record });
            return flag;
          },
        },
      },
      {
        name: 'biddingTrialQuotationRange',
        type: 'number',
        min: '0',
        max: '99999999999999999999',
        step: 0,
        dynamicProps: {
          precision({ record }) {
            const floatType = record.get('floatType');
            if (floatType === 'ratio') {
              return 2;
            }
          },
          label({ record }) {
            let label = intl
              .get('ssrc.inquiryHall.model.biddingRules.biddingQuotationRangeTrial')
              .d('试竞价报价幅度');

            // 当竞价模式=日式、荷兰式显示“叫价幅度”
            const flag = japOrDutchBiddingTotal({ record });

            if (flag) {
              label = intl
                .get('ssrc.inquiryHall.model.biddingRules.biddingQuotationPriceRangeTrial')
                .d('试竞价叫价幅度');
            }

            return label;
          },
          required({ record }) {
            const { biddingTrialBiddingFlag } = record.get(['biddingTrialBiddingFlag']);
            const flag = japOrDutchBiddingTotal({ record }) && biddingTrialBiddingFlag;
            return flag;
          },
        },
      },
      {
        label: intl.get('ssrc.inquiryHall.model.biddingRules.safePrice').d('安全价'),
        name: 'safePrice',
        type: 'number',
        min: '0',
        max: '99999999999999999999',
        step: 0,
      },
      {
        label: intl
          .get('ssrc.inquiryHall.model.biddingRules.biddingTotalPricePrinciple')
          .d('总价竞价原则'),
        name: 'biddingTotalPricePrinciple',
        type: 'string',
        lookupCode: 'SSRC.BIDDING_TOTAL_PRICE_PRINCIPLE',
        defaultValue: 'UNIT_PRICE_REQUIRED', // 单价必填
        dynamicProps: {
          required({ record, dataSet }) {
            // 寻源模板中【寻源类别】为【竞价】且【竞价模式】为【英式竞价】且【启用自动延时】为【启用】时展示，任一不满足时隐藏
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            const flag = newBiddingFlag && !japOrDutchBiddingTotal({ record });

            return flag;
          },
          disabled({ record, dataSet }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            const flag = !newBiddingFlag || japOrDutchBiddingTotal({ record });

            return flag;
          },
        },
      },
      {
        label: intl.get('ssrc.biddingHall.view.message.biddingSpreadPrice').d('价差'),
        name: 'biddingSpreadPrice',
        type: 'number',
        min: 0,
        dynamicProps: {
          required({ record, dataSet }) {
            const { biddingTarget, biddingTotalPricePrinciple } = record.get([
              'biddingTarget',
              'biddingTotalPricePrinciple',
            ]);
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet }); // 竞价大厅标识
            const flag =
              newBiddingFlag &&
              biddingTarget === 'TOTAL_PRICE' &&
              biddingTotalPricePrinciple === 'TOTAL_PRICE_REQUIRED';

            return flag;
          },
          disabled({ record }) {
            const { biddingTarget, biddingTotalPricePrinciple } = record.get([
              'biddingTarget',
              'biddingTotalPricePrinciple',
            ]);
            const flag =
              biddingTarget !== 'TOTAL_PRICE' ||
              biddingTotalPricePrinciple !== 'TOTAL_PRICE_REQUIRED';

            return flag;
          },
        },
      },
      {
        label: intl.get('ssrc.inquiryHall.model.biddingRules.unitBiddingRule').d('单价竞价规则'),
        name: 'biddingUnitPriceRule',
        type: 'string',
        lookupCode: 'SSRC.BIDDING_UNIT_PRICE_RULE',
        defaultValue: 'WHOLE_BATCH',
        // biddingTarget === 'UNIT_PRICE' && quotationOrderType === "PARALLEL"
        dynamicProps: {
          required({ record, dataSet }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            const { biddingTarget, quotationOrderType } = record.get([
              'biddingTarget',
              'quotationOrderType',
            ]);

            const flag =
              biddingTarget === 'UNIT_PRICE' && quotationOrderType === 'PARALLEL' && newBiddingFlag;
            return flag;
          },
        },
      },
      {
        label: intl.get('ssrc.sourceTemplate.model.template.maxDeferCount').d('最大延时次数'),
        name: 'maxDeferCount',
        type: 'number',
        // disabled: true,
        step: 1,
        min: 1,
        precision: 0,
        dynamicProps: {
          // required({ record, dataSet }) {
          //   // 寻源模板中【寻源类别】为【竞价】且【竞价模式】为【英式竞价】且【启用自动延时】为【启用】时展示，任一不满足时隐藏
          //   // 竞价大厅标识
          //   const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
          //   const { autoDeferFlag, biddingMode } = record.get(['autoDeferFlag', 'biddingMode']);
          //   const flag = newBiddingFlag && autoDeferFlag === 1 && biddingMode === 'BRITISH_BIDDING';
          //   return flag;
          // },
          disabled({ record, dataSet }) {
            // 寻源模板中【寻源类别】为【竞价】且【竞价模式】为【英式竞价】且【启用自动延时】为【启用】时展示，任一不满足时隐藏
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            const { autoDeferFlag, biddingMode } = record.get(['autoDeferFlag', 'biddingMode']);
            const flag = newBiddingFlag && autoDeferFlag === 1 && biddingMode === 'BRITISH_BIDDING';
            return !flag;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sealedQuotation`).d('密封报价'),
        name: 'sealedQuotationFlag',
        type: 'string',
        lookupCode: 'HPFM.FLAG',
        dynamicProps: {
          required({ record, dataSet }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            const flag = newBiddingFlag && !japOrDutchBiddingTotal({ record });

            return flag;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.passwordFlag`).d('启用开标密码'),
        name: 'passwordFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        // disabled: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationType`).d('报价方式'),
        name: 'quotationType',
        type: 'string',
        lookupCode: 'SSRC.QUOTATION_TYPE',
        required: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.currency`).d('币种'),
        name: 'currencyLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SMDM.EXCHANGE_RATE.CURRENCY',
        textField: 'currencyName',
        valueField: 'currencyCode',
        required: true,
        // defaultValue: 'CNY',
        dynamicProps: {
          defaultValue: ({ dataSet }) => {
            const defaultCurrency = dataSet.getState('defaultCurrencyLov') || null;
            return defaultCurrency;
          },
        },
      },
      {
        name: 'isBritishBidTrafficLight',
        label: intl
          .get(`ssrc.sourceTemplate.model.template.isBritishBidTrafficLight`)
          .d('启用红绿灯'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        dynamicProps: {
          disabled({ record, dataSet }) {
            const { biddingMode } = record.get(['biddingMode']);
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            const flag = !newBiddingFlag || biddingMode !== 'BRITISH_BIDDING';
            return flag;
          },
        },
      },
      {
        name: 'isBritishBidLowestPriceGreen',
        label: intl
          .get(`ssrc.sourceTemplate.model.template.isBritishBidLowestPriceGreen`)
          .d('最低价绿灯'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        dynamicProps: {
          disabled({ record, dataSet }) {
            const { isBritishBidTrafficLight } = record.get(['isBritishBidTrafficLight']);
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            const flag = !newBiddingFlag || isBritishBidTrafficLight !== 1;
            return flag;
          },
        },
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.targetPriceLowerLimit').d('目标价下限'),
        name: 'targetPriceLowerLimit',
        type: 'number',
        min: '0',
        max: '99999999999999999999',
        step: 0,
        dynamicProps: {
          required({ record }) {
            const { isBritishBidTrafficLight, biddingTarget } =
              record.get(['isBritishBidTrafficLight', 'biddingTarget']) || {};

            const flag = isBritishBidTrafficLight === 1 && biddingTarget === 'TOTAL_PRICE';
            return flag;
          },
          disabled({ record }) {
            const { isBritishBidTrafficLight, biddingTarget } = record.get([
              'isBritishBidTrafficLight',
              'biddingTarget',
            ]);

            const flag = isBritishBidTrafficLight !== 1 || biddingTarget !== 'TOTAL_PRICE';
            return flag;
          },
        },
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.targetPriceUpperLimit').d('目标价上限'),
        name: 'targetPriceUpperLimit',
        type: 'number',
        max: '99999999999999999999',
        step: 0,
        dynamicProps: {
          required({ record, dataSet }) {
            const { isBritishBidTrafficLight, biddingTarget } =
              record.get(['isBritishBidTrafficLight', 'biddingTarget']) || {};
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            const flag =
              isBritishBidTrafficLight === 1 && biddingTarget === 'TOTAL_PRICE' && newBiddingFlag;
            return flag;
          },
          disabled({ record, dataSet }) {
            const { isBritishBidTrafficLight, biddingTarget } = record.get([
              'isBritishBidTrafficLight',
              'biddingTarget',
            ]);
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });

            const flag =
              isBritishBidTrafficLight !== 1 || biddingTarget !== 'TOTAL_PRICE' || !newBiddingFlag;
            return flag;
          },
          min({ record }) {
            let min = '0';
            const currentField = record.getField('targetPriceUpperLimit');
            const financialPrecisionNum = record.getState('financial_precision') || 0;

            if (!currentField) {
              return null;
            }

            const disabledFlag = currentField?.get('disabled');
            const readOnlyFlag = currentField?.get('readOnly');
            if (disabledFlag || readOnlyFlag) {
              return null;
            }

            // 2.竞价方式=竞价/拍卖时，前端需校验:试竞价/目标价上限要大于试竞价/目标价下限;
            const targetPriceLowerLimit = record.get('targetPriceLowerLimit');
            if (isNil(targetPriceLowerLimit)) {
              return min;
            }

            min = math.plus(
              targetPriceLowerLimit,
              math.div(1, math.pow(10, financialPrecisionNum))
            );

            return min;
          },
        },
      },
      {
        label: intl
          .get('ssrc.inquiryHall.model.inquiryHall.trialTargetPriceLowerLimit')
          .d('试竞价目标价下限'),
        name: 'trialTargetPriceLowerLimit',
        type: 'number',
        min: '0',
        max: '99999999999999999999',
        step: 0,
        dynamicProps: {
          required({ record, dataSet }) {
            const { isBritishBidTrafficLight, biddingTarget, biddingTrialBiddingFlag } =
              record.get([
                'isBritishBidTrafficLight',
                'biddingTarget',
                'biddingTrialBiddingFlag',
              ]) || {};
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });

            const flag =
              isBritishBidTrafficLight === 1 &&
              biddingTarget === 'TOTAL_PRICE' &&
              biddingTrialBiddingFlag === 1 &&
              newBiddingFlag;
            return flag;
          },
          disabled({ record, dataSet }) {
            const {
              isBritishBidTrafficLight,
              biddingTarget,
              biddingTrialBiddingFlag,
            } = record.get([
              'isBritishBidTrafficLight',
              'biddingTarget',
              'biddingTrialBiddingFlag',
            ]);
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            const flag =
              isBritishBidTrafficLight !== 1 ||
              biddingTarget !== 'TOTAL_PRICE' ||
              biddingTrialBiddingFlag !== 1 ||
              !newBiddingFlag;
            return flag;
          },
        },
      },
      {
        label: intl
          .get('ssrc.inquiryHall.model.inquiryHall.trialTargetPriceUpperLimit')
          .d('试竞价目标价上限'),
        name: 'trialTargetPriceUpperLimit',
        type: 'number',
        max: '99999999999999999999',
        step: 0,
        dynamicProps: {
          required({ record, dataSet }) {
            const { isBritishBidTrafficLight, biddingTarget, biddingTrialBiddingFlag } =
              record.get([
                'isBritishBidTrafficLight',
                'biddingTarget',
                'biddingTrialBiddingFlag',
              ]) || {};
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            const flag =
              isBritishBidTrafficLight === 1 &&
              biddingTarget === 'TOTAL_PRICE' &&
              biddingTrialBiddingFlag === 1 &&
              newBiddingFlag;
            return flag;
          },
          disabled({ record, dataSet }) {
            const { isBritishBidTrafficLight, biddingTarget, biddingTrialBiddingFlag } =
              record.get([
                'isBritishBidTrafficLight',
                'biddingTarget',
                'biddingTrialBiddingFlag',
              ]) || {};
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            const flag =
              isBritishBidTrafficLight !== 1 ||
              biddingTarget !== 'TOTAL_PRICE' ||
              biddingTrialBiddingFlag !== 1 ||
              !newBiddingFlag;
            return flag;
          },
          min({ record }) {
            let min = '0';
            const currentField = record.getField('targetPriceUpperLimit');
            const financialPrecisionNum = record.getState('financial_precision') || 0;

            if (!currentField) {
              return null;
            }
            const disabledFlag = currentField?.get('disabled');
            const readOnlyFlag = currentField?.get('readOnly');
            if (disabledFlag || readOnlyFlag) {
              return null;
            }

            // 2.竞价方式=竞价/拍卖时，前端需校验:试竞价/目标价上限要大于试竞价/目标价下限;
            const trialTargetPriceLowerLimit = record.get('trialTargetPriceLowerLimit');

            if (isNil(trialTargetPriceLowerLimit)) {
              return min;
            }

            min = math.plus(
              trialTargetPriceLowerLimit,
              math.div(1, math.pow(10, financialPrecisionNum))
            );

            return min;
          },
        },
      },
      {
        name: 'currencyCode',
        bind: 'currencyLov.currencyCode',
      },
      {
        name: 'currencyName',
        bind: 'currencyLov.currencyName',
      },
      {
        name: 'currencyId',
        bind: 'currencyLov.currencyId',
      },
      {
        name: 'finishingRate',
        type: 'number',
      },
      {
        name: 'biddingIntervalDuration',
        // label: intl.get(`ssrc.common.model.template.biddingIntervalDuration`).d('叫价间隔时长'),
        type: 'number',
        min: 0,
      },
      {
        name: 'biddingIntervalDurationDay',
        type: 'number',
        placeholder: intl
          .get('ssrc.inquiryHall.view.inquiryHall.biddingIntervalDurationDay')
          .d('叫价间隔时长(天)'),
        min: 0,
        precision: 0,
        defaultValidationMessages: { valueMissingNoLabel: '' },
        dynamicProps: {
          required({ record }) {
            const {
              biddingIntervalDurationDay,
              biddingIntervalDurationHour,
              biddingIntervalDurationMinute,
            } = record.get([
              'biddingIntervalDurationDay',
              'biddingIntervalDurationHour',
              'biddingIntervalDurationMinute',
            ]);

            const emptyValue =
              !biddingIntervalDurationDay &&
              !biddingIntervalDurationHour &&
              !biddingIntervalDurationMinute;
            const flag = japOrDutchBiddingTotal({ record }) && emptyValue;

            return flag;
          },
        },
      },
      {
        name: 'biddingIntervalDurationHour',
        type: 'number',
        min: 0,
        precision: 0,
        defaultValidationMessages: { valueMissingNoLabel: '' },
        placeholder: intl.get('hzero.common.date.unit.hours').d('小时'),
        dynamicProps: {
          required({ record }) {
            const {
              biddingIntervalDurationDay,
              biddingIntervalDurationHour,
              biddingIntervalDurationMinute,
            } = record.get([
              'biddingIntervalDurationDay',
              'biddingIntervalDurationHour',
              'biddingIntervalDurationMinute',
            ]);

            const emptyValue =
              !biddingIntervalDurationDay &&
              !biddingIntervalDurationHour &&
              !biddingIntervalDurationMinute;
            const flag = japOrDutchBiddingTotal({ record }) && emptyValue;

            return flag;
          },
        },
      },
      {
        name: 'biddingIntervalDurationMinute',
        type: 'number',
        precision: 1,
        min: 0.1,
        defaultValidationMessages: { valueMissingNoLabel: '' },
        placeholder: intl.get('hzero.common.date.unit.minutes').d('分钟'),
        dynamicProps: {
          required({ record }) {
            const {
              biddingIntervalDurationDay,
              biddingIntervalDurationHour,
              biddingIntervalDurationMinute,
            } = record.get([
              'biddingIntervalDurationDay',
              'biddingIntervalDurationHour',
              'biddingIntervalDurationMinute',
            ]);

            const emptyValue =
              !biddingIntervalDurationDay &&
              !biddingIntervalDurationHour &&
              !biddingIntervalDurationMinute;
            const flag = japOrDutchBiddingTotal({ record }) && emptyValue;

            return flag;
          },
        },
      },
      {
        name: 'biddingEndType',
        label: intl.get(`ssrc.common.model.template.biddingEndType`).d('竞价结束方式'),
        type: 'string',
        multiple: ',',
        transformResponse: (value) => {
          if (!value) {
            return '';
          }
          return value ? value.split(',') : null;
        },
        readOnly: true,
        dynamicProps: {
          // required({ record }) {
          //   const flag = japOrDutchBiddingTotal({ record });
          //   return flag;
          // },
          lookupCode({ record }) {
            const biddingMode = record.get('biddingMode');

            let code = 'SSRC_BIDDING_JAPANESE_END_TYPE';

            if (biddingMode === 'DUTCH_BIDDING') {
              code = 'SSRC_BIDDING_DUTCH_END_TYPE';
            }

            return code;
          },
        },
      },
      {
        name: 'biddingDisclosePrice',
        type: 'number',
        min: 0,
        dynamicProps: {
          label({ record }) {
            const { biddingQuotationMethod, biddingMode } = record.get([
              'biddingQuotationMethod',
              'biddingMode',
            ]);

            const label = biddingDisclosePriceTitle({ biddingQuotationMethod, biddingMode });

            return label;
          },
          required({ record }) {
            const flag = dutchBidding({ record });
            return flag;
          },
        },
      },
      {
        name: 'biddingTrialDisclosePrice',
        type: 'number',
        min: 0,
        dynamicProps: {
          label({ record }) {
            const { biddingQuotationMethod, biddingMode } = record.get([
              'biddingQuotationMethod',
              'biddingMode',
            ]);

            const label = trialBiddingDisclosePriceTitle({ biddingQuotationMethod, biddingMode });

            return label;
          },
          required({ record }) {
            const { biddingTrialBiddingFlag } = record.get(['biddingTrialBiddingFlag']);
            const flag = dutchBidding({ record }) && biddingTrialBiddingFlag;
            return flag;
          },
        },
      },
      {
        name: 'biddingEliminateRoundNumber',
        label: intl.get(`ssrc.common.model.template.biddingEliminateRoundNumber`).d('供方淘汰规则'),
        type: 'string',
        lookupCode: 'SSRC_BIDDING_ELIMINATION_RULE',
        defaultValue: '1',
      },
      {
        name: 'biddingMinShortlistedSupplierNumber',
        label: intl
          .get(`ssrc.sourceTemplate.model.template.biddingMinShortlistedSupplierNumber`)
          .d('最少入围供应商数'),
        type: 'number',
        min: 1,
        defaultValue: 1,
        step: 1,
        max: NumberMax,
        dynamicProps: {
          required() {
            const flag = japanBiddingTotalPrice();
            return flag;
          },
        },
      },
      {
        name: 'biddingEstimatedRoundNumber',
        label: intl.get(`ssrc.common.model.expectedMaxRounds`).d('预期最多轮次'),
        type: 'number',
        disabled: true,
        step: 1,
      },
      {
        name: 'biddingEstimatedTrialRoundNumber',
        label: intl.get(`ssrc.common.model.expectedTrialBiddingMaxRounds`).d('试竞价预期最多轮次'),
        type: 'number',
        disabled: true,
        step: 1,
      },
      /**
       * others
       * */
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.allowMuitiCurQuo`).d('允许多币种报价'),
        name: 'multiCurrencyFlag',
        type: 'boolean',
        transformResponse: (value) => (value ? 1 : 0),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationScope`).d('报价范围'),
        name: 'quotationScope',
        type: 'string',
        lookupCode: 'SSRC.QUOTATION_SCOPE_CODE',
        dynamicProps: {
          required({ record }) {
            return !record.get('onlyAllowAllWinBids');
          },
          disabled({ record }) {
            return record.get('onlyAllowAllWinBids');
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.paymentTerms`).d('付款方式'),
        name: 'paymentTypeLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SMDM.PAYMENTTYPE',
        textField: 'typeName',
        valueField: 'typeId',
        dynamicProps: {
          lovPara({ dataSet }) {
            const { organizationId = null } = dataSet.queryParameter.commonProps || {};
            return {
              organizationId,
              sourceFrom: 'RFX',
            };
          },
        },
      },
      {
        name: 'paymentTypeId',
        bind: 'paymentTypeLov.typeId',
      },
      {
        name: 'paymentTypeName',
        bind: 'paymentTypeLov.typeName',
      },
      {
        label: intl.get(`ssrc.common.model.common.termsOfPayment`).d('付款条款'),
        name: 'paymentTermLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SMDM.PAYMENT.TERM',
        textField: 'termName',
        valueField: 'termId',
        lovPara: {
          enabledFlag: 1,
        },
      },
      {
        name: 'paymentTermName',
        bind: 'paymentTermLov.termName',
      },
      {
        name: 'paymentTermId',
        bind: 'paymentTermLov.termId',
      },
      {
        label: intl
          .get('ssrc.inquiryHall.model.inquiryHall.allowAlterPaymnetTypeTerm')
          .d('允许修改付款条款方式'),
        name: 'paymentTermFlag',
        type: 'boolean',
        // transformResponse: (value) => (value ? 1 : 0),
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.bidBondYuan').d('保证金(元)'),
        name: 'bidBond',
        type: 'number',
        max: '99999999999999999999',
        step: 0,
        min: 0,
        // dynamicProps: {
        //   disabled({ record }) {
        //     const { rfxHeaderId, roundNumber } = record.get(['rfxHeaderId', 'roundNumber']);

        //     const round = rfxHeaderId && roundNumber !== 1; // 再次询价场景不可编辑
        //     const flag = round;
        //     return flag;
        //   },
        //   required({ record }) {
        //     const { bidBondFlag, sourceMethod } = record.get(['bidBondFlag', 'sourceMethod']);

        //     const flag = bidBondFlag === 1 && sourceMethod === 'OPEN';
        //     return flag;
        //   },
        // },
        dynamicProps: {
          disabled: ({ record }) => record.get('rfxHeaderId') && record.get('roundNumber') !== 1, // 再次询价场景不可编辑
          required({ record, dataSet }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            return !newBiddingFlag;
          },
        },
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.bidFileExpense').d('招标文件费(元)'),
        name: 'bidFileExpense',
        type: 'number',
        max: '99999999999999999999',
        step: 0,
        min: 0,
        // required: true,
        // dynamicProps: {
        //   disabled({ record }) {
        //     const { rfxHeaderId, roundNumber } = record.get(['rfxHeaderId', 'roundNumber']);

        //     const round = rfxHeaderId && roundNumber !== 1; // 再次询价场景不可编辑
        //     const flag = round;
        //     return flag;
        //   },
        //   required({ record }) {
        //     const { tenderFeeFlag, sourceMethod } = record.get(['tenderFeeFlag', 'sourceMethod']);

        //     const flag = tenderFeeFlag === 1 && sourceMethod === 'OPEN';
        //     return flag;
        //   },
        // },
        dynamicProps: {
          disabled: ({ record }) => record.get('rfxHeaderId') && record.get('roundNumber') !== 1,
          required({ record, dataSet }) {
            // 竞价大厅标识
            const newBiddingFlag = isNewBiddingFlag({ record, dataSet });
            return !newBiddingFlag;
          },
        },
      },
      {
        label: intl
          .get('ssrc.sourceTemplate.model.template.bidingDocumentDownLoad')
          .d('招标文件下载节点'),
        name: 'bidFileDownloadNode',
        required: true,
        type: 'string',
        lookupCode: 'SSRC.BID_FILE_DOWNLOAD_NODE',
      },
      {
        label: intl
          .get('ssrc.inquiryHall.model.inquiryHall.allowServiceExpenseCharge')
          .d('是否收取服务费'),
        name: 'serviceExpenseChargeFlag',
        type: 'boolean',
        transformResponse: (value) => (value ? 1 : 0),
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get('ssrc.inquiryHall.model.inquiryHall.minQuotedSupplier')
          .d('最少报价供应商数'),
        name: 'minQuotedSupplier',
        type: 'number',
        min: 0,
        step: 1,
        required: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.centralPurFlag`).d('是否集采'),
        name: 'centralPurchaseFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get('ssrc.sourceTemplate.model.template.taxChangeFlag').d('允许供应商修改税率'),
        name: 'taxChangeFlag',
        type: 'boolean',
        transformResponse: (value) => (value ? 1 : 0),
        trueValue: 1,
        falseValue: 0,
        disabled: true,
      },
      {
        label: intl
          .get('ssrc.sourceTemplate.model.template.continuousQuotationFlag')
          .d('允许供应商连续报价'),
        name: 'continuousQuotationFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        disabled: true,
      },
      {
        label: intl
          .get('ssrc.sourceTemplate.model.template.quantityChangeFlag')
          .d('允许供应商修改可供数量'),
        name: 'quantityChangeFlag',
        type: 'boolean',
        transformResponse: (value) => (value ? 1 : 0),
        trueValue: 1,
        falseValue: 0,
        disabled: true,
      },
      {
        label: intl
          .get('ssrc.sourceTemplate.model.template.diyLadderQuotationFlags')
          .d('允许供应商自定义阶梯报价'),
        name: 'diyLadderQuotationFlag',
        type: 'boolean',
        transformResponse: (value) => (value ? 1 : 0),
        trueValue: 1,
        falseValue: 0,
        disabled: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.view.message.tab.matterDetailNotice`).d('寻源事项须知'),
        name: 'matterDetail',
        type: 'string',
      },
      {
        label: intl.get('ssrc.sourceTemplate.model.template.openBidOrder').d('评标步制'),
        name: 'openBidOrderMeaning',
        disabled: true,
      },
      {
        name: 'openBidOrder',
      },
      {
        label: intl.get('ssrc.sourceTemplate.model.template.bidRuleType').d('标书规则'),
        name: 'bidRuleTypeMeaning',
        disabled: true,
      },
      {
        name: 'subjectMatterRule',
      },
      {
        name: 'bidRuleType',
      },
      {
        label: intl.get(`ssrc.inquiryHall.view.button.referTemplate`).d('参考模板'),
        name: 'templateLov',
        type: 'object',
        lovCode: 'SSRC.SCORE_TEMPL',
        dynamicProps: {
          lovPara({ record }) {
            const bidRuleType = record.get('bidRuleType');
            const templateScoreType = record.get('templateScoreType') || null;
            return {
              enabledFlag: 1,
              // expertCategory: type,
              scoreMode: bidRuleType,
              templatePurpose: 'EXPERT_SCORE',
              scoreTemplateScoreType: templateScoreType, // 模板评分类型,WEIGHT/SCORE
            };
          },
        },
      },
      // {
      //   name: 'templateId',
      //   bind: 'templateLov.templateId',
      // },
      // {
      //   name: 'templateCode',
      //   bind: 'templateLov.templateCode',
      // },
      /**
       * 初步评审-参考模板
       */
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
      /**
       * organization and staff
       * */
      {
        name: 'companyLov',
        required: true,
        label: intl.get('ssrc.common.company').d('公司'),
        type: 'object',
        ignore: 'always',
        lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
        textField: 'companyName',
        valueField: 'companyId',
        dynamicProps: {
          lovPara({ record }) {
            const bidRuleType = record.get('bidRuleType');
            return {
              enabledFlag: 1,
              // expertCategory: type,
              scoreMode: bidRuleType,
              templatePurpose: 'EXPERT_SCORE',
            };
          },
        },
      },
      {
        name: 'companyId',
        bind: 'companyLov.companyId',
      },
      {
        name: 'companyName',
        bind: 'companyLov.companyName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unitName`).d('需求部门'),
        name: 'unitLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'HPFM.USER_UNIT_TREE',
        textField: 'unitName',
        valueField: 'unitId',
        optionsProps: {
          childrenField: 'children',
        },
        dynamicProps: {
          lovPara({ dataSet }) {
            const { organizationId = null } = dataSet.queryParameter.commonProps || {};
            return {
              // companyId: record.get('companyId'),
              tenantId: organizationId,
            };
          },
          // disabled({ record }) {
          //   return !record.get('companyId');
          // },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.applicationScope`).d('适用范围'),
        name: 'applicationScopeFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'unitId',
        bind: 'unitLov.unitId',
      },
      {
        name: 'unitName',
        bind: 'unitLov.unitName',
      },
      {
        name: 'resultsExpandingDimensions',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.resultsExpandingDimensions`)
          .d('寻源拓展维度'),
        lookupCode: 'SSRC.RESULTS_EXPANDING_DIMENSIONS',
        defaultValue: 'WHOLE_ORDER',
        dynamicProps: {
          required({ record }) {
            const expandResultsFlag = record.get('expandResultsFlag') || 0;
            return expandResultsFlag;
          },
        },
      },
      {
        name: 'resultsExpandingHierarchy',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.resultsExpandingHierarchy`)
          .d('寻源拓展层级'),
        lookupCode: 'SSRC.RESULTS_EXPANDING_HIERARCHY',
        defaultValue: 'COMPANY',
        dynamicProps: {
          required({ record }) {
            const expandResultsFlag = record.get('expandResultsFlag') || 0;
            return expandResultsFlag;
          },
        },
      },
      {
        name: 'expandCompany',
        type: 'object',
        multiple: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.expandCompany`).d('拓展公司'),
        lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
        lovPara: { enabledFlag: 1 },
        dynamicProps: {
          required({ record }) {
            const {
              expandResultsFlag,
              resultsExpandingDimensions,
              resultsExpandingHierarchy,
            } = record.get([
              'expandResultsFlag',
              'resultsExpandingHierarchy',
              'resultsExpandingDimensions',
            ]);
            return (
              [1, '1'].includes(expandResultsFlag) &&
              resultsExpandingDimensions === 'WHOLE_ORDER' &&
              resultsExpandingHierarchy === 'INV_ORGANIZATION'
            );
          },
        },
        transformResponse: (value, data) => {
          const { expandCompany, expandCompanyMeaning } = data || {};
          const idList = expandCompany?.split(',') || [];
          const nameList = expandCompanyMeaning?.split(',') || [];
          return value
            ? idList.map((item, index) => ({
                companyId: item,
                companyName: nameList[index],
              }))
            : null;
        },
        transformRequest: (value) => {
          if (isEmpty(value)) {
            return null;
          }
          return value && value.map((item) => item.companyId).join(',');
        },
      },
      {
        name: 'expandCompanyMeaning',
        bind: 'expandCompany.companyName',
        multiple: ',',
      },
      {
        name: 'expandInvOrganization',
        type: 'object',
        multiple: true,
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.expandInvOrganization`)
          .d('拓展库存组织'),
        lovCode: 'HPFM_INV_ORGANIZATION_LIST',
        dynamicProps: {
          disabled({ record }) {
            return isEmpty(record.get('expandCompany'));
          },
          required({ record }) {
            const {
              expandResultsFlag,
              resultsExpandingDimensions,
              resultsExpandingHierarchy,
            } = record.get([
              'expandResultsFlag',
              'resultsExpandingDimensions',
              'resultsExpandingHierarchy',
            ]);
            return (
              [1, '1'].includes(expandResultsFlag) &&
              resultsExpandingDimensions === 'WHOLE_ORDER' &&
              resultsExpandingHierarchy === 'INV_ORGANIZATION'
            );
          },
          lovPara({ record }) {
            const companyIds = record?.get('expandCompany') || [];
            const param = {
              companyIds: companyIds?.map((item) => item.companyId)?.join(','),
            };
            return param;
          },
        },
        transformResponse: (value, data) => {
          const { expandInvOrganization, expandInvOrganizationMeaning } = data || {};
          const idList = expandInvOrganization?.split(',') || [];
          const nameList = expandInvOrganizationMeaning?.split(',') || [];
          return value
            ? idList.map((item, index) => ({
                organizationId: Number(item), // 值集值字段默认数字类型 若是后期值集主键加密 需要再次处理
                organizationName: nameList[index],
              }))
            : null;
        },
        transformRequest: (value) => {
          if (isEmpty(value)) {
            return null;
          }
          return value && value.map((item) => item.organizationId).join(',');
        },
      },
      {
        name: 'expandInvOrganizationMeaning',
        bind: 'expandInvOrganization.organizationName',
        multiple: ',',
      },
      {
        name: 'purOrganizationIdLov',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.purchOrgName`).d('采购组织名称'),
        type: 'object',
        ignore: 'always',
        lovCode: 'SPFM.USER_AUTH.PURORG',
        textField: 'organizationName',
        valueField: 'purchaseOrgId',
      },
      {
        name: 'purOrganizationId',
        bind: 'purOrganizationIdLov.purchaseOrgId',
      },
      {
        name: 'purOrganizationName',
        bind: 'purOrganizationIdLov.organizationName',
      },
      {
        name: 'purchaseLov',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.purchaseAgentName`).d('采购员'),
        type: 'object',
        ignore: 'always',
        lovCode: 'SPFM.USER_AUTH.PURCHASE_AGENT',
        textField: 'purchaseAgentName',
        valueField: 'purchaseAgentId',
        dynamicProps: {
          lovPara({ dataSet }) {
            const { organizationId = null } = dataSet.queryParameter.commonProps || {};
            return {
              organizationId,
            };
          },
        },
      },
      {
        name: 'purchaserId',
        bind: 'purchaseLov.purchaseAgentId',
      },
      {
        name: 'purchaserName',
        bind: 'purchaseLov.purchaseAgentName',
      },
      {
        name: 'purName',
        type: 'string',
        required: true,
        ignore: 'always',
        label: intl.get(`ssrc.bidHall.model.bidHall.purchasingContact`).d('采购联系人'),
        dynamicProps: {
          required({ record }) {
            const sourceMethod = record.get('sourceMethod');
            return sourceMethod === 'OPEN' || sourceMethod === 'ALL_OPEN';
          },
        },
      },
      {
        name: 'purUserIdLov',
        type: 'object',
        label: intl.get(`ssrc.bidHall.model.bidHall.purchasingContact`).d('采购联系人'),
        lovCode: 'HIAM.TENANT.USER',
        dynamicProps: {
          lovPara({ dataSet }) {
            const { organizationId = null } = dataSet.queryParameter.commonProps || {};
            return {
              organizationId,
            };
          },
        },
      },
      {
        name: 'purUserId',
        bind: 'purUserIdLov.id',
      },
      {
        name: 'purPhone',
        type: 'string',
        required: true,
        label: intl.get(`ssrc.bidHall.model.bidHall.contactPhone`).d('联系人电话'),
        validator: passwordValidator,
        defaultValidationMessages: { valueMissingNoLabel: '' },
        dynamicProps: {
          required({ record }) {
            const sourceMethod = record.get('sourceMethod');
            return sourceMethod === 'OPEN' || sourceMethod === 'ALL_OPEN';
          },
        },
      },
      {
        name: 'internationalTelCode',
        required: true,
        type: 'string',
        defaultValidationMessages: { valueMissingNoLabel: '' },
        lookupCode: 'HPFM.IDD',
      },
      {
        name: 'purEmail',
        required: true,
        label: intl.get(`ssrc.bidHall.model.bidHall.contactMail`).d('联系人邮箱'),
        validator: (value, _, record) => {
          if (value && !EMAIL.test(record.get('purEmail'))) {
            return intl.get('hzero.common.validation.email').d('邮箱格式不正确');
          }
          return true;
        },
        dynamicProps: {
          required({ record }) {
            const sourceMethod = record.get('sourceMethod');
            return sourceMethod === 'OPEN' || sourceMethod === 'ALL_OPEN';
          },
        },
      },
      {
        name: 'openBidLov',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.openBidder`).d('开标员'),
        type: 'object',
        ignore: 'always',
        lovCode: 'SSRC.TENANT.USER',
        textField: 'realName',
        valueField: 'id',
        multiple: true,
        dynamicProps: {
          lovPara({ dataSet }) {
            const { organizationId = null } = dataSet.queryParameter.commonProps || {};
            return {
              organizationId,
            };
          },
          required({ record }) {
            const openerFlag = record.get('openerFlag') || 0;
            const sealedQuotationFlag = record.get('sealedQuotationFlag') || 0;
            return sealedQuotationFlag === '1' && openerFlag;
          },
        },
      },
      {
        name: 'openerFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        name: 'prequalCheckerLov',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prequalChecker`).d('初审审查员'),
        type: 'object',
        ignore: 'always',
        lovCode: 'SSRC.TENANT.USER',
        textField: 'realName',
        valueField: 'id',
        dynamicProps: {
          lovPara({ dataSet }) {
            const { organizationId = null } = dataSet.queryParameter.commonProps || {};
            return {
              organizationId,
            };
          },
          required({ record }) {
            const pretrialFlag = record.get('pretrialFlag') || 0;
            return !!pretrialFlag;
          },
        },
      },
      {
        name: 'inquierLov',
        label: !bidFlag
          ? intl.get('ssrc.common.view.message.RfxCreator').d('询价员')
          : intl.get('ssrc.common.view.message.BIDCreator').d('招标员'),
        type: 'object',
        ignore: 'always',
        lovCode: 'SSRC.TENANT.USER',
        textField: 'realName',
        valueField: 'id',
        required: true,
        dynamicProps: {
          lovPara({ dataSet }) {
            const { organizationId = null } = dataSet.queryParameter.commonProps || {};
            return {
              organizationId,
            };
          },
        },
      },
      {
        name: 'checkPriceLov',
        type: 'object',
        label: !bidFlag
          ? intl.get(`ssrc.inquiryHall.model.inquiryHall.RFXcheckPricer`).d('核价员')
          : intl.get(`ssrc.inquiryHall.model.inquiryHall.BIDcheckPricer`).d('定标员'),
        ignore: 'always',
        lovCode: 'SSRC.TENANT.USER',
        textField: 'realName',
        valueField: 'id',
        required: true,
        dynamicProps: {
          lovPara({ dataSet }) {
            const { organizationId = null } = dataSet.queryParameter.commonProps || {};
            return {
              organizationId,
            };
          },
        },
      },
      {
        name: 'observeLov',
        type: 'object',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.observePerson`).d('观察员'),
        ignore: 'always',
        multiple: true,
        lovCode: 'SSRC.TENANT.USER',
        textField: 'realName',
        valueField: 'id',
        dynamicProps: {
          lovPara({ dataSet }) {
            const { organizationId = null } = dataSet.queryParameter.commonProps || {};
            return {
              organizationId,
            };
          },
        },
      },
      {
        name: 'objectVersionNumber',
        type: 'number',
      },
      {
        name: 'sourceFrom',
        type: 'string',
        // defaultValue: 'MANUAL',
      },
      {
        name: 'allowChangeItemsFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        name: 'allowChangeSupplyFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        name: 'pretrialFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'matchRestrictFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'scoreIndicFlag', // 模板允许寻源单维护时无专家&评分要素
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'matterRequireFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'onlyAllowAllWinBids', // 允许整单中标
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'rfxHeaderId',
      },
      {
        name: 'sourceHeaderId',
      },
      { name: 'tenantId' },
      { name: 'organizationId' },
      { name: 'templateScoreType' },
      { name: 'roundNumber', type: 'number' },
      { name: 'rfxNum' },
      { name: 'createdUnitName' },
      { name: 'createdUnitId' },
      { name: 'businessWeight' },
      { name: 'technologyWeight' },
      { name: 'initialReview' },
      {
        name: 'mergeType',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.prequalMergeType`)
          .d('资格预审合并方式'),
        type: 'string',
        lookupCode: 'SSRC_PREQUAL_MERGE_TYPE',
      },
      // 附件
      {
        name: 'techAttachmentUuid',
        type: 'attachment',
      },
      {
        name: 'businessAttachmentUuid',
        type: 'attachment',
      },
      { name: 'rfxStatus' },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.clarifyEndDate`).d('澄清截止时间'),
        name: 'clarifyEndDate',
        type: 'dateTime',
        format: getDateTimeFormat(),
        min: new Date(),
      },
      { name: 'taxIncludedFlag', defaultValue: null },
      {
        name: 'quotationRunningDurationFlag',
        defaultValue: 0,
      },
    ],
    events: {
      update: ({ name, record, value }) => {
        // if (name === 'purOrganizationIdLov') {
        //   record.set('purOrganizationId', (value || {}).purchaseOrgId);
        //   record.set('purOrganizationName', (value || {}).organizationName);
        // }
        if (name === 'purchaseLov') {
          record.set('purchaserId', (value || {}).purchaseAgentId);
          record.set('purchaserName', (value || {}).purchaseAgentName);
        }
        if (name === 'purUserIdLov') {
          record.set('internationalTelCode', (value || {}).internationalTelCode);
          record.set('purPhone', (value || {}).phone);
          record.set('purEmail', (value || {}).email);
        }

        if (name === 'sourceTemplateLov') {
          record.set('templateLov', null);
        }
        // if (name === 'templateLov') {
        //   const { templateId = null, templateCode = null, } = value || {};
        //   record.set('templateId', templateId);
        //   record.set('templateCode', templateCode);
        // }
        if (name === 'bidBond' && !value) {
          record.set('serviceExpenseChargeFlag', 0);
        }
      },
    },
  };
};

export default RfxInfoDS;

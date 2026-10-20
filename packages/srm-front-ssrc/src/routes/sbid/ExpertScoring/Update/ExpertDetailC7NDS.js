import intl from 'utils/intl';
import { PRIVATE_BUCKET, SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { isUndefined } from 'lodash';

const organizationId = getCurrentOrganizationId();

const scoreInfoDS = ({
  quotationHeaderId,
  supplierId,
  evaluateScoreIds,
  sectionId,
  sourceFrom,
  scoreFlag = false,
}) => {
  const invalidLabel = () => {
    if (scoreFlag) {
      return sourceFrom === 'RFX'
        ? intl.get(`ssrc.expertScoring.model.expertScoring.Invalid`).d('是否无效')
        : intl.get(`ssrc.expertScoring.model.expertScoring.invalidAnswer`).d('是否无效回复');
    } else if (sourceFrom === 'RFX') {
      return intl.get(`ssrc.expertScoring.model.expertScoring.SugInvalid`).d('建议无效');
    } else if (sourceFrom === 'BID') {
      return intl.get(`ssrc.expertScoring.model.expertScoring.sugInvalidTender`).d('建议无效投标');
    } else {
      return intl.get(`ssrc.expertScoring.model.expertScoring.sugInvalidAnswer`).d('建议无效回复');
    }
  };
  return {
    paging: false,
    dataToJSON: 'all',
    autoQuery: false,
    fields: [
      {
        name: 'sourceNum',
        type: 'string',
        label: intl.get(`ssrc.expertScoring.model.expertScoring.sourceNumber`).d('寻源编号'),
      },
      {
        name: 'sourceTitle',
        type: 'string',
        label: intl.get(`ssrc.expertScoring.model.expertScoring.sourceEveitem`).d('寻源事项'),
      },
      {
        name: 'sectionNum',
        type: 'string',
        label: intl.get(`ssrc.expertScoring.model.expertScoring.sectionNum`).d('标段/包编号'),
      },
      {
        name: 'companyNum',
        type: 'string',
        label: intl.get(`ssrc.expertScoring.model.expertScoring.companyNum`).d('供应商编码'),
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl.get(`ssrc.expertScoring.model.expertScoring.supplierCompany`).d('供应商名称'),
      },
      {
        name: 'sectionName',
        type: 'string',
        label: intl.get(`ssrc.expertScoring.model.expertScoring.sectionName`).d('标段/包名称'),
      },
      {
        name: 'suggestInvalidFlag',
        type: 'boolean',
        label: invalidLabel(),
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'attachmentUuid',
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-expert-header',
        label: intl.get(`ssrc.expertScoring.model.expertScoring.scoreAttachmentUuid`).d('评分附件'),
      },
      {
        name: 'expertSuggestion',
        type: 'string',
        label: intl.get(`ssrc.expertScoring.model.expertScoring.expertSuggestion`).d('评审意见'),
        transformRequest: (val) => {
          return val || '';
        },
      },
    ],
    transport: {
      read: () => ({
        url: `${SRM_SSRC}/v1/${organizationId}/evaluate-scores/${quotationHeaderId}/${sourceFrom}/header`,
        method: 'GET',
        data: {
          supplierId,
          evaluateScoreIds,
          sectionId,
          customizeUnitCode:
            sourceFrom === 'RFI' || sourceFrom === 'RFP'
              ? scoreFlag
                ? 'SSRC.EXPERT_SCORE_SCORING.HEADER_DETAIL_RFI '
                : 'SSRC.EXPERT_SCORE_SCORING.HEADER_EDIT_RFI'
              : scoreFlag
              ? 'SSRC.EXPERT_SCORE_SCORING.HEADER_DETAIL_RFX'
              : 'SSRC.EXPERT_SCORE_SCORING.HEADER_EDIT_RFX',
        },
      }),
    },
  };
};

const scoreTableDS = ({ scoreFlag }) => ({
  autoQuery: false,
  dataToJSON: 'all',
  selection: false,
  paging: false,
  fields: [
    {
      name: 'indicateName',
      type: 'string',
      label: intl.get(`ssrc.expertScoring.model.expertScoring.elementsItems`).d('要素细项'),
    },
    {
      name: 'detail',
      type: 'string',
      label: intl.get(`ssrc.expertScoring.model.expertScoring.detail`).d('评分细则'),
    },
    {
      name: 'betweenScore',
      type: 'string',
      label: intl.get(`ssrc.expertScoring.model.expertScoring.betweenScore`).d('评分区间'),
    },
    {
      name: 'supplierScore',
      dynamicProps: {
        label: ({ dataSet }) => {
          switch (dataSet.getState('supplierScoreTitle')) {
            case 'SCORE':
              return intl
                .get(`ssrc.expertScoring.model.expertScoring.supplierScore`)
                .d('供应商分数');
            case 'SCORE_PASS':
              return `${intl
                .get(`ssrc.expertScoring.model.expertScoring.supplierScore`)
                .d('供应商分数')}(${intl
                .get(`ssrc.expertScoring.model.expertScoring.passStatus`)
                .d('是否通过')})`;
            case 'PASS':
              return intl.get(`ssrc.expertScoring.model.expertScoring.passStatus`).d('是否通过');
            default:
              return intl
                .get(`ssrc.expertScoring.model.expertScoring.supplierScore`)
                .d('供应商分数');
          }
        },
      },
    },
    {
      name: 'indicScore',
      type: 'number',
      dynamicProps: {
        min: ({ record }) => {
          return !isUndefined(record.get('indicateNameFlag')) ||
            scoreFlag ||
            record.get('calculateType') === 'AUTO'
            ? null
            : record.get('minScore')
            ? record.get('minScore')
            : 0;
        },
        max: ({ record }) => {
          return !isUndefined(record.get('indicateNameFlag')) ||
            scoreFlag ||
            record.get('calculateType') === 'AUTO'
            ? null
            : record.get('maxScore')
            ? record.get('maxScore')
            : 9999999999;
        },
        disabled: ({ record }) => {
          return scoreFlag || record.get('calculateType') === 'AUTO';
        },
        required: ({ record }) => {
          return (
            isUndefined(record.get('indicateNameFlag')) &&
            !record.get('indicateNameFlag') &&
            record.get('indicateType') === 'SCORE'
          );
        },
      },
    },
    {
      name: 'passStatus',
      type: 'string',
      lookupCode: 'SSRC.DETAIL_APPROVED_STATUS',
      dynamicProps: {
        disabled: ({ record }) => {
          return scoreFlag || record.get('calculateType') === 'AUTO';
        },
        required: ({ record }) => {
          return (
            isUndefined(record.get('indicateNameFlag')) &&
            !record.get('indicateNameFlag') &&
            record.get('indicateType') !== 'SCORE'
          );
        },
      },
    },
    {
      name: 'weight',
      type: 'number',
      label: intl.get(`ssrc.expertScoring.model.expertScoring.weight`).d('权重'),
    },
  ],
});

export { scoreInfoDS, scoreTableDS };

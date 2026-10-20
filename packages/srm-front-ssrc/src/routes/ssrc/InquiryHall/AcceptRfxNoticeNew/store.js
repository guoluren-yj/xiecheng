import intl from 'utils/intl';

import { PRIVATE_BUCKET } from '_utils/config';

import { ChunkUploadProps } from '@/utils/SsrcRegx';

const SourceNoticeDS = (data) => {
  const { bidFlag, documentTypeName } = data || {};

  return {
    autoQuery: false,
    fields: [
      {
        name: 'sourceNum',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonRfxNo`, {
            documentTypeName: bidFlag ? 'BID' : 'RFX',
          })
          .d('{documentTypeName}单号'),
        type: 'string',
      },
      {
        name: 'sourceTitle',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonInquiryTitle`, {
            documentTypeName,
          })
          .d('{documentTypeName}标题'),
        type: 'string',
      },
      {
        name: 'companyName',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.company').d('公司'),
        type: 'string',
      },
      {
        name: 'purName',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.purchaseContact').d('采购联系人'),
        type: 'string',
      },
      {
        name: 'purPhone',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.contactTel').d('联系人电话'),
        type: 'string',
      },
      {
        name: 'purEmail',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.contactEmail').d('联系人邮箱'),
        type: 'string',
      },
      {
        name: 'winMessageFlag',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.bidNotice').d('中标通知'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        disabled: true,
        dynamicProps: {
          defaultValue({ record }) {
            const { noticeRuleId, winMessageFlag } = record.get(['noticeRuleId', 'winMessageFlag']);

            const value = noticeRuleId ? (winMessageFlag ? 1 : 0) : 1;
            return value;
          },
        },
      },
      {
        name: 'loseMessageFlag',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.unBidNotice').d('未中标通知'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        dynamicProps: {
          defaultValue({ record }) {
            const { noticeRuleId, loseMessageFlag } = record.get([
              'noticeRuleId',
              'loseMessageFlag',
            ]);

            const value = noticeRuleId ? (loseMessageFlag ? 1 : 0) : 1;
            return value;
          },
          disabled({ record }) {
            const { noticeRuleStatus } = record.get(['noticeRuleStatus']);

            const flag = ['RECALL', 'RELEASE'].includes(noticeRuleStatus);
            return flag;
          },
        },
      },
      {
        name: 'winNoticeFlag',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.bidAnnouncement').d('中标公告'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        dynamicProps: {
          defaultValue({ record }) {
            const { noticeRuleId, winNoticeFlag } = record.get(['noticeRuleId', 'winNoticeFlag']);

            const value = noticeRuleId ? (winNoticeFlag ? 1 : 0) : 0;
            return value;
          },
          disabled({ record }) {
            const { noticeRuleStatus } = record.get(['noticeRuleStatus']);

            const flag = ['RECALL', 'RELEASE'].includes(noticeRuleStatus);
            return flag;
          },
        },
      },

      // second panel
      {
        label: intl.get('ssrc.bidHall.model.bidHall.noticeTitle').d('公告标题'),
        name: 'noticeTitle',
        // // required: true,
        type: 'string',
        dynamicProps: {
          required({ record }) {
            const { noticeRuleStatus } = record.get(['noticeRuleStatus']);

            const flag = noticeRuleStatus !== 'RELEASE';
            return flag;
          },
          defaultValue({ record }) {
            const { noticeTitle, sourceTitle } = record.get(['noticeTitle', 'sourceTitle']);

            const value =
              noticeTitle ||
              `${sourceTitle || ''}${intl
                .get('ssrc.inquiryHall.view.message.panel.bidWinnerNotice')
                .d('中标公告')}`;
            return value;
          },
          disabled({ record }) {
            const { noticeRuleStatus } = record.get(['noticeRuleStatus']);

            const flag = noticeRuleStatus === 'RELEASE';
            return flag;
          },
        },
      },
      {
        name: 'noticeDays',
        label: intl.get('ssrc.bidHall.model.bidHall.noticeDays').d('公告天数'),
        type: 'number',
        min: 1,
        max: 100000,
        step: 1,
        // required: true,
        dynamicProps: {
          required({ record }) {
            const { noticeRuleStatus } = record.get(['noticeRuleStatus']);

            const flag = noticeRuleStatus !== 'RELEASE';
            return flag;
          },
          disabled({ record }) {
            const { noticeRuleStatus } = record.get(['noticeRuleStatus']);

            const flag = noticeRuleStatus === 'RELEASE';
            return flag;
          },
        },
      },
      {
        label: intl.get(`ssrc.bidHall.model.bidHall.couldViewRange`).d('可见范围'),
        name: 'visibleRangeType',
        // required: true,
        lookupCode: 'SSRC.NOTICE_VISIBLE_RANGE_TYPE',
        type: 'string',
        dynamicProps: {
          required({ record }) {
            const { noticeRuleStatus } = record.get(['noticeRuleStatus']);

            const flag = noticeRuleStatus !== 'RELEASE';
            return flag;
          },
          disabled({ record }) {
            const { noticeRuleStatus } = record.get(['noticeRuleStatus']);

            const flag = noticeRuleStatus === 'RELEASE';
            return flag;
          },
        },
      },
      {
        label: intl.get('ssrc.common.supplierName').d('供应商名称'),
        name: 'nameVisibleType',
        // required: true,
        lookupCode: 'SSRC.VISIBLE_TYPE',
        type: 'string',
        dynamicProps: {
          required({ record }) {
            const { noticeRuleStatus } = record.get(['noticeRuleStatus']);

            const flag = noticeRuleStatus !== 'RELEASE';
            return flag;
          },
          disabled({ record }) {
            const { noticeRuleStatus } = record.get(['noticeRuleStatus']);

            const flag = noticeRuleStatus === 'RELEASE';
            return flag;
          },
        },
      },
      {
        label: intl.get(`ssrc.bidHall.model.bidHall.bieWinnerPrice`).d('中标价格'),
        name: 'priceVisibleType',
        lookupCode: 'SSRC.VISIBLE_TYPE',
        type: 'string',
        dynamicProps: {
          required({ record }) {
            const { noticeRuleStatus } = record.get(['noticeRuleStatus']);

            const flag = noticeRuleStatus !== 'RELEASE';
            return flag;
          },
          disabled({ record }) {
            const { noticeRuleStatus } = record.get(['noticeRuleStatus']);

            const flag = noticeRuleStatus === 'RELEASE';
            return flag;
          },
        },
      },
      {
        label: intl.get(`ssrc.bidHall.model.bidHall.bieWinnerNumber`).d('中标数量'),
        name: 'quantityVisibleType',
        // required: true,
        lookupCode: 'SSRC.VISIBLE_TYPE',
        type: 'string',
        dynamicProps: {
          required({ record }) {
            const { noticeRuleStatus } = record.get(['noticeRuleStatus']);

            const flag = noticeRuleStatus !== 'RELEASE';
            return flag;
          },
          disabled({ record }) {
            const { noticeRuleStatus } = record.get(['noticeRuleStatus']);

            const flag = noticeRuleStatus === 'RELEASE';
            return flag;
          },
        },
      },
      {
        label: intl.get(`ssrc.bidHall.model.bidHall.expertVisibleType`).d('评审专家'),
        name: 'expertVisibleType',
        // required: true,
        lookupCode: 'SSRC.VISIBLE_TYPE',
        type: 'string',
        dynamicProps: {
          required({ record }) {
            const { expertScoreType, noticeRuleStatus } = record.get([
              'expertScoreType',
              'noticeRuleStatus',
            ]);
            const flag = expertScoreType !== 'NONE' && noticeRuleStatus !== 'RELEASE';
            return flag;
          },
          disabled({ record }) {
            const { noticeRuleStatus } = record.get(['noticeRuleStatus']);

            const flag = noticeRuleStatus === 'RELEASE';
            return flag;
          },
        },
      },
      {
        name: 'noticeAttachmentUuid',
        label: intl.get(`ssrc.bidHall.model.bidHall.noticeAttachment`).d('公告附件'),
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-tendernotice-detail',
        ...ChunkUploadProps,
        dynamicProps: {
          readOnly({ record }) {
            const { noticeRuleStatus } = record.get(['noticeRuleStatus']);

            const flag = noticeRuleStatus === 'RELEASE';
            return flag;
          },
        },
      },
      {
        label: intl.get('ssrc.bidHall.model.bidHall.noticePreview').d('公告预览'),
        name: 'inquiryGroup',
        type: 'string',
      },
    ],
  };
};

const previewWInnerBidNoticeDataSet = () => {
  return {
    autoQuery: false,
  };
};

export { SourceNoticeDS, previewWInnerBidNoticeDataSet };

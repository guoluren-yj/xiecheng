import React, { Fragment } from 'react';

import { Modal } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { fetchContractReviewType } from '@/services/contractCommonService';
import { ReactComponent as CompareImg } from '@/assets/smartReview/compare.svg';
import { ReactComponent as ExtractImg } from '@/assets/smartReview/extract.svg';
import { ReactComponent as ReviewImg } from '@/assets/smartReview/review.svg';

// 获取列表页TabPane
export const getTabPane = () => [
  // {
  //   key: 'highRisk',
  //   tab: intl.get('spcm.workspace.view.title.highRisk').d('高风险'),
  // },
  // {
  //   key: 'mediumRisk',
  //   tab: intl.get('spcm.workspace.view.title.mediumRisk').d('中风险'),
  // },
  // {
  //   key: 'lowRisk',
  //   tab: intl.get('spcm.workspace.view.title.lowRisk').d('低风险'),
  // },
  {
    key: 'allRisk',
    tab: intl.get('spcm.workspace.view.title.allRisk').d('全部'),
  },
];

// 审查等待页展示图片
export const getWaitShowImgList = () => {
  const list = [
    {
      key: 'extract',
      help: intl.get('spcm.common.view.common.contractTextExtractMsg').d('合同文本要素提取'),
      notExecuteBtnText: intl.get('spcm.common.view.btn.notExecuteExtract').d('不执行提取相关审查'),
      retryBtnText: intl.get('spcm.common.view.btn.retry').d('重试'),
    },
    {
      key: 'compare',
      help: intl.get('spcm.common.view.common.templateTextCompareMsg').d('模板与文本内容对比'),
      notExecuteBtnText: intl
        .get('spcm.common.view.btn.notExecuteCompare')
        .d('不执行合同对比相关审查'),
      retryBtnText: intl.get('spcm.common.view.btn.retry').d('重试'),
    },
    {
      key: 'waitReview',
      help: intl.get('spcm.common.view.common.waitReviewResultMsg').d('审查规则执行中，请稍等'),
    },
  ];
  return list;
};

// 获取svg图片
export const getImgSrcComponent = (key) => {
  switch (key) {
    case 'extract':
      return <ExtractImg />;
    case 'compare':
      return <CompareImg />;
    case 'waitReview':
      return <ReviewImg />;
    default:
      return null;
  }
};

// 获取标签颜色和文字
const getColorAndText = (key) => {
  const list = [
    {
      key: 'success',
      color: 'green',
      text: intl.get('spcm.common.view.common.extractSuccessTag').d('提取成功'),
    },
    {
      key: 'working',
      color: 'blue',
      text: intl.get('spcm.common.view.common.extractingTag').d('提取中'),
    },
    {
      key: 'failed',
      color: 'gray',
      text: intl.get('spcm.common.view.common.extractFailTag').d('失败'),
    },
    {
      key: 'noExecute',
      color: 'gray',
      text: intl.get('spcm.common.view.common.noExecuteTag').d('暂不执行'),
    },
  ];
  return list.find((i) => i.key === key);
};

// 状态标签
export const getStatusTag = (key) => {
  const colorObj = getColorAndText(key) || {};
  const { color, text } = colorObj;
  return color ? (
    <Tag color={color} style={{ border: 'none' }}>
      {text}
    </Tag>
  ) : null;
};

// 处理合同审查类型分类
export const handleContractReviewType = async (params = {}) => {
  const { headerInfo = {}, handleGoToSmartReview = () => {}, triggerType } = params;
  const payload = {
    triggerType,
    pcHeaderId: headerInfo.pcHeaderId,
  };
  const typeResp = await fetchContractReviewType(payload);
  if (getResponse(typeResp)) {
    const {
      // 对比
      smartCompareStatus,
      // 提取
      smartFetchStatus,
      reviewSessionId,
    } = typeResp;
    // 无需对比
    const notCompareTipsFlag = ['NONE', 'success'].includes(smartCompareStatus);
    // 无需提取
    const notExtractTipsFlag = ['NONE', 'success'].includes(smartFetchStatus);
    let reviewType = null;
    if (notCompareTipsFlag && notExtractTipsFlag) {
      // 无需对比和提取，直接去审查页面
      handleGoToSmartReview({ reviewSessionId });
    }
    if (notCompareTipsFlag && !notExtractTipsFlag) {
      reviewType = 'extract';
    } else if (!notCompareTipsFlag && notExtractTipsFlag) {
      reviewType = 'compare';
    } else if (!notCompareTipsFlag && !notExtractTipsFlag) {
      reviewType = 'extractAndCompare';
    }
    if (reviewType) {
      // 按类型弹窗提示
      const modalParams = {
        ...params,
        reviewType,
        reviewSessionId,
      };
      openContractReviewModal(modalParams);
    }
  }
};

// 弹窗并跳转审查详情
const openContractReviewModal = (params = {}) => {
  const { handleGoToSmartReview = () => {}, reviewType, refreshData = () => {} } = params;
  const tipList = getModalTips(reviewType);
  // 弹窗收费
  Modal.confirm({
    title: intl.get('hzero.common.message.confirm').d('提示'),
    okText: intl.get('spcm.common.button.continue').d('继续'),
    cancelText: intl.get('spcm.common.button.exit').d('退出'),
    children: (
      <Fragment>
        {tipList.map((text) => (
          <p style={{ marginBottom: 8 }}>{text}</p>
        ))}
      </Fragment>
    ),
    onOk: () => {
      // 跳转审查页面
      handleGoToSmartReview({ reviewSessionId: params?.reviewSessionId });
    },
    onCancel: () => {
      refreshData();
    },
  });
};

// 弹窗提示文字
const getModalTips = (key = '') => {
  const commonTips = [
    key !== 'extract' &&
      intl.get('spcm.common.view.message.contractChargeTips').d('• 合同对比结果获取会产生计费'),
    intl.get('spcm.common.view.message.waitTimeTips').d('• 结果获取需要等待一段时间'),
    intl.get('spcm.common.view.message.contractNotEditTips').d('• 审查过程中不能对合同进行编辑'),
    intl.get('spcm.common.view.message.selectConfirmTips').d('您可以选择“继续”，或者“退出”。'),
  ].filter(Boolean);
  let tipList = [];
  switch (key) {
    case 'extract':
      tipList = [
        intl
          .get('spcm.common.view.message.contractExtractTips')
          .d('需要进行合同文本要素提取，请注意：'),
        ...commonTips,
      ];
      break;
    case 'compare':
      tipList = [
        intl
          .get('spcm.common.view.message.contractCompareTips')
          .d('需要进行合同文本对比，请注意：'),
        ...commonTips,
      ];
      break;
    case 'extractAndCompare':
      tipList = [
        intl
          .get('spcm.common.view.message.contractExtractAndCompareTips')
          .d('需要进行合同文本对比和文本要素提取，请注意：'),
        ...commonTips,
      ];
      break;
    default:
      break;
  }
  return tipList;
};

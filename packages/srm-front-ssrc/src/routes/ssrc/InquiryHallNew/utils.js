import React, { Fragment, useCallback } from 'react';
import moment from 'moment';
import { Popover, Steps, Tag } from 'choerodon-ui';
import { Lov, Tooltip, Modal } from 'choerodon-ui/pro';
import { map, isNull, isEmpty } from 'lodash';
import intl from 'utils/intl';
import IMChatDraggable from '_components/IMChatDraggable';
import ApproveRecordSimple from '_components/ApproveRecordSimple';
import notification from 'utils/notification';

import { getQuotationName } from '@/utils/globalVariable';
import { numberSeparatorRender } from '@/utils/renderer';
import { validatorConfirmModal } from '@/routes/components/ConfirmModal';
import { urlReg } from '@/routes/ssrc/InquiryHall/CheckPrice/utils/regExpression';

import { linkRiskScan, validateRiskScan } from '@/services/inquiryHallService';

import RoundQuotationModal from './components/RoundQuotation';

import Style from './index.less';

const { Step } = Steps;
const EMPTY_ARRAY = [];

// 放弃气泡样式
const abandonRemarkStyle = {
  maxWidth: '520px',
  maxHeight: '208px',
  overflow: 'auto',
  wordBreak: 'break-word',
};

// 步骤条tag对应的颜色集
const statusTagColorMap = {
  NEW: 'process',
  RELEASE_APPROVING: 'process',
  RELEASE_REJECTED: 'error',
  NOT_START: 'wait',
  IN_PREQUAL: 'process',
  PENDING_PREQUAL: 'process',
  IN_QUOTATION: 'process',
  LACK_QUOTED: 'error',
  OPEN_BID_PENDING: 'process',
  OPENED: 'process',
  SCORING: 'process',
  BARGAINING: 'process',
  ROUND_QUOTATION: 'process',
  PRE_EVALUATION_APPROVING: 'process',
  PRE_EVALUATION_PENDING_REJECT: 'error',
  PRETRIAL_PENDING: 'process',
  CHECK_PENDING: 'process',
  CHECK_APPROVING: 'process',
  CHECK_REJECTED: 'error',
  PAUSED: 'process',
  FINISHED: 'finish',
  CLOSED: 'wait',
  ROUNDED: 'finish',
  CANCELED: 'wait',
};

/**
 * 普通多行渲染
 * @param {{multiLineFields = [] record, dataSet}} param0 多行表的一些属性，{multiLineFields = [] record, dataSet }
 * @param {[]} custObjList 自义定渲染
 * 格式 [{name: 字段名1, content: 渲染内容(VNODE)}]
 */
export function mutiLineRender({ multiLineFields = [], record, dataSet }, custObjList) {
  const newMultiLineFields = multiLineFields.map((LineField) => {
    const label = dataSet.getField(LineField.get('name')).get('label');
    let mean = {};
    const currentCustObj =
      custObjList &&
      custObjList.length > 0 &&
      custObjList.filter((item) => item.name === LineField.get('name'));
    if (currentCustObj && currentCustObj.length > 0) {
      if (currentCustObj[0].content) {
        mean = {
          label,
          content: currentCustObj[0].content,
        };
      } else {
        mean = null;
      }
    } else {
      mean = {
        label,
        content: (
          <Popover className="popoverContent" content={record.get(LineField.get('name'))}>
            {record.get(LineField.get('name')) || '-'}
          </Popover>
        ),
      };
    }
    return mean;
  });

  const renderMultiLineFields = newMultiLineFields.filter(Boolean);

  const renderContent = (contentItems, overFlag) => {
    return overFlag ? (
      <div className={Style.overContent}>
        {contentItems &&
          contentItems.length &&
          contentItems.map((item) => (
            <div className="moreContent">
              <span className="multiLineLabel">{item.label}</span>
              {item.content}
            </div>
          ))}
      </div>
    ) : (
      <Fragment>
        {contentItems &&
          contentItems.length &&
          contentItems.map((item) => (
            <div>
              <span className="multiLineLabel">{item.label}</span>
              {item.content}
            </div>
          ))}
      </Fragment>
    );
  };

  if (renderMultiLineFields && renderMultiLineFields.length < 4) {
    return renderContent(renderMultiLineFields);
  } else if (renderMultiLineFields.length > 3) {
    const otherItem = renderMultiLineFields.slice(2);
    return (
      <Fragment>
        {renderContent(renderMultiLineFields.slice(0, 2))}
        <Popover placement="right" content={renderContent(otherItem, true)}>
          <span className={Style.ellipsis}>. . .</span>
        </Popover>
      </Fragment>
    );
  }
}

/**
 * 报价行多行渲染
 * @param {object} param
 */
export function QuotationInfo({ record }, otherProps = {}) {
  const {
    remote,
    bidOpeningNewFlag,
    customizeTable,
    sourceKey,
    roundQuotationExecuteFlag = 0,
  } = otherProps;
  const {
    rfxHeaderId,
    quotationRoundNumber,
    headerQuotationDetails = EMPTY_ARRAY,
    rfxStatus,
    expertScoreType,
    approvalMessage,
    prequalLines = EMPTY_ARRAY,
    progresses, // 专家评分进度条
    evaluateLeaderFlag, // 评分负责人
    evaluateExperts, // 评分情况
    bargainStatus, // 议价状态
    bargainEndDate, // 议价结束时间
    sourceMethod,
    suggestedSuppliers = EMPTY_ARRAY,
    initialReview,
    scoreStatus,
    secondarySourceCategory,
    biddingFlag, // 竞价大厅-竞价标识
    biddingTarget, // 竞价对象
    // supBiddingStatus, // 供应商竞价状态(竞价大厅专用字段-未开始时区分签到、试竞价，竞价开始后与其他状态一样
    // biddingNextStatus, // 竞价单下一状态
    // indicAssignCount,
  } =
    record.get([
      'rfxHeaderId',
      'quotationRoundNumber',
      'headerQuotationDetails',
      'rfxStatus',
      'expertScoreType',
      'approvalMessage',
      'prequalLines',
      'progresses',
      'evaluateLeaderFlag',
      'evaluateExperts',
      'bargainStatus',
      'bargainEndDate',
      'sourceMethod',
      'suggestedSuppliers',
      'initialReview',
      'scoreStatus',
      'secondarySourceCategory',
      'biddingFlag',
      'biddingTarget',
      // 'supBiddingStatus',
      // 'biddingNextStatus',
    ]) || {};
  const barginFlag =
    (bargainStatus === 'BARGAINING_ONLINE' || bargainStatus === 'BARGAINING_OFFLINE') &&
    moment().isBefore(bargainEndDate);
  const isCheck = initialReview === 'NEED' && scoreStatus === 'INITIAL_REVIEW_SCORING';
  const bidFlag = secondarySourceCategory === 'NEW_BID';
  const quotationName = getQuotationName(bidFlag);

  // 竞价大厅-竞价单标识
  const newBiddingFlag =
    secondarySourceCategory === 'RFA' && (biddingFlag === 1 || biddingFlag === '1');
  // 竞价大厅供应商状态显示 【新竞价单 & 未开始状态】 ｜ 【新竞价单 & (报价中 | 报价响应不足) & 总价竞价】
  const supBiddingStatusFlag =
    newBiddingFlag &&
    (rfxStatus === 'NOT_START' ||
      ((rfxStatus === 'IN_QUOTATION' || rfxStatus === 'LACK_QUOTED') &&
        biddingTarget === 'TOTAL_PRICE'));

  const renderContent = (companyList, floatFlag, status) => {
    let filterCompanyList;
    filterCompanyList = companyList;
    if (sourceMethod !== 'INVITE' && status === 'NOT_START') {
      filterCompanyList = companyList.filter((item) => item.feedbackStatus === 'PARTICIPATED');
    }
    return map(filterCompanyList, (item) => {
      const { assignItemCountConcatQuotedCount, quotedCount } = item || {};
      let countNum = assignItemCountConcatQuotedCount ?? quotedCount;
      countNum = countNum ?? '-';

      // 供应商反馈node
      const supplierFeedBackNode = (
        <>
          {!!supBiddingStatusFlag && (
            <span>
              {/* 符合以上条件显示新竞价状态，否则走老逻辑 */}
              {item.supBiddingStatusMeaning}
            </span>
          )}
          {!supBiddingStatusFlag &&
            (status !== 'NOT_START' ? (
              barginFlag ? (
                <div>
                  {`${intl
                    .get('ssrc.inquiryHall.model.inquiryHall.reply')
                    .d('回复')} ${countNum} ${intl
                    .get('ssrc.inquiryHall.model.inquiryHall.line')
                    .d('行')}`}
                </div>
              ) : item.feedbackStatus === 'ABANDONED' ? (
                <Popover content={item.abandonRemark} overlayStyle={abandonRemarkStyle}>
                  <div className="qutationLine">{item.feedbackStatusMeaning}</div>
                </Popover>
              ) : (
                <div>
                  {`${quotationName} ${countNum} ${intl
                    .get('ssrc.inquiryHall.model.inquiryHall.line')
                    .d('行')}`}
                </div>
              )
            ) : (
              <div>{sourceMethod === 'INVITE' && item.feedbackStatusMeaning}</div>
            ))}
          {item.attachmentFlag ? <img src={require('@/assets/attachment.svg')} alt="" /> : ''}
        </>
      );
      return (
        <div className={floatFlag && Style.overContent}>
          <div className="moreContent">
            <div className="companyInfo">
              <div className="companyName">
                <Tooltip title={item.supplierCompanyName}>{item.supplierCompanyName} </Tooltip>
              </div>
              {remote
                ? remote.process(
                    'SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_SUPPLIER_FEEDBACK_NODE',
                    supplierFeedBackNode,
                    {
                      feedBackLine: item,
                      record,
                    }
                  )
                : supplierFeedBackNode}
              {remote
                ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_PREQUALLINE_MORE', '', {
                    item,
                  })
                : ''}
            </div>
          </div>
        </div>
      );
    });
  };
  const renderQutationInfo = (status) => {
    let content = '';
    const lineNum = status === 'ROUND_QUOTATION' ? 4 : 5;
    if (headerQuotationDetails && headerQuotationDetails.length) {
      if (headerQuotationDetails.length < lineNum) {
        content = [
          ...renderContent(headerQuotationDetails, false, status),
          <RoundQuotation
            lineRecord={record}
            barginFlag={barginFlag}
            sourceKey={sourceKey}
            rfxStatus={rfxStatus}
            rfxHeaderId={rfxHeaderId}
            customizeTable={customizeTable}
            quotationRoundNumber={quotationRoundNumber}
            hiddenFlag={roundQuotationExecuteFlag !== 1}
          />,
        ];
      } else {
        content = (
          <Fragment>
            {renderContent(headerQuotationDetails.slice(0, 3), false, status)}
            {/* <Popover
              placement="right"
              content={renderContent(headerQuotationDetails, true, status)}
            >
              <span className={Style.ellipsis}>. . .</span>
            </Popover> */}
            <Popover
              placement="right"
              content={supplierQuotationNewInfoRender(record, {
                supBiddingStatusFlag,
                remote,
                customizeTable,
                sourceKey,
                roundQuotationExecuteFlag,
              })}
            >
              <a>
                <span className={Style.ellipsis}>
                  {intl
                    .get(`ssrc.inquiryHall.view.message.commonQuotationMoreInfo`, { quotationName })
                    .d('更多{quotationName}情况')}
                </span>
              </a>
            </Popover>
          </Fragment>
        );
      }
    } else {
      content = '-';
    }
    // 二开埋点
    return remote
      ? remote.render('RENDER_QUOTATION_INFO_RENDER_CONTENT', content, {
          headerQuotationDetails,
          record,
          quotationName,
          status,
        })
      : content;
  };
  const renderRefuseReson = () => {
    const result = approveExecutiveRender({ record });
    return result || approvalMessage ? (
      <>
        {result}
        {approvalMessage ? (
          <>
            <span className="multiLineLabel">
              {intl.get('ssrc.inquiryHall.model.inquiryHall.approvalMessage').d('拒绝理由')}
            </span>
            <Popover content={approvalMessage}>{approvalMessage}</Popover>
          </>
        ) : null}
      </>
    ) : null;
  };
  const renderSubmitInfo = () => {
    // const resetItem = prequalLines && prequalLines.slice(2);
    const renderCompany = () => {
      return (
        <div className={Style.overContent}>
          {prequalLines &&
            prequalLines.length &&
            prequalLines.map((item) => (
              <div className="companyInfo">
                <div className="companyName">
                  <Tooltip title={item.supplierCompanyName}>{item.supplierCompanyName}</Tooltip>
                </div>
                <div className="qutationLine">{item.displayPreSupplerStatusMeaning}</div>
              </div>
            ))}
        </div>
      );
    };
    if (prequalLines && prequalLines.length && prequalLines.length < 4) {
      return (
        prequalLines.length &&
        prequalLines.map((item) => (
          <div className="companyInfo">
            <div className="companyName">
              <Tooltip title={item.supplierCompanyName}>{item.supplierCompanyName}</Tooltip>
            </div>
            <div className="qutationLine">{item.displayPreSupplerStatusMeaning}</div>
          </div>
        ))
      );
    } else if (prequalLines && prequalLines.length) {
      return (
        <Fragment>
          {prequalLines &&
            prequalLines.slice(0, 3).map((item) => (
              <div className="companyInfo">
                <div className="companyName">
                  <Tooltip title={item.supplierCompanyName}>{item.supplierCompanyName}</Tooltip>
                </div>
                <div className="qutationLine">{item.displayPreSupplerStatusMeaning}</div>
              </div>
            ))}
          <Popover placement="right" content={renderCompany()}>
            <a>
              <span className={Style.ellipsis}>
                {intl.get(`ssrc.inquiryHall.view.message.quotationMoreInfo`).d('更多报价情况')}
              </span>
            </a>
          </Popover>
        </Fragment>
      );
    }
  };
  const renderScoredInfo = (expertList) => {
    const renderMoreScore = (List) => {
      return List.map((item) => {
        return (
          <div className="companyInfo">
            <div className="companyName">
              <Popover content={item.expertName}>{item.expertName}</Popover>
            </div>
            <div className="qutationLine">
              {isCheck ? item.reviewScoredStatusMeaning : item.scoredStatusMeaning}
            </div>
          </div>
        );
      });
    };
    if (expertList.length < 4) {
      return renderMoreScore(expertList);
    } else {
      return (
        <Fragment>
          {renderMoreScore(expertList.slice(0, 3))}
          <Popover placement="right" content={renderMoreScore(expertList)}>
            <a>
              <span className={Style.ellipsis}>
                {intl
                  .get(`ssrc.inquiryHall.view.message.commonQuotationMoreInfo`, { quotationName })
                  .d('更多{quotationName}情况')}
              </span>
            </a>
          </Popover>
        </Fragment>
      );
    }
  };

  const renderFinishedContent = () => {
    const renderMore = (List) => {
      return List.map((item) => {
        return (
          // <div className={Style.overContent}>
          <div className="companyInfo">
            <div className="companyName">
              <Popover
                content={
                  <div>
                    <span className="multiLineLabel">{item.supplierCompanyName} </span>
                    {item.currencySymbol} {numberSeparatorRender(item.biddingAmount)}
                  </div>
                }
              >
                <span className="multiLineLabel">{item.supplierCompanyName} </span>
              </Popover>
            </div>
            <div>
              {item.currencySymbol} {numberSeparatorRender(item.biddingAmount)}
            </div>
          </div>
        );
      });
    };
    if (suggestedSuppliers?.length && suggestedSuppliers.length < 4) {
      return renderMore(suggestedSuppliers);
    } else if (suggestedSuppliers?.length) {
      return (
        <Fragment>
          {renderMore(suggestedSuppliers.slice(0, 3))}
          <Popover placement="right" content={renderMore(suggestedSuppliers, 1)}>
            <a>
              <span className={Style.ellipsis}>
                {intl
                  .get(`ssrc.inquiryHall.view.message.commonQuotationMoreInfo`, { quotationName })
                  .d('更多{quotationName}情况')}
              </span>
            </a>
          </Popover>
        </Fragment>
      );
    }
  };

  let mean = '';
  switch (rfxStatus) {
    case 'RELEASE_REJECTED':
    case 'PRE_EVALUATION_PENDING_REJECT':
    case 'CHECK_REJECTED':
      mean = renderRefuseReson();
      break;
    case 'PENDING_PREQUAL': // 待预审审批
    case 'IN_PREQUAL': // 资格预审中
      mean = renderSubmitInfo();
      break;
    case 'NOT_START': // 未开始
      mean = renderQutationInfo('NOT_START');
      break;
    case 'IN_QUOTATION':
    case 'LACK_QUOTED':
    case 'ROUND_QUOTATION': // 多轮报价
    case 'PRETRIAL_PENDING':
    case 'CHECK_PENDING':
      mean = renderQutationInfo(rfxStatus);
      break;
    case 'OPENED':
    case 'OPEN_BID_PENDING':
      if (bidOpeningNewFlag && expertScoreType === 'ONLINE') {
        mean = scoreStepRender(progresses);
      } else {
        mean = renderQutationInfo();
      }
      break;
    case 'SCORING': // 评分中
      if (Number(evaluateLeaderFlag) === 1) {
        mean = !evaluateExperts ? scoreStepRender(progresses) : renderScoredInfo(evaluateExperts);
      } else {
        mean = scoreStepRender(progresses);
      }
      break;
    case 'PAUSED':
      mean = intl.get('ssrc.inquiryHall.model.inquiryHall.pause').d('暂停中');
      break;
    case 'RELEASE_APPROVING': // 发布审批中
    case 'PRE_EVALUATION_APPROVING': // 中标候选人审批中
    case 'CHECK_APPROVING': // 	核价审批中
      mean = approveExecutiveRender({ record });
      break;
    case 'FINISHED':
      mean = renderFinishedContent();
      break;
    case 'CLOSED':
      mean = descriptionRender({ record });
      break;
    default:
      mean = '-';
      break;
  }

  if (barginFlag) {
    mean = renderQutationInfo();
  }
  return mean;
}

// 评分渲染
export function scoreStepRender(scoreProgresses) {
  if (!scoreProgresses?.length) return '-';
  const {
    progressName: currentProgressName,
    progressNameMeaning: currentProgressNameMeaning,
    progressSequence: currentProgressSequence,
  } = (scoreProgresses && scoreProgresses.find((item) => item.isCurrentFlag === 1)) || {};
  const stepStatusMap = {};
  scoreProgresses.forEach(({ progressName, progressSequence }) => {
    // eslint-disable-next-line no-lone-blocks
    {
      stepStatusMap[progressName] =
        scoreProgresses.length - 1 === currentProgressSequence ||
        progressSequence < currentProgressSequence
          ? 'finish'
          : progressSequence > currentProgressSequence
          ? 'wait'
          : 'process';
    }
  });
  return (
    <Steps
      type="popup"
      headerText={currentProgressNameMeaning}
      status={stepStatusMap[currentProgressName]}
    >
      {scoreProgresses.map(({ progressNameMeaning, progressName }) => {
        return (
          <Step
            key={progressName}
            title={progressNameMeaning}
            status={stepStatusMap[progressName]}
          />
        );
      })}
    </Steps>
  );
}

export function QuotationInfoRF({ record }) {
  const {
    headerQuotationDetails = EMPTY_ARRAY,
    displayRfStatus,
    rejectMessage,
    scoreProgresses, // 专家评分进度条
    evaluateExperts, // 评分情况
    initialReview,
    scoreStatus,
  } =
    record.get([
      'headerQuotationDetails',
      'displayRfStatus',
      'rejectMessage',
      'scoreProgresses',
      'evaluateExperts',
      'initialReview',
      'scoreStatus',
    ]) || {};
  const isCheck = initialReview === 'NEED' && scoreStatus === 'INITIAL_REVIEW_SCORING';

  const renderContent = (companyList, floatFlag) => {
    return map(companyList, (item) => {
      return (
        <div className={floatFlag && Style.overContent}>
          <div className="moreContent">
            <div className="companyInfo">
              <div className="companyName">
                <Popover content={item.supplierCompanyName}>{item.supplierCompanyName} </Popover>
              </div>
              <div>{item.feedbackStatusMeaning}</div>
            </div>
          </div>
        </div>
      );
    });
  };
  const renderQutationInfo = () => {
    if (headerQuotationDetails && headerQuotationDetails.length) {
      if (headerQuotationDetails.length < 5) {
        return renderContent(headerQuotationDetails, false);
      } else {
        return (
          <Fragment>
            {renderContent(headerQuotationDetails.slice(0, 3), false)}
            <Popover placement="right" content={supplierReplyNewInfoRender(record, 1)}>
              <a>
                <span className={Style.ellipsis}>
                  {intl.get(`ssrc.inquiryHall.view.message.moreReply`).d('更多回复情况')}
                </span>
              </a>
            </Popover>
          </Fragment>
        );
      }
    } else {
      return '-';
    }
  };
  const renderRefuseReson = () => {
    const result = approveExecutiveRFRender(record);
    return result || rejectMessage ? (
      <>
        {result}
        {rejectMessage ? (
          <div>
            <span className="multiLineLabel">
              {intl.get('ssrc.inquiryHall.model.inquiryHall.approvalMessage').d('拒绝理由')}
            </span>
            <Popover content={rejectMessage}>{rejectMessage}</Popover>
          </div>
        ) : null}
      </>
    ) : null;
  };

  const renderScoredInfo = (expertList) => {
    const renderScore = (List) => {
      return List.map((item) => {
        return (
          <div className="companyInfo">
            <div className="companyName">
              <Popover content={item.expertName}>{item.expertName}</Popover>
            </div>
            <div className="qutationLine">
              {isCheck ? item.reviewScoredStatusMeaning : item.scoredStatusMeaning}
            </div>
          </div>
        );
      });
    };
    const renderMoreScore = (list) => {
      return (
        <>
          <div className={Style['supplier-quotation-info-container']}>
            <div className={Style['supplier-quotation-info-title']}>
              <span className={Style['item-left']}>
                {intl.get(`ssrc.inquiryHall.model.inquiryHall.expertName`).d('专家名称')}
              </span>
              <span className={Style['item-right']}>
                {intl.get(`ssrc.inquiryHall.model.common.statusMeaning`).d('状态')}
              </span>
            </div>
            <div
              className={Style['supplier-quotation-info-content']}
              style={{ maxHeight: '320px', overflow: 'auto' }}
            >
              {map(list, (item) => {
                return (
                  <div className={Style['item-wrap']} key={item.expertId}>
                    <Popover placement="topLeft" content={item.expertName}>
                      <span className={Style['item-left']}>{item.expertName}</span>
                    </Popover>
                    <span className={Style['item-right']}>{item.status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      );
    };
    if (expertList.length < 5) {
      return renderScore(expertList);
    } else {
      return (
        <Fragment>
          {renderMoreScore(expertList.slice(0, 3))}
          <Popover placement="right" content={renderMoreScore(expertList)}>
            <a>
              <span className={Style.ellipsis}>
                {intl.get(`ssrc.inquiryHall.view.message.moreScore`).d('更多评分情况')}
              </span>
            </a>
          </Popover>
        </Fragment>
      );
    }
  };

  const descriptionRenderRF = () => {
    return (
      <div className={Style.descriptionRender}>
        <div>
          <span className="multiLineLabel">
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.closeReason`).d('关闭理由')}
          </span>
          {record.get('closeRemark') || '-'}
        </div>
      </div>
    );
  };

  let mean = '';
  switch (displayRfStatus) {
    case 'RELEASE_REJECTED':
    case 'CHECK_REJECTED':
      mean = renderRefuseReson();
      break;
    case 'NOT_START': // 未开始
      mean = renderQutationInfo();
      break;
    case 'IN_QUOTATION':
    case 'LACK_QUOTED':
    case 'CHECK_PENDING':
    case 'FINISHED':
      mean = renderQutationInfo();
      break;
    case 'SCORING': // 评分中
    case 'SCORE_SUMMARY_PENDING': // 待评分汇总
    case 'CONFIRM_CANDIDATES_PENDING': // 待定候选人
      mean = !evaluateExperts
        ? scoreStepRender(scoreProgresses)
        : renderScoredInfo(evaluateExperts);
      break;
    // case 'SCORE_SUMMARY_PENDING': // 待评分汇总
    // case 'CONFIRM_CANDIDATES_PENDING': // 待定候选人
    //   if (Number(evaluateLeaderFlag) === 1) {
    //     mean = !evaluateExperts ? (
    //       <Popover content={stepRender()} placement="rightTop">
    //         <div>{currentProgress && currentProgress.progressNameMeaning}</div>
    //       </Popover>
    //     ) : (
    //       renderScoredInfo(evaluateExperts)
    //     );
    //   } else {
    //     mean = currentProgress && (
    //       <Popover content={stepRender()} placement="rightTop">
    //         {currentProgress && currentProgress.progressNameMeaning}
    //       </Popover>
    //     );
    //   }
    //   break;
    case 'RELEASE_APPROVING': // 发布审批中
    case 'CHECK_APPROVING': // 	结果审批中
      mean = approveExecutiveRFRender(record);
      break;
    case 'CLOSED':
      mean = descriptionRenderRF({ record });
      break;
    default:
      mean = '-';
      break;
  }
  return mean;
}

// 渲染dragIcon
export function dragIconRender({ record }) {
  const originalData = record.data;
  const { rfxStatus, sourceCategoryMeaning, rfxNum } = originalData;
  const dragText = intl
    .get(`ssrc.inquiryHall.model.inquiryHall.sourceCategoryNum`, {
      rfxNum,
      sourceCategory: sourceCategoryMeaning,
    })
    .d('{sourceCategory}单{rfxNum}');
  const chatProps = {
    dragText,
    requestBody: originalData,
  };
  const style = { display: 'inline-flex' };
  switch (rfxStatus) {
    case 'IN_QUOTATION':
      return (
        <span style={style}>
          <IMChatDraggable cardCode="SSRC_RFX_QUOTATIOIN_ATTENTION" {...chatProps} />
        </span>
      );
    case 'BARGAINING':
      return (
        <span style={style}>
          <IMChatDraggable cardCode="SSRC_RFX_BARGAIN_ATTENTION" {...chatProps} />
        </span>
      );
    case 'ROUND_QUOTATION':
      return (
        <span style={style}>
          <IMChatDraggable cardCode="SSRC_RFX_ROUND_QUOTATIOIN_ATTENTION" {...chatProps} />
        </span>
      );
    default:
      // 其余状态
      return (
        <span style={style}>
          <IMChatDraggable cardCode="SSRC_RFX_COMMON_STATUS_ATTENTION" {...chatProps} />
        </span>
      );
  }
}

/**
 * 状态
 * @param {object} param
 */
export function statusRender(payload = {}, aggregation) {
  const { record } = payload || {};
  const {
    flowLinks,
    countDownDay,
    rfxStatus,
    currentDate = null,
    quotationStartDate,
    secondarySourceCategory,
    offlineWholeFlag,
    biddingFlag, // 竞价大厅-竞价单标识
    biddingNextStatusMeaning, // biddingNextStatus 下一状态（竞价大厅专用字段：竞价开始、签到开始、签到结束、试竞价开始、试竞价结束、竞价开始、竞价结束。后续与其他一样）
  } =
    record.get([
      'flowLinks',
      'countDownDay',
      'rfxStatus',
      'currentDate',
      'quotationStartDate',
      'secondarySourceCategory',
      'offlineWholeFlag',
      'biddingFlag',
      'biddingNextStatusMeaning',
    ]) || {};

  // 竞价大厅-竞价单标识
  const newBiddingFlag =
    secondarySourceCategory === 'RFA' && (biddingFlag === 1 || biddingFlag === '1');
  /* 竞价大厅-竞价单 & (未开始状态|报价中) & 聚合状态下 & 倒计时间有值 */
  const showNewBiddingTimeFlag =
    !!newBiddingFlag &&
    ['NOT_START', 'IN_QUOTATION'].includes(rfxStatus) &&
    biddingNextStatusMeaning;

  const CurrentDateTime = moment(currentDate || new Date());

  const diffTime = Math.abs(CurrentDateTime.diff(countDownDay, 'second'));
  let diffDay = Math.abs(CurrentDateTime.diff(countDownDay, 'day'));
  let year;
  let month;
  let week;
  let day;
  let hour;
  let second;
  let hoverTime = '';
  let displayTime = '';
  let minute;
  let resetTime;

  const getTime = (time) => {
    switch (true) {
      case time > 31536000:
        year = parseInt(time / 31536000, 0);
        hoverTime = year + intl.get('ssrc.common.model.year').d('年');
        resetTime = time % 31536000;
        getTime(resetTime);
        break;
      case time > 2592000:
        month = parseInt(time / 2592000, 0);
        hoverTime += month + intl.get('ssrc.common.model.month').d('月');
        resetTime = time % 2592000;
        getTime(resetTime);
        break;
      case time > 604800:
        week = parseInt(time / 604800, 0);
        hoverTime += week + intl.get('ssrc.common.model.week').d('周');
        resetTime = time % 604800;
        getTime(resetTime);
        break;
      case time > 86400:
        day = parseInt(time / 86400, 0);
        hoverTime += day + intl.get('ssrc.common.model.day').d('天');
        resetTime = time % 86400;
        getTime(resetTime);
        break;
      case time > 3600:
        hour = parseInt(time / 3600, 0);
        hoverTime += hour + intl.get('ssrc.common.model.hour').d('小时');
        resetTime = time % 3600;
        getTime(resetTime);
        break;
      case time > 60:
        minute = parseInt(time / 60, 0);
        hoverTime += minute + intl.get('ssrc.common.model.minute').d('分钟');
        resetTime = time % 60;
        getTime(resetTime);
        break;
      case time > 0:
        second = time;
        hoverTime += second + intl.get('ssrc.common.model.second').d('秒');
        break;
      default:
        break;
    }
  };
  const getDisplayTime = (displayPayload = {}) => {
    const {
      showSpecificSecondFlag, // 是否显示具体的秒数
    } = displayPayload || {};
    switch (true) {
      case year > 0:
        displayTime = year + intl.get('ssrc.common.model.year').d('年');
        break;
      case month > 0:
        displayTime = month + intl.get('ssrc.common.model.month').d('月');
        break;
      case week > 0:
        displayTime = week + intl.get('ssrc.common.model.week').d('周');
        break;
      case day > 0:
        displayTime = day + intl.get('ssrc.common.model.day').d('天');
        break;
      case hour > 0:
        displayTime = hour + intl.get('ssrc.common.model.hour').d('小时');
        break;
      case minute > 0:
        displayTime = minute + intl.get('ssrc.common.model.minute').d('分钟');
        break;
      case second > 0:
        displayTime = showSpecificSecondFlag
          ? `${second} ${intl.get('ssrc.common.model.second').d('秒')}`
          : intl.get('ssrc.common.model.justNow').d('刚刚');
        break;
      default:
        break;
    }
  };
  getTime(diffTime);
  getDisplayTime({ showSpecificSecondFlag: showNewBiddingTimeFlag });

  const stepRender = () => {
    const currentIndex =
      flowLinks && flowLinks.length && flowLinks.findIndex((item) => item.nodeFlag === 0);
    return (
      <Steps
        type="popup"
        headerText={rfxStatusMeaningRender(record)}
        current={rfxStatus === 'NOT_START' ? (currentIndex || 0) + 1 : currentIndex}
        status={statusTagColorMap[rfxStatus]}
      >
        {flowLinks &&
          flowLinks.length &&
          flowLinks.map((item) => {
            if (item.nodeFlag === -1) {
              return <Step title={item.nodeStatusMeaning} />;
            } else if (item.nodeFlag === 0) {
              return <Step title={item.nodeStatusMeaning} />;
            } else {
              return <Step title={item.nodeStatusMeaning} />;
            }
          })}
      </Steps>
    );
  };

  const countDownDayList = [
    'NOT_START',
    'IN_PREQUAL',
    'IN_QUOTATION',
    'ROUND_QUOTATION',
    'PENDING_PREQUAL',
    'BARGAINING',
  ];

  if (
    (rfxStatus === 'PENDING_PREQUAL' && moment(currentDate || new Date()).isAfter(countDownDay)) ||
    (rfxStatus === 'ROUND_QUOTATION' && moment(currentDate || new Date()).isAfter(countDownDay))
  ) {
    displayTime = 0 + intl.get('ssrc.common.model.second').d('秒');
    hoverTime = 0 + intl.get('ssrc.common.model.second').d('秒');
    diffDay = 0;
  }

  return (
    <Fragment>
      <div>{stepRender()}</div>

      {aggregation &&
        (countDownDay ? (
          <Popover content={hoverTime} placement="right">
            {countDownDayList.includes(rfxStatus) ? (
              <Tag className={diffDay >= 3 ? 'green' : diffDay >= 1 ? 'yellow' : 'red'}>
                {/* 竞价大厅-竞价单  */}
                {showNewBiddingTimeFlag
                  ? `${intl
                      .get('ssrc.inquiryHall.model.inquiryHall.distance')
                      .d('距')}${biddingNextStatusMeaning}：${displayTime || '0'}`
                  : intl.get('ssrc.inquiryHall.model.inquiryHall.countDown').d('倒计时：') +
                      displayTime || '0'}
              </Tag>
            ) : (
              <Tag className={diffDay >= 7 ? 'red' : diffDay >= 3 ? 'yellow' : 'green'}>
                {intl.get('ssrc.inquiryHall.model.inquiryHall.stayTime').d('已停留：') +
                  displayTime || '0'}
              </Tag>
            )}
          </Popover>
        ) : (
          rfxStatus === 'NOT_START' &&
          !offlineWholeFlag &&
          !quotationStartDate && (
            <Popover
              placement="rightBottom"
              content={
                secondarySourceCategory === 'NEW_BID'
                  ? intl
                      .get(
                        'ssrc.inquiryHall.model.inquiryHall.tooltip.biddingProcessToAddBidStartTime'
                      )
                      .d('请通过招标过程控制补充投标开始时间')
                  : intl
                      .get(
                        'ssrc.inquiryHall.model.inquiryHall.tooltip.inquiryProcessToAddQuotationStartTime'
                      )
                      .d('请通过寻源过程控制补充报价开始时间')
              }
            >
              <Tag color="yellow" style={{ border: 'none' }}>
                {intl
                  .get(
                    'ssrc.inquiryHall.model.inquiryHall.view.message.toBeSupplementedInformation'
                  )
                  .d('待补充信息')}
              </Tag>
            </Popover>
          )
        ))}
      {aggregation && record.get('secondaryStatusMeaning') ? (
        <Tag className="yellow">{record.get('secondaryStatusMeaning')}</Tag>
      ) : null}
    </Fragment>
  );
}

// 渲染状态
const rfxStatusMeaningRender = (record) => {
  const rfxStatusMeaning = record.get('rfxStatusMeaning');
  const style = { display: 'inline-flex' };
  return <span style={style}>{rfxStatusMeaning}</span>;
};

/**
 * 说明
 */
export function descriptionRender({ record }) {
  const data = record.toData();
  return (
    <div className={Style.descriptionRender}>
      {data && data.rfxStatus === 'FINISHED' ? (
        <div>
          <span className="multiLineLabel">
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.checkRemark`).d('核价备注')}
          </span>
          {data.checkRemark}
        </div>
      ) : (
        <div>
          <span className="multiLineLabel">
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.closeReason`).d('关闭理由')}
          </span>
          {data.closeRemark}
        </div>
      )}
    </div>
  );
}

/**
 * 完成时间
 */
export function finishedTimeRender({ record }) {
  const { rfxStatusMeaning, checkFinishedDate } =
    record.get(['rfxStatusMeaning', 'checkFinishedDate']) || {};
  return (
    <Fragment>
      <span className="multiLineLabel">
        {rfxStatusMeaning}
        {intl.get('ssrc.inquiryHall.model.inquiryHall.time').d('时间')}
      </span>
      {checkFinishedDate}
    </Fragment>
  );
}

/**
 * 自己页面查接口的权限按钮
 * 暂时仅适用于询价工作台，后面有需求再补充
 * @param {*} props {onClick: '',controllerType: '', approve: '' }
 * @returns Node
 */
export function customPermissionButton(props) {
  if (props.approve) {
    if (props.type === 'lov') {
      const { display, ...others } = props;
      return (
        <Lov noCache funcType="link" mode="button" clearButton={false} {...others}>
          {display}
        </Lov>
      );
    } else {
      return <a onClick={props.onClick}>{props.display}</a>;
    }
  } else if (props.controllerType === 'hidden' || !props.approve) {
    return null;
  } else if (props.type === 'lov') {
    const { display, ...others } = props;
    return (
      <Lov noCache disabled funcType="link" mode="button" clearButton={false} {...others}>
        {display}
      </Lov>
    );
  } else {
    return (
      <a disabled style={{ cursor: 'not-allowed', color: 'rgba(0, 0, 0, 0.25)' }}>
        {props.display}
      </a>
    );
  }
}

/**
 * 供应商报价参与情况
 */
export function supplierQuotationInfoRender(record) {
  const {
    headerQuotationDetails,
    rfxStatus,
    quotationRoundNumber,
    secondarySourceCategory,
  } = record.get([
    'headerQuotationDetails',
    'rfxStatus',
    'quotationRoundNumber',
    'secondarySourceCategory',
  ]);
  const bidFlag = secondarySourceCategory === 'NEW_BID';
  const quotationName = getQuotationName(bidFlag);
  const getQuotationRoundInfo = () => {
    if (rfxStatus === 'BARGAINING') {
      return intl.get(`ssrc.inquiryHall.view.message.bargainingFeedback`).d('议价响应');
    } else {
      return isNull(quotationRoundNumber) || quotationRoundNumber === 1
        ? intl
            .get(`ssrc.inquiryHall.view.message.commonQuotationInfo`, { quotationName })
            .d('{quotationName}情况')
        : intl
            .get(`ssrc.inquiryHall.view.message.commonQuotationRound`, {
              round: quotationRoundNumber,
            })
            .d('第{round}轮报价');
    }
  };
  return (
    <>
      <div className={Style['supplier-quotation-info-container']}>
        <div className={Style['supplier-quotation-info-title']}>
          <span className={Style['item-left']}>
            {intl.get(`ssrc.inquiryHall.view.message.supplierCompanyName`).d('供应商名称')}
          </span>
          <span className={Style['item-right']}>{getQuotationRoundInfo()}</span>
        </div>
        <div className={Style['supplier-quotation-info-content']}>
          {map(headerQuotationDetails, (item) => {
            const { assignItemCountConcatQuotedCount, quotedCount } = item || {};
            let countNum = assignItemCountConcatQuotedCount ?? quotedCount;
            countNum = countNum ?? '-';

            return (
              <div className={Style['item-wrap']} key={item.supplierCompanyId}>
                <Popover placement="topLeft" content={item.supplierCompanyName}>
                  <span className={Style['item-left']}>{item.supplierCompanyName}</span>
                </Popover>
                <span className={Style['item-right']}>
                  {rfxStatus === 'BARGAINING'
                    ? intl
                        .get(`ssrc.inquiryHall.view.message.bargainFeedbackLineInfo`, {
                          count: countNum,
                        })
                        .d('响应 {count} 行')
                    : intl
                        .get(`ssrc.inquiryHall.view.message.quotationLineInfo`, {
                          count: countNum,
                          quotationName,
                        })
                        .d('{quotationName} {count} 行')}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// RF回复情况
export function supplierReplyNewInfoRender(record) {
  const { headerQuotationDetails } = record.get(['headerQuotationDetails']);
  return (
    <>
      <div className={Style['supplier-quotation-info-container']}>
        <div className={Style['supplier-quotation-info-title']}>
          <span className={Style['item-left']}>
            {intl.get(`ssrc.inquiryHall.view.message.supplierCompanyName`).d('供应商名称')}
          </span>
          <span className={Style['item-right']}>
            {intl.get(`ssrc.inquiryHall.view.message.replySituation`).d('回复情况')}
          </span>
        </div>
        <div
          className={Style['supplier-quotation-info-content']}
          style={{ maxHeight: '320px', overflow: 'auto' }}
        >
          {map(headerQuotationDetails, (item) => {
            return (
              <div className={Style['item-wrap']} key={item.supplierCompanyId}>
                <Popover placement="topLeft" content={item.supplierCompanyName}>
                  <span className={Style['item-left']}>{item.supplierCompanyName}</span>
                </Popover>
                <span className={Style['item-right']}>{item.feedbackStatusMeaning}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

/**
 * 供应商报价参与情况 - new
 */
export function supplierQuotationNewInfoRender(record, otherPayload = {}) {
  const { supBiddingStatusFlag, remote, customizeTable, sourceKey, roundQuotationExecuteFlag = 0 } =
    otherPayload || {};

  const {
    rfxStatus,
    rfxHeaderId,
    headerQuotationDetails,
    quotationRoundNumber,
    secondarySourceCategory,
    sourceMethod,
  } = record.get([
    'rfxStatus',
    'rfxHeaderId',
    'headerQuotationDetails',
    'quotationRoundNumber',
    'secondarySourceCategory',
    'sourceMethod',
  ]);
  const bidFlag = secondarySourceCategory === 'NEW_BID';
  const quotationName = getQuotationName(bidFlag);
  const getQuotationRoundInfo = () => {
    if (rfxStatus === 'BARGAINING') {
      return intl.get(`ssrc.inquiryHall.view.message.bargainingFeedback`).d('议价响应');
    } else {
      return isNull(quotationRoundNumber) || quotationRoundNumber === 1
        ? intl
            .get(`ssrc.inquiryHall.view.message.commonQuotationInfo`, { quotationName })
            .d('{quotationName}情况')
        : intl
            .get(`ssrc.inquiryHall.view.message.commonQuotationRound`, {
              round: quotationRoundNumber,
            })
            .d('第{round}轮报价');
    }
  };
  return (
    <>
      <div className={Style['supplier-quotation-info-container']}>
        <div className={Style['supplier-quotation-info-title']}>
          <span className={Style['item-left']}>
            {intl.get(`ssrc.inquiryHall.view.message.supplierCompanyName`).d('供应商名称')}
          </span>
          <span className={Style['item-right']}>{getQuotationRoundInfo()}</span>
          {remote
            ? remote.process('SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_QUOTATION_INFO_TITLE_MORE', '')
            : ''}
        </div>
        <div
          className={Style['supplier-quotation-info-content']}
          style={{ maxHeight: '320px', overflow: 'auto' }}
        >
          {map(headerQuotationDetails, (item) => {
            const { assignItemCountConcatQuotedCount, quotedCount } = item || {};
            let countNum = assignItemCountConcatQuotedCount ?? quotedCount;
            countNum = countNum ?? '-';

            return (
              <div className={Style['item-wrap']} key={item.supplierCompanyId}>
                <Popover placement="topLeft" content={item.supplierCompanyName}>
                  <span className={Style['item-left']}>{item.supplierCompanyName}</span>
                </Popover>
                {!!supBiddingStatusFlag && (
                  <Popover placement="topLeft" content={item.supBiddingStatusMeaning}>
                    <span className={Style['item-right']}>
                      {/* 符合以上条件显示新竞价状态，否则走老逻辑 */}
                      {item.supBiddingStatusMeaning}
                    </span>
                  </Popover>
                )}
                {!supBiddingStatusFlag && (
                  <span className={Style['item-right']}>
                    {rfxStatus === 'NOT_START' ? (
                      <div>{sourceMethod === 'INVITE' && item.feedbackStatusMeaning}</div>
                    ) : rfxStatus === 'BARGAINING' ? (
                      <Popover
                        placement="topLeft"
                        content={intl
                          .get(`ssrc.inquiryHall.view.message.bargainFeedbackLineInfo`, {
                            count: countNum,
                          })
                          .d('响应 {count} 行')}
                      >
                        {intl
                          .get(`ssrc.inquiryHall.view.message.bargainFeedbackLineInfo`, {
                            count: countNum,
                          })
                          .d('响应 {count} 行')}
                      </Popover>
                    ) : item.feedbackStatus === 'ABANDONED' ? (
                      <Popover content={item.abandonRemark} overlayStyle={abandonRemarkStyle}>
                        <div className="qutationLine">{item.feedbackStatusMeaning}</div>
                      </Popover>
                    ) : (
                      <Popover
                        placement="topLeft"
                        content={intl
                          .get(`ssrc.inquiryHall.view.message.quotationLineInfo`, {
                            count: countNum,
                            quotationName,
                          })
                          .d('{quotationName} {count} 行')}
                      >
                        {intl
                          .get(`ssrc.inquiryHall.view.message.quotationLineInfo`, {
                            count: countNum,
                            quotationName,
                          })
                          .d('{quotationName} {count} 行')}
                      </Popover>
                    )}
                  </span>
                )}
                {remote
                  ? remote.process(
                      'SSRC_INQUIRY_HALL_NEW_LIST_PROCESS_QUOTATION_INFO_CONTENT_MORE',
                      '',
                      { item }
                    )
                  : ''}
              </div>
            );
          })}
          <RoundQuotation
            lineRecord={record}
            rfxStatus={rfxStatus}
            sourceKey={sourceKey}
            rfxHeaderId={rfxHeaderId}
            customizeTable={customizeTable}
            quotationRoundNumber={quotationRoundNumber}
            hiddenFlag={roundQuotationExecuteFlag !== 1}
          />
        </div>
      </div>
    </>
  );
}

/**
 * 进行中-待审批-执行情况
 * @param {Object} record 行信息
 */
export function approveExecutiveRender({ record }) {
  const { headerWorkFlows = [], observerFlag } = record.toData();
  const businessKey = record?.get('businessKey');
  const { dataSet } = record || {};
  const simpleApprovalHistoryData = dataSet?.getState('simpleApprovalHistoryData') || {};
  const currentWorkFlow = headerWorkFlows && headerWorkFlows[headerWorkFlows.length - 1];
  // 存在businessKey则使用平台组件展示工作流信息
  return !observerFlag && !isEmpty(headerWorkFlows) ? (
    businessKey ? (
      <ApproveRecordSimple data={simpleApprovalHistoryData[record?.get('businessKey')]} />
    ) : (
      workFlowNewStepRender({
        headerWorkFlows,
        headerText: `${currentWorkFlow.employeeName}${
          currentWorkFlow.approvalMessageMeaning || '-'
        }`,
        currentWorkFlow,
      })
    )
  ) : null;
}

// RF待审批执行情况
export function approveExecutiveRFRender(record) {
  const { dataSet } = record;
  const businessKey = record.get('businessKey');
  const simpleApprovalHistoryData = dataSet?.getState('simpleApprovalHistoryData') || {};
  return <ApproveRecordSimple data={simpleApprovalHistoryData[businessKey]} />;
}

/**
 * 询价工作台审批工作流渲染
 * 为了不影响二开-新开一个方法
 */
export function workFlowNewStepRender(payload) {
  const { headerText, headerWorkFlows, currentWorkFlow } = payload || {};
  const stepStatusMap = {
    Pending: 'wait',
    Rejected: 'error',
  };
  const stepStatusWrapperMap = {
    Pending: 'process',
    Rejected: 'error',
  };
  return (
    headerWorkFlows &&
    headerWorkFlows.length && (
      <Steps
        current={headerWorkFlows.length}
        type="popup"
        headerText={headerText}
        status={stepStatusWrapperMap[currentWorkFlow?.approvalMessage] || 'finish'}
      >
        {headerWorkFlows.map((item) => {
          return (
            <Step
              title={`${item.employeeName}${item.approvalMessageMeaning || '-'}`}
              status={stepStatusMap[item.approvalMessage] || 'finish'}
            />
          );
        })}
      </Steps>
    )
  );
}

/**
 * 询价工作台审批工作流渲染
 * @param {Array} headerWorkFlows - 从接口获取的工作流数据
 * @protected 此方法被【玛格家具】二开调用，请勿删除、修改此方法名！！！
 */
export function workFlowStepRender(headerWorkFlows) {
  return (
    headerWorkFlows &&
    headerWorkFlows.length && (
      <Steps
        size="small"
        current={headerWorkFlows.length}
        direction="vertical"
        className={Style.steps}
      >
        {headerWorkFlows.map((item) => {
          if (item.approvalMessage === 'Pending') {
            return (
              <Step
                className={Style.approvalPending}
                title={`${item.employeeName}${item.approvalMessageMeaning || '-'}`}
                icon={<img src={require('@/assets/step-approval.svg')} alt="" />}
              />
            );
          } else if (item.approvalMessage === 'Rejected') {
            return (
              <Step
                className={Style.refuse}
                title={`${item.employeeName}${item.approvalMessageMeaning || '-'}`}
                icon={<img src={require('@/assets/step-refuse.svg')} alt="" />}
              />
            );
          }
          return (
            <Step
              title={`${item.employeeName}${item.approvalMessageMeaning || '-'}`}
              icon={<img src={require('@/assets/step-pass.svg')} alt="" />}
            />
          );
        })}
      </Steps>
    )
  );
}

/**
 * 供应商风险扫描/风险监控
 * @param { Object } -
 */
export async function supplierRiskScan({ supplierCompanyId, rfxHeaderId }) {
  if (!supplierCompanyId) {
    return;
  }

  // 按钮确定事件逻辑
  const handleLinkRisk = async () => {
    let res;
    try {
      res = await linkRiskScan({
        enterpriseId: supplierCompanyId,
        scanCode: 'rfx_supplier',
        rfxHeaderId,
      });
    } catch (err) {
      throw err;
    }
    if (!res || !urlReg.test(res)) {
      const result = JSON.parse(res || '{}') || {};
      if (result && result.failed) {
        notification.warning({
          message: result.message || null,
        });
      }
      return;
    }
    window.open(res);
  };
  // 校验接口
  const doValidate = () => {
    return validateRiskScan({
      enterpriseId: supplierCompanyId,
      scanCode: 'rfx_supplier',
      rfxHeaderId,
    });
  };
  const ValidateResult = await doValidate();
  if (ValidateResult && ValidateResult.failed) {
    if (ValidateResult.message) {
      notification.warning({
        message: ValidateResult.message,
      });
    }
    return;
  }
  if (isEmpty(ValidateResult)) {
    // 如果啥都没返回 则跳转
    handleLinkRisk();
    return;
  }
  if (
    !ValidateResult ||
    ValidateResult.failed ||
    !(ValidateResult.code && ValidateResult.message)
  ) {
    return;
  }

  // 校验弹框提示
  validatorConfirmModal({
    response: ValidateResult,
    validatorType: 'type',
    validatorArrName: 'message',
    isOkLoading: true,
    onOk: async () => {
      await handleLinkRisk();
    },
  });
}

/**
 * 征询书-执行情况
 * @param {Object} record 行信息
 */
export function rfFeedBackStatusRender(status = '', statusMeaning = '') {
  // NEW 未参与 PARTICIPATED 已参与 ABANDONED 已放弃 REPLIED 已回复 SUGGESTED 已选用
  const list = [
    {
      status: ['REPLIED', 'PARTICIPATED', 'SUGGESTED'],
      color: 'green', // 绿色
    },
    {
      status: ['NEW', 'ABANDONED'],
      color: 'gray', // 灰色
    },
  ];
  const colorConfig = list.find((i) => i.status.includes(status));
  return (
    statusMeaning && (
      <Tag color={colorConfig?.color || 'green'} style={{ border: 'none' }}>
        {statusMeaning}
      </Tag>
    )
  );
}

/**
 * rf列表状态渲染
 */
export function rfStatusRender({ record }) {
  // 步骤条tag对应的颜色集
  const rfStatusTagColorMap = {
    NEW: 'process', // 新建
    RELEASE_APPROVING: 'process', // 发布审批中
    RELEASE_REJECTED: 'error', // 发布审批拒绝
    NOT_START: 'process', // 未开始
    IN_QUOTATION: 'process', // 回复中
    LACK_QUOTED: 'error', // 响应不足
    COMPLIANCE_CHECKING: 'process', // 符合性检查中
    COMPLIANCE_CHECK_CONFIRMATION: 'process', //	符合性检查结果确认
    SCORING: 'process', // 评分中
    SCORE_SUMMARY_PENDING: 'process', //	待评分汇总
    CONFIRM_CANDIDATES_PENDING: 'process', // 待定候选人
    CHECK_PENDING: 'process', // 待确定供应商
    CHECK_APPROVING: 'process', //	结果审批中
    CHECK_REJECTED: 'error', // 结果审批拒绝
    FINISHED: 'finish', // 已完成
    CLOSED: 'process', // 关闭
    CANCELED: 'process', // 取消
  };
  const { progressNodes: flowLinks, rfStatus } = record.get(['progressNodes', 'rfStatus']) || {};
  const currentIndex =
    flowLinks && flowLinks.length && flowLinks.findIndex((item) => item.currentNodeFlag === 1);
  return (
    <Steps
      type="popup"
      size="small"
      current={currentIndex}
      direction="vertical"
      headerText={record.get('displayRfStatusMeaning')}
      status={rfStatusTagColorMap[rfStatus]}
    >
      {flowLinks &&
        flowLinks.length &&
        flowLinks.map((item) => {
          if (item.finishedFlag && !item.currentNodeFlag) {
            return <Step title={item.nodeStatusMeaning} />;
          } else if (item.currentNodeFlag) {
            return <Step title={item.nodeStatusMeaning} />;
          } else {
            return <Step title={item.nodeStatusMeaning} />;
          }
        })}
    </Steps>
  );
}

/**
 * 多轮报价-执行情况
 */
export const RoundQuotation = (props) => {
  const {
    rfxStatus = null,
    rfxHeaderId,
    quotationRoundNumber = 0,
    customizeTable,
    lineRecord,
    sourceKey,
    hiddenFlag = 0,
  } = props;

  if (hiddenFlag) {
    return '';
  }

  const customizedCodes = `SSRC.${sourceKey}_HALL.NEW_LIST.EXECUTE_TABLE`;

  const openRoundQuotation = useCallback(() => {
    Modal.open({
      drawer: true,
      style: { width: '742px' },
      key: 'roundQuotationSituation',
      title: intl.get('ssrc.inquiryHall.model.inquiryHall.implementation').d('执行情况'),
      children: (
        <RoundQuotationModal
          sourceKey={sourceKey}
          rfxStatus={rfxStatus}
          lineRecord={lineRecord}
          rfxHeaderId={rfxHeaderId}
          customizeTable={customizeTable}
          customizedCode={customizedCodes}
          quotationRoundNumber={quotationRoundNumber}
        />
      ),
      okText: intl.get('hzero.common.button.close').d('关闭'),
      footer: (btn) => btn,
    });
  }, [rfxStatus]);

  if (rfxStatus && rfxStatus !== 'ROUND_QUOTATION') return null;

  return (
    <a onClick={openRoundQuotation} className={Style['round-quotation-btn']}>
      <span className={Style.ellipsis}>
        {intl.get('ssrc.inquiryHall.model.inquiryHall.roundQuotationBtn').d('全部轮次执行情况')}
      </span>
    </a>
  );
};

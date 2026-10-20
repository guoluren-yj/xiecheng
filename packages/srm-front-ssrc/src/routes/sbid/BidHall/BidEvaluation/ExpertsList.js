import React, { Component } from 'react';
import { Tag, Icon, Pagination } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { isUndefined } from 'lodash';

import Upload from 'srm-front-boot/lib/components/Upload';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import querystring from 'querystring';
import { routerRedux } from 'dva/router';
import { PRIVATE_BUCKET } from '_utils/config';
import { getActiveTabKey, openTab } from 'utils/menuTab';
// import { getQuotationName } from '@/utils/globalVariable';

import expertIcon from '@/assets/expert.svg';
import ExpertsTable from './ExpertsTable';
import styles from './index.less';

class ExpertsList extends Component {
  state = {
    expand: {},
    loading: {},
  };

  activeTabKey = getActiveTabKey();

  getSnapshotBeforeUpdate(prevProps) {
    const { sourceHeaderId: preSourceHeaderId } = prevProps;
    const { sourceHeaderId } = this.props;
    return preSourceHeaderId !== sourceHeaderId;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.clearState();
    }
  }

  @Bind()
  clearState() {
    this.setState({
      expand: {},
    });
  }

  /**
   * 评标管理-单个专家-评分信息查询
   * 点击专家头信息
   * 分标段 点击则展开，标段下查询专家下对供应商的打分{ 101#100: true}
   * 不分标段 点击则展开，查询专家下对供应商的打分{flag#100: true}
   * 若是未展开的专家头信息，点击则展开，查询专家下对供应商的打分，反之，则关闭。
   * @param {Object} item
   * @param {Number} bidLineItemId
   */
  @Bind()
  expandExpertHeaderInfo(item, bidLineItemId = undefined) {
    const {
      dispatch,
      sourceFrom,
      sourceHeaderId,
      modelName = 'bidHall',
      bidHall: { expertScoreList = {} },
    } = this.props;
    const { expertUserId = null, evaluateExpertId = null } = item;
    const { expand = {} } = this.state;
    if (!isUndefined(bidLineItemId)) {
      if (expand[`${bidLineItemId}#${expertUserId}`]) {
        this.setState({ expand: { ...expand, [`${bidLineItemId}#${expertUserId}`]: false } });
      } else {
        this.setState({
          expand: { ...expand, [`${bidLineItemId}#${expertUserId}`]: true },
          loading: { [`${bidLineItemId}#${expertUserId}`]: { fetchExpertScoreInfoLoading: true } },
        });
        // const evaluateExpertIds = item.evaluateExpertList.map(element => element.evaluateExpertId);
        dispatch({
          type: `${modelName}/fetchExpertScoreInfo`,
          payload: {
            sourceHeaderId,
            sourceFrom,
            evaluateExpertIds: evaluateExpertId,
            expertUserId,
            bidLineItemId,
            expertScoreList,
            customizeUnitCode:
              sourceFrom === 'RFP' || sourceFrom === 'RFI'
                ? 'SSRC.EXPERT_SCORE_MANAGE.EXPERT_LINE_RFI'
                : 'SSRC.EXPERT_SCORE_MANAGE.EXPERT_LINE',
          },
        }).then((res) => {
          if (res) {
            this.setState({
              loading: {
                [`${bidLineItemId}#${expertUserId}`]: { fetchExpertScoreInfoLoading: false },
              },
            });
          }
        });
      }
    }
  }

  /**
   * 评分管理-重新评分
   * @param {Object} record
   */
  @Bind()
  reScoring(record = {}) {
    const {
      sourceFrom,
      sourceHeaderId,
      dispatch,
      modelName = 'bidHall',
      bidHall: { expertScoreList = {} },
      bidLineId,
      onFetchExpertList,
    } = this.props;
    const bidLineItemId = isUndefined(bidLineId) ? 'flag' : bidLineId;
    const { expertUserId = null, evaluateExpertId, evaluateScoreId } = record; // 修复evaluateExpertList返回多个时, 传递多个evaluateScoreId/evaluateExpertId bug, 现限制为传递单个id
    // const evaluateExpertIds = expertList
    //   .find((item) => item.expertUserId === expertUserId)
    //   .evaluateExpertList.map((n) => n.evaluateExpertId);
    dispatch({
      type: `${modelName}/reScoring`,
      payload: { evaluateScoreIds: [evaluateScoreId] },
    }).then((res) => {
      if (res) {
        dispatch({
          type: `${modelName}/fetchExpertScoreInfo`,
          payload: {
            sourceHeaderId,
            sourceFrom,
            expertUserId,
            evaluateExpertIds: evaluateExpertId,
            bidLineItemId,
            expertScoreList,
            customizeUnitCode:
              sourceFrom === 'RFP' || sourceFrom === 'RFI'
                ? 'SSRC.EXPERT_SCORE_MANAGE.EXPERT_LINE_RFI'
                : 'SSRC.EXPERT_SCORE_MANAGE.EXPERT_LINE',
          },
        });
        // 重新评分后，查询专家的状态
        onFetchExpertList(bidLineItemId);
      }
    });
  }

  /**
   * 评分管理-单个专家-供应商评分细项查询
   * @param {Number} evaluateScoreId = undefined
   */
  @Bind()
  fetchScoreLine(evaluateScoreIds = []) {
    const { dispatch, sourceFrom, modelName = 'bidHall' } = this.props;
    dispatch({
      type: `${modelName}/fetchScoreLine`,
      payload: {
        evaluateScoreIds,
        sourceFrom,
        customizeUnitCode: 'SSRC.EXPERT_SCORE_MANAGE.EXPERT.SCORE_LINE_RFX',
      },
    });
  }

  /**
   * 评分管理-单个专家-关闭侧弹框-清空数据
   */
  @Bind()
  clearScoreLine() {
    const { dispatch, modelName = 'bidHall' } = this.props;
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        rfxScoreLine: {},
      },
    });
  }

  /**
   *点击附件，阻止事件冒泡
   * @param {Object} e
   */
  @Bind()
  clickAnnex(e) {
    // 如果提供了事件对象，则这是一个非IE浏览器
    if (e && e.stopPropagation) {
      // 因此它支持W3C的stopPropagation()方法
      e.stopPropagation();
    } else {
      // 否则，我们需要使用IE的方式来取消事件冒泡
      window.event.cancelBubble = true;
    }
  }

  /**
   * 寻源大厅-评分确认汇总跳转到报价详情
   *
   * @param {*} [record={}]
   * @memberof ExpertsList
   */
  @Bind()
  directorQuotationDetail(record = {}) {
    const {
      dispatch,
      sourceHeaderId,
      sourceStatus,
      sourceFrom,
      backRecommend,
      cachTabKey,
      current,
      bidFlag,
      newQuotationFlag,
    } = this.props;
    const { quotationHeaderId, supplierCompanyId = null } = record;
    const search = querystring.stringify({
      quotationHeaderId,
      switchUrl: 2,
      noBackFlag: true,
    });
    // 如果是在专家评分跳转进来的，而且又是新招标
    const scoreBidFlag = bidFlag && this.activeTabKey === '/ssrc/expert-scoring';
    if (sourceFrom === 'RFX') {
      const currentTitle = bidFlag
        ? 'srm.common.tab.title.bidDetail'
        : 'srm.common.tab.title.quotationDetail';
      const currentAction = bidFlag
        ? intl.get('ssrc.inquiryHall.model.inquiryHall.bidDetail').d('投标详情')
        : intl.get('ssrc.inquiryHall.model.inquiryHall.quotationParticularss').d('报价详情');

      if (newQuotationFlag) {
        // 跳转新报价-报价查询逻辑
        const newQuotationSearchObj = {
          rfxHeaderId: sourceHeaderId,
          noBackFlag: 1, // openTab 不需要返回
          pageType: 'SUPPLIER_DETAIL_QUERY',
          switchUrl: 2,
        };
        let newQuotationPath = `/ssrc/supplier-reply/query/${quotationHeaderId}`;
        if (bidFlag) {
          newQuotationPath = `/ssrc/bid-supplier-reply/query/${quotationHeaderId}`;
        }

        openTab({
          key: newQuotationPath,
          path: newQuotationPath,
          title: currentTitle,
          action: currentAction,
          search: querystring.stringify(newQuotationSearchObj),
          closable: true,
        });
        return;
      }

      openTab({
        key: `${this.activeTabKey}/${
          scoreBidFlag ? 'bid-quotation-detail' : 'detail'
        }/${sourceHeaderId}/${supplierCompanyId}#${quotationHeaderId}`,
        title: currentTitle,
        action: currentAction,
        path: `${this.activeTabKey}/${
          scoreBidFlag ? 'bid-quotation-detail' : 'detail'
        }/${sourceHeaderId}/${supplierCompanyId}`,
        search,
        closable: true,
      });
    } else if (sourceFrom === 'RFI' || sourceFrom === 'RFP') {
      const rfSearch = querystring.stringify({
        quotationHeaderId,
        switchUrl: 2,
        noBackFlag: true,
        backRecommend: 'recommend', // 修复backRecommend参数 跳转到回复详情
      });
      dispatch(
        routerRedux.push({
          pathname: `${this.activeTabKey}/reply-detail/${sourceFrom}/${sourceHeaderId}`,
          search: rfSearch,
        })
      );
      const source = {
        current,
        label: 'recommend',
        url: `${this.activeTabKey}/rfx-evaluation/${sourceHeaderId}?backRecommend=${backRecommend}&cachTabKey=${cachTabKey}&sourceStatus=${sourceStatus}&sourceFrom=${sourceFrom}&sourceHeaderId=${sourceHeaderId}`,
      };
      sessionStorage.setItem('sourceRouter', JSON.stringify(source));
      sessionStorage.setItem(`sourceRouter+${this.activeTabKey}`, JSON.stringify(source));
    }
  }

  /**
   * 渲染专家列表
   * @param {Object} item
   * @param {Number} bidLineItemId
   */
  renderExpertHeaderInfo(item = {}, bidLineItemId = undefined) {
    const { organizationId } = this.props;
    const { expand = {} } = this.state;
    const type = expand[`${bidLineItemId}#${item.expertUserId}`] ? 'up' : 'down';
    return (
      <div className={styles.expertList}>
        <div className={styles.expertListLeft}>
          <img src={expertIcon} alt="" style={{ width: 36, height: 36 }} />
          <span className={styles.expertListNum}>
            {item.subAccount ? `${item.subAccount}-${item.expertName}` : item.expertName}
          </span>
          <Icon type={type} style={{ color: '#1D2129', marginLeft: '8px' }} />
        </div>
        <div className={styles.expertListRight}>
          <span className={styles.uploadStyle} onClick={(e) => this.clickAnnex(e)}>
            {item.attachmentUuid && (
              <Upload
                bucketName={PRIVATE_BUCKET}
                bucketDirectory="ssrc-rfx-quotationheader"
                attachmentUUID={item.attachmentUuid}
                tenantId={organizationId}
                btnText={
                  <span>
                    {intl.get('ssrc.bidHall.view.message.attachment').d('附件')}
                    <img src={require('@/assets/file.svg')} alt="" />
                  </span>
                }
                icon="none"
                viewOnly
                filePreview
              />
            )}
          </span>
          <span className={styles.teamMeaningStyle}>{item.teamMeaning}</span>
          <span className={styles.tagStyle}>
            <Tag style={{ border: '0' }} color={item.scoredStatus === 'SCORED' ? 'blue' : 'orange'}>
              {item.scoredStatusMeaning}
            </Tag>
          </span>
        </div>
        <div style={{ clear: 'both' }} />
      </div>
    );
  }

  /**
   * 屈臣氏二开
   * @param {*} expertsTableProps table参数
   * @param {*} otherParmas 其他参数
   */
  renderExpertsTable(expertsTableProps, otherParmas) {
    return <ExpertsTable {...expertsTableProps} {...otherParmas} />;
  }

  render() {
    const { expand = {}, loading = {} } = this.state;
    const {
      bidFlag,
      current,
      settings,
      header = {},
      sourceFrom,
      organizationId,
      customizeTable,
      bidLineId = undefined,
      expertList = [],
      expertPagination = {},
      bidHall: { expertScoreList = {}, scoreLine = {} },
      onChangeExpertPagination,
      fetchScoreLineLoading,
      exportScoringBussSum,
      newQuotationFlag,
      templateConfig = {},
    } = this.props;
    const expertsTableProps = {
      remote: exportScoringBussSum,
      header,
      bidFlag,
      current,
      settings,
      sourceFrom,
      organizationId,
      scoreLine,
      customizeTable,
      fetchLoading: fetchScoreLineLoading,
      onReScoring: this.reScoring,
      onFetchScoreline: this.fetchScoreLine,
      onClearScoreLine: this.clearScoreLine,
      newQuotationFlag,
      templateConfig,
    };
    const bidLineItemId = isUndefined(bidLineId) ? 'flag' : bidLineId;

    return (
      <React.Fragment>
        {expertList &&
          expertList.map((item) => {
            return (
              <React.Fragment>
                <div onClick={() => this.expandExpertHeaderInfo(item, bidLineItemId)}>
                  {this.renderExpertHeaderInfo(item, bidLineItemId)}
                </div>
                {expand[`${bidLineItemId}#${item.expertUserId}`] &&
                  this.renderExpertsTable(expertsTableProps, {
                    dataSource: expertScoreList[`${bidLineItemId}#${item.expertUserId}`] || [],
                    expertUserId: item.expertUserId,
                    bidLineItemId,
                    loading: loading[`${bidLineItemId}#${item.expertUserId}`],
                    directorQuotationDetail: this.directorQuotationDetail,
                  })}
              </React.Fragment>
            );
          })}
        <Pagination
          className={styles.pagination}
          {...expertPagination}
          bidLineItemId={bidLineItemId}
          onChange={(page, pageSize) => onChangeExpertPagination(page, pageSize, bidLineItemId)}
          onShowSizeChange={(currents, size) =>
            onChangeExpertPagination(currents, size, bidLineItemId)
          }
        />
      </React.Fragment>
    );
  }
}

const hocExpertList = (Com) => {
  return connect(({ bidHall, loading }) => ({
    bidHall,
    fetchExpertScoreInfoLoading: loading.effects['bidHall/fetchExpertScoreInfo'],
    fetchScoreLineLoading: loading.effects['bidHall/fetchScoreLine'],
    organizationId: getCurrentOrganizationId(),
  }))(Com);
};

export { hocExpertList, ExpertsList };
export default hocExpertList(ExpertsList);

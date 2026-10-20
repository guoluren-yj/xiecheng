/**
 * create 创建招标
 * @date: 2019-05-13
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Table, Popover, Badge } from 'hzero-ui';
import { isNumber, sum } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { yesOrNoRender, valueMapMeaning, dateTimeRender } from 'utils/renderer';
import styles from './OpeningBid.less';

/**
 * 数据列表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onChange - 分页查询
 * @reactProps {Boolean} loading - 数据加载完成标记
 * @reactProps {Array} dataSource - Table数据源
 * @reactProps {Object} pagination - 分页器
 * @reactProps {Number} pagination.current - 当前页码
 * @reactProps {Number} pagination.pageSize - 分页大小
 * @reactProps {Number} pagination.total - 数据总量
 * @return React.element
 */
export default class TableList extends PureComponent {
  /**
   * 编辑
   * @param {object} record - 数据对象
   */
  editOption(record) {
    this.props.onEdit(record);
  }

  /**
   * 删除
   * @param {object} record - 数据对象
   */
  deleteOption(record) {
    this.props.onDelete(record);
  }

  /**
   *跳转到维护页面
   *
   */
  @Bind()
  preBid(record) {
    const { onPreBid } = this.props;
    onPreBid(record);
  }

  /**
   *跳转到维护页面
   *
   */
  @Bind()
  bidUpdate(record) {
    const { onBidUpdate } = this.props;
    onBidUpdate(record);
  }

  /**
   *跳转到初审页面
   *
   */
  @Bind()
  preliminary(record) {
    const { onPreliminary } = this.props;
    onPreliminary(record);
  }

  /**
   *跳转到开标页面
   *
   */
  @Bind()
  openingBid(record) {
    const { onOpeningBid } = this.props;
    onOpeningBid(record);
  }

  /**
   *打开操作模态框
   *
   */
  @Bind()
  operateBid(record) {
    const { onOperateBid } = this.props;
    onOperateBid(record);
  }

  /**
   *跳转到明细页面
   *
   */
  @Bind()
  navigateDetail(record) {
    const { onInquiryDetail } = this.props;
    onInquiryDetail(record);
  }

  /**
   * 跳转到核价页面
   */
  @Bind()
  inquiryCheckPrice(record) {
    const { onInquiryCheckPrice } = this.props;
    onInquiryCheckPrice(record);
  }

  /**
   * 跳转到评标管理页面
   *
   * @param {*} record
   * @memberof TableList
   */
  @Bind()
  directScoreManager(record) {
    const { directScoreManager } = this.props;
    directScoreManager(record);
  }

  /**
   * 完成状态,跳转查看中标公告
   *
   * @param {*} record
   * @memberof TableList
   */
  @Bind()
  viewAcceptBidNotice(record) {
    const { onViewAcceptBidNotice } = this.props;
    onViewAcceptBidNotice(record);
  }

  // 跳转不区分标段定标管理
  @Bind()
  checkPendingNot(record) {
    const { BidCheckPendingNot } = this.props;
    BidCheckPendingNot(record);
  }

  // 跳转区分标段定标管理
  @Bind()
  checkPendingYes(record) {
    const { BidCheckPendingYes } = this.props;
    BidCheckPendingYes(record);
  }

  /**
   * 渲染操作
   */
  @Bind()
  actionRender(record) {
    let mean = '';
    switch (record.bidStatus) {
      case 'NEW':
      case 'ROUNDED':
      case 'RELEASE_REJECTED':
        mean = (
          <a onClick={() => this.bidUpdate(record)}>
            {intl.get(`ssrc.bidHall.model.bidHall.maintain`).d('维护')}
          </a>
        );
        break;
      case 'PREQUAL_CUTOFF':
        mean = <a>{intl.get(`ssrc.bidHall.model.bidHall.preQualification`).d('资格预审')}</a>;
        break;
      case 'IN_POSTQUAL':
        mean = <a>{intl.get(`ssrc.bidHall.model.bidHall.postQualification`).d('资格后审')}</a>;
        break;
      case 'PRETRIAL_PENDING':
        if (record.isPretrailUserFlag === 1) {
          mean = (
            <a onClick={() => this.preliminary(record)}>
              {intl.get(`ssrc.bidHall.model.bidHall.preliminary`).d('初审')}
            </a>
          );
        } else {
          mean = <span>{intl.get(`ssrc.bidHall.model.bidHall.preliminary`).d('初审')}</span>;
        }
        break;
      case 'RESULT_REFUSE': // lzj排查，无此状态
        mean = (
          <a onClick={() => this.inquiryCheckPrice(record)}>
            {intl.get(`ssrc.bidHall.model.bidHall.bidEvaluation`).d('评标')}
          </a>
        );
        break;
      case 'RESULT_APPROVING':
        break;
      case 'IN_QUOTATION':
        if (!record.sealedQuotationFlag) {
          mean = <span>{intl.get(`ssrc.bidHall.model.bidHall.Bidding`).d('投标中')}</span>;
        } else {
          return;
        }
        break;
      case 'CONFIRMED_PENDING':
        mean = (
          <a onClick={() => this.preliminary(record)}>
            {intl.get(`ssrc.bidHall.model.bidHall.confirmationBidding`).d('中标结果确认')}
          </a>
        );
        break;
      case 'BID_REJECTED':
        mean = (
          <span>{intl.get(`ssrc.bidHall.model.bidHall.rejectBidding`).d('预评标审批拒绝')}</span>
        );
        break;
      case 'BID_APPROVING':
        mean = (
          <span>
            {intl.get(`ssrc.bidHall.model.bidHall.preEvaluationApproval`).d('预评标审批中')}
          </span>
        );
        break;
      case 'OPEN_BID_PENDING':
        if (record.openBidFlag && record.isOpenerFlag) {
          mean = (
            <a onClick={() => this.openingBid(record)}>
              {intl.get(`ssrc.bidHall.model.bidHall.openingBid`).d('开标')}
            </a>
          );
        }
        break;
      case 'OPENED':
        if (record.isTenderFlag === 1) {
          mean = (
            <a onClick={() => this.operateBid(record)}>
              {intl.get(`hzero.common.button.action`).d('操作')}
            </a>
          );
        }
        break;
      case 'CHECK_PENDING':
      case 'CHECK_REJECTED':
        if (record.subjectMatterRule === 'NONE' && record.isScalerFlag === 1) {
          mean = (
            <a onClick={() => this.checkPendingNot(record)}>
              {intl.get(`ssrc.bidHall.model.bidHall.calibrationManagement`).d('定标管理')}
            </a>
          );
        } else if (record.subjectMatterRule === 'PACK' && record.isScalerFlag === 1) {
          mean = (
            <a onClick={() => this.checkPendingYes(record)}>
              {intl.get(`ssrc.bidHall.model.bidHall.calibrationManagement`).d('定标管理')}
            </a>
          );
        }
        break;
      case 'FINISHED':
        mean = (
          <a onClick={() => this.viewAcceptBidNotice(record)}>
            {intl.get(`ssrc.bidHall.model.bidHall.bidNotices`).d('中标通知/公告')}
          </a>
        );
        break;
      default:
        break;
    }
    return mean;
  }

  /**
   * 渲染招标监控台
   */
  @Bind()
  inquiryMonitoringStationRender(record) {
    let mean = null;
    if (record.supervisorFlag === 1) {
      mean = (
        <a onClick={() => this.goMonitor(record)}>
          {intl.get(`ssrc.bidHall.model.bidHall.detail`).d('详情')}
        </a>
      );
    }
    return mean;
  }

  /**
   * 投标响应
   */
  @Bind()
  quotationFeedBack(record) {
    const { onQuotationFeedBack } = this.props;
    onQuotationFeedBack(record);
  }

  /**
   * 跳转到监控台
   */
  @Bind()
  goMonitor(record) {
    const { onGoMonitor } = this.props;
    onGoMonitor(record);
  }

  /**
   * 渲染columns
   * @returns {*}
   */
  renderColumns() {
    const { bidStatus = [], operationRender, directQuestionAnswer } = this.props;

    const bidHallColumns = [
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'bidStatus',
        width: 100,
        fixed: 'left',
        render: (val) => valueMapMeaning(bidStatus, val),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 120,
        fixed: 'left',
        render: (val, record) => this.actionRender(record),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.bidNum`).d('招标编号'),
        dataIndex: 'bidNum',
        width: 150,
        fixed: 'left',
        render: (val, record) => <a onClick={() => this.navigateDetail(record)}>{val}</a>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.bidTitle`).d('招标事项'),
        dataIndex: 'bidTitle',
        width: 120,
        fixed: 'left',
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get('ssrc.common.company').d('公司'),
        dataIndex: 'companyName',
        width: 150,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.createdUnitName`).d('创建人部门'),
        dataIndex: 'createdUnitName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidHall.view.question.publishDate`).d('发布时间'),
        dataIndex: 'releasedDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.quotationStartTime`).d('投标开始时间'),
        dataIndex: 'quotationStartDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.QuotationDeadLine`).d('投标截止时间'),
        dataIndex: 'quotationEndDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.bidOpenDate`).d('开标时间'),
        dataIndex: 'bidOpenDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.preQualification`).d('资格预审'),
        dataIndex: 'preQualificationFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.prequalFromEndDate`).d('资格预审截止时间'),
        dataIndex: 'prequalEndDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.round`).d('轮次'),
        dataIndex: 'roundNumber',
        width: 60,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.version`).d('版本'),
        dataIndex: 'versionNumber',
        width: 60,
      },
      {
        title: intl.get(`ssrc.bidHall.view.model.quotationResponse`).d('投标响应'),
        dataIndex: 'quotationFeedBack',
        width: 100,
        render: (val, record) => <a onClick={() => this.quotationFeedBack(record)}>{val}</a>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.bidType`).d('招标类别'),
        dataIndex: 'bidTypeMeaning',
        width: 120,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.sourcingApproach`).d('寻源方式'),
        dataIndex: 'sourceMethodMeaning',
        width: 120,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.creationDate`).d('创建时间'),
        dataIndex: 'creationDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.tenderName`).d('招标员'),
        dataIndex: 'tenderName',
        width: 150,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.questionAnswer`).d('澄清答疑'),
        dataIndex: 'questionAnswer',
        width: 100,
        render: (val, record) =>
          record.bidStatus === 'NEW' ? (
            ''
          ) : (
            <Badge
              count={record.unreadIssueCount}
              offset={[0, 10]}
              className={styles['badge-item']}
            >
              <a onClick={() => directQuestionAnswer(record)}>
                {intl.get(`ssrc.bidHall.model.bidHall.questionAnswer`).d('澄清答疑')}
              </a>
            </Badge>
          ),
      },
      {
        title: intl.get('hzero.common.button.operating').d('操作记录'),
        dataIndex: 'operationRecord',
        width: 100,
        render: (val, record) => (
          <a onClick={() => operationRender(record)}>
            {intl.get(`hzero.common.button.operating`).d('操作记录')}
          </a>
        ),
      },
    ];
    return bidHallColumns;
  }

  render() {
    const { loading, dataSource, bidPagination, onChange, customizeTable } = this.props;
    const scrollX = sum(this.renderColumns().map((n) => (isNumber(n.width) ? n.width : 0)));

    return customizeTable(
      {
        code: 'SSRC.BID_HALL.LIST',
      },
      <Table
        bordered
        rowKey="bidHeaderId"
        loading={loading}
        columns={this.renderColumns()}
        scroll={{ x: scrollX }}
        dataSource={dataSource}
        pagination={bidPagination}
        onChange={(page) => onChange(page)}
      />
    );
  }
}

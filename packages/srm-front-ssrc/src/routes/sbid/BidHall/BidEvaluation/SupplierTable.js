import React, { Component } from 'react';
import { Table, Popover, Badge, Form, Modal, Button, Tooltip, Input } from 'hzero-ui';
import { isEmpty, isFunction, isNumber, sum } from 'lodash';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';

import intl from 'utils/intl';
import Checkbox from 'components/Checkbox';
import Upload from 'srm-front-boot/lib/components/Upload';
import supplierIcon from '@/assets/supplier.svg';
import { scoreIntervalRender, getZeroTrue, zeroAmountScoreRender } from '@/utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { FIlESIZE } from '@/utils/SsrcRegx';

import FileGroup from '@/routes/components/SupplierQuotationAttachment';
import RenderFileTotalCount from '@/routes/components/SupplierQuotationAttachment/RenderFileTotalCount';

import styles from './index.less';
import Attachment from './../../components/Attachment';

const companyIpRateRed = require('@/assets/companyIpRate-red.svg');
const companyIpRateGrey = require('@/assets/companyIpRate-grey.svg');

const organizationId = getCurrentOrganizationId();

const { TextArea } = Input;
@Form.create({ fieldNameProp: null })
export default class SupplierTable extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(props.bidLineItemId, this);
    }
    this.state = {
      attachmentVisible: false, // 供应商附件查看
      attachmentsProps: {}, // 供应商附件属性
    };
  }

  /**
   * 打开附件模态框
   * @param {Object} record = {}
   */
  @Bind()
  showAttachmentModal(record = {}) {
    /**
     * 先商务后技术：评分负责人在商务评分中、商务标评分汇总节点仅可查看商务标附件；在后续的节点可查看到商务标和技术标附件；
     * 先技术后商务：评分负责人在技术评分中、技术标评分汇总节点仅可查看技术标附件；在后续的节点可查看到商务标和技术标附件；
     * 同时评标：评分负责人在评标过程管理界面任意节点，可以查看到供应商的商务标、技术标附件；
     * <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
     * 技术评分中 - TECHNOLOGY_SCORING/TECHNOLOGY_SCORING_RFX
     * 技术评分确认汇总 - TECHNOLOGY_SUMMARY/TECHNOLOGY_SUMMARY_RFX
     * 商务评分中 - BUSINESS_SCORING/BUSINESS_SCORING_RFX
     * 商务评分确认汇总 - BUSINESS_SUMMARY/BUSINESS_SUMMARY_RFX
     * 推荐成交候选人 - PRE_EVALUATION_PENDING_RFX
     * >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
     * 先技术后商务 - TECH_FIRST
     * 先商务后技术 - BUSINESS_FIRST
     * 同时评标 - SYNC
     */
    const { openBidOrder, bidEvalProgress = [], evaluateShowType, header = {} } = this.props;
    const currentProgress = bidEvalProgress && bidEvalProgress.find((n) => n.isCurrentFlag === 1); // 当前进度
    const { progressName = '' } = currentProgress || {};
    const { validBusinessAttachmentUuid, validTechAttachmentUuid } = record;

    let businessUuid = validBusinessAttachmentUuid;
    let techUuid = validTechAttachmentUuid;

    switch (openBidOrder) {
      case 'TECH_FIRST':
        if (
          progressName.startsWith('TECHNOLOGY_SCORING') ||
          progressName.startsWith('TECHNOLOGY_SUMMARY')
        ) {
          businessUuid = null;
        }
        break;
      case 'BUSINESS_FIRST':
        if (
          progressName.startsWith('BUSINESS_SCORING') ||
          progressName.startsWith('BUSINESS_SUMMARY')
        ) {
          techUuid = null;
        }
        break;
      default:
        break;
    }
    this.setState({
      attachmentVisible: true,
      attachmentsProps: {
        header,
        techUuid,
        businessUuid,
        bucketName: PRIVATE_BUCKET,
        evaluateShowType,
        bucketDirectory: 'ssrc-rfx-quotationheader',
        fileSize: FIlESIZE,
      },
    });
  }

  /**
   * 跳转到评审澄清页面
   * @param {!Object} record - 行记录
   */
  @Bind()
  jumpToClarify(record = {}) {
    const { quotationHeaderId, sourceFrom, sourceHeaderId } = record;
    const {
      history,
      location: { pathname = '', search: searchData = '' },
    } = this.props;
    const search = querystring.stringify({
      quotationHeaderId,
      sourceFrom,
      fromFlag: 0,
      sourceHeaderId,
      backPath: `${pathname}${searchData}`,
    });

    const routerPrefix = pathname.split('/')[2];
    const routerName = sourceFrom === 'BID' ? 'bid' : 'rfx';
    history.push({
      pathname: `/ssrc/${routerPrefix}/${routerName}-review-clarification`,
      search,
    });
  }

  /**
   * 关闭附件模态框
   */
  @Bind()
  hideAttachmentModal() {
    this.setState({ attachmentVisible: false, attachmentsProps: {} });
  }

  /**
   * 渲染专家对供应商评分明细数据源-有二级评分要素
   */
  renderScoreDetailsDataSource(data = []) {
    const dataSource = data.map((item) => {
      let elementValue = {};
      const { evaluateScoreDetailFullList = [], ...otherItem } = item;
      evaluateScoreDetailFullList.forEach((elementItem) => {
        elementValue = {
          ...elementValue,
          [`twoScore${elementItem.twoIndicateName}`]: elementItem.twoScore,
          [`twoIndicateName${elementItem.twoIndicateName}`]: elementItem.twoIndicateName,
          [`twoMinScore${elementItem.twoIndicateName}`]: elementItem.twoMinScore,
          [`twoMaxScore${elementItem.twoIndicateName}`]: elementItem.twoMaxScore,
          [`twoWeight${elementItem.twoIndicateName}`]: elementItem.twoWeight,
        };
      });
      return {
        ...otherItem,
        ...elementValue,
      };
    });
    return dataSource;
  }

  /**
   * 渲染专家对供应商评分明细-有二级评分要素
   */
  renderScoreDetailsTable(value, record = {}, item = {}) {
    const { supplierInfo, customizeTable } = this.props;
    let scoreDetailsColumns = [];
    if (
      supplierInfo.scoreDetail[record.quotationHeaderId] &&
      supplierInfo.scoreDetail[record.quotationHeaderId][item.indicateIdAndTeam][0]
    ) {
      supplierInfo.scoreDetail[record.quotationHeaderId][
        item.indicateIdAndTeam
      ][0].evaluateScoreDetailFullList.forEach((ele) => {
        scoreDetailsColumns = [
          ...scoreDetailsColumns,
          {
            title: <Popover content={ele.twoIndicateName}>{ele.twoIndicateName}</Popover>,
            dataIndex: `twoScore${ele.twoIndicateName}`,
            width: 100,
            render: (val) => <Popover content={val}>{val}</Popover>,
          },
          {
            title: intl.get(`ssrc.bidHall.model.bidHall.scoringInterval`).d('评分区间'),
            dataIndex: `twoMinScore${ele.twoIndicateName}`,
            width: 100,
            render: (val, data) => {
              return scoreIntervalRender(
                data[`twoMinScore${ele.twoIndicateName}`],
                data[`twoMaxScore${ele.twoIndicateName}`]
              );
            },
          },
          {
            title: <span>{intl.get(`ssrc.bidHall.model.bidHall.weight`).d('权重')}%</span>,
            dataIndex: `twoWeight${ele.twoIndicateName}`,
            width: 75,
          },
        ];
      });
    }

    const columns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.subAccount`).d('专家子账户'),
        dataIndex: 'subAccount',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.expertName`).d('专家名称'),
        dataIndex: 'expertName',
        width: 100,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.score`).d('得分'),
        dataIndex: 'indicScore',
        children: scoreDetailsColumns,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.summary`).d('小计'),
        dataIndex: 'summary',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertWeights`).d('专家权重%'),
        dataIndex: 'expertWeight',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.reviewerCommnet`).d('评审意见'),
        dataIndex: 'expertSuggestion',
        width: 120,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return customizeTable(
      {
        code: 'SSRC.EXPERT_SCORE_MANAGE.SUPPLIER.SCORE_LINE_RFX_V2',
      },
      <Table
        bordered
        columns={columns}
        rowKey="expertId"
        dataSource={this.renderScoreDetailsDataSource(
          supplierInfo.scoreDetail[record.quotationHeaderId] &&
            supplierInfo.scoreDetail[record.quotationHeaderId][item.indicateIdAndTeam]
        )}
        scroll={{ x: scrollX }}
        pagination={false}
      />
    );
  }

  /**
   * 渲染专家对供应商评分明细数据源
   *
   * @param {*} [record={}]
   * @returns
   * @memberof SupplierTable
   */
  renderScoreDataSource(record = {}, indicateIdAndTeam) {
    const { supplierInfo = {}, bidLineItemId } = this.props;
    if (!supplierInfo) {
      return;
    }
    let dataSource = [];
    if (bidLineItemId !== 'flag') {
      // 分标段
      dataSource =
        supplierInfo.scoreDetail[bidLineItemId][record.quotationHeaderId][indicateIdAndTeam];
    } else {
      // 不分标段
      dataSource = supplierInfo.scoreDetail[record.quotationHeaderId][indicateIdAndTeam];
    }
    return dataSource;
  }

  /**
   * 渲染专家对供应商评分明细-无二级评分要素
   * @param {String} value
   * @param {Object} record
   * @param {Object} item
   */
  renderScoreDetailTable(value, record = {}, item = {}) {
    const { customizeTable } = this.props;
    const columns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.subAccount`).d('专家子账户'),
        dataIndex: 'subAccount',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.expertName`).d('专家名称'),
        dataIndex: 'expertName',
        width: 100,
      },
      item.indicateType === 'SCORE' && {
        title: intl.get(`ssrc.bidHall.model.bidHall.score`).d('得分'),
        dataIndex: 'indicScore',
        width: 120,
      },
      item.indicateType !== 'SCORE' && {
        title: intl.get(`ssrc.bidHall.model.bidHall.pass`).d('是否通过'),
        dataIndex: 'passStatusMeaning',
        width: 120,
      },
      item.indicateType === 'SCORE' && {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertWeights`).d('专家权重%'),
        dataIndex: 'expertWeight',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.reviewerCommnet`).d('评审意见'),
        dataIndex: 'expertSuggestion',
        width: 120,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
    ].filter(Boolean);
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return customizeTable(
      {
        code: 'SSRC.EXPERT_SCORE_MANAGE.SUPPLIER.SCORE_LINE_RFX_V2',
      },
      <Table
        bordered
        columns={columns}
        rowKey="expertId"
        scroll={{ x: scrollX }}
        dataSource={this.renderScoreDataSource(record, item.indicateIdAndTeam)}
        pagination={false}
      />
    );
  }

  /**
   * 渲染供应商表格数据源
   *
   * @param {*} [dataSource=[]]
   * @returns
   * @memberof SupplierTable
   */
  renderDataSource(dataSource = []) {
    const { exportScoringBussSum } = this.props;

    let supplierDataSource = dataSource.map((item) => {
      let elementValue = {};
      const { indicateList = [], ...otherItem } = item;
      indicateList.forEach((elementItem) => {
        elementValue = {
          ...elementValue,
          [elementItem.indicateIdAndTeam]: elementItem.singleIndicScoreAVG,
          [`type${elementItem.indicateIdAndTeam}`]: elementItem.indicateType,
          [`pass${elementItem.indicateIdAndTeam}`]: elementItem.passStatusMeaning,
          [`status${elementItem.indicateIdAndTeam}`]: elementItem.passStatus,
          [`detailEnabledFlag${elementItem.indicateIdAndTeam}`]: elementItem.detailEnabledFlag,
          [`approvedCount${elementItem.indicateIdAndTeam}`]: elementItem.approvedCount ?? 0,
          [`allExpertCount${elementItem.indicateIdAndTeam}`]: elementItem.allExpertCount ?? 0,
          [`zeroAmountScoreFlag${elementItem.indicateIdAndTeam}`]: Number(
            elementItem.zeroAmountScoreFlag
          ),
        };
      });
      return {
        ...otherItem,
        ...elementValue,
        scoreTotal: otherItem.sumPassStatus || otherItem.scoreTotal,
        technologyScoreTotal: otherItem.technologyPassStatus || otherItem.technologyScoreTotal,
        businessScoreTotal: otherItem.businessPassStatus || otherItem.businessScoreTotal,
      };
    });

    supplierDataSource = exportScoringBussSum
      ? exportScoringBussSum.process(
          'SSRC_EXPERT_SCORING_SUPPLIER_TABLE_RENDER_DATA_SOURCE',
          supplierDataSource,
          {
            that: this,
            dataSource,
          }
        )
      : supplierDataSource;
    supplierDataSource = supplierDataSource || [];

    return supplierDataSource;
  }

  /**
   * 渲染商务技术子列
   * 目前只有寻源加了二级要素，所以record[`detailEnabledFlag${item.indicateIdAndTeam}`]只有寻源有可能为真
   * @param {*} dataSource
   * @param {*} type
   * @returns
   * @memberof SupplierTable
   */
  renderChildrenColumns(dataSource, type) {
    let childrenColumns = [];
    childrenColumns =
      dataSource[0].indicateList &&
      dataSource[0].indicateList
        .filter((ele) => ele.team === type)
        .map((item) => {
          return {
            dataIndex: `${item.indicateIdAndTeam}`,
            title: <Popover content={`${item.indicateName}`}>{`${item.indicateName}`}</Popover>,
            // title: `${item.indicateName}`,
            width: 250,
            render: (val, record) =>
              record[`zeroAmountScoreFlag${item.indicateIdAndTeam}`] ? (
                zeroAmountScoreRender()
              ) : (
                <Popover
                  // placement="bottomLeft"
                  content={
                    record[`detailEnabledFlag${item.indicateIdAndTeam}`]
                      ? this.renderScoreDetailsTable(val, record, item)
                      : this.renderScoreDetailTable(val, record, item)
                  }
                  overlayStyle={{
                    maxWidth: 900,
                  }}
                  title={`${record.supplierCompanyName}${item.indicateTitle}${intl
                    .get(`ssrc.bidHall.model.bidHall.scoringDetail`)
                    .d('评分明细')}`}
                  arrowPointAtCenter
                >
                  <a
                    style={{
                      color: record[`status${item.indicateIdAndTeam}`] === 'UN_PASS' && 'red',
                    }}
                  >
                    {record[`type${item.indicateIdAndTeam}`] === 'SCORE'
                      ? val
                      : record[`status${item.indicateIdAndTeam}`] === 'ALL_PASS'
                      ? record[`pass${item.indicateIdAndTeam}`]
                      : `${record[`pass${item.indicateIdAndTeam}`]}${
                          record[`approvedCount${item.indicateIdAndTeam}`]
                        }/${record[`allExpertCount${item.indicateIdAndTeam}`]}`}
                  </a>
                </Popover>
              ),
          };
        });
    let columns = [];
    const techTitle =
      dataSource[0].supplierTechnologyScoreTitle === 'PASS'
        ? intl.get(`ssrc.inquiryHall.model.inquiryHall.technologyScoringResult`).d('技术打分结果')
        : intl.get(`ssrc.bidHall.model.bidHall.technologyScoreTotal`).d('技术总分');
    const busiTitle =
      dataSource[0].supplierBusinessScoreTitle === 'PASS'
        ? intl.get(`ssrc.inquiryHall.model.inquiryHall.businessScoringResult`).d('商务打分结果')
        : intl.get(`ssrc.bidHall.model.bidHall.businessScoreTotal`).d('商务总分');
    columns = [
      ...childrenColumns,
      {
        dataIndex: type === 'TECHNOLOGY' ? 'technologyScoreTotal' : 'businessScoreTotal', // 禁止修改 协鑫二开 请勿改变字段名
        title: type === 'TECHNOLOGY' ? techTitle : busiTitle,
        width: 120,
        render: (val, record) => {
          const Style =
            type === 'TECHNOLOGY'
              ? {
                  color:
                    dataSource[0].supplierTechnologyScoreTitle === 'PASS' &&
                    getZeroTrue(record?.technologyApprovedCount)
                      ? 'red'
                      : '',
                }
              : {
                  color:
                    dataSource[0].supplierBusinessScoreTitle === 'PASS' &&
                    getZeroTrue(record?.businessApprovedCount)
                      ? 'red'
                      : '',
                };
          return <span style={Style}>{val}</span>;
        },
      },
    ];
    return columns;
  }

  // 操作建议无效字段
  @Bind()
  handleClickInvalidateFlag({ bidLineItemId, record = {}, node = {} }) {
    if (this.props.form && !node.target?.checked) {
      // ps：解决提交校验失败后，切换建议无效字段无法出发建议无效原因字段的校验状态问题。暂时重置为填写字段不清空值，因为从推荐成交候选人退回到汇总时后端重置了建议无效字段
      const invalidReason = this.props.form.getFieldValue(
        `${bidLineItemId}#${record.quotationHeaderId}#reason`
      );
      this.props.form.setFieldsValue({
        [`${bidLineItemId}#${record.quotationHeaderId}#reason`]: invalidReason,
      });
    }
  }

  /**
   * 一个供应商对应多个评分要素
   * 第一列供应商名称，第二列总分，第三列无效投标，其他的是评分要素列，非固定
   * 同步开标 区分/不区分商务技术
   * 不同步开标 区分商务技术 判断当前组别
   * @param {*} [dataSource=[]]
   * @returns
   * @memberof SupplierTable
   */
  renderColumns(dataSource = [], bidRuleType, openBidOrder, currentTeam) {
    const {
      bidLineItemId,
      sourceFrom,
      bidFlag,
      exportScoringBussSum,
      code = {},
      newQuotationFlag = false,
      sourceStatus,
      header = {},
      scoreType, // 评分类型 询价 征询 通用字段
    } = this.props;

    let elementColumns = [];
    if (bidRuleType && !isEmpty(dataSource)) {
      // 同步开标
      if (openBidOrder === 'SYNC') {
        // 区分商务技术
        if (bidRuleType === 'DIFF') {
          elementColumns = [
            {
              // title: intl.get(`ssrc.bidHall.model.bidHall.technology`).d('技术组'),
              dataIndex: 'technologyTeam',
              title: `${intl.get(`ssrc.bidHall.model.bidHall.technologyTeam`).d('技术组')}${
                scoreType !== 'SCORE_NEW' &&
                (dataSource?.[0]?.technologyWeight || dataSource?.[0]?.technologyWeight === 0)
                  ? `(${dataSource?.[0]?.technologyWeight}%)`
                  : ''
              }`,
              children: this.renderChildrenColumns(dataSource, 'TECHNOLOGY') || [],
            },
            {
              dataIndex: 'businessTeam', // 禁止修改 协鑫二开 请勿改变字段名
              // title: intl.get(`ssrc.bidHall.model.bidHall.business`).d('商务组'),
              title: `${intl.get(`ssrc.bidHall.model.bidHall.businessTeam`).d('商务组')}${
                scoreType !== 'SCORE_NEW' &&
                (dataSource?.[0]?.businessWeight || dataSource?.[0]?.businessWeight === 0)
                  ? `(${dataSource?.[0]?.businessWeight}%)`
                  : ''
              }`,
              children: this.renderChildrenColumns(dataSource, 'BUSINESS') || [],
            },
          ];
        } else {
          elementColumns =
            dataSource[0].indicateList &&
            dataSource[0].indicateList.map((item) => {
              return {
                // dataIndex: <Popover content={`${item.indicateIdAndTeam}`}>`${item.indicateIdAndTeam}`</Popover>,
                dataIndex: `${item.indicateIdAndTeam}`,
                title: `${item.indicateName}`,
                width: 150,
                render: (val, record) =>
                  record[`zeroAmountScoreFlag${item.indicateIdAndTeam}`] ? (
                    zeroAmountScoreRender()
                  ) : (
                    <Popover
                      // placement="bottomLeft"
                      content={
                        record[`detailEnabledFlag${item.indicateIdAndTeam}`]
                          ? this.renderScoreDetailsTable(val, record, item)
                          : this.renderScoreDetailTable(val, record, item)
                      }
                      overlayStyle={{
                        maxWidth: 900,
                      }}
                      title={`${record.supplierCompanyName}${item.indicateTitle}${intl
                        .get(`ssrc.bidHall.model.bidHall.scoringDetail`)
                        .d('评分明细')}`}
                      arrowPointAtCenter
                    >
                      <a
                        style={{
                          color: record[`status${item.indicateIdAndTeam}`] === 'UN_PASS' && 'red',
                        }}
                      >
                        {record[`type${item.indicateIdAndTeam}`] === 'SCORE'
                          ? val
                          : record[`status${item.indicateIdAndTeam}`] === 'ALL_PASS'
                          ? record[`pass${item.indicateIdAndTeam}`]
                          : `${record[`pass${item.indicateIdAndTeam}`]}${
                              record[`approvedCount${item.indicateIdAndTeam}`]
                            }/${record[`allExpertCount${item.indicateIdAndTeam}`]}`}
                      </a>
                    </Popover>
                  ),
              };
            });
        }
      } else {
        elementColumns =
          currentTeam === 'BUSINESS'
            ? [
                {
                  dataIndex: 'businessTeam',
                  title: (
                    <span>
                      {intl.get(`ssrc.bidHall.model.bidHall.businessTeam`).d('商务组')}
                      {scoreType !== 'SCORE_NEW' &&
                      (dataSource?.[0]?.businessWeight || dataSource?.[0]?.businessWeight === 0)
                        ? `(${dataSource?.[0]?.businessWeight}%)`
                        : ''}
                    </span>
                  ),
                  children: this.renderChildrenColumns(dataSource, 'BUSINESS') || [],
                },
              ]
            : [
                {
                  dataIndex: 'technologyTeam',
                  title: (
                    <span>
                      {intl.get(`ssrc.bidHall.model.bidHall.technologyTeam`).d('技术组')}
                      {scoreType !== 'SCORE_NEW' &&
                      (dataSource?.[0]?.technologyWeight || dataSource?.[0]?.technologyWeight === 0)
                        ? `(${dataSource?.[0]?.technologyWeight}%)`
                        : ''}
                    </span>
                  ),
                  children: this.renderChildrenColumns(dataSource, 'TECHNOLOGY') || [],
                },
              ];
      }
      const columns = [
        {
          dataIndex: 'supplierCompanyName',
          title: '',
          width: 250,
          fixed: 'left',
          render: (val, record) => this.renderSupplierCompanyName(val, record),
        },
        bidRuleType === 'DIFF' && openBidOrder !== 'SYNC'
          ? null
          : {
              dataIndex: 'scoreTotal',
              title:
                dataSource[0].supplierSumScoreTitle === 'PASS'
                  ? intl.get(`ssrc.inquiryHall.model.inquiryHall.scoringResult`).d('打分结果')
                  : intl.get(`ssrc.bidHall.model.bidHall.scoreTotal`).d('总分'),
              width: '',
              render: (val, record) => {
                const Style = {
                  color:
                    dataSource[0].supplierSumScoreTitle === 'PASS' &&
                    getZeroTrue(record.approvedCount)
                      ? 'red'
                      : '',
                };
                return <span style={Style}>{val}</span>;
              },
            },
        {
          dataIndex: 'invalidFlag',
          title:
            sourceFrom === 'BID' || bidFlag
              ? intl.get(`ssrc.bidHall.model.bidHall.invalidTender`).d('无效投标')
              : sourceFrom === 'RFX'
              ? intl.get(`ssrc.bidHall.model.bidHall.suggestInvalid`).d('建议无效')
              : intl.get(`ssrc.bidHall.model.bidHall.invalidAnswer`).d('无效回复'),
          width: 100,
          render: (val, record) => (
            <Form.Item style={{ marginBottom: 0 }} className={styles.invalidFlagStyle}>
              {this.props.form.getFieldDecorator(`${bidLineItemId}#${record.quotationHeaderId}`, {
                initialValue: val,
              })(
                <Checkbox
                  onClick={(node) =>
                    this.handleClickInvalidateFlag({ node, bidLineItemId, record })
                  }
                />
              )}
            </Form.Item>
          ),
        },
        {
          dataIndex: 'invalidReason',
          title: intl.get(`ssrc.bidHall.model.bidHall.invalidReason`).d('建议无效原因'),
          width: 100,
          render: (val, record) => (
            <Form.Item style={{ marginBottom: 0 }} className={styles.invalidFlagStyle}>
              {this.props.form.getFieldDecorator(
                `${bidLineItemId}#${record.quotationHeaderId}#reason`,
                {
                  initialValue: val,
                  rules: [
                    {
                      required: !!Number(
                        this.props.form?.getFieldValue?.(
                          `${bidLineItemId}#${record.quotationHeaderId}`
                        )
                      ),
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`ssrc.bidHall.model.bidHall.invalidReason`)
                          .d('建议无效原因'),
                      }),
                    },
                  ],
                }
              )(<TextArea />)}
            </Form.Item>
          ),
        },
        ...(elementColumns || []),
        {
          title: intl.get(`ssrc.bidHall.model.bidHall.attachment`).d('附件'),
          dataIndex: 'attachmentUuid',
          width: 120,
          render: (_, record) =>
            sourceFrom === 'RFI' ? (
              <Upload
                filePreview
                viewOnly
                bucketName={PRIVATE_BUCKET}
                bucketDirectory="ssrc-rf-quotationheader"
                attachmentUUID={record.rfiAttachmentUuid}
                tenantId={organizationId}
                btnText={intl.get(`ssrc.bidHall.model.bidHall.viewAttachments`).d('查看附件')}
              />
            ) : !newQuotationFlag ? (
              <a onClick={() => this.showAttachmentModal(record)}>
                {intl.get(`ssrc.bidHall.model.bidHall.viewAttachments`).d('查看附件')}
                <RenderFileTotalCount record={record} uiType="h0" />
              </a>
            ) : (
              <FileGroup
                name="attachmentUuid"
                record={record}
                uiType="h0"
                fileType="HEADER"
                queryParams={{
                  expertSummaryScoreQueryFlag: 1,
                  team: currentTeam,
                  sourceStatus,
                }}
              />
            ),
        },
        // 此列二开，禁止修改参数名
        {
          dataIndex: 'reviewClarified',
          title: intl.get(`ssrc.bidHall.model.bidHall.reviewClarified`).d('评审澄清'),
          width: 100,
          className: 'review-clarify',
          render: (_, record) => (
            <Badge
              count={record.reviewUnreadCount}
              offset={[0, 5]}
              className={
                sourceFrom === 'RFX' || sourceFrom === 'RFP' || sourceFrom === 'RFI'
                  ? styles.suggestInvalidCountBadge
                  : styles.suggestInvalidCountBadgeBID
              }
            >
              <a onClick={() => this.jumpToClarify(record)}>
                {intl.get(`ssrc.bidHall.model.bidHall.reviewClarified`).d('评审澄清')}
              </a>
            </Badge>
          ),
        },
      ].filter(Boolean);
      if (!exportScoringBussSum) {
        return columns;
      }
      return exportScoringBussSum.process(
        'SSRC_EXPERT_SCORING_PROCESS_SUPPLIER_TABLE_COLUMNS',
        columns,
        {
          code,
          bidLineItemId,
          form: this.props.form,
          currentTeam,
          openBidOrder,
          bidRuleType,
          bidFlag,
          dataSource,
          header,
          that: this,
        }
      );
    } else {
      return elementColumns;
    }
  }

  /**
   * 渲染专家建议供应商为无效的table
   * @param {Array} suggestInvalidList = []
   */
  renderSuggestInvalidTable(suggestInvalidList = []) {
    const columns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.subAccount`).d('专家子账户'),
        dataIndex: 'subAccount',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.expertName`).d('专家名称'),
        dataIndex: 'expertName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.team`).d('所属组别'),
        dataIndex: 'teamMeaning',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.suggestInvalid`).d('建议无效'),
        dataIndex: 'suggestInvalid',
        width: 100,
        render: () => (
          <Badge status="error" text={intl.get(`ssrc.bidHall.model.bidHall.Invalid`).d('无效标')} />
        ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.reviewOpinion`).d('评审意见'),
        dataIndex: 'expertSuggestion',
        width: 150,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
    ];
    return (
      <Table
        bordered
        columns={columns}
        rowKey="expertId"
        dataSource={suggestInvalidList}
        pagination={false}
      />
    );
  }

  /**
   * 渲染供应商列样式及表格
   * @param {String} val
   * @param {Object} record
   */
  renderSupplierCompanyName(val = undefined, record = {}) {
    let mean = '';
    const { sourceFrom, settings, exportScoringBussSum, useNewRateFlag = 0 } = this.props;
    if (record.suggestInvalidCount) {
      mean = (
        <React.Fragment>
          <Badge
            count={record.suggestInvalidCount}
            offset={[0, 5]}
            className={
              sourceFrom === 'RFX' || sourceFrom === 'RFP' || sourceFrom === 'RFI'
                ? styles.suggestInvalidCountBadge
                : styles.suggestInvalidCountBadgeBID
            }
          >
            <Popover
              placement="bottomLeft"
              content={this.renderSuggestInvalidTable(record.suggestInvalidList)}
              title={
                <span>
                  <span>
                    {intl
                      .get(`ssrc.bidHall.model.bidHall.TheFollowingExpertRecommendations`)
                      .d('下列专家建议')}
                  </span>
                  <span>{record.supplierCompanyName}</span>
                  <span>{intl.get(`ssrc.bidHall.model.bidHall.asInvalidBid`).d('为无效标')}</span>
                </span>
              }
              arrowPointAtCenter
            >
              <a>{val}</a>
              {exportScoringBussSum
                ? exportScoringBussSum.render(
                    'SSRC_EXPERT_SCORING_BUSS_SUM_RENDER_SUPPLIER_BUSS_DEVIATE',
                    null,
                    {
                      supplier: record,
                    }
                  )
                : null}
            </Popover>
          </Badge>
          {useNewRateFlag && sourceFrom === 'RFX' ? (
            record.whetherIpCoincide ? (
              <Tooltip
                title={`${intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.whetherIpCoincide`)
                  .d('IP是否重合')}：${intl.get(`hzero.common.model.yes`).d('是')}`}
                placement="topRight"
              >
                <span className={styles.ipIcon}>
                  <img src={companyIpRateRed} alt="" />
                </span>
              </Tooltip>
            ) : (
              <Tooltip
                title={`${intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.whetherIpCoincide`)
                  .d('IP是否重合')}：${intl.get(`hzero.common.model.no`).d('否')}`}
                placement="topRight"
              >
                <span className={styles.ipIcon}>
                  <img src={companyIpRateGrey} alt="" />
                </span>
              </Tooltip>
            )
          ) : settings['011107'] && +settings['011107'].settingValue && sourceFrom === 'RFX' ? (
            record.companyIpRate >= 60 ? (
              record.companyIpRate >= 80 ? (
                <Popover
                  content={`${intl
                    .get('ssrc.inquiryHall.model.inquiryHall.coincidenceRate')
                    .d('重合率')}：${record.companyIpRate}%`}
                >
                  <span className={styles.ipIcon}>
                    <img src={companyIpRateRed} alt="" />
                  </span>
                </Popover>
              ) : (
                <Popover
                  content={`${intl
                    .get('ssrc.inquiryHall.model.inquiryHall.coincidenceRate')
                    .d('重合率')}：${record.companyIpRate}%`}
                >
                  <span className={styles.ipIcon}>
                    <img src={companyIpRateGrey} alt="" />
                  </span>
                </Popover>
              )
            ) : (
              ''
            )
          ) : (
            ''
          )}
        </React.Fragment>
      );
    } else {
      mean = (
        <React.Fragment>
          <Popover
            className={
              sourceFrom === 'RFX' || sourceFrom === 'RFP' || sourceFrom === 'RFI'
                ? styles.supplierContent
                : ''
            }
            content={
              <>
                {val}
                {exportScoringBussSum
                  ? exportScoringBussSum.render(
                      'SSRC_EXPERT_SCORING_BUSS_SUM_RENDER_SUPPLIER_BUSS_DEVIATE_NO_COUNT_POPOVER',
                      null,
                      {
                        supplier: record,
                      }
                    )
                  : null}
              </>
            }
          >
            {val}
            {exportScoringBussSum
              ? exportScoringBussSum.render(
                  'SSRC_EXPERT_SCORING_BUSS_SUM_RENDER_SUPPLIER_BUSS_DEVIATE_NO_COUNT',
                  null,
                  {
                    supplier: record,
                  }
                )
              : null}
          </Popover>
          {useNewRateFlag && sourceFrom === 'RFX' ? (
            record.whetherIpCoincide ? (
              <Tooltip
                title={`${intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.whetherIpCoincide`)
                  .d('IP是否重合')}：${intl.get(`hzero.common.model.yes`).d('是')}`}
                placement="topRight"
              >
                <span className={styles.ipIcon}>
                  <img src={companyIpRateRed} alt="" />
                </span>
              </Tooltip>
            ) : (
              <Tooltip
                title={`${intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.whetherIpCoincide`)
                  .d('IP是否重合')}：${intl.get(`hzero.common.model.no`).d('否')}`}
                placement="topRight"
              >
                <span className={styles.ipIcon}>
                  <img src={companyIpRateGrey} alt="" />
                </span>
              </Tooltip>
            )
          ) : settings['011107'] && +settings['011107'].settingValue && sourceFrom === 'RFX' ? (
            record.companyIpRate >= 60 ? (
              record.companyIpRate >= 80 ? (
                <Popover
                  content={`${intl
                    .get('ssrc.inquiryHall.model.inquiryHall.coincidenceRate')
                    .d('重合率')}：${record.companyIpRate}%`}
                >
                  <span className={styles.ipIcon}>
                    <img src={companyIpRateRed} alt="" />
                  </span>
                </Popover>
              ) : (
                <Popover
                  content={`${intl
                    .get('ssrc.inquiryHall.model.inquiryHall.coincidenceRate')
                    .d('重合率')}：${record.companyIpRate}%`}
                >
                  <span className={styles.ipIcon}>
                    <img src={companyIpRateGrey} alt="" />
                  </span>
                </Popover>
              )
            ) : (
              ''
            )
          ) : (
            ''
          )}
        </React.Fragment>
      );
    }
    return mean;
  }

  render() {
    const {
      supplierList = [],
      bidRuleType,
      loading,
      openBidOrder,
      currentTeam,
      saveEvaluateSummaryLoading,
      onSaveEvaluateSummary,
      customizeTable,
      bidLineItemId,
      exportScoringBussSum,
      header = {},
    } = this.props;
    const { attachmentVisible = false, attachmentsProps = {} } = this.state;

    // elementNumberX 要素个数
    const elementNumberX =
      supplierList && supplierList[0] && supplierList[0].indicateList
        ? supplierList[0].indicateList.length
        : 0;
    const scrollX =
      elementNumberX && Math.ceil(elementNumberX / 2) > 1 && elementNumberX * 220 + 550;
    return (
      <React.Fragment>
        <div className={styles.supplierList}>
          <img src={supplierIcon} alt="" style={{ width: 36, height: 36 }} />
          <span className={styles.supplierTitle}>
            <span>{intl.get(`ssrc.bidHall.model.bidHall.supplierDimension`).d('供应商维度')}</span>
          </span>
          {exportScoringBussSum ? (
            exportScoringBussSum.render(
              'SSRC_EXPERT_SCORING_BUSS_SUM_RENDER_SCORING_TOOLTIP',
              <span className={styles.supplierTip}>
                （
                {intl
                  .get(`ssrc.bidHall.model.bidHall.changeToDimension`)
                  .d('如需专家重新评分，请切换到专家维度进行操作')}
                !）
              </span>,
              {
                header,
              }
            )
          ) : (
            <span className={styles.supplierTip}>
              （
              {intl
                .get(`ssrc.bidHall.model.bidHall.changeToDimension`)
                .d('如需专家重新评分，请切换到专家维度进行操作')}
              !）
            </span>
          )}
          {exportScoringBussSum ? (
            exportScoringBussSum.render(
              'SSRC_EXPERT_SCORING_BUSS_SUM_RENDER_SAVE_BTN',
              <Button
                style={{ float: 'right' }}
                type="primary"
                loading={loading || saveEvaluateSummaryLoading}
                onClick={onSaveEvaluateSummary}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>,
              {
                header,
              }
            )
          ) : (
            <Button
              style={{ float: 'right' }}
              type="primary"
              loading={loading || saveEvaluateSummaryLoading}
              onClick={onSaveEvaluateSummary}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          )}
        </div>
        {
          // 动态列无法个性化
          openBidOrder === 'SYNC' && bidRuleType !== 'DIFF' ? (
            <Table
              bordered
              loading={loading}
              columns={this.renderColumns(supplierList, bidRuleType, openBidOrder, currentTeam)}
              rowKey="quotationHeaderId"
              dataSource={this.renderDataSource(supplierList) || []}
              pagination={false}
              scroll={{ x: scrollX }}
            />
          ) : (
            customizeTable(
              {
                code: 'SSRC.EXPERT_SCORE_MANAGE.SUPPLIER_LINE',
                cacheKey: bidLineItemId,
              },
              <Table
                bordered
                loading={loading}
                columns={this.renderColumns(supplierList, bidRuleType, openBidOrder, currentTeam)}
                rowKey="quotationHeaderId"
                dataSource={this.renderDataSource(supplierList) || []}
                pagination={false}
                scroll={{ x: scrollX }}
              />
            )
          )
        }

        <Modal
          destroyOnClose
          width={800}
          footer={null}
          visible={attachmentVisible}
          title={intl.get(`ssrc.bidHall.view.title.viewAnnex`).d('查看附件')}
          onCancel={this.hideAttachmentModal}
        >
          <Attachment {...attachmentsProps} viewOnly />
        </Modal>
      </React.Fragment>
    );
  }
}

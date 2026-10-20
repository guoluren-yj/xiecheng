/**
 * 组件-多轮报价物品信息 弹窗
 * @date: 2021-03-24
 * @author: Goku <xu.pan01@going-link.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2021, ZhenYun
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Radio } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';
import { Modal } from 'choerodon-ui/pro';

import { tableScrollWidth, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import CPopover from '@/routes/components/CPopover/';
import SectionPanel from '@/routes/sbid/components/SectionPanel';

import common from './index.less';

const RadioGroup = Radio.Group;

@connect(({ expertScoring, loading }) => ({
  expertScoring,
  fetchExpertScoreItemLinesLoading: loading.effects['expertScoring/fetchExpertScoreItemLines'],
  roundBeginScoreLoading: loading.effects['expertScoring/roundBeginScore'],
  beginRoundQuotationLoading: loading.effects['expertScoring/beginRoundQuotation'],
  organizationId: getCurrentOrganizationId(),
}))
export default class RoundQuotationDrawer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      record: props.record,
      sourceHeaderId: props.sourceHeaderId,
      roundQuotationMap: {},
      // openRoundQuotationFlag: -1
    };
  }

  sectionPanelRef = null;

  componentDidMount() {
    this.fetchExpertScoreItemLines();
  }

  /**
   * 依据状态渲染行样式
   *
   * @param {*} [item={}]
   * @param {*} [index=null]
   * @returns
   * @memberof RoundQuotationModal
   */
  tableRowClass(item = {}) {
    let RedColorClassName = 'ssrc-round-quotation-red-color';
    if (!item.minPriceFlag) {
      RedColorClassName = '';
    }

    return common[RedColorClassName];
  }

  @Bind()
  handleRef(ref) {
    // 绑定Ref
    this.sectionPanelRef = ref;
  }

  /**
   * 查询专家评分下 供应商物品数据
   *
   * @param {*} [page={},flag=number]
   * @memberof ExpertScoring
   */
  @Bind()
  fetchExpertScoreItemLines(page = {}, flag) {
    const { dispatch, organizationId, quotationHeaderIds } = this.props;
    const { sourceHeaderId } = this.state;
    dispatch({
      type: 'expertScoring/fetchExpertScoreItemLines',
      payload: {
        page,
        rfxHeaderId: sourceHeaderId,
        organizationId,
        customizeUnitCode: 'SSRC.EXPERT_SCORE_MANAGE.ROUND_QUOTATION_LINE',
        quotationHeaderIds: flag === 0 ? [] : quotationHeaderIds,
        skipSummaryFlag: flag === 0 ? flag : 1,
      },
    });
  }

  @Bind()
  handleChange(e) {
    const { sourceHeaderId, roundQuotationMap } = this.state;
    this.setState({
      roundQuotationMap: {
        ...roundQuotationMap,
        [sourceHeaderId]: e.target.value,
      },
    });
  }

  @Bind()
  replaceRoute(record) {
    const { onAfterChangeRoute } = this.props;
    const { sourceHeaderId } = record;
    this.setState(
      {
        record,
        sourceHeaderId,
      },
      () => {
        // eslint-disable-next-line no-unused-expressions
        isFunction(onAfterChangeRoute) && onAfterChangeRoute();
        this.fetchExpertScoreItemLines({}, 0);
      }
    );
  }

  @Bind()
  handleModalOk() {
    const { startScore, startRoundQuotation } = this.props;
    const { record, roundQuotationMap, sourceHeaderId } = this.state;
    // 是否包含多轮报价
    const filterRoundQuoKeys = Object.keys(roundQuotationMap).filter((key) => {
      return roundQuotationMap[key] === 1;
    });
    // 开始评分
    const filterScoreKeys = Object.keys(roundQuotationMap).filter((key) => {
      return roundQuotationMap[key] === 0;
    });

    let sectionList = this.sectionPanelRef?.getInternalState('sectionList') || [];
    sectionList = sectionList[0] ? sectionList : [record];
    // 回传数据
    const roundQuotationData = {
      roundQuotationMap,
      curRecord: sectionList.find(
        (r) =>
          String(r.sourceHeaderId) ===
          (filterRoundQuoKeys.length > 0 ? filterRoundQuoKeys[0] : String(sourceHeaderId))
      ), // 优先取多轮报价, 没有则取当前专家评分数据
    };
    if (filterRoundQuoKeys[0]) {
      // 多轮报价存在, 跳转多轮报价页面
      return startRoundQuotation(roundQuotationData, filterRoundQuoKeys, filterScoreKeys);
    }
    return startScore(roundQuotationData, filterRoundQuoKeys, filterScoreKeys);
  }

  /**
   * 批量应用至全部
   * @param {string} value - 执行结果
   */
  @Bind()
  handleBatchMaintain(value) {
    const { record = {}, roundQuotationMap = {} } = this.state;
    let sectionList = this.sectionPanelRef?.getInternalState('sectionList') || [];
    sectionList = sectionList[0] ? sectionList : [record];
    const newMap = {};
    // eslint-disable-next-line no-unused-expressions
    sectionList?.forEach((r) => {
      Object.assign(newMap, {
        [r.sourceHeaderId]: value,
      });
    });
    this.setState({
      roundQuotationMap: {
        ...roundQuotationMap,
        ...newMap,
      },
    });
  }

  /**
   * 表格列
   *
   * @returns
   * @memberof RoundQuotationDrawer
   */
  renderColumns() {
    const { quotationName = intl.get('ssrc.common.model.common.quotation').d('报价') } = this.props;
    const columns = [
      {
        title: intl.get('ssrc.common.goodsNum').d('物料编码'),
        dataIndex: 'itemCode',
        width: 180,
      },
      {
        title: intl.get('ssrc.common.goodsDescription').d('物品描述'),
        dataIndex: 'itemName',
        width: 250,
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get('ssrc.common.supplierNum').d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 180,
      },
      {
        title: intl.get('ssrc.common.supplierName').d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 250,
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get('ssrc.common.rowAmount').d('行金额'),
        dataIndex: 'totalPrice',
        width: 80,
        align: 'right',
        render: (val) => {
          //   const id = record.quotationHeaderId;
          //   const arr = Object.keys(abondonLine);
          //   const invalidId = arr.find((item)=>item.includes(id))
          //   if(invalidId){
          //     if(abondonLine[invalidId]&&quoVisible){
          //       return ''
          //     }
          //     else{
          //       return val && parseFloat(val).toLocaleString()
          //     }
          //   }
          //   else{
          //     if(record.invalidFlag&&quoVisible){
          //       return ''
          //     }
          //     else {
          //       return val && parseFloat(val).toLocaleString()
          //     }
          //   }

          // }
          return val && parseFloat(val).toLocaleString();
        },
      },
      {
        title: intl.get('ssrc.common.number').d('数量'),
        dataIndex: 'validQuotationQuantity',
        width: 80,
      },
      {
        title: intl.get('ssrc.common.unitPrice').d('单价'),
        dataIndex: 'validQuotationPrice',
        width: 80,
        render: (val) => {
          // const id = record.quotationHeaderId;
          // const arr = Object.keys(abondonLine);
          // const invalidId = arr.find((item)=>item.includes(id))
          // if(invalidId){
          //   if(abondonLine[invalidId]){
          //     return ''
          //   }
          //   else{
          //     return val && parseFloat(val).toLocaleString()
          //   }
          // }
          // else{
          //   if(record.invalidFlag){
          //     return ''
          //   }
          //   else {
          //     return val && parseFloat(val).toLocaleString()
          //   }
          // }
          return val && parseFloat(val).toLocaleString();
        },
      },
      {
        title: intl.get('ssrc.common.taxRate').d('税率'),
        dataIndex: 'taxRate',
        width: 80,
      },
      {
        title: intl
          .get(`ssrc.expertScoring.view.modal.commonQuotationLineStatus`, { quotationName })
          .d('{quotationName}状态'),
        dataIndex: 'quotationLineStatusMeaning',
        width: 100,
      },
    ];

    return columns;
  }

  renderContent() {
    const {
      customizeTable,
      fetchExpertScoreItemLinesLoading,
      quotationName = intl.get('ssrc.common.model.common.quotation').d('报价'),
      expertScoring: { expertScoreItemLineList = [], expertScoreItemPagination = {} },
    } = this.props;

    const { sourceHeaderId, roundQuotationMap } = this.state;

    const scrollX = tableScrollWidth(this.renderColumns()) || 0;
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };
    return (
      <div className={common.container}>
        <div className={common['sub-title']}>
          <h3>
            <div className={common['vertical-line']} />
            <span>
              {intl
                .get(`ssrc.inquiryHall.view.message.button.commonSupplierQuotationInfo`, {
                  quotationName,
                })
                .d('供应商{quotationName}情况')}
            </span>
          </h3>
        </div>
        {isFunction(customizeTable) ? (
          customizeTable(
            {
              code: 'SSRC.EXPERT_SCORE_MANAGE.ROUND_QUOTATION_LINE',
            },
            <Table
              bordered
              rowKey="quotationLineId"
              loading={fetchExpertScoreItemLinesLoading}
              rowClassName={(item) => this.tableRowClass(item)}
              columns={this.renderColumns()}
              scroll={{ x: scrollX }}
              pagination={expertScoreItemPagination}
              dataSource={expertScoreItemLineList}
              onChange={this.fetchExpertScoreItemLines}
            />
          )
        ) : (
          <Table
            bordered
            rowKey="quotationLineId"
            loading={fetchExpertScoreItemLinesLoading}
            rowClassName={(item) => this.tableRowClass(item)}
            columns={this.renderColumns()}
            scroll={{ x: scrollX }}
            pagination={expertScoreItemPagination}
            dataSource={expertScoreItemLineList}
            onChange={this.fetchExpertScoreItemLines}
          />
        )}
        <div className={common['sub-title']}>
          <h3>
            <div className={common['vertical-line']} />
            <span>
              {intl.get('ssrc.common.view.subTitle.openRoundQuotationFlag').d('是否开启多轮报价')}
            </span>
          </h3>
          <RadioGroup onChange={this.handleChange} value={roundQuotationMap[sourceHeaderId]}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Radio style={radioStyle} value={1}>
                {intl.get('ssrc.common.model.common.roundQuotation').d('多轮报价')}
              </Radio>
              {roundQuotationMap[sourceHeaderId] === 1 && (
                <a onClick={() => this.handleBatchMaintain(1)}>
                  {intl.get('ssrc.common.view.message.applyToAll').d('应用至全部')}
                </a>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Radio style={radioStyle} value={0}>
                {intl.get('ssrc.common.model.common.expertScoring').d('专家评分')}
              </Radio>
              {roundQuotationMap[sourceHeaderId] === 0 && (
                <a onClick={() => this.handleBatchMaintain(0)}>
                  {intl.get('ssrc.common.view.message.applyToAll').d('应用至全部')}
                </a>
              )}
            </div>
          </RadioGroup>
        </div>
      </div>
    );
  }

  render() {
    const {
      closable = true,
      visible,
      sourceStatus,
      sourceHeaderId,
      sourceProjectId,
      projectLineSectionId,
      candelRoundQuotationModal,
      okCancel = true, // 默认同时显示2个按钮, 在先技术后商务, 确认及汇总时, 只显示ok btn
    } = this.props;

    const { roundQuotationMap } = this.state;

    const sectionPanelProps = {
      openedSectionTitle: intl.get('ssrc.common.view.title.section').d('标段'),
      subTitle: intl
        .get('ssrc.common.view.subTitle.roundQuotationTips')
        .d('快速切换标段并判断是否开启多轮报价'),
      rowKey: 'sourceHeaderId',
      isSection: !!projectLineSectionId,
      parentPage: {
        name: 'expertScoring',
        queryParams: {
          sourceStatus,
          sourceProjectId,
          operation: 'SCORE_MANAGEMENT',
        },
      },
      sectionTagMap: roundQuotationMap,
      activeRowId: sourceHeaderId,
      displayName: 'sectionName',
      afterOpenSection: this.replaceRoute,
      onRef: this.handleRef,
      showTag: true,
    };

    const isDisabled = Object.keys(roundQuotationMap).length === 0;

    return (
      <Modal
        drawer
        closable={closable}
        destroyOnClose
        style={{ width: '80%', zIndex: 999 }}
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        title={intl.get('ssrc.common.view.title.openRoundQuotationFlag').d('是否开启多轮报价')}
        visible={visible}
        onCancel={candelRoundQuotationModal}
        onOk={this.handleModalOk}
        okProps={{
          disabled: isDisabled,
        }}
        okCancel={okCancel}
      >
        {projectLineSectionId ? (
          <SectionPanel {...sectionPanelProps}>{this.renderContent()}</SectionPanel>
        ) : (
          this.renderContent()
        )}
      </Modal>
    );
  }
}

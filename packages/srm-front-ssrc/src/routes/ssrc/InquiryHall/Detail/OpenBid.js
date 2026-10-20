/**
 * inquiryHall - 寻源服务/寻源大厅-开标查看
 * @date: 2020-04-08
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Row, Col, Collapse, Icon, Table, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { FORM_COL_3_LAYOUT } from 'utils/constants';
import { tableScrollWidth, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { phoneRender } from '@/utils/renderer';

import { List } from '@/routes/components/BidOpenningNewModal';
import { fetchNewBidEnable } from '@/services/inquiryHallNewService';
import { fetchHeaderInfo, fetchInquiryGroup } from '@/services/inquiryHallService';

const { Panel } = Collapse;

export default class OpenBid extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      header: {},
      rfxDetailOpenBidList: [],
      OpenBidCollapseKeys: ['openBidHeader', 'openBidDetail', 'newOpenBidList', 'cuxPanel'],
      bidOpeningNewFlag: false, // 专家评分开标是否开启新功能
    };
  }

  bidExcutionRef = React.createRef();

  getSnapshotBeforeUpdate(prevProps = {}) {
    if (!prevProps) {
      return;
    }

    const { rfxHeaderId: prevRfxHeaderId = null } = prevProps || {};
    const { rfxHeaderId = null } = this.props;
    const RefreshFlag = rfxHeaderId && prevRfxHeaderId && prevRfxHeaderId !== rfxHeaderId;

    return RefreshFlag;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.fetchPageMain();
    }
  }

  componentDidMount() {
    this.fetchPageMain();
  }

  // 查询专家评分开标是否开启新功能, 不在在该配置表中的租户默认走新功能
  async fetchBidOpeningBlackConfig() {
    try {
      const { sourceHeaderId, organizationId } = this.props;
      const data = await fetchNewBidEnable({ organizationId, rfxHeaderId: sourceHeaderId });
      if (getResponse(data)) {
        console.log('data', data);
        this.setState({ bidOpeningNewFlag: !!data });
      }
    } catch (e) {
      throw e;
    }
  }

  // 查询头/行
  fetchPageMain = () => {
    this.fetchHeaderInfo();
    this.fetchBidOpeningBlackConfig();
    this.openBidDetailInInquiryDetail();
  };

  async fetchHeaderInfo() {
    const {
      sourceHeaderId,
      organizationId,
      pubRouterAddParams = () => {},
      onFormLoaded,
    } = this.props;

    try {
      let data = await fetchHeaderInfo({
        organizationId,
        rfxHeaderId: sourceHeaderId,
        ...pubRouterAddParams(),
      });
      data = getResponse(data);
      if (!data) {
        return;
      }

      this.setState({
        header: data,
      });
    } catch (e) {
      throw e;
    } finally {
      if (onFormLoaded && typeof onFormLoaded === 'function') {
        onFormLoaded(true);
      }
    }
  }

  @Bind()
  async openBidDetailInInquiryDetail(page = {}) {
    const { sourceHeaderId, organizationId, rfx = {}, pubRouterAddParams = () => {} } = this.props;
    const { unitCodeSymbol } = rfx;

    try {
      let data = await fetchInquiryGroup({
        organizationId,
        rfxHeaderId: sourceHeaderId,
        rfxRole: 'OPENED_BY',
        page,
        customizeUnitCode: `SSRC.${unitCodeSymbol}_DETAIL.OPEN_BID_DETAIL_TABLE`,
        ...pubRouterAddParams(),
      });
      data = getResponse(data);
      if (!data) {
        return;
      }

      this.setState({
        rfxDetailOpenBidList: data,
      });
    } catch (e) {
      throw e;
    }
  }

  @Bind()
  setCollapseByKey(keys = '', values = []) {
    this.setState({
      [keys]: values,
    });
  }

  @Bind()
  getRows(dataSource = {}) {
    const { remote, UEDDisplayFormItem, sourceHeaderId } = this.props;
    const rows = [
      <Row type="flex" justify="start" gutter={48} className="read-row-custom">
        <Col {...FORM_COL_3_LAYOUT}>
          <UEDDisplayFormItem
            label={intl.get('ssrc.common.company').d('公司')}
            value={dataSource.companyName}
          />
        </Col>
        <Col {...FORM_COL_3_LAYOUT}>
          <UEDDisplayFormItem
            label={intl.get(`ssrc.qualiExam.model.qualiExam.sourceCategory`).d('寻源类别')}
            value={dataSource.secondarySourceCategoryMeaning || dataSource.sourceCategoryMeaning}
          />
        </Col>
        <Col {...FORM_COL_3_LAYOUT}>
          <UEDDisplayFormItem
            label={intl.get(`ssrc.qualiExam.model.qualiExam.sourceMethod`).d('寻源方式')}
            value={dataSource.sourceMethodMeaning}
          />
        </Col>
      </Row>,
    ];
    const otherProps = {
      rfxHeaderId: sourceHeaderId,
    };
    return remote
      ? remote.process('SSRC_INQUIRY_HALL_DETAIL_OPEN_BID_PREQUAL_HEADER', rows, otherProps)
      : rows;
  }

  renderFormContent(dataSource = {}) {
    return <Form className="read-row-custom">{this.getRows(dataSource)}</Form>;
  }

  renderPrequalHeader() {
    const { header = {}, OpenBidCollapseKeys = [] } = this.state;

    return (
      <Panel
        showArrow={false}
        header={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h3
              style={{
                maxWidth: '90%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'noWrap',
                marginRight: '12px',
              }}
            >
              {header.rfxNum}
              <Tooltip
                title={`${header.rfxNum}-${header.rfxTitle}`}
                overlayStyle={{ minWidth: '300px' }}
              >
                {header.rfxTitle ? `-${header.rfxTitle}` : null}
              </Tooltip>
            </h3>
            <a>
              {OpenBidCollapseKeys.includes('openBidHeader')
                ? intl.get(`hzero.common.button.up`).d('收起')
                : intl.get(`hzero.common.button.expand`).d('展开')}
            </a>
            <Icon type={OpenBidCollapseKeys.includes('openBidHeader') ? 'up' : 'down'} />
          </div>
        }
        key="openBidHeader"
      >
        {this.renderFormContent(header)}
      </Panel>
    );
  }

  renderTableColumns() {
    const { header, bidOpeningNewFlag } = this.state || {};
    const { expertScoreType, bidRuleType, openBidOrder, existSecondOpenBidFlag } = header || {};
    // 不包含专家评分节点 || 不区分商务技术 || 区分商务技术同步评标
    const showBidFlag =
      expertScoreType !== 'ONLINE' ||
      bidRuleType === 'NONE' ||
      (bidRuleType === 'DIFF' && openBidOrder === 'SYNC');
    // 配置表开启 && 存在二阶段开标 && 包含专家评分节点 && 先技术后商务或者先商务后技术
    const showSecondBidFlag =
      bidOpeningNewFlag &&
      existSecondOpenBidFlag === 1 &&
      expertScoreType === 'ONLINE' &&
      ['TECH_FIRST', 'BUSINESS_FIRST'].includes(openBidOrder);
    // if (!header?.rfxHeaderId) return [];
    return [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.openBidder`).d('开标员'),
        dataIndex: 'realName',
        width: 200,
      },
      (!bidOpeningNewFlag || showBidFlag) && {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.openBidStatus`).d('开标状态'),
        dataIndex: 'openedFlagMeaning',
        width: 100,
      },
      showSecondBidFlag && {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.openTechBidStatus`).d('技术开标状态'),
        dataIndex: 'techFlagMeaning',
        width: 100,
        render: (val, record) =>
          openBidOrder === 'TECH_FIRST'
            ? record?.openedFlagMeaning
            : record?.secondOpenedFlagMeaning,
      },
      showSecondBidFlag && {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.openBusinessBidStatus`)
          .d('商务开标状态'),
        dataIndex: 'bussinessFlagMeaning',
        width: 100,
        render: (val, record) =>
          openBidOrder === 'TECH_FIRST'
            ? record?.secondOpenedFlagMeaning
            : record?.openedFlagMeaning,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.tel`).d('联系电话'),
        dataIndex: 'phone',
        width: 200,
        render: (val, record) => phoneRender(record.internationalTelCodeMeaning, val),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.email`).d('电子邮件'),
        dataIndex: 'email',
        width: 200,
      },
    ].filter((i) => Boolean(i));
  }

  renderPrequalSupplier() {
    const { customizeTable = () => {}, rfx = {} } = this.props;
    const { rfxDetailOpenBidList = [], OpenBidCollapseKeys = [] } = this.state;
    const { unitCodeSymbol } = rfx;

    const columns = this.renderTableColumns();
    const scrollX = tableScrollWidth(columns);

    return (
      <Panel
        showArrow={false}
        header={
          <React.Fragment>
            <h3>{intl.get('ssrc.bidHall.model.bidHall.openBidDetails').d('开标详情')}</h3>
            <a>
              {OpenBidCollapseKeys.includes('openBidDetail')
                ? intl.get(`hzero.common.button.up`).d('收起')
                : intl.get(`hzero.common.button.expand`).d('展开')}
            </a>
            <Icon type={OpenBidCollapseKeys.includes('openBidDetail') ? 'up' : 'down'} />
          </React.Fragment>
        }
        key="openBidDetail"
      >
        {customizeTable(
          { code: `SSRC.${unitCodeSymbol}_DETAIL.OPEN_BID_DETAIL_TABLE` },
          <Table
            bordered
            rowKey="openUserId"
            columns={columns}
            scroll={{ x: scrollX }}
            dataSource={rfxDetailOpenBidList}
            pagination={false}
            onChange={(page) => this.openBidDetailInInquiryDetail(page)}
          />
        )}
      </Panel>
    );
  }

  /**
   * @description: 新开标一览表
   * @return {*}
   */
  renderExecutionList() {
    const { rfx = {}, header = {} } = this.props;
    const { OpenBidCollapseKeys = [] } = this.state;
    const { unitCodeSymbol, bidFlag } = rfx || {};
    const { bidOpeningNewFlag } = this.state;
    if (!bidOpeningNewFlag) return null;
    const listProps = {
      data: header,
      sourceKey: unitCodeSymbol,
      ref: this.bidExcutionRef,
      bidFlag,
    };

    return (
      <Panel
        showArrow={false}
        header={
          <React.Fragment>
            <h3>
              {intl.get('ssrc.inquiryHall.view.message.modal.openingBid.list').d('开标一览表')}
            </h3>
            <a>
              {OpenBidCollapseKeys.includes('newOpenBidList')
                ? intl.get(`hzero.common.button.up`).d('收起')
                : intl.get(`hzero.common.button.expand`).d('展开')}
            </a>
            <Icon type={OpenBidCollapseKeys.includes('newOpenBidList') ? 'up' : 'down'} />
          </React.Fragment>
        }
        key="newOpenBidList"
      >
        <List {...listProps} />
      </Panel>
    );
  }

  /**
   * 二开埋点开发
   * @protected [hailiang]
   */
  renderCuxCollapse() {
    const { remote } = this.props;
    const { OpenBidCollapseKeys = [] } = this.state;

    const allProps = {
      ...this.props,
      OpenBidCollapseKeys,
    };

    return (
      remote && remote.render('SSRC_INQUIRY_HALL_DETAIL_OPEN_BID_RESERVE_PANEL', <></>, allProps)
    );
  }

  render() {
    const { OpenBidCollapseKeys = [] } = this.state;

    return (
      <Collapse
        onChange={(keys) => this.setCollapseByKey('OpenBidCollapseKeys', keys)}
        className="form-collapse"
        defaultActiveKey={OpenBidCollapseKeys}
      >
        {this.renderPrequalHeader()}
        {this.renderPrequalSupplier()}
        {this.renderExecutionList()}
        {this.renderCuxCollapse()}
      </Collapse>
    );
  }
}

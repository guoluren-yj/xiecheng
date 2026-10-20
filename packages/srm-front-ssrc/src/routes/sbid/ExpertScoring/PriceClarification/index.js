// 价格澄清列表

import React, { Component } from 'react';
import { DataSet, Table, Modal } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';

import { Header, Content } from 'components/Page';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { openTab, refreshTab } from 'utils/menuTab';
import { INQUIRY, BID } from '@/utils/globalVariable';
import { PriceClarificationListDS, SupplierReplyList } from './TableDS';
// import { verifyPriceClarificationButton } from '@/services/expertScoringService';

class Update extends Component {
  constructor(props) {
    super(props);

    this.organizationId = getCurrentOrganizationId();

    this.state = {
      // allowCreate: null,
    };
  }

  SupplierReplyListDS = new DataSet(SupplierReplyList());

  isClickDirectionResponseDetail; // 是否点击查看回复详情

  getSnapshotBeforeUpdate(prevProps = {}) {
    const isPageRefresh = this.isPageRefresh(prevProps);
    return isPageRefresh;
  }

  PriceClarificationListDS = new DataSet(PriceClarificationListDS());

  bidFlag = (this.props.sourceKey || INQUIRY) === BID;

  componentDidMount() {
    this.fetchList();
    // this.validateButtons();
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.fetchList();
      // this.validateButtons();
    }
  }

  // judge page need refresh
  isPageRefresh(prevProps = {}) {
    const {
      history: {
        location: { search },
      },
    } = prevProps;
    const RouterParams = querystring.parse(search.substr(1)) || {};
    const { sourceHeaderId: preHeaderId = null } = RouterParams;
    const currentHeaderId = this.getLocationSearch('sourceHeaderId');

    return currentHeaderId && currentHeaderId !== preHeaderId;
  }

  fetchList() {
    const RouterParams = this.getLocationSearch();
    const { sourceHeaderId, sourceFrom } = RouterParams;
    this.PriceClarificationListDS.setQueryParameter('commonProps', {
      organizationId: this.organizationId,
      sourceHeaderId,
      sourceFrom,
    });
    this.PriceClarificationListDS.query();
  }

  // async validateButtons() {
  //   // const { sourceHeaderId, sourceFrom, organizationId } = this.props;
  //   const { sourceHeaderId, sourceFrom } = this.getLocationSearch();
  //   try {
  //     let result = await verifyPriceClarificationButton({
  //       sourceFrom,
  //       sourceHeaderId,
  //       organizationId: this.organizationId,
  //     });
  //     result = getResponse(result);
  //     if (!result) {
  //       return;
  //     }
  //     const {
  //       create = null,
  //       // allowViewResponseDetail = true, // HACK, SHOW ALWAYS, NEED clarifyIssueId TO DIRECTION
  //     } = result || {};
  //     this.setState({
  //       allowCreate: create,
  //       // allowViewResponseDetail,
  //     });
  //   } catch (e) {
  //     throw e;
  //   }
  // }

  // 价格澄清明细
  @Bind()
  directionPriceClarificationDetail(record = {}) {
    const clarifyNotifyId = record.get('clarifyNotifyId');

    if (!clarifyNotifyId) {
      return;
    }

    const params = this.refactorRouterSearch(clarifyNotifyId);

    const path = this.bidFlag
      ? '/ssrc/new-bid-hall/price-clarification-detail'
      : '/ssrc/price-clarification/detail';
    openTab({
      key: path,
      path,
      // title: 'ssrc.inquiryHall.view.title.priceClarification',
      title: 'srm.common.tab.title.ssrc.priceClarification',
      closable: true,
      search: params,
    });
  }

  // 构建跳转路由
  refactorRouterSearch(clarifyNotifyId = null) {
    const {
      history: {
        location: { pathname, search },
      },
    } = this.props;
    const RouterParams = this.getLocationSearch();
    const params = querystring.stringify({
      ...RouterParams,
      originBackPathList: `${pathname}${search}`,
      clarifyNotifyId,
    });

    return params;
  }

  // 价格澄清维护
  @Bind()
  directionPriceClarificationMaintain(record = {}) {
    const clarifyNotifyId = record.get('clarifyNotifyId');

    if (!clarifyNotifyId) {
      return;
    }

    const params = this.refactorRouterSearch(clarifyNotifyId);
    const path = this.bidFlag
      ? '/ssrc/new-bid-hall/price-clarification-update'
      : '/ssrc/price-clarification/update';
    openTab({
      key: path,
      path,
      // title: 'ssrc.inquiryHall.view.title.priceClarification',
      title: 'srm.common.tab.title.ssrc.priceClarification',
      closable: true,
      search: params,
    });
  }

  // create page direction
  // @Bind()
  // createPriceClarification() {
  //   const { history = {} } = this.props;

  //   const params = this.refactorRouterSearch();
  //   history.push({
  //     pathname: '/ssrc/expert-scoring/price-clarification/update',
  //     search: params,
  //   });
  // }

  // 查看回复详情
  @Bind()
  directionResponseDetail(record = {}) {
    const clarifyNotifyId = record.get('clarifyNotifyId');
    this.isClickDirectionResponseDetail = true;
    if (!clarifyNotifyId) {
      return;
    }

    const params = this.refactorRouterSearch(clarifyNotifyId);
    const path = this.bidFlag
      ? '/ssrc/new-bid-hall/price-clarification-detail'
      : '/ssrc/price-clarification/detail';
    openTab({
      key: path,
      path,
      // title: 'ssrc.inquiryHall.view.title.priceClarification',
      title: 'srm.common.tab.title.ssrc.priceClarification',
      closable: true,
      search: params,
    });
  }

  // view supplier replay
  @Bind()
  viewSupplierReplay(record = {}) {
    const data = record.toData();
    const { clarifyNotifyId } = data;
    this.SupplierReplyListDS.setQueryParameter('commonProps', {
      organizationId: this.organizationId,
      clarifyNotifyId,
    });
    this.SupplierReplyListDS.query();

    const modalKey = Modal.key();
    Modal.open({
      destroyOnClose: true,
      closable: true,
      key: modalKey,
      title: intl
        .get(`ssrc.inquiryHall.view.message.title.supplierReplyDetail`)
        .d('供应商回复详情'),
      children: (
        <Table
          rowKey="supplierCompanyId"
          columns={this.getSupplierReplyColumns()}
          dataSet={this.SupplierReplyListDS}
        />
      ),
      onClose: this.cancelViewSupplierReplay,
      footer: null,
      style: { width: 680 },
    });
  }

  @Bind()
  cancelViewSupplierReplay() {
    this.SupplierReplyListDS.loadData();
  }

  getSupplierReplyColumns() {
    const columns = [
      { name: 'supplierCompanyCode', width: 180 },
      { name: 'supplierCompanyName' },
      { name: 'priceClarifyIssueLineStatusMeaning', width: 120 },
    ];

    return columns;
  }

  // table columns
  getColumns() {
    const Columns = [
      {
        name: 'clarifyNotifyNum',
        width: 150,
        renderer: ({ value, record }) => (
          <a onClick={() => this.directionPriceClarificationDetail(record)}>{value}</a>
        ),
      },
      {
        name: 'clarifyNotifyTitle',
        tooltip: 'overflow',
      },
      {
        name: 'clarifyNotifyStatusMeaning',
        width: 100,
      },
      {
        name: 'companyName',
        width: 200,
        tooltip: 'overflow',
      },
      {
        name: 'suppliers',
        width: 100,
        renderer: ({ record }) => {
          const repliedSupplierCount = record.get('repliedSupplierCount') || 0;
          const supplierCount = record.get('supplierCount') || 0;

          return (
            <a onClick={() => this.viewSupplierReplay(record)}>
              {repliedSupplierCount} / {supplierCount}
            </a>
          );
        },
      },
      {
        name: 'submittedDate',
        width: 180,
      },
      {
        name: 'replyEndDate',
        width: 180,
      },
      {
        name: 'operations',
        width: 120,
        renderer: this.handleOperations,
      },
    ];
    return Columns;
  }

  /**
   * [屈臣氏] 重写, 谨慎修改!!!
   * @protected
   */
  handleOperations = ({ record }) => {
    const status = record.get('clarifyNotifyStatus');
    return (
      <span>
        {status === 'NEW' ? (
          <a onClick={() => this.directionPriceClarificationMaintain(record)}>
            {intl.get('ssrc.common.maintain').d('维护')}
          </a>
        ) : (
          <a onClick={() => this.directionResponseDetail(record)}>
            {intl.get('ssrc.inquiryHall.view.button.directionResponseDetail').d('查看回复详情')}
          </a>
        )}
      </span>
    );
  };

  // get location
  getLocationSearch(key = null) {
    const { history } = this.props;
    const {
      location: { search = {} },
    } = history || {};
    const RouterParams = querystring.parse(search.substr(1)) || {};
    if (!key || typeof key !== 'string') {
      return RouterParams;
    }

    return RouterParams[key] || null;
  }

  // get back path
  getBackpath() {
    const originBackPath = this.getLocationSearch('originBackPath');
    return originBackPath;
  }

  render() {
    // const { allowCreate = null } = this.state;

    return (
      <React.Fragment>
        <Header
          title={intl.get('ssrc.inquiryHall.view.title.priceClarification').d('价格澄清')}
          backPath={this.getBackpath()}
          onBack={() => {
            // eslint-disable-next-line no-unused-expressions
            this.isClickDirectionResponseDetail && refreshTab();
          }}
        >
          {/* {allowCreate ? (
            <Button color="primary" onClick={this.createPriceClarification}>
              {intl.get('ssrc.inquiryHall.view.button.sponsorPriceClarification').d('发起价格澄清')}
            </Button>
          ) : null} */}
        </Header>
        <Content>
          <Table
            rowKey="clarifyNotifyId"
            columns={this.getColumns()}
            dataSet={this.PriceClarificationListDS}
          />
        </Content>
      </React.Fragment>
    );
  }
}

const HOCComponent = (Comp) =>
  formatterCollections({
    code: ['ssrc.expertScoring', 'ssrc.inquiryHall', 'ssrc.common'],
  })(Comp);

export default HOCComponent(Update);

export { HOCComponent, Update };

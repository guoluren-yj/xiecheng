/**
 * routes 寻源立项-列表
 * @date: 2020-2-24
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Table, Button, Popover } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { routerRedux } from 'dva/router';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { isUndefined, sum, isNumber } from 'lodash';
import { dateTimeRender } from 'utils/renderer';
import querystring from 'querystring';
import intl from 'utils/intl';
import FilterForm from './FilterForm';

@connect(({ projectSetup, loading }) => ({
  projectSetup,
  loading: loading.effects['projectSetup/fetchListData'],
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: ['ssrc.projectSetup', 'ssrc.inquiryHall'],
})
@withCustomize({
  unitCode: ['SSRC.PROJECT_SETUP_LIST.FILTER', 'SSRC.PROJECT_SETUP_LIST.LIST'],
})
export default class Qualification extends Component {
  form;

  /**
   *  初始化查询
   */
  componentDidMount() {
    // this.handleSearch();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.custLoading && !this.props.custLoading) {
      // 这时this.props.form.getFormFieldsValue()可以拿到正确值
      // 注意去掉原来didmount中的查询，并在此处做初始查询逻辑
      // 注意控制查询次数，避免死循环
      this.handleSearch();
    }
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   *  引用申请立项
   */
  @Bind()
  handleQuoteApproval() {
    this.props.dispatch(
      routerRedux.push({
        pathname: `/ssrc/project-setup/quoteApproval`,
      })
    );
  }

  /**
   * 手工立项
   */
  @Bind()
  handleManualProject() {
    this.props.dispatch(
      routerRedux.push({
        pathname: `/ssrc/project-setup/update/null`,
      })
    );
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch, organizationId } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());

    dispatch({
      type: 'projectSetup/fetchListData',
      payload: {
        page,
        ...fieldValues,
        organizationId,
        customizeUnitCode: 'SSRC.PROJECT_SETUP_LIST.LIST,SSRC.PROJECT_SETUP_LIST.FILTER',
      },
    });
  }

  @Bind()
  handleEdit(record) {
    const { sourceProjectId, sourceFrom = null } = record;
    if (!sourceProjectId) return;
    const search = querystring.stringify({
      sourceFrom,
    });
    this.props.dispatch(
      routerRedux.push({
        pathname: `/ssrc/project-setup/update/${sourceProjectId}`,
        search,
      })
    );
  }

  @Bind()
  handleSourceManage(record) {
    const search = querystring.stringify({
      tabStatus: 'all',
      sourceProjectId: record.sourceProjectId,
      sourceProjectName: record.sourceProjectName,
    });
    this.props.history.push({
      pathname: `/ssrc/new-inquiry-hall/list`,
      search,
    });
  }

  /**
   *  跳转详情页面
   */
  @Bind()
  goDetail(record) {
    const { sourceProjectId } = record;
    if (!sourceProjectId) return;
    this.props.dispatch(
      routerRedux.push({
        pathname: `/ssrc/project-setup/detail/${sourceProjectId}`,
      })
    );
  }

  // // 点击关联寻源单跳转
  // @Bind()
  // clickRelatedSourceNum(_, record = {}) {
  //   const { sourceCategory = null, sourceHeaderId = null } = record;
  //   if (!sourceCategory || !sourceHeaderId) {
  //     return;
  //   }

  //   const { dispatch } = this.props;
  //   const search = querystring.stringify({
  //     sourcePage: 'project-setup',
  //   });
  //   if (sourceCategory === 'BID') {
  //     dispatch(
  //       routerRedux.push({
  //         pathname: `/ssrc/bid-hall/bid-detail/${sourceHeaderId}`,
  //         search,
  //       })
  //     );
  //   } else {
  //     dispatch(
  //       routerRedux.push({
  //         pathname: `/ssrc/inquiry-hall/rfx-detail/${sourceHeaderId}`,
  //         search,
  //       })
  //     );
  //   }
  // }

  @Bind()
  getColumns() {
    const columns = [
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'sourceProjectStatusMeaning',
        width: 100,
      },
      {
        title: intl.get('hzero.common.btn.action').d('操作'),
        dataIndex: 'operator',
        width: 100,
        render: (val, record) => {
          if (['NEW', 'REFUSE', 'CHANGING'].includes(record.sourceProjectStatus)) {
            return (
              <a onClick={() => this.handleEdit(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            );
          }
          if (
            ['APPROVED', 'SOURCING'].includes(record.sourceProjectStatus) &&
            record.referenceFlag &&
            record.sourceCategory !== 'BID' &&
            record.closedStatus !== 'CLOSE_APPROVING' // 关闭审批中不显示此按钮
          ) {
            return (
              <a onClick={() => this.handleSourceManage(record)}>
                {intl.get('ssrc.inquiryHall.model.inquiryHall.sourceManage').d('寻源管理')}
              </a>
            );
          }
          // 关闭审批中不显示此按钮
          if (record.enableChangeFlag === 1 && record.closedStatus !== 'CLOSE_APPROVING') {
            return (
              <a onClick={() => this.handleEdit(record)}>
                {intl.get('ssrc.inquiryHall.model.inquiryHall.change').d('变更')}
              </a>
            );
          }
        },
      },
      {
        title: intl.get('ssrc.projectSetup.model.projectSetup.projectCode').d('项目编号'),
        dataIndex: 'sourceProjectNum',
        width: 180,
        render: (val, record) => <a onClick={() => this.goDetail(record)}>{val}</a>,
      },
      {
        title: intl.get('ssrc.projectSetup.model.projectSetup.projectName').d('项目名称'),
        dataIndex: 'sourceProjectName',
      },
      {
        title: intl.get('ssrc.common.company').d('公司'),
        dataIndex: 'companyName',
        width: 180,
      },
      {
        title: intl.get('ssrc.projectSetup.model.projectSetup.purchaseCont').d('采购联系人'),
        dataIndex: 'purAgent',
        width: 150,
      },
      {
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.unitName').d('需求部门'),
        dataIndex: 'unitName',
        width: 150,
      },
      {
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.sourcingCategory').d('寻源类别'),
        dataIndex: 'sourceCategoryMeaning',
        width: 150,
      },
      {
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.sourcingApproach').d('寻源方式'),
        dataIndex: 'sourceMethodMeaning',
        width: 150,
      },
      {
        title: intl.get('ssrc.projectSetup.model.projectSetup.creationDate').d('创建时间'),
        dataIndex: 'creationDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`ssrc.projectSetup.model.projectSetup.relatedOriginOrder`).d('关联寻源单'),
        dataIndex: 'sourceHeaderNum',
        width: 160,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
    ];
    return columns;
  }

  render() {
    const {
      projectSetup: { ListDataSource = [], pagination = {} },
      dispatch,
      customizeFilterForm,
      customizeTable,
      loading,
    } = this.props;
    const columns = this.getColumns();
    const filterProps = {
      dispatch,
      onRef: this.handleRef,
      onConditional: this.handleSearch,
      customizeFilterForm,
    };
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))) + 300;
    return (
      <React.Fragment>
        <Header title={intl.get('ssrc.projectSetup.view.message.title.projectSetup').d('寻源立项')}>
          <Button icon="clock-circle-o" type="primary" onClick={this.handleManualProject}>
            {intl.get('ssrc.projectSetup.view.button.manualProject').d('手工立项')}
          </Button>
          <Button icon="rocket" onClick={this.handleQuoteApproval}>
            {intl.get('ssrc.projectSetup.view.button.quoteApproval').d('引用申请立项')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          {customizeTable(
            { code: 'SSRC.PROJECT_SETUP_LIST.LIST' },
            <Table
              bordered
              rowKey="recordId"
              scroll={{ x: scrollX }}
              loading={loading}
              columns={columns}
              dataSource={ListDataSource}
              pagination={pagination}
              onChange={(page) => this.handleSearch(page)}
            />
          )}
        </Content>
      </React.Fragment>
    );
  }
}

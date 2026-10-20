/**
 * CompanyBanner - 公司Banner管理
 * @date: 2019-2-26
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Select, Form, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import { isUndefined } from 'lodash';

import { Header, Content } from 'components/Page';
import cacheComponent, { deleteCache } from 'components/CacheComponent';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { DATETIME_MAX, DATETIME_MIN } from 'utils/constants';

import TableList from './TableList';
import HistoryRecord from './HistoryModal';
import FilterForm from './FilterForm';

const prompt = 'scec.companyBanner';
const { Option } = Select;
// const isTenant = isTenantRoleLevel();

@connect(({ companyBanner, loading }) => ({
  companyBanner,
  fetchCurrentCompanyLoading: loading.effects['companyBanner/fetchCurrentCompanyValue'],
  fetchCompanyBannerListLoading: loading.effects['companyBanner/fetchCompanyBannerList'],
  fetchHistoryRecordLoading: loading.effects['companyBanner/fetchHistoryRecord'],
  organizationId: getCurrentOrganizationId(),
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: ['scec.companyBanner', 'scec.customBar', 'scec.common', 'scec.shopBasket'],
})
@cacheComponent({ cacheKey: '/scec/company-banner/list' })
export default class CompanyBanner extends Component {
  state = {
    historyRecordVisible: false, // 历史纪录模态框
  };

  componentDidMount() {
    const {
      location: { pathname },
      dispatch,
      companyBanner: { pagination },
    } = this.props;
    dispatch({
      type: 'companyBanner/updateState',
      payload: {
        header: {},
        line: [],
        linePagination: {},
        goodsLineChange: false,
      },
    });
    if (pathname.match('platform-banner')) {
      this.fetchBannerList(pagination);
    } else {
      this.fetchCurrentCompanyValue(pagination);
    }
    this.fetchBannerStatus();
    deleteCache('/scec/company-banner/Detail');
  }

  /**
   * 查询-banner列表数据
   * 租户级传organizationId 和companyId
   */
  @Bind()
  fetchBannerList(page = {}) {
    const {
      dispatch,
      location: { pathname },
      organizationId,
      form: { getFieldValue },
    } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    let payload = {};
    payload = pathname.match('platform-banner')
      ? {
          page,
          ...fieldValues,
          startDate: fieldValues.startDate ? fieldValues.startDate.format(DATETIME_MIN) : undefined,
          endDate: fieldValues.endDate ? fieldValues.endDate.format(DATETIME_MAX) : undefined,
        }
      : getFieldValue('currentCompany')
      ? {
          ...fieldValues,
          startDate: fieldValues.startDate ? fieldValues.startDate.format(DATETIME_MIN) : undefined,
          endDate: fieldValues.endDate ? fieldValues.endDate.format(DATETIME_MAX) : undefined,
          organizationId,
          page,
          companyId: getFieldValue('currentCompany'),
        }
      : { organizationId, page };
    dispatch({
      type: 'companyBanner/fetchCompanyBannerList',
      payload,
    });
  }

  /**
   * 获取banner状态
   */
  @Bind()
  fetchBannerStatus() {
    const { dispatch } = this.props;
    dispatch({
      type: 'companyBanner/fetchBannerStatus',
    });
  }

  /**
   * 查询-当前公司值集
   */
  @Bind()
  fetchCurrentCompanyValue(page = {}) {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'companyBanner/fetchCurrentCompanyValue',
      payload: {
        lovCode: 'SPFM.USER_AUTH.COMPANY',
        tenantId: organizationId,
      },
    }).then(res => {
      if (res) {
        this.fetchBannerList(page);
      }
    });
  }

  /**
   * 改变当前公司值，查询列表数据
   */
  @Bind()
  changeCurrentCompany(value) {
    const {
      dispatch,
      organizationId,
      companyBanner: { pagination = {} },
    } = this.props;
    this.form.resetFields();
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'companyBanner/fetchCompanyBannerList',
      payload: {
        ...fieldValues,
        startDate: fieldValues.startDate ? fieldValues.startDate.format(DATETIME_MIN) : undefined,
        endDate: fieldValues.endDate ? fieldValues.endDate.format(DATETIME_MAX) : undefined,
        organizationId,
        page: pagination,
        companyId: value,
      },
    });
  }

  /**
   * 新建-公司Banner
   */
  @Bind()
  createCompanyBanner() {
    const {
      dispatch,
      form: { getFieldValue },
      location: { pathname },
    } = this.props;
    if (pathname.match('platform-banner')) {
      dispatch(
        routerRedux.push({
          pathname: `/scec/platform-banner/create`,
        })
      );
    } else {
      if (!getFieldValue('currentCompany')) {
        Modal.confirm({
          title: intl.get(`${prompt}.choose.a.company`).d('请选择公司！'),
          onOk: () => {
            this.setState();
          },
        });
        return;
      }
      dispatch(
        routerRedux.push({
          pathname: `/scec/company-banner/create/${getFieldValue('currentCompany')}`,
        })
      );
    }
  }

  /**
   * 编辑-跳转明细
   */
  @Bind()
  handleEdit(record) {
    const {
      dispatch,
      form: { getFieldValue },
      location: { pathname },
    } = this.props;
    if (pathname.match('platform-banner')) {
      dispatch(
        routerRedux.push({
          pathname: `/scec/platform-banner/detail/${record.bannerId}`,
        })
      );
    } else {
      dispatch(
        routerRedux.push({
          pathname: `/scec/company-banner/detail/${record.bannerId}/${getFieldValue(
            'currentCompany'
          )}`,
        })
      );
    }
  }

  /**
   * 查看-跳转明细
   */
  @Bind()
  handleCheck(record) {
    const {
      dispatch,
      form: { getFieldValue },
      location: { pathname },
    } = this.props;
    if (pathname.match('platform-banner')) {
      dispatch(
        routerRedux.push({
          pathname: `/scec/platform-banner/check-detail/${record.bannerId}`,
        })
      );
    } else {
      dispatch(
        routerRedux.push({
          pathname: `/scec/company-banner/check-detail/${record.bannerId}/${getFieldValue(
            'currentCompany'
          )}`,
        })
      );
    }
  }

  /**
   * 上架/下架Banner
   * 租户级传organizationId
   */
  @Bind()
  operatingBanner(action, bannerId) {
    const {
      dispatch,
      organizationId,
      companyBanner: { pagination },
      location: { pathname },
    } = this.props;
    let payload = {};
    payload = pathname.match('platform-banner')
      ? {
          idForShelf: bannerId,
          action,
        }
      : {
          idForShelf: bannerId,
          organizationId,
          action,
        };
    dispatch({
      type: 'companyBanner/operatingBanner',
      payload,
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchBannerList(pagination);
      }
    });
  }

  /**
   * 打开-历史纪录
   */
  @Bind()
  showHistoryRecord(record) {
    this.setState({
      historyRecordVisible: true,
    });
    this.showHistoryBanner(record);
  }

  /**
   * 历史纪录
   */
  @Bind()
  showHistoryBanner(record, page = {}) {
    const {
      dispatch,
      organizationId,
      location: { pathname },
    } = this.props;
    let payload = {};
    payload = pathname.match('platform-banner')
      ? {
          bannerId: record.bannerId,
          page,
        }
      : {
          bannerId: record.bannerId,
          page,
          organizationId,
        };
    dispatch({
      type: 'companyBanner/fetchHistoryRecord',
      payload,
    });
  }

  /**
   * 历史纪录-改变分页
   */
  @Bind()
  changeHistoryPagination(page) {
    const {
      companyBanner: { history = [] },
    } = this.props;
    this.showHistoryBanner(history && history[0], page);
  }

  /**
   * 取消历史记录
   */
  @Bind()
  cancelHistoryRecord() {
    const { dispatch } = this.props;
    this.setState({
      historyRecordVisible: false,
    });
    dispatch({
      type: 'companyBanner/updateState',
      payload: {
        history: [],
        historyPagination: {},
      },
    });
  }

  form;

  /**
   * 设置Form
   * @param {object} ref - FilterForm组件引用
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  render() {
    const {
      fetchCompanyBannerListLoading,
      fetchHistoryRecordLoading,
      fetchCurrentCompanyLoading,
      companyBanner: {
        list = [],
        pagination = {},
        currentCompany = [],
        history = [],
        historyPagination = {},
        bannerStatus = [],
      },
      form: { getFieldDecorator },
      location: { pathname },
    } = this.props;
    const { historyRecordVisible = false } = this.state;
    const formProps = {
      bannerStatus,
      onSearch: this.fetchBannerList,
      onRef: this.handleBindRef,
    };
    const tableProps = {
      pagination,
      loading: fetchCompanyBannerListLoading,
      dataSource: list,
      onHandleEdit: this.handleEdit,
      onHandleCheck: this.handleCheck,
      onChange: this.fetchBannerList,
      onHandleOperatingBanner: this.operatingBanner,
      onShowHistoryRecord: this.showHistoryRecord,
    };
    const historyRecordProps = {
      loading: fetchHistoryRecordLoading,
      visible: historyRecordVisible,
      dataSource: history,
      pagination: historyPagination,
      onChange: this.changeHistoryPagination,
      onCancel: this.cancelHistoryRecord,
    };
    return (
      <React.Fragment>
        <Header
          title={
            pathname.match('platform-banner')
              ? intl.get(`${prompt}.view.platformBanner.title`).d('平台Banner管理')
              : intl.get(`${prompt}.view.companyBanner.tltle`).d('公司Banner管理')
          }
        >
          <Button
            loading={fetchCurrentCompanyLoading}
            type="primary"
            onClick={this.createCompanyBanner}
            icon="plus"
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          {pathname.match('platform-banner') ? (
            ''
          ) : (
            <Form
              layout="inline"
              style={{ marginLeft: '20px', display: 'inline-block', lineHeight: '39px' }}
            >
              <Form.Item
                label={intl.get(`scec.customBar.model.customBar.the.current.company`).d('当前公司')}
              >
                {getFieldDecorator('currentCompany', {
                  initialValue: currentCompany[0] && currentCompany[0].companyId,
                })(
                  <Select style={{ width: '170px' }} onChange={this.changeCurrentCompany}>
                    {currentCompany &&
                      currentCompany.map(item => (
                        <Option key={item.companyId} value={item.companyId}>
                          {item.companyName}
                        </Option>
                      ))}
                  </Select>
                )}
              </Form.Item>
            </Form>
          )}
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...formProps} />
          </div>
          <TableList {...tableProps} />
        </Content>
        <HistoryRecord {...historyRecordProps} />
      </React.Fragment>
    );
  }
}

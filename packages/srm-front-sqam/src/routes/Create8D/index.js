/**
 * 8D 创建
 * @date: 2018-11-23
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Modal, Form } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import { isUndefined, isEmpty, isArray, throttle } from 'lodash';
import { Header, Content } from 'components/Page';
import { Button as PermissionButton } from 'components/Permission';
import { stringify } from 'querystring';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import DynamicButtons from '_components/DynamicButtons';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import FilterForm from './FilterForm';
import ListTable from './ListTable';
import AssociationModal from '../components/AssociationModal';

/**
 * 8D 创建入口
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} 8dCreate - 数据源
 * @reactProps {!boolean} loading - 数据加载是否完成
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@connect(({ create8D, loading }) => ({
  create8D,
  loading: {
    fetch: loading.effects['create8D/fetch8D'],
    release: loading.effects['create8D/release8D'],
    delete: loading.effects['create8D/delete8D'],
    loadingAssociation: loading.effects['create8D/relation8D'],
  },
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: [
    'sqam.common',
    'entity.supplier',
    'entity.item',
    'entity.company',
    'entity.organization',
    'entity.roles',
    'sqam.quoteIncomingInspection',
    'entity.business',
  ],
})
@withCustomize({
  unitCode: ['SQAM.CREATE_8D_LIST.FILTER', 'SQAM.CREATE_8D_LIST.BTNS'],
})
@Form.create({ fieldNameProp: null })
export default class Create8D extends PureComponent {
  form;

  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
      visible: false,
      associationList: [],
    };
  }

  /**
   * componentDidMount 生命周期函数
   * render()执行后获取页面数据
   */
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'create8D/fetchLov' });
    dispatch({ type: 'create8D/updateState', payload: { detail: {} } });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.custLoading === true && this.props.custLoading === false) {
      const {
        create8D: { pagination = {} },
        location: { state: { _back } = {} },
      } = this.props;
      // 校验是否从详情页返回
      const page = isUndefined(_back) ? {} : pagination;
      this.handleSearch(page);
    }
  }

  /**
   * 传递表单对象
   * @param {object} ref - FilterForm对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 页面查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(fields = {}) {
    const { dispatch, tenantId } = this.props;
    let filterValues = {};
    if (!isUndefined(this.form)) {
      const formValue = this.form.getFieldsValue();
      const values = {
        ...formValue,
        createTimeAfter:
          formValue.createTimeAfter && formValue.createTimeAfter.format(DATETIME_MIN),
        createTimeBefore:
          formValue.createTimeBefore && formValue.createTimeBefore.format(DATETIME_MAX),
      };
      filterValues = filterNullValueObject(values);
    }
    dispatch({
      type: 'create8D/fetch8D',
      payload: {
        tenantId,
        page: isEmpty(fields) ? {} : fields,
        pageEntryPoint: 'CUSTOMER_CREATE',
        ...filterValues,
      },
    });
  }

  /**
   * 创建
   */
  @Bind()
  handleCreate8D() {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sqam/create8D/create`,
      })
    );
  }

  /**
   * 明细维护
   * @param {!object} record - 8D对象
   */
  @Bind()
  handleEdit8D(record = {}) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sqam/create8D/detail/${
          record.problemHeaderId || record.associateProblemHeaderId
        }`,
      })
    );
  }

  /**
   * 删除
   * 支持单条/批量删除
   */
  @Bind()
  handleDelete8D() {
    const { dispatch, tenantId } = this.props;
    const { selectedRows } = this.state;
    Modal.confirm({
      iconType: '',
      content: intl
        .get('sqam.common.view.message.confirm.deleteRectificationForever')
        .d('是否永久删除整改报告'),
      onOk: () => {
        dispatch({
          type: 'create8D/delete8D',
          payload: {
            tenantId,
            data: [...selectedRows],
          },
        }).then((res) => {
          if (res) {
            notification.success();
            this.handleSearch();
            this.setState({ selectedRowKeys: [], selectedRows: [] });
            dispatch({
              type: 'create8D/updateState',
              payload: { selectedRows: [] },
            });
          }
        });
      },
    });
  }

  /**
   * 数据行选择操作
   */
  @Bind()
  handleSelectRow(selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, selectedRows });
    this.props.dispatch({
      type: 'create8D/updateState',
      payload: { selectedRows },
    });
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue() {
    const filterForm = this.form;
    const filterValues = isUndefined(filterForm)
      ? {}
      : filterNullValueObject(filterForm.getFieldsValue());
    return filterValues;
  }

  @Bind()
  showModal(problemHeaderId) {
    this.setState({ visible: true, problemHeaderId });
  }

  @Bind()
  hideModal() {
    this.setState({ visible: false });
  }

  // 查询关联8D列表
  @Bind()
  fetchCorrelation() {
    const { problemHeaderId } = this.state;
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'create8D/relation8D',
      payload: {
        tenantId,
        problemHeaderId,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          associationList: isArray(res) ? res : res?.content,
        });
      }
    });
  }

  // 引用检验单创建
  @Bind()
  handleQuoteIncoming(affairFlag) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sqam/create8D/quoteIncomingInspection`,
        search: affairFlag && stringify({ affairFlag }),
      })
    );
  }

  @Bind()
  headerBtns() {
    const { selectedRowKeys } = this.state;
    const { loading } = this.props;
    const isLoading = loading?.fetch || loading?.release || loading?.delete || loading?.loadingAssociation;
    const allBtns = [
      {
        name: 'create',
        child: intl.get('hzero.common.button.create').d('新建'),
        btnProps: {
          type: 'primary',
          icon: 'plus',
          onClick: throttle(() => this.handleCreate8D(), 1500, { trailing: false }),
          loading: isLoading,
        },
      },
      {
        name: 'createIncoming',
        btnComp: PermissionButton,
        child: intl.get('sqam.common.view.message.createIncomingInspection').d('引用检验单'),
        btnProps: {
          type: 'primary',
          icon: 'plus',
          onClick: throttle(() => this.handleQuoteIncoming(), 1500, { trailing: false }),
          permissionList: [
            {
              code: `srm.sqam.business.problem.manage.create.button.createincominginspection`,
              type: 'button',
            },
          ],
          loading: isLoading,
        },
      },
      {
        name: 'createAffair',
        btnComp: PermissionButton,
        child: intl.get('sqam.common.view.message.incomingcreateffair').d('引用质检事务'),
        btnProps: {
          type: 'primary',
          icon: 'plus',
          onClick: throttle(() => this.handleQuoteIncoming(1), 1500, { trailing: false }),
          permissionList: [
            {
              code: `srm.sqam.business.problem.manage.create.button.createincomingaffair`,
                type: 'button',
            },
          ],
          loading: isLoading,
        },
      },
      {
        name: 'delete',
        btnComp: PermissionButton,
        child: intl.get('sqam.common.button.deleteForever').d('永久删除'),
        btnProps: {
          icon: 'delete',
          onClick: throttle(() => this.handleDelete8D(), 1500, { trailing: false }),
          disabled: isEmpty(selectedRowKeys),
          permissionList: [
            {
              code: `srm.sqam.business.problem.manage.create.ps.radio.button.permanent_delete`,
              type: 'button',
            },
          ],
          loading: isLoading,
        },
      },
    ];
    return allBtns;
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      loading,
      tenantId,
      dispatch,
      create8D: {
        list = [],
        pagination = {},
        issueType = [],
        significance = [],
        urgency = [],
        rectifyTypeCode = [],
      },
      form,
      loadingAssociation = false,
      customizeFilterForm,
      customizeBtnGroup,
    } = this.props;
    const { selectedRowKeys = [], visible, associationList } = this.state;
    const filterProps = {
      issueType,
      significance,
      urgency,
      rectifyTypeCode,
      tenantId,
      form,
      onRef: this.handleBindRef,
      onSearch: this.handleSearch,
      customizeFilterForm,
    };
    const listProps = {
      pagination,
      showModal: this.showModal,
      selectedRowKeys,
      loading: loading.fetch,
      dataSource: list,
      onChange: this.handleSearch,
      onDetail: this.handleEdit8D,
      onSelectRow: this.handleSelectRow,
    };
    const modalProps = {
      dispatch,
      visible,
      onCancel: this.hideModal,
      associationList,
      loadingAssociation,
      fetchAssociation: this.fetchCorrelation,
    };

    return (
      <React.Fragment>
        <Header
          title={intl
            .get('sqam.common.view.message.title.qualityRectification.create')
            .d('质量整改报告创建')}
        >
          {customizeBtnGroup(
            { code: 'SQAM.CREATE_8D_LIST.BTNS', pro: true },
            <DynamicButtons buttons={this.headerBtns()} />
          )}
        </Header>
        <Content>
          <FilterForm {...filterProps} />
          <ListTable {...listProps} />
        </Content>
        {visible && <AssociationModal {...modalProps} />}
      </React.Fragment>
    );
  }
}

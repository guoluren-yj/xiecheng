/**
 * paymentType - 付款方式定义
 * @date: 2018-8-4
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Table, Badge } from 'hzero-ui';
import { isUndefined, isEmpty } from 'lodash';
import { Bind, debounce } from 'lodash-decorators';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { enableRender } from 'utils/renderer';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { Button as PermissionButton } from 'components/Permission';

import FilterForm from './FilterForm';
import PaymentForm from './PaymentForm';

/**
 * 付款方式定义
 * @extends {Component} - PureComponent
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} paymentType - 数据源
 * @reactProps {boolean} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {String} organizationId - 租户Id
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@withCustomize({
  unitCode: ['SMDM.PAYMENT_TYPE.LIST', 'SMDM.PAYMENT_TYPE.FORM_EDIT', 'SMDM.PAYMENT_TYPE.SEARCH'],
})
@connect(({ paymentType, loading }) => ({
  paymentType,
  loading: loading.effects['paymentType/fetchPaymentType'],
  saving: loading.effects['paymentType/action'],
  querySingleLoaing: loading.effects['paymentType/fetchSingleType'],
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({ code: 'smdm.paymentType' })
export default class PaymentType extends PureComponent {
  state = {
    modalVisible: false,
  };

  componentDidMount() {
    this.handleFetchLov();
    this.handleSearchPaymentType();
  }

  @Bind()
  handleFetchLov() {
    const { dispatch } = this.props;
    dispatch({
      type: 'paymentType/fetchLov',
    });
  }

  /**
   * 按条件查询
   * @param {object} [payload= {}] - 查询参数
   */
  @Bind()
  handleSearchPaymentType(payload = {}) {
    const { dispatch } = this.props;
    const { form } = this.state;
    const filterValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    dispatch({
      type: 'paymentType/fetchPaymentType',
      payload: {
        page: isEmpty(payload) ? {} : payload,
        customizeUnitCode: 'SMDM.PAYMENT_TYPE.LIST,SMDM.PAYMENT_TYPE.SEARCH',
        ...filterValues,
      },
    });
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.setState({ form: ref.props.form });
  }

  /**
   *
   * @param {object} record - 付款方式行对象
   */
  @Bind()
  showEditModal(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'paymentType/fetchSingleType',
      payload: {
        typeId: record?.typeId,
        customizeUnitCode: 'SMDM.PAYMENT_TYPE.FORM_EDIT',
      },
    }).then((res) => {
      if (res) {
        this.setState({ paymentSrouce: res, modalVisible: true }, () => { });
      }
    });
  }

  /**
   * 渲染是否
   * @param {Boolean} v
   */
  @Bind()
  yesOrNoRender(v) {
    const statusMap = ['default', 'success'];
    return (
      <Badge
        status={statusMap[v]}
        text={v === 1 ? intl.get('hzero.common.status.yes') : intl.get('hzero.common.status.no')}
      />
    );
  }

  /**
   * 添加支付方式
   */
  @Bind()
  showAddModal() {
    this.setState({
      paymentSrouce: { enabledFlag: 1, elBankFlag: 1 },
      modalVisible: true,
    });
  }

  /**
   * 隐藏支付方式数据编辑滑窗
   */
  @Bind()
  hideModal() {
    const { saving = false } = this.props;
    if (!saving) {
      this.setState({ modalVisible: false });
    }
  }

  /**
   *新增或者编辑
   *
   * @param {*} fieldsValue 表单数据
   * @memberof PaymentType
   */
  @Bind()
  @debounce(500)
  handleAdd(fieldsValue) {
    const {
      dispatch,
      organizationId,
      paymentType: { pagination = {} },
    } = this.props;
    const { paymentSrouce = {} } = this.state;
    if (paymentSrouce.typeId) {
      dispatch({
        type: 'paymentType/action',
        payload: {
          typeId: paymentSrouce.typeId,
          objectVersionNumber: paymentSrouce.objectVersionNumber,
          ...fieldsValue,
          customizeUnitCode: 'SMDM.PAYMENT_TYPE.FORM_EDIT',
          tenantId: paymentSrouce.tenantId,
        },
      }).then((res) => {
        if (res) {
          this.hideModal();
          this.handleSearchPaymentType(pagination);
          notification.success();
        }
      });
    } else {
      dispatch({
        type: 'paymentType/action',
        payload: {
          ...fieldsValue,
          customizeUnitCode: 'SMDM.PAYMENT_TYPE.FORM_EDIT',
          tenantId: organizationId,
        },
      }).then((res) => {
        if (res) {
          this.hideModal();
          this.handleSearchPaymentType(pagination);
          notification.success();
        }
      });
    }
  }

  render() {
    const {
      paymentType: { paymentData = {}, pagination = {}, paymentFormList = [] },
      loading,
      saving,
      querySingleLoaing,
      customizeTable,
      customizeForm,
      customizeFilterForm,
    } = this.props;
    const { content = [] } = paymentData;
    const { paymentSrouce = {}, modalVisible = false } = this.state;
    const filterProps = {
      customizeFilterForm,
      onSearch: this.handleSearchPaymentType,
      onRef: this.handleBindRef,
    };
    const columns = [
      {
        title: intl.get(`smdm.paymentType.model.paymentType.paymentCode`).d('付款方式代码'),
        width: 200,
        dataIndex: 'typeCode',
      },
      {
        title: intl.get(`smdm.paymentType.model.paymentType.paymentName`).d('付款方式名称'),
        dataIndex: 'typeName',
      },
      {
        title: intl.get('smdm.paymentType.model.paymentType.paymentForm').d('付款形式'),
        dataIndex: 'paymentFormMeaning',
        width: 150,
      },
      {
        title: intl.get(`smdm.paymentType.model.paymentType.ebankAccountFlag`).d('电子银行账号'),
        width: 150,
        // align: 'center',
        dataIndex: 'elBankFlag',
        render: (text) => {
          if (text === 1) {
            return (
              <Badge
                status="success"
                text={intl.get(`smdm.paymentType.view.message.tab.use`).d('使用')}
              />
            );
          } else {
            return (
              <Badge
                status="error"
                text={intl.get(`smdm.paymentType.view.message.tab.unused`).d('未用')}
              />
            );
          }
        },
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 100,
        // align: 'center',
        dataIndex: 'enabledFlag',
        render: (val) => ['0', 0, '1', 1].includes(val) ? enableRender(Number(val)) : val,
      },
      {
        title: intl.get('smdm.paymentType.view.message.tab.defaultFlag').d('是否默认'),
        dataIndex: 'defaultFlag',
        width: 100,
        render: this.yesOrNoRender,
      },

      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 100,
        // align: 'center',
        dataIndex: 'option',
        render: (_, record) => {
          return (
            <PermissionButton
              onClick={() => this.showEditModal(record)}
              loading={querySingleLoaing}
              funcType="link"
              type="c7n-pro"
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </PermissionButton>
          );
        },
      },
    ];
    return (
      <React.Fragment>
        <Header title={intl.get(`smdm.paymentType.view.message.title`).d('付款方式定义')}>
          <Button icon="plus" type="primary" onClick={this.showAddModal}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          {customizeTable(
            {
              code: 'SMDM.PAYMENT_TYPE.LIST',
            },
            <Table
              bordered
              rowKey="typeId"
              loading={loading}
              dataSource={content}
              columns={columns}
              pagination={pagination}
              onChange={this.handleSearchPaymentType}
            />
          )}
        </Content>
        {modalVisible && (
          <PaymentForm
            destroyOnClose
            sideBar
            title={
              paymentSrouce.typeId
                ? intl.get(`smdm.paymentType.view.message.title.madal.edit`).d('编辑付款方式')
                : intl.get(`smdm.paymentType.view.message.title.madal.create`).d('新建付款方式')
            }
            customizeForm={customizeForm}
            data={paymentSrouce}
            handleAdd={this.handleAdd}
            confirmLoading={saving}
            modalVisible={modalVisible}
            hideModal={this.hideModal}
            paymentFormList={paymentFormList}
          />
        )}
      </React.Fragment>
    );
  }
}

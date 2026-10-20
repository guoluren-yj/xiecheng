/**
 * PaymentTerms - 付款条款定义
 * @date: 2018-7-11
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { Form, Input, Button, Table, Badge } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import qs from 'querystring';
import CommonImport from 'components/Import';

import { Button as PermissionButton } from 'components/Permission';

import intl from 'utils/intl';
import withRemote from 'utils/remote';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import { enableRender } from 'utils/renderer';
import notification from 'utils/notification';
import cacheComponent from 'components/CacheComponent';
import { getCurrentOrganizationId } from 'utils/utils';
import { openTab } from 'utils/menuTab';
import DynamicButtons from '_components/DynamicButtons';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import TermsForm from './TermsForm';
import styles from './index.less';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

@withCustomize({
  unitCode: [
    'SMDM.PAYMENT-TERMS.DETAIL_LIST',
    'SMDM.PAYMENT-TERMS.LIST',
    'SMDM.PAYMENT-TERMS.DETAIL',
    'SMDM.PAYMENT-TERMS.HEAD_BTNS',
  ],
})
@withRemote({
  code: 'SMDM.PAYMENT_TERMS_CUX',
  name: 'remote',
})
@connect(({ paymentTerms, loading }) => ({
  paymentTerms,
  addLoading: loading.effects['paymentTerms/addTerms'],
  fetchLoading: loading.effects['paymentTerms/fetchTermList'],
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: ['smdm.common', 'smdm.paymentTerms', 'smdm.payTermsCtrl', 'entity.company'],
})
@withRouter
@cacheComponent({ cacheKey: '/smdm/payment-terms' })
/**
 * 付款条款定义
 * @extends {Component} - React.Component
 * @reactProps {Object} paymentTerms - 数据源
 * @reactProps {Object} fetchLoading - 数据删除是否完成
 * @reactProps {Object} addLoading - 数据添加是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
export default class PeymentTerms extends PureComponent {
  /**
   * 内部状态
   */
  state = {
    modalVisible: false, // 弹框是否弹出
    editRowData: {},
    readOnlyFlag: false,
  };

  /**
   * 控制modal弹出层显示隐藏
   * @param {boolean} flag 显示隐藏标记
   * @param {Object} record 行记录
   * @param {Object} readOnlyFlag 是否只读
   */
  @Bind()
  showEditModal(flag, record, readOnlyFlag) {
    const { dispatch } = this.props;
    this.setState({
      modalVisible: !!flag,
      editRowData: record || {},
      readOnlyFlag,
    });
    dispatch({
      type: 'paymentTerms/updateState',
      payload: {
        allData: {},
        termData: [], // 明细列表
      },
    });
    if (!flag) {
      this.setState({
        editRowData: {},
      });
      this.refreshValue();
    }
    if (record) {
      dispatch({
        type: 'paymentTerms/fetchAllData',
        payload: {
          termId: record.termId,
          page: {},
          customizeUnitCode: 'SMDM.PAYMENT-TERMS.DETAIL,SMDM.PAYMENT-TERMS.DETAIL_LIST',
        },
      });
    }
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
   * 新增付款条款
   * @param {Object} fieldsValue 传递的filedvalue
   */
  @Bind()
  handleAdd(datalist, form) {
    const { dispatch } = this.props;
    dispatch({
      type: 'paymentTerms/addTerms',
      payload: {
        ...datalist,
        customizeUnitCode: 'SMDM.PAYMENT-TERMS.DETAIL_LIST,SMDM.PAYMENT-TERMS.DETAIL',
      },
    }).then((response) => {
      if (response) {
        notification.success();
        form.resetFields();
        this.showEditModal(false);
      }
    });
  }

  /**
   * 刷新
   */
  @Bind()
  refreshValue() {
    const {
      dispatch,
      paymentTerms: { data = {} },
    } = this.props;
    this.fetchTermsList({
      page: data.pagination,
    });
    this.setState({
      editRowData: {},
    });
    dispatch({
      type: 'paymentTerms/clear',
      payload: {},
    });
  }

  /**
   * 查询付款条款数据
   * @param {Object} pageData 查询条件
   */
  @Bind()
  fetchTermsList(pageData) {
    const { form, dispatch } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        dispatch({
          type: 'paymentTerms/fetchTermList',
          payload: {
            ...fieldsValue,
            ...pageData,
            customizeUnitCode: 'SMDM.PAYMENT-TERMS.LIST',
          },
        });
      }
    });
  }

  /**
   * 查询按钮点击事件
   */
  @Bind()
  fetchTerms() {
    this.fetchTermsList();
  }

  /**
   * 组件挂载后执行方法
   */
  componentDidMount() {
    const { remote, dispatch } = this.props;
    const tenantId = getCurrentOrganizationId();
    this.fetchTermsList();
    if (remote && remote.event) {
      remote.event.fireEvent('onComponentDidMount', {
        setState: this.setState.bind(this),
      });
    }
    dispatch({
      type: 'paymentTerms/setTenantId',
      payload: tenantId,
    });
  }

  /**
   * 分页change事件
   * @param {Object} pagination 分页信息
   */
  @Bind()
  handleStandardTableChange(pagination) {
    this.fetchTermsList({
      page: pagination,
    });
  }

  /**
   * 重置表单
   */
  handleFormReset = () => {
    const { form } = this.props;
    form.resetFields();
  };

  /**
   * 渲染查询表单
   * @returns
   */
  renderForm() {
    const { form, remote } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form layout="inline">
        <FormItem label={intl.get('smdm.paymentTerms.model.paymentTerms.termCode').d('条款代码')}>
          {getFieldDecorator('termCode')(<Input inputChinese={false} />)}
        </FormItem>
        <FormItem label={intl.get('smdm.paymentTerms.model.paymentTerms.termName').d('条款名称')}>
          {getFieldDecorator('termName')(<Input />)}
        </FormItem>
        {remote
          ? remote.process('SMDM.PAYMENT_TERMS_CUX.FILTER_EXTRA_ITEMS', [], {
              form,
              state: this.state,
            })
          : []}
        <FormItem>
          <Button onClick={this.handleFormReset}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
          <Button
            type="primary"
            style={{ marginLeft: 8 }}
            onClick={() => this.fetchTerms()}
            htmlType="submit"
          >
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
        </FormItem>
      </Form>
    );
  }

  handleImport(code) {
    const retitle = intl
      .get('smdm.paymentTerms.model.paymentTerms.paymentTermsImport')
      .d('付款条款导入');
    openTab({
      key: `/smdm/payment-terms/import/${code}`,
      title: retitle,
      search: qs.stringify({
        key: `/smdm/payment-terms/import/${code}`,
        action: retitle,
      }),
    });
  }

  @Bind()
  headerTitle() {
    const { onSwitchPage } = this.props;
    return (
      <Fragment>
        <span>{intl.get('smdm.payTermsCtrl.view.title.payTermsUpdate').d('付款条款维护')}</span>
        <PermissionButton
          size="small"
          type="c7n-pro"
          icon="swap_horiz"
          onClick={onSwitchPage}
          style={{ marginLeft: 12 }}
          permissionList={[
            {
              code: `srm.fin.payment-terms.button.page-exchange`,
              type: 'button',
            },
          ]}
        >
          {intl.get('smdm.payTermsCtrl.view.title.payTermsUpdateAndCtrl').d('付款条款维护与管控')}
        </PermissionButton>
      </Fragment>
    );
  }

  @Bind()
  getHeaderBtns() {
    const { remote } = this.props;
    const normalBtns = [
      {
        name: 'create',
        child: intl.get('hzero.common.button.create').d('新建'),
        btnProps: {
          icon: 'plus',
          type: 'primary',
          onClick: () => this.showEditModal(true),
        },
      },
      {
        name: 'importNew',
        btnComp: CommonImport,
        childFor: 'buttonText',
        child: intl
          .get('smdm.paymentTerms.model.paymentTerms.paymentTermsImport.new')
          .d('付款条款导入-新'),
        btnProps: {
          prefixPatch: '/smdm',
          businessObjectTemplateCode: 'SMDM.PAYMENT_TERM',
          buttonProps: {
            permissionList: [
              {
                code: `srm.fin.payment-terms.ps.new.payment-term.import`,
                type: 'button',
                meaning: '付款条款导入-新',
              },
            ],
          },
        },
      },
      {
        name: 'import',
        btnType: 'c7n-pro',
        child: intl
          .get('smdm.paymentTerms.model.paymentTerms.paymentTermsImport')
          .d('付款条款导入'),
        btnProps: {
          icon: 'archive',
          onClick: () => this.handleImport('SMDM.PAYMENT_TERM'),
        },
        permissionList: [
          {
            code: `srm.fin.payment-terms.ps.payment-term.import`,
            type: 'button',
            meaning: '付款条款导入',
          },
        ],
      },
    ];
    const otherProps = {
      onQueryList: () => this.fetchTermsList(),
    };
    const processBtns = remote
      ? remote.process('SMDM.PAYMENT_TERMS_CUX.HEAD_BTNS', normalBtns, otherProps)
      : normalBtns;
    return processBtns;
  }

  @Bind()
  getListColumns() {
    const { remote } = this.props;
    const normalColumns = [
      {
        title: intl.get('smdm.paymentTerms.model.paymentTerms.termCode').d('条款代码'),
        dataIndex: 'termCode',
        width: 100,
      },
      {
        title: intl.get('smdm.paymentTerms.model.paymentTerms.termName').d('条款名称'),
        dataIndex: 'termName',
        width: 300,
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        width: 80,
        // align: 'center',
        render: (val) => (['0', 0, '1', 1].includes(val) ? enableRender(Number(val)) : val),
      },
      {
        title: intl.get('smdm.paymentTerms.model.paymentTerms.defaultFlag').d('是否默认'),
        dataIndex: 'defaultFlag',
        width: 80,
        render: this.yesOrNoRender,
      },
      {
        title: intl.get('smdm.common.model.common.externalSystemCode').d('来源系统'),
        dataIndex: 'externalSystemCode',
        width: 80,
        // align: 'center',
      },
      {
        title: intl.get('smdm.paymentTerms.model.paymentTerms.priority').d('优先级'),
        dataIndex: 'priority',
        width: 120,
      },
      {
        title: intl.get('entity.company.name').d('公司名称'),
        dataIndex: 'companyName',
        width: 180,
      },
      {
        title: intl.get('smdm.paymentTerms.view.option.termsDetail').d('条款明细'),
        width: 80,
        // align: 'center',
        dataIndex: 'termsDetail',
        render: (_, record) => (
          <Fragment>
            {record.externalSystemCode !== 'SRM' ? (
              <a
                onClick={() => {
                  this.showEditModal(true, record, true);
                }}
              >
                {intl.get('hzero.common.button.view').d('查看')}
              </a>
            ) : (
              <a
                disabled={record.externalSystemCode !== 'SRM'}
                onClick={() => {
                  this.showEditModal(true, record);
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            )}
          </Fragment>
        ),
      },
    ];
    const otherProps = {
      onQueryList: () => this.fetchTermsList(),
    };
    const processColumns = remote
      ? remote.process('SMDM.PAYMENT_TERMS_CUX.LIST_COLUMNS', normalColumns, otherProps)
      : normalColumns;
    return processColumns;
  }

  /**
   * 渲染方法
   * @returns
   */
  render() {
    const {
      paymentTerms: { data = {} },
      addLoading,
      fetchLoading,
      customizeTable,
      customizeForm,
      customizeBtnGroup,
    } = this.props;
    const { modalVisible, editRowData, readOnlyFlag } = this.state;

    const parentMethods = {
      handleAdd: this.handleAdd,
      showEditModal: this.showEditModal,
      customizeTable,
      customizeForm,
      readOnlyFlag,
    };

    return (
      <React.Fragment>
        <Header className={styles['smdm-paymentTerms-header']} title={this.headerTitle()}>
          {customizeBtnGroup(
            { code: 'SMDM.PAYMENT-TERMS.HEAD_BTNS', pro: true },
            <DynamicButtons maxNum={4} buttons={this.getHeaderBtns()} />
          )}
        </Header>
        <Content>
          <div className="table-list-search">{this.renderForm()}</div>
          {customizeTable(
            {
              code: 'SMDM.PAYMENT-TERMS.LIST',
            },
            <Table
              loading={fetchLoading}
              rowKey="termId"
              dataSource={data.list}
              columns={this.getListColumns()}
              bordered
              pagination={data.pagination}
              onChange={this.handleStandardTableChange}
            />
          )}
          <TermsForm
            {...parentMethods}
            modalVisible={modalVisible}
            editRowData={editRowData}
            modalLoading={addLoading}
          />
        </Content>
      </React.Fragment>
    );
  }
}

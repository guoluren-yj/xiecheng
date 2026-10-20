import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Modal, Form, Row, Col, Input, Drawer } from 'hzero-ui';
import notification from 'utils/notification';
import uuid from 'uuid/v4';
import { isEmpty, omit, isArray } from 'lodash';
import CommonImport from 'components/Import';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import Lov from 'components/Lov';
import { connect } from 'dva';
import {
  getCurrentOrganizationId,
  createPagination,
  tableScrollWidth,
  getEditTableData,
  addItemToPagination,
} from 'utils/utils';
import { TagRender } from 'utils/renderer';
import AuthorizationSealModal from './AuthorizationSealModal';
import './index.less';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const organizationId = getCurrentOrganizationId();
@withCustomize({
  unitCode: ['SPFM.SEAL.MANAGEMENT.SEAL.AUTHORIZATION.BTN_GROUP'],
})
@Form.create({ fieldNameProp: null })
@connect(({ loading = {}, sealMange = {} }) => ({
  loading: loading.effects['sealMange/queryAuthorizeList'],
  saving: loading.effects['sealMange/saveAuthSign'],
  delelteLoading: loading.effects['sealMange/deleteLine'],
  sealMange,
}))
export default class MinimumOrderAmountSupplierModal extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
    this.state = {
      selectedRowKeys: [], // 选中数据的索引
      dataSource: [],
      pagination: {},
    };
  }

  getSnapshotBeforeUpdate(preProps) {
    const { visible } = preProps;
    if (!visible && visible !== this.props.visible) {
      return true;
    }
    return false;
  }

  componentDidUpdate(props, state, snap) {
    if (snap) {
      this.fetchList();
    }
  }

  @Bind()
  fetchList(page = {}) {
    const { authType, dispatch, companyId, form } = this.props;
    const { dataSource } = this.state;
    const filterValues = form.getFieldsValue();
    const pageOld = { ...page };
    if (dataSource.some((item) => item._status === 'create')) {
      pageOld.pageSize = 10;
    }
    dispatch({
      type: 'sealMange/queryAuthorizeList',
      payload: { impowerType: authType, companyId, page: pageOld, ...filterValues },
    }).then((res) => {
      if (res && res.content) {
        this.setState({
          dataSource: res.content.map((ele, index) => ({
            ...ele,
            dispalyNum: index + 1,
            _status: 'update',
          })),
          pagination: createPagination(res),
        });
      }
    });
  }

  @Bind()
  handleSave() {
    const { dispatch } = this.props;
    const { dataSource } = this.state;
    const companyUserImpowers = getEditTableData(dataSource, ['_status', 'impowerId']);
    if (Array.isArray(companyUserImpowers) && companyUserImpowers.length === 0) {
      return;
    }
    if (!companyUserImpowers.every((e) => e.userAuthStatus === 'success')) {
      notification.error({
        message: intl
          .get('spfm.sealmanage.model.status.notSuccess')
          .d('子账户必须经过实名认证才能授权'),
      });
      return;
    }
    dispatch({
      type: 'sealMange/saveAuthSign',
      payload: { companyUserImpowers },
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchList();
      }
    });
  }

  @Bind()
  reset() {
    this.props.form.resetFields();
  }

  /**
   * 新建
   * @param {Number} shieldSupId
   */
  @Bind()
  handleCreate() {
    const { dataSource, pagination } = this.state;
    const { companyId, certificateResId } = this.props;
    const newLine = {
      _status: 'create',
      impowerId: uuid(),
      companyId,
      certificateResId,
    };
    this.setState({
      dataSource: [newLine, ...dataSource],
      pagination: addItemToPagination(dataSource.length, pagination),
    });
  }

  @Bind()
  addUser(val, lovRecord, record) {
    if (val) {
      const { dispatch, authType } = this.props;
      dispatch({
        type: 'sealMange/queryAuthorizeDetail',
        payload: { impowerType: authType, userId: val, authType },
      }).then((res) => {
        if (res) {
          const { dataSource } = this.state;
          const { bankPhoneNum, userAuthStatus, authName, serviceId } = res;
          const newDataSource = dataSource.map((ele) => {
            return ele.impowerId === record.impowerId
              ? {
                  ...ele,
                  bankPhoneNum,
                  userAuthStatus,
                  serviceId,
                  authName: authName || lovRecord.realName,
                  impowerType: authType,
                }
              : { ...ele };
          });
          this.setState({ dataSource: newDataSource });
        }
      });
    }
  }

  /**
   * 清除新建的行
   * @param {object} record
   */
  @Bind()
  handleDelete() {
    const { dispatch } = this.props;
    const { dataSource, selectedRowKeys } = this.state;
    const newDataSource = [];
    const deleteList = [];
    Modal.confirm({
      title: intl.get(`spfm.common.view.message.deleteLines`).d('是否删除'),
      onOk: () => {
        dataSource.forEach((item) => {
          if (!selectedRowKeys.includes(item.impowerId)) {
            newDataSource.push(item);
          } else if (item._status !== 'create') {
            deleteList.push(omit(item, ['$form']));
          }
        });
        if (!isEmpty(deleteList)) {
          dispatch({
            type: 'sealMange/deleteLine',
            payload: { companyUserImpowers: deleteList },
          }).then((res) => {
            if (res) {
              notification.success();
              this.setState({ selectedRowKeys: [] });
              this.fetchList();
            }
          });
        } else {
          this.setState({
            dataSource: newDataSource,
          });
          this.setState({ selectedRowKeys: [] });
        }
      },
    });
  }

  @Bind()
  getColumns() {
    const { remote, authType, companyId } = this.props;

    // 二开埋点
    const isShow = remote
      ? remote.process(
          'SPFM_ELECTRONIC_SIGNATURE_SEALMANAGE_REMOTE_AUTHORIZED_MODAL_COLUMNS',
          columns,
          {
            refreshList: this.fetchList,
          }
        )
      : false;

    let columns = [
      {
        title: intl.get('spfm.sealmanage.model.displayNum').d('序号'),
        dataIndex: 'dispalyNum',
        key: 'dispalyNum',
      },
      {
        title: intl.get('spfm.sealmanage.model.loginName').d('子账号'),
        dataIndex: 'userId',
        key: 'userId',
        width: 200,
        render: (_, record) =>
          ['create'].includes(record._status)
            ? record.$form.getFieldDecorator('userId', {
                initialValue: record.userId,
              })(
                <Lov
                  code="SPFM.CUST_SERVICE_ACCOUNT"
                  queryParams={{ tenantId: organizationId }}
                  onChange={(val, lovRecord) => this.addUser(val, lovRecord, record)}
                  textField="loginName"
                />
              )
            : record.loginName,
      },
      {
        title: intl.get('spfm.sealmanage.model.authorization.realName').d('实名认证姓名'),
        dataIndex: 'authName',
        key: 'authName',
      },
      {
        title: intl.get('spfm.sealmanage.model.authorization').d('实名认证状态'),
        dataIndex: 'userAuthStatus',
        render: (status = 'undefined') => {
          const statusList = [
            {
              status: 'failed',
              color: 'red',
              text: intl.get('spfm.sealmanage.model.authorizationFailed').d('认证失败'),
            },
            {
              status: 'success',
              color: 'green',
              text: intl.get('spfm.sealmanage.model.authorizationSuccess').d('认证成功'),
            },
            {
              status: 'undefined',
              color: 'red',
              text: intl.get('spfm.sealmanage.model.noAuthorization').d('未认证'),
            },
          ];
          return TagRender(status, statusList);
        },
      },
      {
        title: intl.get('spfm.sealmanage.model.bankPhoneNum').d('预留手机号'),
        dataIndex: 'bankPhoneNum',
        key: 'bankPhoneNum',
        width: 200,
      },
      authType === 'FDD' && {
        title: intl.get('spfm.sealmanage.model.authorizationSeal').d('授权印章'),
        dataIndex: 'userSealAuthorizes',
        key: 'userSealAuthorizes',
        width: 200,
        render: (_, record) =>
          ['update'].includes(record._status) ? (
            record.$form.getFieldDecorator('userSealAuthorizes', {
              initialValue: record.userSealAuthorizes,
            })(
              <AuthorizationSealModal
                custOnChange={() => {}}
                authType={authType}
                companyId={companyId}
                record={record}
              />
            )
          ) : (
            <span>{intl.get('spfm.sealmanage.model.authorizationSeal').d('授权印章')}</span>
          ),
      },
      isShow &&
        authType === 'ESIGN' && {
          title: intl.get('spfm.sealmanage.model.authorizationSeal').d('授权印章'),
          dataIndex: 'userSealAuthorizes2',
          key: 'userSealAuthorizes2',
          width: 200,
          render: (_, record) =>
            ['update'].includes(record._status) ? (
              record.$form.getFieldDecorator('userSealAuthorizes2', {
                initialValue: record.userSealAuthorizes2,
              })(
                <AuthorizationSealModal
                  custOnChange={() => {}}
                  authType={authType}
                  companyId={companyId}
                  record={record}
                  isShowField={isShow}
                />
              )
            ) : (
              <span>{intl.get('spfm.sealmanage.model.authorizationSeal').d('授权印章')}</span>
            ),
        },
    ].filter(Boolean);

    return columns;
  };

  render() {
      const {
      visible,
      loading,
      saving,
      delelteLoading,
      onCancel,
      companyId,
      authType,
      form: { getFieldDecorator },
    } = this.props;
    const { selectedRowKeys, dataSource = [], pagination = {}} = this.state;

    const columns = this.getColumns();

    // // ‘授权印章’只有法大大显示
    // if (this.props.authType === 'ESIGN') {
    //   columns = columns.filter((item) => {
    //     const arr = ['userSealAuthorizes'];
    //     return !arr.includes(item.dataIndex);
    //   });
    // }
    return (
      <Drawer
        zIndex="1"
        title={intl.get('spfm.sealmanage.view.title.sealAuthManage').d('印章授权管理')}
        width={1000}
        visible={visible}
        footer={null}
        onClose={() => {
          this.setState({ selectedRowKeys: [] }, onCancel);
        }}
      >
        <Form layout="inline" className="more-fields-form">
          <Row gutter={12}>
            <Col span={6}>
              <FormItem
                label={intl.get('spfm.sealmanage.model.loginName').d('子账号')}
                {...formLayout}
              >
                {getFieldDecorator('userId')(
                  <Lov
                    code="SPFM.CUST_SERVICE_ACCOUNT"
                    queryParams={{ tenantId: organizationId }}
                    textField="loginName"
                  />
                )}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                label={intl.get('spfm.sealmanage.model.authorization.realName').d('实名认证姓名')}
                {...formLayout}
              >
                {getFieldDecorator('authName')(<Input />)}
              </FormItem>
            </Col>
            <Col span={6} className="search-btn-more">
              <FormItem>
                <Button onClick={this.reset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  color="primary"
                  htmlType="submit"
                  onClick={() => {
                    this.fetchList();
                  }}
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </FormItem>
            </Col>
          </Row>
        </Form>
        <div className="header" style={{ textAlign: 'right' }}>
          <>
            {this.props.authType === 'ESIGN' ? (
              <CommonImport
                data-name="import"
                businessObjectTemplateCode="SPFM_COMPANY_USER_IMPOWER_IMP"
                prefixPatch="/spfm"
                buttonText={intl.get('hzero.common.button.import').d('导入')}
                buttonProps={{
                  icon: 'archive',
                  type: 'c7n-pro',
                  style: { marginRight: '8px' },
                }}
                args={{ companyId, impowerType: authType }}
              />
            ) : null}
          </>
          <Button
            data-name="delete"
            onClick={this.handleDelete}
            loading={delelteLoading}
            disabled={isArray(selectedRowKeys) && isEmpty(selectedRowKeys)}
            style={{ marginRight: '8px' }}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
          <Button
            data-name="save"
            onClick={this.handleSave}
            loading={saving || loading}
            style={{ marginRight: '8px' }}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button color="primary" data-name="add" onClick={this.handleCreate}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </div>

        <div style={{ marginTop: '10px' }}>
          <EditTable
            bordered
            rowKey="impowerId"
            columns={columns}
            loading={loading}
            dataSource={dataSource}
            onChange={this.fetchList}
            pagination={pagination}
            scroll={{ x: tableScrollWidth(columns) }}
            rowSelection={{
              selectedRowKeys,
              onChange: (keys) => {
                this.setState({ selectedRowKeys: keys });
              },
            }}
          />
        </div>
      </Drawer>
    );
  }
}

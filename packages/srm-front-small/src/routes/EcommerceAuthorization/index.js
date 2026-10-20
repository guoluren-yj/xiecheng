/**
 * EcommerceAuthorization -电商授权
 * @date: 2019-12-03
 * @author lx <xia.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isEmpty, isUndefined } from 'lodash';
import { Button, Form } from 'hzero-ui';

import intl from 'utils/intl';
import { filterNullValueObject, getEditTableData } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';

import notification from 'utils/notification';

import FilterForm from './FilterForm';
import TableList from './TableList';
import EditInfo from './EditInfoForm';
import EditPwdForm from './EditPwdForm';

@connect(({ ecommerceAuthorization, loading }) => ({
  ecommerceAuthorization,
  loading: loading.effects['ecommerceAuthorization/fetchAuthorizateList'],
  editPwdLoading: loading.effects['ecommerceAuthorization/fetchNewPwd'],
  saveLoading: loading.effects['ecommerceAuthorization/fetchHandleOk'],
  whiteLoading: loading.effects['ecommerceAuthorization/fetchWhiteList'],
  blackLoading: loading.effects['ecommerceAuthorization/fetchBlackList'],
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['small.ecommerceAuthorization', 'small.common'] })
export default class EcommerceAuthorization extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // rowKey: 'id',
      visible: false, // 新建/编辑
      record: {},
      pwdVisible: false,
      pwdRecord: {},
      type: '',
      accountId: undefined,
    };
  }

  componentDidMount() {
    this.queryAuthorizateList();
  }

  form;

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  handleOpenModal(record, type) {
    const { dispatch } = this.props;
    this.setState(
      {
        accountId: record.id,
        type,
      },
      () => {
        if (type === 'white') {
          dispatch({
            type: 'ecommerceAuthorization/fetchWhiteList',
            payload: { accountId: this.state.accountId },
          });
        }
        if (type === 'black') {
          dispatch({
            type: 'ecommerceAuthorization/fetchBlackList',
            payload: { accountId: this.state.accountId },
          });
        }
        this.props.history.push(
          `/small/ecommerce-authorization/detail/${this.state.accountId}/${type}`
        );
      }
    );
  }

  /**
   * 查询列表
   * @param {object} page  查询参数
   */
  @Bind()
  queryAuthorizateList(page = {}) {
    const { dispatch } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'ecommerceAuthorization/fetchAuthorizateList',
      payload: {
        page: isEmpty(page) ? {} : page,
        ...fieldValues,
      },
    });
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const {
      dispatch,
      ecommerceAuthorization: { whiteList, blackList },
    } = this.props;
    const { type, accountId } = this.state;
    if (type === 'white') {
      const list = getEditTableData(whiteList, ['uid']);
      if (isEmpty(list)) return;
      const params = list.map((item) => {
        return { ...item, type: 'white', accountId };
      });
      dispatch({
        type: 'ecommerceAuthorization/saveWhiteList',
        payload: params,
      }).then((res) => {
        if (res) {
          notification.success();
          dispatch({
            type: 'ecommerceAuthorization/fetchWhiteList',
            payload: { accountId },
          });
        }
      });
    } else {
      const list = getEditTableData(blackList, ['uid']);
      if (isEmpty(list)) return;
      const params = list.map((item) => {
        return { ...item, type: 'black', accountId };
      });
      dispatch({
        type: 'ecommerceAuthorization/saveBlackList',
        payload: params,
      }).then((res) => {
        if (res) {
          notification.success();
          dispatch({
            type: 'ecommerceAuthorization/fetchBlackList',
            payload: { accountId },
          });
        }
      });
    }
  }

  /**
   * 启用/停用
   */
  @Bind()
  handleEnable(record) {
    const {
      dispatch,
      ecommerceAuthorization: { pagination },
    } = this.props;
    dispatch({
      type: 'ecommerceAuthorization/fetchEnable',
      payload: { ...record },
    }).then((res) => {
      if (res) {
        notification.success();
        this.queryAuthorizateList(pagination);
      }
    });
  }

  @Bind()
  handleEditInfo(record = {}) {
    this.setState({
      visible: true,
      record,
    });
  }

  @Bind()
  handleCancel() {
    this.setState({
      visible: false,
      record: {},
    });
  }

  /**
   * 确定保存
   */
  @Bind()
  handleOk(value) {
    const {
      dispatch,
      ecommerceAuthorization: { pagination },
    } = this.props;
    dispatch({
      type: 'ecommerceAuthorization/fetchHandleOk',
      payload: filterNullValueObject(value),
    }).then((res) => {
      if (res && res.success) {
        this.handleCancel();
        notification.success();
        this.queryAuthorizateList(pagination);
      } else if (res && !res.success) {
        notification.error({ message: res.resultMsg });
      }
    });
  }

  /**
   * 修改密码确定
   */
  @Bind()
  saveNewPwd(fieldsValue) {
    const { dispatch } = this.props;
    dispatch({
      type: 'ecommerceAuthorization/fetchNewPwd',
      payload: { ...fieldsValue },
    }).then((res) => {
      if (res) {
        if (!res.success) {
          notification.error({
            message: res.resultMsg,
          });
        } else {
          notification.success();
          this.setState({
            pwdVisible: false,
          });
        }
      }
    });
  }

  /**
   * 修改密码
   */
  @Bind()
  editPassword(records) {
    this.setState({
      pwdVisible: true,
      pwdRecord: records,
    });
  }

  /**
   * 修改密码关闭弹框
   */
  @Bind()
  closePassword() {
    this.setState({
      pwdVisible: false,
    });
  }

  render() {
    const { visible, record, pwdVisible, pwdRecord } = this.state;
    const {
      loading,
      saveLoading,
      editPwdLoading,
      ecommerceAuthorization: { list, pagination },
    } = this.props;
    const formProps = {
      onRef: this.handleRef,
      queryAuthorizateList: this.queryAuthorizateList,
    };
    const tableProps = {
      list,
      pagination,
      loading,
      onEditInfo: this.handleEditInfo,
      onOpenModal: this.handleOpenModal,
      onEnable: this.handleEnable,
      onEditPassword: this.editPassword,
      queryAuthorizateList: this.queryAuthorizateList,
    };

    const editProps = {
      visible,
      record,
      saveLoading,
      onOk: this.handleOk,
      onClose: this.handleCancel,
    };

    const editPwdProps = {
      pwdRecord,
      pwdVisible,
      editPwdLoading,
      saveNewPwd: this.saveNewPwd,
      closePassword: this.closePassword,
    };

    return (
      <React.Fragment>
        <Header title={intl.get('small.ecommerceAuthorization.online.authorization').d('电商授权')}>
          <Button type="primary" onClick={() => this.handleEditInfo()} icon="plus">
            {intl.get('small.ecommerceAuthorization.view.ecommerceAuthorization.new').d('新建')}
          </Button>
        </Header>
        <Content>
          <FilterForm {...formProps} />
          <TableList {...tableProps} />
          {visible && <EditInfo {...editProps} />}
          <EditPwdForm {...editPwdProps} />
        </Content>
      </React.Fragment>
    );
  }
}

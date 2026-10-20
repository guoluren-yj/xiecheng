/**
 * FrontComputer -前置机定义页面
 * @date: 2018-9-14
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table, Button } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';

import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import { Header, Content } from 'components/Page';

import FrontComputerModal from './FrontComputerModal';
import ChangePwdForm from './ChangePwdForm';
import FilterForm from './FilterForm';

@connect(({ frontComputerDef, loading }) => ({
  frontComputerDef,
  loading: loading.effects['frontComputerDef/fetchFrontComputerList'],
}))
@formatterCollections({ code: ['sitf.frontComputerDef', 'sitf.common'] })
export default class FrontComputerDef extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      tenantId: getCurrentOrganizationId(),
      modalVisible: false,
      tableRecord: {},
      changeIp: true, // 手机号码填写框，默认显示手机
      changeUrl: true, // email选择框，默认显示邮箱
      pwdModalVisible: false,
    };
  }

  form;

  componentDidMount() {
    this.refreshData();
  }

  @Bind()
  refreshData() {
    const { dispatch } = this.props;
    const { tenantId } = this.state;
    dispatch({
      type: 'frontComputerDef/fetchFrontComputerList',
      payload: {
        tenantId,
        page: {},
      },
    });
  }

  /**
   * 查询前置机定义列表
   * @param {object} params 查询参数
   */
  @Bind()
  fetchFrontComputerList(params = {}) {
    const {
      dispatch,
      frontComputerDef: { pagination = {} },
    } = this.props;
    const { tenantId } = this.state;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'frontComputerDef/fetchFrontComputerList',
      payload: {
        tenantId,
        page: isEmpty(params) ? pagination : params,
        ...fieldValues,
      },
    });
  }

  /**
   * 新建表格
   */
  @Bind()
  handleFrontComputer() {
    this.setState({
      modalVisible: true,
      tableRecord: {},
    });
  }

  @Bind()
  handleCancel() {
    this.setState({
      modalVisible: false,
      tableRecord: {},
      changeIp: true,
      changeUrl: true,
    });
  }

  /**
   * 编辑
   * @param {object} record 行数据
   */
  @Bind()
  handleEditFrontComputer(record = {}) {
    let changeUrl = record.url ? true : false;
    let changeIp = record.ip ? true : false;
    this.setState({
      tableRecord: record,
      modalVisible: true,
      changeIp,
      changeUrl,
    });
  }

  /**
   * 编辑
   * @param {object} record 行数据
   */
  onShowChangePwdModal = record => {
    this.setState(prevState => ({
      tableRecord: record,
      pwdModalVisible: !prevState.pwdModalVisible,
    }));
  };

  /**
   * 数据保存
   * @param {object} values 需保存的数据
   */
  @Bind()
  handleSaveFrontCompter(values = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'frontComputerDef/updateFrontComputer',
      payload: {
        body: [values],
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.setState({
          modalVisible: false,
          tableRecord: {},
        });
        this.fetchFrontComputerList();
        this.setState({
          changeIp: true,
          changeUrl: true,
        });
      }
    });
  }

  onSaveNewPwd = values => {
    const { dispatch } = this.props;
    dispatch({
      type: 'frontComputerDef/updateFrontComputerPwd',
      payload: {
        body: values,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.setState({
          pwdModalVisible: false,
          tableRecord: {},
        });
        this.fetchFrontComputerList();
      }
    });
  };

  @Bind()
  changeIpOrUrl(values = {}) {
    if (values.length === 0) {
      this.setState({
        changeIp: false,
        changeUrl: false,
      });
    } else if (values.length === 1) {
      const selectValue = values[0];
      if (selectValue === 'ip') {
        this.setState({ changeIp: true, changeUrl: false });
      } else {
        this.setState({ changeIp: false, changeUrl: true });
      }
    } else if (values.length === 2) {
      this.setState({ changeIp: true, changeUrl: true });
    }
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  render() {
    const {
      frontComputerDef: { list = {}, pagination = {} },
      loading,
    } = this.props;
    const {
      tenantId,
      tableRecord,
      modalVisible,
      changeIp,
      changeUrl,
      pwdModalVisible,
    } = this.state;
    const columns = [
      {
        title: intl.get('sitf.common.frontEndSystem.code').d('前置机代码'),
        dataIndex: 'frontEndSystemCode',
        width: 150,
        align: 'left',
      },
      {
        title: intl.get('sitf.common.frontEndSystem.name').d('前置机名称'),
        dataIndex: 'frontEndSystemName',
        width: 150,
        align: 'left',
      },
      {
        title: intl.get('sitf.common.data.externalSystemName').d('外部系统名称'),
        dataIndex: 'externalSystemName',
        width: 150,
        align: 'left',
      },
      {
        title: intl.get('sitf.frontComputerDef.model.frontComputerDef.IP').d('IP'),
        dataIndex: 'ip',
        width: 120,
        align: 'left',
      },
      {
        title: intl.get('sitf.frontComputerDef.model.frontComputerDef.port').d('端口'),
        dataIndex: 'port',
        width: 80,
        align: 'left',
      },
      {
        title: intl.get('sitf.frontComputerDef.model.frontComputerDef.url').d('URL'),
        dataIndex: 'url',
        width: 150,
        align: 'left',
      },
      {
        title: intl.get('sitf.frontComputerDef.model.frontComputerDef.grantType').d('授权类型'),
        dataIndex: 'grantType',
        width: 120,
        align: 'left',
      },
      {
        title: intl.get('sitf.frontComputerDef.model.frontComputerDef.username').d('用户名'),
        dataIndex: 'username',
        width: 120,
        align: 'left',
      },
      {
        title: intl.get('sitf.frontComputerDef.model.frontComputerDef.scope').d('授权范围'),
        dataIndex: 'scope',
        width: 120,
        align: 'left',
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
        align: 'left',
      },
      {
        title: intl.get('hzero.common.table.column.option').d('操作'),
        align: 'left',
        dataIndex: 'edit',
        width: 200,
        render: (val, record) => {
          return (
            <span className="action-link">
              <a onClick={() => this.handleEditFrontComputer(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              <a onClick={() => this.onShowChangePwdModal(record)}>
                {intl.get('hzero.common.button.changePwd').d('修改密码')}
              </a>
            </span>
          );
        },
      },
    ];

    const fiterProps = {
      onFetchDate: this.fetchFrontComputerList,
      onRef: this.handleRef,
    };
    const detailProps = {
      modalVisible,
      loading,
      tenantId,
      changeIp,
      changeUrl,
      tableRecord,
      anchor: 'right',
      onHandleSaveFrontCompter: this.handleSaveFrontCompter,
      onCancel: this.handleCancel,
      onChangeIpOrUrl: this.changeIpOrUrl,
    };
    const changePwdFormOptions = {
      changePwdModalVisible: pwdModalVisible,
      saveNewPwd: this.onSaveNewPwd,
      showChangePwdModal: this.onShowChangePwdModal,
      tableRecord,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get('sitf.frontComputerDef.view.frontComputerDef.header').d('前置机应用')}
        >
          <Button type="primary" icon="plus" onClick={this.handleFrontComputer}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...fiterProps} />
          </div>
          <Table
            pagination={pagination}
            dataSource={list.content}
            rowKey="frontEndSystemsId"
            columns={columns}
            loading={loading}
            onChange={page => this.fetchFrontComputerList(page)}
            bordered
          />
        </Content>
        {modalVisible && <FrontComputerModal {...detailProps} key="all" />}
        <ChangePwdForm {...changePwdFormOptions} />
      </React.Fragment>
    );
  }
}

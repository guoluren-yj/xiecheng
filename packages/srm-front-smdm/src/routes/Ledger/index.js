/**
 * index.js - 账套定义
 * @date: 2018-10-26
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Table } from 'hzero-ui';
import { Header, Content } from 'components/Page';
import { Bind, debounce } from 'lodash-decorators';
import { getCurrentOrganizationId } from 'utils/utils';
import { enableRender } from 'utils/renderer';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import FilterForm from './FilterForm';
import CreateForm from './ListForm';

@connect(({ ledger, loading }) => ({
  ledger,
  loading: loading.effects['ledger/queryLedger'],
  saving: loading.effects['ledger/saveLedger'],
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: 'smdm.ledger',
})
export default class TableList extends Component {
  constructor(props) {
    super(props);
    this.filterForm = {}; // 列表查询表单组件对象
    this.createForm = {}; // 侧栏表单组件对象
    this.state = {
      modalVisible: false,
      editValue: {},
    };
  }

  componentDidMount() {
    const {
      ledger: { pagination = {} },
    } = this.props;

    this.handleSearch(pagination);
  }

  /**
   * 查询账套定义列表数据
   * @param {Object} pagination - 分页参数对象
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch, tenantId } = this.props;
    const values = this.filterForm.props.form.getFieldsValue();

    dispatch({
      type: 'ledger/queryLedger',
      payload: {
        tenantId,
        page,
        ...values,
      },
    });
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.filterForm = ref;
  }

  /**
   * 添加账套
   */
  @Bind()
  @debounce(500)
  handleAdd() {
    const {
      dispatch,
      tenantId,
      ledger: { pagination = {} },
    } = this.props;
    const { editValue } = this.state;

    this.createForm.props.form.validateFields((error, values) => {
      if (!error) {
        dispatch({
          type: 'ledger/saveLedger',
          payload: {
            ...editValue,
            ...values,
            tenantId,
          },
        }).then((response) => {
          if (response) {
            this.hideModal();
            notification.success();
            this.setState({
              editValue: {},
            });
            this.handleSearch(pagination);
          }
        });
      }
    });
  }

  /**
   * 显示账套编辑侧栏，设定当前编辑数据
   * @param {Object} record - 编辑的账套行数据
   */
  @Bind()
  showEditModal(record) {
    this.setState({
      editValue: record,
    });
    this.showModal();
  }

  /**
   * 显示账套编辑侧栏
   */
  @Bind()
  showModal() {
    this.handleModalVisible(true);
  }

  /**
   * 隐藏账套编辑侧栏
   */
  @Bind()
  hideModal() {
    const { saving = false } = this.props;
    if (!saving) {
      this.handleModalVisible(false);
    }
  }

  /**
   * 显示隐藏账套编辑侧栏
   * @param {Boolean} flag - 账套侧栏显示参数
   */
  handleModalVisible(flag) {
    if (!flag && this.createForm) {
      this.setState({
        editValue: {}, // 重置侧边栏窗口表单内容
      });
    }
    this.setState({
      modalVisible: !!flag,
    });
  }

  render() {
    const {
      ledger: { list = {}, pagination = {} },
      loading,
      saving,
    } = this.props;
    const { editValue } = this.state;
    const filterProps = {
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    const columns = [
      {
        title: intl.get('smdm.ledger.model.ledger.ledgerCode').d('账套编码'),
        width: 200,
        align: 'left',
        dataIndex: 'ledgerCode',
      },
      {
        title: intl.get('smdm.ledger.model.ledger.ledgerName').d('账套名称'),
        align: 'left',
        dataIndex: 'ledgerName',
      },
      {
        title: intl.get('smdm.ledger.model.ledger.periodSetId').d('会计期'),
        width: 150,
        align: 'left',
        dataIndex: 'periodSetId',
        render: (text, record) => {
          return record.periodSetName;
        },
      },
      {
        title: intl.get('smdm.ledger.model.ledger.currencyCode').d('本位币'),
        width: 100,
        align: 'right',
        dataIndex: 'currencyCode',
      },
      {
        title: intl.get('smdm.ledger.model.ledger.coaId').d('科目表'),
        align: 'left',
        dataIndex: 'coaId',
      },
      {
        title: intl.get('smdm.ledger.model.ledger.sourceCode').d('来源'),
        width: 100,
        align: 'left',
        dataIndex: 'sourceCode',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        align: 'left',
        width: 100,
        dataIndex: 'enabledFlag',
        render: (val) => ['0', 0, '1', 1].includes(val) ? enableRender(Number(val)) : val,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        align: 'left',
        width: 100,
        render: (_, record) => (
          <a onClick={() => this.showEditModal(record)}>
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
        ),
      },
    ];

    return (
      <React.Fragment>
        <Header title={intl.get('smdm.ledger.view.title.ledger').d('账套定义')}>
          <Button icon="plus" type="primary" onClick={this.showModal}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <Table
            rowKey="ledgerId"
            bordered
            loading={loading}
            dataSource={list.content}
            columns={columns}
            onChange={this.handleSearch}
            pagination={pagination}
          />
        </Content>
        <CreateForm
          sideBar
          destroyOnClose
          title={intl.get('smdm.ledger.view.title.ledger').d('账套定义')}
          onRef={(ref) => {
            this.createForm = ref;
          }}
          handleAdd={this.handleAdd}
          confirmLoading={saving}
          editValue={editValue}
          modalVisible={this.state.modalVisible}
          hideModal={this.hideModal}
        />
      </React.Fragment>
    );
  }
}

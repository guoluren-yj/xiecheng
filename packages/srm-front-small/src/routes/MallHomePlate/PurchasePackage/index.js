/**
 * MallHomePlate/PurchasePackage - 商城首页板块管理/采购套餐
 * @date: 2020-9-11
 * @author hl <li.huang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal as HModal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { withRouter } from 'react-router-dom';
import { DataSet, Table, Button, Dropdown, Menu, Icon, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import notification from 'utils/notification';
import EnableTag from '@/routes/Components/EnableTag';

import { packageTableDS, historyDs } from './packageDs';

const proModalProps = {
  movable: false,
  closable: true,
  mask: true,
  destroyOnClose: true,
};

@withRouter
@connect()
export default class CustomBar extends Component {
  tableDs = new DataSet(packageTableDS());

  historyDs = new DataSet(historyDs());

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { companyId } = this.props;
    this.fetchList(companyId);
  }

  componentWillReceiveProps(nextProps) {
    const { companyId } = this.props;
    if (nextProps.companyId !== companyId) {
      this.fetchList(nextProps.companyId);
    }
  }

  @Bind()
  fetchList(companyId) {
    this.tableDs.setQueryParameter('companyId', companyId);
    if (companyId) this.tableDs.query();
  }

  /**
   * 新建
   */
  @Bind()
  handleCreate() {
    const { history, companyId } = this.props;
    if (!companyId) {
      HModal.confirm({
        title: intl.get(`small.mallHomePlate.view.chooseCompany`).d('请选择公司！'),
        onOk: () => {},
      });
    } else {
      history.push(`/small/mall-home-plate/create-package/${companyId}`);
    }
  }

  /**
   * 编辑-跳转明细
   */
  @Bind()
  handleToEdit(record = {}) {
    const { history, companyId } = this.props;
    history.push(`/small/mall-home-plate/edit-package/${companyId}/${record.data.marketBasketId}`);
  }

  @Bind()
  handlePreview(record = {}) {
    const { history, companyId } = this.props;
    history.push(`/small/mall-home-plate/read-package/${companyId}/${record.data.marketBasketId}`);
  }

  @Bind()
  handleDel(record) {
    this.tableDs.delete([record]);
  }

  @Bind()
  async handleEnableAction(record) {
    const { dispatch } = this.props;
    const line = record.toData();
    this.tableDs.status = 'submitting';
    const res = await dispatch({
      type: 'mallHomePlate/enablePackage',
      payload: {
        ...line,
        enabledFlag: line.enabledFlag ? 0 : 1,
      },
    });
    this.tableDs.status = 'ready';
    if (res.errorMessage) {
      notification.error({ message: `${res.errorMessage}` });
    } else {
      notification.success();
      this.tableDs.query(this.tableDs.currentPage);
    }
  }

  @Bind()
  handleOpenHistory(marketBasketId) {
    const historyColumns = [
      { name: 'operatedByName' },
      { name: 'operatedDate' },
      { name: 'operationName' },
      { name: 'operatedRemark' },
    ];
    this.historyDs.setQueryParameter('marketBasketId', marketBasketId);
    this.historyDs.query();
    Modal.open({
      ...proModalProps,
      footer: null,
      style: { width: 800 },
      onOk: this.handleOauthCompany,
      afterClose: () => {
        this.historyDs.reset();
      },
      title: intl.get('small.common.view.operateRecord').d('操作记录'),
      children: <Table dataSet={this.historyDs} columns={historyColumns} />,
    });
  }

  /**
   * 渲染编辑列
   */
  @Bind()
  editOperations({ record }) {
    let operate = '';
    const menu = (
      <Menu>
        {record.data.enabledFlag !== 1 && record.data.companyId !== -1 && (
          <Menu.Item>
            <a onClick={() => this.handleDel(record)}>
              {intl.get('hzero.common.btn.delete').d('删除')}
            </a>
          </Menu.Item>
        )}
        <Menu.Item>
          <a
            onClick={() => {
              this.handleOpenHistory(record.data.marketBasketId);
            }}
          >
            {intl.get('small.common.model.operateRecord').d('操作记录')}
          </a>
        </Menu.Item>
      </Menu>
    );

    operate = (
      <span className="action-link">
        <a onClick={() => this.handleEnableAction(record)} disabled={record.data.companyId === -1}>
          {record.data.enabledFlag
            ? intl.get('hzero.common.status.disable').d('禁用')
            : intl.get('hzero.common.status.enable').d('启用')}
        </a>
        <a
          disabled={record.data.enabledFlag === 1 || record.data.companyId === -1}
          onClick={() => {
            this.handleToEdit(record);
          }}
        >
          {intl.get('hzero.common.button.edit').d('编辑')}
        </a>
        <Dropdown overlay={menu}>
          <a>
            {intl.get('small.common.view.button.more').d('更多操作')}
            <Icon type="arrow_drop_down" />
          </a>
        </Dropdown>
      </span>
    );
    return operate;
  }

  addButton = (
    <Button icon="add" key="add" onClick={this.handleCreate}>
      {intl.get('hzero.common.button.create').d('新增')}
    </Button>
  );

  render() {
    const columns = [
      {
        name: 'basketName',
        width: 180,
        lock: 'left',
        renderer: ({ text, record }) => <a onClick={() => this.handlePreview(record)}>{text}</a>,
      },
      {
        name: 'remark',
        minWidth: 200,
      },
      {
        name: 'sourceFrom',
        width: 120,
        renderer: ({ record }) =>
          record.get('companyId') === -1
            ? intl.get('small.common.view.group').d('集团')
            : intl.get('small.common.view.company').d('公司'),
      },
      {
        name: 'createTime',
        width: 150,
      },
      {
        name: 'startDate',
        width: 150,
      },
      {
        name: 'endDate',
        width: 150,
      },
      {
        name: 'effectiveDays',
        width: 100,
      },
      {
        name: 'enabledFlag',
        width: 90,
        align: 'center',
        renderer: ({ record }) => <EnableTag enabledFlag={record.get('enabledFlag')} />,
      },
      {
        name: 'edit',
        lock: 'right',
        width: 200,
        renderer: this.editOperations,
      },
    ];
    const buttons = [this.addButton, 'delete'];
    return (
      <React.Fragment>
        <Table
          key="marketBasketId"
          pristine
          border={null}
          buttons={buttons}
          queryFieldsLimit={3}
          columns={columns}
          dataSet={this.tableDs}
        />
      </React.Fragment>
    );
  }
}

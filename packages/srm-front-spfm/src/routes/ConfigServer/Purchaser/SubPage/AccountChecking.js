/*
 * @Description:
 * @Date: 2020-05-06 13:30:49
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React from 'react';
import { Modal, Button, Form, Checkbox, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { isEmpty, isNumber, sum } from 'lodash';

import notification from 'utils/notification';
import intl from 'utils/intl';
import {
  getEditTableData,
  getCurrentOrganizationId,
  addItemToPagination,
  delItemsToPagination,
} from 'utils/utils';
import EditTable from 'components/EditTable';
import uuidv4 from 'uuid/v4';

import styles from './index.less';

const FormItem = Form.Item;

@connect(({ loading, configServer }) => ({
  loading: loading.effects['configServer/fetchAccoutCheckList'],
  saveLoading: loading.effects['configServer/saveAccountCheckList'],
  delLoading: loading.effects['configServer/deleteAccountCheckList'],
  configServer,
}))
export default class AccountChecking extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      organizationId: getCurrentOrganizationId(),
      selectedRows: [],
    };
  }

  componentDidMount() {
    this.fetchAccoutCheckList();
  }

  @Bind()
  fetchAccoutCheckList(params = {}) {
    const { dispatch } = this.props;
    const { organizationId } = this.state;
    dispatch({
      type: 'configServer/fetchAccoutCheckList',
      payload: {
        isUpdate: true,
        organizationId,
        page: isEmpty(params) ? {} : params,
      },
    });
  }

  @Bind()
  hideModal() {
    const { handleModal } = this.props;
    if (handleModal) {
      handleModal('accountCheckingVisible', false);
    }
  }

  /**
   * 保存
   */
  @Bind()
  handleSaveData() {
    const {
      dispatch,
      configServer: { accoutCheckList = [], accoutCheckPagination = {} },
    } = this.props;
    const list = accoutCheckList.map(item => {
      const { ruleId, ...others } = item;
      if (item._status === 'create') {
        return { ...others };
      } else {
        return { ...item };
      }
    });
    const params = getEditTableData(list, ['_status']);
    if (params.length === 0) {
      return;
    }
    dispatch({
      type: 'configServer/saveAccountCheckList',
      payload: [...params].map(item => ({ ...item, tenantId: getCurrentOrganizationId() })),
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchAccoutCheckList(accoutCheckPagination);
      }
    });
  }

  @Bind()
  showRlue() {
    const { handleModal } = this.props;
    if (handleModal) {
      handleModal('purBusCheckRulesVisible', true);
    }
  }

  @Bind()
  handleDelete() {
    const { selectedRows = [] } = this.state;
    const {
      dispatch,
      configServer: { accoutCheckList = [], accoutCheckPagination = {} },
    } = this.props;
    const deleteIds = selectedRows.map(item => item.ruleId);
    const originDelete = selectedRows.filter(item => item._status !== 'create');
    if (originDelete.length === 0) {
      const newList = accoutCheckList.filter(item => !deleteIds.includes(item.ruleId));
      dispatch({
        type: 'configServer/updateState',
        payload: {
          accoutCheckList: newList,
          accoutCheckPagination: delItemsToPagination(
            deleteIds.length,
            accoutCheckList.length,
            accoutCheckPagination
          ),
        },
      });
      notification.success();
      return;
    }
    dispatch({
      type: 'configServer/deleteAccountCheckList',
      payload: originDelete,
    }).then(res => {
      if (res) {
        const newList = accoutCheckList.filter(item => !deleteIds.includes(item.ruleId));
        dispatch({
          type: 'configServer/updateState',
          payload: {
            accoutCheckList: newList,
            accoutCheckPagination: delItemsToPagination(
              deleteIds.length,
              accoutCheckList.length,
              accoutCheckPagination
            ),
          },
        });
        notification.success();
      }
    });
  }

  @Bind()
  handleCreate() {
    const {
      dispatch,
      configServer: { accoutCheckList = [], accoutCheckPagination = {} },
    } = this.props;
    dispatch({
      type: 'configServer/updateState',
      payload: {
        accoutCheckList: [
          {
            _status: 'create',
            ruleId: uuidv4(),
          },
          ...accoutCheckList,
        ],
        accoutCheckPagination: addItemToPagination(accoutCheckList.length, accoutCheckPagination),
      },
    });
  }

  render() {
    const {
      loading,
      saveLoading,
      delLoading,
      visible,
      configServer: { accoutCheckList = [], accoutCheckPagination = {}, enumMap = {} },
    } = this.props;
    const { checkTheDimension = [] } = enumMap;
    const columns = [
      {
        title: intl.get('spfm.configServer.model.purchaser.checkDimension').d('校验维度'),
        dataIndex: 'validateRuleTypeMeaning',
        width: 300,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`validateRuleType`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('spfm.configServer.model.purchaser.checkDimension')
                        .d('校验维度'),
                    }),
                  },
                ],
                initialValue: record.validateRuleType,
              })(
                <Select
                  showSearch
                  style={{ width: '100%' }}
                  allowClear
                  onChange={() => record.$form.resetFields()}
                >
                  {checkTheDimension.map(item => (
                    <Select.Option key={item.value} value={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('spfm.configServer.model.purchaser.ruleDetail').d('规则明细'),
        width: 110,
        render: (_, record) => (
          <a
            disabled={record.$form.getFieldValue('validateRuleType') !== 'RCV'}
            onClick={() => this.showRlue(record)}
          >
            {intl.get('spfm.configServer.model.purchaser.showRlue').d('查看')}
          </a>
        ),
      },
      {
        title: intl.get('spfm.configServer.model.purchaser.controlPage').d('控制页面'),
        // width: 110,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`billFlag`, {
                initialValue: record.billFlag || 0,
              })(
                <Checkbox
                  checkedValue={1}
                  unCheckedValue={0}
                  disabled={record.$form.getFieldValue('validateRuleType') === 'BILL'}
                >
                  {intl.get('spfm.configServer.model.purchaser.billFlag').d('对账')}
                </Checkbox>
              )}
              {record.$form.getFieldDecorator(`invoiceFlag`, {
                initialValue: record.invoiceFlag || 0,
              })(
                <Checkbox checkedValue={1} unCheckedValue={0}>
                  {intl.get('spfm.configServer.model.purchaser.invoiceFlag').d('开票')}
                </Checkbox>
              )}
            </FormItem>
          ) : (
            ''
          ),
      },
    ];
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 0))) + 300;
    const rowSelection = {
      onChange: (_, selectedRows) => {
        this.setState({
          selectedRows,
        });
      },
    };
    return (
      <Modal
        title={intl
          .get('spfm.configServer.model.purchaser.view.accountCheckRules.title')
          .d('对账开票校验规则配置')}
        visible={visible}
        footer={null}
        width={600}
        onCancel={this.hideModal}
      >
        <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
          <Button style={{ marginRight: '5px' }} type="primary" onClick={() => this.handleCreate()}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>

          <Button
            style={{ marginRight: '5px' }}
            onClick={() => this.handleSaveData()}
            loading={saveLoading}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button
            style={{ marginRight: '5px' }}
            onClick={() => this.handleDelete()}
            loading={delLoading}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
        </div>
        <EditTable
          bordered
          className={styles['purchase-trans-modal']}
          scroll={{ x: scrollX }}
          loading={loading || saveLoading}
          rowKey="ruleId"
          dataSource={accoutCheckList}
          columns={columns}
          rowSelection={rowSelection}
          pagination={accoutCheckPagination}
          onChange={page => this.fetchAccoutCheckList(page)}
        />
      </Modal>
    );
  }
}

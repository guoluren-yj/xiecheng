/*
 * BillApprovalRules - 对账单审批规则定义 Modal
 * @date: 2020-9-11
 * @author: JSS <shangshang.jing@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Button, Modal, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isArray, isEmpty, isFunction, merge } from 'lodash';
import { connect } from 'dva';

import EditTable from 'components/EditTable';
import { getEditTableData } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';

import styles from './index.less';

const FormItem = Form.Item;
@connect(({ loading, configServer }) => ({
  configServer,
  configing: loading.effects['configServer/saveSettings'],
}))
export default class PointAndMethodModal extends PureComponent {
  constructor(props) {
    super(props);
    const { settings } = props;
    this.state = {
      dataSource: [
        {
          name: '010537',
          approvalReceipt: intl
            .get(`spfm.configServer.model.configServer.010537`)
            .d('开票通知(采购方发起)'),
          approvalMethodCode: settings['010537'],
          _status: 'update',
        },
        {
          name: '010519',
          approvalReceipt: intl
            .get(`spfm.configServer.model.configServer.010519`)
            .d('开票申请单(供方发起)'),
          approvalMethodCode: settings['010519'],
          _status: 'update',
        },
      ],
    };
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const { dataSource } = this.state;
    const { dispatch, settings } = this.props;
    const data = getEditTableData(dataSource);
    if (isArray(data) && !isEmpty(data)) {
      const saveObj = {};
      data.forEach((item) => {
        saveObj[item.name] = item.approvalMethodCode;
      });
      dispatch({
        type: 'configServer/saveSettings',
        payload: { customizeSetting: merge(settings, saveObj) },
      }).then((res) => {
        if (res) {
          notification.success();
        }
      });
    }
  }

  /**
   * 关闭弹窗
   */
  @Bind()
  hideModal() {
    const { onState } = this.props;
    if (isFunction(onState)) {
      onState('billApprovalVisible', false);
    }
  }

  render() {
    const { dataSource = [] } = this.state;
    const { visible = false, configing, enumMap } = this.props;
    const { billApprovalMethods = [], billApprovalTypes = [] } = enumMap;
    const columns = [
      {
        title: intl.get(`spfm.configServer.model.configServer.approvalReceipt`).d('审批单据'),
        dataIndex: 'approvalReceipt',
        width: 250,
      },
      {
        title: intl.get(`spfm.configServer.model.configServer.approvalMethod`).d('审批方式'),
        dataIndex: 'approvalMethodCode',
        width: 250,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`approvalMethodCode`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`spfm.configServer.model.configServer.approvalMethod`)
                        .d('审批方式'),
                    }),
                  },
                ],
                initialValue: record.approvalMethodCode,
              })(
                <Select showSearch style={{ width: '100%' }} allowClear>
                  {(record.name === '010537' ? billApprovalMethods : billApprovalTypes).map(
                    (item) => (
                      <Select.Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Select.Option>
                    )
                  )}
                </Select>
              )}
            </FormItem>
          ) : (
            val
          ),
      },
    ];
    const editTableProps = {
      loading: configing,
      columns,
      dataSource,
      pagination: false,
      bordered: true,
    };
    return (
      <Modal
        title={
          <div>
            {intl
              .get(`spfm.configServer.view.message.modal.billApprovalRules`)
              .d('对账单审批规则定义')}
          </div>
        }
        visible={visible}
        onCancel={this.hideModal}
        width={600}
        footer={null}
        wrapClassName={styles['purchase-requisition-approval-config']}
      >
        <div className="header" style={{ textAlign: 'right' }}>
          <Button
            type="primary"
            onClick={this.handleSave}
            loading={configing}
            disabled={isArray(dataSource) && isEmpty(dataSource)}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </div>
        <EditTable {...editTableProps} />
      </Modal>
    );
  }
}

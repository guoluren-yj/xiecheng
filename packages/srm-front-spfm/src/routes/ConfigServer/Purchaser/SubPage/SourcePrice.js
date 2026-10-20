/*
 * SourcePrice - 对账和开票参考价来源设置
 * @date: 2020-6-19
 * @author: JSS <shangshang.jing@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Button, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isArray, isEmpty, isFunction } from 'lodash';
import { connect } from 'dva';

import EditTable from 'components/EditTable';
import ValueList from 'components/ValueList';
import { getCurrentOrganizationId, getEditTableData } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';

import styles from './index.less';

const FormItem = Form.Item;
@connect(({ loading }) => ({
  fetching: loading.effects['configServer/fetchSourcePrice'],
  saving: loading.effects['configServer/savePointAndMethod'],
}))
export default class SourcePrice extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      tenantId: getCurrentOrganizationId(),
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  @Bind()
  handleSearch() {
    const { tenantId } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'configServer/fetchSourcePrice',
      payload: {
        tenantId,
      },
    }).then(res => {
      if (res) {
        this.setState({ dataSource: res.map(item => ({ ...item, _status: 'update' })) });
      }
    });
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const { tenantId, dataSource } = this.state;
    const { dispatch } = this.props;
    const editTable = getEditTableData(dataSource, ['_status']);
    if (isArray(editTable) && !isEmpty(editTable)) {
      dispatch({
        type: 'configServer/saveSourcePrice',
        payload: {
          tenantId,
          body: editTable,
        },
      }).then(res => {
        if (res) {
          this.handleSearch();
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
    const { onClose } = this.props;
    if (isFunction(onClose)) {
      onClose('sourcePriceVisible', false);
    }
  }

  render() {
    const { saving, fetching, visible = false } = this.props;
    const { dataSource = [] } = this.state;
    const columns = [
      {
        title: intl.get(`spfm.configServer.model.configServer.businessType`).d('业务类别'),
        dataIndex: 'businessTypeMeaning',
        width: 250,
      },
      {
        title: intl.get(`spfm.configServer.model.configServer.sourcePrice`).d('参考价来源'),
        dataIndex: 'referencePriceCode',
        width: 250,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`referencePriceCode`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`spfm.configServer.model.configServer.sourcePrice`)
                        .d('参考价来源'),
                    }),
                  },
                ],
                initialValue: record.referencePriceCode,
              })(
                <ValueList
                  allowClear
                  lovCode="SFIN.SOURCE_REFERENCE_PRICE"
                  style={{ width: '150px' }}
                  lazyLoad={false}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
    ];
    const editTableProps = {
      loading: fetching || saving,
      columns,
      dataSource,
      pagination: false,
      bordered: true,
    };
    return (
      <Modal
        title={
          <div>{intl.get(`spfm.configServer.model.configServer.sourcePrice`).d('参考价来源')}</div>
        }
        visible={visible}
        onCancel={this.hideModal}
        width={600}
        footer={null}
        wrapClassName={styles['purchase-requisition-approval-config']}
      >
        <div className="header" style={{ textAlign: 'right' }}>
          <Button
            onClick={this.handleSave}
            loading={fetching || saving}
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

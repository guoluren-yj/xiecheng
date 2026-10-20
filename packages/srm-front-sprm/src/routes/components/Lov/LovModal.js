import React, { PureComponent, Fragment } from 'react';
import { Form, Button, Input, Table, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction, isEmpty, isArray } from 'lodash';

import { createPagination } from 'utils/utils';
import intl from 'utils/intl';

import { queryInvoiceAddress } from '@/services/purchaseRequisitionCreationService';
import styles from './index.less';

const FormItem = Form.Item;
const modelPrompt = 'sprm.common.model.common';

@Form.create({ fieldNameProp: null })
export default class LovModal extends PureComponent {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) props.onRef(this);
    this.state = {
      dataSource: [],
      pagination: {},
      loading: false,
    };
  }

  getSnapshotBeforeUpdate(preProps) {
    const { visible } = preProps;
    if (!visible && visible !== this.props.visible) {
      return true;
    }
    return false;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot) {
      this.handleSearch();
    }
  }

  /**
   * 表单重置
   */
  @Bind()
  handleFormReset() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields();
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch(page = {}) {
    const {
      form: { getFieldsValue },
      searchClearSelect,
      queryParams = {},
      newMallFlag,
    } = this.props;
    const filterValues = getFieldsValue();
    if (isFunction(searchClearSelect)) {
      searchClearSelect();
    }
    this.setState({ loading: true });
    queryInvoiceAddress({
      page,
      ...filterValues,
      ...queryParams,
      belongType: 1,
      addressType: 'INVOICE',
      enabledFlag: 1,
      newMallFlag,
    })
      .then(res => {
        if (res) {
          this.setState({
            dataSource: res.content,
            pagination: createPagination(res),
            loading: false,
          });
        }
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  }

  render() {
    const {
      visible,
      rowSelection,
      hideModal,
      handleOk,
      handleRowClick,
      form: { getFieldDecorator, resetFields },
    } = this.props;
    const { dataSource, pagination, loading } = this.state;
    const { selectedRowKeys } = rowSelection;
    const columns = [
      {
        title: intl.get(`${modelPrompt}.invoiceAddress`).d('收单方地址'),
        dataIndex: 'rgNameList',
        width: 120,
        render: (val, record) =>
          isArray(val) ? val.join('') + record.address : record.fullAddress,
      },
      {
        title: intl.get(`${modelPrompt}.invoiceContactName`).d('收单联系人'),
        dataIndex: 'contactName',
        width: 100,
      },
      {
        title: intl.get(`${modelPrompt}.invoiceTelNum`).d('收单联系电话'),
        dataIndex: 'mobile',
        width: 120,
      },
      {
        title: intl.get(`${modelPrompt}.receiverEmail`).d('收单邮箱'),
        dataIndex: 'email',
        width: 120,
      },
    ];

    const tableProps = {
      loading,
      columns,
      dataSource,
      rowSelection,
      pagination,
      bordered: true,
      rowKey: 'addressId',
      onChange: this.handleSearch,
      onRow: record => {
        return {
          onDoubleClick: () => handleOk([record]),
          onClick: () =>
            handleRowClick({
              selectedRowKeys: [record.addressId],
              selectedRows: [record],
            }),
        };
      },
    };

    return (
      <Fragment>
        <Modal
          title={intl.get(`${modelPrompt}.invoiceAddress`).d('收单方地址')}
          visible={visible}
          width={1000}
          onCancel={() => hideModal(resetFields)}
          onOk={() => handleOk()}
          okButtonProps={{ disabled: isEmpty(selectedRowKeys) }}
          wrapClassName={styles['wrapper-modal']}
        >
          <Form layout="inline">
            <FormItem label={intl.get(`${modelPrompt}.invoiceAddress`).d('收单方地址')}>
              {getFieldDecorator('address')(<Input style={{ width: 150 }} />)}
            </FormItem>
            <FormItem label={intl.get(`${modelPrompt}.invoiceContactName`).d('收单联系人')}>
              {getFieldDecorator('contactName')(<Input style={{ width: 150 }} />)}
            </FormItem>
            <FormItem label={intl.get(`${modelPrompt}.invoiceTelNum`).d('收单联系电话')}>
              {getFieldDecorator('mobile')(<Input style={{ width: 150 }} />)}
            </FormItem>
            <FormItem>
              <Button data-code="reset" onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                data-code="search"
                htmlType="submit"
                type="primary"
                onClick={this.handleSearch}
                style={{ marginLeft: 8 }}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Form>
          <Table {...tableProps} />
        </Modal>
      </Fragment>
    );
  }
}

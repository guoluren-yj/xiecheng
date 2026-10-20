import React, { Component } from 'react';
import { Modal, Table, Form, Input, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty, isFunction } from 'lodash';
import intl from 'utils/intl';
import { INQUIRY, BID } from '@/utils/globalVariable';

const promptCode = 'ssrc.offlineResultEntry';

@Form.create({ fieldNameProp: null })
export default class BatchAddItems extends Component {
  constructor(props) {
    super(props);
    const { onRef } = this.props;
    if (isFunction(onRef)) {
      onRef(this);
    }
  }

  /**
   * 确定操作
   */
  @Bind()
  saveBtn() {
    const { rowSelection, onCancel, onOk } = this.props;
    if (isEmpty(rowSelection)) {
      onCancel();
    } else {
      onOk();
    }
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields((err, values) => {
        if (isEmpty(err)) {
          // 如果验证成功,则执行search
          onSearch({}, values);
        }
      });
    }
  }

  renderSearchForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form layout="inline" style={{ marginTop: '-6px', marginBottom: '10px' }}>
        <Form.Item label={intl.get(`${promptCode}.model.offlineEntry.itemCode`).d('物料编码')}>
          {getFieldDecorator('itemCode', {})(<Input />)}
        </Form.Item>
        <Form.Item label={intl.get(`${promptCode}.model.offlineEntry.itemName`).d('物品描述')}>
          {getFieldDecorator('itemName', {})(<Input />)}
        </Form.Item>
        <Form.Item>
          <Button data-code="search" type="primary" htmlType="submit" onClick={this.handleSearch}>
            {intl.get('hzero.common.status.search').d('查询')}
          </Button>
        </Form.Item>
      </Form>
    );
  }

  render() {
    const {
      visible,
      dataSource,
      loading,
      onCancel,
      pagination,
      onChange,
      rowSelection,
      customizeTable = () => {},
      sourceKey = INQUIRY,
    } = this.props;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.offlineEntry.lineNo.`).d('行号'),
        dataIndex: 'rfxLineItemNum',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.offlineEntry.itemCategory`).d('物品分类'),
        dataIndex: 'itemCategoryName',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.offlineEntry.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.offlineEntry.itemName`).d('物品描述'),
        dataIndex: 'itemName',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.offlineEntry.unit`).d('单位'),
        dataIndex: 'uomName',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.offlineEntry.businessUnit`).d('业务实体'),
        dataIndex: 'ouName',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.offlineEntry.inventoryOrg`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 100,
      },
    ];
    return (
      <Modal
        destroyOnClose
        width={800}
        visible={visible}
        title={intl.get(`${promptCode}.view.title.bulkAddSupLine`).d('批量添加物品行')}
        onOk={this.saveBtn}
        onCancel={onCancel}
      >
        {this.renderSearchForm()}
        {customizeTable(
          {
            code: `SSRC.${sourceKey === BID ? 'BID_' : ''}OFFLINE_RESULT_ENTRY.BATCH_ADD_QUOTATION`,
          },
          <Table
            bordered
            rowKey="rfxLineItemId"
            loading={loading}
            columns={columns}
            dataSource={dataSource}
            pagination={pagination}
            rowSelection={rowSelection}
            onChange={(page) => onChange(page)}
          />
        )}
      </Modal>
    );
  }
}

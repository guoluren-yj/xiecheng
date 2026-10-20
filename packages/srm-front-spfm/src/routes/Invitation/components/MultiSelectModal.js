/**
 * MultiSelectModal -lov多选框 供应商分类
 * @date: 2020-4-29
 * @author: pengna <na.peng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import { Form, Input, Table, Modal, Row, Button, Col, List, Icon } from 'hzero-ui';
import ValueList from 'components/ValueList';
import { createPagination } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';
import styles from '../index.less';

const FormItem = Form.Item;
const ListItem = List.Item;

const formItemLayout = {
  labelCol: {
    sm: { span: 8 },
  },
  wrapperCol: {
    sm: { span: 14 },
  },
};

@Form.create({ fieldNameProp: null })
export default class MultiSelectModal extends PureComponent {
  componentDidMount() {
    this.props.onRef(this);
  }

  /**
   * 多选框
   */
  @Bind()
  handleRowSelect(selectRowKey, selectedChildRows) {
    const { handleRowSelect } = this.props;
    handleRowSelect(selectRowKey, selectedChildRows);
  }

  @Bind()
  handleCurrentRowSelect(record) {
    const { selectedRowKeys = [], selectedChildRows = [], handleRowSelect } = this.props;
    handleRowSelect(
      JSON.parse(JSON.stringify(selectedRowKeys)),
      JSON.parse(JSON.stringify(selectedChildRows)),
      record
    );
  }

  /**
   * 关闭弹窗
   */
  @Bind()
  cancelModal() {
    const { handleCancelModal } = this.props;
    handleCancelModal();
  }

  /**
   * 弹窗确定
   */
  @Bind()
  handleSaveRecord() {
    const { checkClassify } = this.props;
    checkClassify();
  }

  @Bind()
  resetSearchDate() {
    const { form } = this.props;
    form.resetFields();
  }

  @Bind()
  renderItem(item) {
    return (
      <ListItem style={{ height: '35px', display: 'inline-block', border: 'none' }}>
        <span
          style={{
            padding: '5px',
            paddingTop: 0,
            paddingButton: 0,
            overflow: 'hidden',
          }}
        >
          {item.supplierCategoryDescription}
          <Icon
            type="close-circle"
            theme="filled"
            className={styles.close}
            onClick={() => this.handleCurrentRowSelect(item)}
          />
        </span>
      </ListItem>
    );
  }

  render() {
    const {
      supplierCategoryModal,
      supplierCategoryDate = {},
      form: { getFieldDecorator },
      fetchSupplierDate,
      selectedChildRows = [],
      selectedRowKeys,
      loading = false,
    } = this.props;
    const queryFields = [
      {
        field: 'supplierCategoryCode',
        label: intl.get(`spfm.common.supplierCategoryCode`).d('分类编码'),
        dataType: 'INPUT',
      },
      {
        field: 'supplierCategoryDescription',
        label: intl.get(`spfm.common.supplierCategoryDescription`).d('分类描述'),
        dataType: 'INPUT',
      },
      {
        field: 'introCategoryFlag',
        label: intl.get(`spfm.common.model.message.isImportClassify`).d('是否引入分类'),
        dataType: 'SELECT',
      },
    ];
    const fieldsColumn = [
      {
        title: intl.get(`spfm.common.supplierCategoryCode`).d('分类编码'),
        dataIndex: 'supplierCategoryCode',
        width: 200,
      },
      {
        title: intl.get(`spfm.common.supplierCategoryDescription`).d('分类描述'),
        dataIndex: 'supplierCategoryDescription',
      },
      {
        title: intl.get(`spfm.common.model.message.isImportClassify`).d('是否引入分类'),
        dataIndex: 'introCategoryFlag',
        width: 110,
        render: (val) => yesOrNoRender(val),
      },
    ];
    // 查询条件
    const span = queryFields.length <= 1 ? 24 : 12;
    const queryCondition = queryFields.map((queryItem) => {
      switch (queryItem.dataType) {
        case 'SELECT':
          return (
            <Col span={span} key={queryItem.field}>
              <FormItem {...formItemLayout} label={queryItem.label}>
                {getFieldDecorator(queryItem.field)(
                  <ValueList lovCode="HPFM.FLAG" style={{ width: '100%' }} />
                )}
              </FormItem>
            </Col>
          );
        default:
          return (
            <Col span={span} key={queryItem.field}>
              <FormItem {...formItemLayout} label={queryItem.label}>
                {getFieldDecorator(queryItem.field)(<Input onPressEnter={fetchSupplierDate} />)}
              </FormItem>
            </Col>
          );
      }
    });

    return (
      <Modal
        destroyOnClose
        width={720}
        visible={supplierCategoryModal}
        onCancel={this.cancelModal}
        onOk={this.handleSaveRecord}
        title={intl
          .get('spfm.invitationRegister.model.invitation.supplierCategoryCode')
          .d('供应商分类')}
        wrapClassName="lov-modal"
      >
        <React.Fragment>
          <div style={{ display: 'flex', marginBottom: '5px', marginTop: '5px' }}>
            <Row style={{ flex: 'auto' }}>{queryCondition}</Row>
            <div style={{ width: '80px', padding: '5px 0 0 15px' }}>
              <Button onClick={this.resetSearchDate}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
            </div>
            <div style={{ width: '80px', padding: '5px 0 0 4px' }}>
              <Button type="primary" onClick={() => fetchSupplierDate()}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </div>
          </div>
          <p style={{ minHeight: '40px', margin: 0 }}>
            <span style={{ display: 'inline-block', height: '40px', paddingTop: '12px' }}>
              {intl.get('hzero.common.button.selected').d('已选择')}:
            </span>
            {selectedChildRows.length > 0 && (
              <List
                dataSource={selectedChildRows}
                renderItem={(item) => this.renderItem(item)}
                style={{ display: 'inline-block', height: '30px', padding: 0 }}
              />
            )}
          </p>
          <Table
            dataSource={supplierCategoryDate.content}
            pagination={createPagination(supplierCategoryDate)}
            columns={fieldsColumn}
            loading={loading}
            onChange={fetchSupplierDate}
            rowKey="supplierCategoryId"
            rowSelection={{
              selectedRowKeys,
              onChange: this.handleRowSelect,
              getCheckboxProps: (record) => {
                return { disabled: !!record.hasChild };
              },
            }}
            onRow={(record) => ({
              onClick: () => this.handleCurrentRowSelect(record),
            })}
            bordered
          />
        </React.Fragment>
      </Modal>
    );
  }
}

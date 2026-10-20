/**
 * PartnerTable - 客户物品
 * @date: 2018-9-25
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Button, Table, Drawer, Input, InputNumber } from 'hzero-ui';
import { isEmpty, isString } from 'lodash';
import { Bind } from 'lodash-decorators';

import uuidv4 from 'uuid/v4';
import Lov from 'components/Lov';
import { createPagination } from 'utils/utils';
import intl from 'utils/intl';
import styles from '../index.less';

const FormItem = Form.Item;

/**
 * 客户物品
 * @extends {Component} - PureComponent
 * @reactProps {String} organizationId - 租户Id
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class PartnerTable extends PureComponent {
  state = {
    drawerVisible: false,
    recordSource: [],
    selectedRows: [],
    idList: [],
  };

  componentDidMount() {
    const { onClearRows, itemId, onTableChange } = this.props;
    if (onClearRows) onClearRows(this.handleClearSelectedRows);
    if (itemId) {
      onTableChange({}, 'queryPartner');
    }
  }

  /**
   * 将selectedRows置空
   */
  @Bind()
  handleClearSelectedRows() {
    this.setState({ selectedRows: [] });
  }

  /**
   *  处理方法不用on开头
   * @param {*} selectedRowKeys - <>
   * @param {*} selectedRows - <>
   */
  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    const idList = [];
    selectedRows.forEach((item) => {
      if (!item.isLocal) {
        idList.push(item.partnerRelationId);
      }
    });
    this.setState({ selectedRows, idList });
  }

  /**
   * 方法含义？
   * @param {*} pagination - <>
   */
  @Bind()
  handleTableChange(pagination) {
    this.props.onTableChange(pagination, 'queryPartner');
  }

  /**
   * 方法含义？
   * 处理方法不以on开头
   * @param {*} recordSource - <>
   */
  @Bind()
  onOpen(recordSource) {
    if (recordSource) {
      this.setState({ drawerVisible: true, recordSource });
    } else {
      this.setState({ drawerVisible: true, recordSource: {} });
    }
  }

  /**
   * 方法含义？
   * 处理方法不以on开头
   */
  @Bind()
  onClose() {
    this.setState({ drawerVisible: false });
  }

  /**
   * 保存
   */
  @Bind()
  saveFormData() {
    const { form, dataSource = {}, onAdd } = this.props;
    const { content = [] } = dataSource;
    const { recordSource = {} } = this.state;
    form.validateFields((err, fieldsValues) => {
      if (!err) {
        const newFieldsValues = recordSource.partnerRelationId
          ? {
              ...recordSource,
              ...fieldsValues,
            }
          : {
              ...fieldsValues,
              isCreat: true,
              isLocal: true,
              partnerRelationId: uuidv4(),
            };
        let newDataSource = isEmpty(content) ? [] : [...content];
        if (newFieldsValues.isCreat) {
          newDataSource.push(newFieldsValues);
        } else {
          const { partnerRelationId } = newFieldsValues;
          newDataSource = content.map((item) => {
            if (item.partnerRelationId === partnerRelationId) {
              return { ...item, ...newFieldsValues };
            } else {
              return item;
            }
          });
        }
        const dataList = newDataSource.map((item) => {
          if (item.isCreat) {
            const { isCreat, ...other } = item;
            return other;
          } else {
            return item;
          }
        });
        onAdd(dataList, 'partnerData', true);
        this.setState({ drawerVisible: false });
      }
    });
  }

  /**
   * 删除数据
   */
  @Bind()
  handleDelete() {
    const { dataSource = {}, onDeleteRows } = this.props;
    const { content = [] } = dataSource;
    const { selectedRows, idList } = this.state;

    const newSelectedRows = selectedRows.map((item) => {
      return item.partnerRelationId;
    });
    const newDataSource = content.filter((item) => {
      return newSelectedRows.indexOf(item.partnerRelationId) > -1 === false;
    });
    this.setState({ selectedRows: [] });
    onDeleteRows(newDataSource, idList, 'deletePartnerTableData', 'partnerData', true);
  }

  renderForm() {
    const { form = {}, onValid, isEdit } = this.props;
    const { getFieldDecorator, setFieldsValue, getFieldValue } = form;
    const { recordSource } = this.state;
    const formLayOut = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    getFieldDecorator('companyName', { initialValue: recordSource.companyName });
    getFieldDecorator('itemCode', { initialValue: recordSource.itemCode });
    getFieldDecorator('partnerTenantId');
    return (
      <Form layout="horizontal">
        <FormItem
          {...formLayOut}
          label={intl.get('smdm.materiel.model.materiel.customer.name').d('客户名称')}
        >
          {getFieldDecorator('customCompanyId', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('smdm.materiel.model.materiel.customer.name').d('客户名称'),
                }),
              },
            ],
            initialValue: recordSource.customCompanyId,
          })(
            <Lov
              code="SPFM.USER_AUTH.CUSTOMER"
              textValue={recordSource.companyName}
              queryParams={{ withTenantFlag: 0 }}
              onChange={(value, record) => {
                setFieldsValue({
                  companyName: record.companyName,
                  partnerTenantId: record.customerTenantId,
                  partnerItemId: undefined,
                  itemCode: undefined,
                  itemName: undefined,
                  sourceCode: undefined,
                  uomName: undefined,
                });
                if (isEdit) {
                  onValid(
                    form,
                    'partnerCompanyId',
                    value,
                    'partnerItemId',
                    getFieldValue('partnerItemId')
                  );
                }
              }}
            />
          )}
        </FormItem>
        <FormItem
          {...formLayOut}
          label={intl.get('smdm.materiel.model.materiel.itemCode').d('物料编码')}
        >
          {getFieldDecorator('partnerItemId', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('smdm.materiel.model.materiel.itemCode').d('物料编码'),
                }),
              },
            ],
            initialValue: recordSource.partnerItemId,
          })(
            <Lov
              code="SPFM.CUSTOMER.ITEM"
              disabled={!getFieldValue('customCompanyId')}
              queryParams={{ partnerTenantId: getFieldValue('partnerTenantId') }}
              textValue={recordSource.itemCode}
              onChange={(value, record) => {
                setFieldsValue({
                  itemCode: record.itemCode,
                  itemName: record.itemName,
                  sourceCode: record.sourceCode,
                  uomName: record.uomName,
                });
                if (isEdit) {
                  onValid(
                    form,
                    'partnerCompanyId',
                    getFieldValue('customCompanyId'),
                    'partnerItemId',
                    value
                  );
                }
              }}
            />
          )}
        </FormItem>
        <FormItem
          {...formLayOut}
          label={intl.get('smdm.materiel.model.materiel.itemName').d('物料名称')}
        >
          {getFieldDecorator('itemName', {
            initialValue: recordSource.itemName,
          })(<Input disabled />)}
        </FormItem>
        <FormItem
          {...formLayOut}
          label={intl.get(`smdm.materiel.model.materiel.sourceCode`).d('数据来源')}
        >
          {getFieldDecorator('sourceCode', {
            initialValue: recordSource.sourceCode,
          })(<Input disabled />)}
        </FormItem>
        <FormItem
          {...formLayOut}
          label={intl.get(`smdm.materiel.model.materiel.uomName`).d('单位')}
        >
          {getFieldDecorator('uomName', {
            initialValue: recordSource.uomName,
          })(<Input disabled />)}
        </FormItem>
        <FormItem
          {...formLayOut}
          label={intl.get(`smdm.materiel.model.materiel.uomConversionRate`).d('转换率')}
        >
          {getFieldDecorator('uomConversionRate', {
            initialValue: recordSource.uomConversionRate,
          })(
            <InputNumber
              style={{ width: 100 }}
              min={0.00000001}
              formatter={(value) => `1:${value}`}
              parser={(value) => (isString(value) ? value?.replace('1:', '') : value)}
            />
          )}
        </FormItem>
      </Form>
    );
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { drawerVisible, recordSource, selectedRows } = this.state;
    const { dataSource } = this.props;
    const { content = [] } = dataSource;
    const columns = [
      {
        title: intl.get('smdm.materiel.model.materiel.customer.name').d('客户名称'),
        dataIndex: 'companyName',
      },
      {
        title: intl.get('smdm.materiel.model.materiel.itemCode').d('物料编码'),
        dataIndex: 'itemCode',
      },
      {
        title: intl.get('smdm.materiel.model.materiel.itemName').d('物料名称'),
        dataIndex: 'itemName',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.sourceCode`).d('数据来源'),
        dataIndex: 'sourceCode',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.uomName`).d('单位'),
        dataIndex: 'uomName',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.uomRate`).d('转换率(1:n)'),
        dataIndex: 'uomConversionRate',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 100,
        align: 'center',
        dataIndex: 'option',
        render: (_, record) => {
          return (
            <a
              onClick={() => {
                this.onOpen(record);
              }}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          );
        },
      },
    ];
    const rowSelection = {
      onChange: this.onSelectChange,
    };
    return (
      <React.Fragment>
        <div className="table-list-search" style={{ textAlign: 'right' }}>
          <Button
            disabled={isEmpty(selectedRows)}
            onClick={this.handleDelete}
            style={{ marginRight: 8 }}
          >
            {intl.get(`smdm.materiel.view.message.toolTip.partner.delete`).d('删除物料')}
          </Button>
          <Button
            type="primary"
            onClick={() => {
              this.onOpen();
            }}
          >
            {intl.get(`smdm.materiel.view.message.toolTip.partner.create`).d('新建物料')}
          </Button>
        </div>
        <Table
          bordered
          rowKey="partnerRelationId"
          dataSource={content}
          columns={columns}
          pagination={createPagination(dataSource)}
          rowSelection={rowSelection}
          onChange={this.handleTableChange}
        />
        <Drawer
          destroyOnClose
          title={
            recordSource.partnerRelationId
              ? intl.get(`smdm.materiel.view.message.toolTip.partner.edit`).d('编辑物料')
              : intl.get(`smdm.materiel.view.message.toolTip.partner.create`).d('新建物料')
          }
          placement="right"
          width="520px"
          onClose={this.onClose}
          visible={drawerVisible}
        >
          {this.renderForm()}
          <div className={styles['modal-button']}>
            <Button
              style={{
                marginRight: 8,
              }}
              onClick={this.onClose}
            >
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>
            <Button onClick={this.saveFormData} type="primary">
              {intl.get('hzero.common.button.ok').d('确定')}
            </Button>
          </div>
        </Drawer>
      </React.Fragment>
    );
  }
}

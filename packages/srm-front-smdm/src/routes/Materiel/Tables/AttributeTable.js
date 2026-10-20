/**
 * AttributeTable - 自定义物品属性
 * @date: 2018-9-25
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Button, Table, Drawer, Input, Row, Col } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { formatNumber } from '@/routes/utils';
import styles from '../index.less';
import AttributeValueComponent from '../components/AttributeValueComponent';

const FormItem = Form.Item;

/**
 * 自定义物品属性
 * @extends {Component} - PureComponent
 * @reactProps {String} organizationId - 租户Id
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class AttributeTable extends PureComponent {
  state = {
    drawerVisible: false,
    recordSource: [],
    selectedRows: [],
    idList: [],
  };

  componentDidMount() {
    const { onClearRows } = this.props;
    if (onClearRows) onClearRows(this.handleClearSelectedRows);
  }

  /**
   * 将selectedRows置空
   */
  @Bind()
  handleClearSelectedRows() {
    this.setState({ selectedRows: [] });
  }

  /**
   * 方法含义？
   * 参数？
   */
  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    const idList = [];
    selectedRows.forEach((item) => {
      if (!item.isLocal) {
        idList.push(item.itemAttributeId);
      }
    });
    this.setState({ selectedRows, idList });
  }

  /**
   * 方法含义？
   * 参数？
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
   */
  @Bind()
  onClose() {
    const { form } = this.props;
    form.resetFields();
    this.setState({ drawerVisible: false });
  }

  /**
   * 保存
   */
  @Bind()
  saveFormData() {
    const { form, dataSource = {}, onAdd } = this.props;
    const { recordSource = {} } = this.state;
    form.validateFields((err, fieldsValues) => {
      if (!err) {
        const maintenanceMethod = recordSource.templateId
          ? JSON.parse(recordSource.templateJson)?.maintenanceMethod
          : null;
        const { attributeValue } = fieldsValues;
        const newFieldsValues = recordSource.itemAttributeId
          ? {
              ...recordSource,
              ...fieldsValues,
              attributeValue:
                maintenanceMethod === 'DATE'
                  ? attributeValue?.format(DEFAULT_DATE_FORMAT)
                  : attributeValue,
            }
          : {
              ...fieldsValues,
              isCreat: true,
              isLocal: true,
              itemAttributeId: uuidv4(),
              attributeValue:
                maintenanceMethod === 'DATE'
                  ? attributeValue?.format(DEFAULT_DATE_FORMAT)
                  : attributeValue,
            };
        let newDataSource = isEmpty(dataSource) ? [] : [...dataSource];
        if (newFieldsValues.isCreat) {
          newDataSource.push(newFieldsValues);
        } else {
          const { itemAttributeId } = newFieldsValues;
          newDataSource = dataSource.map((item) => {
            if (item.itemAttributeId === itemAttributeId) {
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
        onAdd(dataList, 'attributeData', false);
        this.setState({ drawerVisible: false });
        form.resetFields();
      }
    });
  }

  /**
   * 删除数据
   */
  @Bind()
  handleDelete() {
    const { dataSource = {}, onDeleteRows } = this.props;
    const { selectedRows, idList } = this.state;

    const newSelectedRows = selectedRows.map((item) => {
      return item.itemAttributeId;
    });
    const newDataSource = dataSource.filter((item) => {
      return newSelectedRows.indexOf(item.itemAttributeId) > -1 === false;
    });
    this.setState({ selectedRows: [] });
    onDeleteRows(newDataSource, idList, 'deleteAttributeTableData', 'attributeData', false);
  }

  @Bind()
  renderForm() {
    const { form, customizeForm } = this.props;
    const { getFieldDecorator } = form;
    const { recordSource } = this.state;
    const formLayOut = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    return customizeForm(
      {
        code: 'SMDM_MATERIEL_ATTRIBUTETABLE.EDIT',
        form,
        dataSource: recordSource,
      },
      <Form>
        <Row>
          <Col span={24}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.attributeNameCode`).d('属性编码')}
            >
              {getFieldDecorator('attributeNameCode', {
                initialValue: recordSource.attributeNameCode,
              })(<Input trim inputChinese={false} typeCase="upper" />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.attributeName`).d('属性描述')}
            >
              {getFieldDecorator('attributeName', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`smdm.materiel.model.materiel.attributeName`).d('属性描述'),
                    }),
                  },
                ],
                initialValue: recordSource.attributeName,
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.attributeValueCode`).d('属性值编码')}
            >
              {getFieldDecorator('attributeValueCode', {
                initialValue: recordSource.attributeValueCode,
              })(<Input trim inputChinese={false} typeCase="upper" />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.attributeValue`).d('属性值')}
            >
              {getFieldDecorator('attributeValue', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`smdm.materiel.model.materiel.attributeValue`).d('属性值'),
                    }),
                  },
                ],
                initialValue: recordSource.attributeValue,
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  @Bind()
  handleChangeRecordSource(recordSource) {
    this.setState({
      recordSource,
    });
  }

  @Bind()
  renderdAttributeTemplateForm() {
    const { form, customizeForm } = this.props;
    const { getFieldDecorator } = form;
    const { recordSource } = this.state;
    const { templateJson } = recordSource;
    const { maintenanceMethod, requiredFlag } = JSON.parse(templateJson);
    const formLayOut = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    return customizeForm(
      {
        code: 'SMDM_MATERIEL_ATTRIBUTETABLE.EDIT',
        form,
        dataSource: recordSource,
      },
      <Form>
        <Row>
          <Col span={24}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.attributeNameCode`).d('属性编码')}
            >
              {getFieldDecorator('attributeNameCode', {
                initialValue: recordSource.attributeNameCode,
              })(<Input disabled />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.attributeName`).d('属性描述')}
            >
              {getFieldDecorator('attributeName', {
                initialValue: recordSource.attributeName,
              })(<Input disabled />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.attributeValueCode`).d('属性值编码')}
            >
              {getFieldDecorator('attributeValueCode', {
                initialValue: recordSource.attributeValueCode,
              })(<Input disabled={['MULTIPLE', 'RADIO'].includes(maintenanceMethod)} />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.attributeValue`).d('属性值')}
            >
              {getFieldDecorator('attributeValue', {
                rules: [
                  {
                    required: !!requiredFlag,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`smdm.materiel.model.materiel.attributeValue`).d('属性值'),
                    }),
                  },
                ],
                initialValue: recordSource.attributeValue,
              })(
                <AttributeValueComponent
                  recordSource={recordSource}
                  onChangeRecordSource={this.handleChangeRecordSource}
                />
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const { drawerVisible, recordSource, selectedRows } = this.state;
    const { dataSource, customizeTable } = this.props;
    const { templateId } = recordSource;
    const columns = [
      {
        title: intl.get(`smdm.materiel.model.materiel.attributeNameCode`).d('属性编码'),
        dataIndex: 'attributeNameCode',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.attributeName`).d('属性描述'),
        dataIndex: 'attributeName',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.attributeValueCode`).d('属性值编码'),
        dataIndex: 'attributeValueCode',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.attributeValue`).d('属性值'),
        dataIndex: 'attributeValue',
        render: (val, record) => {
          const { scale, maintenanceMethod } = record;
          if (maintenanceMethod === 'INTEGER') {
            return formatNumber(val);
          } else if (maintenanceMethod === 'FLOAT') {
            return formatNumber(val, scale);
          }
          return val;
        },
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
      getCheckboxProps: (record) => ({
        disabled: !!record.templateId,
      }),
    };
    return (
      <React.Fragment>
        <div className="table-list-search" style={{ textAlign: 'right' }}>
          <Button
            disabled={isEmpty(selectedRows)}
            onClick={this.handleDelete}
            style={{ marginRight: 8 }}
          >
            {intl.get(`smdm.materiel.view.message.toolTip.attribute.delete`).d('删除属性')}
          </Button>
          <Button
            type="primary"
            onClick={() => {
              this.onOpen();
            }}
          >
            {intl.get(`smdm.materiel.view.message.toolTip.attribute.create`).d('新建属性')}
          </Button>
        </div>
        {customizeTable(
          {
            code: 'SMDM_MATERIEL_ATTRIBUTETABLE.LIST',
          },
          <Table
            rowKey="itemAttributeId"
            dataSource={dataSource}
            columns={columns}
            bordered
            pagination={false}
            rowSelection={rowSelection}
          />
        )}
        {drawerVisible && (
          <Drawer
            title={
              recordSource.itemAttributeId
                ? intl.get(`smdm.materiel.view.message.toolTip.attribute.edit`).d('编辑属性')
                : intl.get(`smdm.materiel.view.message.toolTip.attribute.create`).d('新建属性')
            }
            placement="right"
            width="520px"
            destroyOnClose
            onClose={this.onClose}
            visible={drawerVisible}
          >
            {templateId ? this.renderdAttributeTemplateForm() : this.renderForm()}
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
        )}
      </React.Fragment>
    );
  }
}

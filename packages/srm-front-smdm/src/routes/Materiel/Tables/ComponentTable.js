/**
 * ComponentTable - 组件清单
 * @date: 2018-9-25
 * @author: yanglin <lin.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Button, Table, Drawer, Input, InputNumber, Row, Col } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { enableRender } from 'utils/renderer';
import uuidv4 from 'uuid/v4';
import Lov from 'components/Lov';
import Switch from 'components/Switch';
import { getCurrentOrganizationId, createPagination, getResponse } from 'utils/utils';
import TLEditor from 'components/TLEditor';
import intl from 'utils/intl';
import { fetchItemNameLang } from '@/services/materielService';
import { numberPrecision } from '@/routes/utils.js';
import styles from '../index.less';

const tenantId = getCurrentOrganizationId();
const FormItem = Form.Item;

/**
 * 自定义物品属性
 * @extends {Component} - PureComponent
 * @reactProps {String} organizationId - 租户Id
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class ComponentTable extends PureComponent {
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
      onTableChange({}, 'queryComponent');
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
   * 方法含义？
   * 参数？
   */
  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    const idList = [];
    selectedRows.forEach((item) => {
      if (!item.isLocal) {
        idList.push(item.componentId);
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
    const { form } = this.props;
    if (recordSource) {
      form.resetFields();
      this.setState({ drawerVisible: true, recordSource });
    } else {
      form.resetFields();
      this.setState({ drawerVisible: true, recordSource: { enabledFlag: 1 } });
    }
  }

  /**
   * 方法含义？
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
        const newFieldsValues = recordSource.componentId
          ? {
              ...recordSource,
              ...fieldsValues,
            }
          : {
              ...fieldsValues,
              isCreat: true,
              isLocal: true,
              componentId: uuidv4(),
            };
        let newDataSource = isEmpty(content) ? [] : [...content];
        if (newFieldsValues.isCreat) {
          newDataSource.push(newFieldsValues);
        } else {
          const { componentId } = newFieldsValues;
          newDataSource = content.map((item) => {
            if (item.componentId === componentId) {
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
        onAdd(dataList, 'componentData', true);
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
    const { selectedRows, idList } = this.state;
    const { content = [] } = dataSource;
    const newSelectedRows = selectedRows.map((item) => {
      return item.componentId;
    });
    const newDataSource = content.filter((item) => {
      return newSelectedRows.indexOf(item.componentId) > -1 === false;
    });
    this.setState({ selectedRows: [] });
    onDeleteRows(newDataSource, idList, 'deleteComponentTableData', 'componentData', true);
  }

  @Bind()
  handleTableChange(pagination) {
    this.props.onTableChange(pagination, 'queryComponent');
  }

  @Bind()
  handleComponentCodeChange(record) {
    const { form } = this.props;
    const { setFieldsValue, getFieldValue } = form;
    const newLangValue = {};

    const _tls = getFieldValue('_tls') || {};

    setFieldsValue({ componentLocalName: record?.itemName });
    if (record?.itemId) {
      fetchItemNameLang({
        itemId: record?.itemId,
      }).then((res) => {
        if (getResponse(res)) {
          res.forEach((ele) => {
            newLangValue[ele.lang] = ele.itemName;
          });
          setFieldsValue({
            _tls: {
              ..._tls,
              componentLocalName: newLangValue,
            },
            componentItemId: record?.itemId,
          });
        }
      });
    } else {
      setFieldsValue({
        componentItemId: null,
      });
    }
  }

  @Bind()
  renderForm() {
    const { form, customizeForm, remote } = this.props;
    const { getFieldDecorator, setFieldsValue, getFieldValue } = form;
    const { recordSource } = this.state;
    const formLayOut = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    const { disableCompentPrecision } = remote?.props?.process || {};
    return customizeForm(
      {
        code: 'SMDM_MATERIEL_COMPONENTTABLE.EDITFORM',
        form,
        dataSource: recordSource,
      },
      <Form>
        <Row>
          <Col span={24}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.lineNumber`).d('行号')}
            >
              {getFieldDecorator('lineNumber', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`smdm.materiel.model.materiel.lineNumber`).d('行号'),
                    }),
                  },
                ],
                initialValue: recordSource.lineNumber,
              })(<InputNumber trim precision={0} style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.componentCode`).d('组件代码')}
            >
              {getFieldDecorator('componentItemId', {
                initialValue: recordSource.componentItemId,
              })}
              {getFieldDecorator('componentCode', {
                initialValue: recordSource.componentCode,
              })(
                <Lov
                  code="SMDM.ITEM"
                  lovOptions={{ displayField: 'itemCode', valueField: 'itemCode' }}
                  onChange={(_, record) => {
                    this.handleComponentCodeChange(record);
                  }}
                  queryParams={{ tenantId }}
                  textValue={recordSource.componentCode}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.componentLocalName`).d('组件本地名称')}
            >
              {getFieldDecorator('componentLocalName', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`smdm.materiel.model.materiel.componentLocalName`)
                        .d('组件本地名称'),
                    }),
                  },
                ],
                initialValue: recordSource.componentLocalName,
              })(
                getFieldValue('componentCode') ? (
                  <Input disabled />
                ) : (
                  <TLEditor
                    label={intl
                      .get(`smdm.materiel.model.materiel.componentLocalName`)
                      .d('组件本地名称')}
                    field="componentLocalName"
                    token={recordSource._token}
                  />
                )
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.view.message.tab.affiliatedOrgTable`).d('所属组织')}
            >
              {getFieldDecorator('invOrganizationId', {
                initialValue: recordSource.invOrganizationId,
              })(
                <Lov
                  code="HPFM.OU_INV_ORGANIZATION"
                  onChange={(_, record) => {
                    setFieldsValue({ invOrganizationName: record.organizationName });
                  }}
                  queryParams={{ tenantId }}
                  textValue={recordSource.invOrganizationName}
                />
              )}
              {getFieldDecorator('invOrganizationName', {
                initialValue: recordSource.invOrganizationName,
              })}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.quantity`).d('数量')}
            >
              {getFieldDecorator('quantity', {
                initialValue: recordSource.quantity,
              })(
                <InputNumber
                  trim
                  numberGrouping
                  precision={
                    disableCompentPrecision
                      ? 6
                      : form.getFieldValue('uomPrecision') ?? recordSource.uomPrecision ?? 6
                  }
                  style={{ width: '100%' }}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.uomName`).d('单位')}
            >
              {getFieldDecorator('uomId', {
                initialValue: recordSource.uomId,
              })(
                <Lov
                  code="SMDM.ITEM.UOM.ORG"
                  lovOptions={{ valueField: 'uomId' }}
                  onChange={(_, record) => {
                    setFieldsValue({
                      uomName: record.uomCodeAndName,
                      uomPrecision: record.uomPrecision,
                    });
                  }}
                  queryParams={{ tenantId }}
                  textValue={recordSource.uomName}
                />
              )}
              {getFieldDecorator('uomName', {
                initialValue: recordSource.uomName,
              })}
              {getFieldDecorator('uomPrecision', {
                initialValue: recordSource.uomPrecision,
              })}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.height`).d('高度（米）')}
            >
              {getFieldDecorator('height', {
                initialValue: recordSource.height,
              })(<InputNumber trim precision={10} style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.depth`).d('深度（米）')}
            >
              {getFieldDecorator('depth', {
                initialValue: recordSource.depth,
              })(<InputNumber trim precision={10} style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.width`).d('宽度（米）')}
            >
              {getFieldDecorator('width', {
                initialValue: recordSource.width,
              })(<InputNumber trim precision={10} style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.netWeight`).d('净重（kg）')}
            >
              {getFieldDecorator('netWeight', {
                initialValue: recordSource.netWeight,
              })(<InputNumber trim precision={10} style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.grossWeight`).d('毛重（kg）')}
            >
              {getFieldDecorator('grossWeight', {
                initialValue: recordSource.grossWeight,
              })(<InputNumber trim precision={10} style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.originCountry`).d('生产国家')}
            >
              {getFieldDecorator('originCountry', {
                initialValue: recordSource.originCountry,
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.measurement`).d('物品测量')}
            >
              {getFieldDecorator('measurement', {
                initialValue: recordSource.measurement,
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.material`).d('材料')}
            >
              {getFieldDecorator('material', {
                initialValue: recordSource.material,
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.shippingMarkSize`).d('唛头尺寸')}
            >
              {getFieldDecorator('shippingMarkSize', {
                initialValue: recordSource.shippingMarkSize,
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.productBrand`).d('产品品牌/型号')}
            >
              {getFieldDecorator('productBrand', {
                initialValue: recordSource.productBrand,
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.materiel.enabledFlag`).d('是否启用')}
            >
              {form.getFieldDecorator('enabledFlag', {
                initialValue: recordSource.enabledFlag,
              })(<Switch />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const { drawerVisible, recordSource, selectedRows } = this.state;
    const { dataSource, customizeTable, remote } = this.props;
    const { content = [] } = dataSource;
    const { disableCompentPrecision } = remote?.props?.process || {};
    const columns = [
      {
        title: intl.get(`smdm.materiel.model.materiel.lineNumber`).d('行号'),
        dataIndex: 'lineNumber',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.componentCode`).d('组件代码'),
        dataIndex: 'componentCode',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.componentLocalName`).d('组件本地名称'),
        dataIndex: 'componentLocalName',
      },
      {
        title: intl.get(`smdm.materiel.view.message.tab.affiliatedOrgTable`).d('所属组织'),
        dataIndex: 'invOrganizationName',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.quantity`).d('数量'),
        dataIndex: 'quantity',
        render: (val, record) =>
          disableCompentPrecision
            ? val
            : val
            ? Number(numberPrecision(val, record.uomPrecision))
            : val,
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.uomName`).d('单位'),
        dataIndex: 'uomName',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.height`).d('高度（米）'),
        dataIndex: 'height',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.depth`).d('深度（米）'),
        dataIndex: 'depth',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.width`).d('宽度（米）'),
        dataIndex: 'width',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.netWeight`).d('净重（kg）'),
        dataIndex: 'netWeight',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.grossWeight`).d('毛重（kg）'),
        dataIndex: 'grossWeight',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.originCountry`).d('生产国家'),
        dataIndex: 'originCountry',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.measurement`).d('物品测量'),
        dataIndex: 'measurement',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.material`).d('材料'),
        dataIndex: 'material',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.shippingMarkSize`).d('唛头尺寸'),
        dataIndex: 'shippingMarkSize',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.productBrand`).d('产品品牌/型号'),
        dataIndex: 'productBrand',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.enabledFlag`).d('是否启用'),
        dataIndex: 'enabledFlag',
        render: (val) => enableRender(val ? 1 : 0),
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
            {intl.get(`smdm.materiel.view.message.toolTip.delete`).d('删除')}
          </Button>
          <Button
            type="primary"
            onClick={() => {
              this.onOpen();
            }}
          >
            {intl.get(`smdm.materiel.view.message.toolTip.create`).d('新建')}
          </Button>
        </div>
        {customizeTable(
          {
            code: 'SMDM_MATERIEL_COMPONENTTABLE.LIST',
          },
          <Table
            rowKey="componentId"
            dataSource={content}
            columns={columns}
            bordered
            pagination={createPagination(dataSource)}
            rowSelection={rowSelection}
            onChange={this.handleTableChange}
          />
        )}
        <Drawer
          title={
            recordSource.componentId
              ? intl.get(`smdm.materiel.view.message.toolTip.component.edit`).d('编辑组件')
              : intl.get(`smdm.materiel.view.message.toolTip.component.create`).d('新建组件')
          }
          placement="right"
          width="520px"
          destroyOnClose
          onClose={this.onClose}
          visible={drawerVisible}
          style={{ paddingBottom: 48 }}
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

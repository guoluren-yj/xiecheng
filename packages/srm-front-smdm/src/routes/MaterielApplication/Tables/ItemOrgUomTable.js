/**
 * ItemOrgUomTable - 物料关联关系
 * @date: 2020-03-16
 * @author: LS <Shuo.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Button, Table, Drawer, Input, InputNumber, Row, Col } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { EDIT_FORM_ROW_LAYOUT } from 'utils/constants';

import uuidv4 from 'uuid/v4';
import Lov from 'components/Lov';
// import { createPagination } from 'utils/utils';
import { enableRender } from 'utils/renderer';
import notification from 'utils/notification';
import Switch from 'components/Switch';
import intl from 'utils/intl';
import styles from '../index.less';

const FormItem = Form.Item;

/**
 * 客户物品
 * @extends {Component} - PureComponent
 * @reactProps {String} organizationId - 租户Id
 * @return React.element
 */
@connect(({ materielApplication }) => ({
  materielApplication,
}))
@Form.create({ fieldNameProp: null })
export default class ItemOrgUomTable extends PureComponent {
  state = {
    drawerVisible: false,
    recordSource: [],
  };

  componentWillUnmount() {
    this.props.dispatch({
      type: 'materielApplication/updateState',
      payload: {
        itemOrgUomData: [],
      },
    });
  }

  componentDidMount() {
    const { itemReqHeaderId, onTableChange } = this.props;
    if (itemReqHeaderId) {
      onTableChange({}, 'queryItemOrgUom');
    }
  }

  /**
   * 方法含义？
   * @param {*} pagination - <>
   */
  @Bind()
  handleTableChange(pagination) {
    this.props.onTableChange(pagination, 'queryItemOrgUom');
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
    const { form, dataSource = {}, onAdd, isEdit } = this.props;
    //    const { dispatch, organizationId, itemReqHeaderId } = this.props;
    const { content = [] } = dataSource;
    const { recordSource = {} } = this.state;
    form.validateFields((err, fieldsValues) => {
      if (!err) {
        // if (fieldsValues.uomId === fieldsValues.primaryUomId) {
        //   notification.warning({
        //     message: intl
        //       .get('smdm.materiel.model.ItemOrgUom.sameUom')
        //       .d('不可以选择同一个单位编码'),
        //   });
        // }
        //  else {
        const newFieldsValues = recordSource.itemOrgUomReqId
          ? {
            ...recordSource,
            ...fieldsValues,
          }
          : {
            ...fieldsValues,
            isCreat: true,
            isLocal: true,
            itemOrgUomReqId: uuidv4(),
          };
        let newDataSource = isEmpty(content) ? [] : [...content];
        if (newFieldsValues.isCreat) {
          newDataSource.push(newFieldsValues);
        } else {
          const { itemOrgUomReqId } = newFieldsValues;
          newDataSource = content.map((item) => {
            if (item.itemOrgUomReqId === itemOrgUomReqId) {
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
        if (isEdit) {
          // const valuelist = {
          //   itemReqHeaderId,
          //   organizationId: fieldsValues.organizationId,
          //   uomId: fieldsValues.uomId,
          //   itemOrgUomReqId: recordSource.itemOrgUomReqId ? recordSource.itemOrgUomReqId : null,
          //   primaryUomId: fieldsValues.primaryUomId,
          //   optionalAmount: fieldsValues.optionalAmount,
          //   primaryAmount: fieldsValues.primaryAmount,
          // };
          // dispatch({
          //   type: 'materielApplication/uomValid',
          //   payload: { organizationId, itemReqHeaderId, value: valuelist },
          // }).then(res => {
          // if (res && res.failed === true) {
          //   notification.warning({
          //     message: res.message,
          //   });
          // } else {
          // onAdd(dataList, 'itemOrgUomData', true);
          // this.setState({ drawerVisible: false });
          // }
          // });
          // if(){
          //   //uomId
          // }
          const flag = dataList.every((item) => {
            if (item.itemOrgUomReqId === newFieldsValues.itemOrgUomReqId) {
              return true;
            }
            return item.uomId !== newFieldsValues.uomId;
          });
          if (flag) {
            onAdd(dataList, 'itemOrgUomData', true);
            this.setState({ drawerVisible: false });
          } else {
            notification.warning({
              message: intl.get(`smdm.materiel.model.materiel.existUnit`).d('已存在相同的单位'),
            });
          }
        }
        // }
      }
    });
  }

  renderForm() {
    const { form = {}, primaryUomId, primaryUomName } = this.props;
    const { getFieldDecorator, setFieldsValue, getFieldValue } = form;
    const { recordSource } = this.state;
    const formLayOut = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    getFieldDecorator('primaryUomId', { initialValue: primaryUomId });
    getFieldDecorator('primaryUomName', { initialValue: primaryUomName });
    getFieldDecorator('uomName', { initialValue: recordSource.uomName });
    getFieldDecorator('organizationName', { initialValue: recordSource.organizationName });
    return (
      <Form layout="horizontal">
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col span={24}>
            <FormItem
              {...formLayOut}
              label={intl.get('smdm.materiel.model.ItemOrgUom.primaryAmount').d('Y')}
            >
              {getFieldDecorator('primaryAmount', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('smdm.materiel.model.ItemOrgUom.primaryAmount').d('Y'),
                    }),
                  },
                ],
                initialValue: recordSource.primaryAmount,
              })(<InputNumber min={0} />)}
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem
              {...formLayOut}
              label={intl.get('smdm.materiel.model.ItemOrgUom.primaryUomName').d('基本单位')}
            >
              {getFieldDecorator('primaryUomName', {})(<Input disabled />)}
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem
              {...formLayOut}
              label={intl.get('smdm.materiel.model.ItemOrgUom.optionalAmount').d('X')}
            >
              {getFieldDecorator('optionalAmount', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('smdm.materiel.model.ItemOrgUom.optionalAmount').d('X'),
                    }),
                  },
                ],
                initialValue: recordSource.optionalAmount,
              })(<InputNumber min={0} />)}
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem
              {...formLayOut}
              label={intl.get(`smdm.materiel.model.ItemOrgUom.uomName`).d('可选计量单位')}
            >
              {getFieldDecorator('uomId', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`smdm.materiel.model.ItemOrgUom.uomName`).d('可选计量单位'),
                    }),
                  },
                  {
                    validator: (rule, value, callback) => {
                      if (getFieldValue('uomId') === getFieldValue('primaryUomId')) {
                        callback(
                          new Error(
                            intl
                              .get('smdm.materiel.model.ItemOrgUom.sameUom')
                              .d(`不可以选择同一个单位编码`)
                          )
                        );
                      } else {
                        callback();
                      }
                    },
                  },
                ],
                initialValue: recordSource.uomId,
              })(
                <Lov
                  code="SMDM.ITEM.UOM.ORG"
                  textValue={recordSource.uomName}
                  queryParams={{ enabledFlag: 1 }}
                  onChange={(value, record) => {
                    setFieldsValue({
                      uomName: record.uomCodeAndName,
                    });
                  }}
                />
              )}
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem {...formLayOut} label={intl.get('hzero.common.status.enable').d('启用')}>
              {form.getFieldDecorator('enabledFlag', {
                initialValue: recordSource.enabledFlag === undefined ? 1 : recordSource.enabledFlag,
              })(<Switch />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { drawerVisible, recordSource } = this.state;
    const { dataSource, isEdit = false, editAble, customizeForm, customizeTable, form } = this.props;
    const { content = [] } = dataSource;
    const columns = [
      // {
      //   title: intl.get('smdm.materiel.model.ItemOrgUom.organizationName').d('库存组织'),
      //   dataIndex: 'organizationName',
      // },
      {
        title: intl.get('smdm.materiel.model.ItemOrgUom.primaryAmount').d('Y'),
        dataIndex: 'primaryAmount',
      },
      {
        title: intl.get('smdm.materiel.model.ItemOrgUom.primaryUomName').d('基本单位'),
        dataIndex: 'primaryUomName',
      },
      {
        title: intl.get(`smdm.materiel.model.ItemOrgUom.optionalAmount`).d('X'),
        dataIndex: 'optionalAmount',
      },
      {
        title: intl.get(`smdm.materiel.model.ItemOrgUom.uomName`).d('可选计量单位'),
        dataIndex: 'uomName',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.enabledFlag`).d('是否启用'),
        dataIndex: 'enabledFlag',
        render: (val) => ['0', 0, '1', 1].includes(val) ? enableRender(Number(val)) : val,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 100,
        align: 'center',
        dataIndex: 'option',
        render: (_, record) => {
          return (
            editAble && (
              <a
                onClick={() => {
                  this.onOpen(record);
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            )
          );
        },
      },
    ];
    return (
      <React.Fragment>
        {editAble && (
          <div className="table-list-search" style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              disabled={!isEdit}
              onClick={() => {
                this.onOpen();
              }}
            >
              {intl
                .get(`smdm.materiel.view.message.toolTip.ItemOrgUom.create`)
                .d('新建单位转换关系')}
            </Button>
          </div>
        )}
        {
          customizeTable && customizeTable({
            code: 'SMDM_MATERIELAPPLICATION_EDIT.UOM_LIST_NEW',
          },
            <Table
              bordered
              rowKey="partnerRelationReqId"
              dataSource={content}
              columns={columns}
              pagination={false}
            />
          )
        }
        <Drawer
          destroyOnClose
          title={
            recordSource.partnerRelationReqId
              ? intl.get(`smdm.materiel.view.message.toolTip.ItemOrgUom.edit`).d('编辑单位转换关系')
              : intl
                .get(`smdm.materiel.view.message.toolTip.ItemOrgUom.create`)
                .d('新建单位转换关系')
          }
          placement="right"
          width="520px"
          onClose={this.onClose}
          visible={drawerVisible}
        >
          {
            customizeForm ? customizeForm(
              {
                code: 'SMDM_MATERIELAPPLICATION_EDIT.UOM_FORM_NEW',
                form,
                dataSource: recordSource,
              },
              this.renderForm()
            ) : this.renderForm()
          }
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

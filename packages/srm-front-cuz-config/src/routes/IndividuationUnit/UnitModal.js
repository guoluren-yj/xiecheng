import React, { Component } from 'react';
import { Drawer, Form, Input, Button, Select, Switch, Row, TreeSelect } from 'hzero-ui';
import { Bind, Debounce } from 'lodash-decorators';
import { isNil } from "lodash";
import TLEditor from "hzero-front/lib/components/TLEditor"

import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import Lov from 'components/Lov';
import { LovMulti } from 'srm-front-cuz/components';
import { transfromTreeSelectKey } from '@/utils/util';
import { queryBusinessObjectRelationsTree } from '@/services/individuationUnitService';
import styles from './style/index.less';

const FormItem = Form.Item;
const { Option } = Select;

const CODE_UPPER = /^[A-Z0-9][A-Z0-9-_.]*$/;

@Form.create({ fieldNameProp: null })
export default class UnitModal extends Component {
  state = {
    modelList: [],
  };

  @Debounce(500)
  @Bind()
  handleChangeBussinessObj(_, bussinessObj) {
    if (!bussinessObj || !bussinessObj.businessObjectCode) {
      this.setState({ modelList: [] });
    } else {
      queryBusinessObjectRelationsTree({
        tenantId: getCurrentOrganizationId(),
        businessObjectCode: bussinessObj.businessObjectCode,
      }).then(res => {
        const result = getResponse(res);
        if (result) {
          const modelList = transfromTreeSelectKey(
            [result],
            'businessObjectRelationList',
            'relBusinessObjectName',
            'businessObjectRelationId'
          );
          this.setState({ modelList: modelList || [] });
        } else {
          this.setState({ modelList: [] });
        }
      });
    }
  }

  @Bind()
  create() {
    const { form, groupCode, handleCreate = () => {} } = this.props;
    form.validateFields((err, values = {}) => {
      if (!err) {
        const { sqlIds = [], unitCode = '', combineCode = -1, modelCode = -1 } = values;
        const params = {
          ...values,
          combineCode,
          modelCode,
          unitCode: groupCode.concat('.').concat(unitCode),
          sqlIds: sqlIds.join(','),
        };
        handleCreate(params);
      }
    });
  }

  @Bind()
  handleClose() {
    const { form, handleClose = () => {} } = this.props;
    form.resetFields();
    this.setState({ modelList: [] });
    handleClose();
  }

  @Bind()
  handleChangeUnitType(unitType) {
    if (['TABPANE', 'COLLAPSE', 'BTNGROUP', 'SECTION'].includes(unitType)) {
      this.props.form.setFieldsValue({
        combineCode: undefined,
        modelCode: undefined,
      });
    }
  }

  render() {
    const { modelList } = this.state;
    const {
      visible,
      groupName,
      groupCode = '',
      createListLoading,
      unitTypeOptions = [],
      form: { getFieldDecorator = () => {}, getFieldValue },
    } = this.props;
    const unitType = getFieldValue('unitType');
    const modelRequired = !isNil(getFieldValue("combineCode"));
    const isPureVirtual = ['TABPANE', 'COLLAPSE', 'BTNGROUP', 'SECTION'].includes(unitType);
    const boRequired = !['TABPANE', 'COLLAPSE', 'BTNGROUP', 'SECTION'].includes(unitType);
    return (
      <Drawer
        width={400}
        title={intl.get('hpfm.individuationUnit.view.message.title.createUnit').d('新建个性化单元')}
        visible={visible}
        closable
        destroyOnClose
        onClose={this.handleClose}
      >
        <Form layout="vertical" className={styles['unit-editor-form']}>
          <FormItem
            label={intl
              .get('hpfm.individuationUnit.model.individuationUnit.unitCode')
              .d('单元编码')}
          >
            {getFieldDecorator('unitCode', {
              rules: [
                {
                  required: true,
                  message: intl
                    .get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hpfm.individuationUnit.model.individuationUnit.unitCode')
                        .d('单元编码'),
                    })
                    .d(
                      `${intl
                        .get('hpfm.individuationUnit.model.individuationUnit.unitCode')
                        .d('单元编码')}不能为空`
                    ),
                },
                {
                  pattern: CODE_UPPER,
                  message: intl
                    .get('hpfm.customize.common.validate.unitCodeRule')
                    .d('全大写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”'),
                },
                {
                  max: 50,
                  message: intl.get('hzero.common.validation.max', {
                    max: 50,
                  }),
                },
              ],
            })(<Input typeCase="upper" addonBefore={(groupCode || '').concat('.')} />)}
          </FormItem>
          <FormItem
            label={intl
              .get('hpfm.individuationUnit.model.individuationUnit.unitName')
              .d('单元名称')}
          >
            {getFieldDecorator('unitName', {
              rules: [
                {
                  required: true,
                  message: intl
                    .get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hpfm.individuationUnit.model.individuationUnit.unitName')
                        .d('单元名称'),
                    })
                    .d(
                      `${intl
                        .get('hpfm.individuationUnit.model.individuationUnit.unitName')
                        .d('单元名称')}不能为空`
                    ),
                },
                {
                  max: 120,
                  message: intl.get('hzero.common.validation.max', {
                    max: 120,
                  }),
                },
              ],
            })(
              <TLEditor
                label={intl
                  .get('hpfm.individuationUnit.model.individuationUnit.unitName')
                  .d('单元名称')}
                field="unitName"
              />
            )}
          </FormItem>
          <FormItem
            label={intl
              .get('hpfm.individuationUnit.model.individuationUnit.unitType')
              .d('单元类型')}
          >
            {getFieldDecorator('unitType', {
              rules: [
                {
                  required: true,
                  message: intl
                    .get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hpfm.individuationUnit.model.individuationUnit.unitType')
                        .d('单元类型'),
                    })
                    .d(
                      `${intl
                        .get('hpfm.individuationUnit.model.individuationUnit.unitType')
                        .d('单元类型')}不能为空`
                    ),
                },
              ],
            })(
              <Select onChange={this.handleChangeUnitType}>
                {unitTypeOptions.map(item => (
                  <Option value={item.value}>{item.meaning}</Option>
                ))}
              </Select>
            )}
          </FormItem>
          <FormItem
            label={intl
              .get('hpfm.individuationUnit.model.individuationUnit.relateGroup')
              .d('所属单元组')}
          >
            {getFieldDecorator('unitGroupId', {
              initialValue: groupName,
            })(<Input disabled />)}
          </FormItem>
          <FormItem
            label={intl.get('hpfm.individuationUnit.model.individuationUnit.combinObj').d('关联业务对象组合')}
            style={{ display: isPureVirtual ? 'none' : 'block' }}
          >
            {getFieldDecorator('combineCode', {
              initialValue: undefined,
              rules: [
                {
                  required: boRequired,
                  message: intl
                    .get('hzero.common.validation.notNull', {
                      name: intl.get('hpfm.individuationUnit.model.individuationUnit.combinObj').d('关联业务对象组合'),
                    })
                    .d(
                      `${intl.get('hpfm.individuationUnit.model.individuationUnit.combinObj').d('关联业务对象组合')}不能为空`
                    ),
                },
              ],
            })(
              <Lov
                code="HMDE.BUSINESS_COMBINE.LIST"
                queryParams={{ businessObjectType: 'COMBINE' }}
                onChange={this.handleChangeBussinessObj}
                lovOptions={{ valueField: 'businessObjectCode' }}
              />
            )}
          </FormItem>
          <FormItem
            label={intl
              .get('hpfm.individuationUnit.model.individuationUnit.modelName')
              .d('关联主模型')}
              style={{ display: isPureVirtual ? 'none' : 'block' }}
          >
            {getFieldDecorator('modelCode', {
              initialValue: undefined,
              rules: [
                {
                  required: boRequired || modelRequired,
                  message: intl
                    .get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hpfm.individuationUnit.model.individuationUnit.modelName')
                        .d('关联主模型'),
                    })
                    .d(
                      `${intl
                        .get('hpfm.individuationUnit.model.individuationUnit.modelName')
                        .d('关联主模型')}不能为空`
                    ),
                },
              ],
            })(
              <TreeSelect
                treeData={modelList}
                treeDefaultExpandAll
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              />
            )}
          </FormItem>
          <FormItem
            label={intl.get('hpfm.customize.common.businessObjectRange').d('可用业务对象范围')}
            style={{ display: isPureVirtual ? 'none' : 'block' }}
          >
            {getFieldDecorator('businessObjectRange', {
              rules: [
                {
                  required: boRequired,
                  message: intl
                    .get('hzero.common.validation.notNull', {
                      name: intl.get('hpfm.customize.common.businessObjectRange').d('可用业务对象范围'),
                    })
                    .d(`${intl.get('hpfm.customize.common.businessObjectRange').d('可用业务对象范围')}不能为空`),
                },
              ],
            })(
              <LovMulti
                placeholder={intl.get('hpfm.customize.common.businessObjectRange.placeholder').d('默认全选')}
                code="HPFM.CUST.COMBINE.BUSINESS.OBJECT"
                queryParams={{ combineCode: getFieldValue('combineCode')}}
              />
            )}
          </FormItem>
          <FormItem
            label={intl.get('hpfm.individuationUnit.model.individuationUnit.sqlIds').d('SQL IDs')}
            style={{ display: isPureVirtual ? 'none' : 'block' }}
          >
            {getFieldDecorator('sqlIds', {})(
              <Select mode="tags" dropdownClassName={styles['sqlIds-select-options']} />
            )}
          </FormItem>
        </Form>
        <Form
          layout="inline"
          className={`${styles['unit-editor-form']} ${styles['inline-form']}`}
          style={{ marginBottom: 50 }}
        >
          <Row>
            <FormItem
              label={intl.get('hpfm.individuationUnit.model.individuationUnit.readOnly').d('只读')}
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 20 }}
            >
              {getFieldDecorator('readOnly', {
                initialValue: 0,
              })(<Switch checkedValue={1} unCheckedValue={0} />)}
            </FormItem>
          </Row>
        </Form>
        <div className={styles['model-bottom-button']}>
          <Button
            type="primary"
            loading={createListLoading}
            style={{ marginRight: 8 }}
            onClick={this.create}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button disabled={createListLoading} onClick={this.handleClose}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </div>
      </Drawer>
    );
  }
}

import React, { Component } from 'react';
import { Drawer, Form, Input, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import Lov from "components/Lov";
import TLEditor from "hzero-front/lib/components/TLEditor"
import intl from 'utils/intl';
import { CODE_UPPER } from 'utils/regExp';

import styles from './style/index.less';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class UnitModal extends Component {
  @Bind()
  copy() {
    const { form, groupCode, handleCopyUnit = () => {} } = this.props;
    form.validateFields((err, values = {}) => {
      if (!err) {
        const { unitCode = '' } = values;
        const params = {
          ...values,
          unitCode: groupCode.concat('.').concat(unitCode),
        };
        handleCopyUnit(params);
      }
    });
  }

  render() {
    const {
      visible,
      groupCode = '',
      unitGroupId,
      loading,
      handleClose = () => {},
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
    } = this.props;

    return (
      <Drawer
        width={400}
        title={intl.get('hpfm.individuationUnit.view.message.title.copyUnit').d('复制个性化单元')}
        visible={visible}
        closable
        destroyOnClose
        onClose={handleClose}
      >
        <Form layout="vertical" className={styles['unit-editor-form']}>
          <FormItem
            label={intl
                .get('hpfm.individuationUnit.model.individuationUnit.unitGroup')
                .d('单元组')}
          >
            {getFieldDecorator('unitGroupId', {
              initialValue: unitGroupId,
              rules: [
                {
                  required: true,
                  message: intl
                    .get('hzero.common.validation.notNull', {
                      name: intl
                      .get('hpfm.individuationUnit.model.individuationUnit.unitGroup')
                      .d('单元组'),
                    }),
                },
              ],
            })(
              <Lov
                textValue={groupCode}
                code="HPFM.CUST.UNIT_GROUP"
                onChange={(_, record)=>{
                  setFieldsValue({unitGroupCode: record.groupCode});
                }}
              />
            )}
            {getFieldDecorator("unitGroupCode", {initialValue: groupCode})}
          </FormItem>
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
                    .get('hzero.common.validation.codeUpper')
                    .d('全大写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”'),
                },
                {
                  max: 100-(getFieldValue("unitGroupCode") || '').length,
                  message: intl.get('hzero.common.validation.max', {
                    max: 100,
                  }),
                },
              ],
            })(<Input typeCase="upper" addonBefore={(getFieldValue("unitGroupCode") || '').concat('.')} />)}
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
              .get('hpfm.individuationUnit.model.individuationUnit.copyUnitCode')
              .d('复制的单元编码')}
          >
            {getFieldDecorator('copyUnitCode', {
              rules: [
                {
                  required: true,
                  message: intl
                    .get('hzero.common.validation.notNull', {
                      name: intl
                        .get('hpfm.individuationUnit.model.individuationUnit.copyUnitCode')
                        .d('复制的单元编码'),
                    })
                    .d(
                      `${intl
                        .get('hpfm.individuationUnit.model.individuationUnit.copyUnitCode')
                        .d('复制的单元编码')}不能为空`
                    ),
                },
                {
                  pattern: CODE_UPPER,
                  message: intl
                    .get('hzero.common.validation.codeUpper')
                    .d('全大写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”'),
                },
                {
                  max: 100,
                  message: intl.get('hzero.common.validation.max', {
                    max: 100,
                  }),
                },
              ],
            })(<Lov code="HPFM.CUST.UNIT" />)}
          </FormItem>
        </Form>
        <div className={styles['model-bottom-button']}>
          <Button type="primary" loading={loading} style={{ marginRight: 8 }} onClick={this.copy}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button disabled={loading} onClick={handleClose}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </div>
      </Drawer>
    );
  }
}

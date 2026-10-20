/* eslint no-underscore-dangle: 0 */
import React from 'react';
import { Form, Input, InputNumber } from 'hzero-ui';
import intl from 'utils/intl';
import ModalForm from 'components/Modal/ModalForm';
import Switch from 'components/Switch';
import Lov from 'components/Lov';
import TLEditor from 'components/TLEditor';

@Form.create({ fieldNameProp: null })
export default class CreateForm extends ModalForm {
  renderForm() {
    const { form, editValue = {} } = this.props;
    const {
      ledgerCode,
      ledgerName,
      periodSetId,
      periodSetName,
      currencyCode,
      coaId,
      ledgerId,
      enabledFlag,
      sourceCode,
    } = editValue;
    const formLayOut = {
      labelCol: { span: 5 },
      wrapperCol: { span: 15 },
    };
    return (
      <React.Fragment>
        <Form.Item
          {...formLayOut}
          label={intl.get('smdm.ledger.model.ledger.ledgerCode').d('账套编码')}
        >
          {form.getFieldDecorator('ledgerCode', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('smdm.ledger.model.ledger.ledgerCode').d('账套编码'),
                }),
              },
            ],
            initialValue: ledgerCode,
          })(<Input inputChinese={false} disabled={!!ledgerId || sourceCode === 'ERP'} />)}
        </Form.Item>
        <Form.Item
          {...formLayOut}
          label={intl.get('smdm.ledger.model.ledger.ledgerName').d('账套名称')}
        >
          {form.getFieldDecorator('ledgerName', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('smdm.ledger.model.ledger.ledgerName').d('账套名称'),
                }),
              },
            ],
            initialValue: ledgerName,
          })(
            <TLEditor
              label={intl.get('smdm.ledger.model.ledger.ledgerName').d('账套名称')}
              field="ledgerName"
              token={editValue._token}
              disabled={sourceCode === 'ERP'}
            />
            // <Input disabled={sourceCode === 'ERP'} />
          )}
        </Form.Item>
        <Form.Item
          {...formLayOut}
          label={intl.get('smdm.ledger.model.ledger.periodSetId').d('会计期')}
        >
          {form.getFieldDecorator('periodSetId', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('smdm.ledger.model.ledger.periodSetId').d('会计期'),
                }),
              },
            ],
            initialValue: periodSetId,
          })(
            <Lov
              // style={{ width: 180 }}
              code="SMDM.PERIODSET"
              textValue={periodSetName}
              disabled={sourceCode === 'ERP'}
            />
          )}
        </Form.Item>
        <Form.Item
          {...formLayOut}
          label={intl.get('smdm.ledger.model.ledger.currencyCode').d('本位币')}
        >
          {form.getFieldDecorator('currencyCode', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('smdm.ledger.model.ledger.currencyCode').d('本位币'),
                }),
              },
            ],
            initialValue: currencyCode,
          })(
            <Lov
              // style={{ width: 180 }}
              code="SMDM.LEDGER.CURRENCY"
              textValue={currencyCode}
              disabled={sourceCode === 'ERP'}
            />
          )}
        </Form.Item>
        <Form.Item {...formLayOut} label={intl.get('smdm.ledger.model.ledger.coaId').d('科目表')}>
          {/* TODO: 应为 Lov */}
          {form.getFieldDecorator('coaId', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('smdm.ledger.model.ledger.coaId').d('科目表'),
                }),
              },
            ],
            initialValue: coaId,
          })(<InputNumber disabled={sourceCode === 'ERP'} style={{ width: '295px' }} />)}
        </Form.Item>
        <Form.Item
          {...formLayOut}
          label={intl.get('smdm.ledger.model.ledger.sourceCode').d('来源')}
        >
          {/* TODO: 默认来源为 SRM */}
          {form.getFieldDecorator('sourceCode', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('smdm.ledger.model.ledger.sourceCode').d('来源'),
                }),
              },
            ],
            initialValue: 'SRM',
          })(<Input disabled />)}
        </Form.Item>
        <Form.Item
          {...formLayOut}
          label={intl.get('smdm.ledger.model.ledger.enabledFlag').d('是否启用')}
        >
          {form.getFieldDecorator('enabledFlag', {
            valuePropName: 'checked',
            initialValue: enabledFlag === 0 ? 0 : 1,
          })(<Switch />)}
        </Form.Item>
      </React.Fragment>
    );
  }
}

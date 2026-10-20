import React, { Component } from 'react';
import { Modal, Form, Checkbox } from 'hzero-ui';
import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';

function renderfieldName(value) {
  switch (value) {
    case 'techAttachmentUuid':
      return intl.get(`ssrc.sourceTemplate.view.sourceTemplate.techAttachmentUuid`).d('技术附件');
    case 'businessAttachmentUuid':
      return intl
        .get(`ssrc.sourceTemplate.view.sourceTemplate.businessAttachmentUuid`)
        .d('商务附件');
    case 'supplierTechAttachmentUuid':
      return intl
        .get(`ssrc.sourceTemplate.view.sourceTemplate.supplierTechAttachmentUuid`)
        .d('技术附件（供应商）');
    case 'supplierBusinessAttachmentUuid':
      return intl
        .get(`ssrc.sourceTemplate.view.sourceTemplate.supplierBusinessAttachmentUuid`)
        .d('商务附件（供应商）');
    default:
      break;
  }
}

@Form.create({ fieldNameProp: null })
@connect(({ sourceTemplate }) => ({
  sourceTemplate,
}))
export default class KeyRFModal extends Component {
  /**
   * 供应商可见勾选
   * @param {?Event} e - 勾选框事件
   * @param {!Object} record - 行记录
   */
  @Bind()
  handleChangeSupplierVisible(e = {}, record = {}) {
    const { qualificationType } = this.props;
    const form = record.$form;
    const value = e.target.checked;
    if (value === 0) {
      if (qualificationType === 'PRE') {
        form.setFieldsValue({
          beforeVisibleFlag: 0,
          prequalVisibleFlag: 0,
        });
      } else {
        form.setFieldsValue({
          beforeVisibleFlag: 0,
        });
      }
    }
  }

  /**
   * 预审通过前可见勾选
   * @param {?Event} e - 勾选框事件
   * @param {!Object} record - 行记录
   */
  @Bind()
  handleChangePreVisible(e = {}, record = {}) {
    const form = record.$form;
    const value = e.target.checked;
    if (value === 0) {
      form.setFieldsValue({
        beforeVisibleFlag: 0,
      });
    }
  }

  render() {
    const {
      visible,
      handleSaveRFModal,
      handleCancelKeyFiledModal,
      sourceTemplate: { newKeyFiledRFXInfo },
    } = this.props;
    const filterData = newKeyFiledRFXInfo.filter((item) => item.fieldName !== 'totalBudget');
    const tempColumns = [
      // 无需资格审查
      {
        title: intl.get(`ssrc.sourceTemplate.view.sourceTemplate.fieldName`).d('字段名称'),
        dataIndex: 'fieldName',
        width: 120,
        render: (val) => renderfieldName(val),
      },
      {
        // 资格预审_预审通过前可见列
        title: intl.get(`ssrc.sourceTemplate.model.sourceTemplate.requiredFlag`).d('是否必输'),
        dataIndex: 'requiredFlag',
        width: 80,
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('requiredFlag', {
              initialValue: val,
            })(
              <Checkbox
                checkedValue={1}
                unCheckedValue={0}
                disabled={
                  record.fieldName === 'techAttachmentUuid' ||
                  record.fieldName === 'businessAttachmentUuid'
                }
              />
            )}
          </Form.Item>
        ),
      },
      {
        // 资格预审_预审通过前可见列
        title: intl
          .get(`ssrc.sourceTemplate.model.sourceTemplate.supplierPreVisibleFlag`)
          .d('供应商预审通过前可见'),
        dataIndex: 'prequalVisibleFlag',
        width: 80,
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('prequalVisibleFlag', {
              initialValue: val,
            })(
              <Checkbox
                checkedValue={1}
                unCheckedValue={0}
                disabled={
                  record.fieldName === 'supplierTechAttachmentUuid' ||
                  record.fieldName === 'supplierBusinessAttachmentUuid'
                }
                onChange={(value) => this.handleChangePreVisible(value, record)}
              />
            )}
          </Form.Item>
        ),
      },
    ];
    return (
      <Modal
        title={intl
          .get('ssrc.sourceTemplate.model.template.keyDisplayControl')
          .d('关键字段显示控制')}
        visible={visible}
        width={750}
        onOk={handleSaveRFModal}
        onCancel={handleCancelKeyFiledModal}
      >
        <Form>
          <EditTable
            bordered
            columns={tempColumns}
            rowKey="tmplFieldColId"
            dataSource={filterData}
            scroll={{ x: scrollX }}
            pagination={false}
          />
        </Form>
      </Modal>
    );
  }
}

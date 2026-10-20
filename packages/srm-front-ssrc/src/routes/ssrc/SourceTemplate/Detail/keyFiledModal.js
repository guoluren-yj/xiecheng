import React, { Component } from 'react';
import { Modal, Form, Checkbox } from 'hzero-ui';
import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';

function renderfieldName(value) {
  switch (value) {
    case 'totalBudget':
      return intl.get(`ssrc.sourceTemplate.view.sourceTemplate.totalBudget`).d('预算金额');
    case 'techAttachmentUuid':
      return intl.get(`ssrc.sourceTemplate.view.sourceTemplate.techAttachmentUuid`).d('技术附件');
    case 'businessAttachmentUuid':
      return intl
        .get(`ssrc.sourceTemplate.view.sourceTemplate.businessAttachmentUuid`)
        .d('商务附件');
    default:
      break;
  }
}

@Form.create({ fieldNameProp: null })
@connect(({ sourceTemplate }) => ({
  sourceTemplate,
}))
export default class Detail extends Component {
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
      qualificationType,
      KeyFieldModalVisible,
      handleSaveKeyFiledModal,
      handleCancelKeyFiledModal,
      sourceTemplate: { newKeyFiledBIDInfo },
    } = this.props;
    // 请注意初始化时, render顺序会按照列的顺序执行, 如果B列在A列后, 而A列的disabled属性, 是通过B列form中的value控制, 那么初始化时A列拿不到
    // B列form的value值, 要想获取到正确B列form的value值, 至少需要在下一次event loop render时才可以正确获取!!!
    const tempColumns = [
      // 无需资格审查
      {
        title: intl.get(`ssrc.sourceTemplate.view.sourceTemplate.fieldName`).d('字段名称'),
        dataIndex: 'fieldName',
        width: 120,
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('requiredFlag')(<div>{renderfieldName(val)}</div>)}
          </Form.Item>
        ),
      },
      {
        title: intl.get(`ssrc.sourceTemplate.model.sourceTemplate.requiredFlag`).d('是否必填'),
        dataIndex: 'requiredFlag',
        width: 80,
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('requiredFlag', {
              initialValue: val,
            })(<Checkbox checkedValue={1} unCheckedValue={0} />)}
          </Form.Item>
        ),
      },
      {
        title: intl
          .get(`ssrc.sourceTemplate.model.sourceTemplate.supplierVisibleFlag`)
          .d('供应商可见'),
        dataIndex: 'supplierVisibleFlag',
        width: 80,
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('supplierVisibleFlag', {
              initialValue:
                record.fieldName === 'totalBudget'
                  ? val === undefined || val === null
                    ? 0
                    : val
                  : 1,
            })(
              <Checkbox
                checkedValue={1}
                unCheckedValue={0}
                disabled={record.fieldName !== 'totalBudget'}
                onChange={(value) => this.handleChangeSupplierVisible(value, record)}
              />
            )}
          </Form.Item>
        ),
      },
      {
        title: intl
          .get(`ssrc.sourceTemplate.model.sourceTemplate.beforeVisibleFlag`)
          .d('响应前可见'),
        dataIndex: 'beforeVisibleFlag',
        width: 80,
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('beforeVisibleFlag', {
              initialValue:
                record.supplierVisibleFlag === undefined || record.supplierVisibleFlag === null
                  ? record.fieldName === 'totalBudget'
                    ? 0
                    : 1
                  : record.prequalVisibleFlag === 0
                  ? 0
                  : val,
            })(
              <Checkbox
                checkedValue={1}
                unCheckedValue={0}
                disabled={
                  record.$form.getFieldValue('supplierVisibleFlag') === 0 ||
                  record.$form.getFieldValue('prequalVisibleFlag') === 0 ||
                  ((record.prequalVisibleFlag === undefined || record.prequalVisibleFlag === 0) &&
                    qualificationType === 'PRE' &&
                    record.$form.getFieldValue('prequalVisibleFlag') === undefined)
                }
              />
            )}
          </Form.Item>
        ),
      },
      {
        // 资格预审_预审通过前可见列
        title: intl
          .get(`ssrc.sourceTemplate.model.sourceTemplate.prequalVisibleFlag`)
          .d('预审通过前可见'),
        dataIndex: 'prequalVisibleFlag',
        width: 80,
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('prequalVisibleFlag', {
              initialValue:
                record.supplierVisibleFlag === undefined || record.supplierVisibleFlag === null
                  ? record.fieldName === 'totalBudget'
                    ? 0
                    : 1
                  : record.$form.getFieldValue('supplierVisibleFlag') === 0
                  ? 0
                  : val,
            })(
              <Checkbox
                checkedValue={1}
                unCheckedValue={0}
                disabled={record.$form.getFieldValue('supplierVisibleFlag') === 0}
                onChange={(value) => this.handleChangePreVisible(value, record)}
              />
            )}
          </Form.Item>
        ),
      },
    ];

    // 根据是否需要资格预审, 进行二次处理 case 'NONE': 无需资格审查; case 'PRE': 资格预审
    const Columns =
      qualificationType === 'PRE' ? tempColumns : tempColumns.slice(0, tempColumns.length - 1);
    return (
      <Modal
        title={intl
          .get('ssrc.sourceTemplate.model.template.keyDisplayControl')
          .d('关键字段显示控制')}
        visible={KeyFieldModalVisible}
        width={750}
        onOk={handleSaveKeyFiledModal}
        onCancel={handleCancelKeyFiledModal}
      >
        <Form>
          <EditTable
            bordered
            columns={Columns}
            rowKey="tmplFieldColId"
            dataSource={newKeyFiledBIDInfo}
            scroll={{ x: scrollX }}
            pagination={false}
          />
        </Form>
      </Modal>
    );
  }
}

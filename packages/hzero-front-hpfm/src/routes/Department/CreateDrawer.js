import React, { PureComponent } from 'react';
import { Form, Input, InputNumber, Modal, Switch, Col, Row } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import TLEditor from 'components/TLEditor';

import CostCenter from './CostCenter';

/**
 * 部门维护-数据修改滑窗(抽屉)
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {string} anchor - 抽屉滑动位置
 * @reactProps {string} title - 抽屉标题
 * @reactProps {boolean} visible - 抽屉是否可见
 * @reactProps {Function} onOk - 抽屉确定操作
 * @reactProps {Object} form - 表单对象
 * @reactProps {Object} itemData - 部门实体
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class Drawer extends PureComponent {
  /**
   * 确定操作
   */
  @Bind()
  saveBtn() {
    const { form, onOk, itemData } = this.props;
    if (onOk) {
      form.validateFields((err, values) => {
        if (!err) {
          // 校验通过，进行保存操作
          const { costCenters } = values;
          const costIds = costCenters ? costCenters.map((o) => o.costId) : null;
          const data = {
            ...itemData,
            ...values,
            costIds,
          };
          onOk([data]);
        }
      });
    }
  }

  /**
   * 取消操作
   */
  @Bind()
  cancelBtn() {
    this.props.onCancel();
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      anchor,
      title,
      form,
      loading,
      itemData = {},
      onQueryCostCenterData,
      costCenterData,
      customizeForm,
    } = this.props;
    const { getFieldDecorator } = form;
    const formLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 12 },
    };
    return (
      <Modal
        destroyOnClose
        visible
        title={title}
        width={450}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        confirmLoading={loading}
        onOk={this.saveBtn}
        onCancel={this.cancelBtn}
        cancelText={intl.get('hzero.common.button.cancel').d('取消')}
      >
        {customizeForm(
          { code: 'SPFM.ORGANIZATION.PAGE_DEPFORM', form, dataSource: itemData },
          <Form>
            <Row style={{ marginBottom: 10 }}>
              <Col md={24} span={24}>
                <Form.Item label={intl.get('entity.department.code').d('部门编码')} {...formLayout}>
                  {getFieldDecorator('unitCode', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('entity.department.code').d('部门编码'),
                        }),
                      },
                      {
                        pattern: '^[a-zA-Z0-9][\\x00-\\x7B\\x7D-\\xFF]*$',
                        message: intl
                          .get('hzero.common.validation.codeAndSymbols')
                          .d('必须以字母、数字开头，可包含除"|"外的英文符号'),
                      },
                      {
                        max: 130,
                        message: intl.get('hzero.common.validation.max', { max: 130 }),
                      },
                    ],
                  })(<Input trim inputChinese={false} />)}
                </Form.Item>
              </Col>
              <Col md={24} span={24}>
                <Form.Item label={intl.get('entity.department.name').d('部门名称')} {...formLayout}>
                  {getFieldDecorator('unitName', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('entity.department.name').d('部门名称'),
                        }),
                      },
                    ],
                  })(
                    <TLEditor
                      label={intl.get('entity.department.name').d('部门名称')}
                      field="unitName"
                    />
                  )}
                </Form.Item>
              </Col>
              <Col md={24} span={24}>
                <Form.Item
                  label={intl
                    .get('hpfm.department.model.department.principalEmployeeId')
                    .d('部门负责员工')}
                  {...formLayout}
                >
                  {getFieldDecorator('principalEmployeeId')(<Lov code="HPFM.ON_EMPLOYEE" />)}
                </Form.Item>
              </Col>
              <Col md={24} span={24}>
                <Form.Item
                  label={intl.get('hpfm.department.model.department.quickIndex').d('快速索引')}
                  {...formLayout}
                >
                  {getFieldDecorator('quickIndex', {
                    rules: [
                      {
                        max: 30,
                        message: intl.get('hzero.common.validation.max', {
                          max: 30,
                        }),
                      },
                    ],
                  })(
                    <TLEditor
                      label={intl.get('hpfm.department.model.department.quickIndex').d('快速索引')}
                      field="quickIndex"
                    />
                  )}
                </Form.Item>
              </Col>
              <Col md={24} span={24}>
                <Form.Item
                  label={intl.get('hpfm.department.model.department.phoneticize').d('拼音')}
                  {...formLayout}
                >
                  {getFieldDecorator('phoneticize', {
                    rules: [
                      {
                        max: 240,
                        message: intl.get('hzero.common.validation.max', {
                          max: 240,
                        }),
                      },
                    ],
                  })(<Input inputChinese={false} />)}
                </Form.Item>
              </Col>
              <Col md={24} span={24}>
                {itemData.parentUnitName && (
                  <Form.Item
                    label={intl.get('hpfm.department.model.unit.parentUnit').d('上级部门')}
                    {...formLayout}
                  >
                    {getFieldDecorator('parentUnitName', {
                      initialValue: itemData.parentUnitName,
                    })(<Input disabled />)}
                  </Form.Item>
                )}
              </Col>
              <Col md={24} span={24}>
                <Form.Item
                  label={intl.get('hpfm.common.model.common.orderSeq').d('排序号')}
                  {...formLayout}
                >
                  {getFieldDecorator('orderSeq', {
                    initialValue: 1,
                  })(<InputNumber style={{ width: '100%' }} min={1} precision={0} />)}
                </Form.Item>
              </Col>
              <Col md={24} span={24}>
                <Form.Item
                  label={intl.get('hpfm.department.model.department.Flag').d('是否启用预算')}
                  {...formLayout}
                >
                  {getFieldDecorator('enableBudgetFlag', {
                    initialValue: 0,
                  })(<Switch checkedValue={1} unCheckedValue={0} />)}
                </Form.Item>
              </Col>
              <Col md={24} span={24}>
                <Form.Item
                  label={intl
                    .get('hpfm.department.model.department.ownerCostCentral')
                    .d('所属成本中心')}
                  {...formLayout}
                >
                  {getFieldDecorator('costCenters')(
                    <CostCenter
                      search={onQueryCostCenterData}
                      queryParams={{ tenantId: getCurrentOrganizationId() }}
                      data={costCenterData}
                      lovOptions={{
                        displayField: 'costName',
                        valueField: 'costId',
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </Modal>
    );
  }
}

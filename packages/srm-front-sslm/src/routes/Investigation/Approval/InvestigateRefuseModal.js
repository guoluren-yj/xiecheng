/*
 * @Date: 2024-01-23 11:00:39
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useEffect } from 'react';
import { Form, Input, Modal, Spin, Row, Col } from 'hzero-ui';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import Checkbox from 'components/Checkbox';
import ValueList from 'components/ValueList';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const FormItem = Form.Item;
const { TextArea } = Input;
const refuseItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

const InvestigateRefuseModal = ({
  form,
  onOk,
  onRef,
  onCancel,
  companyId,
  allLoading,
  customizeForm,
  rejectModalVisible,
}) => {
  const { getFieldValue, getFieldDecorator, setFieldsValue } = form;

  useEffect(() => {
    onRef(form);
  }, [onRef]);

  return (
    <Modal
      width={640}
      destroyOnClose
      onOk={onOk}
      onCancel={onCancel}
      confirmLoading={allLoading}
      visible={rejectModalVisible}
      title={intl.get('sslm.investigCorrelat.view.title.investigateRefuse').d('调查表拒绝')}
    >
      <Spin spinning={allLoading || false}>
        {customizeForm(
          {
            form,
            code: 'SSLM.INVESTIGATION_APPROVAL_DETAIL.REJECT_FORM',
          },
          <Form layout="horizontal">
            <Row>
              <Col span={24}>
                <FormItem
                  {...refuseItemLayout}
                  label={intl
                    .get(`sslm.investigCorrelat.view.message.isChangeInvestigate`)
                    .d('是否变更调查表')}
                  extra={intl
                    .get(`sslm.investigCorrelat.view.message.changeWarning`)
                    .d('变更调查表模版后，原调查表将被取消作废，供应商需要重新填写新调查表内容。')}
                >
                  {getFieldDecorator('isChange', {
                    initialValue: 0,
                  })(<Checkbox />)}
                </FormItem>
              </Col>
            </Row>
            {!!getFieldValue('isChange') && (
              <Row>
                <Col span={24}>
                  <FormItem
                    {...refuseItemLayout}
                    label={intl
                      .get(`sslm.investigCorrelat.view.message.investigateType`)
                      .d('调查表类型')}
                  >
                    {getFieldDecorator('investigateType', {
                      initialValue: null,
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get(`sslm.investigCorrelat.view.message.investigateType`)
                              .d('调查表类型'),
                          }),
                        },
                      ],
                    })(
                      <ValueList
                        lovCode="SSLM.INVESTIGATE_TYPE"
                        onChange={() => {
                          setFieldsValue({
                            investigateTemplateId: null,
                          });
                        }}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
            )}
            {!!getFieldValue('isChange') && (
              <Row>
                <Col span={24}>
                  <FormItem
                    {...refuseItemLayout}
                    label={intl
                      .get(`sslm.investigCorrelat.view.message.investigateTemplate`)
                      .d('调查表模版')}
                  >
                    {getFieldDecorator('investigateTemplateId', {
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get(`sslm.investigCorrelat.view.message.investigateTemplate`)
                              .d('调查表模版'),
                          }),
                        },
                      ],
                    })(
                      <Lov
                        code="SSLM.INVESTIGATE_TEMPLATE_ID"
                        disabled={!getFieldValue('investigateType')}
                        queryParams={{
                          companyId,
                          organizationId,
                          enabledFlag: 1,
                          investigateType: getFieldValue('investigateType'),
                        }}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
            )}
            {!!getFieldValue('isChange') && (
              <Row>
                <Col span={24}>
                  <FormItem
                    {...refuseItemLayout}
                    label={intl.get(`sslm.common.model.investigate.remark`).d('调查说明')}
                  >
                    {getFieldDecorator('remark', {})(<Input />)}
                  </FormItem>
                </Col>
              </Row>
            )}
            <Row>
              <Col span={24}>
                <FormItem
                  {...refuseItemLayout}
                  label={intl
                    .get(`sslm.investigCorrelat.view.message.refuseModalTitle`)
                    .d('拒绝原因')}
                >
                  {getFieldDecorator('rejectRemark', {})(<TextArea rows={14} />)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        )}
      </Spin>
    </Modal>
  );
};

export default Form.create({ fieldNameProp: null })(InvestigateRefuseModal);

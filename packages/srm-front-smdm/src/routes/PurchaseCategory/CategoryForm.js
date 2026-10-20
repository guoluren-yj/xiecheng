import React from 'react';
import { Form, Input, Select, Modal, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';

import Lov from 'components/Lov';
import TLEditor from 'components/TLEditor';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const FormItem = Form.Item;
const { Option } = Select;
@Form.create({ fieldNameProp: null })
export default class CategoryForm extends React.PureComponent {
  @Bind()
  async handleOk() {
    const { form, onOk, remote } = this.props;
    if (remote?.event) {
      const res = await remote.event.fireEvent('handleCuxOk', {
        current: this,
      });
      if (!res) {
        return;
      }
    }
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        onOk(fieldsValue);
      }
    });
  }

  remove() {
    if (this.state.cache) {
      this.setState({
        cache: {},
      });
    }
  }

  render() {
    const {
      form,
      initData,
      impStandardList,
      title,
      modalVisible,
      onCancel,
      loading,
      customizeForm,
      clearProperties,
      remote,
    } = this.props;
    const { cuxCompanyEdit, handleCuxFormItem } = remote.props?.process || {};
    const {
      categoryCode,
      categoryId,
      categoryName,
      ouId,
      uomCode,
      impStandard,
      _token,
      ouName,
      uomName,
      parentCategoryId,
      parentCategoryName,
      companyName,
      companyId,
      executorBy,
      executorName,
      templateId,
      templateName,
      sourceExecutorBy,
      sourceExecutorByName,
      orderExecutorByName,
      orderExecutorBy,
    } = initData;
    const { getFieldDecorator } = form;
    const formLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
    };
    return (
      <Modal
        destroyOnClose
        title={title}
        visible={modalVisible}
        confirmLoading={loading}
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        onCancel={() => {
          clearProperties(this.remove, '');
          onCancel();
        }}
        onOk={this.handleOk}
      >
        {customizeForm(
          {
            code: 'SMDM.PURCHASE_CATEGORY_LIST.EDIT',
            form,
            dataSource: initData,
            isCreate: true,
          },
          <Form>
            <Row>
              <Col span={24}>
                <FormItem
                  {...formLayout}
                  label={intl
                    .get('smdm.purchaseCategory.model.category.categoryCode')
                    .d('品类代码')}
                >
                  {getFieldDecorator('categoryCode', {
                    initialValue: categoryCode,
                    rules: [
                      {
                        type: 'string',
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('smdm.purchaseCategory.model.category.categoryCode')
                            .d('品类代码'),
                        }),
                      },
                    ],
                  })(<Input inputChinese={false} disabled={initData && !!initData.categoryCode} />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <FormItem
                  {...formLayout}
                  label={intl
                    .get('smdm.purchaseCategory.model.category.categoryName')
                    .d('品类名称')}
                >
                  {getFieldDecorator('categoryName', {
                    initialValue: categoryName,
                    rules: [
                      {
                        type: 'string',
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('smdm.purchaseCategory.model.category.categoryName')
                            .d('品类名称'),
                        }),
                      },
                    ],
                  })(
                    <TLEditor
                      label={intl
                        .get('smdm.purchaseCategory.model.category.categoryName')
                        .d('品类名称')}
                      field="categoryName"
                      token={_token}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  {...formLayout}
                  label={intl.get(`smdm.common.model.project.companyName`).d('公司')}
                >
                  {getFieldDecorator('companyId', {
                    initialValue: companyId,
                  })(
                    <Lov
                      code="SPFM.USER_AUTH.COMPANY"
                      textValue={companyName}
                      disabled={isFunction(cuxCompanyEdit) ? cuxCompanyEdit(initData) : false}
                      queryParams={{ tenantId: getCurrentOrganizationId() }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <FormItem
                  {...formLayout}
                  label={intl.get('smdm.purchaseCategory.model.category.ouName').d('业务实体')}
                >
                  {getFieldDecorator('ouId', {
                    initialValue: ouId,
                  })(
                    <Lov
                      textValue={ouName}
                      queryParams={{ organizationId: getCurrentOrganizationId() }}
                      code="HPFM.OU"
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <FormItem
                  {...formLayout}
                  label={intl.get('smdm.purchaseCategory.model.category.uomName').d('计量单位')}
                >
                  {getFieldDecorator('uomCode', {
                    initialValue: uomCode,
                  })(
                    <Lov
                      textValue={uomName}
                      queryParams={{ organizationId: getCurrentOrganizationId() }}
                      code="SMDM.UOM"
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <FormItem
                  {...formLayout}
                  label={intl
                    .get('smdm.purchaseCategory.model.category.impStandardMeaning')
                    .d('引入要求')}
                >
                  {getFieldDecorator('impStandard', {
                    initialValue: impStandard || 'SERIOUS',
                  })(
                    <Select style={{ width: '150px' }}>
                      {impStandardList.map((item) => (
                        <Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <FormItem
                  {...formLayout}
                  label={intl
                    .get('smdm.purchaseCategory.model.category.assignAttribute')
                    .d('分配属性')}
                >
                  {getFieldDecorator('templateId', {
                    initialValue: templateId,
                  })(
                    <Lov
                      textValue={templateName}
                      queryParams={{ tenantId: getCurrentOrganizationId(), categoryId }}
                      code="SMDM.CATEGORY_ATTR_TEMPLATE"
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            {initData.categoryId && initData.isEdit && (
              <Row>
                <Col span={24}>
                  <FormItem
                    {...formLayout}
                    label={intl
                      .get('smdm.purchaseCategory.model.category.parentCategoryName')
                      .d('上级品类')}
                  >
                    {getFieldDecorator('parentCategoryId', {
                      initialValue: parentCategoryName ? parentCategoryId : null,
                    })(
                      <Lov
                        textValue={parentCategoryName}
                        queryParams={{ tenantId: getCurrentOrganizationId(), categoryId }}
                        code="SMDM.ITEM_CATEGORY_EXCEPT_SELF"
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
            )}
            <Row>
              <Col span={24}>
                <FormItem
                  {...formLayout}
                  label={intl
                    .get('smdm.purchaseCategory.view.message.executorBy')
                    .d('分配需求执行人')}
                >
                  {getFieldDecorator('executorBy', {
                    initialValue: executorBy,
                  })(
                    <Lov
                      textValue={executorName}
                      queryParams={{ tenantId: getCurrentOrganizationId() }}
                      code="SPCM.ACCEPT_USER"
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <FormItem
                  {...formLayout}
                  label={intl
                    .get('smdm.purchaseCategory.view.message.orderExecutorBy')
                    .d('订单执行人')}
                >
                  {getFieldDecorator('orderExecutorBy', {
                    initialValue: orderExecutorBy,
                  })(
                    <Lov
                      textValue={orderExecutorByName}
                      queryParams={{ tenantId: getCurrentOrganizationId() }}
                      code="SPCM.ACCEPT_USER"
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <FormItem
                  {...formLayout}
                  label={intl
                    .get('smdm.purchaseCategory.view.message.sourceExecutorBy')
                    .d('寻源执行人')}
                >
                  {getFieldDecorator('sourceExecutorBy', {
                    initialValue: sourceExecutorBy,
                  })(
                    <Lov
                      textValue={sourceExecutorByName}
                      queryParams={{ tenantId: getCurrentOrganizationId() }}
                      code="SPCM.ACCEPT_USER"
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            {isFunction(handleCuxFormItem) ? (
              handleCuxFormItem({ headerInfo: initData, getFieldDecorator })
            ) : (
              <></>
            )}
          </Form>
        )}
      </Modal>
    );
  }
}

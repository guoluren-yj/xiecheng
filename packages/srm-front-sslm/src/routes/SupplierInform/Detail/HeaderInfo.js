import React, { Component } from 'react';
import { Form, Input, Row, Col } from 'hzero-ui';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import { dateRender } from 'utils/renderer';
import { getCurrentOrganizationId } from 'utils/utils';
import LovMulti from 'srm-front-cuz/lib/components/Customize/LovMulti/index';

const tenantId = getCurrentOrganizationId();
const { TextArea } = Input;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

export default class HeaderInfo extends Component {
  render() {
    const {
      form,
      readOnly,
      changFlag,
      companyId,
      pubEdit,
      detailHeader,
      customizeForm,
      savePermissionFlag,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
    } = this.props;

    const { groupCompanyFlag, changeLevel } = detailHeader;
    // 维度集团级，单据新建没选公司时隐藏公司名称/编码
    const hiddenCompanyFlag = changeLevel === 'GROUP' && groupCompanyFlag === 0;
    return customizeForm(
      {
        code: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.HEADER',
        form,
        dataSource: detailHeader,
        readOnly: pubEdit ? false : readOnly, // 工作流需支持可编辑
      },
      <Form>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.supplierInform.model.supplierInform.applicationNum')
                .d('申请单号')}
            >
              {getFieldDecorator('changeReqNumber', { initialValue: detailHeader.changeReqNumber })(
                <span>{detailHeader.changeReqNumber}</span>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.supplierInform.model.supplierInform.applicationState')
                .d('申请状态')}
            >
              {getFieldDecorator('reqStatus', {
                initialValue: detailHeader.reqStatus,
              })(<span>{detailHeader.reqStatusMeaning}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.supplierInform.model.supplierInform.latitudeChange')
                .d('变更维度')}
            >
              {getFieldDecorator('changeLevel', { initialValue: detailHeader.changeLevel })(
                <span>{detailHeader.changeLevelMeaning}</span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.supplierInform.model.supplierInform.creationDate')
                .d('创建日期')}
            >
              {getFieldDecorator('creationDate', { initialValue: detailHeader.creationDate })(
                <span>{dateRender(detailHeader.creationDate)}</span>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.supplierInform.model.supplierInform.supplierNum')
                .d('供应商编码')}
            >
              {getFieldDecorator('supplierCompanyNum', {
                initialValue: detailHeader.supplierCompanyNum,
              })(<span>{detailHeader.supplierCompanyNum}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.supplierInform.model.supplierInform.supplierName')
                .d('供应商名称')}
            >
              {getFieldDecorator('supplierCompanyName', {
                initialValue: detailHeader.supplierCompanyName,
              })(<span>{detailHeader.supplierCompanyName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.supplierInform.model.supplierInform.purchasingCompanyNum')
                .d('采购方公司编码')}
            >
              {getFieldDecorator('companyNum', { initialValue: detailHeader.companyNum })(
                <span>{hiddenCompanyFlag ? null : detailHeader.companyNum}</span>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.supplierInform.model.supplierInform.purchasingCompanyName')
                .d('采购方公司名称')}
            >
              {getFieldDecorator('companyName', {
                initialValue: detailHeader.companyName,
              })(<span>{hiddenCompanyFlag ? null : detailHeader.companyName}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.supplierInform.model.supplierInform.creator').d('创建人')}
            >
              {getFieldDecorator('createUserRealName', {
                initialValue: detailHeader.createUserRealName,
              })(<span>{detailHeader.createUserRealName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.supplierInform.model.supplierInform.department').d('所属部门')}
            >
              {getFieldDecorator('unitId', {
                initialValue: detailHeader.unitId,
              })(
                <Lov
                  code="SPRM.USER_UNIT"
                  disabled={changFlag || !savePermissionFlag}
                  queryParams={{ companyId, tenantId }}
                  onChange={(_, lovRecord) => {
                    setFieldsValue({
                      unitName: lovRecord.unitName,
                      unitId: lovRecord.unitId,
                    });
                  }}
                  textValue={detailHeader.unitName}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.supplierInform.model.supplierInform.submitDate').d('提交日期')}
            >
              {getFieldDecorator('submitDate', {
                initialValue: detailHeader.submitDate,
              })(<span>{dateRender(detailHeader.submitDate)}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.supplierInform.model.otherInform.purchaseAgent').d('采购员')}
            >
              {getFieldDecorator('purchaseAgentId', {
                initialValue: detailHeader.purchaseAgentId,
              })(
                changFlag || !savePermissionFlag ? (
                  <span>{detailHeader.purchaseAgentNameJoint}</span>
                ) : (
                  <LovMulti
                    delimma=","
                    viewOnly={changFlag}
                    translateData={detailHeader.purchaseAgentName}
                    code="HPFM.PURCHASE_AGENT_ID"
                    queryParams={{ tenantId }}
                  />
                )
              )}
            </FormItem>
          </Col>
        </Row>
        {getFieldValue('changeLevel') !== 'GROUP' && (
          <Row gutter={48} className="writable-row">
            <Col span={24}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('sslm.supplierInform.model.supplierInform.expandCompany')
                  .d('拓展公司')}
              >
                {getFieldDecorator('companyIds', {
                  initialValue: detailHeader.companyIds,
                })(
                  changFlag || !savePermissionFlag ? (
                    <span>{detailHeader.companyNameJoint}</span>
                  ) : (
                    <LovMulti
                      delimma=","
                      code="SSLM_SUPPLIER_CHANGE_EXTEND_COMPANY"
                      viewOnly
                      queryParams={{
                        tenantId,
                        supplierCompanyId: detailHeader.supplierCompanyId,
                        companyIds: detailHeader.companyId,
                      }}
                      translateData={detailHeader.companyNames}
                    />
                  )
                )}
              </FormItem>
            </Col>
          </Row>
        )}
        <Row gutter={48} className="half-row">
          <Col span={24}>
            <FormItem
              label={intl
                .get('sslm.supplierInform.model.supplierInform.changeRemark')
                .d('变更备注')}
            >
              {getFieldDecorator('remark', {
                initialValue: detailHeader.remark,
              })(
                <TextArea
                  rows={3}
                  disabled={changFlag || !savePermissionFlag}
                  style={{ width: '100%' }}
                />
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}

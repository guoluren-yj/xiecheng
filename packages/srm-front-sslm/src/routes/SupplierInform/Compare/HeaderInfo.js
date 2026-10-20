import React, { Component } from 'react';
import { Form, Row, Col } from 'hzero-ui';

import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

// 此页签只对比采购员字段
@Form.create({ fieldNameProp: null })
export default class HeaderInfo extends Component {
  render() {
    const {
      form,
      detailHeader = {},
      customizeForm,
      form: { getFieldDecorator },
    } = this.props;

    const { groupCompanyFlag, changeLevel } = detailHeader;
    // 维度集团级，单据新建没选公司时隐藏公司名称/编码
    const hiddenCompanyFlag = changeLevel === 'GROUP' && groupCompanyFlag === 0;
    return customizeForm(
      {
        code: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.HEADER',
        form,
        dataSource: detailHeader,
        readOnly: true,
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
                .get('sslm.supplierInform.model.supplierInform.enterpriseNum')
                .d('企业编码')}
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
                .get('sslm.supplierInform.model.supplierInform.enterpriseName')
                .d('企业名称')}
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
              })(<span>{detailHeader.unitName}</span>)}
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
                <span style={{ color: detailHeader.purchaseAgentIdFlag === 'UPDATE' && 'red' }}>
                  {detailHeader.purchaseAgentNameJoint}
                </span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="half-row">
          <Col span={24}>
            <FormItem
              label={intl
                .get('sslm.supplierInform.model.supplierInform.changeRemark')
                .d('变更备注')}
            >
              {getFieldDecorator('remark', {
                initialValue: detailHeader.remark,
              })(<span>{detailHeader.remark}</span>)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}

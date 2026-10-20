/**
 * 澄清函基本信息
 * @date: 2019-6-19
 * @author: LvShuo <shuo.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { Input, Form, Row, Col, Switch, Select } from 'hzero-ui';
import intl from 'utils/intl';
import TLEditor from 'components/TLEditor';
import { EDIT_FORM_ITEM_LAYOUT, FORM_COL_3_LAYOUT } from 'utils/constants';
import { enableRender } from 'utils/renderer';

const FormItem = Form.Item;
const { Option } = Select;
const UEDDisplayFormItem = (props) => {
  const { label, value } = props;
  return (
    <FormItem label={label} {...EDIT_FORM_ITEM_LAYOUT}>
      {value}
    </FormItem>
  );
};
export default class BaseInfo extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * 详情
   */
  renderEditForm() {
    const {
      baseDetail = {},
      typeList = [],
      form: { getFieldDecorator },
      // showUploadModal,
      // isEdit = false,
    } = this.props;
    const formsLayouts = { labelCol: { span: 3 }, wrapperCol: { span: 20 } };
    return (
      <Form>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get('ssrc.scoreRptTemplate.model.scoreRptTemplate.templateCode')
                .d('模板编码')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('templateCode', {
                initialValue: baseDetail.templateCode,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('ssrc.scoreRptTemplate.model.scoreRptTemplate.templateCode')
                        .d('模板编码'),
                    }),
                  },
                ],
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={16}>
            <FormItem
              label={intl
                .get('ssrc.scoreRptTemplate.model.scoreRptTemplate.templateName')
                .d('模板名称')}
              {...formsLayouts}
            >
              {getFieldDecorator('templateName', {
                initialValue: baseDetail.templateName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('ssrc.scoreRptTemplate.model.scoreRptTemplate.templateName')
                        .d('模板名称'),
                    }),
                  },
                ],
              })(
                <TLEditor
                  label={intl
                    .get('ssrc.scoreRptTemplate.model.scoreRptTemplate.templateName')
                    .d('模板名称')}
                  field="templateName"
                  token={baseDetail._token}
                  style={{ marginLeft: '6%', width: '99%' }}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get('ssrc.scoreRptTemplate.model.scoreRptTemplate.templateType')
                .d('模板类型')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('templateType', {
                initialValue: baseDetail.templateType,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('ssrc.scoreRptTemplate.model.scoreRptTemplate.templateType')
                        .d('模板类型'),
                    }),
                  },
                ],
              })(
                <Select allowClear>
                  {typeList &&
                    typeList.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                </Select>
              )}
            </FormItem>
          </Col>
          {/* <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.scoreRptTemplate.model.scoreRptTemplate.templateFileUrl`)
                .d('在线编辑文档')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <a
                disabled={isEdit}
                onClick={() => {
                  showUploadModal();
                }}
              >
                {intl.get(`ssrc.scoreRptTemplate.model.scoreRptTemplate.upload`).d('上传文档')}
              </a>
            </FormItem>
          </Col> */}
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`ssrc.scoreRptTemplate.model.scoreRptTemplate.enabledFlag`).d('启用')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator(`enabledFlag`, {
                initialValue: baseDetail.enabledFlag === 0 ? baseDetail.enabledFlag : 1,
              })(<Switch checkedValue={1} unCheckedValue={0} />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.scoreRptTemplate.model.scoreRptTemplate.realName`).d('创建人')}
              value={baseDetail.realName}
            />
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get('hzero.common.source').d('来源')}
              value={baseDetail.source}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl
                .get(`ssrc.scoreRptTemplate.model.scoreRptTemplate.lastUpdateDate`)
                .d('更新时间')}
              value={baseDetail.lastUpdateDate}
            />
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * 详情
   */
  renderForm() {
    const { baseDetail = {} } = this.props;

    return (
      <Form>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl
                .get('ssrc.scoreRptTemplate.model.scoreRptTemplate.templateCode')
                .d('模板编码')}
              value={baseDetail.templateCode}
            />
          </Col>
          <Col span={16}>
            <UEDDisplayFormItem
              label={intl
                .get('ssrc.scoreRptTemplate.model.scoreRptTemplate.templateName')
                .d('模板名称')}
              value={baseDetail.templateName}
            />
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl
                .get('ssrc.scoreRptTemplate.model.scoreRptTemplate.templateType')
                .d('模板类型')}
              value={baseDetail.templateTypeMeaning}
            />
          </Col>
          {/* <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`ssrc.scoreRptTemplate.model.scoreRptTemplate.templateFileUrl`)
                .d('在线编辑文档')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <a disabled>
                {intl.get(`ssrc.scoreRptTemplate.model.scoreRptTemplate.upload`).d('上传文档')}
              </a>
            </FormItem>
          </Col> */}
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.scoreRptTemplate.model.scoreRptTemplate.enabledFlag`).d('启用')}
              value={enableRender(baseDetail.enabledFlag)}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.bidEventQuery.model.bidHall.realName`).d('创建人')}
              value={baseDetail.realName}
            />
          </Col>
        </Row>
        <Row gutter={48}>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get('hzero.common.source').d('来源')}
              value={baseDetail.source}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl
                .get(`ssrc.scoreRptTemplate.model.scoreRptTemplate.lastUpdateDate`)
                .d('更新时间')}
              value={baseDetail.lastUpdateDate}
            />
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const { viewOnly = false } = this.props;
    return viewOnly ? this.renderForm() : this.renderEditForm();
  }
}

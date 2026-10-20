/**
 * bidHall - 寻源服务 招标维护 - 基本信息表单
 * @date: 2019-06-27
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Row, Col, Input, Select, InputNumber, DatePicker, Tooltip, Icon } from 'hzero-ui';
import moment from 'moment';
import { isEmpty } from 'lodash';

import Lov from 'components/Lov';
import Upload from 'srm-front-boot/lib/components/Upload';
import intl from 'utils/intl';
import { getDateTimeFormat } from 'utils/utils';
import { EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import { PRIVATE_BUCKET } from '_utils/config';
import { FILE_SIZE, ChunkUploadProps } from '@/utils/SsrcRegx';

import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';

const { Option } = Select;
const FormItem = Form.Item;

class BidInfoForm extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const {
      customizeForm,
      form,
      form: { getFieldDecorator, getFieldValue },
      organizationId,
      header = {},
      subjectMatterRules = [],
      sourceMethods,
      quotationTypes = [],
      sourceStages = [],
      changeTemplateId,
      changeSourceMethod,
      changeCompany,
      changeSubjectMatterRule,
      editBidMembers,
      bidType = [],
      allOpenSelectable,
    } = this.props;
    const formsLayouts = { labelCol: { span: 3 }, wrapperCol: { span: 20 } };
    let totalBudgetFlag;
    let businessFlag;
    let techFlag;
    if (header.tmplFieldColList && header.tmplFieldColList.length > 0) {
      const totalBudget = header.tmplFieldColList.filter(
        (item) => item.fieldName === 'totalBudget'
      )[0];
      const business = header.tmplFieldColList.filter(
        (item) => item.fieldName === 'businessAttachmentUuid'
      )[0];
      const tech = header.tmplFieldColList.filter(
        (item) => item.fieldName === 'techAttachmentUuid'
      )[0];
      totalBudgetFlag = totalBudget?.requiredFlag;
      businessFlag = business?.requiredFlag;
      techFlag = tech?.requiredFlag;
    } else {
      totalBudgetFlag = 0;
      businessFlag = 1;
      techFlag = 1;
    }
    const filterQuotationTypes =
      quotationTypes && quotationTypes.filter((item) => item.value === 'ONLINE');
    return customizeForm(
      { code: 'SSRC.BID_HALL_EDIT.EDIT_HEADER', form, dataSource: header },
      <Form className="writable-row-custom">
        <Row gutter={48}>
          <React.Fragment>
            <FormItem style={{ display: 'none' }}>
              {getFieldDecorator('bidHeaderId', {
                initialValue: header.bidHeaderId,
              })(<div />)}
            </FormItem>
            <FormItem style={{ display: 'none' }}>
              {getFieldDecorator('objectVersionNumber', {
                initialValue: header.objectVersionNumber,
              })(<div />)}
            </FormItem>
            <FormItem style={{ display: 'none' }}>
              {getFieldDecorator('companyName', {
                initialValue: header.companyName,
              })(<div />)}
            </FormItem>
          </React.Fragment>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.bidNum`).d('招标编号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidNum', {
                initialValue: header.bidNum,
              })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col span={16}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.bidTitle`).d('招标事项')}
              {...formsLayouts}
            >
              {getFieldDecorator('bidTitle', {
                initialValue: header.bidTitle,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidHall.model.bidHall.bidTitle`).d('招标事项'),
                    }),
                  },
                ],
              })(<Input style={{ width: '537px' }} />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.sourcingTemplate`).d('寻源模板')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('templateId', {
                initialValue: header.templateId,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidHall.model.bidHall.sourcingTemplate`).d('寻源模板'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SSRC.TEMPLATE_NAME"
                  onChange={changeTemplateId}
                  textValue={header.templateName}
                  textField="templateName"
                  queryParams={{ sourceCategory: 'BID' }}
                  allowClear={false}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.quotationType`).d('报价方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('quotationType', {
                initialValue: header.quotationType,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidHall.model.bidHall.quotationType`).d('报价方式'),
                    }),
                  },
                ],
              })(
                <Select allowClear>
                  {filterQuotationTypes &&
                    filterQuotationTypes.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.purceOrgName`).d('采购组织名称')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('purOrganizationId', {
                initialValue: header.purOrganizationId,
              })(<Lov code="SPFM.USER_AUTH.PURORG" textValue={header.purOrganizationName} />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={8}>
            <FormItem label={intl.get(`ssrc.common.company`).d('公司')} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('companyId', {
                initialValue: header.companyId,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('ssrc.common.company').d('公司'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SPFM.USER_AUTHORITY_COMPANY"
                  textValue={header.companyName}
                  textField="companyName"
                  onChange={changeCompany}
                  allowClear={false}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.createdUnitName`).d('创建人部门')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('createdUnitName', {
                initialValue: header.createdUnitName,
              })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.bidType`).d('招标类别')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidType', {
                initialValue: header.bidType,
                rules: [
                  {
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidHall.model.bidHall.bidType`).d('招标类别'),
                    }),
                  },
                ],
              })(
                <Select allowClear>
                  {bidType &&
                    bidType.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={8}>
            <FormItem
              label={
                <span>
                  {intl.get('ssrc.bidHall.model.bidHall.sourceMethod').d('寻源方式')}&nbsp;
                  {['OPEN', 'ALL_OPEN'].includes(getFieldValue('sourceMethod')) ? (
                    <Tooltip
                      title={intl
                        .get('ssrc.common.validate.sourceMethod')
                        .d(
                          '为保护您的个人信息，建议使用您的商务联系方式（如办公电话、商业邮箱，办公室地址等），而非私人联系信息。'
                        )}
                    >
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  ) : null}
                </span>
              }
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceMethod', {
                initialValue: header.sourceMethod,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidHall.model.bidHall.sourceMethod`).d('寻源方式'),
                    }),
                  },
                ],
                onChange: changeSourceMethod,
              })(
                <Select allowClear>
                  {sourceMethods &&
                    sourceMethods
                      .filter((item) => item.value !== 'ALL_OPEN' || allOpenSelectable)
                      .map((item) => (
                        <Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.subjectMatterRule`).d('标的规则')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('subjectMatterRule', {
                initialValue: header.subjectMatterRule,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidHall.model.bidHall.subjectMatterRule`).d('标的规则'),
                    }),
                  },
                ],
                onChange: changeSubjectMatterRule,
              })(
                <Select allowClear>
                  {subjectMatterRules &&
                    subjectMatterRules.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.sourceStage`).d('招标阶段')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('sourceStage', {
                initialValue: header.sourceStage,
              })(
                <Select allowClear disabled>
                  {sourceStages &&
                    sourceStages.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.maxBidNumber`).d('最大中标数')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('maxBidNumber', {
                initialValue: header.maxBidNumber,
              })(<InputNumber style={{ width: '100%' }} min={0} max={999999999999999} />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.quotationStartDate`).d('投标开始时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('quotationStartDate', {
                initialValue: header.quotationStartDate && moment(header.quotationStartDate),
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.bidHall.model.bidHall.quotationStartDate`)
                        .d('投标开始时间'),
                    }),
                  },
                ],
              })(
                <DatePicker
                  style={{ width: '100%' }}
                  showTime
                  placeholder=""
                  format={getDateTimeFormat()}
                  disabledDate={(currentDate) => moment(new Date()).isAfter(currentDate, 'day')}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.quotationEndDate`).d('投标截止时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('quotationEndDate', {
                initialValue: header.quotationEndDate && moment(header.quotationEndDate),
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.bidHall.model.bidHall.quotationEndDate`)
                        .d('投标截止时间'),
                    }),
                  },
                ],
              })(
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder=""
                  showTime
                  format={getDateTimeFormat()}
                  disabledDate={(currentDate) =>
                    getFieldValue('quotationStartDate') &&
                    moment(getFieldValue('quotationStartDate')).isAfter(currentDate, 'day')
                  }
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.bidOpenDate`).d('开标时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidOpenDate', {
                initialValue: header.bidOpenDate && moment(header.bidOpenDate),
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidHall.model.bidHall.bidOpenDate`).d('开标时间'),
                    }),
                  },
                ],
              })(
                <DatePicker
                  style={{ width: '100%' }}
                  showTime
                  placeholder=""
                  format={getDateTimeFormat()}
                  disabledDate={(currentDate) =>
                    getFieldValue('quotationEndDate') &&
                    moment(getFieldValue('quotationEndDate')).isAfter(currentDate, 'second')
                  }
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get('ssrc.bidHall.model.bidHall.clarifyEndTime').d('澄清截止时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('clarifyEndTime', {
                initialValue: header.clarifyEndTime && moment(header.clarifyEndTime),
              })(
                <DatePicker
                  style={{ width: '100%' }}
                  showTime
                  disabledDate={(currentDate) =>
                    getFieldValue('quotationEndDate') &&
                    moment(getFieldValue('quotationEndDate')).isBefore(currentDate, 'time')
                  }
                  format={getDateTimeFormat()}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.purchaseAgentName`).d('采购员')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('purchaserId', {
                initialValue: header.purchaserId,
              })(
                <Lov
                  code="SPFM.USER_AUTH.PURCHASE_AGENT"
                  textValue={header.purchaserName}
                  queryParams={{ organizationId }}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.bidMembers`).d('招标小组')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator(
                'bidMembers',
                {}
              )(
                <a onClick={editBidMembers}>
                  {intl.get(`ssrc.bidHall.view.message.button.edit`).d('编辑')}
                </a>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.bidTechFile`).d('招标技术文件')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('techAttachmentUuid', {
                initialValue: header.techAttachmentUuid,
                rules: [
                  {
                    required: techFlag,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidHall.model.bidHall.bidTechFile`).d('招标技术文件'),
                    }),
                  },
                ],
              })(
                <Upload
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-bid-header"
                  attachmentUUID={
                    isEmpty(header.techAttachmentUuid) ? undefined : header.techAttachmentUuid
                  }
                  tenantId={organizationId}
                  filePreview
                  {...ChunkUploadProps}
                  fileSize={FILE_SIZE}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.bidusinessFile`).d('招标商务文件')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('businessAttachmentUuid', {
                initialValue: header.businessAttachmentUuid,
                rules: [
                  {
                    required: businessFlag,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidHall.model.bidHall.bidusinessFile`).d('招标商务文件'),
                    }),
                  },
                ],
              })(
                <Upload
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-bid-header"
                  attachmentUUID={
                    isEmpty(header.businessAttachmentUuid)
                      ? undefined
                      : header.businessAttachmentUuid
                  }
                  tenantId={organizationId}
                  filePreview
                  {...ChunkUploadProps}
                  fileSize={FILE_SIZE}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={8}>
            <FormItem
              label={intl.get('ssrc.inquiryHall.model.inquiryHall.budgetAmount').d('预算金额')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('totalBudget', {
                initialValue: header.totalBudget,
                rules: [
                  {
                    required: totalBudgetFlag,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.budgetAmount`)
                        .d('预算金额'),
                    }),
                  },
                ],
              })(
                <PrecisionInputNumber
                  type="hzero"
                  financial={form.getFieldValue('currencyCode')}
                  style={{ width: '100%' }}
                  max="99999999999999999999"
                  min={0}
                />
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}

export default BidInfoForm;
export { BidInfoForm };

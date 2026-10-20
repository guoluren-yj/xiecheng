import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Col, Row, Select, Tooltip, Icon } from 'hzero-ui';
import { isFunction, isNil } from 'lodash';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { yesOrNoRender, dateRender } from 'utils/renderer';
import { Bind } from 'lodash-decorators';
import styles from '../index.less';

// HPFM的值集不适用于当前情况，
// 原有 0：否，1：是 --> 1：否，0：是
const yesOrNoFlag = [
  { value: '0', meaning: intl.get('hzero.common.yes').d('是'), orderSeq: 1 },
  { value: '1', meaning: intl.get('hzero.common.no').d('否'), orderSeq: 2 },
];

/**
 * 员工基本信息表单
 * @extends {Component} - React.Component
 * @reactProps {!Object} employeeInfo - 数据源
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@withCustomize({
  unitCode: ['SPFM.PARTNER_INVITE.RECEIVETOP', 'SPFM.PARTNER_INVITE.RECEIVESUPTOP'],
})
@connect(({ disposeInvite }) => ({
  disposeInvite,
}))
@Form.create({ fieldNameProp: null })
export default class DataForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      queryPurchaseList: [], // 存放接口查询的当前登录人对应的采购员
    };
  }

  componentDidMount() {
    if (isFunction(this.props.onRef)) {
      this.props.onRef(this);
    }
    this.queryCurrentUserPurchaseAgent();
  }

  // 查询当前登录人对应的采购员
  @Bind()
  queryCurrentUserPurchaseAgent() {
    const { dispatch } = this.props;
    dispatch({
      type: 'disposeInvite/queryCurrentUserPurchaseAgent',
    }).then((res) => {
      if (res) {
        this.setState({ queryPurchaseList: res });
      }
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { queryPurchaseList } = this.state;
    const { customizeForm, dataSource = {}, form, pStatus, purchaserDisabled = false } = this.props;
    const { getFieldDecorator, setFieldsValue } = this.props.form;
    const {
      levelTypeFlag,
      inviteCompanyName,
      privateFlag,
      creationDate,
      roleTypeMeaning,
      inviteRemark,
      inviteType,
      sendInvestigateTemplateFlag,
      investigateTypeMeaning,
      investigateTemplateName,
      investigateCategoryName,
      purchaseAgentNameJoint,
      multiSupplierCategoryDesc,
      inviteCompanyNum,
      roleType,
      toCycleStageDescription,
      toCycleStageId,
      purchaseAgentId,
    } = dataSource;
    // levelTypeFlag格式化成数字，避免后端脚本返回字符串 '1' -> 1, 0 - 集团级，1- 公司级
    const formatLevelTypeFlag = isNil(levelTypeFlag) ? null : Number(levelTypeFlag) ? 1 : 0;
    // 集团级显示是
    const renderLevelType = formatLevelTypeFlag === 0 ? 1 : 0;
    return inviteType === 'CUSTOMER'
      ? customizeForm(
          { code: 'SPFM.PARTNER_INVITE.RECEIVETOP', form, dataSource },
          <Form style={{ maxWidth: 1000 }} className={styles['invite-header-form']}>
            <Row gutter={48}>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={
                    <span>
                      {intl
                        .get('spfm.disposeInvite.model.topinfo.levelTypeFlagSupplier')
                        .d('是否集团级供应商')}
                      <Tooltip
                        title={intl
                          .get('spfm.disposeInvite.model.topinfo.levelTypeFlagTooltip')
                          .d(
                            `选择“集团级”：同意邀约后供应商将与集团下所有子公司建立合作伙伴关系。若其他子公司已建立公司级合作，同意邀约后，合作维度更新为集团级，供应商将与所有子公司建立合作伙伴关系；选择“公司级”：同意邀约后仅与当前被邀约公司建立合作伙伴关系。`
                          )}
                      >
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                  }
                >
                  {(pStatus === 'PENDING' && !purchaserDisabled)
                    ? getFieldDecorator('levelTypeFlagSupplier', {
                        initialValue: formatLevelTypeFlag,
                      })(
                        <Select
                          defaultValue={formatLevelTypeFlag}
                          style={{ width: '100%' }}
                          onChange={(value) => {
                            setFieldsValue({ levelTypeFlagSupplier: value });
                          }}
                        >
                          {yesOrNoFlag.map((item) => (
                            <Select.Option key={+item.value} value={+item.value}>
                              {item.meaning}
                            </Select.Option>
                          ))}
                        </Select>
                      )
                    : getFieldDecorator('levelTypeFlagSupplier', {
                        initialValue: formatLevelTypeFlag,
                      })(<span>{yesOrNoRender(renderLevelType)}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl.get('spfm.disposeInvite.model.topinfo.inviteCompanyName').d('采购方')}
                >
                  {getFieldDecorator('inviteCompanyNum', {
                    initialValue: inviteCompanyNum,
                  })(<span>{inviteCompanyName}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl.get('spfm.disposeInvite.model.topinfo.roleType').d('供应商角色')}
                >
                  {getFieldDecorator('roleType', {
                    initialValue: roleType,
                  })(<span>{roleTypeMeaning}</span>)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={48}>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl
                    .get('spfm.disposeInvite.model.topinfo.autosendInvestigateFlag')
                    .d('是否发送调查表')}
                >
                  {getFieldDecorator('sendInvestigateTemplateFlag', {
                    initialValue: sendInvestigateTemplateFlag,
                  })(<span>{yesOrNoRender(sendInvestigateTemplateFlag)}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl
                    .get('spfm.disposeInvite.model.topinfo.investigateType')
                    .d('调查表类型')}
                >
                  {getFieldDecorator('investigateTypeMeaning', {
                    initialValue: investigateTypeMeaning,
                  })(<span>{investigateTypeMeaning}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl.get('spfm.disposeInvite.model.topinfo.templateName').d('调查表模板')}
                >
                  {getFieldDecorator('investigateTemplateName', {
                    initialValue: investigateTemplateName,
                  })(<span>{investigateTemplateName}</span>)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={48}>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl.get('spfm.disposeInvite.model.topinfo.categoryName').d('准入品类')}
                >
                  {getFieldDecorator('categoryName', {
                    initialValue: investigateCategoryName,
                  })(<span>{investigateCategoryName}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl.get('spfm.disposeInvite.model.topinfo.purchaseAgent').d('采购员')}
                >
                  {getFieldDecorator('purchaseAgent', {
                    initialValue: purchaseAgentId,
                  })(
                    <span>
                      {purchaseAgentNameJoint ||
                        queryPurchaseList.map((item) => item.purchaseAgentName).join()}
                    </span>
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl
                    .get('spfm.disposeInvite.model.topinfo.multiSupplierCategoryDesc')
                    .d('供应商分类')}
                >
                  {getFieldDecorator('multiSupplierCategoryDesc', {
                    initialValue: multiSupplierCategoryDesc,
                  })(<span>{multiSupplierCategoryDesc}</span>)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={48}>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl.get('spfm.disposeInvite.model.topinfo.creationDate').d('邀请时间')}
                >
                  {getFieldDecorator('creationDate', {
                    initialValue: creationDate,
                  })(<span>{creationDate ? dateRender(creationDate) : null}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl.get('spfm.disposeInvite.model.topinfo.inviteRemark').d('邀请备注')}
                >
                  {getFieldDecorator('inviteRemark', {
                    initialValue: inviteRemark,
                  })(<span>{inviteRemark}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl
                    .get(`spfm.invitationRegister.model.invitation.lifeCycle`)
                    .d('生命周期')}
                >
                  {getFieldDecorator('toCycleStageId', {
                    initialValue: toCycleStageId,
                  })(<span>{toCycleStageDescription}</span>)}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )
      : customizeForm(
          { code: 'SPFM.PARTNER_INVITE.RECEIVESUPTOP', form, dataSource },
          <Form style={{ maxWidth: 1000 }} className={styles['invite-header-form']}>
            <Row gutter={48}>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl.get('spfm.disposeInvite.model.topinfo.levelTypeFlag').d('是否集团级')}
                >
                  {getFieldDecorator('levelTypeFlag', {
                    initialValue: formatLevelTypeFlag,
                  })(<span>{yesOrNoRender(renderLevelType)}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl.get('spfm.disposeInvite.model.topinfo.privateFlag').d('私有化')}
                >
                  {getFieldDecorator('privateFlag', {
                    initialValue: privateFlag,
                  })(<span>{yesOrNoRender(privateFlag)}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl.get('spfm.disposeInvite.model.topinfo.creationDate').d('邀请时间')}
                >
                  {getFieldDecorator('creationDate', {
                    initialValue: creationDate,
                  })(<span>{creationDate ? dateRender(creationDate) : null}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl.get('spfm.disposeInvite.model.topinfo.roleType').d('供应商角色')}
                >
                  {getFieldDecorator('roleType', {
                    initialValue: roleType,
                  })(<span>{roleTypeMeaning}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT}
                  label={intl.get('spfm.disposeInvite.model.topinfo.inviteRemark').d('邀请备注')}
                >
                  {getFieldDecorator('inviteRemark', {
                    initialValue: inviteRemark,
                  })(<span>{inviteRemark}</span>)}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        );
  }
}

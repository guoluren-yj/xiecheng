/**
 * BasicInfoForm - 基本信息表单
 * @date: 2018-12-23
 * @author: LC <chao.li03@hand-china>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Row, Col, Select, Tooltip } from 'hzero-ui';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';

import TLEditor from 'components/TLEditor';

const promptCode = 'ssrc.sourceTemplate';
/**
 * 基本信息Form
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 */
export default class BasicInfoForm extends PureComponent {
  /**
   * setValue - onChange 子集信息
   * @description 规则： {'RFQ':询价, 'RFA':'竞价',BID '招投标'}
   * @description  改变值：[{'autoDeferType':'延时触发规则'},{'openRule':'公开规则'},
   * {'auctionRanking':'竞价排名':}，{'auctionRule':'竞价规则'}
   */
  @Bind()
  setValue = (e) => {
    const { form, isBid } = this.props;
    const { registerField } = form;
    registerField('quotationEndDateFlag');
    registerField('openRule');
    registerField('auctionRanking');
    registerField('auctionRule');
    registerField('continuousQuotationFlag');
    registerField('sourceStage');
    registerField('roundQuotationRule');
    registerField('openEliminateFlag');
    registerField('rankRule');
    registerField('quotationType');
    registerField('checkSelectionDimension');
    registerField('leaderNoScoreFlag');
    const newBidFlag = isBid && form?.getFieldValue('secondarySourceCategory') === 'NEW_BID';
    // 询价
    if (e === 'RFQ' && !newBidFlag) {
      form.setFieldsValue({
        sourceStage: 'COMMON',
        roundQuotationRule: 'NONE',
        openEliminateFlag: 0,
        quotationEndDateFlag: 1,
        autoDeferFlag: 0,
        autoDeferType: null,
        autoDeferTimeRule: null,
        openRule: null,
        auctionRanking: null,
        auctionRule: null,
        autoDeferPeriod: undefined,
        maxDeferCount: undefined,
        autoDeferDuration: undefined,
        rankRule: null,
        leaderNoScoreFlag: form.getFieldValue('expertScoreType') === 'ONLINE' ? 0 : null,
      });
    } else if (e === 'RFA') {
      // 竞价
      form.setFieldsValue({
        quotationEndDateFlag: 1,
        // autoDeferType: 'NEW_OFFER',
        openRule: 'OPEN_IDENTITY_OPEN_QUOTE',
        auctionRanking: 'OPEN_COUNT_OPEN_RANK',
        auctionRule: 'NONE',
        continuousQuotationFlag: 1, // 允许供应商连续报价
        sourceStage: 'COMMON',
        roundQuotationRule: 'NONE',
        openEliminateFlag: 0,
        rankRule: 'UNIT_PRICE',
        quotationType: 'ONLINE',
        checkSelectionDimension: 'ITEM',
        leaderNoScoreFlag: form.getFieldValue('expertScoreType') === 'ONLINE' ? 0 : null,
      });
    } else if (e === 'BID') {
      // 招投标
      form.setFieldsValue({
        quotationEndDateFlag: 1,
        autoDeferFlag: 0,
        pretrialFlag: 0,
        autoDeferType: null,
        autoDeferTimeRule: null,
        openRule: null,
        auctionRanking: null,
        auctionRule: null,
        autoDeferPeriod: undefined,
        maxDeferCount: undefined,
        autoDeferDuration: undefined,
        sourceStage: 'COMMON',
        roundQuotationRule: 'NONE',
        openEliminateFlag: 0,
        bargainOfflineFlag: 0,
        bargainRule: 'NONE',
        rankRule: null,
        quotationType: 'ONLINE',
        initialReview: 'NONE',
        leaderNoScoreFlag: null,
        noticeEndNodeCode: '90', // 设置为【无需提前终止】
        expandResultsFlag: 0, // 老招标 重置拓展寻源结果
      });
    }
  };

  // 气泡显示
  basicInfoFormTooltip = (type) => {
    let defaultTitle;
    let title;
    switch (type) {
      // 寻源类别
      case 'sourceCategory':
        defaultTitle = intl.get(`${promptCode}.model.template.sourcingCategory`).d('寻源类别');
        title = intl
          .get(`${promptCode}.model.template.sourcingCategoryTitle`)
          .d('用于标识创建的寻源单类别');
        break;
      default:
        break;
    }
    return (
      <Tooltip title={title} placement="top">
        {defaultTitle}
      </Tooltip>
    );
  };

  showSourceCategory = () => {
    const { remote } = this.props;
    if (remote) {
      return remote.process('SSRC_SOURCE_TEMPLATE_DETIAL_PROCESS_HIDESOURCECATEGORY', {}, {});
    }
  };

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      form = {},
      sourceGaty,
      dataSource,
      customizeForm,
      isHistory,
      isBid,
      secondarySourceCategory,
      remote,
    } = this.props;
    const { getFieldDecorator } = form;

    const formLayout = { labelCol: { span: 9 }, wrapperCol: { span: 15 } };
    const disabledStyle = {
      color: isHistory ? '#aaa' : 'black',
      background: isHistory ? '#fafafa' : '',
      border: isHistory ? '1px solid #d9d9d9' : '1px solid #d9d9d9',
    };

    const renderProps = { dataSource, form, isBid, setValue: this.setValue };

    return customizeForm(
      {
        code: 'SOURCE.TEMPLATE.BASIC',
        form,
        dataSource,
        isCreate: true,
      },
      <Form>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <Form.Item
              label={intl.get(`${promptCode}.model.template.templateNum`).d('模板编码')}
              {...formLayout}
            >
              {getFieldDecorator('templateNum', {
                initialValue: dataSource.templateNum,
              })(<Input trim disabled maxLength={40} />)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={intl.get(`${promptCode}.model.template.templateName`).d('模板名称')}
              {...formLayout}
            >
              {getFieldDecorator('templateName', {
                initialValue: dataSource.templateName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.template.templateName`).d('模板名称'),
                    }),
                  },
                  {
                    max: 180,
                    message: intl.get('hzero.common.validation.max', {
                      max: 180,
                    }),
                  },
                ],
              })(
                <TLEditor
                  label={intl.get(`${promptCode}.model.template.templateName`).d('模板名称')}
                  field="templateName"
                  token={dataSource._token}
                  inputSize={{ zh: 180, en: 180 }}
                  disabled={isHistory}
                />
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={this.basicInfoFormTooltip('sourceCategory')}
              {...formLayout}
              style={this.showSourceCategory()}
            >
              {getFieldDecorator(isBid ? 'secondarySourceCategory' : 'sourceCategory', {
                initialValue: isBid
                  ? dataSource.secondarySourceCategory
                  : dataSource.sourceCategory || 'RFQ',
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.template.sourcingCategory`).d('寻源类别'),
                    }),
                  },
                ],
              })(
                <Select onChange={this.setValue} allowClear disabled={isHistory}>
                  {(isBid ? secondarySourceCategory : sourceGaty).map((item) => (
                    <Select.Option value={item.value} key={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <Form.Item
              label={intl.get(`${promptCode}.model.template.versionNumber`).d('版本')}
              {...formLayout}
            >
              {getFieldDecorator('versionNumber', {
                initialValue: dataSource.versionNumber,
              })(<Input disabled maxLength={40} />)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={intl.get('hzero.common.status').d('状态')} {...formLayout}>
              {getFieldDecorator('templateStatusMeaning', {
                initialValue: dataSource.templateStatusMeaning,
              })(<Input disabled maxLength={40} />)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={intl.get(`${promptCode}.model.template.templateDesc`).d('模板描述')}
              {...formLayout}
            >
              {getFieldDecorator('templateDesc', {
                initialValue: dataSource.templateDesc,
              })(
                <Input.TextArea readOnly={isHistory} maxLength={300} style={{ ...disabledStyle }} />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={8}>
            {remote
              ? remote.render('SSRC_SOURCE_TEMPLATE_DETIAL_RENDER_SOURCEMETHOD', <></>, renderProps)
              : null}
          </Col>
        </Row>
      </Form>
    );
  }
}

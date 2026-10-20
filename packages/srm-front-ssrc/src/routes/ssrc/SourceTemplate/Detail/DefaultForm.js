/**
 * RuleForm - 寻源规则配置表单
 * @date: 2018-12-23
 * @author: LC <chao.li03@hand-china>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import { Form, Select, Row, Col, InputNumber, Tooltip } from 'hzero-ui';

import intl from 'utils/intl';

import Checkbox from 'components/Checkbox';
import Lov from 'components/Lov';
// import styles from './index.less';

const promptCode = 'ssrc.sourceTemplate';

export default class RuleForm extends PureComponent {
  defaultForm = (type) => {
    let defaultTitle;
    let title;
    switch (type) {
      // 寻源方式
      case 'sourcingApproach':
        defaultTitle = intl.get(`${promptCode}.model.template.sourceMethod`).d('寻源方式');
        title = intl
          .get(`${promptCode}.model.template.approachTitle`)
          .d(
            '用于控制寻源业务的范围，“邀请”表示将寻源单据发给供应商列表所邀请的供应商；“合作伙伴公开”表示将寻源单据发给所选公司的所有合作伙伴；“全平台公开”表示将寻源单据发给平台上所有的供应商。'
          );
        break;
      // 报价方式
      case 'quotationType':
        defaultTitle = intl.get(`${promptCode}.model.template.quotationType`).d('报价方式');
        title = intl
          .get(`${promptCode}.model.template.newqTTitle`)
          .d(
            '用于配置供应商的报价方式。“线上报价”表示供应商只能在系统中进行线上报价；“线下报价”表示只能由采购员通过线下寻源结果录入的功能将供应商的报价信息导入进寻源单；“线上线下并行”表示线上报价和线下录入可以并行。'
          );
        break;
      // 报价方向
      case 'auctionDirection':
        defaultTitle = intl.get(`${promptCode}.model.template.auctionDirection`).d('报价方向');
        title = intl
          .get(`${promptCode}.model.template.auctionTitle`)
          .d(
            '用于控制供应商的报价方向。荷兰式表示报价必须越来越低；英式表示报价必须越来越高；无要求表示对报价方向无控制。'
          );
        break;
      // 竞价规则
      case 'auctionRule':
        defaultTitle = intl.get(`${promptCode}.model.template.auctionRule`).d('竞价规则');
        title = intl
          .get(`${promptCode}.model.template.auctionRuleTitle`)
          .d('在竞价寻源类别中，用于控制供应商报价时能否与其他供应商报相同的价格。');
        break;
      // 公开规则
      case 'openRule':
        defaultTitle = intl.get(`${promptCode}.model.template.openRule`).d('公开规则');
        title = intl
          .get(`${promptCode}.model.template.openRuleTitle`)
          .d('在竞价寻源类别中，用于控制供应商报价时能否看到其他供应商的报价和身份。');
        break;
      // 延时时长
      case 'autoDeferDuration':
        defaultTitle = intl.get(`${promptCode}.model.template.autoDeferDuration`).d('延时时长');
        title = intl
          .get(`${promptCode}.model.template.quotationTypeTitle`)
          .d('在竞价寻源类别中，用于配置发生自动延时时，延时的时间长短。');
        break;
      // 最少报价供应商数
      case 'minQuotedSupplier':
        defaultTitle = intl
          .get(`${promptCode}.model.template.minQuotedSupplier`)
          .d('最少报价供应商数');
        title = intl
          .get(`${promptCode}.model.template.newMinQuotedSupplierTitle`)
          .d('“当报价供应商数量”小于“最少报价供应商数”时，报价截止后需人工决定寻源是否继续进行');
        break;
      case 'quotationChange':
        defaultTitle = intl
          .get(`${promptCode}.model.template.quotationChange`)
          .d('供应商升降价设置');
        title = intl
          .get(`${promptCode}.model.template.quotationChangeTooltip`)
          .d('用于配置供应商报价能否按物料行单独报价');
        break;
      case 'detailPriceControlRule':
        defaultTitle = intl
          .get(`${promptCode}.model.template.detailPriceControlRule`)
          .d('报价明细总价管控');
        title = intl
          .get(`${promptCode}.model.template.controlDetailPriceControlRule`)
          .d(
            '用于控制行单价与行报价明细总价之间的关系。该配置项正常管控的前提：报价模板列字段中，单价列编码为Price，数量列编码为Quantity。'
          );
        break;
      case 'selectionStrategy':
        defaultTitle = intl.get(`${promptCode}.model.template.selectionStrategy`).d('选择策略');
        title = intl
          .get(`${promptCode}.model.template.selectionStrategyTemplateLable`)
          .d('用于配置核价阶段默认的选择策略');
        break;
      case 'quotationScope':
        defaultTitle = intl.get(`${promptCode}.model.template.quotationScope`).d('选择策略');
        title = intl
          .get(`${promptCode}.model.template.quotationScopeTooltip`)
          .d(
            '用于配置供应商是否报价范围。全部报价表示供应商必须整单报价，不可以放弃物料行报价；部分报价表示供应商可以部分报价，可以放弃部分物料行报价。'
          );
        break;
      case 'priceCategory':
        defaultTitle = intl.get(`${promptCode}.model.template.priceCategory`).d('价格类型');
        title = intl
          .get(`${promptCode}.model.template.priceCategoryTooltip`)
          .d('用于标记物料的单价是针对标准还是样品。');
        break;
      case 'sourcingType':
        defaultTitle = intl.get(`${promptCode}.model.template.sourcingType`).d('寻源类型');
        title = intl
          .get(`${promptCode}.model.template.sourcingTypeTooltip`)
          .d('用于标记寻源单的类型。');
        break;
      case 'allowChangePayWayFlag':
        defaultTitle = intl
          .get(`${promptCode}.model.template.allowChangePayWayFlag`)
          .d('是否允许供应商修改付款条款&方式');
        title = intl
          .get(`${promptCode}.model.template.allowChangePayWayFlagTooltip`)
          .d(
            '用于配置供应商是否可修改付款条款/方式。勾选表示报价时可以修改付款条款/方式；不勾选则不可以修改。'
          );
        break;
      case 'taxIncludedFlag':
        defaultTitle = intl.get(`${promptCode}.model.template.taxIncludedFlag`).d('是否含税');
        title = intl
          .get(`${promptCode}.model.template.taxIncludedFlagTooltip`)
          .d('用于配置是否询源单价是否需要含税。');
        break;
      case 'taxId':
        defaultTitle = intl.get(`${promptCode}.model.template.taxId`).d('税率');
        title = intl
          .get(`${promptCode}.model.template.taxIdTooltip`)
          .d('勾选了含税后，用于配置具体税率大小。');
        break;
      case 'freightIncludedFlag':
        defaultTitle = intl.get(`${promptCode}.model.template.freightIncludedFlag`).d('是否含运费');
        title = intl
          .get(`${promptCode}.model.template.freightIncludedFlagTooltip`)
          .d('用于配置是否询源单价是否含有运费。');
        break;
      case 'sourceMatterNotice':
        defaultTitle = intl
          .get(`${promptCode}.model.template.sourceMatterNotice`)
          .d('寻源事项须知');
        title = intl
          .get(`${promptCode}.model.template.sourceMatterNoticeTooltip`)
          .d(
            '用于维护供应商报价期间需要阅读的事项须知。如果保持寻源事项说明内容为空，供应商参与时不会收到寻源事项说明。'
          );
        break;
      case 'sealedQuotationFlag':
        defaultTitle = intl.get(`${promptCode}.model.template.sealedQuotationFlag`).d('密封报价');
        title = intl
          .get(`${promptCode}.model.template.sealedQuotationFlagTooltip`)
          .d(
            '用于配置在报价期间内，所有报价信息是否对采购员密封保密。勾选表示采购员在报价期间内看不到任何报价信息；不勾选则采购员在报价期间内可以查看所有的报价信息。'
          );
        break;
      case 'passwordFlag':
        defaultTitle = intl.get(`${promptCode}.model.template.passwordFlag`).d('启用开标密码');
        title = intl
          .get(`${promptCode}.model.template.passwordFlagTooltip`)
          .d('用于配置开标员在开标环节是否需要开标密码，密码可在消息监控中查看。');
        break;
      case 'onlyAllowAllWinBids': // 暂时放开
        defaultTitle = intl
          .get(`${promptCode}.model.template.onlyAllowAllWinBids`)
          .d('仅允许整单中标');
        title = intl
          .get(`${promptCode}.model.template.onlyAllowAllWinBidsTooltip`)
          .d(
            '勾选后，报价范围为全部报价。勾选表示只能整单选择单个或多个供应商，不勾选表示可以区分物料选择供应商。'
          );
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

  setTaxId = (e) => {
    const { form = {} } = this.props;
    const { setFieldsValue = () => {} } = form;

    if (e.target.checked === 0) {
      setFieldsValue({
        taxId: null,
      });
    }
  };

  /**
   * 改变税率
   * @param {*} value 当前值
   * @param {*} dataList lov列表值
   */
  changetaxRate = (value, dataList) => {
    const { form = {}, taxRateConfigInfo } = this.props;
    const { setFieldsValue = () => {} } = form;
    setFieldsValue({
      taxId: dataList.taxId,
      taxRate: dataList.taxRate,
      ...(taxRateConfigInfo?.displayField &&
      !['taxRate', 'taxId'].includes(taxRateConfigInfo.displayField)
        ? {
            [taxRateConfigInfo.displayField]:
              dataList[taxRateConfigInfo?.displayField || 'taxRate'],
          }
        : {}),
    });
  };

  /**
   * 修改报价方向
   */
  onChangeAD = (value) => {
    const { form = {} } = this.props;
    if (value === 'NONE') {
      form.setFieldsValue({
        auctionRule: 'NONE',
      });
    }
  };

  /**
   * 修改
   */
  onChangeAR = (value) => {
    const { form = {} } = this.props;
    if (value === 'TOP_ALL') {
      form.setFieldsValue({
        openRule: 'HIDE_IDENTITY_OPEN_QUOTE',
      });
    }
  };

  @Bind()
  handleOnlyAllowWinBids(e) {
    const { form = {}, checkPriceUiIsNew } = this.props;
    const { setFieldsValue = () => {} } = form;

    if (e.target.checked) {
      setFieldsValue(
        Object.assign(
          {},
          {
            quotationScope: 'ALL_QUOTATION',
            quantityChangeFlag: 0,
          },
          checkPriceUiIsNew && {
            checkSelectionDimension: 'ALL',
          }
        )
      );
    }
  }

  @Bind()
  handleChangeQuotationScope(value) {
    const { form = {}, checkPriceUiIsNew } = this.props;
    const { setFieldsValue = () => {} } = form;

    if (value === 'PART_QUOTATION' && checkPriceUiIsNew) {
      setFieldsValue({
        checkSelectionDimension: 'ITEM',
      });
    }
  }

  render() {
    const {
      form = {},
      sourceMd,
      quotationType,
      sourceAuctionDir,
      quotationChange,
      detailPriceControlRule,
      reaAuction,
      reaOpen,
      sourcePrice,
      sourceTy,
      dataSource,
      quotationScope,
      onShowMatterDetailModal,
      customizeForm,
      selectionStrategys,
      isHistory,
      checkPriceUiIsNew,
      isBid,
      allOpenSelectable,
      newQuotationFlag = 0,
      taxRateConfigInfo,
    } = this.props;

    const { getFieldDecorator = (e) => e, getFieldValue } = form;
    const params = form.getFieldsValue();
    const formLayout = {
      labelCol: { span: 9 },
      wrapperCol: { span: 15 },
    };
    const sourceType = params[isBid ? 'secondarySourceCategory' : 'sourceCategory'];
    const autoRoundFlag =
      params.roundQuotationRule === 'AUTO' ||
      params.roundQuotationRule === 'AUTO_CHECK' ||
      params.roundQuotationRule === 'AUTO_SCORE';
    const filterQuotationType =
      (isBid ? getFieldValue('secondarySourceCategory') : getFieldValue('sourceCategory')) === 'BID'
        ? quotationType.filter((item) => item.value === 'ONLINE')
        : quotationType;
    return customizeForm(
      {
        code: 'SOURCE.TEMPLATE.DEFINE',
        form,
        dataSource,
      },
      <Form>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <Form.Item label={this.defaultForm('sourcingApproach')} {...formLayout}>
              {getFieldDecorator('sourceMethod', {
                initialValue: dataSource.sourceMethod,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.template.sourceMethod`).d('寻源方式'),
                    }),
                  },
                ],
              })(
                <Select allowClear disabled={isHistory}>
                  {sourceMd
                    .filter((item) => item.value !== 'ALL_OPEN' || allOpenSelectable)
                    .map((item) => (
                      <Select.Option
                        value={item.value}
                        key={item.value}
                        disabled={
                          (params.matchRestrictFlag && item.value !== 'INVITE') ||
                          (params.rankRule === 'WEIGHT_PRICE' && item.value !== 'INVITE')
                        }
                      >
                        {item.meaning}
                      </Select.Option>
                    ))}
                </Select>
              )}
            </Form.Item>
          </Col>
          {((!isBid && form.getFieldValue('sourceCategory') !== 'RFA') ||
            (isBid && form.getFieldValue('secondarySourceCategory') !== 'RFA')) && (
            <Col span={8}>
              <Form.Item label={this.defaultForm('quotationScope')} {...formLayout}>
                {getFieldDecorator('quotationScope', {
                  initialValue: dataSource.quotationScope,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.model.template.quotationScope`).d('报价范围'),
                      }),
                    },
                  ],
                })(
                  <Select
                    disabled={params.onlyAllowAllWinBids || isHistory}
                    onChange={this.handleChangeQuotationScope}
                  >
                    {quotationScope.map((item) => (
                      <Select.Option value={item.value} key={item.value}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
          )}
          <Col span={8}>
            <Form.Item label={this.defaultForm('quotationType')} {...formLayout}>
              {getFieldDecorator('quotationType', {
                initialValue: dataSource.quotationType,
              })(
                <Select disabled={isHistory}>
                  {filterQuotationType &&
                    filterQuotationType.map((item) => (
                      <Select.Option
                        value={item.value}
                        key={item.value}
                        disabled={
                          (isBid && params.secondarySourceCategory === 'RFA') ||
                          (!isBid &&
                            params.sourceCategory === 'RFA' &&
                            (item.value === 'ON_OFF' || item.value === 'OFFLINE'))
                        }
                      >
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
            <Form.Item label={this.defaultForm('auctionDirection')} {...formLayout}>
              {getFieldDecorator('auctionDirection', {
                initialValue: dataSource.auctionDirection || 'REVERSE',
              })(
                <Select
                  disabled={
                    (isBid
                      ? params.secondarySourceCategory === 'BID'
                      : params.sourceCategory === 'BID') || isHistory
                  }
                  onChange={this.onChangeAD}
                >
                  {sourceAuctionDir.map((item) => (
                    <Select.Option
                      value={item.value}
                      key={item.value}
                      disabled={sourceType === 'RFA' && item.value === 'NONE'}
                    >
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={this.defaultForm('detailPriceControlRule')} {...formLayout}>
              {getFieldDecorator('detailPriceControlRule', {
                initialValue: dataSource.detailPriceControlRule || 'NONE',
              })(
                <Select disabled={isHistory}>
                  {detailPriceControlRule.map((item) => (
                    <Select.Option value={item.value} key={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
          {!newQuotationFlag ? (
            <Col span={8}>
              <Form.Item label={this.defaultForm('quotationChange')} {...formLayout}>
                {getFieldDecorator('quotationChange', {
                  initialValue: dataSource.quotationChange || 'ORDER_ITEM',
                })(
                  <Select
                    disabled={
                      (isBid
                        ? params.secondarySourceCategory === 'BID'
                        : params.sourceCategory === 'BID') || isHistory
                    }
                  >
                    {quotationChange.map((item) => (
                      <Select.Option value={item.value} key={item.value}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
          ) : (
            ''
          )}
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <Form.Item label={this.defaultForm('auctionRule')} {...formLayout}>
              {getFieldDecorator('auctionRule', {
                initialValue: dataSource.auctionRule,
              })(
                <Select
                  disabled={
                    (!isBid && params.sourceCategory !== 'RFA') ||
                    (isBid && params.secondarySourceCategory !== 'RFA') ||
                    isHistory
                  }
                  onChange={this.onChangeAR}
                >
                  {reaAuction.map((item) => (
                    <Select.Option
                      value={item.value}
                      key={item.value}
                      disabled={params.auctionDirection === 'NONE' && item.value === 'TOP_ALL'}
                    >
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={this.defaultForm('openRule')} {...formLayout}>
              {getFieldDecorator('openRule', {
                initialValue: dataSource.openRule,
              })(
                <Select
                  disabled={
                    (!isBid && params.sourceCategory !== 'RFA') ||
                    (isBid && params.secondarySourceCategory !== 'RFA') ||
                    isHistory
                  }
                >
                  {reaOpen.map((item) => (
                    <Select.Option
                      value={item.value}
                      key={item.value}
                      disabled={
                        (params.auctionRule === 'TOP_ALL' &&
                          item.value === 'HIDE_IDENTITY_HIDE_QUOTE') ||
                        (params.auctionRule === 'TOP_ALL' &&
                          item.value === 'OPEN_IDENTITY_HIDE_QUOTE')
                      }
                    >
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={this.defaultForm('priceCategory')} {...formLayout}>
              {getFieldDecorator('priceCategory', {
                initialValue: dataSource.priceCategory || 'STANDARD',
              })(
                <Select disabled={isHistory}>
                  {sourcePrice.map((item) => (
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
            <Form.Item label={this.defaultForm('sourcingType')} {...formLayout}>
              {getFieldDecorator('sourceType', {
                initialValue: dataSource.sourceType || 'NORMAL',
              })(
                <Select disabled={isHistory}>
                  {sourceTy.map((item) => (
                    <Select.Option value={item.value} key={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={this.defaultForm('autoDeferDuration')} {...formLayout}>
              {getFieldDecorator('autoDeferDuration', {
                initialValue: dataSource.autoDeferDuration,
                rules: [
                  {
                    required: params.autoDeferFlag,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${promptCode}.model.template.autoDeferDuration`)
                        .d('延时时长'),
                    }),
                  },
                ],
              })(
                <InputNumber
                  min={1}
                  max={999999999999999}
                  placeholder={intl
                    .get(`${promptCode}.model.template.unit.minutes`)
                    .d('单位：分钟')}
                  disabled={!params.autoDeferFlag || isHistory}
                  style={{ width: '100%' }}
                />
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={this.defaultForm('minQuotedSupplier')} {...formLayout}>
              {getFieldDecorator('minQuotedSupplier', {
                initialValue: dataSource.minQuotedSupplier || 1,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${promptCode}.model.template.minQuotedSupplier`)
                        .d('最少报价供应商数'),
                    }),
                  },
                ],
              })(<InputNumber precision={0} min={1} max={99999999999} disabled={isHistory} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <Form.Item label={this.defaultForm('allowChangePayWayFlag')} {...formLayout}>
              {getFieldDecorator('paymentTermFlag', {
                initialValue: dataSource.paymentTermFlag || 0,
              })(<Checkbox disabled={isHistory} />)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={this.defaultForm('taxIncludedFlag')} {...formLayout}>
              {getFieldDecorator('taxIncludedFlag', {
                initialValue: dataSource.taxIncludedFlag || 0,
              })(<Checkbox onChange={this.setTaxId} disabled={isHistory} />)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={this.defaultForm('taxId')} {...formLayout}>
              {getFieldDecorator('taxId', {
                initialValue: dataSource.taxId,
              })(
                <Lov
                  code="SMDM.TAX"
                  // textField="taxIdMeaning"
                  textValue={dataSource?.taxIdMeaning}
                  disabled={params.taxIncludedFlag === 0 || isHistory}
                  onChange={(value, dataList) => this.changetaxRate(value, dataList)}
                />
              )}
              {getFieldDecorator('taxRate', { initialValue: dataSource.taxRate })}
              {taxRateConfigInfo?.displayField && taxRateConfigInfo.displayField !== 'taxRate'
                ? getFieldDecorator(taxRateConfigInfo.displayField, {
                    initialValue: dataSource[taxRateConfigInfo.displayField],
                  })
                : ''}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <Form.Item label={this.defaultForm('freightIncludedFlag')} {...formLayout}>
              {getFieldDecorator('freightIncludedFlag', {
                initialValue: dataSource.freightIncludedFlag || 0,
              })(<Checkbox disabled={isHistory} />)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={this.defaultForm('sourceMatterNotice')} {...formLayout}>
              {getFieldDecorator('sourceMatterNotice')(
                <a
                  onClick={() => onShowMatterDetailModal()}
                  // className={!isHistory ? styles.defineList : styles.defineListDisabled}
                >
                  {!isHistory
                    ? intl.get('hzero.common.button.edit').d('编辑')
                    : intl.get('hzero.common.button.look').d('查看')}
                </a>
              )}
            </Form.Item>
          </Col>
          <Col
            span={8}
            style={{
              display: !isBid
                ? form.getFieldValue('sourceCategory') === 'BID'
                : form.getFieldValue('secondarySourceCategory') === 'BID'
                  ? 'none'
                  : 'block',
            }}
          >
            <Form.Item label={this.defaultForm('sealedQuotationFlag')} {...formLayout}>
              {getFieldDecorator('sealedQuotationFlag', {
                initialValue: params.fastBidding
                  ? 0
                  : (autoRoundFlag && 1) || dataSource.sealedQuotationFlag || 0,
              })(<Checkbox disabled={params.fastBidding || autoRoundFlag || isHistory} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <Form.Item label={this.defaultForm('passwordFlag')} {...formLayout}>
              {getFieldDecorator('passwordFlag', {
                initialValue: dataSource.passwordFlag || 0,
              })(<Checkbox disabled={isHistory} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          {!checkPriceUiIsNew && (
            <Col span={8}>
              <Form.Item label={this.defaultForm('selectionStrategy')} {...formLayout}>
                {getFieldDecorator('selectionStrategy', {
                  initialValue: dataSource.selectionStrategy || 'RELEASE',
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.model.template.selectionStrategy`)
                          .d('选择策略'),
                      }),
                    },
                  ],
                })(
                  <Select disabled={isHistory}>
                    {selectionStrategys.map((item) => (
                      <Select.Option value={item.value} key={item.value}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
          )}
        </Row>
      </Form>
    );
  }
}

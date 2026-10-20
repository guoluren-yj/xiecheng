/*
 * Source - 配置中心-采购方-寻源
 * @date: 2018/09/12 14:51:47
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Row, Col, Button, Radio } from 'hzero-ui';
import Checkbox from 'components/Checkbox';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

const RadioGroup = Radio.Group;
/**
 * 配置中心-采购方-订单
 * @extends {Component} - React.Component
 * @reactProps {Object} companyInfo - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @return React.element    onChange={onChange}
 */
export default class Source extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      orderPrintFlag: false,
    };
  }

  @Bind()
  handleOrderPrint() {
    const { orderPrintFlag } = this.state;
    this.setState({
      orderPrintFlag: !orderPrintFlag,
    });
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
    } = this.props;
    const { orderPrintFlag } = this.state;
    return (
      <Row>
        <Col span={3}>{intl.get(`spfm.configServer.view.source.custom`).d('寻源：')}</Col>
        <Col span={21}>
          {getFieldDecorator('purchaser#source-result-import')(
            <Checkbox.Group style={{ width: '100%' }}>
              <Row>
                <Col span={24}>
                  {intl.get(`spfm.configServer.view.source.customResultImport`).d('寻源结果导入')}
                </Col>
                <Col span={6}>
                  <Checkbox value="A">
                    {intl
                      .get(`spfm.configServer.view.source.inquiryResultLog`)
                      .d('询价结果生成信息记录')}
                  </Checkbox>
                </Col>
                <Col span={18}>
                  <Checkbox
                    value="B"
                    disabled={
                      !(
                        getFieldValue('purchaser#source-result-import') &&
                        getFieldValue('purchaser#source-result-import').indexOf('A') >= 0
                      )
                    }
                  >
                    {intl.get(`spfm.configServer.view.source.automaticImport`).d('自动导入')}
                  </Checkbox>
                </Col>
                <Col span={6}>
                  <Checkbox value="C">
                    {intl
                      .get(`spfm.configServer.view.source.bidResultLog`)
                      .d('中标结果生成信息记录')}
                  </Checkbox>
                </Col>
                <Col span={18}>
                  <Checkbox
                    value="D"
                    disabled={
                      !(
                        getFieldValue('purchaser#source-result-import') &&
                        getFieldValue('purchaser#source-result-import').indexOf('C') >= 0
                      )
                    }
                  >
                    {intl.get(`spfm.configServer.view.source.automaticImport`).d('自动导入')}
                  </Checkbox>
                </Col>
                <Col span={6}>
                  <Checkbox value="E">
                    {intl
                      .get(`spfm.configServer.view.source.backPurchaseRequest`)
                      .d('回写采购申请')}
                  </Checkbox>
                </Col>
                <Col span={18}>
                  <Checkbox
                    value="F"
                    disabled={
                      !(
                        getFieldValue('purchaser#source-result-import') &&
                        getFieldValue('purchaser#source-result-import').indexOf('E') >= 0
                      )
                    }
                  >
                    {intl.get(`spfm.configServer.view.source.automaticImport`).d('自动导入')}
                  </Checkbox>
                </Col>
              </Row>
            </Checkbox.Group>
          )}
          {getFieldDecorator('purchaser#order-relation-sup-auth')(
            <Checkbox.Group style={{ width: '100%' }}>
              <Row>
                <Col span={24}>
                  {intl
                    .get(`spfm.configServer.view.source.associatedSupAuthor`)
                    .d('关联供应商权限')}
                </Col>
                <Col span={24}>
                  <Checkbox value="deliver-create">
                    {intl.get(`spfm.configServer.view.source.deliveNoteCreate`).d('送货单创建')}
                  </Checkbox>
                </Col>
                <Col span={24}>
                  <Checkbox value="account-statement-create">
                    {intl.get(`spfm.configServer.view.source.checkNoteCreate`).d('对账单创建')}
                  </Checkbox>
                </Col>
                <Col span={24}>
                  <Checkbox value="D">
                    {intl.get(`spfm.configServer.view.source.invoiceCreate`).d('发票创建')}
                  </Checkbox>
                </Col>
                <Col span={24}>
                  <Checkbox value="E">
                    {intl.get(`spfm.configServer.view.source.deliveNoteSearch`).d('送货单查询')}
                  </Checkbox>
                </Col>
                <Col span={24}>
                  <Checkbox value="E">
                    {intl.get(`spfm.configServer.view.source.checkNoteSearch`).d('对账单查询')}
                  </Checkbox>
                </Col>
                <Col span={24}>
                  <Checkbox value="E">
                    {intl.get(`spfm.configServer.view.source.invoiceSearch`).d('发票查询')}
                  </Checkbox>
                </Col>
              </Row>
            </Checkbox.Group>
          )}
          <Row>
            <Col span={24}>
              {intl.get(`spfm.configServer.view.source.purchasePublishRules`).d('采购订单发布规则')}
            </Col>
            <Col span={24}>
              <Button size="small" onClick={() => console.log(1)}>
                {intl.get(`spfm.configServer.view.source.rulesDetailDefine`).d('规则明细定义')}
              </Button>
            </Col>
            <Col span={24}>
              {intl.get(`spfm.configServer.view.source.purchaseTypeDefine`).d('采购订单类型定义')}
            </Col>
            <Col span={24}>
              <Button size="small" onClick={() => console.log(1)}>
                {intl.get(`spfm.configServer.view.source.typeDetailDefine`).d('类型明细定义')}
              </Button>
            </Col>
          </Row>
          {getFieldDecorator('purchaser#order-detail-define')(
            <Checkbox.Group style={{ width: '100%' }}>
              <Row>
                <Col span={24}>
                  <Checkbox value="order-print" onClick={this.handleOrderPrint}>
                    {intl
                      .get(`spfm.configServer.view.source.startPurchasePrint`)
                      .d('启用采购订单打印')}
                  </Checkbox>
                </Col>
                {orderPrintFlag &&
                  getFieldDecorator('order-print-radio')(
                    <Col span={24}>
                      <RadioGroup>
                        <Row>
                          <Col span={24}>
                            <Radio value="use-group-template">
                              {intl
                                .get(`spfm.configServer.view.source.useGroupTemplate`)
                                .d('使用本集团模板')}
                            </Radio>
                          </Col>
                          <Col span={24}>
                            <Radio value="use-default-template">
                              {intl
                                .get(`spfm.configServer.view.source.usedefaultTemplate`)
                                .d('使用默认模板')}
                            </Radio>
                          </Col>
                        </Row>
                      </RadioGroup>
                    </Col>
                  )}
                <Col span={24}>
                  <Checkbox value="account-statement-create">
                    {intl
                      .get(`spfm.configServer.view.source.importMaterialPriceLog`)
                      .d('引用物料价格信息记录')}
                  </Checkbox>
                </Col>
                <Col span={24}>
                  <Checkbox value="D">
                    {intl
                      .get(`spfm.configServer.view.source.updateMaterialPriceLog`)
                      .d('自动更新物料价格信息记录')}
                  </Checkbox>
                </Col>
                <Col span={24}>
                  <Checkbox value="E">
                    {intl
                      .get(`spfm.configServer.view.source.goodsDateIsNotNull`)
                      .d('承诺交货日期是否必输')}
                  </Checkbox>
                </Col>
                <Col span={24}>
                  <Checkbox value="E">
                    {intl
                      .get(`spfm.configServer.view.source.typeAfterMaterial`)
                      .d('规格型号置于物料名称后')}
                  </Checkbox>
                </Col>
              </Row>
            </Checkbox.Group>
          )}
        </Col>
      </Row>
    );
  }
}

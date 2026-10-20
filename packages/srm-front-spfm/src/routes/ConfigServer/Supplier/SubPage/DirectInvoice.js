/**
 * DirectInvoice 直连开票-供应商配置
 * @date: 2019-9-25
 * @author MaoJiaqi <jiaqi.mao@hand-china.com >
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Row, Col, Form, Modal } from 'hzero-ui';
import { connect } from 'dva';
import intl from 'utils/intl';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';
import { withRouter } from 'dva/router';
import { isFunction } from 'util';

import Checkbox from 'components/Checkbox';

import styles from '../../index.less';
import SubMessage from '../../components/SubMessage';

@connect(({ configServer }) => ({
  configServer,
}))
@withRouter
@Form.create({ fieldNameProp: null })
export default class DirectInvoice extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  /**
   * 是否启用直连开票
   */
  @Bind()
  handleChange(e) {
    const {
      dispatch,
      form: { setFieldsValue },
    } = this.props;
    if (e.target.value) {
      setFieldsValue({ '020001': 0 });
    } else {
      dispatch({
        type: 'configServer/fetchOpenResult',
        applicationCode: 'AP_INVOICE',
      }).then((res) => {
        if (!res) {
          Modal.confirm({
            content: intl
              .get(`spfm.configServer.view.directInvoice.goToOpenDirectInvoice`)
              .d('尚未开启此服务，是否前往开启'),
            onOk: () => {
              this.props.history.push(`/spfm/amkt-appstore`);
              setFieldsValue({ '020001': 0 });
            },
            onCancel: () => {
              setFieldsValue({ '020001': 0 });
            },
          });
        }
      });
    }
  }

  /**
   * 打开直连开票弹窗
   * @param {String} visibleKey
   */
  @Bind()
  handleModalVisible(visibleKey) {
    const { handleModal } = this.props;
    if (handleModal) {
      handleModal(visibleKey, true);
    }
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
      settings,
      configHideArr = [],
    } = this.props;
    const configList = [
      {
        key: 1,
        href: 'supDirectInvoiceConfig',
        title: intl.get(`spfm.configServer.view.directInvoice.directInvoice`).d('直连开票'),
        component: (
          <Row>
            <Col span={24}>
              {intl.get(`spfm.configServer.view.directInvoice.directInvoice`).d('直连开票')}
            </Col>
            {!configHideArr.includes('supDirectInvoiceConfig-1') && (
              <>
                <Col span={24} className={classnames('sub-item-fields', styles['flex-form-item'])}>
                  {getFieldDecorator('020001', {
                    initialValue: settings['020001'],
                  })(
                    <Checkbox onChange={this.handleChange}>
                      {intl
                        .get(`spfm.configServer.view.directInvoice.message.020001label`)
                        .d('启用直连开票')}
                    </Checkbox>
                  )}
                </Col>
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.directInvoice.message.020001subMsg`)
                    .d('当应用商店开启此服务时，启用此功能可在创建网上发票时直连开具税务发票')}
                />
              </>
            )}
            {!configHideArr.includes('supDirectInvoiceConfig-2') && (
              <>
                <Col span={24} className={classnames('sub-item-fields', styles['flex-form-item'])}>
                  <span>
                    {intl
                      .get(`spfm.configServer.view.directInvoice.directInvoiceDefinition`)
                      .d('直连开票规则定义')}
                  </span>
                  {getFieldValue('020001') === 1 && (
                    <a
                      onClick={() => this.handleModalVisible('directInvoiceVisible')}
                      className="operate-item-link"
                    >
                      {intl
                        .get(`spfm.configServer.view.common.message.enterDefinitionList`)
                        .d('进入定义列表')}
                    </a>
                  )}
                </Col>
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.directInvoice.message.020003subMsg`)
                    .d('供应商在创建网上发票时，会根据配置的规则开具税务发票')}
                />
              </>
            )}
            {!configHideArr.includes('supDirectInvoiceConfig-3') && (
              <>
                <Col span={24} className={classnames('sub-item-fields', styles['flex-form-item'])}>
                  <span>
                    {intl
                      .get(`spfm.configServer.view.Invoice.directInvoiceInfoDefinition`)
                      .d('直连开票基础信息定义')}
                  </span>
                  {getFieldValue('020001') === 1 && (
                    <a
                      onClick={() => this.handleModalVisible('directInvoiceBaseInfoVisible')}
                      className="operate-item-link"
                    >
                      {intl
                        .get(`spfm.configServer.view.common.message.enterDefinitionList`)
                        .d('进入定义列表')}
                    </a>
                  )}
                </Col>
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.directInvoice.message.020004subMsg`)
                    .d('供应商在开具税务发票前，需要事先维护基础信息，确保开具发票的准确完整。')}
                />
              </>
            )}
          </Row>
        ),
      },
    ];
    return (
      <Row className="first-tab-content" id="supDicect">
        <Col span={3}>
          <span className="label-col">
            {intl.get(`spfm.configServer.view.finance.message.message.finance`).d('财务')}：
          </span>
        </Col>
        <Col span={21} className="sub-item-right">
          {configList.map((o) => {
            if (configHideArr.includes(o.href)) {
              return null;
            } else {
              return o.component;
            }
          })}
        </Col>
      </Row>
    );
  }
}

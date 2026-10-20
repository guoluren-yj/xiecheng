/**
 * BusinessInfo - 企业认证预览-业务信息
 * @date: 2018-12-18
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Row } from 'hzero-ui';
import intl from 'utils/intl';
import ItemWrapper from './ItemWrapper';
import styles from './index.less';

export default class InvoiceInfo extends PureComponent {
  render() {
    const { invoice = {} } = this.props;
    const {
      invoiceHeader, // 发票头
      taxRegistrationNumber, // 税务登记号
      depositBank, // 开户行
      bankAccountNum, // 开户行账号
      taxRegistrationAddress, // 税务登记地址
      taxRegistrationPhone, // 税务登记电话
      receiver,
      receiveMail, // 收票人邮箱
      receivePhone, // 收票人手机号
      receiveAddress,
      internationalTelMeaning,
    } = invoice;

    return (
      <ItemWrapper
        title={intl.get('spfm.invoice.view.message.title').d('开票信息')}
        message={intl
          .get('spfm.invoice.view.message.description')
          .d('非常重要: 开票信息要保证发票真实有效，请维护准确完整的开票信息。')}
      >
        <Row className={styles['item-Row']}>
          <span className={styles.fields}>
            {intl.get('spfm.enterprise.model.invoice.invoiceHeader').d('发票头')}
          </span>
          <div className={styles['fields-content']}>{invoiceHeader}</div>
        </Row>
        <Row className={styles['item-Row']}>
          <span className={styles.fields}>
            {intl.get('spfm.enterprise.model.invoice.taxRegistrationNumber').d('税务登记号')}
          </span>
          <div className={styles['fields-content']}>{taxRegistrationNumber}</div>
        </Row>
        <Row className={styles['item-Row']}>
          <span className={styles.fields}>
            {intl.get('spfm.enterprise.model.invoice.depositBank').d('开户行')}
          </span>
          <div className={styles['fields-content']}>{depositBank}</div>
        </Row>
        <Row className={styles['item-Row']}>
          <span className={styles.fields}>
            {intl.get('spfm.enterprise.model.invoice.bankAccountNum').d('开户行账号')}
          </span>
          <div className={styles['fields-content']}>{bankAccountNum}</div>
        </Row>
        <Row className={styles['item-Row']}>
          <span className={styles.fields}>
            {intl.get('spfm.enterprise.model.invoice.taxRegistrationAddress').d('税务登记地址')}
          </span>
          <div className={styles['fields-content']}>{taxRegistrationAddress}</div>
        </Row>
        <Row className={styles['item-Row']}>
          <span className={styles.fields}>
            {intl.get('spfm.enterprise.model.invoice.taxRegistrationPhone').d('税务登记电话')}
          </span>
          <div className={styles['fields-content']}>{taxRegistrationPhone}</div>
        </Row>
        <Row className={styles['item-Row']}>
          <span className={styles.fields}>
            {intl.get('spfm.enterprise.model.invoice.receiver').d('收票人')}
          </span>
          <div className={styles['fields-content']}>{receiver}</div>
        </Row>
        <Row className={styles['item-Row']}>
          <span className={styles.fields}>
            {intl.get('spfm.enterprise.model.invoice.receiveMail').d('收票人邮箱')}
          </span>
          <div className={styles['fields-content']}>{receiveMail}</div>
        </Row>
        <Row className={styles['item-Row']}>
          <span className={styles.fields}>
            {intl.get('spfm.enterprise.model.invoice.receivePhone').d('收票人手机号')}
          </span>
          <div className={styles['fields-content']}>
            {internationalTelMeaning && receivePhone
              ? `${internationalTelMeaning} | ${receivePhone}`
              : receivePhone}
          </div>
        </Row>
        <Row className={styles['item-Row']}>
          <span className={styles.fields}>
            {intl.get('spfm.enterprise.model.invoice.receiveAddress').d('收票地址')}
          </span>
          <div className={styles['fields-content']}>{receiveAddress}</div>
        </Row>
      </ItemWrapper>
    );
  }
}

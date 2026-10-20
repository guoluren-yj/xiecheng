import React from 'react';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import logo from '@/assets/payment/zylogo.png';

import Header from './components/Header';
import styles from '@/routes/CheckoutCounter/index.less';
import styleSelf from './index.less';

const SRMHJL = () => {
  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.logo}>
        <a className={styles['logo-icon']}>
          <img src={logo} alt={intl.get('hpay.checkoutCounter.view.img.logo').d('logo')} />
        </a>
      </div>
      <div className={styles.content}>
        <h1 style={{ textAlign: 'center' }}>
          {intl.get('srm.common.view.title.userAgreement').d('用户授权协议')}
        </h1>
        <p>
          {intl
            .get('srm.common.view.tips.userAgreement1')
            .d(
              '本公司授权汉得信息，基于为本公司提供更优质服务和产品的目的，除法律另有规定之外，将本公司在“甄云SRM”的注册信息，用于访问“汇金链平台”的用户账号信息。'
            )}
        </p>
        <p>
          {intl.get('srm.common.view.tips.userAgreement2').d('前述“信息”包括')}
          <strong>
            {intl
              .get('srm.common.view.tips.userAgreement3')
              .d(
                '本公司在甄云SRM平台注册的信息（用户昵称、公司名称、类型及地址、邮箱、联系人信息）'
              )}
          </strong>
          {intl
            .get('srm.common.view.tips.userAgreement4')
            .d(
              '。为确保您的信息安全，汉得信息将努力为您的信息安全提供保障，以防止信息的丢失、不当使用、未经授权访问或披露。汉得信息对上述信息负有保密义务，并尽最大努力采取各种措施保证信息安全，未经您允许的情况下不公开您的基本信息。您同意并授权，将前述“信息”允许汉得信息与第三方共享。'
            )}
        </p>
        <p>
          <strong>
            {intl
              .get('srm.common.view.tips.userAgreement5')
              .d(
                '本授权书自您通过网络页面点击确认或以其他方式选择接受，即表示您与汉得信息已达成授权并同意接受本授权提示的全部约定内容，并代表本公司对全部授权内容的认定。'
              )}
          </strong>
          {intl
            .get('srm.common.view.tips.userAgreement6')
            .d(
              '您知晓并明确，本公司对授权提示的内容已进行确认，点击接受此授权条款是代表本公司的企业行为。'
            )}
        </p>
        <p className={styleSelf.redLine}>
          {intl
            .get('srm.common.view.tips.userAgreement7')
            .d('本授权书所称“本公司”指的是当前登录用户的所属租户。')}
        </p>
        <p>
          {intl
            .get('srm.common.view.tips.userAgreement8')
            .d(
              '本授权书所称“汉得信息”是指上海汉得信息技术股份有限公司及其直接或间接控股的公司，以及上海汉得信息技术股份有限公司直接或间接作为其单一最大股东的公司。'
            )}
        </p>
        <p>
          {intl
            .get('srm.common.view.tips.userAgreement9')
            .d(
              '本授权书所称“甄云SRM“是指上海甄云信息技术有限公司为客户提供的一站式采购协同管理平台。'
            )}
        </p>
        <p>
          {intl
            .get('srm.common.view.tips.userAgreement10')
            .d(
              '本授权书所称“汇金链平台”是指上海汉得信息技术有限公司提供的融资企业门户及服务平台。'
            )}
        </p>
        <p>
          {intl
            .get('srm.common.view.tips.userAgreement11')
            .d(
              '为了保证您的合法权益，您应当阅读并遵守本授权书，请您务必审慎阅读、充分理解本授权书以上条款内容。如果您在页面点击确认或以我们认可的其他方式确认，即表示您已充分阅读、理解并同意本授权书。'
            )}
        </p>
        <p className={styleSelf.redLine}>
          {intl
            .get('srm.common.view.tips.userAgreement12')
            .d(
              '如我们对本协议进行变更，我们将通过公告或客户端消息等方式予以通知，该等变更自通知载明的生效时间开始生效。若您无法同意变更修改后的协议内容，您有权停止使用相关服务。'
            )}
        </p>
        <p className={styleSelf.redLine}>
          {intl
            .get('srm.common.view.tips.userAgreement13')
            .d(
              '本协议之效力、解释、变更、执行与争议解决均适用中华人民共和国法律。因本协议产生的争议，均应依照中华人民共和国法律予以处理，并由被告住所地人民法院管辖。'
            )}
        </p>
      </div>
    </div>
  );
};

export default formatterCollections({
  code: ['hpay.checkoutCounter', 'srm.common'],
})(SRMHJL);

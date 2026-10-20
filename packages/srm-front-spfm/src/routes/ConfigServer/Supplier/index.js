/**
 * SupplierIndex 平台服务-供应商配置
 * @date: 2018-8-27
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import Menu from '../Menu/index';
import styles from '../index.less';
import DirectInvoice from './SubPage/DirectInvoice';
import DiectInvoiceModal from './SubPage/DirectInvoiceModal';
import DirectInvoiceBaseInfoModal from './SubPage/DirectInvoiceBaseInfoModal';

@connect(({ configServer }) => ({
  configServer,
}))
export default class SupplierIndex extends PureComponent {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
    this.state = {
      directInvoiceVisible: false, // 直连发票规则定义
      directInvoiceBaseInfoVisible: false, // 直连发票信息定义
    };
  }

  /**
   * 改变state
   * @param {*} param
   * @param {*} flag
   * @param {*} [otherParams={}]
   */
  @Bind()
  handleStateVisible(param, flag, otherParams = {}) {
    this.setState({
      [param]: !!flag,
      ...otherParams,
    });
  }

  render() {
    const { directInvoiceVisible, directInvoiceBaseInfoVisible } = this.state;
    const {
      configServer: { settings, configHideArr = [] },
    } = this.props;
    const diectInvoiceProps = {
      settings,
      configHideArr,
      onRef: (node) => {
        this.diectInvoiceRef = node;
      },
      handleModal: this.handleStateVisible,
    };
    const diectInvoiceModalProps = {
      directInvoiceVisible,
      handleModal: this.handleStateVisible,
    };
    const directInvoiceBaseInfoProps = {
      directInvoiceBaseInfoVisible,
      handleModal: this.handleStateVisible,
    };
    const menuList = [
      {
        key: 1,
        href: 'supDicect',
        title: intl.get(`spfm.configServer.view.finance.message.message.finance`).d('财务'),
        component: <DirectInvoice {...diectInvoiceProps} />,
      },
    ];
    return (
      <div className={styles.content}>
        <div className={styles['left-wrapper']}>
          <Menu
            menuList={menuList}
            configHideArr={configHideArr}
            getContainer={() => document.getElementById('config-server-subpplier-scroll-area')}
          />
        </div>
        <div id="config-server-subpplier-scroll-area" className={styles['right-wrapper']}>
          <div className={classnames(styles['config-content'])}>
            {menuList.map((o) => {
              if (configHideArr.includes(o.href)) {
                return null;
              } else {
                return o.component;
              }
            })}
            {directInvoiceVisible && <DiectInvoiceModal {...diectInvoiceModalProps} />}
            {directInvoiceBaseInfoVisible && (
              <DirectInvoiceBaseInfoModal {...directInvoiceBaseInfoProps} />
            )}
          </div>
        </div>
      </div>
    );
  }
}

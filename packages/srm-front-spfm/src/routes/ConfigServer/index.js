/**
 * ConfigIndex 平台服务-配置中心
 * @date: 2018-8-27
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button, Tabs } from 'hzero-ui';
import { connect } from 'dva';
import { omit, merge } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { Content, Header } from 'components/Page';

import PurchaserIndex from './Purchaser/index';
import SupplierIndex from './Supplier/index';
import CommonIndex from './Common/index';
import styles from './index.less';

const { TabPane } = Tabs;
@connect(({ loading, configServer }) => ({
  loading: loading.effects['configServer/fetchSettings'],
  saving: loading.effects['configServer/saveSettings'],
  configServer,
}))
@formatterCollections({
  code: [
    'spfm.configServer',
    'entity.company',
    'entity.supplier',
    'entity.organization',
    'entity.order',
    'scec.MinimumOrderAmountModal',
    'spfm.common',
    'scec.configServer',
    'scec.common',
    'spfm.MinimumOrderAmountModal',
    'small.MinimumOrderAmountModal',
    'sslm.sample',
    'entity.item',
  ],
})
export default class ConfigIndex extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tenantId: getCurrentOrganizationId(),
    };
  }

  commonRef;

  purchaseRef;

  supplierRef;

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'configServer/init',
    });
    dispatch({
      type: 'configServer/fetchSettings',
    });
    dispatch({
      type: 'configServer/configHide',
    });
  }

  /**
   * 校验表单是否通过
   * @param {Object} ref
   * @param {String} field
   */
  @Bind()
  validateFormData(ref, field) {
    return new Promise((resolve, reject) => {
      if (!ref || (ref && (!ref[field] || !ref[field].props.form))) {
        resolve({});
      }
      const { validateFieldsAndScroll } = ref[field].props.form;
      validateFieldsAndScroll((errors, values) => {
        if (!errors) {
          resolve(values);
        } else {
          reject(errors);
        }
      });
    });
  }

  /**
   * 保存配置
   */
  @Bind()
  handleSave(company) {
    const {
      dispatch,
      configServer: { settings },
    } = this.props;
    const commonRefs = ['commonRef', 'enterpriseRef'];
    const purchaseRefs = [
      'catalogRef',
      'sourceRef',
      'purchaseContractRef',
      'demandPollRef',
      'orderRef',
      'scheduleRef',
      'deliveryRef',
      'receiveRef',
      'financeRef',
      'supplierManageRef',
      'groupManagementRef',
      'qualityRef',
    ];
    const supplierRefs = ['diectInvoiceRef'];
    const commonValidateArr = commonRefs.map((item) => this.validateFormData(this.commonRef, item));
    const purchaseValidateArr = purchaseRefs.map((item) =>
      this.validateFormData(this.purchaseRef, item)
    );
    const suppileValidateArr = supplierRefs.map((item) =>
      this.validateFormData(this.supplierRef, item)
    );
    Promise.all([...commonValidateArr, ...purchaseValidateArr, ...suppileValidateArr])
      .then((res) => {
        let values = {};
        res.forEach((item) => {
          values = { ...values, ...item };
        });
        values = { ...values, '010206': values['010206'] ? values['010206'] : null };
        let targetItem = merge(settings, values);
        for (const key in targetItem) {
          if (targetItem[key] === undefined) {
            targetItem[key] = null;
          } else if (key === 'receiveSystem') {
            targetItem = {
              ...omit(targetItem, ['receiveSystem']),
              '010403': targetItem.receiveSystem === '010403' ? 1 : 0,
              '010404': targetItem.receiveSystem === '010404' ? 1 : 0,
            };
          } else if (key === 'financeSystem') {
            targetItem = {
              ...omit(targetItem, ['financeSystem']),
              '010524': targetItem.financeSystem === '010524' ? 1 : 0,
              '010525': targetItem.financeSystem === '010525' ? 1 : 0,
            };
          }
        }
        if (company['010408']) {
          targetItem['010408'] = `${company['010408']}`;
        }
        if (targetItem['011011'] && !targetItem['011012']) {
          notification.error({
            message: intl
              .get('spfm.configServer.view.touristNotNull')
              .d('允许游客访问下，自定义列表不为空'),
          });
          return;
        }

        targetItem['011016'] = Array.isArray(targetItem['011016'])
          ? targetItem['011016'].length > 0
            ? targetItem['011016'].join('&')
            : null
          : null;
        targetItem['011018'] = Array.isArray(targetItem['011018'])
          ? targetItem['011018'].length > 0
            ? targetItem['011018'].join('&')
            : null
          : null;
        dispatch({
          type: 'configServer/saveSettings',
          payload: {
            customizeSetting: targetItem,
          },
        }).then((result) => {
          if (result) {
            dispatch({
              type: 'configServer/fetchSettings',
            }).then((response) => {
              if (response) {
                notification.success();
              }
            });
          }
        });
      })
      .catch((error) => {
        if (error['011012']) {
          notification.error({
            message: intl
              .get('spfm.configServer.view.touristNotNull')
              .d('允许游客访问下，自定义列表不为空'),
          });
        }
      });
  }

  /**
   * 最外层tabs改变回调
   * @param {String} outMostActiveKey
   */
  @Bind()
  handleChangeTabs(outMostActiveKey) {
    const { dispatch } = this.props;
    dispatch({
      type: 'configServer/updateState',
      payload: {
        outMostActiveKey,
      },
    });
  }

  render() {
    const { tenantId } = this.state;
    const {
      saving = false,
      loading = false,
      configServer: { outMostActiveKey },
    } = this.props;
    const companyProps = {
      saving,
      loading,
      saveCompany: this.handleSave,
    };
    return (
      <Fragment>
        <Header title={intl.get(`spfm.configServer.view.title.configServer`).d('配置中心')}>
          <Button type="primary" onClick={this.handleSave} icon="save" loading={saving || loading}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          {tenantId === 1 && (
            <Button onClick={this.handleReset}>
              {intl.get(`spfm.configServer.view.button.reset`).d('恢复默认值')}
            </Button>
          )}
        </Header>
        <Content wrapperClassName={styles['config-server-content']}>
          <Tabs animated={false} onChange={this.handleChangeTabs} activeKey={outMostActiveKey}>
            <TabPane tab={intl.get(`spfm.configServer.view.title.common`).d('通用')} key="common">
              <CommonIndex
                onRef={(node) => {
                  this.commonRef = node;
                }}
                loading={saving || loading}
              />
            </TabPane>
            <TabPane
              tab={intl.get(`spfm.configServer.view.title.purchaser`).d('采购方')}
              key="purchaser"
            >
              <PurchaserIndex
                {...companyProps}
                onRef={(node) => {
                  this.purchaseRef = node;
                }}
              />
            </TabPane>
            <TabPane
              tab={intl.get(`spfm.configServer.view.title.supplier`).d('供应商')}
              key="supplier"
            >
              <SupplierIndex
                onRef={(node) => {
                  this.supplierRef = node;
                }}
              />
            </TabPane>
          </Tabs>
        </Content>
      </Fragment>
    );
  }
}

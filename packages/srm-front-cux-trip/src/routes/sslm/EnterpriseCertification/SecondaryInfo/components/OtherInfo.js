/**
 * OtherInfo - 其他补充信息
 * @date: 2021-11-18
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component } from 'react';
import { Form } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import classnames from 'classnames';
import intl from 'utils/intl';
import { Content } from 'components/Page';
import styles from '../../index.less';

// 二开：注册国家/地区为中国时，供应商承诺函、法人授权委托书必填
const CHINA_COUNTRY_CODE = 'CN';
const REQUIRED_FIELDS = ['attributeVarchar1', 'attributeVarchar2'];
const RETRY_TIMES = 10;
const RETRY_INTERVAL = 100;

export default class OtherInfo extends Component {
  componentDidMount() {
    const { changeReqId, dataSet } = this.props;
    // 二开：数据查询完成后重新设置必填（dataSet 可能尚未就绪，做兼容处理）
    this.handleDataSetLoad = () => {
      this.applyAttachmentRequired();
    };
    if (dataSet && typeof dataSet.addEventListener === 'function') {
      dataSet.addEventListener('load', this.handleDataSetLoad);
    }
    if (changeReqId && dataSet) {
      dataSet.setQueryParameter('changeReqId', changeReqId);
      dataSet.query();
    }
    // 二开：附件字段由个性化配置动态添加到 dataSet，可能存在延迟，允许重试
    this.applyAttachmentRequired(RETRY_TIMES);
  }

  componentDidUpdate() {
    // 个性化配置加载/页面重渲染后重新设置一次，避免被覆盖
    this.applyAttachmentRequired();
  }

  componentWillUnmount() {
    const { dataSet } = this.props;
    if (this.requiredTimer) {
      clearTimeout(this.requiredTimer);
      this.requiredTimer = null;
    }
    if (this.handleDataSetLoad && dataSet && dataSet.removeEventListener) {
      dataSet.removeEventListener('load', this.handleDataSetLoad);
    }
  }

  // 二开：注册国家/地区是否为中国（企业主要信息步骤）
  getChinaFlag() {
    const { allInfo: { basicInfo = {} } = {} } = this.props;
    return basicInfo.registeredCountryCode === CHINA_COUNTRY_CODE;
  }

  // 二开：个性化配置会把必填包装成 dynamicProps.required 注入字段，
  // 而 c7n 中 dynamicProps.required 的优先级高于静态 required，故此处再包一层按注册国家/地区判断
  overrideDynamicRequired(field) {
    const dynamicProps = field.get('dynamicProps');
    if (!dynamicProps || typeof dynamicProps !== 'object') {
      return;
    }
    const originalRequired = dynamicProps.required;
    if (originalRequired && originalRequired.cuxCountryRequired) {
      return;
    }
    const countryRequired = (args = {}) => {
      // 非中国（含未填写）不必填
      if (!this.getChinaFlag()) {
        return false;
      }
      // 中国时沿用个性化配置的必填逻辑（保留隐藏/只读等原有判断）
      return typeof originalRequired === 'function' ? originalRequired(args) : true;
    };
    countryRequired.cuxCountryRequired = true;
    field.set('dynamicProps', { ...dynamicProps, required: countryRequired });
  }

  // 二开：设置供应商承诺函、法人授权委托书必填
  applyAttachmentRequired(retryTimes = 0) {
    const { dataSet } = this.props;
    if (!dataSet || typeof dataSet.getField !== 'function') {
      return;
    }
    const required = this.getChinaFlag();
    let missingFlag = false;
    REQUIRED_FIELDS.forEach((name) => {
      const field = dataSet.getField(name);
      if (field) {
        field.set('required', required);
        this.overrideDynamicRequired(field);
      } else {
        missingFlag = true;
      }
    });
    if (missingFlag && retryTimes > 0) {
      if (this.requiredTimer) {
        clearTimeout(this.requiredTimer);
      }
      this.requiredTimer = setTimeout(
        () => this.applyAttachmentRequired(retryTimes - 1),
        RETRY_INTERVAL
      );
    }
  }

  render() {
    const { dataSet, isEdit, customizeForm = () => {}, configInfo = {} } = this.props;
    const { remark } = configInfo;
    return (
      <Content>
        <div className={styles['certification-title']} id="sslm_sup_change_other">
          {intl.get('spfm.enterpriseCertification.view.title.otherInfo').d('其他信息')}
        </div>
        {remark && <Alert showIcon type="info" message={remark} style={{ marginBottom: 8 }} />}
        {customizeForm(
          {
            code: 'SSLM.ENTERPRISE_CERTIFICATION.SECONDARY_OTHER_INFO',
            enableCreate: false,
            labelLayout: isEdit ? 'float' : 'vertical',
            readOnly: !isEdit,
            enableReLoad: false,
          },
          <Form
            dataSet={dataSet}
            columns={3}
            labelLayout={isEdit ? 'float' : 'vertical'}
            className={classnames({
              'c7n-pro-vertical-form-display': !isEdit,
            })}
            style={{ width: '75%', maxWidth: 1172 }}
          />
        )}
      </Content>
    );
  }
}

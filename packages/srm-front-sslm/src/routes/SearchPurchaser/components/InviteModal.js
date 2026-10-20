/*
 * InviteModal - 邀约弹窗
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Row, Col, Lov, TextArea, CheckBox } from 'choerodon-ui/pro';
import { isArray, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import { getAgreementModal } from '@/routes/components/PrivacyAgreement';
import { checkClassify } from '@/services/supplierInviteManageServices';

import styles from '../index.less';

/**
 * 邀约弹窗
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} investigationTemDefineOrg - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@withCustomize({
  manualQuery: true,
  unitCode: [
    // 邀约弹框需查询采购方个性化配置，与列表共同一个withCustomize，调用queryUnitConfig时筛选器的配置接口重新调用，导致条件丢失，故分withCustomize
    'SSLM.SEARCH_PURCHASER.LIST.INVITATION_INFO',
  ],
})
export default class InviteModal extends Component {
  componentDidMount() {
    const { queryUnitConfig, purchaserTenantId } = this.props;
    // 查询采购方个性化
    queryUnitConfig({ customizeTenantId: purchaserTenantId });
  }

  @Bind()
  handelAgreementModal(agreement) {
    getAgreementModal({
      protocolList: [{ ...agreement }],
      isEdit: false,
      showWelcomeMsg: false,
    });
  }

  render() {
    const {
      dataSet,
      // 邀请供应商合作标识，默认是
      customizeForm = () => {},
      supplierCategoryFlag = false,
      agreementList = [],
      agreementDs,
    } = this.props;

    return (
      <React.Fragment>
        <div className={styles['search-purchaser-invite-modal']}>
          {customizeForm(
            {
              code: 'SSLM.SEARCH_PURCHASER.LIST.INVITATION_INFO',
              enableCreate: false,
              __force_record_to_update__: true,
              // proxyDsCreate,
            },
            <Form dataSet={dataSet} columns={1} labelLayout="float">
              <CheckBox name="groupLevelSupplierFlag" />
              <Lov name="companyId" />
              <Lov
                name="multiSupplierCategoryId"
                searchFieldInPopup
                onOption={({ record: optionRecord }) => {
                  return {
                    disabled: +optionRecord.get('hasChild'),
                  };
                }}
                hidden={!supplierCategoryFlag}
                onBeforeSelect={async tableRecord => {
                  if (!isEmpty(tableRecord)) {
                    const supplierCategoryIdList = [];
                    if (isArray(tableRecord)) {
                      tableRecord.forEach(item => {
                        const supplierCategoryId = item.get('categoryId');
                        supplierCategoryIdList.push(supplierCategoryId);
                      });
                    } else {
                      const supplierCategoryId = tableRecord.get('categoryId');
                      supplierCategoryIdList.push(supplierCategoryId);
                    }
                    const res = await checkClassify({
                      supplierCategoryIdList,
                      purchaserTenantId: dataSet.getState('purchaserTenantId'),
                    });
                    if (getResponse(res)) {
                      return true;
                    } else {
                      return false;
                    }
                  } else {
                    return true;
                  }
                }}
              />
              <TextArea name="inviteRemark" resize="vertical" />
            </Form>
          )}
          {/* 隐私协议 */}
          <Row className={styles['search-purchaser-invite-modal-agreement']}>
            <Col span={24}>
              <CheckBox dataSet={agreementDs} name="agreementFlag" />
              <span>
                {intl.get('spfm.invitationList.view.message.agreed').d('请阅读并同意')}
                {agreementList.map(n => {
                  return (
                    <span style={{ marginLeft: 8 }}>
                      <a
                        onClick={() => {
                          this.handelAgreementModal(n);
                        }}
                      >
                        {`《${n.title}》`}
                      </a>
                    </span>
                  );
                })}
              </span>
            </Col>
          </Row>
        </div>
      </React.Fragment>
    );
  }
}

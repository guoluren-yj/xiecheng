/**
 * OrganizationAndStaffForm.js - 采购组织及人员
 * @date: 2021-08-02
 * @author: yujie.shao@going-link.com
 * @version: 0.0.1
 */
import React, { PureComponent } from 'react';
import { Form, DataSet, Output } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import { action } from 'mobx';

import OrganizationAndStaffFormDS from './OrganizationAndStaffFormDS';
import Style from './index.less';

export default class OrganizationAndStaffForm extends PureComponent {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
    this.OrganizationAndStaffFormDS = new DataSet(OrganizationAndStaffFormDS(props.bidFlag));
  }

  componentDidMount() {
    this.initDSFields();
  }

  // 处理采购组织及人员字段
  getBidMemberList(data = []) {
    let openBidLov = '';
    let prequalCheckerLov = '';
    let inquierLov = '';
    let checkPriceLov = '';
    let observeLov = '';

    if (!Array.isArray(data) || isEmpty(data)) {
      return {};
    }
    data.forEach((item) => {
      const { rfxRole = null } = item;
      if (rfxRole === 'OPENED_BY') {
        openBidLov += openBidLov === '' ? `${item.realName}` : `，${item.realName}`;
      }
      if (rfxRole === 'PRETRIAL_BY') {
        prequalCheckerLov = item?.realName || '';
      }
      if (rfxRole === 'RFX_BY') {
        inquierLov = item?.realName || '';
      }
      if (rfxRole === 'CHECKED_BY') {
        checkPriceLov = item?.realName || '';
      }
      if (rfxRole === 'OBSERVE_BY') {
        observeLov += observeLov === '' ? `${item.realName}` : `，${item.realName}`;
      }
    });

    return {
      openBidLov,
      prequalCheckerLov,
      inquierLov,
      checkPriceLov,
      observeLov,
    };
  }

  // 初始化ds
  @action
  initDSFields() {
    const { currentMode, header = {} } = this.props;
    const { rfxHeaderBaseInfoAdjustDTO = {}, memberAndPurAdjustInfoDTO = {} } = header;
    const {
      openerFlag = 0,
      sealedQuotationFlag = 0,
      pretrialFlag = 0,
    } = rfxHeaderBaseInfoAdjustDTO;
    const judgeFlag = { openerFlag, sealedQuotationFlag, pretrialFlag };
    const { rfxMemberAdjustList = {}, rfxMemberAdjustHisList = {} } = memberAndPurAdjustInfoDTO;
    let lovMemberLst = {};
    if (currentMode === 'history') {
      lovMemberLst = this.getBidMemberList(rfxMemberAdjustHisList) || {};
    } else {
      lovMemberLst = this.getBidMemberList(rfxMemberAdjustList) || {};
    }
    this.OrganizationAndStaffFormDS.loadData([{ ...header, ...lovMemberLst, ...judgeFlag }]);
    this.forceUpdate();
  }

  // 针对改变前后的值是否一样，若不一样则显示不同的背景色
  getClassName = (field) => {
    const { header = {}, currentMode } = this.props;
    const { adjustFields = [] } = header?.memberAndPurAdjustInfoDTO || {};
    let className = '';
    if (adjustFields?.includes(field)) {
      if (currentMode === 'current') {
        className = 'changeAfter';
      } else if (currentMode === 'history') {
        className = 'changeBefore';
      }
    }
    return className;
  };

  render() {
    const { customizeForm, custLoading, header = {}, custKey, currentMode } = this.props;
    const {
      rfxHeaderBaseInfoAdjustDTO: { openerFlag, sealedQuotationFlag, pretrialFlag },
    } = header;
    return (
      <div className={Style['']}>
        {customizeForm(
          {
            code:
              currentMode === 'history'
                ? `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.ORGANIZATION_STAFF_READONLY_HIS`
                : `SSRC.${custKey}QUOTATION_CONTROLLER_DETAIL.ORGANIZATION_STAFF_READO_NLY`,
            dataSet: this.OrganizationAndStaffFormDS,
            readOnly: true,
          },
          <Form
            dataSet={this.OrganizationAndStaffFormDS}
            labelLayout="vertical"
            columns={3}
            custLoading={custLoading}
            className="c7n-pro-vertical-form-display"
          >
            {/* 寻源单关联的寻源模板-启用了开标人、寻源单密封报价时，显示该字段 */}
            {!!openerFlag && !!sealedQuotationFlag && (
              <Output name="openBidLov" className={this.getClassName('openBidLov')} />
            )}
            {/* 寻源模板启用【寻源初审】时，显示该字段  */}
            {!!pretrialFlag && (
              <Output name="prequalCheckerLov" className={this.getClassName('prequalCheckerLov')} />
            )}
            <Output name="inquierLov" className={this.getClassName('inquierLov')} />
            <Output name="checkPriceLov" className={this.getClassName('checkPriceLov')} />
            <Output name="observeLov" className={this.getClassName('observeLov')} />
          </Form>
        )}
      </div>
    );
  }
}

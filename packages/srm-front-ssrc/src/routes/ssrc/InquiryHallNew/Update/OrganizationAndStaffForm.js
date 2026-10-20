// 组织及人员ds

import React, { PureComponent } from 'react';
import { noop, isEmpty } from 'lodash';
import { TextField, Tooltip, Lov, EmailField, Output, Select } from 'choerodon-ui/pro';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react';

import CollapseForm from '_components/CollapseForm';
import { getResponse } from 'utils/utils';

import intl from 'utils/intl';

import { phoneRender } from '@/utils/renderer';
import styles from '@/routes/ssrc/InquiryHallNew/Update/index.less';
import { clearExpandInvOrganization } from '@/services/inquiryHallNewService';
import { PurPhoneFields } from './Components';
import { updateExpandInvOrganizationFiled } from './utils/utils';

class OrganizationComponent extends PureComponent {
  // 切换寻源拓展维度
  @Bind()
  changeResultsExpandingDimensions(value) {
    const { rfxInfoDS = {} } = this.props;
    const current = rfxInfoDS.current || {};
    if (!current) return;

    // 从整单切换到标的物行 清除【头】拓展公司 拓展库存组织
    if (value === 'ITEM_LINE') {
      rfxInfoDS.current.set({
        expandCompany: [],
        expandInvOrganization: [],
      });
    }
    // 从标的物切换到整单 无需清除【标的物行】拓展公司 拓展库存组织 后端兜底处理
  }

  // 切换寻源拓展层级
  @Bind()
  changeResultsExpandingHierarchy(value) {
    const { rfxInfoDS = {}, itemLineTableDS, isNewRfx = false } = this.props;
    const current = rfxInfoDS.current || {};
    if (!current) return;

    const { multiSectionFlag = 0, resultsExpandingDimensions = '', rfxHeaderId = '' } =
      current?.get(['multiSectionFlag', 'resultsExpandingDimensions', 'rfxHeaderId']) || {};

    // 从公司切换成库存组织 无需清除【标准库存组织】
    if (value === 'INV_ORGANIZATION') return;
    // 从库存组织切换公司 清除库存组织
    if (value === 'COMPANY') {
      // 拓展维度【整单】
      if (resultsExpandingDimensions === 'WHOLE_ORDER') {
        current.set({
          expandInvOrganization: [],
        });
      } else if (resultsExpandingDimensions === 'ITEM_LINE') {
        // 拓展维度【标的物】
        if (isNewRfx) {
          // 询价单新建页场景
          // 前端清除【拓展库存组织】
          // eslint-disable-next-line no-unused-expressions
          itemLineTableDS?.records?.forEach((record) => {
            record.set({
              expandInvOrganization: [],
            });
          });
        } else {
          // 询价单维护页场景
          // 后台接口清除 再物料行查询
          clearExpandInvOrganization({
            rfxHeaderId,
            resultsExpandingDimensions,
            resultsExpandingHierarchy: value,
          }).then((res) => {
            const result = getResponse(res);
            if (result) {
              // 多标段场景下 无需物料查询 打开弹框即可重新查询物料数据
              if (multiSectionFlag) return;
              // 缓存表格数据 刷新 如有缓存【拓展库存组织】数据，前端无操作 后端作数据兜底处理
              itemLineTableDS.query(undefined, undefined, true);
            }
          });
        }
      }
    }
  }

  // 改变拓展公司
  @Bind()
  changeExpandCompany(value = [], oldValue = []) {
    // 清除对应公司下的库存组织
    const { rfxInfoDS = {}, sourceResultsData = [] } = this.props;
    const current = rfxInfoDS.current || {};
    if (!current) return;
    const deleteFlag = value?.length < oldValue?.length || value === null;
    if (!deleteFlag) return;
    updateExpandInvOrganizationFiled({ value, oldValue, record: current, sourceResultsData });
  }

  demandSideFields() {
    const {
      changeCompanyLov = noop,
      changeUnitLov = noop,
      isNewRfx = false,
      viewApplicationOrgModal = () => {},
      rfxInfoDS = {},
    } = this.props;

    const {
      expandResultsFlag = 0,
      resultsExpandingDimensions = '',
      resultsExpandingHierarchy = '',
    } =
      rfxInfoDS?.current?.get([
        'expandResultsFlag',
        'resultsExpandingDimensions',
        'resultsExpandingHierarchy',
      ]) || {};
    // 显示 拓展寻源结果+寻源拓展维度为【整单】
    const expandCompanyVisible =
      [1, '1'].includes(expandResultsFlag) && resultsExpandingDimensions === 'WHOLE_ORDER';
    // 显示 拓展寻源结果+寻源拓展维度为【整单】+ 寻源拓展层级为【库存组织】
    const expandInvOrganizationVisible =
      [1, '1'].includes(expandResultsFlag) &&
      resultsExpandingDimensions === 'WHOLE_ORDER' &&
      resultsExpandingHierarchy === 'INV_ORGANIZATION';

    const Fields = [
      <Lov name="companyLov" onChange={changeCompanyLov} />,
      <Lov name="unitLov" onChange={(data, oldValue) => changeUnitLov(data, oldValue)} />,
      <Output
        name="applicationScopeFlag"
        className={styles['rfx-application-scope']}
        renderer={() => {
          return isNewRfx ? (
            <Tooltip
              title={intl.get('ssrc.inquiryHall.view.tooltip.saveDataAtFirst').d('请先保存单据。')}
            >
              <a style={{ cursor: 'not-allowed', opacity: '.55' }}>
                {intl.get(`hzero.common.view.button.edit`).d('编辑')}
              </a>
            </Tooltip>
          ) : (
            <a onClick={() => viewApplicationOrgModal()}>
              {intl.get(`hzero.common.view.button.edit`).d('编辑')}
            </a>
          );
        }}
      />,
      <Select
        name="resultsExpandingDimensions"
        hidden={!expandResultsFlag}
        clearButton={false}
        onChange={this.changeResultsExpandingDimensions}
      />,
      <Select
        name="resultsExpandingHierarchy"
        hidden={!expandResultsFlag}
        clearButton={false}
        onChange={this.changeResultsExpandingHierarchy}
      />,
      <Lov
        name="expandCompany"
        hidden={!expandCompanyVisible}
        onChange={this.changeExpandCompany}
      />,
      <Lov name="expandInvOrganization" hidden={!expandInvOrganizationVisible} />,
    ];
    return Fields;
  }

  // 寻源小组lov tooltip
  renderBidMemberLovTooltip = (value = {}) => {
    if (isEmpty(value)) {
      return null;
    }

    const { realName = null, email = null, phone = null, internationalTelCodeMeaning = null } =
      value || {};

    return (
      <Tooltip
        title={
          <div>
            <div>name: {realName}</div>
            <div>email: {email}</div>
            <div>phone: {phoneRender(internationalTelCodeMeaning, phone)}</div>
          </div>
        }
      >
        {realName}
      </Tooltip>
    );
  };

  // 采购执行人table field
  @Bind()
  purchaseExecuteFields() {
    const {
      rfxInfoDS = {},
      changeOpenBidLov,
      changePurPhone,
      rfx = {},
      changePurOrganizationLov = noop,
    } = this.props;
    const { bidFlag } = rfx;
    const openerFlag = (rfxInfoDS.current && rfxInfoDS.current.get('openerFlag')) || 0;
    const pretrialFlag = (rfxInfoDS.current && rfxInfoDS.current.get('pretrialFlag')) || 0;
    const sealedQuotationFlag =
      (rfxInfoDS.current && rfxInfoDS.current.get('sealedQuotationFlag')) || 0;

    const Fields = [
      <Lov name="purOrganizationIdLov" onChange={changePurOrganizationLov} />,
      <Lov name="purchaseLov" />,
      <TextField name="purName" />,
      <div name="purchaseExecPlace_1" fieldClassName="td-no-visible" />,
      <Lov name="purUserIdLov" />,
      <PurPhoneFields name="purPhone" changePurPhone={changePurPhone} />,
      <EmailField name="purEmail" />,
      openerFlag && sealedQuotationFlag === '1' ? (
        <Lov
          name="openBidLov"
          onChange={(value) => changeOpenBidLov(value)}
          maxTagTextLength={2}
          renderer={({ value }) => this.renderBidMemberLovTooltip(value)}
          modalProps={{
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.openBidder`).d('开标员'),
          }}
        />
      ) : null,
      pretrialFlag ? (
        <Lov
          name="prequalCheckerLov"
          // renderer={({ value }) => this.renderBidMemberLovTooltip(value)}
          modalProps={{
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.prequalChecker`).d('初审审查员'),
          }}
        />
      ) : null,
      <Lov
        name="inquierLov"
        modalProps={{
          title: !bidFlag
            ? intl.get('ssrc.common.view.message.RfxCreator').d('询价员')
            : intl.get('ssrc.common.view.message.BIDCreator').d('招标员'),
        }}
        // renderer={({ value }) => this.renderBidMemberLovTooltip(value)}
      />,
      <Lov
        name="checkPriceLov"
        modalProps={{
          title: !bidFlag
            ? intl.get(`ssrc.inquiryHall.model.inquiryHall.RFXcheckPricer`).d('核价员')
            : intl.get(`ssrc.inquiryHall.model.inquiryHall.BIDcheckPricer`).d('定标员'),
        }}
        // renderer={({ value }) => this.renderBidMemberLovTooltip(value)}
      />,
      <Lov
        name="observeLov"
        modalProps={{
          title: intl.get(`ssrc.inquiryHall.model.inquiryHall.observePerson`).d('观察员'),
        }}
      />,
    ];

    return Fields.filter(Boolean);
  }

  render() {
    const {
      customizeCollapseForm,
      rfxInfoDS = {},
      setDemandSideFormRef,
      setPurchaseExecuteFormRef,
      proxyDsCreate = {},
      rfx = {},
      afterCustomizeDs,
    } = this.props;
    const { sourceKey } = rfx;

    return (
      <div>
        <h4 id="rfxDemandSide" className={styles['rfx-card-item-title-level-two']}>
          <div className={styles['rfx-card-item-title-line']} />
          {intl.get('ssrc.inquiryHall.view.inquiryHall.demandSide').d('需求方')}
        </h4>
        {customizeCollapseForm(
          {
            code: `SSRC.${sourceKey}_HALL.NEW_EDIT.ORG_DEMAND_V2`,
            dataSet: rfxInfoDS,
            proxyDsCreate,
            afterCustomizeDs,
          },
          <CollapseForm
            formRef={setDemandSideFormRef}
            columns={3}
            labelLayout="float"
            dataSet={rfxInfoDS}
            useWidthPercent
          >
            {this.demandSideFields()}
          </CollapseForm>
        )}

        <h4
          id="rfxPurchaseExecute"
          className={classnames(styles['rfx-card-item-title-level-two'], styles['m-t-m-18'])}
        >
          <div className={styles['rfx-card-item-title-line']} />
          {intl.get('ssrc.inquiryHall.view.inquiryHall.purchaseExecute').d('采购执行人')}
        </h4>
        {customizeCollapseForm(
          {
            code: `SSRC.${sourceKey}_HALL.NEW_EDIT.ORG_EXEC_V2`,
            dataSet: rfxInfoDS,
            proxyDsCreate,
            afterCustomizeDs,
          },
          <CollapseForm
            formRef={setPurchaseExecuteFormRef}
            showLines={2}
            columns={3}
            labelLayout="float"
            dataSet={rfxInfoDS}
            className={styles['rfx-card-common-form']}
            useWidthPercent
          >
            {this.purchaseExecuteFields()}
          </CollapseForm>
        )}
      </div>
    );
  }
}

const hocComponent = (NewComponent) => {
  return observer(NewComponent);
};

const OrganizationAndStaffForm = hocComponent(OrganizationComponent);

export default OrganizationAndStaffForm;
export { hocComponent, OrganizationComponent };

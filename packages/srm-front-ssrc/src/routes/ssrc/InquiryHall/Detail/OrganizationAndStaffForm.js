// 组织及人员ds

import React, { Component } from 'react';
import { Tooltip, Output } from 'choerodon-ui/pro';
import classnames from 'classnames';

import CollapseForm from '_components/CollapseForm';
import intl from 'utils/intl';
import { TopSection, SecondSection } from '_components/Section';

import { phoneRender } from '@/utils/renderer';
import styles from '@/routes/ssrc/InquiryHallNew/Update/index.less';

export default class OrganizationAndStaffForm extends Component {
  demandSideFields = () => {
    const { viewApplicationOrgModal = () => {}, rfxInfoDS = {} } = this.props;
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
      <Output name="companyName" />,
      <Output name="unitName" />,
      <Output
        name="applicationScopeFlag"
        renderer={() => {
          if (!rfxInfoDS?.current?.get?.('rfxHeaderId')) {
            return;
          }
          return (
            <a onClick={() => viewApplicationOrgModal()}>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.view`).d('查看')}
            </a>
          );
        }}
      />,
      <Output name="resultsExpandingDimensions" hidden={!expandResultsFlag} />,
      <Output name="resultsExpandingHierarchy" hidden={!expandResultsFlag} />,
      <Output name="expandCompanyMeaning" hidden={!expandCompanyVisible} />,
      <Output name="expandInvOrganizationMeaning" hidden={!expandInvOrganizationVisible} />,
    ];
    return Fields;
  };

  // 采购执行人table field
  purchaseExecuteFields() {
    const { rfxInfoDS = {} } = this.props;
    const openerFlag = (rfxInfoDS.current && rfxInfoDS.current.get('openerFlag')) || 0;
    const pretrialFlag = (rfxInfoDS.current && rfxInfoDS.current.get('pretrialFlag')) || 0;
    const sealedQuotationFlag =
      (rfxInfoDS.current && rfxInfoDS.current.get('sealedQuotationFlag')) || 0;

    const Fields = [
      <Output name="purOrganizationName" />,
      <Output name="purchaserName" />,
      <div name="purchaseExecutePlace_1_3" fieldClassName="td-no-visible" />,
      <Output name="purName" />,
      <Output
        name="purPhone"
        renderer={({ record }) => {
          if (!record) {
            return;
          }

          return (
            <Tooltip
              title={phoneRender(
                record?.get('internationalTelCodeMeaning'),
                record?.get('purPhone')
              )}
            >
              {phoneRender(record?.get('internationalTelCodeMeaning'), record?.get('purPhone'))}
            </Tooltip>
          );
        }}
      />,
      <Output name="purEmail" />,
      Number(openerFlag) && Number(sealedQuotationFlag) ? (
        <Output
          name="openBidLov"
          renderer={({ value = null }) => {
            return <Tooltip title={value}>{value}</Tooltip>;
          }}
        />
      ) : null,
      pretrialFlag ? <Output name="prequalCheckerLov" /> : null,
      <Output name="inquierLov" />,
      <Output name="checkPriceLov" />,
      <Output name="observeLov" />,
    ];

    return Fields.filter(Boolean);
  }

  render() {
    const { customizeCollapseForm, rfxInfoDS = {}, rfx = {}, getHocInstance, remote } = this.props;
    const { unitCodeSymbol } = rfx;

    const staffOrg = {
      name: 'staffOrg',
      title: intl
        .get('ssrc.inquiryHall.view.inquiryHall.purOrganizationAndStaff')
        .d('采购组织及人员'),
      content: (
        <>
          <SecondSection code="requiredBy">
            <h4 className={styles['rfx-card-item-title-level-two']}>
              <div className={styles['rfx-card-item-title-line']} />
              {intl.get('ssrc.inquiryHall.view.inquiryHall.demandSide').d('需求方')}
            </h4>
            <div className={styles['rfx-card-item-form']}>
              {customizeCollapseForm(
                {
                  code: `SSRC.${unitCodeSymbol}_DETAIL.LINE_ORGANIZATION_DEMAND`,
                  dataSet: rfxInfoDS,
                  labelLayout: 'vertical',
                },
                <CollapseForm
                  columns={3}
                  labelLayout="vertical"
                  className="c7n-pro-vertical-form-display"
                  dataSet={rfxInfoDS}
                  useWidthPercent
                >
                  {this.demandSideFields()}
                </CollapseForm>
              )}
            </div>
          </SecondSection>
          <SecondSection code="purchaseExecutedBy">
            <h4 className={classnames(styles['rfx-card-item-title-level-two'], styles['m-t-lg'])}>
              <div className={styles['rfx-card-item-title-line']} />
              {intl.get('ssrc.inquiryHall.view.inquiryHall.purchaseExecute').d('采购执行人')}
            </h4>
            <div className={styles['rfx-card-item-form']}>
              {customizeCollapseForm(
                {
                  code: `SSRC.${unitCodeSymbol}_DETAIL.LINE_ORGANIZATION_EXECUTOR`,
                  dataSet: rfxInfoDS,
                  labelLayout: 'vertical',
                },
                <CollapseForm
                  showLines={2}
                  columns={3}
                  labelLayout="vertical"
                  className="c7n-pro-vertical-form-display"
                  dataSet={rfxInfoDS}
                  useWidthPercent
                >
                  {this.purchaseExecuteFields()}
                </CollapseForm>
              )}
            </div>
          </SecondSection>
        </>
      ),
    };

    let content = (
      <TopSection
        title={() =>
          intl.get('ssrc.inquiryHall.view.inquiryHall.purOrganizationAndStaff').d('采购组织及人员')
        }
        code={`SSRC.${unitCodeSymbol}_DETAIL.ORGANIZATION_AND_STAFF_CARD`}
        getHocInstance={getHocInstance}
        className={classnames('page-content', styles['custom-page-content'])}
      >
        {staffOrg.content}
      </TopSection>
    );

    content = remote
      ? remote.process(
          'SSRC_INQUIRY_HALL_DETAIL_PROCESS_ORGANIZATIONANDSTAFF_RENDER_DATA_OBJECT',
          content,
          {
            that: this,
            data: staffOrg,
          }
        )
      : content;

    return (
      <div className="page-content-wrap" id="organizationAndStaff">
        {content}
      </div>
    );
  }
}

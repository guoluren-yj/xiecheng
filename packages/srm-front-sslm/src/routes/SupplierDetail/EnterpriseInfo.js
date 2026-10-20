/**
 * CompanyInfo - 供应商360度查询-企业信息
 * @date: 2018-08-20
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table } from 'hzero-ui';
import { camelCase, round } from 'lodash';
import intl from 'utils/intl';
import { getCurrentLanguage } from 'utils/utils';
import { TopSection, SecondSection } from '_components/Section';
import ComposeTable from '@/routes/components/Compose/ComposeTable';
import formatterCollections from 'utils/intl/formatterCollections';
// import Upload from 'srm-front-boot/lib/components/Upload/index';
// import { getCurrentOrganizationId } from 'utils/utils';
import RegistrationInfo from './RegistrationInfo';
import BasicBusinessInfo from './BasicBusinessInfo';
import styles from './index.less';

const language = getCurrentLanguage();
const locale = language?.replace('_', '-');

/**
 * 供应商360度查询 - 企业信息
 * @extends {Component} - React.Component
 * @reactProps {Object} companyInfo - 数据源
 * @return React.element
 */
@formatterCollections({ code: ['sslm.supplierDetail', 'sslm.common', 'sslm.enterpriseInform'] })
export default class EnterpriseInfo extends PureComponent {
  render() {
    const {
      companyInfo = {},
      questionnaireTmpl = [],
      tmplDataSource = [],
      customizeForm = () => {},
      getHocInstance = () => {},
      form,
      customizeTable,
    } = this.props;
    const { business = {}, financeList = [] } = companyInfo || {};
    const { sslminvestgfin } = tmplDataSource;
    // 处理语言环境切换
    const newInvestgfin = (sslminvestgfin || []).map(n => {
      const {
        totalAssets,
        totalLiabilities,
        currentAssets,
        currentLiabilities,
        revenue,
        netProfit,
      } = n;
      const obj = {
        totalAssets:
          language === 'en_US' ? totalAssets && round(totalAssets / 100, 4) : totalAssets,
        totalLiabilities:
          language === 'en_US'
            ? totalLiabilities && round(totalLiabilities / 100, 4)
            : totalLiabilities,
        currentAssets:
          language === 'en_US' ? currentAssets && round(currentAssets / 100, 4) : currentAssets,
        currentLiabilities:
          language === 'en_US'
            ? currentLiabilities && round(currentLiabilities / 100, 4)
            : currentLiabilities,
        revenue: language === 'en_US' ? revenue && round(revenue / 100, 4) : revenue,
        netProfit: language === 'en_US' ? netProfit && round(netProfit / 100, 4) : netProfit,
      };
      return {
        ...n,
        ...obj,
      };
    });
    const investgFin =
      questionnaireTmpl.length > 0 &&
      questionnaireTmpl.find(item => item.configName === 'sslm_investg_fin') &&
      questionnaireTmpl.find(item => item.configName === 'sslm_investg_fin')
        .investigateConfigLines &&
      questionnaireTmpl
        .find(item => item.configName === 'sslm_investg_fin')
        .investigateConfigLines.map(line => {
          return { ...line, fieldCode: camelCase(line.fieldCode) };
        });
    // const { attachmentList } = companyInfo;
    const columns = [
      {
        title: intl.get('sslm.supplierDetail.model.companyInfo.year').d('年份'),
        dataIndex: 'year',
        width: 120,
      },
      {
        title: intl.get('sslm.enterpriseInform.model.supplierInform.currencyName').d('币种'),
        dataIndex: 'currencyName',
        width: 120,
      },
      {
        title: intl.get('sslm.supplierDetail.model.companyInfo.totalAssets').d('企业总资产(万)'),
        dataIndex: 'totalAssets',
        width: 150,
        render: val => {
          const value = language === 'en_US' ? (val ? round(val / 100, 4) : val) : val;
          return value && parseFloat(value).toLocaleString(locale, { maximumFractionDigits: 4 });
        },
      },
      {
        title: intl.get('sslm.supplierDetail.model.companyInfo.totalLiabilities').d('总负债(万)'),
        dataIndex: 'totalLiabilities',
        width: 100,
        render: val => {
          const value = language === 'en_US' ? (val ? round(val / 100, 4) : val) : val;
          return value && parseFloat(value).toLocaleString(locale, { maximumFractionDigits: 4 });
        },
      },
      {
        title: intl.get('sslm.supplierDetail.model.companyInfo.currentAssets').d('流动资产(万)'),
        dataIndex: 'currentAssets',
        width: 150,
        render: val => {
          const value = language === 'en_US' ? (val ? round(val / 100, 4) : val) : val;
          return value && parseFloat(value).toLocaleString(locale, { maximumFractionDigits: 4 });
        },
      },
      {
        title: intl.get('sslm.supplierDetail.model.companyInfo.currentLiab').d('流动负债(万)'),
        dataIndex: 'currentLiabilities',
        width: 150,
        render: val => {
          const value = language === 'en_US' ? (val ? round(val / 100, 4) : val) : val;
          return value && parseFloat(value).toLocaleString(locale, { maximumFractionDigits: 4 });
        },
      },
      {
        title: intl.get('sslm.supplierDetail.model.companyInfo.revenue').d('营业收入(万)'),
        dataIndex: 'revenue',
        width: 150,
        render: val => {
          const value = language === 'en_US' ? (val ? round(val / 100, 4) : val) : val;
          return value && parseFloat(value).toLocaleString(locale, { maximumFractionDigits: 4 });
        },
      },
      {
        title: intl.get('sslm.supplierDetail.model.companyInfo.netProfit').d('净利润(万)'),
        dataIndex: 'netProfit',
        width: 150,
        render: val => {
          const value = language === 'en_US' ? (val ? round(val / 100, 4) : val) : val;
          return value && parseFloat(value).toLocaleString(locale, { maximumFractionDigits: 4 });
        },
      },
      {
        title: intl.get('sslm.supplierDetail.model.companyInfo.assetLiabRatio').d('资产负债率'),
        dataIndex: 'assetLiabilityRatio',
        width: 150,
        render: (text, record) => {
          return record.assetLiabilityRatio ? (
            <div>{`${(record.assetLiabilityRatio * 100).toFixed(2)}%`}</div>
          ) : (
            <div>--</div>
          );
        },
      },
      {
        title: intl.get('sslm.supplierDetail.model.companyInfo.currentRatio').d('流动比率'),
        dataIndex: 'currentRatio',
        width: 150,
        render: (text, record) => {
          return record.currentRatio > 0 ? (
            <div>{`${(record.currentRatio * 100).toFixed(2)}%`}</div>
          ) : (
            <div>--</div>
          );
        },
      },
      {
        title: intl.get('sslm.supplierDetail.model.companyInfo.totalEarnRatio').d('总资产收益率'),
        width: 150,
        dataIndex: 'totalAssetsEarningsRatio',
        render: (text, record) => {
          return record.totalAssetsEarningsRatio > 0 ? (
            <div>{`${(record.totalAssetsEarningsRatio * 100).toFixed(2)}%`}</div>
          ) : (
            <div>--</div>
          );
        },
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
        width: 200,
      },
    ];
    return (
      <TopSection
        title={intl.get('sslm.supplierDetail.view.message.companyInformation').d('企业信息')}
        code="SSLM.SUPPLIER_LIFE_CYCLE.ENTERPRISE_INFO_CARDS"
        getHocInstance={getHocInstance}
        className={styles['supplier-top-section']}
      >
        <SecondSection
          title={intl.get('sslm.supplierDetail.view.message.title.registrationInfo').d('登记信息')}
          code="registrationInfo"
        >
          <RegistrationInfo form={form} companyInfo={companyInfo} customizeForm={customizeForm} />
        </SecondSection>
        <SecondSection
          title={intl.get('sslm.supplierDetail.view.message.basicBusinessInfo').d('基础业务信息')}
          code="basicBusinessInfo"
        >
          <BasicBusinessInfo form={form} business={business} customizeForm={customizeForm} />
        </SecondSection>
        <SecondSection
          title={intl.get('sslm.supplierDetail.view.message.treeYearsFinance').d('近3年财务状况')}
          code="treeYearsFinance"
        >
          <div id="treeYearsFinance">
            {questionnaireTmpl.length > 0 &&
            questionnaireTmpl.find(item => item.configName === 'sslm_investg_fin') ? (
              <ComposeTable
                fields={investgFin}
                dataSource={newInvestgfin}
                addable={false}
                editable={false}
                removable={false}
                pagination={false}
                rowKey="companyFinanceId"
                fieldLabelWidth={150}
              />
            ) : (
              customizeTable(
                { code: 'SSLM.SUPPLIER_LIFE_CYCLE.FINANCE_LIST' },
                <Table
                  rowKey="companyFinanceId"
                  dataSource={financeList}
                  columns={columns}
                  pagination={false}
                  scroll={{ x: '1300px' }}
                  bordered
                />
              )
            )}
          </div>
        </SecondSection>
      </TopSection>
    );
  }
}

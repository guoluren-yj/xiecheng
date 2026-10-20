/*
 * FindSupplier - 发现供应商
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import querystring from 'querystring';
import React, { Component, Fragment } from 'react';
import { Tag } from 'choerodon-ui';
import { Modal, TextField, Tooltip } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import SearchBarTable from '_components/SearchBarTable';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { getCurrentOrganizationId, getCurrentLanguage } from 'utils/utils';

import { tableMaxHeight, downLoadFile } from '@/routes/components/utils';
import { openRelationChart } from '@/routes/components/EnterpriseRelationSearch';

import SupplierInfoModal from '../components/SupplierInfoModal';

import styles from '../index.less';

const organizationId = getCurrentOrganizationId();
const language = getCurrentLanguage();
const isChinese = language === 'zh_CN'; // 中文语言环境

const curTableHeight = {
  hasTab: `calc(100vh - 276px)`,
};

/**
 * 发现供应商
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
export default class FindSupplier extends Component {
  searchBarRef = null;

  getSnapshotBeforeUpdate(nextProps) {
    const { supplierCompanyName } = querystring.parse(nextProps.location.search.substr(1));
    const { supplierCompanyName: curSupplierCompanyName } = querystring.parse(
      this.props.location.search.substr(1)
    );
    return supplierCompanyName !== curSupplierCompanyName;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot) {
      const { dataSet } = this.props;
      dataSet.query();
    }
  }

  // 打开供应商信息弹窗
  @Bind()
  handleSupplierModal(record = {}) {
    const { sourceKey, showTagFlag } = this.props;
    const { srmCompanyId, zhimaLabels } = record.get(['srmCompanyId', 'zhimaLabels']) || {};
    Modal.open({
      title: intl.get('sslm.supplierInvite.model.invite.supplierInfo').d('供应商信息'),
      drawer: true,
      cancelButton: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      children: (
        <SupplierInfoModal
          companyId={srmCompanyId}
          showTagFlag={showTagFlag}
          zhimaLabels={zhimaLabels}
          sourceKey={sourceKey}
        />
      ),
      style: { width: 742 },
      className: styles['invite-manage-inner-model'],
      maskStyle: {
        backgroundColor: 'rgb(0, 0, 0, 0)',
      },
    });
  }

  // 查看风险报告
  @Bind()
  handleDownloadReport(fileUrl) {
    if (!fileUrl) {
      return;
    }
    const url = downLoadFile({ tenantId: organizationId, attachmentUrl: fileUrl });
    window.open(url);
  }

  @Bind()
  getColumns() {
    const { onInvite, onRiskScan, showTagFlag } = this.props;
    const columns = [
      {
        name: 'companyName',
        width: 200,
        renderer: ({ value, record }) => (
          <a onClick={() => this.handleSupplierModal(record)}>{value}</a>
        ),
      },
      {
        name: 'action',
        renderer: ({ record }) => {
          return (
            <React.Fragment>
              <a
                onClick={() => {
                  onInvite(record);
                }}
                style={{
                  marginRight: 8,
                }}
              >
                {intl.get('sslm.supplierInvite.model.invite.initiateInvitation').d('发起邀约')}
              </a>
            </React.Fragment>
          );
        },
      },
      {
        name: 'riskScan',
        renderer: ({ record }) => {
          return (
            <a
              onClick={() => {
                onRiskScan(record);
              }}
            >
              {intl.get(`spfm.companySearch.view.message.riskScan`).d('风险扫描')}
            </a>
          );
        },
      },
      {
        name: 'riskScanDate',
        width: 160,
      },
      {
        name: 'riskLevelMeaning',
      },
      {
        name: 'fileUrl',
        renderer: ({ record }) => {
          const { fileUrl } = record.get(['fileUrl']) || {};
          if (!fileUrl) {
            return '-';
          }
          return (
            <a
              onClick={() => {
                this.handleDownloadReport(fileUrl);
              }}
            >
              {intl.get('sslm.common.view.message.riskReport').d('风险报告')}
            </a>
          );
        },
      },
      {
        name: 'industries',
        width: 200,
      },
      {
        name: 'childrenIndustryNames',
        width: 150,
      },
      {
        name: 'industryCategoryNames',
        width: 150,
      },
      showTagFlag &&
        isChinese && {
          name: 'zhimaLabels',
          width: 200,
          renderer: ({ value }) => {
            return (
              <div className={styles['enterprise-tags-line']}>
                {(value || []).map(item => (
                  <Tooltip title={item.labelDefinition}>
                    <Tag border={false}>
                      {item.labelCode && <img src={item.labelCode} alt="" />}
                      <div className="enterprise-name">{item.labelName}</div>
                    </Tag>
                  </Tooltip>
                ))}
              </div>
            );
          },
        },
      {
        name: 'serviceAreaCodeNames',
        width: 120,
      },
      {
        name: 'registeredCapital',
        width: 120,
      },
      {
        name: 'currencyName',
      },
      {
        name: 'relationSearch',
        renderer: ({ record }) => {
          const supplierCompanyName = record.get('companyName');
          return (
            <a
              onClick={() => {
                openRelationChart({ supplierCompanyName, businessType: 'SUPPLIER_INVITATION' });
              }}
            >
              {intl.get('sslm.common.view.common.relationSearch').d('关系排查')}
            </a>
          );
        },
      },
      {
        name: 'latestCheckTime',
        width: 160,
      },
      {
        name: 'latestCheckFileUrl',
        width: 140,
        renderer: ({ record }) => {
          const latestCheckFileUrl = record.get('latestCheckFileUrl');
          if (!latestCheckFileUrl) {
            return '-';
          }
          return (
            <a
              onClick={() => {
                this.handleDownloadReport(latestCheckFileUrl);
              }}
            >
              {intl.get('sslm.common.view.common.latestRelationReport').d('最新关系排查报告')}
            </a>
          );
        },
      },
    ].filter(Boolean);
    return columns;
  }

  // 查询
  @Bind()
  handleQuery(queryProps = {}) {
    const { dataSet, routeParams: { sourceType } = {}, onRegisterModal } = this.props;
    const { params = {} } = queryProps;

    if (dataSet.queryDataSet?.current) {
      const clearParams = {}; // 清理
      const dataObj = dataSet.queryDataSet.current.toData();
      if (dataObj) {
        for (const key in dataObj) {
          if (!['companyName'].includes(key)) {
            // 排除掉自定义的查询条件
            if (!Object.prototype.hasOwnProperty.call(params, key)) {
              clearParams[key] = undefined;
            }
          }
        }
      }
      dataSet.queryDataSet.current.set({
        ...params,
        ...clearParams,
      });
      dataSet.query().then(response => {
        // 供应商管理工作台-操作指引-未查询到数据时，默认打开供应商邀约弹框
        if (response && isEmpty(response.content) && sourceType === 'GUIDE') {
          onRegisterModal();
        }
      });
    } else if (this.searchBarRef) {
      // this.searchBarRef.handleQuery 内部会触发我们的handleQuery方法
      this.searchBarRef.handleQuery(true);
    } else {
      dataSet.query().then(response => {
        // 供应商管理工作台-操作指引-未查询到数据时，默认打开供应商邀约弹框
        if (response && isEmpty(response.content) && sourceType === 'GUIDE') {
          onRegisterModal();
        }
      });
    }
  }

  // 筛选器左侧渲染
  @Bind()
  renderLeftSearchBar() {
    const {
      dataSet,
      routeParams: { supplierCompanyName },
    } = this.props;
    // 修复正常输入供应商查询之后，查询条件被清空
    if (dataSet.queryDataSet && dataSet.queryDataSet.current && supplierCompanyName) {
      dataSet.queryDataSet.current.set('companyName', supplierCompanyName);
    }
    return (
      <TextField
        clearButton
        style={{ width: 250 }}
        valueChangeAction="blur"
        onChange={value => {
          // eslint-disable-next-line no-unused-expressions
          dataSet.queryDataSet?.current?.set('companyName', value);
          dataSet.query();
        }}
        value={dataSet.queryDataSet?.current?.get('companyName')}
        placeholder={intl
          .get('sslm.supplierInvite.model.invite.companyName')
          .d('请输入企业名称查询')}
      />
    );
  }

  // 清空、重置回调
  @Bind()
  clearValues() {
    const { dataSet } = this.props;
    // eslint-disable-next-line no-unused-expressions
    dataSet.queryDataSet?.current.reset();
  }

  // 筛选器字段改变
  @Bind()
  handleFieldChange({ record, name }) {
    if (name === 'registeredCountryId') {
      record.set({
        registeredRegionId: null,
        registeredCityId: null,
        registeredDistrictId: null,
      });
    }
    if (name === 'registeredRegionId') {
      record.set({
        registeredCityId: null,
        registeredDistrictId: null,
      });
    }
    if (name === 'registeredCityId') {
      record.set({
        registeredDistrictId: null,
      });
    }
  }

  render() {
    const { dataSet, customizeTable } = this.props;
    return (
      <Fragment>
        <div style={{ height: curTableHeight.hasTab }}>
          {customizeTable(
            {
              code: 'SSLM.SUPPLIER_INVITE_MANAGE_LIST.FIND_SUPPLIER_LIST',
              readOnly: true,
            },
            <SearchBarTable
              cacheState
              dataSet={dataSet}
              columns={this.getColumns()}
              searchBarRef={ref => {
                this.searchBarRef = ref;
              }}
              searchCode="SSLM.SUPPLIER_INVITE_MANAGE_LIST.FIND_SUPPLIER"
              style={{ maxHeight: tableMaxHeight.hasTab }}
              searchBarConfig={{
                editorProps: {},
                left: {
                  render: () => this.renderLeftSearchBar(),
                },
                onQuery: queryProps => this.handleQuery(queryProps),
                onReset: () => this.clearValues(),
                onClear: () => this.clearValues(),
                fieldProps: {
                  registeredRegionId: {
                    computedProps: {
                      disabled: ({ record }) => {
                        const country = record.get('registeredCountryId') || {};
                        const { countryId, countryCode, quickIndex } = country;
                        // 中国
                        const chainFlag = countryCode === 'CN' || quickIndex === 'CN';
                        return !countryId || !chainFlag;
                      },
                      lovPara: ({ record }) => {
                        const country = record.get('registeredCountryId') || {};
                        const { countryId } = country;
                        return {
                          countryId,
                        };
                      },
                    },
                  },
                  registeredCityId: {
                    computedProps: {
                      disabled: ({ record }) => !record.get('registeredRegionId'),
                      lovPara: ({ record }) => {
                        const region = record.get('registeredRegionId') || [];
                        const regionIdList = region.map(item => {
                          const { regionId } = item;
                          return regionId;
                        });
                        return {
                          parentRegionIds: regionIdList ? regionIdList.join() : null,
                        };
                      },
                    },
                  },
                  registeredDistrictId: {
                    computedProps: {
                      disabled: ({ record }) => !record.get('registeredCityId'),
                      lovPara: ({ record }) => {
                        const region = record.get('registeredCityId') || [];
                        const regionIdList = region.map(item => {
                          const { regionId } = item;
                          return regionId;
                        });
                        return {
                          parentRegionIds: regionIdList ? regionIdList.join() : null,
                        };
                      },
                    },
                  },
                },
                onFieldChange: this.handleFieldChange,
              }}
            />
          )}
        </div>
      </Fragment>
    );
  }
}

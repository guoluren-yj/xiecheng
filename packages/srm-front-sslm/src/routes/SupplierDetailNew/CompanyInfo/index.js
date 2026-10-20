/*
 * CompanyInfo 公司信息
 * @Date: 2023-08-21 16:44:28
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { map } from 'lodash';
import React, { Fragment, useContext, useEffect } from 'react';
import { Tooltip, useDataSet, Form, Lov, Output, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';
import {
  getUserOrganizationId,
  getAttachmentUrl,
  getResponse,
  getCurrentLanguage,
} from 'utils/utils';

import defaultLogo from '@/assets/360Query/logo.svg';
import { Context } from '@/routes/SupplierDetailNew/Context';
import { useSetState, getTooltipShow } from '@/routes/components/utils';
import { fetEditedInfo, fetchERPInfo } from '@/services/supplierDetailService';
import EnterpriseTags from '@/routes/components/MemberSupplier/EnterpriseTags';
import { ReactComponent as StageSignet } from '@/assets/360Query/stageSignet.svg';
import { ReactComponent as EliminateSignet } from '@/assets/360Query/eliminateSignet.svg';
import UpdateHistory from './UpdateHistory';
import { getIndexDS } from './stores/getIndexDS';

const sourceKey = 'SUPPLIER_DETAIL_NEW';
const language = getCurrentLanguage();
const isChinese = language === 'zh_CN'; // 中文语言环境

const CompanyInfo = ({ remote, customizeForm, showTagFlag }) => {
  const context = useContext(Context);

  const [state, setState] = useSetState({
    editedInfo: {}, // 修改次数和最后更新时间
    erpList: [], // ERP供应商信息
  });

  const { editedInfo, erpList } = state;

  const {
    basic = {},
    dispatch,
    tenantId,
    business = {},
    companyId,
    supplierCompanyId,
    setCompanyId,
    routerParam,
    lifeCycle = {},
    defaultCompany,
    supplierDetailNewRemote,
  } = context;
  const companyDs = useDataSet(() => getIndexDS({ tenantId, supplierCompanyId }), [
    tenantId,
    supplierCompanyId,
  ]);

  useEffect(() => {
    handleInitQuery();
  }, [companyId]);

  useEffect(() => {
    if (companyDs.current) {
      companyDs.current.set('companyId', defaultCompany);
    }
  }, [JSON.stringify(defaultCompany), JSON.stringify(routerParam)]);

  // 初始查询
  const handleInitQuery = () => {
    if (companyId) {
      // 修改次数和最后更新时间
      fetEditedInfo({ companyId, partnerCompanyId: supplierCompanyId }).then(response => {
        const res = getResponse(response);
        if (res) {
          setState({ editedInfo: res });
        }
      });
      // 查询erp供应商
      fetchERPInfo({
        supplierCompanyId,
      }).then(response => {
        const res = getResponse(response);
        if (res) {
          setState({ erpList: res });
        }
      });
    }
  };

  // 查看更新记录
  const handleUpdateHistory = () => {
    Modal.open({
      drawer: true,
      key: Modal.key(),
      cancelButton: false,
      style: { width: 1090 },
      title: intl
        .get('sslm.supplierDetail.model.supplierDetail.viewUpdateHistory')
        .d('查看更新记录'),
      okText: intl.get('hzero.common.button.close').d('关闭'),
      children: (
        <UpdateHistory
          remote={remote}
          dispatch={dispatch}
          purchaserId={companyId}
          supplierId={supplierCompanyId}
        />
      ),
    });
  };

  // 公司改变的回调
  const handleCompanyChange = (selectedRows = {}) => {
    setCompanyId(selectedRows.companyId);
  };

  const fields = [
    {
      name: 'companyNum',
      renderer: () => basic.companyNum,
    },
    {
      name: 'creationDate',
      renderer: () => dateTimeRender(basic.creationDate),
    },
    {
      name: 'count',
      renderer: () => {
        const editedCount = editedInfo.count;
        return (
          <Fragment>
            {intl
              .get('sslm.supplierDetail.model.supplierDetail.editedInfoCount', {
                count: editedCount,
              })
              .d(`${editedCount || 0}次`)}
            {Boolean(editedCount) && (
              <a style={{ marginLeft: 8 }} onClick={handleUpdateHistory}>
                {intl
                  .get('sslm.supplierDetail.model.supplierDetail.viewUpdateHistory')
                  .d('查看更新记录')}
              </a>
            )}
          </Fragment>
        );
      },
    },
    {
      name: 'eRPInfo',
      renderer: () => {
        const newErpList = map(erpList, erp => `[${erp.companyName}]-${erp.companyNum}`);
        const value = newErpList.join('，');
        return (
          <Tooltip title={value} placement="topLeft">
            <span className="erp-info-wrap">{value || '-'}</span>
          </Tooltip>
        );
      },
    },
    {
      name: 'cooperationTime',
      renderer: () => dateTimeRender(basic.cooperationTime),
    },
    {
      name: 'lastUpdateDate',
      renderer: () => dateTimeRender(editedInfo.lastUpdateDate) || '-',
    },
    {
      name: 'partnerPurchaseAgentName',
      renderer: () => (
        <Tooltip title={basic.partnerPurchaseAgentName} placement="topLeft">
          <span className="erp-info-wrap">{basic.partnerPurchaseAgentName || '-'}</span>
        </Tooltip>
      ),
    },
  ];

  const url = business && business.logoUrl;
  const newUrl = getAttachmentUrl(url, PRIVATE_BUCKET, getUserOrganizationId());
  const remoteParams = {
    basic,
  };
  const companyDsCurrent = companyDs.current;
  useEffect(() => {
    if (companyDsCurrent) {
      companyDs.loadData([{ ...companyDsCurrent.toData(), ...basic }]);
    }
  }, [basic, companyDsCurrent]);

  return (
    <div className="company-container">
      <div className="company-head">
        <div className="company-head-left">
          <img className="logo-img" src={url ? newUrl : defaultLogo} alt="logo" />
        </div>
        <div className="company-head-right">
          <div className="company-title">
            {basic && basic.companyName}
            {showTagFlag && isChinese && (
              <div style={{ marginTop: 8 }}>
                <EnterpriseTags
                  key={sourceKey}
                  tagList={basic?.zhimaLabels}
                  parentId="sslmSupplierDetailNew"
                  tagClassName="sslm-supplier-detail-new"
                />
              </div>
            )}
          </div>
          {customizeForm(
            {
              code: 'SSLM.SUPPLIER_360_PAGE_COLLECT.SUPPLIER_BASIC',
            },
            <Form
              dataSet={companyDs}
              labelLayout="vertical"
              useWidthPercent
              className="c7n-pro-vertical-form-display"
            >
              {fields.map(field => (
                <Output {...field} />
              ))}
            </Form>
          )}
        </div>
      </div>
      <div className="company-footer">
        <div>
          {customizeForm(
            {
              code: 'SSLM.SUPPLIER_360_PAGE_COLLECT.PURCHASE_COMPANY',
            },
            <Form
              dataSet={companyDs}
              labelLayout="float"
              style={{ marginTop: 24, marginBottom: 20 }}
            >
              <Lov
                name="companyId"
                searchable={false}
                clearButton={false}
                onChange={handleCompanyChange}
              />
            </Form>
          )}
        </div>
        {supplierDetailNewRemote &&
          supplierDetailNewRemote.render(
            'SSLM_SUPPLIER_DETAIL_NEW_COMPANY_FOOTER',
            <Fragment />,
            remoteParams
          )}
        <div className="stage-wrap">
          {lifeCycle?.stageCode !== 'ELIMINATED' ? <StageSignet /> : <EliminateSignet />}
          <span
            className="stage-desc"
            style={{ color: lifeCycle?.stageCode !== 'ELIMINATED' ? '#F5AEB3' : '#D1D1D1' }}
          >
            {getTooltipShow(lifeCycle?.stageDescription, 22, 92)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CompanyInfo;

/**
 * 认证页面
 */
import React, { useEffect, useState } from 'react';
import intl from 'utils/intl';
import { Header } from 'components/Page';
import { Spin } from 'choerodon-ui/pro';
import { stringify } from 'querystring';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import { getParseUrlParam } from '@/utils/utils';
import {
  fetchAuthStatus,
  fetchCompanyItem,
  getNeedParam,
} from '@/services/supplierElecSignWorkplaceService';

import AuthStepPanel from '../AuthStepPanel';

const UnAuthorized = (props) => {
  const { history, location } = props;

  const [companyDetail, setCompanyDetail] = useState({});
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(null); // 认证状态
  const [tenantCompany, setTenantCompany] = useState({}); //

  const { href } = window.location;

  const { companyId = '', tenantId = '', authType = '', scrollH = '' } =
    location && location.search ? getParseUrlParam(location.search) : {};

  useEffect(() => {
    if (!companyId || !tenantId) return;

    getNeedParam({
      companyId,
      tenantId,
    }).then((res) => {
      if (getResponse(res)) {
        setTenantCompany(res);
        if (res && res.tenantNum) {
          initStatus({ ...res });
        }
      }
    });
  }, [companyId]);

  const initStatus = (obj) => {
    if (!(companyId && obj && obj.tenantNum)) {
      return;
    }
    fetchCompanyItem({
      companyId,
      tenantName: obj.tenantNum,
      asyncCountFlag: 'DEFAULT',
      tenantId: getCurrentOrganizationId(),
      page: 0,
      size: 20,
    }).then((res) => {
      if (getResponse(res)) {
        const list = res?.content ?? [];
        getCompanyStatus();
        setCompanyDetail(list.length ? { ...list[0] } : {});
      }
    });
  };

  /**
   * 获取企业认证步骤
   * @param {*} comp
   */
  const getCompanyStatus = () => {
    if (!companyId) return;

    setLoading(true);
    fetchAuthStatus({
      companyId,
      tenantId,
      orderTenantId: tenantId,
      sourceMenu: 'sel',
    }).then((result) => {
      setLoading(false);
      if (getResponse(result)) {
        setCurrent(result?.currentNode ?? '');
      }
    });
  };

  const refreshToManage = () => {
    const searchParams = {
      companyId,
      authType,
      tenantId,
    };
    if (companyId) {
      history.push({
        pathname: `/spfm/sup-sign/detail`,
        search: stringify(searchParams),
      });
    }
  };

  const title = intl.get('spfm.supplierElectronicSign.view.title.supplierPageTitle', {
    name: (tenantCompany?.companyName ?? '') || (tenantCompany?.tenantName ?? ''),
  });

  return (
    <Spin spinning={loading}>
      <Header
        title={title}
        backPath={`/spfm/sup-sign/list?defaultItem=${companyId}&scrollH=${scrollH}`}
      />
      <div style={{ margin: '8px' }}>
        <AuthStepPanel
          currentNode={current}
          redirectUrl={href}
          companyDetail={companyDetail}
          companyId={companyId}
          tenantId={tenantId}
          authType={authType}
          history={history}
          onRefreshStatus={initStatus}
          onRefreshToManage={refreshToManage}
        />
      </div>
    </Spin>
  );
};

export default formatterCollections({
  code: [
    'spfm.supplierElectronicSign',
    'spfm.buyerElectronicSign',
    'hiam.userInfo',
    'spfm.configServer',
  ],
})(UnAuthorized);

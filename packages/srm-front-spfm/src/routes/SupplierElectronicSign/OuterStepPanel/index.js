/* eslint-disable eqeqeq */
/**
 * 契约锁、法大大详情页面
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Header } from 'components/Page';
import intl from 'utils/intl';
// import { stringify } from 'querystring';
import { getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { Spin, DataSet, Button } from 'choerodon-ui/pro';

import { getParseUrlParam } from '@/utils/utils';
import {
  // resetProcess,
  fetchCompanyNodeDetail,
  fetchQysOuterStep,
  getNeedParam,
} from '@/services/supplierElecSignWorkplaceService';

import { OldRouteDetailDS } from '../stores/supplierSignDS';

import styles from './index.less';
import SignDetail from '../SimpleDetail/SignDetail';
import OuterStepPage from './OuterStepPage';

const OuterStepPanel = (props) => {
  const { href } = window.location;
  const { history, location } = props;
  const { companyId = '', tenantId = '', authType = '', scrollH } =
    location && location.search ? getParseUrlParam(location.search) : {};

  const basicFormDS = useMemo(() => new DataSet({ ...OldRouteDetailDS() }), []);

  const [companyDetail, setDetail] = useState({}); // 当前公司详情信息
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [tenantCompany, setTenantCompany] = useState({}); //
  const [refresh, setRefresh] = useState(false);
  const [approveFlag, setApproveFlag] = useState('');
  const [isPayment, setIsPayment] = useState(true);

  useEffect(() => {
    basicFormDS.addEventListener('load', queryEvent);
    return () => {
      basicFormDS.removeEventListener('load', queryEvent);
    };
  }, []);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  useEffect(() => {
    if (companyId && tenantId) {
      getNeedParam({
        companyId,
        tenantId,
      }).then((res) => {
        if (getResponse(res)) {
          setTenantCompany(res);
        }
      });
      initStatus();
    }
  }, [companyId, authType, tenantId]);

  const queryEvent = () => {
    setRefresh(true);
  };

  const initStatus = async () => {
    if (authType !== 'ESIGN') {
      // 非易签宝
      const result = await fetchQysOuterStep({
        companyId,
        tenantId,
        authType,
      });
      if (getResponse(result)) {
        setCurrent(result?.currentNode ?? 0);
        setIsPayment(result?.payment ?? true);
      } else {
        setLoading(false);
      }
    }

    if (authType && companyId) {
      fetchCompanyNodeDetail({
        companyId,
        authType,
        asyncCountFlag: 'DEFAULT',
        page: 0,
        size: 20,
      }).then((res) => {
        setLoading(false);
        if (getResponse(res)) {
          setDetail({ companyCode: tenantCompany?.companyNum ?? '', ...res });
        }
      });
    }
  };

  const validSignMap = {
    QYS: current === 4, // 契约锁返回认证步骤4
  };

  const title = validSignMap[authType]
    ? intl.get('spfm.supplierElectronicSign.view.title.partner', {
        name: `"${tenantCompany?.tenantName ?? ''}"`,
      })
    : intl.get('spfm.supplierElectronicSign.view.title.supplierPageTitle', {
        name: companyDetail?.companyName ?? '',
      });

  const handleRefreshStatus = () => {
    initStatus();
  };

  const handleRefreshManage = () => {
    initStatus();
  };

  const handleApprove = () => {
    setApproveFlag(`approve${new Date().getTime()}`);
  };

  const stepProps = {
    history,
    redirectUrl: href,
    currentNode: current,
    companyId,
    tenantId,
    isPayment,
    tenantNum: tenantCompany?.tenantNum ?? '',
    companyDetail,
    authType,
    approveFlag,
    onRefreshStatus: handleRefreshStatus,
    onRefreshToManage: handleRefreshManage,
  };

  return (
    <Spin spinning={loading}>
      <div className={styles['supplier-signature-workplace-basic']}>
        <Header
          title={title}
          backPath={`/spfm/sup-sign/list?defaultItem=${companyId}&scrollH=${scrollH}`}
        >
          {authType && current === 2 ? (
            <Button icon="check" color="primary" onClick={handleApprove}>
              {intl.get('hzero.common.button.sumbit').d('提交')}
            </Button>
          ) : null}
        </Header>
      </div>
      <div style={{ height: 'calc(100vh - 154px)', overflowY: 'auto', margin: '8px' }}>
        {authType && validSignMap[authType] ? (
          <SignDetail
            companyCode={tenantCompany?.companyNum ?? ''}
            basicFormDS={basicFormDS}
            location={location}
            tenantNum={tenantCompany?.tenantNum ?? ''}
          />
        ) : (
          <OuterStepPage {...stepProps} location={location} />
        )}
      </div>
    </Spin>
  );
};

export default formatterCollections({
  code: [
    'spfm.supplierElectronicSign',
    'spfm.buyerElectronicSign',
    'spfm.certificateAuthority',
    'spfm.sealmanage',
    'hiam.userInfo',
    'spfm.configServer',
  ],
})(OuterStepPanel);

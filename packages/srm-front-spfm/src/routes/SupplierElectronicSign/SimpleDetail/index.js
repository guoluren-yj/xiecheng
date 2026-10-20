/* eslint-disable eqeqeq */
/**
 * 契约锁、法大大详情页面
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Header } from 'components/Page';
import intl from 'utils/intl';
import { stringify } from 'querystring';
import { getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { Spin, Button, DataSet } from 'choerodon-ui/pro';

import { getParseUrlParam } from '@/utils/utils';
import {
  resetProcess,
  fetchCompanyNodeDetail,
  fetchQysStep,
  getNeedParam,
} from '@/services/supplierElecSignWorkplaceService';
import { save } from '@/services/certificateAuthorityService';

import { OldRouteDetailDS } from '../stores/supplierSignDS';

import styles from './index.less';
import SignDetail from './SignDetail';
import StepPage from './StepPage';

// let refreshType = '';

const SimpleDetail = (props) => {
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

  useEffect(() => {
    basicFormDS.addEventListener('load', queryEvent);
    return () => {
      basicFormDS.removeEventListener('load', queryEvent);
      // refreshType = '';
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
      const result = await fetchQysStep({
        companyId,
        tenantId,
        authType,
      });
      if (getResponse(result)) {
        setCurrent(result?.currentNode ?? 0);
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

  /**
   * 流程重置
   */
  const handleResetFlow = () => {
    const searchParams = {
      companyId,
      authType,
      tenantId,
    };
    resetProcess({
      ...companyDetail,
      authType,
    }).then((res) => {
      if (getResponse(res)) {
        history.push({
          pathname: `/spfm/sup-sign/old-dtl`,
          search: stringify(searchParams),
        });
      }
    });
  };

  const validSignMap = {
    ESIGN:
      companyDetail &&
      companyDetail.authenticateResult === 'success' &&
      companyDetail.caAuthStatus === 'CA_SUCCESS' &&
      companyDetail.personAuthStatus !== 'PERSONAL_AUTH_NON',
    FDD: current === 4, // 法大大返回认证步骤4 是已完成状态
    QYS: current === 3, // 契约锁返回认证步骤3
  };

  const title = validSignMap[authType]
    ? intl.get('spfm.supplierElectronicSign.view.title.partner', {
        name: `"${tenantCompany?.tenantName ?? ''}"`,
      })
    : intl.get('spfm.supplierElectronicSign.view.title.supplierPageTitle', {
        name: companyDetail?.companyName ?? '',
      });

  const handleRefreshStatus = () => {
    // refreshType = 'refresh';
    initStatus();
  };

  const handleRefreshManage = () => {
    // refreshType = 'manage';
    initStatus();
  };

  /**
   * 企业禁用操作
   */
  const handleChangeStatus = async (flag) => {
    const obj = basicFormDS?.current?.toData() ?? null;
    if (obj && Object.keys(obj).length) {
      await save([
        {
          ...obj,
          enabledFlag: flag,
        },
      ]).then(() => {
        basicFormDS.query();
      });
    }
  };

  const stepProps = {
    history,
    redirectUrl: href,
    currentNode: current,
    companyId,
    tenantId,
    tenantNum: tenantCompany?.tenantNum ?? '',
    companyDetail,
    authType,
    onRefreshStatus: handleRefreshStatus,
    onRefreshToManage: handleRefreshManage,
  };

  const enabledFlag = basicFormDS?.current?.get('enabledFlag') ?? '';
  const caAuthStr = basicFormDS?.current?.get('caAuthStatus') ?? '';
  const personAuthStatus = basicFormDS?.current?.get('personAuthStatus') ?? '';

  return (
    <Spin spinning={loading}>
      <div className={styles['supplier-signature-workplace-basic']}>
        <Header
          title={title}
          backPath={`/spfm/sup-sign/list?defaultItem=${companyId}&scrollH=${scrollH}`}
        >
          {authType === 'ESIGN' && validSignMap[authType] ? (
            <Button onClick={handleResetFlow} icon="replay" funcType="flat">
              {intl.get(`spfm.supplierElectronicSign.view.button.authReset`).d('重新认证')}
            </Button>
          ) : null}
          {caAuthStr === 'CA_SUCCESS' && personAuthStatus !== 'PERSONAL_AUTH_NON' ? (
            <>
              {enabledFlag == 1 ? (
                <Button onClick={() => handleChangeStatus(0)} funcType="flat">
                  {intl.get('hzero.common.status.disable').d('禁用')}
                </Button>
              ) : (
                <Button onClick={() => handleChangeStatus(1)} funcType="flat">
                  {intl.get('hzero.common.status.enable').d('启用')}
                </Button>
              )}
            </>
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
          <StepPage {...stepProps} location={location} />
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
})(SimpleDetail);

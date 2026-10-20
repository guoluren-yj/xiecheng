/**
 * 公司列表
 */
import React, { useEffect, useState } from 'react';
import intl from 'utils/intl';
// import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import { stringify } from 'querystring';
import { TextField, Table, Icon } from 'choerodon-ui/pro';

// companyVerify fetchCompanyDetail
import { fetchAuthStatus, fetchBusinessDetail } from '@/services/supplierElecSignWorkplaceService';

import styles from './index.less';

export default function CompanyListPanel(props) {
  const { listDS, history, style, companyData } = props;

  const [inputVal, setInput] = useState('');

  useEffect(() => {
    if (companyData && companyData.companyId) {
      listDS.setQueryParameter('companyId', companyData.companyId);
      listDS.query();
    }
  }, [companyData]);

  const pushSaas = (authType, tenantNum, tenantId, tenantName, scrollH) => {
    if (!(companyData && companyData.companyId)) return false;

    fetchAuthStatus({
      companyId: companyData.companyId,
      tenantId,
      orderTenantId: tenantId,
      sourceMenu: 'sel',
    }).then((result) => {
      if (getResponse(result)) {
        if (result && result.finish) {
          const searchParams = {
            companyId: companyData.companyId,
            authType,
            tenantId,
            scrollH,
          };
          // 已认证
          history.push({
            pathname: `/spfm/sup-sign/detail`,
            search: stringify(searchParams),
          });
        } else {
          const searchParams = {
            companyId: companyData.companyId,
            authType,
            tenantId,
            scrollH,
          };
          history.push({
            pathname: `/spfm/sup-sign/unauth`,
            search: stringify(searchParams),
          });
        }
      }
    });
  };

  const switchPush = async (type, tenantNum, tenantId, authStatus, tenantName) => {
    const scrollH =
      document.getElementById('supplier-elec-auth-done-panel-left-menu')?.scrollTop ?? 0;
    const comId = companyData?.companyId ?? '';
    const foreignFlag = companyData?.foreignFlag ?? '';
    const searchParams = {
      companyId: comId,
      authType: type,
      tenantId,
      scrollH,
    };

    let comDetail = null;

    switch (type) {
      // saas 新链路
      case 'QYS_SAAS':
      case 'ESIGN_SAAS':
      case 'FDD_SAAS':
        pushSaas(type, tenantNum, tenantId, tenantName, scrollH);
        break;

      // 易签宝
      case 'ESIGN':
        // 查询公司认证详情
        comDetail = await fetchBusinessDetail({
          companyId: comId,
          asyncCountFlag: 'DEFAULT',
          authType: type,
        });

        // 未认证
        if (
          ![1, '1'].includes(authStatus) ||
          (comDetail && comDetail.authenticateResult !== 'success') ||
          comDetail?.personAuthStatus === 'PERSONAL_AUTH_NON'
        ) {
          history.push({
            pathname: `/spfm/sup-sign/old-dtl`,
            search: stringify(searchParams),
          });
        } else {
          // 已认证
          history.push({
            pathname: `/spfm/sup-sign/simple-dtl`,
            search: stringify(searchParams),
          });
        }
        break;

      // 契约锁
      case 'QYS':
        if (foreignFlag === 0) {
          history.push({
            pathname: `/spfm/sup-sign/outer-simple-dtl`,
            search: stringify(searchParams),
          });
        } else {
          // 境内企业
          history.push({
            pathname: `/spfm/sup-sign/simple-dtl`,
            search: stringify(searchParams),
          });
        }
        break;

      // 法大大
      case 'FDD':
        history.push({
          pathname: `/spfm/sup-sign/simple-dtl`,
          search: stringify(searchParams),
        });
        break;

      default:
        break;
    }
  };

  /**
   * 管理
   */
  const handleManage = (record) => {
    const { tenantNum, tenantId, partnerCode, authStatus, tenantName } = record.get([
      'tenantNum',
      'tenantId',
      'partnerCode',
      'authStatus',
      'tenantName',
    ]);

    switchPush(partnerCode, tenantNum, tenantId, authStatus, tenantName);
  };

  const statusMap = {
    0: intl.get('spfm.buyerElectronicSign.view.status.notCertified').d('未认证'),
    1: intl.get('spfm.buyerElectronicSign.view.status.verified').d('已认证'),
    2: intl.get('spfm.buyerElectronicSign.view.status.expired').d('已过期'),
    3: intl.get('spfm.buyerElectronicSign.view.status.authing').d('认证中'),
  };

  const classMap = {
    0: styles['tag-disEnabled-status'],
    1: styles['tag-enabled-status'],
    2: styles['tag-expired-status'],
    3: styles['tag-pending-status'],
  };

  const columns = () => {
    return [
      { name: 'tenantName' },
      { name: 'tenantNum' },
      {
        name: 'partnerCode',
      },
      {
        name: 'authStatus',
        renderer: ({ text }) => {
          if (text) {
            return <span className={classMap[text]}>{statusMap[text]}</span>;
          } else return '-';
        },
      },
      {
        name: 'operation',
        header: intl.get('hzero.common.button.operator').d('操作'),
        renderer: ({ record }) => {
          return record.get('partnerCode') !== 'SSQ' ? (
            <span className="action-link">
              <a onClick={() => handleManage(record)}>
                {intl.get('spfm.supplierElectronicSign.view.title.manage').d('管理')}
              </a>
            </span>
          ) : null;
        },
      },
    ];
  };

  const handleInput = (e) => {
    setInput(e?.target?.value?.trim() ?? '');
  };

  const handleQuery = () => {
    listDS.setQueryParameter('tenantName', inputVal);
    listDS.query();
  };

  const handleClear = () => {
    setInput('');
    listDS.setQueryParameter('tenantName', '');
    listDS.query();
  };

  return (
    <div className={styles['supplier-company-list-basic']} style={style}>
      <div>
        <TextField
          prefix={<Icon type="search" />}
          style={{ width: '280px' }}
          onInput={handleInput}
          onEnterDown={handleQuery}
          onClear={handleClear}
          clearButton
          placeholder={intl
            .get('spfm.supplierElectronicSign.view.placeholder.partnerNameOrCode')
            .d('请输入合作客户名称、编码查询')}
        />
      </div>
      <div style={{ marginTop: '16px', height: 'calc(100vh - 280px)' }}>
        <Table
          dataSet={listDS}
          columns={columns()}
          queryBar="none"
          autoHeight={{ type: 'maxHeight', diff: 20 }}
        />
      </div>
    </div>
  );
}

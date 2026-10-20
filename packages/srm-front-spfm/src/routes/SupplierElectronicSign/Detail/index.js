/**
 * 供应商电签 管理页面
 */
import React, { useMemo, useEffect, useState } from 'react';
import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import { HZERO_IAM } from 'utils/config';
import { Header } from 'components/Page';
import { stringify } from 'querystring';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { DataSet, Form, Output, Table, Lov, Button, Tooltip } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import moment from 'moment';

import { getParseUrlParam } from '@/utils/utils';
import { SRM_AMKT_HOST } from '@/utils/config';
import QueryBarMore from '@/components/QueryBarMore';
import {
  fetchSealManage,
  fetchAuthorizedUrl,
  fetchBatchSaveMember,
  getNeedParam,
  fetchChangeSignatory,
} from '@/services/supplierElecSignWorkplaceService';

import { BasicFormDS, MemberListDS } from '../stores/supplierSignDS';

import styles from './index.less';

let canClick = 1;
let lovTabDS = null;

const Detail = (props) => {
  const { history, location } = props;

  const { href } = window.location;

  const { companyId = '', tenantId = '', authType = '', scrollH } =
    location && location.search ? getParseUrlParam(location.search) : {};

  const basicFormDS = useMemo(() => new DataSet({ ...BasicFormDS() }), []);
  const memberListDS = useMemo(() => new DataSet({ ...MemberListDS() }), []);
  const lovDs = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          {
            name: 'peopleTree',
            type: 'object',
            lovCode: 'SPFM.ELECTRON_SIGN_WORKPLACE_USER_LIST',
            noCache: true,
            multiple: true,
            dynamicProps: {
              lovQueryAxiosConfig: () => {
                return {
                  url: `${HZERO_IAM}/hzero/v1/${getCurrentOrganizationId()}/users/have/company/sign-list?authType=${authType}&companyId=${companyId}`,
                  method: 'GET',
                  transformResponse: (value) => {
                    const obj = JSON.parse(value);
                    if (obj.content && obj.content.length) {
                      obj.content.forEach((item) => {
                        // eslint-disable-next-line no-param-reassign
                        item.userAuthStatus =
                          item.userAuthStatus === 'success'
                            ? intl.get('spfm.buyerElectronicSign.view.status.verified').d('已认证')
                            : intl
                                .get('spfm.buyerElectronicSign.view.status.notCertified')
                                .d('未认证');
                      });
                    }
                    return obj;
                  },
                };
              },
            },
          },
        ],
      }),
    [authType, companyId]
  );

  const [companyDetail, setDetail] = useState({}); // 当前公司详情信息
  const [userList, setUserList] = useState([]); //
  const [tenantCompany, setTenantCompany] = useState({}); //

  useEffect(() => {
    if (!companyId || !tenantId) return;

    getNeedParam({
      companyId,
      tenantId,
    }).then((res) => {
      if (getResponse(res)) {
        setTenantCompany(res);
      }
    });

    basicFormDS.setQueryParameter('companyId', companyId);
    basicFormDS.setQueryParameter('tenantId', tenantId);
    basicFormDS.query().then((res) => {
      if (!res) return;
      setDetail(res);

      // res.authStatus !== 1 || res.authorizeStatus !== 1
      if (![1, 2].includes(res.authStatus) || ![1, 2].includes(res.authorizeStatus)) {
        const searchParams = {
          companyId,
          authType,
          tenantId,
        };
        history.push({
          pathname: `/spfm/sup-sign/unauth`,
          search: stringify(searchParams),
        });

        return false;
      }

      if (res && res.signCompanyAuthId >= 0) {
        memberListDS.setQueryParameter('signCompanyAuthId', res.signCompanyAuthId);
        memberListDS.setQueryParameter('companyId', res.companyId);
        memberListDS.setQueryParameter('roleId', getCurrentUser().currentRoleId);
        memberListDS.setQueryParameter('tenantId', tenantId);
        memberListDS.query().then((result) => {
          if (result && result.content) {
            setUserList(result?.content ?? []);
          }
        });
      }
    });
  }, [companyId]);

  const authStatus = {
    0: intl.get('spfm.buyerElectronicSign.view.status.notCertified').d('未认证'),
    1: intl.get('spfm.buyerElectronicSign.view.status.verified').d('已认证'),
    2: intl.get('spfm.buyerElectronicSign.view.status.expired').d('已过期'),
    3: intl.get('spfm.buyerElectronicSign.view.status.authing').d('认证中'),
  };

  const authorizeStatus = {
    0: intl.get('spfm.buyerElectronicSign.view.status.unAuthorized').d('未授权'),
    1: intl.get('spfm.buyerElectronicSign.view.status.authorized').d('已授权'),
    2: intl.get('spfm.buyerElectronicSign.view.status.expired').d('已过期'),
    3: intl.get('spfm.buyerElectronicSign.view.status.authorizing').d('授权中'),
  };

  const classMap = {
    0: styles['tag-disEnabled-status'],
    1: styles['tag-enabled-status'],
    2: styles['tag-expired-status'],
    3: styles['tag-pending-status'],
  };

  const rendererStatus = ({ text }, statusMap = {}) => {
    if (text) {
      return <span className={classMap[text]}>{statusMap[text]}</span>;
    } else return '-';
  };

  const deleteMember = () => {
    if (memberListDS.selected.length) {
      memberListDS.selected.forEach((rcd) => {
        rcd.set('tenantId', tenantId);
      });
      memberListDS.delete(memberListDS.selected).then(() => {
        memberListDS.query();
      });
    }
  };

  /**
   * 选择成员列表
   */
  const handleSelect = async () => {
    const list = lovTabDS && lovTabDS.selected ? lovTabDS.selected : null;

    if (!list || !list.length) return false;

    const userArr = [];
    list.forEach((item) => {
      userArr.push({
        companyId: companyDetail?.companyId,
        userId: item?.get('id') ?? '',
        tenantId,
      });
    });

    // const obj = record ? record.toData() : {};
    // obj.id && companyDetail && companyDetail.companyId &&
    if (canClick === 1) {
      canClick = 0;
      const res = await fetchBatchSaveMember(userArr);

      canClick = 1;
      if (getResponse(res)) {
        notification.success();
        memberListDS.query();
        lovDs.data = [];
        lovDs.clearCachedSelected();
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  const afterClose = () => {
    lovDs.data = [];
    lovDs.reset();
    lovTabDS = null;
  };

  const lovColumns = () => {
    return [
      { name: 'loginName', width: 150 },
      { name: 'realName', width: 150 },
      { name: 'userAuthStatus', width: 150 },
      { name: 'authName', width: 150 },
      { name: 'bankPhoneNum', width: 150 },
    ];
  };

  const renderQueryBar = (prop) => {
    return <QueryBarMore {...prop} />;
  };

  const viewRenderer = React.useCallback(({ dataSet }) => {
    const tableProps = {
      selectionMode: 'rowbox',
      dataSet,
      multiple: false,
      autoHeight: { type: 'maxHeight', diff: 20 },
      queryFieldsLimit: 2,
      columns: lovColumns(),
      queryBar: renderQueryBar,
    };
    lovTabDS = dataSet;
    return (
      <div className={styles['people-select-lov-body']}>
        <Table {...tableProps} />
      </div>
    );
  }, []);

  const buttons = () => {
    const simpleRole = userList.length === 1 && userList[0].simpleRoleFlag; // 简易角色

    return !simpleRole
      ? [
          <Lov
            dataSet={lovDs}
            name="peopleTree"
            mode="button"
            clearButton={false}
            icon="playlist_add"
            viewMode="drawer"
            modalProps={{
              okFirst: true,
              afterClose,
            }}
            onBeforeSelect={handleSelect}
            // tableProps={{ selectionMode: 'rowbox' }}
            viewRenderer={viewRenderer}
          >
            {intl.get('spfm.buyerElectronicSign.view.button.newCreate').d('新增')}
          </Lov>,
          <Button icon="delete" funcType="flat" onClick={deleteMember}>
            {intl.get('spfm.buyerElectronicSign.view.status.delete').d('删除')}
          </Button>,
        ]
      : null;
  };

  /**
   * 重新授权
   */
  const handleReAuth = async () => {
    if (companyDetail && companyDetail.companyId) {
      const res = await fetchAuthorizedUrl({
        companyId: companyDetail.companyId,
        redirectUrl: href,
        tenantId,
      });

      if (getResponse(res) && res && res.authUrl) {
        window.open(res.authUrl);
        const searchParams = {
          companyId: companyDetail.companyId,
          authType,
          tenantId,
        };
        history.push({
          pathname: `/spfm/sup-sign/unauth`,
          search: stringify(searchParams),
        });
      }
    }
  };

  /**
   * 印章管理
   */
  const handleToSignManage = async () => {
    if (companyDetail && companyDetail.companyId) {
      const res = await fetchSealManage({
        companyId: companyDetail.companyId,
        tenantId,
      });

      if (!res || (res && res.includes('failed'))) {
        const { origin } = window.location;
        // 接口报错
        const result = res ? JSON.parse(res) : res;
        if (result && result.code === 'amkt.error.external.system.exception.msg') {
          // 无权限
          // history.push(``);
          window.open(`${origin}/app/public/spfm/signature-no-permission`, '_blank');
          return;
        }
        return getResponse(result);
      } else {
        const _DOMAIN = `${SRM_AMKT_HOST}/public`;
        const url = `${_DOMAIN}/amkt/ca-transfer-page?caPath=${res}`;
        window.open(url, '_blank');
      }
    }
  };

  const handleChangeSignatory = (userId, resultId) => {
    fetchChangeSignatory({ userId, resultId }).then((res) => {
      if (getResponse(res)) {
        notification.success();
        memberListDS.query();
      }
    });
  };

  const columns = () => {
    return [
      { name: 'statusMeaning' },
      { name: 'loginName' },
      {
        name: 'realName',
        width: 350,
        renderer: ({ text, record }) => {
          const show = record?.get('defaultSignatoryFlag') ?? false;
          return authType === 'FDD' ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '200px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {text}
              </span>
              {show ? (
                <span className={styles['tag-signatory']}>
                  {intl.get('spfm.buyerElectronicSign.view.tags.signatory').d('默认签署人')}
                </span>
              ) : null}
            </div>
          ) : (
            text
          );
        },
      },
      { name: 'name' },
      { name: 'phone' },
      { name: 'creationDate' },
      authType === 'FDD' && {
        header: intl.get('hzero.common.button.operator').d('操作'),
        renderer: ({ record }) => {
          const show = record?.get('defaultSignatoryFlag') ?? false;
          const userId = record?.get('userId') ?? '';
          const resultId = record?.get('resultId') ?? '';
          return authType === 'FDD' ? (
            <>
              {!show ? (
                <a onClick={() => handleChangeSignatory(userId, resultId)}>
                  {intl.get('spfm.buyerElectronicSign.view.tags.addSignatory').d('设为签署人')}
                </a>
              ) : null}
            </>
          ) : null;
        },
      },
    ].filter(Boolean);
  };

  /**
   * 设置授权到期时间 popover
   */
  const renderPopStatus = ({ record }) => {
    const type = record?.get('partnerCode') ?? '';
    const status = record?.get('authorizeStatus') ?? '';
    const endDate = record?.get('authorizeTime') ?? '';
    const nowTime = new Date().getTime();
    const endTime = endDate
      ? new Date(moment(endDate).format('YYYY-MM-DD hh:mm:ss')).getTime()
      : '';

    const isOverTime = endTime && nowTime && nowTime > endTime; // 已超时
    const lessThanMonth = endTime && nowTime && (endTime - nowTime) / (1000 * 60 * 60 * 24) <= 30;

    const msg = isOverTime
      ? intl.get('spfm.buyerElectronicSign.view.message.authTimeOver').d('授权已过期')
      : lessThanMonth
      ? intl.get('spfm.buyerElectronicSign.view.message.authWillOver').d('授权即将到期')
      : '';

    return type === 'FDD_SAAS' && [1, '1'].includes(status) ? (
      intl.get('spfm.buyerElectronicSign.view.message.longTerm').d('长期')
    ) : msg ? (
      <Tooltip title={msg}>
        <span style={{ color: isOverTime ? '#F05434' : lessThanMonth ? '#FC7700' : '' }}>
          {endDate ? moment(endDate).format('YYYY-MM-DD hh:mm:ss') : '-'}
        </span>
      </Tooltip>
    ) : (
      <span>{endDate ? moment(endDate).format('YYYY-MM-DD hh:mm:ss') : '-'}</span>
    );
  };

  const title = intl.get('spfm.supplierElectronicSign.view.title.partner', {
    name: `"${tenantCompany?.tenantName ?? ''}"`,
  });

  return (
    <div className={styles['supplier-signature-workplace-basic']}>
      <Header
        title={title}
        backPath={`/spfm/sup-sign/list?defaultItem=${companyId}&scrollH=${scrollH}`}
      >
        {companyDetail && companyDetail.authorizeStatus === 1 && (
          <Button icon="approval-o" color="primary" onClick={handleToSignManage}>
            {intl.get('spfm.buyerElectronicSign.view.button.sealManagement').d('印章管理')}
          </Button>
        )}
        {companyDetail && [1, '1', 2, '2'].includes(companyDetail.authorizeStatus) && (
          <Button onClick={handleReAuth} funcType="flat" icon="vpn_key">
            {intl.get('spfm.buyerElectronicSign.view.button.reAuthorized').d('重新企业授权')}
          </Button>
        )}
      </Header>

      <div style={{ margin: '8px' }}>
        <div
          style={{
            padding: '20px',
            backgroundColor: '#fff',
            border: '1px solid rgba(229, 231, 236, 1)',
          }}
        >
          <div className={styles['auth-done-title']}>
            {intl.get('spfm.buyerElectronicSign.view.title.basicInfo').d('基础信息')}
          </div>
          <div>
            <Form dataSet={basicFormDS} columns={3} labelLayout="float">
              <Output name="companyCode" />
              <Output name="companyName" />
              <Output
                name="organCode"
                label={
                  companyDetail?.foreignFlag === 0
                    ? intl
                        .get('spfm.supplierElectronicSign.view.title.registerNo')
                        .d('企业注册登记号/税号')
                    : intl
                        .get(`spfm.buyerElectronicSign.model.socialCreditCode`)
                        .d('统一社会信用代码')
                }
              />
              <Output name="partnerCode" />
              <Output name="authStatus" renderer={(e) => rendererStatus(e, authStatus)} />
              <Output name="authTime" />
              <Output name="authorizeStatus" renderer={(e) => rendererStatus(e, authorizeStatus)} />
              <Output name="authorizeOperateTime" />
              <Output name="authorizeTime" renderer={(record) => renderPopStatus(record)} />
            </Form>
          </div>
        </div>

        <div
          style={{
            marginTop: '8px',
            padding: '20px',
            backgroundColor: '#fff',
            // height: 'calc(100vh - 430px)',
            border: '1px solid rgba(229, 231, 236, 1)',
          }}
        >
          <div className={styles['auth-done-title']}>
            {intl.get('spfm.buyerElectronicSign.view.title.signMemberManage').d('用章成员管理')}
          </div>
          <Alert
            style={{ marginBottom: '8px' }}
            message={intl
              .get('spfm.buyerElectronicSign.view.message.memberManageAlert')
              .d(
                '提示：用印成员管理是维护待授权印章的企业成员，添加成员后，您可以点击右上角的”印章管理“按钮，跳转第三方平台进行印章管理和印章授权'
              )}
            type="info"
            showIcon
            iconType="help"
          />
          <div style={{ height: '340px' }}>
            <Table
              dataSet={memberListDS}
              columns={columns()}
              queryBar="none"
              buttons={buttons()}
              autoHeight={{ type: 'maxHeight', diff: 20 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default formatterCollections({
  code: [
    'spfm.supplierElectronicSign',
    'spfm.buyerElectronicSign',
    'hiam.userInfo',
    'spfm.configServer',
  ],
})(Detail);

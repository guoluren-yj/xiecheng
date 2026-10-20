/* eslint-disable react/jsx-indent */
/* eslint-disable eqeqeq */
/**
 * 认证完成 进入企业管理页面
 */
import React, { useEffect, useState, useMemo } from 'react';
import intl from 'utils/intl';
import { DataSet, Form, Table, Output, Lov, Tooltip } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import moment from 'moment';
import { HZERO_IAM } from 'utils/config';
import { getCurrentOrganizationId, getResponse, getCurrentUser } from 'utils/utils';
import notification from 'utils/notification';

import QueryBarMore from '@/components/QueryBarMore';
import { fetchAuthStatus, fetchBatchSaveMember } from '@/services/electronicSignWorkplaceService';
import {
  // fetchCompanyNodeDetail,
  fetchQysStep,
  fetchChangeSignatory,
} from '@/services/supplierElecSignWorkplaceService';

import { MemberListDS } from '../stores/authDoneDS';

import OuterStepPage from '../OuterStepPanel/OuterStepPage';
import LeftMenuPanel from './LeftMenuPanel';
import AuthStepPanel from '../AuthStepPanel';
import OldStepPanel from '../OldStepPanel';
import SignDetail from './SignDetail';
import styles from './index.less';

let canClick = 1;
let queryBuyerParamStr = '';

export default function AuthDonePanel(props) {
  const {
    onSelectCompany,
    companyArray,
    customizeForm,
    redirectUrl,
    history,
    dispatch,
    selected,
    pageStep,
    step,
    ds,
    urlCompanyId,
    authType,
    timeStr,
    statementVisible,
    detailDataSource,
    basicFormDS,
    approveFlag,
    onSubmit = () => {},
    onCacheCompanyDetail = () => {},
    onRefreshStatus = () => {},
    onChangeAuthFinish = () => {},
    onRefreshCompanyList = () => {},
    onRefreshToManage = () => {},
    onFetchDetailInfo = () => {},
    onChangeDataSource = () => {},
    onCallBackCompanyDetail = () => {},
    onChangeUserAuthStatus = () => {},
    onReChangeStep = () => {},
    handleChangeDataSource = () => {},
    onChangeStatVisible = () => {},
  } = props;

  const memberListDS = useMemo(() => new DataSet({ ...MemberListDS() }), []);

  const [companyList, setCompanyList] = useState([]);
  const [selectedCompany, setSelected] = useState(null);
  const [current, setCurrent] = useState(null); // 认证状态
  const [isPayment, setIsPayment] = useState(true);
  const [authFinish, setAuthFinish] = useState(false);
  const [authTypeStr, setPartnerCode] = useState('');
  const [loading, setLoading] = useState(false);

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
                  url: `${HZERO_IAM}/hzero/v1/${getCurrentOrganizationId()}/users/have/company/sign-list?authType=${authTypeStr}&companyId=${selected?.companyId ??
                    ''}`,
                  method: 'GET',
                  transformResponse: value => {
                    const obj = JSON.parse(value);
                    if (obj.content && obj.content.length) {
                      obj.content.forEach(item => {
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
    [authTypeStr, selected]
  );

  useEffect(() => {
    return () => {
      queryBuyerParamStr = '';
    };
  }, []);

  useEffect(() => {
    setPartnerCode(authType);
  }, [authType]);

  useEffect(() => {
    setCompanyList([...companyArray]);
  }, [companyArray]);

  useEffect(() => {
    // 已认证 查询详情及成员 否则 查询认证信息
    if (selected && selected.companyId) {
      getCompanyStatus({ ...selected });
    } else {
      getCompanyStatus({ ...selectedCompany });
    }

    setSelected(selected);
  }, [selected, pageStep, authType]);

  /**
   * 获取企业认证步骤
   * @param {*} comp
   */
  const getCompanyStatus = async (comp = {}) => {
    if (comp && comp.companyId) {
      if (['ESIGN_SAAS', 'QYS_SAAS', 'FDD_SAAS'].includes(authType)) {
        setLoading(true);
        fetchAuthStatus({
          companyId: comp?.companyId ?? '',
          orderTenantId: getCurrentOrganizationId(),
          sourceMenu: 'pur',
        }).then(result => {
          setLoading(false);
          if (getResponse(result)) {
            setCurrent(result?.currentNode ?? '');
            setIsPayment(result?.payment ?? true);
            setAuthFinish(result?.finish ?? false);
            onChangeAuthFinish(result?.finish ?? false);
            if (result.finish) {
              queryDetail(comp);
            }
          }
        });
      } else if (authType !== 'ESIGN' && authType) {
        setLoading(true);
        // 非易签宝
        const result = await fetchQysStep({
          companyId: comp?.companyId ?? '',
          tenantId: getCurrentOrganizationId(),
          authType,
        });
        setLoading(false);
        if (getResponse(result)) {
          setCurrent(result?.currentNode ?? 0);
          setIsPayment(result?.payment ?? true);
        }
      }
    }
  };

  /**
   * 查询企业级人员详情
   * @param {*} obj
   */
  const queryDetail = obj => {
    basicFormDS.setQueryParameter('companyId', obj.companyId);
    basicFormDS.query().then(res => {
      setPartnerCode(res?.partnerCode ?? '');
      if (res && res.signCompanyAuthId >= 0) {
        onCacheCompanyDetail(res);
        memberListDS.setQueryParameter('signCompanyAuthId', res?.signCompanyAuthId);
        memberListDS.setQueryParameter('roleId', getCurrentUser().currentRoleId);
        memberListDS.setQueryParameter('companyId', res?.companyId);
        memberListDS.setQueryParameter('tenantId', getCurrentOrganizationId());
        memberListDS.query();
      }
    });
  };

  const handleChangeSignatory = (userId, resultId) => {
    fetchChangeSignatory({ userId, resultId }).then(res => {
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
   * 选择公司
   * @param {*} company
   */
  const handleSelectedItem = (company = '') => {
    onSelectCompany({ ...company });
    basicFormDS.data = [];
    memberListDS.data = [];
  };

  /**
   * 选择成员列表
   */
  const handleSelect = async list => {
    if (!list.length) return false;

    const userArr = [];
    list.forEach(item => {
      userArr.push({
        companyId: selectedCompany.companyId,
        userId: item?.get('id') ?? '',
        tenantId: getCurrentOrganizationId(),
      });
    });

    if (canClick === 1) {
      canClick = 0;
      const res = await fetchBatchSaveMember(userArr);

      canClick = 1;
      if (getResponse(res)) {
        lovDs.clearCachedSelected();
        lovDs.data = [];
        notification.success();
        memberListDS.query();
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

  const renderQueryBar = prop => {
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
    return (
      <div className={styles['people-select-lov-body']}>
        <Table {...tableProps} />
      </div>
    );
  }, []);

  const buttons = () => {
    return [
      <Lov
        dataSet={lovDs}
        name="peopleTree"
        mode="button"
        clearButton={false}
        icon="playlist_add"
        viewMode="drawer"
        modalProps={{
          afterClose,
        }}
        onBeforeSelect={handleSelect}
        // tableProps={{ selectionMode: 'rowbox' }}
        viewRenderer={viewRenderer}
        className="spfm-buyer-electronic-sign-auth-done-member-add-btn"
      >
        {intl.get('spfm.buyerElectronicSign.view.button.newCreate').d('新增')}
      </Lov>,
      'delete',
    ];
  };

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

  const handleRefreshList = param => {
    queryBuyerParamStr = param?.companyNum ?? '';
    onRefreshCompanyList(param);
  };

  const handleRefreshStatus = obj => {
    onRefreshStatus(obj);
  };

  const companyValid =
    companyList.length > 1 ||
    ((!companyList.length || companyList.length === 1) && !!queryBuyerParamStr);

  const companyCode = basicFormDS?.current?.get('companyCode') ?? '';

  const validSignMap = {
    ESIGN:
      detailDataSource &&
      detailDataSource.authenticateResult === 'success' &&
      detailDataSource.caAuthStatus === 'CA_SUCCESS' &&
      detailDataSource.personAuthStatus !== 'PERSONAL_AUTH_NON',
    FDD: current === 4,
    QYS: current === 3,
  };

  return (
    <div className={styles['auth-done-panel-basic']}>
      {companyValid ? (
        <LeftMenuPanel
          companyList={companyList}
          defaultSelected={selectedCompany}
          onSelectItem={handleSelectedItem}
          onRefreshList={handleRefreshList}
        />
      ) : null}

      {['ESIGN_SAAS', 'QYS_SAAS', 'FDD_SAAS'].includes(authType) ? ( // SAAS 产品逻辑
        <>
          {selectedCompany &&
          (!authFinish || (pageStep && urlCompanyId === selectedCompany.companyId)) ? (
            <AuthStepPanel
              currentNode={pageStep && authFinish ? 4 : current}
              redirectUrl={redirectUrl}
              companyDetail={selectedCompany}
              history={history}
              dispatch={dispatch}
              authType={authType}
              loading={loading}
              onRefreshStatus={onRefreshStatus}
              onRefreshToManage={onRefreshToManage}
              styleCla={{
                marginLeft: companyValid ? '-1px' : '',
                // marginRight: companyValid ? '8px' : '',
                flex: 5,
                backgroundColor: '#fff',
              }}
            />
          ) : (
            <div
              style={{
                marginLeft: companyValid ? '-1px' : '',
                marginRight: companyValid ? '8px' : '',
                flex: 5,
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto',
              }}
            >
              <div
                style={{
                  padding: '20px',
                  backgroundColor: '#fff',
                  border: '1px solid rgba(229, 231, 236, 1)',
                  borderBottom: companyValid ? 'none' : '1px solid rgba(229, 231, 236, 1)',
                }}
              >
                <div className={styles['auth-done-title']}>
                  {intl.get('spfm.buyerElectronicSign.view.title.basicInfo').d('基础信息')}
                </div>
                <>
                  {customizeForm(
                    { code: 'SPFM.BUYER_ELECTRONIC_SIGNATURE.FORM' },
                    <Form dataSet={basicFormDS} columns={3} labelLayout="float">
                      <Output name="companyCode" />
                      <Output name="companyName" />
                      <Output
                        name="organCode"
                        label={
                          selectedCompany?.foreignFlag === 0
                            ? intl
                                .get('spfm.supplierElectronicSign.view.title.registerNo')
                                .d('企业注册登记号/税号')
                            : intl
                                .get(`spfm.buyerElectronicSign.model.socialCreditCode`)
                                .d('统一社会信用代码')
                        }
                      />
                      <Output name="partnerCode" />
                      <Output name="authStatus" renderer={e => rendererStatus(e, authStatus)} />
                      <Output
                        name="authorizeStatus"
                        renderer={e => rendererStatus(e, authorizeStatus)}
                      />
                      <Output name="authTime" />
                      <Output name="authorizeOperateTime" />
                      <Output name="authorizeTime" renderer={record => renderPopStatus(record)} />
                      <Output
                        name="autoSignStatus"
                        hidden
                        renderer={e => rendererStatus(e, authorizeStatus)}
                      />
                      <Output hidden name="autoSignAuthorizeOperateTime" />
                      <Output hidden name="autoSignAuthorizeTime" />
                    </Form>
                  )}
                </>
              </div>

              <div
                style={{
                  flex: 1,
                  marginTop: companyValid ? '' : '8px',
                  padding: '20px',
                  backgroundColor: '#fff',
                  height: companyValid ? 'calc(100% - 489px)' : 'calc(100% - 424px)',
                  border: '1px solid rgba(229, 231, 236, 1)',
                  borderTop: companyValid ? 'none' : '1px solid rgba(229, 231, 236, 1)',
                }}
              >
                <div className={styles['auth-done-title']}>
                  {intl
                    .get('spfm.buyerElectronicSign.view.title.signMemberManage')
                    .d('用章成员管理')}
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
                <div>
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
          )}
        </>
      ) : (
        // 非SAAS产品逻辑
        <>
          {selectedCompany?.foreignFlag === 0 && authType === 'QYS' && current !== 4 ? (
            <OuterStepPage
              currentNode={current}
              approveFlag={approveFlag}
              redirectUrl={redirectUrl}
              companyDetail={selected}
              history={history}
              isPayment={isPayment}
              authType={selected?.partnerCode}
              onRefreshStatus={handleRefreshStatus}
              onRefreshToManage={onRefreshToManage}
              styleCla={{
                marginLeft: companyValid ? '-1px' : '',
                flex: 5,
                backgroundColor: '#fff',
              }}
            />
          ) : !validSignMap[authType] &&
            (selectedCompany?.foreignFlag !== 0 || authType === 'ESIGN') ? (
            // 旧逻辑
            <OldStepPanel
              companyDetail={selectedCompany}
              history={history}
              step={step}
              ds={ds}
              currentNode={current}
              companyId={selectedCompany?.companyId ?? ''}
              dispatch={dispatch}
              authType={authType}
              loading={loading}
              statementVisible={statementVisible}
              detailDataSource={detailDataSource}
              onReChangeStep={onReChangeStep}
              onCallBackCompanyDetail={onCallBackCompanyDetail}
              onSubmit={onSubmit}
              onRefreshToManage={onRefreshToManage}
              onFetchDetailInfo={onFetchDetailInfo}
              onChangeDataSource={onChangeDataSource}
              onChangeUserAuthStatus={onChangeUserAuthStatus}
              handleChangeDataSource={handleChangeDataSource}
              onRefreshStatus={handleRefreshStatus}
              onChangeStatVisible={onChangeStatVisible}
              styleCla={{
                marginLeft: companyValid ? '-1px' : '',
                // marginRight: companyValid ? '8px' : '',
                flex: 5,
                backgroundColor: '#fff',
                height: 'calc(100vh - 212px)',
              }}
            />
          ) : (
            <div
              style={{
                marginLeft: companyValid ? '-1px' : '',
                // marginRight: companyValid ? '8px' : '',
                flex: 5,
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto',
                height: 'calc(100vh - 212px)',
              }}
            >
              <SignDetail
                companyCode={companyCode}
                companyId={selectedCompany?.companyId ?? ''}
                authType={authType}
                timeStr={timeStr}
                detailDataSource={detailDataSource}
                tenantId={getCurrentOrganizationId()}
                onCallBackCompanyDetail={onCallBackCompanyDetail}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* eslint-disable eqeqeq */
import React, { useEffect, useMemo, useState, useRef } from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import { connect } from 'dva';
import intl from 'utils/intl';
import _ from 'lodash';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { Header } from 'components/Page';
// import { Button as PermissionButton } from 'components/Permission';
import { DataSet, Button, Spin } from 'choerodon-ui/pro';
import { Steps } from 'choerodon-ui';
import cuxRemote from 'hzero-front/lib/utils/remote';

import { formatDeleteOrAdd, judgeUSCCdoeNull } from '@/utils/utils';
import {
  fetchSavePlanConfig,
  fetchDetailConfig,
} from '@/services/riskScanConfig/schemaConfigService';
import {
  BasicInfoDS,
  ScanSchemeDS,
  HandListDS,
  SelectHandListDS,
  SelectScopeListDS,
  CompanyLovDS,
  TypeSupplierListDS,
} from '../stores/schemaConfigDS';
import BasicComp from './BasicComp';
import ScanObject from './ScanObject';
import ScanProject from './ScanProject';

import styles from './index.less';

const { Step } = Steps;

function EditDetail(props) {
  const { dispatch, match, scanWorkbench = {}, remote } = props;

  const { scanConfigDetail = {} } = scanWorkbench || {};

  const localId = match?.params?.id ?? ''; // 区分第一步是编辑还是新建 id值/add
  const pageType = match?.params?.pageType ?? ''; // 页面编辑状态，edit 编辑，view 查看

  const basicInfoDS = useMemo(() => new DataSet({ ...BasicInfoDS() }), []);
  const scanSchemeDS = useMemo(() => new DataSet({ ...ScanSchemeDS() }), []);
  const handListDS = useMemo(() => new DataSet({ ...HandListDS() }), []);
  const categoryListDS = useMemo(() => new DataSet({ ...HandListDS() }), []);
  const coopSupplierListDS = useMemo(() => new DataSet({ ...HandListDS(), selection: false }), []);
  const outerListDS = useMemo(() => new DataSet({ ...HandListDS() }), []);
  const selectHandListDS = useMemo(
    () =>
      new DataSet(
        remote.process(
          'RISKSCAN_SCHEMA_CONFIG_PROCESS_CODE_SELECTED_HAND_LIST_DS',
          { ...SelectHandListDS() },
          {}
        )
      ),
    []
  );
  const selectScopeListDS = useMemo(() => new DataSet({ ...SelectScopeListDS() }), []);
  const companyLovDS = useMemo(
    () =>
      new DataSet(
        remote.process(
          'RISKSCAN_SCHEMA_CONFIG_PROCESS_CODE_COMPANY_LOV_DS',
          { ...CompanyLovDS() },
          {}
        )
      ),
    []
  );
  const typeSupplierListDS = useMemo(() => new DataSet(TypeSupplierListDS()), []);

  const scanProjectRef = useRef(null);

  const selectDS = useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        forceValidate: true,
        fields: [
          {
            name: 'scope',
            type: 'string',
            label: intl.get('sdat.riskScanConfig.view.title.scope').d('适用范围'),
            lookupCode: 'SDAT.WB2_SCAN_SCOPE_TYPE',
            required: true,
          },
        ],
      }),
    []
  );

  const [current, setCurrent] = useState(0);
  const [autoType, setAutoType] = useState('');
  const [scanType, setScanType] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [selectType, setSelectType] = useState('');

  useEffect(() => {
    if (localId) {
      getDetailData(localId);
    }
    return () => {
      basicInfoDS.data = [];
      basicInfoDS.reset();
      dispatch({
        type: 'scanWorkbench/updateState',
        payload: {
          scanConfigDetail: {},
        },
      });
    };
  }, [localId]);

  const dsMap = {
    SUPPLIER_CATEGORY: categoryListDS,
    COOP_SUPPLIER: coopSupplierListDS,
    MANUAL_SUPPLIER: handListDS,
    PLATFORM_OUTER: outerListDS,
  };

  const getDetailData = async (id) => {
    setLoading(true);
    const res = await fetchDetailConfig({
      riskPlanId: id,
      planContentType: 'basic',
      planType: 'SCAN',
    });
    setLoading(false);

    if (getResponse(res)) {
      const {
        wb2RiskPlanUserList = [],
        autoFlag,
        autoFrequency,
        frequencyValue,
        scanObjectType,
      } = res;

      const chargeList = wb2RiskPlanUserList.length
        ? wb2RiskPlanUserList
            .filter((rcd) => [0, '0'].includes(rcd.userType))
            .map((item) => ({
              ...item,
              id: item.userId,
              realName: item.userName,
              loginName: item.loginName,
            }))
        : [];

      const stakeholderList = wb2RiskPlanUserList.length
        ? wb2RiskPlanUserList
            .filter((rcd) => [1, '1'].includes(rcd.userType))
            .map((item) => ({
              ...item,
              id: item.userId,
              realName: item.userName,
              loginName: item.loginName,
            }))
        : [];

      const yearList = autoFrequency === 'YEAR' ? frequencyValue?.split('|') : [];
      const scanFrequency = autoFrequency !== 'YEAR' ? frequencyValue?.split('|') : [];
      const planNumber = res?.planNumber ?? '';
      basicInfoDS.loadData([
        {
          ...res,
          chargeList,
          stakeholderList,
          scanFrequency,
          yearList,
          planNumber:
            planNumber && planNumber.startsWith('Scan_') ? planNumber.substring(5) : planNumber,
        },
      ]);

      setScanType(autoFrequency);
      setAutoType(autoFlag);
      setSelectType(scanObjectType);
      dispatch({
        type: 'scanWorkbench/updateState',
        payload: {
          scanConfigDetail: { ...res },
        },
      });
      return res;
    }

    return {};
  };

  const handleSelectAutoType = (type) => {
    setAutoType(type);
  };

  const handleSelectScanType = (type) => {
    setScanType(type);
  };

  const validFormIsChange = (step) => {
    if (step === '1') {
      // 校验基础信息是否发生变更
      const obj = basicInfoDS?.toData()[0] || {};
      const {
        chargeList = [],
        stakeholderList = [],
        scanFrequency = [],
        yearList = [],
        planNumber = '',
        planName = '',
        autoFrequency = '',
        autoFlag,
      } = obj || {};

      const wb2RiskPlanUserList = [];
      if (chargeList && chargeList.length) {
        // 负责人
        chargeList.forEach((item) => {
          wb2RiskPlanUserList.push({
            ...item,
            userId: item.id,
            userType: 0,
            tenantId: getCurrentOrganizationId(),
          });
        });
      }

      if (stakeholderList && stakeholderList.length) {
        // 干系人
        stakeholderList.forEach((item) => {
          wb2RiskPlanUserList.push({
            ...item,
            userId: item.id,
            userType: 1,
            tenantId: getCurrentOrganizationId(),
          });
        });
      }

      const planStrategy = '';
      const frequencyStr = scanFrequency && scanFrequency.length ? scanFrequency.join('|') : '';
      const yearStr = yearList && yearList.length ? yearList.join('|') : '';

      const params = {
        planNumber:
          planNumber && planNumber.startsWith('Scan_') ? planNumber : `Scan_${planNumber}`,
        planName: planName || '',
        planStrategy, // 扫描策略
        autoFrequency: autoFrequency || '',
        frequencyValue: autoFrequency === 'YEAR' ? yearStr : frequencyStr,
        autoFlag: String(autoFlag),
      };

      const originDEtail = {
        planNumber: scanConfigDetail.planNumber,
        planName: scanConfigDetail.planName,
        planStrategy: scanConfigDetail.planStrategy, // 扫描策略
        autoFrequency: scanConfigDetail.autoFrequency,
        frequencyValue: scanConfigDetail.frequencyValue,
        autoFlag: String(scanConfigDetail.autoFlag),
      };

      const oldUserList = scanConfigDetail?.wb2RiskPlanUserList
        ?.map((item) => {
          return {
            userId: item.userId,
            userType: item.userType,
            userName: item.userName,
            planUserId: item.planUserId,
            _token: item._token,
          };
        })
        .sort((a, b) => {
          return String(a.userId).localeCompare(String(b.userId));
        });

      const newUserList = wb2RiskPlanUserList
        ?.map((item) => {
          return {
            userId: item.userId,
            userType: item.userType,
            userName: item.userName,
            planUserId: item.planUserId,
            _token: item._token,
          };
        })
        .sort((a, b) => {
          return String(a.userId).localeCompare(String(b.userId));
        });

      // 适用范围
      const newScopeValue = selectDS?.current?.get('scope') ?? '';
      const oldScopeValue = scanConfigDetail?.scanScopeType ?? '';
      const { wb2RiskPlanScopePage = {} } = scanConfigDetail || {};
      const { content = [] } = wb2RiskPlanScopePage || {};

      const oldWb2RiskPlanScopeList = (content ?? [])
        ?.map((item) => {
          return {
            scopeObjectId: item.scopeObjectId,
            scanScopeType: item.scanScopeType,
            tenantId: item.tenantId,
            socialCode: item.socialCode,
          };
        })
        .sort((a, b) => {
          return a.scopeObjectId - b.scopeObjectId;
        });

      const newWb2RiskPlanScopeList =
        newScopeValue === 'GROUP'
          ? []
          : (selectScopeListDS?.toData() ?? [])
              ?.map((item) => {
                return {
                  scopeObjectId: item.scopeObjectId,
                  scanScopeType: newScopeValue,
                  socialCode: item.socialCode,
                  tenantId: getCurrentOrganizationId(),
                };
              })
              .sort((a, b) => {
                return a.scopeObjectId - b.scopeObjectId;
              });

      return !(
        newScopeValue &&
        oldScopeValue &&
        _.isEqual(newScopeValue, oldScopeValue) &&
        _.isEqual(oldWb2RiskPlanScopeList, newWb2RiskPlanScopeList) &&
        _.isEqual(params, originDEtail) &&
        _.isEqual(oldUserList, newUserList)
      );
    } else if (step === '2') {
      const oldScanObjectType = scanConfigDetail?.scanObjectType ?? '';
      const { wb2RiskPlanObjectPage = {} } = scanConfigDetail || {};
      const { content = [] } = wb2RiskPlanObjectPage || {};

      const oldWb2RiskPlanObjectList = (content || [])
        .map((item) => {
          return {
            scanObjectId: item.scanObjectId,
            supplierCode: item.supplierCode,
            supplierName: item.supplierName,
            categoryCode: item.categoryCode,
            categoryName: item.categoryName,
            companyName: item.companyName,
            scanObjectType: item.scanObjectType,
            socialCode: item.socialCode,
            tenantId: item.tenantId,
          };
        })
        .sort((a, b) => {
          return a.scanObjectId - b.scanObjectId;
        });

      const newScanObjectType = scanSchemeDS.current?.get('scanObjectType') ?? '';

      const objectList = getScanTypeDataList(newScanObjectType, true);
      const newWb2RiskPlanObjectList = objectList
        .map((item) => ({ ...item }))
        .sort((a, b) => {
          return a.scanObjectId - b.scanObjectId;
        });

      return !(
        _.isEqual(oldScanObjectType, newScanObjectType) &&
        _.isEqual(oldWb2RiskPlanObjectList, newWb2RiskPlanObjectList) &&
        newWb2RiskPlanObjectList.length
      );
    }

    return false;
  };

  const handleChangeSteps = async (type) => {
    if (type === 'next') {
      if (current === 0) {
        if (pageType === 'view') {
          setCurrent(current + 1);
          return true;
        }

        const isChange = validFormIsChange('1');
        if (isChange) {
          const res = await handleSaveStepOne();
          if (getResponse(res)) {
            setScanType(res?.autoFrequency);
            setCurrent(current + 1);
          }
        } else {
          setCurrent(current + 1);
        }
      }

      if (current === 1) {
        if (pageType === 'view') {
          setCurrent(current + 1);
          return true;
        }

        const isChange = validFormIsChange('2');

        if (isChange) {
          const res = await handleSaveStepTwo('next');
          if (getResponse(res)) {
            setCurrent(current + 1);
          }
        } else {
          setCurrent(current + 1);
        }
      }
    } else {
      setCurrent(current - 1);
    }
  };

  /**
   * 保存操作
   */
  const handleSave = async () => {
    if (current === 0) {
      // 保存第一步
      const res = await handleSaveStepOne();
      return res;
    }

    if (current === 1) {
      // 保存第二步
      const res = [0, '0'].includes(autoType)
        ? await handleSaveStepThree()
        : await handleSaveStepTwo();
      return res;
    }

    if (current === 2) {
      // 保存第三步
      const res = await handleSaveStepThree();
      return res;
    }
  };

  const handleSaveStepOne = async () => {
    // const { wb2RiskPlanUserList = [] } = scanConfigDetail || {};
    const isValid = await basicInfoDS.validate();

    if (isValid) {
      const obj = basicInfoDS?.toData()[0] || {};
      const {
        chargeList = [],
        stakeholderList = [],
        scanFrequency = [],
        yearList = [],
        planNumber = '',
        planName = '',
        autoFrequency = '',
        autoFlag,
        planCompanyType = '',
        _tls = null,
        notifyFlag = '',
      } = obj || {};

      const newChargeList = [];
      const newStakeholderList = [];
      const originUserList = scanConfigDetail?.wb2RiskPlanUserList ?? []; // 接口返回的原始数据

      if (chargeList && chargeList.length) {
        // 负责人
        chargeList.forEach((item) => {
          const filterList = newChargeList.length
            ? newChargeList?.filter((rcd) => rcd.userId === item.id && rcd.userType == 0)
            : [];

          if (!filterList.length) {
            newChargeList.push({
              userId: item.id,
              userType: 0,
              tenantId: getCurrentOrganizationId(),
            });
          }
        });
      }

      const originChargeUserList = originUserList.filter((item) => item.userType == 0);
      const formatChargeList = formatDeleteOrAdd(originChargeUserList, newChargeList);

      if (stakeholderList && stakeholderList.length) {
        // 干系人
        stakeholderList.forEach((item) => {
          const filterList = newStakeholderList.length
            ? newStakeholderList?.filter((rcd) => rcd.userId === item.id && rcd.userType == 1)
            : [];
          if (!filterList.length) {
            newStakeholderList.push({
              userId: item.id,
              userType: 1,
              tenantId: getCurrentOrganizationId(),
            });
          }
        });
      }

      const originStakeholderUserList = originUserList.filter((item) => item.userType == 1);
      const formatStakeholderList = formatDeleteOrAdd(
        originStakeholderUserList,
        newStakeholderList
      );

      let companyList = [];
      let scopeValue = '';
      const wb2RiskPlanScopeList = [];

      // 适用范围
      const isValid2 = await selectDS.validate();
      // 自动
      if (!isValid2) return false;

      scopeValue = selectDS?.current?.get('scope') ?? '';
      if (scopeValue === 'COMPANY') {
        // 公司级
        companyList = (selectScopeListDS?.toData() ?? [])
          // ?.filter((item) => !item.planScopeId)
          .map((item) => {
            return {
              scopeObjectId: item.scopeObjectId,
              scanScopeType: scopeValue,
              socialCode: item.socialCode,
              tenantId: getCurrentOrganizationId(),
              planScopeId: item.planScopeId || '',
            };
          });
        if (!companyList.length) {
          notification.error({
            message: intl.get('sdat.riskScanConfig.view.message.needCompany').d('公司列表不能为空'),
          });
          return false;
        }
      }

      const realList = companyList.length ? companyList.filter((item) => !item.planScopeId) : [];
      if (realList && realList.length) {
        realList.forEach((item) => {
          wb2RiskPlanScopeList.push({
            scopeObjectId: item.scopeObjectId,
            socialCode: item.socialCode,
            scanScopeType: 'COMPANY',
            tenantId: getCurrentOrganizationId(),
          });
        });
      }

      const planStrategy = '';
      const frequencyStr = scanFrequency && scanFrequency.length ? scanFrequency.join('|') : '';
      const yearStr = yearList && yearList.length ? yearList.join('|') : '';

      const params = {
        planNumber:
          planNumber && planNumber.startsWith('Scan_')
            ? planNumber
            : planNumber
            ? `Scan_${planNumber}`
            : '',
        planName: planName || '',
        planStrategy, // 扫描策略
        autoFrequency: autoFrequency || '',
        frequencyValue: autoFrequency === 'YEAR' ? yearStr : frequencyStr,
        enabledFlag: 0,
        autoFlag,
        scanObjectType: [0, '0'].includes(autoFlag) ? '' : scanConfigDetail.scanObjectType,

        _tls: _tls || {
          planName: {
            en_US: planName,
            ja_JP: planName,
            zh_CN: planName,
            zh_TW: planName,
          },
        },
        wb2RiskPlanUserList: [...formatChargeList, ...formatStakeholderList],
        wb2RiskPlanScopeList,
        planCompanyType,
        notifyFlag,
        tenantId: getCurrentOrganizationId(),
      };
      const res = await fetchSavePlanConfig({
        ...scanConfigDetail,
        ...params,
        scanScopeType: scopeValue,
        planContentType: 'basic',
        planType: 'SCAN',
        code: '',
        message: '',
      });
      if (getResponse(res)) {
        scanSchemeDS.loadData([]);
        dispatch({
          type: 'scanWorkbench/updateState',
          payload: {
            scanConfigDetail: { ...res },
          },
        });
        getDetailData(res?.riskPlanId);
        if (res?.scanScopeType === 'COMPANY') {
          selectScopeListDS.setQueryParameter('riskPlanId', res?.riskPlanId);
          selectScopeListDS.setQueryParameter('scanScopeType', res?.scanScopeType);
          selectScopeListDS.setQueryParameter('planContentType', 'basic');
          selectScopeListDS.setQueryParameter('planType', 'SCAN');
          selectScopeListDS.query();
        }
        return res;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  const getScanTypeDataList = (type, checkField = false) => {
    const ds = dsMap[type];
    const list = ds?.toData() ?? [];
    const rtnList =
      list?.map((item) => {
        return checkField
          ? {
              scanObjectId: item.scanObjectId,
              supplierCode: item.supplierCode,
              supplierName: item.supplierName,
              categoryCode: item.categoryCode,
              categoryName: item.categoryName,
              companyName: item.companyName,
              socialCode: item.socialCode,
              scanObjectType: type,
              tenantId: item.tenantId,
            }
          : {
              ...item,
              scanObjectId: item.scanObjectId,
              supplierCode: item.supplierCode,
              supplierName: item.supplierName,
              categoryCode: item.categoryCode,
              categoryName: item.categoryName,
              companyName: item.companyName,
              socialCode: item.socialCode,
              scanObjectType: type,
              tenantId: item.tenantId,
            };
      }) ?? [];

    return rtnList;
  };

  const handleSaveStepTwo = async (flag = '') => {
    const obj = basicInfoDS?.toData()[0] || {};
    const {
      planNumber = '',
      planName = '',
      autoFrequency = '',
      planCompanyType = '',
      _tls = {},
      notifyFlag = '',
    } = obj || {};

    const params = {
      planNumber:
        planNumber && planNumber.startsWith('Scan_')
          ? planNumber
          : planNumber
          ? `Scan_${planNumber}`
          : '',
      planName,
      autoFrequency,
      planCompanyType,
      notifyFlag,
      _tls,
    };

    let wb2RiskPlanObjectList = [];
    let scanObjectType = '';

    const isValid = await scanSchemeDS.validate();

    if (isValid) {
      scanObjectType = scanSchemeDS.current?.get('scanObjectType') ?? '';
      wb2RiskPlanObjectList =
        scanObjectType === 'COOP_SUPPLIER' ? [] : getScanTypeDataList(scanObjectType, false);

      if (
        scanObjectType !== 'COOP_SUPPLIER' &&
        !(wb2RiskPlanObjectList && wb2RiskPlanObjectList.length)
      ) {
        notification.error({
          message: intl
            .get('sdat.riskScanConfig.view.message.needSupplier')
            .d('供应商列表不能为空'),
        });
        return false;
      }
    } else {
      return false;
    }

    const wb2RiskPlanScopeList = [];

    const res = await fetchSavePlanConfig({
      ...scanConfigDetail,
      ...params,
      scanObjectType,
      wb2RiskPlanScopeList,
      wb2RiskPlanObjectList:
        scanObjectType === 'COOP_SUPPLIER'
          ? []
          : wb2RiskPlanObjectList?.filter((item) => !item.planObjectId) ?? [],
      planContentType: 'object',
      planType: 'SCAN',
      code: '',
      message: '',
    });
    if (getResponse(res)) {
      const { riskPlanId, planObjectNameList } = res;
      if (planObjectNameList && judgeUSCCdoeNull(planObjectNameList.length)) {
        return false;
      }
      dispatch({
        type: 'scanWorkbench/updateState',
        payload: {
          scanConfigDetail: { ...res },
        },
      });
      if (!flag) {
        scanSchemeDS.loadData([
          {
            scanObjectType,
          },
        ]);

        dsMap[selectType].setQueryParameter('riskPlanId', riskPlanId);
        dsMap[selectType].setQueryParameter('scanObjectType', scanObjectType);
        dsMap[selectType].setQueryParameter('planContentType', 'object');
        dsMap[selectType].setQueryParameter('planType', 'SCAN');
        dsMap[selectType].query();
      }
      getDetailData(res?.riskPlanId);
      return res;
    } else {
      return false;
    }
  };

  const handleSaveStepThree = async () => {
    if (scanProjectRef && scanProjectRef.current) {
      const { handleSave: saveStep3 } = scanProjectRef.current;
      if (saveStep3) {
        return saveStep3();
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  const handleCallBackToSave = async () => {
    const res = await handleSaveStepTwo();
    return res;
  };

  const { autoFlag } = scanConfigDetail || {};

  const title =
    pageType === 'view'
      ? intl.get('sdat.riskScanConfig.view.title.viewConfig').d('查看风险扫描方案')
      : intl.get('sdat.riskScanConfig.view.title.editConfig').d('编辑风险扫描方案');

  return (
    <Spin spinning={loading}>
      <div className={styles['risk-scan-schema-config-detail-basic']}>
        <Header title={title} backPath="/sdat/risk-workbench-new/scheme-config/list">
          {current === 0 || (current === 1 && [1, '1'].includes(autoType)) ? (
            <Button
              icon="recover"
              color="primary"
              disabled={loading || fetching}
              onClick={() => handleChangeSteps('next')}
            >
              {intl.get('hzero.common.button.next').d('下一步')}
            </Button>
          ) : null}

          {pageType !== 'view' ? (
            <>
              {current >= 2 ? (
                <Button
                  icon="save"
                  color="primary"
                  disabled={loading || fetching}
                  onClick={handleSave}
                  style={{ border: 'none' }}
                >
                  {intl.get('hzero.common.button.save').d('保存')}
                </Button>
              ) : (
                <Button
                  icon="save"
                  funcType="flat"
                  disabled={loading || fetching}
                  onClick={handleSave}
                  style={{ border: 'none' }}
                >
                  {intl.get('hzero.common.button.save').d('保存')}
                </Button>
              )}
            </>
          ) : null}

          {current > 0 && pageType !== 'view' ? (
            <Button icon="reply" funcType="flat" onClick={() => handleChangeSteps('previous')}>
              {intl.get('hzero.common.button.previous').d('上一步')}
            </Button>
          ) : null}
        </Header>
        <div
          className={styles['risk-scan-config-edit-detail-basic']}
          style={remote.process(
            'RISKSCAN_SCHEMA_CONFIG_PROCESS_DETAIL_BASIC_STYLE',
            {
              height:
                current === 2
                  ? [1, '1'].includes(autoFlag)
                    ? 'calc(100vh - 276px)'
                    : 'calc(100vh - 282px)'
                  : 'calc(100vh - 152px)',
            },
            { autoFlag, current }
          )}
        >
          <div className={styles['risk-scan-config-edit-detail-steps']}>
            <Steps size="small" current={current}>
              <Step title={intl.get('sdat.riskScanConfig.view.title.basicInfo').d('基础信息')} />
              {[0, '0'].includes(autoType) ? null : (
                <Step title={intl.get('sdat.riskScanConfig.view.title.scanObject').d('扫描对象')} />
              )}
              <Step title={intl.get('sdat.riskScanConfig.view.title.scanProject').d('扫描项目')} />
            </Steps>
          </div>

          {current === 0 && (
            <BasicComp
              localId={localId}
              remote={remote}
              basicInfoDS={basicInfoDS}
              defaultAutoType={autoType}
              defaultScanType={scanType}
              onSelectType={handleSelectAutoType}
              onSelectScanType={handleSelectScanType}
              dispatch={dispatch}
              scanWorkbench={scanWorkbench}
              selectScopeListDS={selectScopeListDS}
              companyLovDS={companyLovDS}
              selectDS={selectDS}
              onFetch={(e) => setFetching(e)}
              onCallBackToSave={handleCallBackToSave}
            />
          )}

          {current === 1 && (
            <>
              {[0, '0'].includes(autoType) ? (
                <ScanProject
                  ref={scanProjectRef}
                  remote={remote}
                  localId={localId}
                  dispatch={dispatch}
                  scanWorkbench={scanWorkbench}
                  onFetch={(e) => setFetching(e)}
                />
              ) : (
                <ScanObject
                  localId={localId}
                  remote={remote}
                  dispatch={dispatch}
                  scanWorkbench={scanWorkbench}
                  scanSchemeDS={scanSchemeDS}
                  handListDS={handListDS}
                  categoryListDS={categoryListDS}
                  coopSupplierListDS={coopSupplierListDS}
                  outerListDS={outerListDS}
                  selectHandListDS={selectHandListDS}
                  typeSupplierListDS={typeSupplierListDS}
                  selectType={selectType}
                  setSelectType={setSelectType}
                  onFetch={(e) => setFetching(e)}
                  onCallBackToSave={handleCallBackToSave}
                />
              )}
            </>
          )}

          {current === 2 && (
            <ScanProject
              ref={scanProjectRef}
              remote={remote}
              localId={localId}
              dispatch={dispatch}
              scanWorkbench={scanWorkbench}
              onFetch={(e) => setFetching(e)}
            />
          )}
        </div>
      </div>
    </Spin>
  );
}

export default connect((state) => state)(
  cuxRemote({
    code: 'SDAT_RISK_WORKPLACE_RISKSCAN_SCHEMA_CONFIG',
    name: 'remote',
  })(
    formatterCollections({
      code: ['sdat.riskScanConfig', 'sdat.common'],
    })(EditDetail)
  )
);

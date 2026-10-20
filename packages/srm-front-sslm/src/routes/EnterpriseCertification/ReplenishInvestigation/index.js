/*
 * Index - 补充调查表
 * @Date: 2022-06-16 09:57:53
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import querystring from 'querystring';
import React, { Fragment, useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { Button } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import Investigation from '@/routes/components/Investigation';
import { saveData, queryButtonPermissions } from '@/services/investigationService';
import { fetchUserDetail, queryCompanyBasic } from '@/services/enterpriseCertificationService';
import { handlePrint } from '@/services/supplierInvestWorkbenchService';

import ValidationSteps from '../components/ValidationSteps';
import styles from '../index.less';

const addPermissionCodeList = [
  'srm.partner.supplier-investigation-workbench.api.ps.insert',
  'srm.partner.investigation-po.investigatation-write.ps.attachment.add',
];

const deletePermissionCodeList = [
  'srm.partner.supplier-investigation-workbench.api.ps.delete',
  'srm.partner.investigation-po.investigatation-write.ps.attachment.delete',
];

const Index = ({
  location,
  history,
  stepsObj = {},
  remoteHiddenTips = false,
  stepsObj: { country, domesticForeignRelation, companyName, secondaryTabConfig } = {},
  enterpriseCertificationRemote,
}) => {
  const routerParams = useMemo(() => querystring.parse(location.search.substr(1)), [location]);
  const { investgHeaderId, investigateTemplateId, organizationId, changeReqId } = routerParams;
  const [spinning, setSpinning] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [companyBasic, setCompanyBasic] = useState({});
  const [buttonPermissions, setButtonPermissions] = useState({});
  const investigRef = useRef(null);
  const defaultCountry = domesticForeignRelation ? country : null;

  useEffect(() => {
    handleUserInfo();
    handleCompanyBasic();
    handleQueryButtonPermission();
  }, []);

  // 认证的时候，取不到对应角色的按钮权限，所以自己去实现按钮权限查询
  const handleQueryButtonPermission = useCallback(() => {
    const permissionsCode = [...addPermissionCodeList, ...deletePermissionCodeList];
    queryButtonPermissions(permissionsCode).then(res => {
      if (getResponse(res)) {
        const addPermission =
          res.filter(i => addPermissionCodeList.includes(i.code)).find(i => i.approve) || {};
        const deletePermission =
          res.filter(i => deletePermissionCodeList.includes(i.code)).find(i => i.approve) || {};
        setButtonPermissions({
          addPermission: addPermission.approve,
          deletePermission: deletePermission.approve,
        });
      }
    });
  }, []);

  // 查询当前用户信息
  const handleUserInfo = useCallback(() => {
    setSpinning(true);
    fetchUserDetail()
      .then(res => {
        if (getResponse(res)) {
          setUserInfo(res);
        }
      })
      .finally(() => {
        setSpinning(false);
      });
  }, []);

  // 查询主要信息中的登记信息-用于调查表地址信息新建行时的默认国家地区
  const handleCompanyBasic = () => {
    const payload = {
      changeReqId,
      dataSource: 4,
    };
    queryCompanyBasic(payload).then(response => {
      const res = getResponse(response);
      if (res) {
        setCompanyBasic(res);
      }
    });
  };

  // 保存
  const handleSave = useCallback(
    async (nextFlag = false) => {
      if (investigRef.current) {
        const saveParams = nextFlag
          ? await investigRef.current.handleSaveParams()
          : await investigRef.current.handleSaveParamsWithoutValidate();
        if (saveParams) {
          setSpinning(true);
          const payload = {
            ...saveParams,
            checkFlag: nextFlag ? 1 : 0,
          };
          return saveData(payload, investgHeaderId)
            .then(async response => {
              const res = getResponse(response);
              if (res) {
                notification.success();
                if (nextFlag) {
                  // 预览页
                  history.push({
                    pathname: `/sslm/enterprise-certification/preview`,
                    search: querystring.stringify({
                      changeReqId,
                      domesticForeignRelation,
                      source: 'investigation',
                    }),
                  });
                } else {
                  await investigRef.current.handleQuery();
                }
              }
            })
            .finally(() => {
              setSpinning(false);
            });
        }
      }
    },
    [investgHeaderId]
  );

  // 下一步
  const handleNext = useCallback(async () => {
    return handleSave(true);
  }, [investgHeaderId]);

  // 上一步
  const handleLastStep = useCallback(() => {
    if (isEmpty(secondaryTabConfig)) {
      history.push({
        pathname: '/sslm/enterprise-certification/main-info',
        search: querystring.stringify({
          changeReqId,
          domesticForeignRelation,
        }),
      });
    } else {
      history.push({
        pathname: '/sslm/enterprise-certification/secondary-info',
        search: querystring.stringify({
          changeReqId,
        }),
      });
    }
  }, []);

  const handlePrintPDF = async () => {
    setSpinning(true);
    const payload = {
      investgHeaderId,
      tenantId: organizationId,
    };
    return handlePrint(payload)
      .then(res => {
        if (res) {
          if (res.type.indexOf('application/json') > -1) {
            notification.warning({
              description: intl
                .get(`sslm.common.view.printwarning.noTemplate`)
                .d('未设置打印模板，不可打印'),
            });
            return;
          }
          const file = new Blob([res], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);
          const printWindow = window.open(fileURL);
          if (printWindow) {
            printWindow.print();
          }
        }
      })
      .finally(() => {
        setSpinning(false);
      });
  };

  const getOtherRemoteParams = () => {
    const result = {
      type: 'certificationInvestg',
      otherProps: { companyBasic },
    };
    return result;
  };

  return (
    <Fragment>
      <Header
        title={intl
          .get('spfm.enterpriseCertification.view.title.enterpriseCertification')
          .d('企业认证')}
      >
        <Button
          icon="arrow_forward"
          color="primary"
          type="primary"
          onClick={handleNext}
          loading={spinning}
          wait={200}
          waitType="debounce"
        >
          {intl.get('sslm.common.view.btn.nextStep').d('下一步')}
        </Button>
        <Button
          icon="arrow_back"
          funcType="flat"
          loading={spinning}
          onClick={handleLastStep}
          wait={200}
          waitType="debounce"
        >
          {intl.get('sslm.common.view.btn.lastStep').d('上一步')}
        </Button>
        <Button
          icon="save"
          funcType="flat"
          loading={spinning}
          onClick={() => handleSave(false)}
          wait={200}
          waitType="debounce"
        >
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
        <Button
          icon="print-o"
          funcType="flat"
          loading={spinning}
          onClick={() => handlePrintPDF()}
          wait={200}
          waitType="debounce"
        >
          {intl.get('hzero.common.button.print').d('打印')}
        </Button>
      </Header>
      <ValidationSteps location={location} stepsObj={stepsObj} />
      <Content wrapperClassName={styles['investigation-index-content']}>
        <Investigation
          editable
          ref={investigRef}
          investgHeaderId={investgHeaderId}
          investigateTemplateId={investigateTemplateId}
          organizationId={organizationId}
          changeReqId={changeReqId}
          defaultCountry={defaultCountry}
          userInfo={userInfo}
          source="certification"
          investigateSource="certification"
          remoteHiddenTips={remoteHiddenTips}
          defaultBankCompanyName={companyName}
          tableStyle={{ maxHeight: 'calc(100vh - 400px)' }}
          buttonPermissions={buttonPermissions}
          investgRemote={enterpriseCertificationRemote}
          otherRemoteProps={getOtherRemoteParams()}
        />
      </Content>
    </Fragment>
  );
};

export default Index;

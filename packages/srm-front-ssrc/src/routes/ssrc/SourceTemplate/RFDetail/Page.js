import React, { Fragment, useContext, useMemo, useEffect, useState } from 'react';
import { Button, Modal, Spin } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { isEmpty } from 'lodash';

import { Header } from 'components/Page';
import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId, getCurrentTenant } from 'utils/utils';
import notification from 'utils/notification';

import { saveRFTemplate, releaseCheck, checkConfirm } from '@/services/sourceTemplateService';
import { fetchConfigSheet } from '@/services/inquiryHallService';
import Store from './store/index';
import BasicInfo from './CardManage/BasicInfo';
import ProcessSetting from './CardManage/ProcessSetting';
import BusinessDefaultSetting from './CardManage/BusinessDefaultSetting';
import Rule from './CardManage/Rule';
import Card from '../rfComponents/Card';
import styles from '../rfComponents/common.less';

const Index = () => {
  const {
    commonDs: { basicFormDs, ruleFormDs },
    commonCode: { customizeUnitCode },
    storeData: { isCreate },
    routerParams: { isHistory = false, versionNumber, type = '' },
    history,
  } = useContext(Store);

  // 页面loading
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    queryNewScoreSheetConfig();
  }, []);

  // 查询新分值法配置表
  const queryNewScoreSheetConfig = async () => {
    let data = null;

    try {
      data = await fetchConfigSheet({
        configCode: 'ssrc_new_score_type_config',
        organizationId: getCurrentOrganizationId(),
        data: {
          tenant: getCurrentTenant().tenantNum,
        },
      });
      data = getResponse(data);
      if (isEmpty(data)) {
        // 新建时 设置默认值为新分值法
        if (isCreate) {
          // eslint-disable-next-line no-unused-expressions
          ruleFormDs?.current?.set('scoreType', 'SCORE_NEW');
        }
        // eslint-disable-next-line no-unused-expressions
        ruleFormDs?.setState('newScoreFlag', true);
      }
    } catch (e) {
      throw e;
    }
  };

  // 校验数据
  const validatePageData = () => {
    const list = [ruleFormDs.validate(), basicFormDs.validate()];
    return Promise.all(list).then((res) => {
      return res?.every((i) => i);
    });
  };

  // 保存
  const handleSave = async () => {
    setPageLoading(true);
    try {
      await validatePageData();
    } catch (e) {
      setPageLoading(false);
      throw e;
    }

    const params = {
      customizeUnitCode: customizeUnitCode.current,
      rfTemplate: basicFormDs.current?.toData(),
      rfTemplateRule: ruleFormDs.current?.toData(),
    };
    return saveRFTemplate(params)
      .then((res) => {
        const result = getResponse(res);
        if (result && !result.failed) {
          notification.success();
          if (isCreate) {
            history.push({
              pathname: `/ssrc/source-template/rf-update/${result.templateId}`,
            });
          } else {
            Promise.all([basicFormDs.query(), ruleFormDs.query()]).finally(() => {
              setPageLoading(false);
            });
          }
          return result;
        }
        setPageLoading(false);
      })
      .catch(() => setPageLoading(false));
  };

  const submitSuccessCallBack = () => {
    history.push({
      pathname: '/ssrc/source-template/list',
    });
  };

  // 第二步
  const onOk = () => {
    const checkParams = {
      customizeUnitCode: customizeUnitCode.current,
      rfTemplate: basicFormDs.current?.toData(),
      rfTemplateRule: ruleFormDs.current?.toData(),
      confirmFlag: 1,
    };
    setPageLoading(true);
    return checkConfirm(checkParams)
      .then((res) => {
        const result = getResponse(res);
        if (result && !result.failed) {
          notification.success();
          submitSuccessCallBack();
        }
      })
      .finally(() => setPageLoading(false));
  };

  // 发布
  const handleRelease = async () => {
    let flag = true;
    try {
      setPageLoading(true);
      flag = await validatePageData();
    } catch (err) {
      setPageLoading(false);
      throw err;
    }

    if (!flag) {
      notification.warning({
        message: intl
          .get('ssrc.rfTemplate.view.rfCheck.inputSubmitRfCheck')
          .d('提交前请填写完整相关信息'),
      });
      setPageLoading(false);
      return;
    }

    const params = {
      customizeUnitCode: customizeUnitCode.current,
      rfTemplate: basicFormDs.current?.toData(),
      rfTemplateRule: ruleFormDs.current?.toData(),
    };

    // 第一步
    return releaseCheck(params)
      .then((res) => {
        const result = getResponse(res);
        if (result && !result.failed) {
          // 校验通过
          if (result?.body === true) {
            notification.success();
            submitSuccessCallBack();
          } else if (result?.highestValidatorType === 'ERROR') {
            // 校验失败
            const { validateResults = [] } = result;

            const description = validateResults?.map?.((i, index) => {
              return <div>{`${index + 1}、${i.message}`}</div>;
            });

            notification.error({
              message: intl
                .get('ssrc.rfTemplate.view.title.errorInfo')
                .d('提交失败，以下内容验证不通过'),
              description,
              duration: null,
            });
          } else if (result?.highestValidatorType === 'WARNING') {
            // 校验警告
            const { validateResults = [] } = result;

            const description = validateResults?.map?.((i, index) => {
              return <div>{`${index + 1}、${i.message}`}</div>;
            });

            Modal.confirm({
              title: intl
                .get('ssrc.rfTemplate.view.title.warningInfo')
                .d('以下验证未通过，确认发布吗？'),
              children: description,
              onOk: () => onOk(),
              onCancel: () => {},
            });
          }
        }
      })
      .finally(() => setPageLoading(false));
  };

  const getBackPath = useMemo(() => `/ssrc/source-template/list`, []);

  // 渲染标题
  const Title = observer(({ ds }) => {
    const { current = {} } = ds || {};
    const title = current?.get?.('templateNum') ? `-${current?.get?.('templateNum')}` : '';
    const version =
      type === 'view'
        ? ''
        : isHistory
        ? `-${intl
            .get(`ssrc.rfTemplate.model.template.versionNumberAndVar`, { versionNumber })
            .d(`版本${versionNumber}`)}`
        : '';
    return (
      intl.get('ssrc.rfTemplate.view.card.title.rfTemplateTitle').d('征询模板') + title + version
    );
  });

  return (
    <Fragment>
      <Header title={<Title ds={basicFormDs} />} backPath={getBackPath}>
        {isHistory ? null : (
          <Fragment>
            <Button
              icon="publish2"
              color="primary"
              wait={1200}
              onClick={handleRelease}
              loading={pageLoading}
            >
              {intl.get('hzero.common.button.release').d('发布')}
            </Button>
            <Button
              icon="save"
              onClick={handleSave}
              wait={1200}
              funcType="flat"
              loading={pageLoading}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          </Fragment>
        )}
      </Header>
      <div className={styles['rf-page-content-wrapper']}>
        <Spin dataSet={basicFormDs} spinning={pageLoading}>
          <div className="rf-page-content">
            <Card
              title={intl.get('ssrc.rfTemplate.view.card.title.basicInfos').d('基本信息')}
              component={<BasicInfo />}
            />
            <Card
              title={intl.get('ssrc.rfTemplate.view.card.title.processNodeSet').d('流程节点设置')}
              component={<ProcessSetting />}
            />
            <Card
              title={intl.get('ssrc.rfTemplate.view.card.title.ruleSetting').d('规则设置')}
              component={<Rule />}
            />
            <Card
              title={intl
                .get('ssrc.rfTemplate.view.card.title.businessDefaultSetting')
                .d('业务默认值设置')}
              component={<BusinessDefaultSetting />}
            />
          </div>
        </Spin>
      </div>
    </Fragment>
  );
};

export default Index;

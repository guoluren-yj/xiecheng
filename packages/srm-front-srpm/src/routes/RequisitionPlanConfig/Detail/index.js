import React, { Fragment, useState, useEffect, useMemo } from 'react'; // useEffect
import { compose, isArray } from 'lodash';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { observer } from 'mobx-react-lite';
import queryString from 'querystring';
import { Header } from 'components/Page';
import { useDataSet, Tabs, Dropdown, Menu, Icon, Spin } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { Button } from 'components/Permission';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import { getResponse } from 'utils/utils';
// import withProps from 'utils/withProps';
import { dateTimeRender } from 'hzero-front/lib/utils/renderer'; // 日期时间格式化

import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  baseInfoDS,
  splitHeaderDS,
  mergeHeaderDS,
  balanceHeaderDS,
  splitLineDS,
  mergeLineDS,
} from '../stores/indexDS';
import BaseInfo from './BaseInfo';
import RuleConfig from './RuleConfig';

import {
  fetchContainer,
  saveContainer,
  releaseContainer,
  fetchContainerHistory,
} from '@/services/RequisitionPlanConfigServices';

import styles from '../index.less';

const { TabPane } = Tabs;

const Index = ({ dispatch, match, location }) => {
  const [containerId, setContainerId] = useState(match.params?.id);
  const [validateListFlag, setValidateList] = useState({});
  const params = queryString.parse(location.search.substr(1)) || {};
  const { back } = params;
  const [containerName, setContainerName] = useState(
    intl.get(`srpm.common.model.common.version`).d('版本')
  );

  const baseInfoDs = useDataSet(() => baseInfoDS({ containerId }), [containerId]);
  const splitInfoDs = useDataSet(() => splitHeaderDS({ containerId }), [containerId]);
  const splitlineDs = useDataSet(() => splitLineDS({ containerId }), [containerId]);
  const mergeInfoDs = useDataSet(() => mergeHeaderDS({ containerId }), [containerId]);
  const balanceInfoDS = useDataSet(() => balanceHeaderDS({ containerId }), [containerId]);
  const mergelineDs = useDataSet(() => mergeLineDS({ containerId }), [containerId]);

  const [headInfo, setHeadInfo] = useState({});
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (containerId && containerId !== 'new') {
      commonUpdate(containerId);
    } else {
      setValidateList({ ruleConfig: 'gray', baseInfo: 'gray' });
    }
  }, [containerId]);

  //
  const getHistoryList = (curContainerId) => {
    fetchContainerHistory(curContainerId).then((res) => {
      if (getResponse(res)) {
        setHistoryList(res);
      } else {
        setHistoryList([]);
      }
    });
  };

  // update头行信息
  const commonUpdate = (curContainerId) => {
    setLoading(true);
    fetchContainer(curContainerId)
      .then(async (res) => {
        if (getResponse(res)) {
          setContainerName(res.containerName);
          setHeadInfo(res);
          const {
            splitNode,
            splitMode,
            splitQuantityControlRule,
            mergeQuantityControlRule,
            balanceQuantityControlRule,
            ...other
          } = res;
          baseInfoDs.loadData([
            {
              ...other,
            },
          ]);
          splitInfoDs.loadData([
            {
              splitNode,
              splitMode,
              splitQuantityControlRule,
            },
          ]);

          mergeInfoDs.loadData([
            {
              mergeQuantityControlRule,
            },
          ]);

          balanceInfoDS.loadData([
            {
              balanceQuantityControlRule,
            },
          ]);

          const baseInfo = await getBaseInfo();
          const ruleInfo = await getRuleConfigInfo();

          setValidateList({
            ruleConfig: isArray(ruleInfo) ? 'red' : 'green',
            baseInfo: isArray(baseInfo) ? 'red' : 'green',
          });

          await splitlineDs.query();
          await mergelineDs.query();
          if (res.containerStatus === 'PUBLISHED') {
            getHistoryList(containerId);
          }
        }
      })
      .finally(() => {
        setTimeout(() => {
          setLoading(false);
        }, 100);
      });
  };

  const handleRelease = async () => {
    if (
      headInfo.containerStatus === 'PUBLISHED' &&
      !(
        baseInfoDs.dirty ||
        splitInfoDs.dirty ||
        mergeInfoDs.dirty ||
        balanceInfoDS.dirty ||
        splitlineDs.dirty ||
        mergelineDs.dirty
      )
    ) {
      notification.error({
        message: intl
          .get('srpm.common.view.message.dontReleaseAgain')
          .d('信息没有更改，不可以再发布'),
      });
      return;
    }

    const allInfo = await getAllInfo();

    if (allInfo) {
      setLoading(true);
      const res = getResponse(await releaseContainer({ ...allInfo, releaseFlag: 1 }));
      if (res) {
        notification.success();
        dispatch(
          routerRedux.push({
            pathname: `/srpm/requisition-plan-config/list`,
          })
        );
        // commonUpdate(containerId);
      } else {
        setLoading(false);
      }
    }
  };

  const getBaseInfo = async () => {
    const errorMessage = [];
    const baseFlag = await baseInfoDs.validate();

    if (baseFlag) {
      return {
        ...baseInfoDs.toJSONData()[0],
      };
    } else {
      errorMessage.push(intl.get('srpm.common.title.baseInfo').d('基本信息'));
      return errorMessage;
    }
  };

  const getRuleConfigInfo = async () => {
    const errorMessage = [];
    const splitInfoFlag = await splitInfoDs.validate();
    const splitlineFlag = await splitlineDs.validate();
    const mergeInfoFlag = await mergeInfoDs.validate();
    const balanceFlag = await balanceInfoDS.validate();
    const mergelineFlag = await mergelineDs.validate();

    if (!splitInfoFlag || !splitlineFlag) {
      errorMessage.push(intl.get('srpm.common.common.view.splitRule').d('拆分规则'));
    }

    if (!mergelineFlag || !mergeInfoFlag) {
      errorMessage.push(intl.get('srpm.common.common.view.mergeRule').d('合并规则'));
    }

    if (!balanceFlag) {
      errorMessage.push(intl.get('srpm.common.common.view.balanceRule').d('平衡规则'));
    }

    if (errorMessage.length !== 0) {
      return errorMessage;
    } else {
      return {
        ...splitInfoDs.toData()[0],
        ...mergeInfoDs.toData()[0],
        ...balanceInfoDS.toData()[0],
        splitConfigList: splitlineDs.toData(),
        mergeConfigList: mergelineDs.toData(),
      };
    }
  };

  const handleSave = async () => {
    const allInfo = await getAllInfo();
    if (allInfo) {
      setLoading(true);
      const res =
        headInfo?.containerStatus === 'PUBLISHED'
          ? getResponse(await releaseContainer({ ...allInfo }))
          : getResponse(await saveContainer(allInfo));
      if (res) {
        notification.success();
        if (containerId === 'new' || headInfo?.containerStatus === 'PUBLISHED') {
          setContainerId(res.containerId);
          dispatch(
            routerRedux.push({
              pathname: `/srpm/requisition-plan-config/detail/${res.containerId}`,
            })
          );
        } else {
          commonUpdate(res?.containerId || containerId);
        }
      } else {
        setLoading(false);
      }
    }
  };

  // 获取所有信息
  const getAllInfo = async () => {
    const errorTipMsg = [];
    const baseInfo = await getBaseInfo();
    const ruleInfo = await getRuleConfigInfo();

    if (isArray(baseInfo)) errorTipMsg.push(...baseInfo);

    if (isArray(ruleInfo)) errorTipMsg.push(...ruleInfo);
    setValidateList({
      ruleConfig: isArray(ruleInfo) ? 'red' : 'green',
      baseInfo: isArray(baseInfo) ? 'red' : 'green',
    });

    if (errorTipMsg.length === 0) {
      return {
        ...headInfo,
        ...baseInfo,
        ...ruleInfo,
      };
    } else {
      notification.error({
        message: intl
          .get('srpm.common.config.view.validateErrorMsg', {
            value: errorTipMsg.join('、'),
          })
          .d(`${errorTipMsg.join('、')}单元有必填信息未填写`),
      });
      return null;
    }
  };

  const toHistory = (e) => {
    openTab({
      key: `/srpm/requisition-plan-config/history/${e.containerId}`,
      title: `${containerName}-${e.version}`,
    });
  };

  const menu = useMemo(() => {
    return (
      <Menu style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {historyList.map((e) => (
          <Menu.Item className={styles['menu-list-history']}>
            <a onClick={() => toHistory(e)}>
              <div className={styles.version}>
                {`${intl.get(`hzero.common.components.dataAudit.version`).d('版本')}${e.version}`}
              </div>
              <div className={styles.lastupdate_info}>
                {`${e.lastUpdatedByName} ${dateTimeRender(e.lastUpdateDate)}`}
              </div>
            </a>
          </Menu.Item>
        ))}
      </Menu>
    );
  }, [historyList]);

  const HeaderBtn = observer(() => {
    const headerButtons = [
      <Button
        onClick={handleRelease}
        type="c7n-pro"
        icon="publish2"
        color="primary"
        funcType="raised"
        disabled={loading || !(containerId && containerId !== 'new')}
      >
        {intl.get(`hzero.common.button.publish`).d('发布')}
      </Button>,
    ];
    if (headInfo.containerStatus !== 'PUBLISHED') {
      headerButtons.push(
        <Button
          onClick={handleSave}
          type="c7n-pro"
          icon="save"
          funcType="flat"
          disabled={loading}
          style={{ marginRight: '0.1rem' }}
        >
          {intl.get(`hzero.common.button.save`).d('保存')}
        </Button>
      );
    }

    if (headInfo.version > 1) {
      headerButtons.push(
        <Dropdown overlay={menu}>
          <Button type="c7n-pro" icon="schedule" funcType="flat">
            {intl.get(`srpm.common.view.button.viewHistory`).d('查看历史版本')}
            <Icon type="expand_more" />
          </Button>
        </Dropdown>
      );
    }
    return headerButtons;
  });

  const TabTitle = observer(({ currentKey, title, validateList }) => {
    const color = validateList[currentKey];
    console.log(color, validateList, currentKey, containerId); // baseInfo ruleConfig
    const checkInfo =
      color === 'gray'
        ? intl.get('srpm.common.modal.edit.preset').d('预设')
        : color === 'red'
        ? intl.get('srpm.common.edit.status.incomplete').d('未完成')
        : intl.get('hzero.common.model.compelete').d('完成');
    return (
      <>
        <div className={styles.tabTitle}>
          <span className={styles['tab-title-text']}> {title}</span>
          <Tag color={color} style={{ border: 0 }}>
            {checkInfo}
          </Tag>
        </div>
      </>
    );
  });

  return (
    <Fragment>
      <Header
        backPath={
          back === 'inquery'
            ? `/srpm/requisition-plan-config/detail-query/${containerId}`
            : '/srpm/requisition-plan-config/list'
        }
        title={
          containerId === 'new'
            ? intl.get('srpm.common.title.requisitionPlanConfig.createDetail').d('新建需求计划')
            : intl.get('srpm.common.title.requisitionPlanConfig.editDetail').d('编辑需求计划')
        }
      >
        <HeaderBtn />
      </Header>
      <div className={styles['config-page-content']}>
        <Spin spinning={loading || false} wrapperClassName="full-height-spinning">
          <Tabs
            keyboard={false}
            className="config-vertical-tabs"
            tabPosition="left"
            flex
            style={{ height: '100%' }}
          >
            <TabPane
              tab={
                <TabTitle
                  title={intl.get('srpm.common.title.baseInfo').d('基本信息')}
                  dataSet={[baseInfoDs]}
                  currentKey="baseInfo"
                  validateList={validateListFlag}
                />
              }
              key="baseInfo"
            >
              <BaseInfo baseInfoDs={baseInfoDs} containerId={containerId} />
            </TabPane>
            <TabPane
              tab={
                <TabTitle
                  title={intl.get('srpm.common.title.ruleConfig').d('规则配置')}
                  dataSet={[splitInfoDs, mergeInfoDs, balanceInfoDS, splitlineDs, mergelineDs]}
                  currentKey="ruleConfig"
                  validateList={validateListFlag}
                />
              }
              key="ruleConfig"
            >
              <RuleConfig
                splitInfoDs={splitInfoDs}
                mergeInfoDs={mergeInfoDs}
                balanceInfoDS={balanceInfoDS}
                splitlineDs={splitlineDs}
                mergelineDs={mergelineDs}
                containerId={containerId}
              />
            </TabPane>
          </Tabs>
        </Spin>
      </div>
    </Fragment>
  );
};

export default compose(
  connect(),
  formatterCollections({
    code: [
      'srpm.common',
      'hzero.common',
      'hzero.c7nProUI',
      'entity.company',
      'entity.business',
      'entity.organization',
      'entity.roles',
      'entity.item',
    ],
  })
)(Index);

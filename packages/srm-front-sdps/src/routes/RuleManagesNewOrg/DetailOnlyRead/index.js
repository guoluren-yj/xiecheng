/* eslint-disable no-param-reassign */
/**
 * 规则配置详情 - 编辑页面(租户级)（只读）
 * @date: 2021-12-28
 * @author: Zip <Zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */

import React, { useEffect, useState } from 'react';
import { DataSet, Spin, Modal, Button } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import qs from 'querystring';
import { Header } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import { routerRedux } from 'dva/router';
import notification from 'utils/notification';
// import { openTab } from 'utils/menuTab';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { SRM_DATA_PROCESS } from '_utils/config';

import { fetchOutList, fetchChangeUpdate } from '@/services/ruleManagesOrgService';
import {
  getBasicParamDs,
  getIndexMessageDs,
  getIndexDimensionDs,
  getOutDimensionDs,
  getActionConfigTableDs,
} from '../store/ruleManagesOrgDetailDs';
import BasicParamTable from './components/BasicParamTable';
import IndexMessageTable from './components/IndexMessageTable';
import IndexDimensionTable from './components/IndexDimensionTable';
import ActionConfigTable from './components/ActionConfigTable';
import OutParamsTable from './components/OutParamsTable';
import { ReactExportButton } from './components/ReactExportButton';
import CalculationModal from './CalculationModal';

import styles from './index.less';

const { TabPane } = Tabs;
const viewPrompt = 'sdps.ruleManagesDetail.view'; // 多语言前缀
const dimensionCheckModalKey = Modal.key();
const transparentDimensionCheckModalKey = Modal.key();
const calculateModalKey = Modal.key();
const organizationId = getCurrentOrganizationId();
const exportRequestUrl = `${SRM_DATA_PROCESS}/v1/${organizationId}/cnf-actions/action-export`;

function Detail(props = {}) {
  const { tenantId, ruleManagementHeaderId } = qs.parse(props.location.search.substr(1)); // 截取url上面传递参数
  const [spinning, handleSpinning] = useState(false); // tab页加载事件
  const {
    basicParamDs,
    indexMessageDs,
    indexDimensionDs,
    actionConfigTableDs,
    outDimensionDs,
  } = props.valueDs;

  const { history, location } = props;

  const [type, handleType] = useState(undefined); // 规则类型字段，区别规则是标准（0）或透传（1），字符串类型
  const [currentTabKey, handleCurrentTabKey] = useState('basic'); // 控制tab页的当前key
  const [ruleCode, setRuleCode] = useState('');
  const [code, setCode] = useState('');
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    if (indexMessageDs) {
      indexMessageDs.selection = false;
    }

    if (location && location.search && location.search.includes('indexSearch')) {
      handleCurrentTabKey('index');
    }
  }, []);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  /**
   * 副作用——查询,如果ruleManagementHeaderId存在
   */
  useEffect(() => {
    if (ruleManagementHeaderId) {
      handleSpinning(true);
      // 若规则编码存在，说明是编辑
      // indexMessageDs的ruleManagementHeaderId为查询参数，因为删除的过程会自动查询参数，因此不能用query传参
      indexMessageDs.setState('ruleManagementHeaderId', ruleManagementHeaderId);
      Promise.all([
        basicParamDs.query(1, { ruleManagementHeaderId }).then(res => {
          // 类型为标准的规则还需要进行配置参数的查询
          if (basicParamDs.current.get('type') === '0') {
            actionConfigTableDs.setQueryParameter('fullPathCode', res.ruleCode);
            actionConfigTableDs.setQueryParameter('code', res.code);
            actionConfigTableDs.query();
            setRuleCode(res?.ruleCode ?? '');
            setCode(res?.code ?? '');
          }
          handleType(basicParamDs.current.get('type'));
        }),
        indexMessageDs.query(),
      ]).finally(() => {
        handleSpinning(false);
        setRefresh(true);
      });
    }
  }, [ruleManagementHeaderId, tenantId]);

  /**
   * 上一条
   * @param {*} dataSet
   */
  const handlePrev = (dataItem, dataSet) => {
    handleDimensionCheck(dataItem, dataSet);
  };

  /**
   * 下一条
   * @param {*} dataSet
   */
  const handleNext = (dataItem, dataSet) => {
    handleDimensionCheck(dataItem, dataSet);
  };

  /**
   * handleIndexDimDistribute: 处理指标页面的查看维度点击事件
   * @param {Object} record
   */
  const handleDimensionCheck = (record, dataSet) => {
    const defaultIndex = record.index || 0;

    // 载入本指标的维度数据
    indexDimensionDs.loadData(JSON.parse(record.get('dimensionality') || '[]'));
    Modal.open({
      key: dimensionCheckModalKey,
      title: intl.get(`${viewPrompt}.modal.checkDimension`).d('查看维度'),
      maskClosable: true,
      mask: true,
      closable: true,
      drawer: true,
      footer: null,
      children: (
        <IndexDimensionTable
          tableDs={indexDimensionDs}
          dataSet={dataSet}
          defaultIndex={defaultIndex}
          onPrev={dataItem => handlePrev(dataItem, dataSet)}
          onNext={dataItem => handleNext(dataItem, dataSet)}
        />
      ),
      onClose: () => {
        indexDimensionDs.loadData([]);
      },
    });
  };

  /**
   * handleRouterDimension: 指标探查跳转
   * @param {Object} record
   */
  const handleRouterDimension = record => {
    // 构造parameterKey，即指标编码
    // 构造interfaceParameters，即本指标的全部维度
    // 构造本指标的服务路由和服务名称
    const { indexCode, dimensionality, serviceName, servicePath, serviceCode } = record.get([
      'indexCode',
      'dimensionality',
      'serviceName',
      'servicePath',
      'serviceCode',
    ]);
    // 构造parameters，即本规则的全部指标
    const parameters = JSON.stringify(
      indexMessageDs
        .toData()
        .filter(item => {
          return item.serviceCode === serviceCode && item.indexCode !== indexCode;
        })
        .concat(record.toData())
    );
    const payload = {
      interfaceParameters: dimensionality,
      serviceRoute: servicePath,
      serviceName,
      parameterKey: indexCode,
      parameters,
      serviceCode,
    };

    localStorage.setItem('indexOrgPayload', JSON.stringify(payload));

    const backUrl = `${location.pathname}${location.search}`;

    history.push({
      pathname: `/sdps/rule-management-org/index-inner-org`,
      search: `?backUrl=${backUrl}`,
      // state: payload,
    });

    // openTab({
    //   key: '/sdps/index-search-org',
    //   title: intl.get(`${viewPrompt}.newtab.title`).d('指标探查'),
    //   state: payload,
    // });
  };

  /**
   * handleCheckTransparentDim: 处理透传规则的维度查看
   */
  const handleCheckTransparentDim = () => {
    const record = basicParamDs.current;
    // 载入本指标的维度数据
    indexDimensionDs.loadData(JSON.parse(record.get('dimensionality') || '[]'));
    Modal.open({
      key: transparentDimensionCheckModalKey,
      title: intl.get(`${viewPrompt}.modal.checkDimension`).d('查看维度'),
      drawer: true,
      maskClosable: true,
      mask: true,
      footer: okBtn => okBtn,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      children: <IndexDimensionTable tableDs={indexDimensionDs} />,
      onClose: () => {
        indexDimensionDs.loadData([]);
      },
    });
  };

  /**
   * handleViewOutParam: 查看出参
   */
  const handleViewOutParam = async () => {
    const record = basicParamDs.current;

    const serviceCode = record.get('serviceCode');

    const res = await fetchOutList({ serviceCode });
    if (getResponse(res)) {
      // 载入本指标的维度数据
      outDimensionDs.loadData([...res]);
    }

    Modal.open({
      key: transparentDimensionCheckModalKey,
      title: intl.get('sdps.ruleManagesDetail.view.btn.viewOutPutParams').d('查看出参'),
      drawer: true,
      maskClosable: true,
      footer: okBtn => okBtn,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      children: <OutParamsTable tableDs={outDimensionDs} />,
      onClose: () => {
        outDimensionDs.loadData([]);
      },
    });
  };

  /**
   * 打开试算弹窗
   */
  const openCalculationModal = () => {
    Modal.open({
      key: calculateModalKey,
      title: intl.get('sdps.ruleManagesDetail.view.btn.strategyCalculation').d('策略试算'),
      drawer: true,
      children: (
        <CalculationModal
          dataSet={outDimensionDs}
          ruleCode={ruleCode}
          code={code}
          ruleManagementHeaderId={ruleManagementHeaderId}
        />
      ),
      footer: okBtn => okBtn,
      okText: intl.get('hzero.common.btn.close').d('关闭'),
      onClose: () => {},
      style: { width: '380px' },
      bodyStyle: { padding: '0' },
    });
  };

  /**
   * handlePageBack: 页面回退的回调
   */
  const handlePageBack = () => {
    basicParamDs.loadData([]);
    indexMessageDs.loadData([]);
    outDimensionDs.loadData([]);
    indexDimensionDs.loadData([]);
    actionConfigTableDs.loadData([]);
  };

  /**
   * 数据上下线
   * @param {Object} param 行数据
   * @param {Boolean} flag 上线下线标记
   */
  const handleLineStatus = (param, flag) => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children:
        flag === 1
          ? intl.get('sdps.ruleManages.action.online.sure').d('确定上线?')
          : intl.get('sdps.ruleManages.action.offline.sure').d('确定下线?'),
      onOk: () => {
        param.enableFlag = flag;
        param.tenantId = getCurrentOrganizationId();

        fetchChangeUpdate(param).then(res => {
          if (getResponse(res)) {
            notification.success();
            basicParamDs.query(1, { ruleManagementHeaderId }).then(() => {
              setRefresh(true);
            });
            // props.dispatch(
            //   routerRedux.push({
            //     pathname: `/sdps/rule-management-org/detail-only-read`,
            //     search: qs.stringify({
            //       tenantId: getCurrentOrganizationId(),
            //       ruleManagementHeaderId: basicParam?.ruleManagementHeaderId ?? '',
            //     }),
            //   })
            // );
          }
        });
      },
    });
  };

  const routeDetail = id => {
    const currentTenantId = getCurrentOrganizationId();
    props.dispatch(
      routerRedux.push({
        pathname: `/sdps/rule-management-org/detail`,
        search: qs.stringify({ tenantId: currentTenantId, ruleManagementHeaderId: id }),
      })
    );
  };

  const basicParam = basicParamDs?.current?.toData() ?? {};

  return (
    <Spin spinning={spinning}>
      <Header
        title={intl.get(`${viewPrompt}.header.title`).d('规则详情')}
        backPath="/sdps/rule-management-org/list?backFlag=true"
        onBack={handlePageBack}
      >
        {basicParam.enableFlag === 1 ? (
          <Button
            onClick={() => handleLineStatus(basicParam, 0)}
            icon="arrow_downward"
            funcType="flat"
          >
            {intl.get('sdps.ruleManages.view.status.offline').d('下线')}
          </Button>
        ) : (
          <>
            <Button
              onClick={() => {
                routeDetail(basicParam?.ruleManagementHeaderId ?? '');
              }}
              icon="drive_file_rename_outline"
              funcType="flat"
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </Button>
            <Button
              onClick={() => handleLineStatus(basicParam, 1)}
              icon="arrow_upward"
              funcType="flat"
            >
              {intl.get('sdps.ruleManages.view.status.online').d('上线')}
            </Button>
          </>
        )}
      </Header>
      <div className={styles['rule-manage-readonly-basic']}>
        <div className={styles['rule-manage-readonly-form-basic']}>
          <Tabs
            activeKey={currentTabKey}
            tabPosition="left"
            onChange={activeKey => {
              handleCurrentTabKey(activeKey);
            }}
          >
            <TabPane tab={intl.get(`${viewPrompt}.tab.basic`).d('基本信息')} key="basic" />
            {type === '0' && (
              <TabPane
                tab={intl.get(`${viewPrompt}.tab.indexMessage`).d('指标信息')}
                key="index"
                disabled={!ruleManagementHeaderId}
              />
            )}
            {type === '0' && (
              <TabPane
                tab={intl.get(`${viewPrompt}.tab.action`).d('策略配置')}
                key="action"
                disabled={!ruleManagementHeaderId}
              />
            )}
          </Tabs>
        </div>

        <div
          style={{
            marginLeft: '1px',
            padding: '20px 16px 16px 16px',
            flex: 13,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              marginBottom:
                currentTabKey === 'basic' && type === '1'
                  ? '16px'
                  : currentTabKey === 'action'
                  ? '8px'
                  : '',
            }}
          >
            {type === '1' && (
              <Button funcType="flat" color="primary" icon="outbond-o" onClick={handleViewOutParam}>
                {intl.get('sdps.ruleManagesDetail.view.btn.viewOutPutParams').d('查看出参')}
              </Button>
            )}

            {type === '1' && (
              <Button
                funcType="flat"
                color="primary"
                icon="burnout_map"
                onClick={handleCheckTransparentDim}
              >
                {intl.get(`${viewPrompt}.modal.checkDimension`).d('查看维度')}
              </Button>
            )}

            {currentTabKey === 'action' && (
              <Button funcType="flat" color="primary" icon="rule" onClick={openCalculationModal}>
                {intl.get(`sdps.ruleManagesDetail.view.btn.strategyCalculation`).d('策略试算')}
              </Button>
            )}

            {currentTabKey === 'action' && (
              <ReactExportButton
                btnText={intl.get(`${viewPrompt}.button.export`).d('导出')}
                btnProp={{
                  color: 'primary',
                  funcType: 'flat',
                }}
                exportRequestUrl={exportRequestUrl}
                ruleCode={ruleCode}
                code={code}
                ds={actionConfigTableDs}
              />
            )}
          </div>

          {currentTabKey === 'basic' ? <BasicParamTable formDs={basicParamDs} /> : null}
          {currentTabKey === 'index' ? (
            <IndexMessageTable
              tableDs={indexMessageDs}
              onDimensionClick={handleDimensionCheck}
              onRouterDimension={handleRouterDimension}
            />
          ) : null}
          {currentTabKey === 'action' ? <ActionConfigTable tableDs={actionConfigTableDs} /> : null}
        </div>
      </div>
    </Spin>
  );
}

export default formatterCollections({
  code: ['sdps.ruleManagesDetail'],
})(
  withProps(
    () => {
      const basicParamDs = new DataSet(getBasicParamDs());
      const indexMessageDs = new DataSet(getIndexMessageDs());
      const indexDimensionDs = new DataSet(getIndexDimensionDs());
      const outDimensionDs = new DataSet(getOutDimensionDs());
      const actionConfigTableDs = new DataSet(getActionConfigTableDs());
      indexDimensionDs.selection = false; // 只读页面的表格无需可选
      outDimensionDs.selection = false; //

      const valueDs = {
        basicParamDs,
        indexMessageDs,
        indexDimensionDs,
        outDimensionDs,
        actionConfigTableDs,
      };
      return { valueDs };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(Detail)
);

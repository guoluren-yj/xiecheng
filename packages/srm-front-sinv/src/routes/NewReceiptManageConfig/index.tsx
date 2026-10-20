/**
 * index.js 收货管理配置-新
 * @date: 2022-11-14
 * @author: zuoxiangyu <xaingyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import React, { FC, useRef, Fragment, useMemo, useState } from 'react';
import { Tabs } from 'choerodon-ui';
import { connect } from 'dva';
import { observer } from 'mobx-react-lite';
import { TableBoxSizing } from 'choerodon-ui/pro/lib/table/enum';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { DataSet, Table, Button, Tooltip, Icon, Modal } from 'choerodon-ui/pro';
import CommonImport from 'hzero-front/lib/components/Import';
import { isNil, isEmpty } from 'lodash';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'srm-front-boot/lib/utils/intl/index.js';
import notification from 'hzero-front/lib/utils/notification';
import { getResponse, } from 'hzero-front/lib/utils/utils/index';
import { Header, Content } from 'hzero-front/lib/components/Page';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections.js';
import { downloadFileByAxios } from 'services/api';
import SlodStatusHOC, { useMount } from '@/utils/utils';
import { indexDataSet } from '@/routes/components/CustomFormAndTableWrapper';
import {
  createInfo,
  handleDelete,
  handleSaveEnable,
  handleReferenceRecommend,
  handleReferenceRecommendCheck
} from '@/services/receiptManageConfigService';
import CustCreate from '@/routes/NewReceiptManageConfig/components/CustomCreateForm'
import NewReferConfig from '@/routes/NewReceiptManageConfig/components/NewReferConfig'

import { lineDataColumns } from './_utils';
import { c7nModal } from '@/routes/components/C7nCustomModal';
import { lineColumns, queryingNodeData, queryingStrategyData, cuxLoad } from './methods';
import dataset from 'choerodon-ui/dataset';


const organizationId = getCurrentOrganizationId();
const tenantId = getCurrentOrganizationId();

// import style from './index.less';

const { TabPane } = Tabs;

interface IndexProps {
  disabled?: boolean,
  className?: string;
  workFlag?: boolean,
  dataSet?: DataSet,
}

interface BtnProps {
  dataSet?: DataSet;
  selected?: any,
}
interface PropsParams {
  workFlag?: boolean,
  history?: any,
  location?: any,
  dispatch?: any,
  receiptManageConfig?: Object,
}

const Index: FC<IndexProps> = (props: PropsParams) => {
  const { workFlag, history, dispatch, receiptManageConfig } = props;
  const { tabsKey } = history?.location || {};

  const createRef: any = useRef({});
  const [nodeTab, setNodeTab] = useState(0);
  const [strategyTab, setStrategyTab] = useState(0);
  const [tabType, setTabType] = useState<string>(tabsKey || 'node');
  const [loading, setLoading] = useState<boolean>(false);


  /**
   *  启用/禁用方法
   */
  const handleSaveEnableChange = async (record, enabledFlag) => {
    const data = record.toData() || {};
    const res = await handleSaveEnable([{...data, enabledFlag}]);
    if (getResponse(res)) {
      (notification as any).success();
      if (tabType === 'node') nodeDs?.query().then(res => {
        setNodeTab(res?.length || 0)
      });
      if (tabType === 'strategy') strategyDs?.query().then(res => {
        setStrategyTab(res?.totalElements || 0)
      });
    }
  };
  
  const {
    nodeColumns = [],
    strategyColumns = [],
  } = lineColumns(history, workFlag, handleSaveEnableChange);

  const nodeDs = useMemo(() => new DataSet(indexDataSet({
    componentData: nodeColumns,
    read: queryingNodeData,
    // selection: false,
  })), []);
  const strategyDs = useMemo(() => new DataSet(indexDataSet({
    componentData: strategyColumns,
    read: queryingStrategyData,
    // selection: false,
    pageSize: 20,
    paging: true,
    load:(dataSet)=>cuxLoad(dataSet, dispatch),
  })), []);


  useMount(() => {
    queryList()
  }, []);

  /**
   * 收货管理配置 - 查询
   * @delivery {*} params
   * return
   */
  const queryList = () => {
    const {currentPages}: any = receiptManageConfig;
    try {
      setLoading(true);
      nodeDs.query().then(res => {
        setNodeTab(res?.length || 0)
        setLoading(false);
      });
      console.log(strategyDs.currentPage, 'currentPage');
      strategyDs.query(currentPages).then(res => {
        setStrategyTab(res?.totalElements || 0)
        dispatch({
          type: 'receiptManageConfig/updateState',
          payload: {
            currentPages: 1,
          },
        });
      });
    } finally {
      setTimeout(()=>setLoading(false), 1000)
    }
  };

  const onTabChange = (key) => {
    setTabType(key);
  };

  /**
   * 节点引用推荐配置
   */
  const handleReference = async () => {
    const res = getResponse(await handleReferenceRecommendCheck());
    if (res) {
      c7nModal({
        title: intl.get('hzero.common.button.recommend').d('引用推荐配置'),
        style: { width: '742px' },
        children: <NewReferConfig />,
        okText: intl.get('sinv.receiptManage.view.title.clickRefer').d('一键引用'),
        onOk: async () => {
          const res = getResponse(await handleReferenceRecommend());
          if (res) {
            (notification as any).success();
            queryList();
          }
        },
      })
    }
  }

  /**
   * 收货管理配置 - 创建
   * @delivery {*} params
   * return
   */
  const handleCreateList = () => {
    const modalProps = {
      workFlag,
      tabType,
    }
    Modal.open({
      drawer: true,
      size: 'small',
      title: tabType === 'node' ? intl.get('sinv.receiptManage.view.title.createNewnode').d('新建收货节点') :
        intl.get('sinv.receiptManage.view.title.createNewStrategy').d('新建收货策略'),
      children: <CustCreate ref={createRef} {...modalProps} />,
      okText: intl.get(`hzero.common.model.sure`).d('确定'),
      cancelText: intl.get('hzero.common.button.cance').d('取消'),
      onOk: async () => {
        const params = [{
          tenantId: organizationId,
          scheduledDeliveryFlag: tabType === 'node' ? null : 0,
          ...createRef?.current?.nodeCreateDs?.current.toJSONData(),
        }];
        const flag = await createRef?.current?.nodeCreateDs?.validate();
        if (flag) {
          const res = await createInfo({ params, tabsKey: tabType })
          if (getResponse(res) && Array.isArray(res) && res.length) {
            const { nodeConfigId = null, nodeStrategyId = null, nodeOrderType = '' } = res[0] || {};
            const id = tabType === 'node' ? nodeConfigId : nodeStrategyId;
            (notification as any).success();
            debugger;
            if (!isNil(id) && !['ASN', 'PLAN'].includes(nodeOrderType)) {
              history.push({
                pathname: `/sinv/receipt-manage-config/detail/${id}`,
                search: `?tabsKey=${tabType}&editor=1`,
              });
            } else {
              queryList()
            }
          } else {
            return false
          }
        } else {
          return false
        }
      }
    })
  }
  const handleExport = () => {
    setLoading(true);
    const api = `${SRM_SPUC}/v1/${organizationId}/rcv-node-configs/nodeConfigDetailAll/export`;
    downloadFileByAxios({
      requestUrl: api,
      method: 'POST',
    }).finally(() => {
      setLoading(false);
    });
  }

  /**
     * 收货管理配置 - 行删除方法
     * @delivery {*} params
   */
  const handleDeleteList = (dataSet, type) => {
    const lines = dataSet?.selected?.map(item => item.toData());
    const data = lines?.filter(i =>  i.trxLineCount !== null &&  i.trxLineCount !== undefined &&  i.trxLineCount !== "" &&  i.trxLineCount > 0);
    const delFlag = lines?.every(i => i.trxLineCount > 0);
    console.log(data, "data");
    console.log(delFlag, "delFlag");
    if (type === 'node' && delFlag) {
      const tips = data?.map((i) => {return `${i?.nodeConfigCode}`;}).join(',');
      notification?.warning({
        message: `${intl.get('sinv.receiptManage.model.receipt.nodeSeq').d('节点')}:${tips}${intl.get('sinv.receiptManage.model.receipt.wufashanchuNode').d('已经产生业务单据，无法删除！')}`
      })
      return;
    }
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm').d('提示'),
      children: type === 'node' ? intl.get('sinv.receiptManage.view.title.deleteNodeNow').d('确认删除勾选节点？') :
        intl.get('sinv.receiptManage.view.title.deleteStrategyNow').d('确认删除勾选策略？'),
      onOk: async () => {
        const res = getResponse(await handleDelete(lines, type));
        if (res) {
          (notification as any).success();
          if (type === 'node') nodeDs.query().then(res => {
            setNodeTab(res?.length || 0)
          });
          if (type === 'strategy') strategyDs.query().then(res => {
            setStrategyTab(res?.totalElements || 0)
          });
        }
      },
    });
  };

  /**
   * 收货管理配置 - 按钮组
   * @delivery {*} params
   * return Element
   */
  const HeaderBtns: FC<BtnProps> = observer(({dataSet}): any => {
    const templateCode = 'SRM_C_SRM_SINV_RCV_NODE_CONFIG_IMPORT ';
    const buttons: any = (
      <>
        <Button
          icon="add"
          loading={loading}
          color={ButtonColor.primary}
          funcType={FuncType.raised}
          onClick={handleCreateList}
        >
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
        <Button
              icon="delete_sweep"
              loading={loading}
              funcType={FuncType.flat}
              disabled={isEmpty(dataSet?.selected)}
              onClick={() => handleDeleteList(dataSet, tabType)}
            >{intl.get('hzero.common.button.batchDelete').d('批量删除')}
            </Button>
        {tabType === 'node' && (
          <>
            <CommonImport
              businessObjectTemplateCode={templateCode}
              prefixPatch={SRM_SPUC}
              refreshButton
              buttonText={intl.get(`hzero.common.button.import`).d('新版导入')}
              args={{
                tenantId,
                templateCode,
              }}
              buttonProps={{
                icon: 'archive',
                type: 'c7n-pro',
                funcType: 'flat',
              }}
            />
            <Button
              icon="unarchive"
              funcType={FuncType.flat}
              onClick={handleExport}
              loading={loading}
            >
              {intl.get(`hzero.common.button.export`).d('导出')}
            </Button>
            <Button
              icon="application_allocation"
              funcType={FuncType.flat}
              wait={30}
              disabled={!isEmpty(dataSet?.toData())}
              onClick={() => handleReference()}
              loading={loading}
            >
              <span>
                {intl.get('hzero.common.button.recommend').d('引用推荐配置')}
              </span>
              <Tooltip
                placement="bottom"
                title={intl
                  .get('hzero.common.button.recommendTip')
                  .d(
                    '引用推荐配置会清空当前界面的所有配置，且走在策略中的订单或者事务不允许该操作，谨慎使用'
                  )}
              >
                <Icon
                  type="help"
                  width={16}
                  height={16}
                  style={{ color: 'rgba(0,0,0,.45)' }}
                />
              </Tooltip>
            </Button>
          </>
        )}
      </>
    );
    return buttons;
  });
  return (
    <Fragment>
      <Header
        title={intl.get('sinv.receiptManage.view.title.receiptManage').d('收货管理配置')}
      >
        <HeaderBtns dataSet={tabType === 'node'? nodeDs: strategyDs}/>
      </Header>
      <Content>
        <Tabs defaultActiveKey={tabType} onChange={(key) => onTabChange(key)}>
          <TabPane
            tab={intl.get('sinv.receiptManage.view.title.node').d('业务节点配置')}
            key="node"
            count={nodeTab}
          >
            <div style={{ height: 'calc(100vh - 245px)' }}>
              <Table
                dataSet={nodeDs}
                boxSizing={TableBoxSizing.wrapper}
                style={{ maxHeight: `calc(100% - 22px)` }}
                columns={lineDataColumns(nodeColumns)}
                customizable
                customizedCode="new-node-receiptManageConfig-workbench"
              />
            </div>
          </TabPane>
          <TabPane
            tab={intl.get('sinv.receiptManage.view.title.strategy').d('业务策略配置')}
            key="strategy"
            count={strategyTab}
          >
            <div style={{ height: 'calc(100vh - 245px)' }}>
              <Table
                dataSet={strategyDs}
                boxSizing={TableBoxSizing.wrapper}
                style={{ maxHeight: `calc(100% - 22px)` }}
                columns={lineDataColumns(strategyColumns)}
                customizable
                customizedCode="new-strategy-receiptManageConfig-workbench"
              />
            </div>
          </TabPane>
        </Tabs>
      </Content>
    </Fragment>
  );
};

// export default formatterCollections({
//   code: ['sinv.receiptManage', 'hzero.common'],
// })(SlodStatusHOC(Index));

export default formatterCollections({
  code: ['sinv.receiptManage', 'hzero.common'],
})(
  connect(({ receiptManageConfig = {} }) => ({
    receiptManageConfig,
  }))(SlodStatusHOC(Index))
);


// export default formatterCollections({
//   code: ['sinv.receiptManage', 'hzero.common'],
// })(
//   withProps(
//     () => {
//       return { nodeDs: new DataSet(), strategyDs: new DataSet() };
//     },
//     { cacheState: true }
//   )(SlodStatusHOC(Index))
// );
/*
 * @Description:
 * @Date: 2021-11-24 10:38:14
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import React, { Fragment, useState, useEffect, useMemo, useRef } from 'react';
import { DataSet, Button, Tooltip, Modal, Icon } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { compose, isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import formatterCollections from 'utils/intl/formatterCollections';

import intl from 'utils/intl';
import { stringify } from 'querystring';
import { SRM_SLOD } from '_utils/config';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import CommonImport from 'hzero-front/lib/components/Import';
import { filterNullValueObject, getResponse, getCurrentOrganizationId } from 'utils/utils';

import {
  saveList,
  handleExport,
  deleteOnChange,
  deleteOnChangeStr,
  getRecommendConfig,
  handleDirectRecommend,
} from '@/services/ShipmentsConfigurationService';
import NodeList from './ShipmentsNode/index';
import CreateForm from './components/createForm';
import StrategyList from './ShipmentsStrategy/index';
import { nodeDS } from './ShipmentsNode/store/indexDS';
import { strategyDS } from './ShipmentsStrategy/store/indexDS';
// import CreateFormStrategy from './components/createFormStrategy';
import RecIndex from './components/Recommend';

const { TabPane } = Tabs;

const Index = (props) => {
  const nodeDs = useMemo(() => new DataSet(nodeDS()), []);
  const strategyDs = useMemo(() => new DataSet(strategyDS()), []);
  const createRef = useRef();
  const strategyRef = useRef();

  const { history } = props;
  const { from } = history?.location || {};
  const [btnVisible, useBtnVisible] = useState(from || 'node');
  const [referenceLoading, setReferenceLoading] = useState(false);
  // const [historyVisible, useHistoryVisible] = useState(false);
  // const [strategyHeaderId, useId] = useState(null);

  // ds封装
  const dsAll = () => {
    let currentDs;
    switch (btnVisible) {
      case 'node':
        currentDs = nodeDs;
        break;
      case 'strategy':
        currentDs = strategyDs;
        break;
      default:
        currentDs = nodeDs;
        break;
    }
    return currentDs;
  };
  const currentDs = dsAll();

  useEffect(() => {
    setReferenceLoading(true);
    currentDs.query().then(() => {
      setReferenceLoading(false);
    });
  }, [btnVisible]);

  const destroyModal = () => {
    Modal.destroyAll();
  };

  // 新建行数据
  const createOnchange = () => {
    if (btnVisible === 'node') {
      createModal();
      return;
    }
    const params = filterNullValueObject({
      from: 'strategy',
    });
    history.push({
      pathname: `/slod/shipments-configuration/detail`,
      search: stringify(params),
    });
  };

  /**
   * 新建/编辑
   */
  const createModal = async (data, edit) => {
    Modal.open({
      title:
        edit === 'edit'
          ? intl.get('hzero.common.button.editor').d('编辑')
          : intl.get('hzero.common.model.create').d('新建'),
      drawer: true,
      size: 'small',
      children: <CreateForm ref={createRef} {...data} />,
      footer: () => (
        <div>
          <Button
            color="primary"
            onClick={() =>
              saveOnchange((btnVisible === 'node' ? createRef : strategyRef).current.indexDs)
            }
          >
            {intl.get(`slod.shipmentsConfiguration.view.title.detail.save`).d('保存')}
          </Button>
          <Button onClick={() => destroyModal()}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </div>
      ),
    });
  };

  // 删除行数据
  const deleteOnchangeList = async () => {
    const selectedRrcord = currentDs?.selected?.map((i) => i.toData());
    const configFlag = selectedRrcord?.some((i) => i.nodeConfigId);
    const strategyFlag = selectedRrcord?.some((i) => i.strategyHeaderId);
    const deleteFlag = configFlag || strategyFlag || false;
    const configList = selectedRrcord.filter((i) => i.nodeConfigId);
    const strategyList = selectedRrcord.filter((i) => i.strategyHeaderId);
    if (deleteFlag) {
      Modal.confirm({
        contentStyle: { width: '550px' },
        title: intl.get('slod.deliveryWorkbench.view.message.hint').d(`提示`),
        children: intl.get('slod.deliveryWorkbench.view.message.orderDel').d(`确认删除选中行？`),
        okText: intl.get('hzero.common.button.sure').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: async () => {
          setReferenceLoading(true);
          if (btnVisible === 'node') {
            const res = await deleteOnChange(configList);
            if (getResponse(res)) {
              notification.success();
              currentDs.query();
              setReferenceLoading(false);
            } else {
              setReferenceLoading(false);
            }
          } else {
            const res = await deleteOnChangeStr(strategyList);
            if (getResponse(res)) {
              notification.success();
              currentDs.query();
              setReferenceLoading(false);
            } else {
              setReferenceLoading(false);
            }
          }
        },
      });
    } else {
      currentDs.remove(currentDs.selected);
    }
  };

  // 保存行数据
  const saveOnchange = async (record) => {
    const flag = await record.validate();
    if (flag) {
      const list = record?.toJSONData() || [];
      const res = await saveList(list, btnVisible);
      if (getResponse(res)) {
        notification.success();
        if (btnVisible === 'strategy') {
          const params = filterNullValueObject({
            id: res.strategyHeaderId,
            from: 'strategy',
          });
          history.push({
            pathname: `/slod/shipments-configuration/detail`,
            search: stringify(params),
          });
        } else {
          destroyModal();
          currentDs.query();
        }
      }
    }
  };

  // 跳转明细
  const handleDetailTable = (record, type, dataVersion) => {
    const obj = !type && record.toData();
    const params = filterNullValueObject({
      id: type === null ? obj.strategyHeaderId : record,
      from: 'strategy',
      classify: type,
      dataVersion: type === null ? null : dataVersion,
    });
    history.push({
      pathname: `/slod/shipments-configuration/detail`,
      search: stringify(params),
    });
  };

  const handleReferenceRecommend = async () => {
    setReferenceLoading(true);
    const res = await getRecommendConfig();
    if (getResponse(res)) {
      setReferenceLoading(false);
      Modal.open({
        title: intl.get('hzero.common.button.recommend').d('引用推荐配置'),
        drawer: true,
        style: { width: '742px' },
        children: <RecIndex />,
        okText: intl.get(`slod.deliveryWorkbench.model.common.recommend`).d('一键引用'),
        onOk: async () => {
          const rec = await handleDirectRecommend();
          if (getResponse(rec)) {
            notification.success();
            currentDs.query();
            return true;
          } else {
            return false;
          }
        },
      });
    } else {
      setReferenceLoading(false);
    }
  };

  // 导出-下载
  const handleExportList = async () => {
    setReferenceLoading(true);
    const res = await handleExport();
    if (res && res.type && res.type.includes('application/json')) {
      const reader = new FileReader();
      reader.readAsText(res, 'utf-8');
      reader.onload = () => {
        const readers = reader.result;
        const parseObj = JSON.parse(readers);
        notification.error({ message: parseObj.message });
      };
      setReferenceLoading(false);
      return;
    }
    const file = new Blob([res], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const fileURL = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = fileURL;
    a.download = intl
      .get('slod.deliveryWorkbench.model.common.exportFileDeploy')
      .d('导出发货节点配置');
    a.click();
    setReferenceLoading(false);
  };

  const onHandleDetailChange = (record) => {
    const params = filterNullValueObject({
      id: record?.get('strategyHeaderId'),
      from: 'strategy',
      classify: 'history',
    });
    history.push({
      pathname: `/slod/shipments-configuration/detail`,
      search: stringify(params),
    });
  };

  // 头按钮
  const HeaderBtn = observer(({ dataSet }) => {
    return (
      <>
        <Button
          color="primary"
          icon="add"
          loading={referenceLoading}
          onClick={() => createOnchange()}
        >
          {intl.get(`hzero.common.button.creation`).d('新建')}
        </Button>
        <Button
          funcType="flat"
          icon="delete_sweep"
          type="c7n-pro"
          loading={referenceLoading}
          onClick={() => deleteOnchangeList()}
          disabled={isEmpty(dataSet?.selected)}
        >
          {intl.get(`hzero.common.button.batchDelete`).d('批量删除')}
        </Button>
        {btnVisible === 'node' && (
          <CommonImport
            businessObjectTemplateCode="SRM_C_SRM_SLOD_STRATEGY_HEADER_IMPORT"
            prefixPatch={SRM_SLOD}
            refreshButton
            buttonText={intl.get(`slod.shipmentsConfiguration.model.common.import`).d('导入')}
            args={{
              tenantId: getCurrentOrganizationId(),
            }}
            buttonProps={{
              icon: 'archive',
              type: 'c7n-pro',
              funcType: 'flat',
              loading: referenceLoading,
            }}
          />
        )}
        {btnVisible === 'node' && (
          <Button
            icon="unarchive"
            funcType="flat"
            type="c7n-pro"
            loading={referenceLoading}
            onClick={() => handleExportList(dataSet)}
          >
            {intl.get(`slod.deliveryWorkbench.model.common.export`).d('导出')}
          </Button>
        )}
        {btnVisible === 'node' && (
          <Button
            icon="application_allocation"
            funcType="flat"
            type="c7n-pro"
            wait={30}
            waitType="debounce"
            disabled={!isEmpty(dataSet?.toData())}
            loading={referenceLoading}
            onClick={handleReferenceRecommend}
          >
            <span style={{ marginRight: '4px' }}>
              {intl.get('hzero.common.button.recommend').d('引用推荐配置')}
            </span>
            <Tooltip
              placement="bottom"
              title={intl
                .get('hzero.common.button.recommendDeliverTip')
                .d('一般适用于节点为空的情况下,可点击此配置使用')}
            >
              <Icon type="help" backgroundColor="#868d9c" width={16} height={16} />
            </Tooltip>
          </Button>
        )}
      </>
    );
  });

  const nodeListProps = {
    nodeDs,
    saveOnchange,
    createModal,
  };

  const strategyListProps = {
    strategyDs,
    saveOnchange,
    handleDetailTable,
    onHandleDetailChange,
  };

  // DOM结构渲染
  return (
    <Fragment>
      <Header
        title={intl.get('slod.shipmentsConfiguration.view.title.shipmentsTitle').d('发货配置')}
      >
        <HeaderBtn dataSet={currentDs} />
      </Header>
      <Content>
        <Tabs defaultActiveKey={btnVisible} onChange={(key) => useBtnVisible(key)}>
          <TabPane
            tab={
              <span>
                {intl.get('slod.shipmentsConfiguration.model.shipmentsNode').d('发货节点配置')}
              </span>
            }
            key="node"
          >
            <NodeList {...nodeListProps} />
          </TabPane>
          <TabPane
            tab={
              <span>
                {intl.get('slod.shipmentsConfiguration.model.shipmentsStrategy').d('发货策略配置')}
              </span>
            }
            key="strategy"
          >
            <StrategyList {...strategyListProps} />
          </TabPane>
        </Tabs>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['hzero.common', 'slod.shipmentsConfiguration', 'slod.common', 'slod.deliveryWorkbench'],
  })
)(Index);

/**
 * 规则配置详情
 * @date: 2021-06-23
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useEffect, useState } from 'react';
import { DataSet, Button, Modal, TextField, NumberField, TextArea, Form } from 'choerodon-ui/pro';
import { Tabs, Spin } from 'choerodon-ui';
import qs from 'querystring';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import { queryRuleManageConfigOrg, saveRuleManageConfigOrg } from '@/services/ruleManagesService';
import { openTab } from 'utils/menuTab';
import {
  getBasicParamDs,
  getParamDs,
  getAddParamLovDs,
  getActionConfigDs,
} from '../store/ruleManagesDetailDs';
import BasicParam from './BasicParam';
import ParamTable from './ParamTable';
import AddParamLov from './AddParamLov';
import ActionConfig from './ActionConfig';

const { TabPane } = Tabs;

// 参数modal弹框key
const paramKey = Modal.key();
// 策略弹框key
const actionModalKey = Modal.key();

function Detail(props = {}) {
  const { tenantId, metaDefinitionId: id } = qs.parse(props.history.location.search.substr(1)); // 截取url上面传递参数
  const [currentTabKey, handleCurrentTabKey] = useState('basic'); // 控制tab页的当前key
  const [code, handleCode] = useState(''); // 当前规则的code
  const [spinning, handleSpinning] = useState(false); // loading
  const [metaDefinitionId, setMetaDefinitionId] = useState(id); // 主键
  const { basicParamDs, interfaceParamDs, returnParamDs, actionConfigDs } = props.valueDs;

  /**
   * 查询
   */
  useEffect(() => {
    if (metaDefinitionId) {
      queryData(metaDefinitionId);
    }
  }, [metaDefinitionId, tenantId]);

  /**
   * 根据主键和租户id查询数据
   * @param {Number} mId
   * @param {Number} tId
   */
  const queryData = (mId) => {
    handleSpinning(true);
    queryRuleManageConfigOrg({ metaDefinitionId: mId })
      .then((res) => {
        if (getResponse(res)) {
          const { interfaceParameters, parameters } = res;
          basicParamDs.create(res);
          interfaceParamDs.loadData(JSON.parse(interfaceParameters));
          returnParamDs.loadData(JSON.parse(parameters));
          actionConfigDs.setQueryParameter('fullPathCode', res.fullPathCode);
          actionConfigDs.setQueryParameter('code', res.code);
          actionConfigDs.query();
          handleCode(res.code); // 保存code
        } else {
          handleSpinning(false);
        }
      })
      .finally(() => handleSpinning(false));
  };

  /**
   * 改变tab
   * @param {String} tabKey
   */
  const changeTab = (tabKey) => {
    handleCurrentTabKey(tabKey);
  };

  /**
   * 保存数据
   */
  const saveCurrentTabData = () => {
    handleSpinning(true);
    basicParamDs
      .validate()
      .then((response) => {
        if (response) {
          const basicParam = basicParamDs.current.toJSONData();
          const payload = {
            ...basicParam,
            interfaceParameters: JSON.stringify(interfaceParamDs.toData()),
            parameters: JSON.stringify(returnParamDs.toData()),
          };
          saveRuleManageConfigOrg(payload)
            .then((res) => {
              if (getResponse(res)) {
                notification.success({
                  message: intl
                    .get('sdps.ruleManagesDetail.view.notification.success')
                    .d('提交成功'),
                });
                if (basicParam.metaDefinitionId) {
                  queryData(basicParam.metaDefinitionId);
                } else {
                  setMetaDefinitionId(res.metaDefinitionId);
                }
              }
            })
            .finally(() => handleSpinning(false)); // catch会导致后端回传的错误无法被前端捕捉，应使用finally
        } else {
          handleSpinning(false);
        }
      })
      .finally(() => handleSpinning(false));
  };

  /**
   * 删除数据
   * @param {Object} ds DataSet
   * @param {Object} record 要删除的行数据
   */
  const deleteParam = (ds, record) => {
    ds.delete(record).then(() => {
      saveCurrentTabData();
    });
  };

  /**
   * 重置数据
   */
  const resetAllDs = () => {
    basicParamDs.reset();
    interfaceParamDs.loadData([]);
    returnParamDs.loadData([]);
  };

  /**
   * 打开添加参数弹框
   */
  const openAddModal = () => {
    const lovDs = new DataSet(
      getAddParamLovDs({
        fullPathCode: basicParamDs.current.get('fullPathCode'),
        type: currentTabKey,
        code,
      })
    );
    Modal.open({
      key: paramKey,
      title: intl.get('sdps.ruleManagesDetail.view.header.title.modal').d('添加参数'),
      children: <AddParamLov lovDataSet={lovDs} />,
      style: {
        width: 800,
      },
      onOk: () => {
        if (currentTabKey === 'interface_parameter') {
          interfaceParamDs.appendData(lovDs.selected);
        } else if (currentTabKey === 'index_parameter') {
          returnParamDs.appendData(lovDs.selected);
        }
        saveCurrentTabData();
      },
    });
  };

  /**
   * 策略编辑
   * @param {Object} record ds 行数据
   * @param {String} title 标题
   */
  const openActionEditModal = (record, title) => {
    let isCreate = true;
    Modal.open({
      key: actionModalKey,
      title,
      drawer: true,
      style: {
        width: 500,
      },
      children: (
        <Form record={record} labelLayout="float" columns={2}>
          <TextField name="actionName" colSpan={1} />
          <NumberField name="priority" colSpan={1} />
          <TextArea name="description" colSpan={2} />
          <TextArea name="conditionExpression" colSpan={2} />
          <TextArea name="value" colSpan={2} />
        </Form>
      ),
      onOk: () => {
        isCreate = true;
        record.set('fullPathCode', basicParamDs.current.get('fullPathCode'));
        record.set('code', code);
        return actionConfigDs.submit();
      },
      onCancel: () => {
        isCreate = false;
        actionConfigDs.reset();
      },
      afterClose: () => {
        if (isCreate) {
          actionConfigDs.query();
        }
      },
    });
  };

  /**
   *  新建策略
   */
  const addActionRule = () => {
    actionConfigDs.create();
    openActionEditModal(
      actionConfigDs.current,
      intl.get('sdps.ruleManagesDetail.view.modal.title.add').d('新建策略')
    );
  };

  /**
   * 删除策略
   * @param {Object} record ds行数据
   */
  const deleteActionEditModal = (record) => {
    actionConfigDs.delete(record).then(() => {
      actionConfigDs.query();
    });
  };

  /**
   * 根据tabKey渲染顶部按钮
   * @returns
   */
  const renderHeaderButtons = () => {
    if (currentTabKey === 'interface_parameter' || currentTabKey === 'index_parameter') {
      return (
        <>
          <Button color="primary" onClick={saveCurrentTabData}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button onClick={openAddModal}>
            {intl.get('sdps.ruleManagesDetail.view.button.add').d('添加')}
          </Button>
        </>
      );
    } else if (currentTabKey === 'action') {
      return (
        <Button color="primary" onClick={addActionRule}>
          {intl.get('hzero.common.button.add').d('增加')}
        </Button>
      );
    } else {
      return (
        <Button color="primary" onClick={saveCurrentTabData}>
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
      );
    }
  };

  /**
   * 路由跳转函数，由【返回参数】页面点击参数key后携带参数跳转至【指标探查】页面
   */
  const routeIndexSearch = () => {
    const {
      interfaceParameters,
      service: { serviceName, serviceRoute },
      parameters,
    } = basicParamDs.current.get(['interfaceParameters', 'service', 'parameters']);
    const parameterKey = returnParamDs.current.get('parameterKey');
    // 指标探查页面的查询所需参数
    const payload = {
      interfaceParameters,
      serviceRoute,
      serviceName,
      parameterKey,
      parameters,
    };
    openTab({
      key: '/sdps/index-search-org',
      title: intl.get('sdps.ruleManagesDetail.view.newtab.title').d('指标探查'),
      state: payload,
    });
  };

  // 基本参数Form数据
  const basicParamProps = {
    metaDefinitionId,
    tenantId,
    formDs: basicParamDs,
  };

  // 接口参数组件参数
  const interfaceParamProps = {
    tableDs: interfaceParamDs,
    deleteRecord: deleteParam,
    isInterface: true,
  };

  // 返回参数组件参数
  const returnParamProps = {
    tableDs: returnParamDs,
    deleteRecord: deleteParam,
    isInterface: false,
    routeIndexSearch,
  };

  // 策略配置参数
  const actionProps = {
    actionConfigDs,
    openActionEditModal,
    deleteActionEditModal,
  };

  return (
    <React.Fragment>
      <Header
        title={intl.get('sdps.ruleManagesDetail.view.header.title').d('规则详情')}
        backPath="/sdps/rule-manages-org/list"
        onBack={resetAllDs}
      >
        {renderHeaderButtons()}
      </Header>
      <Content>
        <Spin spinning={spinning}>
          <Tabs defaultActiveKey="basic" onChange={changeTab}>
            <TabPane
              tab={intl.get('sdps.ruleManagesDetail.view.tab.basic').d('基本信息')}
              key="basic"
            >
              <BasicParam {...basicParamProps} />
            </TabPane>
            <TabPane
              tab={intl.get('sdps.ruleManagesDetail.view.tab.interface_parameter').d('接口参数')}
              key="interface_parameter"
              disabled={metaDefinitionId === undefined}
            >
              <ParamTable {...interfaceParamProps} />
            </TabPane>
            <TabPane
              tab={intl.get('sdps.ruleManagesDetail.view.tab.index_parameter').d('返回参数')}
              key="index_parameter"
              disabled={metaDefinitionId === undefined}
            >
              <ParamTable {...returnParamProps} />
            </TabPane>
            <TabPane
              tab={intl.get('sdps.ruleManagesDetail.view.tab.action').d('策略配置')}
              key="action"
              disabled={metaDefinitionId === undefined}
            >
              <ActionConfig {...actionProps} />
            </TabPane>
          </Tabs>
        </Spin>
      </Content>
    </React.Fragment>
  );
}

export default formatterCollections({
  code: ['sdps.ruleManagesDetail'],
})(
  withProps(
    () => {
      const basicParamDs = new DataSet(getBasicParamDs());
      const interfaceParamDs = new DataSet(
        getParamDs([
          {
            name: 'isRequired',
            type: 'boolean',
            label: intl
              .get('sdps.ruleManagesDetail.model.ruleManagesDetail.isRequired')
              .d('是否必输'),
          },
        ])
      );
      const returnParamDs = new DataSet(getParamDs());
      const actionConfigDs = new DataSet(getActionConfigDs());

      const valueDs = {
        basicParamDs,
        interfaceParamDs,
        returnParamDs,
        actionConfigDs,
      };
      return { valueDs };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(Detail)
);

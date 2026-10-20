/**
 * 规则配置详情 - 编辑页面(租户级)
 * @date: 2021-12-28
 * @author: Zip <Zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */

import React, { useEffect, useState, Fragment } from 'react';
import { DataSet, Button, Spin, Modal } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import qs from 'querystring';
import { Header } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import notification from 'utils/notification';
// import { openTab } from 'utils/menuTab';
import { getResponse } from 'utils/utils';
// import { SRM_DATA_PROCESS } from '_utils/config';

import { fetchOutList } from '@/services/ruleManagesOrgService';
import {
  getBasicParamDs,
  getIndexMessageDs,
  getIndexAddDs,
  getIndexDimensionDs,
  getDimensionListDs,
  getActionConfigTableDs,
  getOutDimensionDs,
} from '../store/ruleManagesOrgDetailDs';
import BasicParamTable from './components/BasicParamTable';
import IndexMessageTable from './components/IndexMessageTable';

import IndexDimensionTable from './components/IndexDimensionTable';
import AddDimensionTable from './components/AddDimensionTable';
import ActionConfigTable from './components/ActionConfigTable';
import ActionConfigForm from './components/ActionConfigForm';
import OutParamsTable from './components/OutParamsTable';
import { ReactButton } from './components/ReactButton';

import CalculationModal from './CalculationModal';

import styles from './index.less';

const { TabPane } = Tabs;
const viewPrompt = 'sdps.ruleManagesDetail.view'; // 多语言前缀

const dimensionCheckModalKey = Modal.key();
const dimensionListModalKey = Modal.key();
const actionAddModalKey = Modal.key();
const calculateModalKey = Modal.key();
const transparentDimensionCheckModalKey = Modal.key();

function Detail(props = {}) {
  const { tenantId, ruleManagementHeaderId: id } = qs.parse(props.location.search.substr(1)); // 截取url上面传递参数
  const [currentTabKey, handleCurrentTabKey] = useState('basic'); // 控制tab页的当前key
  const [ruleManagementHeaderId, setRuleManagementHeaderId] = useState(id); // 主键
  const [spinning, handleSpinning] = useState(false); // tab页加载事件
  const [type, handleType] = useState(undefined); // 规则类型字段，区别规则是标准（0）或透传（1），字符串类型
  const [ruleCode, setRuleCode] = useState('');
  const [code, setCode] = useState('');

  const {
    basicParamDs,
    indexMessageDs,
    indexAddDs,
    outDimensionDs,
    indexDimensionDs,
    dimensionListDs,
    actionConfigTableDs,
  } = props.valueDs;

  const { history, location } = props;

  useEffect(() => {
    if (location && location.search && location.search.includes('indexSearch')) {
      handleCurrentTabKey('index');
    }
  }, []);

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
          actionConfigTableDs.setQueryParameter('fullPathCode', res.ruleCode);
          actionConfigTableDs.setQueryParameter('code', res.code);
          actionConfigTableDs.query();
          handleType(basicParamDs.current.get('type')); // 存储当前规则的类型
          setRuleCode(res?.ruleCode ?? '');
          setCode(res?.code ?? '');
        }),
        indexMessageDs.query(),
      ]).finally(() => {
        handleSpinning(false);
      });
    }
  }, [ruleManagementHeaderId, tenantId]);

  /**
   * 先保存，再跳转
   * @param {*} activeKey
   */
  // const handleSave = async () => {
  //   indexMessageDs.setState('ruleManagementHeaderId', ruleManagementHeaderId);
  //   const isValid = await indexMessageDs.validate();

  //   if (isValid) {
  //     const res = await indexMessageDs.submit();
  //     if (res && res.success) {
  //       setVisible(false);
  //       handleCurrentTabKey(activeKeyVal);
  //     }
  //   }
  // };

  /**
   * 不保存 跳转
   */
  // const handleUnSave = () => {
  //   indexMessageDs.query();
  //   setVisible(false);
  //   handleCurrentTabKey(activeKeyVal);
  // };

  /**
   * handleTabChange: 处理Tab切换事件——保存tab
   * @param {String} tabKey
   */
  const handleTabChange = activeKey => {
    handleCurrentTabKey(activeKey);
    // if (currentTabKey === 'index' && indexMessageDs.dirty && activeKey !== 'index') {
    //   // 从指标页离开 未保存
    //   // setVisible(true);
    //   // setActiveKey(activeKey);
    // } else {
    //   handleCurrentTabKey(activeKey);
    // }
  };

  /**
   * handleBasicParamSave: basicParam表单保存、
   * @param {Object} modal
   * @param {Function} errorFn
   * @param {Function} finalFn
   */
  const handleBasicParamSave = (modal, errFn, finaFn) => {
    handleSpinning(true);
    basicParamDs.validate().then(flag => {
      // 排除校验失败
      if (!flag) {
        handleSpinning(false);
        return;
      }
      // 排除未修改数据
      if (!basicParamDs.dirty) {
        handleSpinning(false);
        notification.warning({
          message: intl.get('hzero.common.message.confirm.title').d('提示'),
          description: intl.get(`${viewPrompt}.notification.modify`).d('请修改数据'),
        });
        return;
      }
      // 如果不是新建，则设置当前的rhId
      if (ruleManagementHeaderId) {
        basicParamDs.setState('ruleManagementHeaderId', ruleManagementHeaderId);
      }
      basicParamDs
        .submit()
        .then(() => {
          // 成功保存
          // 若本次是新建，则赋值上ruleManagementHeaderId，页面变为编辑状态
          if (ruleManagementHeaderId) basicParamDs.query(1, { ruleManagementHeaderId });
          if (!ruleManagementHeaderId) {
            setRuleManagementHeaderId(basicParamDs.current.get('ruleManagementHeaderId'));
          }
        })
        .catch(() => {
          if (errFn) errFn();
        })
        .finally(() => {
          handleSpinning(false);
          if (modal) modal.close();
          if (finaFn) finaFn();
        });
    });
  };

  /**
   * handleIndexSave: 处理指标信息保存
   * @returns PromiseObj
   */
  const handleIndexSave = () => {
    // 提交时需要的参数
    indexMessageDs.setState('ruleManagementHeaderId', ruleManagementHeaderId);
    return indexMessageDs.submit();
  };

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
    // 载入本指标的维度数据
    indexDimensionDs.loadData(JSON.parse(record.get('dimensionality') || '[]'));

    const defaultIndex = record?.index || 0;

    // 表格头部按钮组
    const buttons = [
      <Button
        onClick={handleOpenAddDimModal}
        color="primary"
        funcType="flat"
        icon="playlist_add"
        disabled={!record.get('ruleManagementLineId')}
      >
        {intl.get(`${viewPrompt}.button.add`).d('添加')}
      </Button>,
      <ReactButton status="delete" dataSet={indexDimensionDs} onClick={handleDeleteDimension} />,
    ];
    // 根据是否提交来规定是否能编辑维度
    const ruleManagementLineId = record.get('ruleManagementLineId');
    if (ruleManagementLineId) indexDimensionDs.selection = 'multiple';
    else indexDimensionDs.selection = false;
    Modal.open({
      key: dimensionCheckModalKey,
      title: ruleManagementLineId
        ? intl.get(`${viewPrompt}.modal.editDimension`).d('编辑维度')
        : intl.get(`${viewPrompt}.modal.checkDimension`).d('查看维度'),
      maskClosable: true,
      drawer: true,
      mask: true,
      closable: true,
      footer: null,
      children: (
        <IndexDimensionTable
          tableDs={indexDimensionDs}
          handleAddDimension={handleAddDimension}
          buttons={ruleManagementLineId ? buttons : []}
          defaultIndex={defaultIndex}
          dataSet={dataSet}
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
   * handleOpenAddDimModal: 打开添加维度的modal
   */
  const handleOpenAddDimModal = () => {
    // 获取本规则的规则编码
    const { ruleManagementLineId, ruleLineCode } = indexMessageDs.current.get([
      'ruleManagementLineId',
      'ruleLineCode',
    ]);
    dimensionListDs.query(1, {
      ruleLineCode,
      ruleManagementLineId,
    });
    Modal.open({
      key: dimensionListModalKey,
      title: intl.get(`${viewPrompt}.modal.chooseDimension`).d('维度选择'),
      children: <AddDimensionTable tableDs={dimensionListDs} />,
      footer: (_, cancelBtn, modal) => {
        return (
          <Fragment>
            <ReactButton
              status="select"
              dataSet={dimensionListDs}
              onClick={() => {
                handleAddDimension(modal);
              }}
            />
            {cancelBtn}
          </Fragment>
        );
      },
      onClose: () => {
        dimensionListDs.loadData([]);
      },
    });
  };

  /**
   * handleAddDimension: 处理维度添加弹窗的添加按钮回调
   * @param {Object} modal
   */
  const handleAddDimension = modal => {
    // 把选中的维度项添加进维度信息DS
    const list = indexMessageDs.selected.length
      ? indexMessageDs.selected
      : [indexMessageDs.current];
    indexDimensionDs.push(...dimensionListDs.selected);
    // 提交indexMessageDs
    if (list.length) {
      list[0].set('dimensionality', JSON.stringify(indexDimensionDs.toData()));
    }
    handleIndexSave()
      .catch(() => {
        // 出错则恢复原数据
        if (list.length) {
          list[0].reset();
        }
      })
      .finally(() => {
        // 载入本指标的维度数据
        if (list.length) {
          indexDimensionDs.loadData(JSON.parse(list[0].get('dimensionality') || '[]'));
        }
        modal.close();
      });
  };

  /**
   * handleDeleteDimension: 处理维度删除
   * @param {Function} handleCompLoading 子组件的按钮加载函数
   */
  const handleDeleteDimension = handleCompLoading => {
    const list = indexMessageDs.selected.length
      ? indexMessageDs.selected
      : [indexMessageDs.current];
    // 先删除indexDimensionDs内的元素
    indexDimensionDs.remove(indexDimensionDs.selected);
    // 提交indexMessageDs
    if (list.length) {
      list[0].set('dimensionality', JSON.stringify(indexDimensionDs.toData()));
    }
    handleIndexSave()
      .catch(() => {
        // 出错则恢复原数据
        if (list.length) {
          list[0].reset();
        }
      })
      .finally(() => {
        // 载入本指标的维度数据
        if (list.length) {
          indexDimensionDs.loadData(JSON.parse(list[0].get('dimensionality') || '[]'));
        }
        handleCompLoading(false);
      });
  };

  /**
   * handleActionAdd: 处理添加策略配置
   */
  const handleActionAdd = () => {
    actionConfigTableDs.create(); // 新增一条记录
    actionConfigTableDs.current.set('code', basicParamDs.current.get('code'));
    actionConfigTableDs.current.set('fullPathCode', basicParamDs.current.get('ruleCode'));
    Modal.open({
      key: actionAddModalKey,
      title: intl.get(`${viewPrompt}.modal.actionConfig`).d('策略配置'),
      drawer: true,
      children: <ActionConfigForm record={actionConfigTableDs.current} />,
      onOk: () => {
        return actionConfigTableDs.validate().then(flag => {
          if (!flag) return false;
          actionConfigTableDs.submit().then(() => {
            actionConfigTableDs.query();
          });
        });
      },
      onCancel: () => {
        actionConfigTableDs.reset();
      },
    });
  };

  /**
   * handleActionEdit: 处理策略编辑
   */
  const handleActionEdit = record => {
    Modal.open({
      key: actionAddModalKey,
      title: intl.get(`${viewPrompt}.modal.actionEdit`).d('策略编辑'),
      drawer: true,
      maskClosable: true,
      children: <ActionConfigForm record={record} />,
      onOk: () => {
        return actionConfigTableDs.validate().then(flag => {
          if (!flag) return false;
          actionConfigTableDs.submit().then(() => {
            actionConfigTableDs.query();
          });
        });
      },
      onCancel: () => {
        record.reset();
      },
    });
  };

  /**
   * handleActionDelete: 处理策略删除
   */
  const handleActionDelete = record => {
    actionConfigTableDs.delete(record);
  };

  /**
   * handleCheckTransparentDimension: 类型为透传的规则的维度查看点击回调
   */
  const handleCheckTransparentDimension = handleLoading => {
    const record = basicParamDs.current;
    // 载入本指标的维度数据
    indexDimensionDs.loadData(JSON.parse(record.get('dimensionality') || '[]'));
    // 弹窗内表格的按钮组
    const buttons = [
      <Button
        color="primary"
        funcType="flat"
        disabled={!record.get('ruleManagementHeaderId')}
        icon="playlist_add"
        onClick={handleOpenTransparentDimModal}
      >
        {intl.get(`${viewPrompt}.button.add`).d('添加')}
      </Button>,
      <ReactButton
        status="delete"
        dataSet={indexDimensionDs}
        onClick={handleDeleteTransparentDim}
      />,
    ];
    Modal.open({
      key: transparentDimensionCheckModalKey,
      title: intl.get(`${viewPrompt}.modal.checkDimension`).d('查看维度'),
      drawer: true,
      maskClosable: true,
      footer: okBtn => okBtn,
      children: (
        <IndexDimensionTable
          tableDs={indexDimensionDs}
          buttons={record.get('ruleManagementHeaderId') ? buttons : []}
        />
      ),
      onClose: () => {
        indexDimensionDs.loadData([]);
        handleLoading(false); // 响应式组件的loading去除渲染
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
   * handleDeleteTransparentDim: 处理维度删除
   * @param {Function} handleCompLoading 子组件的按钮加载函数
   */
  const handleDeleteTransparentDim = handleCompLoading => {
    // 先删除indexDimensionDs内的元素
    indexDimensionDs.remove(indexDimensionDs.selected);
    // 提交indexMessageDs
    basicParamDs.current.set('dimensionality', JSON.stringify(indexDimensionDs.toData()));
    // 处理规则保存
    handleBasicParamSave(
      undefined,
      () => {
        // 出错则恢复原数据
        basicParamDs.current.reset();
      },
      () => {
        // 无论成功与否都必须载入本指标的维度数据
        indexDimensionDs.loadData(JSON.parse(basicParamDs.current.get('dimensionality') || '[]'));
        handleCompLoading(false);
      }
    );
  };

  /**
   * handleTransparentDimModalOpen: 透传参数的维度查看新增按钮回调，打开弹窗
   */
  const handleOpenTransparentDimModal = () => {
    // 获取本规则的服务编码, 规则头id已经在路径上
    dimensionListDs.query(1, {
      ruleManagementHeaderId,
    });
    Modal.open({
      key: dimensionListModalKey,
      title: intl.get(`${viewPrompt}.modal.chooseDimension`).d('维度选择'),
      children: <AddDimensionTable tableDs={dimensionListDs} />,
      footer: (_, cancelBtn, modal) => {
        return (
          <Fragment>
            <ReactButton
              status="select"
              dataSet={dimensionListDs}
              onClick={() => {
                handleAddTransparentDim(modal);
              }}
            />
            {cancelBtn}
          </Fragment>
        );
      },
      onClose: () => {
        dimensionListDs.loadData([]);
      },
    });
  };

  /**
   * handleTransparentDimAdd: 处理透传类型的规则的维度添加事件
   * @param {Object} modal
   */
  const handleAddTransparentDim = modal => {
    // 把选中的维度项添加进维度信息DS
    indexDimensionDs.push(...dimensionListDs.selected);
    // 提交indexMessageDs
    basicParamDs.current.set('dimensionality', JSON.stringify(indexDimensionDs.toData()));
    // 保存本规则
    handleBasicParamSave(
      modal,
      () => {
        // 出错则恢复原数据
        basicParamDs.current.reset();
      },
      () => {
        // 无论查询如何，都必须载入本指标的维度数据
        indexDimensionDs.loadData(JSON.parse(basicParamDs.current.get('dimensionality') || '[]'));
        modal.close();
      }
    );
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
   * renderHeaderBtn: 渲染头部按钮
   * @returns {ReactNode} 按钮节点
   */
  const renderHeaderBtn = () => {
    if (currentTabKey === 'basic') {
      return (
        <Fragment>
          {type === '1' && (
            <Button onClick={handleViewOutParam} icon="outbond-o">
              {intl.get('sdps.ruleManagesDetail.view.btn.viewOutPutParams').d('查看出参')}
            </Button>
          )}
          {type === '1' && (
            <ReactButton
              status="checkDimension"
              dataSet={basicParamDs}
              onClick={handleCheckTransparentDimension}
            />
          )}
          <Button
            color="primary"
            icon="save-o"
            onClick={() => {
              handleBasicParamSave();
            }}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Fragment>
      );
    } else if (currentTabKey === 'index') {
      return (
        <Fragment>
          <ReactButton
            status="save"
            buttonProps={{
              icon: 'save-o',
            }}
            dataSet={indexMessageDs}
            onClick={handleCompLoading => {
              handleIndexSave().finally(() => {
                handleCompLoading(false);
              });
            }}
          />
        </Fragment>
      );
    } else if (currentTabKey === 'action') {
      return null;
    }
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
   * handlePageBack: 页面回退的回调
   */
  const handlePageBack = () => {
    basicParamDs.loadData([]);
    indexMessageDs.loadData([]);
    indexDimensionDs.loadData([]);
    dimensionListDs.loadData([]);
    actionConfigTableDs.loadData([]);
    setRuleManagementHeaderId(undefined);
  };

  return (
    <Spin spinning={spinning}>
      <Header
        title={intl.get(`${viewPrompt}.header.title`).d('规则详情')}
        backPath="/sdps/rule-management-org/list?backFlag=true"
        onBack={handlePageBack}
      >
        {renderHeaderBtn()}
      </Header>
      <div className={styles['rule-manage-readonly-basic']}>
        <div
          style={{
            borderRight: '1px solid rgba(229,231,236,1)',
            padding: '20px 0 20px 20px',
            flex: 1,
          }}
        >
          <Tabs activeKey={currentTabKey} tabPosition="left" onChange={handleTabChange}>
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
          {currentTabKey === 'basic' ? (
            <BasicParamTable
              formDs={basicParamDs}
              ruleManagementHeaderId={ruleManagementHeaderId}
            />
          ) : null}
          {currentTabKey === 'index' ? (
            <IndexMessageTable
              tableDs={indexMessageDs}
              indexAddDs={indexAddDs}
              basicParamDs={basicParamDs}
              indexMessageDs={indexMessageDs}
              onDimensionClick={handleDimensionCheck}
              // onDeleteIndex={handleIndexDelete}
              onRouterDimension={handleRouterDimension}
            />
          ) : null}
          {currentTabKey === 'action' ? (
            <ActionConfigTable
              tableDs={actionConfigTableDs}
              tenantId={tenantId}
              ruleCode={ruleCode}
              code={code}
              onActionAdd={handleActionAdd}
              onOpenCalculationModal={openCalculationModal}
              handleActionEdit={handleActionEdit}
              handleActionDelete={handleActionDelete}
            />
          ) : null}
        </div>
      </div>

      {/* <C7nModal
        closable
        title=""
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={[
          <Button color="primary" onClick={handleSave}>
            {intl.get('hzero.common.model.save').d('保存')}
          </Button>,
          <Button onClick={handleUnSave}>
            {intl.get('sdps.ruleManagesDetail.button.noSave').d('不保存')}
          </Button>,
        ]}
      >
        <div style={{ fontSize: '14px', lineHeight: '36px' }}>
          {intl
            .get('sdps.ruleManagesDetail.message.confirm.giveUpTip')
            .d('你有修改未保存，是否保存后离开？')}
        </div>
      </C7nModal> */}
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
      const indexAddDs = new DataSet(getIndexAddDs());
      const indexDimensionDs = new DataSet(getIndexDimensionDs());
      const dimensionListDs = new DataSet(getDimensionListDs());
      const actionConfigTableDs = new DataSet(getActionConfigTableDs());
      const outDimensionDs = new DataSet(getOutDimensionDs());
      const valueDs = {
        basicParamDs,
        indexMessageDs,
        indexAddDs,
        outDimensionDs,
        indexDimensionDs,
        dimensionListDs,
        actionConfigTableDs,
      };
      return { valueDs };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(Detail)
);

/**
 * 规则配置详情 - 编辑页面（平台级）
 * @date: 2021-12-20
 * @author: Zip <Zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */

import React, { useEffect, useState, Fragment } from 'react';
import { DataSet, Button, Spin, Modal } from 'choerodon-ui/pro';
import { Tabs, Modal as C7nModal } from 'choerodon-ui';
import qs from 'querystring';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

// import { initIndexDimesion } from '@/services/riskManagesService';
import { fetchOutPlatformList } from '@/services/ruleManagesOrgService';

import {
  getBasicParamDs,
  getIndexMessageDs,
  getIndexAddDs,
  getIndexDimensionDs,
  getDimensionListDs,
  getActionConfigTableDs,
  getOutDimensionDs,
} from '../store/ruleManagesDetailDs';
import BasicParamTable from './components/BasicParamTable';
import IndexMessageTable from './components/IndexMessageTable';
import AddIndexTable from './components/AddIndexTable';
import IndexDimensionTable from './components/IndexDimensionTable';
import AddDimensionTable from './components/AddDimensionTable';
import ActionConfigTable from './components/ActionConfigTable';
import ActionConfigForm from './components/ActionConfigForm';
import OutParamsTable from './components/OutParamsTable';
import { ReactButton } from './components/ReactButton';

const { TabPane } = Tabs;
const viewPrompt = 'sdps.ruleManagesDetail.view'; // 多语言前缀
const indexAddModalKey = Modal.key(); // modal的唯一key
const dimensionCheckModalKey = Modal.key();
const dimensionListModalKey = Modal.key();
const actionAddModalKey = Modal.key();
const transparentDimensionCheckModalKey = Modal.key();

let recordIndex = 0;

function Detail(props = {}) {
  const { tenantId, ruleId: id, activeKey: backKey, uuidCode } = qs.parse(
    props.location.search.substr(1)
  ); // 截取url上面传递参数
  const [currentTabKey, handleCurrentTabKey] = useState('basic'); // 控制tab页的当前key
  const [ruleId, setRuleId] = useState(id || undefined); // 主键
  const [spinning, handleSpinning] = useState(false); // tab页加载事件
  const [type, handleType] = useState(undefined); // 规则类型字段，区别规则是标准（0）或透传（1），字符串类型

  const [visible, setVisible] = useState(false);
  const [activeKeyVal, setActiveKey] = useState(null);

  const {
    basicParamDs,
    indexMessageDs,
    indexAddDs,
    indexDimensionDs,
    dimensionListDs,
    actionConfigTableDs,
    outDimensionDs,
  } = props.valueDs;

  useEffect(() => {
    return () => {
      recordIndex = 0;
    };
  }, []);

  /**
   * 副作用——查询,当点击了编辑（metaDefinitionId存在）时查询一遍数据
   */
  useEffect(() => {
    if (ruleId && uuidCode) {
      handleSpinning(true);
      // 若规则编码存在，说明是编辑
      // indexMessageDs的uuidCode为查询参数，因为删除的过程会自动查询参数，因此不能用query传参
      indexMessageDs.setState('uuidCode', uuidCode);

      Promise.all([
        basicParamDs.query(1, { ruleId }).then(() => {
          if (basicParamDs.current.get('ruleType') === '0') {
            // actionConfigTableDs的查询、提交和删除需要的参数
            actionConfigTableDs.setState('uuidCode', uuidCode);
            actionConfigTableDs.query();
          }
          handleType(basicParamDs.current.get('ruleType')); // 规则查询成功则将type值存入state
        }),
        indexMessageDs.query(),
      ]).finally(() => {
        handleSpinning(false);
      });
    }
  }, [ruleId]);

  /**
   * 先保存，再跳转
   * @param {*} activeKey
   */
  const handleSave = async () => {
    indexMessageDs.setState('uuidCode', uuidCode);
    const isValid = await indexMessageDs.validate();

    if (isValid) {
      const res = await indexMessageDs.submit();
      if (res && res.success) {
        setVisible(false);
        handleCurrentTabKey(activeKeyVal);
      }
    }
  };

  /**
   * 不保存 跳转
   */
  const handleUnSave = () => {
    indexMessageDs.query();
    setVisible(false);
    handleCurrentTabKey(activeKeyVal);
  };

  /**
   * handleTabChange: 处理Tab切换事件——保存tab
   * @param {String} tabKey
   */
  const handleTabChange = (activeKey) => {
    if (currentTabKey === 'index' && indexMessageDs.dirty && activeKey !== 'index') {
      // 从指标页离开 未保存
      setVisible(true);
      setActiveKey(activeKey);
    } else {
      handleCurrentTabKey(activeKey);
    }
  };

  /**
   * handleBasicParamSave: basicParam表单保存
   * @param {Object} modal
   * @param {Function} errorFn
   * @param {Function} finalFn
   * @param {fromTransparentModal} boolean 是否是从透传的维度弹窗调用的(这关系到是否要进行维度初始化)
   */
  // eslint-disable-next-line no-unused-vars
  const handleBasicParamSave = (modal, errFn, finaFn, fromTransparentModal = false) => {
    handleSpinning(true);
    basicParamDs.validate().then((flag) => {
      // 排除校验失败
      if (!flag) {
        handleSpinning(false);
        if (modal) modal.close();
        return;
      }
      // 排除未修改数据
      if (!basicParamDs.dirty) {
        handleSpinning(false);
        if (modal) modal.close();
        notification.warning({
          message: intl.get('hzero.common.message.confirm.title').d('提示'),
          description: intl.get(`${viewPrompt}.notification.modify`).d('请修改数据'),
        });
        return;
      }
      // 设置当前的tenantId，查询接口需要使用
      basicParamDs.setState('tenantId', tenantId);
      // 如果不是新建，则设置当前的rhId
      if (ruleId) {
        basicParamDs.setState('ruleId', ruleId);
      }
      // 透传的规则新建 或 规则编码变化时 需要进行维度初始化(即透传维度编辑的弹窗里删除按钮)
      // if (type === '1' && !fromTransparentModal) {
      //   const record = basicParamDs.current;
      //   const serviceCode = record.get('serviceCode');
      //   initIndexDimesion({ serviceCode })
      //     .then((res) => {
      //       // 查询成功则存入透传规则的dimensionality字段,否则则是[]
      //       record.set('dimensionality', getResponse(res) ? JSON.stringify(res) : '[]');
      //       // 保存本规则配置
      //       basicParamDs
      //         .submit()
      //         .then((result) => {
      //           // 成功保存
      //           // 若本次是新建，则赋值上ruleId，页面变为编辑状态
      //           if (getResponse(result)) {
      //             setRuleId((result?.content?.length ?? 0) !== 0 && result?.content[0]?.ruleId);
      //           }
      //         })
      //         .catch(() => {
      //           if (errFn) errFn();
      //         })
      //         .finally(() => {
      //           handleSpinning(false);
      //           if (modal) modal.close();
      //           if (finaFn) finaFn();
      //         });
      //     })
      //     .finally(() => {
      //       handleSpinning(false);
      //     });
      //   return;
      // }
      // 对于非透传或非新建的规则，直接保存即可
      basicParamDs
        .submit()
        .then((res) => {
          // 成功保存
          // 若本次是新建，则赋值上ruleId，页面变为编辑状态
          if (getResponse(res)) {
            setRuleId((res?.content?.length ?? 0) !== 0 && res?.content[0]?.ruleId);
            basicParamDs.query(1, {
              ruleId: (res?.content?.length ?? 0) !== 0 && res?.content[0]?.ruleId,
            });
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
   * handleIndexAdd: 处理指标信息添加
   */
  const handleIndexAdd = () => {
    // 查询参数设置
    indexAddDs.query();
    Modal.open({
      key: indexAddModalKey,
      title: intl.get(`${viewPrompt}.modal.addIndex`).d('添加指标'),
      drawer: true,
      style: { width: '6.4rem' },
      maskClosable: true,
      footer: (_, cancelBtn, modal) => {
        return (
          <Fragment>
            <ReactButton
              status="select"
              dataSet={indexAddDs}
              onClick={() => {
                handleSelectIndex(modal);
              }}
            />
            {cancelBtn}
          </Fragment>
        );
      },
      children: <AddIndexTable tableDs={indexAddDs} />,
      onClose: () => {
        indexAddDs.reset();
      },
    });
  };

  /**
   * handleSelectIndex: 添加-选中指标
   */
  const handleSelectIndex = (modal) => {
    // 如果只是平台级本身的指标添加，则需要进行维度初始化
    const promiseArr = [];
    indexAddDs.selected.forEach((item) => {
      // 取得其指标编码
      const indexCode = item.get('indexCode');
      // 将记录加入指标DS,并添加计算指标字段
      indexMessageDs.create({
        ...item.toData(),
        calculateCode: indexCode,
        ruleCode: basicParamDs.current.get('ruleCode'),
        enableFlag: '1',
      });
      // }
    });
    // 所有指标的维度初始化完毕后方可关闭modal
    Promise.all(promiseArr).finally(() => {
      modal.close();
    });
  };

  /**
   * handleIndexSave: 处理指标信息保存
   * @returns PromiseObj
   */
  const handleIndexSave = () => {
    // 提交时需要的参数
    indexMessageDs.setState('uuidCode', uuidCode);
    indexMessageDs.setState('tenantId', tenantId);
    return indexMessageDs.submit();
  };

  /**
   * handleIndexDelete: 处理指标删除
   * @param {*} record
   */
  const handleIndexDelete = (record) => {
    // 删除传参需要
    indexMessageDs.setState('uuidCode', uuidCode);
    return indexMessageDs.delete(record);
  };

  /**
   * 上一条
   * @param {*} dataSet
   */
  const handlePrev = (dataSet) => {
    const indexNum = recordIndex <= 0 ? 0 : recordIndex - 1;
    const dataItem = dataSet.get(indexNum);

    dataSet.select(indexNum);
    handleDimensionCheck(dataItem, dataSet);
    if (indexNum <= 0) {
      notification.warning({
        message: intl.get('hzero.common.message.confirm.title').d('提示'),
        description: intl.get('sdps.ruleManagesDetail.view.mesage.toPrevItem').d('已到第一条数据'),
      });
    }
  };

  /**
   * 下一条
   * @param {*} dataSet
   */
  const handleNext = (dataSet) => {
    const indexNum = recordIndex >= dataSet.length - 1 ? dataSet.length - 1 : recordIndex + 1;
    const dataItem = dataSet.get(indexNum);

    dataSet.select(indexNum);
    handleDimensionCheck(dataItem, dataSet);
    if (indexNum >= dataSet.length - 1) {
      notification.warning({
        message: intl.get('hzero.common.message.confirm.title').d('提示'),
        description: intl
          .get('sdps.ruleManagesDetail.view.mesage.toLastItem')
          .d('已到最后一条数据'),
      });
    }
  };

  /**
   * handleIndexDimDistribute: 处理指标页面的查看维度点击事件
   * @param {Object} record
   */
  const handleDimensionCheck = (record, dataSet) => {
    recordIndex = record.index || 0;

    // 载入本指标的维度数据
    indexDimensionDs.loadData(JSON.parse(record.get('dimensionality') || '[]'));
    // 弹窗内表格的按钮组
    const buttons = [
      <Button
        onClick={handleOpenAddDimModal}
        color="primary"
        funcType="flat"
        disabled={!record.get('ruleManagementLineId')}
        icon="add"
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
      drawer: true,
      maskClosable: true,
      mask: false,
      closable: true,
      footer: (okBtn) => (
        <div>
          {okBtn}
          <Button onClick={() => handlePrev(dataSet)}>
            {intl.get('sdps.ruleManagesDetail.view.button.prevPage').d('上一页')}
          </Button>
          <Button onClick={() => handleNext(dataSet)}>
            {intl.get('sdps.ruleManagesDetail.view.button.nextPage').d('下一页')}
          </Button>
        </div>
      ),
      children: (
        <IndexDimensionTable
          tableDs={indexDimensionDs}
          handleAddDimension={handleAddDimension}
          buttons={ruleManagementLineId ? buttons : []}
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
    // 获取本规则的指标行id和服务编码
    const { ruleManagementLineId, serviceCode, ruleLineCode } = indexMessageDs.current.get([
      'ruleManagementLineId',
      'serviceCode',
      'ruleLineCode',
    ]);
    dimensionListDs.query(1, {
      serviceCode,
      ruleManagementLineId,
      ruleLineCode,
      tenantId,
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
  const handleAddDimension = (modal) => {
    const list = indexMessageDs.selected.length
      ? indexMessageDs.selected
      : [indexMessageDs.current];
    // 把选中的维度项添加进维度信息DS
    indexDimensionDs.push(...dimensionListDs.selected);
    // 提交indexMessageDs\
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
  const handleDeleteDimension = (handleCompLoading) => {
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
    actionConfigTableDs.current.set('uuidCode', basicParamDs.current.get('uuidCode'));
    actionConfigTableDs.current.set('chooseFlag', basicParamDs.current.get('chooseFlag'));
    actionConfigTableDs.current.set('ruleCode', basicParamDs.current.get('ruleCode'));
    actionConfigTableDs.current.set('tenantId', basicParamDs.current.get('tenantId'));

    Modal.open({
      key: actionAddModalKey,
      title: intl.get(`${viewPrompt}.modal.actionConfig`).d('策略配置'),
      drawer: true,
      children: <ActionConfigForm record={actionConfigTableDs.current} />,
      onOk: () => {
        return actionConfigTableDs.validate().then((flag) => {
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
  const handleActionEdit = (record) => {
    Modal.open({
      key: actionAddModalKey,
      title: intl.get(`${viewPrompt}.modal.actionEdit`).d('策略编辑'),
      drawer: true,
      maskClosable: true,
      children: <ActionConfigForm record={record} />,
      onOk: () => {
        return actionConfigTableDs.validate().then((flag) => {
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
  const handleActionDelete = (record) => {
    actionConfigTableDs.delete(record);
  };

  /**
   * handleTypeChange: 处理规则类型变化的回调
   */
  const handleTypeChange = () => {
    handleType(basicParamDs.current.get('ruleType'));
  };

  /**
   * handleCheckTransparentDimension: 类型为透传的规则的维度查看点击回调
   * @param {Function} handleLoading 子组件的按钮加载函数
   */
  const handleCheckTransparentDimension = (handleLoading) => {
    const record = basicParamDs.current;
    // 载入本指标的维度数据
    indexDimensionDs.loadData(JSON.parse(record.get('dimensionality') || '[]'));
    // 弹窗内表格的按钮组
    const buttons = [
      <Button
        color="primary"
        funcType="flat"
        disabled={!record.get('ruleId')}
        icon="add"
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
      title: intl.get('sdps.ruleManagesDetail.view.btn.viewOutPutParams').d('查看出参'),
      drawer: true,
      maskClosable: true,
      footer: (okBtn) => okBtn,
      children: (
        <IndexDimensionTable
          tableDs={indexDimensionDs}
          buttons={record.get('ruleId') ? buttons : []}
        />
      ),
      onClose: () => {
        indexDimensionDs.loadData([]);
        handleLoading(false); // 响应式组件的loading去除渲染
      },
    });
  };

  /**
   * 出参配置弹窗
   */
  const handleViewOutParam = async () => {
    const record = basicParamDs.current;
    const serviceCode = record.get('serviceCode');

    const res = await fetchOutPlatformList({ serviceCode });

    if (getResponse(res)) {
      // 载入本指标的维度数据
      outDimensionDs.loadData([...res]);
    }

    Modal.open({
      key: transparentDimensionCheckModalKey,
      title: intl.get('sdps.ruleManagesDetail.view.btn.viewOutPutParams').d('查看出参'),
      drawer: true,
      maskClosable: true,
      footer: (okBtn) => okBtn,
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
  const handleDeleteTransparentDim = (handleCompLoading) => {
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
      },
      true // 这是在维度修改弹窗里调用的，不可以进行维度初始化
    );
  };

  /**
   * handleTransparentDimModalOpen: 透传参数的维度查看新增按钮回调，打开弹窗
   */
  const handleOpenTransparentDimModal = () => {
    // 获取本规则的服务编码, 规则头id已经在路径上
    const serviceCode = basicParamDs.current.get('serviceCode');
    dimensionListDs.query(1, {
      serviceCode,
      ruleId,
      tenantId,
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
  const handleAddTransparentDim = (modal) => {
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
      },
      true // 不可以进行维度初始化
    );
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
            <Button onClick={handleViewOutParam}>
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
            dataSet={indexMessageDs}
            onClick={(handleCompLoading) => {
              handleIndexSave().finally(() => {
                handleCompLoading(false);
              });
            }}
          />
          <Button onClick={handleIndexAdd}>{intl.get(`${viewPrompt}.button.add`).d('添加')}</Button>
        </Fragment>
      );
    } else if (currentTabKey === 'action') {
      return (
        <Button onClick={handleActionAdd} color="primary">
          {intl.get(`${viewPrompt}.button.add`).d('添加')}
        </Button>
      );
    }
  };

  /**
   * handlePageBack: 页面回退的回调
   */
  const handlePageBack = () => {
    basicParamDs.loadData([]);
    indexMessageDs.loadData([]);
    indexDimensionDs.loadData([]);
    dimensionListDs.loadData([]);
    // 清除basicParamDs的状态
    basicParamDs.setState('tenantId', undefined);
    basicParamDs.setState('ruleId', undefined);
  };

  return (
    <Fragment>
      <Header
        title={intl.get(`${viewPrompt}.header.title`).d('规则详情')}
        backPath={`/sdps/rule-management/list?backKey=${backKey}`}
        onBack={handlePageBack}
      >
        {renderHeaderBtn()}
      </Header>
      <Content>
        <Spin spinning={spinning}>
          <Tabs activeKey={currentTabKey} onChange={handleTabChange}>
            <TabPane tab={intl.get(`${viewPrompt}.tab.basic`).d('基本信息')} key="basic">
              <BasicParamTable
                formDs={basicParamDs}
                ruleId={ruleId}
                onTypeChange={handleTypeChange}
              />
            </TabPane>
            {type === '0' && (
              <TabPane
                tab={intl.get(`${viewPrompt}.tab.indexMessage`).d('指标信息')}
                key="index"
                disabled={!ruleId}
              >
                <IndexMessageTable
                  tableDs={indexMessageDs}
                  tenantId={tenantId}
                  onDimensionClick={handleDimensionCheck}
                  onDeleteIndex={handleIndexDelete}
                />
              </TabPane>
            )}
            {type === '0' && (
              <TabPane
                tab={intl.get(`${viewPrompt}.tab.action`).d('策略配置')}
                key="action"
                disabled={!ruleId}
              >
                <ActionConfigTable
                  tableDs={actionConfigTableDs}
                  handleActionEdit={handleActionEdit}
                  handleActionDelete={handleActionDelete}
                />
              </TabPane>
            )}
          </Tabs>
        </Spin>
      </Content>
      <C7nModal
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
      </C7nModal>
    </Fragment>
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
      outDimensionDs.selection = false; //

      const valueDs = {
        basicParamDs,
        indexMessageDs,
        indexAddDs,
        indexDimensionDs,
        dimensionListDs,
        actionConfigTableDs,
        outDimensionDs,
      };
      return { valueDs };
    },
    { cacheState: false, keepOriginDataSet: true }
  )(Detail)
);

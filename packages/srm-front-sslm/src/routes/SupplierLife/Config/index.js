/*
 * 供应商生命周期配置
 * @date: 2018-9-7
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Form, Button, Spin, Select, Icon, Modal, Tooltip } from 'hzero-ui';
import { connect } from 'dva';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import classNames from 'classnames';
// import uuid from 'uuid/v4';
import { Bind } from 'lodash-decorators';
import { last, head, isEmpty, cloneDeep, remove, split } from 'lodash';
import Checkbox from 'components/Checkbox';
import { Header, Content } from 'components/Page';
import { getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import LovMulti from 'srm-front-cuz/lib/custH0X/LovMulti';
import TLEditor from '@/routes/components/TLEditor';
import NodeContainerModal from './NodeContainerModal';
import styles from './index.less';
import RecommendPreview from '../Recommend/Preview';
import PotentialPreview from '../Potential/Preview';
import EliminatePreview from '../Eliminate/Preview';
import QualifiedPreview from '../Qualified/Preview';
import RegisterPreview from '../Register/Preview';
import PreparePreview from '../Prepare/Preview';

/**
 * 供应商生命周期配置
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} supplierLifeConfig - 数据源
 * @reactProps {object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@connect(({ loading, supplierLifeConfig }) => ({
  supplierLifeConfig,
  loading: {
    fetch: loading.effects['supplierLifeConfig/fetchLifeStage'],
    sure: loading.effects['supplierLifeConfig/saveLifeStage'],
    form: loading.effects['supplierLifeConfig/fetchApplyForm'],
  },
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: ['sslm.supplierLifeConfig', 'sslm.commonApplication', 'sslm.common'],
})
export default class SupplierLifeConfig extends Component {
  /**
   * state初始化
   */
  constructor(props) {
    super(props);
    this.state = {
      activeNode: {}, // 当前选中(激活)的节点
    };
  }

  /**
   * componentDidMount
   * render()调用后加载数据
   */
  componentDidMount() {
    this.init();
    document.addEventListener('click', this.handleClickOutside, true);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside, true);
  }

  init() {
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'supplierLifeConfig/fetchStageNode',
      payload: {
        tenantId,
      },
    });
    dispatch({
      type: 'supplierLifeConfig/fetchApplyForm',
      payload: {
        tenantId,
      },
    });
    // 查询值集
    dispatch({
      type: 'supplierLifeConfig/init',
      payload: {
        bidControlList: 'SSLM.LIFE_CYCLE_CONTROL',
        tenantId,
      },
    });
    dispatch({
      type: 'supplierLifeConfig/fetchLifeStage',
      payload: {
        tenantId,
      },
    }).then(() => {
      const { lifeStage = [] } = this.props.supplierLifeConfig;
      this.setState({
        activeNode: {
          index: 0, // 当前节点在生命节点周期配置中的索引
          allowSourceFlag: ((lifeStage[0] || {}).cycleStages || {}).allowSourceFlag,
          allowOrders: ((lifeStage[0] || {}).cycleStages || {}).allowOrders,
          allowProtocolFlag: ((lifeStage[0] || {}).cycleStages || {}).allowProtocolFlag,
          allowSmallOrders: ((lifeStage[0] || {}).cycleStages || {}).allowSmallOrders,
          allowSettleAccount: ((lifeStage[0] || {}).cycleStages || {}).allowSettleAccount,
          allowImportErpFlag: ((lifeStage[0] || {}).cycleStages || {}).allowImportErpFlag,
          checkAbilityFlag: ((lifeStage[0] || {}).cycleStages || {}).checkAbilityFlag,
          checkDegradeFlag: ((lifeStage[0] || {}).cycleStages || {}).checkDegradeFlag,
          checkUpgradeFlag: ((lifeStage[0] || {}).cycleStages || {}).checkUpgradeFlag,
          allowBidControl: ((lifeStage[0] || {}).cycleStages || {}).allowBidControl,
          stageCode: ((lifeStage[0] || {}).cycleStages || {}).stageCode,
          finalIndex: lifeStage.length - 1, // 生命阶段数量
          pageId: ((lifeStage[0] || {}).assignUpgradePage || {}).pageId, // 当前节点关联的升级申请单Id
          stageId: ((lifeStage[0] || {}).cycleStages || {}).stageId, // 当前节点的阶段Id
          editPath:
            ((lifeStage[0] || {}).assignUpgradePage || {}).editPath ||
            ((lifeStage[0] || {}).assignDegradePage || {}).editPath, // 升级申请单的 editPath
          degradeEditPath: ((lifeStage[0] || {}).assignDegradePage || {}).editPath, // 降级申请单的 editPath
        },
      });
    });
  }

  @Bind()
  handleClickOutside(e) {
    if (e.target.nodeName === 'I' && e.target.className.includes('plus-node')) {
      this.setState({
        clientX: e.clientX,
        clientY: e.clientY + 10,
      });
    }
    // setTimeout(()=> {
    //   const page = document.getElementsByClassName('page-content');
    //   const mask = document.getElementsByClassName('ant-modal-wrap');
    //   if(!isEmpty(mask) && window.innerWidth < e.clientX + 300) {
    //     page[0].scrollLeft = 300;
    //     mask[0].scrollLeft = 300;
    //   }
    // }, 100);
  }

  /**
   * 节点拖动结束后处理方法
   * @param {object} result
   */
  @Bind()
  handleDragEnd(result = {}) {
    const {
      dispatch,
      supplierLifeConfig: { lifeStage = [] },
    } = this.props;
    const { source, destination } = result;
    if (!destination) {
      return;
    }

    const newLifeStage = cloneDeep(lifeStage);
    const firstLifeStage = head(newLifeStage);
    const lastLifeStage = last(newLifeStage);
    remove(newLifeStage, n => {
      return (
        n.cycleStages.stageId === firstLifeStage.cycleStages.stageId ||
        n.cycleStages.stageId === lastLifeStage.cycleStages.stageId
      );
    });

    const [dragItem] = newLifeStage.splice(source.index, 1);
    newLifeStage.splice(destination.index, 0, dragItem);

    newLifeStage.push(lastLifeStage);
    newLifeStage.unshift(firstLifeStage);
    dispatch({
      type: 'supplierLifeConfig/updateState',
      payload: { lifeStage: newLifeStage },
    });
  }

  /**
   * 移除指定节点
   * @param {number} index - 节点索引
   */
  @Bind()
  handleRemove(index) {
    const {
      dispatch,
      tenantId,
      supplierLifeConfig: { lifeStage = [] },
    } = this.props;
    const $this = this;
    Modal.confirm({
      title: (
        <span>
          {intl.get('sslm.supplierLifeConfig.view.message.title.deleteModal').d('确定删除节点？')}
        </span>
      ),
      content: intl
        .get('sslm.supplierLifeConfig.view.message.content.deleteModal')
        .d('是否将该生命周期节点移入回收站？'),
      onOk: () => {
        const newList = lifeStage.filter((item, _index) => index !== _index);
        dispatch({
          type: 'supplierLifeConfig/deleteStage',
          payload: {
            tenantId,
            stageId: lifeStage[index].stageId,
          },
        }).then(res => {
          if (res) {
            dispatch({
              type: 'supplierLifeConfig/updateState',
              payload: { lifeStage: newList },
            });
            $this.setState({
              activeNode: {
                index,
                finalIndex: newList.length - 1,
                allowSourceFlag: newList[index].cycleStages.allowSourceFlag,
                allowOrders: newList[index].cycleStages.allowOrders,
                allowProtocolFlag: newList[index].cycleStages.allowProtocolFlag,
                allowSmallOrders: newList[index].cycleStages.allowSmallOrders,
                allowSettleAccount: newList[index].cycleStages.allowSettleAccount,
                allowImportErpFlag: newList[index].cycleStages.allowImportErpFlag,
                checkAbilityFlag: newList[index].cycleStages.checkAbilityFlag,
                checkDegradeFlag: newList[index].cycleStages.checkDegradeFlag,
                checkUpgradeFlag: newList[index].cycleStages.checkUpgradeFlag,
                allowBidControl: newList[index].cycleStages.allowBidControl,
                stageCode: newList[index].cycleStages.stageCode,
                pageId: (newList[index].assignUpgradePage || {}).pageId,
                stageId: newList[index].cycleStages.stageId,
                editPath:
                  (newList[index].assignUpgradePage || {}).editPath ||
                  (newList[index].assignDegradePage || {}).editPath,
                degradeEditPath: (newList[index].assignDegradePage || {}).editPath,
                // stageDescription: newList[index].cycleStages.stageDescription,
              },
            });
          }
        });
      },
    });
  }

  /**
   * 变更节点名称
   * @param {string} stageCode - 目标节点阶段编码
   * @param {string} keyCode - 键盘事件编码
   */
  @Bind()
  handleChangeDescription(stageCode = '', keyCode) {
    const {
      dispatch,
      tenantId,
      form: { getFieldValue, getFieldsValue },
      supplierLifeConfig: { lifeStage = [] },
    } = this.props;
    if (keyCode === 13) {
      const formValue = getFieldsValue();
      const tls = getFieldValue('_tls');
      // 获取编辑状态的阶段
      const editLifeStage = lifeStage.filter(item => item.editable);
      const data = editLifeStage.map(item => {
        if (item.cycleStages.stageCode === stageCode) {
          return {
            stageId: item.stageId,
            objectVersionNumber: item.cycleStages.stageObjectVersionNumber,
            stageDescription: getFieldValue(`${stageCode}`),
            _tls: tls,
          };
        } else {
          return {
            stageId: item.stageId,
            objectVersionNumber: item.cycleStages.stageObjectVersionNumber,
            stageDescription: formValue[`${item.cycleStages.stageCode}`],
          };
        }
      });
      dispatch({
        type: 'supplierLifeConfig/updateStageName',
        payload: {
          tenantId,
          data,
        },
      }).then(res => {
        if (res) {
          dispatch({
            type: 'supplierLifeConfig/fetchStageNode',
            payload: {
              tenantId,
            },
          });
          dispatch({
            type: 'supplierLifeConfig/fetchLifeStage',
            payload: {
              tenantId,
            },
          });
        }
      });
    } else {
      const newLifeStage = lifeStage.map(item =>
        item.cycleStages.stageCode === stageCode
          ? { ...item, stageDescription: getFieldValue(`${stageCode}`) }
          : item
      );
      dispatch({
        type: 'supplierLifeConfig/updateState',
        payload: {
          lifeStage: newLifeStage,
        },
      });
    }
  }

  /**
   * 双击阶段名称进行修改
   * @param {number} index - 阶段索引
   */
  @Bind()
  handleEdit(index) {
    const {
      dispatch,
      supplierLifeConfig: { lifeStage = [] },
    } = this.props;

    // if (index !== lifeStage.length - 1) {
    const newList = lifeStage.map((item, _index) =>
      index === _index ? { ...item, editable: true } : item
    );
    dispatch({
      type: 'supplierLifeConfig/updateState',
      payload: { lifeStage: newList },
    });
    // }
  }

  /**
   * 节点维护Modal关闭
   */
  @Bind()
  handleCancel() {
    this.setState({
      modalVisible: false,
      clientX: 0,
      clientY: 0,
    });
  }

  /**
   * 节点维护Modal数据变更
   * @param {object} values - 变更数据
   */
  @Bind()
  handleChange(values, flag) {
    this.props.dispatch({ type: 'supplierLifeConfig/updateState', payload: { ...values } });
    this.setState({ modalVisible: flag });
  }

  /**
   * 添加节点
   * @param {Array} stages - 添加节点后的生命周期列表
   */
  @Bind()
  handleSelect(stages) {
    const { activeNode } = this.state;
    this.props.dispatch({
      type: 'supplierLifeConfig/updateState',
      payload: { lifeStage: [...stages] },
    });
    this.setState({
      modalVisible: false,
      activeNode: { ...activeNode, finalIndex: stages.length - 1 },
    });
  }

  /**
   * 删除节点
   * @param {object} item - 节点
   */
  @Bind()
  handleDelete(item) {
    const { tenantId, dispatch } = this.props;
    dispatch({
      type: 'supplierLifeConfig/deleteNode',
      payload: {
        stageId: item.stageId,
        tenantId,
      },
    }).then(res => {
      if (res) {
        dispatch({
          type: 'supplierLifeConfig/fetchStageNode',
          payload: {
            tenantId,
          },
        });
      }
    });
  }

  /**
   * 对节点池中新增的节点进行保存
   * @param {string} value -节点名称
   */
  @Bind()
  handleSaveNode(params) {
    const { dispatch, tenantId } = this.props;
    return dispatch({
      type: 'supplierLifeConfig/saveNode',
      payload: {
        ...params,
        tenantId,
      },
    });
  }

  /**
   * 流程更改确认按钮
   */
  @Bind()
  handleSureOption() {
    const {
      dispatch,
      tenantId,
      supplierLifeConfig: { lifeStage = [], otherProps = {} },
      form: { getFieldsValue },
    } = this.props;
    const formValue = getFieldsValue();
    dispatch({
      type: 'supplierLifeConfig/saveLifeStage',
      payload: {
        tenantId,
        data: {
          ...otherProps,
          lifeCycleStgAssigns: lifeStage.map((item, index) => {
            const m = item;
            const newStageDescription =
              formValue[`${item.cycleStages.stageCode}`] || item.cycleStages.stageDescription;
            m.cycleStages.stageDescription = newStageDescription;
            return {
              ...m,
              orderSeq: index + 1,
            };
          }),
        },
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.setState(
          {
            activeNode: {},
          },
          () => {
            this.init();
          }
        );
      }
    });
  }

  /**
   * 变更激活节点
   * @param {object} target - 激活节点
   */
  handleChangeActiveNode(target) {
    const { lifeStage = [] } = this.props.supplierLifeConfig;
    const { activeNode = {} } = this.state;
    const index = lifeStage.findIndex(
      item => item.cycleStages.stageId === target.cycleStages.stageId
    );
    this.setState({
      activeNode: {
        index,
        finalIndex: activeNode.finalIndex,
        allowSourceFlag: target.cycleStages.allowSourceFlag,
        allowOrders: target.cycleStages.allowOrders,
        allowProtocolFlag: target.cycleStages.allowProtocolFlag,
        allowSmallOrders: target.cycleStages.allowSmallOrders,
        allowSettleAccount: target.cycleStages.allowSettleAccount,
        allowImportErpFlag: target.cycleStages.allowImportErpFlag,
        checkAbilityFlag: target.cycleStages.checkAbilityFlag,
        checkDegradeFlag: target.cycleStages.checkDegradeFlag,
        checkUpgradeFlag: target.cycleStages.checkUpgradeFlag,
        allowBidControl: target.cycleStages.allowBidControl,
        stageCode: target.cycleStages.stageCode,
        pageId: (target.assignUpgradePage || {}).pageId,
        stageId: target.cycleStages.stageId,
        editPath:
          (target.assignUpgradePage || {}).editPath || (target.assignDegradePage || {}).editPath,
        degradeEditPath: (target.assignDegradePage || {}).editPath,
      },
    });
  }

  /**
   * 激活节点变更申请表单
   * @param {object} value
   */
  handleChangeFormType(value) {
    const { activeNode = {} } = this.state;
    const {
      dispatch,
      supplierLifeConfig: { lifeStage = [], applyFormList = [] },
    } = this.props;
    const target = applyFormList.find(item => item.editPath === value);
    const newStage = lifeStage.map(item =>
      item.cycleStages.stageId === activeNode.stageId
        ? {
            ...item,
            assignUpgradePage: {
              ...item.assignUpgradePage,
              pageId: target.pageId,
              pageDescription: target.pageDescription,
              editPath: value,
            },
            // 升级申请单改变时，若降级申请单不为降级申请单则与升级申请单同步
            assignDegradePage:
              item.assignDegradePage.editPath !== '/sslm/supplier-life-manage/eliminate'
                ? {
                    ...item.assignDegradePage,
                    pageId: target.pageId,
                    pageDescription: target.pageDescription,
                    editPath: value,
                  }
                : item.assignDegradePage,
          }
        : { ...item }
    );
    dispatch({
      type: 'supplierLifeConfig/updateState',
      payload: {
        lifeStage: [...newStage],
      },
    });

    const targetStage = newStage.find(item => item.cycleStages.stageId === activeNode.stageId);

    this.setState({
      activeNode: {
        ...activeNode,
        pageId: target.pageId,
        pageDescription: target.pageDescription,
        editPath: value,
        degradeEditPath: targetStage.assignDegradePage.editPath,
      },
    });
  }

  /**
   * 激活节点变更降级申请表单
   * @param {object} value
   */
  handleChangeDegradeFormType(value) {
    const { activeNode = {} } = this.state;
    const {
      dispatch,
      supplierLifeConfig: { lifeStage = [], applyFormList = [] },
    } = this.props;
    const target = applyFormList.find(item => item.editPath === value);
    const newStage = lifeStage.map(item =>
      item.cycleStages.stageId === activeNode.stageId
        ? {
            ...item,
            assignDegradePage: {
              ...item.assignDegradePage,
              pageId: target.pageId,
              pageDescription: target.pageDescription,
              editPath: value,
            },
          }
        : { ...item }
    );
    dispatch({
      type: 'supplierLifeConfig/updateState',
      payload: {
        lifeStage: [...newStage],
      },
    });
    this.setState({
      activeNode: {
        ...activeNode,
        // pageId: target.pageId,
        // pageDescription: target.pageDescription,
        degradeEditPath: value,
      },
    });
  }

  /**
   * 阶段权限配置
   */
  @Bind()
  handleCheckbox(type, value) {
    const {
      dispatch,
      supplierLifeConfig: { lifeStage = [] },
    } = this.props;
    const { activeNode } = this.state;
    const newChecked = value.target.checked;
    const newStage = lifeStage.map(item =>
      item.cycleStages.stageCode === activeNode.stageCode
        ? {
            ...item,
            cycleStages: {
              ...item.cycleStages,
              [type]: newChecked,
              checkUpgradeStage:
                type === 'checkUpgradeFlag'
                  ? newChecked
                    ? item.cycleStages.checkUpgradeStage
                    : ''
                  : item.cycleStages.checkUpgradeStage,
              checkUpgradeStageMeaning:
                type === 'checkUpgradeFlag'
                  ? newChecked
                    ? item.cycleStages.checkUpgradeStageMeaning
                    : []
                  : item.cycleStages.checkUpgradeStageMeaning,
              checkDegradeStage:
                type === 'checkDegradeFlag'
                  ? newChecked
                    ? item.cycleStages.checkDegradeStage
                    : ''
                  : item.cycleStages.checkDegradeStage,
              checkDegradeStageMeaning:
                type === 'checkDegradeFlag'
                  ? newChecked
                    ? item.cycleStages.checkDegradeStageMeaning
                    : []
                  : item.cycleStages.checkDegradeStageMeaning,
            },
          }
        : item
    );
    dispatch({
      type: 'supplierLifeConfig/updateState',
      payload: {
        lifeStage: [...newStage],
      },
    });

    this.setState({
      activeNode: {
        ...activeNode,
        [type]: newChecked,
      },
    });
  }

  /**
   * 多选lov改变后的回调
   */
  @Bind()
  handleLovMultiChange(type, val = '', stage, order) {
    const {
      dispatch,
      supplierLifeConfig: { lifeStage = [] },
    } = this.props;
    const { activeNode } = this.state;
    const { tenantId, configId, orderSeq } = stage;
    dispatch({
      type: 'supplierLifeConfig/fetchLifeCycleStage',
      payload: { tenantId, configId, orderSeq, order },
    }).then(res => {
      if (res) {
        const stageIdList = split(val, ',');
        const descriptionList = []; // 描述集合
        res.forEach(n => {
          stageIdList.forEach(m => {
            // 处理加解密
            if (n.stageId.toString() === m) {
              descriptionList.push(n.stageDescription);
            }
          });
        });

        const newStage = lifeStage.map(item =>
          item.cycleStages.stageCode === activeNode.stageCode
            ? {
                ...item,
                cycleStages: {
                  ...item.cycleStages,
                  [type]: val,
                  [`${type}Meaning`]: descriptionList,
                },
              }
            : item
        );
        dispatch({
          type: 'supplierLifeConfig/updateState',
          payload: {
            lifeStage: [...newStage],
          },
        });

        this.setState({
          activeNode: {
            ...activeNode,
            [type]: val,
            [`${type}Meaning`]: descriptionList,
          },
        });
      }
    });
  }

  /**
   * 供应商中标改变后的回调
   */
  @Bind()
  handleChangeBidControl(val = '') {
    const {
      dispatch,
      supplierLifeConfig: { lifeStage = [] },
    } = this.props;
    const { activeNode } = this.state;
    const newStage = lifeStage.map(item =>
      item.cycleStages.stageCode === activeNode.stageCode
        ? {
            ...item,
            cycleStages: {
              ...item.cycleStages,
              allowBidControl: val,
            },
          }
        : item
    );
    dispatch({
      type: 'supplierLifeConfig/updateState',
      payload: {
        lifeStage: [...newStage],
      },
    });

    this.setState({
      activeNode: {
        ...activeNode,
        allowBidControl: val,
      },
    });
  }

  /**
   * 渲染静态申请单布局
   */
  activeFormRender(editPath) {
    switch (editPath) {
      case '/sslm/supplier-life-manage/register': // 注册
        return <RegisterPreview />;
      case '/sslm/supplier-life-manage/recommend': // 推荐
        return <RecommendPreview />;
      case '/sslm/supplier-life-manage/potential': // 潜在
        return <PotentialPreview />;
      case '/sslm/supplier-life-manage/qualified': // 合格
        return <QualifiedPreview />;
      case '/sslm/supplier-life-manage/prepare': // 预留
        return <PreparePreview />;
      default:
        return <EliminatePreview />;
    }
  }

  /**
   *设置state状态值
   * @param {object} values - state状态值
   */
  changeState(values) {
    this.setState({ ...values });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      modalVisible = false,
      targetIndex = 1,
      activeNode = {}, // 激活节点
      clientX,
      clientY,
    } = this.state;
    const {
      loading,
      form: { getFieldDecorator },
      supplierLifeConfig: {
        nodeList = [],
        lifeStage = [],
        applyFormList = [],
        code: { bidControlList = [] },
      },
    } = this.props;
    // 降级阶段可关联的申请单(该阶段关联的升级申请单和降级申请单)
    const degradeFormList = applyFormList.filter(
      n => n.pageId === activeNode.pageId || n.editPath === '/sslm/supplier-life-manage/eliminate'
    );

    const existNodeId = lifeStage.map(i => i.stageId); // 已添加的节点Id
    const availableNodes = nodeList.filter(i => !existNodeId.includes(i.stageId)); // 可添加节点
    const modalProps = {
      targetIndex,
      availableNodes, // 可添加节点(排除已添加节点)
      nodes: nodeList, // 所有节点
      stages: lifeStage, // 已生效阶段节点信息
      noFlag: isEmpty(availableNodes),
      visible: modalVisible,
      style: { top: clientY, left: clientX, position: 'absolute' },
      onCancel: this.handleCancel,
      onChange: this.handleChange,
      onSelect: this.handleSelect,
      onSave: this.handleSaveNode,
      onDelete: this.handleDelete,
    };

    const newLifeStage = cloneDeep(lifeStage);
    const firstLifeStage = head(newLifeStage);
    const lastLifeStage = last(newLifeStage);
    remove(newLifeStage, n => {
      return (
        n.cycleStages.stageId === firstLifeStage.cycleStages.stageId ||
        n.cycleStages.stageId === lastLifeStage.cycleStages.stageId
      );
    });

    // 降级阶段code
    const degradeStageCode = activeNode.stageCode === 'ELIMINATED' ? 'LEFT' : 'RIGHT';

    return (
      <Fragment>
        <Header
          title={intl
            .get(`sslm.supplierLifeConfig.view.message.lifecycleConfig`)
            .d('供应商生命周期配置')}
          backPath="/spfm/config-server/main"
        >
          <Button
            type="primary"
            icon="save"
            onClick={this.handleSureOption}
            loading={loading.sure || loading.fetch}
          >
            {intl.get('sslm.supplierLifeConfig.view.option.sure').d('确认生效')}
          </Button>
        </Header>
        <Content>
          <Spin tip="Loading..." spinning={loading.fetch || loading.form}>
            <div className={classNames(styles['life-config'])}>
              {!isEmpty(lifeStage) && (
                <div className={classNames(styles['first-item'])}>
                  <div
                    className={classNames({
                      [styles['item-content']]: true,
                      [styles['first-active']]:
                        head(lifeStage).cycleStages.stageId === activeNode.stageId,
                    })}
                    onClick={() => this.handleChangeActiveNode(head(lifeStage))}
                  >
                    <span className={classNames(styles['item-index'])}>1</span>
                    {head(lifeStage).editable ? (
                      <div>
                        <div>
                          {getFieldDecorator(`${head(lifeStage).cycleStages.stageCode}`, {
                            initialValue: head(lifeStage).cycleStages.stageDescription,
                          })(
                            <TLEditor
                              label=""
                              field="stageDescription"
                              token={head(lifeStage).cycleStages._token}
                              className={classNames(styles['item-input'])}
                              onKeyPress={e =>
                                this.handleChangeDescription(
                                  head(lifeStage).cycleStages.stageCode,
                                  e.charCode
                                )
                              }
                              afterOnOk={() =>
                                this.handleChangeDescription(
                                  head(lifeStage).cycleStages.stageCode,
                                  13
                                )
                              }
                            />
                          )}
                        </div>
                        <div className={classNames(styles['item-text'])}>
                          {head(lifeStage).cycleStages.stageCode}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div
                          className={classNames(styles['item-text'])}
                          onDoubleClick={() => this.handleEdit(0)}
                        >
                          {head(lifeStage).cycleStages.stageDescription}
                        </div>
                        <div className={classNames(styles['item-text'])}>
                          {head(lifeStage).cycleStages.stageCode}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className={classNames(styles['item-connect'])}>
                    <span className={classNames(styles['connect-line'])} />
                    <span
                      onClick={() => this.changeState({ modalVisible: true, targetIndex: 0 })}
                      className={classNames(styles['connect-add'])}
                    >
                      <Icon type="plus-circle" className="plus-node" />
                    </span>
                  </div>
                </div>
              )}
              <DragDropContext onDragEnd={this.handleDragEnd}>
                <Droppable droppableId="droppable" direction="horizontal">
                  {provided => (
                    <div
                      className={classNames(styles['life-drag'])}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {newLifeStage.map((item, index) => (
                        <div key={item.cycleStages.stageCode} style={{ display: 'inherit' }}>
                          <Draggable
                            key={item.cycleStages.stageCode}
                            draggableId={item.cycleStages.stageCode}
                            index={index}
                          >
                            {(pro, snap) => (
                              <div
                                ref={pro.innerRef}
                                {...pro.draggableProps}
                                {...pro.dragHandleProps}
                                style={{
                                  userSelect: 'none',
                                  ...pro.draggableProps.style,
                                }}
                                className={classNames({
                                  [styles['item-content']]: true,
                                  [styles['item-active']]:
                                    snap.isDragging ||
                                    item.cycleStages.stageId === activeNode.stageId,
                                })}
                                onClick={() => this.handleChangeActiveNode(item)}
                              >
                                <div className={classNames(styles['item-index'])}>{index + 2}</div>
                                {item.editable ? (
                                  <div>
                                    <div>
                                      {getFieldDecorator(`${item.cycleStages.stageCode}`, {
                                        initialValue: item.cycleStages.stageDescription,
                                      })(
                                        <TLEditor
                                          label=""
                                          field="stageDescription"
                                          token={item.cycleStages._token}
                                          className={classNames(styles['item-input'])}
                                          onKeyPress={e =>
                                            this.handleChangeDescription(
                                              item.cycleStages.stageCode,
                                              e.charCode
                                            )
                                          }
                                          afterOnOk={() =>
                                            this.handleChangeDescription(
                                              item.cycleStages.stageCode,
                                              13
                                            )
                                          }
                                        />
                                      )}
                                    </div>
                                    <div
                                      className={classNames(styles['item-text'])}
                                      style={{ marginTop: 4 }}
                                    >
                                      {item.cycleStages.stageCode}
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <div
                                      className={classNames(styles['item-text'])}
                                      onDoubleClick={() => this.handleEdit(index + 1)}
                                    >
                                      <Tooltip
                                        placement="topLeft"
                                        title={item.cycleStages.stageDescription}
                                      >
                                        {item.cycleStages.stageDescription}
                                      </Tooltip>
                                    </div>
                                    <div className={classNames(styles['item-text'])}>
                                      <Tooltip title={item.cycleStages.stageCode}>
                                        {item.cycleStages.stageCode}
                                      </Tooltip>
                                    </div>
                                  </div>
                                )}
                                <Icon
                                  type="minus"
                                  theme="outlined"
                                  className={classNames(styles['item-close'])}
                                  onClick={() => this.handleRemove(index + 1)}
                                />
                              </div>
                            )}
                          </Draggable>
                          <div className={classNames(styles['item-connect'])}>
                            <span className={classNames(styles['connect-line'])} />
                            <span
                              onClick={() =>
                                this.changeState({ modalVisible: true, targetIndex: index + 1 })
                              }
                              className={classNames(styles['connect-add'])}
                            >
                              <Icon type="plus-circle" className="plus-node" />
                            </span>
                          </div>
                        </div>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              {!isEmpty(lifeStage) && (
                <div className={classNames(styles['last-item'])}>
                  <div
                    className={classNames({
                      [styles['item-content']]: true,
                      [styles['last-active']]:
                        last(lifeStage).cycleStages.stageId === activeNode.stageId,
                    })}
                    onClick={() => this.handleChangeActiveNode(last(lifeStage))}
                  >
                    <span className={classNames(styles['item-index'])}>{lifeStage.length}</span>
                    {last(lifeStage).editable ? (
                      <div>
                        <div>
                          {getFieldDecorator(`${last(lifeStage).cycleStages.stageCode}`, {
                            initialValue: last(lifeStage).cycleStages.stageDescription,
                          })(
                            <TLEditor
                              label=""
                              field="stageDescription"
                              token={last(lifeStage).cycleStages._token}
                              className={classNames(styles['item-input'])}
                              onKeyPress={e =>
                                this.handleChangeDescription(
                                  last(lifeStage).cycleStages.stageCode,
                                  e.charCode
                                )
                              }
                              afterOnOk={() =>
                                this.handleChangeDescription(
                                  last(lifeStage).cycleStages.stageCode,
                                  13
                                )
                              }
                            />
                          )}
                        </div>
                        <div className={classNames(styles['item-text'])}>
                          {last(lifeStage).cycleStages.stageCode}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div
                          className={classNames(styles['item-text'])}
                          onDoubleClick={() => this.handleEdit(lifeStage.length - 1)}
                        >
                          {last(lifeStage).cycleStages.stageDescription}
                        </div>
                        <div className={classNames(styles['item-text'])}>
                          {last(lifeStage).cycleStages.stageCode}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div
              className={classNames(styles['life-form'])}
              style={{ display: loading.form ? 'none' : 'block' }}
            >
              <Fragment>
                <div className={classNames(styles['life-form-top'])}>
                  {intl
                    .get(`sslm.supplierLifeConfig.view.message.permissionConfig`)
                    .d('阶段权限配置')}
                </div>
                {lifeStage.map(n => {
                  if (n.cycleStages.stageCode === activeNode.stageCode) {
                    const { tenantId, configId, orderSeq } = n;
                    return (
                      <Fragment>
                        {/* <div className={classNames(styles['life-setting-content'])}>
                          <Checkbox
                            value={activeNode.allowSourceFlag}
                            onChange={val => this.handleCheckbox('allowSourceFlag', val)}
                          >
                            {intl
                              .get(`sslm.supplierLifeConfig.view.message.allowSupplyToSource`)
                              .d('允许该阶段的供应商参与寻源')}
                          </Checkbox>
                        </div> */}
                        <div className={classNames(styles['life-setting-content'])}>
                          <span>
                            {intl
                              .get(`sslm.supplierLifeConfig.view.message.bidControl`)
                              .d('允许该阶段的供应商中标')}
                          </span>
                          <div style={{ display: 'inline-block', width: 300, paddingLeft: 8 }}>
                            <Select
                              allowClear
                              style={{ width: '100%' }}
                              onChange={value => this.handleChangeBidControl(value)}
                              defaultValue={activeNode.allowBidControl || 'NO_CONTROL'}
                            >
                              {bidControlList.map(item => (
                                <Select.Option key={item.value} value={item.value}>
                                  {item.meaning}
                                </Select.Option>
                              ))}
                            </Select>
                          </div>
                        </div>
                        {/* <div className={classNames(styles['life-setting-content'])}>
                          <Checkbox
                            value={activeNode.allowOrders}
                            onChange={(val) => this.handleCheckbox('allowOrders', val)}
                          >
                            {intl
                              .get(`sslm.supplierLifeConfig.view.message.allowSupplyCreateOrder`)
                              .d('允许该阶段的供应商创建订单')}
                          </Checkbox>
                        </div> */}
                        <div className={classNames(styles['life-setting-content'])}>
                          <Checkbox
                            value={activeNode.allowProtocolFlag}
                            onChange={val => this.handleCheckbox('allowProtocolFlag', val)}
                          >
                            {intl
                              .get(`sslm.supplierLifeConfig.view.message.supplySignAgreement`)
                              .d('允许该阶段供应商签署协议')}
                          </Checkbox>
                        </div>
                        <div className={classNames(styles['life-setting-content'])}>
                          <Checkbox
                            value={activeNode.allowSmallOrders}
                            onChange={val => this.handleCheckbox('allowSmallOrders', val)}
                          >
                            {intl
                              .get(`sslm.supplierLifeConfig.view.message.allowCreateSmallOrder`)
                              .d('允许该阶段供应商创建商城订单')}
                          </Checkbox>
                        </div>
                        <div className={classNames(styles['life-setting-content'])}>
                          <Checkbox
                            value={activeNode.allowSettleAccount}
                            onChange={val => this.handleCheckbox('allowSettleAccount', val)}
                          >
                            {intl
                              .get(`sslm.supplierLifeConfig.view.message.allowSupplierSettleAcount`)
                              .d('允许该阶段供应商结算')}
                          </Checkbox>
                        </div>
                        <div className={classNames(styles['life-setting-content'])}>
                          <Checkbox
                            value={activeNode.allowImportErpFlag}
                            onChange={val => this.handleCheckbox('allowImportErpFlag', val)}
                          >
                            {intl
                              .get(`sslm.supplierLifeConfig.view.message.allowImportErp`)
                              .d('允许该阶段供应商导入ERP')}
                          </Checkbox>
                        </div>
                        <div className={classNames(styles['life-setting-content'])}>
                          <Checkbox
                            value={activeNode.checkAbilityFlag}
                            onChange={val => this.handleCheckbox('checkAbilityFlag', val)}
                          >
                            {intl
                              .get(`sslm.supplierLifeConfig.view.message.checkSupplyCapacity`)
                              .d('校验供货能力清单品类包含在评分要素品类中')}
                          </Checkbox>
                        </div>
                        {activeNode.stageCode !== 'ELIMINATED' && (
                          <div className={classNames(styles['life-setting-content'])}>
                            <Checkbox
                              value={activeNode.checkUpgradeFlag}
                              onChange={val => this.handleCheckbox('checkUpgradeFlag', val)}
                            >
                              {intl
                                .get(`sslm.supplierLifeConfig.view.message.upgradeStage`)
                                .d('允许配置的阶段升级至该阶段')}
                            </Checkbox>
                            <div style={{ display: 'inline-block', width: 300 }}>
                              {activeNode.checkUpgradeFlag ? (
                                <LovMulti
                                  showAll
                                  code="SSLM.LIFE_CYCLE_STAGE_SEQ"
                                  displayData={n.cycleStages.checkUpgradeStageMeaning || []}
                                  translateData={n.cycleStages.checkUpgradeStageMeaningMap || []}
                                  value={n.cycleStages.checkUpgradeStage}
                                  queryParams={{ tenantId, configId, orderSeq, order: 'LEFT' }}
                                  onChange={val =>
                                    this.handleLovMultiChange('checkUpgradeStage', val, n, 'LEFT')
                                  }
                                />
                              ) : null}
                            </div>
                          </div>
                        )}
                        <div className={classNames(styles['life-setting-content'])}>
                          <Checkbox
                            value={activeNode.checkDegradeFlag}
                            onChange={val => this.handleCheckbox('checkDegradeFlag', val)}
                          >
                            {intl
                              .get(`sslm.supplierLifeConfig.view.message.degradeStage`)
                              .d('允许配置的阶段降级至该阶段')}
                          </Checkbox>
                          <div style={{ display: 'inline-block', width: 300 }}>
                            {activeNode.checkDegradeFlag ? (
                              <LovMulti
                                showAll
                                code="SSLM.LIFE_CYCLE_STAGE_SEQ"
                                value={n.cycleStages.checkDegradeStage}
                                displayData={n.cycleStages.checkDegradeStageMeaning || []}
                                translateData={n.cycleStages.checkDegradeStageMeaningMap || []}
                                queryParams={{
                                  tenantId,
                                  configId,
                                  orderSeq,
                                  order: degradeStageCode,
                                }}
                                onChange={val =>
                                  this.handleLovMultiChange(
                                    'checkDegradeStage',
                                    val,
                                    n,
                                    degradeStageCode
                                  )
                                }
                              />
                            ) : null}
                          </div>
                        </div>
                      </Fragment>
                    );
                  } else {
                    return null;
                  }
                })}
              </Fragment>
              <div className={classNames(styles['life-form-top'])}>
                {intl
                  .get(`sslm.supplierLifeConfig.view.message.applyUpgradePreview`)
                  .d('阶段关联升级申请单预览')}
                :
                <Select
                  value={activeNode.editPath}
                  style={{ width: 120, marginLeft: 16 }}
                  disabled={activeNode.index === activeNode.finalIndex}
                  onChange={value => this.handleChangeFormType(value)}
                >
                  {applyFormList.map(item => (
                    <Select.Option key={item.pageId} value={item.editPath}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              </div>
              <div className={classNames(styles['life-form-content'])}>
                {this.activeFormRender(activeNode.editPath)}
              </div>
              <div className={classNames(styles['life-form-top'])}>
                {intl
                  .get(`sslm.supplierLifeConfig.view.message.applyDegradePreview`)
                  .d('阶段关联降级申请单预览')}
                :
                <Select
                  value={activeNode.degradeEditPath}
                  style={{ width: 120, marginLeft: 16 }}
                  disabled={activeNode.index === activeNode.finalIndex}
                  onChange={value => this.handleChangeDegradeFormType(value)}
                >
                  {degradeFormList.map(item => (
                    <Select.Option key={item.pageId} value={item.editPath}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              </div>
              <div className={classNames(styles['life-form-content'])}>
                {this.activeFormRender(activeNode.degradeEditPath)}
              </div>
            </div>
          </Spin>
          <NodeContainerModal {...modalProps} />
        </Content>
      </Fragment>
    );
  }
}

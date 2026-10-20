/* eslint-disable no-unused-expressions */
/**
 * NewCharts
 * 流程图
 * @date: 2022-07-07
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import React, {
  useRef,
  Fragment,
  useState,
  useEffect,
  useContext,
  forwardRef,
  useCallback,
  useImperativeHandle,
} from 'react';
import G6 from '@antv/g6';
import { DataSet, Spin, Modal, Button } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import addIcon from '@/assets/add.svg';
import delIcon from '@/assets/delete.svg';
import {
  saveLineCharts,
  deleteChartsNode,
  queryFlowChartsInfo,
} from '@/services/ShipmentsConfigurationService';
import NewAddNode from '../../components/NewAddNode';
import ModalIndex from '../../components/configuration';
import ModalPermission from '../../components/NewPermission/';
import AlterationIndex from '../../components/alteration';
import { Newpermission } from '../../components/NewRightManagement';
import { addNodeDataSet } from '../../components/NewAddNode/store/indexDS';

import { Store } from './index';

import styles from './index.less';

const NewCharts = forwardRef((_, ref) => {
  // 视口动画切换
  const toolbarNode = `
  <ul class='g6-component-toolbar'>
    <li  code='zoomOut'>
      <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
        <path d="M658.432 428.736a33.216 33.216 0 0 1-33.152 33.152H525.824v99.456a33.216 33.216 0 0 1-66.304 0V461.888H360.064a33.152 33.152 0 0 1 0-66.304H459.52V296.128a33.152 33.152 0 0 1 66.304 0V395.52H625.28c18.24 0 33.152 14.848 33.152 33.152z m299.776 521.792a43.328 43.328 0 0 1-60.864-6.912l-189.248-220.992a362.368 362.368 0 0 1-215.36 70.848 364.8 364.8 0 1 1 364.8-364.736 363.072 363.072 0 0 1-86.912 235.968l192.384 224.64a43.392 43.392 0 0 1-4.8 61.184z m-465.536-223.36a298.816 298.816 0 0 0 298.432-298.432 298.816 298.816 0 0 0-298.432-298.432A298.816 298.816 0 0 0 194.24 428.8a298.816 298.816 0 0 0 298.432 298.432z"></path>
      </svg>
    </li>
    <li code='zoomIn'>
      <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
        <path d="M639.936 416a32 32 0 0 1-32 32h-256a32 32 0 0 1 0-64h256a32 32 0 0 1 32 32z m289.28 503.552a41.792 41.792 0 0 1-58.752-6.656l-182.656-213.248A349.76 349.76 0 0 1 480 768 352 352 0 1 1 832 416a350.4 350.4 0 0 1-83.84 227.712l185.664 216.768a41.856 41.856 0 0 1-4.608 59.072zM479.936 704c158.784 0 288-129.216 288-288S638.72 128 479.936 128a288.32 288.32 0 0 0-288 288c0 158.784 129.216 288 288 288z" p-id="3853"></path>
      </svg>
    </li>
    <li code='realZoom'>
      <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="24">
        <path d="M384 320v384H320V320h64z m256 0v384H576V320h64zM512 576v64H448V576h64z m0-192v64H448V384h64z m355.968 576H92.032A28.16 28.16 0 0 1 64 931.968V28.032C64 12.608 76.608 0 95.168 0h610.368L896 192v739.968a28.16 28.16 0 0 1-28.032 28.032zM704 64v128h128l-128-128z m128 192h-190.464V64H128v832h704V256z"></path>
      </svg>
    </li>
    <li code='autoZoom'>
      <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="24">
        <path d="M684.288 305.28l0.128-0.64-0.128-0.64V99.712c0-19.84 15.552-35.904 34.496-35.712a35.072 35.072 0 0 1 34.56 35.776v171.008h170.944c19.648 0 35.84 15.488 35.712 34.432a35.072 35.072 0 0 1-35.84 34.496h-204.16l-0.64-0.128a32.768 32.768 0 0 1-20.864-7.552c-1.344-1.024-2.816-1.664-3.968-2.816-0.384-0.32-0.512-0.768-0.832-1.088a33.472 33.472 0 0 1-9.408-22.848zM305.28 64a35.072 35.072 0 0 0-34.56 35.776v171.008H99.776A35.072 35.072 0 0 0 64 305.216c0 18.944 15.872 34.496 35.84 34.496h204.16l0.64-0.128a32.896 32.896 0 0 0 20.864-7.552c1.344-1.024 2.816-1.664 3.904-2.816 0.384-0.32 0.512-0.768 0.768-1.088a33.024 33.024 0 0 0 9.536-22.848l-0.128-0.64 0.128-0.704V99.712A35.008 35.008 0 0 0 305.216 64z m618.944 620.288h-204.16l-0.64 0.128-0.512-0.128c-7.808 0-14.72 3.2-20.48 7.68-1.28 1.024-2.752 1.664-3.84 2.752-0.384 0.32-0.512 0.768-0.832 1.088a33.664 33.664 0 0 0-9.408 22.912l0.128 0.64-0.128 0.704v204.288c0 19.712 15.552 35.904 34.496 35.712a35.072 35.072 0 0 0 34.56-35.776V753.28h170.944c19.648 0 35.84-15.488 35.712-34.432a35.072 35.072 0 0 0-35.84-34.496z m-593.92 11.52c-0.256-0.32-0.384-0.768-0.768-1.088-1.088-1.088-2.56-1.728-3.84-2.688a33.088 33.088 0 0 0-20.48-7.68l-0.512 0.064-0.64-0.128H99.84a35.072 35.072 0 0 0-35.84 34.496 35.072 35.072 0 0 0 35.712 34.432H270.72v171.008c0 19.84 15.552 35.84 34.56 35.776a35.008 35.008 0 0 0 34.432-35.712V720l-0.128-0.64 0.128-0.704a33.344 33.344 0 0 0-9.472-22.848zM512 374.144a137.92 137.92 0 1 0 0.128 275.84A137.92 137.92 0 0 0 512 374.08z"></path>
      </svg>
    </li>
  </ul>`;
  // let graph = null;
  const tenantIdNum = -1;
  const chartsRef = useRef(null);
  const formModalRef = useRef(null);
  const changeModalRef = useRef(null);
  const [num, usenNum] = useState(0);
  const [spinFlag, useSpin] = useState(false); // spining
  const [chartList, useChartList] = useState({}); // 查询节点数据
  // eslint-disable-next-line prefer-const
  let [graph, useFlowGraph] = useState(null);
  let modalRef = useRef(null);
  const {
    urlFlag,
    canFlag,
    chartsDs,
    classify,
    dataVersion,
    strategyHeaderId = null,
    queryHeaderInfo = (e) => e,
  } = useContext(Store);

  // 存在闭包，所以挂在window
  window.classify = classify;
  window.canFlag = canFlag;

  useEffect(() => {
    queryChartsInfo();
    return componentWillUnmount;
  }, []);

  function componentWillUnmount() {
    // 组件销毁时你要执行的代码
    window.classify = null;
    window.canFlag = null;
  }

  useEffect(() => {
    registerFn();
    if (Object.keys(chartList).length > 0) {
      ChartsGraph(chartList);
      graph.render();
      graph.zoomTo(1.1);
      graph.translate(140, 100);
    }
  }, [num, canFlag]);

  useImperativeHandle(ref, () => ({
    clearText,
    ref: ref.current,
    chartsDs,
    queryChartsInfo,
  }));

  const publicuFunction = (res) => {
    graph.changeData(res);
    // graph.refresh();
    graph.render();
    graph.zoomTo(1.1);
    graph.translate(140, 100);
    queryHeaderInfo(); // 查询头数据
  };

  const clearText = async (version) => {
    useSpin(true);
    try {
      const rec = await queryFlowChartsInfo({
        urlFlag,
        strategyHeaderId,
        dataVersion: version || dataVersion,
      });
      if (getResponse(rec)) {
        publicuFunction(rec);
      }
    } catch (e) {
      throw e;
    } finally {
      useSpin(false);
    }
  };

  /**
   * 子节点树结构递归
   * 数据扁平化
   */
  const recursion = (arrs, childs, attrArr) => {
    let attrList = [];
    if (!Array.isArray(arrs) && !arrs.length) return [];
    if (typeof childs !== 'string') return [];
    if (!Array.isArray(attrArr) || (Array.isArray(attrArr) && !attrArr.length)) {
      attrList = Object.keys(arrs[0]);
      attrList.splice(attrList.indexOf(childs), 1);
    } else {
      attrList = attrArr;
    }
    const list = [];
    const getObj = (arr) => {
      arr.forEach((row) => {
        const obj = {};
        attrList.forEach((item) => {
          obj[item] = row[item];
        });
        list.push(obj);
        if (row[childs]) {
          getObj(row[childs]);
        }
      });
      return list;
    };
    return getObj(arrs);
  };

  /**
   * 查询流程图的节点数据
   */
  const queryChartsInfo = useCallback(async () => {
    useSpin(true);
    try {
      const params = {
        urlFlag,
        dataVersion,
        strategyHeaderId,
      };
      const res = await queryFlowChartsInfo(params);
      if (getResponse(res)) {
        useChartList(res);
        usenNum(1);
      }
    } catch (e) {
      throw e;
    } finally {
      useSpin(false);
    }
  }, [strategyHeaderId]);

  const destroyModal = () => {
    Modal.destroyAll();
  };

  // 新增节点事件
  const onOpenModalChange = (data) => {
    const tableDs = new DataSet(addNodeDataSet());
    const dataProps = {
      ...data,
      tableDs,
      urlFlag,
      strategyHeaderId,
      useSpin,
      destroyModal,
      saveLineCharts,
      publicuFunction,
      queryFlowChartsInfo,
    };
    Modal.open({
      mask: true,
      drawer: true,
      closable: true,
      style: { width: '742px' },
      children: <NewAddNode {...dataProps} />,
      title: intl.get('slod.shipmentsConfiguration.model.nodeConfigNames').d('添加子节点'),
      okText: intl.get(`hzero.common.model.sure`).d('确定'),
      cancelText: intl.get('hzero.common.button.cance').d('取消'),
      onOk: async () => {
        useSpin(true);
        const nodeData = tableDs?.selected.map((item) => item.toData());
        if (!isEmpty(nodeData)) {
          const params = {
            sourceStrategyLineId: data?.strategyLineId,
            nodeConfigId: nodeData[0]?.nodeConfigId,
            strategyHeaderId,
            receiveStrategyFlag: ['ASN'].includes(nodeData[0]?.nodeTemplateCode) ? '1' : '0',
            overReceiveRule: ['ASN', 'PLAN'].includes(nodeData[0]?.nodeTemplateCode)
              ? 'NOT_ALLOWED'
              : 'NONE',
            nodeQuantityOccupyStrategy: ['ASN', 'PLAN'].includes(nodeData[0]?.nodeTemplateCode)
              ? 'CUR_AND_DOWNSTREAM'
              : 'CURRENT',
          };
          try {
            const returnedValue = await saveLineCharts(params);
            const res = getResponse(returnedValue);
            if (getResponse(res)) {
              const dataValue = await queryFlowChartsInfo({ urlFlag, strategyHeaderId });
              const rec = getResponse(dataValue);
              if (getResponse(rec)) {
                publicuFunction(rec);
              }
            }
          } catch (e) {
            throw e;
          } finally {
            useSpin(false);
          }
        } else {
          notification.warning({
            message: intl
              .get(`slod.shipmentsConfiguration.view.message.nodeConfigId`)
              .d('请选择子节点'),
          });
          return false;
        }
      },
    });
  };

  // 删除节点事件
  const onDeleteNodeChange = async (data) => {
    useSpin(true);
    const list = recursion([data], 'children'); // 调用递归后的数据
    try {
      const res = await deleteChartsNode([list[0]]);
      if (getResponse(res)) {
        const rec = await queryFlowChartsInfo({ urlFlag, strategyHeaderId });
        if (rec) {
          publicuFunction(rec);
          notification.success();
        }
      }
    } catch (e) {
      throw e;
    } finally {
      useSpin(false);
    }
  };

  /**
   * 保存编辑的节点数据
   */
  const formChartChange = async (modal) => {
    const headerFlag = await chartsDs.validate();
    const params = {
      ...chartsDs?.current?.toData(),
      ...chartsDs?.current?.toJSONData(),
    };
    if (!chartsDs?.current?.get('_token')) {
      return;
    }
    if (headerFlag) {
      const res = await saveLineCharts(params);
      if (getResponse(res)) {
        const rec = await queryFlowChartsInfo({ urlFlag, strategyHeaderId });
        if (rec) {
          // validateForm(res);
          publicuFunction(rec);
          notification.success();
          useSpin(false);
          closeModal(modal);
        } else {
          useSpin(false);
        }
      }
    }
  };

  // 公共关闭弹框function
  const closeModal = (modal) => {
    modal.close();
  };

  // 打开节点-查看/编辑节点信息
  const onOpenNodeMessage = (data) => {
    chartsDs.setState({ nodeCode: data?.nodeTemplateCode || null });
    const dataProps = {
      data,
      urlFlag,
      spinFlag,
      chartsDs,
      classify: window.classify,
      openModal,
      openModalChange,
      openModalPermission,
    };
    modalRef = Modal.open({
      mask: true,
      drawer: true,
      closable: true,
      resizable: true,
      style: { width: '742px', minWidth: '600px', padding: ' 0 !important' },
      children: <Newpermission {...dataProps} />,
      title: `${intl.get('slod.shipmentsConfiguration.model.situationNode').d('节点详情')}-${
        data?.nodeConfigName
      }`,
      footer: () => {
        if (urlFlag || window.classify === 'history') {
          return (
            <Button color="primary" onClick={() => closeModal(modalRef)}>
              {intl.get(`slod.shipmentsConfiguration.view.title.detail.off`).d('关闭')}
            </Button>
          );
        }
        return (
          <>
            <Button color="primary" onClick={() => formChartChange(modalRef)}>
              {intl.get(`hzero.common.button.sure`).d('确定')}
            </Button>
            <Button onClick={() => closeModal(modalRef)}>
              {intl.get(`hzero.common.button.cancel`).d('取消')}
            </Button>
          </>
        );
      },
    });
  };

  // 单据关闭权限列表
  const openModalPermission = (id) => {
    const modalProps = {
      urlFlag,
      chartsDs,
      strategyLineId: id,
      classify: window.classify,
    };
    const modal = Modal.open({
      mask: true,
      drawer: true,
      closable: true,
      // resizable: true,
      style: { width: '742px', minWidth: '600px', padding: 0 },
      children: <ModalPermission ref={formModalRef} {...modalProps} />,
      title: intl
        .get('slod.shipmentsConfiguration.model.documentClosingStatusLimits')
        .d('单据关闭逻辑配置'),
      footer: () => {
        if (urlFlag || window.classify === 'history') {
          return (
            <Button color="primary" onClick={() => closeModal(modal)}>
              {intl.get(`slod.shipmentsConfiguration.view.title.detail.off`).d('关闭')}
            </Button>
          );
        }
        return (
          <>
            <Button
              color="primary"
              onClick={() => {
                formModalRef?.current?.saveOnChange();
                chartsDs.query().then((res) => {
                  closeModal(modal);
                  modalRef.close();
                  onOpenNodeMessage(res);
                });
              }}
            >
              {intl.get(`hzero.common.button.sure`).d('确定')}
            </Button>
            <Button onClick={() => closeModal(modal)}>
              {intl.get(`hzero.common.button.cancel`).d('取消')}
            </Button>
          </>
        );
      },
    });
  };

  // 操作/查询权限角色维护
  const openModal = (id) => {
    const modalProps = {
      chartsDs,
      strategyLineId: id,
      classify: window.classify,
    };
    const modal = Modal.open({
      mask: true,
      drawer: true,
      closable: true,
      // resizable: true,
      style: { width: '742px', minWidth: '600px', padding: 0 },
      children: <ModalIndex ref={formModalRef} {...modalProps} />,
      title: intl.get('slod.shipmentsConfiguration.model.queryOperate').d('操作/查询权限角色维护'),
      footer: () => {
        if (urlFlag || window.classify === 'history') {
          return (
            <Button color="primary" onClick={() => closeModal(modal)}>
              {intl.get(`slod.shipmentsConfiguration.view.title.detail.off`).d('关闭')}
            </Button>
          );
        }
        return (
          <>
            <Button
              color="primary"
              onClick={() => {
                formModalRef?.current?.saveOnChange();
                chartsDs.query().then((res) => {
                  closeModal(modal);
                  modalRef.close();
                  onOpenNodeMessage(res);
                });
              }}
            >
              {intl.get(`hzero.common.button.sure`).d('确定')}
            </Button>
            <Button onClick={() => closeModal(modal)}>
              {intl.get(`hzero.common.button.cancel`).d('取消')}
            </Button>
          </>
        );
      },
    });
  };

  // 变更字段定义列表
  const openModalChange = (id, code, record, nodeConfigName = null) => {
    const modalProps = {
      urlFlag,
      _record: record,
      strategyLineId: id,
      nodeTemplateCode: code,
      classify: window.classify,
    };
    const modal = Modal.open({
      mask: true,
      drawer: true,
      closable: true,
      // resizable: true,
      // bodyStyle: { padding: '0px' },
      style: { width: '1090px' },
      children: (
        <>
          <Alert
            banner
            closable
            type="info"
            // style={{ marginBottom: '16px' }}
            className={styles['title-alert']}
            message={intl
              .get(`slod.shipmentsConfiguration.model.pageProperties`)
              .d(
                '【变更】与【全部-编辑】页面使用同一套个性化单元，若需控制某字段仅在【变更】页面可编辑，需在对应个性化配置路径下根据“页面属性”字段进行【可编辑fx】条件配置'
              )}
          />
          <AlterationIndex ref={changeModalRef} {...modalProps} />
        </>
      ),
      title: `【${nodeConfigName}】${intl
        .get('slod.shipmentsConfiguration.model.configuration')
        .d('字段配置表')}`,
      footer: () => {
        if (urlFlag || window.classify === 'history') {
          return (
            <Button
              color="primary"
              onClick={() => {
                changeModalRef?.current?.saveOnChange();
                chartsDs.query().then((res) => {
                  closeModal(modal);
                  modalRef.close();
                  onOpenNodeMessage(res);
                });
              }}
            >
              {intl.get(`slod.shipmentsConfiguration.view.title.detail.off`).d('关闭')}
            </Button>
          );
        }
        return (
          <>
            <Button
              onClick={() => {
                changeModalRef?.current?.saveOnChange().then((resp) => {
                  if (resp) {
                    chartsDs.query().then((res) => {
                      closeModal(modal);
                      modalRef.close();
                      onOpenNodeMessage(res);
                    });
                  }
                });
              }}
              color="primary"
            >
              {intl.get(`hzero.common.button.sure`).d('确定')}
            </Button>
            <Button
              onClick={() => {
                changeModalRef?.current?.saveOnChange();
                chartsDs.query().then((res) => {
                  closeModal(modal);
                  modalRef.close();
                  onOpenNodeMessage(res);
                });
              }}
            >
              {intl.get(`hzero.common.button.cancel`).d('取消')}
            </Button>
          </>
        );
      },
    });
  };

  // 自定义节点、边
  const registerFn = () => {
    const fittingString = (str, maxWidth, fontSizeText) => {
      const ellipsis = '...';
      const ellipsisLength = G6.Util.getTextSize(ellipsis, fontSizeText)[0];
      let currentWidth = 0;
      let res = str;
      const pattern = new RegExp('[\u4E00-\u9FA5]+'); // distinguish the Chinese charactors and letters
      str.split('').forEach((letter, i) => {
        if (currentWidth > maxWidth - ellipsisLength) return;
        if (pattern.test(letter)) {
          // Chinese charactors
          currentWidth += fontSizeText;
        } else {
          // get the width of single letter according to the fontSizeText
          currentWidth += G6.Util.getLetterWidth(letter, fontSizeText);
        }
        if (currentWidth > maxWidth - ellipsisLength) {
          res = `${str.substr(0, i)}${ellipsis}`;
        }
      });
      return res;
    };
    /**
     * 自定义节点
     */
    G6.registerNode(
      'flow-rect',
      {
        // shapeType: 'flow-rect',
        draw(cfg, group) {
          const { tenantId, collapsed, nodeConfigName = '', fictitiousFlag } = cfg;
          const color = '#47B881';
          // const faColor = '#AFAFAF';
          const faColor = 'rgba(226,226,226,1)';
          const delColor = '#F56349';
          const rectConfig = {
            width: 132,
            height: 34,
            lineWidth: 1,
            fontSize: 12,
            fill: '#fff', // 所有节点背景色
            radius: 2, // 节点圆角
            stroke: faColor, // 所有节点的边框颜色
            opacity: 1,
          };

          const nodeOrigin = {
            x: -rectConfig?.width / 2,
            y: -rectConfig?.height / 2,
          };

          const textConfig = {
            textAlign: 'left',
            textBaseline: 'bottom',
          };
          const rect = group?.addShape('rect', {
            attrs: {
              x: nodeOrigin?.x,
              y: nodeOrigin?.y,
              ...rectConfig,
            },
            name: 'rect-shape',
            rectType: cfg?.id,
          });
          const rectBBox = rect?.getBBox();

          // 左边框样式设置
          group.addShape('rect', {
            attrs: {
              x: nodeOrigin?.x - 1,
              y: rectBBox?.maxY - 35,
              width: 4,
              height: rectConfig?.height + 1,
              radius: [rectConfig?.radius, 0, 0, rectConfig?.radius],
              fill: tenantId === -1 ? faColor : fictitiousFlag === 1 ? delColor : color,
            },
          });

          // 添加节点ICON
          group.addShape('image', {
            attrs: {
              x: nodeOrigin.x + 110,
              y: rectBBox.maxY - 22,
              width: 10,
              height: 10,
              img: addIcon,
              cursor: window.classify !== 'history' && window.canFlag === 1 && 'pointer',
              // stroke: '#47B881',
              opacity: 0,
            },
            name: 'img-add',
            addId: cfg.id,
          });
          // 删除节点ICON
          group.addShape('image', {
            attrs: {
              x: nodeOrigin?.x + 90,
              y: rectBBox?.maxY - 22,
              width: 10,
              height: 10,
              img: delIcon,
              cursor:
                window?.classify !== 'history' &&
                window?.canFlag === 1 &&
                cfg?.tenantId !== tenantIdNum &&
                'pointer',
              stroke: '#47B881',
              opacity: 0,
            },
            name: 'img-del',
            delId: cfg?.id,
          });

          // 标题
          group.addShape('text', {
            attrs: {
              ...textConfig,
              x: 12 + nodeOrigin?.x, // 标题水平方向位置
              y: rectBBox?.maxY - 12, // 标题垂直方向位置
              text: fittingString(nodeConfigName, 40, 6),
              // text:
              //   nodeConfigName?.length > 6 ? `${nodeConfigName?.substr(0, 6)}...` : nodeConfigName,
              fontSize: 12,
              fontWeight: 600, // 字体粗细
              fill: '#000',
              opacity: 0.85,
            },
            name: 'rect-text',
            textId: cfg?.id,
          });

          // 判断是否有自节点
          if (cfg?.children && cfg?.children?.length) {
            // 伸缩icon 样式
            group.addShape('rect', {
              attrs: {
                x: rectConfig?.width / 2 - 4,
                y: -6,
                width: 12,
                height: 12,
                stroke: 'rgba(0, 0, 0, 0.25)',
                cursor: 'pointer',
                fill: '#fff',
              },
              name: 'collapse-back',
              modelId: cfg?.id,
            });

            // 伸缩icon 文字
            group.addShape('text', {
              attrs: {
                x: rectConfig?.width / 2 + 2,
                y: -1,
                textAlign: 'center',
                textBaseline: 'middle',
                text: collapsed ? '+' : '-',
                fontSize: 12,
                cursor: 'pointer',
                fill: 'rgba(0, 0, 0, 0.25)',
              },
              name: 'collapse-text',
              modelId: cfg?.id,
            });
          }
          return rect;
        },
        afterDraw(cfg, group) {
          const node = group?.find((element) => element?.get('name') === 'rect-shape');
          const text = group?.find((element) => element?.get('name') === 'rect-text');
          const addImg = group?.find((element) => element?.get('name') === 'img-add');
          const delImg = group?.find((element) => element?.get('name') === 'img-del');
          const flag =
            cfg?.fictitiousFlag !== 1 && window?.classify !== 'history' && window?.canFlag === 1;
          const onMouseEnter = () => {
            if (cfg?.tenantId !== tenantIdNum) {
              addImg?.attr('opacity', 1);
              delImg?.attr('opacity', 1);
              graph?.get('canvas')?.draw();
            } else {
              addImg?.attr('opacity', 1);
              addImg?.attr('stroke', 'red');
              graph?.get('canvas')?.draw();
            }
          };
          const onMouseLeave = () => {
            if (cfg?.tenantId !== tenantIdNum) {
              addImg?.attr('opacity', 0);
              delImg?.attr('opacity', 0);
              graph?.get('canvas')?.draw();
            } else {
              addImg?.attr('opacity', 0);
              graph?.get('canvas')?.draw();
            }
          };
          // 节点 或单个展示的hover事件
          // 外层
          node?.on('mouseenter', (e) => {
            if (flag) onMouseEnter(e);
          });
          node?.on('mouseleave', (e) => {
            if (flag) onMouseLeave(e);
          });
          // 标题文字
          text?.on('mouseenter', (e) => {
            if (flag) onMouseEnter(e);
          });
          text?.on('mouseleave', (e) => {
            if (flag) onMouseLeave(e);
          });
          // 添加按钮
          addImg?.on('mouseenter', (e) => {
            if (flag) onMouseEnter(e);
          });
          addImg?.on('mouseleave', (e) => {
            if (flag) onMouseLeave(e);
          });
          // 删除按钮
          delImg?.on('mouseenter', (e) => {
            if (flag) onMouseEnter(e);
          });
          delImg?.on('mouseleave', (e) => {
            if (flag) onMouseLeave(e);
          });

          // 添加按钮-添加新节点
          addImg?.on('click', (e) => {
            const nodeConfigId = e?.target?.get('addId');
            const item = graph?.findById(nodeConfigId);
            const data = item?.getModel();
            if (window.classify !== 'history' && window.canFlag === 1) onOpenModalChange(data);
          });
          // 删除按钮-删除节点
          delImg?.on('click', (e) => {
            const nodeConfigId = e?.target?.get('delId');
            const item = graph?.findById(nodeConfigId);
            const data = item?.getModel();
            if (
              window?.classify !== 'history' &&
              window?.canFlag === 1 &&
              cfg?.tenantId !== tenantIdNum
            ) {
              onDeleteNodeChange(data);
            }
          });
          // 点击节点 显示节点信息
          node?.on('click', (e) => {
            const nodeConfigId = e?.target?.get('rectType');
            const item = graph?.findById(nodeConfigId);
            const data = item?.getModel();
            if (cfg?.fictitiousFlag !== 1 && cfg?.tenantId !== tenantIdNum) onOpenNodeMessage(data);
          });
          // 点击节点 显示节点信息
          text.on('click', (e) => {
            const nodeConfigId = e?.target?.get('textId');
            const item = graph?.findById(nodeConfigId);
            const data = item?.getModel();
            if (cfg?.fictitiousFlag !== 1 && cfg?.tenantId !== tenantIdNum) onOpenNodeMessage(data);
          });
        },
        setState(name, value, item) {
          if (name === 'collapse') {
            const group = item?.getContainer();
            const collapseText = group?.find((e) => e?.get('name') === 'collapse-text');
            if (collapseText) {
              if (!value) {
                collapseText?.attr({
                  text: '-',
                });
              } else {
                collapseText?.attr({
                  text: '+',
                });
              }
            }
          }
          if (name === 'selected') {
            const text = item?.getModel();
            const group = item?.getContainer();
            const rectNode = group?.find((e) => e?.get('name') === 'rect-shape');
            if (text?.tenantId !== tenantIdNum) {
              if (text?.fictitiousFlag !== 1) {
                const nodeColor = value ? 'rgba(41,190,206,0.10)' : '#fff';
                const nodeBorColor = value ? '#47B881' : 'rgba(226,226,226,1)';
                if (typeof rectNode?.attr !== 'function') return;
                rectNode?.attr({ fill: nodeColor });
                rectNode?.attr({ stroke: nodeBorColor });
              }
            }
          }
        },
      },
      'rect'
    );
  };

  const ChartsGraph = (data) => {
    const container = document?.getElementById('change_chart_new_img_id');
    const width = container?.scrollWidth;
    const height = container?.scrollHeight;
    // 默认配置
    const defaultConfig = {
      width,
      height,
      modes: {
        default: ['zoom-canvas', 'drag-canvas', 'click-select', 'hover-node'], // 'drag-node' 节点拖动
      },
      // fitView: true,
      animate: true,
      minZoom: 0.5, // 节点最小缩放
      maxZoom: 3, // 节点最大伸展
      defaultNode: {
        type: 'flow-rect',
      },
      defaultEdge: {
        type: 'cubic-horizontal',
        style: {
          stroke: '#CED4D9',
        },
      },
      layout: {
        type: 'indented',
        direction: 'LR',
        dropCap: false,
        indent: 200,
        getHeight: () => {
          return 40;
        },
      },
    };

    // 放大缩小组件
    const animateCfg = { duration: 200, easing: 'easeCubic' };
    const toolbar = new G6.ToolBar({
      // 修改视口控制组件的位置
      position: { x: 20, y: 60 - (urlFlag ? 20 : 0) },
      getContent: () => toolbarNode,
      handleClick: (code) => {
        // eslint-disable-next-line default-case
        switch (code) {
          case 'zoomOut':
            graph?.zoom(1.2, undefined, true, animateCfg);
            break;
          case 'zoomIn':
            graph?.zoom(0.8, undefined, true, animateCfg);
            break;
          case 'realZoom':
            graph?.zoomTo(1.1, undefined, true, animateCfg);
            break;
          case 'autoZoom':
            graph?.fitView(20, undefined, true, animateCfg);
            break;
        }
      },
    });
    const tooltip = new G6.Tooltip({
      offsetX: 10,
      offsetY: 10,
      // the types of items that allow the tooltip show up
      // 允许出现 tooltip 的 item 类型
      itemTypes: ['node'], // 允许出现位置
      // custom the tooltip's content
      // 自定义 tooltip 内容
      getContent: (e) => {
        const outDiv = document.createElement('div');
        outDiv.style.width = '100px';
        // outDiv.style.padding = '0';
        outDiv.innerHTML = `<span>${e.item.getModel().nodeConfigName}</span>`;
        return outDiv;
      },
    });
    if (!graph) {
      graph = new G6.TreeGraph({
        container: chartsRef?.current || '',
        ...defaultConfig,
        plugins: [toolbar, tooltip],
      });
      graph?.data(data);
      graph?.render();
      // graph?.read(data); 接收数据，并进行渲染，read 方法的功能相当于 data 和 render 方法的结合。
      graph?.zoomTo(1.1); // 控制节点的单个大小
      // graph?.fitCenter();  // 视图居中 使用这个方法
      graph?.translate(140, 100); // 采用绝对位移将画布移动到指定坐标。

      const handleCollapse = (e) => {
        const nodeConfigId = e?.target?.get('modelId');
        const item = graph?.findById(nodeConfigId);
        const nodeModel = item?.getModel();
        nodeModel.collapsed = !nodeModel?.collapsed;
        graph?.layout();
        graph?.setItemState(item, 'collapse', nodeModel.collapsed);
      };
      // Icon 折叠的方法
      graph?.on('collapse-text:click', (e) => {
        handleCollapse(e);
      });
      graph?.on('collapse-back:click', (e) => {
        handleCollapse(e);
      });
      // 节点hover进入
      graph?.on('node:mouseenter', (e) => {
        const { item } = e;
        const text = item?.getModel();
        const { style } = text;
        if (style?.fill !== '#47B881') {
          graph?.updateItem(item, {
            style: {
              stroke:
                text?.tenantId === tenantIdNum || text?.fictitiousFlag === 1
                  ? 'rgba(226,226,226,1)'
                  : '#47B881',
              fill:
                text?.tenantId === tenantIdNum || text?.fictitiousFlag === 1
                  ? '#fff'
                  : 'rgba(41,190,206,0.10)',
            },
          });
        }
      });
      // 节点hover离开
      graph?.on('node:mouseleave', (e) => {
        const { item } = e;
        const text = item?.getModel();
        const { style } = text;
        if (style?.fill !== '#47B881') {
          graph.updateItem(item, {
            style: {
              stroke: 'rgba(226,226,226,1)',
              fill: '#fff',
            },
          });
        }
      });
    }
    useFlowGraph(graph);
  };

  return (
    <Fragment>
      <Spin spinning={spinFlag || false}>
        <div
          className={
            styles[
              urlFlag
                ? 'line_charts-height'
                : classify !== 'history'
                ? 'new-line-charts'
                : 'new-line-charts-read'
            ]
          }
        >
          {!urlFlag && (
            <h3 className={styles['page-title_line']}>
              {intl
                .get(`slod.shipmentsConfiguration.view.title.detail.detailStrategy`)
                .d('策略明细')}
            </h3>
          )}
          <div id="change_chart_new_img_id" ref={chartsRef} className={styles['new-charts-img']} />
        </div>
      </Spin>
    </Fragment>
  );
});

export default NewCharts;

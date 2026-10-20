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
import { DataSet, Spin, Modal } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import {
  deleteChartsNode,
  queryFlowChartsInfo,
  queryFlowChartsInfoSRM,
} from '@/services/receiptManageConfigService';
import { recursion } from '@/utils/utils';
import addIcon from '@/assets/add.svg';
import delIcon from '@/assets/delete.svg';
import NewAddNode from '../components/NewAddNode';
import Newpermission from '../components/NewPermission/index.js';
import NewpermissionOnly from '../components/NewPermissionOnly/index.js';

import { addNodeDataSet } from '../components/NewAddNode/store/indexDS';

import { Store } from './index';
import Card from './returnCard';
import styles from './index.less';

let chartsdata: any = {
  chartList: {},
};
interface StorProps {
  editor?: string,
  formRef?: any,
  tabsKey?: string,
  chartsId?: string | number,
  workFlag?: boolean,
  chartList?: any,
  readOnly?: string,
  flowChartsDs?: DataSet,
  handleQueryHeaderInfo?: Function,
  nodeStrategyId?: string,
}


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
  const proRef: any = useRef({});
  const chartsRef: any = useRef(null);
  const [num, usenNum] = useState(0);
  const addNodeRef: any = useRef({});
  const [spinFlag, useSpin] = useState(false); // spining
  const [chartList, useChartList] = useState({}); // 查询节点数据
  // let graph: any = null;
  // eslint-disable-next-line prefer-const
  let [graph, useFlowGraph]: any = useState(null);
  const {
    editor,
    formRef,
    tabsKey,
    chartsId,
    workFlag,
    readOnly,
    flowChartsDs,
    handleQueryHeaderInfo = e => e,
    nodeStrategyId,
  }: StorProps = useContext(Store);
  console.log(readOnly, "readOnly");

  useEffect(() => {
    queryChartsInfo();
    componentWillUnmount();
  }, []);


  useEffect(() => {
    registerFn();
    if (Object.keys(chartList).length > 0) {
      ChartsGraph(chartList);
      graph.render();
      graph.zoomTo(1.1);
      graph.translate(140, 100);
    }
  }, [num]);

  useImperativeHandle(ref, () => ({
    ref,
    clearText,
    flowChartsDs,
    queryChartsInfo,
    chartList: chartList || chartsdata.chartList,
  }));

  // 存在闭包，所以挂在window
  window.readOnly = readOnly;

  function componentWillUnmount() {
    // 组件销毁时你要执行的代码
    window.readOnly = null;
  }


  const publicuFunction = (res) => {
    chartsdata.chartList = res;
    useChartList(res);
    if (num === 1) {
      graph.changeData(res);
      graph.render();
      graph.zoomTo(1.1);
      graph.translate(140, 100);
      handleQueryHeaderInfo(); // 查询头数据
    } else {
      usenNum(1);
    }
  };

  const clearText = async () => {
    useSpin(true);
    try {
      const res = await queryFlowChartsInfo({
        id: chartsId,
      });
      if (getResponse(res)) {
        publicuFunction(res);
      }
    } catch (e) {
      throw e;
    } finally {
      useSpin(false);
    }
  };

  /**
   * 查询流程图的节点数据
   */
  const queryChartsInfo = useCallback(async () => {
    useSpin(true);
    try {
      const params = {
        id: chartsId,
      };
      const res = nodeStrategyId ? await queryFlowChartsInfoSRM(params) : await queryFlowChartsInfo(params);
      if (getResponse(res)) {
        if (!isEmpty(res)) {
          chartsdata.chartList = res;
          useChartList(res);
          usenNum(1);
        }
      }
    } catch (e) {
      throw e;
    } finally {
      useSpin(false);
    }
  }, [chartsId]);

  const destroyModal = () => {
    Modal.destroyAll();
  };

  /**
   * 新增节点事件
   */
  const onOpenModalChange = (data) => {
    const tableDs = new DataSet(addNodeDataSet());
    const dataProps = {
      data,
      tableDs,
      chartsId,
      workFlag,
      useSpin,
      destroyModal,
      publicuFunction,
      queryFlowChartsInfo,
      chartList: chartsdata?.chartList,
    };
    Modal.open({
      // mask: true,
      // drawer: true,
      closable: true,
      resizable: true,
      style: {width: '600px'},
      children: <NewAddNode ref={addNodeRef} {...dataProps} />,
      title: intl.get('sinv.receiptManage.view.title.nodeConfigNames').d('添加子节点'),
      okText: intl.get(`hzero.common.model.sure`).d('确定'),
      cancelText: intl.get('hzero.common.button.cance').d('取消'),
      onOk: async () => addNodeRef.current.handleSaveAddNode(),
    });
  };

  /**
   * 删除节点事件
   */
  const onDeleteNodeChange = async (data) => {
    useSpin(true);
    try {
      const res = await deleteChartsNode([data]);
      if (getResponse(res)) {
        const rec = await queryFlowChartsInfo({ id: chartsId });
        if (getResponse(rec)) {
          if (isEmpty(rec)) {
            //usenNum(0)：当节点返回值rec为空 变更graph的渲染，
            usenNum(0);
          };
          publicuFunction(rec);
          (notification as any).success();
        }
      }
    } catch (e) {
      throw e;
    } finally {
      useSpin(false);
    }
  };

  /**
   * 打开节点-查看/编辑节点信息
   */
  const onOpenNodeMessage =(data) => {
    const dataProps = {
      data,
      tabsKey,
      formRef,
      chartsId,
      spinFlag,
      workFlag,
      readOnly: window?.readOnly,
      flowChartsDs,
      clearText,
      recursion,
      publicuFunction,
      chartList: chartsdata?.chartList,
      strategyLineId: data?.strategyLineId,
      nodeStrategyId,
    };
    const modalProps: any = {
      mask: true,
      drawer: true,
      closable: true,
      resizable: true,
      style: nodeStrategyId ? { width: '742px' } : !['PLAN', 'ASN'].includes(data?.nodeOrderType) ?
        { width: '742px', minWidth: '600px', padding: ' 0 !important' }:  { width: '380px', minWidth: '380px', padding: ' 0 !important' },
      children: nodeStrategyId ? <NewpermissionOnly ref={proRef} {...dataProps} /> : <Newpermission ref={proRef} {...dataProps} />,
      title: `${intl.get('sinv.receiptManage.view.title.situationNode').d('节点详情')}-${data?.nodeConfigName
        }`,
      okText: nodeStrategyId ? intl.get(`hzero.common.view.message.close`).d('关闭') : intl.get(`hzero.common.button.sure`).d('确定'),
      cancelText: intl.get(`hzero.common.button.cancel`).d('取消'),
      onOk: () => {
        if (!nodeStrategyId) {
          handleQueryHeaderInfo(); // 查询头数据
          proRef.current.formChartChange();
        }
      },
    }
    if (nodeStrategyId) {
      delete modalProps.onOk
      delete modalProps.cancelText
      modalProps.cancelButton = false;
      console.log(modalProps, 'modalProps')
    }
    Modal.open({
      ...modalProps,
    });
  };

  /**
   * 自定义节点、边
   */
  const registerFn = () => {
    /**
     * 自定义节点
     */
    G6.registerNode(
      'flow-rect',
      {
        // shapeType: 'flow-rect',
        draw(cfg: any, group: any) {
          const { collapsed, nodeConfigName = '', virtualNodeFlag } = cfg;
          const color = '#47B881';
          // const delColor = '#F56349';
          const faColor = 'rgba(226,226,226,1)';
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
          group?.addShape('rect', {
            attrs: {
              x: nodeOrigin?.x - 1,
              y: rectBBox?.maxY - 35,
              width: 4,
              height: rectConfig?.height + 1,
              radius: [rectConfig?.radius, 0, 0, rectConfig?.radius],
              fill: virtualNodeFlag === 1 ? faColor : color,
            },
          });

          // 添加节点ICON
          group?.addShape('image', {
            attrs: {
              x: nodeOrigin?.x + 110,
              y: rectBBox?.maxY - 22,
              width: 10,
              height: 10,
              img: addIcon,
              cursor: cfg?.trxLineCount <= 0 && 'pointer',
              opacity: 0,
            },
            name: 'img-add',
            addId: cfg?.id,
          });

          // 删除节点ICON
          group?.addShape('image', {
            attrs: {
              x: nodeOrigin?.x + 90,
              y: rectBBox?.maxY - 22,
              width: 10,
              height: 10,
              img: delIcon,
              cursor: (virtualNodeFlag !== 1 && cfg.trxLineCount <= 0) && 'pointer',
              stroke: '#47B881',
              opacity: 0,
            },
            name: 'img-del',
            delId: cfg?.id,
          });

          // 标题
          group?.addShape('text', {
            attrs: {
              ...textConfig,
              x: 12 + nodeOrigin?.x, // 标题水平方向位置
              y: rectBBox?.maxY - 12, // 标题垂直方向位置
              text:
                nodeConfigName && nodeConfigName?.length > 6 ? `${nodeConfigName?.substr(0, 6)}...` : nodeConfigName,
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
            group?.addShape('rect', {
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
            group?.addShape('text', {
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
        afterDraw(cfg: any, group: any) {
          const node = group?.find((element) => element?.get('name') === 'rect-shape');
          const text = group?.find((element) => element?.get('name') === 'rect-text');
          const addImg = group?.find((element) => element?.get('name') === 'img-add');
          const delImg = group?.find((element) => element?.get('name') === 'img-del');
          const flag = cfg?.trxLineCount <= 0 && !nodeStrategyId;
          const onMouseEnter = () => {
            if (cfg?.virtualNodeFlag !== 1) {
              addImg?.attr('opacity', 1);
              delImg?.attr('opacity', 1);
              graph?.get('canvas').draw();
            } else {
              addImg?.attr('opacity', 1);
              addImg?.attr('stroke', 'red');
              graph?.get('canvas').draw();
            }
          };
          const onMouseLeave = () => {
            if (cfg?.virtualNodeFlag !== 1) {
              addImg?.attr('opacity', 0);
              delImg?.attr('opacity', 0);
              graph?.get('canvas').draw();
            } else {
              addImg?.attr('opacity', 0);
              graph?.get('canvas').draw();
            }
          };
          // 节点 或单个展示的hover事件
          // 外层
          node?.on('mouseenter', () => {
            if (flag) onMouseEnter();
          });
          node?.on('mouseleave', () => {
            if (flag) onMouseLeave();
          });
          // 标题文字
          text?.on('mouseenter', () => {
            if (flag) onMouseEnter();
          });
          text?.on('mouseleave', () => {
            if (flag) onMouseLeave();
          });
          // 添加按钮
          addImg?.on('mouseenter', () => {
            if (flag) onMouseEnter();
          });
          addImg?.on('mouseleave', () => {
            if (flag) onMouseLeave();
          });
          // 删除按钮
          delImg?.on('mouseenter', () => {
            if (flag) onMouseEnter();
          });
          delImg?.on('mouseleave', () => {
            if (flag) onMouseLeave();
          });

          // 添加按钮-添加新节点
          addImg?.on('click', e => {
            const nodeConfigId = e?.target?.get('addId');
            const item = graph?.findById(nodeConfigId);
            const data = item?.getModel();
            if (flag) onOpenModalChange(data);
          });
          // 删除按钮-删除节点
          delImg?.on('click', (e) => {
            const nodeConfigId = e?.target?.get('delId');
            const item = graph?.findById(nodeConfigId);
            const data = item?.getModel();
            if (cfg?.virtualNodeFlag !== 1 && flag) onDeleteNodeChange(data);
          });
          // 点击节点 显示节点信息
          node?.on('click', e => {
            const nodeConfigId = e?.target?.get('rectType');
            const item = graph?.findById(nodeConfigId);
            const data = item?.getModel();
            if (cfg?.virtualNodeFlag !== 1) onOpenNodeMessage(data);
          });
          // 点击节点 显示节点信息
          text?.on('click', (e) => {
            const nodeConfigId = e.target.get('textId');
            const item = graph?.findById(nodeConfigId);
            const data = item?.getModel();
            if (cfg?.virtualNodeFlag !== 1) onOpenNodeMessage(data);
          });
        },
        setState(name, value, item: any) {
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
            if (text.virtualNodeFlag !== 1) {
              const nodeColor = value ? 'rgba(41,190,206,0.10)' : '#fff';
              const nodeBorColor = value ? '#47B881' : 'rgba(226,226,226,1)';
              rectNode?.attr('fill', nodeColor);
              rectNode?.attr('stroke', nodeBorColor);
            }
          }
        },
      },
      'rect'
    );
  };

  const ChartsGraph = (data) => {
    const container: any = document?.getElementById('change_chart_new_img_id');
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
      position: { x: 10, y: 40 },
      getContent: () => toolbarNode,
      handleClick: (code) => {
        // 放大缩小 视口内功能按钮的缩放/位置比例
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
        const outDiv = document?.createElement('div');
        outDiv.style.width = '100px';
        // outDiv.style.padding = '0';
        outDiv.innerHTML = `<span>${e?.item?.getModel()?.nodeConfigName}</span>`;
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
      // graph.read(data); 接收数据，并进行渲染，read 方法的功能相当于 data 和 render 方法的结合。
      graph?.zoomTo(1.1); // 控制节点的单个大小
      // graph.fitCenter();  // 视图居中 使用这个方法
      graph?.translate(140, 100); // 采用绝对位移将画布移动到指定坐标。

      const handleCollapse = (e) => {
        const nodeConfigId = e?.target?.get('modelId');
        const item = graph?.findById(nodeConfigId);
        const nodeModel = item?.getModel();
        nodeModel.collapsed = !nodeModel?.collapsed;
        graph?.layout();
        graph?.setItemState(item, 'collapse', nodeModel?.collapsed);
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
                text?.virtualNodeFlag === 1
                  ? 'rgba(226,226,226,1)'
                  : '#47B881',
              fill:
                text?.virtualNodeFlag === 1
                  ? '#fff'
                  : 'rgba(41,190,206,0.10)',
            },
          });
        }
      });
      // 节点hover离开
      graph.on('node:mouseleave', (e) => {
        const { item } = e;
        const text = item?.getModel();
        const { style } = text;
        if (style?.fill !== '#47B881') {
          graph?.updateItem(item, {
            style: {
              stroke: 'rgba(226,226,226,1)',
              fill: '#fff',
            },
          });
        }
      });
      useFlowGraph(graph)
    }
  };

  return (
    <Fragment>
      <Spin spinning={spinFlag}>
        <div className={nodeStrategyId ? styles['new-line-modal'] : styles[!readOnly?'new-line-charts': 'new-line-charts-read']}>
          {nodeStrategyId ? (<h3 className={styles['title-h3']}>
            <div className={styles.block} />
            {intl.get(`sinv.receiptManage.view.title.detailStrategy`).d('策略明细')}
          </h3>) : (<h3 className={styles['page-title']}>
            {intl.get(`sinv.receiptManage.view.title.detailStrategy`).d('策略明细')}
          </h3>)}
          <div id="change_chart_new_img_id" ref={chartsRef} className={styles['new-charts-img']} />
          {/* {Object.keys(chartList).length<=0 && <Card handleCeckBoxChange={onOpenModalChange} type={tabsKey} />} */}
        </div>
      </Spin>
    </Fragment>
  );
});

export default NewCharts;

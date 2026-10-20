import React, { useCallback, useEffect, useRef, useState } from 'react';
import { debounce } from 'lodash';
import { Spin, Text, Icon } from 'choerodon-ui';
import raf from 'raf';
import { Button, Tooltip } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { Size } from 'choerodon-ui/lib/_util/enum';
import { Graph } from '@antv/x6';
import intl from 'srm-front-boot/lib/utils/intl';
import { getResponse } from 'utils/utils';
import { getCombinationBOList } from '@/services/businessObjectService';
import sourceStore from '@/routes/BusinessObjectComposition/store';
import IllustratorNotice from '@/assets/illustrator_notice.svg';
import EREntity, { EDGE_COLOR, GRID_SIZE, NODE_COLOR, NODE_FONT_SIZE } from './EREntity';
import styles from './index.less';

function treeForEach<T, R>(
  nodes: T[],
  fn: (node: T, index: number, level: number, parentNode?: T, parentInfo?: R) => R,
  childName = 'children',
  parentNode?: T,
  parentInfo?: R,
  level = 0,
): void {
  nodes.forEach((node, index) => {
    const info = fn(node, index, level, parentNode, parentInfo);
    const children = node[childName];
    if (children && children.length) {
      treeForEach(children, fn, childName, node, info, level + 1);
    }
  });
}

const scaleSteps: number[] = [
  0.05, 0.06, 0.07, 0.09, 0.11, 0.14, 0.17, 0.21, 0.26, 0.32, 0.39, 0.47, 0.5, 0.57, 0.69, 0.83, 0.92,
  1, 1.2, 1.72, 2, 2.4, 2.88, 3.45, 4.14, 4.96, 5.95, 7.14, 8.56, 10,
];

const STORE_KEY = 'ER_ZOOM_TIP_REMAIN';

type ERDiagramState = {
  remind: boolean;
}

const ERDiagram = function ERDiagram(props) {
  const { businessObjectCombineId } = props;
  const [{ remind }, setState] = useState<ERDiagramState>(() => ({
    remind: localStorage.getItem(STORE_KEY) === '1',
  }));
  const [loading, setLoading] = useState<boolean>(true);
  const [scaleIndex, setScaleIndex] = useState<number>(() => scaleSteps.indexOf(1));
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { store } = React.useContext<any>(sourceStore as any);
  const zoomIn = useCallback(() => {
    setScaleIndex(preScaleIndex => {
      const newScale = preScaleIndex + 1;
      if (newScale < scaleSteps.length) {
        const { graph } = store;
        if (graph) {
          graph.zoom(scaleSteps[newScale] - scaleSteps[preScaleIndex]);
        }
        return newScale;
      }
      return preScaleIndex;
    });
  }, []);
  const zoomOut = useCallback(() => {
    setScaleIndex(preScaleIndex => {
      const newScale = preScaleIndex - 1;
      if (newScale > -1) {
        const { graph } = store;
        if (graph) {
          graph.zoom(scaleSteps[newScale] - scaleSteps[preScaleIndex]);
        }
        return newScale;
      }
      return preScaleIndex;
    });
  }, []);
  const zoom = useCallback(debounce((inOut) => {
    if (inOut === 'in') {
      zoomIn();
    } else {
      zoomOut();
    }
  }, 200), []);
  const getPopoverContent = useCallback(() => {
    const got = () => {
      setState({
        remind: true,
      });
    };
    const neverRemind = () => {
      localStorage.setItem(STORE_KEY, '1');
      setState({
        remind: true,
      });
    };
    return (
      <>
        <img src={IllustratorNotice} />
        <div className="er-zoomer-notice-content">
          <h4>{intl.get('hmde.boComposition.erDiagram.zoom.notice.title').d('快捷缩放')}</h4>
          <p>{intl.get('hmde.boComposition.erDiagram.zoom.notice.description').d('按住键盘Ctrl+鼠标滚轮滚动，也可以进行缩放')}</p>
        </div>
        <div className="er-zoomer-notice-toolbar">
          <span className="er-zoomer-notice-tip">
            {intl.get('hmde.boComposition.erDiagram.zoom.notice.neverRemind').d('不再提示')}
          </span>
          <Button size={Size.small} color={ButtonColor.primary} onClick={neverRemind}>
            {intl.get('hmde.boComposition.erDiagram.zoom.notice.got').d('知道啦')}
          </Button>
        </div>
      </>
    );
  }, []);
  useEffect(() => {
    const { current } = containerRef;
    if (current) {
      const { parentElement } = current;
      const graph = new Graph({
        container: current,
        width: 0,
        height: 0,
        grid: {
          visible: true,
          size: GRID_SIZE,
          type: 'mesh',
          args: {
            color: 'rgba(0,0,0,0.05)',
          },
        },
        panning: {
          enabled: true,
          eventTypes: ['leftMouseDown', 'mouseWheel'],
        },
        mousewheel: {
          enabled: true,
          modifiers: ['ctrl', 'meta'],
          guard(this: Graph, e: WheelEvent) {
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              const delta = e.deltaY;
              if (delta < 0) {
                zoom('in');
              } else if (delta > 0) {
                zoom('out');
              }
            }
            return false;
          },
        },
      });
      store.graph = graph;

      // 初始化
      const fetchData = (): Promise<boModel.combine.IBusinessObject | undefined> => {
        const query = { ignoreRelateFlag: false, includeFieldFlag: true, erModeFlag: true };
        return getCombinationBOList({ businessObjectId: businessObjectCombineId, query })
          .then(res => {
            if (getResponse(res)) {
              return res;
            }
          });
      };
      // 处理数据生成节点
      const processData = (data: boModel.combine.IBusinessObject | undefined) => {
        if (data) {
          const initEdges: Function[] = [];
          graph.batchUpdate(() => {
            treeForEach<boModel.combine.IBusinessObject, EREntity>([data], (item, index, level, parentItem, parentInfo) => {
              const entity = new EREntity({
                object: item,
                graph,
                parent: parentItem,
                parentEntity: parentInfo,
                index,
                level,
                container: current,
              });
              initEdges.push(() => entity.initEdge());
              return entity;
            }, 'businessObjectRelationList');
          });
          // 火狐bug， antv内部调用 getScreenCTM 返回为 null， 必须等待渲染完成才能拿到值
          raf(() => {
            graph.batchUpdate(() => {
              initEdges.forEach((init) => init());
            });
          });
        }
      };
      // 调整画布大小
      const resize = () => {
        if (parentElement && parentElement.offsetParent) {
          graph.resizeGraph(parentElement.offsetWidth, parentElement.offsetHeight);
        }
      };
      fetchData()
        .then(processData)
        .then(resize)
        .finally(() => setLoading(false));
      window.addEventListener('resize', resize);
      return () => {
        store.graph = undefined;
        graph.dispose();
        window.removeEventListener('resize', resize);
      };
    }
  }, []);

  const handleRefresh = () => {
    const { graph } = store;
    graph.translate(0, 0);
    graph.scale(1);
    setScaleIndex(scaleSteps.indexOf(1));
  };

  return (
    <Spin spinning={loading}>
      <div className={styles['er-container']}>
        <div className={styles['er-description']}>
          <div>
            <svg width="20" height="20" className="x6-graph-svg">
              <g className="x6-graph-svg-viewport">
                <g className="x6-graph-svg-stage">
                  <g data-cell-id="tip" data-shape="rect" className="x6-cell x6-node x6-node-immovable" transform="translate(0,0)">
                    <path d="M0,5L10,5zM3,2L3,8zM7,2L7,8z" stroke="#4E5769" />
                  </g>
                </g>
              </g>
            </svg>
            <Text style={{ maxWidth: '110px', color: '#4E5769', position: 'relative', top: '-10px' }}>
              {intl.get('hmde.boComposition.erDiagram.tips.primaryKey').d('主键')}
            </Text>
          </div>
          <div>
            <svg width="20" height="20" className="x6-graph-svg">
              <g className="x6-graph-svg-viewport">
                <g className="x6-graph-svg-stage">
                  <g data-cell-id="tip" data-shape="rect" className="x6-cell x6-node x6-node-immovable" transform="translate(0,0)">
                    <path d="M0,5L10,5zM10,0L3,5L10,10" stroke="#4E5769" fill="none" />
                  </g>
                </g>
              </g>
            </svg>
            <Text style={{ maxWidth: '110px', color: '#4E5769', position: 'relative', top: '-10px' }}>
              {intl.get('hmde.boComposition.erDiagram.tips.oneToMany').d('一对多')}
            </Text>
          </div>
        </div>
        <div ref={containerRef} />
        <Tooltip
          title={intl.get('hmde.boComposition.view.message.initialView').d('初始视图')}
        >
          <div className={styles['refresh-icon']} onClick={handleRefresh}><Icon type='center_focus_strong-o' /></div>
        </Tooltip>
        <Tooltip
          hidden={remind || loading}
          title={getPopoverContent}
          placement="topRight"
          popupClassName={styles['er-zoomer-notice']}
          theme="light"
          getPopupContainer={() => containerRef.current}
        >
          <div className={styles['er-zoomer']}>
            <Button
              size={Size.large}
              funcType={FuncType.link}
              icon="remove"
              disabled={scaleIndex === 0}
              onClick={zoomOut}
            />
            <div>{Math.round(scaleSteps[scaleIndex] * 100)}%</div>
            <Button
              size={Size.large}
              funcType={FuncType.link}
              icon="add"
              disabled={scaleIndex === scaleSteps.length - 1}
              onClick={zoomIn}
            />
          </div>
        </Tooltip>
      </div>
    </Spin>
  );
};

export default ERDiagram;

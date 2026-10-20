/* eslint-disable jsx-a11y/anchor-has-content */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactDom from 'react-dom';
import { debounce } from 'lodash';
import { Spin } from 'choerodon-ui';
import raf from 'raf';
import { Button, Tooltip, Menu, Dropdown } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { Size } from 'choerodon-ui/lib/_util/enum';
import notification from 'utils/notification';
import { Graph, ToolsView } from '@antv/x6';
import intl from 'utils/intl';
// import { getResponse } from 'utils/utils';
import { observer } from 'mobx-react-lite';
import IllustratorNotice from '@/assets/illustrator_notice.svg';
import { copyToClipboard } from '@/utils/utils';
// import { getCombinationBOTreeList } from '@/services/sdpsTransfer/businessObjectService';

import sourceStore from '../store.tsx';
import EREntity, { GRID_SIZE } from './EREntity.tsx';
import styles from './index.less';

class ContextMenuTool extends ToolsView.ToolItem {
  knob;

  timer;

  render() {
    if (!this.knob) {
      this.knob = ToolsView.createElement('div', false);
      this.knob.style.position = 'absolute';
      this.container.appendChild(this.knob);
    }
    return this;
  }

  toggleContextMenu(visible) {
    ReactDom.unmountComponentAtNode(this.knob);
    document.removeEventListener('mousedown', this.onMouseDown);

    if (visible) {
      ReactDom.render(
        <Dropdown visible trigger={['contextMenu']} overlay={this.options.menu}>
          <a />
        </Dropdown>,
        this.knob
      );
      document.addEventListener('mousedown', this.onMouseDown);
    }
  }

  updatePosition(e) {
    const { style } = this.knob;
    if (e) {
      const pos = this.graph.clientToGraph(e.clientX, e.clientY);
      style.left = `${pos.x}px`;
      style.top = `${pos.y}px`;
    } else {
      style.left = '-1000px';
      style.top = '-1000px';
    }
  }

  onMouseDown = () => {
    this.timer = window.setTimeout(() => {
      this.updatePosition();
      this.toggleContextMenu(false);
    }, 200);
  };

  onContextMenu({ e }) {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = 0;
    }
    this.updatePosition(e);
    this.toggleContextMenu(true);
  }

  delegateEvents() {
    this.cellView.on('cell:contextmenu', this.onContextMenu, this);
    return super.delegateEvents();
  }

  onRemove() {
    this.cellView.off('cell:contextmenu', this.onContextMenu, this);
  }
}

ContextMenuTool.config({
  tagName: 'div',
  isSVGElement: false,
});

Graph.registerEdgeTool('contextmenu', ContextMenuTool, true);
Graph.registerNodeTool('contextmenu', ContextMenuTool, true);

function treeForEach(nodes, fn, childName = 'children', parentNode, parentInfo, level = 0) {
  nodes.forEach((node, index) => {
    const info = fn(node, index, level, parentNode, parentInfo);
    const children = node[childName];
    if (children && children.length) {
      treeForEach(children, fn, childName, node, info, level + 1);
    }
  });
}

const scaleSteps = [
  0.05,
  0.06,
  0.07,
  0.09,
  0.11,
  0.14,
  0.17,
  0.21,
  0.26,
  0.32,
  0.39,
  0.47,
  0.5,
  0.57,
  0.69,
  0.83,
  0.92,
  1,
  1.2,
  1.72,
  2,
  2.4,
  2.88,
  3.45,
  4.14,
  4.96,
  5.95,
  7.14,
  8.56,
  10,
];

const STORE_KEY = 'ER_ZOOM_TIP_REMAIN';

const ERDiagram = observer(function ERDiagram(props) {
  const { dataObj } = props;

  // 根据本地缓存查询是否提醒
  const [{ remind }, setState] = useState(() => ({
    remind: localStorage.getItem(STORE_KEY) === '1',
  }));

  const [loading, setLoading] = useState(true);
  const [scaleIndex, setScaleIndex] = useState(() => scaleSteps.indexOf(1)); // 放缩比例

  const containerRef = useRef(null);
  const { store } = React.useContext(sourceStore);

  // 放大
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

  // 缩小
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

  // 防抖
  const zoom = useCallback(
    debounce(inOut => {
      if (inOut === 'in') {
        zoomIn();
      } else {
        zoomOut();
      }
    }, 200),
    []
  );

  // 获取弹窗内容
  const getPopoverContent = useCallback(() => {
    // const got = () => {
    //   setState({
    //     remind: true,
    //   });
    // };
    const neverRemind = () => {
      localStorage.setItem(STORE_KEY, '1');
      setState({
        remind: true,
      });
    };
    return (
      <>
        <img
          src={IllustratorNotice}
          alt={intl.get('hmde.boComposition.erDiagram.zoom.notice.alt').d('提示')}
        />
        <div className="er-zoomer-notice-content">
          <h4>{intl.get('hmde.boComposition.erDiagram.zoom.notice.title').d('快捷缩放')}</h4>
          <p>
            {intl
              .get('hmde.boComposition.erDiagram.zoom.notice.description')
              .d('按住键盘Ctrl+鼠标滚轮滚动，也可以进行缩放')}
          </p>
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

  // 绘图
  useEffect(() => {
    const { current } = containerRef;
    if (current) {
      const { parentElement } = current;
      let tip;
      const graph = new Graph({
        container: current,
        width: 0,
        height: 0,
        interacting(cellView) {
          return cellView.cell.id !== 'tip';
        },
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
          guard(e) {
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

      graph.on('cell:mouseenter', ({ cell }) => {
        const labelList = cell?.store?.data?.markup ?? [];
        const titleList =
          labelList && labelList.length ? labelList.filter(rcd => rcd.selector === 'subtitle') : [];
        const item = titleList && titleList.length ? titleList[0] : {};

        if (cell.isNode()) {
          cell.addTools([
            {
              name: 'contextmenu',
              args: {
                menu: menu(item),
              },
            },
          ]);
        }
      });

      graph.on('cell:mouseleave', ({ cell }) => {
        cell.removeTools();
      });

      store.graph = graph;

      // 处理数据生成节点
      const processData = data => {
        if (data && data instanceof Object && (Object.keys(data)?.length ?? 0) !== 0) {
          const initEdges = [];
          graph.batchUpdate(() => {
            treeForEach(
              [data],
              (item, index, level, parentItem, parentInfo) => {
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
              },
              'businessObjectRelationList'
            );
          });
          // 火狐bug， antv内部调用 getScreenCTM 返回为 null， 必须等待渲染完成才能拿到值
          raf(() => {
            graph.batchUpdate(() => {
              initEdges.forEach(init => init());
              if (tip) {
                tip.position(current.offsetWidth - 76, 20);
              }
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
      const translate = ({ tx, ty }) => {
        if (tip) {
          tip.position(current.offsetWidth - 76 - tx, 20 - ty);
        }
      };

      // 处理数据,构造完毕后调整窗口大小，并取消loading
      processData(dataObj);
      resize();
      setLoading(false);

      graph.on('translate', translate);
      window.addEventListener('resize', resize);
      return () => {
        store.graph = undefined;
        graph.off('translate', translate);
        graph.dispose();
        window.removeEventListener('resize', resize);
      };
    }
  }, [dataObj]);

  const handleCopyTableName = content => {
    if (content?.textContent) {
      copyToClipboard(content.textContent);
    } else {
      notification.error({
        message: intl.get('hmde.boComposition.erDiagram.message.canNotCopy').d('无法复制，请重试'),
      });
    }
  };

  const menu = node => {
    return (
      <Menu>
        <Menu.Item onClick={() => handleCopyTableName(node)}>
          {intl.get('hmde.boComposition.erDiagram.title.copyTableName').d('复制表名')}
        </Menu.Item>
      </Menu>
    );
  };

  return (
    <Spin spinning={loading}>
      <div className={styles['er-container']}>
        <div ref={containerRef} />
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
});

export default ERDiagram;

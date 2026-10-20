import { Graph, Shape } from '@antv/x6';
import uuid from 'uuid/v4';

import { SimpleNodeView } from './view';

export default function init(graphData?) {
  const width = window.innerWidth - 450;
  const height = window.innerHeight - 220;
  let data = {
    // 节点
    nodes: [
      {
        id: `START-${uuid()}`, // String，可选，节点的唯一标识
        nodeCode: 'START',
        x: width / 2, // Number，必选，节点位置的 x 值
        y: height / 2, // Number，必选，节点位置的 y 值
        width: 20, // Number，可选，节点大小的 width 值
        height: 20, // Number，可选，节点大小的 height 值
        shape: 'circle',
        attrs: {
          body: {
            fill: '#F5FFEB',
            cursor: 'pointer',
          },
        },
        ports: {
          groups: {
            start: {
              position: 'bottom',
            },
          },
          items: [
            {
              id: 'start',
              group: 'start',
              attrs: {
                circle: {
                  r: 6,
                  magnet: true,
                  stroke: '#a0d2ff',
                  strokeWidth: 1,
                  fill: '#fff',
                },
              },
            },
          ],
        },
      },
      // {
      //   id: `END-${uuid()}`, // String，节点的唯一标识
      //   nodeCode: 'END',
      //   x: width / 2, // Number，必选，节点位置的 x 值
      //   y: 500, // Number，必选，节点位置的 y 值
      //   width: 20, // Number，可选，节点大小的 width 值
      //   height: 20, // Number，可选，节点大小的 height 值
      //   shape: 'circle',
      //   attrs: {
      //     cursor: 'pointer',
      //     body: {
      //       fill: '#FFF0F0',
      //       cursor: 'pointer',
      //     },
      //   },
      //   ports: {
      //     groups: {
      //       end: {
      //         position: 'top',
      //       },
      //     },
      //     items: [
      //       {
      //         id: 'end',
      //         group: 'end',
      //         attrs: {
      //           circle: {
      //             r: 6,
      //             magnet: true,
      //             stroke: '#a0d2ff',
      //             strokeWidth: 1,
      //             fill: '#fff',
      //           },
      //         },
      //       },
      //     ],
      //   },
      // },
    ],
  };
  if (graphData) {
    data = graphData;
  }

  const graph = new Graph({
    container: document.getElementById('app-content') as any,
    width,
    height,
    panning: true,
    selecting: {
      enabled: true,
      // showNodeSelectionBox: true,
    },
    clipboard: {
      enabled: true,
      useLocalStorage: true,
    },
    history: {
      enabled: true,
      ignoreAdd: false,
      ignoreRemove: false,
      ignoreChange: false,
      beforeAddCommand(event, args: any) {
        // 忽略删除控件的动作
        if (args?.key === 'tools') {
          return false;
        }
        // 忽略点击动作
        if (args?.key === 'zIndex') {
          return false;
        }
        if ((args as any)?.options) {
          return (args as any).options.ignore !== false;
        }
      },
    },
    background: {
      color: '#f7f7f7',
    },
    grid: {
      size: 20,
      visible: true,
    },
    connecting: {
      allowBlank: false, // 是否允许连接到空白位置
      allowMulti: false, // 是否允许在相同的其实和终止节点间创建多条边
      allowLoop: false, // 是否允许创建循环连线
      allowNode: false, // 是否允许边连接到节点上
      router: 'manhattan',
      connector: {
        name: 'rounded',
        args: {
          radius: 8,
        },
      },
      anchor: 'center',
      connectionPoint: 'anchor',
      snap: {
        radius: 20,
      },
      createEdge() {
        return new Shape.Edge({
          attrs: {
            line: {
              stroke: '#000',
              strokeWidth: 1,
              targetMarker: {
                name: 'block',
                width: 12,
                height: 8,
              },
            },
          },
          zIndex: 0,
        });
      },
      validateConnection({ targetMagnet }) {
        return !!targetMagnet;
      },
    },
    keyboard: true,
    minimap: {
      enabled: true,
      container: document.getElementById('app-minimap') as any,
      graphOptions: {
        async: true,
        getCellView(cell) {
          // 用指定的 View 替换节点默认的 View
          if (cell.isNode()) {
            return SimpleNodeView;
          }
        },
        createCellView(cell) {
          // 在小地图中不渲染边
          if (cell.isEdge()) {
            return null;
          }
        },
      },
    },
  });
  console.log('初始化data', data);
  graph.fromJSON(data as any);
  graph.on('node:mouseenter', ({ node }) => {
    const nodeJson = node.toJSON();
    console.log('file: init.ts ~ line 136 ~ graph.on ~ node', node);
    if ((nodeJson as any)?.nodeCode?.indexOf('START') === -1) {
      if ((nodeJson as any)?.nodeCode?.indexOf('CONDITION') === -1) {
        node.addTools({
          name: 'button-remove',
          args: {
            x: 0,
            y: 0,
            offset: { x: 10, y: 10 },
          },
        });
      } else {
        node.addTools({
          name: 'button-remove',
          args: {
            x: 0,
            y: 0,
            offset: { x: 30, y: 20 },
          },
        });
      }
    }
  });
  graph.on('edge:mouseenter', ({ edge }) => {
    edge.addTools({
      name: 'button-remove',
      args: {
        x: 0,
        y: 0,
        offset: { x: 10, y: 10 },
      },
    });
  });
  console.log('graph对象', graph);
  graph.on('node:mouseleave', ({ node }) => {
    node.removeTools();
  });
  graph.on('node:removed', () => {
    console.log('删除');
  });
  graph.on('edge:mouseleave', ({ edge }) => {
    edge.removeTools();
  });
  // delete
  graph.bindKey('backspace', () => {
    const cells = graph.getSelectedCells();
    if (cells.length) {
      graph.removeCells(cells);
    }
  });
  return graph;
}

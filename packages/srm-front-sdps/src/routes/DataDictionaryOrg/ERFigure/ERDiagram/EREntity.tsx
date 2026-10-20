import type { Graph, Node, Point } from '@antv/x6';
import type { Markup } from '@antv/x6/lib/view';
import type { PortManager } from '@antv/x6/lib/model/port';
import type { Attr } from '@antv/x6/lib/registry';

export const GRID_SIZE = 10;
const NODE_WIDTH = 180;
const NODE_HEIGHT = 200;
const NODE_HEADER_HEIGHT = 42;
const NODE_HEADER_PADDING = 4;
const NODE_BODY_PADDING_VERTICAL = 16;
const NODE_BODY_TEXT_INDENT = 32;
const NODE_BODY_TEXT_GUTTER = 4;
const NODE_BG = '#ffffff';
export const NODE_COLOR = '#1D2129';
const NODE_SUB_COLOR = '#868D9C';
const NODE_BORDER_WIDTH = 1;
const NODE_BORDER_COLOR = 'rgba(201,205,212,1)';
const NODE_BORDER_RADIUS = 5;
export const NODE_FONT_SIZE = 12;
const NODE_LINE_HEIGHT = 18;
const NODE_BODY_FIRST_TEXT_Y = NODE_HEADER_HEIGHT + NODE_BORDER_WIDTH + NODE_BODY_PADDING_VERTICAL;
const NODE_FRONT_PADDING = (NODE_LINE_HEIGHT - NODE_FONT_SIZE) / 2;
const NODE_PADDING = 10;
const EDGE_DISTANCE = 20;
export const EDGE_COLOR = '#4E5769';
const MAX_FIELD_SIZE = 5;

const iconKeyMarkup: Markup.JSONMarkup = {
  tagName: 'g',
  attrs: {
    transform: 'translate(7, 59)',
  },
  children: [{
    tagName: 'path',
    attrs: {
      d: 'M4.96466667,9.232 C5.61733334,9.232 6.18466667,8.65866667 6.18466667,8 C6.18466667,7.34133333 5.61733334,6.768 4.96466667,6.768 C4.312,6.768 3.77333333,7.34133333 3.77333333,8 C3.77333333,8.65866667 4.312,9.232 4.96466667,9.232 Z M14.6666667,6.768 L14.6666667,9.232 L13.4466667,9.232 L13.4466667,11.6666667 L11.0353333,11.6666667 L11.0353333,9.232 L8.39733333,9.232 C7.91466666,10.664 6.55333333,11.6666667 4.964,11.6666667 C2.95133333,11.6666667 1.33333333,10.0333333 1.33333333,8 C1.33333333,5.96666667 2.95066666,4.33333333 4.96466667,4.33333333 C6.55333334,4.33333333 7.91466667,5.336 8.39733333,6.768 L14.6666667,6.768 Z',
      fill: 'currentColor',
    },
  }],
};

function fixToGrid(size: number): number {
  return Math.floor(size / GRID_SIZE) * GRID_SIZE;
}

// function sortChildren(list: boModel.combine.IBusinessObject[]): boModel.combine.IBusinessObject[] {
//   return list.sort(({ businessObjectRelationList = [] }, { businessObjectRelationList: bBusinessObjectRelationList = [] }) => {
//     return bBusinessObjectRelationList.length - businessObjectRelationList.length;
//   });
// }


function getTargetPortLabel(relateBusinessObjectFieldCode?: string, relateConditions?: boModel.combine.IRelateConditions[], relateType?: string): Markup.JSONMarkup | undefined {
  const markups: Markup.JSONMarkup[] = [];
  if (relateBusinessObjectFieldCode) {
    markups.push({
      tagName: 'text',
      textContent: ['SLAVE_MASTER', 'LINK'].includes(relateType) ? '' : relateBusinessObjectFieldCode,
      attrs: {
        fill: EDGE_COLOR,
        fontSize: NODE_FONT_SIZE,
        textAnchor: 'right',
        y: relateConditions && relateConditions.length ? -NODE_FONT_SIZE : 0,
      },
    });
  }
  if (relateConditions && relateConditions.length) {
    const condition = relateConditions[0];
    markups.push({
      tagName: 'text',
      textContent: `${condition.fieldCode}=${condition.value}`,
      attrs: {
        fill: EDGE_COLOR,
        fontSize: NODE_FONT_SIZE,
        textAnchor: 'right',
      },
    });
  }
  if (markups.length > 1) {
    return {
      tagName: 'g',
      children: markups,
    };
  }
  return markups[0];
}

export interface EREntityProps {
  object: boModel.combine.IBusinessObject;
  graph: Graph;
  parent?: boModel.combine.IBusinessObject;
  index: number;
  level: number;
  parentEntity?: EREntity;
  container: HTMLDivElement;
}

export default class EREntity {
  graph: Graph;

  object: boModel.combine.IBusinessObject;

  props: EREntityProps;

  x: number = 20;

  y: number = 58;

  marginLeft: number = 0;

  marginRight: number = 0;

  lastY?: number;

  width: number;

  height: number;

  id: string;

  index: number;

  node: Node;

  parentEntity?: EREntity;

  children: EREntity[] = [];

  wrapper?: SVGGElement | null;

  childrenLength: number;

  side: 'left' | 'right' = 'right';

  constructor(props: EREntityProps) {
    this.props = props;
    const { graph, parentEntity, index, object } = props;
    this.graph = graph;
    this.index = index;
    this.parentEntity = parentEntity;
    this.object = object;
    const {
      businessObjectRelationId,
      businessObjectRelationList,
    } = object;
    let childrenLength = 0;
    if (businessObjectRelationList) {
      // object.businessObjectRelationList = sortChildren(businessObjectRelationList);
      childrenLength = businessObjectRelationList.length;
    }
    this.id = String(businessObjectRelationId);
    this.childrenLength = childrenLength;
    this.width = NODE_WIDTH;
    this.height = Math.max(NODE_HEIGHT, (childrenLength + 1) * GRID_SIZE);
    this.node = this.initNode();
    this.calcWidth();
    this.initPorts();
    // this.initEdge();
  }

  initNode(): Node {
    const { object, graph, id, x, y, width, height } = this;
    const {
      businessObjectRelationFieldList = [], // 其余不带钥匙的code
      businessObjectRelationList = [],
      relBusinessObjectPrimaryKeyCode, // 带钥匙的code
      relateBusinessObjectFieldCode, 
      relBusinessObjectName,
      dstTable: relateBusinessObjectCode,
    } = object;
    const fieldLength = businessObjectRelationFieldList ? businessObjectRelationFieldList.length : 0;
    // 主键没有算在字段列表中，所以要+1
    const count = fieldLength > MAX_FIELD_SIZE - 1 ? fieldLength - MAX_FIELD_SIZE + 1 : 0;
    const fields = new Set([relBusinessObjectPrimaryKeyCode]);
    if (relateBusinessObjectFieldCode) {
      fields.add(relateBusinessObjectFieldCode);
    }
    if (businessObjectRelationList) {
      businessObjectRelationList.some(({ parentBusinessObjectFieldCode }) => {
        if (parentBusinessObjectFieldCode && parentBusinessObjectFieldCode !== relBusinessObjectPrimaryKeyCode) {
          fields.add(parentBusinessObjectFieldCode);
        }
        return fields.size === MAX_FIELD_SIZE;
      });
    }
    if (businessObjectRelationFieldList && fields.size < MAX_FIELD_SIZE) {
      businessObjectRelationFieldList.some(({ businessObjectFieldCode }) => {
        if (businessObjectFieldCode !== relBusinessObjectPrimaryKeyCode) {
          fields.add(businessObjectFieldCode);
        }
        return fields.size === MAX_FIELD_SIZE;
      });
    }
    const markup: Markup.JSONMarkup[] = [
      {
        tagName: 'rect',
        selector: 'body',
      },
      {
        tagName: 'rect',
        selector: 'divider',
      },
    ];
    const attrs: Attr.CellAttrs = {
      body: {
        fill: NODE_BG,
        refWidth: null,
        refHeight: null,
        width: this.width,
        height: this.height,
        stroke: NODE_BORDER_COLOR,
        strokeWidth: NODE_BORDER_WIDTH,
        rx: NODE_BORDER_RADIUS,
      },
      divider: {
        ref: 'body',
        fill: NODE_BORDER_COLOR,
        y: NODE_HEADER_HEIGHT,
        stroke: 'none',
        refWidth: '100%',
        height: 1,
      },
      title: {
        ref: 'body',
        fontSize: NODE_FONT_SIZE,
        fill: NODE_COLOR,
        refX: '50%',
        refY: 0,
        y: NODE_HEADER_PADDING + NODE_LINE_HEIGHT / 2 + NODE_FRONT_PADDING,
        textAnchor: 'middle',
      },
      subtitle: {
        ref: 'body',
        fontSize: NODE_FONT_SIZE,
        fill: NODE_COLOR,
        refX: '50%',
        refY: 0,
        y: NODE_HEADER_PADDING + NODE_LINE_HEIGHT + NODE_LINE_HEIGHT / 2 + NODE_FRONT_PADDING,
        textAnchor: 'middle',
      },
    };
    if (relBusinessObjectName) {
      markup.push({
        tagName: 'text',
        selector: 'title',
        textContent: relBusinessObjectName,
      });
    }
    if (relateBusinessObjectCode) {
      markup.push({
        tagName: 'text',
        selector: 'subtitle',
        textContent: relateBusinessObjectCode,
      });
    }
    if (fields && fields.size) {
      markup.push(iconKeyMarkup);
      let index = 0;
      fields.forEach((field) => {
        const fieldKey = `field-${index}`;
        markup.push({
          tagName: 'text',
          selector: fieldKey,
          textContent: field,
        });
        attrs[fieldKey] = {
          fontSize: NODE_FONT_SIZE,
          fill: NODE_COLOR,
          refX: NODE_BODY_TEXT_INDENT,
          refY: 0,
          y: NODE_BODY_FIRST_TEXT_Y + (NODE_LINE_HEIGHT + NODE_BODY_TEXT_GUTTER) * index + NODE_LINE_HEIGHT / 2 + NODE_FRONT_PADDING,
          textAnchor: 'left',
        };
        index++;
      });
    }
    if (count) {
      markup.push({
        tagName: 'text',
        selector: 'restCount',
      });
      attrs.restCount = {
        fontSize: NODE_FONT_SIZE,
        fill: NODE_SUB_COLOR,
        refX: NODE_BODY_TEXT_INDENT,
        refY: 0,
        y: NODE_BODY_FIRST_TEXT_Y + (NODE_LINE_HEIGHT + NODE_BODY_TEXT_GUTTER) * 5 + NODE_LINE_HEIGHT / 2,
        textAnchor: 'left',
        textVerticalAnchor: 'middle',
        text: `...+${count}`,
      };
    }

    return graph.addNode({
      id,
      x,
      y,
      width,
      height,
      markup,
      attrs,
      ports: {
        groups: {
          from: {
            markup: [{
              tagName: 'path',
            }],
            position: {
              name: 'absolute',
            },
          },
          to: {
            markup: [{
              tagName: 'path',
            }],
            position: {
              name: 'absolute',
            },
          },
        },
      },
      zIndex: 1,
    });
  }

  initPorts() {
    const {
      width, height, wrapper, parentEntity, childrenLength,
      object: {
        srcColumn: relateBusinessObjectFieldCod,
        relateConditions,
        relateType,
      },
    } = this;
    const relateBusinessObjectFieldCode = String(relateBusinessObjectFieldCod ?? '').toLowerCase();

    const distance = height / (childrenLength + 1) < EDGE_DISTANCE ? GRID_SIZE : EDGE_DISTANCE;
    const ports: PortManager.PortMetadata[] = Array.from({ length: childrenLength }).map((_, index) => ({
      id: `port-${index}`,
      group: 'from',
      args: {
        x: width,
        y: distance * (index + 1),
      },
    }));
    if (parentEntity) {
      ports.push({
        id: 'port-target',
        group: 'to',
        args: {
          x: 0,
          y: height - EDGE_DISTANCE,
        },
        label: relateBusinessObjectFieldCode || relateConditions ? {
          markup: getTargetPortLabel(relateBusinessObjectFieldCode, relateConditions,relateType),
          position: {
            args: {
              x: -5,
              y: -distance / 2,
            },
          },
        } : undefined,
      });
    }
    this.node.addPorts(ports);
    const newWidth = wrapper ? wrapper.getBBox().width : this.width;
    this.marginLeft = fixToGrid(newWidth - width);
  }

  initEdge() {
    const { parentEntity, height, index, graph, marginLeft } = this;
    if (parentEntity) {
      const { lastY, node: parentNode, children, object: { businessObjectRelationList } } = parentEntity;
      const {
        srcColumn: relateBusinessObjectFieldCod,
        dstColumn: parentBusinessObjectFieldCod,
        relateType,
        linkRelationType,
      } = this.object;
      const relateBusinessObjectFieldCode = String(relateBusinessObjectFieldCod || '').toLowerCase();
      const parentBusinessObjectFieldCode = String(parentBusinessObjectFieldCod || '').toLowerCase();

      const listSize = businessObjectRelationList ? businessObjectRelationList.length : 0;
      const distance = parentEntity.height / (listSize + 1) < EDGE_DISTANCE ? GRID_SIZE : EDGE_DISTANCE;
      this.x = marginLeft + parentEntity.x + parentEntity.width + distance * (listSize + 1) + parentEntity.marginRight;
      this.y = lastY ? lastY + EDGE_DISTANCE : parentEntity.y + (index * (parentEntity.height + EDGE_DISTANCE));
      const newLastY = this.y + height;
      parentEntity.lastY = newLastY;
      let { parentEntity: parentItem } = parentEntity;
      while (parentItem) {
        parentItem.lastY = newLastY;
        parentItem = parentItem.parentEntity;
      }

      const getVertices = (): Point.PointLike[] => {
        if (parentEntity) {
          return [
            {
              x: this.x - distance * (index + 1) - marginLeft,
              y: parentEntity.y + (index + 1) * distance,
            },
            {
              x: this.x - distance * (index + 1) - marginLeft,
              y: this.y + height - EDGE_DISTANCE,
            },
          ];
        }
        return [];
      };
      this.node.setPosition({
        x: this.x,
        y: this.y,
      });

      const isSourcePrimaryKey = relateType === 'MASTER_SLAVE' || !parentBusinessObjectFieldCode || parentBusinessObjectFieldCode === parentEntity.object.relBusinessObjectPrimaryKeyCode;
      const isTargetPrimaryKey = ['SLAVE_MASTER', 'LINK'].includes(relateType);
      const isSourceMany = linkRelationType === 'ONE_TO_MANY' && parentBusinessObjectFieldCode;
      const isTargetMany = linkRelationType === 'ONE_TO_MANY' && relateBusinessObjectFieldCode;

      const edge = graph.addEdge({
        source: {
          cell: String(parentEntity.object.businessObjectRelationId),
          port: `port-${index}`,
        },
        target: {
          cell: this.id,
          port: 'port-target',
        },
        connector: {
          name: 'rounded',
          args: {},
        },
        vertices: getVertices(),
        attrs: {
          line: {
            stroke: EDGE_COLOR,
            strokeWidth: 1,
            sourceMarker: {
              name: 'path',
              fill: 'none',
              d: isSourcePrimaryKey ?
                'M4,-3L4,3zM7,-3L7,3' : isSourceMany ?
                  'M0,-5L7,0L0,5' : '',
              offsetX: -3.5,
            },
            targetMarker: {
              name: 'path',
              fill: 'none',
              d: isTargetPrimaryKey ?
                'M4,-3L4,3zM7,-3L7,3' : isTargetMany ?
                  'M0,-5L7,0L0,5' : '',
              offsetX: -3.5,
            },
          },
        },
        zIndex: 0,
      });
      if (parentNode) {
        parentNode.on('change:position', ({ current, previous }) => {
          if (current) {
            parentEntity.x = current.x;
            parentEntity.y = current.y;
            if (previous) {
              this.x += current.x - previous.x;
              this.node.setPosition({
                x: this.x,
                y: this.y,
              });
            }
            edge.setVertices(getVertices());
          }
        });
        if (parentBusinessObjectFieldCode && parentEntity && parentBusinessObjectFieldCode !== parentEntity.object.relBusinessObjectPrimaryKeyCode) {
          const sourcePort = parentNode.getPort(`port-${index}`);
          if (sourcePort) {
            parentNode.setPortProp(`port-${index}`, 'label', {
              markup: {
                tagName: 'g',
                children: [
                  {
                    tagName: 'rect',
                    attrs: {
                      height: NODE_FONT_SIZE,
                      fill: '#fff',
                      y: '-6px',
                    },
                  },
                  {
                    tagName: 'text',
                    textContent: isSourcePrimaryKey ? '' : parentBusinessObjectFieldCode,
                    attrs: {
                      fill: EDGE_COLOR,
                      fontSize: NODE_FONT_SIZE,
                      textAnchor: 'left',
                      y: '.3em',
                    },
                  },
                ],
              },
              position: {
                name: 'right',
                args: {
                  x: 5,
                  y: distance < NODE_FONT_SIZE ? 0 : -distance / 2,
                },
              },
            });
            const { wrapper } = parentEntity;
            if (wrapper) {
              const labelWrapper = wrapper.querySelector<SVGGElement>(`path[port="port-${index}"] + g`);
              if (labelWrapper) {
                parentNode.setPortProp(`port-${index}`, 'label/markup/children/0/attrs/width', labelWrapper.getBBox().width);
              }
              const newWidth2 = fixToGrid(wrapper.getBBox().width);
              const marginRight = Math.max(parentEntity.marginRight, newWidth2 - parentEntity.width - parentEntity.marginLeft);
              if (marginRight > parentEntity.marginRight) {
                const deta = marginRight - parentEntity.marginRight;
                this.x += deta;
                parentEntity.marginRight = marginRight;
                parentNode.trigger('change:position', {
                  current: {
                    x: parentEntity.x,
                    y: parentEntity.y,
                  },
                });
                this.node.setPosition({
                  x: this.x,
                  y: this.y,
                });
                children.forEach(child => {
                  child.node.setPosition({
                    x: child.x + deta,
                    y: child.y,
                  });
                });
              }
            }
          }
        }
      }
      this.node.on('change:position', ({ current }) => {
        if (current) {
          this.x = current.x;
          this.y = current.y;
          edge.setVertices(getVertices());
        }
      });
      children.push(this);
    }
  }

  calcWidth() {
    const { container } = this.props;
    const g = container.querySelector<SVGGElement>(`g[data-cell-id="${this.id}"]`);
    this.wrapper = g;
    let width = g ? g.getBBox().width : this.width;
    // 文字超出时调整宽度
    if (width > NODE_WIDTH) {
      width = fixToGrid(width) + NODE_PADDING * 2;
    } else if (g) {
      const texts = Array.from(g.querySelectorAll<SVGTextElement>('text'));
      const oversizeTextWidth = texts.reduce((width, text) => {
        const textWidth = text.getBBox().width + NODE_PADDING * 2;
        return textWidth > width ? textWidth : width;
      }, NODE_WIDTH);
      if (oversizeTextWidth > NODE_WIDTH) {
        width = fixToGrid(oversizeTextWidth);
      }
    }
    if (width > NODE_WIDTH) {
      this.node.setAttrByPath('body/width', width);
      this.width = width;
    }
    return width;
  }
}

/* eslint-disable react/no-array-index-key */
import React from 'react';
import Sortable from 'sortablejs';
import { Icon } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import _ from 'lodash';
import Columns from './Columns';
import { getOffset } from './util';

class SourceData extends React.Component {
  boxEle;

  constructor(props) {
    super(props);
    this.state = {
      activeKey: null,
      sorting: false,
      relationList: [],
      itemList: [],
      tree: [],
      path: [],
      displaySearch: false,
    };
  }

  // 由于sortablejs直接操作dom，不符合受控组件逻辑，现在每次改变排序一次，render触发4次：
  // 1、sortjs改变dom；
  // 2、改变受控组件原始数据排序；
  // 3、由于受控组件直接改变了原始数据的排序，所以sortablejs改变的sort需要还原
  // 4、sort还原后 需要重新触发render，改变currentActive位置
  // 后续优化
  componentDidMount() {
    const { isSort } = this.props;
    const ele = this.boxEle.querySelector('.column-content');
    let order = [];
    if (isSort) {
      const sortable = new Sortable(ele, {
        onStart: () => {
          this.setState({
            sorting: true,
          });
        },
        onEnd: (evt) => {
          sortable.sort(order); // sortablejs排序还原
          this.props.changeData(evt.oldIndex, evt.newIndex);
          this.setState({
            sorting: false,
          });
        },
      });
      order = sortable.toArray();
    }
  }

  show(data, relation, iconStatus) {
    const arr = iconStatus ? relation.concat(iconStatus) : relation;
    return data.map((item) => {
      const temp = item;
      let iconShow = 'hidden';
      arr.forEach((n) => {
        if (
          n.key === temp.key ||
          (n.source &&
            _.isEqual(
              _.omit(n.source, ['key', 'iconShow', 'x', 'y']),
              _.omit(temp, ['key', 'iconShow', 'x', 'y'])
            ))
        ) {
          iconShow = 'inherit';
        }
      });
      temp.iconShow = iconShow;
      if (temp.children) {
        this.show(temp.children, relation, iconStatus);
      }
      return temp;
    });
  }

  searchPath(data) {
    const { sourceValue } = this.props;
    const { path } = this.state;
    if (sourceValue !== '' && sourceValue) {
      data.map((item) => {
        if (item.name.indexOf(sourceValue.trim()) >= 0) {
          path.push(item.parentPath.split('.'));
          path.push(item.name);
        }
        if (item.children) {
          this.searchPath(item.children);
        }
        return null;
      });
    }
  }

  handleColumn(list) {
    const { searchingSource, data } = this.props;
    const { path } = this.state;
    if (searchingSource === false) {
      this.handleToggle(list);
    } else {
      this.searchPath(data);
      const pathFlat = path.flat();
      Object.defineProperty(list, 'displayIcon', { value: !list.displayIcon, enumerable: true });
      if (list.children) {
        list.children.map((item) => {
          if (pathFlat.includes(item.name)) {
            Object.defineProperty(item, 'displayTree', {
              value: list.displayIcon,
              enumerable: true,
            });
            Object.defineProperty(item, 'displayIcon', {
              value: !list.displayIcon,
              enumerable: true,
            });
            this.handleColumn(item);
          }
          return null;
        });
      }
    }
    this.setState({
      path: [],
    });
  }

  handleToggle(list) {
    const { relation, currentId, contentId } = this.props;
    const { relationList, itemList, tree } = this.state;
    const baseY = getOffset(document.getElementsByClassName('field-relation')[currentId]).top;
    // 获取点击项及其子项
    itemList.push(list);
    Object.defineProperty(list, 'displayIcon', { value: !list.displayIcon });
    if (list.children) {
      relation.map((item) => {
        if (item.source.parentName === list.name) {
          // 获取所有需要折叠的relation
          relationList.push(item);
        }
        return null;
      });
      list.children.map((item) => {
        Object.defineProperty(item, 'displayTree', { value: list.displayIcon, enumerable: true });
        Object.defineProperty(item, 'displayIcon', { value: !list.displayIcon, enumerable: true });
        this.handleToggle(item);
        return null;
      });
    }
    if (itemList[0].displayIcon === false) {
      tree.push(itemList);
      for (let i = tree.length; i > 0; i--) {
        if (tree[i - 1][0].displayTree === false) {
          tree.splice(i - 1, 1);
        }
      }
      relation.map((item) => {
        if (relationList.includes(item)) {
          new Promise((resolve) => {
            resolve();
          }).then(() => {
            Object.defineProperty(item.source, 'y', {
              value:
                getOffset(
                  document.getElementsByClassName('column-content')[contentId].children[
                    itemList[0].index
                  ]
                ).top -
                baseY +
                17,
              enumerable: true,
            });
          });
        }
        // 非当前折叠项的relation需要重新计算
        else if (!relationList.includes(item)) {
          // 非折叠项
          if (item.source.displayTree === true) {
            new Promise((resolve) => {
              resolve();
            }).then(() => {
              Object.defineProperty(item.source, 'y', {
                value:
                  getOffset(
                    document.getElementsByClassName('column-content')[contentId].children[
                      item.source.index
                    ]
                  ).top -
                  baseY +
                  17,
                enumerable: true,
              });
            });
          }
          // 折叠项
          else if (item.source.displayTree === false) {
            const set = [...new Set(tree)];
            if (set !== undefined && set.length !== 0) {
              for (let i = 0; i < set.length - 1; i++) {
                set[i].map((mapItem) => {
                  if (
                    item.source.name === mapItem.name &&
                    item.source.parentPath === mapItem.parentPath
                  ) {
                    new Promise((resolve) => {
                      resolve();
                    }).then(() => {
                      Object.defineProperty(item.source, 'y', {
                        value:
                          getOffset(
                            document.getElementsByClassName('column-content')[contentId].children[
                              set[i][0].index
                            ]
                          ).top -
                          baseY +
                          17,
                        enumerable: true,
                      });
                    });
                  }
                  return null;
                });
              }
            }
          }
        }
        return null;
      });
    } else if (itemList[0].displayIcon === true) {
      for (let i = tree.length; i > 0; i--) {
        if (tree[i - 1][0].displayIcon === true) {
          tree.splice(i - 1, 1);
        }
      }
      relation.map((item) => {
        if (relationList.includes(item)) {
          new Promise((resolve) => {
            resolve();
          }).then(() => {
            Object.defineProperty(item.source, 'y', {
              value:
                getOffset(
                  document.getElementsByClassName('column-content')[contentId].children[
                    item.source.index
                  ]
                ).top -
                baseY +
                17,
              enumerable: true,
            });
          });
        } else if (!relationList.includes(item)) {
          // 非折叠项
          if (item.source.displayTree === true) {
            new Promise((resolve) => {
              resolve();
            }).then(() => {
              Object.defineProperty(item.source, 'y', {
                value:
                  getOffset(
                    document.getElementsByClassName('column-content')[contentId].children[
                      item.source.index
                    ]
                  ).top -
                  baseY +
                  17,
                enumerable: true,
              });
            });
          }
          // 折叠项
          else if (item.source.displayTree === false) {
            const set = [...new Set(tree)];
            if (set !== undefined && set.length !== 0) {
              for (let i = 0; i < set.length; i++) {
                set[i].map((mapItem) => {
                  if (
                    item.source.name === mapItem.name &&
                    item.source.parentPath === mapItem.parentPath
                  ) {
                    new Promise((resolve) => {
                      resolve();
                    }).then(() => {
                      Object.defineProperty(item.source, 'y', {
                        value:
                          getOffset(
                            document.getElementsByClassName('column-content')[contentId].children[
                              set[i][0].index
                            ]
                          ).top -
                          baseY +
                          17,
                        enumerable: true,
                      });
                    });
                  }
                  return null;
                });
              }
            }
          }
        }
        return null;
      });
    }
    // 重置参数
    this.setState({
      relationList: [],
      itemList: [],
    });
  }

  isActive(key) {
    const { currentRelation } = this.props;
    const className = [];
    if (this.state.activeKey === key) {
      className.push('active');
    } else if (currentRelation.source && currentRelation.source.key === key) {
      className.push('active');
    }
    return className.join(' ');
  }

  eventHandle(item, type, activeKey) {
    if (!this.state.sorting) {
      this.setState(
        {
          activeKey,
        },
        () => {
          this.props.overActive(item, 'source', type);
        }
      );
    }
  }

  treeRender(list = [], columns = [], columnOpt = () => {}, edit, sorting, temps = []) {
    const treeList = temps;
    list.forEach((item) => {
      const temp = item;
      treeList.push(
        <Columns
          columns={columns}
          key={`source_${temp.key}`}
          columnOpt={columnOpt}
          sorting={sorting}
          item={temp}
          index={temp.index}
          type="source"
          edit={edit}
          handleToggle={() => this.handleColumn(temp)}
        />
      );
      if (temp.children) {
        this.treeRender(item.children, columns, columnOpt, edit, sorting, treeList);
      }
    });
    return treeList;
  }

  @Bind()
  toggleDisplay(value) {
    this.setState({
      displaySearch: value,
    });
  }

  render() {
    const { columns, data, iconStatus, relation, edit, SearchSource, contentId } = this.props;
    const { displaySearch } = this.state;
    const columnOpt = (item, index) => {
      return {
        'data-id': index,
        'data-key': item.key,
        className: this.isActive(item.key),
        onMouseEnter: this.eventHandle.bind(this, item, 'enter', item.key),
        onMouseLeave: this.eventHandle.bind(this, item, 'leave', null),
      };
    };
    const renderContent = this.show(data, relation, iconStatus);
    return (
      <div
        className="source-data"
        ref={(me) => {
          this.boxEle = me;
        }}
      >
        <ul className="column-title">
          <li>
            {columns.map((column, idx) => {
              return (
                <span
                  key={idx}
                  className="column-item"
                  style={{
                    width: column.width,
                    textAlign: column.align,
                  }}
                >
                  {column.title}
                  {!displaySearch && (
                    <Icon
                      type="search"
                      onClick={() => this.toggleDisplay(true)}
                      style={{ right: 12, top: 8, position: 'absolute', cursor: 'pointer' }}
                    />
                  )}
                  {displaySearch && SearchSource()}
                </span>
              );
            })}
          </li>
        </ul>
        <ul className="column-content" id={contentId}>
          {this.treeRender(renderContent, columns, columnOpt, edit, this.state.sorting)}
        </ul>
      </div>
    );
  }
}
export default SourceData;

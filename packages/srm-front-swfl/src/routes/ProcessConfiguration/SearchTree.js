/**
 * SearchTree - 查询树组件
 * @date: 2022-06-29
 * @author: Lokya <kan.li01@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { useEffect, useState, useContext } from 'react';
import { Collapse, Spin } from 'choerodon-ui';
import { TextField, Icon, Modal, Menu, Dropdown } from 'choerodon-ui/pro';
import classNames from 'classnames';
import { isFunction } from 'lodash';

import { getResponse } from 'hzero-front/lib/utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';

import { Context } from './store';
import {
  queryProcessTreeNode,
  updateProcessDocument,
  deleteProcessDocument,
  saveProcessCategory,
  updateProcessCategory,
  deleteProcessCategory,
  copySiteRecord,
} from './processConfigurationService';
import EditModal from './EditModal';
import CreateModal from './CreateModal';

const { Panel } = Collapse;
const { Item } = Menu;

const processEditModalKey = Modal.key();
const processCategoryModalKey = Modal.key();

export default function SearchTree() {
  const [treeNode, setTreeNode] = useState([]);
  const [treeLoading, handleTreeLoading] = useState(false);
  const [currentActiveComponentId, setCurrentActiveComponentId] = useState('');
  const [queryValue, setQueryValue] = useState('');
  const [preTreeWidth, setPreTreeWidth] = useState(0);
  const {
    processDocumentDs,
    processCategoriesDs,
    processCategoriesEditDs,
    setCurrentNode,
    searchTreeRef,
    changeEmptyFlag,
    leftTreeWidth,
    setLeftTreeWidth,
  } = useContext(Context);

  useEffect(() => {
    queryTreeNode();
  }, []);

  const TYPE_MAP = {
    document: {
      dataSet: processDocumentDs,
      saveFnc: (resolve, reject, parentNode) =>
        onUpdateProcess(processDocumentDs, updateProcessDocument, resolve, reject, parentNode),
      title: intl
        .get('swfl.processConfiguration.view.title.searchTree.processDocument')
        .d('编辑流程单据信息'),
    },
    category: {
      dataSet: processCategoriesEditDs,
      saveFnc: (resolve, reject, parentNode) =>
        onUpdateProcess(
          processCategoriesEditDs,
          updateProcessCategory,
          resolve,
          reject,
          parentNode
        ),
      title: intl
        .get('swfl.processConfiguration.view.title.searchTree.processCategories')
        .d('编辑流程分类信息'),
    },
  };

  const queryTreeNode = (params = {}, callback) => {
    handleTreeLoading(true);
    queryProcessTreeNode(params)
      .then((res) => {
        if (getResponse(res)) {
          setTreeNode(res);
          if (res.length > 0) {
            changeEmptyFlag(false);
          }
          if (callback && isFunction(callback)) {
            callback();
          }
        }
      })
      .catch((err) => {
        notification.error({
          message: err,
        });
      })
      .finally(() => {
        handleTreeLoading(false);
      });
  };

  const refreshSearchTree = () => {
    queryTreeNode({
      descriptionLike: queryValue,
    });
  };

  const selectTreeNode = (node = {}, queryBeforeSelectFlag = false) => {
    // 存储当前节点数据
    const setNode = () => {
      if (node.categoryId) {
        setCurrentActiveComponentId(`${node.documentId}-${node.categoryId}`); // 特殊 id 拼接防止不同的 documentId 下面 categoryId 相同的数据同时被选中，拼接使其唯一
      } else {
        setCurrentActiveComponentId(node.documentId);
      }
      setCurrentNode(node);
    };
    // 判断是否需要先刷新 tree 数据
    if (queryBeforeSelectFlag) {
      queryTreeNode(
        {
          descriptionLike: queryValue,
        },
        setNode
      );
    } else {
      setNode();
    }
  };

  const handleSearch = (value) => {
    setQueryValue(value);
    queryTreeNode({
      descriptionLike: value,
    });
  };

  const onUpdateProcess = (dataSet, updateFunction, resolve, reject, parentNode = {}) => {
    const saveData = dataSet.current.toData();
    updateFunction(saveData)
      .then((res) => {
        if (getResponse(res)) {
          selectTreeNode(
            {
              ...parentNode,
              ...res,
            },
            true
          );
          notification.success();
          resolve();
        } else {
          resolve(false);
        }
      })
      .catch((err) => reject(err));
  };

  const openEditModal = (record = {}, type, parentNode) => {
    TYPE_MAP[type].dataSet.create(record).status = 'update';
    Modal.open({
      key: processEditModalKey,
      title: TYPE_MAP[type].title,
      destroyOnClose: true,
      drawer: true,
      style: {
        width: '380px',
      },
      children: <EditModal dataSet={TYPE_MAP[type].dataSet} type={type} />,
      onOk: () =>
        TYPE_MAP[type].dataSet.validate().then((res) => {
          if (res) {
            return new Promise((resolve, reject) =>
              TYPE_MAP[type].saveFnc(resolve, reject, parentNode)
            );
          } else {
            return false;
          }
        }),
      onClose: () => {
        TYPE_MAP[type].dataSet.reset();
      },
    });
  };

  const onDeleteProcessDocument = (record = {}) => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk: () => {
        deleteProcessDocument(record)
          .then((res) => {
            if (getResponse(res)) {
              selectTreeNode({}, true);
              return true;
            } else {
              return false;
            }
          })
          .catch(() => false);
      },
    });
  };

  const onSaveProcessCategory = (resolve, reject) => {
    const saveData = processCategoriesDs.current.toData();
    saveProcessCategory(saveData)
      .then((res) => {
        if (getResponse(res)) {
          selectTreeNode(res, true);
          notification.success();
          return resolve();
        } else {
          return resolve(false);
        }
      })
      .catch((err) => reject(err));
  };

  const openCreateModal = (parentNode = {}, leafNode = {}) => {
    processCategoriesDs.create({
      ...parentNode,
      ...leafNode,
    });
    Modal.open({
      key: processCategoryModalKey,
      title: intl
        .get('swfl.processConfiguration.view.title.searchTree.processCategoryModal')
        .d('新增分类'),
      drawer: true,
      style: {
        width: '380px',
      },
      children: <CreateModal dataSet={processCategoriesDs} />,
      onOk: () => new Promise((resolve, reject) => onSaveProcessCategory(resolve, reject)),
    });
  };

  const onDeleteProcessCategory = (record) => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk: () => {
        deleteProcessCategory(record)
          .then((res) => {
            if (getResponse(res)) {
              selectTreeNode({}, true);
              return true;
            } else {
              return false;
            }
          })
          .catch(() => false);
      },
    });
  };

  const onCopyProcessDocument = (record) => {
    copySiteRecord(record).then((res) => {
      if (getResponse(res)) {
        notification.success();
      }
    });
  };

  const changeTreeWidth = () => {
    const width = leftTreeWidth === 0 ? preTreeWidth : 0;
    setPreTreeWidth(leftTreeWidth);
    if (setLeftTreeWidth) {
      setLeftTreeWidth(width);
    }
  };

  const handleResize = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const targetDom = document.getElementById('process-configuration-search-tree');
    const currentWidth = parseInt(targetDom.style.width, 10);
    const startX = event.clientX;
    let width;
    const handleMouseMove = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const endX = e.clientX;
      width = endX - startX + currentWidth < 260 ? 260 : endX - startX + currentWidth;
      Object.assign(targetDom.style, {
        width: `${width}px`,
      });
    };
    const handleMouseUp = (upEvent) => {
      upEvent.preventDefault();
      upEvent.stopPropagation();
      if (setLeftTreeWidth) {
        setLeftTreeWidth(width);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  searchTreeRef.current = {
    selectTreeNode,
  };

  const renderActionMenu = (parentNode = {}, leafNode) => {
    if (leafNode === undefined) {
      const isDocumentPredefined = parentNode.tenantId === 0;
      return isDocumentPredefined ? (
        <Menu
          className="icon-action-list"
          onClick={({ domEvent }) => {
            domEvent.stopPropagation();
            onCopyProcessDocument(parentNode);
          }}
        >
          <Item key="copy">{intl.get('hzero.common.button.copy').d('复制')}</Item>
        </Menu>
      ) : (
        <Menu
          onClick={({ key, domEvent }) => {
            domEvent.stopPropagation();
            if (key === 'add') {
              openCreateModal(parentNode);
            } else if (key === 'edit') {
              openEditModal(parentNode, 'document');
            } else if (key === 'delete') {
              onDeleteProcessDocument(parentNode);
            }
          }}
        >
          {!parentNode.sourceParentId && (
            <Item key="add">
              {intl
                .get('swfl.processConfiguration.view.title.searchTree.processCategoryModal')
                .d('新增分类')}
            </Item>
          )}
          {!isDocumentPredefined && (
            <Item key="edit">{intl.get('hzero.common.button.edit').d('编辑')}</Item>
          )}
          {!isDocumentPredefined && (
            <Item key="delete">{intl.get('hzero.common.button.delete').d('删除')}</Item>
          )}
        </Menu>
      );
    } else {
      const isCategoryPredefined = leafNode.tenantId === 0;
      return (
        <Menu
          className="icon-action-list"
          onClick={({ key, domEvent }) => {
            domEvent.stopPropagation();
            if (key === 'edit') {
              openEditModal(leafNode, 'category', parentNode);
            } else if (key === 'delete') {
              onDeleteProcessCategory(leafNode);
            }
          }}
        >
          {!isCategoryPredefined && (
            <Item key="edit">{intl.get('hzero.common.button.edit').d('编辑')}</Item>
          )}
          {!isCategoryPredefined && (
            <Item key="delete">{intl.get('hzero.common.button.delete').d('删除')}</Item>
          )}
        </Menu>
      );
    }
  };

  return (
    <div
      id="process-configuration-search-tree"
      className={classNames('search-tree', {
        'search-tree-expand': preTreeWidth === 0,
        'search-tree-collapse': preTreeWidth !== 0,
      })}
      style={{
        width: `${leftTreeWidth}px`,
      }}
    >
      <div
        className={classNames({
          'search-tree-control': true,
          'search-tree-control-left': preTreeWidth === 0,
          'search-tree-control-right': preTreeWidth !== 0,
        })}
        onClick={changeTreeWidth}
      >
        <Icon type="baseline-arrow_left" />
      </div>
      <div
        className={classNames({
          'search-tree-control-drag': true,
          'search-tree-control-drag-hide': preTreeWidth === 0,
        })}
        onMouseDown={handleResize}
      />
      <div className="search-tree-input">
        <TextField
          placeholder={intl
            .get('swfl.processConfiguration.view.searchTree.input.placeholder')
            .d('流程单据/流程分类')}
          onChange={handleSearch}
          clearButton
          suffix={<Icon type="refresh" onClick={refreshSearchTree} />}
        />
      </div>
      <Spin spinning={treeLoading}>
        <div className="search-tree-node">
          {treeNode.map((node) => {
            return (
              <Collapse defaultActiveKey={['0']} ghost trigger="icon">
                <Panel
                  key="0"
                  header={
                    <span
                      id={node.documentId}
                      className={classNames('search-tree-first-level', {
                        'first-level-active': node.documentId === currentActiveComponentId,
                      })}
                      onClick={() => selectTreeNode(node)}
                    >
                      <span>{node.description}</span>
                      <Dropdown overlay={() => renderActionMenu(node)}>
                        <Icon type="more_vert" className="second-level-action-icon" />
                      </Dropdown>
                    </span>
                  }
                >
                  {node.processCategoryList &&
                    node.processCategoryList.length > 0 &&
                    node.processCategoryList.map((list) => (
                      <div
                        id={`${node.documentId}-${list.categoryId}`}
                        className={classNames('search-tree-second-level', {
                          'second-level-active':
                            `${node.documentId}-${list.categoryId}` === currentActiveComponentId,
                        })}
                        onClick={() =>
                          selectTreeNode({
                            ...node,
                            documentDescription: node.description,
                            ...list,
                          })
                        }
                      >
                        <span className="search-tree-second-description">
                          <span>{list.description}</span>
                          {list.tenantId !== 0 && (
                            <Dropdown overlay={() => renderActionMenu(node, list)}>
                              <Icon type="more_vert" className="second-level-action-icon" />
                            </Dropdown>
                          )}
                        </span>
                      </div>
                    ))}
                </Panel>
              </Collapse>
            );
          })}
        </div>
      </Spin>
    </div>
  );
}

/* eslint-disable no-param-reassign */
import React, { useEffect, useState, useMemo, useRef, useLayoutEffect } from 'react';
import classNames from 'classnames';
import { Header } from 'components/Page';
import notification from 'utils/notification';
import {
  Icon,
  TextField,
  Tooltip,
  Dropdown,
  Button,
  DataSet,
  Form,
  Modal,
  Table,
  Output,
  Spin,
  Menu,
} from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import FilterBar from 'srm-front-boot/lib/components/FilterBarTable/FilterBar';
import { ReactComponent as NoContent } from '@/assets/rule-no-data.svg';
import {
  fetchDeleteProcessDoc,
  fetchDeleteCategory,
  fetchOrderList,
  fetchUpdateCategory,
  fetchCreateCategory,
  fetchLovName,
} from '@/services/checkRuleService';
import ExportButton from '@/components/ExportButton';
import ImportButton from '@/components/ImportButton';

import {
  ProcessDocDS,
  ProcessCategoryDS,
  ProcessParamsDS,
  ProcessParamsFormDS,
  RulesListDS,
} from './stores/checkRuleDS';
import OrderEditForm from './OrderEditForm';
import ProcessParamsForm from './ProcessParamsForm';
import RuleTableComp from './RuleTableComp';
import CategoryForm from './CategoryForm';
import styles from './index.less';

let hoverMap = {};

/**
 * 树节点标题组件
 * 内容超出容器长度才显示 tooltip
 */
const TreeNodeTitle = ({ title, level }) => {
  const ref = useRef(null);
  const [isOverflow, setIsOverflow] = useState(false);

  useLayoutEffect(() => {
    if (ref.current) {
      setIsOverflow(ref.current.scrollWidth > ref.current.clientWidth);
    }
  }, [title]);

  return (
    <Tooltip title={isOverflow ? title : null}>
      <span
        ref={ref}
        className={styles['node-title']}
        style={{ fontWeight: level === 0 ? '600' : '' }}
      >
        {title}
      </span>
    </Tooltip>
  );
};

function CheckRulesMgt() {
  const processDocDS = useMemo(() => new DataSet({ ...ProcessDocDS() }), []);
  const processDetailDocDS = useMemo(() => new DataSet({ ...ProcessDocDS() }), []);
  const processCategoryDS = useMemo(() => new DataSet({ ...ProcessCategoryDS() }), []);
  const processParamsDS = useMemo(() => new DataSet({ ...ProcessParamsDS() }), []);
  const processParamsFormDS = useMemo(() => new DataSet({ ...ProcessParamsFormDS() }), []);
  const rulesListDS = useMemo(() => new DataSet({ ...RulesListDS() }), []);

  const [expandedKeys, setExpandedKeys] = useState([]);
  const [selectedKey, setSelectedKey] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [refresh, setRefresh] = useState(false);
  const [treeData, setTreeData] = useState([]);
  const [localDocumentId, setLocalDocumentId] = useState('');
  const [localDocumentCode, setLocalDocumentCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initOrderList('');
    return () => {
      hoverMap = {};
    };
  }, []);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  const initOrderList = (queryValue = '') => {
    setLoading(true);
    fetchOrderList({
      keyword: queryValue,
    })
      .then((res) => {
        setLoading(false);
        if (getResponse(res)) {
          const dataList = res?.content ?? [];
          if (dataList.length) {
            dataList.forEach((item) => {
              item.dataType = 'document';
              if (item.categories && item.categories.length) {
                item.categories.forEach((category) => {
                  category.dataType = 'category';
                  category.documentId = item.documentId;
                  category.documentCode = item.documentCode;
                });
              }
            });
          }
          setTreeData(dataList);
        } else {
          setTreeData([]);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  };

  // 切换展开/收起
  const toggleExpand = (key) => {
    if (expandedKeys.includes(key)) {
      setExpandedKeys(expandedKeys.filter((k) => k !== key));
    } else {
      setExpandedKeys([...expandedKeys, key]);
    }
  };

  const setHoverItem = (itemKey, isHover) => {
    hoverMap = {
      ...hoverMap,
      [itemKey]: isHover,
    };
    setRefresh(true);
  };

  /**
   * 新增或编辑流程单据
   */
  const handleCreateOrder = async (item) => {
    let modal = null;

    if (item && item.documentId) {
      processDocDS.setQueryParameter('documentId', item.documentId);
      await processDocDS.query();
    } else {
      processDocDS.loadData([]);
      processDocDS.create(
        {
          tenantId: getCurrentOrganizationId(),
        },
        0
      );
    }

    const handleCloseModal = () => {
      if (modal) {
        processDocDS.loadData([]);
        processDocDS.reset();
        modal.close();
        initOrderList();
      }
    };

    const handleCreate = async () => {
      const isValid = await processDocDS.validate();
      if (isValid) {
        const res = await processDocDS.submit();
        if (getResponse(res)) {
          processDetailDocDS.query();
          handleCloseModal();
        }
      }
    };

    modal = Modal.open({
      title: item
        ? intl.get('smbl.checkRules.view.title.editProcessDoc').d('编辑流程单据')
        : intl.get('smbl.checkRules.view.title.createProcessDoc').d('新建流程单据'),
      children: <OrderEditForm dataSet={processDocDS} />,
      closable: true,
      drawer: true,
      mask: true,
      fullScreen: true,
      style: { width: '372px' },
      footer: (
        <div>
          <Button color="primary" onClick={handleCreate}>
            {intl.get(`hzero.common.button.ok`).d('确定')}
          </Button>
          <Button onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>
        </div>
      ),
    });
  };

  /**
   * 新增或编辑流程分类
   * @param {*} item
   */
  const handleCreateCategory = async (item) => {
    let modal = null;

    const handleCloseModal = () => {
      if (modal) {
        processCategoryDS.loadData([]);
        processCategoryDS.reset();
        modal.close();
        initOrderList();
      }
    };

    const handleCreate = async () => {
      const isValid = await processCategoryDS.validate();
      if (isValid) {
        const obj = processCategoryDS?.toData()[0] ?? {};
        if (obj.categoryId) {
          const res = await fetchUpdateCategory({
            ...obj,
            roleId: obj?.roleIds?.join(','),
          });

          if (getResponse(res)) {
            handleCloseModal();
          }
        } else {
          const res = await fetchCreateCategory({
            ...obj,
          });

          if (getResponse(res)) {
            notification.success();
            handleCloseModal();
          }
        }
      }
    };

    modal = Modal.open({
      title: item
        ? intl.get('smbl.checkRules.view.title.editCategory').d('编辑流程分类')
        : intl.get('smbl.checkRules.view.title.createCategory').d('新建流程分类'),
      children: <CategoryForm localRecord={item} processCategoryDS={processCategoryDS} />,
      closable: true,
      drawer: true,
      mask: true,
      fullScreen: true,
      style: { width: '372px' },
      footer: (
        <div>
          <Button color="primary" onClick={handleCreate}>
            {intl.get(`hzero.common.button.ok`).d('确定')}
          </Button>
          <Button onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>
        </div>
      ),
    });
  };

  const handleEdit = (item) => {
    // 编辑流程分类
    if (item?.dataType === 'document') {
      handleCreateOrder(item);
    } else if (item?.dataType === 'category') {
      handleCreateCategory({ ...item, roleIds: '' });
    }
  };

  const handleDeleteOrder = (item) => {
    if (item) {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: (
          <div>
            {intl.get('smbl.checkRules.message.confirm.deleteOrder').d('确定删除该流程单据吗？')}
          </div>
        ),
      }).then((button) => {
        if (button === 'ok') {
          fetchDeleteProcessDoc({
            documentId: item.documentId,
          }).then(() => {
            setSelectedKey('');
            setSelectedItem(null);
            initOrderList();
          });
        }
      });
    }
  };

  /**
   * 删除流程分类
   * @param {*} item
   */
  const handleDeleteCategory = (item) => {
    if (item) {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: (
          <div>
            {intl.get('smbl.checkRules.message.confirm.deleteCategory').d('确定删除该流程分类吗？')}
          </div>
        ),
      }).then((button) => {
        if (button === 'ok') {
          fetchDeleteCategory({
            categoryId: item.categoryId,
          }).then(() => {
            setSelectedKey('');
            setSelectedItem(null);
            initOrderList();
          });
        }
      });
    }
  };

  /**
   * 删除流程单据或分类
   * @param {*} item
   */
  // eslint-disable-next-line no-unused-vars
  const handleDelete = (item) => {
    if (item?.categories && item?.categories?.length > 0) {
      handleDeleteOrder(item);
    } else {
      handleDeleteCategory(item);
    }
  };

  const menu = (node, level) => {
    return (
      <div className={styles['tree-node-drop-menu']}>
        {level === 0 && (
          <div
            key="0"
            className={styles['tree-node-drop-menu-item']}
            onClick={() => handleCreateCategory(node)}
          >
            {intl.get('smbl.checkRules.view.title.addCategory').d('新增流程分类')}
          </div>
        )}
        <div
          key="1"
          className={styles['tree-node-drop-menu-item']}
          onClick={() => handleEdit(node)}
        >
          {intl.get('smbl.checkRules.view.title.edit').d('编辑')}
        </div>
      </div>
    );
  };

  // 渲染树节点
  const renderTreeNode = (node, level = 0, isLast = false, isRoot = false, parentDocId = '') => {
    const hasChildren = node.categories && node.categories.length > 0;
    const nodeKey = level === 0 ? `${level}-${node.documentId}` : `${level}-${node.categoryId}`;
    const isExpanded = expandedKeys.includes(nodeKey);

    const isSelected = selectedKey === nodeKey;

    const nodeClasses = classNames(styles['tree-node'], {
      [styles.selected]: isSelected,
      [styles['root-node']]: isRoot,
      [styles['last-child']]: isLast && !isRoot,
    });

    const title = level === 0 ? node.documentName : node.categoryName;

    return (
      <div key={nodeKey} className={styles['tree-node-item']}>
        <div
          id={`smbl-check-rule-title-${nodeKey}-menu`}
          className={nodeClasses}
          style={{
            paddingLeft: 16,
          }}
          onClick={() => {
            setSelectedKey(nodeKey);
            setLocalDocumentId(parentDocId);
            setLocalDocumentCode(node.documentCode);
            setSelectedItem(node);

            if (node?.dataType === 'document') {
              processDetailDocDS.setQueryParameter('documentId', node.documentId);
              processDetailDocDS.query();
              processParamsDS.setQueryParameter('documentCode', node.documentCode);
              processParamsDS.setQueryParameter('sort', 'creationDate,desc');
              processParamsDS.query();
            }

            if (node?.dataType === 'category') {
              rulesListDS.setQueryParameter('categoryCode', node.categoryCode);
              rulesListDS.setQueryParameter('documentCode', node.documentCode);
              rulesListDS.query();
            }
          }}
          onMouseEnter={() => setHoverItem(nodeKey, true)}
          onMouseLeave={() => setHoverItem(nodeKey, false)}
        >
          {hasChildren && (
            <Icon
              type={isExpanded ? 'expand_more' : 'navigate_next'}
              className={styles['expand-icon']}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                toggleExpand(nodeKey);
              }}
            />
          )}
          <TreeNodeTitle title={title} level={level} />
          <Dropdown
            overlay={() => menu(node, level)}
            placement="bottomLeft"
            getPopupContainer={() =>
              document.getElementById(`smbl-check-rule-title-${nodeKey}-menu`)
            }
          >
            <Icon
              type="more_vert"
              style={{
                marginRight: '16px',
                display: hoverMap[`${nodeKey}`] ? 'block' : 'none',
              }}
            />
          </Dropdown>
        </div>
        {hasChildren && isExpanded && (
          <div className={styles['tree-children']}>
            {node.categories.map((child, index) =>
              renderTreeNode(
                child,
                level + 1,
                index === node.categories.length - 1,
                false,
                parentDocId
              )
            )}
          </div>
        )}
      </div>
    );
  };

  const handleInputSearch = (e) => {
    setSearchValue(e.target?.value?.trim() ?? '');
  };

  const handleClearSearch = () => {
    setSearchValue('');
    initOrderList();
  };

  const handleEnterSearch = () => {
    initOrderList(searchValue || '');
  };

  const handleRefreshList = () => {
    initOrderList(searchValue || '');
  };

  const paramsColumns = () => {
    return [
      { name: 'fieldCode' },
      { name: 'fieldName' },
      { name: 'businessObjectId' },
      getCurrentOrganizationId() !== 0 && {
        name: 'tenantId',
        width: 120,
        renderer: ({ value }) => {
          return value === '0' ? (
            <span className={styles['risk-type-option-tag']}>
              {intl.get('hzero.common.predefined').d('预定义')}
            </span>
          ) : (
            <span className={styles['risk-type-option-tag-org']}>
              {intl.get('hzero.common.custom').d('自定义')}
            </span>
          );
        },
      },
      {
        name: 'operation',
        header: intl.get('hzero.common.buttom.action').d('操作'),
        renderer: ({ record }) => {
          const obj = record?.toData() ?? {};
          return (
            <a onClick={() => createProcessParam(obj)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          );
        },
      },
    ].filter(Boolean);
  };

  const handleBatchDelete = () => {
    if (processParamsDS?.selected?.length) {
      processParamsDS.delete(processParamsDS.selected).then(() => {
        processParamsDS.query();
      });
    }
  };

  /**
   * 新增或编辑流程变量
   * @param {*} item
   */
  const createProcessParam = async (item) => {
    const documentId =
      processDetailDocDS && processDetailDocDS.current
        ? processDetailDocDS.current?.get('documentId')
        : '';
    const documentCode =
      processDetailDocDS && processDetailDocDS.current
        ? processDetailDocDS.current?.get('documentCode')
        : '';

    if (!documentId) return false;

    let modal = null;
    const businessObjectId =
      processDetailDocDS && processDetailDocDS.current
        ? processDetailDocDS.current?.get('businessObjectId')
        : '';

    if (item) {
      const lovCode = item?.lovCode ?? '';
      let lovName = '';
      if (lovCode) {
        const res = await fetchLovName({
          lovCode,
        });

        if (getResponse(res)) {
          lovName = res?.lovName ?? '';
        }
      }

      processParamsFormDS.loadData([{ ...item, lovName, fieldCodeSelect: item?.fieldCode }]);
    } else {
      processParamsFormDS.loadData([]);
      processParamsFormDS.create(
        {
          documentId,
          documentCode,
          tenantId: getCurrentOrganizationId(),
          businessObjectId,
        },
        0
      );
    }

    const handleCloseModal = () => {
      if (modal) {
        modal.close();
      }
    };

    const handleCreate = async () => {
      const isValid = await processParamsFormDS.validate();
      if (isValid) {
        processParamsFormDS.submit().then(() => {
          handleCloseModal();
          processParamsDS.setQueryParameter('sort', 'creationDate,desc');
          processParamsDS.query();
        });
      }
    };

    modal = Modal.open({
      title: item
        ? intl.get('smbl.checkRules.view.title.editParam').d('编辑流程变量')
        : intl.get('smbl.checkRules.view.title.createParam').d('新建流程变量'),
      children: (
        <ProcessParamsForm dataSet={processParamsFormDS} businessObjectId={businessObjectId} />
      ),
      closable: true,
      drawer: true,
      mask: true,
      fullScreen: true,
      style: { width: '372px' },
      footer: (
        <div>
          <Button color="primary" onClick={handleCreate}>
            {intl.get(`hzero.common.button.ok`).d('确定')}
          </Button>
          <Button onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>
        </div>
      ),
    });
  };

  const buttons = () => {
    return [
      <Button key="add" icon="playlist_add" funcType="flat" onClick={() => createProcessParam()}>
        {intl.get('smbl.checkRules.view.button.addRow').d('新增')}
      </Button>,
      <Button key="delete" funcType="flat" icon="delete_sweep" onClick={handleBatchDelete}>
        {intl.get('hzero.common.button.batchDelete').d('批量删除')}
      </Button>,
    ];
  };

  const menus = () => {
    return (
      <Menu>
        <Menu.Item onClick={() => handleCreateOrder('')}>
          {intl.get('hzero.common.button.handleadd').d('新增')}
        </Menu.Item>
        <Menu.Item>
          <ImportButton />
        </Menu.Item>
      </Menu>
    );
  };

  const handleFilterQueryAll = ({ dataSet, params }) => {
    const list = dataSet?.toData() ?? [];
    const param = { ...list[0] };

    const obj = { ...param, ...params };
    obj.documentCode = localDocumentCode || '';

    if (!obj?.documentCode) {
      return false;
    }

    processParamsDS.queryParameter = {
      ...obj,
      sort: obj?.sort ? obj?.sort?.split(':').join(',') : '',
    };
    processParamsDS.query();
  };

  const { documentId = '', categoryId = '', categoryCode = '' } = selectedItem || {};

  return (
    <>
      <Header title={intl.get('smbl.checkRules.view.title.checkRules').d('智能审核规则库')}>
        <Dropdown overlay={menus()}>
          <Button color="primary" icon="add">
            {intl.get('hzero.common.button.increase').d('新增')}
            <Icon type="expand_more" style={{ marginLeft: '4px' }} />
          </Button>
        </Dropdown>
        <ExportButton />
      </Header>
      <div className={styles['check-rules-basic']}>
        <div className={styles['check-rules-left']}>
          <div className={styles['check-rules-left-content']}>
            <div
              style={{
                margin: '16px 16px 0 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <TextField
                name="searchCommon"
                style={{ width: '85%' }}
                placeholder={intl
                  .get('smbl.checkRules.view.placeholder.orderProcess')
                  .d('单据流程/流程分类')}
                clearButton
                onClear={handleClearSearch}
                onInput={handleInputSearch}
                onEnterDown={handleEnterSearch}
              />
              <Tooltip title={intl.get('smbl.checkRules.view.button.refresh').d('刷新')}>
                <Icon type="sync" style={{ cursor: 'pointer' }} onClick={handleRefreshList} />
              </Tooltip>
            </div>
            <Spin spinning={loading}>
              <div className={styles['tree-container']}>
                {treeData.map((node, index) =>
                  renderTreeNode(node, 0, index === treeData.length - 1, true, node?.documentId)
                )}
              </div>
            </Spin>
          </div>
        </div>

        <div className={styles['check-rules-right']}>
          {!selectedItem ? (
            <div className={styles['check-rules-no-data']}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div>
                  <NoContent />
                </div>
                <div
                  style={{
                    marginTop: '12px',
                    color: '#1D2129',
                    fontSize: '16px',
                    fontWeight: '600',
                  }}
                >
                  {intl.get('hzero.common.message.data.none').d('暂无数据')}
                </div>
              </div>
            </div>
          ) : selectedItem?.dataType === 'document' ? (
            // eslint-disable-next-line react/jsx-indent
            <>
              <div className={styles['check-rule-card-title']}>
                {intl.get('smbl.checkRules.view.title.basicInfo').d('基础信息')}
              </div>
              <Form dataSet={processDetailDocDS} labelLayout="float" columns={3}>
                <Output name="documentCode" />
                <Output name="documentName" />
                <Output name="documentDesc" />
                <Output name="businessObjectId" />
                <Output name="moduleCode" />
              </Form>

              {documentId ? (
                <div style={{ height: 'calc(100vh - 380px)', marginTop: '32px' }}>
                  <div className={styles['check-rule-card-title']}>
                    {intl.get('smbl.checkRules.view.title.processParam').d('流程变量')}
                  </div>
                  <FilterBar
                    dataSet={[processParamsDS]}
                    cacheState
                    collpaseble
                    defaultCollpase
                    cacheKey="SMBL.CHECK_PROCESS_PARAMS_CACHE"
                    checkDataSetStatus={false}
                    defaultSortedField="creationDate"
                    defaultSortedOrder="desc"
                    tableButtons={buttons()}
                    sortFieldName="sort"
                    onQuery={handleFilterQueryAll}
                    fields={[
                      {
                        name: 'keyword',
                        type: 'string',
                        label: intl
                          .get(`smbl.checkRules.model.fieldNameOrCode`)
                          .d('字段名称或编码'),
                        merge: true,
                      },
                      {
                        name: 'fieldType',
                        type: 'string',
                        label: intl.get(`smbl.checkRules.model.fieldSource`).d('字段来源'),
                        lookupCode: 'SMBL.CHECK_RULES_FIELD_SOURCE',
                        lock: true,
                      },
                      {
                        name: 'fieldName',
                        type: 'string',
                        label: intl.get(`smbl.checkRules.model.fieldName`).d('字段名称'),
                        sortFlag: true,
                      },
                      {
                        name: 'fieldCode',
                        type: 'string',
                        label: intl.get(`smbl.checkRules.model.fieldCode`).d('字段编码'),
                        sortFlag: true,
                      },
                      {
                        name: 'creationDate',
                        type: 'dateTime',
                        label: intl.get(`smbl.checkRules.model.createTime`).d('创建时间'),
                        sortFlag: true,
                      },
                    ]}
                  />
                  <div style={{ height: 'calc(100vh - 500px)' }}>
                    <Table
                      dataSet={processParamsDS}
                      columns={paramsColumns()}
                      queryBar="none"
                      // buttons={buttons()}
                      autoHeight={{ type: 'maxHeight', diff: 40 }}
                    />
                  </div>
                </div>
              ) : null}
            </>
          ) : getCurrentOrganizationId() === 0 ? (
            <div className={styles['check-rules-no-data']}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div>
                  <NoContent />
                </div>
                <div
                  style={{
                    marginTop: '12px',
                    color: '#1D2129',
                    fontSize: '16px',
                    fontWeight: '600',
                  }}
                >
                  {intl.get('hzero.common.message.data.none').d('暂无数据')}
                </div>
                <div style={{ marginTop: '8px', color: '#868D9C;' }}>
                  {intl.get('smbl.checkRules.view.message.noDataAlert').d('请至租户层维护规则明细')}
                </div>
              </div>
            </div>
          ) : (
            <RuleTableComp
              rulesListDS={rulesListDS}
              categoryId={categoryId}
              categoryCode={categoryCode}
              documentId={localDocumentId}
              documentCode={localDocumentCode}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default formatterCollections({
  code: ['smbl.checkRules'],
})(CheckRulesMgt);

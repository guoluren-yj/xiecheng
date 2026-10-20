import React, { useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Tooltip, Icon, Select, Spin, DataSet, Form, IntlField, CheckBox } from 'choerodon-ui/pro';
import { compose, isNil } from 'lodash';
import { connect } from 'dva';
import uuid from 'uuid/v4';
// import { getConfig } from 'choerodon-ui';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { getCurrentUser } from 'utils/utils';
import useSetState from '@/utils/useState';
import OverflowTip from '@/components/OverflowTip';

import ComContent from '../../../common/ComContent';
import styles from './index.less';
import icons from './icons';

const { Option } = Select;

const compare = (property) => (a, b) => {
  const value1 = a[property];
  const value2 = b[property];
  return value1 - value2;
};

// 设置样式
const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  padding: 12,
  margin: `0 0 12px 0`,
  height: 42,
  // 拖拽的时候背景变化
  background: isDragging ? 'rgba(0,0,0, 0.15)' : '#ffffff',
  position: 'relative',

  // styles we need to apply on draggables
  ...draggableStyle,
});

function Catalog(props) {
  const {
    mallHomeConfig: { catalogType },
    fetchCatalogListLoading,
    modal,
    dispatch,
  } = props;

  const [state, setState] = useSetState({
    list: { items1: [], items2: [], items3: [] },
    onlyInProduct: undefined,
    checkFlag: undefined,
  });
  const { list, onlyInProduct, checkFlag } = state;

  modal.handleOk(() => {
    return handleOk();
  });

  useEffect(() => {
    const { tenantNum } = getCurrentUser();
    fetchList();
    dispatch({
      type: 'mallHomeConfig/fetchIsOnlyInProduct',
      payload: {
        tenantNum,
      },
    }).then((res) => {
      setState({
        onlyInProduct: res,
        checkFlag: +res?.[0]?.onlyHasSkuCatalog === 1,
      });
    });
  }, []);

  function saveOnlyInProduct(val) {
    const { tenantNum } = getCurrentUser();
    dispatch({
      type: 'mallHomeConfig/saveIsOnlyInProduct',
      payload: { ...(onlyInProduct?.[0] || {}), onlyHasSkuCatalog: val, tenantNum },
    }).then((res) => {
      setState({
        onlyInProduct: [res],
      });
    });
  }

  function handleOk() {
    if (!fetchCatalogListLoading) {
      const obj = {};
      Object.keys(list).forEach((p) => {
        obj[p] = list[p].map((i, index) => ({ ...i, catalogRow: index })).filter((i) => !i.delete);
      });
      dispatch({
        type: 'groupCategoryMaintenance/handleCataSave',
        payload: { ...obj, companyId: -1 },
      }).then((res) => {
        if (res) {
          notification.success();
          // fetchList();
        }
      });
      saveOnlyInProduct(checkFlag ? '1' : '0');
    }
  }

  const iconLength = Math.max.call(
    null,
    list.items1.length,
    list.items2.length,
    list.items3.length
  );

  function fetchList() {
    const { match = {} } = props;
    const { companyId } = match.params || {};
    dispatch({
      type: 'groupCategoryMaintenance/queryStoreList',
      payload: {
        companyId,
      },
    }).then((res) => {
      if (!res) return;
      const newList = {
        items1: res.items1,
        items2: res.items2,
        items3: res.items3,
      };
      Object.keys(newList).forEach((p) => {
        const noRowList = newList[p].filter((r) => !r.catalogRow && r.catalogRow !== 0);
        newList[p].sort(compare('catalogRow'));
        const current = newList[p].filter(l => !isNil(l.catalogRow)).map((n, i) => ({...n, catalogRow: i}));
        const newCurrent = [];
        const max = current[current.length - 1] && current[current.length - 1].catalogRow;
        if (max || max === 0) {
          for (let i = 0; i < max + 1; i++) {
            newCurrent[i] = current.find((c) => c.catalogRow === i) || {
              catalogId: uuid(),
              catalogName: '',
              delete: true,
              catalogRow: i,
            };
          }
        }
        newList[p] = [
          ...newCurrent,
          ...noRowList.map((i, index) => ({ ...i, catalogRow: max + index })),
        ];
      });
      setState({
        list: newList,
        initList: newList,
      });
    });
  }

  // 添加空白占位符
  function addContentItem(index) {
    const { items1 = [], items2 = [], items3 = [] } = list;
    const newList = {
      items1: [...items1],
      items2: [...items2],
      items3: [...items3],
    };
    const arrName = Object.keys(newList)[index];
    newList[arrName].push({
      catalogId: uuid(),
      catalogName: '',
      delete: true,
    });
    setState({
      list: newList,
    });
  }

  // 删除空白
  function deleteItem({ listIndex, itemIndex }) {
    const newList = {
      items1: [...list.items1],
      items2: [...list.items2],
      items3: [...list.items3],
    };
    const arrName = Object.keys(newList)[listIndex];
    newList[arrName].splice(itemIndex, 1);
    setState({
      list: newList,
    });
  }

  // 拖拽结束
  function onDragEnd(result) {
    const { destination, source } = result;
    if (!destination) {
      return;
    }
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }
    const current = list[source.droppableId];
    const startArr = [...list[source.droppableId]];
    startArr.splice(source.index, 1);
    const endArr =
      destination.droppableId !== source.droppableId
        ? [...list[destination.droppableId]]
        : [...startArr];
    endArr.splice(destination.index, 0, current[source.index]);

    const newList = {
      ...list,
      [source.droppableId]: startArr, // 开始
      [destination.droppableId]: endArr, // 结束
    };
    setState({
      list: newList,
    });
  }

  // 渲染icon列表
  const renderIconList = useMemo(() => {
    const iconList = [];
    for (let i = 0; i < iconLength; i++) {
      iconList.push(
        <div style={getItemStyle(false, {})}>
          <Select
            style={{ width: '100%', position: 'relative', top: -7 }}
            // eslint-disable-next-line no-loop-func
            onChange={(icon) => {
              const newList = {
                items1: [...list.items1],
                items2: [...list.items2],
                items3: [...list.items3],
              };
              if (newList.items1[i]) newList.items1[i].mallIcon = icon;
              if (newList.items2[i]) newList.items2[i].mallIcon = icon;
              if (newList.items3[i]) newList.items3[i].mallIcon = icon;
              setState({
                list: newList,
              });
            }}
            defaultValue={
              list?.items1?.[i]?.mallIcon ||
              list?.items2?.[i]?.mallIcon ||
              list?.items3?.[i]?.mallIcon ||
              'beach_access-o'
            }
          >
            {icons.map((icon) => {
              return (
                <Option value={icon}>
                  <Icon type={icon} />
                  {icon}
                </Option>
              );
            })}
          </Select>
        </div>
      );
    }
    return iconList;
  }, [iconLength]);

  // 编辑
  function handleCreateDs(catalog) {
    const { catalogId } = catalog || {};
    const ds = new DataSet({
      data: [catalog],
      forceValidate: true,
      fields: [
        {
          name: 'catalogName',
          type: 'intl',
          required: true,
        },
      ],
    });
    setState({
      [`${catalogId}_ds`]: ds,
    });
  }

  // 保存名称
  function handleSaveCatalogName(catalog, editClounm) {
      const { catalogId } = catalog || {};
      (document.getElementsByName('catalogName') || []).forEach(d=> d?.blur()); // 失去焦点方法
      setTimeout(async ()=>{
        if (state[`${catalogId}_ds`]) {
          const dsFlag = await state[`${catalogId}_ds`].validate();
          if(dsFlag){
            const data = state[`${catalogId}_ds`].current.toData();
          dispatch({
            type: 'groupCategoryMaintenance/configUpdateCompanyCatalog',
            payload: data,
          }).then((res) => {
            if (res) {
              setState({
                [`${catalogId}_ds`]: null,
                list: {
                  ...list,
                  [editClounm]: list[editClounm].map((p) => {
                    if (p.catalogId === data.catalogId) {
                      return { ...p, catalogName: data.catalogName, oldCatalogName: p.oldCatalogName || p.catalogName };
                    } else {
                      return p;
                    }
                  }),
                },
              });
            }
          });
          }
        }
      }, 50);
  }

  function showCatalogName(item){
    const { catalogName, oldCatalogName } = item || {};
    return oldCatalogName && (catalogName !== oldCatalogName) ? (<>{catalogName}<span className='catalog-item-old'> / {oldCatalogName}</span></>): catalogName;
  }
  // function beforeIntlOpen(ds) {
  //   const tlsKey = getConfig('tlsKey');
  //   const fieldName = 'catalogName';
  //   const languageKeys = ['zh_CN', 'en_US'];
  //   languageKeys.forEach((languageKey) => {
  //     const field = ds.getField(`${tlsKey}.${fieldName}.${languageKey}`);
  //     if (field) {
  //       // 设置字段相关属性, 必填: required
  //       field.set('required', true);
  //     }
  //   });
  // }

  return (
    <div className={styles.content}>
      <ComContent
        title={
          (catalogType === 0
            ? intl.get('small.common.view.all.word').d('纯文字')
            : intl.get('small.common.view.icon.word').d('图标+文字'))
          + intl.get('small.common.view.catalog.template').d('目录模板')
        }
        style={{marginBottom: 0}}
      >
        {intl
          .get('small.common.view.catalog.maxSize', { value: catalogType === 0 ? 12 : 9 })
          .d(`可以通过自由拖拽对一级目录排版，设置其在主站的展示样式。其中每横排可并列显示3个一级目录（3列最多${catalogType === 0 ? 12 : 9}个字符）`)}
      </ComContent>
      <Spin spinning={fetchCatalogListLoading}>
        <p className="catalog-onlyInstock">
          <CheckBox
            checked={checkFlag}
            onChange={e => {
              setState({
                checkFlag: e,
              });
            }}
            style={{ marginRight: 8, verticalAlign: 'middle', position: 'relative', top: -2 }}
          />
          {intl.get('small.mallHomeConfig.view.catalog.onlyInstock').d('在商城仅显示有商品的目录')}
        </p>
        <DragDropContext onDragEnd={onDragEnd}>
          <div style={{ display: 'flex' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                overflow: 'auto',
                flex: 1,
              }}
            >
              {catalogType === 1 && (
                <div
                  style={{
                    background: '#f8f8f8',
                    padding: 16,
                    width: catalogType === 0 ? 218 : 245,
                    height: '100%',
                  }}
                >
                  <div style={{ paddingBottom: 12 }}>
                    <span style={{ fontWeight: 600 }}>
                      {intl.get('small.companyCategoryconfig.view.icon.column').d(`图标列`)}（
                      {iconLength}）
                    </span>
                  </div>
                  <div>{renderIconList}</div>
                </div>
              )}
              {Object.keys(list).map((i, x) => {
                return (
                  <div
                    style={{
                      background: '#f8f8f8',
                      padding: 16,
                      width: catalogType === 0 ? 218 : 245,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div style={{ paddingBottom: 12 }}>
                      <span style={{ fontWeight: 600 }}>
                        {intl
                          .get('small.companyCategoryconfig.view.column', {
                            value: x + 1,
                          })
                          .d(`第${x + 1}列`)}
                        （{list[i].length}）
                      </span>
                      <Tooltip
                        placement="top"
                        title={intl
                          .get('small.companyCategoryconfig.view.add.nullContent')
                          .d('点击添加空白占位符')}
                      >
                        <Icon
                          type="playlist_add"
                          onClick={() => addContentItem(x)}
                          style={{ fontSize: 16, float: 'right', cursor: 'pointer' }}
                        />
                      </Tooltip>
                    </div>
                    <Droppable droppableId={i}>
                      {provided => (
                        <div
                          style={{ flex: 1 }}
                          // provided.droppableProps应用的相同元素.
                          {...provided.droppableProps}
                          // 为了使 droppable 能够正常工作必须 绑定到最高可能的DOM节点中provided.innerRef.
                          ref={provided.innerRef}
                        >
                          {list[i].map((item, index) => (
                            <Draggable
                              key={item.catalogId}
                              draggableId={`${item.catalogId}`}
                              index={index}
                            >
                              {(provide, snapsho) => (
                                <div
                                  className="catalog-item"
                                  ref={provide.innerRef}
                                  {...provide.draggableProps}
                                  {...provide.dragHandleProps}
                                  style={getItemStyle(
                                    snapsho.isDragging,
                                    provide.draggableProps.style
                                  )}
                                >
                                  {item.delete ? (
                                    <Icon
                                      onClick={() => deleteItem({ listIndex: x, itemIndex: index })}
                                      type="close"
                                      style={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        cursor: 'pointer',
                                      }}
                                    />
                                  ) : (
                                    <>
                                      {state[`${item.catalogId}_ds`] ? (
                                        <Icon
                                          onClick={() => handleSaveCatalogName(item, i)}
                                          type="done"
                                          style={{
                                            position: 'absolute',
                                            top: 10,
                                            right: 8,
                                            cursor: 'pointer',
                                          }}
                                        />
                                      ) : (
                                        <Icon
                                          onClick={() => handleCreateDs(item)}
                                          type="mode_edit"
                                          className="edit-catalog-icon"
                                          style={{
                                            fontSize: 16,
                                            position: 'absolute',
                                            top: 12,
                                            right: 8,
                                            cursor: 'pointer',
                                          }}
                                        />
                                      )}
                                    </>
                                  )}
                                  {state[`${item.catalogId}_ds`] ? (
                                    <Form
                                      style={{
                                        position: 'absolute',
                                        top: -5,
                                        left: 0,
                                        cursor: 'pointer',
                                        width: '80%',
                                      }}
                                      dataSet={state[`${item.catalogId}_ds`]}
                                    >
                                      {/* <IntlField name="catalogName" modalProps={{ beforeOpen: ()=> beforeIntlOpen(state[`${item.catalogId}_ds`]) }} /> */}
                                      <IntlField name="catalogName" />
                                    </Form>
                                  ) : (
                                    <OverflowTip className="catalog-name">
                                      {showCatalogName(item)}
                                    </OverflowTip>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </div>
        </DragDropContext>
      </Spin>
    </div>
  );
}

export default compose(
  connect(({ mallHomeConfig, groupCategoryMaintenance, loading }) => ({
    mallHomeConfig,
    groupCategoryMaintenance,
    fetchCatalogListLoading: loading.effects['groupCategoryMaintenance/queryStoreList'],
  }))
)(Catalog);

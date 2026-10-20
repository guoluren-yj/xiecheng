import React, { useEffect, useState, useRef, useMemo, useImperativeHandle } from 'react';
import { Tag, Tooltip, Spin } from 'choerodon-ui';
import { Form, SelectBox } from 'choerodon-ui/pro';
import classNames from 'classnames';
import uuid from 'uuid/v4';
import { DraggableAreasGroup } from 'react-draggable-tags';
import { compose, isEmpty } from 'lodash';
import { connect } from 'dva';

import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { fetchProductCardConfig } from '@/services/mallHomeConfigService';

import ComContent from '../../common/ComContent';
import styles from './index.less';
import colors from '../ColorConfig/colors';

const { Option } = SelectBox;

const group = new DraggableAreasGroup();
const DraggableArea1 = group?.addArea('top');
const DraggableArea2 = group?.addArea('bottom');

const tagStyle = {
  color: '#F88D10', // 字体颜色
  border: '1px solid  rgba(252,160,0,0.15)',
  padding: '0 3px',
  height: 18,
  lineHeight: '16px',
  fontSize: 12,
  marginRight: 5,
  width: 58,
  fontWeight: 400,
};

function CustConfig({
  mallHomeConfig: { topicColor },
  mallHome: { purchase, lovBatch },
  dispatch,
  onRef,
}) {
  const lastTopData = useRef(null); // 记录顶上区域的数据
  const attrList = useMemo(() => {
    return lovBatch?.productCardList || [];
  }, [lovBatch]);
  const opreateList = useMemo(() => {
    return lovBatch?.opreateList || [];
  }, [lovBatch]);
  const defaultlist = [
    {
      elementType: 'SUPPLIER',
      row: 1,
      column: 1,
      enabledFlag: 1,
      rowLength: 1,
      name: intl.get('small.mallHomeConfig.productConfig.fields.supplier').d('供应商名称'),
    },
    {
      enabledFlag: 1,
      row: 2,
      column: 1,
      rowLength: 1,
      elementType: 'SALES',
      name: intl.get('small.mallHomeConfig.productConfig.fields.sale').d('商品销量'),
    },
    {
      enabledFlag: 1,
      rowLength: 1,
      row: 2,
      column: 2,
      elementType: 'ITEM',
      name: intl.get('small.mallHomeConfig.productConfig.fields.itemCode').d('物料编码'),
    },
    {
      enabledFlag: 1,
      rowLength: 2,
      row: 2,
      column: 3,
      elementType: 'LABEL',
      name: intl.get('small.mallHomeConfig.productConfig.fields.label').d('商品标签'),
    },
    {
      enabledFlag: 0,
      rowLength: 1,
      row: 2,
      column: 4,
      elementType: 'STOCK',
      name: intl.get('small.mallHomeConfig.productConfig.stock').d('库存'),
    },
    {
      enabledFlag: 0,
      rowLength: 1,
      row: 2,
      column: 5,
      elementType: 'DELIVERY',
      name: intl.get('small.mallHomeConfig.productConfig.deliveryDay').d('供货周期(天)'),
    },
  ];
  // eslint-disable-next-line no-unused-vars
  const [data, setData] = useState({}); // 配置信息
  const [list, setList] = useState([]); // 卡片配置列表
  const [type, setType] = useState('A'); // 首页/列表
  const [currentOpreate, setCurrentOpreate] = useState('COMPARE'); // 首页/列表
  const [topData, setTopData] = useState([]);
  const [bottomData, setBottomData] = useState([]);
  const [hiddenHeight, setHiddenHeight] = useState([]);
  const [fetchSpinging, setFetchSpinging] = useState(true);
  const [compareFlag, setCompareFlag] = useState(false);
  const [customCardValue, setCustomCardValue] = useState([]);
  let halfNum = 0;

  useEffect(() => {
    setHiddenHeight(
      document.getElementById('small-product-card-content-other')?.clientHeight - 46 + 38
    );
    const defaultCardvalue = [...topData, ...bottomData].reduce((pre, cur) => {
      if(cur.enabledFlag && (cur.elementType !== 'SUPPLIER' || cur.elementType === 'SUPPLIER' && !data.hideSupplierFlag)) {
        pre.push(cur.elementType);
      }
      return pre;
    }, []);
    setCustomCardValue(defaultCardvalue);
  }, [bottomData, topData]);

  // useEffect(() => {
  //   if (compareFlag === 0 && currentOpreate === 'COMPARE') {
  //     setCurrentOpreate('NO_SHOW');
  //   }
  // }, [compareFlag, currentOpreate]);

  // 子组件数据传到到父组件
  useImperativeHandle(onRef, () => ({
    itemList,
    topData,
    bottomData,
    hideSupplierFlag: data.hideSupplierFlag,
    currentOpreate,
  }));

  useEffect(() => {
    if (isEmpty(lovBatch?.productCardList)) {
      dispatch({
        type: 'mallHome/initQueryIdp',
      });
    }
  }, []);

  function getComponent(currentType) {
    switch (currentType) {
      case 'SUPPLIER':
        return (
          <span>
            {intl.get('small.mallHomeConfig.productConfig.ex.supplier').d('上海甄云科技')}
          </span>
        );
      case 'SALES':
        return (
          <span>{intl.get('small.mallHomeConfig.productConfig.ex.sale').d('销量:900万+')}</span>
        );
      case 'STOCK':
        return <span>{intl.get('small.mallHomeConfig.productConfig.ex.stock').d('库存:48')}</span>;
      case 'ITEM':
        return <span>BM93855</span>;
      case 'DELIVERY':
        return (
          <span>
            {intl.get('small.mallHomeConfig.productConfig.deliveryDay').d('供货周期(天)')}:-
          </span>
        );
      case 'LABEL':
        return (
          <div style={{ height: 18 }}>
            <Tag
              style={tagStyle}
              className="text-overflow"
              color="rgba(252,160,0,0.10)" // 背景颜色
            >
              {intl.get('small.mallHomeConfig.productConfig.ex.label').d('热卖商品')}
            </Tag>
            <Tag
              style={tagStyle}
              className="text-overflow"
              color="rgba(252,160,0,0.10)" // 背景颜色
            >
              {intl.get('small.mallHomeConfig.productConfig.ex.label').d('热卖商品')}
            </Tag>
            <Tag
              style={tagStyle}
              className="text-overflow"
              color="rgba(252,160,0,0.10)" // 背景颜色
            >
              {intl.get('small.mallHomeConfig.productConfig.ex.label').d('热卖商品')}
            </Tag>
          </div>
        );
      default:
        return null;
    }
  }

  useEffect(() => {
    setBottomData(
      (
        list
          ?.filter(i => i?.row === 2)
          .map(p => ({ ...p, tenantId: getCurrentOrganizationId() })) || []
      ).sort((a, b) => {
        const value1 = a?.column;
        const value2 = b?.column;
        return value1 - value2;
      })
    );
    setTopData(
      (
        list?.filter(d => d.row === 1).map(p => ({ ...p, tenantId: getCurrentOrganizationId() })) ||
        []
      ).sort((a, b) => {
        const value1 = a?.column;
        const value2 = b?.column;
        return value1 - value2;
      })
    );
  }, [list]);

  const renderOpreate = useMemo(() => {
    return (
      <div
        className={classNames({
          'product-card-opreate': true,
          'product-card-opreate-hide': currentOpreate === 'NO_SHOW',
        })}
      >
        <div className="product-card-opreate-compare">
          {opreateList?.find(p => p.value === currentOpreate)?.meaning}
        </div>
        <div className="product-card-opreate-count">5</div>
        <div
          className="product-card-opreate-addCart"
          style={{ color: colors[topicColor]['primary-color'] }}
        >
          {intl.get('small.common.model.addCarts').d('加入购物车')}
        </div>
      </div>
    );
  }, [currentOpreate]);

  function handleCardChange(value) {
    setTopData(d => {
      return d.map(n => ({...n, enabledFlag: Number(value.includes(n.elementType))}));
    });
    setBottomData(d => {
      return d.map(n => ({...n, enabledFlag: Number(value.includes(n.elementType))}));
    });
  }

  const itemList = [
    {
      code: 'A',
      title: intl.get('small.mallHomeConfig.view.productConfig.A').d('商品卡片个性化'),
      id: 'small-MallHomeConfig-product-config-A',
      desc: intl
        .get('small.mallHomeConfig.view.productConfig.Adesc')
        .d('可通过勾选配置商品卡片所要显示的元素，并在卡片布局中拖拽元素更改元素长度以及卡片布局'),
      children: (
        <>
          <p className="des" style={{ marginTop: 16, marginBottom: 4 }}>
            {intl.get('small.mallHomeConfig.productConfig.cardList').d('卡片元素')}
          </p>
          <Form className="card-list-form">
            <SelectBox name="customCard" multiple value={customCardValue} onChange={v => handleCardChange(v)}>
              {attrList?.map(p => {
                const disabled = p?.value === 'SUPPLIER' && data.hideSupplierFlag;
                return (

                  <Option
                    value={p?.value}
                    disabled={disabled}
                  >
                    <Tooltip
                      title={
                      disabled
                        ? intl
                            .get('small.mallHomeConfig.view.supplier.disabledDesc')
                            .d('业务规则已配置供应商隐藏，页面不会同步供应商信息')
                        : null
                    }
                    >
                      {p?.meaning}
                    </Tooltip>
                  </Option>
                );
              })}
            </SelectBox>
          </Form>
          <p className="des" style={{ marginTop: 16, marginBottom: 4 }}>
            {intl.get('small.mallHomeConfig.productConfig.cardOpreate').d('卡片操作')}
          </p>
          <Form layout="none">
            <SelectBox
              value={currentOpreate}
              name="base"
              onChange={e => {
                setCurrentOpreate(e);
              }}
            >
              {opreateList
                ?.filter(o => !(o.value === 'COMPARE' && compareFlag === 0))
                ?.map(p => {
                  return <Option value={p.value}>{p.meaning}</Option>;
                })}
            </SelectBox>
          </Form>
          <div className="product-card">
            <div className="product-card-display">
              <div>
                <p className="product-card-title">
                  {intl.get('small.mallHomeConfig.productConfig.card.display').d('卡片布局')}
                </p>
                <div className="product-card-content">
                  <div className="product-card-content-img" />
                  <div className="product-card-content-price">
                    <span className="product-card-content-price-currey">¥</span>
                    <span className="product-card-content-price-total">199,999,999.00</span>
                  </div>
                  <div className="product-card-content-name">
                    <div
                      style={{
                        minWidth: 95,
                        height: 18,
                        display: 'inline-block',
                        verticalAlign: 'middle',
                      }}
                    >
                      <DraggableArea1
                        tags={topData.map(p => ({ ...p, id: uuid() }))}
                        render={({ tag }) => {
                          const disabled = tag?.elementType === 'SUPPLIER' && data.hideSupplierFlag;
                          if (!tag?.enabledFlag || disabled) return null;
                          return (
                            <div
                              className={classNames({
                                'product-card-content-name-supplier': true,
                                'text-overflow': true,
                                'width-half': tag?.rowLength === 1,
                                'width-max': tag?.rowLength === 2,
                              })}
                            >
                              {attrList?.find(a => a.value === tag?.elementType)?.meaning}
                            </div>
                          );
                        }}
                        onChange={(tags, { fromArea }) => {
                          if (fromArea.id === 'bottom') {
                            if (topData?.[0]) {
                              lastTopData.current = topData?.[0];
                            } else {
                              lastTopData.current = null;
                            }
                            setTopData([fromArea?.tag]);
                          } else {
                            setTopData(tags);
                          }
                        }}
                      />
                    </div>
                    <span>
                      {intl
                        .get('small.mallHomeConfig.productConfig.supplier.desc')
                        .d('商品名称，列表最多显示两行，超过两行显示…')}
                    </span>
                  </div>
                  <div id="small-product-card-content-other" className="product-card-content-other">
                    <DraggableArea2
                      className={classNames({
                        'just-one': bottomData?.filter(p => p?.enabledFlag === 1)?.length === 1,
                      })}
                      tags={bottomData.map(p => ({ ...p, id: uuid() }))}
                      render={({ tag }) => {
                        const disabled = tag?.elementType === 'SUPPLIER' && data.hideSupplierFlag;
                        if (!tag?.enabledFlag || disabled) return null;
                        return (
                          <div
                            className={classNames({
                              'product-card-content-other-item': true,
                              long: tag?.elementType && tag?.elementType !== 'LABEL',
                              'width-half': tag?.rowLength === 1,
                              'width-max': tag?.rowLength === 2,
                            })}
                          >
                            {attrList?.find(a => a.value === tag?.elementType)?.meaning}
                            {tag?.elementType !== 'LABEL' && (
                              <b
                                onClick={() => {
                                  setBottomData(d => {
                                    const newData = [...d];
                                    newData.forEach((n, i) => {
                                      if (n.elementType === tag?.elementType) {
                                        newData[i].rowLength = n.rowLength === 1 ? 2 : 1;
                                      }
                                    });
                                    return newData;
                                  });
                                }}
                              />
                            )}
                          </div>
                        );
                      }}
                      onChange={(tags, { toArea }) => {
                        if (toArea.id === 'top') {
                          const toAreaIndex = bottomData.findIndex(
                            p => p?.elementType === toArea.tag?.elementType
                          );
                          const newList = [...tags];
                          newList.splice(toAreaIndex, 0, lastTopData.current);
                          setBottomData(newList.filter(p => !!p));
                        } else {
                          setBottomData(tags.filter(p => !!p));
                        }
                      }}
                    />
                    {hiddenHeight > 0 && (
                      <div
                        className="product-card-content-other-info"
                        style={{
                          height: hiddenHeight,
                        }}
                      >
                        <div className="product-card-content-other-info-desc">
                          {intl
                            .get('small.mallHomeConfig.productConfig.card.hiddeninfo')
                            .d('此范围内容 首页不可见')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {renderOpreate}
              </div>
            </div>
            <div className="product-card-preview">
              <p className="product-card-title">
                {intl.get('small.mallHomeConfig.productConfig.card.preview').d('卡片预览')}
                <div className="product-card-title-switch">
                  <span
                    onClick={() => setType('A')}
                    className={classNames([
                      'product-card-title-switch-item',
                      { active: type === 'A' },
                    ])}
                  >
                    {intl.get('small.mallHomeConfig.productConfig.card.list').d('列表')}
                  </span>
                  <span
                    onClick={() => setType('B')}
                    className={classNames([
                      'product-card-title-switch-item',
                      { active: type === 'B' },
                    ])}
                  >
                    {intl.get('small.mallHomeConfig.productConfig.card.home').d('首页')}
                  </span>
                </div>
              </p>
              <div className="product-card-content">
                <div className="product-card-content-img" />
                <div className="product-card-content-price">
                  <span className="product-card-content-price-currey">¥</span>
                  <span className="product-card-content-price-total">199,999,999.00</span>
                </div>
                <div className="product-card-content-name">
                  {!isEmpty(topData) &&
                    !!topData[0]?.enabledFlag &&
                    !(data?.hideSupplierFlag && topData?.[0]?.elementType === 'SUPPLIER') && (
                      <div
                        style={{
                          minWidth: 65,
                          height: 18,
                          display: 'inline-block',
                          verticalAlign: 'middle',
                          marginRight: 5,
                          padding: topData?.[0]?.elementType !== 'LABEL' ? '0 5px' : '0',
                          background:
                            topData?.[0]?.elementType !== 'LABEL' ? 'rgba(0,0,0,0.06)' : 'none',
                        }}
                      >
                        {getComponent(topData?.[0]?.elementType)}
                      </div>
                    )}
                  <span>
                    {intl
                      .get('small.mallHomeConfig.productConfig.supplier.desc')
                      .d('商品名称，列表最多显示两行，超过两行显示…')}
                  </span>
                </div>
                <div
                  className={classNames(['product-card-content-other', { ishome: type === 'B' }])}
                >
                  {bottomData.map((tag) => {
                    const disabled = tag?.elementType === 'SUPPLIER' && data.hideSupplierFlag;
                    if (!tag?.enabledFlag || disabled) return null;
                    if (tag?.rowLength === 1) {
                      halfNum++;
                    } else if (tag?.rowLength === 2) {
                      // 遇到整行重新计数
                      halfNum = 0;
                    }

                    return (
                      <div
                        className={classNames({
                          'product-card-content-other-preview-item': true,
                          'width-half': tag?.rowLength === 1,
                          'width-max': tag?.rowLength === 2,
                          'text-right': (tag?.rowLength === 1 && halfNum > 0 && halfNum % 2 === 0),
                        })}
                      >
                        {getComponent(tag?.elementType)}
                        {tag?.elementType !== 'LABEL' && (
                          <b
                            onClick={() => {
                              setBottomData(d => {
                                const newData = [...d];
                                newData.forEach((n, index) => {
                                  if (n?.elementType === tag?.elementType) {
                                    newData[index].rowLength = n.rowLength === 1 ? 2 : 1;
                                  }
                                });
                                return newData;
                              });
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              {type !== 'B' && renderOpreate}
            </div>
          </div>
        </>
      ),
    },
  ];

  useEffect(() => {
    fetchDetail();
  }, []);

  async function fetchDetail() {
    const res =
      (await getResponse(fetchProductCardConfig({ companyId: purchase.companyId }))) || {};
    setFetchSpinging(false);
    setCompareFlag(res?.compareFlag);
    const findOpreate =
      res?.productCardConfigList.find(p =>
        ['COMPARE', 'COLLECT', 'NO_SHOW'].includes(p.elementType)
      )?.elementType || 'COMPARE';
    setCurrentOpreate(res?.compareFlag === 0 && findOpreate === 'COMPARE' ? 'NO_SHOW' : findOpreate);
    res.productCardConfigList =
      res?.productCardConfigList.filter(
        p => !['COMPARE', 'COLLECT', 'NO_SHOW'].includes(p.elementType)
      ) || [];
    if (
      res?.hideSupplierFlag &&
      res?.productCardConfigList?.some(p => p.elementType === 'SUPPLIER')
    ) {
      res.productCardConfigList.forEach((p, i) => {
        if (p.elementType === 'SUPPLIER') {
          res.productCardConfigList[i].enabledFlag = 0;
        }
      });
    }
    if (res.cardConfigFlag) {
      const disableList = defaultlist.filter(
        p => !res?.productCardConfigList.some(i => i?.elementType === p?.elementType)
      ); // 被禁用的列表
      const newList = [
        ...res.productCardConfigList,
        ...disableList.map(p => ({ ...p, row: 2, enabledFlag: 0 })),
      ];
      setList(newList);
      setData({ ...res, productCardConfigList: newList });
    } else {
      if (res?.hideSupplierFlag) {
        defaultlist.forEach((p, i) => {
          if (p.elementType === 'SUPPLIER') {
            defaultlist[i].enabledFlag = 0;
          }
        });
      }
      // 未进行过配置
      setData({ ...res, productCardConfigList: defaultlist });
      setList(defaultlist);
    }
  }

  return (
    <Spin spinning={fetchSpinging}>
      <div className={styles['config-list-content-list']}>
        {itemList
          .filter(i => i?.visible !== false)
          .map((m, j) => {
            return (
              <>
                <div>
                  <ComContent
                    id={m.id}
                    title={m.title}
                    style={{ marginBottom: 8, marginTop: j > 0 ? 16 : 0 }}
                  >
                    <p style={{ marginBottom: 0 }}>{m.desc}</p>
                  </ComContent>
                  {m.children}
                </div>
              </>
            );
          })}
      </div>
    </Spin>
  );
}

export default compose(
  connect(({ mallHome, mallHomeConfig }) => ({
    mallHome,
    mallHomeConfig,
  }))
)(CustConfig);

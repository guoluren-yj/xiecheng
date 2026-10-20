/**
 * CatalogPreview -目录管理-目录预览
 * @date: 2020-06-22
 * @author GM <ming.gao03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Skeleton } from 'choerodon-ui';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';

import styles from './index.less';

function formatData(data) {
  const flag =
    (data.items2 && data.items2.length > 0) ||
    (data.items3 && data.items3.length > 0) ||
    (data.items4 && data.items4.length > 0);
  if (flag) {
    const newData = [];
    for (let i = 1; i <= 4; i++) {
      if (data[`items${i}`]) {
        data[`items${i}`].forEach((item) => {
          if (newData[item.catalogRow]) {
            newData[item.catalogRow].push(item);
          } else {
            newData[item.catalogRow] = [item];
          }
        });
      }
    }
    const tmpdata = newData.filter((item) => item && item.length);
    return tmpdata;
  } else {
    const newData = [];
    const array = (data || {}).items1;
    for (let i = 0; i < array.length; i++) {
      newData.push([array[i]]);
    }
    return newData;
  }
}

@formatterCollections({
  code: ['small.groupCategoryMaintenance', 'small.common'],
})
@connect(({ loading }) => ({
  loading: loading.effects['groupCategoryMaintenance/fetchCatalogPreview'],
}))
export default class CatalogPreview extends Component {
  constructor(props) {
    super(props);
    const {
      match: { params = {} },
    } = props;
    const { companyId } = params;
    this.state = {
      companyId,
      currentIndex: 0,
      catalogData: {
        items1: [],
        items2: [],
        items3: [],
        items4: [],
        flag: false,
      },
    };
  }

  componentDidMount() {
    this.fetchCatalog();
  }

  @Bind()
  fetchCatalog() {
    const { dispatch } = this.props;
    const { companyId } = this.state;
    dispatch({
      type: 'groupCategoryMaintenance/fetchCatalogPreview',
      payload: {
        companyId,
      },
    }).then((res) => {
      if (res) {
        this.setState({ catalogData: formatData(res) });
      }
    });
  }

  @Bind()
  handleMouseEnter(index) {
    this.setState({
      currentIndex: index,
    });
  }

  @Bind()
  renderPreviewCatalog() {
    const { catalogData } = this.state;
    return (
      <div className={styles['h-nav-bar']}>
        <a className="all-category">
          {intl.get(`small.groupCategoryMaintenance.model.allCategories`).d('全品类')}
        </a>
        <div className="nav-list-wrapper">
          <div className="nav-fixed nav-fixed-home">
            <div className="nav-list-container">
              <ul className="nav-list">{this.newCategory(catalogData)}</ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  @Bind()
  newCategory(list) {
    const { currentIndex } = this.state;
    if (list && list.length > 0) {
      return list
        .filter((arr) => arr.length > 0)
        .map((items, i) => {
          return (
            <li
              className={`${i === currentIndex ? 'current-menu' : ''}`}
              onMouseEnter={() => this.handleMouseEnter(i)}
            >
              <div className="li-bottom">
                {(items || []).map((item) => {
                  return (
                    item.catalogName && <span className="menu-level1">{item.catalogName}</span>
                  );
                })}
              </div>
              <ul className="children" style={{ width: 810, left: 190 }}>
                <p>
                  {(items || [])
                    .map((p) => p.catalogName)
                    .filter((p) => !!p)
                    .join(' / ')}
                </p>
                {(items || []).map(
                  (item) => item.catalogName && this.getSubCategories(item.children)
                )}
              </ul>
            </li>
          );
        });
    }
  }

  @Bind()
  getSubCategories(item) {
    // 查找子类别
    return item.map((i) => {
      return (
        <li key={i.catalogId}>
          <div className="sub-category-item" title={i.catalogName}>
            <a>{i.catalogName}</a>
          </div>
          {i.children && !!i.children.length && (
            <ul className="category-items">{this.getCategoryItems(i.children)}</ul>
          )}
        </li>
      );
    });
  }

  @Bind()
  getCategoryItems(item) {
    // 查找三级目录
    return item.map((i) => {
      const { platformCatalogId, catalogId: comCatalogId, catalogName } = i;
      const catalogId = platformCatalogId || comCatalogId;
      return (
        <li key={catalogId}>
          <a>{catalogName}</a>
        </li>
      );
    });
  }

  render() {
    const { loading } = this.props;
    return (
      <React.Fragment>
        <Header
          backPath="/small/ec-catalog/list?key=3"
          title={intl.get('small.groupCategoryMaintenance.model.catalogPreview').d('目录预览')}
        />
        <Content>
          <Skeleton loading={loading} active paragraph={{ rows: 10 }} title={false}>
            {this.renderPreviewCatalog()}
          </Skeleton>
        </Content>
      </React.Fragment>
    );
  }
}

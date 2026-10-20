/**
 * 品牌管理
 * @date: 2020-12-03
 * @author: hl <li.huang04@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import qs from 'querystring';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react-lite';
import { DataSet, Tree, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import ImportButton from 'components/Import';
import DynamicButtons from '_components/DynamicButtons';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, getCurrentUserId, getUserOrganizationId } from 'utils/utils';

import { categoryTableDs, treeTableDs } from './ds';
import { exportAll, fetchCategoryList } from './api';

import AttrList from './AttrList';
import AttrValList from './AttrValList';
import CategoryList from './CategoryList';

import './index.less';

@formatterCollections({
  code: ['smpc.categoryManage', 'smpc.product'],
})
@withCustomize({ unitCode: ['SMALL.CATEGORY_MANAGE.BTNS'] })
export default class CategoryManage extends Component {
  categoryRef;

  attrRef;

  attrValRef;

  constructor(props) {
    super(props);
    this.state = {
      level: 1,
      attr: {},
      child: {},
      parent: {},
      grandParent: {},
    };
    this.categoryDs = new DataSet(categoryTableDs());
    this.treeDs = new DataSet(treeTableDs(this.lookNextLevel, this.manageAttr), this.categoryDs);
  }

  componentDidMount() {
    this.categoryDs.setQueryParameter('parentCategoryId', 0);
    this.categoryDs.query();
  }

  /**
   * 导入
   */
  @Bind()
  handleImport() {
    openTab({
      key: '/smpc/data-import/SMPC.CATEGORY_IMPORT',
      title: 'srm.common.view.categoryImport',
      // title: intl.get('srm.common.view.categoryImport').d('分类导入'),
      search: qs.stringify({
        action: 'srm.common.view.categoryImport',
        backPath: '/s2-mall/product/category-manage',
      }),
    });
  }

  /**
   *导出
   */
  @Bind()
  async handleExport() {
    const result = getResponse(
      await exportAll({ userId: getCurrentUserId(), tenantId: getUserOrganizationId() })
    );
    if (result) {
      notification.info({
        message: intl.get('smpc.product.view.asyncLookExportResult').d('请到异步导出监控页面查看'),
      });
    }
  }

  /**
   * 属性管理
   */
  @Bind()
  manageAttr(currentLine = {}) {
    this.setState({ level: 4, child: { ...currentLine } });
  }

  /**
   * 查看下级、属性管理
   */
  @Bind()
  lookNextLevel(currentLine = {}, lev) {
    const { level } = this.state;
    const params =
      level === 1
        ? { grandParent: currentLine }
        : level === 2
        ? { parent: currentLine }
        : level === 3
        ? { child: currentLine }
        : level === 4
        ? { attr: currentLine }
        : {};
    this.setState(
      {
        level: lev,
        ...params,
      },
      () => {
        if (level < 3) {
          this.query(level);
          const { loaded, expand, categoryId } = currentLine;
          const record = this.treeDs.find((r) => r.get('categoryId') === categoryId);
          if (record) {
            if (!expand) {
              record.set('expand', true);
              if (!loaded) {
                fetchCategoryList({ parentCategoryId: categoryId })
                  .then((res) => {
                    if (res) {
                      const treeData = this.treeDs.toData();
                      const isExit = treeData.some((s) =>
                        res.some((_s) => s.categoryId === _s.categoryId)
                      );
                      if (!isExit) {
                        this.treeDs.loadData([...res, ...treeData]);
                      }
                    }
                  })
                  .finally(() => {
                    record.set('loaded', true);
                  });
              }
            }
          }
        }
      }
    );
  }

  @Bind()
  query(level) {
    const { parent, grandParent } = this.state;
    const id = level === 1 ? grandParent.categoryId : level === 2 ? parent.categoryId : '';
    this.categoryDs.setQueryParameter('parentCategoryId', id);
    this.categoryDs.query();
  }

  /**
   * 返回
   */
  @Bind()
  returnLevel(level, currentLine) {
    const params =
      level === 1
        ? { grandParent: currentLine || {} }
        : level === 2
        ? { parent: currentLine || {} }
        : level === 3
        ? { child: currentLine || {} }
        : level === 4
        ? { attr: currentLine || {} }
        : {};
    const { child, parent, grandParent } = this.state;
    this.setState({ level, attr: {}, ...params }, () => {
      const { categoryId = '', parentId = 0 } =
        currentLine ||
        (level === 1 ? grandParent : level === 2 ? parent : level === 3 ? child : {});
      const record = this.treeDs.find((r) => r.get('categoryId') === categoryId);
      if (level <= 3) {
        this.categoryDs.setQueryParameter('parentCategoryId', parentId);
        this.categoryDs.query();
      }
      if (record && record.get('expand')) {
        record.set('expand', false);
      }
    });
  }

  @Bind()
  renderText({ value }) {
    return <p className="info-item">{value}</p>;
  }

  @Bind()
  nodeRenderer({ record }) {
    const { categoryId, categoryName, level } = record.toData();
    return {
      record,
      level,
      key: categoryId,
      title: categoryName,
      isLeaf: level === 3,
    };
  }

  @Bind()
  loadData(node) {
    const { key, record, level, children } = node;
    return new Promise((resolve) => {
      if (!children) {
        fetchCategoryList({ parentCategoryId: key })
          .then((_res) => {
            const treeData = this.treeDs.toData();
            const res = _res || [];
            const isExit = treeData.some((s) => res.some((_s) => s.categoryId === _s.categoryId));
            if (!isExit) {
              this.treeDs.loadData([...res, ...treeData]);
            }
            const newRecord = this.treeDs.find((r) => r.get('categoryId') === key);
            if (newRecord) this.treeDs.select(newRecord);
            this.lookNextLevel(record.toData(), level + 1);
            resolve();
          })
          .catch(() => {
            resolve();
          })
          .finally(() => {
            record.set('loaded', true);
          });
      } else {
        resolve();
      }
    });
  }

  @Bind()
  expand(_, { expanded: bool, node }) {
    const { loaded, record, level } = node;
    this.treeDs.select(record);
    if (loaded) {
      if (bool) {
        this.lookNextLevel(record.toData(), level + 1);
      } else {
        this.returnLevel(level <= 1 ? 1 : level - 1, record.toData());
      }
    }
  }

  render() {
    const { level, attr, child, parent, grandParent } = this.state;
    const { customizeBtnGroup } = this.props;

    const categoryProps = {
      level,
      parent,
      grandParent,
      treeDs: this.treeDs,
      dataSet: this.categoryDs,
      onNext: this.lookNextLevel,
      onRef: (ref) => {
        this.categoryRef = ref;
      },
    };
    const attrProps = {
      cid: child.categoryId,
      onNext: this.lookNextLevel,
      onRef: (ref) => {
        this.attrRef = ref;
      },
    };
    const attrValProps = {
      attr,
      renderText: this.renderText,
      onRef: (ref) => {
        this.attrValRef = ref;
      },
    };
    const ReturnButton = observer(() => {
      return (
        <Button icon="arrow_back" funcType="flat" onClick={() => this.returnLevel(level - 1)}>
          {level <= 3
            ? intl.get('smpc.categoryManage.button.returnLastLevel').d('返回上一级')
            : level === 4
            ? intl.get('smpc.categoryManage.button.returnCategory').d('返回分类')
            : intl.get('smpc.categoryManage.button.returnAttrManage').d('返回属性管理')}
        </Button>
      );
    });
    const customizeButtons = [
      {
        name: 'oldExport',
        btnType: 'c7n-pro',
        child: intl.get('smpc.product.button.export').d('导出'),
        btnProps: {
          icon: 'unarchive',
          funcType: 'flat',
          onClick: this.handleExport,
        },
      },
      {
        name: 'oldImport',
        btnType: 'c7n-pro',
        child: intl.get('hzero.common.button.import').d('导入'),
        btnProps: {
          icon: 'archive',
          funcType: 'flat',
          onClick: this.handleImport,
        },
      },
    ];
    return (
      <React.Fragment>
        <Header title={intl.get('smpc.categoryManage.view.title').d('分类管理')}>
          {level >= 1 && level <= 5 && (
            <Button
              color="primary"
              icon="save"
              style={{ display: attr.baseAttrFlag === 1 ? 'none' : 'inline-block' }}
              onClick={() => {
                if (level <= 3) this.categoryRef.categoryModal();
                else if (level === 4) this.attrRef.attrModal();
                else this.attrValRef.attrValModal();
              }}
            >
              {level <= 3
                ? intl.get('smpc.categoryManage.button.addCategory').d('添加分类')
                : level === 4
                ? intl.get('smpc.categoryManage.button.bindNewAttr').d('绑定新属性')
                : intl.get('smpc.categoryManage.button.bindNewAttrVal').d('绑定新属性值')}
            </Button>
          )}
          {level > 1 && level <= 5 && <ReturnButton dataSet={this.treeDs} />}
          <ImportButton
            businessObjectTemplateCode="SMPC.CATEGORY_IMPORT"
            refreshButton
            buttonText={intl.get('smpc.product.button.importNew').d('(新)导入')}
            prefixPatch="/smpc"
            successCallBack={() => this.query(1)}
            buttonProps={{
              icon: 'archive',
              funcType: 'flat',
              // permissionList: [
              //   { code: `${path}.button.import-new`, type: 'button', meaning: '分类管理-(新)导入' },
              // ],
            }}
          />
          {customizeBtnGroup(
            {
              code: 'SMALL.CATEGORY_MANAGE.BTNS',
              // 新版按钮组个性化（必须）
              pro: true,
            },
            <DynamicButtons buttons={customizeButtons} />
          )}
        </Header>
        <Content className="category-manage-container">
          <div style={{ display: 'flex' }}>
            <div
              style={{ width: '20%', marginRight: '25px', height: '500px', overflow: 'overlay' }}
            >
              <p style={{ fontSize: 14 }}>
                {intl.get('smpc.categoryManage.view.allCategory').d('全部分类')}
              </p>
              <Tree
                dataSet={this.treeDs}
                loadData={this.loadData}
                onExpand={this.expand}
                treeNodeRenderer={this.nodeRenderer}
              />
            </div>
            <div style={{ width: '80%' }}>
              {level >= 1 && level <= 3 ? (
                <CategoryList {...categoryProps} />
              ) : level === 4 ? (
                <AttrList {...attrProps} />
              ) : level === 5 ? (
                <AttrValList {...attrValProps} />
              ) : null}
            </div>
          </div>
        </Content>
      </React.Fragment>
    );
  }
}

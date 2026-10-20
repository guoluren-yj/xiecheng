/**
 * 标签管理
 * @date: 2020-11-25
 * @author: hl <li.huang04@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React from 'react';
import queryString from 'querystring';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react-lite';
import { DataSet, Table, Button, Modal, Icon, Row, Col } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import DynamicButtons from '_components/DynamicButtons';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import cuxRemote from 'hzero-front/lib/utils/remote';
import ImportButton from 'components/Import';

import { openTab } from 'utils/menuTab';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import Image from '@/components/Image';
import { getSkuImagePath } from '@/utils/utils';
import LabelManage from './LabelManage';
import LabelPreview from './LabelPreview';

import { tableDs, labelTableDs } from './ds';
import { assignLabel, delProductLabel } from './api';
import { statusColumn } from '../SkuWorkbench/tableColumns';

import './index.less';

// remote.process 处理编码
const PROCESS_COLUMNS_CODE = 'SMPC_PRODUCT_LABEL_PROCESS_TABLE_COLUMNS';
const PROCESS_DS_CODE = 'SMPC_PRODUCT_LABEL_PROCESS_DS';

const modalProps = {
  movable: false,
  closable: true,
  mask: true,
  maskClosable: true,
  destroyOnClose: true,
  drawer: true,
};

@formatterCollections({
  code: ['smpc.labelManage', 'smpc.product'],
})
@cuxRemote(
  {
    code: 'PRODUCT_LABEL_MANAGE_REMOTE',
    name: 'remote',
  },
  {}
)
@withCustomize({ unitCode: ['SMPC.PRODUCT_LABEL_MAPPING.BTNS'] })
export default class ProductLabelManage extends React.Component {
  constructor(props) {
    super(props);
    const { remote } = props;
    this.ds = new DataSet(remote.process(PROCESS_DS_CODE, tableDs(), {}));
  }

  manageModal;

  labelTableDs;

  labelSelectDs;

  state = {
    expandList: [], // 已展开列表
  };

  /**
   * 通用导入
   */
  @Bind()
  handleImport() {
    openTab({
      key: '/smpc/data-import/SMPC.SKU_LABEL_IMPORT',
      title: 'srm.common.view.productLabelImport',
      // title: intl.get('srm.common.view.productLabelImport').d('商品标签导入'),
      search: queryString.stringify({
        action: 'srm.common.view.productLabelImport',
        backPath: `/s2-mall/product/label-manage`,
      }),
    });
  }

  @Bind()
  async handleBatch(list = [], enabledFlag = 1) {
    const saveList = list.map((i) => ({ ...i, enabledFlag }));
    const result = getResponse(await assignLabel(saveList));
    if (result) {
      notification.success();
      this.ds.query(this.ds.currentPage);
    }
  }

  @Bind()
  labelManage(skuIds = [], labels, handleRows = []) {
    const supplierCompanyIds = [...new Set(handleRows.map((d) => d.supplierCompanyId))];
    // 商品标签按orderSeq序号排列
    this.labelSelectDs = new DataSet({
      paging: false,
      data: labels || [],
    });
    this.labelTableDs = new DataSet(labelTableDs(this.labelSelectDs, supplierCompanyIds));
    this.manageModal = Modal.open({
      ...modalProps,
      key: 'labelManageModal',
      style: { width: 550 },
      title: intl.get('smpc.product.button.labelManage').d('标签管理'),
      onOk: () => this.beforeSave(skuIds),
      okText: intl.get('hzero.common.button.save').d('保存'),
      children: <LabelManage labelTableDs={this.labelTableDs} labelSelectDs={this.labelSelectDs} />,
    });
    this.setState({ labels });
  }

  @Bind()
  async beforeSave(skuIds = []) {
    const list = this.labelSelectDs.toData();
    const { labels } = this.state;
    const delList =
      labels && labels.length > 0
        ? labels.filter((l) => !list.map((i) => i.labelId).includes(l.labelId))
        : [];
    if (delList.length > 0) {
      this.del(delList, skuIds[0], () => {
        this.save(list, skuIds);
      });
    } else {
      this.save(list, skuIds);
    }
  }

  @Bind()
  async save(labels = [], skuIds = []) {
    if (labels.length > 0) {
      const result = getResponse(await assignLabel({ labels, skuIds }));
      if (result) {
        notification.success();
        this.manageModal.close();
        this.ds.query(this.ds.currentPage);
      }
    } else {
      this.ds.query(this.ds.currentPage);
    }
  }

  @Bind()
  async del(labels = {}, skuId = '', fn) {
    const list = labels.map((l) => ({ ...l, skuId }));
    const result = getResponse(await delProductLabel(list));
    if (result) {
      if (typeof fn === 'function') fn();
    }
  }

  @Bind()
  getColumns() {
    const { expandList } = this.state;
    const columns = [
      statusColumn(),
      {
        name: 'operation',
        width: 100,
        renderer: ({ record }) => {
          const { skuId, labels } = record.toData();
          return (
            <a onClick={() => this.labelManage([skuId], labels, [record.toData()])}>
              {intl.get('smpc.product.button.labelManage').d('标签管理')}
            </a>
          );
        },
      },
      {
        key: 'skuGroup',
        minWidth: 290,
        tooltip: 'none',
        aggregation: true,
        align: 'left',
        header: intl.get('smpc.product.view.skuInfo').d('商品信息'),
        children: [
          {
            name: 'skuCode',
            width: 120,
          },
          {
            name: 'skuName',
            minWidth: 180,
          },
          {
            name: 'spuCode',
            width: 120,
          },
          {
            name: 'categoryNamePath',
            width: 160,
          },
        ],
        renderer: ({ record, text }) => {
          const imagePath = getSkuImagePath(record);
          return (
            <div className="product-label-manege-sku-container">
              <div className="sku-info">
                <Image className="sku-img" value={imagePath} width={64} height={64} />
                <div className="sku-content">{text}</div>
              </div>
            </div>
          );
        },
      },
      {
        name: 'itemInfo',
        width: 180,
        renderer: ({ value }) => {
          return (
            <div className="info-list">
              <p>
                {intl.get('smpc.product.model.itemCode').d('物料编码')}：{value.itemCode}
              </p>
              <p>
                {intl.get('smpc.product.model.itemName').d('物料名称')}：{value.itemName}
              </p>
            </div>
          );
        },
      },
      {
        name: 'supplierCompanyName',
        width: 160,
        renderer: ({ value }) => <p className="info-item">{value}</p>,
      },
      {
        name: 'labels',
        width: 260,
        renderer: ({ value, record }) => {
          const labelList = value || [];
          const skuId = record.get('skuId');
          const expand = expandList.includes(skuId);
          return (
            <div>
              <Row gutter={2}>
                {labelList.slice(0, expand ? labelList.length : 6).map((l) => (
                  <Col span={8}>
                    <LabelPreview code={l.labelColorCode} value={l.labelName} />
                  </Col>
                ))}
              </Row>
              {labelList.length > 6 && (
                <p>
                  <a
                    onClick={() => {
                      this.setState({
                        expandList: expand
                          ? expandList.filter((i) => i !== skuId)
                          : [...expandList, skuId],
                      });
                    }}
                  >
                    <Icon type={expand ? 'expand_less' : 'expand_more'} />
                    {expand
                      ? intl.get('smpc.product.button.collapse').d('收起')
                      : intl.get('smpc.product.button.expand').d('展开')}
                  </a>
                </p>
              )}
            </div>
          );
        },
      },
    ];

    // 二开远程扩展表格列
    const { remote } = this.props;
    const newColumns = remote.process(PROCESS_COLUMNS_CODE, columns, {
      expandList,
    });
    return newColumns;
  }

  render() {
    const {
      match: { path = '' },
      customizeBtnGroup,
    } = this.props;
    const columns = this.getColumns();
    const customizeButtons = [
      {
        name: 'import',
        btnType: 'c7n-pro',
        child: intl.get('hzero.common.import').d('导入'),
        btnProps: {
          icon: 'archive',
          onClick: this.handleImport,
          style: { border: 'none' },
          funcType: 'flat',
        },
      },
    ];
    const ManageLabelButton = observer(({ dataSet }) => {
      const data = dataSet.selected.map((m) => m.toData());
      const skuIds = data.map((i) => i.skuId);
      return (
        <Button
          color="primary"
          icon="local_offer"
          onClick={() => this.labelManage(skuIds, [], data)}
          disabled={skuIds.length === 0}
        >
          {intl.get('smpc.product.button.batchManageLabel').d('批量添加标签')}
        </Button>
      );
    });
    return (
      <React.Fragment>
        <Header title={intl.get('smpc.labelManage.view.title').d('商品标签管理')}>
          <ManageLabelButton dataSet={this.ds} />
          <ImportButton
            businessObjectTemplateCode="SMPC.SKU_LABEL_IMPORT"
            refreshButton
            buttonText={intl.get('smpc.product.button.importNew').d('(新)导入')}
            prefixPatch="/smpc"
            successCallBack={() => this.ds.query()}
            buttonProps={{
              icon: 'archive',
              funcType: 'flat',
              permissionList: [
                {
                  code: `${path}.button.import-new`,
                  type: 'button',
                  meaning: '商品标签管理-(新)导入',
                },
              ],
            }}
          />
          {customizeBtnGroup(
            {
              code: 'SMPC.PRODUCT_LABEL_MAPPING.BTNS',
              // 新版按钮组个性化（必须）
              pro: true,
            },
            <DynamicButtons buttons={customizeButtons} />
          )}
        </Header>
        <Content className="label-manage-container">
          <Table
            className="product-label-manage-table-search"
            dataSet={this.ds}
            columns={columns}
            aggregation
            aggregationLimit={3}
            queryFieldsLimit={3}
            columnResizable
          />
        </Content>
      </React.Fragment>
    );
  }
}

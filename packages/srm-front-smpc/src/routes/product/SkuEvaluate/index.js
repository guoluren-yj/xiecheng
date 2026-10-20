/**
 * 商品评价管理
 * @date: 2020-12-07
 * @author hl <li.huang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react-lite';
import { Rate, Tooltip } from 'choerodon-ui';
import { DataSet, Table, Button, Modal } from 'choerodon-ui/pro';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { dateRender } from 'utils/renderer';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';
import formatterCollections from 'utils/intl/formatterCollections';
import DynamicButtons from '_components/DynamicButtons';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { SRM_SMPC } from '_utils/config';

import listCellRender from '@/routes/renderTools/listCellRender';
import Image from '@/components/Image';
import { getC7NQueryParams } from '@/utils/utils';

import { tableDs } from './ds';
import { updateEvaluate } from './api';
import ImageList from './ImageList';

import styles from './style.less';

const organizationId = getCurrentOrganizationId();

const MobxButton = observer((props) => {
  const { onClick, ...dynamicProps } = props;
  const props_ = Object.keys(dynamicProps).reduce((p, c) => {
    const _props = p;
    _props[c] = typeof props[c] === 'function' ? props[c]() : props[c];
    return _props;
  }, {});
  return (
    <Button {...props_} onClick={onClick} wait={1000}>
      {props_.children}
    </Button>
  );
});

export function rendererScores({ record }) {
  const {
    score,
    serviceScore,
    transportScore,
    assessmentContent,
    assessmentDate,
  } = record.toData();
  const socres = [
    {
      label: intl.get('smpc.product.view.skuQuality').d('商品质量'),
      value: score,
    },
    {
      label: intl.get('smpc.product.view.serviceQuality').d('服务质量'),
      value: serviceScore,
    },
    {
      label: intl.get('smpc.product.view.transportSpeed').d('配送速度'),
      value: transportScore,
    },
  ];
  return (
    <div className={styles['scores-wrapper']}>
      {socres.map((m) => (
        <div className="rate-wrapper">
          <span className="rate-label">{m.label}</span>
          <Rate
            disabled
            allowHalf
            defaultValue={math.round(m.value || 0) / 2}
            className="rate-list"
          />
        </div>
      ))}
      <p className="evaluate-text">
        <Tooltip title={assessmentContent} placement="top">
          {assessmentContent}
        </Tooltip>
      </p>
      <p>{dateRender(assessmentDate && assessmentDate.split(' ')[0])}</p>
    </div>
  );
}

@formatterCollections({
  code: ['smpc.productEvaluate', 'smpc.product'],
})
@withCustomize({ unitCode: ['SMPC.PRODUCT_EVALUATE.BTNS'] })
export default class ProductEvaluate extends Component {
  ds = new DataSet(tableDs());

  /**
   * 删除
   */
  @Bind()
  handleDelete(rows = []) {
    Modal.confirm({
      title: intl.get('smpc.productEvaluate.view.confirmDeleteYn').d('您确定要删除吗？'),
      onOk: async () => {
        await this.handleUpdate(rows, 2);
      },
    });
  }

  /**
   * 显示、隐藏、删除
   */
  @Bind()
  async handleUpdate(rows = [], flag) {
    const result = await getResponse(updateEvaluate({ flag, data: rows.map((e) => e.toData()) }));
    if (result) {
      notification.success();
      await this.ds.query(this.ds.currentPage);
    }
  }

  renderUnitLine({ value }, style = {}) {
    return (
      <span className={styles['unit-line']} style={style} title={value}>
        {value}
      </span>
    );
  }

  @Bind()
  getColumns() {
    return [
      {
        name: 'skuInfo',
        width: 250,
        tooltip: 'none',
        renderer: ({ record }) => {
          return (
            <div className={styles['sku-info']}>
              <Image value={record.get('skuImage')} className="sku-img" />
              {listCellRender(
                [
                  {
                    name: 'skuCode',
                    label: intl.get('smpc.product.view.skuCode').d('商品编码'),
                  },
                  {
                    name: 'skuName',
                    label: intl.get('smpc.product.view.skuName').d('商品名称'),
                  },
                  {
                    name: 'uomName',
                    label: intl.get('smpc.product.view.skuUomName').d('销售单位'),
                  },
                  {
                    name: 'brandName',
                    label: intl.get('smpc.product.view.brand').d('品牌'),
                    labelMinWidth: 24,
                  },
                  {
                    name: 'categoryName',
                    label: intl.get('smpc.product.view.category').d('分类'),
                    labelMinWidth: 24,
                  },
                ],
                record.toJSONData()
              )}
            </div>
          );
        },
      },
      {
        name: 'supplierCompanyName',
        minWidth: 120,
      },
      {
        name: 'loginName',
        width: 140,
      },
      {
        name: 'score',
        width: 280,
        renderer: rendererScores,
        tooltip: 'none',
      },
      {
        name: 'imageDTO',
        width: 250,
        tooltip: 'none',
        renderer: ({ record }) => {
          const { assessmentFileList = [] } = record.toData();
          return <ImageList imageDTO={assessmentFileList || []} />;
        },
      },
      // 追加评价
      {
        name: 'appendContent',
        width: 150,
        renderer: ({ value, record }) => {
          const appendDate = record.get('appendDate');
          return (
            <div className={`${styles['append-comment']} ${styles['scores-wrapper']}`}>
              <p className="evaluate-text">
                <Tooltip title={value} placement="top">
                  {value}
                </Tooltip>
              </p>
              <span>{dateRender(appendDate && appendDate.split(' ')[0])}</span>
            </div>
          );
        },
      },
      // 追加图片
      {
        name: 'appendFileList',
        width: 250,
        renderer: ({ value }) => {
          return <ImageList imageDTO={value || []} />;
        },
      },
      {
        title: intl.get('hzero.common.action').d('操作'),
        name: 'operation',
        width: 100,
        lock: 'right',
        renderer: ({ record }) => {
          const hiddenFlag = record.get('hiddenFlag');
          const logicDeleteFlag = record.get('logicDeleteFlag');
          if (logicDeleteFlag === 1) return '-';
          return (
            <span className="action-link">
              <a onClick={() => this.handleUpdate([record], hiddenFlag === 1 ? 0 : 1)}>
                {hiddenFlag === 1
                  ? intl.get('smpc.product.model.show').d('显示')
                  : intl.get('smpc.product.model.hidden').d('隐藏')}
              </a>
              <a onClick={() => this.handleDelete([record])}>
                {intl.get('hzero.common.button.delete').d('删除')}
              </a>
            </span>
          );
        },
      },
    ];
  }

  render() {
    const {
      match: { path = '' },
      customizeBtnGroup,
    } = this.props;
    const _columns = this.getColumns();
    const columns = _columns.map((m) => ({
      ...m,
      renderer: m.renderer ? m.renderer : (param) => this.renderUnitLine(param),
    }));
    const customizeButtons = [
      {
        name: 'export',
        btnType: 'c7n-pro',
        btnComp: ExcelExport,
        btnProps: {
          exportAsync: true,
          requestUrl: `${SRM_SMPC}/v1/${organizationId}/assessments/assessment-list/export`,
          otherButtonProps: { type: 'c7n-pro', funcType: 'flat', icon: 'unarchive' },
          buttonText: intl.get('smpc.product.button.batchExport').d('批量导出'),
          queryParams: () => getC7NQueryParams(this.ds, { assessmentBy: -1 }),
        },
      },
    ];

    return (
      <React.Fragment>
        <Header title={intl.get('smpc.productEvaluate.view.title').d('商品评价管理')}>
          <ExcelExportPro
            exportAsync
            templateCode="SMPC_ASSESSMENT_EXPORT"
            buttonText={intl.get('smpc.product.button.batchExportNew').d('(新)批量导出')}
            requestUrl={`${SRM_SMPC}/v1/${organizationId}/assessments/assessment-list/export`}
            otherButtonProps={{
              type: 'c7n-pro',
              funcType: 'flat',
              icon: 'unarchive',
              permissionList: [
                {
                  code: `${path}.button.export-new`,
                  type: 'button',
                  meaning: '商品评价管理-(新)导出',
                },
              ],
            }}
            queryParams={() => getC7NQueryParams(this.ds, { assessmentBy: -1 })}
          />
          {customizeBtnGroup(
            {
              code: 'SMPC.PRODUCT_EVALUATE.BTNS',
              // 新版按钮组个性化（必须）
              pro: true,
            },
            <DynamicButtons buttons={customizeButtons} />
          )}
          <MobxButton
            funcType="flat"
            icon="visibility"
            disabled={() => this.ds.selected.length === 0}
            onClick={() => this.handleUpdate(this.ds.selected, 0)}
          >
            {intl.get('smpc.product.model.batchShow').d('批量显示')}
          </MobxButton>
          <MobxButton
            funcType="flat"
            icon="visibility_off"
            disabled={() => this.ds.selected.length === 0}
            onClick={() => this.handleUpdate(this.ds.selected, 1)}
          >
            {intl.get('smpc.product.model.batchHidden').d('批量隐藏')}
          </MobxButton>
          <MobxButton
            funcType="flat"
            icon="delete"
            disabled={() => this.ds.selected.length === 0}
            onClick={() => this.handleDelete(this.ds.selected)}
          >
            {intl.get('smpc.product.button.batchDelete').d('批量删除')}
          </MobxButton>
        </Header>
        <Content className={styles['sku-evaluate-manage']}>
          <Table dataSet={this.ds} columns={columns} rowHeight="auto" />
        </Content>
      </React.Fragment>
    );
  }
}

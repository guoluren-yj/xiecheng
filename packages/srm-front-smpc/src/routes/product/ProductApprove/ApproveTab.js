import React, { Component } from 'react';
import { Popover, Row, Col } from 'choerodon-ui';
import { Table, Button, Icon, Spin, Modal, DataSet } from 'choerodon-ui/pro';
import { math } from 'choerodon-ui/dataset';
import { observer } from 'mobx-react-lite';
import qs from 'querystring';
import classNames from 'classnames';
import { Bind } from 'lodash-decorators';
import { withRouter } from 'react-router-dom';

import intl from 'utils/intl';
import { SRM_MALL } from '_utils/config';
// import { dateRender } from 'utils/renderer';
import ExcelExport from 'components/ExcelExport';
import { showRecordModal } from '@/utils/c7nModal';
import { getResponse, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

import { fetchLastProduct, approveOrReject } from './api';

import ReasonModal from './ReasonModal';
import listCellRender from '../OnOffShelvesNew/listCellRender';
import previewRender from '@/routes/renderTools/previewRender';
import style from './index.less';

const organizationId = getCurrentOrganizationId();

// 侧弹表格组件
const RightOver = (props) => {
  const { width = 380, title, content, children } = props;

  const handleOpen = () => {
    Modal.open({
      movable: false,
      closable: true,
      mask: true,
      maskClosable: true,
      destroyOnClose: true,
      drawer: true,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      style: { width, minWidth: 380, maxWidth: 1090 },
      children: content,
      title,
    });
  };

  return <a onClick={handleOpen}>{children}</a>;
};

@withRouter
export default class ApproveTabs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      expand: true,
      // expandCollapseFlag: {}, // 单元格里的展开与收起
    };
    this.tableRef = React.createRef();
  }

  componentDidMount() {
    this.props.tableDs.query();
  }

  @Bind()
  getColumns() {
    // 商品状态展示
    const { waiting } = this.props; // 待审批
    const statusInfo = ({ text, record }) => {
      const remark = record.get('remark');
      return record.get('parentId') ? (
        intl.get('smpc.product.view.historyVersion').d('历史版本')
      ) : waiting ? (
        <span>{text}</span>
      ) : (
        <Col>
          <Row>{text}</Row>
          {remark && (
            <Row>
              <Popover placement="top" content={remark}>
                <a>{intl.get('smpc.product.view.rejectReason').d('拒绝原因')}</a>
              </Popover>
            </Row>
          )}
        </Col>
      );
    };

    return [
      {
        width: waiting ? 120 : 100,
        className: waiting ? 'approve-status' : '',
        name: 'approveStatusMeaning',
        renderer: statusInfo,
      },
      {
        width: 120,
        name: 'skuCode',
        renderer: ({ text }) => <span className={style['table-cell']}>{text}</span>,
      },
      {
        name: 'productInfo',
        renderer: this.renderProductInfo,
      },
      {
        name: 'itemInfo',
        width: 180,
        renderer: this.rendererItemInfo,
      },
      {
        name: 'priceInfo',
        width: 160,
        renderer: this.rendererPriceInfo,
      },
      {
        width: 220,
        name: 'supplierTenantName',
        renderer: ({ text }) => (
          <span className={style['table-cell']} title={text}>
            {text}
          </span>
        ),
      },
      {
        name: 'options',
        width: 160,
        lock: 'right',
        align: 'center',
        renderer: ({ record }) => (
          <span className="action-link">
            <a onClick={() => this.handleEditDetail(record)}>
              {intl.get('hzero.common.button.details').d('查看详情')}
            </a>
            <a onClick={() => this.handleOpenRecord(record)}>
              {intl.get('hzero.common.button.operating').d('操作记录')}
            </a>
          </span>
        ),
      },
    ];
  }

  @Bind()
  handleOpenRecord(record) {
    const { skuId, agreementLineId } = record.toData();
    showRecordModal({
      width: 700,
      fields: [
        { name: 'realName', label: intl.get('smpc.product.view.operateName').d('操作人') },
        { name: 'operationTime', label: intl.get('smpc.product.view.operateTime').d('操作时间') },
        { name: 'operationCodeMeaning', label: intl.get('hzero.common.action').d('操作') },
        { name: 'tenantName', label: intl.get('smpc.product.view.tenantName').d('所属租户') },
      ],
      columns: [
        { name: 'realName' },
        { name: 'operationTime' },
        { name: 'operationCodeMeaning' },
        { name: 'tenantName' },
      ],
      params: { skuId, agreementLineId },
      url: `/smpc/v1/${organizationId}/sku-operation-records`,
    });
  }

  @Bind()
  renderProductInfo({ record }) {
    const { skuId, imagePath } = record.toData();
    const keyList = record.get('keyList') || [];
    return (
      <div className={style['product-content']}>
        {previewRender({ imagePath, productId: skuId }, { border: '1px #eee solid' })}
        <div className="info-content">
          <p
            className={`product-name${keyList.includes('skuName') ? ' last-v' : ''}`}
            title={record.get('skuName')}
          >
            {record.get('skuName')}
          </p>
          <p className="product-other">
            <span className="product-spu" title={record.get('spuCode')}>
              {record.get('spuCode')}
            </span>
            <span
              className={`product-category${keyList.includes('categoryPath') ? ' last-v' : ''}`}
              title={record.get('categoryPath')}
            >
              {record.get('categoryPath')}
            </span>
          </p>
        </div>
      </div>
    );
  }

  rendererItemInfo = ({ record }) => {
    return listCellRender(
      [
        {
          name: 'itemCode',
          label: intl.get('smpc.product.model.itemCode').d('物料编码'),
        },
        {
          name: 'itemName',
          label: intl.get('smpc.product.view.itemName').d('物料名称'),
        },
        // {
        //   name: 'itemCategoryName',
        //   label: intl.get('smpc.product.model.itemcategoryDesc').d('物料品类'),
        // },
        // {
        //   name: 'uomName',
        //   label: intl.get('smpc.product.model.uom').d('单位'),
        //   labelMinWidth: 24,
        // },
      ],
      record.toData()
    );
  };

  rendererPriceInfo = ({ record }) => {
    // 价格，显示保留小数点2-10位小数
    const toFixedPrice = (price = '') => {
      if (price === null || price === '' || isNaN(price)) {
        return '';
      } else {
        const value = price.toString();
        const ind = value.indexOf('.');
        const precision = ind === -1 ? 0 : Math.abs(value.length - ind);
        if (precision > 2) {
          return math.round(price * 10000000000) / 10000000000;
        } else {
          return math.toFixed(price, 2);
        }
      }
    };
    const ladderPriceColumns = () => [
      {
        name: 'lineNum',
        width: 90,
      },
      {
        name: 'ladderFrom',
        width: 120,
      },
      {
        name: 'ladderTo',
        width: 120,
      },
      {
        name: 'taxPrice',
        width: 90,
        renderer: ({ value }) => toFixedPrice(value),
      },
      {
        name: 'unitPrice',
        width: 90,
        align: 'right',
        renderer: ({ value }) => toFixedPrice(value),
      },
    ];
    const ladderPriceDs = (dataSource = []) => ({
      primaryKey: 'ladderId',
      paging: false,
      selection: false,
      fields: [
        {
          label: intl.get('smpc.product.model.lineNumber').d('行号'),
          name: 'lineNum',
          type: 'number',
        },
        {
          label: intl.get('smpc.product.model.numberFrom').d('数量从(>=)'),
          name: 'ladderFrom',
          type: 'number',
        },
        {
          label: intl.get('smpc.product.model.numberTo').d('数量至(<)'),
          name: 'ladderTo',
          type: 'number',
        },
        {
          label: intl.get('smpc.product.model.taxPrice').d('含税单价'),
          name: 'taxPrice',
          type: 'number',
        },
        {
          label: intl.get('smpc.product.model.netPrice').d('不含税单价'),
          name: 'unitPrice',
          type: 'number',
        },
      ],
      data: dataSource,
    });
    const { priceType, taxPrice, ladderPriceDTOS: priceList = [], keyList = [] } = record.toData();
    const content = (
      <Table dataSet={new DataSet(ladderPriceDs(priceList || []))} columns={ladderPriceColumns()} />
    );
    return listCellRender(
      [
        {
          name: 'agreementPrice',
          label: intl.get('smpc.product.model.taxPrice').d('含税单价'),
          labelMinWidth: 36,
          render: (_, contentClass) => {
            return priceType === 'LADDER_PRICE' ? (
              <RightOver
                width={600}
                content={content}
                title={intl.get('smpc.product.model.ladderPrice').d('阶梯价格')}
              >
                {intl.get('smpc.product.button.lookLadderPrice').d('查看阶梯价')}
              </RightOver>
            ) : (
              <span title={toFixedPrice(taxPrice)} className={contentClass}>
                {toFixedPrice(taxPrice)}
              </span>
            );
          },
        },
        {
          name: 'taxRate',
          label: intl.get('smpc.product.model.taxRate').d('税率'),
          labelMinWidth: 24,
          color: (keyList || []).includes('taxRate') ? '#fca000' : false,
          // getVal: val => (val ? Math.floor(val) : '-'),
        },
        {
          name: 'currencyName',
          label: intl.get('smpc.product.model.currency').d('币种'),
          labelMinWidth: 24,
          color: (keyList || []).includes('taxRate') ? '#fca000' : false,
        },
        {
          name: 'priceTypeMeaning',
          label: intl.get('smpc.product.model.priceType').d('价格类型'),
        },
      ],
      record.toData()
    );
  };

  @Bind()
  handleEditDetail(record) {
    const { isApprove, history } = this.props;
    const key = isApprove ? 'b' : 'a';
    const { skuTemporaryId, approvalFrom } = record.toData();
    history.push({
      pathname: `/s2-mall/product/product-approve/detail`,
      search: qs.stringify({
        skuTemporaryId,
        anchor: 'APPROVE',
        btnFlag: isApprove ? 'n' : 'y',
        compareFlag: key === 'a' && approvalFrom === 'UPDATE',
        backPath: `/s2-mall/product/product-approve/list?key=${key}`,
      }),
    });
  }

  @Bind()
  async handleApprove(approvalFlag = 1) {
    const { tableDs } = this.props;
    const rows = tableDs.selected.map((record) => record.toData());
    const result = getResponse(
      approveOrReject({
        skuApproveDTOS: rows,
        approvalFlag,
      })
    );
    if (result) {
      tableDs.query();
    }
  }

  @Bind()
  async handleOk(remark) {
    const { tableDs } = this.props;
    this.handleCancel();
    const rows = tableDs.selected.map((record) => record.toData());
    const result = getResponse(
      approveOrReject({
        skuApproveDTOS: rows,
        approvalFlag: 0,
        remark,
      })
    );
    if (result) {
      tableDs.query();
    }
  }

  @Bind()
  handleCancel() {
    this.setState({ visible: false });
  }

  @Bind()
  handleReject() {
    this.setState({ visible: true });
  }

  @Bind()
  expandedRowRenderer() {
    return (
      <span style={{ display: 'none' }}>
        {/* 组织编码:{record.get('unitCode')} 组织名称:{record.get('unitName')} */}
      </span>
    );
  }

  @Bind()
  expandIcon({ prefixCls, expanded, expandable, record, onExpand }) {
    const { waiting } = this.props;
    const approvalFrom = record.get('approvalFrom');
    const iconPrefixCls = `${prefixCls}-expand-icon`;
    const classString = classNames(iconPrefixCls, {
      [`${iconPrefixCls}-expanded`]: expanded,
    });
    if (waiting && !record.get('parentId') && approvalFrom === 'UPDATE') {
      if (record.getState('loading') === true) {
        // 自定义状态渲染
        return <Spin delay={200} size="small" />;
      }

      return (
        <Icon
          type="baseline-arrow_right"
          className={classString}
          onClick={onExpand}
          tabIndex={expandable ? 0 : -1}
        />
      );
    }

    if (record.get('parentId')) {
      return <span className={classString} />;
    }
  }

  // 点击展开子节点
  @Bind()
  async handleExpand(expanded, record) {
    const params = record.toData();
    const { tableDs } = this.props;
    const approvalFrom = record.get('approvalFrom');
    if (expanded && !record.children && approvalFrom === 'UPDATE' && !record.get('parentId')) {
      record.setState('loading', true);
      const result = getResponse(await fetchLastProduct(params));
      if (result) {
        const data = tableDs.toData();
        const parentId = record.get('skuTemporaryId');
        // 获取子结点数据，绑定父节点
        const recordsChildren = {
          ...result,
          parentId,
          skuTemporaryId: `${record.get('skuTemporaryId')}-old`,
        };
        const remianData = data.map((i) =>
          i.skuTemporaryId === parentId ? { ...i, keyList: result.keyList } : i
        );
        // this.setState({ expand: true });
        record.setState('loading', false);
        // 生成完成的dataSet数据注意会触发load event
        tableDs.loadData([...remianData, recordsChildren]);
      }
    }
  }

  render() {
    const { isApprove = false, tableDs } = this.props;
    const { visible, expand } = this.state;

    const modalProps = {
      visible,
      onOk: this.handleOk,
      onCancel: this.handleCancel,
    };

    const ExcelExportBtn = observer(({ dataSet }) => {
      const params =
        (dataSet.queryDataSet.current && dataSet.queryDataSet.current.toJSONData()) || {};
      return (
        <ExcelExport
          requestUrl={`${SRM_MALL}/v1/${organizationId}/agreement-details/export`}
          queryParams={{
            tenantId: organizationId,
            detailQueryFlag: 1,
            ...filterNullValueObject(params),
          }}
        />
      );
    });

    const buttons = [
      observer(() => (
        <Button
          funcType="flat"
          color="primary"
          icon="arrow_drop_down"
          onClick={() => {
            if (this.tableRef) this.tableRef.tableStore.expandAll();
          }}
        >
          {intl.get('smpc.product.model.expandHistoryVersion').d('展开历史版本')}
        </Button>
      )),
      observer(() => {
        return (
          <Button
            funcType="flat"
            color="primary"
            icon="arrow_drop_up"
            onClick={() => {
              if (this.tableRef) this.tableRef.tableStore.collapseAll();
            }}
          >
            {intl.get('smpc.product.model.collapseHistoryVersion').d('收起历史版本')}
          </Button>
        );
      }),
      observer(({ dataSet }) => (
        <Button
          disabled={dataSet.selected.length === 0}
          funcType="flat"
          color="primary"
          icon="cancel"
          onClick={() => this.handleReject()}
        >
          {intl.get('smpc.productApprove.model.approveReject').d('审批拒绝')}
        </Button>
      )),
      observer(({ dataSet }) => (
        <Button
          funcType="flat"
          color="primary"
          icon="open_in_browser"
          disabled={dataSet.selected.length === 0}
          onClick={() => this.handleApprove(1)}
        >
          {intl.get('smpc.productApprove.model.approveAndShelf').d('审批通过并上架')}
        </Button>
      )),
      observer(({ dataSet }) => (
        <Button
          funcType="flat"
          color="primary"
          icon="check_circle"
          disabled={dataSet.selected.length === 0}
          onClick={() => this.handleApprove(2)}
        >
          {intl.get('smpc.productApprove.model.approveSuccess').d('审批通过')}
        </Button>
      )),
    ];
    const hookButtons = buttons.map((HookButton) => <HookButton dataSet={tableDs} />);
    return (
      <React.Fragment>
        {!isApprove && expand && (
          <p className={style['change-tips']}>
            <Icon type="info" />
            <span>
              {intl
                .get('smpc.product.view.getChangesFromHistoryVersion')
                .d('黄色高亮表示对比历史版本有更改的部分')}
            </span>
            <Icon type="cancel" onClick={() => this.setState({ expand: false })} />
          </p>
        )}
        <Table
          dataSet={tableDs}
          ref={(ref) => {
            this.tableRef = ref;
          }}
          buttons={!isApprove ? [<ExcelExportBtn dataSet={tableDs} />, ...hookButtons] : []}
          columns={this.getColumns()}
          className={style['product-approve-container']}
          queryFieldsLimit={3}
          queryBar="normal"
          mode="tree"
          onExpand={this.handleExpand}
          expandIcon={this.expandIcon}
          rowHeight="auto"
          expandedRowRenderer={this.expandedRowRenderer}
        />
        <ReasonModal {...modalProps} />
      </React.Fragment>
    );
  }
}

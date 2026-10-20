import React, { Component } from 'react';
import { DataSet, Table, Button, Form, TextField, Lov, Select } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import request from 'utils/request';
import notification from 'utils/notification';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import c7nModal from '@/utils/c7nModal';
import { openSkuEdit, openSkuDetail } from '@/utils/openCommonTab';
import { fetchSkuIntroTemplate } from '@/services/api';

import style from './index.less';

const organizationId = getCurrentOrganizationId();

const ModalTable = (props) => {
  const { width, ...otherProps } = props;
  const [update, setUpdate] = React.useState();
  const tableRef = React.useRef();
  React.useEffect(() => {
    setUpdate('update');
  }, []);
  React.useEffect(() => {
    if (width) {
      tableRef.current.tableStore.width = width;
    }
  }, [update]);
  return <Table {...otherProps} style={{ width }} ref={tableRef} />;
};

const formDs = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'skuName',
      label: intl.get('small.common.model.productName').d('商品名称'),
      type: 'string',
    },
    {
      name: 'categoryLov',
      type: 'object',
      label: intl.get('small.common.model.platformCategory').d('平台分类'),
      lovCode: 'SMPC.CATEGORY',
      valueField: 'categoryId',
      textField: 'categoryCodeName',
      lovPara: { tenantId: organizationId },
    },
    {
      name: 'categoryId',
      bind: 'categoryLov.categoryId',
    },
  ],
});

const tableDs = (url, initParams, isCheckBox = 'true') => ({
  selection: isCheckBox ? 'multiple' : false,
  autoQuery: false,
  fields: [
    { name: 'skuCode', label: intl.get('small.common.model.productNum').d('商品编码') },
    { name: 'skuName', label: intl.get('small.common.model.productName').d('商品名称') },
    { name: 'uomName', label: intl.get('small.common.model.uom').d('单位') },
    { name: 'categoryName', label: intl.get('small.common.model.platformCategory').d('平台分类') },
    { name: 'option', label: intl.get('hzero.common.action').d('操作') },
  ],
  transport: {
    read({ data }) {
      const { filterParams = {} } = data;
      const _url = url.replace('{organizationId}', `${organizationId}`);
      return {
        url: `/sagm/${_url}`,
        method: 'GET',
        data: { ...filterParams, ...initParams },
      };
    },
  },
});

const itemFormDs = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'templateId',
      label: intl.get('small.common.model.productIntroTemp').d('商品介绍模板'),
      textField: 'templateName',
      valueField: 'templateId',
    },
    {
      name: 'categoryLov',
      label: intl.get('small.common.model.platformCategory').d('平台分类'),
      required: true,
      type: 'object',
      lovCode: 'SMPC.CATEGORY',
      valueField: 'categoryId',
      textField: 'categoryName',
      lovPara: { supplierTenantId: organizationId },
    },
    {
      name: 'cid',
      bind: 'categoryLov.categoryId',
    },
  ],
});

const commonService = (url, options = {}, serviceName = '/sagm') => {
  const _url = url.replace('{organizationId}', `${organizationId}`);
  return request(`${serviceName}/${_url}`, options);
};
export default class Transfer extends Component {
  constructor(props) {
    super(props);
    const {
      leftInfo: { url: leftUrl, params: leftParams = {} } = {},
      rightInfo: { url: rightUrl, params: rightParams = {} } = {},
      readOnly = false,
    } = props;
    this.skuSourceDs = new DataSet(tableDs(leftUrl, leftParams));
    this.skuAssignDs = new DataSet(tableDs(rightUrl, rightParams, !readOnly));
    this.formDs = new DataSet(formDs());
    this.itemFormDs = new DataSet(itemFormDs());
  }

  state = {
    joinLoading: false,
    delLoading: false,
    createLoading: false,
    templates: [],
  };

  componentDidMount() {
    const { readOnly = false } = this.props;

    this.fetchData();
    if (!readOnly) {
      this.fetchTemplate();
    }
  }

  fetchData = () => {
    const { readOnly } = this.props;
    const formRecord = this.formDs.current;
    const { skuName, categoryId } = formRecord ? formRecord.toData() : {};

    const filterParams = { skuName, categoryId };

    // 只查询右边
    if (readOnly) {
      this.skuAssignDs.setQueryParameter('filterParams', filterParams);
      this.skuAssignDs.query();
    } else {
      this.skuSourceDs.setQueryParameter('filterParams', filterParams);
      this.skuSourceDs.query();
      this.skuAssignDs.setQueryParameter('filterParams', filterParams);
      this.skuAssignDs.query();
    }
  };

  handleViewSku = (record) => {
    const { modal, backPath, isSup = false } = this.props;
    const type = isSup ? 'sup' : 'pur';
    openSkuDetail({
      type,
      backPath,
      recordData: record,
    });
    modal.close();
  };

  handleEditSku = (record, agreementLineId) => {
    const { modal, push, isSup = false, backPath } = this.props;
    const { spuId } = record;
    const type = isSup ? 'sup' : 'pur';
    const submitBack = agreementLineId ? 'y' : 'n';
    openSkuEdit(
      {
        type,
        spuId,
        backPath,
        submitBack,
      },
      push
    );
    modal.close();
  };

  handleJoin = async () => {
    const { joinUrl, afterJoin = (e) => e } = this.props;
    const list = this.skuSourceDs.selected.map((record) => record.toData());

    this.setState({ joinLoading: true });
    const res = await commonService(joinUrl, { method: 'POST', body: list });
    this.setState({ joinLoading: false });
    const result = getResponse(res);
    if (result) {
      notification.success();
      this.skuSourceDs.query();
      this.skuAssignDs.query();
      afterJoin(result);
    }
  };

  handleDelete = async () => {
    const { deleteUrl, afterDelete = (e) => e } = this.props;
    const list = this.skuAssignDs.selected.map((record) => record.toData());

    this.setState({ delLoading: true });
    const res = await commonService(deleteUrl, { method: 'DELETE', body: list });
    this.setState({ delLoading: false });
    const result = getResponse(res);
    if (result) {
      notification.success();
      this.skuSourceDs.query();
      this.skuAssignDs.query();
      afterDelete(result);
    }
  };

  fetchCategory = async (catalogId = '') => {
    if (!catalogId) return false;
    const res = await commonService(
      `v1/{organizationId}/catalog-mappings/catalog-ref-categories/${catalogId}`,
      {
        method: 'GET',
      },
      '/smpc'
    );
    const result = getResponse(res);
    if (result && result[0]) {
      const category = result[0];
      const itemRecord = this.itemFormDs.current;
      itemRecord.set('categoryLov', { ...category, name: category.categoryName });
    }
  };

  fetchTemplate = async () => {
    const res = await fetchSkuIntroTemplate();
    const result = getResponse(res);
    if (result) {
      this.setState({ templates: result.content || [] }, () => {
        if (this.itemModal) {
          this.itemModal.update({
            children: this.renderItemModalChildren(),
          });
        }
      });
    }
  };

  renderItemModalChildren = () => {
    const { templates = [] } = this.state;
    const defaultTemp = templates.find((f) => f.defaultFlag === 1) || {};
    this.itemFormDs.current.set('templateId', defaultTemp.templateId);
    return (
      <Form dataSet={this.itemFormDs} column={1}>
        <Select name="templateId">
          {templates.map((m) => (
            <Select.Option key={m.templateId} value={m.templateId}>
              {m.templateName}
            </Select.Option>
          ))}
        </Select>
        <Lov name="categoryLov" />
      </Form>
    );
  };

  itemModal;

  handleCreateByItem = () => {
    const {
      agreementLine,
      agreementLine: { catalogId, agreementLineId } = {},
      isCreateGo = false,
      afterJoin = (e) => e,
    } = this.props;
    const { templates = [] } = this.state;
    this.fetchCategory(catalogId);
    this.itemModal = c7nModal({
      drawer: false,
      title: intl.get('small.common.model.createProduct').d('创建商品'),
      onOk: async () => {
        const flag = await this.itemFormDs.validate();
        if (flag) {
          const { cid, templateId } = this.itemFormDs.current.toData();
          const { content } = templates.find((f) => f.templateId === templateId) || {};
          const params = {
            details: content,
            agreementLineList: [agreementLine],
          };
          this.setState({ createLoading: true });
          const res = await commonService(
            `v1/{organizationId}/agreement-lines/batch-create-skus/${cid}`,
            {
              method: 'POST',
              body: params,
              headers: {
                's-request-web': 'srm_web',
              },
            }
          );
          const result = getResponse(res);
          this.setState({ createLoading: false });
          if (result) {
            notification.success();
            if (isCreateGo) {
              const { spuId, spuCode, tenantId: supplierTenantId, skuList = [] } = result[0] || {};
              const { skuId, code: skuCode } = skuList[0] || {};
              this.handleEditSku(
                { spuId, spuCode, supplierTenantId, skuId, skuCode },
                agreementLineId
              );
            }
            afterJoin(result);
            return true;
          }
        } else {
          return false;
        }
      },
      okProps: { loading: this.state.createLoading },
      children: this.renderItemModalChildren(),
      afterClose: () => this.itemFormDs.reset(),
    });
  };

  render() {
    const {
      readOnly,
      isSup = false,
      isCanEdit = true,
      agreementLine: { itemName, agreementLineId } = {},
      skuApprove = true,
      isHistory,
    } = this.props;
    const { joinLoading, delLoading } = this.state;
    const JoinButton = observer(({ dataSet }) => (
      <Button
        disabled={dataSet.selected.length === 0}
        loading={joinLoading}
        style={{ marginBottom: 8 }}
        onClick={this.handleJoin}
      >
        {intl.get('small.common.model.join').d('加入')}&gt;
      </Button>
    ));

    const DelButton = observer(({ dataSet }) => (
      <Button
        disabled={dataSet.selected.length === 0}
        onClick={this.handleDelete}
        loading={delLoading}
        style={{ marginLeft: 0 }}
      >
        &lt;
        {intl.get('hzero.common.button.delete').d('删除')}
      </Button>
    ));

    const columns = [
      { name: 'skuCode', width: 150 },
      { name: 'skuName', minWidth: 200 },
      // { name: 'uomName', width: 100 },
      { name: 'categoryName', width: 150 },
      {
        name: 'option',
        width: 150,
        renderer: ({ record }) => {
          const _record = record.toData();
          const { purchaseTenantId } = _record;
          return (
            <span className="action-link">
              <a onClick={() => this.handleViewSku(_record)}>
                {intl.get('small.common.model.look').d('查看')}
              </a>
              {!isHistory &&
                isCanEdit &&
                (purchaseTenantId === organizationId || isSup) &&
                skuApprove && (
                  <a
                    onClick={() =>
                      this.handleEditSku(
                        _record,
                        _record.agreementDetailId ? agreementLineId : null
                      )
                    }
                  >
                    {intl.get('hzero.common.model.edit').d('编辑')}
                  </a>
                )}
            </span>
          );
        },
      },
    ];

    return (
      <div className={style['transfer-wrapper']}>
        {skuApprove && !readOnly && (
          <div className="create-skus">
            <span className="item-label">{intl.get('small.common.model.item').d('物料')}：</span>
            <p className="item-name" title={itemName}>
              {itemName}
            </p>
            <Button onClick={this.handleCreateByItem}>
              {intl.get('small.common.model.createBasedOnItem').d('基于物料创建商品')}
            </Button>
          </div>
        )}
        <Form dataSet={this.formDs} columns={3}>
          <TextField name="skuName" />
          <Lov name="categoryLov" />
          <div className="search-btns">
            <Button style={{ marginRight: '8px' }} onClick={() => this.formDs.reset()}>
              {intl.get('hzero.common.button.reset').d('重置')}
            </Button>
            <Button color="primary" onClick={() => this.fetchData()}>
              {intl.get('hzero.common.button.search').d('查询')}
            </Button>
          </div>
        </Form>
        {readOnly || !skuApprove ? (
          <Table dataSet={this.skuAssignDs} columns={columns} />
        ) : (
          <div className="sku-tables">
            <div className="left-table">
              <p>{intl.get('small.common.model.productInventory').d('商品库')}</p>
              <ModalTable width={450} dataSet={this.skuSourceDs} columns={columns} />
            </div>
            <div className="transfer-btns">
              <JoinButton dataSet={this.skuSourceDs} />
              <DelButton dataSet={this.skuAssignDs} />
            </div>
            <div className="right-table">
              <p>{intl.get('small.common.model.exitProducts').d('已添加商品')}</p>
              <ModalTable width={450} dataSet={this.skuAssignDs} columns={columns} />
            </div>
          </div>
        )}
      </div>
    );
  }
}

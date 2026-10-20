import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  DataSet,
  Form,
  Table,
  Button,
  TextField,
  Lov,
  Modal,
  Select,
  Row,
  Col,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { SRM_SAGM } from '_utils/config';
import { openSkuEdit, openSkuDetail } from '@/utils/openCommonTab';
import { fetchSkuIntroTemplate } from '@/services/api';
import { openCategory } from '@/routes/pageTree';
import {
  fetchCategory,
  agmLineAddSku,
  agmLineDelSku,
  agmLineUpdateSku,
  agmLineCreateSku,
} from '../api';
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
  return (
    <Table
      {...otherProps}
      style={{ width }}
      ref={tableRef}
      pagination={{ showQuickJumper: false }}
    />
  );
};

const OkButton = observer(({ dataSet, onClick }) => (
  <Button onClick={onClick} color="primary" disabled={dataSet.selected.length === 0}>
    {intl.get('hzero.common.button.ok').d('确定')}
  </Button>
));

const JoinButton = observer(({ dataSet, onClick }) => (
  <Button onClick={onClick} style={{ marginBottom: 8 }} disabled={dataSet.selected.length === 0}>
    {intl.get('small.common.model.join').d('加入')}&gt;
  </Button>
));

const DelButton = observer(({ dataSet, onClick }) => (
  <Button onClick={onClick} style={{ marginLeft: 0 }} disabled={dataSet.selected.length === 0}>
    &lt;
    {intl.get('hzero.common.button.delete').d('删除')}
  </Button>
));

const formDs = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'skuName',
      label: intl.get('small.common.model.product').d('商品'),
      type: 'string',
    },
    {
      name: 'categoryLov',
      type: 'object',
      label: intl.get('small.common.model.platformCategory').d('平台分类'),
      lovCode: 'SMPC.CATEGORY',
      valueField: 'categoryId',
      textField: 'categoryName',
      lovPara: { tenantId: organizationId },
    },
    {
      name: 'categoryId',
      bind: 'categoryLov.categoryId',
    },
  ],
});

const tableDs = ({ url, selection, params = {} }) => ({
  selection,
  autoQuery: false,
  fields: [
    { name: 'skuCode', label: intl.get('small.common.model.productNum').d('商品编码') },
    { name: 'skuName', label: intl.get('small.common.model.productName').d('商品名称') },
    { name: 'categoryName', label: intl.get('small.common.model.platformCategory').d('平台分类') },
    { name: 'option', label: intl.get('hzero.common.action').d('操作') },
  ],
  transport: {
    read({ data }) {
      const { filterParams = {} } = data;
      const _url = url.replace('{organizationId}', `${organizationId}`);
      return {
        url: `${SRM_SAGM}/${_url}`,
        method: 'GET',
        data: { ...filterParams, ...params },
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
      // lovCode: 'SMPC.CATEGORY',
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

export default function SkuTransfer(props) {
  const {
    mode,
    modal,
    isSup,
    agmLine,
    backPath,
    versionNum,
    isCreateGo,
    skuApprove,
    afterRequest = (e) => e, // 加入｜删除｜替换
  } = props;
  const itemModal = useRef();
  const [templates, setTemplates] = useState([]);
  const readOnly = mode === 'read' || !skuApprove;
  const { itemName, catalogId, agreementLineId, supplierTenantId } = agmLine || {};

  const dsMap = useMemo(() => {
    // multiple
    const selection = readOnly ? false : 'multiple';
    const leftTableDs = new DataSet(
      tableDs({
        selection,
        params: { agreementLineId, supplierTenantId },
        url: `v1/{organizationId}/agreement-details/${agreementLineId}/off-line`,
      })
    );
    const rightTableDs = new DataSet(
      tableDs({
        selection,
        params: { versionNum, agreementLineId },
        url: versionNum
          ? `v1/{organizationId}/agreement-detail-hiss/${agreementLineId}`
          : `v1/{organizationId}/agreement-details/${agreementLineId}`,
      })
    );
    // 初始化
    if (mode === 'read') {
      rightTableDs.query();
    } else if (['add', 'update'].includes(mode)) {
      leftTableDs.query();
    } else {
      leftTableDs.query();
      rightTableDs.query();
    }
    return {
      queryDs: new DataSet(formDs()),
      itemDs: new DataSet(itemFormDs()),
      leftTableDs,
      rightTableDs,
    };
  }, []);

  useEffect(() => {
    if (!readOnly) fetchTemplate();
    if (['add', 'update'].includes(mode)) {
      modal.update({
        footer: (_, cancelBtn) => [
          <OkButton
            dataSet={dsMap.leftTableDs}
            onClick={mode === 'add' ? handleAdd : handleUpdate}
          />,
          cancelBtn,
        ],
      });
    }
  }, [dsMap]);

  async function fetchList() {
    const { queryDs, leftTableDs, rightTableDs } = dsMap;
    const { skuName, categoryId } = queryDs.current.get(['skuName', 'categoryId']);
    leftTableDs.setQueryParameter('filterParams', { skuName, categoryId });
    rightTableDs.setQueryParameter('filterParams', { skuName, categoryId });
    // 初始化
    if (mode === 'read') {
      await rightTableDs.query();
    } else if (['add', 'update'].includes(mode)) {
      await leftTableDs.query();
    } else {
      await leftTableDs.query();
      await rightTableDs.query();
    }
  }

  // 增加
  async function handleAdd() {
    const { leftTableDs } = dsMap;
    leftTableDs.status = 'submitting';
    const params = {
      agreementLineId,
      skuList: leftTableDs.selected.map((m) => m.toData()),
    };
    const res = getResponse(await agmLineAddSku(params));
    leftTableDs.status = 'ready';
    if (res) {
      notification.success();
      afterRequest();
      if (mode === 'add') {
        modal.close();
      } else {
        fetchList();
      }
    }
  }

  // 替换
  async function handleUpdate() {
    const { leftTableDs } = dsMap;
    leftTableDs.status = 'submitting';
    const params = {
      ...agmLine,
      skuIds: leftTableDs.selected.map((m) => m.get('skuId')),
    };
    const res = getResponse(await agmLineUpdateSku(params));
    leftTableDs.status = 'ready';
    if (res) {
      notification.success();
      modal.close();
      afterRequest();
    }
  }

  // 删除
  async function handleDelete() {
    const { rightTableDs } = dsMap;
    rightTableDs.status = 'submitting';
    const params = rightTableDs.selected.map((m) => m.toData());
    const res = getResponse(await agmLineDelSku(params));
    rightTableDs.status = 'ready';
    if (res) {
      notification.success();
      fetchList();
      afterRequest();
    }
  }

  // 查看商品
  function handleViewSku(record) {
    const type = isSup ? 'sup' : 'pur';
    openSkuDetail({
      type,
      backPath,
      recordData: record,
    });
  }

  // 编辑商品
  function handleEditSku(record, flag) {
    const { spuId } = record;
    const type = isSup ? 'sup' : 'pur';
    const submitBack = flag ? 'y' : 'n';
    openSkuEdit({
      type,
      spuId,
      backPath,
      submitBack,
    });
  }

  async function fetchTemplate() {
    const res = await fetchSkuIntroTemplate();
    const result = getResponse(res);
    if (result) {
      setTemplates(result.content || []);
      if (itemModal.current) {
        itemModal.current.update({
          children: renderItemModalChildren(result.content),
        });
      }
    }
  }

  function renderItemModalChildren(tmps) {
    const defaultTemp = (tmps || templates).find((f) => f.defaultFlag === 1) || {};
    dsMap.itemDs.current.set('templateId', defaultTemp.templateId);
    return (
      <Form dataSet={dsMap.itemDs} column={1} labelLayout="float">
        <Select name="templateId">
          {templates.map((m) => (
            <Select.Option key={m.templateId} value={m.templateId}>
              {m.templateName}
            </Select.Option>
          ))}
        </Select>
        <Lov
          name="categoryLov"
          onClick={() => openCategory({ name: 'categoryLov', record: dsMap.itemDs.current })}
        />
      </Form>
    );
  }

  async function fetchCategoryByCatalog() {
    if (!catalogId) return false;
    const res = await fetchCategory(catalogId);
    const result = getResponse(res);
    if (result && result[0]) {
      const category = result[0];
      const itemRecord = dsMap.itemDs.current;
      itemRecord.set('categoryLov', { ...category, name: category.categoryName });
    }
  }

  function handleCreateByItem() {
    fetchCategoryByCatalog();
    const { itemDs } = dsMap;
    itemModal.current = Modal.open({
      drawer: true,
      title: intl.get('small.common.model.createProduct').d('创建商品'),
      style: { width: 380 },
      onOk: async () => {
        const flag = await itemDs.validate();
        if (flag) {
          const { cid, templateId } = itemDs.current.toData();
          const { content } = templates.find((f) => f.templateId === templateId) || {};
          const agreementSkuDTO = {
            details: content,
            agreementLineList: [agmLine],
          };
          const res = await agmLineCreateSku({ cid, agreementSkuDTO });
          const result = getResponse(res);
          if (result) {
            notification.success();
            if (isCreateGo) {
              const { spuId } = result[0] || {};
              handleEditSku({ spuId }, agreementLineId);
            }
            afterRequest(result);
            return true;
          }
        } else {
          return false;
        }
      },
      children: renderItemModalChildren(),
      afterClose: () => itemDs.reset(),
    });
  }

  const columns = [
    { name: 'skuCode', width: 150 },
    { name: 'skuName', minWidth: 200 },
    { name: 'categoryName', width: 150 },
    {
      name: 'option',
      width: 150,
      renderer: ({ record }) => {
        const _record = record.toData();
        const { purchaseTenantId } = _record;
        // 不可编辑 1 权限 2 供应商历史版本 3 采方不属于自己创建的商品
        const supHis = versionNum && isSup;
        const purCreate = isSup || purchaseTenantId === organizationId;
        return (
          <span className="action-link">
            <a onClick={() => handleViewSku(_record)}>
              {intl.get('small.common.model.look').d('查看')}
            </a>
            {!supHis && purCreate && skuApprove && (
              <a onClick={() => handleEditSku(_record, _record.agreementDetailId)}>
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
      {mode === 'default' && !readOnly && (
        <div className="create-skus">
          <span className="item-label">{intl.get('small.common.model.item').d('物料')}：</span>
          <p className="item-name" title={itemName}>
            {itemName}
          </p>
          <Button onClick={handleCreateByItem}>
            {intl.get('small.common.model.createBasedOnItem').d('基于物料创建商品')}
          </Button>
        </div>
      )}
      <Row>
        <Col span={18}>
          <Form dataSet={dsMap.queryDs} columns={2}>
            <TextField name="skuName" />
            <Lov name="categoryLov" />
          </Form>
        </Col>
        <Col span={6} className="search-btns">
          <Button style={{ marginRight: '8px' }} onClick={() => dsMap.queryDs.reset()}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
          <Button color="primary" onClick={fetchList}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
        </Col>
      </Row>
      {mode !== 'default' ? (
        <Table
          dataSet={mode === 'read' ? dsMap.rightTableDs : dsMap.leftTableDs}
          columns={columns}
        />
      ) : (
        <div className="sku-tables">
          <div className="left-table">
            <p>{intl.get('small.common.model.productInventory').d('商品库')}</p>
            <ModalTable width={460} dataSet={dsMap.leftTableDs} columns={columns} />
          </div>
          <div className="transfer-btns">
            <JoinButton dataSet={dsMap.leftTableDs} onClick={handleAdd} />
            <DelButton dataSet={dsMap.rightTableDs} onClick={handleDelete} />
          </div>
          <div className="right-table">
            <p>{intl.get('small.common.model.exitProducts').d('已添加商品')}</p>
            <ModalTable width={460} dataSet={dsMap.rightTableDs} columns={columns} />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * PortalCard - 门户卡片管理
 * @date: 2021-06-08
 * @author: Danica <ke.wang01@gonig-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { useCallback, useMemo } from 'react';
import {
  Button,
  DataSet,
  CheckBox,
  Form,
  Modal,
  Select,
  NumberField,
  Table,
  TextField,
  IntlField,
} from 'choerodon-ui/pro';
import { Header, Content } from 'components/Page';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import getCardDs from './store/cardDs';
import getCardDistributeDs from './store/cardDistributeDs';
import '../PortalManage/index.less';

function PortalCard() {
  const cardDsObject = useMemo(() => new DataSet(getCardDs()), []);
  const cardDistributeDsObject = useMemo(() => new DataSet(getCardDistributeDs()), []);
  /**
   * 启动或禁用
   * @param {Boolean} value
   */
  const renderStatus = useCallback(({ value }) => {
    return (
      <div className={value === 1 ? 'tag tag-enable' : 'tag tag-disable'}>
        {value === 1
          ? intl.get(`hzero.common.status.enable`).d('启用')
          : intl.get('hzero.common.status.disable').d('禁用')}
      </div>
    );
  }, []);

  /**
   * 操作按钮
   * @param {record} 行信息
   */
  const renderOpr = useCallback(({ record }) => {
    return (
      <span className="action-link">
        <a onClick={() => openCardModal(record)}>{intl.get('hzero.common.model.edit').d('编辑')}</a>
        {record.get('cardType') === 1 && !record.get('cardLevel') && (
          <a
            onClick={() => {
              openCardAssignModal(record);
            }}
          >
            {intl.get('hptl.portalAssign.view.option.cardAssign').d('分配卡片')}
          </a>
        )}
      </span>
    );
  }, []);

  /**
   * 添加分配
   */
  const handleAdd = (cardId) => {
    const record = cardDistributeDsObject.create();
    record.set('cardId', cardId);
    record.setState('editing', true);
  };

  /**
   * 打开弹窗-卡片
   * @param {record} 行信息
   */
  const openCardModal = (record) => {
    Modal.open({
      title: intl.get('hptl.portalAssign.view.title.card.edit').d('编辑卡片'),
      key: Modal.key(),
      drawer: true,
      style: {
        width: 380,
      },
      children: (
        <Form record={record} labelLayout="float" columns={2}>
          <TextField name="cardCode" colSpan={2} />
          <IntlField name="cardName" colSpan={2} />
          <IntlField name="description" colSpan={2} />
          <Select name="cardTypeObject" colSpan={2} />
          <NumberField name="defaultWidth" min={2} />
          <NumberField name="defaultHeigth" min={2} />
          <CheckBox name="enabledFlag" colSpan={2} />
          <CheckBox name="cardLevel" colSpan={2} />
        </Form>
      ),
      onOk: async () => {
        const validate = await record.validate();
        if (!validate) return false;
        const res = await cardDsObject.submit();
        if (res) {
          cardDsObject.query(cardDsObject.currentPage);
        }
      },
    });
  };

  /**
   * 打开弹窗-分配
   * @param {record} 行信息
   */
  const openCardAssignModal = (record) => {
    const tenantId = record.get('tenantId');
    const cardCode = record.get('cardCode');
    const cardId = record.get('cardId');
    const enabledFlag = record.get('enabledFlag');
    cardDistributeDsObject.getField('tenantNumObject').setLovPara('id', tenantId);
    cardDistributeDsObject.setQueryParameter('cardCode', cardCode);
    cardDistributeDsObject.query();
    const btns =
      enabledFlag === 1
        ? [
            <Button icon="playlist_add" onClick={() => handleAdd(cardId)} key="add">
              {intl.get('hzero.common.button.increase').d('新增')}
            </Button>,
            'delete',
          ]
        : [];
    Modal.open({
      title: intl.get('hptl.portalAssign.view.option.cardAssign').d('分配卡片'),
      key: Modal.key(),
      drawer: true,
      style: {
        width: 882,
      },
      children: (
        <Table
          dataSet={cardDistributeDsObject}
          buttons={btns}
          editMode="cell"
          autoFocus
          className="portal-card-assign"
        >
          <Table.Column name="tenantNumObject" editor />
          <Table.Column name="tenantName" />
          <Table.Column name="creationDate" />
        </Table>
      ),
      onOk: async () => {
        cardDistributeDsObject.submit();
      },
    });
  };

  // 列表信息
  const columns = useMemo(() => {
    return [
      { name: 'cardCode', width: 160, tooltip: 'overflow' },
      { name: 'cardName', tooltip: 'overflow' },
      { name: 'description', width: 320, tooltip: 'overflow' },
      { name: 'cardTypeMeaning', width: 110 },
      { name: 'defaultHeigth', width: 70 },
      { name: 'defaultWidth', width: 70 },
      { name: 'enabledFlag', width: 100, renderer: renderStatus },
      { name: 'action', width: 130, renderer: renderOpr, lock: 'right' },
    ];
  }, []);

  return (
    <>
      <Header title={intl.get('hptl.portalAssign.view.title.cardList').d('门户卡片管理')} />
      <Content>
        <SearchBarTable
          searchCode="PORTAL.LAYOUT_CARD.SEARCH_BAR" // 筛选器个性化单元编码
          selectionMode="none"
          columns={columns}
          dataSet={cardDsObject}
          cacheState
        />
      </Content>
    </>
  );
}

export default formatterCollections({
  code: ['hzero.common', 'hptl.portalAssign'],
})(PortalCard);

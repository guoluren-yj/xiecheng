import React, { Fragment, useState, useMemo } from 'react';
import classNames from 'classnames';
import {
  DataSet,
  Table,
  Form,
  TextField,
  Select,
  NumberField,
  Switch,
  IntlField,
  Modal,
  Icon,
  Button as PButton,
  Lov,
} from 'choerodon-ui/pro';
import { toJS } from 'mobx';
import { Tag, Tooltip, Button, Spin } from 'choerodon-ui';
import { isEmpty, omit } from 'lodash';
import { observer } from 'mobx-react-lite';

import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { enableRender } from 'utils/renderer';
import withProps from 'utils/withProps';
import notification from 'utils/notification';

import { saveRulesCategoryData } from '@/services/rulesDefinitionCategoryService';
import MultRichText from './MultRichText';

import { getTableDs, getFormDs, getBlackListDs } from './stores/ruleCategory';
import styles from './index.less';

const organizationId = getCurrentOrganizationId();
const RulesCategoryType = {
  ROOT: 'root',
  DIR: 'dir',
  MENU: 'menu',
};

function RulesDefinitionCategory(props) {
  const { tableDs, formDs, blackListDs } = props;
  let editModal = useMemo(() => null, []);
  let editBlackListModal = useMemo(() => null, []);
  let newBlackListModal = useMemo(() => null, []);
  const [loading, changeLoading] = useState(false);

  const columns = [
    {
      name: 'name',
      renderer: ({ value, record }) => (
        <Tooltip
          placement="bottom"
          title={
            record.get('plainTextDescription')?.length > 100
              ? record
                  .get('plainTextDescription')
                  ?.slice(0, 100)
                  .concat('...')
              : record.get('plainTextDescription') || ''
          }
        >
          {value}
        </Tooltip>
      ),
    },
    { name: 'code', width: 200 },
    { name: 'sort', width: 80 },
    {
      name: 'type',
      width: 100,
      renderer: ({ value }) =>
        value === RulesCategoryType.ROOT ? (
          <Tag color="#108ee9">{intl.get('spfm.rulesCategory.view.message.root').d('根')}</Tag>
        ) : value === RulesCategoryType.DIR ? (
          <Tag color="#87d068">
            {intl.get('spfm.rulesCategory.view.message.category').d('分类')}
          </Tag>
        ) : (
          <Tag color="#f50">{intl.get('spfm.rulesCategory.view.message.service').d('服务')}</Tag>
        ),
    },
    {
      name: 'enabledFlag',
      width: 100,
      align: 'center',
      renderer: ({ value }) => enableRender(value),
    },
    {
      header: intl.get('hzero.common.button.action').d('操作'),
      width: 250,
      lock: 'right',
      renderer: ({ record }) => {
        const { type, children } = record.get(['type', 'children']);
        return (
          <div className={styles.opration}>
            <a onClick={() => openEditModal(record, 'edit')}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
            {type !== RulesCategoryType.MENU && (
              <Fragment>
                <a onClick={() => openEditModal(record, 'createDir')}>
                  {intl.get('spfm.rulesCategory.view.button.createCategory').d('创建分类')}
                </a>
                <a onClick={() => openEditModal(record, 'createMenu')}>
                  {intl.get('spfm.rulesCategory.view.button.createService').d('创建服务')}
                </a>
              </Fragment>
            )}
            {isEmpty(children) && (
              <>
                <a onClick={() => handleDelete(record)}>
                  {intl.get('hzero.common.button.delete').d('删除')}
                </a>
                <a onClick={() => editBlackList(record)}>
                  {record.get('visibleMode') && record.get('visibleMode') === 'WHITE'
                    ? intl.get('spfm.rulesCategory.view.button.tenantWhiteList').d('租户白名单')
                    : intl.get('spfm.rulesCategory.view.button.tenantBlackList').d('租户黑名单')}
                </a>
              </>
            )}
          </div>
        );
      },
    },
  ];

  const handleSave = editType => {
    const formData = formDs.toData();
    formDs.validate().then(result => {
      if (result) {
        let saveData = formData[0] || {};
        if (!isThirdDir(saveData, editType)) {
          saveData = omit(saveData, ['menuList']);
        }
        changeLoading(true);
        saveRulesCategoryData({
          ...saveData,
          editType,
        }).then(res => {
          changeLoading(false);
          if (res && !res.failed) {
            notification.success();
            closeModal();
            tableDs.query(tableDs.currentPage);
          } else {
            notification.error({ message: res.message });
          }
        });
      }
    });
  };

  // 删除
  const handleDelete = record => {
    // eslint-disable-next-line
    record.status = 'delete';
    tableDs.delete(record).then(() => {
      tableDs.query(tableDs.currentPage);
    });
  };

  const closeModal = () => {
    formDs.reset();
    editModal.close();
  };

  const isThirdDir = (record = {}, type) => {
    return (
      (type === 'edit' &&
        record.type === 'dir' &&
        record.levelPath &&
        record.levelPath.split('|').length === 3) ||
      (type === 'createDir' && record.levelPath && record.levelPath.split('|').length === 2)
    );
  };

  const closeBlackListModal = () => {
    blackListDs.reset();
    editBlackListModal.close();
  };

  const closeNewModal = addRecord => {
    blackListDs.remove(addRecord);
    newBlackListModal.close();
  };

  const addTrueTableRecord = record => {
    const addRecord = blackListDs.create({}, 0);
    addRecord.set('code', record.get('code'));
    addRecord.set('tenantId', organizationId);
    addRecord.set('codeMeaning', record.get('name'));
    newBlackListModal = Modal.open({
      title: intl.get('hzero.common.button.create').d('新建'),
      closable: true,
      onCancel: () => closeNewModal(addRecord),
      children: (
        <Form record={addRecord}>
          <TextField name="tenantNum" disabled />
          <Lov name="tenantObj" />
        </Form>
      ),
      footer: (
        <>
          <Button
            funcType="raised"
            type="primary"
            loading={loading}
            onClick={() => submitBlackList()}
          >
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>
          <Button funcType="raised" disabled={loading} onClick={() => closeNewModal(addRecord)}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </>
      ),
    });
  };

  const submitBlackList = () => {
    blackListDs.validate().then(async () => {
      const res = await blackListDs.submit();
      if (getResponse(res)) {
        newBlackListModal.close();
        return true;
      } else {
        return false;
      }
    });
  };

  // 租户黑名单
  const editBlackList = record => {
    blackListDs.setQueryParameter('code', record.get('code'));
    blackListDs.query();
    const button = [
      <PButton icon="playlist_add" onClick={() => addTrueTableRecord(record)} key="add">
        {intl.get('hzero.common.button.create').d('新建')}
      </PButton>,
      'delete',
    ];
    editBlackListModal = Modal.open({
      title:
        record.get('visibleMode') === 'BLACK'
          ? intl.get('spfm.rulesCategory.view.button.tenantBlackList').d('租户黑名单')
          : intl.get('spfm.rulesCategory.view.button.tenantWhiteList').d('租户白名单'),
      width: 500,
      drawer: true,
      closable: true,
      onCancel: closeBlackListModal,
      children: (
        <div style={{ height: 600 }}>
          <Table
            dataSet={blackListDs}
            buttons={button}
            pagination={{
              hideOnSinglePage: true,
            }}
            border="true"
          >
            <Table.Column name="tenantNum" />
            <Table.Column name="tenantObj" width={220} />
          </Table>
        </div>
      ),
      footer: (
        <>
          <Button
            funcType="raised"
            type="primary"
            loading={loading}
            onClick={() => closeBlackListModal()}
          >
            {intl.get('hzero.common.status.closed').d('关闭')}
          </Button>
        </>
      ),
    });
  };

  const openEditModal = (record, type) => {
    const editData = record.toData() || {};
    if (type === 'edit') {
      formDs.loadData([editData]);
      blackListDs.reset();
      blackListDs.setQueryParameter('code', editData.code);
      blackListDs.query();
    } else {
      formDs.loadData([]);
      formDs.create({
        parentId: editData.id,
        type: type === 'createDir' ? 'dir' : 'menu',
      });
    }
    // formDs.current.status = 'sync';
    editModal = Modal.open({
      title:
        type === 'edit'
          ? intl.get('hzero.common.button.edit').d('编辑')
          : type === 'createDir'
          ? intl.get('spfm.rulesCategory.view.button.createCategory').d('创建分类')
          : intl.get('spfm.rulesCategory.view.button.createService').d('创建服务'),
      width: 500,
      drawer: true,
      closable: true,
      onCancel: closeModal,
      children: renderForm(type, isThirdDir(editData, type)),
      footer: (
        <>
          <Button
            funcType="raised"
            type="primary"
            loading={loading}
            onClick={() => handleSave(type)}
          >
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>
          <Button funcType="raised" disabled={loading} onClick={closeModal}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </>
      ),
    });
  };

  const DefaultValue = observer(prop => {
    return (
      <Select {...prop} disabled={blackListDs?.records.length}>
        <Select.Option value="WHITE">
          {intl.get('spfm.rulesCategory.view.button.tenantWhiteList').d('租户白名单')}
        </Select.Option>
        <Select.Option value="BLACK">
          {intl.get('spfm.rulesCategory.view.button.tenantBlackList').d('租户黑名单')}
        </Select.Option>
      </Select>
    );
  });

  const renderForm = type => {
    return (
      <Spin spinning={loading}>
        <Form dataSet={formDs}>
          <TextField name="code" disabled={type === 'edit'} restrict="a-zA-Z0-9-_." />
          <IntlField name="name" />
          <MultRichText name="description" dataSet={formDs} />
          <Select name="type" disabled>
            {type === 'edit' && (
              <Select.Option value="root">
                {intl.get('spfm.rulesCategory.view.message.root').d('根')}
              </Select.Option>
            )}
            <Select.Option value="dir">
              {intl.get('spfm.rulesCategory.view.message.category').d('分类')}
            </Select.Option>
            <Select.Option value="menu">
              {intl.get('spfm.rulesCategory.view.message.service').d('服务')}
            </Select.Option>
          </Select>
          {type === 'createMenu' && (
            <Select name="visibleMode">
              <Select.Option value="WHITE">
                {intl.get('spfm.rulesCategory.view.button.tenantWhiteList').d('租户白名单')}
              </Select.Option>
              <Select.Option value="BLACK">
                {intl.get('spfm.rulesCategory.view.button.tenantBlackList').d('租户黑名单')}
              </Select.Option>
            </Select>
          )}
          {type === 'edit' && isEmpty(formDs.current.get('children')) && (
            <DefaultValue name="visibleMode" />
          )}
          <NumberField name="sort" />
          {/* {lovFlag && <Lov name="menuList" />} */}
          <Switch name="enabledFlag" />
        </Form>
      </Spin>
    );
  };

  const expandIcon = ({ prefixCls, expanded, expandable, record, onExpand }) => {
    const children = toJS(record.get('children'));
    if (isEmpty(children)) {
      // 子结点渲染
      return <span style={{ paddingLeft: '0.18rem' }} />;
    }

    const iconPrefixCls = `${prefixCls}-expand-icon`;
    const clsName = classNames(iconPrefixCls, {
      [`${iconPrefixCls}-expanded`]: expanded,
    });
    return (
      <Icon
        type="baseline-arrow_right"
        className={clsName}
        onClick={onExpand}
        tabIndex={expandable ? 0 : -1}
      />
    );
  };

  const handleExpand = (expanded, record) => {
    const currentData = record.toData() || {};
    const allData = tableDs.toData() || [];
    const thisId = record.get('id'); // 当前节点主键id
    let hasLoadChildren;
    if (currentData && currentData.children) {
      // 过滤数据-已经遍历过的子节点，不再二次遍历
      hasLoadChildren = allData.find(item => item.parentId === thisId);
      if (!hasLoadChildren) {
        if (expanded) {
          // 获取对应子节点的数据
          currentData.children.forEach(item => {
            // eslint-disable-next-line
            tableDs.create({
              ...item,
              parentUnitId: thisId,
            });
          });
        }
      }
    }
  };

  return (
    <Fragment>
      <Header title={intl.get('spfm.rulesCategory.view.title.header').d('业务规则分类')} />
      <Content>
        <Table
          queryFields={{
            code: <TextField restrict="a-zA-Z0-9-_." />,
          }}
          // buttons={['expandAll', 'collapseAll']}
          defaultRowExpanded
          mode="tree"
          dataSet={tableDs}
          columns={columns}
          expandIcon={expandIcon}
          expandedRowRenderer={() => <span />}
          onExpand={handleExpand}
          className={styles['list-table']}
        />
      </Content>
    </Fragment>
  );
}

export default formatterCollections({
  code: ['spfm.rulesCategory', 'hzero.common', 'hzero.c7nProUI'],
})(
  withProps(
    () => {
      const tableDs = new DataSet(getTableDs()); // 服务规则 ds
      const formDs = new DataSet(getFormDs());
      const blackListDs = new DataSet(getBlackListDs());
      return { tableDs, formDs, blackListDs };
    },
    { cacheState: true }
  )(RulesDefinitionCategory)
);

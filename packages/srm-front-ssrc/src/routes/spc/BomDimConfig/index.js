import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { compose, isEmpty, noop } from 'lodash';
import { useDataSet, Button, Dropdown, Menu, Icon, Spin } from 'choerodon-ui/pro';
import qs from 'querystring';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import DynamicButtons from '_components/DynamicButtons';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import SearchBarTable from '_components/SearchBarTable';
import { checkPermission } from 'services/api';

import { enabled, release, editNew, deleteRecord } from '@/services/bomDimConfigService';
import MutlTextFieldSearch from '@/routes/ssrc/components/MutlTextFieldSearch';

import { StatusRender, ActionRender, disabledRelease } from '@/routes/spc/FormulaManage/utils';
import { renderHistoryVersion } from './utils';
import { tableDS } from './listDS';
import styles from './index.less';

const { Item } = Menu;

const BomDimConfig = (props) => {
  const { history, customizeTable } = props;
  const tableDs = useDataSet(() => tableDS(), []);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPermission();
  }, []);

  // const loading = (key, value) => {
  //   setLoadings({ ...loadings, [key]: value });
  // };

  // 获取按钮权限
  const fetchPermission = () => {
    // 请求权限
    const permissionList = [
      'srm.pc-admin.pc-purchaser.workspace2.ps.submit.button', // 提交
      'srm.pc-admin.pc-purchaser.workspace2.ps.delete.button', // 删除
      'srm.pc-admin.pc-purchaser.workspace2.ps.contract-copy', // 复制
      'srm.pc-admin.pc-purchaser.workspace2.button.seal', // 用章
      'srm.pc-admin.pc-purchaser.workspace2.ps.back.button', // 退回
      'srm.pc-admin.pc-purchaser.chapter.button.back.supplier.button', // 退回至供应商
      'srm.pc-admin.pc-purchaser.workspace2.ps.ps.change', // 变更
      'srm.pc-admin.pc-purchaser.workspace2.ps.stop.button', // 终止
      'srm.pc-admin.pc-purchaser.workspace2.ps.archive.contract', // 归档
      'srm.pc-admin.pc-purchaser.workspace2.ps.invalid.button', // 作废
      'srm.pc-admin.pc-purchaser.workspace2.ps.reference.button', // 引用单据创建
      'srm.pc-admin.pc-purchaser.workspace2.ps.create.button', // 手工创建
      'srm.pc-admin.pc-purchaser.workspace2.ps.pcheader.import', // 批量导入
      'srm.pc-admin.pc-purchaser.workspace2.button.pcheader.import.new', // 新批量导入
    ];
    checkPermission(permissionList).then((res) => {
      if (getResponse(res)) {
        setPermissions(res);
      }
    });
  };

  // 跳转历史版本
  const handleViewHistory = (item) => {
    history.push({
      pathname: `/spc/bom-dim-config/history/${item.bomTemplateId}`,
      search: qs.stringify({
        sourceType: 'listPage',
      }),
    });
  };

  // 启用禁用
  const handleEnable = async (record) => {
    setLoading(true);
    const res = await enabled(record.toData());
    setLoading(false);
    if (getResponse(res)) {
      notification.success();
      tableDs.query();
    }
  };

  const handleDelete = async (record) => {
    setLoading(true);
    const res = await deleteRecord([record.toData()]);
    setLoading(false);
    if (getResponse(res)) {
      notification.success();
      tableDs.query();
    }
  };

  // 新建
  const handleCreate = () => {
    history.push({
      pathname: `/spc/bom-dim-config/create`,
    });
  };

  // 发布
  const handleRelease = async (record) => {
    const releaseFunc = async (showLoading) => {
      if (showLoading) setLoading(showLoading);
      const res = await release([record.toData()]);
      setLoading(false);
      if (getResponse(res)) {
        notification.success();
        tableDs.query();
      }
    };
    if (record.get('parentStatus') === 'DISABLE') {
      // 有弹窗，不需要Loading,
      disabledRelease(() => releaseFunc(false));
      return;
    }
    await releaseFunc(true);
  };

  // 编辑
  const handleEdit = async (record) => {
    let bomTemplateId = record.get('bomTemplateId');
    // 状态已发布、禁用，生成新版本
    if (['DISABLE', 'RELEASED'].includes(record.get('bomTemplateStatus'))) {
      setLoading(true);
      const res = await editNew(record.toData());
      setLoading(false);
      if (!getResponse(res)) return;
      notification.success();
      // eslint-disable-next-line prefer-destructuring
      bomTemplateId = res?.bomTemplateId;
    }
    history.push({
      pathname: `/spc/bom-dim-config/detail/${bomTemplateId}`,
    });
  };

  // 明细页
  const handleGotoDetail = (record, type = 'view') => {
    history.push({
      pathname: `/spc/bom-dim-config/${type}/${record.get('bomTemplateId')}`,
    });
  };

  const allActionList = [
    {
      key: 'Enabled',
      code: 'srm.pc-admin.pc-purchaser.workspace2.button.seal',
      title: intl.get(`hzero.common.model.status.enable`).d('启用'),
      onClick: handleEnable,
    },
    {
      key: 'Disabled',
      code: 'srm.pc-admin.pc-purchaser.workspace2.button.seal',
      title: intl.get('hzero.common.model.status.disabled').d('禁用'),
      onClick: handleEnable,
    },
    {
      key: 'Delete',
      code: 'srm.pc-admin.pc-purchaser.workspace2.button.seal',
      title: intl.get('hzero.common.button.delete').d('删除'),
      onClick: handleDelete,
    },
    {
      key: 'Edit',
      code: 'srm.pc-admin.pc-purchaser.workspace2.button.seal',
      title: intl.get(`hzero.common.view.button.edit`).d('编辑'),
      isHidden: (record) => record.get('bomTemplateLatestFlag') === 'Y',
      onClick: handleEdit,
    },
    {
      key: 'Release',
      code: 'srm.pc-admin.pc-purchaser.workspace2.button.seal',
      title: intl.get('hzero.common.button.release').d('发布'),
      onClick: handleRelease,
    },
    {
      key: 'HistoryVersion',
      code: 'srm.pc-admin.pc-purchaser.workspace2.button.seal',
      title: intl.get('hzero.common.button.History').d('历史版本'),
    },
  ];

  const getOverlay = (items = []) => {
    return isEmpty(items) ? (
      false
    ) : (
      <Menu>
        {items.map((i) => (
          <Item className={styles['more-option']} key={i.key}>
            {i}
          </Item>
        ))}
      </Menu>
    );
  };

  const getButton = (key, record) => {
    const action = allActionList.find((item) => item.key === key);
    if (!action) {
      return {};
    }
    const { title, onClick = noop, isHidden = () => false } = action;
    return {
      ...action,
      button: isHidden(record) ? (
        false
      ) : key !== 'HistoryVersion' ? (
        <Button
          key={key}
          type="c7n-pro"
          funcType="link"
          color="primary"
          // disabled={disabled(record)}
          onClick={() => onClick(record)}
        >
          {title}
        </Button>
      ) : (
        <Dropdown
          overlay={() => renderHistoryVersion(record.get('versionList'), handleViewHistory)}
          trigger={['hover']}
          placement="bottomLeft"
        >
          <Button funcType="link">
            {intl.get('ssrc.inquiryHall.view.inquiryHall.historyMode').d('历史版本')}
            <Icon type="expand_more" style={{ marginTop: '-1px' }} />
          </Button>
        </Dropdown>
      ),
    };
  };

  const getActionList = (bomTemplateStatus) => {
    const baseActionList = ['Edit'];
    const actionStatusMap = {
      DISABLE: ['Enabled', 'Edit'],
      PENDING: [...baseActionList, 'Release'],
      RELEASED: [...baseActionList, 'Disabled'],
      DELETE: [],
    };
    return actionStatusMap[bomTemplateStatus] || baseActionList;
  };

  // 渲染操作列
  const renderAction = (record) => {
    const bomTemplateStatus = record.get('bomTemplateStatus');
    const actionList = getActionList(bomTemplateStatus);
    // 存在历史版本
    if (!isEmpty(record.get('versionList'))) {
      actionList.push('HistoryVersion');
    }

    if (bomTemplateStatus === 'PENDING' && record.get('bomTemplateVersion') === 1) {
      actionList.push('Delete');
    }

    const permissionButtonList = actionList
      .filter((i) => {
        const currenPer = permissions.find((n) => n.code === i.code);
        return currenPer?.approve || true;
      })
      .map((action) => getButton(action, record)?.button)
      .filter((btn) => btn);

    const moreActionList = permissionButtonList.filter((_, index) => ![0, 1].includes(index));
    const overlay = getOverlay(moreActionList);
    const moreAction =
      moreActionList.length > 1 ? (
        <Dropdown overlay={overlay} trigger={['hover']}>
          <Button type="c7n-pro" funcType="link" color="primary" className={styles['more-action']}>
            {intl.get('spc.inquiryHall.model.inquiryHall.moreAction').d('更多')}
            <Icon type="expand_more" />
          </Button>
        </Dropdown>
      ) : (
        moreActionList[0]
      );
    return [permissionButtonList[0], permissionButtonList[1], moreAction];
  };

  const columns = useMemo(
    () => [
      {
        headerStyle: { paddingLeft: '36px' },
        style: { paddingLeft: 0 },
        name: 'bomTemplateStatus',
        width: 150,
        renderer: ({ value, record }) => {
          return StatusRender(value, record.get('bomTemplateStatusMeaning'));
        },
      },
      {
        name: 'action',
        width: 200,
        renderer: ({ record }) => {
          return ActionRender(renderAction(record));
        },
      },
      {
        name: 'bomTemplateCode',
        width: 180,
        renderer: ({ record, value }) => <a onClick={() => handleGotoDetail(record)}>{value}</a>,
      },
      {
        name: 'bomTemplateName',
        width: 200,
      },
      {
        name: 'bomTemplateVersion',
        width: 120,
      },
      {
        name: 'creationDate',
        width: 150,
      },
      {
        name: 'createdBy',
        width: 150,
        renderer: ({ record }) => record.get('createdName'),
      },
    ],
    []
  );

  const getButtons = useCallback(() => {
    return [
      {
        name: 'create',
        group: true,
        child: () => (
          <Button color="primary" icon="add" onClick={handleCreate}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        ),
      },
    ];
  }, []);

  const handleChange = (ds, value) => {
    const searchValue = value
      ? value.map((ele) => ele.trim().replace(/\s+/g, ',')).join(',')
      : undefined;
    tableDs.setQueryParameter('codeOrName', searchValue);
  };

  // 左边多选框渲染
  const leftInput = (ds) => {
    return (
      <MutlTextFieldSearch
        searchBarDS={ds}
        name="codeOrName"
        placeholder={intl
          .get('spc.bomDimConfig.view.message.inputMultiTemplateNumOrTitle')
          .d('请输入结构编码、名称查询')}
        onChange={handleChange}
      />
    );
  };

  const clearQueryParameter = () => {
    tableDs.setQueryParameter('codeOrName', '');
  };

  return (
    <React.Fragment>
      <Header title={intl.get('spc.bomDimConfig.view.title.bomDimConfig').d('BOM结构配置管理')}>
        <DynamicButtons buttons={getButtons()} />
      </Header>
      <Content>
        <Spin spinning={loading}>
          {customizeTable(
            { code: 'SPC.PRICE_BOM_DIM_CONFIG.LIST.ALL_TABLE' },
            <SearchBarTable
              cacheState
              dataSet={tableDs}
              columns={columns}
              style={{ maxHeight: 'calc(100vh - 190px)' }}
              searchBarConfig={{
                checkDataSetStatus: false, // 解决操作行展开收起后点击查询，出现【当前操作将会清空变更过的数据，是否继续？】弹框提示
                fieldProps: {
                  codeOrName: {
                    multiple: ',',
                  },
                },
                left: {
                  render: (_, ds) => leftInput(ds),
                },
                onReset: clearQueryParameter,
                onClear: clearQueryParameter,
              }}
              searchCode="SPC.PRICE_BOM_DIM_CONFIG.LIST.FILTER"
              mode="tree"
            />
          )}
        </Spin>
      </Content>
    </React.Fragment>
  );
};

export default compose(
  WithCustomizeC7N({
    unitCode: ['SPC.PRICE_BOM_DIM_CONFIG.LIST.ALL_TABLE', 'SPC.PRICE_BOM_DIM_CONFIG.LIST.FILTER'],
  }),
  formatterCollections({
    code: [
      'spc.bomDimConfig',
      'hzero.common',
      'entity.roles',
      'hzero.c7nProUI',
      'ssrc.inquiryHall',
      'spc.formulaManage',
      'spc.bomViewWorkbench',
    ],
  })
)(BomDimConfig);

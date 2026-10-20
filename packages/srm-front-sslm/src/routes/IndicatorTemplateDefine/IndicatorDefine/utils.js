/*
 * @Date: 2023-10-13 14:22:32
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { DataSet, Modal, Menu } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import ManualCreate from './ManualCreate';
import FooterBtn from './ManualCreate/FooterBtn';
import { getCreateIndicatorDs } from '../stores/getCreateIndicatorDS';
import { getFormulaConfigDS, getOptionsConfigDS } from '../stores/getIndicatorConfigDS';

// 新建指标下拉菜单
export const renderAddMenus = () => {
  return (
    <Menu style={{ minWidth: 120 }}>
      <Menu.Item key="manualCreate">
        {intl.get('sslm.common.view.createType.manual').d('手工新建')}
      </Menu.Item>
      <Menu.Item key="referenceIndicator">
        {intl.get('sslm.common.view.createType.referenceIndicator').d('引用平台指标')}
      </Menu.Item>
    </Menu>
  );
};

// 手工新建/编辑指标
export const handleManualCreate = (indicatorListDs, type, record, updateToTemplate, remote) => {
  const isEdit = type !== 'VIEW';
  const remoteRef = {}; // 二开新增页签的ref
  const { indicatorId, indicatorName } = record?.get(['indicatorId', 'indicatorName']) || {};
  const formDsProps = getCreateIndicatorDs({ isEdit });
  const remoteFormDsProps = remote
    ? remote.process('SSLM_INDICATOR_TEMPLATE_DEFINE_LIST_MANUAL_FORM_PROPS', formDsProps, {
        isEdit,
      })
    : formDsProps;
  const indicatorFormDs = new DataSet(remoteFormDsProps); // 表单信息
  const formulaConfigDs = new DataSet(getFormulaConfigDS({ indicatorId, sourceKey: 'TENANT' })); // 公式配置
  const optionsConfigDs = new DataSet(getOptionsConfigDS({ indicatorId })); // 选项配置

  switch (type) {
    case 'EDIT': // 编辑
    case 'VIEW': // 查看
      if (record) {
        indicatorFormDs.loadData([record]);
      }
      break;
    case 'CHILD': // 新建下级指标
      if (record) {
        if (indicatorFormDs.current) {
          indicatorFormDs.current.set({
            parentIndicatorId: indicatorId,
            parentIndicatorName: indicatorName,
          });
        }
      }
      break;
    default:
      break;
  }

  const titleType =
    type === 'EDIT'
      ? intl.get('hzero.common.button.edit').d('编辑')
      : type === 'VIEW'
      ? intl.get('hzero.common.button.view').d('查看')
      : intl.get('hzero.common.button.create').d('新建');

  Modal.open({
    drawer: true,
    key: Modal.key(),
    style: { width: 742 },
    className: 'manual-create-modal',
    title: intl
      .get('sslm.common.model.title.indicator', {
        name: titleType,
      })
      .d(`${titleType}指标`),
    children: (
      <ManualCreate
        type={type}
        isEdit={isEdit}
        remote={remote}
        record={record}
        remoteRef={remoteRef}
        indicatorFormDs={indicatorFormDs}
        formulaConfigDs={formulaConfigDs}
        optionsConfigDs={optionsConfigDs}
        onRef={(key, node) => {
          remoteRef[key] = node;
        }}
      />
    ),
    footer: (okBtn, cancelBtn, modal) => (
      <FooterBtn
        type={type}
        modal={modal}
        isEdit={isEdit}
        remote={remote}
        remoteRef={remoteRef}
        indicatorFormDs={indicatorFormDs}
        formulaConfigDs={formulaConfigDs}
        optionsConfigDs={optionsConfigDs}
        indicatorListDs={indicatorListDs}
        updateToTemplate={updateToTemplate}
      />
    ),
    beforeOpen: () => {
      if (record) {
        record.reset(); // 处理清空必填字段后，取消弹框，再次打开值丢失问题
      }
    },
  });
};

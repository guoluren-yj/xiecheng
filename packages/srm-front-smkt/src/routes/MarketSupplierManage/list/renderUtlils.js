import React from 'react';
// import { Button } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
// import { Button as PermissionButton } from 'components/Permission';
import LabelContainer from '@/components/LabelContainer';
import TagPro from '@/components/TagPro';
import { fetchAddSupplier, fetchDeleteSupplier } from '@/services/supplier';
import { confirm } from '@/utils/c7nModal';
import { createIntentLetter, viewIntentLetter } from '@/routes/IntentLetter';

const getManaObj = () => ({
  manufacturerFlag: intl.get('smkt.supplierManage.view.manufacturerFlag').d('制造商'),
  traderFlag: intl.get('smkt.supplierManage.view.traderFlag').d('贸易商'),
  servicerFlag: intl.get('smkt.supplierManage.view.servicerFlag').d('服务商'),
  agentFlag: intl.get('smkt.supplierManage.view.agentFlag').d('代理商'),
  integrationFlag: intl.get('smkt.supplierManage.view.integrationFlag').d('集成商'),
  contractorFlag: intl.get('smkt.supplierManage.view.contractorFlag').d('承包商'),
});

const getmanagementData = (record, name) => {
  const companyInfosVO = record?.get('companyInfosVO') || {};
  const obj = getManaObj();
  const managementList = [];
  for (const key in obj) {
    if (companyInfosVO[key]) {
      managementList.push({ [name]: obj[key] });
    }
  }
  return managementList;
};

const addSupplier = async (record, callBack) => {
  const companyName = record.get('companyName');
  confirm({
    title: intl.get('hzero.common.message.confirm.title').d('提示'),
    content: (
      <span style={{ fontSize: '12px' }}>
        {intl
          .get('smkt.supplierManage.view.confirm.addSupplier', {
            value: companyName,
          })
          .d(`确认将${companyName}添加到我的甄选供应商？`)}
      </span>
    ),
    onOk: async () => {
      const { tenantId, supplierId, supplierCode } = record.get([
        'tenantId',
        'supplierId',
        'supplierCode',
      ]);
      const params = {
        tenantId,
        supplierId,
        supplierCode,
      };
      const res = await fetchAddSupplier([params]);
      if (getResponse(res)) {
        return callBack(res);
      }
    },
  });
};

const removeSupplier = async (record, callBack) => {
  const companyName = record.get('companyName');
  confirm({
    title: intl.get('hzero.common.message.confirm.title').d('提示'),
    content: intl
      .get('smkt.supplierManage.view.confirm.removeSupplier', {
        value: companyName,
      })
      .d(`确认将${companyName}从我的甄选供应商移除？`),
    onOk: async () => {
      const res = await fetchDeleteSupplier([record.toData()]);
      if (getResponse(res)) {
        callBack(res);
      }
    },
  });
};

// 操作列
const renderOptions = ({ record }, isSrm, callBack = (e) => e) => {
  const actions = [
    {
      text: intl.get('smkt.supplierManage.view.addMyFilter').d('添加我的甄选'),
      event: () => addSupplier(record, callBack),
      show: isSrm,
    },
    {
      text: intl.get('smkt.supplierManage.view.addIntention').d('发起意向'),
      event: () => createIntentLetter({ record, onSaveSuccess: callBack }),
      show: !isSrm && !record.get('letterId'),
    },
    {
      text: intl.get('smkt.supplierManage.view.viewIntention').d('查看意向单'),
      event: () => viewIntentLetter({ record }),
      show: !isSrm && !!record.get('letterId'),
    },
    {
      text: intl.get('smkt.supplierManage.view.removeMyFilter').d('移除我的甄选'),
      event: () => removeSupplier(record, callBack),
      show: !isSrm,
    },
  ];
  return (
    <span className="action-link">
      {actions
        .filter((f) => f.show !== false)
        .map((i) => (
          <a onClick={i.event}>{i.text}</a>
        ))}
    </span>
  );
};

// const getOptions = (actions = [], maxLength = 4) => {
//   const filterActions = actions.filter((f) => {
//     const { show = true } = f;
//     return show;
//   });
//   const viewActions =
//     filterActions.length > maxLength ? filterActions.slice(0, maxLength - 1) : filterActions;
//   // 更多操作
//   // const menuActions = filterActions.slice(maxLength - 1, filterActions.length);
//   const command = viewActions.map((m) => {
//     const { text, disabled, permission = false, event = (e) => e, ...others } = m;
//     const ButtonRef = permission ? PermissionButton : Button;
//     return (
//       <ButtonRef disabled={disabled} onClick={event} funcType="link" type="c7n-pro" {...others}>
//         {text}
//       </ButtonRef>
//     );
//   });
//   // if (filterActions.length > maxLength) {
//   //   command.push(
//   //     <DropdownMenus menus={menuActions} placement="bottomLeft">
//   //       <Button funcType="link" color="primary">
//   //         {intl.get('hzero.common.button.more').d('更多')}
//   //         <Icon type="expand_more" style={{ fontSize: 14, marginLeft: 4, marginTop: -2 }} />
//   //       </Button>
//   //     </DropdownMenus>
//   //   );
//   // }
//   return command;
// };

const renderLabel = ({ record }, [name, labelName], aggregation) => {
  const values = (record.toData() || {})[name] || [];
  return values.length === 0 ? (
    '-'
  ) : (
    <LabelContainer
      labels={values}
      aggregation={aggregation}
      limitLine={3}
      labelWidth="auto"
      name={labelName}
    />
  );
};

const rendermanagementList = ({ record }, aggregation) => {
  const values = getmanagementData(record, 'manageName');
  return values.length === 0 ? (
    '-'
  ) : (
    <LabelContainer
      labels={values}
      aggregation={aggregation}
      limitLine={3}
      labelWidth="auto"
      name="manageName"
    />
  );
};

const statusRenderer = ({ value, record }) => {
  const { letterStatus, letterStatusMeaning, initiationFlagMeaning } = record.get([
    'letterStatus',
    'letterStatusMeaning',
    'initiationFlagMeaning',
  ]);
  const letterColorMap = {
    PENDING: 'default',
    APPROVE: 'success',
    REJECT: 'invalid',
  };
  const color = [1, 2].includes(value) ? 'success' : [0, 3].includes(value) ? 'invalid' : 'default';
  return (
    <TagPro color={letterColorMap[letterStatus] || color}>
      {letterStatusMeaning || initiationFlagMeaning}
    </TagPro>
  );
};

const initialRenderer = (value) => {
  return value === 0 ? (
    <Tag color="#00000014" style={{ color: '#000000d9' }}>
      {intl.get('smkt.supplierManage.view.initial').d('未邀约')}
    </Tag>
  ) : (
    <Tag color="#ebf7f1" style={{ color: '#47b883' }}>
      {intl.get('smkt.supplierManage.view.initialed').d('已邀约')}
    </Tag>
  );
};

export {
  renderOptions,
  renderLabel,
  statusRenderer,
  rendermanagementList,
  getmanagementData,
  initialRenderer,
};

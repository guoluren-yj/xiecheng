import React from 'react';
import { Tag } from 'choerodon-ui';
import { Modal, Form, TextField, IntlField, Lov } from 'choerodon-ui/pro';
import { isUndefined } from 'lodash';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';

import ExportBtn from '@/routes/spc/components/OperationRecord/ExportBtn';
import QuotationOperation from './QuotationOperation';
import ExpirationWarning from './ExpirationWarning';
import ViewConfig from './ViewConfig';

// 渲染状态列
const StatusRender = (status, statusMeaning) => {
  let color = 'green';
  let meaning = '';
  switch (status) {
    case 'HANDLING':
    case 'PENDING':
      color = 'yellow';
      break;
    case 'ERROR':
    case 'DISABLE':
    case 0:
      color = 'red';
      meaning = intl.get('hzero.common.status.disable').d('禁用');
      break;
    case 1:
      meaning = intl.get('hzero.common.status.enable').d('启用');
      break;
    default:
      break;
  }
  return (
    (statusMeaning || meaning) && (
      <Tag color={color} style={{ border: 'none' }}>
        {statusMeaning || meaning}
      </Tag>
    )
  );
};

/**
 * 展示预警弹窗
 * @param {Obejct} record - 当前行记录
 */
const handleShowWarningModal = (record = {}, warningDS, onOk = () => {}, viewOnly) => {
  const enabledEdit = !viewOnly && record.get('templateStatus') === 'PENDING';

  warningDS.setQueryParameter('templateId', record.toData().templateId); // 查询数据
  warningDS.query();

  Modal.open({
    key: Modal.key(),
    title: intl.get('ssrc.priceLibDimension.view.message.expirationWarning').d('到期预警'),
    drawer: true,
    style: {
      width: '742px',
    },
    children: <ExpirationWarning warningDS={warningDS} viewOnly={viewOnly} />,
    onOk: async () => {
      const flag = await warningDS.validate();
      if (flag) {
        const res = await warningDS.submit();
        if (res && !res.failed) {
          onOk();
          return true;
        } else if (isUndefined(res)) {
          // 当没有任何变更时候, 直接关闭弹窗
          return true;
        }
        return false;
      } else {
        return false;
      }
    },
    onCancel: () => warningDS.loadData([]),
    okCancel: enabledEdit,
    okText: !enabledEdit
      ? intl.get('hzero.common.button.close').d('关闭')
      : intl.get('hzero.common.button.ok').d('确定'),
  });
};

/**
 * 价格视图配置
 */
const showViewConfig = (record, viewConfigDs, onOk = () => {}, viewOnly = false) => {
  const enabledEdit = !viewOnly && record.get('templateStatus') === 'PENDING';
  // 直接修改ds的 `selection` 属性
  // 暂时未发现ds的 `set` 等API
  // eslint-disable-next-line no-param-reassign
  viewConfigDs.selection = enabledEdit ? 'multiple' : false;
  viewConfigDs.setQueryParameter('templateId', record.toData().templateId);
  viewConfigDs.query();

  const myModal = Modal.open({
    key: Modal.key(),
    style: {
      width: '1090px',
    },
    title: enabledEdit
      ? intl.get('ssrc.priceLibDimension.view.message.viewConfig').d('价格视图配置')
      : intl.get('ssrc.priceLibDimension.view.message.lookViewConfig').d('查看视图配置'),
    drawer: true,
    children: <ViewConfig tableDs={viewConfigDs} enabledEdit={enabledEdit} />,
    onOk: () => {
      if (enabledEdit && viewConfigDs.dirty) {
        Modal.confirm({
          key: Modal.key(),
          title: intl.get('ssrc.common.message.tip').d('提示'),
          children: intl
            .get('ssrc.priceLibDimension.view.message.viewCodeOkBtnWarning')
            .d(
              '一旦生成视图数据后，“视图索引”和“视图规则”将无法修改，请谨慎选择！若由于业务变更需要修改请联系管理员'
            ),
          onOk: async () => {
            if (await viewConfigDs.validate()) {
              const res = await viewConfigDs.submit();
              if (res && !res.failed) {
                onOk();
                myModal.close();
                return true;
              }
              return true;
            } else {
              return true;
            }
          },
        });
        return false;
      } else {
        viewConfigDs.loadData([]);
        return true;
      }
    },
    onCancel: () => viewConfigDs.loadData([]),
    okCancel: enabledEdit,
    okText: !enabledEdit
      ? intl.get('hzero.common.button.close').d('关闭')
      : intl.get('hzero.common.button.ok').d('确定'),
  });
};

// 需展示查询条件和导出的单据
const documentTypeList = [
  'TEMPLATE', // 价格库配置管理
  'DIMENSION', // 价格维度
];

/**
 * 操作记录
 */
const showOperation = (record, type = 'TEMPLATE') => {
  if (!record) return;
  const docId = type === 'TEMPLATE' ? record.get('templateId') : record.toData().dimensionId;
  const operationProps =
    type === 'TEMPLATE'
      ? {
          queryParams: {
            docType: 'TEMPLATE',
            docId,
          },
          operationType: intl.get('ssrc.priceLibDimension.view.message.operationType').d('模板'),
        }
      : {
          queryParams: {
            docType: 'DIMENSION',
            docId,
          },
          operationType: intl.get('ssrc.priceLibDimension.view.message.dimension').d('维度'),
        };
  const showFlag = documentTypeList.includes(type);
  let filterBarRef = null;
  Modal.open({
    drawer: true,
    key: Modal.key(),
    title: intl.get('ssrc.priceLibDimension.view.message.operateHistory').d('操作记录'),
    style: {
      width: 742,
    },
    children: (
      <QuotationOperation
        {...operationProps}
        showFlag={showFlag}
        documentId={docId}
        documentType={type}
        onRef={(ref) => {
          filterBarRef = ref;
        }}
      />
    ),
    okCancel: false,
    okText: intl.get('hzero.common.button.close').d('关闭'),
    footer: (okBtn) => (
      <div>
        {okBtn}
        <ExportBtn
          documentId={docId}
          documentType={type}
          getRef={() => filterBarRef}
          btnProps={{ hidden: !showFlag }}
        />
      </div>
    ),
  });
};

const handleGenerateMenu = (record, menuDs, onOk = () => {}) => {
  const data = record.toData();
  menuDs.loadData([
    { menuCode: data.templateCode, menuName: data.templateName, templateId: data.templateId },
  ]);

  Modal.open({
    key: Modal.key(),
    title: intl.get('ssrc.priceLibDimension.view.message.editMenu').d('编辑菜单'),
    drawer: true,
    style: {
      width: '380px',
    },
    children: (
      <Form labelLayout="float" dataSet={menuDs}>
        <TextField name="menuCode" />
        <IntlField name="menuName" />
        <Lov name="parentMenuIdLov" />
      </Form>
    ),
    onOk: async () => {
      if (await menuDs.validate()) {
        const res = await menuDs.submit();
        if (res && !res.failed) {
          onOk();
          return true;
        }
        return false;
      } else {
        return false;
      }
    },
    onCancel: () => menuDs.loadData([]),
  });
};

/**
 * 跳转价格库
 */
const jumpPriceLibrary = (record) => {
  const {
    data: { templateCode, templateName },
  } = record;
  openTab({
    key: `/ssrc/price-lib-dimension-org/preview/${templateCode}`,
    path: `/ssrc/price-lib-dimension-org/preview/${templateCode}`,
    title: `${templateName}-${intl.get('ssrc.common.view.message.tab.preview').d('预览')}`,
  });
};

/**
 * 跳转价格库
 */
const handleJumpPriceLib = (record) => {
  const {
    data: { templateCode, templateName },
  } = record;
  openTab({
    key: `/ssrc/price-library-new/${templateCode}`,
    path: `/ssrc/price-library-new/${templateCode}`,
    title: `${templateName}`,
  });
};

// 格式化数状结构数据
const formatTreeData = (data, primaryKey, statusKey) => {
  let returnData = '';
  try {
    const jsonData = JSON.parse(data);
    const content = jsonData?.content || [];
    const data2 = content.map((item) => {
      return {
        ...item,
        expand: true,
      };
    });
    const newContent = data2;
    content.forEach((item) => {
      const { childrenDTO } = item;
      if (childrenDTO) {
        const obj = {
          ...childrenDTO[0],
          parentId: item[primaryKey],
          parentStatus: item[statusKey],
          expand: true,
        };
        newContent.push(obj);
      }
    });
    jsonData.content = newContent;
    returnData = jsonData;
  } catch (error) {
    returnData = data;
  }
  return returnData;
};

export {
  StatusRender,
  handleShowWarningModal,
  showViewConfig,
  showOperation,
  handleGenerateMenu,
  jumpPriceLibrary,
  handleJumpPriceLib,
  formatTreeData,
};

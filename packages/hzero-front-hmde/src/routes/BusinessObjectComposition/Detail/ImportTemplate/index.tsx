import React, { useEffect, useRef } from 'react';
import intl from 'srm-front-boot/lib/utils/intl';
import qs from 'querystring';
import {
  getResponse,
  getCurrentOrganizationId,
  isTenantRoleLevel,
} from 'hzero-front/lib/utils/utils';
import { DataSet, Modal, Button, Tooltip } from 'choerodon-ui/pro';
import notification from 'hzero-front/lib/utils/notification';
import { ColumnAlign, ColumnLock } from 'choerodon-ui/pro/lib/table/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { TableAutoHeightType } from 'choerodon-ui/lib/table/enum';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { observer } from 'mobx-react-lite';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
// import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import {
  createImportTemplate,
  editorImportTemplate,
  deleteImportTemplate,
  exportTemplate,
  copyImportTemplate,
} from '@/services/businessObjectService';
import { OperatorRender } from '../../../../utils/render';
import ImportTemplateModal from './ImportTemplateModal';
// import { ImportTemplateDS } from '@/stores/BusinessObject/ImportTemplateDS';
import sourceStore from '../../store';

interface IProps {
  importDS: DataSet;
  setRenderTab: any;
  objectTenantId: any;
  setCurrentTenantId: any;
  setCurrentImportId: any;
  businessObjectId?: string;
  [x: string]: any;
}

const isTenant = isTenantRoleLevel();

const ImportTemplate = (props: IProps) => {
  const {
    importDS,
    businessObjectId,
    businessObjectCode,
    domainId,
    history,
    masterBusinessObjectId,
    businessObjectName,
    allowEdit,
  } = props;
  // const createDS: DataSet = useMemo(
  //   () => new DataSet(ImportTemplateDS(businessObjectId, true, businessObjectCode) as DataSetProps),
  //   [businessObjectCode]
  // );
  const { permissionFlag } = React.useContext<any>(sourceStore as any).store;

  const importTemplateRef: any = useRef();
  const domRef: any = useRef();

  useEffect(() => {
    importDS.query();
  }, []);

  const handleEditor = (record, isCopy = false) => {
    const _record = { ...record.toData() };
    Modal.open({
      title:
        isCopy
          ? intl.get('hmde.boComposition.importTemplate.button.copy').d('复制导入模板')
          : intl.get('hmde.boComposition.importTemplate.button.edit').d('导入模板编辑'),
      drawer: true,
      closable: true,
      style: { width: '380px' },
      destroyOnClose: true,
      children: (
        <ImportTemplateModal
          type="edit"
          record={_record}
          importTemplateRef={importTemplateRef}
          col={1}
          businessObjectCode={businessObjectCode}
          isCopy={isCopy}
          isTenant={isTenant}
        />
      ),
      okText: intl.get('hzero.common.button.save').d('保存'),
      onOk: async () => {
        const validate = await importTemplateRef.current?.formDs?.current?.validate();
        if (!validate) {
          return false;
        }
        const data = importTemplateRef.current?.formDs?.toData()[0];
        if (isCopy) {
          data.tenantId = getCurrentOrganizationId();
          data.templateCode = `CUS.${data.templateCode}`;
        }
        const service = isCopy ? copyImportTemplate : editorImportTemplate;
        const res = await service({
          body: { businessObjectId, ...data },
        });
        if (getResponse(res)) {
          importDS.query();
          return true;
        }
        return false;
      },
      onCancel: () => importTemplateRef.current?.formDs?.reset(),
    });
  };

  const handleCreate = () => {
    Modal.open({
      title: intl.get('hmde.boComposition.importTemplate.button.create').d('新建导入模板'),
      drawer: true,
      closable: true,
      style: { width: '380px' },
      destroyOnClose: true,
      children: (
        <ImportTemplateModal
          col={2}
          importTemplateRef={importTemplateRef}
          businessObjectCode={businessObjectCode}
          type="create"
          isTenant={isTenant}
        />
      ),
      okText: intl.get('hzero.common.button.save').d('保存'),
      onOk: async () => {
        const createFormDs = importTemplateRef.current?.formDs;
        const validate = await createFormDs?.current?.validate();
        if (validate) {
          const formValues = createFormDs?.toData()?.[0] || {};
          const { templateCode } = formValues;
          const res = await createImportTemplate({
            body: {
              businessObjectId,
              ...formValues,
              templateCode: isTenant ? `CUS.${templateCode}` : templateCode,
            },
            query: { domainId },
          });
          if (getResponse(res)) {
            // eslint-disable-next-line no-unused-expressions
            createFormDs.current?.reset();
            importDS.query();
          } else {
            return false;
          }
        } else {
          return false;
        }
      },
    });
  };

  const handleExport = (id, name) => {
    exportTemplate(id).then(res => {
      if (getResponse(res)) {
        const blob = new Blob([res]);
        const blobReader = new Response(blob).json();
        blobReader
          .then(value => {
            notification.error({
              message: intl.get('hmde.boComposition.notification.export.error').d('导出失败'),
              description: value?.message,
              placement: 'bottomRight',
            });
          })
          .catch(() => {
            const da = document.createElement('a');
            da.href = URL.createObjectURL(blob);
            da.setAttribute('download', `${name}.xlsx`);
            da.click();
            URL.revokeObjectURL(da.href);
            notification.success({
              message: intl.get('hmde.common.status.success').d('成功'),
              description: intl.get('hmde.boComposition.notification.export.success').d('导出成功'),
              placement: 'bottomRight',
            });
          });
      }
    });
  };

  const columns : ColumnProps[] = [
    {
      name: 'templateCode',
      align: ColumnAlign.left,
    },
    {
      name: 'templateName',
      align: ColumnAlign.left,
    },
    {
      name: 'templateCategory',
      align: ColumnAlign.left,
    },
    {
      name: 'importMaxSize',
      align: ColumnAlign.right,
    },
    {
      name: 'remark',
      align: ColumnAlign.left,
    },
    {
      name: 'labelCode',
    },
    {
      name: 'sceneCode',
    },
    {
      header: intl.get('hzero.common.table.column.option').d('操作'),
      align: ColumnAlign.left,
      width: 240,
      renderer: ({ record }) => {
        const operators = [
          <a onClick={() => handleEditor(record)}>
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>,
          <a
            onClick={() => {
              history.push({
                pathname: `/hmde/business-object-composition/import/field`,
                search: qs.stringify({
                  businessObjectId,
                  masterBusinessObjectId,
                  businessObjectName,
                  currentImportId: record?.get('businessObjectImportTemplateId'),
                  currentTenantId: record?.get('tenantId'),
                }),
              });
            }}
          >
            {intl.get('hmde.boComposition.importTemplate.config').d('模板配置')}
          </a>,
          <Tooltip title={intl.get('hmde.boComposition.view.message.exportTemplateTip').d('示例模板导出：预览导入模板中字段列表，该模板不能用于实际数据收集与导入，请从功能模块页面下载导入模板')}>
            <a
              onClick={() => {
                handleExport(
                  record?.get('businessObjectImportTemplateId'),
                  record?.get('templateName')
                );
              }}
            >
              {intl.get('hzero.common.button.export').d('导出')}
            </a>
          </Tooltip>,
          isTenant && (
            <Tooltip title={intl.get('hmde.boComposition.importTemplate.button.copy.tooltip').d('当模板结构保持一致，仅字段属性等存在细微差异时，推荐使用复制功能。')}>
              <a
                onClick={() => {
                  handleEditor(record, true);
                }}
              >
                {intl.get('hzero.common.button.copy').d('复制')}
              </a>
            </Tooltip>
          ),
          (isTenant || permissionFlag) && allowEdit &&
          getCurrentOrganizationId() === record?.get('tenantId') && (
            <a
              onClick={() => {
                Modal.confirm({
                  title: intl.get('hzero.common.message.confirm.title').d('提示'),
                  children: (
                    <span>
                      {intl
                        .get('hmde.boComposition.importTemplate.view.message.deleteConfirm')
                        .d('请确认是否删除该导入模板？')}
                    </span>
                  ),
                  okText: intl.get('hzero.common.button.sure').d('确定'),
                  onOk: () => {
                    deleteImportTemplate(record?.get('businessObjectImportTemplateId')).then(
                      () => {
                        importDS.query();
                      }
                    );
                  },
                });
              }}
            >
              {intl.get('hzero.common.button.delete').d('删除')}
            </a>
          ),
        ].filter(Boolean);
        return (
          <OperatorRender
            actions={operators}
            options={{
              limit: 3,
              label: intl.get('hzero.common.button.more').d('更多'),
            }}
            domRef={domRef.current}
          />
        );
      },
      lock: ColumnLock.right,
    },
  ];

  const buttons =
    (!isTenant && !permissionFlag) || !allowEdit
      ? []
      : ([
        <Button icon="playlist_add" onClick={handleCreate}>
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>,
      ] as Buttons[]);

  return (
    <div style={{ height: '100%', overflow: 'hidden', position: 'relative', zIndex: 99 }} ref={domRef}>
      <FilterBarTable
        dataSet={importDS}
        columns={columns}
        buttons={buttons}
        autoHeight={{ type: TableAutoHeightType.maxHeight, diff: -60 }}
        filterBarConfig={{
          autoQuery: false,
          collpase: true,
          collpaseble: true,
        }}
      />
    </div>
  );
};

export default formatterCollections({
  code: ['hmde.boComposition', 'hmde.common', 'hzero.common', 'hiam.tenants'],
})(observer(ImportTemplate));

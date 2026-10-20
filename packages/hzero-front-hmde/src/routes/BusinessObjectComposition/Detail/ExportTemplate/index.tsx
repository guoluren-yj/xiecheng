import React, { useEffect, useMemo, useRef } from 'react';
import { DataSet, Button, Modal } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { enableTagRender } from 'hzero-front/lib/utils/renderer';
import intl from 'srm-front-boot/lib/utils/intl';
import qs from 'querystring';
import { observer } from 'mobx-react-lite';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import { ColumnLock, ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { TableAutoHeightType } from 'choerodon-ui/lib/table/enum';
// import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import {
  getCurrentOrganizationId,
  getResponse,
  isTenantRoleLevel,
} from 'hzero-front/lib/utils/utils';
import { createTemplate, deleteTemplate, queryExportTemplateDetail } from '@/services/businessObjectService';
import ExportTemplateModal from './ExportTemplateModal';
import { OperatorRender } from '../../../../utils/render';
// import { ExportTemplateDS } from '@/stores/BusinessObject/ExportTemplateDS';
import sourceStore from '../../store';

interface IProps {
  exportDS: DataSet;
  businessObjectId: string;
  masterBusinessObjectId: string;
  objectTenantId: any;
  businessObjectName: string;
  domainId: any;
  domainCode: any;
  boCompositionDS: any;
  [x: string]: any;
}

const isTenant = isTenantRoleLevel();

const ExportTemplate = (props: IProps) => {
  const {
    exportDS,
    businessObjectId,
    history,
    masterBusinessObjectId,
    businessObjectName,
    domainId,
    businessObjectCode,
    boCompositionDS,
    businessObjectCombineId,
    allowEdit,
  } = props;
  // const createDS: DataSet = useMemo(
  //   () => new DataSet(ExportTemplateDS(true, businessObjectCode) as DataSetProps),
  //   [businessObjectCode]
  // );
  const { permissionFlag } = React.useContext<any>(sourceStore as any).store;

  const importTemplateRef: any = useRef();

  useEffect(() => {
    exportDS.setQueryParameter('businessObjectId', businessObjectId);
    exportDS.query();
  }, []);

  const handleCreate = () => {
    Modal.open({
      title: intl.get('hmde.boComposition.exportTemplate.button.create').d('新建导出模板'),
      style: { width: '380px' },
      contentStyle: { maxHeight: '100%' },
      drawer: true,
      closable: true,
      destroyOnClose: true,
      children: (
        <ExportTemplateModal
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
          const res = await createTemplate({
            body: {
              businessObjectId,
              ...formValues,
              templateCode: isTenant ? `CUS.${templateCode}` : templateCode,
            },
            query: { tenantId: getCurrentOrganizationId(), domainId },
          });
          if (getResponse(res)) {
            // eslint-disable-next-line no-unused-expressions
            createFormDs.current?.reset();
            exportDS.query();
          } else {
            return false;
          }
        } else {
          return false;
        }
      },
    });
  };
  const handleEditor = record => {
    const _record = { ...record.toData() };
    Modal.open({
      title: intl.get('hmde.boComposition.exportTemplate.button.edit').d('导出模板编辑'),
      drawer: true,
      style: { width: '380px' },
      closable: true,
      destroyOnClose: true,
      children: (
        <ExportTemplateModal
          type="edit"
          record={_record}
          importTemplateRef={importTemplateRef}
          col={1}
        />
      ),
      okText: intl.get('hzero.common.button.save').d('保存'),
      onOk: async () => {
        const validate = await importTemplateRef.current?.formDs?.current?.validate();
        if (validate) {
          const formValues = importTemplateRef.current?.formDs?.toData()?.[0] || {};
          createTemplate({
            body: {
              businessObjectId,
              ...formValues,
            },
            query: {
              tenantId: getCurrentOrganizationId(),
              domainId: boCompositionDS.current?.get('domainId'),
            },
          })
            .then(res => {
              if (getResponse(res)) {
                exportDS.query();
              }
            })
            .catch(() => importTemplateRef.current?.formDs?.reset());
        } else {
          return false;
        }
      },
      onCancel: () => importTemplateRef.current?.formDs?.reset(),
    });
  };

  const handleEnable = async(record) => {
    let data: any = {};
    if (isTenantRoleLevel()) {
      const detail = await queryExportTemplateDetail(record.get('businessObjectExportTemplateId'));
      if (getResponse(detail)) {
        data = detail;
      }
    } else {
      data = record.toData();
    }
    if (data.businessObjectExportTemplateId) {
      data.enabledFlag = !data.enabledFlag;
      createTemplate({
        body: {
          businessObjectId,
          ...data,
        },
        query: {
          tenantId: getCurrentOrganizationId(),
          domainId: boCompositionDS.current?.get('domainId'),
        },
      })
        .then(res => {
          if (getResponse(res)) {
            exportDS.query();
          }
        });
    }
  };

  const columns = useMemo((): ColumnProps[] => {
    return [
      {
        name: 'templateCode',
        align: ColumnAlign.left,
      },
      {
        name: 'templateName',
        align: ColumnAlign.left,
      },
      {
        name: 'remark',
        align: ColumnAlign.left,
      },
      {
        name: 'maxDataCount',
        align: ColumnAlign.right,
      },
      {
        name: 'exportType',
        align: ColumnAlign.left,
      },
      {
        name: 'fileType',
        align: ColumnAlign.left,
      },
      {
        name: 'maxSheetCount',
        align: ColumnAlign.right,
      },
      {
        name: 'labelCode',
      },
      {
        name: 'enabledFlag',
        align: ColumnAlign.left,
        renderer: ({ value }) => enableTagRender(value ? 1 : 0),
      },
      {
        header: intl.get('hzero.common.table.column.option').d('操作'),
        align: ColumnAlign.left,
        width: 200,
        renderer: ({ record }) => {
          const operators = [
            <a onClick={() => handleEditor(record)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>,
            <a onClick={() => handleEnable(record)}>
              {record && record.get('enabledFlag') ?
                intl.get('hzero.common.button.disable').d('禁用')
                : intl.get('hzero.common.button.enable').d('启用')}
            </a>,
            (isTenant || permissionFlag) && allowEdit &&
            getCurrentOrganizationId() === record?.get('tenantId') && (
              <a
                onClick={() => {
                  Modal.confirm({
                    title: intl.get('hzero.common.message.confirm.title').d('提示'),
                    children: (
                      <span>
                        {intl
                          .get('hmde.boComposition.exportTemplate.button.deleteConfirm')
                          .d('请确认是否删除该导出模板？')}
                      </span>
                    ),
                    okText: intl.get('hzero.common.button.sure').d('确定'),
                    onOk: () => {
                      deleteTemplate({ body: record?.toJSONData() }).then(() => {
                        exportDS.query();
                      });
                    },
                  });
                }}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </a>
            ),
            <a
              onClick={() => {
                // fieldSelect(record);
                history.push({
                  pathname: `/hmde/business-object-composition/export/field`,
                  search: qs.stringify({
                    businessObjectId,
                    masterBusinessObjectId,
                    businessObjectName,
                    boExportTplId: record?.get('businessObjectExportTemplateId'),
                    tenantId: record?.get('tenantId'),
                    businessObjectCombineId,
                  }),
                });
              }}
            >
              {intl.get('hmde.boComposition.exportTemplate.button.selectField').d('字段选择')}
            </a>,
          ].filter(Boolean);
          return (
            <OperatorRender
              actions={operators}
              options={{ limit: 3, label: intl.get('hzero.common.button.more').d('更多') }}
            />
          );
        },
        lock: ColumnLock.right,
      },
    ];
  }, []);

  const buttons =
    (!isTenant && !permissionFlag) || !allowEdit
      ? []
      : ([
        <Button icon="playlist_add" onClick={handleCreate}>
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>,
      ] as Buttons[]);

  return (
    <div style={{ height: '100%', overflow: 'hidden' }}>
      <FilterBarTable
        dataSet={exportDS}
        columns={columns}
        buttons={buttons}
        autoHeight={{ type: TableAutoHeightType.maxHeight, diff: 10 }}
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
  code: ['hmde.boComposition', 'hmde.common', 'hzero.common'],
})(observer(ExportTemplate));

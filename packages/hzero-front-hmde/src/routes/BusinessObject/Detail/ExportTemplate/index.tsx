import React, { useEffect, useMemo, useRef } from 'react';
import { DataSet, Table, Button, Modal } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { Operators } from '@/businessGlobalData/common';
import { operatorRender } from 'hzero-front/lib/utils/renderer';
import { enableRender } from '@/utils/render';
import intl from 'srm-front-boot/lib/utils/intl';
import qs from 'querystring';
import { observer } from 'mobx-react-lite';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { ColumnLock, ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
// import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getResponse, getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { createTemplate, deleteTemplate } from '@/services/businessObjectService';
import ExportTemplateModal from './ExportTemplateModal';
// import { ExportTemplateDS } from '@/stores/BusinessObject/ExportTemplateDS';

interface IProps {
  exportDS: DataSet;
  businessObjectId: string;
  objectTenantId: any;
  domainCode: string;
  businessObjectName: string;
  [x: string]: any;
}
const BoExportTemplate = (props: IProps) => {
  const {
    exportDS,
    businessObjectId,
    businessObjectName,
    history,
    domainId,
    businessObjectCode,
    allowEdit,
  } = props;
  // const createDS: DataSet = useMemo(
  //   () => new DataSet(ExportTemplateDS(true, businessObjectCode) as DataSetProps),
  //   [businessObjectCode]
  // );

  const importTemplateRef: any = useRef();

  // useEffect(() => {
  // exportDS.setQueryParameter('businessObjectId', businessObjectId);
  // exportDS.query();
  // }, []);

  const handleCreate = () => {
    Modal.open({
      title: intl.get('hmde.bo.exportTemplate.button.create').d('新建导出模板'),
      style: { width: '850px' },
      contentStyle: { maxHeight: '100%' },
      drawer: false,
      closable: true,
      destroyOnClose: true,
      children: (
        <ExportTemplateModal
          col={2}
          importTemplateRef={importTemplateRef}
          businessObjectCode={businessObjectCode}
          type="create"
        />
      ),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      onOk: async () => {
        const createFormDs = importTemplateRef.current?.formDs;
        const validate = await createFormDs?.current?.validate();
        if (validate) {
          const formValues = createFormDs?.toData()?.[0] || {};
          const res = await createTemplate({
            body: {
              businessObjectId,
              ...formValues,
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
      title: intl.get('hmde.bo.exportTemplate.button.edit').d('导出模板编辑'),
      drawer: true,
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
      okText: intl.get('hzero.common.button.sure').d('确定'),
      onOk: async () => {
        const validate = await importTemplateRef.current?.formDs?.current?.validate();
        if (validate) {
          const formValues = importTemplateRef.current?.formDs?.toData()?.[0] || {};
          createTemplate({
            body: {
              businessObjectId,
              ...formValues,
            },
            query: { tenantId: getCurrentOrganizationId(), domainId },
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
        align: ColumnAlign.left,
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
        align: ColumnAlign.left,
      },
      {
        name: 'enabledFlag',
        align: ColumnAlign.center,
        renderer: ({ value }) => enableRender(value ? 1 : 0),
      },
      {
        header: intl.get('hzero.common.table.column.option').d('操作'),
        align: ColumnAlign.left,
        width: 200,
        renderer: ({ record }) => {
          const operators: Operators = [
            // getCurrentOrganizationId() === record?.get('tenantId') && {
            //   key: 'editor',
            //   ele: (
            //     <a
            //       onClick={() => {
            //         handleEditor(record);
            //       }}
            //     >
            //       {intl.get('hzero.common.button.edit').d('编辑')}
            //     </a>
            //   ),
            //   len: 2,
            //   title: intl.get('hzero.common.button.edit').d('编辑'),
            // },
            allowEdit && getCurrentOrganizationId() === record?.get('tenantId') && {
              key: 'delete',
              ele: (
                <a
                  onClick={() => {
                    Modal.confirm({
                      children: (
                        <span>
                          {intl
                            .get('hzero.common.button.deleteConfirm')
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
              len: 2,
              title: intl.get('hzero.common.button.delete').d('删除'), // title写国际化
            },
            {
              key: 'field',
              ele: (
                <a
                  onClick={() => {
                    // fieldSelect(record);
                    history.push({
                      pathname: `/hmde/business-object/export/field`,
                      search: qs.stringify({
                        businessObjectId,
                        businessObjectName,
                        boExportTplId: record?.get('businessObjectExportTemplateId'),
                        tenantId: record?.get('tenantId'),
                        domainId,
                      }),
                    });
                  }}
                >
                  {intl.get('hmde.bo.exportTemplate.button.selectField').d('字段选择')}
                </a>
              ),
              len: 4,
              title: intl.get('hmde.bo.exportTemplate.button.selectField').d('字段选择'),
            },
          ].filter(Boolean);
          return operatorRender(operators, record, { limit: 3 });
        },
        lock: ColumnLock.right,
      },
    ];
  }, [allowEdit]);

  // const buttons = [
  //   <Button icon="add" onClick={handleCreate}>
  //     {intl.get('hzero.common.button.create').d('新建')}
  //   </Button>,
  // ] as Buttons[];

  return (
    <Table
      dataSet={exportDS}
      columns={columns}
    // buttons={buttons}
    />
  );
};

export default formatterCollections({ code: ['hmde.bo', 'hzero.common'] })(
  observer(BoExportTemplate)
);

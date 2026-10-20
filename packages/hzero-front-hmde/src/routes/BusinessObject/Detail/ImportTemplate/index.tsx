import React, { useMemo } from 'react';
import intl from 'srm-front-boot/lib/utils/intl';
import { operatorRender } from 'hzero-front/lib/utils/renderer';
import qs from 'querystring';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { DataSet, Modal, Spin } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { ColumnAlign, ColumnLock, TableAutoHeightType } from 'choerodon-ui/pro/lib/table/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { Operators } from '@/businessGlobalData/common';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
// import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import {
  deleteImportTemplate,
} from '@/services/businessObjectService';
// import { ImportTemplateDS } from '@/stores/BusinessObject/ImportTemplateDS';

interface IProps {
  importDS: DataSet;
  setRenderTab: any;
  objectTenantId: any;
  setCurrentTenantId: any;
  setCurrentImportId: any;
  businessObjectId?: string;
  businessObjectName?: string;
  [x: string]: any;
}

const BoImportTemplate = (props: IProps) => {
  const {
    importDS,
    businessObjectId,
    domainId,
    history,
    businessObjectName,
    allowEdit,
  } = props;

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
        name: 'templateCategory',
        align: ColumnAlign.left,
      },
      {
        name: 'remark',
        align: ColumnAlign.left,
      },
      {
        header: intl.get('hzero.common.table.column.option').d('操作'),
        align: ColumnAlign.left,
        width: 150,
        renderer: ({ record }) => {
          const operators: Operators = [
            {
              key: 'templateConfig',
              ele: (
                <a
                  onClick={() => {
                    history.push({
                      pathname: `/hmde/business-object/import/field`,
                      search: qs.stringify({
                        businessObjectId,
                        businessObjectName,
                        currentImportId: record?.get('businessObjectImportTemplateId'),
                        currentTenantId: record?.get('tenantId'),
                        domainId,
                      }),
                    });
                  }}
                >
                  {intl.get('hmde.bo.importTemplate.buttom.config').d('模板配置')}
                </a>
              ),
              len: 4,
              title: intl.get('hmde.bo.importTemplate.buttom.config').d('模板配置'),
            },
            allowEdit && getCurrentOrganizationId() === record?.get('tenantId') && {
              key: 'delete',
              ele: (
                <a
                  onClick={() => {
                    Modal.open({
                      title: '',
                      children: (
                        <span>
                          {intl
                            .get('hmde.bo.importTemplate.view.message.deleteConfirm')
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
              len: 2,
              title: intl.get('hzero.common.button.delete').d('删除'), // title写国际化
            },
          ].filter(Boolean);
          return operatorRender(operators, record, {
            limit: getCurrentOrganizationId() === record?.get('tenantId') ? 0 : 2,
          });
        },
        lock: ColumnLock.right,
      },
    ];
  }, [allowEdit]);


  return (
    <FilterBarTable
      dataSet={importDS}
      cacheState
      columns={columns}
      autoHeight={{ type: TableAutoHeightType.maxHeight, diff: 10 }}
    // buttons={buttons}
      filterBarConfig={{
        cacheKey: 'HMDE.BUSINESS_OBJECT.IMPORT_TEMPLATE.LIST',
      }}
      customizable
      customizedCode='HMDE.BUSINESS_OBJECT.IMPORT_TEMPLATE.LIST'
    />
  );
};

export default formatterCollections({ code: ['hmde.bo', 'hmde.common', 'hzero.common'] })(
  observer(BoImportTemplate)
);

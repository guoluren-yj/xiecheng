/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yanglin
 * @LastEditTime: 2022-03-10 16:37:41
 */
import React, { useContext } from 'react';
import { Table } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import MobilePhone from '../../components/MoblePhone';
import { Store } from '../commonDetail/sotreProvider';

const SupplierInfo = function SupplierInfo() {
  const {
    supplierDs,
    customizeTable,
    headerDs,
    projectReqHeaderId,
    organizationId,
    projectId,
  } = useContext(Store);

  const cols = [
    { name: 'supplierCodeLov', editor: true },
    { name: 'displaySupplierName' },
    { name: 'contact', editor: true },
    {
      name: 'contactPhone',
      width: 260,
      renderer: ({ record }) => <MobilePhone record={record} fieldCode="contactPhone" editable />,
    },
    { name: 'contactEmail', editor: true },
  ];
  return (
    <div className="content-padding">
      <h3 className="content-title">
        {intl.get('sprm.project.title.supplierMaintain').d('供应商维护')}
      </h3>
      {customizeTable(
        {
          code: 'SIEC.PROJECT_EDIT.SUPPLIER',
        },
        <Table
          dataSet={supplierDs}
          columns={cols}
          style={{ maxHeight: `calc(100vh - 300px)` }}
          buttons={[
            [
              'add',
              {
                name: 'add',
                onClick: () => {
                  supplierDs.create(
                    {
                      tenantId: organizationId,
                      internationalTelCode: '+86',
                      projectId,
                      projectReqHeaderId,
                    },
                    0
                  );
                },
              },
            ],
            [
              'delete',
              {
                name: 'delete',
                onClick: () => {
                  const { selected } = supplierDs;
                  const deleteSupplierList = selected
                    ?.filter((e) => e?.get('projectSupplierId'))
                    ?.map((e) => e.toJSONData());
                  headerDs.setState({
                    deleteSupplierList: (headerDs.getState('projectSupplierId') || []).concat(
                      deleteSupplierList
                    ),
                  });
                  supplierDs.remove(selected, true);
                },
              },
            ],
          ]}
        />
      )}
    </div>
  );
};

export default SupplierInfo;

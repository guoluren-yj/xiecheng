import React, {useEffect} from 'react';
import { Table } from 'choerodon-ui/pro';
import { TableBoxSizing } from 'choerodon-ui/pro/lib/table/enum';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';

import CustomForm, { lineDataColumns } from '@/routes/components/CustomFormAndTableWrapper';
import { lineCmsFun } from './methods';


const ContentTable = (props) => {
    const { ds, fromDs, features } = props;
  const { lineCms, formCms, optionCms, query } = lineCmsFun();

  useEffect(() => {
    if (features !== "subMat") {
      ds.query();
    }
  }, []);



  if (features === "subMat") {
    const formProps = {
      column: 3,
      dataSet: fromDs,
      componentData: formCms,
      // spinning: loading,
    };
    return (
      <>
        <CustomForm {...formProps} />
        <div style={{ marginTop: "16px", height: 'calc(100vh - 225px)' }}>
          <Table
            virtual
            virtualCell
            dataSet={ds}
            customizedCode="lineTable"
            columns={lineDataColumns(lineCms)}
            boxSizing={TableBoxSizing.wrapper}
            style={{ maxHeight: `calc(100% - 25px)` }}
          />
        </div>
      </>
);
  };

  if (features !== "subMat") {
    return (
      <div style={{ height: 'calc(100vh - 245px)' }}>
        <FilterBarTable
          dataSet={ds}
          customizable
          customizedCode="lineTable"
          columns={lineDataColumns(optionCms)}
          boxSizing={TableBoxSizing.wrapper}
          style={{ maxHeight: `calc(100% - 22px)` }}
          filterBarConfig={{
            autoQuery: false,
            expandable: true,
            checkDataSetStatus: false,
            fields: query,
          }}
        />
      </div>
    );
  };

  return <></>;
};

export default ContentTable;
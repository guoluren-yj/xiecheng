import React, { useMemo } from 'react';
import { Lov } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import EditorForm from '../../../components/EditorForm';

const Detail = (props) => {

  const { detailDs } = props;

  const editorColumns = useMemo(() => {
    return [
      { name: 'projectName' },
      { name: 'companLov', editor: Lov },
      { name: 'invOrganizationLov', editor: Lov },
      { name: 'supplierCompanyLov', editor: Lov },
    ];
  }, []);

  return (
    <EditorForm
      columns={3}
      useColon={false}
      dataSet={detailDs}
      // editorFlag={!viewFlag}
      editorFlag
      editorColumns={editorColumns}
    />
  );
};


export default observer(Detail);

import React, { useMemo } from 'react';
import { Lov } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import { DetailProjectFormCode } from '../../utils/type';
import EditorForm from '../../../components/EditorForm';

const Detail = (props) => {

  const { detailDs, customizeForm } = props;

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
      customizeForm={customizeForm}
      customizeOptions={{ code: DetailProjectFormCode }}
    />
  );
};


export default observer(Detail);

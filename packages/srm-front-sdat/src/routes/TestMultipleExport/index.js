import React from 'react';
import { Header, Content } from 'components/Page';
import { Button } from 'choerodon-ui/pro';

import { fetchExport } from './service';

const TestMultipleExport = () => {
  const handleExport = () => {
    fetchExport({
      directory: 'sdat-risk-workbench',
      urls: [],
      uuids: ['3035c75e8d5dc247cabd513cee8ee1ab02', '307f091c47f1474470983035a4c19f8d16'],
      lowerDirectory: [
        // {
        //   directory: '目录1',
        //   urls: [],
        //   uuids: ['30f5eca2724012473f8723571091fc2466', '3041f4015b6f374af1af07ba45d585a7c0'],
        //   lowerDirectory: [],
        // },
      ],
    });
  };

  return (
    <>
      <Header title="TestMultipleExport" />
      <Content>
        <Button onClick={handleExport}>导出</Button>
      </Content>
    </>
  );
};

export default TestMultipleExport;

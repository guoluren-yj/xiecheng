import React from 'react';
import { Header, Content } from 'components/Page';
import CommonImport from 'srm-front-boot/lib/components/Import';

export default function index() {
  return (
    <>
      <Header title="测试导入" />
      <Content className="test-import-page-content">
        <h1>测试导入</h1>
        <CommonImport
          businessObjectTemplateCode="TEST.TEMPLATE_ONE"
          prefixPatch="/sdat"
          refreshButton
        />
      </Content>
    </>
  );
}

import React from 'react';

import CommonImport from './CommonImport';
import CommonImportButton from './CommonImportButton';
import useModal from './UseModal';
import { SourceManagerProvider } from './stores';

const WrapperCommonImport = (props) => (
  <SourceManagerProvider {...props}>
    <CommonImport {...props} />
  </SourceManagerProvider>
);
export default CommonImportButton;
export { useModal, WrapperCommonImport };

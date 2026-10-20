
import React from 'react';

import CreateModal from './CreateModal';
import { CreateStorProvider } from '../Detail/stores';


export default props =>
{
  return (
    <CreateStorProvider {...props}>
      <CreateModal />
    </CreateStorProvider>
  );
};
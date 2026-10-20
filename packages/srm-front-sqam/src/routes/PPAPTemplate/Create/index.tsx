import React from 'react';

import CreateModal from './CreateModal';
import { CreateStore } from '../Detail/stores/StoreProvider';

const Index = (props) => {
  return (
    <CreateStore {...props}>
      <CreateModal />
    </CreateStore>
  );
};

export default Index;

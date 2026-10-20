import React from 'react';
import { SharedComponent } from '@/customize';

export default function HlodWrapper({ loadSuccess }) {
  return (
    <div>
      <SharedComponent
        componentCode="HlodModuleImportFlag"
        componentProps={{
          loadSuccess,
        }}
      />
    </div>
  );
}

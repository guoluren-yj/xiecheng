import React from 'react';
import { Lov, Modal } from 'choerodon-ui/pro';

import { Expose } from 'utils/remote';

export default new Expose({
  process: {
    handleCuxLov: (props) => {
      const { headerDs } = props || {};
      return (
        <Lov
          name="categoryId"
          searchable={false}
          tableProps={{
            mode: 'tree',
            onRow: (row) => {
              const handleSelect = ({ dataSet, record: _record }) => {
                if (dataSet && _record) {
                  dataSet.select(_record);
                }
              };
              return {
                onClick: () => handleSelect(row),
                onDoubleClick: () => {
                  if (row?.record?.selectable) {
                    handleSelect(row);
                    headerDs?.current?.set?.({
                      categoryId: row?.record?.toData(),
                    });
                    Modal.destroyAll();
                  }
                },
              };
            },
            selectionMode: 'rowbox',
            virtual: true,
            style: { maxHeight: '500px' },
          }}
        />
      );
    },
  },
})

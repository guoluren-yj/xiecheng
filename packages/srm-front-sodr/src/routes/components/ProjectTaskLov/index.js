import React, { forwardRef } from 'react';
import { Modal, Lov } from 'choerodon-ui/pro';

export default forwardRef((props, ref) => {
  const { data = {}, ...others } = props;
  const { record, ds, destroyAll = true, source = 'line' } = data;
  // const [b, setB] = useState({});
  // const _ref = useMemo(() => {
  //   // ref.current = b;
  //   return props?._inTable ? ref : setB;
  // }, []);
  const tableProps = {
    mode: 'tree',
    selectionMode: 'rowbox',
    onRow: (row) => {
      const handleSelect = ({ dataSet, record: _record }) => {
        // debugger;
        if (dataSet && _record) {
          dataSet.select(_record);
        }
      };
      if (source === 'batchEdit') {
        return {
          onClick: () => handleSelect(row),
        };
      } else {
        return {
          onClick: () => handleSelect(row),
          onDoubleClick: () => {
            if (row?.record?.selectable) {
              handleSelect(row);
              record.set({
                projectTaskId: row?.record?.toData(),
              });
              if (destroyAll) {
                Modal.destroyAll();
              }
            }
          },
        };
      }
    },
  };
  const lovProps = {
    ref,
    ...others,
    tableProps,
    dataSet: ds,
    editor: true,
    name: 'projectTaskId',
  };
  return <Lov {...lovProps} />;
});

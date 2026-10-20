import React from 'react';
import {DataSet, Table, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
// import uuid from 'uuid/v4';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import DynamicButtons from 'srm-front-boot/lib/components/DynamicButtons';
import { TableBoxSizing } from 'choerodon-ui/pro/lib/table/enum';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import { lineDataColumns } from '@/components/CustomFormAndTableWrapper';
import { deleteFn } from './methods';

interface BtnProps {
  lineDs?: DataSet;
};

const ContentTable = (props) => {
    const { ds, lineCms } = props;
     const buttons = () => {
       const Buttons = observer((propsParam: BtnProps): any => {
        const { lineDs } = propsParam;
        const btns = [
          // {
          //   name: 'delete',
          //   btnType: 'c7n-pro',
          //   child: (name) => name || intl.get(`hzero.common.button.batchdelete`).d('批量删除'),
          //   btnProps: {
          //     funcType: 'flat',
          //     color: 'primary',
          //     icon: 'delete_sweep',
          //     onClick: () => deleteFn(lineDs),
          //     disabled: isEmpty(lineDs?.selected),
          //   },
          // },
          <Button
            icon="delete_sweep"
            funcType={FuncType.flat}
            color={ButtonColor.primary}
            disabled={isEmpty(lineDs?.selected)}
            onClick={() => deleteFn(lineDs)}
          >
            {intl.get('hzero.common.button.batchDelete').d('批量删除')}
          </Button>,
        ];
            // return <DynamicButtons buttons={btns.filter((i) => !i.hidden)} />;
        return btns;
        });
        return [<Buttons lineDs={ds} />];
      };


  return (
    <div style={{ height: 'calc(100vh - 200px)' }}>
      <Table
        virtual
        virtualCell
        dataSet={ds}
        buttons={buttons()}
        customizedCode="lineTable"
        columns={lineDataColumns(lineCms)}
        boxSizing={TableBoxSizing.wrapper}
        style={{ maxHeight: `calc(100% - 10px)` }}
      />
    </div>
);
};

export default ContentTable;
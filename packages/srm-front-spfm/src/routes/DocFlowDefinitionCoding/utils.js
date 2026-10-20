import { isNil } from 'lodash';
import { Modal } from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';
import { lineDetailChange } from '@/services/docFlowDefinitionNodesService';

const onLineDetailChange = ({ dataSet, url }) => {
    const lineList = dataSet?.selected?.map((item) => item?.toJSONData());
    const deleteFlag = lineList.every((i) => i?.editorFlag);
    const data = lineList?.filter((item) => !item?.editorFlag);
    if (!deleteFlag) {
      Modal.confirm({
        contentStyle: { width: '550px' },
        title: intl.get('hzero.common.message.confirm').d('提示'),
        children: (
          <div>
            <span>
              {intl.get('hzero.c7nProUI.DataSet.delete_selected_row_confirm').d('确认删除选中行？')}
            </span>
          </div>
        ),
        okText: intl.get('hzero.common.button.sure').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: async () => {
          const res = await lineDetailChange(data, url);
          if (getResponse(res)) {
            dataSet.clearCachedSelected();
            dataSet.unSelectAll();
            dataSet.query();
          }
        },
      });
    } else {
      dataSet.remove(dataSet?.selected);
    }
};

export {onLineDetailChange}
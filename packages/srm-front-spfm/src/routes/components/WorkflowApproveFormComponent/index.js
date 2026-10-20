import React from 'react';
import { Spin } from 'hzero-ui';
import intl from 'utils/intl';
import { resolveRequire } from 'utils/utils';
import { loadWorkflowApproveFormAsync } from 'hzero-front/lib/customize/workflowApproveForm';

export default class workflowApproveFormComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.workflowApproveFormComponent = React.lazy(async () => {
      // lazy must be () => import();
      // import is __esModule, so there return __esModule
      const ctor = await loadWorkflowApproveFormAsync(props.code);
      return Promise.resolve({
        __esModule: true,
        default:
          resolveRequire(ctor) ||
          (() => (
            <div style={{ color: 'grey' }}>
              {intl
                .get('hwfp.approveForm.view.message.title.notFound', {
                  code: props.code,
                })
                .d(`未找到对应编码为“${props.code}”的审批表单`)}
            </div>
          )),
      });
    });
  }

  render() {
    const { id, onLoad, params, disabled } = this.props;
    const InCustomizeComponent = this.workflowApproveFormComponent;
    if (InCustomizeComponent) {
      return (
        <React.Suspense fallback={<Spin spinning />}>
          <InCustomizeComponent id={id} disabled={disabled} params={params} onLoad={onLoad} />
        </React.Suspense>
      );
    }
    // maybe loading
    return null;
  }
}

import { animate } from 'choerodon-ui/lib/_util/openAnimation';

const animation = {
  enter(node: HTMLElement, done: () => void) {
    return animate(node, true, done, 'ant-motion-collapse');
  },
  leave(node: HTMLElement, done: () => void) {
    return animate(node, false, done, 'ant-motion-collapse');
  },
  appear(node: HTMLElement, done: () => void) {
    return animate(node, true, done, 'ant-motion-collapse');
  },
};

export default animation;

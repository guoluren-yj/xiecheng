export default function ModalConfig(props) {
  const { title, children, onOk, ...other } = props;
  return {
    title,
    drawer: true,
    maskClosable: true,
    children,
    onOk,
    style: {
      width: 716,
    },
    ...other,
  };
}

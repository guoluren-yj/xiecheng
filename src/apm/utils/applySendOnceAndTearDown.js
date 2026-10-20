export default function applySendOnceAndTearDown(wrapMetric, report, subjects) {
  let reported = false;
  return (metric) => {
    if (subjects.length) {
      subjects.forEach((subject) => {
        subject();
      });
      subjects.length = 0;
    }
    if (!reported) {
      reported = true;
      if (report) {
        report(wrapMetric(metric));
      }
    }
  };
}

const defaultOptions = {
  features: {
    feedback: false,
    faqQuickInput: false,
  },
};

export default Object.assign(
  {},
  defaultOptions,
  window.webRobotConfig || {},
);

export const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>, setUnits) => {
  const pastedData = event.clipboardData.getData('Text');
  const pastedItems = pastedData.split(/\r?\n/).map((item) => item.trim());
  setUnits(pastedItems);
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
};

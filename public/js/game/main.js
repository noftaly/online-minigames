function make2dArray(rows, cols) {
  const arr = new Array(rows);
  for (let i = 0; i < rows; i++)
    arr[i] = new Array(cols).fill('.');

  return arr;
}

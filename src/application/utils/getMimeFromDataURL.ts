export function getMimeFromDataURL(data: string): string {
  const _tmp = data.split(";");
  if (_tmp.length < 2) {
    return "";
  }
  console.debug(_tmp[0]);
  const _tmp2 = _tmp[0].split(":");
  if (_tmp2.length < 2) {
    return "";
  }

  return _tmp2[1];
}


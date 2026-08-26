function objParser(str, init) {
  const openSym = ['[', '{', '"', "'", '('];
  const closeSym = [']', '}', '"', "'", ')'];
  let type;
  let i;

  for (i = init || 0; i < str.length; i += 1) {
    type = openSym.indexOf(str[i]);
    if (type !== -1) break;
  }

  if (type === -1) return null;

  const open = openSym[type];
  const close = closeSym[type];
  let count = 1;
  let k;

  for (k = i + 1; k < str.length; k += 1) {
    if (open === '"' || open === "'") {
      if (str[k] === close) count -= 1;
      if (str[k] === '\\') k += 1;
    } else {
      if (str[k] === open) count += 1;
      if (str[k] === close) count -= 1;
    }
    if (count === 0) break;
  }

  if (count !== 0) return null;

  return { start: i, end: k, obj: str.slice(i, k + 1) };
}

function replacer(str) {
  let obj;
  let count = 0;
  const data = [];

  while ((obj = objParser(str))) {
    data[count] = obj.obj;
    str = str.substring(0, obj.start) + '__#' + count++ + str.substring(obj.end + 1);
  }

  return { str, dictionary: data };
}

function splitter(str) {
  const strObj = replacer(str);
  return strObj.str.split(',').map(function (arg) {
    let match = arg.match(/__#(\d+)/);
    while (match) {
      arg = arg.replace(/__#(\d+)/, strObj.dictionary[match[1]]);
      match = arg.match(/__#(\d+)/);
    }
    return arg.trim();
  });
}

function assertionAnalyser(body) {
  if (!body) return [];

  const matched = body.match(/(?:browser\s*\.\s*)?assert\s*\.\s*\w*\([\s\S]*\)/);
  if (!matched) return [];

  const replaced = replacer(matched[0]);
  const splitAssertions = replaced.str.split('assert');
  const assertions = splitAssertions.slice(1);
  const assertionBodies = [];

  const methods = assertions.map(function (assertion, index) {
    const match = assertion.match(/^\s*\.\s*(\w+)__#(\d+)/);
    if (!match) return null;
    assertionBodies.push(parseInt(match[2], 10));
    const pre = splitAssertions[index].match(/browser\s*\.\s*/) ? 'browser.' : '';
    return pre + match[1];
  });

  if (methods.some(method => !method)) return [];

  const bodies = assertionBodies.map(function (index) {
    return replaced.dictionary[index].slice(1, -1).trim();
  });

  return methods.map(function (method, index) {
    return { method, args: splitter(bodies[index]) };
  });
}

module.exports = assertionAnalyser;

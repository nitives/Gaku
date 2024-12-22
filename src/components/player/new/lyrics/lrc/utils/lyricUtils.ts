export const parseTtml = (ttml: string): any => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(ttml, "text/xml");

  const result = parseNode(xmlDoc);
  console.log("Result", result);
  return result;
};

function parseNode(node: Document) {
  // if (node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE) {
  //     result.text = node.childNodes[0].nodeValue.trim();
  // } else if (node.childNodes.length > 0) {
  //     for (let i = 0; i < node.childNodes.length; i++) {
  //         const child = node.childNodes[i];
  //         if (child.nodeType === Node.ELEMENT_NODE) {
  //             result[child.nodeName] = result[child.nodeName] || [];
  //             result[child.nodeName].push(parseNode(child));
  //         }
  //     }
  // }
  const result = {};
  // console.log("Primary document", node);

  const body = node.querySelector("body");

  // console.log(body);

  return result;
}

export const parseMills = (time: string) => {
  const parts = time.split(":");
  let minutes: string;
  let seconds: string;
  let mills: string;

  if (parts.length == 2) {
    minutes = parts[0];
    const secPart = parts[1];
    seconds = secPart.split(".")[0];
    mills = secPart.split(".")[1];
  } else {
    minutes = "0";
    const secPart = parts[0];
    seconds = secPart.split(".")[0];
    mills = secPart.split(".")[1];
  }

  const totalMilliseconds =
    Number(minutes) * 60 * 1000 + Number(seconds) * 1000 + Number(mills);
  return totalMilliseconds / 1000;
};

export const getGradientPercentage = (
  currentTime: number,
  begin: number,
  end: number
) => {
  if (currentTime < begin || currentTime > end) {
    return "0%";
  }

  const range = end - begin;
  const passedValue = currentTime - begin;
  const percentage = (passedValue / range) * 100;

  return `${percentage.toFixed()}%`;
};

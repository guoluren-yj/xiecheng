export default function CreateUid() {
  const result: string[] = [];
  for (let i = 0; i < 4; i++) {
    const ranNum = Math.ceil(Math.random() * 25);
    result.push(String.fromCharCode(65 + ranNum));
  }
  const uuid = (Math.random() * 10000000).toString(16).substr(0, 4) + Date.now() + result.join('');
  return uuid;
};


export default function forever(arg: Function) {
  return Promise.resolve()
    .then(() => arg())
    .then(() => forever(arg));
}

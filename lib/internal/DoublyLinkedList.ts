import * as AsyncDLL from 'async/internal/DoublyLinkedList';

/**
 * [Simple doubly linked list](https://en.wikipedia.org/wiki/Doubly_linked_list)
 * implementation used for queues. This implementation assumes that the node
 * provided by the user can be modified to adjust the next and last properties.
 * We implement only the minimal functionality for queue support.
 */
class DLL<T> {
  private asyncDLL: AsyncDLL;

  constructor() {
    this.asyncDLL = new AsyncDLL();
  }

  public removeLink(node: T) {
    return this.asyncDLL.removeLink(node);
  }

  public empty() {
    this.asyncDLL.empty();
    return this;
  }

  public insertAfter(node: T, newNode: T) {
    this.asyncDLL.insertAfter(node, newNode);
  }

  public insertBefore(node: T, newNode: T) {
    this.asyncDLL.insertBefore(node, newNode);
  }

  public unshift(node: T) {
    this.asyncDLL.unshift(node);
  }

  public push(node: T) {
    this.asyncDLL.push(node);
  }

  public shift() {
    return this.asyncDLL.shift();
  }

  public pop() {
    return this.asyncDLL.pop();
  }

  public toArray() {
    return this.asyncDLL.toArray();
  }

  public remove(testFn: (node: T) => boolean) {
    this.asyncDLL.remove(testFn);
    return this;
  }
}

export default DLL;

import * as DLL from 'async/internal/DoublyLinkedList';
import { expect } from 'chai';

describe('DoublyLinkedList', () => {
  it('toArray', () => {
    const list = new DLL();
    expect(list.toArray()).to.eql([]);

    for (let i = 0; i < 5; i++) {
      list.push({ data: i });
    }
    expect(list.toArray()).to.eql([0, 1, 2, 3, 4]);
  });

  it('remove', () => {
    const list = new DLL();

    for (let i = 0; i < 5; i++) {
      list.push({ data: i });
    }

    list.remove(node => node.data === 3);

    expect(list.toArray()).to.eql([0, 1, 2, 4]);
  });

  it('remove (head)', () => {
    const list = new DLL();

    for (let i = 0; i < 5; i++) {
      list.push({ data: i });
    }

    list.remove(node => node.data === 0);

    expect(list.toArray()).to.eql([1, 2, 3, 4]);
  });

  it('remove (tail)', () => {
    const list = new DLL();

    for (let i = 0; i < 5; i++) {
      list.push({ data: i });
    }

    list.remove(node => node.data === 4);

    expect(list.toArray()).to.eql([0, 1, 2, 3]);
  });

  it('remove (all)', () => {
    const list = new DLL();

    for (let i = 0; i < 5; i++) {
      list.push({ data: i });
    }

    list.remove(node => node.data < 5);

    expect(list.toArray()).to.eql([]);
  });

  it('empty', () => {
    const list = new DLL();

    for (let i = 0; i < 5; i++) {
      list.push({ data: i });
    }

    const empty = list.empty();

    expect(list).to.equal(empty);
    expect(list.toArray()).to.eql([]);
  });
});

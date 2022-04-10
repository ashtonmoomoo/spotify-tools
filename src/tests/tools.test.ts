import { randomInt } from "crypto";
import { batchifyArray } from "../utils/tools";

function makeArray(size: number) {
  let result: number[] = [];
  for (let i = 0; i < size; i++) {
    result.push(randomInt(1000));
  }
  return result;
}

describe('the batchify function', () => {
  it('does nothing when array is smaller than batch size', () => {
    let result = batchifyArray(makeArray(5), 10);

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(5);
  });

  it('batchsize is a factor of array length', () => {
    let result = batchifyArray(makeArray(50), 10);

    expect(result).toHaveLength(5);
    expect(result[0]).toHaveLength(10);
  });

  it('batchsize is not a factor of array length', () => {
    let result = batchifyArray(makeArray(80), 50);

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveLength(50);
    expect(result[1]).toHaveLength(30);
  })
});
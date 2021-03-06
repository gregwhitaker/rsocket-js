/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */

'use strict';

/* eslint-disable no-bitwise */

import {Buffer} from 'buffer'; // rewritten for browsers
import invariant from 'fbjs/lib/invariant';

export type Encoding = 'ascii' | 'base64' | 'hex' | 'utf8';

/**
 * Mimimum value that would overflow bitwise operators (2^32).
 */
const BITWISE_OVERFLOW = 0x100000000;

/**
 * Read a uint24 from a buffer starting at the given offset.
 */
export function readUInt24BE(buffer: Buffer, offset: number): number {
  const val1 = buffer.readUInt8(offset) << 16;
  const val2 = buffer.readUInt8(offset + 1) << 8;
  const val3 = buffer.readUInt8(offset + 2);
  return val1 | val2 | val3;
}

/**
 * Writes a uint24 to a buffer starting at the given offset, returning the
 * offset of the next byte.
 */
export function writeUInt24BE(
  buffer: Buffer,
  value: number,
  offset: number,
): number {
  offset = buffer.writeUInt8(value >>> 16, offset); // 3rd byte
  offset = buffer.writeUInt8(value >>> 8 & 0xff, offset); // 2nd byte
  return buffer.writeUInt8(value & 0xff, offset); // 1st byte
}

/**
 * Read a uint64 (technically supports up to 53 bits per JS number
 * representation).
 */
export function readUInt64BE(buffer: Buffer, offset: number): number {
  const high = buffer.readUInt32BE(offset);
  const low = buffer.readUInt32BE(offset + 4);
  return high * BITWISE_OVERFLOW + low;
}

/**
 * Write a uint64 (technically supports up to 53 bits per JS number
 * representation).
 */
export function writeUInt64BE(
  buffer: Buffer,
  value: number,
  offset: number,
): number {
  const high = value / BITWISE_OVERFLOW | 0;
  const low = value % BITWISE_OVERFLOW;
  offset = buffer.writeUInt32BE(high, offset); // first half of uint64
  return buffer.writeUInt32BE(low, offset); // second half of uint64
}

/**
 * Determine the number of bytes it would take to encode the given data with the
 * given encoding.
 */
export function byteLength(data: any, encoding: Encoding): number {
  if (data == null) {
    return 0;
  }
  return Buffer.byteLength(data, encoding);
}

/**
 * Attempts to construct a buffer from the input, throws if invalid.
 */
export function toBuffer(data: mixed): Buffer {
  // Buffer.from(buffer) copies which we don't want here
  if (data instanceof Buffer) {
    return data;
  }
  invariant(
    data instanceof ArrayBuffer,
    'RSocketBufferUtils: Cannot construct buffer. Expected data to be an ' +
      'arraybuffer, got `%s`.',
    data,
  );
  return Buffer.from(data);
}

/**
 * Function to create a buffer of a given sized filled with zeros.
 */
export const createBuffer = typeof Buffer.alloc === 'function'
  ? (length: number) => Buffer.alloc(length)
  : (length: number) => new Buffer(length).fill(0);

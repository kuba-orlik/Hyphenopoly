/*
 * Debug
 * declare function log(arg0: i32): void;
 * declare function log2(arg0: i32): void;
 * declare function logc(arg0: i32): void;
 */

let alphabetOffset:i32 = 0;
let bitmapOffset:i32 = 0;
let charmapOffset:i32 = 0;
let hasValueOffset:i32 = 0;
let valuemapOffset:i32 = 0;
let valuesOffset:i32 = 0;

/*
 * Let bitmapIndexStart: i32 = 0;
 * let bitmapIndexEnd: i32 = 0;
 */
export let lmi:i32 = 0;
export let rmi:i32 = 0;
let alphabetCount: i32 = 0;

const tw: i32 = 128;
const hp: i32 = 192;
const translateMapOffset:i32 = 256;
const originalWordOffset: i32 = 1792;
const dataOffset:i32 = 1920;

function hashCharCode(cc: i32): i32 {
    // Hashes charCodes to [0, 256[
    return ((19441 * cc) % 19559) & 255;
}

function pushToTranslateMap(cc: i32, id: i32): void {
    let ptr: i32 = hashCharCode(cc) << 1;
    if (load<u16>(ptr, translateMapOffset) === 0) {
        // No collision
        store<u16>(ptr, cc, translateMapOffset);
        store<u8>(ptr >> 1, id, translateMapOffset + 512);
    } else {
        // Handle collision
        ptr = 0;
        while (load<u16>(ptr, translateMapOffset + 768) !== 0) {
            ptr += 4;
            if (ptr >= 256) {
                unreachable();
            }
        }
        store<u16>(ptr, cc, translateMapOffset + 768);
        store<u16>(ptr, id, translateMapOffset + 770);
    }
}

function pullFromTranslateMap(cc: i32): i32 {
    let ptr: i32 = hashCharCode(cc) << 1;
    const val = load<u16>(ptr, translateMapOffset);
    if (val === 0) {
        // Unknown char
        return 255;
    }
    if (val === cc) {
        // Known char
        return load<u8>(ptr >> 1, translateMapOffset + 512);
    }
    // Find collided char
    ptr = 0;
    while (load<u16>(ptr, translateMapOffset + 768) !== cc) {
        ptr += 4;
        if (ptr >= 256) {
            return 255;
        }
    }
    return load<u16>(ptr, translateMapOffset + 770);
}


function createTranslateMap(): i32 {
    let i: i32 = 0;
    let k: i32 = 1;
    let first: i32 = 0;
    let second: i32 = 0;
    let secondInt: i32 = 0;
    i = alphabetOffset;
    pushToTranslateMap(46, 0);
    while (i < bitmapOffset) {
        first = load<u16>(i);
        second = load<u16>(i, 2);
        if (second === 0) {
            secondInt = 255;
        } else {
            secondInt = pullFromTranslateMap(second);
        }
        if (pullFromTranslateMap(first) !== 255) {
            // This is a substitution
            pushToTranslateMap(second, pullFromTranslateMap(first));
            store<u16>(alphabetCount, second, 1280);
        } else if (secondInt === 255) {
            //  There's no such char yet in the TranslateMap
            pushToTranslateMap(first, k);
            if (second !== 0) {
                // Set upperCase representation
                pushToTranslateMap(second, k);
            }
            store<u16>(alphabetCount, first, 1280);
            k += 1;
        } else {
            // Sigma
            pushToTranslateMap(first, k);
            store<u16>(alphabetCount, first, 1280);
            k += 1;
        }
        alphabetCount += 2;
        i += 4;
    }
    return alphabetCount >> 1;
}

function getBitAtPos(pos: i32, startByte: i32): i32 {
    const numBytes: i32 = pos / 8;
    const numBits: i32 = pos % 8;
    const mask: i32 = 1 << (7 - numBits);
    if ((load<u8>(startByte + numBytes) & mask) !== 0) {
        return 1;
    }
    return 0;
}

function rank1(pos: i32, startByte: i32): i32 {
    const numBytes: i32 = pos / 32;
    const numBits: i32 = pos % 32;
    let i: i32 = 0;
    let count: i32 = 0;
    while (i < numBytes) {
        count += popcnt<i32>(load<u32>(startByte + (i << 2)));
        i += 1;
    }
    if (numBits !== 0) {
        count += popcnt<i32>(
            bswap<u32>(load<u32>(startByte + (i << 2))) >>> (32 - numBits)
        );
    }
    return count;
}

function count0(dWord: i32): i32 {
    return popcnt<i32>(~dWord);
}

/*
 * Loop based search for select0 in 32 bit dWord
 *  function get0PosInDWord2(dWord: i32, nth: i32): i32 {
 *  let count: i32 = 0;
 *  let pos: i32 = 0;
 *  const dWordBigEnd: i32 = bswap<i32>(dWord);
 *  while (pos < 32) {
 *      const shift: i32 = 31 - pos;
 *      const mask: i32 = 1 << shift;
 *      if ((dWordBigEnd & mask) !== mask) {
 *          count += 1;
 *      }
 *      if (count === nth) {
 *          break;
 *      }
 *      pos += 1;
 *  }
 *  return pos;
 * }
 */


/*
 * Select the bit position (from the most-significant bit)
 * with the given count (rank)
 * Adapted for wasm from
 * https://graphics.stanford.edu/~seander/bithacks.html#SelectPosFromMSBRank
 */
function get0PosInDWord3(dWord: i32, nth: i32): i32 {
    const v: i32 = ~bswap<i32>(dWord);
    let r: i32 = nth;
    let s: i32 = 0;
    let a: i32 = 0;
    let b: i32 = 0;
    let c: i32 = 0;
    let d: i32 = 0;
    let t: i32 = 0;

    a = v - ((v >> 1) & 0x55555555);
    b = (a & 0x33333333) + ((a >> 2) & 0x33333333);
    c = (b + (b >> 4)) & 0x0f0f0f0f;
    d = (c + (c >> 8)) & 0x00ff00ff;
    t = (d >> 32) + (d >> 48);
    // Now do branchless select!
    s = 32;
    s -= ((t - r) & 256) >> 3;
    r -= (t & ((t - r) >> 8));
    t = (d >> (s - 16)) & 0xff;
    s -= ((t - r) & 256) >> 4;
    r -= (t & ((t - r) >> 8));
    t = (c >> (s - 8)) & 0xf;
    s -= ((t - r) & 256) >> 5;
    r -= (t & ((t - r) >> 8));
    t = (b >> (s - 4)) & 0x7;
    s -= ((t - r) & 256) >> 6;
    r -= (t & ((t - r) >> 8));
    t = (a >> (s - 2)) & 0x3;
    s -= ((t - r) & 256) >> 7;
    r -= (t & ((t - r) >> 8));
    t = (v >> (s - 1)) & 0x1;
    s -= ((t - r) & 256) >> 8;
    s = 33 - s;
    return s - 1;
}

/*
 *Function select0Indexed(ith: i32, startByte: i32): i32 {
 *  let pos: i32 = 0;
 *  let bytePos: i32 = startByte;
 *  let count: i32 = 0;
 *  let dWord: i32 = 0;
 *  // Find byte with ith 0 and accumulate count
 *  let left: i32 = 0;
 *  let right: i32 = bitmapIndexEnd - bitmapIndexStart;
 *  while (left < right) {
 *      const m: i32 = floor<i32>((left + right) / 2);
 *      count = load<u16>(bitmapIndexStart + (m << 1));
 *      if (count < ith) {
 *          left = m + 1;
 *      } else {
 *          right = m;
 *      }
 *  }
 *  count = load<u16>(bitmapIndexStart + ((left - 1) << 1));
 *  bytePos = startByte + ((left - 1) << 2);
 *  dWord = load<u32>(bytePos);
 *
 *  // The ith 0 is in byte at bytePos
 *  pos = get0PosInDWord3(dWord, ith - count);
 *  return ((bytePos - startByte) * 8) + pos;
 *}
 */


export function select0(ith: i32, startByte: i32, endByte: i32): i32 {
    let bytePos: i32 = startByte;
    let count: i32 = 0;
    let dWord: i32 = 0;
    let dWord0Count: i32 = 0;
    // Find byte with ith 0 and accumulate count
    while (count < ith) {
        if (bytePos > endByte) {
            return 0;
        }
        dWord = load<u32>(bytePos);
        dWord0Count = count0(dWord);
        count += dWord0Count;
        bytePos += 4;
    }
    count -= dWord0Count;
    bytePos -= 4;
    // The ith 0 is in byte at bytePos
    const pos: i32 = get0PosInDWord3(dWord, ith - count);
    return ((bytePos - startByte) << 3) + pos;
}

/*
 * Function getFirstChild2(pos: i32): i32 {
 *  let idx: i32 = load<u16>((bitmapIndexEnd + 2) + (pos << 1));
 *  if (idx === 0) {
 *      idx = select0Indexed(pos + 1, bitmapOffset) - pos;
 *      store<u16>((bitmapIndexEnd + 2) + (pos << 1), idx);
 *  }
 *  return idx;
 * }
 */

function getFirstChild(pos: i32): i32 {
    return select0(pos + 1, bitmapOffset, charmapOffset) - pos;
}

/*
 *Function buildSelect0Index(startB: i32, endB: i32, targetStart: i32): i32 {
 *  let bytePos: i32 = startB;
 *  let dWord: i32 = 0;
 *  let aggregatedCount: i32 = 0;
 *  while (bytePos <= endB) {
 *      dWord = load<u32>(bytePos);
 *      store<u16>(targetStart, aggregatedCount);
 *      aggregatedCount += count0(dWord);
 *      bytePos += 4;
 *      targetStart += 2;
 *  }
 *  return targetStart - 2;
 *}
 */

export function init(): i32 {
    alphabetOffset = load<u32>(dataOffset) + dataOffset;
    bitmapOffset = load<u32>(dataOffset, 4) + dataOffset;
    charmapOffset = load<u32>(dataOffset, 8) + dataOffset;
    hasValueOffset = load<u32>(dataOffset, 12) + dataOffset;
    valuemapOffset = load<u32>(dataOffset, 16) + dataOffset;
    valuesOffset = load<u32>(dataOffset, 20) + dataOffset;
    lmi = (load<u32>(dataOffset, 24) & 0xff00) >> 8;
    rmi = load<u32>(dataOffset, 24) & 0xff;

    /*
     *BitmapIndexStart = load<u32>(dataOffset, 28) + dataOffset;
     *bitmapIndexEnd = buildSelect0Index(
     *  bitmapOffset, charmapOffset, bitmapIndexStart
     *);
     */
    return createTranslateMap();
}

function extractValuesToHp(valIdx: i32, length: i32, startOffset: i32): void {
    const startsAtHalfByte: i32 = valIdx % 2;
    let byteIdx: i32 = floor<u32>(valIdx / 2);
    let currentByte: i32 = load<u8>(byteIdx + valuesOffset);
    let pad: i32 = 0;
    // 0 = MSB, 1 = LSB
    let nextPos: i32 = 0;
    let valuesWritten: i32 = 0;
    let newValue: i32 = 0;
    if (startsAtHalfByte === 0) {
        pad = (currentByte >> 4) & 31;
        nextPos = 1;
    } else {
        pad = currentByte & 15;
        nextPos = 0;
    }
    let i: i32 = 0;
    while (i < pad) {
        i += 1;
        valuesWritten += 1;
    }
    i = 1;
    while (i < length) {
        if (nextPos === 0) {
            byteIdx += 1;
            currentByte = load<u8>(byteIdx + valuesOffset);
            newValue = (currentByte >> 4) & 15;
            if (newValue > load<u8>(hp + startOffset + valuesWritten)) {
                store<u8>(hp + startOffset + valuesWritten, newValue);
            }
            nextPos = 1;
        } else {
            newValue = currentByte & 15;
            if (newValue > load<u8>(hp + startOffset + valuesWritten)) {
                store<u8>(hp + startOffset + valuesWritten, newValue);
            }
            nextPos = 0;
        }
        i += 1;
        valuesWritten += 1;
    }
}

export function subst(ccl: i32, ccu: i32, replcc: i32): i32 {
    const replccInt: i32 = pullFromTranslateMap(replcc);
    if (replccInt !== 255) {
        pushToTranslateMap(ccl, replccInt);
        if (ccu !== 0) {
            pushToTranslateMap(ccu, replccInt);
        }
        // Add to alphabet
        store<u16>(alphabetCount, ccl, 1280);
        alphabetCount += 2;
    }
    return alphabetCount >> 1;
}

export function hyphenate(lmin: i32, rmin: i32, hc: i32): i32 {
    let patternStartPos: i32 = 0;
    let wordLength: i32 = 0;
    let charOffset: i32 = 0;
    let cc: i32 = 0;
    let hyphenPointsCount: i32 = 0;
    let translatedChar: i32 = 0;
    let currNode: i32 = 0;

    // Translate UTF16 word to internal ints and clear hpPos-Array
    cc = load<u16>(0);
    while (cc !== 0) {
        translatedChar = pullFromTranslateMap(cc);
        if (translatedChar === 255) {
            return 0;
        }
        store<u8>(charOffset, translatedChar, tw);
        store<u16>(charOffset << 1, cc, originalWordOffset);
        charOffset += 1;
        store<u8>(charOffset, 0, hp);
        cc = load<u16>(charOffset << 1);
    }
    store<u16>(charOffset << 1, 0, originalWordOffset);
    // Find patterns and collect hyphenPoints
    wordLength = charOffset;
    while (patternStartPos < wordLength) {
        charOffset = patternStartPos;
        currNode = 0;
        let nthChildIdx: i32 = 0;
        while (charOffset < wordLength) {
            cc = load<u8>(charOffset, tw);
            const firstChild: i32 = getFirstChild(currNode);
            const childCount: i32 = getFirstChild(currNode + 1) - firstChild;
            let nthChild: i32 = 0;
            while (nthChild < childCount) {
                nthChildIdx = firstChild + nthChild;
                if (load<u8>(charmapOffset + nthChildIdx - 1) === cc) {
                    break;
                }
                nthChild += 1;
            }
            if (nthChild === childCount) {
                break;
            }
            currNode = nthChildIdx;
            if (getBitAtPos(currNode - 1, hasValueOffset) === 1) {
                const pos: i32 = rank1(currNode, hasValueOffset);
                const valBitsStart: i32 = select0(
                    pos,
                    valuemapOffset,
                    valuesOffset - 1
                );
                const len: i32 = select0(
                    pos + 1,
                    valuemapOffset,
                    valuesOffset - 1
                ) - valBitsStart - 1;
                const valIdx: i32 = rank1(valBitsStart, valuemapOffset);
                extractValuesToHp(valIdx, len, patternStartPos);
            }
            charOffset += 1;
        }
        patternStartPos += 1;
    }

    // Get chars of original word and insert hyphenPoints
    charOffset = 0;
    hyphenPointsCount = 0;
    wordLength -= 2;
    rmin = wordLength - rmin - 1;
    while (charOffset < wordLength) {
        store<u16>(
            (charOffset + hyphenPointsCount) << 1,
            load<u16>(charOffset << 1, originalWordOffset + 2)
        );
        if ((charOffset >= lmin - 1) && (charOffset <= rmin)) {
            if (load<u8>(charOffset, hp + 2) & 1) {
                hyphenPointsCount += 1;
                store<u16>((charOffset + hyphenPointsCount) << 1, hc);
            }
        }
        charOffset += 1;
    }
    store<u16>(
        (charOffset + hyphenPointsCount) << 1,
        0
    );
    return wordLength + hyphenPointsCount;
}

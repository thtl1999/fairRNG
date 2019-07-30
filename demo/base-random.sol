pragma solidity ^0.5;

contract fair_random {
    uint block_num = BLOCKNUMBER;
    uint confirmation = 17;
    bytes32 block_hash = 0;
    string [] list = [STRINGLIST];
    uint list_len = LISTLENGTH;
    
    //string concat code from https://github.com/Arachnid/solidity-stringutils/blob/master/src/strings.sol
    struct slice {
        uint _len;
        uint _ptr;
    }
    
    function toSlice(string memory self) internal pure returns (slice memory) {
        uint ptr;
        assembly {
            ptr := add(self, 0x20)
        }
        return slice(bytes(self).length, ptr);
    }
    
    function memcpy(uint dest, uint src, uint len) private pure {
        // Copy word-length chunks while possible
        for(; len >= 32; len -= 32) {
            assembly {
                mstore(dest, mload(src))
            }
            dest += 32;
            src += 32;
        }

        // Copy remaining bytes
        uint mask = 256 ** (32 - len) - 1;
        assembly {
            let srcpart := and(mload(src), not(mask))
            let destpart := and(mload(dest), mask)
            mstore(dest, or(destpart, srcpart))
        }
    }
    
    function concat(slice memory self, slice memory other) internal pure returns (string memory) {
        string memory ret = new string(self._len + other._len);
        uint retptr;
        assembly { retptr := add(ret, 32) }
        memcpy(retptr, self._ptr, self._len);
        memcpy(retptr + self._len, other._ptr, other._len);
        return ret;
    }
    //end concat code
    
    
    function show_result(bytes32 custom_hash, uint count) public view returns(string memory){
        bytes32 hash;
        if (custom_hash != 0){  //0x00
            hash = custom_hash;
        }else{
            hash = block_hash;
        }
        
        uint next = uint(hash);
        uint remain = count;
        uint temp;
        bool [] memory state = new bool[](list_len);
        string memory result;


        while(remain > 0){
            next = (next * 1103515245 + 12345) % 2**255;
            temp = next % list_len;
            if (state[temp] == false){
                state[temp] = true;
                remain--;
                result = concat(toSlice(result),toSlice(list[temp]));
            }
        }
        
        
        
        return result;
        
    }
    
    
    function show_block_hash() public view returns(bytes32){
        return block_hash;
    }
    
    function check_block() public returns(bytes32){
        if (block.number > block_num + confirmation || blockhash(block_num) != 0){
            block_hash = blockhash(block_num);
            return blockhash(block_num);
        }
    }
    
    function show_target_block() public view returns(uint){
        return block_num;
    }
    
}
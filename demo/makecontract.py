#python 3.7
import os
import sys
import fileinput

contract_base = open('base-random.sol', 'r', encoding='utf8')
list_file = open('list.txt', 'r', encoding='utf8')
contract_result = open('result-random.sol', 'w', encoding='utf8')
block_num = 0
list_string = ''

block_num = input("Please input Block number: ")
lines = list_file.readlines()
for line in lines:
    list_string += '\"' + line.replace('\n','') + '\\n\",'
list_string = list_string[:-1]
print(list_string)
print(len(lines))
print(block_num)

contract_txt = contract_base.read()

contract_txt = contract_txt.replace('BLOCKNUMBER',block_num)
contract_txt = contract_txt.replace('STRINGLIST',list_string)
contract_txt = contract_txt.replace('LISTLENGTH',str(len(lines)))

contract_result.write(contract_txt)
val = input("Press any key to exit: ")